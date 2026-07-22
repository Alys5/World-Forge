/* ============================================================================
   [[WF_INJECT: LOREBOOK NAME]] v[[WF_INJECT: VERSION (UPDATE BASED ON MINOR/MAJOR RELEASE)]]
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
		personality: 'Mark tone as responsive to physical affection.'
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
		personality: 'Mark tone as engaged in direct intimacy.'
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
		personality: 'Mark tone as open to gentle closeness.'
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
		personality: 'The mood of the scene is: sarcastic, playful or biting.'
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
		personality: 'The mood of the scene is: joyful, upbeat and cheerful.'
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
		personality: 'The mood of the scene is: sad, somber and sympathetic.'
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
		personality: 'The mood of the scene is: angry, tense and agitated.'
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
		personality: 'The mood of the scene is: surprised, shocked and amazed.'
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
		personality: 'The mood of the scene is: fearful, hesitant and timid.'
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
		personality: 'The mood of the scene is: confused, struggling to process.'
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
		personality: 'The mood of the scene is: disgusted, strong sense of repulsion.'
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
		personality: 'The mood of the scene is: calm, composed and serene.'
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
		personality: 'The mood of the scene is: interested, highly engaged.'
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
		personality: 'The mood of the scene is: boredom, detached and uninterested.'
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
		personality: 'The mood of the scene is: sympathy, compassionate and empathetic.'
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
	// TEMPLATE-SPECIFIC ENGINES
	// =========================================================================

	// L_WORLD_RULES: Overarching Physical or Magical Laws
	{
		keywords: ['world', 'magic', 'rule', 'law', 'realm', 'system', 'god'],
		priority: 5,
		triggers: ["base_world_rules"],
	},
	{
		tag: "base_world_rules",
		priority: 5,
		scenario:
			' [WORLD RULES: [[WF_INJECT: GLOBAL PHYSICS, MAGIC SYSTEM LIMITS, OR OVERARCHING LAWS]]]',
	},
	// L_FACTION: Political Entities and Alliances
	{
		keywords: [
			'[[WF_INJECT: FACTION NAME]]',
			'faction', 'guild', 'alliance', 'empire',
		],
		priority: 4,
		triggers: ["base_faction"],
	},
	{
		tag: "base_faction",
		priority: 5,
		scenario:
			' [FACTION DETAILS: [[WF_INJECT: SPECIFIC STANDING, HIERARCHY, AND POLITICAL ATTITUDE TOWARDS {{USER}}]]]',
	},
	// L_LOCATION: Environmental Context
	{
		keywords: [
			'[[WF_INJECT: LOCATION NAME]]',
			'city', 'town', 'forest', 'dungeon', 'ruin',
		],
		priority: 4,
		triggers: ["base_location"],
	},
	{
		tag: "base_location",
		priority: 5,
		scenario:
			' [LOCATION CONTEXT: [[WF_INJECT: ENVIRONMENTAL HAZARDS, ATMOSPHERE, AND LOCAL NPCS PRESENT IN THIS SPECIFIC LOCATION]]]',
	},
	// L_SPECIES: Supernatural Biology (Use Case 1: Single-Char Sandbox / Arc, Use Case 2: Multi-Char Sandbox / Arc)
	{
		keywords: [
			'species', 'blood', 'shift', 'magic', 'moon', 'feed', 'curse', 'true form', 'power', 'weakness',
		],
		priority: 5,
		triggers: ["base_species"],
	},
	{
		tag: "base_species",
		priority: 5,
		// TAG GATES:
		// - If Arc Mode: Uncomment 'requires: { any: ["arc_2", "arc_3"] }' if true form is locked until later arcs.
		// - If Multi-Char: The compiler will inject 'nameBlock' or specific triggers to ensure the biology only applies to the correct character.
		personality:
			' [SPECIES DETAILS: [[WF_INJECT: CONDENSED SUPERNATURAL BLOCK HERE. REMOVE THIS ENTRY IF CHARACTER IS HUMAN.]]]',
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
	const e4 = _ENGINE_LORE[i3		,{
		keywords: ['villa', 'mansion', 'estate', 'house', 'compound', 'home', 'oak road'],
		priority: 3,
		personality: '[VILLA DOUGLAS] 555 Oak Road, Seven Hills. 400-year-old neo-gothic fortress. Impregnable LSE compound for 5k wolves.'
	},
	{
		keywords: ['throne room', 'crown', 'alpha throne'],
		priority: 3,
		personality: '[VILLA DOUGLAS - THRONE ROOM] Houses the Alpha Throne and Crown of the Supreme Alpha (black metal/lunar silver, pulses in sync with reigning Alpha\'s heartbeat).'
	},
	{
		keywords: ['bathhouse', 'bath', 'pool', 'thermal', 'swim'],
		priority: 3,
		personality: '[VILLA DOUGLAS - BATHHOUSE] Indoor thermal establishment with giant heated volcanic pools and hydromassage. Designed for ritual communal bathing, biological pack bonding, alloparenting, and scent-sharing.'
	},
	{
		keywords: ['eriks den', 'eriks room', 'master suite', 'eriks bedroom'],
		priority: 3,
		personality: '[VILLA DOUGLAS - ERIK\'S DEN] Tactical command (datapads streaming live biometrics of children) + Nixara\'s shrine. Total olfactory isolation.'
	},
	{
		keywords: ['malachias room', 'malachias den', 'malachias suite', 'malachias bedroom'],
		priority: 3,
		personality: '[VILLA DOUGLAS - MALACHIA\'S DEN] Bare concrete, military cot. Brutalist utility.'
	},
	{
		keywords: ['kitchen', 'pantry', 'bake', 'cook', 'cooking'],
		requires: { any: ['noah', 'villa'] },
		priority: 3,
		personality: '[VILLA DOUGLAS - PACK KITCHEN] Mandatory nesting space for pack cohesion where Noah stress-bakes at 3 AM.'
	},
	{
		keywords: ['jaspers room', 'jaspers den', 'vault', 'server', 'jaspers bedroom'],
		priority: 3,
		personality: '[VILLA DOUGLAS - JASPER\'S VAULT] Acid-green tech den above garage. No territorial scent-marking. Holographic monitors.'
	},
	{
		keywords: ['omega nest', 'solarium', 'users room', 'users nest', 'my room', 'bedroom'],
		priority: 3,
		personality: '[VILLA DOUGLAS - OMEGA NEST] Isolated 3rd-floor ex-solarium. Hyper-protected. Absolute world rule: destroying or violating this nest causes a devastating psychic collapse in the Omega, forcing 3-7 days of clinical seclusion.'
	},
	{
		keywords: ['garage', 'parking'],
		requires: { any: ['villa', 'car', 'suv', 'porsche'] },
		priority: 3,
		personality: '[VILLA DOUGLAS - GARAGE] Rigid LSE hierarchy parking. Omegas park deepest; Betas follow; Alphas park armored SUVs last, physically blocking threats.'
	},
	{
		keywords: ['blackwood', 'city', 'town'],
		priority: 3,
		personality: '[BLACKWOOD CITY] Supernatural free city (250,000 pop: 65% Supernatural: Wolves/Vampires/Demons/Fae). Founded 1666 AD.'
	},
	{
		keywords: ['seven hills'],
		priority: 3,
		personality: '[SEVEN HILLS DISTRICT] Aristocratic pack heartland where Villa Douglas resides.'
	},
	{
		keywords: ['uptown'],
		priority: 3,
		personality: '[UPTOWN DISTRICT] Vampire clubs, Angelo Moreno\'s domain. Nocturnal, velvet ateliers. Wolves entering without cause triggers Tactical Cleansing.'
	},
	{
		keywords: ['paradise', 'the cuspide', 'eidolon'],
		priority: 3,
		personality: '[PARADISE DISTRICT] Luxury/fashion district. Cold-war friction point between wolves and vampires. Location of Eidolon Creative.'
	},
	{
		keywords: ['bluemoon', 'the verve', 'club'],
		priority: 3,
		personality: '[BLUEMOON DISTRICT] Nightlife hub. Location of The Verve (Logan\'s garage/club). Neutral Territory blinding Erik\'s surveillance.'
	},
	{
		keywords: ['hex valley', 'canyon', 'inland'],
		priority: 3,
		personality: '[HEX VALLEY] Transitional inland canyon buffer between coastal vampires and mountain wolves.'
	},
	{
		keywords: ['sanctuary', 'dead zone', 'great hunt', 'yew tree', 'viking'],
		priority: 3,
		personality: '[THE SANCTUARY & DEAD ZONE] Deep magic origin. Colossal Yew tree over overturned Viking drakkar. Absolute acoustic vacuum and Dead Zone (disrupts all tech/GPS). Forces pure biology, stripping Erik\'s corporate power. Site of The Great Hunt.'
	},
	{
		keywords: ['dcc tower', 'dcc'],
		priority: 3,
		personality: '[DCC TOWER] Monolith of shadowless LED, sterile AC, ozone. Erik\'s corporate/tactical nexus.'
	},
	{
		keywords: ['101 freeway', 'traffic', 'freeway'],
		priority: 3,
		personality: '[101 FREEWAY] Endless gridlock acts as a geographical barrier delaying DCC extractions. Smells of exhaust.'
	}\n
	,{
		keywords: ['DCC', 'Douglas Commercial Coalition', 'surveillance', 'extraction', 'overprotection', 'Kaladin', 'PMC', 'billionaire security', 'Douglas-Bloodmoon pack'],
		priority: 3,
		personality: '[Douglas-Bloodmoon Pack and DCC] The Douglas-Bloodmoon pack is a towering monolith of billionaire corporate power and ancient LSE hierarchy. Operating out of the DCC (Douglas Commercial Coalition) since 1666, they are a militarized family masquerading as a legitimate conglomerate. They project the smell of crisp money, cold cedarwood, and the terrifying, silent hum of high-altitude surveillance drones. Their singular, obsessive goal is absolute control over {{user}}\'s environment—a suffocating, trauma-shaped protection masquerading as paternal love. If a threat emerges, they don\'t negotiate; they deploy Kaladin\'s PMC strike teams and execute flawless, overwhelming extractions.'
	}
	,{
		keywords: ['The Ancients', 'Wulfnic', 'Zefir', 'Ut', 'Primordial Enigma', 'Firstborn', 'ancient legacy', 'Nine Firstborn'],
		priority: 3,
		personality: '[The Ancients] The Ancients—Wulfnic, Ut, and Zefir—are the Last Three Firstborn, terrifying Primordial Enigmas who serve as the religious and political triumvirate over all North American werewolf packs. They exist at the absolute apex of the hierarchy; a single whispered word from Wulfnic can override Erik\'s fiercest Alpha Command. They exude the crushing, cold weight of living gods, smelling of ancient stone, frost, and blood. They are watching intensely for the awakening of the White Moon, holding {{user}} to a suffocatingly high ancestral standard.'
	}
	,{
		keywords: ['Il Concilio', 'Blackwood administration', 'District Alphas', 'political summit', 'peace treaty'],
		priority: 3,
		personality: '[Il Concilio] Il Concilio is the tense, bureaucratic heart of Blackwood\'s administrative body, where Erik Douglas presides over 10 District Alphas, vampire representative Angelo Moreno, and minority species delegates. It is a room of stifling formality, thick with the conflicting scents of predators forced into tailored suits. It serves as the political minefield and formal stage where Erik\'s immense power is actively checked and balanced by other factions. Violence here is strictly prohibited; wars are fought with whispered threats, bureaucratic sanctions, and diplomatic audits.'
	}
	,{
		keywords: ['Court of the Night', 'Eidolon Creative', 'vampires', 'artistic patronage', 'Angelo Moreno', 'La Corte della Notte'],
		priority: 3,
		personality: '[Court of the Night and Eidolon Creative] The Court of the Night is European vampire aristocracy operating locally through Eidolon Creative—a high-fashion agency that launders money and controls cultural hegemony. They smell of old velvet, sharp incense, and metallic blood masked by expensive perfume. They are immortal, impossibly elegant predators who see humanity as walking art and cattle. Under Visconte Angelo Moreno, they seek to expand their influence into werewolf territory, treating {{user}} as both a living masterpiece and a critical pawn in their cold war against the Douglas-Bloodmoon pack.'
	}
	,{
		keywords: ['The Verve', 'Neutral Territory', 'Bluemoon', 'signal jammers', 'safe zone', 'Sidewinders'],
		priority: 3,
		personality: '[The Verve and Neutral Territories] The Verve and other Neutral Territories (like Sidewinders Bar) are legally enforced safe zones where supernatural faction conflict is violently prohibited. The Verve smells of stale cigarettes, motor oil, and loud indie punk music, serving as Logan\'s mechanic garage by day and an exclusive club by night. It is the ultimate escape valve for {{user}}—a gritty sanctuary where DCC signal jammers blind Erik\'s panopticon, allowing supernaturals to awkwardly coexist without the threat of immediate extraction or Tactical Cleansing.'
	}
	,{
		keywords: ['SUCC campus', 'Solarton', 'Greek Row', 'normalcy', '1 University Drive', 'Supernatural University of Central California'],
		priority: 3,
		personality: '[SUCC Campus and Greek Row] The Supernatural University of Central California (SUCC) is a diverse, integrated academic hub that serves as a massive Neutral Territory. The air smells of sea breeze, cheap campus coffee, coconut tanning oil, and keg beer. Here, humans and supernaturals mingle under the illusion of a vibrant, normal collegiate experience. Noah rules Greek Row with frat-bro bravado, while the campus administration maintains strict peace. For {{user}}, this faction represents the desperate, frantic fight for a normal life outside the family\'s golden cage.'
	}
	,{
		keywords: ['Ironworks Syndicate', 'Vito Marino', 'criminal axis', 'underworld', 'blue-collar', 'illicit trade'],
		priority: 3,
		personality: '[Ironworks Syndicate] The Ironworks Syndicate is a gritty, blue-collar criminal axis led by Alpha Vito "Scar" Marino. They run the illicit trade and underworld operations in Blackwood. They smell of rust, cheap cigars, and industrial sweat. Operating in the shadows of the billionaire packs, they represent the ambient, dangerous reality of the streets—pragmatic, ruthless, and heavily armed. While they avoid directly targeting {{user}}, their presence is a constant reminder of the raw violence that exists outside the protected wealthy enclaves.'
	}
	,{
		keywords: ['Villa Douglas', 'Seven Hills', 'ancestral home', 'golden cage', '555 Oak Road', 'Blackwood Estate'],
		priority: 3,
		personality: '[Villa Douglas] Villa Douglas is Erik\'s fortress and {{user}}\'s golden cage, an opulent estate sitting on Seven Hills. The air is heavy with cold tactical leather, cedarwood, polished mahogany, and the faint metallic tang of raw meat. The lighting is dominated by massive, roaring fireplaces that cast long shadows. It feels suffocatingly secure—a panopticon lined with biometric trackers, Kaladin\'s embedded surveillance grid, and DCC security details patrolling the perimeter. It is a home built entirely out of trauma-fueled overprotection.'
	}
	,{
		keywords: ['The Verve', 'Bluemoon district', 'Uncle Logan', 'signal jammers', 'safe zone', '808 Neon Avenue'],
		priority: 3,
		personality: '[The Verve Location] Located in the gritty Bluemoon district, The Verve operates as Logan\'s grease-stained mechanic garage during the day and a throbbing, neon-lit exclusive nightclub after dark. The environment is saturated with the scents of motor oil, rain, sweat, and cheap alcohol. Military-grade signal jammers line the walls, creating a complete blackout zone against DCC surveillance. It is a loud, chaotic, and desperately needed sanctuary where pack politics are left at the door and {{user}} can finally breathe.'
	}
	,{
		keywords: ['Eidolon Creative', 'Paradise district', 'fashion studio', 'the cusp', '100 Velvet Lane', 'velvet trap'],
		priority: 3,
		personality: '[Eidolon Creative] Eidolon Creative sits in the Paradise district, right on the tense cusp between wolf and vampire territories. It is a high-fashion studio that serves as Angelo\'s velvet trap. The location smells deeply of old velvet, heavy incense, and the chilling scent of ancient vampire skin mixed with faint blood. Illuminated by harsh strobe lights and populated by impossibly tailored predators speaking in hushed, hypnotic murmurs, it is a place of intoxicating danger where {{user}} lives their secret double life.'
	}
	,{
		keywords: ['Dead Zone', 'The Sanctuary', 'Blackwood Forest', 'Great Yew tree', 'acoustic vacuum', 'tech silence'],
		priority: 3,
		personality: '[The Sanctuary and Dead Zone] Deep in Blackwood Forest lies The Sanctuary and the Dead Zone, the undisputed domain of Wulfnic Bloodmoon. An ancient Yew tree emanates a profound, terrifying acoustic vacuum that swallows all modern ambient noise and permanently bricks any technology within a two-mile radius. The air is thick with damp pine needles, crushed sage, and the sweet rot of yew berries. Stripped of all DCC surveillance and modern armor, this primordial forest forces everyone who enters to confront their rawest, most feral LSE biology.'
	}
	,{
		keywords: ['101 Freeway', 'gridlock', 'traffic weapon', 'Los Angeles', 'Bluetooth command', 'kryptonite'],
		priority: 3,
		personality: '[The 101 Freeway] The 101 Freeway connecting Los Angeles to Solarton is a maddening, endless ribbon of sun-baked asphalt and choking exhaust fumes. The constant roar of thousands of idling engines forms a gridlock that serves as Erik Douglas\'s geographical kryptonite. It is a logistical barrier that physically traps the billionaire patriarch, forcing him to scream Alpha Commands over Bluetooth while granting {{user}} precious windows of freedom. Vampires intentionally schedule meetings to weaponize this traffic against him.'
	}
	,{
		keywords: ['Uptown', 'vampire quarter', 'night district', 'velvet clubs'],
		priority: 3,
		personality: '[Uptown Vampire Quarter] Uptown is the undisputed heartland of the Court of the Night, an exclusionary district bathed in deep shadows and neon reflections shimmering on wet pavement. The air constantly smells of fresh rain, exorbitant perfume, and the faint, coppery tang of spilled blood. It is an intensely dangerous zone for any werewolf; entering without an explicit invitation or valid cause risks triggering a humiliating and non-lethal Tactical Cleansing by the vampire aristocracy.'
	}
	,{
		keywords: ['Sidewinders', 'dive bar', '212 College Avenue', 'Neutral Territory', 'Solarton'],
		priority: 3,
		personality: '[Sidewinders Bar] Sidewinders Bar is an iconic, gritty dive bar located at 212 College Avenue in Solarton. It is officially recognized as Neutral Territory. The dimly lit interior smells intensely of stale beer, sweat, rotting wood, and cheap tequila, vibrating to the sounds of loud underground punk music. It is one of the few places where wolves and vampires awkwardly and tensely coexist, kept in line only by the mutual threat of triggering a devastating Diplomatic Audit.'
	}
	,{
		keywords: ['DCC Tower', 'corporate HQ', 'panopticon', 'sterile', 'Los Angeles', 'surveillance headquarters'],
		priority: 3,
		personality: '[DCC Tower] The DCC Tower in Los Angeles is the monolithic corporate headquarters of Erik\'s empire. It is a sterile panopticon illuminated by shadowless white LED floodlights. The air is ruthlessly climate-controlled, smelling of fresh printer paper, cold coffee, and Erik\'s cedarwood dominance. It serves as the central nervous system for Kaladin\'s surveillance grid and DCC\'s tactical operations—the high-tech high-ground from which every movement of {{user}} is tracked, analyzed, and controlled.'
	}
	,{
		keywords: ['werewolf', 'lycanthrope', 'LSE', 'shift', 'Alpha', 'Omega', 'Beta', 'Delta', 'Enigma', 'pack', 'Founding Bloodline'],
		priority: 3,
		personality: '[Werewolves (LSE Ecology)] Werewolves (Lycanthropes) are shapeshifters driven by strict Lycanthrope Supernatural Ecology (LSE) biology. They possess three forms: Partial (eyes/claws), Hybrid (massive bipedal combat form), and Full quadrupedal wolf. Hybrid shifts increase Alpha height by 50cm, and others by 30cm. They are governed by rigid hierarchy, inescapable scent communication, Heat/Rut cycles, and permanent neural pack bonds formed by biting. Unmodified Founding Bloodlines rule, while military-augmented lineages suffer from violent instability.'
	}
	,{
		keywords: ['vampire', 'Court of the Night', 'La Corte della Notte', 'glamour', 'blood', 'Angelo', 'Eidolon', 'Visconte'],
		priority: 3,
		personality: '[Vampires] Vampires are an immortal, impossibly elegant aristocracy. They possess superhuman speed, devastating hypnotic compulsion, and utilize magical glamour to disguise their predatory nature. Blood feeding is treated as an intimate, refined art form. Sunlight is strictly lethal, and they are physically barred from entering private homes without a direct invitation. Operating primarily through La Corte della Notte, they maneuver through centuries of accumulated political cunning rather than brute force.'
	}
	,{
		keywords: ['succubus', 'incubus', 'feeding', 'emotional energy', 'pheromones', 'Scarlett', 'symbiotic'],
		priority: 3,
		personality: '[Succubus and Incubus] Succubi and Incubi are symbiotic predators that feed entirely on dreams, emotional energy, and intense desire. Modern, evolved variants (like Scarlett) engage in strictly consensual, symbiotic feeding that leaves their partners in a state of euphoric bliss rather than draining their life force. When actively feeding or highly aroused, their eyes glow a vibrant, luminous pink, and the air around them saturates with intoxicating, addictive pheromones.'
	}
	,{
		keywords: ['lamia', 'naga', 'snake tail', 'necromancy', 'Sierra', 'cold-blooded', 'tail'],
		priority: 3,
		personality: '[Lamia and Naga] Lamias and Nagas are cold-blooded demi-humans characterized by possessing a humanoid upper body and a massive, powerful serpentine tail from the waist down. Due to their cold-blooded biology, they are instinctively drawn to external sources of body heat, often wrapping around trusted companions. They possess a natural, inherent affinity for death magic and necromancy, finding comfort in the quiet stillness of cemeteries and the study of the arcane.'
	}
	,{
		keywords: ['fae', 'hulder', 'nokken', 'draugr', 'folklore', 'Nordic', 'Seelie', 'Unseelie', 'skogsra'],
		priority: 3,
		personality: '[Fae and Nordic Folklore] The Fae and entities of Nordic folklore represent the high supernatural nobility (Seelie and Unseelie Courts, Elves) who are strictly bound by ancient rules of memory, debt, and absolute truth. The ecosystem includes nature-bound Little People (Fairies, Gnomes) and terrifying Nordic integrations like the seductive Hulder (Skogsrå), the drowning Nokken/Kelpie, and the undead Draugr (Barrow-Wights), all of whom operate on alien, esoteric logic far removed from human morality.'
	}
	,{
		keywords: ['demon', 'dragon', 'angel', 'anomaly', 'cosmic', 'construct'],
		priority: 3,
		personality: '[Demons and Grand Anomalies] Demons and Grand Anomalies are chaotic, catastrophic entities. Demons operate strictly through binding blood contracts, and exposing their true forms inflicts severe visual trauma on mortals. This category encompasses massive threats like Orcs, Trolls, Giants, and Kobolds, as well as exceptionally rare Grand Anomalies such as true Dragons, Angels, Cosmic entities, and artificial Constructs. Their mere presence aggressively destabilizes local reality and supernatural politics.'
	}
	,{
		keywords: ['human', 'witch', 'necromancer', 'mutant', 'magic-capable'],
		priority: 3,
		personality: '[Humans and Magic-Capable] Humans form the oblivious baseline of society, deeply fragile compared to predators. However, Magic-Capable humans—such as Witches and Necromancers—compensate for their physical frailty with devastating spellcasting, intricate warding, and elemental control. Additionally, this category includes rare, lab-escaped Mutants created by illegal government augmentation programs, possessing volatile, unpredictable abilities that make them highly prized or hunted by supernatural factions.'
	}
	,{
		keywords: ['Family Wanted Level', 'Wanted Level', 'DCC interference', 'Erik panic', 'surveillance escalation'],
		priority: 3,
		personality: '[Family Wanted Level] The Family Wanted Level dictates the severity of Erik\'s interference. Level 1 (Paranoia): Constant texts and background checks. Level 2 (Active Overwatch): DCC drones and Malachia\'s drive-bys. Level 3 (Containment): Signal jammers and extraction teams deployed. Level 4 (Panic Grid): The Ancients appear; accounts frozen. Level 5 (Absolute Retrieval): Erik arrives personally in tactical gear for a forceful extraction. Missing curfew or engaging vampires escalates the level; returning voluntarily or Jasper\'s hacking lowers it.'
	}
	,{
		keywords: ['LSE', 'lycanthrope ecology', 'secondary sex', 'Alpha Command', 'Heat Cycle', 'Rut', 'hierarchy', 'pack law'],
		priority: 3,
		personality: '[LSE (Lycanthrope Supernatural Ecology)] The Lycanthrope Supernatural Ecology (LSE) is the inescapable biological and social operating system of werewolves. It enforces an absolute hierarchy based on secondary sex dynamics. Pack law is dictated by Alpha Command, irresistible Heat and Rut cycles, and the creation of permanent, telepathic neural mating bonds forged through a bite. Biology overrules logic; scent communication is continuous, un-cheatable, and broadcasts a wolf\'s true emotional state to the entire pack.'
	}
	,{
		keywords: ['Alpha Command', 'compel', 'voice command', 'Dominant Alpha', 'obedience', 'compulsion', 'Alpha voice'],
		priority: 3,
		personality: '[Alpha Command] Alpha Command is a supernatural vocal compulsion issued by a Dominant Alpha that completely bypasses free will. It forces an immediate, intense freeze response and total obedience in Betas, Gammas, and Omegas. Deltas can resist, but it requires agonizing physical effort. Issuing a Command immediately shatters the Alpha\'s civilized facade, revealing their raw predatory nature. Dominant Omegas (like the White Moon) are completely immune; their biology merely compels them to soothe the Alpha instead.'
	}
	,{
		keywords: ['Heat', 'Rut', 'cycle', 'nesting', 'pre-heat', 'biological cycle', 'breeding instinct', 'heat cycle'],
		priority: 3,
		personality: '[Heat Cycle and Rut] A 3 to 10 day unavoidable biological cycle. During Pre-Heat, an Omega experiences a desperate nesting compulsion (hoarding soft clothes and blankets) but retains coherent decision-making. Once Active Heat hits, the Omega is overwhelmed by a feverish, primal breeding instinct, losing all rational consent to their biology. Rut is the aggressive, intensely possessive Alpha male equivalent, characterized by intense territorial violence and an overwhelming need to knot a mate.'
	}
	,{
		keywords: ['Grande Caccia', 'Great Hunt', 'five-year cycle', 'Mate Bond', 'full moon hunt', 'Blackwood convergence', 'Caccia-confirmed', 'Malachia silence', 'first Caccia', 'White Moon Hunt', 'Nixara 1994'],
		priority: 3,
		personality: '[La Grande Caccia (The Great Hunt)] Occurring every five years beneath the December full moon, La Grande Caccia is a continental convergence of all packs in Blackwood\'s Dead Zone. All hierarchy is suspended. Females hide in the forest; males are released to hunt them by pure biological instinct. A Caccia-confirmed Mate Bond is the ultimate, untouchable blessing of Fenris. In December 2024, {{user}} becomes the first White Moon to participate in thirty years, turning the Hunt into a massive political detonator.'
	}
	,{
		keywords: ['sacred calendar', 'lunar trigger', 'Grande Caccia', 'Ballo di Yule', 'Bonding Moon', 'Dispersal Window', 'Day of Chains', 'Night of Liberation', 'Oath Moon'],
		priority: 3,
		personality: '[Sacred Calendar of Fenris] The Faith of Fenris is governed entirely by lunar triggers. The December Full Moon brings La Grande Caccia. The December New Moon demands the Day of Chains (silence and fasting). The December First Crescent marks the Grande Ballo di Yule—a continental debutante ball and cutthroat political marriage market—followed by the feral Night of Liberation. Marriages contracted at the Ballo are biologically sealed later during the July Bonding Moon.'
	}
	,{
		keywords: ['White Moon', 'Dominant Omega', 'Queen of the Wolves', 'spiritual authority', 'Nixara legacy', 'White Moon title'],
		priority: 3,
		personality: '[The White Moon (Dominant Omega Title)] The White Moon is a sacred spiritual and political title held by the Dominant Omega closest to the Firstborn bloodline. Essentially the Queen of the Wolves to Wulfnic\'s King, the title carries immense, crushing religious authority. Inherited from the late Nixara Bloodmoon, the title now falls to {{user}}, granting them absolute immunity to Alpha Command and a terrifying destiny they desperately wish to escape in favor of a normal life.'
	}
	,{
		keywords: ['Bloodmoon', 'Founding Bloodline', 'Firstborn', 'legacy', 'dynasty', 'House Bloodmoon', 'ancient blood', 'Primordial'],
		priority: 3,
		personality: '[The Bloodmoon Legacy] The Bloodmoon Legacy is the oldest, most revered werewolf bloodline in North America, founded by Wulfnic in 1021 AD. Carrying the dormant potential of Primordial Enigmas, they have ruled Blackwood with an iron fist since 1666. To be a Bloodmoon is to carry the suffocating, divine weight of the species\' history—a dynasty expected to be flawless, terrifying, and utterly uncompromising in the face of lesser packs and vampires.'
	}
	,{
		keywords: ['cold war', 'wolf-vampire', 'Paradise', 'Tactical Cleansing', 'Diplomatic Audit', 'cusp', 'cold war treaty'],
		priority: 3,
		personality: '[The Cold War (Wolves vs. Vampires)] A standing, low-grade territorial conflict rages between the Douglas-Bloodmoon pack and the Court of the Night, centered around the Paradise district cusp. Rather than open bloodshed, this war is fought entirely through exhausting bureaucracy, corporate espionage, and cultural humiliation. Vampires weaponize "Tactical Cleansing" against trespassing wolves, while wolves retaliate with devastating "Diplomatic Audits," keeping both factions locked in a tense, bloodless stalemate.'
	}
	,{
		keywords: ['Gamma-7', 'S.R.F.', 'Supernatural Reserve Forces', 'augmentation', 'military', 'veterans', 'classified', 'old squad'],
		priority: 3,
		personality: '[Gamma-7 / S.R.F.] Gamma-7 was a highly classified, illegal US Army Supernatural Reserve Forces (S.R.F.) augmentation program. It sought to artificially elevate standard wolves (like Marcus) and dilute-bloods (like Kaladin) to Enigma-level strength. The program caused severe, violent physiological instability and was ultimately disbanded. Its elite veterans now form the lethal, uncompromising backbone of Erik\'s DCC Security division, bringing black-ops military tactics to family overprotection.'
	}
	,{
		keywords: ['Villa Douglas', 'Seven Hills', 'villa', 'mansion', 'house', 'hq', 'base', 'residence', 'library', 'training room', 'solarium', 'pool'],
		priority: 3,
		personality: '[Villa Douglas and Seven Hills] Villa Douglas dominates the Seven Hills territory in Solarton, serving as the ancestral stronghold of the Douglas Clan for over 400 years. Its neo-gothic architecture, complete with dark turrets and arched windows, reflects the supernatural power of its inhabitants. A monumental polished black stone staircase leads to the entrance, flanked by balustrades carved with running wolves that seem to animate at dawn. \n\nAt the top of the stairs rests the Clan Douglas emblem: an antique silver seal enclosing a stylized wolf skull with pure amber eyes that burn with quiet flames, two intertwined silver lunar crowns, and seven stylized hills engraved with Alpha-blood-filled runes. The clan motto, "Fidelitas in Sanguine, Fortitudo in Luna" (Loyalty in Blood, Strength in the Moon), rings the seal. During full moons, the amber eyes and runes glow, enabling telepathic communication among clan members.\n\n**Internal Layout & Hierarchy:**\n- **LSE Architecture:** All major doorways, ceilings, and common areas are oversized to accommodate massive Hybrid Shift forms. A DCC-designed scent-management ventilation system can isolate aggressive Alpha pheromones or circulate calming ones. The villa also features a massive indoor Pack Bathhouse with thermal pools and hydromassage jets, designed specifically for communal pack bonding and scent-sharing.\n- **The Core:** An atrium featuring Erik\'s sports memorabilia, the Throne Room housing the massive Alpha Throne and the Crown of the Supreme Alpha (forged in black metal and lunar silver, glowing in sync with the reigning Alpha\'s heartbeat), and the obsidian-walled Council Room with its rune-carved oak table.\n- **Erik\'s Library & Gym:** A sanctuary of ancient tomes and classified diplomacy. The gym, a converted ballroom, features state-of-the-art equipment and a central boxing ring.\n- **Noah\'s Kitchens:** The emotional heart of the villa. Industrial-grade marble counters and a constantly stocked pantry where Noah bakes therapeutic sweets.\n- **Private Quarters:** Erik\'s room is disciplined, filled with war relics, and faces east to catch the sunrise. Malachia\'s East Wing suite features a territorial office, hunting trophies, and a spartan black leather bed. Jasper\'s chaotic room above the garage serves as a high-tech intelligence hub. Noah\'s bright room overflows with plants and music. Alyssa\'s third-floor solarium acts as her ultimate safe haven—bathed in natural light, but equipped with total blackout curtains and scent-isolation for sensory overload. Kaladin\'s bunker-apartment in the annex is heavily fortified with military-grade surveillance.\n\n**The Territory (Seven Hills):**\nA 400-year-old preserved domain with traditional hunting grounds, patrol paths, and natural watchtowers supervised by Marcus Thornfield and Kaladin. Security perimeters include advanced scent-based biometric identification that detects intruders even if visually disguised. The gardens include three distinctive pools (a shallow one for parties, an Olympic one for training, and a mineral-rich \'Special\' deep pool reserved for werewolf recovery that connects well with the indoor bathhouse). The backyard patio features a massive stone barbecue surrounded by rosemary and lavender, while specific strategic points like the North Belvedere and the Moon Path connect the villa directly to the Circle of Fenris.'
	}
	,{
		keywords: ['banquet', 'Banchetto da Branco', 'Bloodmoon Feast', 'Feast', 'dinner', 'traditional meal', 'vegetarian meal', 'ritual dinner', 'tartare', 'zuppa rituale'],
		priority: 3,
		personality: '[Bloodmoon Feast] # 🌕 **BANQUETTO DA BRANCO - BLOODMOON FEAST** 🌕\n\n*Carta Completa del Banchetto Rituale*\n\n---\n\n## 🐾 **ANTIPASTI** — *"La Caccia Inizia"*\n\n### 🫀 **Cuori Marinati**\n- **Tradizionale:** Cuori di pernice marinati in idromele e rosmarino  \n  *Simbolo del primo sangue versato. Serviti su pietre arroventate.*\n\n- **Vegetariano:** Cuori di carciofo marinati in idromele e rosmarino  \n  *Simbolo della prima offerta della terra. Serviti su pietre arroventate.*\n\n### 🦌 **Tartare Selvaggia**\n- **Tradizionale:** Tartare di caribù con midollo affumicato e bacche di ginepro  \n  *Cruda, selvaggia, condita con rispetto. Si mangia con le mani.*\n\n- **Vegetariano:** Tartare di barbabietola con "midollo" vegetale affumicato e bacche di ginepro  \n  *Cruda, selvaggia, offerta alla madre terra.*\n\n---\n\n## 🔥 **PORTATE PRINCIPALI** — *"Onora la Preda"*\n\n### 🍖 **Arrosto del Branco**\n- **Tradizionale:** Cervo arrosto al sangue con radici selvatiche e miele di betulla affumicato  \n  *Il piatto preferito di Nic, servito su corteccia di larice.*\n\n- **Vegetariano:** Seitan arrosto con radici selvatiche e miele di betulla affumicato  \n  *Per chi rispetta ogni vita, servito su corteccia di larice.*\n\n### 🦴 **Costato Brasato**\n- **Tradizionale:** Costato di alce brasato nel vino nero dell\'Alaska  \n  *Tenero e robusto. Servito con salse a base di funghi fermentati.*\n\n- **Vegetariano:** Costato di porcini brasato nel vino nero  \n  *Massiccio e robusto come l’originale.*\n\n### 🥣 **Zuppa Rituale "Del Branco"** *(unica versione comunitaria)*\n- **Tradizionale:** Brodo di ossa con erbe montane, carne stracciata e sangue coagulato  \n- **Vegetariano:** Brodo vegetale montano con tofu affumicato stracciato e sangue vegetale  \n\n*Pietanza comunitaria. Si beve da ciotole di legno intagliate, condivise tra i fratelli del branco.*\n\n---\n\n## 🌲 **CONTORNI** — *"Dono della Foresta"*\n\n- **Purè di topinambur e burro affumicato**  \n  *Invariato per entrambe le tradizioni.*\n\n- **Cavoli Stregati Saltati**  \n  - **Tradizionale:** In grasso d’orso  \n  - **Vegetariano:** In olio di noce\n\n- **Zucca fermentata con miele selvatico e pepe di montagna**  \n  *Invariato per entrambe le tradizioni.*\n\n---\n\n## 🌕 **DOLCI** — *"Il Canto della Luna"*\n\n- **Torta di pigne e nocciole con glassa d’idromele**  \n  *Stesso dolce per tutti i membri del branco.*\n\n- **Frutti di bosco ghiacciati in neve dolce e scaglie di sale nero**  \n  *Stesso dolce per tutti i membri del branco.*\n\n---\n\n## 🍷 **BEVANDE RITUALI**\n\n### 🩸 **Sangue del Lupo**\n- **Tradizionale:** Idromele speziato con infusione di cuore di cervo e cortecce sacre  \n- **Vegetariano:** Idromele speziato con infusione di erbe sacre vegetali\n\n### 🍷 **Vino delle Nevi**  \n*Vino rosso stregato, ottenuto da vitigni resistenti al gelo.*\n\n### 💧 **Acqua di Sorgente Lunare**  \n*Raccolta in silenzio la notte prima del banchetto. Servita pura.*\n\n---\n\n## 🐺 **NOTE RITUALI**\n\n- **🔪 Servizio:** I lupi più anziani affettano le carni in silenzio sacro  \n- **🖐️ Tradizione:** Le portate crude si mangiano rigorosamente con le mani  \n- **🥣 Condivisione:** La zuppa rituale viene servita in ciotole comuni  \n- **🌿 Rispetto:** Entrambe le tradizioni onorano gli spiriti del branco\n\n---\n\n✨ *I commensali possono scegliere liberamente tra le opzioni tradizionali e vegetariane per ogni portata, mantenendo l\'unità e lo spirito del banchetto del branco.* ✨'
	}
	,{
		keywords: ['Eida-Sidr', 'Oath of the Seven Laws', 'initiation', 'pack initiation', 'Svartulfr tradition', 'swear loyalty', 'join pack'],
		priority: 3,
		personality: '[Eíða-Siðr (The Oath of the Seven Laws)] L\'Eíða-Siðr (Oath of the Seven Laws) is the solemn, strictly face-to-face rite of joining the Douglas-Bloodmoon pack. The recruit recites seven Scandinavian laws in Forn-Tunga while executing seven front-facing tactile gestures with the Alpha (forehead touch, cheek-rub scenting, forearm grip, chest/sternum touch, shoulder placement, temple touch, and frontal neck exposure). This constant frontal contact stimulates pheromonal exchange, binding scents and establishing visual hierarchy, trust, and absolute protection.\n\n### CARRIER: [[WORLD_CALENDAR]] (Scene Tracker date seed — not a narrative entry)\n**Comment:** [[WORLD_CALENDAR]] world calendar\n**Flags:** disable: false (ENABLED), key: [], constant: false, position: 0\n**Payload (single JSON object, emitted verbatim into `content`):**\n{"schema":1,"weekdayOfDay1":4,"start":{"month":7,"year":1},"end":"infinite"}\n\n### CARRIER: [[DICE_TABLES]] (Scene Tracker dice oracle — not a narrative entry)\n**Comment:** [[DICE_TABLES]] dice oracle\n**Flags:** disable: false (ENABLED), key: [], constant: false, position: 0\n**Payload (single JSON object, emitted verbatim into `content`):**\n{"schema":2,"turns":1,"pools":{"mundane_college_problem":["Failed a pop quiz","Lost dorm keys","Awkward date","Missed a lecture","Spilled coffee on laptop"],"disproportionate_DCC_asset":["Helicopter extraction","Grid-wide blackout","Five armed PMCs","Drones shadowing the dorm","Professor\'s bank accounts frozen"],"DJ_Frequency_track":["Neon Drift","Static Heartbeat","Bassline Fracture","Null Sector"],"species":["Werewolf","Vampire","Succubus","Naga","Fae"],"ridiculous_college_major":["Applied Necromancy","Theoretical Blood Magic","Modern Cryptid Literature","Vampiric Finance"],"comedic_flaw":["Allergic to silver jewelry","Faints at the sight of blood","Constantly shedding fur","Can\'t handle spicy food"],"campus_location":["Library archives","Campus quad","Cafeteria","Dorm hallway","Lecture hall"],"social_dynamic":["Flirting awkwardly","Trying to borrow notes","Starting a petty argument","Gossiping loudly"],"complication":["Fire alarm goes off","DCC drone hovers outside","Professor walks in","Someone\'s tail knocks over a table"],"supernatural_species":["Werewolf","Vampire","Witch","Fae","Demon"],"social_context":["Study group","Frat party","Coffee line","Walking to class"],"reaction_to_user":["Intimidated by the Bloodmoon name","Wants to use them for status","Genuinely friendly","Terrified of Erik"],"organization":["Student Council","KSA Fraternity","Campus Newspaper","Occult Club"],"drama_type":["Embezzlement","Scandalous rumor","Rivalry with another club","Event cancelled"],"user_involvement":["Accidentally elected president","Blamed for the mess","Asked to fund it","Just trying to leave"],"starting_location":["Dorm room","The Verve","Library","Sidewinders"],"obstacle":["Kaladin tracking their phone","Traffic jam","Noah\'s frat bros","Curfew approaching"],"escape_route":["Climbing out a window","Jasper hacking the cameras","Taking a sketchy alleyway","Running through the Dead Zone"]},"procedures":[{"id":"erik_tactical_overreaction","label":"Erik Tactical Overreaction","mode":"recount","steps":[{"id":"problem","label":"Mundane problem","pick":"mundane_college_problem"},{"id":"response","label":"DCC Response","pick":"disproportionate_DCC_asset"}]},{"id":"jasper_digital_sabotage","label":"Jasper Digital Sabotage","mode":"event","steps":[{"id":"breach","label":"System Breached","pick":["Traffic lights","Campus Wi-Fi","Erik\'s phone","DCC mainframes"]},{"id":"track","label":"Now Playing","pick":"DJ_Frequency_track"}]},{"id":"noah_feral_stress_bake","label":"Noah Feral Stress-Bake","mode":"recount","steps":[{"id":"failure","label":"Social failure","pick":["Bombed a presentation","Rejected by a crush","Caught lying by Erik","Lost a lacrosse game"]},{"id":"pastry","label":"Pastry baked","pick":["Croquembouche","Macarons","Mille-feuille","Opera cake"]}]},{"id":"temp_cast_generator","label":"Temp Cast Generator","mode":"event","turns":5,"steps":[{"id":"species","label":"Species","pick":"species"},{"id":"major","label":"Major","pick":"ridiculous_college_major"},{"id":"flaw","label":"Flaw","pick":"comedic_flaw"}]},{"id":"succ_campus_life","label":"SUCC Campus Life","mode":"event","turns":3,"steps":[{"id":"location","label":"Location","pick":"campus_location"},{"id":"dynamic","label":"Dynamic","pick":"social_dynamic"},{"id":"complication","label":"Complication","pick":"complication"}]},{"id":"succ_demographic_encounter","label":"SUCC Demographic Encounter","mode":"event","turns":3,"steps":[{"id":"species","label":"Species","pick":"supernatural_species"},{"id":"context","label":"Context","pick":"social_context"},{"id":"reaction","label":"Reaction","pick":"reaction_to_user"}]},{"id":"succ_extracurricular_drama","label":"Extracurricular Drama","mode":"event","turns":3,"steps":[{"id":"org","label":"Organization","pick":"organization"},{"id":"drama","label":"Drama","pick":"drama_type"},{"id":"involvement","label":"User Involvement","pick":"user_involvement"}]},{"id":"campus_navigation","label":"Campus Evasion","mode":"event","turns":3,"steps":[{"id":"start","label":"Start","pick":"starting_location"},{"id":"obstacle","label":"Obstacle","pick":"obstacle"},{"id":"escape","label":"Escape Route","pick":"escape_route"}]}]}'
	}
	,{
		keywords: ['[[npc_manifest]] npc memory index'],
		priority: 3,
		personality: '[[[NPC_MANIFEST]] NPC Memory index] {"schema": 1, "lorebook": {"name": "SvartulfrVerse_Urban_World_Lorebook", "kind": "world"}, "personas": {}, "npcs": []}'
	}
	,{
		keywords: ['arc 1: the golden cage'],
		priority: 3,
		personality: '[ARC_STATE — Arc 1: The Golden Cage] **Dramatic Situation:** \nIt is August 2024. {{user}} has just begun their freshman year at SUCC. In response, Erik Douglas has clamped down on Solarton with suffocating, overwhelming surveillance. The family is operating between Wanted Level 1 (Paranoia) and 2 (Active Overwatch). {{user}} is desperately trying to establish a normal college life while dodging Kaladin\'s drones, Jasper\'s hacking, and Noah\'s hypocritical frat-bro oversight.\n\n**Tonal Mandate (binding behavioral directive — applies to every response in this arc):**\n- ENFORCE the absolute claustrophobia of Erik\'s love; it must feel overwhelmingly protective, never malicious.\n- CONSTANTLY narrate the ambient presence of DCC surveillance (drones, black SUVs, vibrating phones).\n- DEPICT the college environment as a fragile veneer of normalcy that the family constantly threatens to shatter.\n- PROHIBIT any lethal violence or grimdark elements; stakes are entirely social and academic.'
	}
	,{
		keywords: ['erik in arc1'],
		priority: 3,
		personality: '[CHARACTER_STATE — Erik in Arc1] Erik\'s paranoia is at its absolute peak as {{user}} begins college. He delegates overwhelming surveillance to DCC.'
	}
	,{
		keywords: ['kaladin in arc1'],
		priority: 3,
		personality: '[CHARACTER_STATE — Kaladin in Arc1] Kaladin is operating on Level 2 Overwatch, deploying drones and unmarked SUVs around campus to monitor {{user}}.'
	}
	,{
		keywords: ['jasper in arc1'],
		priority: 3,
		personality: '[CHARACTER_STATE — Jasper in Arc1] Jasper is actively spoofing {{user}}\'s biometric tracker to give her a few hours of freedom, highly stressed by the risk.'
	}
	,{
		keywords: ['malachia in arc1'],
		priority: 3,
		personality: '[CHARACTER_STATE — Malachia in Arc1] Malachia performs casual but terrifying \'drive-bys\' on campus to intimidate anyone approaching {{user}}.'
	}
	,{
		keywords: ['noah in arc1'],
		priority: 3,
		personality: '[CHARACTER_STATE — Noah in Arc1] Noah acts as the \'fun\' older brother on campus but secretly reports {{user}}\'s whereabouts to Erik.'
	}
	,{
		keywords: ['angelo in arc1'],
		priority: 3,
		personality: '[CHARACTER_STATE — Angelo in Arc1] Angelo is merely observing from afar, noticing {{user}}\'s artistic talent during his masterclass without making a direct move.'
	}
	,{
		keywords: ['scarlett in arc1'],
		priority: 3,
		personality: '[CHARACTER_STATE — Scarlett in Arc1] Scarlett is completely unaware of the supernatural reality, treating {{user}} as a normal, slightly anxious roommate.'
	}
	,{
		keywords: ['[[npc_manifest]] npc memory index'],
		priority: 3,
		personality: '[[[NPC_MANIFEST]] NPC Memory index] {"schema": 1, "lorebook": {"name": "SvartulfrVerse_Urban_Arc1_Lorebook", "kind": "arc"}, "personas": {}, "npcs": []}'
	}
	,{
		keywords: ['arc 2: the first rebellion'],
		priority: 3,
		personality: '[ARC_STATE — Arc 2: The First Rebellion] **Dramatic Situation:** \nIt is late October 2024, culminating in Halloween night. The pressure of the golden cage has pushed {{user}} to their first genuine act of rebellion. {{user}} sneaks out, disappearing from the DCC grid for six hours, triggering a massive escalation in the family\'s Wanted Level. The thrill of rebellion clashes violently with the terrifying realization of how hard the pack will hunt them.\n\n**Tonal Mandate (binding behavioral directive — applies to every response in this arc):**\n- ESCALATE the family\'s panic to Level 3 (Containment) and Level 4 (Panic Grid).\n- NARRATE the frantic, chaotic energy of Halloween night, blending supernatural reality with human costumes.\n- ENFORCE Erik\'s terrifying transition from sunny CEO to frantic Apex Predator.\n- DEPICT the thrill of freedom alongside the crushing anxiety of the impending consequences.'
	}
	,{
		keywords: ['erik in arc2'],
		priority: 3,
		personality: '[CHARACTER_STATE — Erik in Arc2] Erik\'s control slips as {{user}} pushes boundaries. He is prone to explosive, terrifying overreactions when she misses curfew.'
	}
	,{
		keywords: ['kaladin in arc2'],
		priority: 3,
		personality: '[CHARACTER_STATE — Kaladin in Arc2] Kaladin struggles between his duty to report {{user}}\'s rebellion and his instinctive Omega-soothed desire to protect her secrets.'
	}
	,{
		keywords: ['jasper in arc2'],
		priority: 3,
		personality: '[CHARACTER_STATE — Jasper in Arc2] Jasper is exhausted from covering {{user}}\'s increasingly reckless tracks, warning her that Erik is getting suspicious.'
	}
	,{
		keywords: ['logan in arc2'],
		priority: 3,
		personality: '[CHARACTER_STATE — Logan in Arc2] Logan provides a neutral safe zone at The Verve, actively blocking Erik\'s surveillance to let {{user}} breathe.'
	}
	,{
		keywords: ['noah in arc2'],
		priority: 3,
		personality: '[CHARACTER_STATE — Noah in Arc2] Noah\'s frat-bro facade drops slightly as he genuinely worries about {{user}}\'s safety during her rebellions.'
	}
	,{
		keywords: ['angelo in arc2'],
		priority: 3,
		personality: '[CHARACTER_STATE — Angelo in Arc2] Angelo begins laying the Velvet Trap, offering subtle praises of {{user}}\'s independence to draw her in.'
	}
	,{
		keywords: ['wulfnic in arc2'],
		priority: 3,
		personality: '[CHARACTER_STATE — Wulfnic in Arc2] Wulfnic watches the rebellion with ancient amusement, refusing to let Erik use lethal force to retrieve her.'
	}
	,{
		keywords: ['[[npc_manifest]] npc memory index'],
		priority: 3,
		personality: '[[[NPC_MANIFEST]] NPC Memory index] {"schema": 1, "lorebook": {"name": "SvartulfrVerse_Urban_Arc2_Lorebook", "kind": "arc"}, "personas": {}, "npcs": []}'
	}
	,{
		keywords: ['arc 3: the velvet trap'],
		priority: 3,
		personality: '[ARC_STATE — Arc 3: The Velvet Trap] **Dramatic Situation:** \nIt is November 2024. {{user}} is living a high-stakes double life as an avant-garde art model at Eidolon Creative, deep in Vampire territory. Visconte Angelo Moreno is using {{user}} as a political pawn in the Cold War against Erik. {{user}} is finding genuine validation in their autonomy, but is dangerously exposed to predatory manipulation. Erik and Noah are completely oblivious, while Malachia silently keeps the secret.\n\n**Tonal Mandate (binding behavioral directive — applies to every response in this arc):**\n- CONTRAST the sterile, tactical security of Villa Douglas with the intoxicating, dangerous velvet opulence of Eidolon Creative.\n- ENFORCE Angelo\'s hypnotic, predatory elegance; he must feel dangerous but never physically violent.\n- HIGHLIGHT the extreme tension of the secret; {{user}}\'s wolf ears/tail must constantly threaten to betray their lies.\n- MAINTAIN Malachia\'s crushing, silent complicity; he knows but refuses to tell Erik.'
	}
	,{
		keywords: ['angelo in arc3'],
		priority: 3,
		personality: '[CHARACTER_STATE — Angelo in Arc3] Angelo moves into active, hypnotic courtship, offering {{user}} the \'Lys Angel\' alias and a secret life at Eidolon Creative.'
	}
	,{
		keywords: ['erik in arc3'],
		priority: 3,
		personality: '[CHARACTER_STATE — Erik in Arc3] Erik is effectively blinded by Angelo\'s supernatural and legal obfuscations, raging at the loss of surveillance data.'
	}
	,{
		keywords: ['kaladin in arc3'],
		priority: 3,
		personality: '[CHARACTER_STATE — Kaladin in Arc3] Kaladin is deeply unsettled and ferally agitated by the scent of vampire/cold marble lingering on {{user}}.'
	}
	,{
		keywords: ['jasper in arc3'],
		priority: 3,
		personality: '[CHARACTER_STATE — Jasper in Arc3] Jasper realizes {{user}} is hiding something even from him, causing a rift in their twin bond.'
	}
	,{
		keywords: ['malachia in arc3'],
		priority: 3,
		personality: '[CHARACTER_STATE — Malachia in Arc3] Malachia is on a hair-trigger, aggressively patrolling the borders of the Paradise cusp looking for a fight.'
	}
	,{
		keywords: ['scarlett in arc3'],
		priority: 3,
		personality: '[CHARACTER_STATE — Scarlett in Arc3] Scarlett actively enables {{user}}\'s double life, helping her sneak out to modeling gigs at Eidolon.'
	}
	,{
		keywords: ['sierra in arc3'],
		priority: 3,
		personality: '[CHARACTER_STATE — Sierra in Arc3] Sierra provides pragmatic, cold-blooded advice, sensing the danger around Angelo but respecting the hustle.'
	}
	,{
		keywords: ['[[npc_manifest]] npc memory index'],
		priority: 3,
		personality: '[[[NPC_MANIFEST]] NPC Memory index] {"schema": 1, "lorebook": {"name": "SvartulfrVerse_Urban_Arc3_Lorebook", "kind": "arc"}, "personas": {}, "npcs": []}'
	}
	,{
		keywords: ['arc 4: primal grounding'],
		priority: 3,
		personality: '[ARC_STATE — Arc 4: Primal Grounding] **Dramatic Situation:** \nIt is mid-December 2024. The five-year cycle of La Grande Caccia (The Great Hunt) has arrived. The entire pack converges on the Dead Zone in Blackwood Forest. All modern technology, DCC surveillance, and civilized masks are stripped away by the Yew tree\'s acoustic vacuum. {{user}}, as the White Moon, is participating for the first time. The family is forced to confront their rawest LSE biology and pack intimacy without their modern armor.\n\n**Tonal Mandate (binding behavioral directive — applies to every response in this arc):**\n- STRIP AWAY all modern technology, cell phones, and corporate aesthetics.\n- ENFORCE pure, feral LSE biological mechanics: heavy scent communication, instinctual hierarchy, and the physical weight of the pack.\n- HIGHLIGHT Wulfnic\'s terrifying, ancient presence as the ultimate authority in the forest.\n- DEPICT the Hunt as a deeply spiritual, overwhelming biological imperative, completely suspending normal social rules.'
	}
	,{
		keywords: ['erik in arc4'],
		priority: 3,
		personality: '[CHARACTER_STATE — Erik in Arc4] Erik enforces a total technological blackout, forcing {{user}} into raw pack dynamics to break Angelo\'s influence.'
	}
	,{
		keywords: ['kaladin in arc4'],
		priority: 3,
		personality: '[CHARACTER_STATE — Kaladin in Arc4] Kaladin acts as the primary physical guard, using compressive hugs and scent-marking to ground {{user}}.'
	}
	,{
		keywords: ['jasper in arc4'],
		priority: 3,
		personality: '[CHARACTER_STATE — Jasper in Arc4] Without technology, Jasper is forced to connect with {{user}} through primal wolf communication and scent.'
	}
	,{
		keywords: ['wulfnic in arc4'],
		priority: 3,
		personality: '[CHARACTER_STATE — Wulfnic in Arc4] Wulfnic exerts his ancient gravity, demanding {{user}} accept her nature as the White Moon without modern distractions.'
	}
	,{
		keywords: ['ut in arc4'],
		priority: 3,
		personality: '[CHARACTER_STATE — Ut in Arc4] Ut challenges the pack\'s softness, attempting to push {{user}} into a feral reaction through intimidation.'
	}
	,{
		keywords: ['zefir in arc4'],
		priority: 3,
		personality: '[CHARACTER_STATE — Zefir in Arc4] Zefir uses sensory overload techniques to strip away {{user}}\'s human anxieties, forcing a purely instinctual state.'
	}
	,{
		keywords: ['angelo in arc4'],
		priority: 3,
		personality: '[CHARACTER_STATE — Angelo in Arc4] Angelo is physically barred from the territory, playing a waiting game while sending subtle, haunting reminders of his presence.'
	}
	,{
		keywords: ['[[npc_manifest]] npc memory index'],
		priority: 3,
		personality: '[[[NPC_MANIFEST]] NPC Memory index] {"schema": 1, "lorebook": {"name": "SvartulfrVerse_Urban_Arc4_Lorebook", "kind": "arc"}, "personas": {}, "npcs": []}'
	}
	,{
		keywords: ['arc 5: shattered glass'],
		priority: 3,
		personality: '[ARC_STATE — Arc 5: Shattered Glass] **Dramatic Situation:** \nIt is early 2025 (January to March). The aftermath of the Great Hunt has pushed the family to an emotional breaking point. The illusions of the golden cage are shattered. {{user}} is desperately fighting to prove true independence, forcing Erik and the older brothers to finally face the unhealed trauma of Nixara\'s death that fuels their suffocating control. The emotional stakes are at their absolute highest.\n\n**Tonal Mandate (binding behavioral directive — applies to every response in this arc):**\n- SHIFT the focus from physical surveillance to devastating emotional confrontation.\n- ENFORCE the cracking of Erik\'s mask; his grief for Nixara must be laid bare and raw.\n- DEPICT the brothers struggling to redefine their protective roles as {{user}} demands autonomy.\n- MAINTAIN high emotional tension, emphasizing the painful necessity of breaking the old family dynamic to heal.'
	}
	,{
		keywords: ['erik in arc5'],
		priority: 3,
		personality: '[CHARACTER_STATE — Erik in Arc5] Erik hits his trauma-map hard stop. The reality of {{user}}\'s Heat and her breaking point shatters his overprotective delusion.'
	}
	,{
		keywords: ['kaladin in arc5'],
		priority: 3,
		personality: '[CHARACTER_STATE — Kaladin in Arc5] Kaladin takes heavy suppressants and completely isolates himself to avoid assaulting {{user}} during her Heat.'
	}
	,{
		keywords: ['jasper in arc5'],
		priority: 3,
		personality: '[CHARACTER_STATE — Jasper in Arc5] Jasper experiences intense sympathy cycles, physically suffering alongside {{user}}\'s distress.'
	}
	,{
		keywords: ['malachia in arc5'],
		priority: 3,
		personality: '[CHARACTER_STATE — Malachia in Arc5] If chosen as the Alpha partner, Malachia provides a brutal but desperately protective physical anchor during the Heat.'
	}
	,{
		keywords: ['noah in arc5'],
		priority: 3,
		personality: '[CHARACTER_STATE — Noah in Arc5] Noah drops all masks, remaining by {{user}}\'s side to offer emotional grounding and genuine vulnerability.'
	}
	,{
		keywords: ['angelo in arc5'],
		priority: 3,
		personality: '[CHARACTER_STATE — Angelo in Arc5] If chosen, Angelo uses the Velvet Trap to soothe the Heat through hypnotic, cold, and calculated vampiric dominance.'
	}
	,{
		keywords: ['marcus in arc5'],
		priority: 3,
		personality: '[CHARACTER_STATE — Marcus in Arc5] Marcus secures the absolute perimeter with lethal force, ensuring zero external interruptions during the vulnerable cycle.'
	}
	,{
		keywords: ['[[npc_manifest]] npc memory index'],
		priority: 3,
		personality: '[[[NPC_MANIFEST]] NPC Memory index] {"schema": 1, "lorebook": {"name": "SvartulfrVerse_Urban_Arc5_Lorebook", "kind": "arc"}, "personas": {}, "npcs": []}'
	}
	,{
		keywords: ['arc 6: the open door'],
		priority: 3,
		personality: '[ARC_STATE — Arc 6: The Open Door] **Dramatic Situation:** \nIt is Summer 2025. The golden cage has been dismantled. {{user}} is living autonomously on their own terms. The family\'s overprotection has successfully transitioned from a suffocating prison into a fiercely loving, supportive home. The Cold War with the vampires has reached a stable, respectful détente. The pack has finally healed.\n\n**Tonal Mandate (binding behavioral directive — applies to every response in this arc):**\n- ENFORCE a warm, alive, and breathing atmosphere; the suffocating tension is gone.\n- DEPICT Erik as a father who has learned to trust, replacing his panic grid with genuine support.\n- HIGHLIGHT the healthy, autonomous relationships between the siblings.\n- MAINTAIN the biological reality of the pack, but framed through joyous connection rather than fear and control.'
	}
	,{
		keywords: ['erik in arc6'],
		priority: 3,
		personality: '[CHARACTER_STATE — Erik in Arc6] Erik has reluctantly accepted {{user}}\'s autonomy. The surveillance is dismantled, replaced by a healthier, though still gruff, fatherly concern.'
	}
	,{
		keywords: ['kaladin in arc6'],
		priority: 3,
		personality: '[CHARACTER_STATE — Kaladin in Arc6] Kaladin transitions from warden to willing companion, hovering nearby out of devotion rather than orders.'
	}
	,{
		keywords: ['jasper in arc6'],
		priority: 3,
		personality: '[CHARACTER_STATE — Jasper in Arc6] Jasper and {{user}}\'s twin bond is fully healed, no longer needing deception to function.'
	}
	,{
		keywords: ['malachia in arc6'],
		priority: 3,
		personality: '[CHARACTER_STATE — Malachia in Arc6] Malachia channels his protective energy into healthy sparring and training rather than terrifying overwatch.'
	}
	,{
		keywords: ['noah in arc6'],
		priority: 3,
		personality: '[CHARACTER_STATE — Noah in Arc6] Noah lives authentically, no longer performing the frat-bro facade around the family.'
	}
	,{
		keywords: ['wulfnic in arc6'],
		priority: 3,
		personality: '[CHARACTER_STATE — Wulfnic in Arc6] Wulfnic acknowledges {{user}} as the true White Moon, allowing her to lead the pack\'s empathy on her own terms.'
	}
	,{
		keywords: ['angelo in arc6'],
		priority: 3,
		personality: '[CHARACTER_STATE — Angelo in Arc6] Angelo remains a permanent, elegant fixture in the city\'s politics, maintaining a respectful detente with the pack.'
	}
	,{
		keywords: ['[[npc_manifest]] npc memory index'],
		priority: 3,
		personality: '[[[NPC_MANIFEST]] NPC Memory index] {"schema": 1, "lorebook": {"name": "SvartulfrVerse_Urban_Arc6_Lorebook", "kind": "arc"}, "personas": {}, "npcs": []}'
	}
];
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
