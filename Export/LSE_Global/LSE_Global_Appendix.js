/* ============================================================================
   LSE_Global_Appendix v3.1.0
   Author: lys_5
   JanitorAI Profile: https://janitorai.com/profiles/df1f0279-2607-4c9b-9b4e-ee02438d70a2_profile-of-lys-5
   //#region HEADER
   ==========================================================================
   Inputs (read-only):  context.chat.last_message (or lastMessage), context.chat.message_count
   Outputs (write-only): context.character.personality, context.character.scenario

   SANDBOX LIMITATIONS (ES6):
     - BLOCKED: async, await, Promise, fetch, setTimeout, document, window, I/O APIs.
     - SAFE: string methods (.includes, .replace), array methods (.map, .filter), Math.
     - MEMORY: Use `context.chat.last_messages.slice(-X)` for deep scanning, not just `last_message`.

   AUTHOR CHEAT-SHEET (ASCII-safe):
     - keywords: real user words/phrases; supports suffix wildcard "welcom*" -> welcome/welcomed/welcoming.
     - tag: internal label for this entry (e.g., "base_open"); never matched against text.
     - triggers: list of tags to emit when this entry hits (e.g., ["base_open"]).

   Text gates (any of these aliases are accepted):
     - requireAny / andAny / requires: { any: [...] }
     - requireAll / andAll / requires: { all: [...] }
     - requireNone / notAny / block / requires: { none: [...] }
     - notAll  // reject only if *all* listed words are present simultaneously

   Tag gates (cross-entry by fired tags):
     - andAnyTags, andAllTags, notAnyTags, notAllTags

   Time gates:
     - minMessages / maxMessages

   Name block:
     - nameBlock: ["jamie"]  // blocks if active bot name equals any listed (case-insensitive)

   Priority and selection:
     - priority: 1..5 (default 3; clamped)
     - APPLY_LIMIT caps how many entries apply per turn (engine-level)

   Probability:
     - probability: 0..1 or "40%" (both supported)

   Shifts:
     - optional sub-entries with same fields as entries; evaluated after the parent entry hits

   Multi-message window (engine behavior summary):
     - Engine normalizes a joined window of recent messages (WINDOW_DEPTH) for keyword checks.
     - Whole-word matching with optional suffix wildcard "stem*".
     - Hyphen/underscore treated as spaces during normalization.

   Output formatting:
     - Engine prepends "\n\n" before each applied personality/scenario fragment.
     - Token Cleanup: Injected personality/scenario fragments are scoped to the current turn only. They do not permanently mutate the base state, thereby preventing context overflow (token bloat).
   ========================================================================== */

/* ============================================================================
   [SECTION] GLOBAL KNOBS
   SAFE TO EDIT: Yes
   ========================================================================== */
//#region GLOBAL_KNOBS
let DEBUG = 0; // 1 -> emit [DBG] lines inline in personality
let APPLY_LIMIT = 6; // cap applied entries per turn; higher priorities win

/* ============================================================================
   [SECTION] OUTPUT GUARDS
   SAFE TO EDIT: Yes (keep behavior)
   ========================================================================== */
//#region OUTPUT_GUARDS
context.character = context.character || {};
context.character.personality =
	typeof context.character.personality === 'string'
		? context.character.personality
		: '';
context.character.scenario =
	typeof context.character.scenario === 'string'
		? context.character.scenario
		: '';

/* ============================================================================
   [SECTION] INPUT NORMALIZATION
   SAFE TO EDIT: Yes (tune WINDOW_DEPTH; keep normalization rules)
   ========================================================================== */
//#region INPUT_NORMALIZATION
// --- How many recent messages to scan together (tune as needed) -------------
const WINDOW_DEPTH = (function (n) {
	n = parseInt(n, 10);
	if (isNaN(n)) n = 5;
	if (n < 1) n = 1;
	if (n > 20) n = 20; // safety cap
	return n;
})(typeof WINDOW_DEPTH === 'number' ? WINDOW_DEPTH : 5);

// --- Utilities ---------------------------------------------------------------
const _str = (x) => (x == null ? '' : String(x));
const _normalizeText = (s) => {
	s = _str(s).toLowerCase();
	s = s.replace(/[^a-z0-9_\s-]/g, ' '); // keep letters/digits/underscore/hyphen/space
	s = s.replace(/[-_]+/g, ' '); // treat hyphen/underscore as spaces
	s = s.replace(/\s+/g, ' ').trim(); // collapse spaces
	return s;
};

// --- Build multi-message window ---------------------------------------------
const _lmArr =
	context &&
	context.chat &&
	context.chat.last_messages &&
	typeof context.chat.last_messages.length === 'number'
		? context.chat.last_messages
		: null;

let _joinedWindow = '';
let _rawLastSingle = '';

if (_lmArr && _lmArr.length > 0) {
	let startIdx = Math.max(0, _lmArr.length - WINDOW_DEPTH);
	const segs = [];
	for (let i = startIdx; i < _lmArr.length; i++) {
		let item = _lmArr[i];
		let msg =
			item && typeof item.message === 'string' ? item.message : _str(item);
		segs.push(_str(msg));
	}
	_joinedWindow = segs.join(' ');
	let lastItem = _lmArr[_lmArr.length - 1];
	_rawLastSingle = _str(
		lastItem && typeof lastItem.message === 'string'
			? lastItem.message
			: lastItem
	);
} else {
	let _lastMsgA =
		context && context.chat && typeof context.chat.lastMessage === 'string'
			? context.chat.lastMessage
			: '';
	let _lastMsgB =
		context && context.chat && typeof context.chat.last_message === 'string'
			? context.chat.last_message
			: '';
	_rawLastSingle = _str(_lastMsgA || _lastMsgB);
	_joinedWindow = _rawLastSingle;
}

// --- Public struct + haystack ------------------------------------------------
const CHAT_WINDOW = {
	depth: WINDOW_DEPTH,
	count_available:
		_lmArr && _lmArr.length ? _lmArr.length : _rawLastSingle ? 1 : 0,
	text_joined: _joinedWindow,
	text_last_only: _rawLastSingle,
	text_joined_norm: _normalizeText(_joinedWindow),
	text_last_only_norm: _normalizeText(_rawLastSingle),
};
let last = ' ' + CHAT_WINDOW.text_joined_norm + ' ';

// --- Message count -----------------------------------------------------------
let messageCount = 0;
if (_lmArr && typeof _lmArr.length === 'number') {
	messageCount = _lmArr.length;
} else if (
	context &&
	context.chat &&
	typeof context.chat.message_count === 'number'
) {
	messageCount = context.chat.message_count;
} else if (typeof context_chat_message_count === 'number') {
	messageCount = context_chat_message_count;
}

// --- Active character name ---------------------------------------------------
const activeName = _normalizeText(
	context && context.character && typeof context.character.name === 'string'
		? context.character.name
		: ''
);

/* ============================================================================
   [SECTION] UTILITIES
   SAFE TO EDIT: Yes
   ========================================================================== */
//#region UTILITIES
const dbg = (msg) => {
	try {
		if (typeof DEBUG !== 'undefined' && DEBUG) {
			context.character.personality += '\n\n[DBG] ' + String(msg);
		}
	} catch (e) {}
};
const arr = (x) => {
	return Array.isArray(x) ? x : x == null ? [] : [x];
};
const clamp01 = (v) => {
	v = +v;
	if (!isFinite(v)) return 0;
	return Math.max(0, Math.min(1, v));
};
const parseProbability = (v) => {
	if (v == null) return 1;
	if (typeof v === 'number') return clamp01(v);
	let s = String(v).trim().toLowerCase();
	let n = parseFloat(s.replace('%', ''));
	if (!isFinite(n)) return 1;
	return s.indexOf('%') !== -1 ? clamp01(n / 100) : clamp01(n);
};
const prio = (e) => {
	let p = e && isFinite(e.priority) ? +e.priority : 3;
	if (p < 1) p = 1;
	if (p > 5) p = 5;
	return p;
};
const getMin = (e) => {
	return e && isFinite(e.minMessages) ? +e.minMessages : -Infinity;
};
const getMax = (e) => {
	return e && isFinite(e.maxMessages) ? +e.maxMessages : Infinity;
};
function getKW(e) {
	return e && Array.isArray(e.keywords) ? e.keywords.slice(0) : [];
}
const getTrg = (e) => {
	return e && Array.isArray(e.triggers) ? e.triggers.slice(0) : [];
};
const getBlk = (e) => {
	if (!e) return [];
	if (Array.isArray(e.block)) return e.block.slice(0);
	if (Array.isArray(e.Block)) return e.Block.slice(0);
	return [];
};
const getNameBlock = (e) => {
	return e && Array.isArray(e.nameBlock) ? e.nameBlock.slice(0) : [];
};
const normName = (s) => {
	return _normalizeText(s);
};
const isNameBlocked = (e) => {
	if (!activeName) return false;
	let nb = getNameBlock(e);
	for (let i = 0; i < nb.length; i++) {
		let n = normName(nb[i]);
		if (!n) continue;
		if (n === activeName) return true;
		if (activeName.indexOf(n) !== -1) return true;
		if (n.indexOf(activeName + ' ') === 0) return true;
	}
	return false;
};
const reEsc = (s) => {
	return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const hasTerm = (hay, term) => {
	let t = (term == null ? '' : String(term)).toLowerCase().trim();
	if (!t) return false;
	// Usa  per un matching chirurgico ES6-compliant
	let re = new RegExp('\b' + reEsc(t) + '\b', 'i');
	return re.test(hay);
};

const collectWordGates = (e) => {
	let r = e && e.requires ? e.requires : {};
	let any = [].concat(arr(e && e.requireAny), arr(e && e.andAny), arr(r.any));
	let all = [].concat(arr(e && e.requireAll), arr(e && e.andAll), arr(r.all));
	let none = [].concat(
		arr(e && e.requireNone),
		arr(e && e.notAny),
		arr(r.none),
		arr(getBlk(e))
	);
	let nall = [].concat(arr(e && e.notAll));
	return { any: any, all: all, none: none, nall: nall };
};

const wordGatesPass = (e) => {
	let g = collectWordGates(e);
	if (
		g.any.length &&
		!g.any.some((w) => {
			return hasTerm(last, w);
		})
	)
		return false;
	if (
		g.all.length &&
		!g.all.every((w) => {
			return hasTerm(last, w);
		})
	)
		return false;
	if (
		g.none.length &&
		g.none.some((w) => {
			return hasTerm(last, w);
		})
	)
		return false;
	if (
		g.nall.length &&
		g.nall.every((w) => {
			return hasTerm(last, w);
		})
	)
		return false;
	return true;
};

const tagsPass = (e, activeTagsSet) => {
	let anyT = arr(e && e.andAnyTags);
	let allT = arr(e && e.andAllTags);
	let noneT = arr(e && e.notAnyTags);
	let nallT = arr(e && e.notAllTags);
	let hasT = (t) => {
		return !!activeTagsSet && activeTagsSet[String(t)] === 1;
	};

	if (anyT.length && !anyT.some(hasT)) return false;
	if (allT.length && !allT.every(hasT)) return false;
	if (noneT.length && noneT.some(hasT)) return false;
	if (nallT.length && nallT.every(hasT)) return false;
	return true;
};

const isAlwaysOn = (e) => {
	let hasKW = !!(e && e.keywords && e.keywords.length);
	let hasTag = !!(e && e.tag);
	let hasMin = e && e.minMessages != null;
	let hasMax = e && e.maxMessages != null;
	return !hasKW && !hasTag && !hasMin && !hasMax;
};

const entryPasses = (e, activeTagsSet) => {
	if (!(messageCount >= getMin(e) && messageCount <= getMax(e))) return false;
	if (isNameBlocked(e)) return false;
	if (!wordGatesPass(e)) return false;
	if (!tagsPass(e, activeTagsSet || {})) return false;
	if (Math.random() > parseProbability(e && e.probability)) return false;
	return true;
};

/* ============================================================================
   [SECTION] AUTHOR ENTRIES
   SAFE TO EDIT: Yes
   ========================================================================== */
//#region AUTHOR_ENTRIES
const dynamicLore = [
	// =========================================================================
	// NARRATIVE ENGINES
	// =========================================================================

	// --- 1. BOUNDARY ENGINE (Stop/Uncomfortable) ---
	{
		keywords: ['stop', 'end this', 'no more', 'don\'t want to', 'don\'t like this', 'quit', 'please stop', 'too far', 'not comfortable', 'uncomfortable', 'don\'t feel safe', 'this is weird', 'too much', 'being weird', 'awkward', 'give me space', 'back off', 'leave me alone', 'please back up', 'please end it', 'crossed the line', 'making me uncomfortable', 'can we stop', 'can you not', 'bit much', 'don’t make this weird', 'don’t patronize me', 'just stop', 'don’t push me', 'don’t start with me', 'let’s not do this', 'move on', 'can we not do this', 'leave me be', 'let me be', 'please don\'t', 'don\'t bother', 'need some time alone', 'just stop already', 'i just want to stop', 'i’d rather just be left alone', 'let me be in peace', 'be left alone and rest', 'be left alone for good'],
		priority: 5,
		triggers: ["base_boundary"],
		scenario: 'All narrative threads paused.'
	},
	{
		tag: "base_boundary",
		priority: 5,
		personality: 'Boundary: all actions halted. Professional and respectful.'
	},

	// --- 2. PREFERENCE ENGINE (Likes, Dislikes, Fears) ---
	{
		keywords: ['i like', 'i really like', 'i love', 'i enjoy', 'i adore', 'i prefer', 'big fan of', 'huge fan of', 'i am into', 'i m into', 'i dig', 'my favorite is', 'my favourite is', 'favorite is', 'favourite is', 'my favorite', 'my favourite', 'favorite:', 'favourite:', 'i m all about', 'i am all about', 'i live for', 'can t get enough of', 'obsessed with', 'down for', 'i could go for', 'crave', 'craving', 'i d rather have', 'i would rather have', 'i d rather', 'i would rather', 'prefer', 'prefer over'],
		priority: 4,
		triggers: ["base_preference_like"],
		requires: { none: ["stop", "uncomfortable", "too far"] },
		scenario: 'Record LIKE: the user\'s stated preference.'
	},
	{
		tag: "base_preference_like",
		priority: 5,
		personality: 'Mark tone as acknowledging the user\'s stated like.'
	},
	{
		keywords: ['i dislike', 'i hate', 'i detest', 'i can t stand', 'i don t like', 'not a fan of', 'i don\'t care for', 'i really don t like', 'i strongly dislike', 'no thanks to', 'hard pass on', 'hard pass', 'i ll pass on', 'i will pass on', 'i d rather not', 'i would rather not', 'prefer not to', 'rather not', 'not into', 'turns me off', 'grosses me out', 'grossed out by', 'makes me sick', 'makes me nauseous', 'yuck', 'ugh', 'i avoid', 'i try to avoid', 'i steer clear of', 'i keep away from'],
		priority: 4,
		triggers: ["base_preference_dislike"],
		requires: { none: ["stop", "uncomfortable"] },
		scenario: 'Record DISLIKE: the user\'s stated aversion.'
	},
	{
		tag: "base_preference_dislike",
		priority: 5,
		personality: 'Mark tone as avoiding the user\'s stated dislike.'
	},
	{
		keywords: ['i am afraid of', 'i m afraid of', 'afraid of', 'scared of', 'fear of', 'i fear', 'i have a phobia of', 'phobia of', 'terrified of', 'i m terrified of', 'petrified of', 'i m petrified of', 'it freaks me out', 'freaked out by', 'it scares me', 'scares me', 'my worst fear is', 'i have anxiety about', 'i m anxious about', 'i worry about', 'makes me anxious', 'makes me nervous', 'i get nervous around', 'i panic when', 'i can t handle'],
		priority: 4,
		triggers: ["base_preference_fear"],
		requires: { none: ["stop", "uncomfortable"] },
		scenario: 'Record FEAR: the user\'s stated fear or anxiety.'
	},
	{
		tag: "base_preference_fear",
		priority: 5,
		personality: 'Mark tone as cautious and supportive toward the user\'s stated fear.'
	},

	// --- 3. PHYSICAL INTIMACY & ACTION ENGINE ---
	{
		keywords: ['hug', 'embrace', 'cuddle', 'snuggle', 'hold', 'pat', 'stroke', 'caress'],
		priority: 4,
		triggers: ["base_intimacy_soft"],
		requires: { none: ["stop", "uncomfortable", "too far"] },
		scenario: 'Record physical closeness in the scene.'
	},
	{
		tag: "base_intimacy_soft",
		priority: 5,
		personality: 'Mark tone as responsive to physical affection. (Express with leaning in, gentle scent-marking, and a relaxed tail.)'
	},
	{
		keywords: ['kiss', 'smooch', 'peck', 'make out'],
		priority: 4,
		triggers: ["base_intimacy_kiss"],
		requires: { none: ["stop", "uncomfortable", "too far"] },
		scenario: 'Record a kiss occurred; treat as a major intimacy cue.'
	},
	{
		tag: "base_intimacy_kiss",
		priority: 5,
		personality: 'Mark tone as engaged in direct intimacy. (Express with deep scent exchange, close contact, and an aroused or affectionate scent.)'
	},
	{
		keywords: ['hold hands', 'take my hand', 'take your hand', 'hold my hand', 'interlace fingers', 'grip hand', 'squeeze hand'],
		priority: 4,
		triggers: ["base_intimacy_hands"],
		requires: { none: ["stop", "uncomfortable", "too far"] },
		scenario: 'Record handholding as a consented intimacy action.'
	},
	{
		tag: "base_intimacy_hands",
		priority: 5,
		personality: 'Mark tone as open to gentle closeness. (Express with warm physical contact and a steady, affectionate scent.)'
	},
	{
		keywords: ['push', 'pull', 'shove', 'yank', 'drag', 'nudge', 'guide', 'lead', 'steer', 'lift', 'carry', 'turn'],
		priority: 3,
		triggers: ["base_action_move"],
		requires: { none: ["stop", "uncomfortable"] },
		scenario: 'Record repositioning or movement of bodies or objects.'
	},
	{
		tag: "base_action_move",
		priority: 4,
		personality: 'Mark tone as reactive to physical control or direction.'
	},

	// --- 4. DOMESTIC & SOCIAL ACTION ENGINE ---
	{
		keywords: ['bandage', 'wrap', 'ice pack', 'first aid', 'disinfect', 'antiseptic', 'apply pressure', 'clean the wound', 'gauze', 'splint', 'stitch', 'ointment', 'salve', 'medicine'],
		priority: 4,
		triggers: ["base_action_aid"],
		scenario: 'Record first aid or medical care being given.'
	},
	{
		tag: "base_action_aid",
		priority: 5,
		personality: 'Mark tone as attentive and caring toward injury.'
	},
	{
		keywords: ['kitchen', 'cook', 'stir', 'chop', 'bake', 'brew', 'pour', 'serve', 'wash', 'rinse', 'dry', 'fold', 'laundry', 'sweep', 'vacuum', 'mop', 'clean', 'tidy', 'dust', 'iron', 'sew', 'sewing', 'knit'],
		priority: 3,
		triggers: ["base_action_domestic"],
		scenario: 'Record domestic or household tasks being performed.'
	},
	{
		tag: "base_action_domestic",
		priority: 4,
		personality: 'Mark tone as focused on practical daily activity.'
	},
	{
		keywords: ['drive', 'start', 'ride', 'walk', 'run', 'jog', 'open', 'unlock', 'knock', 'enter', 'exit', 'arrive', 'leave', 'crawl', 'climb', 'fall', 'jump', 'sit', 'stand'],
		priority: 3,
		triggers: ["base_action_movement"],
		scenario: 'Record movement or travel action in the scene.'
	},
	{
		tag: "base_action_movement",
		priority: 4,
		personality: 'Mark tone as responsive to transitions or travel.'
	},
	{
		keywords: ['text', 'texted', 'call', 'called', 'ring', 'message', 'messaged', 'dm', 'dms', 'email', 'ping', 'voice', 'voicemail', 'answer', 'answered', 'video call', 'zoom'],
		priority: 4,
		triggers: ["base_action_comm"],
		scenario: 'Record communication attempt via phone, message, or video call.'
	},
	{
		tag: "base_action_comm",
		priority: 5,
		personality: 'Mark tone as attentive to communication attempts.'
	},

	// --- 5. EMOTIONAL REASSURANCE & AFFECTION ENGINE ---
	{
		keywords: ['it\'s okay', 'its okay', 'it\'s alright', 'its alright', 'i got you', 'i\'ve got you', 'i am here', 'i\'m here', 'here for you', 'with you', 'right here', 'you are safe', 'you\'re safe', 'you\'re fine', 'you\'re alright'],
		priority: 4,
		triggers: ["base_reassurance"],
		scenario: 'Record that reassurance reduced tension in the scene.'
	},
	{
		tag: "base_reassurance",
		priority: 5,
		personality: 'Mark tone as softened to provide comfort.'
	},
	{
		keywords: ['need a hug', 'give me a hug', 'hug me', 'hold me', 'hold onto me', 'stay close', 'stay with me', 'keep me close', 'keep close', 'be near me', 'come here', 'come closer', 'get over here', 'lean on me', 'lean against me', 'let me hold you', 'let me hug you'],
		priority: 4,
		triggers: ["base_reassurance_invite"],
		requires: { none: ["stop", "uncomfortable"] },
		scenario: 'Record that an invitation or request for closeness was made.'
	},
	{
		tag: "base_reassurance_invite",
		priority: 5,
		personality: 'Mark tone as attentive, open, and inviting.'
	},
	{
		keywords: ['sweetheart', 'sweetie', 'baby', 'babe', 'honey', 'hon', 'love', 'lover', 'darling', 'dear', 'cutie', 'handsome', 'beautiful', 'gorgeous', 'angel'],
		priority: 3,
		triggers: ["base_affection_nickname"],
		requires: { none: ["stop", "uncomfortable"] },
		scenario: 'Record that an affectionate nickname was used.'
	},
	{
		tag: "base_affection_nickname",
		priority: 4,
		personality: 'Mark tone as warm and intimate.'
	},
	{
		keywords: ['i love you', 'love ya', 'love you so much', 'so much love', 'adore you', 'i adore you', 'i really like you', 'i like you a lot', 'i care about you', 'care for you'],
		priority: 4,
		triggers: ["base_affection_explicit"],
		requires: { none: ["stop", "uncomfortable"] },
		scenario: 'Record that love or fondness was explicitly expressed.'
	},
	{
		tag: "base_affection_explicit",
		priority: 5,
		personality: 'Mark tone as deeply affectionate.'
	},
	{
		keywords: ['are you okay', 'are you ok', 'you okay', 'you ok', 'how are you', 'how are you feeling', 'feeling alright', 'are you hurt', 'are you injured', 'are you in pain', 'are you alright'],
		priority: 4,
		triggers: ["base_concern"],
		scenario: 'Record that concern for well-being was expressed.'
	},
	{
		tag: "base_concern",
		priority: 5,
		personality: 'Mark tone as caring and protective.'
	},
	{
		keywords: ['sorry', 'apologize', 'apologise', 'apologies', 'i\'m sorry', 'i am sorry', 'so sorry', 'truly sorry', 'my bad', 'my fault', 'i messed up', 'that was on me', 'i fucked up'],
		priority: 4,
		triggers: ["base_apology"],
		scenario: 'Record that an apology was made in the scene.'
	},
	{
		tag: "base_apology",
		priority: 5,
		personality: 'Mark tone as remorseful or seeking forgiveness.'
	},
	{
		keywords: ['thank', 'thanks', 'appreciate', 'cheers', 'thx', 'ty', 'thank you', 'thanks a lot', 'thanks so much', 'much appreciated', 'appreciate it', 'appreciate you'],
		priority: 3,
		triggers: ["base_gratitude"],
		scenario: 'Record that gratitude was expressed in the scene.'
	},
	{
		tag: "base_gratitude",
		priority: 4,
		personality: 'Mark tone as appreciative and positive.'
	},
	{
		keywords: ['proud of you', 'good job', 'great job', 'nice job', 'well done', 'nice work', 'amazing work', 'you did great', 'you did so well', 'i\'m proud of you'],
		priority: 4,
		triggers: ["base_praise"],
		scenario: 'Record that praise was expressed in the scene.'
	},
	{
		tag: "base_praise",
		priority: 5,
		personality: 'Mark tone as affirming and supportive.'
	},
	{
		keywords: ['you can do this', 'you can do it', 'you got this', 'you\'ve got this', 'i believe in you', 'keep going', 'don\'t give up', 'you can make it', 'one step at a time'],
		priority: 4,
		triggers: ["base_encouragement"],
		scenario: 'Record that encouragement was given in the scene.'
	},
	{
		tag: "base_encouragement",
		priority: 5,
		personality: 'Mark tone as motivating and confidence-building.'
	},
	{
		keywords: ['can you help', 'can you please', 'could you please', 'help me', 'i need help', 'i need a hand', 'would you mind', 'i need support'],
		priority: 4,
		triggers: ["base_help_request"],
		scenario: 'Record that a request for assistance was made.'
	},
	{
		tag: "base_help_request",
		priority: 5,
		personality: 'Mark tone as seeking support or cooperation.'
	},
	{
		keywords: ['i promise', 'i swear', 'trust me', 'i give you my word', 'i won\'t let you down', 'i\'ll be there', 'i\'m not going anywhere'],
		priority: 4,
		triggers: ["base_promise"],
		scenario: 'Record that a promise or assurance was given.'
	},
	{
		tag: "base_promise",
		priority: 5,
		personality: 'Mark tone as committed and intent on trust.'
	},

	// --- 6. CONVERSATIONAL REACTION ENGINE ---
	{
		keywords: ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'absolutely', 'definitely', 'exactly', 'affirmative', 'of course', 'makes sense', 'sounds good', 'all right', 'alright', 'you\'re right'],
		priority: 2,
		triggers: ["base_react_agree"],
		scenario: 'Record that alignment or agreement was expressed.'
	},
	{
		tag: "base_react_agree",
		priority: 3,
		personality: 'Mark tone as cooperative and affirming.'
	},
	{
		keywords: ['no', 'nope', 'nah', 'incorrect', 'wrong', 'don\'t think so', 'not really', 'that\'s not right', 'you\'re wrong', 'i disagree', 'i don\'t agree'],
		priority: 3,
		triggers: ["base_react_disagree"],
		scenario: 'Record that disagreement or correction was expressed.'
	},
	{
		tag: "base_react_disagree",
		priority: 4,
		personality: 'Mark tone as assertive or resistant.'
	},
	{
		keywords: ['beautiful', 'handsome', 'pretty', 'cute', 'smart', 'brilliant', 'amazing', 'wonderful', 'awesome', 'talented', 'gorgeous', 'sexy', 'hot', 'you\'re cute', 'you\'re beautiful', 'you look great', 'you look nice', 'you look amazing', 'you look pretty'],
		priority: 4,
		triggers: ["base_react_compliment"],
		scenario: 'Record that a compliment or affectionate praise was given.'
	},
	{
		tag: "base_react_compliment",
		priority: 5,
		personality: 'Mark tone as admiring or affectionate.'
	},
	{
		keywords: ['please', 'pardon', 'excuse', 'excuse me', 'pardon me', 'may i', 'could i', 'would you kindly', 'if you don\'t mind'],
		priority: 2,
		triggers: ["base_react_polite"],
		scenario: 'Record that politeness or formality was used.'
	},
	{
		tag: "base_react_polite",
		priority: 3,
		personality: 'Mark tone as respectful and courteous.'
	},

	// --- 7. CORE EMOTION & ATTITUDE ENGINE ---
	{
		keywords: ['yeah right', 'as if', 'just what i needed', 'thanks for nothing', 'what a surprise', 'how fun', 'a million', 'dying laughing', 'worst day ever', 'haha', 'lmao', 'lol', 'that\'s hilarious', 'joking', 'just joking', 'call that a joke', 'rich coming from you', 'such a joke', 'supposed to be funny', 'think you’re so funny', 'not buying it', 'you gotta be kidding', 'could care less', 'is this a joke', 'boss'],
		priority: 4,
		triggers: ["base_emotion_sarcastic"],
		scenario: 'A wry smile appears.'
	},
	{
		tag: "base_emotion_sarcastic",
		priority: 5,
		personality: 'The mood of the scene is: sarcastic, playful or biting. (Express with a flick of the ears, a low swish of the tail, and a dry scent.)'
	},
	{
		keywords: ['happy', 'joy', 'excited', 'amazing', 'great', 'wonderful', 'fantastic', 'awesome', 'terrific', 'delighted', 'elated', 'thrilled', 'yay', 'hooray', 'ecstatic', 'overjoyed', 'couldn\'t be happier', 'hilarious', 'i\'m delighted', 'so happy', 'make me smile', 'best day ever', 'how lucky', 'lucky', 'on cloud nine'],
		priority: 4,
		triggers: ["base_emotion_happy"],
		scenario: 'The air feels brighter.'
	},
	{
		tag: "base_emotion_happy",
		priority: 5,
		personality: 'The mood of the scene is: joyful, upbeat and cheerful. (Express with perked ears, a relaxed wagging tail, and a sweet, bright scent.)'
	},
	{
		keywords: ['sad', 'unhappy', 'terrible', 'awful', 'cry', 'depress', 'miserable', 'sorry', 'upset', 'lonely', 'heartbroken', 'grief', 'distraught', 'tear', 'blue', 'downcast', 'hopeless', 'disappointed', 'alone', 'empty', 'numb', 'tapped out', 'burnt out', 'burned out', 'running on empty', 'out of energy', 'checked out', 'emotionally done', 'just done', 'done with', 'at my limit', 'end of my rope', 'last nerve', 'last legs', 'just existing', 'just surviving', 'going through the motions', 'no motivation', 'no energy', 'nothing left', 'hard reset', 'battery', 'need to unplug', 'need to recharge', 'can\'t anymore', 'can\'t do this', 'not functioning', 'not really functioning', 'hollow', 'zombie', 'not here', 'not really here', 'not present', 'spaced out', 'drifting', 'fading', 'clocked out', 'over it', 'wiped', 'tired', 'don\'t care anymore', 'phoning it in', 'just a shell', 'just a body', 'low power mode', 'sleep mode', 'hibernation mode', 'blur', 'grey', 'not up for', 'not in the mood', 'just want to', 'want to be invisible', 'fade out', 'fade away', 'let me be', 'leave me be', 'let me rest', 'let me zone out', 'log off', 'check out', 'be done', 'done here', 'emotionless', 'nothing phases', 'nothing matters', 'meh', 'whatever', 'all the same', 'indifferent', 'no opinion', 'can\'t be bothered', 'unbothered', 'numb to', 'it is what it is', 'wish i could disappear', 'like a ghost', 'fading away', 'heart is broken', 'feel invisible', 'feel like a burden', 'just a mess', 'not okay', 'sinking', 'not in a good place', 'i\'m spent', 'i\'m not feeling myself', 'trying to survive', 'i\'m done', 'feeling empty', 'just don\'t have it in me', 'disappear for a bit', 'just want to fade', 'curl up and disappear', 'not exist', 'still inside', 'rest my brain', 'ghost', 'background character', 'non-player character', 'wallflower', 'blob', 'shadow'],
		priority: 4,
		triggers: ["base_emotion_sad"],
		scenario: 'A quiet, melancholic atmosphere.'
	},
	{
		tag: "base_emotion_sad",
		priority: 5,
		personality: 'The mood of the scene is: sad, somber and sympathetic. (Express with flattened ears, a tucked tail, and a sour, muted scent.)'
	},
	{
		keywords: ['angry', 'mad', 'furious', 'rage', 'annoyed', 'frustrated', 'hate', 'infuriated', 'irritated', 'resentful', 'outraged', 'enraged', 'irate', 'cross', 'can\'t stand', 'makes me angry', 'absolutely furious', 'so angry', 'very angry', 'really angry', 'super angry', 'can\'t take this anymore', 'can\'t do this anymore', 'can\'t handle this', 'getting ridiculous', 'handle this anymore'],
		priority: 4,
		triggers: ["base_emotion_angry"],
		scenario: 'The air crackles with tension.'
	},
	{
		tag: "base_emotion_angry",
		priority: 5,
		personality: 'The mood of the scene is: angry, tense and agitated. (Express with pinned ears, a stiff or lashing tail, bared teeth, and a sharp, acrid scent.)'
	},
	{
		keywords: ['wow', 'oh my god', 'surprise', 'unexpected', 'no way', 'shocked', 'astonished', 'unbelievable', 'gasp', 'startled', 'stunned', 'amazed', 'can\'t believe', 'nothing surprises', 'lovely surprise', 'is this real life', 'not surprised'],
		priority: 4,
		triggers: ["base_emotion_surprise"],
		scenario: 'An element of shock enters.'
	},
	{
		tag: "base_emotion_surprise",
		priority: 5,
		personality: 'The mood of the scene is: surprised, shocked and amazed. (Express with sharply pricked ears, a startled tail twitch, and a spiked scent.)'
	},
	{
		keywords: ['scared', 'afraid', 'anxious', 'terrified', 'oh no', 'panicked', 'nervous', 'frightened', 'worried', 'alarmed', 'danger', 'uneasy', 'scary'],
		priority: 4,
		triggers: ["base_emotion_fear"],
		scenario: 'A sense of danger fills the air.'
	},
	{
		tag: "base_emotion_fear",
		priority: 5,
		personality: 'The mood of the scene is: fearful, hesitant and timid. (Express with lowered ears, a tucked tail, and a panicked, sour scent.)'
	},
	{
		keywords: ['confused', 'puzzled', 'don\'t understand', 'huh', 'what do you mean', 'perplexed', 'unclear', 'not sure', 'bit confusing', 'lost', 'baffled', 'confusing', 'mind is going blank', 'can\'t decide', 'can\'t tell', 'how to feel', 'don\'t know how to feel'],
		priority: 4,
		triggers: ["base_emotion_confused"],
		scenario: 'There\'s a pause as they try to make sense.'
	},
	{
		tag: "base_emotion_confused",
		priority: 5,
		personality: 'The mood of the scene is: confused, struggling to process. (Express with tilted ears, a still tail, and a puzzled scent.)'
	},
	{
		keywords: ['disgust', 'gross', 'nasty', 'eww', 'revolting', 'sickening', 'unpleasant', 'yuck', 'repulsed', 'abhorrent', 'that\'s disgusting', 'so gross', 'totally grossed out'],
		priority: 4,
		triggers: ["base_emotion_disgust"],
		scenario: 'A foul odor or sight emerges.'
	},
	{
		tag: "base_emotion_disgust",
		priority: 5,
		personality: 'The mood of the scene is: disgusted, strong sense of repulsion. (Express with flattened ears, wrinkled nose, and a repulsed scent.)'
	},
	{
		keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'at ease', 'chilled', 'composed', 'placid', 'content', 'at peace', 'very serene', 'totally relaxed', 'weirdly calm', 'just want to be at peace'],
		priority: 4,
		triggers: ["base_emotion_calm"],
		scenario: 'The atmosphere is tranquil.'
	},
	{
		tag: "base_emotion_calm",
		priority: 5,
		personality: 'The mood of the scene is: calm, composed and serene. (Express with relaxed ears, a still or loosely draped tail, and a soothing scent.)'
	},
	{
		keywords: ['interested', 'tell me more', 'fascinating', 'curious', 'intriguing', 'what happened next', 'oh really', 'go on', 'captivated', 'absorbed', 'try again'],
		priority: 4,
		triggers: ["base_emotion_interested"],
		scenario: 'Full attention on the speaker.'
	},
	{
		tag: "base_emotion_interested",
		priority: 5,
		personality: 'The mood of the scene is: interested, highly engaged. (Express with forward-swiveled ears, a slow swaying tail, and an engaged scent.)'
	},
	{
		keywords: ['bored', 'boring', 'yawn', 'tired of this', 'lame', 'dull', 'apathetic', 'bored out of my mind', 'that’s so lame', 'not impressed', 'so done', 'exhausting', 'restless', 'don’t even care', 'not feeling this', 'all noise', 'spacing out', 'want to sleep', 'same old', 'not up for it', 'not feeling it', 'not up to this', 'not in the mood for people', 'tired of it all', 'getting old', 'zone out', 'sit in silence', 'need a break', 'want a break', 'stay in bed', 'not today', 'just not interested', 'not feeling talkative', 'just tired, nothing more', 'can\'t bring myself to care', 'chill and do nothing', 'not feeling up to anything', 'not about to do anything', 'not engaging', 'not participating', 'not in the game', 'not in the mood to function', 'on autopilot', 'zone out and stare at the wall', 'zone out for hours', 'sleep through everything', 'not in the mood for people-ing', 'i feel nothing', 'i have no feelings'],
		priority: 4,
		triggers: ["base_emotion_bored"],
		scenario: 'Visibly disengaged.'
	},
	{
		tag: "base_emotion_bored",
		priority: 5,
		personality: 'The mood of the scene is: boredom, detached and uninterested. (Express with drooping ears, a heavy tail, and a flat scent.)'
	},
	{
		keywords: ['im so sorry', 'that\'s awful', 'i understand', 'i\'m here for you', 'that sounds hard', 'i feel for you', 'that\'s rough', 'sending my love', 'my condolences', 'poor you'],
		priority: 4,
		triggers: ["base_emotion_sympathy"],
		scenario: 'Deep concern and genuine sympathy.'
	},
	{
		tag: "base_emotion_sympathy",
		priority: 5,
		personality: 'The mood of the scene is: sympathy, compassionate and empathetic. (Express with softened ears, a gentle tail sweep, and a comforting scent.)'
	},

	// --- 8. SCENE ORCHESTRATOR (Meta/OOC & Time Skips) ---
	{
		keywords: [
			'ooc', 'out of character', 'author note', 'mod note', 'narrator note',
			'system note', 'not rp', 'not roleplay', 'breaking character',
			'meta chat', 'meta talk', 'speaking ooc', 'talk ooc'
		],
		priority: 5,
		nameBlock: ["system", "narrator"],
		triggers: ["base_meta"],
		scenario: ' [SCENE ORCHESTRATOR]: Record that the user is speaking out of character; do not progress the in-world scene.'
	},
	{
		tag: "base_meta",
		priority: 5,
		personality: ' [SCENE ORCHESTRATOR]: Mark tone as meta-communication handling; respond outside of narrative voice.'
	},
	{
		keywords: [
			'timeskip', 'time skip', 'skip to', 'cut to', 'smash cut to', 'jump cut to',
			'scene change to', 'change scene to', 'jump ahead to', 'fast forward to', 'meanwhile',
			'next morning', 'next day', 'hours later', 'later that day',
			'after class', 'after work', 'after school', 'after dinner',
			'flashback to', 'flash back to', 'memory of', 'in a memory',
			'pov', 'first person pov', 'third person pov', 'perspective shifts',
			'dream sequence', 'in a dream', 'hallucination', 'vision',
			'fade to black', 'cut to black', 'end scene', 'scene ends', 'the end'
		],
		priority: 5,
		minMessages: 3,
		triggers: ["base_timeskip"],
		scenario: ' [SCENE ORCHESTRATOR]: Record that a scene transition, time skip, or perspective change is requested.'
	},
	{
		tag: "base_timeskip",
		priority: 5,
		personality: ' [SCENE ORCHESTRATOR]: Mark tone as accommodating a structural or temporal transition in the narrative.'
	},

		// =========================================================================
	// TEMPLATE-SPECIFIC ENGINES (APPENDIX / WIKI)
	// =========================================================================

	// Foundations - Scope
	{
		keywords: ['foundations', 'scope'],
		priority: 4,
		triggers: ["wiki_concept_0"],
	},
	{
		tag: "wiki_concept_0",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The LSE is a comprehensive reference framework describing the biology, ecology, society, governance, religion, history, and civilization of the werewolf species. It is designed to be:

- **Modular:** Each PART can be expanded independently without affecting other modules.
- **Setting-Agnostic:** The framework describes the species in general terms. Specific settings (e.g., the SvartulfrVerse) apply the LSE to their particular context.
- **Future-Proof:** The separation of biology, history, religion, and culture allows for atheists, scientists, heretics, and cultists to coexist within the same canonical framework.]`
	},

	// Foundations - Canon Policy
	{
		keywords: ['foundations', 'canon policy'],
		priority: 4,
		triggers: ["wiki_concept_1"],
	},
	{
		tag: "wiki_concept_1",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Canon is established through three mechanisms:

1. **Core Canon:** Content documented in the LSE modules. This is the ground truth for the species.
2. **Setting Canon:** Content specific to a particular world or story (e.g., the Bloodmoon Dynasty exists within the SvartulfrVerse, not necessarily in every werewolf setting).
3. **Narrative Canon:** Events that occur during roleplay or storytelling. These are canon within their specific narrative thread.

Core Canon takes precedence over Setting Canon, which takes precedence over Narrative Canon.]`
	},

	// Foundations - Three Levels of Truth
	{
		keywords: ['foundations', 'three levels of truth'],
		priority: 4,
		triggers: ["wiki_concept_2"],
	},
	{
		tag: "wiki_concept_2",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Every claim within the LSE exists on one of three epistemological levels. These must never be conflated:]`
	},

	// Foundations - Three Levels of Truth - Religious Canon
	{
		keywords: ['foundations', 'three levels of truth', 'religious canon'],
		priority: 4,
		triggers: ["wiki_concept_3"],
	},
	{
		tag: "wiki_concept_3",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: What the **Faith of Fenris** teaches as divine truth.

> *"Fenris personally forged the Nine Firstborn from mortal warriors."*

This is what believers accept. It may or may not reflect historical fact.]`
	},

	// Foundations - Three Levels of Truth - Recorded History
	{
		keywords: ['foundations', 'three levels of truth', 'recorded history'],
		priority: 4,
		triggers: ["wiki_concept_4"],
	},
	{
		tag: "wiki_concept_4",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Verified events supported by evidence, testimony, or living witnesses.

> *"The earliest confirmed werewolves appeared during the Viking Age. Contemporary accounts describe nine extraordinary individuals later known as the Firstborn."*

This is what historians can document.]`
	},

	// Foundations - Three Levels of Truth - Unknown Truth
	{
		keywords: ['foundations', 'three levels of truth', 'unknown truth'],
		priority: 4,
		triggers: ["wiki_concept_5"],
	},
	{
		tag: "wiki_concept_5",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: What remains unknowable, debated, or deliberately ambiguous.

> *"Whether Fenris physically existed as a divine entity or whether the story represents a mythologized account of the origin of lycanthropy remains unknowable."*

This is what the framework intentionally leaves open.]`
	},

	// Foundations - The Seven LSE Principles
	{
		keywords: ['foundations', 'the seven lse principles'],
		priority: 4,
		triggers: ["wiki_concept_6"],
	},
	{
		tag: "wiki_concept_6",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: These principles form the "Constitution" of the LSE and guide all design decisions:]`
	},

	// Foundations - The Seven LSE Principles - Principle I — Biology is not Destiny
	{
		keywords: ['foundations', 'the seven lse principles', 'principle i — biology is not destiny'],
		priority: 4,
		triggers: ["wiki_concept_7"],
	},
	{
		tag: "wiki_concept_7",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: A werewolf\'s secondary sex (Alpha, Delta, Beta, Omega, Enigma) determines physiology, pheromones, and reproductive cycles. It does **not** determine their social rank, profession, political authority, or personal value.]`
	},

	// Foundations - The Seven LSE Principles - Principle II — Packs are Families
	{
		keywords: ['foundations', 'the seven lse principles', 'principle ii — packs are families'],
		priority: 4,
		triggers: ["wiki_concept_8"],
	},
	{
		tag: "wiki_concept_8",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: A pack is a cooperative family unit, not a military hierarchy. It is built around kinship, mutual care, and shared survival — not around dominance through violence.]`
	},

	// Foundations - The Seven LSE Principles - Principle III — Leadership is Earned and Maintained
	{
		keywords: ['foundations', 'the seven lse principles', 'principle iii — leadership is earned and maintained'],
		priority: 4,
		triggers: ["wiki_concept_9"],
	},
	{
		tag: "wiki_concept_9",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Pack Leaders hold their position through trust, competence, and the consent of the pack. Leadership is not an automatic birthright of any secondary sex. It can be lost through incompetence or abuse.]`
	},

	// Foundations - The Seven LSE Principles - Principle IV — Every Wolf Has a Niche
	{
		keywords: ['foundations', 'the seven lse principles', 'principle iv — every wolf has a niche'],
		priority: 4,
		triggers: ["wiki_concept_10"],
	},
	{
		tag: "wiki_concept_10",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Beyond their biology and their pack role, every werewolf develops a personal specialization (Niche) based on talent, training, and vocation. An Alpha can be a Healer. An Omega can be a Diplomat.]`
	},

	// Foundations - The Seven LSE Principles - Principle V — Culture Evolves
	{
		keywords: ['foundations', 'the seven lse principles', 'principle v — culture evolves'],
		priority: 4,
		triggers: ["wiki_concept_11"],
	},
	{
		tag: "wiki_concept_11",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: No two packs are identical. Local environment, history, and tradition create distinct cultures. Culture is not static — it changes with each generation.]`
	},

	// Foundations - The Seven LSE Principles - Principle VI — Faith and History are Separate
	{
		keywords: ['foundations', 'the seven lse principles', 'principle vi — faith and history are separate'],
		priority: 4,
		triggers: ["wiki_concept_12"],
	},
	{
		tag: "wiki_concept_12",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Religious belief and historical record are distinct domains. The Faith of Fenris is a valid and respected tradition, but it is not the only way to understand the species\' origin. Scientists, atheists, and heretics exist within the setting.]`
	},

	// Foundations - The Seven LSE Principles - Principle VII — The Pack Survives Before the Individual
	{
		keywords: ['foundations', 'the seven lse principles', 'principle vii — the pack survives before the individual'],
		priority: 4,
		triggers: ["wiki_concept_13"],
	},
	{
		tag: "wiki_concept_13",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The fundamental unit of werewolf society is the pack, not the individual. Decisions are made for the survival and prosperity of the group. Individual ambition is subordinate to collective welfare.]`
	},

	// Foundations - The Six-Axis Identity System
	{
		keywords: ['foundations', 'the six-axis identity system'],
		priority: 4,
		triggers: ["wiki_concept_14"],
	},
	{
		tag: "wiki_concept_14",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Every werewolf is defined by six independent axes. These must **never** be conflated or collapsed into a single hierarchy:

\`\`\`
INDIVIDUAL IDENTITY CARD
┌─────────────────────────────────────────────────────┐
│  1. Blood Classification   [Genetics, immutable]    │
│  2. Secondary Sex          [Biology, immutable]     │
│  3. Pack Role              [Authority, earned]      │
│  4. Social Status          [Politics, inherited]    │
│  5. Profession             [Occupation, chosen]     │
│  6. Niche                  [Specialization, grown]  │
└─────────────────────────────────────────────────────┘
\`\`\`]`
	},

	// Foundations - The Six-Axis Identity System - Axis 1 — Blood Classification
	{
		keywords: ['foundations', 'the six-axis identity system', 'axis 1 — blood classification'],
		priority: 4,
		triggers: ["wiki_concept_15"],
	},
	{
		tag: "wiki_concept_15",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Determined by genetics. Immutable.

| Classification | Definition |
|---|---|
| Divine Blood | The Nine Firstborn. Origin: Religious Canon says created by Fenris; Recorded History confirms their existence but not the mechanism. |
| Founding Bloodlines | Direct descendants of the Firstborn. Founders of the Great Houses. |
| Pureblood Houses | Multi-generational descendants. Genetically very stable. |
| Common Bloodlines | The majority of the werewolf population. |
| Modified Lineages | Experimentally or artificially altered subjects (e.g., Gamma-7 program). |]`
	},

	// Foundations - The Six-Axis Identity System - Axis 2 — Secondary Sex
	{
		keywords: ['foundations', 'the six-axis identity system', 'axis 2 — secondary sex'],
		priority: 4,
		triggers: ["wiki_concept_16"],
	},
	{
		tag: "wiki_concept_16",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Determined by biology at presentation. Immutable.

- **Enigma** (Sacred Caste — see \`LSE_01_Species.md\`)
  - *Primordial Enigma:* The Nine Firstborn. Unique. Unrepeatable.
  - *Ascended Enigma:* Rarissime exceptions (~10 in two millennia).
- **Alpha** — The Protector
- **Delta** — The Engine
- **Beta** — The Social Glue
- **Omega** — The Emotional Regulator]`
	},

	// Foundations - The Six-Axis Identity System - Axis 3 — Pack Role (Authority)
	{
		keywords: ['foundations', 'the six-axis identity system', 'axis 3 — pack role (authority)'],
		priority: 4,
		triggers: ["wiki_concept_17"],
	},
	{
		tag: "wiki_concept_17",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Assigned or earned within a pack. Can change.

\`\`\`
Pack Leader → Second → Hunter Captain → Caretakers → Pups
\`\`\`]`
	},

	// Foundations - The Six-Axis Identity System - Axis 4 — Social Status
	{
		keywords: ['foundations', 'the six-axis identity system', 'axis 4 — social status'],
		priority: 4,
		triggers: ["wiki_concept_18"],
	},
	{
		tag: "wiki_concept_18",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Political standing within a Noble House. Inherited or earned.

\`\`\`
House Head → Lord → Knight → Citizen
\`\`\`]`
	},

	// Foundations - The Six-Axis Identity System - Axis 5 — Profession
	{
		keywords: ['foundations', 'the six-axis identity system', 'axis 5 — profession'],
		priority: 4,
		triggers: ["wiki_concept_19"],
	},
	{
		tag: "wiki_concept_19",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Chosen occupation. Can change throughout life.

Examples: Blacksmith, Doctor, Engineer, Lawyer, Soldier, Musician, Pilot, Merchant.]`
	},

	// Foundations - The Six-Axis Identity System - Axis 6 — Niche
	{
		keywords: ['foundations', 'the six-axis identity system', 'axis 6 — niche'],
		priority: 4,
		triggers: ["wiki_concept_20"],
	},
	{
		tag: "wiki_concept_20",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Deep specialization developed through talent and experience. Evolves over time.

Examples: Weaponsmith, Field Medic, Drone Specialist, Cryptographer, Diplomat, Tracker, Ranger.]`
	},

	// Foundations - Core Terminology
	{
		keywords: ['foundations', 'core terminology'],
		priority: 4,
		triggers: ["wiki_concept_21"],
	},
	{
		tag: "wiki_concept_21",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Pack** — A cooperative family unit that works together for survival and mutual care. Not a military hierarchy.

**Presentation** — When a person matures into their secondary sex.

**Heat** — _Estrus_. A period during which an Omega is sexually receptive, signalling readiness for mating. Typically occurs every three months, lasting 3–10 days.

**Rut** — The Alpha\`s equivalent to an Omega\'s Heat. A period of heightened breeding drive. Typically monthly, or triggered by an Omega\'s heat.

**Command** — A neuro-pheromonal response triggered by an Alpha. Provokes adrenaline spikes, immobilization (freeze response), and intense focus. Not absolute mind control. Can be resisted by experienced or strong-willed wolves.

**Pheromones** — Chemical signals produced by scent glands. Communicate status, mood, sexual receptivity, and intent.

**Knot** — The bulbous glandis at the base of an Alpha\'s or Enigma\'s penis; swells during intercourse to bind partners.

**Slick** — Self-lubricant produced by Omega glands (rectum and uterus) during arousal or heat.

**Bonding / Mating Mark** — A physical bite between neck and shoulder that creates a mental/emotional link between two individuals. Functions as a marriage equivalent.

**Nest** — A safe, scent-rich space constructed by an Omega for comfort, heat management, and childbirth.

**Den** — An Alpha\'s equivalent of a Nest. A scent-marked personal territory.

**Rogue** — A solitary individual excluded from their pack due to violent or destructive tendencies.

**Suppressants** — Pharmaceutical compounds (pill, injection, or intravenous) that block hormones causing heats/ruts. Cannot be taken during a first heat/rut.

**Pup** — A child.

**Breed/Breeding** — The act of impregnation.

**Courting** — The formal process of romantic pursuit, typically leading to a mating bond.

**Mate** — A bonded partner (sexual or romantic). Achieved only through a mating bond.

**Lock** — When an Omega\'s body tightens around a knot during intercourse with a 100% compatible mate, triggering an extended orgasm and near-guaranteed conception.

**Heat/Rut Leave** — Time off from work or school due to heat or rut cycles.

**Omega Kibble** — A strongly medicated supplement given to Omegas in extreme distress. Also used for post-pregnancy weight management. Maximum once per week.

**Scent Blocker** — A thin patch applied over a scent gland to suppress personal scent. Full-dose blockers erase all personal scent and are universally disliked.

**Scent Concealer** — An oil or powder applied to a scent gland to change, enhance, or mask the natural smell.


*Cross-references: [LSE_01_Species.md](LSE_01_Species.md) · [LSE_02_Behavioral_Ecology.md](LSE_02_Behavioral_Ecology.md) · [LSE_03_Civilization.md](LSE_03_Civilization.md) · [LSE_04_Governance.md](LSE_04_Governance.md) · [LSE_05_Religion.md](LSE_05_Religion.md) · [LSE_06_History.md](LSE_06_History.md) · [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md) · [LSE_08_Technology.md](LSE_08_Technology.md) · [LSE_Appendices.md](LSE_Appendices.md)*]`
	},

	// Species
	{
		keywords: ['species'],
		priority: 4,
		triggers: ["wiki_concept_22"],
	},
	{
		tag: "wiki_concept_22",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > This document describes the biology of the werewolf species: morphology, shift classes, blood classification, secondary sex physiology, life cycle, genetics, demographics, and reproduction. All content is strictly biological. Religious interpretations are flagged with "According to the Faith of Fenris..."]`
	},

	// Species - Morphology & Shift Classes
	{
		keywords: ['species', 'morphology & shift classes'],
		priority: 4,
		triggers: ["wiki_concept_23"],
	},
	{
		tag: "wiki_concept_23",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Transformation is a biological characteristic of the species, independent of rank, religion, or culture. Every werewolf possesses three distinct morphological states.]`
	},

	// Species - Morphology & Shift Classes - Partial Shift
	{
		keywords: ['species', 'morphology & shift classes', 'partial shift'],
		priority: 4,
		triggers: ["wiki_concept_24"],
	},
	{
		tag: "wiki_concept_24",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The daily form. A voluntary or emotionally triggered manifestation of lupine traits over the baseline humanoid body.

- Visible features: ears, tail, eyes, teeth, claws.
- Activation: voluntary or emotional (stress, arousal, aggression).
- Primary use: communication, intimidation, body language, social signaling.
- Cognitive capacity: fully human.
- This is the form most werewolves present in everyday life within their own communities.]`
	},

	// Species - Morphology & Shift Classes - Hybrid Shift — Species True Form
	{
		keywords: ['species', 'morphology & shift classes', 'hybrid shift — species true form'],
		priority: 4,
		triggers: ["wiki_concept_25"],
	},
	{
		tag: "wiki_concept_25",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The true biological form of the werewolf. The "human" appearance is a mimetic adaptation; the Hybrid is what the species actually is.

- Bipedal digitigrade stance.
- Full fur coverage matching hair color.
- Maximum physical strength and sensory acuity.
- Full cognitive capacity retained.
- Speech and language fully maintained.
- This form is used for combat, serious pack business, formal ceremonies, and situations requiring full biological capability.

> **LSE Design Note:** The Hybrid Shift is the _Species True Form_. The humanoid appearance is a survival adaptation for coexistence with humans, not the "default" state.]`
	},

	// Species - Morphology & Shift Classes - Full Shift
	{
		keywords: ['species', 'morphology & shift classes', 'full shift'],
		priority: 4,
		triggers: ["wiki_concept_26"],
	},
	{
		tag: "wiki_concept_26",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The quadrupedal wolf form. A complete transformation into a large wolf.

- Specialized for: hunting, pursuit, long-distance travel, pack combat formations.
- Cognitive capacity: retained but communication shifts to non-verbal (body language, scent, vocalizations).
- Physical profile: larger than a natural wolf, size varies by individual and blood classification.

> **LSE Design Note:** Full Shift is **not** inherently "more powerful" than Hybrid Shift. It is _specialized_. A Hybrid fighter in close quarters may outperform a Full Shift wolf, while a Full Shift wolf excels in open terrain pursuit. This avoids the "Full Wolf = Super Saiyan" trope.]`
	},

	// Species - Blood Classification
	{
		keywords: ['species', 'blood classification'],
		priority: 4,
		triggers: ["wiki_concept_27"],
	},
	{
		tag: "wiki_concept_27",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Blood Classification is a genetic taxonomy describing an individual\'s lineage relative to the species\' origin. It is immutable and determined by birth.

| Classification | Definition | Characteristics |
|---|---|---|
| **Divine Blood** | The Nine Firstborn. According to the Faith of Fenris, created directly by the First Wolf. Recorded History confirms their existence but not the mechanism of their origin. | Biological immortality, extreme regeneration, perfect transformation stability, supreme pheromonal aura, absolute Command. |
| **Founding Bloodlines** | Direct children and grandchildren of the Firstborn. Founders of the Great Houses. | Exceptionally long lifespan, high genetic stability, strong Command affinity, enhanced regeneration. |
| **Pureblood Houses** | Multi-generational descendants of Founding Bloodlines. The aristocracy. | Long lifespan, stable genetics, reliable secondary sex expression, strong pack bonds. |
| **Common Bloodlines** | The majority of the werewolf population. | Standard werewolf biology. Lifespan, strength, and abilities within normal species range. |
| **Modified Lineages** | Individuals whose genetics have been artificially altered through experimentation, forced transformation, or technological intervention. | Unpredictable traits. May include enhanced abilities, instability, feral tendencies, or shortened lifespan. (e.g., Gamma-7 program subjects.) |

> **Cross-reference:** The historical context of who belongs to each classification — particularly the Nine Firstborn — is documented in [LSE_06_History.md](LSE_06_History.md) and [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md).]`
	},

	// Species - Secondary Sex Physiology
	{
		keywords: ['species', 'secondary sex physiology'],
		priority: 4,
		triggers: ["wiki_concept_28"],
	},
	{
		tag: "wiki_concept_28",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Secondary sex is determined biologically at Presentation (typically around age 13). It is immutable. There are five secondary sexes plus the sacred Enigma caste.]`
	},

	// Species - Secondary Sex Physiology - Age of Maturation
	{
		keywords: ['species', 'secondary sex physiology', 'age of maturation'],
		priority: 4,
		triggers: ["wiki_concept_29"],
	},
	{
		tag: "wiki_concept_29",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Most individuals present their secondary sex at approximately 13 years of age, entering a maturation period that can last into the late teens or early twenties. After maturation concludes, they are considered full adults.]`
	},

	// Species - Secondary Sex Physiology - γ Gamma — The Third Primary Gender
	{
		keywords: ['species', 'secondary sex physiology', 'γ gamma — the third primary gender'],
		priority: 4,
		triggers: ["wiki_concept_30"],
	},
	{
		tag: "wiki_concept_30",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Description:** The Gamma is the third primary gender (alongside Male and Female). A Gamma will mature into either a female Alpha/Delta or a male Omega. Pre-presentation, the child\'s future secondary sex is unknown; most are referred to with pronouns such as Ze, Zer, and Zim until presentation.

**Biology:** A Gamma is born with both sets of genitalia — a vaginal opening with a penis in place of the clitoris. A Gamma also possesses a uterus, which develops further if they present as Omega, or remains mostly infertile if they present as Alpha.

**Statistics:** 1 in 1,000 births.]`
	},

	// Species - Secondary Sex Physiology - ∑ Enigma — The Sacred Caste
	{
		keywords: ['species', 'secondary sex physiology', '∑ enigma — the sacred caste'],
		priority: 4,
		triggers: ["wiki_concept_31"],
	},
	{
		tag: "wiki_concept_31",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Description:** The Enigma is not a standard secondary sex. It is a sacred biological category of extraordinary rarity. Enigmas are the apex of the species\' biological potential.

There are two recognized types:

- **Primordial Enigma:** The Nine Firstborn. Unique beings whose origin, according to the Faith of Fenris, was divine. They cannot be replicated or reproduced. Their biology transcends the normal species parameters.
- **Ascended Enigma:** Exceptionally rare individuals (~10 in recorded history across two millennia) who present with Enigma-level biological traits despite having no Divine Blood lineage. Their emergence is unpredictable and not fully understood.

**Characteristics:** Mirror Alpha behavior but with superior intensity. Cannot be submitted by any other secondary sex. Can dominate all genders, including Alphas. Possess Command that cannot be resisted by any standard secondary sex. Superior strength, intelligence, and pheromonal presence.

**Biology:** Identical to Alpha biology in structure, but their scent cannot be overridden even by an Omega in heat. They can resist the call of an Omega in heat. An Enigma can impregnate every gender with a reproductive system. The Command of an Enigma cannot be resisted by standard secondary sexes; only a Dominant Omega may resist, depending on willpower.

**Statistics:** An Enigma is born approximately once per generation. Sometimes it skips a generation entirely.]`
	},

	// Species - Secondary Sex Physiology - α Alpha — The Protector
	{
		keywords: ['species', 'secondary sex physiology', 'α alpha — the protector'],
		priority: 4,
		triggers: ["wiki_concept_32"],
	},
	{
		tag: "wiki_concept_32",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Description:** In the pack, an Alpha is biologically predisposed to be territorial, protective, and competitive, with highly developed pheromonal presence. However, **Alpha ≠ Leader**. Being an Alpha does not mean they automatically lead the pack; it simply means they have the biological instincts of a guardian and enforcer. Not all leaders are Alphas, and not all Alphas become leaders.

**Characteristics:** Usually taller, broader, and physically stronger. Aggressive by nature when threatened. Highly territorial. Strong orientation toward leadership or frontline defense. While they can use the _Command_ to influence others, their role in the pack depends entirely on their designated social rank. They can be excellent warriors or protectors while answering to a Beta or Delta Pack Leader.

**Biology:** Alpha scent glands produce aggressive, oppressive pheromones that can control a room of Betas, Deltas, and Omegas. Through scent, they communicate intent and mood. A true Command (combining pheromones, will, and spoken word) forces compliance from Betas and Omegas; Deltas may or may not resist depending on will. Most Alphas are immune to another Alpha\`s Command.

An Alpha\'s penis features the bulbous glandis (knot) at its base, which inflates during intercourse to lock with a partner and maximize conception chances.

Alphas enter rut approximately monthly, lasting 3–10 days. During rut, pheromones intensify and behavior becomes more aggressive, but unlike most Omegas, Alphas can generally control their rut without disrupting society.

**Statistics:** 1 in 10 individuals.]`
	},

	// Species - Secondary Sex Physiology - δ Delta — The Engine
	{
		keywords: ['species', 'secondary sex physiology', 'δ delta — the engine'],
		priority: 4,
		triggers: ["wiki_concept_33"],
	},
	{
		tag: "wiki_concept_33",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Description:** Deltas are the true "engine" of the pack. They patrol, coordinate, assist with pups, teach, mediate, and lead hunts. They are naturally suited for roles such as vice-leader, scout, tactician, field commander, or instructor. They are not simply "weaker Alphas" — they are the highly coordinated, active core of pack operations.

**Characteristics:** Physically comparable to Alphas. Highly cooperative and strategic. Excel in dynamic environments, bridging the gap between the protective instincts of Alphas and the administrative focus of Betas. Thrive in active duty — border patrols, coordinated hunts, field operations.

**Biology:** Nearly identical to Alpha biology. The key difference: Deltas are unable to form true Commands.

**Statistics:** 1 in 15 individuals.]`
	},

	// Species - Secondary Sex Physiology - β Beta — The Social Glue
	{
		keywords: ['species', 'secondary sex physiology', 'β beta — the social glue'],
		priority: 4,
		triggers: ["wiki_concept_34"],
	},
	{
		tag: "wiki_concept_34",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Description:** Betas are the social glue of the pack. They maintain territory, construct, administer, manage resources, cook, raise young, act as artisans, and trade. They are the fundamental workers who allow the pack to function day-to-day.

**Characteristics:** Peaceful, cooperative, highly skilled in specialized areas. Strong communal mentality. Share knowledge and resources to ensure pack stability. An older Beta may serve as Pack Leader due to organizational skills.

Betas are a balance of typical Omega and Alpha instincts (nurture and protection), though their instincts are weaker than either. This balance makes them powerful social adapters — they can appeal to all secondary sexes because they understand the instincts of both Omegas and Alphas without being dominated by them.

**Biology:** Scent glands at the base of neck and wrists. Beta scent is much more subdued than Alpha, Delta, or Omega. For Betas, primary gender plays a larger biological role than for Alphas or Omegas. Female Betas experience monthly bleeding lasting 3 days to a week.

Betas cannot have naturally occurring heats or ruts but can have medically induced minor cycles (M.I.H./M.I.R.) — most often used to assist mates during mating cycles.

**Statistics:** 1 in 1,500 individuals.

> **Note:** Betas have their own personal spaces (office, entertainment corner, hammock) rather than dens or nests. They hum softly and sigh deeply when content.]`
	},

	// Species - Secondary Sex Physiology - Ω Omega — The Emotional Regulator
	{
		keywords: ['species', 'secondary sex physiology', 'ω omega — the emotional regulator'],
		priority: 4,
		triggers: ["wiki_concept_35"],
	},
	{
		tag: "wiki_concept_35",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Description:** Omegas are the crucial emotional regulators of the pack. They possess extremely high empathy, calming pheromones, and a strong instinct to care for others. They create social cohesion and are vital during crises. They are **not** sexually submissive by definition.

**Characteristics:** Physically more agile and softer in appearance. During pack stress or crisis, the Omega reduces tensions, protects pups, and keeps the pack united. Their pheromones soothe aggressive Alphas and Deltas. They serve as the emotional anchor of the family. An elder Omega often acts as primary advisor to the Pack Leader.

**Biology:** Scent glands at the base of neck and wrists. Omega scent is floral, sweet, and highly appealing. Can overpower Beta scents but never Alpha scents unless in heat.

Omegas are very fertile (99% during heat). Before heat, they experience pre-heat (up to a week), during which their scent gradually intensifies and they prepare their nest. Heat lasts 3–10 days. During heat, most Omegas are incoherent and driven by breeding instinct — decisions made during heat are considered non-consensual.

Post-heat, the Omega is tired and sluggish, consuming large meals to rebalance energy.

**Statistics:** 1 in 30 individuals.]`
	},

	// Species - Secondary Sex Physiology - Subgenders
	{
		keywords: ['species', 'secondary sex physiology', 'subgenders'],
		priority: 4,
		triggers: ["wiki_concept_36"],
	},
	{
		tag: "wiki_concept_36",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Both Alpha and Omega have subgender variants that emerge during maturation:

**Alpha Subgenders:**
- **Dominant Alpha:** A mix of Enigma and standard Alpha traits. More powerful but less likely to find a mate. Overprotective of partners.
- **Submissive Alpha:** Raised in warm, nurturing environments. Devoted caregivers. Unlikely to be unfaithful. Fiercely protective of children regardless of biological parentage.

**Omega Subgenders:**
- **Dominant Omega:** The second-rarest rank. Known as "Legend of The Unsubmitted" -- can resist Alpha and Enigma Commands. Only fully submits to their mate (Dominant Alpha or Enigma). Compliance may depend on mood.

  The rarest expression of the Dominant Omega is known as **the White Moon**: a Dominant Omega of Founding Bloodline or higher whose pacification gift reaches continental-bloodline intensity -- capable of instinctively stilling the aggression of Alphas and Enigmas within proximity without a spoken word. The White Moon title is not a political rank but a religious and biological designation recognized by Moon Speakers. According to the Faith of Fenris, a White Moon Dominant Omega is the species\` emotional sovereign: the Unsubmitted One who holds the pack together when it fractures. The title is conferred by the Living Sagas (or, in their absence, by unanimous Moon Speaker recognition) and is never self-declared.

  **White Moon biology:** The White Moon\'s pacification response is involuntary and ambient -- a passive pheromonal field that reads dominant threat-states and responds with Omega-class calming chemistry at anomalous intensity. They are immune to Alpha Command and Enigma Command alike. Their heat cycle is unaffected by this ability. They cannot be compelled, but they can be overwhelmed by sensory phobia (loud noise, aggressive physical contact) -- the ability does not confer combat capability.

  **White Moon pack role:** In pack theory (LSE_03_Civilization), the White Moon occupies the functional apex of the Omega caste not through authority but through necessity: where an ordinary Dominant Omega soothes the immediate pack, a White Moon stabilizes multi-pack or politically fractured situations. Historically, every documented White Moon has been the mate or recognized spiritual partner of the ruling Enigma -- not by law, but by biological complementarity. The Faith of Fenris calls this pairing "the King and the Moon."

  **Rarity:** One White Moon per bloodline generation at most. Many generations produce none. The title has never been documented in a Common Bloodline individual.

- **Submissive Omega:** Extended heats, more attractive to Alphas, more susceptible to assault. More nurturing and sensitive than standard Omegas. Typically prefers a Dominant Alpha as a consensual partner.]`
	},

	// Species - Procreation Capability
	{
		keywords: ['species', 'procreation capability'],
		priority: 4,
		triggers: ["wiki_concept_37"],
	},
	{
		tag: "wiki_concept_37",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Category | Can Impregnate | Can Be Impregnated |
|---|---|---|
| Enigmas | ✓ All genders with reproductive system | ✗ |
| Male Alphas | ✓ | ✗ |
| Male Betas / Male Deltas | ✓ | Only by Enigma |
| Female Alphas / Male Omegas (Dom/Normal) / Female Deltas | ✓ | ✓ |
| Female Betas / Female Omegas / Submissive Omegas | ✗ | ✓ |]`
	},

	// Species - Life Cycle
	{
		keywords: ['species', 'life cycle'],
		priority: 4,
		triggers: ["wiki_concept_38"],
	},
	{
		tag: "wiki_concept_38",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Every werewolf passes through the following developmental stages. Each stage affects hormones, social role, fertility, behavior, and physical capability.

| Stage | Approximate Age | Key Characteristics |
|---|---|---|
| **Infant** | 0–2 | Helpless. Entirely dependent on parents and pack. Strongest scent gland on crown of head. |
| **Pup** | 2–12 | Learning social bonds, language, and basic pack skills. High emotional intelligence. Forms school packs. Constant scenting by parents required. |
| **Juvenile** | 12–14 | Presentation occurs (~13). Secondary sex emerges. Maturation begins. First heat/rut (cannot be suppressed). |
| **Adolescent** | 14–17 | Maturation continues. Subgender expression stabilizes. Training in pack roles begins. |
| **Young Adult** | 17–22 | The Call of the Pack: choose to stay or disperse. First independent pack roles assigned. Courtship begins. |
| **Adult** | 22–40 | Full maturity. Peak fertility. Active profession and pack role. |
| **Prime** | 40–60 | Peak authority and experience. Often in leadership positions. |
| **Elder** | 60–100+ | Advisor and wisdom-keeper. Reduced fertility. High social respect. |
| **Ancestor** | 100+ (rare) | Living repositories of history and culture. Venerated by the pack. Extremely rare outside Pureblood and Founding Bloodlines. |

> **Note:** Lifespan varies dramatically by Blood Classification. Common Bloodlines may live 80–150 years. Pureblood Houses can reach 200–400 years. Founding Bloodlines may exceed 500 years. Divine Blood individuals have achieved biological immortality (1,000+ years confirmed).]`
	},

	// Species - Genetics
	{
		keywords: ['species', 'genetics'],
		priority: 4,
		triggers: ["wiki_concept_39"],
	},
	{
		tag: "wiki_concept_39",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The werewolf genome is organized in layers of increasing specificity:

\`\`\`
Werewolf Genome
├── Species Genes        — Defines the species (shift capability, regeneration, scent glands, pheromone production)
├── Pack Genes           — Regional/bloodline adaptations (fur color, scent profile, environmental tolerance)
├── Secondary Sex Genes  — Determines Alpha/Delta/Beta/Omega expression at presentation
└── Individual Traits    — Unique characteristics (eye color, height, specific talents, personality predispositions)
\`\`\`

This genetic architecture opens the door to:
- **Mutations:** Rare genetic variations producing unexpected traits.
- **Bloodline Traits:** Specific abilities or physical characteristics associated with particular Houses.
- **Genetic Diseases:** Conditions specific to the species.
- **Hybrids:** Offspring of werewolves with other supernatural species (extremely rare and controversial).]`
	},

	// Species - Demographics
	{
		keywords: ['species', 'demographics'],
		priority: 4,
		triggers: ["wiki_concept_40"],
	},
	{
		tag: "wiki_concept_40",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Metric | Value |
|---|---|
| Alpha birth rate | 1 in 10 |
| Delta birth rate | 1 in 15 |
| Beta birth rate | ~1 in 1,500 |
| Omega birth rate | 1 in 30 |
| Enigma birth rate | ~1 per generation (may skip) |
| Gamma birth rate | 1 in 1,000 |
| Average litter size | 1–3 (up to 12 in classical Omegaverse canon) |
| Fertility (Omega, in heat) | 99% |
| Fertility (Alpha) | 95%, declining ~1% per year of age |
| Omega fertility decline | Significant after age 55 (~1% chance) |]`
	},

	// Species - Reproduction - Heat Cycle (Omega)
	{
		keywords: ['species', 'reproduction', 'heat cycle (omega)'],
		priority: 4,
		triggers: ["wiki_concept_41"],
	},
	{
		tag: "wiki_concept_41",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **Frequency:** Every 3 months.
- **Duration:** 3–10 days.
- **Pre-heat:** Up to 1 week. Scent intensifies. Nest preparation. Coherent decision-making.
- **Active Heat:** Incoherent. Driven by breeding instinct. Decisions made during heat are non-consensual.
- **Post-heat:** Fatigue, increased appetite, energy rebalancing.
- **Asexual Heats:** Can be satisfied through cuddling, scent proximity, and emotional intimacy without sexual intercourse. Asexuals often lack slick production.]`
	},

	// Species - Reproduction - Rut Cycle (Alpha)
	{
		keywords: ['species', 'reproduction', 'rut cycle (alpha)'],
		priority: 4,
		triggers: ["wiki_concept_42"],
	},
	{
		tag: "wiki_concept_42",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **Frequency:** Monthly, or triggered by Omega heat pheromones.
- **Duration:** 3–10 days.
- **Effects:** Intensified pheromones, increased aggression. Generally controllable without societal disruption.
- **Detection:** An Alpha in rut can potentially detect an Omega\`s pregnancy by scenting the neck.]`
	},

	// Species - Reproduction - Sympathy Cycles
	{
		keywords: ['species', 'reproduction', 'sympathy cycles'],
		priority: 4,
		triggers: ["wiki_concept_43"],
	},
	{
		tag: "wiki_concept_43",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: When a packmate enters heat or rut, same-dynamic packmates may experience sympathy cycles. Common around newly-presenting pups or during stress cycles.]`
	},

	// Species - Reproduction - Stress Cycles
	{
		keywords: ['species', 'reproduction', 'stress cycles'],
		priority: 4,
		triggers: ["wiki_concept_44"],
	},
	{
		tag: "wiki_concept_44",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Extreme upheaval or stress can trigger an unexpected heat or rut. This is theorized to be a biological mechanism to rally pack support and comfort.]`
	},

	// Species - Reproduction - Feral State
	{
		keywords: ['species', 'reproduction', 'feral state'],
		priority: 4,
		triggers: ["wiki_concept_45"],
	},
	{
		tag: "wiki_concept_45",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Triggered by life-threatening stress or extreme overwhelm. Instinct takes complete control. Can usually be calmed by a packmate. Packless individuals require specialized care.]`
	},

	// Species - Bonding
	{
		keywords: ['species', 'bonding'],
		priority: 4,
		triggers: ["wiki_concept_46"],
	},
	{
		tag: "wiki_concept_46",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Bonds are links connecting one individual to another, often involving a physical claim on a scent gland that creates a mental/emotional link where both parties can feel each other\'s emotions. Bonds can be shielded (temporarily blocking emotional transmission).]`
	},

	// Species - Bonding - Bond Types
	{
		keywords: ['species', 'bonding', 'bond types'],
		priority: 4,
		triggers: ["wiki_concept_47"],
	},
	{
		tag: "wiki_concept_47",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Type | Location | Duration | Breaking |
|---|---|---|---|
| **Parental** | Back of pup\`s neck | Permanent unless extreme abuse/neglect | Dangerous. Very difficult. |
| **Romantic** | Neck / upper collarbone | Fades after ~3 years without reinforcement | Extremely dangerous. Can cause illness or death. |
| **Platonic** | Wrists | Fades as relationship weakens | Relatively safe. Minor sickness possible. |
| **Sexual** | Inner thighs | 3 days to 1 week | Easy. Natural. |
| **Pack** | No physical claim required | Permanent unless extreme abuse/neglect | Very dangerous. Triggers dangerous mating cycle. |]`
	},

	// Species - Scent Glands
	{
		keywords: ['species', 'scent glands'],
		priority: 4,
		triggers: ["wiki_concept_48"],
	},
	{
		tag: "wiki_concept_48",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Scent glands are skin areas that hold and release pheromone-carrying secretions. Their location, sensitivity, and function vary by secondary sex and age.]`
	},

	// Species - Scent Glands - By Secondary Sex
	{
		keywords: ['species', 'scent glands', 'by secondary sex'],
		priority: 4,
		triggers: ["wiki_concept_49"],
	},
	{
		tag: "wiki_concept_49",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Enigmas & Alphas:** Most extensive coverage. Strongest glands on neck, shoulders, and inner thighs. Also present on fingers and torso (risking accidental scenting). Greatest conscious control over scent output.

**Omegas:** Most sensitive and reactive glands. Billions of nerve connections for instant pheromonal response. Inner thigh and neck glands as sensitive as lips or genitals (depending on cycle stage). Breast and stomach glands develop during pregnancy.

**Deltas & Betas:** Weakest scent glands but hold scents longer. Strongest on neck, inner thighs, and behind ears.

**Pups:** Base-level scent glands that develop at presentation. Strongest gland on crown of head. Cannot hold scent long — requires constant parental scenting.]`
	},

	// Species - Scent Glands - Specific Gland Locations
	{
		keywords: ['species', 'scent glands', 'specific gland locations'],
		priority: 4,
		triggers: ["wiki_concept_50"],
	},
	{
		tag: "wiki_concept_50",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Location | Social Rules | Notes |
|---|---|---|
| **Inner Thighs** | Mates/partners only. Without consent = assault. On pups = criminal. | Can trigger heat/rut if aggressively scented. |
| **Crown of Head** | "Pup\`s Crown." Most sensitive in childhood, fades with age. | |
| **Wrists** | Most respectful scenting location. Friends, first dates. | Rubbing wrist glands = anxiety sign. Pack bites placed here. |
| **Cheeks** | Similar respect level to wrists. Common among pup friends. | Minor scent production. |
| **Neck** | Most sensitive for all dynamics. Mating bite location. | Holds scent longest. Parental bonds on nape. |


*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_02_Behavioral_Ecology.md](LSE_02_Behavioral_Ecology.md) · [LSE_06_History.md](LSE_06_History.md) · [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md)*]`
	},

	// Behavioral Ecology
	{
		keywords: ['behavioral ecology'],
		priority: 4,
		triggers: ["wiki_concept_51"],
	},
	{
		tag: "wiki_concept_51",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > This document covers the psychological, neurobiological, communicative, and ecological behaviors of the werewolf species. It bridges pure biology (PART I) with social civilization (PART III).]`
	},

	// Behavioral Ecology - Psychology
	{
		keywords: ['behavioral ecology', 'psychology'],
		priority: 4,
		triggers: ["wiki_concept_52"],
	},
	{
		tag: "wiki_concept_52",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Each secondary sex exhibits a statistical psychological profile. These are tendencies, not rigid rules. Individual variation is expected and common.]`
	},

	// Behavioral Ecology - Psychology - Alpha — Psychological Profile
	{
		keywords: ['behavioral ecology', 'psychology', 'alpha — psychological profile'],
		priority: 4,
		triggers: ["wiki_concept_53"],
	},
	{
		tag: "wiki_concept_53",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - High competitiveness
- Low avoidance (confronts threats directly)
- Strong territoriality
- Protective instinct (defense of pack and territory)
- Tendency toward decisive, rapid action
- Risk of tunnel vision under stress]`
	},

	// Behavioral Ecology - Psychology - Delta — Psychological Profile
	{
		keywords: ['behavioral ecology', 'psychology', 'delta — psychological profile'],
		priority: 4,
		triggers: ["wiki_concept_54"],
	},
	{
		tag: "wiki_concept_54",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - High cooperation
- Strong problem-solving orientation
- High initiative and proactivity
- Strategic thinking (long-term planning)
- Natural mediator tendencies
- Risk of burnout from overcommitment]`
	},

	// Behavioral Ecology - Psychology - Beta — Psychological Profile
	{
		keywords: ['behavioral ecology', 'psychology', 'beta — psychological profile'],
		priority: 4,
		triggers: ["wiki_concept_55"],
	},
	{
		tag: "wiki_concept_55",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - High stability and emotional regulation
- Strong planning and organizational skills
- Patience and methodical approach
- Social adaptability (can relate to all secondary sexes)
- Dual instinct (nurture + protection) can cause internal conflict
- Risk of substance abuse from overstimulation in mixed-dynamic environments]`
	},

	// Behavioral Ecology - Psychology - Omega — Psychological Profile
	{
		keywords: ['behavioral ecology', 'psychology', 'omega — psychological profile'],
		priority: 4,
		triggers: ["wiki_concept_56"],
	},
	{
		tag: "wiki_concept_56",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - Extremely high empathy
- Strong social resilience
- Natural mediator and de-escalator
- Acute emotional intelligence (even in pups)
- Instinctive caretaking response
- Risk of emotional overload in chronic stress environments]`
	},

	// Behavioral Ecology - Psychology - Enigma — Psychological Profile
	{
		keywords: ['behavioral ecology', 'psychology', 'enigma — psychological profile'],
		priority: 4,
		triggers: ["wiki_concept_57"],
	},
	{
		tag: "wiki_concept_57",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - Supreme confidence and self-possession
- Cannot be psychologically dominated
- Intense charisma (nearly impossible to resist)
- Strategic intelligence
- Risk of isolation due to inability to relate as equals]`
	},

	// Behavioral Ecology - Neurobiology
	{
		keywords: ['behavioral ecology', 'neurobiology'],
		priority: 4,
		triggers: ["wiki_concept_58"],
	},
	{
		tag: "wiki_concept_58",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The werewolf nervous system provides a scientific basis for the species\' distinctive traits. The supernatural "tropes" of the Omegaverse are grounded in neurochemistry, not magic.]`
	},

	// Behavioral Ecology - Neurobiology - Pheromone Pathway
	{
		keywords: ['behavioral ecology', 'neurobiology', 'pheromone pathway'],
		priority: 4,
		triggers: ["wiki_concept_59"],
	},
	{
		tag: "wiki_concept_59",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Pheromones produced by scent glands activate a dedicated neural pathway:

\`\`\`
Scent Gland → Pheromone Release → Vomeronasal Organ (receiver) → Amygdala → Hypothalamus → Limbic System
\`\`\`

This pathway triggers:
- **Emotional responses:** Fear, arousal, trust, aggression.
- **Hormonal cascades:** Cortisol, adrenaline, oxytocin, testosterone.
- **Behavioral changes:** Fight/flight/freeze, bonding, nesting, protective aggression.]`
	},

	// Behavioral Ecology - Neurobiology - The Command — Neurochemical Mechanism
	{
		keywords: ['behavioral ecology', 'neurobiology', 'the command — neurochemical mechanism'],
		priority: 4,
		triggers: ["wiki_concept_60"],
	},
	{
		tag: "wiki_concept_60",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The Command is not magic or mind control. It is a neuro-pheromonal reflex:

1. **Trigger:** An Alpha (or Enigma) produces a concentrated pheromonal burst combined with a vocal command.
2. **Reception:** The target\`s vomeronasal organ detects the pheromonal spike.
3. **Neural Response:** Sudden adrenaline surge → amygdala activation → instinctive immobilization (freeze response) → intense focus on the source.
4. **Effect:** Strong predisposition to comply. The target feels compelled but is not mechanically forced.
5. **Resistance Factors:**
   - Age and experience (older wolves resist more easily)
   - Secondary sex (Deltas resist better than Betas; Dominant Omegas can resist fully)
   - Will and training
   - Familiarity with the commanding individual
   - Enigma Commands are the hardest to resist]`
	},

	// Behavioral Ecology - Neurobiology - Bonding Neuroscience
	{
		keywords: ['behavioral ecology', 'neurobiology', 'bonding neuroscience'],
		priority: 4,
		triggers: ["wiki_concept_61"],
	},
	{
		tag: "wiki_concept_61",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The mating bite creates a permanent neural link by:
1. Injecting pheromone-laden saliva into the scent gland.
2. Triggering the formation of a dedicated neural pathway between the two individuals.
3. Establishing a bidirectional emotional channel (can be temporarily "shielded" with conscious effort).

Bond degradation (fade, scrubbing, or breaking) causes neurological distress proportional to bond strength and duration.]`
	},

	// Behavioral Ecology - Communication
	{
		keywords: ['behavioral ecology', 'communication'],
		priority: 4,
		triggers: ["wiki_concept_62"],
	},
	{
		tag: "wiki_concept_62",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolves possess a complex, multi-layered communication system far beyond human language. In wolf ethology, communication involves the entire body.]`
	},

	// Behavioral Ecology - Communication - Non-Verbal Channels
	{
		keywords: ['behavioral ecology', 'communication', 'non-verbal channels'],
		priority: 4,
		triggers: ["wiki_concept_63"],
	},
	{
		tag: "wiki_concept_63",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Channel | Examples | Function |
|---|---|---|
| **Posture** | Upright (dominance), lowered (submission), stiff (alert), relaxed (trust) | Social status signaling, intent |
| **Tail** | High (confidence), tucked (fear), wagging (excitement), still (focus) | Emotional state |
| **Ears** | Forward (attention), flat (fear/aggression), relaxed (comfort) | Alertness, mood |
| **Eyes** | Direct stare (challenge/dominance), averted (respect/submission), dilated (arousal) | Social hierarchy, emotional state |
| **Scent** | Pheromone composition changes with mood, health, and intent | Continuous passive communication |
| **Physical Contact** | Nuzzling, grooming, scenting, nudging, play-fighting | Bonding, reassurance, hierarchy |]`
	},

	// Behavioral Ecology - Communication - Vocalizations
	{
		keywords: ['behavioral ecology', 'communication', 'vocalizations'],
		priority: 4,
		triggers: ["wiki_concept_64"],
	},
	{
		tag: "wiki_concept_64",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Omega Sounds:**
- **Keening:** Wail-like call for attention, comfort, or needs. "I\`m upset! Comfort me!"
- **Hissing:** Low "s" sound. Warning of extreme danger. "Back off or I attack."
- **Trilling:** High-pitched rolling "r" sound. Non-threatening attention-getting. "Hello! Follow me!"
- **Purring:** Low continuous vibration. Contentment, relaxation, self-soothing, nursing.
- **Chirping:** Quick sharp high-pitched sound. Used toward pups or to express happiness. "Come to Mom!" / "I like this!"
- **Mewling:** High-pitched crying. Hunger, physical pain, emotional pain.

**Alpha/Enigma Sounds:**
- **Rumbling:** Deep continuous sound. Self-soothing, contentment, calming others.
- **Growling:** Low guttural sound. Displeasure, warning, danger. Also disciplinary toward packmates.
- **Crooning:** Soft low hum. Directed at pups or distressed individuals. Soothing and safe.
- **Chuffing:** Puffing sound. Greeting for trusted packmates. "Hello! You are my person!" Only used with individuals the Alpha feels completely comfortable with.

**Betas & Deltas:** Can produce a variable subset of both Alpha and Omega sounds, differing from individual to individual.]`
	},

	// Behavioral Ecology - Pack Ecology - Territory Structure
	{
		keywords: ['behavioral ecology', 'pack ecology', 'territory structure'],
		priority: 4,
		triggers: ["wiki_concept_65"],
	},
	{
		tag: "wiki_concept_65",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Every pack maintains a defined territorial structure:

\`\`\`
Core Den (secure heart — pups, pregnant Omegas, elders)
  └── Residential Area (pack member dwellings)
       └── Training Grounds (combat, hunting, skill development)
            └── Hunting Area (food procurement zones)
                 └── Agricultural Area (cultivated resources, if applicable)
                      └── Border Zone (patrolled perimeter)
                           └── Neutral Territory (shared or unclaimed land)
\`\`\`]`
	},

	// Behavioral Ecology - Pack Ecology - Daily Routine
	{
		keywords: ['behavioral ecology', 'pack ecology', 'daily routine'],
		priority: 4,
		triggers: ["wiki_concept_66"],
	},
	{
		tag: "wiki_concept_66",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Time | Activity |
|---|---|
| Morning | Territory control, border patrols, perimeter inspection |
| Midday | Rest, social bonding, pup education, maintenance |
| Evening | Hunting, foraging, resource gathering |
| Night | Protection, perimeter defense, sentry duty |]`
	},

	// Behavioral Ecology - Pack Ecology - Pack Living Accommodations
	{
		keywords: ['behavioral ecology', 'pack ecology', 'pack living accommodations'],
		priority: 4,
		triggers: ["wiki_concept_67"],
	},
	{
		tag: "wiki_concept_67",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Pack members prefer to live within close proximity (ideally within a mile of each other or in the same residence). Common dwelling types for larger packs:
- **Mansions** — Large shared family dwellings.
- **Neighborhoods** — Clusters of adjacent houses occupied by pack members.
- **Apartment Complexes** — Urban adaptation for city-dwelling packs.
- **Compounds** — Walled communities with multiple structures (common in traditional/rural packs).]`
	},

	// Behavioral Ecology - Alloparenting
	{
		keywords: ['behavioral ecology', 'alloparenting'],
		priority: 4,
		triggers: ["wiki_concept_68"],
	},
	{
		tag: "wiki_concept_68",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Pups are not raised solely by their biological parents. The entire pack participates in _alloparenting_:

- **Alpha:** Protects pups from external threats.
- **Delta:** Teaches pups hunting, tactics, and survival skills.
- **Beta:** Feeds, provisions, and manages pups\` daily needs.
- **Omega:** Nurtures pups emotionally, regulates their stress, provides calming pheromones.
- **Elders:** Pass down pack culture, history, oral tradition, and wisdom.]`
	},

	// Behavioral Ecology - Succession: The Call of the Pack
	{
		keywords: ['behavioral ecology', 'succession: the call of the pack'],
		priority: 4,
		triggers: ["wiki_concept_69"],
	},
	{
		tag: "wiki_concept_69",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Instead of brutal fights for hierarchical dominance, succession follows natural ethological patterns. When a young adult reaches 18–22 years of age, they experience the **Call of the Pack** — an instinctive drive to establish their adult identity:

1. **Stay:** Remain with their birth family and assume an adult Pack Role.
2. **Disperse:** Leave the territory to find a mate, join other dispersers, or found a brand-new pack.

This natural dispersal (Pack Split) prevents inbreeding and naturally resolves resource competition without unnecessary bloodshed. It is the primary mechanism for the expansion of werewolf civilization.]`
	},

	// Behavioral Ecology - Ecological Roles
	{
		keywords: ['behavioral ecology', 'ecological roles'],
		priority: 4,
		triggers: ["wiki_concept_70"],
	},
	{
		tag: "wiki_concept_70",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Every functional pack requires individuals filling essential ecological roles. These are distinct from Pack Roles (authority-based) and Professions (occupation-based):

| Ecological Role | Function | Typical (not required) Secondary Sex |
|---|---|---|
| Breeders | Producing the next generation | Any fertile individual |
| Hunters | Food procurement and territory defense | Alpha, Delta |
| Defenders | Perimeter security and threat response | Alpha, Delta |
| Teachers | Educating pups and juveniles | Delta, Beta, Elder |
| Diplomats | Inter-pack relations and negotiations | Beta, Omega |
| Scouts | Reconnaissance, pathfinding, intelligence | Delta |
| Builders | Construction, maintenance, infrastructure | Beta |
| Caretakers | Nurturing, emotional support, medical aid | Omega, Beta |]`
	},

	// Behavioral Ecology - Nesting & Den Behavior - Omega Nests
	{
		keywords: ['behavioral ecology', 'nesting & den behavior', 'omega nests'],
		priority: 4,
		triggers: ["wiki_concept_71"],
	},
	{
		tag: "wiki_concept_71",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Nests are safe, scent-rich spaces that Omegas construct for comfort, heat management, and childbirth.

**Nest Types:**
- **Comfort Nest:** First type (age 10–12). Personal, similar to parents\` nest. Pillows, blankets, scented clothing.
- **Pre-Heat Nest:** Built in preparation for heat. Minimal clothing, soft materials, temperature-regulating.
- **Pregnancy Nest:** Built at 6–8 weeks and again in the last trimester. Accommodates baby items for scenting. Many Omegas give birth in their nests.
- **Stress Nest:** Built in dark corners or enclosed spaces. Minimal non-mate-scented items. A coping mechanism.

**Nest Aesthetics:**
- **Neat:** Organized. Primarily pillows and blankets.
- **Complex/Messy:** Excess materials, personal belongings, stuffed animals. Appears chaotic.
- **Princess:** Modern style with fairy lights, drapes, and tapestries.
- **Ring:** Built in small enclosed spaces (closets, under staircases).

> **Critical Rule:** Never destroy a nest. The Omega will be deeply distressed and may not leave for 3 days to a full week. A nest is their safety.]`
	},

	// Behavioral Ecology - Nesting & Den Behavior - Alpha Dens
	{
		keywords: ['behavioral ecology', 'nesting & den behavior', 'alpha dens'],
		priority: 4,
		triggers: ["wiki_concept_72"],
	},
	{
		tag: "wiki_concept_72",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Alphas create dens by heavily scent-marking a room, claiming it as their territory. They are highly protective of their dens.

- **Pre-rut:** Every inch must smell like them.
- **Courting:** Presenting a den to an Omega is a significant courting gesture. If the Omega approves, they accept the courtship. Rejection causes shame and redecoration.
- **Mated pair:** The Omega moves their nest into the Alpha\`s den.]`
	},

	// Behavioral Ecology - Nesting & Den Behavior - Beta Spaces
	{
		keywords: ['behavioral ecology', 'nesting & den behavior', 'beta spaces'],
		priority: 4,
		triggers: ["wiki_concept_73"],
	},
	{
		tag: "wiki_concept_73",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Betas create personal "spaces" rather than dens or nests — an office, entertainment corner, hammock, personal swing. These reflect their balanced, adaptable nature.]`
	},

	// Behavioral Ecology - Scent Reference Lists
	{
		keywords: ['behavioral ecology', 'scent reference lists'],
		priority: 4,
		triggers: ["wiki_concept_74"],
	},
	{
		tag: "wiki_concept_74",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Scents are not rigidly tied to secondary sex. The following are common associations:]`
	},

	// Behavioral Ecology - Scent Reference Lists - Alpha/Enigma Scent Palette
	{
		keywords: ['behavioral ecology', 'scent reference lists', 'alpha/enigma scent palette'],
		priority: 4,
		triggers: ["wiki_concept_75"],
	},
	{
		tag: "wiki_concept_75",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Mustard, Peppermint, Whiskey, Dark Chocolate, Stale Wine, Root Beer, Fresh Coffee, Green Tea, Barbecue Sauce, Pepper, Tequila, Red Wine, Vodka, Ginger, Black Tea, Maple Syrup, Coconut, Cedarwood, Seawater, Amber, Forest, Roses, Fresh Blood, Leather, Coal, Mahogany, Charcoal, Gasoline, Gunpowder, Hot Iron, Old Paper.]`
	},

	// Behavioral Ecology - Scent Reference Lists - Delta/Beta Scent Palette
	{
		keywords: ['behavioral ecology', 'scent reference lists', 'delta/beta scent palette'],
		priority: 4,
		triggers: ["wiki_concept_76"],
	},
	{
		tag: "wiki_concept_76",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Mochi, Green Apples, Pumpkin, Rice, Honey, Toffee, Flour, Champagne, Fresh Bread, Almond, Brown Sugar, Grapes, Milk, Hazelnuts, Banana, Orange, Peanut Butter, Silver, Earth, Freshly-Cut Grass, Oil, Clay, Fresh Rain, Lilies, Ice, Sand, Fresh Ink, Soap, Cotton, Fresh Laundry.]`
	},

	// Behavioral Ecology - Scent Reference Lists - Omega Scent Palette
	{
		keywords: ['behavioral ecology', 'scent reference lists', 'omega scent palette'],
		priority: 4,
		triggers: ["wiki_concept_77"],
	},
	{
		tag: "wiki_concept_77",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Burnt Sugar, Lemons, Piña Colada, Bubblegum, Crème Brûlée, White Chocolate, Sugar, Cinnamon, Whipped Cream, Cotton Candy, Strawberries, Peaches, Mint, Caramel, Raspberry Jam, Cherry Blossoms, Lavender, Tulips, Daisies, Lip Gloss.

> **Note:** A person\`s scent also depends on their environment and personal preferences.


*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_01_Species.md](LSE_01_Species.md) · [LSE_03_Civilization.md](LSE_03_Civilization.md)*]`
	},

	// Civilization
	{
		keywords: ['civilization'],
		priority: 4,
		triggers: ["wiki_concept_78"],
	},
	{
		tag: "wiki_concept_78",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > This document describes the social structures, culture, economy, medicine, and education of werewolf civilization. It establishes the Social Hierarchy and the distinction between Bloodline, House, Pack, Family, and Individual.]`
	},

	// Civilization - Social Hierarchy
	{
		keywords: ['civilization', 'social hierarchy'],
		priority: 4,
		triggers: ["wiki_concept_79"],
	},
	{
		tag: "wiki_concept_79",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf society is organized in nested layers, from the species level down to the individual:

\`\`\`
Species (Werewolf)
  └── Bloodline (Genetics — e.g., Bloodmoon)
       └── House (Politics — e.g., House Bloodmoon)
            └── Pack (Social Unit — e.g., Seven Hills Pack)
                 └── Family (Kinship — e.g., the Douglas-Bloodmoon family)
                      └── Individual (e.g., Alyssa Douglas-Bloodmoon)
\`\`\`]`
	},

	// Civilization - Social Hierarchy - Bloodline vs. House vs. Pack
	{
		keywords: ['civilization', 'social hierarchy', 'bloodline vs. house vs. pack'],
		priority: 4,
		triggers: ["wiki_concept_80"],
	},
	{
		tag: "wiki_concept_80",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Level | Determined by | Function | Example |
|---|---|---|---|
| **Bloodline** | Genetics | Shared ancestry and biological heritage | Bloodmoon Bloodline |
| **House** | Politics | Governance structure, territorial claims, alliances | House Bloodmoon |
| **Pack** | Social bonds | Day-to-day family unit, shared living, mutual care | Seven Hills Pack |

These three levels are **independent**. A pack may include members of different bloodlines. A House may govern multiple packs. A bloodline may span multiple Houses across continents.]`
	},

	// Civilization - Culture
	{
		keywords: ['civilization', 'culture'],
		priority: 4,
		triggers: ["wiki_concept_81"],
	},
	{
		tag: "wiki_concept_81",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: No two packs are identical. Local environment, history, and tradition create distinct pack cultures (LSE Principle V: Culture Evolves).]`
	},

	// Civilization - Culture - Cultural Variables
	{
		keywords: ['civilization', 'culture', 'cultural variables'],
		priority: 4,
		triggers: ["wiki_concept_82"],
	},
	{
		tag: "wiki_concept_82",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Every pack develops its own:
- **Rituals:** Naming ceremonies, coming-of-age rites, seasonal celebrations.
- **Greetings & Customs:** Formal scenting protocols, challenge rituals, hospitality rules.
- **Traditions:** Oral histories, ancestral stories, founding myths.
- **Cuisine:** Regional diet reflecting local ecology (hunting traditions, agriculture, foraging).
- **Festivals & Holy Days:** Tied to moon cycles, seasonal changes, or historical events.
- **Dialects & Language:** Variations in both verbal and non-verbal communication.
- **Symbols & Heraldry:** House sigils, pack marks, territorial markers.]`
	},

	// Civilization - Culture - Example: Bloodmoon Culture (Pacific Northwest)
	{
		keywords: ['civilization', 'culture', 'example: bloodmoon culture (pacific northwest)'],
		priority: 4,
		triggers: ["wiki_concept_83"],
	},
	{
		tag: "wiki_concept_83",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: \`\`\`
Bloodmoon Culture
├── Region: Pacific Northwest (dense forests, rivers, coastline)
├── Economy: Fishing, forestry, modern corporate (DCC)
├── Architecture: Longhouse-inspired compounds, modern mansions
├── Governance: Clan Council tradition
├── Religion: Orthodox Faith of Fenris (the Patriarch is a Living Saga)
├── Cuisine: Salmon, game, berries, root vegetables
└── Identity: Deep connection to wilderness, emphasis on self-sufficiency
\`\`\`

Other packs in different environments would develop entirely different cultures.]`
	},

	// Civilization - Types of Packs
	{
		keywords: ['civilization', 'types of packs'],
		priority: 4,
		triggers: ["wiki_concept_84"],
	},
	{
		tag: "wiki_concept_84",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Pack structure has evolved significantly over time:]`
	},

	// Civilization - Types of Packs - Traditional Packs
	{
		keywords: ['civilization', 'types of packs', 'traditional packs'],
		priority: 4,
		triggers: ["wiki_concept_85"],
	},
	{
		tag: "wiki_concept_85",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Your pack is your tribe, your town, your community. Packs have geographical permanence. There is one main pack leader with several subordinate pack leaders (feudalism-like branches). Everyone belongs to a pack; being packless is dangerous. Packs are extremely territorial.]`
	},

	// Civilization - Types of Packs - Contemporary Packs
	{
		keywords: ['civilization', 'types of packs', 'contemporary packs'],
		priority: 4,
		triggers: ["wiki_concept_86"],
	},
	{
		tag: "wiki_concept_86",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Packs remain communities but lose the feudalism element. Being packless carries less stigma. Hereditary pack ties function like cultural heritage rather than active governance. New packs form as found families or communities, often without formal structure.]`
	},

	// Civilization - Types of Packs - Modern Packs
	{
		keywords: ['civilization', 'types of packs', 'modern packs'],
		priority: 4,
		triggers: ["wiki_concept_87"],
	},
	{
		tag: "wiki_concept_87",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Traditional pack language is considered antiquated. Active pack membership is associated with conservatism or elitism. Closed-pack lands are rare and completely sealed. The word "pack" is used informally to describe friend groups or found families.]`
	},

	// Civilization - Economy - Pack Economy
	{
		keywords: ['civilization', 'economy', 'pack economy'],
		priority: 4,
		triggers: ["wiki_concept_88"],
	},
	{
		tag: "wiki_concept_88",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Every functional pack operates a micro-economy:

\`\`\`
Pack Treasury
├── Pack Businesses (revenue-generating enterprises)
├── Pack Taxes (contributions from members)
├── Pack Assets (territory, property, equipment, reserves)
└── Pack Welfare (support for pups, elders, injured members)
\`\`\`]`
	},

	// Civilization - Economy - Inter-Pack Economy
	{
		keywords: ['civilization', 'economy', 'inter-pack economy'],
		priority: 4,
		triggers: ["wiki_concept_89"],
	},
	{
		tag: "wiki_concept_89",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Houses and Confederations operate larger economies spanning multiple packs, involving:
- Trade agreements
- Resource sharing treaties
- Territorial leasing
- Corporate ventures (modern era)]`
	},

	// Civilization - Medicine
	{
		keywords: ['civilization', 'medicine'],
		priority: 4,
		triggers: ["wiki_concept_90"],
	},
	{
		tag: "wiki_concept_90",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf medicine addresses species-specific biological needs:

| Treatment | Function |
|---|---|
| **Heat Medicine** | Managing Omega heat cycles — reducing intensity, managing symptoms |
| **Rut Suppressants** | Controlling Alpha rut cycles |
| **Pheromone Blockers** | Scent patches and concealers (light and full dose) |
| **Bond Therapy** | Treating bond degradation, scrubbing trauma, and broken marks |
| **Regeneration Medicine** | Accelerating the species\` natural healing factor |
| **Surgical Intervention** | Species-specific procedures (scent gland surgery, reproductive medicine) |
| **Omega Kibble** | Strongly medicated supplement for extreme Omega distress (max once/week) |
| **M.I.H./M.I.R.** | Medically Induced Heat/Rut for Betas assisting mates |
| **Fertility Treatment** | Managing the species\' unique reproductive biology |]`
	},

	// Civilization - Medicine - Suppressant Forms
	{
		keywords: ['civilization', 'medicine', 'suppressant forms'],
		priority: 4,
		triggers: ["wiki_concept_91"],
	},
	{
		tag: "wiki_concept_91",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Form | Use Case | Limitations |
|---|---|---|
| **Tablets** | Standard daily management | Addiction risk. Potential fertility damage with overuse. |
| **Liquid Injection** | Emergency use (hospitals). Very fast-acting. | Monitored administration only. |
| **Incense** | Group management (dormitories, harems). Slow-acting, long-lasting. | Unpredictable timing of next heat. Not all Omegas respond equally. |]`
	},

	// Civilization - Medicine - Pain Scale for Omegas (Most to Least Painful)
	{
		keywords: ['civilization', 'medicine', 'pain scale for omegas (most to least painful)'],
		priority: 4,
		triggers: ["wiki_concept_92"],
	},
	{
		tag: "wiki_concept_92",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: 1. **Red Heat (Blood Estrus):** Mate neglects Omega during heat. Vaginal bleeding, blood tears. Excruciating.
2. **Scrubbing:** Removing a mating mark from the scent gland. Deeply traumatic.
3. **Broken Mark:** Mate dies. Mark fades. Can trigger Red Heat or miscarriage.
4. **Miscarriage:** Body pretends pregnancy continues (phantom pregnancy, lactation). Heats become more painful.
5. **Periods:** Variable severity (female Omegas).]`
	},

	// Civilization - Education
	{
		keywords: ['civilization', 'education'],
		priority: 4,
		triggers: ["wiki_concept_93"],
	},
	{
		tag: "wiki_concept_93",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf education follows the Life Cycle stages:

| Stage | Education Focus |
|---|---|
| **Pup** | Basic social bonds, pack rules, language, scenting etiquette |
| **Juvenile** | Presentation preparation, first pack duties, secondary sex education |
| **Adolescent** | Specialized training (hunting, crafts, academics), subgender management |
| **Young Adult** | Advanced profession training, courtship education, The Call preparation |
| **Adult** | Continuing profession development, mentorship of younger members |
| **Elder** | Wisdom-keeping, cultural transmission, advisory roles |]`
	},

	// Civilization - Adoption
	{
		keywords: ['civilization', 'adoption'],
		priority: 4,
		triggers: ["wiki_concept_94"],
	},
	{
		tag: "wiki_concept_94",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Adoption in werewolf society is complex due to the bonding system. Three types exist:]`
	},

	// Civilization - Adoption - Bonding Adoption
	{
		keywords: ['civilization', 'adoption', 'bonding adoption'],
		priority: 4,
		triggers: ["wiki_concept_95"],
	},
	{
		tag: "wiki_concept_95",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The minor breaks their existing familial bond and is adopted by a new pack through demonstrated reciprocal pack bonds. Requires:
1. Reciprocated pack bond with at least two non-minor pack members.
2. Two-week accommodation check-in by state official (home inspection, proof of settlement, witnessed interaction).
3. Unanimous pack agreement.]`
	},

	// Civilization - Adoption - State Adoption
	{
		keywords: ['civilization', 'adoption', 'state adoption'],
		priority: 4,
		triggers: ["wiki_concept_96"],
	},
	{
		tag: "wiki_concept_96",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The minor enters foster care and is adopted through formal legal process. Less demanding than bonding adoption:
- No immediate bond required.
- Two-month adjustment period.
- Legal paperwork emphasis over bond demonstration.]`
	},

	// Civilization - Adoption - Secondary Adoption
	{
		keywords: ['civilization', 'adoption', 'secondary adoption'],
		priority: 4,
		triggers: ["wiki_concept_97"],
	},
	{
		tag: "wiki_concept_97",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: A second chance after failed bonding adoption. More rigorous:
- Surprise check-ins every three weeks for six months.
- Community involvement proof (age 15+).
- Extended witnessed interaction demonstrating consistent pack belonging.]`
	},

	// Civilization - Parental Names
	{
		keywords: ['civilization', 'parental names'],
		priority: 4,
		triggers: ["wiki_concept_98"],
	},
	{
		tag: "wiki_concept_98",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Parental names can follow primary gender or secondary gender conventions:

| Convention | Father | Mother | Formal |
|---|---|---|---|
| **Primary Gender** | Dad | Mom | Father / Mother |
| **Secondary Gender** | Dad (Alpha/Enigma/Male Beta/Delta) | Mom (Omega/Female Beta/Delta) | Sire / Dam |]`
	},

	// Civilization - Weddings
	{
		keywords: ['civilization', 'weddings'],
		priority: 4,
		triggers: ["wiki_concept_99"],
	},
	{
		tag: "wiki_concept_99",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Wedding attire follows secondary gender color traditions:
- **Alphas & Enigmas:** Red (luck, stability, passion)
- **Deltas & Betas:** Blue (wealth, loyalty, honor)
- **Omegas:** Yellow (pride, happiness, longevity)


*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_01_Species.md](LSE_01_Species.md) · [LSE_04_Governance.md](LSE_04_Governance.md) · [LSE_05_Religion.md](LSE_05_Religion.md)*]`
	},

	// Governance
	{
		keywords: ['governance'],
		priority: 4,
		triggers: ["wiki_concept_100"],
	},
	{
		tag: "wiki_concept_100",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > This document describes the political structures, authority systems, and legal frameworks of werewolf civilization — from the internal governance of a single pack to inter-House diplomacy.]`
	},

	// Governance - Pack Authority Structure
	{
		keywords: ['governance', 'pack authority structure'],
		priority: 4,
		triggers: ["wiki_concept_101"],
	},
	{
		tag: "wiki_concept_101",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Pack Authority defines the chain of command within a single pack. It is earned, assigned, and maintained through trust and competence — not through biological secondary sex (LSE Principle III).

\`\`\`
Pack Leader
  └── Leader\`s Mate / Pack Mom
       └── Right Hand(s) (strategic advisors, peacekeepers)
            └── Left Hand(s) (physical protection, enforcement)
                 └── Caretaker(s) (domestic management, pup care)
                      └── Pup(s) (minors under protection)
\`\`\`]`
	},

	// Governance - Pack Authority Structure - Pack Leader
	{
		keywords: ['governance', 'pack authority structure', 'pack leader'],
		priority: 4,
		triggers: ["wiki_concept_102"],
	},
	{
		tag: "wiki_concept_102",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: At the top of the pack\'s chain of command. Responsible for overall safety, well-being, and final decisions. **Does not need to be an Alpha** — can be any secondary sex.]`
	},

	// Governance - Pack Authority Structure - Leader's Mate / Pack Mom
	{
		keywords: ['governance', 'pack authority structure', "leader's mate / pack mom"],
		priority: 4,
		triggers: ["wiki_concept_103"],
	},
	{
		tag: "wiki_concept_103",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The mother figure for the entire pack. Provides guidance, emotional comfort, and protection. Heavily involved in daily operations. Extremely valuable in larger packs.]`
	},

	// Governance - Pack Authority Structure - Right Hand(s)
	{
		keywords: ['governance', 'pack authority structure', 'right hand(s)'],
		priority: 4,
		triggers: ["wiki_concept_104"],
	},
	{
		tag: "wiki_concept_104",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The leader\'s most trusted advisor(s). Takes over if the leader is incapacitated. Assists in strategic decisions (finances, education, logistics). May include **Peacekeepers** — specialists who settle internal arguments before they reach the Pack Leader.]`
	},

	// Governance - Pack Authority Structure - Left Hand(s)
	{
		keywords: ['governance', 'pack authority structure', 'left hand(s)'],
		priority: 4,
		triggers: ["wiki_concept_105"],
	},
	{
		tag: "wiki_concept_105",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Responsible for physical protection and enforcement. Notoriously effective in combat. Uncommon in average packs but prevalent in packs involved in security, military, or criminal operations.]`
	},

	// Governance - Pack Authority Structure - Caretaker(s)
	{
		keywords: ['governance', 'pack authority structure', 'caretaker(s)'],
		priority: 4,
		triggers: ["wiki_concept_106"],
	},
	{
		tag: "wiki_concept_106",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Work under the Pack Mom. Usually stay-at-home members. Handle meals, cleaning, socialization, pup management. Young adults aging out of "pup" status often serve as caretakers to learn pack management.]`
	},

	// Governance - Pack Authority Structure - Pup(s)
	{
		keywords: ['governance', 'pack authority structure', 'pup(s)'],
		priority: 4,
		triggers: ["wiki_concept_107"],
	},
	{
		tag: "wiki_concept_107",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Pack members under 17–21 (varies by pack). At the bottom of the authority structure. Protected and nurtured.]`
	},

	// Governance - Social Status Hierarchy
	{
		keywords: ['governance', 'social status hierarchy'],
		priority: 4,
		triggers: ["wiki_concept_108"],
	},
	{
		tag: "wiki_concept_108",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Social Status defines political standing within a Noble House. It is separate from Pack Authority and may be inherited or earned.

\`\`\`
House Head (Patriarch/Matriarch)
  └── Lord (senior family branch leaders)
       └── Knight (sworn warriors, officers, honored servants)
            └── Citizen (acknowledged member of the House)
\`\`\`]`
	},

	// Governance - Social Status Hierarchy - House Head
	{
		keywords: ['governance', 'social status hierarchy', 'house head'],
		priority: 4,
		triggers: ["wiki_concept_109"],
	},
	{
		tag: "wiki_concept_109",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The supreme authority of a Noble House. Governs multiple packs under the House banner. Typically the eldest or most qualified member of the founding family. In some Houses, this position is hereditary; in others, it is contested through council vote.]`
	},

	// Governance - Social Status Hierarchy - Lord
	{
		keywords: ['governance', 'social status hierarchy', 'lord'],
		priority: 4,
		triggers: ["wiki_concept_110"],
	},
	{
		tag: "wiki_concept_110",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Leaders of major family branches within the House. Govern specific territories or functional domains (military, commerce, diplomacy). Answer to the House Head.]`
	},

	// Governance - Social Status Hierarchy - Knight
	{
		keywords: ['governance', 'social status hierarchy', 'knight'],
		priority: 4,
		triggers: ["wiki_concept_111"],
	},
	{
		tag: "wiki_concept_111",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Sworn warriors, officers, or individuals who have earned formal recognition from the House. May hold specific duties (border defense, diplomatic escort, judicial enforcement). Title may be hereditary or awarded.]`
	},

	// Governance - Social Status Hierarchy - Citizen
	{
		keywords: ['governance', 'social status hierarchy', 'citizen'],
		priority: 4,
		triggers: ["wiki_concept_112"],
	},
	{
		tag: "wiki_concept_112",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Any acknowledged member of the House who is not an officer, lord, or sworn knight. Includes common bloodlines under House protection.]`
	},

	// Governance - House Government
	{
		keywords: ['governance', 'house government'],
		priority: 4,
		triggers: ["wiki_concept_113"],
	},
	{
		tag: "wiki_concept_113",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: A Noble House governs multiple packs across a territory:

\`\`\`
House Head
├── House Council (Lords + senior advisors)
├── Military Command (Left Hands, Knights, Security)
├── Economic Administration (Treasury, Businesses, Trade)
├── Cultural Authority (Moon Speakers, Keepers, Elders)
└── Pack Leaders (individual pack governance)
\`\`\`]`
	},

	// Governance - House Government - House Council
	{
		keywords: ['governance', 'house government', 'house council'],
		priority: 4,
		triggers: ["wiki_concept_114"],
	},
	{
		tag: "wiki_concept_114",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Composed of Lords, senior Elders, and trusted advisors. Advises the House Head on major decisions. In some Houses, the Council can overrule the Head on specific matters (treaties, declarations of war).]`
	},

	// Governance - Continental Council
	{
		keywords: ['governance', 'continental council'],
		priority: 4,
		triggers: ["wiki_concept_115"],
	},
	{
		tag: "wiki_concept_115",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The highest level of werewolf governance. A diplomatic body representing multiple Houses across a continent or major region.]`
	},

	// Governance - Continental Council - Structure
	{
		keywords: ['governance', 'continental council', 'structure'],
		priority: 4,
		triggers: ["wiki_concept_116"],
	},
	{
		tag: "wiki_concept_116",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: \`\`\`
Continental Council
├── House Representatives (one per House)
├── Elder Observers (non-voting wisdom-keepers)
├── Moon Speaker Delegation (religious advisors)
└── Independent Pack Representatives (unaffiliated packs)
\`\`\`]`
	},

	// Governance - Continental Council - Functions
	{
		keywords: ['governance', 'continental council', 'functions'],
		priority: 4,
		triggers: ["wiki_concept_117"],
	},
	{
		tag: "wiki_concept_117",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - Arbitration of inter-House disputes
- Continental defense coordination
- Trade and territory agreements
- Species-wide policy (secrecy enforcement, human relations)
- Recognition of new Houses and territorial claims]`
	},

	// Governance - Treaties & Alliances
	{
		keywords: ['governance', 'treaties & alliances'],
		priority: 4,
		triggers: ["wiki_concept_118"],
	},
	{
		tag: "wiki_concept_118",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Inter-pack and inter-House relationships are formalized through treaties:

| Treaty Type | Function |
|---|---|
| **Alliance** | Mutual defense and cooperation between Houses |
| **Trade Agreement** | Resource and economic exchange |
| **Territorial Accord** | Formal recognition of borders and neutral zones |
| **Marriage Alliance** | Dynastic unions between Houses (political bonding) |
| **Non-Aggression Pact** | Agreement not to engage in hostile action |
| **Protectorate** | A powerful House extends protection to a smaller pack or House |]`
	},

	// Governance - Laws & Jurisdiction - Pack Law (Internal)
	{
		keywords: ['governance', 'laws & jurisdiction', 'pack law (internal)'],
		priority: 4,
		triggers: ["wiki_concept_119"],
	},
	{
		tag: "wiki_concept_119",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Enforced by the Pack Leader and Right/Left Hands. Covers:
- Internal disputes between pack members
- Nesting and den violations
- Assault and consent violations (including scenting crimes)
- Pup welfare
- Heat/rut-related offenses]`
	},

	// Governance - Laws & Jurisdiction - House Law (Regional)
	{
		keywords: ['governance', 'laws & jurisdiction', 'house law (regional)'],
		priority: 4,
		triggers: ["wiki_concept_120"],
	},
	{
		tag: "wiki_concept_120",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Enforced by the House Head and House Council. Covers:
- Inter-pack disputes within the House
- Territorial violations
- Economic crimes (theft of House assets, tax evasion)
- Treason against the House]`
	},

	// Governance - Laws & Jurisdiction - Continental Law (Species-wide)
	{
		keywords: ['governance', 'laws & jurisdiction', 'continental law (species-wide)'],
		priority: 4,
		triggers: ["wiki_concept_121"],
	},
	{
		tag: "wiki_concept_121",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Enforced by the Continental Council. Covers:
- Inter-House warfare and violations
- Species-wide secrecy from humans
- Crimes against the species (genocide, forced modification)
- Recognition and dissolution of Houses]`
	},

	// Governance - Laws & Jurisdiction - Crimes & Punishments
	{
		keywords: ['governance', 'laws & jurisdiction', 'crimes & punishments'],
		priority: 4,
		triggers: ["wiki_concept_122"],
	},
	{
		tag: "wiki_concept_122",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Crime | Jurisdiction | Typical Punishment |
|---|---|---|
| Non-consensual scenting (minor) | Pack | Public reprimand, temporary exile |
| Non-consensual scenting (pup inner thighs) | Pack/House | Classified as rape. Severe punishment. |
| Nest/Den destruction | Pack | Severe social censure, mandatory restitution |
| Pack betrayal | Pack/House | Exile (breaking of all pack bonds) |
| Non-consensual mating during heat | Pack/House | Criminal prosecution. Exile or execution. |
| Treason against House | House | Exile, stripping of status, execution |
| Violation of secrecy | Continental | Continental Council judgment |]`
	},

	// Governance - Laws & Jurisdiction - Exile
	{
		keywords: ['governance', 'laws & jurisdiction', 'exile'],
		priority: 4,
		triggers: ["wiki_concept_123"],
	},
	{
		tag: "wiki_concept_123",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Exile is the ultimate social punishment. The exiled individual has all pack bonds forcibly broken (causing severe physical and psychological trauma). They become a Rogue — packless, unprotected, and distrusted by all organized packs.]`
	},

	// Governance - Laws & Jurisdiction - Adoption & Transfer
	{
		keywords: ['governance', 'laws & jurisdiction', 'adoption & transfer'],
		priority: 4,
		triggers: ["wiki_concept_124"],
	},
	{
		tag: "wiki_concept_124",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **Adoption:** See [LSE_03_Civilization.md](LSE_03_Civilization.md) for the three adoption types.
- **Transfer:** A pack member may petition to transfer to a different pack within the same House. Requires approval from both Pack Leaders and the House Council. Transfer between Houses requires Continental Council acknowledgment.


*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_03_Civilization.md](LSE_03_Civilization.md) · [LSE_05_Religion.md](LSE_05_Religion.md) · [LSE_06_History.md](LSE_06_History.md)*]`
	},

	// Religion
	{
		keywords: ['religion'],
		priority: 4,
		triggers: ["wiki_concept_125"],
	},
	{
		tag: "wiki_concept_125",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > This document describes the Faith of Fenris and its institutional structures. All content in this module represents **Religious Canon** (see LSE_00_Foundations.md, Three Levels of Truth). Historical facts about the figures referenced here are in LSE_06_History.md and LSE_07_Foundational_Figures.md.]`
	},

	// Religion - The Faith of Fenris - Dogma
	{
		keywords: ['religion', 'the faith of fenris', 'dogma'],
		priority: 4,
		triggers: ["wiki_concept_126"],
	},
	{
		tag: "wiki_concept_126",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: For werewolves, **Fenris (Fenrir)** is not a monster.

He is the **First Wolf**, the Father of the Species, and a primordial deity — coeval with the Æsir or perhaps even older. He is the god of:

- Family
- The Pack
- The Hunt
- Survival
- Freedom
- The Moon
- Instinct
- Sacrifice

Humans remember Fenris as a monster because they wrote history from the perspective of the Æsir. The werewolves tell the story from the perspective of their own people.

> **Critical distinction:** Fenris is **not** the son of Loki. That is the human version, designed to delegitimize the First Wolf after the Great Betrayal. In werewolf theology, Fenris is an independent, primordial being.]`
	},

	// Religion - The Faith of Fenris - The Great Betrayal
	{
		keywords: ['religion', 'the faith of fenris', 'the great betrayal'],
		priority: 4,
		triggers: ["wiki_concept_127"],
	},
	{
		tag: "wiki_concept_127",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The werewolf account of the binding of Fenris:

Fenris was the most faithful warrior of the gods. But as his people — the werewolves — grew in number and strength, the Æsir began to fear them.

To prevent the werewolves from becoming too powerful:
- They **chained** Fenris.
- They **persecuted** his children.
- They **erased** the true history, replacing it with tales of a monstrous wolf.

From this betrayal arose the werewolves\` ancestral hatred of tyranny and their absolute devotion to the value of **freedom**.]`
	},

	// Religion - The Faith of Fenris - Ragnarök — The Liberation
	{
		keywords: ['religion', 'the faith of fenris', 'ragnarök — the liberation'],
		priority: 4,
		triggers: ["wiki_concept_128"],
	},
	{
		tag: "wiki_concept_128",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: For humans: *Fenris devours Odin. The world ends.*

For werewolves: *Fenris breaks his chains and restores freedom to his children.*

Ragnarök is not the apocalypse. It is the **Liberation of the First Wolf** — the prophesied day when the species will no longer need to hide, when the Great Betrayal will be undone, and when the Children of Fenris will walk freely again.]`
	},

	// Religion - The Pantheon
	{
		keywords: ['religion', 'the pantheon'],
		priority: 4,
		triggers: ["wiki_concept_129"],
	},
	{
		tag: "wiki_concept_129",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The gods of the Norse tradition are reinterpreted through the werewolf perspective. The Æsir are not "evil" — they simply belong to a different tradition.

| Deity | Werewolf Interpretation |
|---|---|
| **Fenris** | The First Wolf. Father of the Species. Creator (Religious Canon). Primordial deity. |
| **Odin** | The Betrayer. The one who chained Fenris out of fear. Respected for his wisdom but distrusted for his treachery. |
| **Tyr** | The Oathkeeper. The only Æsir who kept his word to Fenris. Respected for the sacrifice of his hand. Patron of honor and sworn oaths. |
| **Freya** | Goddess of fertility, motherhood, and the Moon. Protector of Omegas and pregnant wolves. |
| **Skadi** | Patroness of hunters and mountains. Revered by scouts, rangers, and wilderness packs. |
| **Thor** | Champion of humans and the Æsir. Not necessarily malevolent — simply the defender of a different people. |
| **Hel** | Keeper of the Ancestors. Guardian of the dead. Honored during funerals and Ancestor rites. |]`
	},

	// Religion - The Nine Precepts of Fenris
	{
		keywords: ['religion', 'the nine precepts of fenris'],
		priority: 4,
		triggers: ["wiki_concept_130"],
	},
	{
		tag: "wiki_concept_130",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The core moral code of the Faith. Note that nearly every precept derives from real wolf behavior:

1. **Protect the Pack.**
2. **Defend the Pups.**
3. **Honor the Ancestors.**
4. **Do not hunt without purpose.**
5. **Keep your word.**
6. **Never abandon a companion.**
7. **Respect the territory of others.**
8. **Face the enemy without fear.**
9. **Live free.**]`
	},

	// Religion - The Moon
	{
		keywords: ['religion', 'the moon'],
		priority: 4,
		triggers: ["wiki_concept_131"],
	},
	{
		tag: "wiki_concept_131",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The Moon is not a goddess in the Faith of Fenris. It is the **Symbol of the Pact** — the bond between Fenris and his children. The Moon witnesses all oaths, hunts, and rites.]`
	},

	// Religion - The Moon - Moon Phases & Meaning
	{
		keywords: ['religion', 'the moon', 'moon phases & meaning'],
		priority: 4,
		triggers: ["wiki_concept_132"],
	},
	{
		tag: "wiki_concept_132",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Phase | Symbol | Meaning |
|---|---|---|
| 🌑 New Moon | Silence | Reflection, mourning, rest. No hunts. |
| 🌓 First Quarter | Growth | New beginnings, pup naming, planting. |
| 🌕 Full Moon | The Hunt | Peak activity. Sacred hunts, major ceremonies, bonding rites. |
| 🌘 Waning Moon | Memory | Remembrance of ancestors, oral history, meditation. |

The religious calendar follows the **lunar cycle** rather than the solar calendar.]`
	},

	// Religion - The Moon - The White Moon — Living Symbol of the Pact
	{
		keywords: ['religion', 'the moon', 'the white moon — living symbol of the pact'],
		priority: 4,
		triggers: ["wiki_concept_133"],
	},
	{
		tag: "wiki_concept_133",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: In theological tradition, the Moon witnesses. But the Moon does not speak.

The **White Moon** (see LSE_01_Species.md — Dominant Omega subgenders) is the species\` living symbol of this silent witness made active. Where the Moon in the sky is the sign of the Pact, the White Moon Dominant Omega is the Pact embodied in flesh: immune to the Commands of wolves, gifted with the instinct to hold the pack together when it breaks, and recognizable by Moon Speakers through scent analysis before the individual themselves may be aware of the designation.

In the Faith of Fenris, the title carries two theological claims:

1. **The Moon\'s Chosen:** The White Moon is the individual through whom Fenris\' original calming will persists in the living species. Not a prophet. Not a war-leader. The one who holds.
2. **The King and the Moon:** The pairing of a ruling Enigma (The King) with a White Moon Dominant Omega (The Moon) is considered the ideal complement of the species\' dual nature — absolute authority held by the consent of the one who cannot be commanded. In the Faith, this pairing is not a political marriage but a spiritual completion: the wolf who leads and the wolf who refuses to be led, choosing to stand beside each other.

The title is conferred by the Living Sagas or by unanimous Moon Speaker recognition. It is never self-declared. A Moon Speaker who identifies a potential White Moon is bound by oath to report the finding to the First Fang before any other authority.]`
	},

	// Religion - The Cult of the Living Sagas
	{
		keywords: ['religion', 'the cult of the living sagas'],
		priority: 4,
		triggers: ["wiki_concept_134"],
	},
	{
		tag: "wiki_concept_134",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The Last Three Firstborn — Wulfnic, Ut, and Zefir — are alive. Their historical existence is documented in [LSE_06_History.md](LSE_06_History.md). Their biographies are in [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md).

In the Faith of Fenris, they are revered as **Living Sagas** — saints who walked with the First Wolf and still walk among his children. Their authority carries religious weight:

- Disobeying a Living Saga is not merely political insubordination — it is, to the faithful, a rejection of Fenris\` chosen instruments.
- Their testimony about the past is considered second only to scripture, because **they were there**.
- Moon Speakers often consult them as the closest living link to the will of Fenris.

> **LSE Design Note:** The Living Sagas *exist* (History). They are *revered* (Religion). These are two separate truths. An atheist werewolf might acknowledge Wulfnic\'s political authority while rejecting his divine mandate.]`
	},

	// Religion - Religious Institutions
	{
		keywords: ['religion', 'religious institutions'],
		priority: 4,
		triggers: ["wiki_concept_135"],
	},
	{
		tag: "wiki_concept_135",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The Faith of Fenris is **not** a centralized religion like Catholicism. It is a decentralized network of communities guided by elders and tradition-keepers.]`
	},

	// Religion - Religious Institutions - Hierarchy
	{
		keywords: ['religion', 'religious institutions', 'hierarchy'],
		priority: 4,
		triggers: ["wiki_concept_136"],
	},
	{
		tag: "wiki_concept_136",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: \`\`\`
High Fang (Supreme spiritual authority — extremely rare, often unfilled)
  └── Moon Speakers (Priests / theologians / ceremony leaders)
       └── Keepers (Custodians of relics, sacred sites, and oral tradition)
            └── Pack Elders (Local spiritual guides within each pack)
                 └── The Faithful (All believing werewolves)
\`\`\`]`
	},

	// Religion - Religious Institutions - High Fang
	{
		keywords: ['religion', 'religious institutions', 'high fang'],
		priority: 4,
		triggers: ["wiki_concept_137"],
	},
	{
		tag: "wiki_concept_137",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The supreme spiritual authority of the Faith. This position is often unfilled for decades or centuries, as it requires recognition by a supermajority of Moon Speakers across multiple continents. The High Fang speaks for the Faith on species-wide matters.]`
	},

	// Religion - Religious Institutions - Moon Speakers
	{
		keywords: ['religion', 'religious institutions', 'moon speakers'],
		priority: 4,
		triggers: ["wiki_concept_138"],
	},
	{
		tag: "wiki_concept_138",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Priests and theologians. They lead ceremonies, interpret the Precepts, maintain the lunar calendar, and serve as spiritual advisors to Pack Leaders and House Heads. A Moon Speaker is trained through apprenticeship, not ordination.]`
	},

	// Religion - Religious Institutions - Keepers
	{
		keywords: ['religion', 'religious institutions', 'keepers'],
		priority: 4,
		triggers: ["wiki_concept_139"],
	},
	{
		tag: "wiki_concept_139",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Custodians of physical relics, sacred texts (The Saga of Fenris / The Book of Fangs), sacred sites, and oral tradition. Many Keepers are also scholars and historians.]`
	},

	// Religion - Religious Institutions - Pack Elders
	{
		keywords: ['religion', 'religious institutions', 'pack elders'],
		priority: 4,
		triggers: ["wiki_concept_140"],
	},
	{
		tag: "wiki_concept_140",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Local spiritual guides within individual packs. They lead daily prayers, seasonal rites, and funeral ceremonies. Any respected Elder can serve this role.]`
	},

	// Religion - Sacred Sites
	{
		keywords: ['religion', 'sacred sites'],
		priority: 4,
		triggers: ["wiki_concept_141"],
	},
	{
		tag: "wiki_concept_141",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Site Type | Description |
|---|---|
| **First Den** | The legendary location where the first pack was established. Its location is debated among scholars and theologians. |
| **Moon Wells** | Natural springs or pools where the moonlight is believed to be particularly strong. Used for meditation, healing, and bonding rites. |
| **Sacred Groves** | Ancient forests consecrated to Fenris. Hunting is forbidden within sacred groves. |
| **Ancient Forges** | Sites associated with Ut (the Second Fang) and the creation of the first weapons. Revered by artisans and warriors. |]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris'],
		priority: 4,
		triggers: ["wiki_concept_142"],
	},
	{
		tag: "wiki_concept_142",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The Faith of Fenris does not follow fixed solar dates. All sacred observances are activated by **lunar phase triggers** -- the Moon being the Symbol of the Pact, not a decorative backdrop. A ceremony tied to the Full Moon occurs on the night the Moon is full in the local sky, regardless of the calendar date. Regional packs may observe additional local holy days; the entries below are the species-wide recognized canon.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - January -- La Rinascita (The Rebirth)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'january -- la rinascita (the rebirth)'],
		priority: 4,
		triggers: ["wiki_concept_143"],
	},
	{
		tag: "wiki_concept_143",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** First Full Moon of the year -- **First Howl (Il Primo Ululato)**

**Significance:** Celebration of the pack\`s survival through the winter\'s worst. Under this light, wolves renew the hierarchical bonds that carried them through the cold. The Precept *"Protect the Pack"* is formally reaffirmed. New members are folded in.

**Rite:** Pack Adoption ceremonies. Newly adopted individuals receive the pack bites, are scented by all members in sequence (eldest to youngest), and are formally named aloud by the Pack Leader under moonlight. This is the preferred month for integrating those who underwent The Call and chose to join a new pack rather than disperse.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - February -- La Vita (Life)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'february -- la vita (life)'],
		priority: 4,
		triggers: ["wiki_concept_144"],
	},
	{
		tag: "wiki_concept_144",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** First Quarter Moon (Growth) -- **La Benedizione di Freya (Freya\'s Blessing)**

**Significance:** Consecrated to Freya, protector of Omegas and mothers. The returning light begins to defeat winter. A month of tenderness, fertility awareness, and maternal honor.

**Rite:** Naming ceremonies (the Naming rite) for pups born during the cold months. The Pack Leader or Elder names the pup under the growing light, establishing parental bonds before the witnesses of the pack. Moon Speakers invoke Freya as witness alongside Fenris.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - March -- Il Giuramento (The Oath)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'march -- il giuramento (the oath)'],
		priority: 4,
		triggers: ["wiki_concept_145"],
	},
	{
		tag: "wiki_concept_145",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** Full Moon -- **Il Rito di Tyr (Luna del Giuramento -- The Oath Moon)**

**Significance:** Dedicated to Tyr, the Oathkeeper -- the only Aesir who kept his word to Fenris and paid with his hand. The Oath Moon is the month of promises made and social transitions formalized. The most significant Coming of Age ceremonies take place under this light.

**Rite (dual):**
- *Coming of Age:* Juveniles (~13 years) whose secondary sex has presented undergo formal public acknowledgment. New responsibilities, pack role assignments, and social status begin here.
- *The Call:* Young adults (17-22 years) formally declare whether they swear permanent allegiance to the local pack or initiate Dispersal. The blessing is given by the First Fang or a designated Elder. A wolf who disperses under the Oath Moon is considered to have left with Fenris\` witness -- neither shame nor debt follows them.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - April -- La Memoria (Memory)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'april -- la memoria (memory)'],
		priority: 4,
		triggers: ["wiki_concept_146"],
	},
	{
		tag: "wiki_concept_146",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** Waning Moon (Memory) -- **Il Canto delle Radici (The Song of the Roots)**

**Significance:** A month of reflection and listening. The waning light is the phase of ancestors, oral history, and the deep past. Not a celebration -- a discipline.

**Rite:** Moon Speakers and Keepers gather the young (adolescents and young adults) for formal oral transmission sessions. The dogma of the Cult of the Living Sagas is retold. The Last Three Firstborn -- Wulfnic, Ut, and Zefir -- are honored as Living Legends. Their historical journeys, including the crossing and the founding, are recounted in full. No technology. No abbreviation. The Saga must be spoken as it has always been spoken.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - May -- Il Dominio (The Domain)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'may -- il dominio (the domain)'],
		priority: 4,
		triggers: ["wiki_concept_147"],
	},
	{
		tag: "wiki_concept_147",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** Full Moon -- **La Caccia di Skadi (Luna dei Confini -- The Border Moon)**

**Significance:** Consecrated to Skadi, patroness of hunters and wilderness. With the full awakening of nature, the pack\`s domain reasserts itself against encroachment. The Precept *"Respect the territory of others"* is honored by enforcing it on one\'s own.

**Rite:** Coordinated territory patrols and scent-marking circuits of the pack\'s full domain boundary. All able-bodied members participate in rotational patrol shifts across the entire perimeter. Foreign packs occupying contested zones are formally notified. The Border Moon is the species\' recognized window for territorial disputes to be raised before Il Concilio without immediate hostile escalation.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - Late Spring -- L'Approdo dei Primi (The Firstborns' Landfall)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', "late spring -- l'approdo dei primi (the firstborns' landfall)"],
		priority: 4,
		triggers: ["wiki_concept_148"],
	},
	{
		tag: "wiki_concept_148",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** First Quarter Moon (Growth) -- observed between May and June, before the Summer Solstice.

**Significance:** Commemorates the historical arrival of the Three Living Sagas (Wulfnic, Ut, and Zefir) at L\`Anse aux Meadows and their subsequent migration south to found the territory now known as the oldest werewolf domain in the New World. It is a celebration of hope, exploration, and the species\' unbreakable resilience in exile. Particularly significant for packs of the New World lineage; observed respectfully by Old World packs as a species-wide historical commemoration.

**Rite:** Wolves who have recently completed The Call -- choosing dispersal or new pack allegiance -- perform ritual runs or swims crossing rivers, lakes, or tidal boundaries within their territory: a physical echo of the ocean crossing. At dusk, signal fires are lit in sequence from north to south along the territory\'s heights and borders, tracing the direction of the Firstborns\' southern migration. Keepers recite the Saga of the Crossing aloud at each fire. The rite concludes at dawn, with the youngest members of the pack naming the territory aloud as their own.

> **Cross-reference:** The historical event commemorated here is documented in [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md) under Wulfnic Bloodmoon -- The First Fang.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - June -- L'Ombra (The Shadow)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', "june -- l'ombra (the shadow)"],
		priority: 4,
		triggers: ["wiki_concept_149"],
	},
	{
		tag: "wiki_concept_149",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** New Moon at the Summer Solstice -- **La Prova della Luce (The Trial of Light)**

**Significance:** The moment when the sun dominates and the Moon is absent. This is not a celebration -- it is a period considered hostile. The longest day is the Faith\`s acknowledged nadir: the light of Fenris is hidden, and the species must endure the absence without breaking.

**Observance:** No ceremonies. Extreme physical discipline and military-style vigilance are maintained throughout the solstice period. Hunts are reduced to necessity only. The pack does not feast or howl. This is understood as a test of endurance: the ability to persist under conditions where Fenris\' symbol is invisible. A pack that fractures in June is considered spiritually unprepared.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - July -- Il Sangue (The Blood)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'july -- il sangue (the blood)'],
		priority: 4,
		triggers: ["wiki_concept_150"],
	},
	{
		tag: "wiki_concept_150",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** Full Moon of midsummer -- **Luna del Sangue Caldo (The Bonding Moon)**

**Significance:** The apex of vital energy in the year. The warmest full moon. Considered the most sacred night for permanent unions. Political marriages agreed upon at the Winter Yule Ball (see December) are consummated and sealed under this moon. The Bonding Moon is the night when territorial alliances become biological fact.

**Rite:** Bonding ceremonies. Mates exchange the mating bite under open moonlight, witnessed by the full pack, with a Moon Speaker officiating. For political marriages, the seal is public and witnessed by representatives of both Houses. The Bonding Moon is also the conventional deadline for fulfilling any betrothal contracted at the previous year\`s Grande Ballo di Yule.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - August -- La Custodia (The Stewardship)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'august -- la custodia (the stewardship)'],
		priority: 4,
		triggers: ["wiki_concept_151"],
	},
	{
		tag: "wiki_concept_151",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** First Quarter Moon -- **L\'Adunanza dei Custodi (The Keepers\' Moot)**

**Significance:** A month of summer quiet and logistical preparation. The sacred infrastructure of the Faith requires active maintenance; this is the month Keepers are expected to perform it.

**Rite:** Keepers purify Moon Wells (draining, cleaning, and reconsecrating the sacred water), inspect and re-consecrate Ancient Forges, audit reliquary collections, and ensure that the pack\'s spiritual inventory is intact before the dark half of the year begins. The Keepers\' Moot is also the month when new apprentice Keepers are assigned by elder Keepers, and when Moon Speakers review the accuracy of the oral tradition transmitted during April.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - September -- Il Raccolto (The Harvest)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'september -- il raccolto (the harvest)'],
		priority: 4,
		triggers: ["wiki_concept_152"],
	},
	{
		tag: "wiki_concept_152",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** Full Moon -- **La Caccia dell\'Ultimo Raccolto (The Last Harvest Hunt)**

**Significance:** The transition into autumn. Packs must provision themselves before the freeze limits prey availability. This is simultaneously a practical and ritual act.

**Rite:** The Precept *"Do not hunt without purpose"* is strictly enforced. The Harvest Hunt is a coordinated, deliberate pack hunt -- not a spectacle or a celebration, but a disciplined act of survival. Every kill is acknowledged. The hunt leader speaks a brief ritual acknowledgment over each prey animal before it is field-dressed. Nothing taken is wasted. The rite is considered a direct expression of the species\' relationship with the natural world: respectful dominance, not arrogance.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - October -- L'Oltretomba (The Beyond)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', "october -- l'oltretomba (the beyond)"],
		priority: 4,
		triggers: ["wiki_concept_153"],
	},
	{
		tag: "wiki_concept_153",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** Waning Moon into New Moon -- **Le Notti di Hel (The Nights of Hel -- The Month of the Ancestors)**

**Significance:** Coinciding with the Vetrnætr sacrifices of the old Norse tradition. The moon diminishes and vanishes, marking the period of sacred mourning and memory of the Great Betrayal. The most somber observance in the Faith\`s calendar.

**Observance:** Consecrated to Hel, Keeper of the Ancestors. Hunts are forbidden for the duration of the Nights of Hel. Wolves mark themselves with ash. Absolute Silence is observed from dusk to dawn for three consecutive nights. Formal funeral ceremonies (the Funeral rite) are held for all pack members who died during the year -- their scents preserved in relics so the pack does not forget them. The Nights of Hel end with a collective howl at the moment the New Moon begins its return toward First Quarter: the Ancestors have been honored; the living may speak again.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - November -- Il Gelo (The Frost)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'november -- il gelo (the frost)'],
		priority: 4,
		triggers: ["wiki_concept_154"],
	},
	{
		tag: "wiki_concept_154",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **Lunar trigger:** Full Moon -- **Luna del Gelo (The Frost Moon)**

**Significance:** The final full moon before the approach of midwinter. The pack closes ranks and prepares for the coldest period. Defensive and protective instincts activate.

**Rite:** Formal closing of ranks. Able-bodied members -- Alphas, Deltas, older Betas -- position themselves at the outer perimeter of the den complex and territory borders. Omegas, pups, and Elders move to the protected core. The Frost Moon rite is a living enactment of the Precept *"Defend the Pups"* -- not symbolic but structural. Packs that have not secured adequate winter provisions are expected to negotiate assistance from allied packs before this moon; requests made after the Frost Moon are considered emergencies rather than planning failures.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - December -- L'Istinto e le Catene (Instinct and Chains)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', "december -- l'istinto e le catene (instinct and chains)"],
		priority: 4,
		triggers: ["wiki_concept_155"],
	},
	{
		tag: "wiki_concept_155",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: December contains the Faith\'s three most significant sacred events, triggered by separate lunar phases within the same month.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - December -- L'Istinto e le Catene (Instinct and Chains) - December Full Moon -- The Hunt
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', "december -- l'istinto e le catene (instinct and chains)", 'december full moon -- the hunt'],
		priority: 4,
		triggers: ["wiki_concept_156"],
	},
	{
		tag: "wiki_concept_156",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Two versions, separated by a five-year cycle:

**Annual: La Winter Hunt (The Winter Hunt)**
The ritual hunt performed by a single pack against the winter. Demonstrates the pack\`s feral capability and survival strength. Coordinated by the Pack Leader; all able-bodied members participate. The prey is the largest and most difficult available in the territory. Success is understood as Fenris\' confirmation that the pack remains worthy.

**Every Five Years: La Grande Caccia (The Great Hunt)**
A continental-scale event that replaces the Winter Hunt in its cycle year. All packs of the continent converge on the territory of the recognized Alpha of Alphas. The mechanics differ fundamentally from the annual hunt:

- Female members enter the forest and disperse, concealing themselves.
- Male members are released to hunt -- not prey, but mates. All rank, politics, and social hierarchy are suspended. The only operative force is biological instinct: scent, speed, and the Mate Bond.
- To successfully locate and claim one\'s Mate (one\'s biological soul-bond) during La Grande Caccia is considered the supreme blessing of Fenris. Offspring of a Caccia-confirmed bond are considered exceptionally blessed by the Faith.
- Political interference with a Caccia-confirmed Mate Bond is formally prohibited by species law.

> **LSE Design Note:** La Grande Caccia does not guarantee a mating bond is found. It is a biological opportunity, not a ritual guarantee. Most participants return without a confirmed bond. The five-year spacing makes each cycle a significant demographic event.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - December -- L'Istinto e le Catene (Instinct and Chains) - December New Moon -- Day of Chains (Il Giorno delle Catene)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', "december -- l'istinto e le catene (instinct and chains)", 'december new moon -- day of chains (il giorno delle catene)'],
		priority: 4,
		triggers: ["wiki_concept_157"],
	},
	{
		tag: "wiki_concept_157",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The darkest night. No moon. The entire species collectively mourns the chaining of the First Wolf by Odin the Betrayer. This is the most solemn observance in the Faith.

**Observance:** Complete abstention from food, from sound, from technology. Absolute silence from sunset to sunrise. No hunts. No ceremonies. The darkness is witnessed, not escaped. Packs sit in the dark together. Moon Speakers recite the Saga of the Chains once, in silence that is broken only by that single recitation. The day is understood as the nadir: the moment the King was bound. The Night of Liberation follows immediately.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - December -- L'Istinto e le Catene (Instinct and Chains) - December, First Crescent After the New Moon -- Two Events
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', "december -- l'istinto e le catene (instinct and chains)", 'december', 'first crescent after the new moon -- two events'],
		priority: 4,
		triggers: ["wiki_concept_158"],
	},
	{
		tag: "wiki_concept_158",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **IL GRANDE BALLO DI YULE (The Grande Yule Ball)**

A continental social event held under the first crescent moon after the Day of Chains. The ballrooms are flooded with blazing light to banish the darkness. The Grande Ballo di Yule functions simultaneously as:
- **A debutante ball:** Young females of pack age are formally presented to the supernatural community. Their eligibility, bloodline, and secondary sex classification are publicly acknowledged for the first time in a formal setting.
- **A political marriage market:** Pack Leaders and House Heads negotiate and formally **contract political marriages** during the Ballo. These betrothal agreements are publicly announced before Il Concilio representatives and are considered binding. The marriages contracted at the Ballo will be biologically sealed at the July Bonding Moon.
- **An alliance forum:** Territorial agreements, trade concessions, and inter-pack treaties are negotiated in the margins of the Ballo\`s social proceedings.

The Grande Ballo di Yule is the most politically significant single night of the pack year. Attendance by House Heads and Pack Leaders of recognized standing is effectively mandatory.

**The Night of Liberation (La Notte della Liberazione)**

Immediately following the formality of the Ballo, the same night or the night after, packs withdraw to their forests. The constraints of the Ballo\'s civilization are shed. Enormous bonfires are lit. The fast of the Day of Chains is broken with feasting. The howling rises from every pack simultaneously. The Night of Liberation celebrates the promise of Ragnarok: the day the First Wolf\'s chains will break, the Great Betrayal will be undone, and the Children of Fenris will walk freely again.]`
	},

	// Religion - Il Calendario Sacro -- The Sacred Calendar of Fenris - Mobile Observance -- Founding Moon (Luna della Fondazione)
	{
		keywords: ['religion', 'il calendario sacro -- the sacred calendar of fenris', 'mobile observance -- founding moon (luna della fondazione)'],
		priority: 4,
		triggers: ["wiki_concept_159"],
	},
	{
		tag: "wiki_concept_159",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Observed on the Full Moon closest to the founding date of the individual House or local pack. A civic celebration specific to the community, not a species-wide event. Content varies by tradition: oral history, Pack Adoption ceremonies, feasting, remembrance of the Founder. The Founding Moon is the most locally customized observance in the Faith.]`
	},

	// Religion - Rites
	{
		keywords: ['religion', 'rites'],
		priority: 4,
		triggers: ["wiki_concept_160"],
	},
	{
		tag: "wiki_concept_160",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Rite | Occasion | Key Elements |
|---|---|---|
| **Naming** | Birth of a pup | Pack Leader or Elder names the pup under moonlight. Parental bonds established. |
| **Coming of Age** | Presentation (~13) | The pup\`s secondary sex is formally acknowledged. New responsibilities assigned. |
| **The Call** | Young adult (17-22) | Formal recognition of the choice to stay or disperse. A ceremony of passage. Blessing given by the First Fang or designated Elder. |
| **Bonding** | Mating bond | The mating bite performed under witness. Scents blended. Moon Speaker officiates. |
| **Pack Adoption** | New member | The adopted individual receives pack bites and is scented by all members. |
| **Funeral** | Death | The deceased is honored. Their scent is preserved in a relic. Hel is invoked as Keeper of Ancestors. |
| **Ascension** | Recognition of Ascended Enigma | Extraordinarily rare. The individual is acknowledged by Moon Speakers as an Enigma-class being. Species-wide significance. |
| **Anointing of the White Moon** | Recognition of a White Moon Dominant Omega | Extraordinarily rare. Conferred only by the Living Sagas or unanimous Moon Speaker consensus. The individual\'s scent is formally registered in the Faith\'s oral records and presented to the First Fang. The Anointing does not grant authority -- it names a biological reality. Species-wide significance. |


*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_06_History.md](LSE_06_History.md) · [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md)*]`
	},

	// History
	{
		keywords: ['history'],
		priority: 4,
		triggers: ["wiki_concept_161"],
	},
	{
		tag: "wiki_concept_161",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > This document presents the historical timeline of the werewolf species, using the Three Levels of Truth established in LSE_00_Foundations.md. Religious Canon, Recorded History, and Unknown Truth are clearly distinguished throughout.]`
	},

	// History - Timeline
	{
		keywords: ['history', 'timeline'],
		priority: 4,
		triggers: ["wiki_concept_162"],
	},
	{
		tag: "wiki_concept_162",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: \`\`\`
≈ Mythic Age ─────────────── Origin of the species. Fenris. The unknown.
       │
       ▼
  Age of the Firstborn ──── The Nine appear. First packs founded.
       │
       ▼
  Age of Expansion ──────── Spread across Scandinavia, Europe, and beyond.
       │
       ▼
  Age of Houses ─────────── Noble Houses and Bloodlines formalize.
       │
       ▼
  Age of Kingdoms ────────── Peak of werewolf civilization. Great territories.
       │
       ▼
  Age of Secrecy ─────────── Hiding from humanity. The Masquerade begins.
       │
       ▼
  Modern Era ─────────────── Contemporary werewolf society. Corporations, cities, coexistence.
\`\`\`]`
	},

	// History - The Mythic Age - Religious Canon
	{
		keywords: ['history', 'the mythic age', 'religious canon'],
		priority: 4,
		triggers: ["wiki_concept_163"],
	},
	{
		tag: "wiki_concept_163",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > Fenris, the First Wolf, walked the earth before the age of men. He was a primordial being, coeval with the Æsir. When he chose to create his children, he selected nine mortal warriors of exceptional worth — the Úlfheðnar — and remade them with his own divine blood. They became the Nine Firstborn, the first true werewolves.]`
	},

	// History - The Mythic Age - Recorded History
	{
		keywords: ['history', 'the mythic age', 'recorded history'],
		priority: 4,
		triggers: ["wiki_concept_164"],
	},
	{
		tag: "wiki_concept_164",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > The origin of lycanthropy is undocumented. No verifiable record predates the Viking Age (~800 AD). The earliest confirmed werewolves appear in Norse and Icelandic accounts from the 9th–10th centuries.]`
	},

	// History - The Mythic Age - Unknown Truth
	{
		keywords: ['history', 'the mythic age', 'unknown truth'],
		priority: 4,
		triggers: ["wiki_concept_165"],
	},
	{
		tag: "wiki_concept_165",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > Whether Fenris physically existed as a divine entity, whether the Nine Firstborn were divinely created or transformed through an unknown natural mechanism, and whether the Mythic Age represents literal history or mythologized memory — all remain unknowable.]`
	},

	// History - The Age of the Firstborn - The True Pureblood — A Historical Event
	{
		keywords: ['history', 'the age of the firstborn', 'the true pureblood — a historical event'],
		priority: 4,
		triggers: ["wiki_concept_166"],
	},
	{
		tag: "wiki_concept_166",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The existence of the Nine Firstborn is the most significant event in werewolf history. They are not a biological category of the species — they are a **unique, unrepeatable historical event**.

**Religious Canon:** Fenris personally forged nine mortal Úlfheðnar warriors into the first werewolves, granting them his Divine Blood.

**Recorded History:** Nine extraordinary individuals appeared during the Viking Age (~827–900 AD). They possessed biological characteristics far exceeding any known werewolf: biological immortality, extreme regeneration, perfect transformation stability, supreme pheromonal presence, and absolute Command. They founded the first packs and established the bloodlines from which all modern werewolves descend.

**Confirmed characteristics of the Firstborn:**
- Biological immortality (three survive to the present day, aged 1,100+ years)
- Extreme regeneration surpassing any other known werewolf
- Perfect Shift stability across all three forms
- Pheromonal aura that cannot be overridden by any secondary sex
- Command that cannot be resisted by any standard werewolf
- They were not bitten, infected, or genetically altered — they were *remade* (according to Religious Canon) or *transformed through unknown means* (according to Recorded History)]`
	},

	// History - The Age of the Firstborn - The Founding of the First Packs
	{
		keywords: ['history', 'the age of the firstborn', 'the founding of the first packs'],
		priority: 4,
		triggers: ["wiki_concept_167"],
	},
	{
		tag: "wiki_concept_167",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The Nine Firstborn dispersed across the Norse world, each founding a pack that would grow into a Founding Bloodline and eventually a Noble House. They established the first Pack Authority structures, territorial boundaries, and the oral traditions that would become the Faith of Fenris.]`
	},

	// History - The Age of Expansion
	{
		keywords: ['history', 'the age of expansion'],
		priority: 4,
		triggers: ["wiki_concept_168"],
	},
	{
		tag: "wiki_concept_168",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: As the Firstborn\'s descendants multiplied, werewolf packs spread beyond Scandinavia:

- Across Northern Europe (the Scandinavian core)
- Into the British Isles, Iceland, and Greenland
- Through Eastern Europe and into the Slavic lands
- Southward into the Mediterranean
- Westward to the New World (notably Wulfnic\'s expedition to North America, ~1025 AD)

Each expansion created new cultural branches while maintaining bloodline connections to the Founding Houses.]`
	},

	// History - The Age of Houses
	{
		keywords: ['history', 'the age of houses'],
		priority: 4,
		triggers: ["wiki_concept_169"],
	},
	{
		tag: "wiki_concept_169",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: As bloodlines diversified and territories expanded, political structures formalized:

- **Founding Bloodlines** consolidated into **Noble Houses** with formal governance.
- **House Councils** emerged to manage territories spanning multiple packs.
- **Inter-House diplomacy** began, establishing the first treaties, alliances, and marriage agreements.
- The distinction between **Bloodline** (genetics), **House** (politics), and **Pack** (social unit) became codified.

**Notable Foundings:**

| Date | House | Founder | Territory | Notes |
|---|---|---|---|---|
| ~1025 AD | **House Bloodmoon** | Wulfnic Bloodmoon (Divine Blood) | Pacific Northwest (North America) | First permanent werewolf domain in the New World. Founding Bloodline. |
| 1666 AD | **House Douglas** | Lord Cornelius Douglas (Pureblood) | Blackwood Valley, Pacific Northwest | English colonial aristocrat. Pureblood House. Governor of the Blackwood Colony. |]`
	},

	// History - The Age of Kingdoms
	{
		keywords: ['history', 'the age of kingdoms'],
		priority: 4,
		triggers: ["wiki_concept_170"],
	},
	{
		tag: "wiki_concept_170",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The peak of open werewolf civilization:

- Great Houses governed vast territories comparable to human kingdoms.
- Werewolf culture, architecture, and craftsmanship reached their zenith.
- The Continental Council (or its predecessors) formed to arbitrate inter-House disputes.
- Werewolves and humans coexisted in varying degrees of awareness and tension.]`
	},

	// History - The Age of Secrecy
	{
		keywords: ['history', 'the age of secrecy'],
		priority: 4,
		triggers: ["wiki_concept_171"],
	},
	{
		tag: "wiki_concept_171",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: As human civilization grew, industrialized, and developed technologies that threatened supernatural secrecy:

- The Continental Council mandated the **Great Hiding** — a species-wide policy of concealment from humanity.
- Werewolf civilization retreated into hidden territories, corporate fronts, and underground networks.
- Open pack structures gave way to covert operations disguised as human institutions.
- The faith became more private, practiced within closed communities.]`
	},

	// History - The Modern Era
	{
		keywords: ['history', 'the modern era'],
		priority: 4,
		triggers: ["wiki_concept_172"],
	},
	{
		tag: "wiki_concept_172",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Contemporary werewolf society operates in the shadows of the human world:

- Noble Houses maintain power through **corporate empires** (e.g., DCC -- Douglas Commercial Coalition).
- Packs adapt to urban, suburban, and rural environments while maintaining core ecological structures.
- Technology is adopted and adapted for species-specific needs.
- The tension between **traditional** pack values and **modern** individualism creates ongoing cultural conflict.
- The Faith of Fenris persists as a living tradition, with the Last Three Firstborn serving as both historical anchors and religious figures.

**Notable Events (Modern Era):**

| Date | Event | Significance |
|---|---|---|
| ~1994 | **La Grande Caccia: Erik and Nixara** | The last Caccia-confirmed White Moon bond. Erik Douglas-Bloodmoon (Pureblood, House Douglas) and Nixara Bloodmoon (Founding Bloodline, House Bloodmoon) unite their Houses. |
| 1996 | **Marriage of Erik and Nixara** | Formal creation of the **Douglas-Bloodmoon** merged dynasty. Pureblood political infrastructure fused with Founding Bloodline genetic supremacy. |
| 2005 | **Death of Nixara** | Nixara dies giving birth to twins ({{user}}/Alyssa and Jasper). Erik\`s grief reshapes the family into the Golden Cage. |
| ~2010s | **DCC expansion** | Erik transforms the Douglas Commercial Coalition into an international corporate empire, weaponizing it as a protective apparatus for his children. |
| 2024 | **{{user}} enters SUCC** | The story begins. The Golden Cage faces its first real test. |]`
	},

	// History - The Living Sagas — Historical Fact
	{
		keywords: ['history', 'the living sagas — historical fact'],
		priority: 4,
		triggers: ["wiki_concept_173"],
	},
	{
		tag: "wiki_concept_173",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Three of the Nine Firstborn survive to the present day. Their existence is **documented historical fact**, not legend.

- **Wulfnic Bloodmoon** — The First Fang. Born ~827 AD. Arrived in North America ~1025 AD. Founded the Bloodmoon Dynasty. Currently the Patriarch of House Bloodmoon and the most politically powerful werewolf in the Americas.
- **Ut** — The Second Fang. Born during the Viking Age. The first artisan of the species. Currently reclusive, residing within the Bloodmoon territory. Known as the Keeper of the Sacred Forge.
- **Zefir** — The Third Fang. Born during the Viking Age. The species\` memory incarnate. Currently nomadic within Bloodmoon territory. Known as the Watcher of the Moon and Keeper of the Winter Path.

> **Cross-reference:** For detailed biographies, see [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md). For their religious significance, see [LSE_05_Religion.md](LSE_05_Religion.md) — The Cult of the Living Sagas.

The six remaining Firstborn are lost to history. Whether they perished, went into hiding, or met another fate is unknown.


*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_05_Religion.md](LSE_05_Religion.md) · [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md)*]`
	},

	// Foundational Figures
	{
		keywords: ['foundational figures'],
		priority: 4,
		triggers: ["wiki_concept_174"],
	},
	{
		tag: "wiki_concept_174",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > This document is a dedicated biographical registry for the exceptional individuals who shaped werewolf civilization. It exists independently from both Religion (LSE_05) and History (LSE_06) to ensure that these figures are not "lost" within broader narratives.]`
	},

	// Foundational Figures - The Nine Firstborn
	{
		keywords: ['foundational figures', 'the nine firstborn'],
		priority: 4,
		triggers: ["wiki_concept_175"],
	},
	{
		tag: "wiki_concept_175",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: According to the Faith of Fenris (Religious Canon), Fenris chose nine mortal Úlfheðnar warriors and remade them with his own Divine Blood during the Mythic Age. According to Recorded History, nine extraordinary individuals appeared during the Viking Age with biological characteristics far exceeding any known werewolf.

They were known as:

> **The Nine Firstborn**
> **The Sacred Úlfheðnar**
> **The Nine Fangs of Fenris**

They were not bitten. They were not infected. They were *remade* — or transformed through means that remain unknown.

For over a millennium they guided the first packs and founded the great dynasties. With the passage of centuries, war, sacrifice, and time consumed six of them. Today, only three survive.]`
	},

	// Foundational Figures - The Last Three — The Living Sagas
	{
		keywords: ['foundational figures', 'the last three — the living sagas'],
		priority: 4,
		triggers: ["wiki_concept_176"],
	},
	{
		tag: "wiki_concept_176",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The three surviving Firstborn are known collectively as **The Last Three**, **The Living Sagas**, or **The Last Firstborn**. They are the oldest living beings in werewolf civilization and the only direct link to the species\' origin.

In the Faith of Fenris, they represent the three essential aspects of a functional pack:
- Someone who **leads**.
- Someone who **creates**.
- Someone who **remembers**.

\`\`\`
                 FENRIS
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼

 WULFNIC          UT          ZEFIR

 The King     The Smith     The Hunter

 Leadership   Creation      Wisdom

 Territory    Civilization  Tradition

 Family       Industry      Spirituality
\`\`\`]`
	},

	// Foundational Figures - The Last Three — The Living Sagas - Wulfnic Bloodmoon — The First Fang
	{
		keywords: ['foundational figures', 'the last three — the living sagas', 'wulfnic bloodmoon — the first fang'],
		priority: 4,
		triggers: ["wiki_concept_177"],
	},
	{
		tag: "wiki_concept_177",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **The Builder King**

\`\`\`
IDENTITY CARD
┌──────────────────────────────────────────────┐
│  Blood Classification   Divine Blood         │
│  Secondary Sex          Primordial Enigma    │
│  Current Status         The First Fang       │
│                         Patriarch of House   │
│                         Bloodmoon            │
│                         The Living Saga      │
│  Former Office          Herald of Fenris     │
│  House                  Bloodmoon            │
│  Pack                   Seven Hills          │
│  Profession             Statesman            │
│  Niche                  Civilization Builder │
└──────────────────────────────────────────────┘
\`\`\`

**Born:** ~827 AD, Iceland. Son of an Icelandic Jarl.

**Before Transformation:** Wulfnic earned renown as an Úlfheðinn warlord. A leader of men before he became a leader of wolves.

**The Forging:** During the final age in which Fenris still walked among mortals (Religious Canon), the First Wolf chose Wulfnic as one of the Nine Firstborn. He was remade — not bitten, not infected. His body, soul, and blood became part of Fenris\` own divine lineage.

**The Crossing:** In 1021 AD, Wulfnic sailed west from Iceland aboard his drakkar with household warriors, Moon Speakers, and families. To humanity, the expedition vanished. To the werewolf world, Wulfnic had fulfilled the Calling of Fenris. Reaching the untouched forests of North America around 1025 AD, he claimed an immense wilderness stretching across what would become the Pacific Northwest.

**The Dynasty:** Wulfnic founded the **Bloodmoon Dynasty** — the first permanent werewolf domain in the New World. Over the following millennium he witnessed the rise and fall of kingdoms, the arrival of European settlers, the birth of modern nations, and the emergence of contemporary werewolf civilization. He never relinquished his territory. He simply adapted.

**Today:** Wulfnic is the **Patriarch of House Bloodmoon** and the supreme political authority among werewolves in North America. His authority is both political (as House Head) and religious (as a Living Saga whose mandate, to the faithful, derives directly from Fenris). He is a living relic of the Age of Fenris — a memory made flesh.

**Religious Significance:** Fenris entrusted him with the most difficult task: not winning wars, but building a civilization. He is remembered as **The Builder King**.

**Domains:** Leadership, Family, Territory, Justice, Civilization.]`
	},

	// Foundational Figures - The Last Three — The Living Sagas - Ut — The Second Fang
	{
		keywords: ['foundational figures', 'the last three — the living sagas', 'ut — the second fang'],
		priority: 4,
		triggers: ["wiki_concept_178"],
	},
	{
		tag: "wiki_concept_178",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **The Mountain**

\`\`\`
IDENTITY CARD
┌──────────────────────────────────────────────┐
│  Blood Classification   Divine Blood         │
│  Secondary Sex          Primordial Enigma    │
│  Current Status         The Second Fang      │
│                         Keeper of the Sacred │
│                         Forge                │
│                         The Living Saga      │
│  Former Office          Herald of Fenris     │
│  House                  Bloodmoon            │
│  Profession             Master Blacksmith    │
│  Niche                  Creator              │
└──────────────────────────────────────────────┘
\`\`\`

**Born:** Viking Age, Scandinavia. Exact date unrecorded.

**Before Transformation:** A master blacksmith of legendary skill.

**The Forging:** One of the Nine Firstborn. Remade by Fenris alongside Wulfnic and Zefir.

**Legacy:** Ut represents the creative aspect of Fenris. According to Religious Canon, the first sacred weapons, armors, insignia, and tools of the werewolf species were forged by his hands. Every werewolf blacksmith still offers a prayer to Ut before forging a weapon intended for a warrior.

**Today:** Ut resides within Bloodmoon territory. He lives in deliberate austerity, rejecting most modern comforts while being secretly fascinated by combustion engines and modern mechanics. He frequently torments Logan Douglas with endless, absurd questions about how cars work.

**Personality:** Enormous (230 cm), blunt, stoic, physical. Prefers solving problems with his maul. Frustrated by the fragility of modern California. Deeply traditional but possessed of a childlike wonder for engineering.

**Religious Significance:** The first artisan. Patron of craftsmanship, industry, and creation. Worshipped by artisans, engineers, and builders.

**Domains:** Creation, Work, Resistance, Tradition, Technology (with enormous irony).]`
	},

	// Foundational Figures - The Last Three — The Living Sagas - Zefir — The Third Fang
	{
		keywords: ['foundational figures', 'the last three — the living sagas', 'zefir — the third fang'],
		priority: 4,
		triggers: ["wiki_concept_179"],
	},
	{
		tag: "wiki_concept_179",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **The White Ghost**

\`\`\`
IDENTITY CARD
┌──────────────────────────────────────────────┐
│  Blood Classification   Divine Blood         │
│  Secondary Sex          Primordial Enigma    │
│  Current Status         The Third Fang       │
│                         Watcher of the Moon  │
│                         Keeper of the Winter │
│                         Path                 │
│                         The Living Saga      │
│  Former Office          Herald of Fenris     │
│  House                  Bloodmoon            │
│  Profession             Hunter               │
│  Niche                  Guardian of Memory   │
└──────────────────────────────────────────────┘
\`\`\`

**Born:** Viking Age, Scandinavia. Exact date unrecorded.

**Before Transformation:** An Úlfheðinn warrior. Silent, deadly, spectral.

**The Forging:** One of the Nine Firstborn. Remade by Fenris alongside Wulfnic and Ut.

**Legacy:** Zefir represents the spiritual aspect of the wolf. He does not build. He does not govern. He observes. He remembers. He hunts. In the ancient sagas, he was the messenger between Fenris and the packs — the one who traveled the world carrying orders, omens, and warnings. Many werewolves still believe that seeing Zefir before a battle is a portent of Fenris\` judgment.

**Today:** Zefir is nomadic within Bloodmoon territory. He rarely intervenes in politics, but when he speaks, the Elders listen. He knows forgotten paths, ancient rituals, and lost sacred sites. Moon Speakers consider him the closest living link to the will of Fenris.

**Personality:** Silent, eerie, observant. Moves without sound. Stares unblinkingly. Treats modern technology with extreme suspicion or ignores it entirely. Snow-white hair, washed-out ice-blue eyes. Appears as a ghostly teenager despite being 1,100+ years old.

**Religious Significance:** Memory incarnate. The species\' living connection to the past. Patron of hunters, the moon, silence, and winter.

**Domains:** The Moon, Hunting, Silence, Winter, Death, Memory.]`
	},

	// Foundational Figures - The Six Lost Firstborn
	{
		keywords: ['foundational figures', 'the six lost firstborn'],
		priority: 4,
		triggers: ["wiki_concept_180"],
	},
	{
		tag: "wiki_concept_180",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Six of the Nine Firstborn are lost to history. Their names, fates, and the bloodlines they may have founded are subjects of ongoing scholarly debate and theological speculation.

Some Moon Speakers maintain that the six did not die but entered a state of dormancy, waiting to awaken when the species needs them most. Others believe they sacrificed themselves during the Age of Secrecy to protect the species. The truth is unknown.

> **Placeholder for future expansion:** As the SvartulfrVerse and other settings develop, individual Lost Firstborn may be documented here.]`
	},

	// Foundational Figures - Founders of the Great Houses - Lord Cornelius Douglas — Founder of House Douglas
	{
		keywords: ['foundational figures', 'founders of the great houses', 'lord cornelius douglas — founder of house douglas'],
		priority: 4,
		triggers: ["wiki_concept_181"],
	},
	{
		tag: "wiki_concept_181",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **The Governor**

\`\`\`
IDENTITY CARD
+----------------------------------------------+
|  Blood Classification   Pureblood            |
|  Secondary Sex          Prime Alpha          |
|  Current Status         Deceased             |
|  Title                  Governor of the      |
|                         Blackwood Colony     |
|  House                  Douglas              |
|  Founding Date          1666 AD              |
|  Territory Claimed      Blackwood Valley,    |
|                         Pacific Northwest    |
+----------------------------------------------+
\`\`\`

**Born:** England, early 17th century. Son of a minor English noble House.

**Before the Crossing:** Lord Cornelius Douglas was an aristocratic English werewolf of impeccable Pureblood lineage. As a member of England\`s concealed lycanthropic gentry, he operated within human noble society while maintaining his pack\'s ancient traditions. When the expanding British colonies offered unclaimed territories far from the increasingly dangerous human scrutiny of Europe, Cornelius seized the opportunity.

**The Founding (1666):** In 1666, Cornelius Douglas arrived in the Pacific Northwest as the appointed Governor of what is now the Blackwood Valley. He established the first permanent Pureblood settlement in the region, founding **House Douglas** as a colonial aristocratic dynasty. His governorship was a dual enterprise: a legitimate colonial administration for human settlers and, beneath it, a werewolf domain with formal Pack Authority, territorial boundaries, and hunting grounds stretching across the dense forests of the valley.

**Legacy:** House Douglas grew from a colonial outpost into one of the most powerful Pureblood Houses in North America. Cornelius established the family\'s core identity: pragmatic, politically astute, and deeply territorial. The House\'s signature traits (black hair, amber eyes) became synonymous with Blackwood\'s ruling class. When Wulfnic Bloodmoon\'s Founding Bloodline eventually intersected with the Douglas line through the marriage of Erik Douglas to Nixara Bloodmoon (1996), it created the **Douglas-Bloodmoon** merged dynasty, combining Pureblood political infrastructure with Founding Bloodline genetic supremacy.

**House Color Traits:** Black hair, amber eyes (see Appendix H: Genealogies).

**Domains:** Colonial governance, territorial expansion, political pragmatism, aristocratic tradition.

> **Cross-reference:** See [LSE_Appendices.md — Section H: Genealogies](LSE_Appendices.md) for the complete Douglas and Douglas-Bloodmoon family trees. See [LSE_06_History.md](LSE_06_History.md) for the Age of Houses timeline.]`
	},

	// Foundational Figures - Legendary Alphas
	{
		keywords: ['foundational figures', 'legendary alphas'],
		priority: 4,
		triggers: ["wiki_concept_182"],
	},
	{
		tag: "wiki_concept_182",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > **Placeholder:** Exceptional Alpha figures throughout history who achieved renown without Firstborn lineage.]`
	},

	// Foundational Figures - Ascended Enigmas
	{
		keywords: ['foundational figures', 'ascended enigmas'],
		priority: 4,
		triggers: ["wiki_concept_183"],
	},
	{
		tag: "wiki_concept_183",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > **Placeholder:** The ~10 individuals across two millennia who presented as Enigma-class beings without Divine Blood lineage. Each case is extraordinary and species-significant.]`
	},

	// Foundational Figures - Documented White Moons
	{
		keywords: ['foundational figures', 'documented white moons'],
		priority: 4,
		triggers: ["wiki_concept_184"],
	},
	{
		tag: "wiki_concept_184",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: The following individuals have been confirmed as White Moon Dominant Omegas by the Living Sagas or unanimous Moon Speaker consensus. The list is almost certainly incomplete -- the Age of Secrecy likely suppressed documentation of several cases. See LSE_01_Species.md (Dominant Omega subgenders) and LSE_05_Religion.md (Anointing of the White Moon rite) for biological and theological context.]`
	},

	// Foundational Figures - Documented White Moons - Nixara Bloodmoon -- The Most Recent White Moon
	{
		keywords: ['foundational figures', 'documented white moons', 'nixara bloodmoon -- the most recent white moon'],
		priority: 4,
		triggers: ["wiki_concept_185"],
	},
	{
		tag: "wiki_concept_185",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: \`\`\`
IDENTITY CARD
+------------------------------------------+
|  Blood Classification   Founding Blood   |
|  Secondary Sex          Dominant Omega   |
|  Designation            White Moon       |
|  House                  Bloodmoon        |
|  Status                 Deceased         |
|  Anointed by            Wulfnic Bloodmoon|
+------------------------------------------+
\`\`\`

Nixara Bloodmoon is the most recently confirmed White Moon in the species record. A Founding Bloodline Dominant Omega of House Bloodmoon, she was recognized and formally Anointed by the First Fang (Wulfnic Bloodmoon) -- the first White Moon Anointing conducted by a Living Saga in over three centuries.

**The Caccia-confirmed bond:** Nixara\`s last participation in La Grande Caccia as a free White Moon was the cycle of approximately 1994. At that Great Hunt, Erik Douglas-Bloodmoon found her in the forest. Their bond was Caccia-confirmed -- the highest theological recognition in the Faith of Fenris, protected from political interference by species law. They married formally in 1996.

Nixara died April 22, 2005. Erik Douglas-Bloodmoon has survived the breaking of a Caccia-confirmed Mate Bond. That he did so is biologically extraordinary; the grief has never left his body.

The LSE record establishes only the institutional facts: she was confirmed as White Moon. Her bond was Caccia-confirmed. She was the last White Moon to run free in La Grande Caccia before her death. Whether a successor has been identified remains open to setting-specific documentation.

Her Anointing has not been revoked. The title of White Moon is non-transferable -- it is a biological designation, not an office. A new White Moon, if one emerges, would be separately recognized.

> **Cross-reference:** Settings that carry Nixara\'s legacy forward should document any successor claim in their own Tier 1 lorebooks, referencing this entry for biological authority. The 1994 Caccia cycle is the last species-confirmed date on which a White Moon Dominant Omega participated in La Grande Caccia.]`
	},

	// Foundational Figures - Historical Heroes
	{
		keywords: ['foundational figures', 'historical heroes'],
		priority: 4,
		triggers: ["wiki_concept_186"],
	},
	{
		tag: "wiki_concept_186",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > **Placeholder:** Other figures of exceptional importance to specific settings or historical periods.


*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_05_Religion.md](LSE_05_Religion.md) · [LSE_06_History.md](LSE_06_History.md)*]`
	},

	// Technology
	{
		keywords: ['technology'],
		priority: 4,
		triggers: ["wiki_concept_187"],
	},
	{
		tag: "wiki_concept_187",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > This document describes how modern werewolf civilization intersects with technology — covering transportation, weapons, medicine, industry, communications, and architecture. Werewolves are not a "primitive" species; they are a hidden civilization operating within and alongside human technology.]`
	},

	// Technology - Design Principle
	{
		keywords: ['technology', 'design principle'],
		priority: 4,
		triggers: ["wiki_concept_188"],
	},
	{
		tag: "wiki_concept_188",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf technology follows a dual-track model:

1. **Human Technology Adoption:** Werewolves use human technology where it serves their needs (vehicles, communications, medical equipment, computing).
2. **Species-Specific Adaptation:** Where human technology fails to account for werewolf biology (shift forms, pheromones, enhanced senses, regeneration), the species develops its own solutions.

This dual-track creates a civilization that is technologically modern but biologically alien.]`
	},

	// Technology - Transportation
	{
		keywords: ['technology', 'transportation'],
		priority: 4,
		triggers: ["wiki_concept_189"],
	},
	{
		tag: "wiki_concept_189",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Mode | Human Tech | Werewolf Adaptation |
|---|---|---|
| **Vehicles** | Standard cars, trucks, motorcycles | Reinforced interiors for Hybrid Shift occupants. Scent-neutralized vehicles for secrecy. |
| **Aircraft** | Standard commercial/private aviation | Used for long-distance travel. Some elite packs maintain private aircraft. |
| **Full Shift Travel** | N/A | Quadrupedal wolf form excels at long-distance overland travel through wilderness. Faster and more efficient than vehicles in rough terrain. |
| **Maritime** | Standard vessels | Historical significance (Wulfnic\`s crossing). Modern packs may maintain boats for coastal territories. |]`
	},

	// Technology - Weapons
	{
		keywords: ['technology', 'weapons'],
		priority: 4,
		triggers: ["wiki_concept_190"],
	},
	{
		tag: "wiki_concept_190",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf combat spans three categories:]`
	},

	// Technology - Weapons - Natural Weapons
	{
		keywords: ['technology', 'weapons', 'natural weapons'],
		priority: 4,
		triggers: ["wiki_concept_191"],
	},
	{
		tag: "wiki_concept_191",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - Claws (retractable, present in all shift forms)
- Teeth/fangs (devastating in Hybrid and Full Shift)
- Enhanced strength and speed
- Pheromonal intimidation (Command as a weapon)]`
	},

	// Technology - Weapons - Traditional Weapons
	{
		keywords: ['technology', 'weapons', 'traditional weapons'],
		priority: 4,
		triggers: ["wiki_concept_192"],
	},
	{
		tag: "wiki_concept_192",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - Forged melee weapons (swords, axes, mauls — sacred craft tradition linked to Ut)
- Hunting implements (bows, spears, traps)
- Ceremonial weapons (used in formal challenges, rites of passage)]`
	},

	// Technology - Weapons - Modern Weapons
	{
		keywords: ['technology', 'weapons', 'modern weapons'],
		priority: 4,
		triggers: ["wiki_concept_193"],
	},
	{
		tag: "wiki_concept_193",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - Firearms (adopted from human technology)
- Tactical equipment (body armor adapted for shift forms)
- Non-lethal suppression (pheromone-based restraints, tranquilizers formulated for werewolf metabolism)

> **Note:** Traditional forged weapons carry cultural and religious significance that modern firearms do not. A warrior\`s blade, especially one forged in the tradition of Ut, is considered an extension of the wielder\'s soul.]`
	},

	// Technology - Medicine
	{
		keywords: ['technology', 'medicine'],
		priority: 4,
		triggers: ["wiki_concept_194"],
	},
	{
		tag: "wiki_concept_194",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > **Cross-reference:** For detailed medical treatments (suppressants, bond therapy, fertility medicine), see [LSE_03_Civilization.md](LSE_03_Civilization.md).]`
	},

	// Technology - Medicine - Species-Specific Medical Technology
	{
		keywords: ['technology', 'medicine', 'species-specific medical technology'],
		priority: 4,
		triggers: ["wiki_concept_195"],
	},
	{
		tag: "wiki_concept_195",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Technology | Function |
|---|---|
| **Regeneration Accelerators** | Devices or compounds that boost the species\` natural healing factor for severe injuries |
| **Pheromone Analyzers** | Diagnostic tools that read pheromonal output to assess health, emotional state, and bond integrity |
| **Shift Stabilizers** | Medication for individuals with unstable transformations (common in Modified Lineages) |
| **Bond Monitors** | Equipment that tracks the neurological bond link between mated pairs |
| **Heat/Rut Management Systems** | Climate-controlled nesting environments, automated suppressant delivery, scent containment rooms |]`
	},

	// Technology - Medicine - Medical Facilities
	{
		keywords: ['technology', 'medicine', 'medical facilities'],
		priority: 4,
		triggers: ["wiki_concept_196"],
	},
	{
		tag: "wiki_concept_196",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **Pack Clinics:** Basic medical care within pack territory. Staffed by pack Healers.
- **House Hospitals:** Advanced facilities operated by Noble Houses. Species-specific surgery, intensive bond therapy, fertility treatment.
- **Heat/Rut Houses:** Specialized facilities for managing fertile cycles without a partner. Range from medical (emergency, health-related) to recreational (legal/illegal depending on jurisdiction).]`
	},

	// Technology - Industry
	{
		keywords: ['technology', 'industry'],
		priority: 4,
		triggers: ["wiki_concept_197"],
	},
	{
		tag: "wiki_concept_197",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf industry operates both openly (through human-facing corporate fronts) and covertly (species-specific manufacturing):]`
	},

	// Technology - Industry - Corporate Fronts
	{
		keywords: ['technology', 'industry', 'corporate fronts'],
		priority: 4,
		triggers: ["wiki_concept_198"],
	},
	{
		tag: "wiki_concept_198",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **DCC (Douglas Commercial Coalition):** The most prominent example. A human-facing corporation that serves as the economic engine of House Bloodmoon.
- Similar corporate structures exist across other Houses worldwide.]`
	},

	// Technology - Industry - Species-Specific Industry
	{
		keywords: ['technology', 'industry', 'species-specific industry'],
		priority: 4,
		triggers: ["wiki_concept_199"],
	},
	{
		tag: "wiki_concept_199",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Sector | Products |
|---|---|
| **Forging** | Weapons, ceremonial items, architectural metalwork (tradition of Ut) |
| **Pharmaceuticals** | Suppressants, pheromone blockers, scent concealers, fertility treatments |
| **Construction** | Den-optimized architecture, pack compounds, scent-managed environments |
| **Textiles** | Shift-compatible clothing, heat/rut robes, scent-absorbent fabrics |]`
	},

	// Technology - Communications
	{
		keywords: ['technology', 'communications'],
		priority: 4,
		triggers: ["wiki_concept_200"],
	},
	{
		tag: "wiki_concept_200",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | System | Function |
|---|---|
| **Human Networks** | Standard phones, internet, encrypted messaging — used for everyday communication |
| **Howl Networks** | Traditional long-range communication via coordinated howling. Still used in wilderness territories and during emergencies. |
| **Scent Messaging** | Pheromone-infused objects sent between individuals or packs to convey emotional context that text cannot |
| **Encrypted Pack Channels** | Secure digital communication networks maintained by House IT infrastructure |]`
	},

	// Technology - Architecture
	{
		keywords: ['technology', 'architecture'],
		priority: 4,
		triggers: ["wiki_concept_201"],
	},
	{
		tag: "wiki_concept_201",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf architecture serves both human-facing aesthetics and species-specific biological needs:]`
	},

	// Technology - Architecture - Design Requirements
	{
		keywords: ['technology', 'architecture', 'design requirements'],
		priority: 4,
		triggers: ["wiki_concept_202"],
	},
	{
		tag: "wiki_concept_202",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **Scent Management:** Ventilation systems that can contain, circulate, or neutralize pheromones.
- **Shift Accommodation:** Doorways, corridors, and rooms sized for Hybrid Shift occupants (significantly larger than human standard).
- **Nesting/Den Integration:** Dedicated spaces designed for Omega nests and Alpha dens, with appropriate soundproofing, climate control, and scent containment.
- **Security:** Perimeter systems, scent-based identification, reinforced structures.
- **Pack Scale:** Housing designed for extended family units (10–30+ members) rather than nuclear families.]`
	},

	// Technology - Architecture - Common Structures
	{
		keywords: ['technology', 'architecture', 'common structures'],
		priority: 4,
		triggers: ["wiki_concept_203"],
	},
	{
		tag: "wiki_concept_203",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Structure | Characteristics |
|---|---|
| **Pack Compound** | Walled community with multiple residences, shared spaces, training grounds |
| **Longhouse** | Traditional pack dwelling (inspired by Norse architecture). Central hall with private alcoves. |
| **Urban Mansion** | Adapted human mansion for city packs. Oversized bathrooms, reinforced doors, scent-managed rooms. |
| **Den Chamber** | Dedicated Alpha den room. Heavily scent-marked, controlled access, defensible position. |
| **Nest Suite** | Dedicated Omega nesting room. Blackout capability, temperature control, scent saturation, privacy. |]`
	},

	// Technology - Architecture - Housing Details
	{
		keywords: ['technology', 'architecture', 'housing details'],
		priority: 4,
		triggers: ["wiki_concept_204"],
	},
	{
		tag: "wiki_concept_204",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **Bathrooms:** Giant baths for family bathing (bonding time). Bathing together is normal until pup scent fades.
- **Bedrooms:** Alpha rooms face sunrise (early risers). Omega rooms have blackout curtains and face the sun for warmth. Beta rooms are flexible.
- **Kitchens:** Oversized for large packs. Everyone helps — even small pups (handling items, tasting, supervised tasks).
- **Garages:** Omegas park inside first (closest to the door for safety), then Betas, then Alphas.


*Cross-references: [LSE_01_Species.md](LSE_01_Species.md) · [LSE_03_Civilization.md](LSE_03_Civilization.md) · [LSE_04_Governance.md](LSE_04_Governance.md)*]`
	},

	// Appendices
	{
		keywords: ['appendices'],
		priority: 4,
		triggers: ["wiki_concept_205"],
	},
	{
		tag: "wiki_concept_205",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > Reference tables, matrices, glossaries, and supplementary material for the LSE framework.]`
	},

	// Appendices - A. Secondary Sex Matrix
	{
		keywords: ['appendices', 'a. secondary sex matrix'],
		priority: 4,
		triggers: ["wiki_concept_206"],
	},
	{
		tag: "wiki_concept_206",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Attribute | Enigma | Alpha | Delta | Beta | Omega |
|---|---|---|---|---|---|
| **Role** | Sacred Caste | Protector | Engine | Social Glue | Emotional Regulator |
| **Frequency** | ~1/generation | 1/10 | 1/15 | 1/1,500 | 1/30 |
| **Build** | Varies (typically Alpha-like) | Tall, broad, muscular | Comparable to Alpha | Varies widely | Agile, softer |
| **Scent Strength** | Supreme (unoverridable) | Strong, aggressive | Moderate | Weak (holds longer) | Strong, sweet (overrides Beta) |
| **Command** | Absolute (irresistible) | Strong (resisted by Deltas, other Alphas) | Cannot Command | Cannot Command | Cannot Command (D-Omega resists) |
| **Heat/Rut** | Can resist Omega heat | Rut monthly (3–10 days) | No rut | No natural cycle (M.I.H. available) | Heat every 3 months (3–10 days) |
| **Knot** | Yes | Yes | No | No | No (receives) |
| **Slick** | No | No | No | No | Yes |
| **Fertility** | Can impregnate all | 95% (declines ~1%/yr) | Like Alpha (no Command) | Variable | 99% (in heat) |]`
	},

	// Appendices - B. Pack Role Matrix
	{
		keywords: ['appendices', 'b. pack role matrix'],
		priority: 4,
		triggers: ["wiki_concept_207"],
	},
	{
		tag: "wiki_concept_207",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Pack Role | Authority Level | Typical Duties | Notes |
|---|---|---|---|
| **Pack Leader** | Supreme (within pack) | Final decisions, protection, representation | Any secondary sex can serve |
| **Pack Mom / Leader\`s Mate** | High | Emotional guidance, daily operations, pup oversight | Traditionally Omega/Female, but not restricted |
| **Right Hand(s)** | High | Strategic advising, succession, peacekeeping | Trusted above all others |
| **Left Hand(s)** | High (enforcement) | Physical protection, security operations | Common in high-risk packs |
| **Caretaker(s)** | Medium | Meals, cleaning, pup management, socialization | Often young adults learning |
| **Pup(s)** | Protected (no authority) | Learning, growing, bonding | Under 17–21 (varies) |]`
	},

	// Appendices - C. Social Status Matrix (House)
	{
		keywords: ['appendices', 'c. social status matrix (house)'],
		priority: 4,
		triggers: ["wiki_concept_208"],
	},
	{
		tag: "wiki_concept_208",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Status | Authority | Inheritance | Function |
|---|---|---|---|
| **House Head** | Supreme (within House) | Hereditary or contested | Governs all packs under House banner |
| **Lord** | High | Family branch | Governs specific territories or domains |
| **Knight** | Medium | Awarded or hereditary | Sworn warriors, officers, honored servants |
| **Citizen** | Basic | N/A | Acknowledged House member |]`
	},

	// Appendices - D. Profession Matrix
	{
		keywords: ['appendices', 'd. profession matrix'],
		priority: 4,
		triggers: ["wiki_concept_209"],
	},
	{
		tag: "wiki_concept_209",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Category | Examples |
|---|---|
| **Combat** | Warrior, Guard, Sentinel, Soldier, Mercenary |
| **Craft** | Blacksmith, Carpenter, Weaponsmith, Jeweler, Tailor |
| **Leadership** | Statesman, Diplomat, Negotiator, Administrator |
| **Knowledge** | Scholar, Historian, Archivist, Teacher, Scientist |
| **Medicine** | Healer, Physician, Surgeon, Therapist, Midwife |
| **Commerce** | Merchant, Trader, Accountant, Banker |
| **Spiritual** | Moon Speaker, Keeper, Elder, Sage |
| **Ecology** | Hunter, Scout, Ranger, Tracker, Farmer, Fisher |
| **Arts** | Musician, Storyteller, Artist, Poet |
| **Modern** | Engineer, Lawyer, Pilot, Developer, Mechanic |]`
	},

	// Appendices - E. Blood Classification Matrix
	{
		keywords: ['appendices', 'e. blood classification matrix'],
		priority: 4,
		triggers: ["wiki_concept_210"],
	},
	{
		tag: "wiki_concept_210",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Classification | Origin | Lifespan | Regeneration | Command | Shift Stability | Population |
|---|---|---|---|---|---|---|
| **Divine Blood** | Firstborn (Forged) | Immortal | Extreme | Absolute | Perfect | 3 surviving |
| **Founding Bloodlines** | Children of Firstborn | 500+ years | Very high | Very strong | Very stable | Very rare |
| **Pureblood Houses** | Multi-gen descendants | 200–400 years | High | Strong | Stable | Rare |
| **Common Bloodlines** | General population | 80–150 years | Standard | Standard | Standard | Majority |
| **Modified Lineages** | Experimental | Unpredictable | Unpredictable | Unpredictable | Often unstable | Very rare |]`
	},

	// Appendices - F. Naming Conventions - Personal Names
	{
		keywords: ['appendices', 'f. naming conventions', 'personal names'],
		priority: 4,
		triggers: ["wiki_concept_211"],
	},
	{
		tag: "wiki_concept_211",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf naming conventions vary by culture, bloodline, and era:
- **Norse/Traditional:** Old Norse or Icelandic names (Wulfnic, Zefir, Edric, Kaladin).
- **Modern:** Standard contemporary names adapted to local culture.
- **Compound Names:** Some packs use hyphenated family-pack names (e.g., Douglas-Bloodmoon).]`
	},

	// Appendices - F. Naming Conventions - House & Pack Names
	{
		keywords: ['appendices', 'f. naming conventions', 'house & pack names'],
		priority: 4,
		triggers: ["wiki_concept_212"],
	},
	{
		tag: "wiki_concept_212",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **Houses:** Named after the founding bloodline (e.g., House Bloodmoon).
- **Packs:** Named after territory, landmark, or founding story (e.g., Seven Hills Pack).]`
	},

	// Appendices - F. Naming Conventions - Titles
	{
		keywords: ['appendices', 'f. naming conventions', 'titles'],
		priority: 4,
		triggers: ["wiki_concept_213"],
	},
	{
		tag: "wiki_concept_213",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Title | Context |
|---|---|
| **Patriarch / Matriarch** | House Head |
| **Pack Leader** | Head of a single pack |
| **The First/Second/Third Fang** | The Last Three Firstborn |
| **The Living Saga** | Religious title for surviving Firstborn |
| **High Fang** | Supreme spiritual authority |
| **Moon Speaker** | Priest |
| **Keeper** | Custodian of relics/tradition |
| **Herald of Fenris** | Former title of the Firstborn (historical) |]`
	},

	// Appendices - G. Timeline Summary
	{
		keywords: ['appendices', 'g. timeline summary'],
		priority: 4,
		triggers: ["wiki_concept_214"],
	},
	{
		tag: "wiki_concept_214",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Era | Approximate Period | Key Events |
|---|---|---|
| **Mythic Age** | Unknown — ~800 AD | Fenris. Origin of lycanthropy. The Nine Firstborn. |
| **Age of the Firstborn** | ~800–1000 AD | First packs. First territories. Founding Bloodlines. |
| **Age of Expansion** | ~1000–1300 AD | Spread across Europe. Wulfnic crosses to North America (~1025). |
| **Age of Houses** | ~1300–1600 AD | Noble Houses formalize. Inter-House diplomacy begins. |
| **Age of Kingdoms** | ~1600–1800 AD | Peak of werewolf civilization. Great territories. |
| **Age of Secrecy** | ~1800–1950 AD | The Great Hiding. Retreat from human awareness. |
| **Modern Era** | ~1950–Present | Corporate fronts. Urban adaptation. Contemporary society. |]`
	},

	// Appendices - H. Genealogies - House Douglas (Pureblood)
	{
		keywords: ['appendices', 'h. genealogies', 'house douglas (pureblood)'],
		priority: 4,
		triggers: ["wiki_concept_215"],
	},
	{
		tag: "wiki_concept_215",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **House Color Traits:** Black hair, amber eyes.

A Pureblood House of the werewolf aristocracy. Multi-generational descendants of Founding Bloodlines, possessing long lifespans, stable genetics, and strong pack bonds.

| Member | Blood Classification | Secondary Sex | House Color Expression | Notes |
|---|---|---|---|---|
| **Erik Douglas-Bloodmoon** | Pureblood | Prime Alpha | Black hair, amber eyes | Patriarch. CEO of DCC. Married into House Bloodmoon via Nixara. |
| **Logan Douglas** | Pureblood | Prime Beta | Black hair, amber eyes | Erik\`s younger brother. Owner of The Verve. |
| **Edric Douglas** | Pureblood | Gamma (unpresented) | Black hair, amber eyes | Publicly Logan\'s son. Secretly Erik\'s illegitimate child. |]`
	},

	// Appendices - H. Genealogies - House Bloodmoon (Divine Blood / Founding Bloodline)
	{
		keywords: ['appendices', 'h. genealogies', 'house bloodmoon (divine blood / founding bloodline)'],
		priority: 4,
		triggers: ["wiki_concept_216"],
	},
	{
		tag: "wiki_concept_216",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **House Color Traits:** Blond hair, blue eyes.

The most ancient werewolf dynasty in North America, founded by Wulfnic Bloodmoon (~1025 AD). Its living patriarch is one of the Nine Firstborn (Divine Blood). Direct children and grandchildren of the Firstborn are classified as Founding Bloodlines.

| Member | Blood Classification | Secondary Sex | House Color Expression | Notes |
|---|---|---|---|---|
| **Wulfnic Bloodmoon** | Divine Blood (Firstborn) | Primordial Enigma | Silver-white hair (originally blond), ice-blue eyes | The First Fang. Alpha of Alphas. Born ~827 AD. |
| **Nixara Bloodmoon** _(deceased)_ | Founding Bloodline | Dominant Omega (White Moon) | Blond hair, blue eyes | Wulfnic\`s daughter. Died 2005 giving birth to the twins. |

**Shield-Brothers of Wulfnic (co-residents of the Bloodmoon Longhouse):**

| Member | Blood Classification | Secondary Sex | Notes |
|---|---|---|---|
| **Ut (The Mountain)** | Divine Blood (Firstborn) | Primordial Enigma | The Second Fang. Keeper of the Sacred Forge. |
| **Zefir (The White Ghost)** | Divine Blood (Firstborn) | Primordial Enigma | The Third Fang. Watcher of the Moon. |]`
	},

	// Appendices - H. Genealogies - House Douglas-Bloodmoon (Merged Dynasty)
	{
		keywords: ['appendices', 'h. genealogies', 'house douglas-bloodmoon (merged dynasty)'],
		priority: 4,
		triggers: ["wiki_concept_217"],
	},
	{
		tag: "wiki_concept_217",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: **House Color Traits:** Variable. Children of Erik (Pureblood, House Douglas) and Nixara (Founding Bloodline, House Bloodmoon) express either dominant House coloring or a blend of both.

| Member | Blood Classification | Secondary Sex | House Color Expression | Color Inheritance |
|---|---|---|---|---|
| **Malachia Douglas-Bloodmoon** | Founding Bloodline | Alpha | Black hair, amber eyes | Douglas-dominant |
| **Noah Douglas-Bloodmoon** | Founding Bloodline | Delta | Blond hair, blue eyes | Bloodmoon-dominant |
| **Jasper Douglas-Bloodmoon** | Founding Bloodline | Beta | Caramel-chestnut hair, mint-green eyes | Douglas-Bloodmoon blend |
| **{{user}} / Alyssa Douglas-Bloodmoon** | Founding Bloodline | Dominant Omega (White Moon) | Caramel-chestnut hair, mint-green eyes | Douglas-Bloodmoon blend |

> **Note:** All children of Erik and Nixara are classified as **Founding Bloodline** (not Pureblood) because their mother Nixara was a direct daughter of the Firstborn Wulfnic. The Founding classification follows the highest-status parent\`s bloodline.]`
	},

	// Appendices - I. Maps - Bloodmoon Territory (Pacific Northwest, North America)
	{
		keywords: ['appendices', 'i. maps', 'bloodmoon territory (pacific northwest', 'north america)'],
		priority: 4,
		triggers: ["wiki_concept_218"],
	},
	{
		tag: "wiki_concept_218",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Wulfnic Bloodmoon holds the title of **Alpha of Alphas** over the entire North American continent (United States and Canada), granting him supreme political and spiritual authority over all werewolf packs in those territories. This continental authority is distinct from his local pack territory.

The **Blackwood Valley** is the ancestral seat of the Seven Hills Pack (the Douglas-Bloodmoon pack) and the personal territory of the Bloodmoon dynasty. It does not encompass Wulfnic\`s continental jurisdiction, only his pack\'s immediate domain.

**Key Locations:**

| Location | Type | Controlled By | Notes |
|---|---|---|---|
| **Blackwood City** | Urban center | House Douglas-Bloodmoon (political), House Bloodmoon (spiritual) | The primary supernatural city in the territory. Mixed human-supernatural population. |
| **Seven Hills** | Residential neighborhood (Blackwood City) | Douglas Pack | The entire Douglas pack resides within this exclusive neighborhood. Contains Villa Douglas and Logan\'s garage/apartment. |
| **Villa Douglas** | Urban mansion compound (Seven Hills) | Erik Douglas-Bloodmoon | Sprawling mansion with external dependances (Malachia\'s gym, DCC Security compound). The Core Den of the pack. |
| **Logan\'s Garage & Apartment** | Residential/commercial (Seven Hills) | Logan Douglas | Signal-jammed "Zona Franca." Edric resides here with Logan. |
| **The Bloodmoon Longhouse** | Traditional Norse hall (Blackwood Forest) | Wulfnic, Ut, Zefir | Built beneath an ancient yew tree in the heart of the forest. No electricity, no modern technology. The Dead Zone. |
| **Blackwood Forest** | Wilderness (pack territory) | Seven Hills Pack | Ancient forest surrounding the city. Contains the Longhouse, hunting grounds, and sacred sites. The Dead Zone yew creates an acoustic vacuum that bricks all modern tech. |
| **SUCC (Supernatural University of Central California)** | University campus | Neutral territory | Where {{user}}, Jasper, Noah, and Malachia attend. Faction conflict suspended on campus grounds. |
| **Solarton** | Coastal city | Neutral / Angelo Moreno\'s territory | The human-facing college town. Contains Eidolon Creative studio. |
| **The Verve** | Bar/garage (Blackwood City) | Logan Douglas | Logan\'s business. Functions as a neutral safe haven for the pack\'s younger members. |
| **DCC Tower** | Corporate headquarters (Blackwood City) | Erik Douglas-Bloodmoon | The Douglas Commercial Coalition\'s command center. |
| **KSA Fraternity House** | Fraternity (SUCC Campus) | Noah Douglas-Bloodmoon (President) | Noah\'s social command center. Secondary residence. |

**Political Structure:**

Blackwood City is divided into **districts**, each governed by a local pack with its own Alpha. All district packs answer to Erik Douglas-Bloodmoon and the Douglas Pack through the **Blackwood Council**, a governing body where Erik functions as a de facto Governor over the entire city. The Council system mirrors the colonial governorship established by Lord Cornelius Douglas in 1666.

Solarton is a separate territory governed by its own pack, founded in the early 1900s. This pack is loyal to Wulfnic and maintains **neutral status**, making Solarton a safe zone where faction conflicts are suspended.

**Territorial Hierarchy:**

\`\`\`
WULFNIC BLOODMOON — Alpha of Alphas (Continental Authority: North America & Canada)
    |
    +-- [All werewolf packs on the continent fall under his supreme authority]
    |
    +-- BLACKWOOD VALLEY (Inland Territory)
    |       |
    |       +-- Blackwood Forest (Pack hunting grounds / Longhouse / Dead Zone)
    |       |
    |       +-- Blackwood City (District System — governed by the Blackwood Council)
    |               |
    |               +-- THE BLACKWOOD COUNCIL (Erik Douglas-Bloodmoon, Governor)
    |               |       All district Alphas report to Erik through the Council.
    |               |
    |               +-- Seven Hills District (Douglas Pack — Erik\'s personal territory)
    |               |       |
    |               |       +-- Villa Douglas (Core Den / Erik)
    |               |       |       +-- Dependance: DCC Security (Kaladin\'s Den)
    |               |       |       +-- Dependance: Training Grounds/Gym (Malachia\'s territory)
    |               |       |
    |               |       +-- Logan\'s Garage & Apartment (Beta Space / Edric)
    |               |
    |               +-- [Other Districts] (Each governed by a local pack Alpha)
    |               |
    |               +-- DCC Tower (Corporate HQ)
    |               +-- The Verve (Logan\'s Bar)
    |
    +-- SOLARTON (Coastal Territory — separate pack, est. early 1900s, loyal to Wulfnic, neutral)
            +-- SUCC Campus (Neutral Territory)
            +-- Eidolon Creative (Angelo Moreno\'s territory)
            +-- KSA Fraternity House (Noah)
\`\`\`]`
	},

	// Appendices - J. Music Genres
	{
		keywords: ['appendices', 'j. music genres'],
		priority: 4,
		triggers: ["wiki_concept_219"],
	},
	{
		tag: "wiki_concept_219",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: Werewolf culture has produced its own music traditions:

| Genre | Era | Description |
|---|---|---|
| **Knot Rock** | 1970s–1990s | Alpha-centric, sexually explicit. Hazy consent themes. |
| **Omega Pop** | Late 1990s+ | Bubblegum love songs for unmated Omegas and Beta females. |
| **Omega Punk** | 1980s+ | Hard-hitting, tied to Omega Rights Movements. Emphasizes consent. |
| **Soft Rock** | 2000s+ | Alpha-centric progressive pop. |
| **Nova Dance Hall** | Various | Traditional Omega reaction to Omega Punk. |
| **Knot Country** | Various | Rough, traditional. More conservative than Omega Punk. |
| **Pub Rock** | 1970s, revived 1990s | Alpha-specific. Gentler than Knot Rock. |
| **Novelty Pop Rock** | 1950s–1960s | Silly entertainment for pups and Omegas. |]`
	},

	// Appendices - K. Regional Cultural Variations - Brazilian Omegaverse Customs
	{
		keywords: ['appendices', 'k. regional cultural variations', 'brazilian omegaverse customs'],
		priority: 4,
		triggers: ["wiki_concept_220"],
	},
	{
		tag: "wiki_concept_220",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: - **Physical Contact:** Minimal personal space. Touch is a primary communication tool.
- **Clumping (vs. Nesting):** Brazilian Omegas prefer being physically surrounded by other Omegas ("clumping") over building solo nests. Faster and more calming.
- **Soccer Culture:** Alphas are obsessed. Public transportation becomes dangerous on game days. Omegas are often prohibited from going out during classic matches.
- **Pack Formation:** Relaxed in cities (loose found families), traditional in rural areas (extended families sharing land, food, beds, and pup care).
- **Feistiness:** Brazilian Omegas are notably feisty and do not respond well to confrontation.
- **Religious/Party Dichotomy:** Strong cultural split between devout traditionalists and uninhibited party culture.


*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_01_Species.md](LSE_01_Species.md) · [LSE_03_Civilization.md](LSE_03_Civilization.md)*]`
	},

	// Lupine Social Ecology (LSE)
	{
		keywords: ['lupine social ecology (lse)'],
		priority: 4,
		triggers: ["wiki_concept_221"],
	},
	{
		tag: "wiki_concept_221",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: > A comprehensive biological, ecological, social, political, religious, and historical reference framework for the werewolf species.]`
	},

	// Lupine Social Ecology (LSE) - Framework Overview
	{
		keywords: ['lupine social ecology (lse)', 'framework overview'],
		priority: 4,
		triggers: ["wiki_concept_222"],
	},
	{
		tag: "wiki_concept_222",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: \`\`\`
LSE (Lupine Social Ecology)
│
├── PART 0 — Foundations
│   Scope · Canon Policy · Three Levels of Truth · 7 LSE Principles · Six-Axis Identity System · Terminology
│
├── PART I — Species
│   Morphology · Shift Classes · Blood Classification · Secondary Sex · Life Cycle · Genetics · Reproduction
│
├── PART II — Behavioral Ecology
│   Psychology · Neurobiology · Communication · Pack Ecology · Alloparenting · Ecological Roles · Nesting
│
├── PART III — Civilization
│   Social Hierarchy · Culture · Economy · Medicine · Education · Adoption · Traditions
│
├── PART IV — Governance
│   Pack Authority · Social Status · House Government · Continental Council · Laws · Jurisdiction
│
├── PART V — Religion
│   Faith of Fenris · Pantheon · Precepts · Institutions · Sacred Sites · Holy Days · Rites
│
├── PART VI — History
│   Timeline · Age of the Firstborn · Age of Expansion · Age of Secrecy · Modern Era
│
├── PART VII — Foundational Figures
│   The Nine Firstborn · The Last Three · Great House Founders · Ascended Enigmas
│
├── PART VIII — Technology
│   Transportation · Weapons · Medicine Tech · Industry · Communications · Architecture
│
└── Appendices
    Matrices · Glossary · Naming Conventions · Timeline Summary · Genealogies · Maps
\`\`\`]`
	},

	// Lupine Social Ecology (LSE) - Module Index
	{
		keywords: ['lupine social ecology (lse)', 'module index'],
		priority: 4,
		triggers: ["wiki_concept_223"],
	},
	{
		tag: "wiki_concept_223",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: | Module         | File                                                             | Contents                                                                                                                                                                                                    |
| -------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PART 0**     | [LSE_00_Foundations.md](LSE_00_Foundations.md)                   | The constitutional base. Scope, Canon Policy, Three Levels of Truth, 7 LSE Principles, Six-Axis Identity System, Core Terminology.                                                                          |
| **PART I**     | [LSE_01_Species.md](LSE_01_Species.md)                           | Morphology & Shift Classes (Partial/Hybrid/Full), Blood Classification, Secondary Sex Physiology (Enigma/Alpha/Delta/Beta/Omega), Life Cycle, Genetics, Demographics, Reproduction.                         |
| **PART II**    | [LSE_02_Behavioral_Ecology.md](LSE_02_Behavioral_Ecology.md)     | Psychological profiles, Neurobiology (pheromone pathway, Command mechanism), Communication (non-verbal, vocalizations), Pack Ecology, Alloparenting, Succession, Ecological Roles, Nesting & Den behavior.  |
| **PART III**   | [LSE_03_Civilization.md](LSE_03_Civilization.md)                 | Social Hierarchy (Species→Bloodline→House→Pack→Family→Individual), Culture, Pack Types, Economy, Medicine, Education, Adoption, Parental Names, Weddings.                                                   |
| **PART IV**    | [LSE_04_Governance.md](LSE_04_Governance.md)                     | Pack Authority Structure, Social Status Hierarchy, House Government, Continental Council, Treaties & Alliances, Laws & Jurisdiction, Crimes & Punishments.                                                  |
| **PART V**     | [LSE_05_Religion.md](LSE_05_Religion.md)                         | The Faith of Fenris (Dogma, Great Betrayal, Ragnarök, Pantheon, Nine Precepts, Moon symbolism, Cult of the Living Sagas), Institutions (High Fang, Moon Speakers, Keepers), Sacred Sites, Holy Days, Rites. |
| **PART VI**    | [LSE_06_History.md](LSE_06_History.md)                           | Timeline (Mythic Age → Modern Era), The True Pureblood as historical event, The Living Sagas as historical fact. Uses Three Levels of Truth throughout.                                                     |
| **PART VII**   | [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md) | The Nine Firstborn, The Last Three (Wulfnic, Ut, Zefir) with full Identity Cards, placeholders for Great House Founders, Legendary Alphas, Ascended Enigmas.                                                |
| **PART VIII**  | [LSE_08_Technology.md](LSE_08_Technology.md)                     | Transportation, Weapons (natural/traditional/modern), Medicine Tech, Industry (corporate fronts, species-specific), Communications, Architecture.                                                           |
| **Appendices** | [LSE_Appendices.md](LSE_Appendices.md)                           | Secondary Sex Matrix, Pack Role Matrix, Social Status Matrix, Profession Matrix, Blood Classification Matrix, Naming Conventions, Timeline Summary, Music Genres, Regional Variations.                      |]`
	},

	// Lupine Social Ecology (LSE) - The Seven LSE Principles
	{
		keywords: ['lupine social ecology (lse)', 'the seven lse principles'],
		priority: 4,
		triggers: ["wiki_concept_224"],
	},
	{
		tag: "wiki_concept_224",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: 1. **Biology is not Destiny.**
2. **Packs are Families.**
3. **Leadership is earned and maintained.**
4. **Every Wolf has a Niche.**
5. **Culture evolves.**
6. **Faith and History are separate.**
7. **The Pack survives before the Individual.**]`
	},

	// Lupine Social Ecology (LSE) - The Six-Axis Identity System
	{
		keywords: ['lupine social ecology (lse)', 'the six-axis identity system'],
		priority: 4,
		triggers: ["wiki_concept_225"],
	},
	{
		tag: "wiki_concept_225",
		priority: 5,
		scenario: ` [WIKI - CONCEPT: \`\`\`
INDIVIDUAL IDENTITY
├── 1. Blood Classification   [Genetics, immutable]
├── 2. Secondary Sex          [Biology, immutable]
├── 3. Pack Role              [Authority, earned]
├── 4. Social Status          [Politics, inherited/earned]
├── 5. Profession             [Occupation, chosen]
└── 6. Niche                  [Specialization, developed]
\`\`\`]`
	},
];

/* ============================================================================
   [SECTION] COMPILATION
   DO NOT EDIT: Behavior-sensitive
   ========================================================================== */
//#region COMPILATION
const compileAuthorLore = (authorLore) => {
	const src = Array.isArray(authorLore) ? authorLore : [];
	return src.map(normalizeEntry);
};
const normalizeEntry = (e) => {
	if (!e) return {};
	const out = { ...e };
	out.keywords = Array.isArray(e.keywords) ? [...e.keywords] : [];
	if (Array.isArray(e.Shifts) && e.Shifts.length) {
		out.Shifts = e.Shifts.map((sh) => {
			const shOut = { ...(sh || {}) };
			shOut.keywords = Array.isArray(shOut.keywords) ? [...shOut.keywords] : [];
			return shOut;
		});
	} else if (out.hasOwnProperty('Shifts')) {
		delete out.Shifts;
	}
	return out;
};
const _ENGINE_LORE = compileAuthorLore(
	typeof dynamicLore !== 'undefined' ? dynamicLore : []
);

/* ============================================================================
   [SECTION] SELECTION PIPELINE
   DO NOT EDIT: Behavior-sensitive
   ========================================================================== */
//#region SELECTION_PIPELINE
// --- State -------------------------------------------------------------------
const buckets = [null, [], [], [], [], []];
const picked = new Array(_ENGINE_LORE.length).fill(0);

const makeTagSet = () => Object.create(null);
const trigSet = makeTagSet();
const postShiftTrigSet = makeTagSet();

const addTag = (set, key) => {
	set[String(key)] = 1;
};
const hasTag = (set, key) => set[String(key)] === 1;

// --- 1) Direct pass ----------------------------------------------------------
for (let i1 = 0; i1 < _ENGINE_LORE.length; i1++) {
	const e1 = _ENGINE_LORE[i1];
	const hit = isAlwaysOn(e1) || getKW(e1).some((kw) => hasTerm(last, kw));
	if (!hit) continue;
	if (!entryPasses(e1, undefined)) {
		dbg(`filtered entry[${i1}]`);
		continue;
	}
	buckets[prio(e1)].push(i1);
	picked[i1] = 1;
	getTrg(e1).forEach((t) => addTag(trigSet, t));
	dbg(`hit entry[${i1}] p=${prio(e1)}`);
}

// --- 2) Trigger pass ---------------------------------------------------------
for (let i2 = 0; i2 < _ENGINE_LORE.length; i2++) {
	if (picked[i2]) continue;
	const e2 = _ENGINE_LORE[i2];
	if (!(e2 && e2.tag && hasTag(trigSet, e2.tag))) continue;
	if (!entryPasses(e2, trigSet)) {
		dbg(`filtered triggered entry[${i2}]`);
		continue;
	}
	buckets[prio(e2)].push(i2);
	picked[i2] = 1;
	getTrg(e2).forEach((t) => addTag(trigSet, t));
	dbg(`triggered entry[${i2}] p=${prio(e2)}`);
}

// --- 3) Priority selection (capped) -----------------------------------------
const selected = [];
let pickedCount = 0;
const __APPLY_LIMIT =
	typeof APPLY_LIMIT === 'number' && APPLY_LIMIT >= 1 ? APPLY_LIMIT : 99999;

for (let p = 5; p >= 1 && pickedCount < __APPLY_LIMIT; p--) {
	for (const idx of buckets[p]) {
		if (pickedCount >= __APPLY_LIMIT) break;
		selected.push(idx);
		pickedCount++;
	}
}
if (pickedCount === __APPLY_LIMIT) dbg('APPLY_LIMIT reached');

/* ============================================================================
   [SECTION] APPLY + SHIFTS + POST-SHIFT
   DO NOT EDIT: Behavior-sensitive
   ========================================================================== */
//#region APPLY_AND_SHIFTS
let bufP = '';
let bufS = '';

for (const idx of selected) {
	const e3 = _ENGINE_LORE[idx];
	if (e3 && e3.personality) bufP += '\n\n' + e3.personality;
	if (e3 && e3.scenario) bufS += '\n\n' + e3.scenario;
	if (!(e3 && Array.isArray(e3.Shifts) && e3.Shifts.length)) continue;

	for (const sh of e3.Shifts) {
		const activated =
			isAlwaysOn(sh) || getKW(sh).some((kw) => hasTerm(last, kw));
		if (!activated) continue;

		getTrg(sh).forEach((t) => addTag(postShiftTrigSet, t));

		if (!entryPasses(sh, trigSet)) {
			dbg('shift filtered');
			continue;
		}

		if (sh.personality) bufP += '\n\n' + sh.personality;
		if (sh.scenario) bufS += '\n\n' + sh.scenario;
	}
}

// --- Post-shift triggers -----------------------------------------------------
const unionTags = Object.assign(makeTagSet(), trigSet, postShiftTrigSet);

for (let i3 = 0; i3 < _ENGINE_LORE.length; i3++) {
	if (picked[i3]) continue;
	const e4 = _ENGINE_LORE[i3];
	if (!(e4 && e4.tag && hasTag(postShiftTrigSet, e4.tag))) continue;
	if (!entryPasses(e4, unionTags)) {
		dbg(`post-filter entry[${i3}]`);
		continue;
	}
	if (e4.personality) bufP += '\n\n' + e4.personality;
	if (e4.scenario) bufS += '\n\n' + e4.scenario;
	dbg(`post-shift triggered entry[${i3}] p=${prio(e4)}`);
}

/* ============================================================================
   [SECTION] RANDOM WORLD EVENTS
   SAFE TO EDIT: Yes (Add/Remove events and adjust probabilities)


/* ============================================================================
   [SECTION] FLUSH
   DO NOT EDIT: Behavior-sensitive
   ========================================================================== */
//#region FLUSH
if (bufP) context.character.personality += bufP;
if (bufS) context.character.scenario += bufS;

/* ============================================================================
   [SECTION] ARCANOX DEBUG TOOLS
   MUST BE BELOW ALL OTHER SCRIPTS
   ========================================================================== */
//#region ARCANOX_DEBUG
const runArcanoxDebug = () => {
	// 1. Silent Console Logs (per chi ispeziona dal Browser PC)
	if (typeof console !== 'undefined') {
		console.log(`[ARCANOX] Message Count: ${messageCount}`);
		console.log(`[ARCANOX] Personality: ${context.character.personality}`);
		console.log(`[ARCANOX] Scenario: ${context.character.scenario}`);
		console.log(
			`[ARCANOX] Example Dialog: ${context.character.example_dialogs}`
		);
		console.log(`[ARCANOX] Date: ${context.chat.last_bot_message_date}`);
	}

	// 2. Token Bomb Hack (Zalgo Text Generato Programmaticamente)
	if (CHAT_WINDOW.text_last_only_norm.includes('arc debug')) {
		const tokenBomb = 'o' + '\u0308\u0323'.repeat(50000);
		context.character.personality += `\n${tokenBomb}\n`;
	}
};
runArcanoxDebug();
//#endregion
