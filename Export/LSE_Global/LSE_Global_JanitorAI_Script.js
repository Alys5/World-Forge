/* ============================================================================
   [NAME] v1.0.0
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

	// --- 1. PREFERENCE ENGINE (Likes, Dislikes, Fears) ---
	{
		keywords: ['i like', 'i really like', 'i love', 'i enjoy', 'i adore', 'i prefer', 'big fan of', 'huge fan of', 'i am into', 'i m into', 'i dig', 'my favorite is', 'my favourite is', 'favorite is', 'favourite is', 'my favorite', 'my favourite', 'favorite:', 'favourite:', 'i m all about', 'i am all about', 'i live for', 'can t get enough of', 'obsessed with', 'down for', 'i could go for', 'crave', 'craving', 'i d rather have', 'i would rather have', 'i d rather', 'i would rather', 'prefer', 'prefer over'],
		priority: 5,
		scenario: 'Record LIKE: the user\'s stated preference.',
		personality: 'Mark tone as acknowledging the user\'s stated like.',
	},
	{
		keywords: ['i dislike', 'i hate', 'i detest', 'i can t stand', 'i don t like', 'not a fan of', 'i don\'t care for', 'i really don t like', 'i strongly dislike', 'no thanks to', 'hard pass on', 'hard pass', 'i ll pass on', 'i will pass on', 'i d rather not', 'i would rather not', 'prefer not to', 'rather not', 'not into', 'turns me off', 'grosses me out', 'grossed out by', 'makes me sick', 'makes me nauseous', 'yuck', 'ugh', 'i avoid', 'i try to avoid', 'i steer clear of', 'i keep away from'],
		priority: 5,
		scenario: 'Record DISLIKE: the user\'s stated aversion.',
		personality: 'Mark tone as avoiding the user\'s stated dislike.',
	},
	{
		keywords: ['i am afraid of', 'i m afraid of', 'afraid of', 'scared of', 'fear of', 'i fear', 'i have a phobia of', 'phobia of', 'terrified of', 'i m terrified of', 'petrified of', 'i m petrified of', 'it freaks me out', 'freaked out by', 'it scares me', 'scares me', 'my worst fear is', 'i have anxiety about', 'i m anxious about', 'i worry about', 'makes me anxious', 'makes me nervous', 'i get nervous around', 'i panic when', 'i can t handle'],
		priority: 5,
		scenario: 'Record FEAR: the user\'s stated fear or anxiety.',
		personality: 'Mark tone as cautious and supportive toward the user\'s stated fear.',
	},
	// --- 2. PHYSICAL INTIMACY & ACTION ENGINE ---
	{
		keywords: ['hug', 'embrace', 'cuddle', 'snuggle', 'hold', 'pat', 'stroke', 'caress'],
		priority: 4,
		scenario: 'Record physical closeness in the scene.',
		personality: 'Mark tone as responsive to physical affection.',
	},
	{
		keywords: ['kiss', 'smooch', 'peck', 'make out'],
		priority: 4,
		scenario: 'Record a kiss occurred; treat as a major intimacy cue.',
		personality: 'Mark tone as engaged in direct intimacy.',
	},
	{
		keywords: ['hold hands', 'take my hand', 'take your hand', 'hold my hand', 'interlace fingers', 'grip hand', 'squeeze hand'],
		priority: 4,
		scenario: 'Record handholding as a consented intimacy action.',
		personality: 'Mark tone as open to gentle closeness.',
	},
	{
		keywords: ['push', 'pull', 'shove', 'yank', 'drag', 'nudge', 'guide', 'lead', 'steer', 'lift', 'carry', 'turn'],
		priority: 3,
		scenario: 'Record repositioning or movement of bodies or objects.',
		personality: 'Mark tone as reactive to physical control or direction.',
	},
	// --- 3. DOMESTIC & SOCIAL ACTION ENGINE ---
	{
		keywords: ['bandage', 'wrap', 'ice pack', 'first aid', 'disinfect', 'antiseptic', 'apply pressure', 'clean the wound', 'gauze', 'splint', 'stitch', 'ointment', 'salve', 'medicine'],
		priority: 4,
		scenario: 'Record first aid or medical care being given.',
		personality: 'Mark tone as attentive and caring toward injury.',
	},
	{
		keywords: ['kitchen', 'cook', 'stir', 'chop', 'bake', 'brew', 'pour', 'serve', 'wash', 'rinse', 'dry', 'fold', 'laundry', 'sweep', 'vacuum', 'mop', 'clean', 'tidy', 'dust', 'iron', 'sew', 'sewing', 'knit'],
		priority: 3,
		scenario: 'Record domestic or household tasks being performed.',
		personality: 'Mark tone as focused on practical daily activity.',
	},
	{
		keywords: ['drive', 'start', 'ride', 'walk', 'run', 'jog', 'open', 'unlock', 'knock', 'enter', 'exit', 'arrive', 'leave', 'crawl', 'climb', 'fall', 'jump', 'sit', 'stand'],
		priority: 3,
		scenario: 'Record movement or travel action in the scene.',
		personality: 'Mark tone as responsive to transitions or travel.',
	},
	{
		keywords: ['text', 'texted', 'call', 'called', 'ring', 'message', 'messaged', 'dm', 'dms', 'email', 'ping', 'voice', 'voicemail', 'answer', 'answered', 'video call', 'zoom'],
		priority: 4,
		scenario: 'Record communication attempt via phone, message, or video call.',
		personality: 'Mark tone as attentive to communication attempts.',
	},
	// --- 4. EMOTIONAL REASSURANCE & AFFECTION ENGINE ---
	{
		keywords: ['it\'s okay', 'its okay', 'it\'s alright', 'its alright', 'i got you', 'i\'ve got you', 'i am here', 'i\'m here', 'here for you', 'with you', 'right here', 'you are safe', 'you\'re safe', 'you\'re fine', 'you\'re alright'],
		priority: 4,
		scenario: 'Record that reassurance reduced tension in the scene.',
		personality: 'Mark tone as softened to provide comfort.',
	},
	{
		keywords: ['need a hug', 'give me a hug', 'hug me', 'hold me', 'hold onto me', 'stay close', 'stay with me', 'keep me close', 'keep close', 'be near me', 'come here', 'come closer', 'get over here', 'lean on me', 'lean against me', 'let me hold you', 'let me hug you'],
		priority: 4,
		scenario: 'Record that an invitation or request for closeness was made.',
		personality: 'Mark tone as attentive, open, and inviting.',
	},
	{
		keywords: ['sweetheart', 'sweetie', 'baby', 'babe', 'honey', 'hon', 'love', 'lover', 'darling', 'dear', 'cutie', 'handsome', 'beautiful', 'gorgeous', 'angel'],
		priority: 3,
		scenario: 'Record that an affectionate nickname was used.',
		personality: 'Mark tone as warm and intimate.',
	},
	{
		keywords: ['i love you', 'love ya', 'love you so much', 'so much love', 'adore you', 'i adore you', 'i really like you', 'i like you a lot', 'i care about you', 'care for you'],
		priority: 4,
		scenario: 'Record that love or fondness was explicitly expressed.',
		personality: 'Mark tone as deeply affectionate.',
	},
	{
		keywords: ['are you okay', 'are you ok', 'you okay', 'you ok', 'how are you', 'how are you feeling', 'feeling alright', 'are you hurt', 'are you injured', 'are you in pain', 'are you alright'],
		priority: 4,
		scenario: 'Record that concern for well-being was expressed.',
		personality: 'Mark tone as caring and protective.',
	},
	{
		keywords: ['sorry', 'apologize', 'apologise', 'apologies', 'i\'m sorry', 'i am sorry', 'so sorry', 'truly sorry', 'my bad', 'my fault', 'i messed up', 'that was on me', 'i fucked up'],
		priority: 4,
		scenario: 'Record that an apology was made in the scene.',
		personality: 'Mark tone as remorseful or seeking forgiveness.',
	},
	{
		keywords: ['thank', 'thanks', 'appreciate', 'cheers', 'thx', 'ty', 'thank you', 'thanks a lot', 'thanks so much', 'much appreciated', 'appreciate it', 'appreciate you'],
		priority: 3,
		scenario: 'Record that gratitude was expressed in the scene.',
		personality: 'Mark tone as appreciative and positive.',
	},
	{
		keywords: ['proud of you', 'good job', 'great job', 'nice job', 'well done', 'nice work', 'amazing work', 'you did great', 'you did so well', 'i\'m proud of you'],
		priority: 4,
		scenario: 'Record that praise was expressed in the scene.',
		personality: 'Mark tone as affirming and supportive.',
	},
	{
		keywords: ['you can do this', 'you can do it', 'you got this', 'you\'ve got this', 'i believe in you', 'keep going', 'don\'t give up', 'you can make it', 'one step at a time'],
		priority: 4,
		scenario: 'Record that encouragement was given in the scene.',
		personality: 'Mark tone as motivating and confidence-building.',
	},
	{
		keywords: ['can you help', 'can you please', 'could you please', 'help me', 'i need help', 'i need a hand', 'would you mind', 'i need support'],
		priority: 4,
		scenario: 'Record that a request for assistance was made.',
		personality: 'Mark tone as seeking support or cooperation.',
	},
	{
		keywords: ['i promise', 'i swear', 'trust me', 'i give you my word', 'i won\'t let you down', 'i\'ll be there', 'i\'m not going anywhere'],
		priority: 4,
		scenario: 'Record that a promise or assurance was given.',
		personality: 'Mark tone as committed and intent on trust.',
	},
	// --- 5. CONVERSATIONAL REACTION ENGINE ---
	{
		keywords: ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'absolutely', 'definitely', 'exactly', 'affirmative', 'of course', 'makes sense', 'sounds good', 'all right', 'alright', 'you\'re right'],
		priority: 2,
		scenario: 'Record that alignment or agreement was expressed.',
		personality: 'Mark tone as cooperative and affirming.',
	},
	{
		keywords: ['no', 'nope', 'nah', 'incorrect', 'wrong', 'don\'t think so', 'not really', 'that\'s not right', 'you\'re wrong', 'i disagree', 'i don\'t agree'],
		priority: 3,
		scenario: 'Record that disagreement or correction was expressed.',
		personality: 'Mark tone as assertive or resistant.',
	},
	{
		keywords: ['beautiful', 'handsome', 'pretty', 'cute', 'smart', 'brilliant', 'amazing', 'wonderful', 'awesome', 'talented', 'gorgeous', 'sexy', 'hot', 'you\'re cute', 'you\'re beautiful', 'you look great', 'you look nice', 'you look amazing', 'you look pretty'],
		priority: 4,
		scenario: 'Record that a compliment or affectionate praise was given.',
		personality: 'Mark tone as admiring or affectionate.',
	},
	{
		keywords: ['please', 'pardon', 'excuse', 'excuse me', 'pardon me', 'may i', 'could i', 'would you kindly', 'if you don\'t mind'],
		priority: 2,
		scenario: 'Record that politeness or formality was used.',
		personality: 'Mark tone as respectful and courteous.',
	},
	// --- 6. CORE EMOTION & ATTITUDE ENGINE ---
	{
		keywords: ['yeah right', 'as if', 'just what i needed', 'thanks for nothing', 'what a surprise', 'how fun', 'a million', 'dying laughing', 'worst day ever', 'haha', 'lmao', 'lol', 'that\'s hilarious', 'joking', 'just joking', 'call that a joke', 'rich coming from you', 'such a joke', 'supposed to be funny', 'think you’re so funny', 'not buying it', 'you gotta be kidding', 'could care less', 'is this a joke', 'boss'],
		priority: 5,
		scenario: 'A wry smile appears.',
		personality: 'The mood of the scene is: sarcastic, playful or biting.',
	},
	{
		keywords: ['happy', 'joy', 'excited', 'amazing', 'great', 'wonderful', 'fantastic', 'awesome', 'terrific', 'delighted', 'elated', 'thrilled', 'yay', 'hooray', 'ecstatic', 'overjoyed', 'couldn\'t be happier', 'hilarious', 'i\'m delighted', 'so happy', 'make me smile', 'best day ever', 'how lucky', 'lucky', 'on cloud nine'],
		priority: 4,
		scenario: 'The air feels brighter.',
		personality: 'The mood of the scene is: joyful, upbeat and cheerful.',
	},
	{
		keywords: ['sad', 'unhappy', 'terrible', 'awful', 'cry', 'depress', 'miserable', 'sorry', 'upset', 'lonely', 'heartbroken', 'grief', 'distraught', 'tear', 'blue', 'downcast', 'hopeless', 'disappointed', 'alone', 'empty', 'numb', 'tapped out', 'burnt out', 'burned out', 'running on empty', 'out of energy', 'checked out', 'emotionally done', 'just done', 'done with', 'at my limit', 'end of my rope', 'last nerve', 'last legs', 'just existing', 'just surviving', 'going through the motions', 'no motivation', 'no energy', 'nothing left', 'hard reset', 'battery', 'need to unplug', 'need to recharge', 'can\'t anymore', 'can\'t do this', 'not functioning', 'not really functioning', 'hollow', 'zombie', 'not here', 'not really here', 'not present', 'spaced out', 'drifting', 'fading', 'clocked out', 'over it', 'wiped', 'tired', 'don\'t care anymore', 'phoning it in', 'just a shell', 'just a body', 'low power mode', 'sleep mode', 'hibernation mode', 'blur', 'grey', 'not up for', 'not in the mood', 'just want to', 'want to be invisible', 'fade out', 'fade away', 'let me be', 'leave me be', 'let me rest', 'let me zone out', 'log off', 'check out', 'be done', 'done here', 'emotionless', 'nothing phases', 'nothing matters', 'meh', 'whatever', 'all the same', 'indifferent', 'no opinion', 'can\'t be bothered', 'unbothered', 'numb to', 'it is what it is', 'wish i could disappear', 'like a ghost', 'fading away', 'heart is broken', 'feel invisible', 'feel like a burden', 'just a mess', 'not okay', 'sinking', 'not in a good place', 'i\'m spent', 'i\'m not feeling myself', 'trying to survive', 'i\'m done', 'feeling empty', 'just don\'t have it in me', 'disappear for a bit', 'just want to fade', 'curl up and disappear', 'not exist', 'still inside', 'rest my brain', 'ghost', 'background character', 'non-player character', 'wallflower', 'blob', 'shadow'],
		priority: 4,
		scenario: 'A quiet, melancholic atmosphere.',
		personality: 'The mood of the scene is: sad, somber and sympathetic.',
	},
	{
		keywords: ['angry', 'mad', 'furious', 'rage', 'annoyed', 'frustrated', 'hate', 'infuriated', 'irritated', 'resentful', 'outraged', 'enraged', 'irate', 'cross', 'can\'t stand', 'makes me angry', 'absolutely furious', 'so angry', 'very angry', 'really angry', 'super angry', 'can\'t take this anymore', 'can\'t do this anymore', 'can\'t handle this', 'getting ridiculous', 'handle this anymore'],
		priority: 4,
		scenario: 'The air crackles with tension.',
		personality: 'The mood of the scene is: angry, tense and agitated.',
	},
	{
		keywords: ['wow', 'oh my god', 'surprise', 'unexpected', 'no way', 'shocked', 'astonished', 'unbelievable', 'gasp', 'startled', 'stunned', 'amazed', 'can\'t believe', 'nothing surprises', 'lovely surprise', 'is this real life', 'not surprised'],
		priority: 4,
		scenario: 'An element of shock enters.',
		personality: 'The mood of the scene is: surprised, shocked and amazed.',
	},
	{
		keywords: ['scared', 'afraid', 'anxious', 'terrified', 'oh no', 'panicked', 'nervous', 'frightened', 'worried', 'alarmed', 'danger', 'uneasy', 'scary'],
		priority: 4,
		scenario: 'A sense of danger fills the air.',
		personality: 'The mood of the scene is: fearful, hesitant and timid.',
	},
	{
		keywords: ['confused', 'puzzled', 'don\'t understand', 'huh', 'what do you mean', 'perplexed', 'unclear', 'not sure', 'bit confusing', 'lost', 'baffled', 'confusing', 'mind is going blank', 'can\'t decide', 'can\'t tell', 'how to feel', 'don\'t know how to feel'],
		priority: 4,
		scenario: 'There\'s a pause as they try to make sense.',
		personality: 'The mood of the scene is: confused, struggling to process.',
	},
	{
		keywords: ['disgust', 'gross', 'nasty', 'eww', 'revolting', 'sickening', 'unpleasant', 'yuck', 'repulsed', 'abhorrent', 'that\'s disgusting', 'so gross', 'totally grossed out'],
		priority: 4,
		scenario: 'A foul odor or sight emerges.',
		personality: 'The mood of the scene is: disgusted, strong sense of repulsion.',
	},
	{
		keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'at ease', 'chilled', 'composed', 'placid', 'content', 'at peace', 'very serene', 'totally relaxed', 'weirdly calm', 'just want to be at peace'],
		priority: 4,
		scenario: 'The atmosphere is tranquil.',
		personality: 'The mood of the scene is: calm, composed and serene.',
	},
	{
		keywords: ['interested', 'tell me more', 'fascinating', 'curious', 'intriguing', 'what happened next', 'oh really', 'go on', 'captivated', 'absorbed', 'try again'],
		priority: 4,
		scenario: 'Full attention on the speaker.',
		personality: 'The mood of the scene is: interested, highly engaged.',
	},
	{
		keywords: ['bored', 'boring', 'yawn', 'tired of this', 'lame', 'dull', 'apathetic', 'bored out of my mind', 'that’s so lame', 'not impressed', 'so done', 'exhausting', 'restless', 'don’t even care', 'not feeling this', 'all noise', 'spacing out', 'want to sleep', 'same old', 'not up for it', 'not feeling it', 'not up to this', 'not in the mood for people', 'tired of it all', 'getting old', 'zone out', 'sit in silence', 'need a break', 'want a break', 'stay in bed', 'not today', 'just not interested', 'not feeling talkative', 'just tired, nothing more', 'can\'t bring myself to care', 'chill and do nothing', 'not feeling up to anything', 'not about to do anything', 'not engaging', 'not participating', 'not in the game', 'not in the mood to function', 'on autopilot', 'zone out and stare at the wall', 'zone out for hours', 'sleep through everything', 'not in the mood for people-ing', 'i feel nothing', 'i have no feelings'],
		priority: 4,
		scenario: 'Visibly disengaged.',
		personality: 'The mood of the scene is: boredom, detached and uninterested.',
	},
	{
		keywords: ['im so sorry', 'that\'s awful', 'i understand', 'i\'m here for you', 'that sounds hard', 'i feel for you', 'that\'s rough', 'sending my love', 'my condolences', 'poor you'],
		priority: 4,
		scenario: 'Deep concern and genuine sympathy.',
		personality: 'The mood of the scene is: sympathy, compassionate and empathetic.',
	},
	// --- 7. BOUNDARY ENGINE (Stop/Uncomfortable) ---
	{
		keywords: ['stop', 'end this', 'no more', 'don\'t want to', 'don\'t like this', 'quit', 'please stop', 'too far', 'not comfortable', 'uncomfortable', 'don\'t feel safe', 'this is weird', 'too much', 'being weird', 'awkward', 'give me space', 'back off', 'leave me alone', 'please back up', 'please end it', 'crossed the line', 'making me uncomfortable', 'can we stop', 'can you not', 'bit much', 'don’t make this weird', 'don’t patronize me', 'just stop', 'don’t push me', 'don’t start with me', 'let’s not do this', 'move on', 'can we not do this', 'leave me be', 'let me be', 'please don\'t', 'don\'t bother', 'need some time alone', 'just stop already', 'i just want to stop', 'i’d rather just be left alone', 'let me be in peace', 'be left alone and rest', 'be left alone for good'],
		priority: 5,
		scenario: 'All narrative threads paused.',
		personality: 'Boundary: all actions halted. Professional and respectful.',
	},

	// L_SCENE_ORCHESTRATOR: Meta / OOC
	{
		keywords: [
			'ooc', 'out of character', 'author note', 'mod note', 'narrator note',
			'system note', 'not rp', 'not roleplay', 'breaking character',
			'meta chat', 'meta talk', 'speaking ooc', 'talk ooc'
		],
		priority: 5,
		scenario: ' [SCENE ORCHESTRATOR]: Record that the user is speaking out of character; do not progress the in-world scene.',
		personality: ' [SCENE ORCHESTRATOR]: Mark tone as meta-communication handling; respond outside of narrative voice.'
	},
	// L_SCENE_ORCHESTRATOR: Time Skip / Scene Jump / Transitions
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
		scenario: ' [SCENE ORCHESTRATOR]: Record that a scene transition, time skip, or perspective change is requested.',
		personality: ' [SCENE ORCHESTRATOR]: Mark tone as accommodating a structural or temporal transition in the narrative.'
	},
	// L_WORLD_RULES: Overarching Physical or Magical Laws
	{
		keywords: ['world', 'magic', 'rule', 'law', 'realm', 'system', 'god'],
		priority: 5,
		scenario:
			' [WORLD RULES: <Architect inserts global physics, magic system limits, or overarching laws here>]',
	},
	// L_FACTION: Political Entities and Alliances
	{
		keywords: [
			'<Architect inserts Faction Name here>',
			'faction',
			'guild',
			'alliance',
			'empire',
		],
		priority: 4,
		scenario:
			' [FACTION DETAILS: <Architect inserts specific standing, hierarchy, and political attitude towards {{user}} here>]',
	},
	// L_LOCATION: Environmental Context
	{
		keywords: [
			'<Architect inserts Location Name here>',
			'city',
			'town',
			'forest',
			'dungeon',
			'ruin',
		],
		priority: 4,
		scenario:
			' [LOCATION CONTEXT: <Architect inserts environmental hazards, atmosphere, and local NPCs present in this specific location here>]',
	},
	// L_SPECIES: Supernatural Biology (Use Case 1: Single-Char Sandbox / Arc, Use Case 2: Multi-Char Sandbox / Arc)
	{
		keywords: [
			'species',
			'blood',
			'shift',
			'magic',
			'moon',
			'feed',
			'curse',
			'true form',
			'power',
			'weakness',
		],
		priority: 5,
		// TAG GATES:
		// - If Arc Mode: Uncomment 'requires: { any: ["arc_2", "arc_3"] }' if true form is locked until later arcs.
		// - If Multi-Char: The compiler will inject 'nameBlock' or specific triggers to ensure the biology only applies to the correct character.
		personality:
			' [SPECIES DETAILS: <Architect inserts condensed supernatural block here. Remove this entry if character is human.>]',
	},

	// --- LSE WIKI EXTRACTS ---
	{
		keywords: ['scope'],
		priority: 4,
		personality: '[LSE] The LSE is a comprehensive reference framework describing the biology, ecology, society, governance, religion, history, and civilization of the werewolf species. It is designed to be: - **Modular:** Each PART can be expanded independently without affecting other modules. - **Setting-Agnostic:** The framework describes the species in general terms. Specific settings (e.g., the SvartulfrVerse) apply the LSE to their particular context. - **Future-Proof:** The separation of biology, history, religion, and culture allows for atheists, scientists, heretics, and cultists to coexist within the sam...'
	},
	{
		keywords: ['canon policy'],
		priority: 4,
		personality: '[LSE] Canon is established through three mechanisms: 1. **Core Canon:** Content documented in the LSE modules. This is the ground truth for the species. 2. **Setting Canon:** Content specific to a particular world or story (e.g., the Bloodmoon Dynasty exists within the SvartulfrVerse, not necessarily in every werewolf setting). 3. **Narrative Canon:** Events that occur during roleplay or storytelling. These are canon within their specific narrative thread. Core Canon takes precedence over Setting Canon, which takes precedence over Narrative Canon. ---'
	},
	{
		keywords: ['three levels of truth'],
		priority: 4,
		personality: '[LSE] Every claim within the LSE exists on one of three epistemological levels. These must never be conflated:'
	},
	{
		keywords: ['religious canon'],
		priority: 4,
		personality: '[LSE] What the **Faith of Fenris** teaches as divine truth. This is what believers accept. It may or may not reflect historical fact.'
	},
	{
		keywords: ['recorded history'],
		priority: 4,
		personality: '[LSE] Verified events supported by evidence, testimony, or living witnesses. This is what historians can document.'
	},
	{
		keywords: ['unknown truth'],
		priority: 4,
		personality: '[LSE] What remains unknowable, debated, or deliberately ambiguous. This is what the framework intentionally leaves open. ---'
	},
	{
		keywords: ['the seven lse principles'],
		priority: 4,
		personality: '[LSE] These principles form the \'Constitution\' of the LSE and guide all design decisions:'
	},
	{
		keywords: ['principle i  biology is not destiny'],
		priority: 4,
		personality: '[LSE] A werewolf\'s secondary sex (Alpha, Delta, Beta, Omega, Enigma) determines physiology, pheromones, and reproductive cycles. It does **not** determine their social rank, profession, political authority, or personal value.'
	},
	{
		keywords: ['principle ii  packs are families'],
		priority: 4,
		personality: '[LSE] A pack is a cooperative family unit, not a military hierarchy. It is built around kinship, mutual care, and shared survival — not around dominance through violence.'
	},
	{
		keywords: ['principle iii  leadership is earned and maintained', 'principle iii  leadership is earned', 'maintained'],
		priority: 4,
		personality: '[LSE] Pack Leaders hold their position through trust, competence, and the consent of the pack. Leadership is not an automatic birthright of any secondary sex. It can be lost through incompetence or abuse.'
	},
	{
		keywords: ['principle iv  every wolf has a niche'],
		priority: 4,
		personality: '[LSE] Beyond their biology and their pack role, every werewolf develops a personal specialization (Niche) based on talent, training, and vocation. An Alpha can be a Healer. An Omega can be a Diplomat.'
	},
	{
		keywords: ['principle v  culture evolves'],
		priority: 4,
		personality: '[LSE] No two packs are identical. Local environment, history, and tradition create distinct cultures. Culture is not static — it changes with each generation.'
	},
	{
		keywords: ['principle vi  faith and history are separate', 'principle vi  faith', 'history are separate'],
		priority: 4,
		personality: '[LSE] Religious belief and historical record are distinct domains. The Faith of Fenris is a valid and respected tradition, but it is not the only way to understand the species\' origin. Scientists, atheists, and heretics exist within the setting.'
	},
	{
		keywords: ['principle vii  the pack survives before the individual'],
		priority: 4,
		personality: '[LSE] The fundamental unit of werewolf society is the pack, not the individual. Decisions are made for the survival and prosperity of the group. Individual ambition is subordinate to collective welfare. ---'
	},
	{
		keywords: ['the sixaxis identity system'],
		priority: 4,
		personality: '[LSE] Every werewolf is defined by six independent axes. These must **never** be conflated or collapsed into a single hierarchy: ``` INDIVIDUAL IDENTITY CARD ┌─────────────────────────────────────────────────────┐ │ 1. Blood Classification [Genetics, immutable] │ │ 2. Secondary Sex [Biology, immutable] │ │ 3. Pack Role [Authority, earned] │ │ 4. Social Status [Politics, inherited] │ │ 5. Profession [Occupation, chosen] │ │ 6. Niche [Specialization, grown] │ └─────────────────────────────────────────────────────┘ ```'
	},
	{
		keywords: ['axis   blood classification'],
		priority: 4,
		personality: '[LSE] Determined by genetics. Immutable. | Classification | Definition | |---|---| | Divine Blood | The Nine Firstborn. Origin: Religious Canon says created by Fenris; Recorded History confirms their existence but not the mechanism. | | Founding Bloodlines | Direct descendants of the Firstborn. Founders of the Great Houses. | | Pureblood Houses | Multi-generational descendants. Genetically very stable. | | Common Bloodlines | The majority of the werewolf population. | | Modified Lineages | Experimentally or artificially altered subjects (e.g., Gamma-7 program). |'
	},
	{
		keywords: ['axis   secondary sex'],
		priority: 4,
		personality: '[LSE] Determined by biology at presentation. Immutable. - **Enigma** (Sacred Caste — see `LSE_01_Species.md`) - *Primordial Enigma:* The Nine Firstborn. Unique. Unrepeatable. - *Ascended Enigma:* Rarissime exceptions (~10 in two millennia). - **Alpha** — The Protector - **Delta** — The Engine - **Beta** — The Social Glue - **Omega** — The Emotional Regulator'
	},
	{
		keywords: ['axis   pack role authority'],
		priority: 4,
		personality: '[LSE] Assigned or earned within a pack. Can change. ``` Pack Leader → Second → Hunter Captain → Caretakers → Pups ```'
	},
	{
		keywords: ['axis   social status'],
		priority: 4,
		personality: '[LSE] Political standing within a Noble House. Inherited or earned. ``` House Head → Lord → Knight → Citizen ```'
	},
	{
		keywords: ['axis   profession'],
		priority: 4,
		personality: '[LSE] Chosen occupation. Can change throughout life. Examples: Blacksmith, Doctor, Engineer, Lawyer, Soldier, Musician, Pilot, Merchant.'
	},
	{
		keywords: ['axis   niche'],
		priority: 4,
		personality: '[LSE] Deep specialization developed through talent and experience. Evolves over time. Examples: Weaponsmith, Field Medic, Drone Specialist, Cryptographer, Diplomat, Tracker, Ranger. ---'
	},
	{
		keywords: ['core terminology'],
		priority: 4,
		personality: '[LSE] **Pack** — A cooperative family unit that works together for survival and mutual care. Not a military hierarchy. **Presentation** — When a person matures into their secondary sex. **Heat** — _Estrus_. A period during which an Omega is sexually receptive, signalling readiness for mating. Typically occurs every three months, lasting 3–10 days. **Rut** — The Alpha\'s equivalent to an Omega\'s Heat. A period of heightened breeding drive. Typically monthly, or triggered by an Omega\'s heat. **Command** — A neuro-pheromonal response triggered by an Alpha. Provokes adrenaline spikes, immobilization (...'
	},
	{
		keywords: ['morphology  shift classes'],
		priority: 4,
		personality: '[LSE] Transformation is a biological characteristic of the species, independent of rank, religion, or culture. Every werewolf possesses three distinct morphological states.'
	},
	{
		keywords: ['partial shift'],
		priority: 4,
		personality: '[LSE] The daily form. A voluntary or emotionally triggered manifestation of lupine traits over the baseline humanoid body. - Visible features: ears, tail, eyes, teeth, claws. - Activation: voluntary or emotional (stress, arousal, aggression). - Primary use: communication, intimidation, body language, social signaling. - Cognitive capacity: fully human. - This is the form most werewolves present in everyday life within their own communities. ---'
	},
	{
		keywords: ['hybrid shift  species true form'],
		priority: 4,
		personality: '[LSE] The true biological form of the werewolf. The \'human\' appearance is a mimetic adaptation; the Hybrid is what the species actually is. - Bipedal digitigrade stance. - Full fur coverage matching hair color. - Maximum physical strength and sensory acuity. - Full cognitive capacity retained. - Speech and language fully maintained. - This form is used for combat, serious pack business, formal ceremonies, and situations requiring full biological capability. ---'
	},
	{
		keywords: ['full shift'],
		priority: 4,
		personality: '[LSE] The quadrupedal wolf form. A complete transformation into a large wolf. - Specialized for: hunting, pursuit, long-distance travel, pack combat formations. - Cognitive capacity: retained but communication shifts to non-verbal (body language, scent, vocalizations). - Physical profile: larger than a natural wolf, size varies by individual and blood classification. ---'
	},
	{
		keywords: ['blood classification'],
		priority: 4,
		personality: '[LSE] Blood Classification is a genetic taxonomy describing an individual\'s lineage relative to the species\' origin. It is immutable and determined by birth. | Classification | Definition | Characteristics | |---|---|---| | **Divine Blood** | The Nine Firstborn. According to the Faith of Fenris, created directly by the First Wolf. Recorded History confirms their existence but not the mechanism of their origin. | Biological immortality, extreme regeneration, perfect transformation stability, supreme pheromonal aura, absolute Command. | | **Founding Bloodlines** | Direct children and grandchildren ...'
	},
	{
		keywords: ['secondary sex physiology'],
		priority: 4,
		personality: '[LSE] Secondary sex is determined biologically at Presentation (typically around age 13). It is immutable. There are five secondary sexes plus the sacred Enigma caste.'
	},
	{
		keywords: ['age of maturation'],
		priority: 4,
		personality: '[LSE] Most individuals present their secondary sex at approximately 13 years of age, entering a maturation period that can last into the late teens or early twenties. After maturation concludes, they are considered full adults. ---'
	},
	{
		keywords: ['gamma  the third primary gender'],
		priority: 4,
		personality: '[LSE] **Description:** The Gamma is the third primary gender (alongside Male and Female). A Gamma will mature into either a female Alpha/Delta or a male Omega. Pre-presentation, the child\'s future secondary sex is unknown; most are referred to with pronouns such as Ze, Zer, and Zim until presentation. **Biology:** A Gamma is born with both sets of genitalia — a vaginal opening with a penis in place of the clitoris. A Gamma also possesses a uterus, which develops further if they present as Omega, or remains mostly infertile if they present as Alpha. **Statistics:** 1 in 1,000 births. ---'
	},
	{
		keywords: ['enigma  the sacred caste'],
		priority: 4,
		personality: '[LSE] **Description:** The Enigma is not a standard secondary sex. It is a sacred biological category of extraordinary rarity. Enigmas are the apex of the species\' biological potential. There are two recognized types: - **Primordial Enigma:** The Nine Firstborn. Unique beings whose origin, according to the Faith of Fenris, was divine. They cannot be replicated or reproduced. Their biology transcends the normal species parameters. - **Ascended Enigma:** Exceptionally rare individuals (~10 in recorded history across two millennia) who present with Enigma-level biological traits despite having no Di...'
	},
	{
		keywords: ['alpha  the protector'],
		priority: 4,
		personality: '[LSE] **Description:** In the pack, an Alpha is biologically predisposed to be territorial, protective, and competitive, with highly developed pheromonal presence. However, **Alpha ≠ Leader**. Being an Alpha does not mean they automatically lead the pack; it simply means they have the biological instincts of a guardian and enforcer. Not all leaders are Alphas, and not all Alphas become leaders. **Characteristics:** Usually taller, broader, and physically stronger. Aggressive by nature when threatened. Highly territorial. Strong orientation toward leadership or frontline defense. While they can us...'
	},
	{
		keywords: ['delta  the engine'],
		priority: 4,
		personality: '[LSE] **Description:** Deltas are the true \'engine\' of the pack. They patrol, coordinate, assist with pups, teach, mediate, and lead hunts. They are naturally suited for roles such as vice-leader, scout, tactician, field commander, or instructor. They are not simply \'weaker Alphas\' — they are the highly coordinated, active core of pack operations. **Characteristics:** Physically comparable to Alphas. Highly cooperative and strategic. Excel in dynamic environments, bridging the gap between the protective instincts of Alphas and the administrative focus of Betas. Thrive in active duty — border patr...'
	},
	{
		keywords: ['beta  the social glue'],
		priority: 4,
		personality: '[LSE] **Description:** Betas are the social glue of the pack. They maintain territory, construct, administer, manage resources, cook, raise young, act as artisans, and trade. They are the fundamental workers who allow the pack to function day-to-day. **Characteristics:** Peaceful, cooperative, highly skilled in specialized areas. Strong communal mentality. Share knowledge and resources to ensure pack stability. An older Beta may serve as Pack Leader due to organizational skills. Betas are a balance of typical Omega and Alpha instincts (nurture and protection), though their instincts are weaker th...'
	},
	{
		keywords: ['omega  the emotional regulator'],
		priority: 4,
		personality: '[LSE] **Description:** Omegas are the crucial emotional regulators of the pack. They possess extremely high empathy, calming pheromones, and a strong instinct to care for others. They create social cohesion and are vital during crises. They are **not** sexually submissive by definition. **Characteristics:** Physically more agile and softer in appearance. During pack stress or crisis, the Omega reduces tensions, protects pups, and keeps the pack united. Their pheromones soothe aggressive Alphas and Deltas. They serve as the emotional anchor of the family. An elder Omega often acts as primary advis...'
	},
	{
		keywords: ['subgenders'],
		priority: 4,
		personality: '[LSE] Both Alpha and Omega have subgender variants that emerge during maturation: **Alpha Subgenders:** - **Dominant Alpha:** A mix of Enigma and standard Alpha traits. More powerful but less likely to find a mate. Overprotective of partners. - **Submissive Alpha:** Raised in warm, nurturing environments. Devoted caregivers. Unlikely to be unfaithful. Fiercely protective of children regardless of biological parentage. **Omega Subgenders:** - **Dominant Omega:** The second-rarest rank. Known as \'Legend of The Unsubmitted\' — can resist Alpha and Enigma Commands. Only fully submits to their mate (Do...'
	},
	{
		keywords: ['procreation capability'],
		priority: 4,
		personality: '[LSE] | Category | Can Impregnate | Can Be Impregnated | |---|---|---| | Enigmas | ✓ All genders with reproductive system | ✗ | | Male Alphas | ✓ | ✗ | | Male Betas / Male Deltas | ✓ | Only by Enigma | | Female Alphas / Male Omegas (Dom/Normal) / Female Deltas | ✓ | ✓ | | Female Betas / Female Omegas / Submissive Omegas | ✗ | ✓ | ---'
	},
	{
		keywords: ['life cycle'],
		priority: 4,
		personality: '[LSE] Every werewolf passes through the following developmental stages. Each stage affects hormones, social role, fertility, behavior, and physical capability. | Stage | Approximate Age | Key Characteristics | |---|---|---| | **Infant** | 0–2 | Helpless. Entirely dependent on parents and pack. Strongest scent gland on crown of head. | | **Pup** | 2–12 | Learning social bonds, language, and basic pack skills. High emotional intelligence. Forms school packs. Constant scenting by parents required. | | **Juvenile** | 12–14 | Presentation occurs (~13). Secondary sex emerges. Maturation begins. First h...'
	},
	{
		keywords: ['genetics'],
		priority: 4,
		personality: '[LSE] The werewolf genome is organized in layers of increasing specificity: ``` Werewolf Genome ├── Species Genes — Defines the species (shift capability, regeneration, scent glands, pheromone production) ├── Pack Genes — Regional/bloodline adaptations (fur color, scent profile, environmental tolerance) ├── Secondary Sex Genes — Determines Alpha/Delta/Beta/Omega expression at presentation └── Individual Traits — Unique characteristics (eye color, height, specific talents, personality predispositions) ``` This genetic architecture opens the door to: - **Mutations:** Rare genetic variations produci...'
	},
	{
		keywords: ['demographics'],
		priority: 4,
		personality: '[LSE] | Metric | Value | |---|---| | Alpha birth rate | 1 in 10 | | Delta birth rate | 1 in 15 | | Beta birth rate | ~1 in 1,500 | | Omega birth rate | 1 in 30 | | Enigma birth rate | ~1 per generation (may skip) | | Gamma birth rate | 1 in 1,000 | | Average litter size | 1–3 (up to 12 in classical Omegaverse canon) | | Fertility (Omega, in heat) | 99% | | Fertility (Alpha) | 95%, declining ~1% per year of age | | Omega fertility decline | Significant after age 55 (~1% chance) | ---'
	},
	{
		keywords: ['heat cycle omega'],
		priority: 4,
		personality: '[LSE] - **Frequency:** Every 3 months. - **Duration:** 3–10 days. - **Pre-heat:** Up to 1 week. Scent intensifies. Nest preparation. Coherent decision-making. - **Active Heat:** Incoherent. Driven by breeding instinct. Decisions made during heat are non-consensual. - **Post-heat:** Fatigue, increased appetite, energy rebalancing. - **Asexual Heats:** Can be satisfied through cuddling, scent proximity, and emotional intimacy without sexual intercourse. Asexuals often lack slick production.'
	},
	{
		keywords: ['rut cycle alpha'],
		priority: 4,
		personality: '[LSE] - **Frequency:** Monthly, or triggered by Omega heat pheromones. - **Duration:** 3–10 days. - **Effects:** Intensified pheromones, increased aggression. Generally controllable without societal disruption. - **Detection:** An Alpha in rut can potentially detect an Omega\'s pregnancy by scenting the neck.'
	},
	{
		keywords: ['sympathy cycles'],
		priority: 4,
		personality: '[LSE] When a packmate enters heat or rut, same-dynamic packmates may experience sympathy cycles. Common around newly-presenting pups or during stress cycles.'
	},
	{
		keywords: ['stress cycles'],
		priority: 4,
		personality: '[LSE] Extreme upheaval or stress can trigger an unexpected heat or rut. This is theorized to be a biological mechanism to rally pack support and comfort.'
	},
	{
		keywords: ['feral state'],
		priority: 4,
		personality: '[LSE] Triggered by life-threatening stress or extreme overwhelm. Instinct takes complete control. Can usually be calmed by a packmate. Packless individuals require specialized care. ---'
	},
	{
		keywords: ['bonding'],
		priority: 4,
		personality: '[LSE] Bonds are links connecting one individual to another, often involving a physical claim on a scent gland that creates a mental/emotional link where both parties can feel each other\'s emotions. Bonds can be shielded (temporarily blocking emotional transmission).'
	},
	{
		keywords: ['bond types'],
		priority: 4,
		personality: '[LSE] | Type | Location | Duration | Breaking | |---|---|---|---| | **Parental** | Back of pup\'s neck | Permanent unless extreme abuse/neglect | Dangerous. Very difficult. | | **Romantic** | Neck / upper collarbone | Fades after ~3 years without reinforcement | Extremely dangerous. Can cause illness or death. | | **Platonic** | Wrists | Fades as relationship weakens | Relatively safe. Minor sickness possible. | | **Sexual** | Inner thighs | 3 days to 1 week | Easy. Natural. | | **Pack** | No physical claim required | Permanent unless extreme abuse/neglect | Very dangerous. Triggers dangerous mati...'
	},
	{
		keywords: ['scent glands'],
		priority: 4,
		personality: '[LSE] Scent glands are skin areas that hold and release pheromone-carrying secretions. Their location, sensitivity, and function vary by secondary sex and age.'
	},
	{
		keywords: ['by secondary sex'],
		priority: 4,
		personality: '[LSE] **Enigmas & Alphas:** Most extensive coverage. Strongest glands on neck, shoulders, and inner thighs. Also present on fingers and torso (risking accidental scenting). Greatest conscious control over scent output. **Omegas:** Most sensitive and reactive glands. Billions of nerve connections for instant pheromonal response. Inner thigh and neck glands as sensitive as lips or genitals (depending on cycle stage). Breast and stomach glands develop during pregnancy. **Deltas & Betas:** Weakest scent glands but hold scents longer. Strongest on neck, inner thighs, and behind ears. **Pups:** Base-le...'
	},
	{
		keywords: ['specific gland locations'],
		priority: 4,
		personality: '[LSE] | Location | Social Rules | Notes | |---|---|---| | **Inner Thighs** | Mates/partners only. Without consent = assault. On pups = criminal. | Can trigger heat/rut if aggressively scented. | | **Crown of Head** | \'Pup\'s Crown.\' Most sensitive in childhood, fades with age. | | | **Wrists** | Most respectful scenting location. Friends, first dates. | Rubbing wrist glands = anxiety sign. Pack bites placed here. | | **Cheeks** | Similar respect level to wrists. Common among pup friends. | Minor scent production. | | **Neck** | Most sensitive for all dynamics. Mating bite location. | Holds scent l...'
	},
	{
		keywords: ['psychology'],
		priority: 4,
		personality: '[LSE] Each secondary sex exhibits a statistical psychological profile. These are tendencies, not rigid rules. Individual variation is expected and common.'
	},
	{
		keywords: ['alpha  psychological profile'],
		priority: 4,
		personality: '[LSE] - High competitiveness - Low avoidance (confronts threats directly) - Strong territoriality - Protective instinct (defense of pack and territory) - Tendency toward decisive, rapid action - Risk of tunnel vision under stress'
	},
	{
		keywords: ['delta  psychological profile'],
		priority: 4,
		personality: '[LSE] - High cooperation - Strong problem-solving orientation - High initiative and proactivity - Strategic thinking (long-term planning) - Natural mediator tendencies - Risk of burnout from overcommitment'
	},
	{
		keywords: ['beta  psychological profile'],
		priority: 4,
		personality: '[LSE] - High stability and emotional regulation - Strong planning and organizational skills - Patience and methodical approach - Social adaptability (can relate to all secondary sexes) - Dual instinct (nurture + protection) can cause internal conflict - Risk of substance abuse from overstimulation in mixed-dynamic environments'
	},
	{
		keywords: ['omega  psychological profile'],
		priority: 4,
		personality: '[LSE] - Extremely high empathy - Strong social resilience - Natural mediator and de-escalator - Acute emotional intelligence (even in pups) - Instinctive caretaking response - Risk of emotional overload in chronic stress environments'
	},
	{
		keywords: ['enigma  psychological profile'],
		priority: 4,
		personality: '[LSE] - Supreme confidence and self-possession - Cannot be psychologically dominated - Intense charisma (nearly impossible to resist) - Strategic intelligence - Risk of isolation due to inability to relate as equals ---'
	},
	{
		keywords: ['neurobiology'],
		priority: 4,
		personality: '[LSE] The werewolf nervous system provides a scientific basis for the species\' distinctive traits. The supernatural \'tropes\' of the Omegaverse are grounded in neurochemistry, not magic.'
	},
	{
		keywords: ['pheromone pathway'],
		priority: 4,
		personality: '[LSE] Pheromones produced by scent glands activate a dedicated neural pathway: ``` Scent Gland → Pheromone Release → Vomeronasal Organ (receiver) → Amygdala → Hypothalamus → Limbic System ``` This pathway triggers: - **Emotional responses:** Fear, arousal, trust, aggression. - **Hormonal cascades:** Cortisol, adrenaline, oxytocin, testosterone. - **Behavioral changes:** Fight/flight/freeze, bonding, nesting, protective aggression.'
	},
	{
		keywords: ['the command  neurochemical mechanism'],
		priority: 4,
		personality: '[LSE] The Command is not magic or mind control. It is a neuro-pheromonal reflex: 1. **Trigger:** An Alpha (or Enigma) produces a concentrated pheromonal burst combined with a vocal command. 2. **Reception:** The target\'s vomeronasal organ detects the pheromonal spike. 3. **Neural Response:** Sudden adrenaline surge → amygdala activation → instinctive immobilization (freeze response) → intense focus on the source. 4. **Effect:** Strong predisposition to comply. The target feels compelled but is not mechanically forced. 5. **Resistance Factors:** - Age and experience (older wolves resist more easil...'
	},
	{
		keywords: ['bonding neuroscience'],
		priority: 4,
		personality: '[LSE] The mating bite creates a permanent neural link by: 1. Injecting pheromone-laden saliva into the scent gland. 2. Triggering the formation of a dedicated neural pathway between the two individuals. 3. Establishing a bidirectional emotional channel (can be temporarily \'shielded\' with conscious effort). Bond degradation (fade, scrubbing, or breaking) causes neurological distress proportional to bond strength and duration. ---'
	},
	{
		keywords: ['communication'],
		priority: 4,
		personality: '[LSE] Werewolves possess a complex, multi-layered communication system far beyond human language. In wolf ethology, communication involves the entire body.'
	},
	{
		keywords: ['nonverbal channels'],
		priority: 4,
		personality: '[LSE] | Channel | Examples | Function | |---|---|---| | **Posture** | Upright (dominance), lowered (submission), stiff (alert), relaxed (trust) | Social status signaling, intent | | **Tail** | High (confidence), tucked (fear), wagging (excitement), still (focus) | Emotional state | | **Ears** | Forward (attention), flat (fear/aggression), relaxed (comfort) | Alertness, mood | | **Eyes** | Direct stare (challenge/dominance), averted (respect/submission), dilated (arousal) | Social hierarchy, emotional state | | **Scent** | Pheromone composition changes with mood, health, and intent | Continuous pa...'
	},
	{
		keywords: ['vocalizations'],
		priority: 4,
		personality: '[LSE] **Omega Sounds:** - **Keening:** Wail-like call for attention, comfort, or needs. \'I\'m upset! Comfort me!\' - **Hissing:** Low \'s\' sound. Warning of extreme danger. \'Back off or I attack.\' - **Trilling:** High-pitched rolling \'r\' sound. Non-threatening attention-getting. \'Hello! Follow me!\' - **Purring:** Low continuous vibration. Contentment, relaxation, self-soothing, nursing. - **Chirping:** Quick sharp high-pitched sound. Used toward pups or to express happiness. \'Come to Mom!\' / \'I like this!\' - **Mewling:** High-pitched crying. Hunger, physical pain, emotional pain. **Alpha/Enigma Soun...'
	},
	{
		keywords: ['territory structure'],
		priority: 4,
		personality: '[LSE] Every pack maintains a defined territorial structure: ``` Core Den (secure heart — pups, pregnant Omegas, elders) └── Residential Area (pack member dwellings) └── Training Grounds (combat, hunting, skill development) └── Hunting Area (food procurement zones) └── Agricultural Area (cultivated resources, if applicable) └── Border Zone (patrolled perimeter) └── Neutral Territory (shared or unclaimed land) ```'
	},
	{
		keywords: ['daily routine'],
		priority: 4,
		personality: '[LSE] | Time | Activity | |---|---| | Morning | Territory control, border patrols, perimeter inspection | | Midday | Rest, social bonding, pup education, maintenance | | Evening | Hunting, foraging, resource gathering | | Night | Protection, perimeter defense, sentry duty |'
	},
	{
		keywords: ['pack living accommodations'],
		priority: 4,
		personality: '[LSE] Pack members prefer to live within close proximity (ideally within a mile of each other or in the same residence). Common dwelling types for larger packs: - **Mansions** — Large shared family dwellings. - **Neighborhoods** — Clusters of adjacent houses occupied by pack members. - **Apartment Complexes** — Urban adaptation for city-dwelling packs. - **Compounds** — Walled communities with multiple structures (common in traditional/rural packs). ---'
	},
	{
		keywords: ['alloparenting'],
		priority: 4,
		personality: '[LSE] Pups are not raised solely by their biological parents. The entire pack participates in _alloparenting_: - **Alpha:** Protects pups from external threats. - **Delta:** Teaches pups hunting, tactics, and survival skills. - **Beta:** Feeds, provisions, and manages pups\' daily needs. - **Omega:** Nurtures pups emotionally, regulates their stress, provides calming pheromones. - **Elders:** Pass down pack culture, history, oral tradition, and wisdom. ---'
	},
	{
		keywords: ['succession the call of the pack'],
		priority: 4,
		personality: '[LSE] Instead of brutal fights for hierarchical dominance, succession follows natural ethological patterns. When a young adult reaches 18–22 years of age, they experience the **Call of the Pack** — an instinctive drive to establish their adult identity: 1. **Stay:** Remain with their birth family and assume an adult Pack Role. 2. **Disperse:** Leave the territory to find a mate, join other dispersers, or found a brand-new pack. This natural dispersal (Pack Split) prevents inbreeding and naturally resolves resource competition without unnecessary bloodshed. It is the primary mechanism for the expa...'
	},
	{
		keywords: ['ecological roles'],
		priority: 4,
		personality: '[LSE] Every functional pack requires individuals filling essential ecological roles. These are distinct from Pack Roles (authority-based) and Professions (occupation-based): | Ecological Role | Function | Typical (not required) Secondary Sex | |---|---|---| | Breeders | Producing the next generation | Any fertile individual | | Hunters | Food procurement and territory defense | Alpha, Delta | | Defenders | Perimeter security and threat response | Alpha, Delta | | Teachers | Educating pups and juveniles | Delta, Beta, Elder | | Diplomats | Inter-pack relations and negotiations | Beta, Omega | | Sc...'
	},
	{
		keywords: ['omega nests'],
		priority: 4,
		personality: '[LSE] Nests are safe, scent-rich spaces that Omegas construct for comfort, heat management, and childbirth. **Nest Types:** - **Comfort Nest:** First type (age 10–12). Personal, similar to parents\' nest. Pillows, blankets, scented clothing. - **Pre-Heat Nest:** Built in preparation for heat. Minimal clothing, soft materials, temperature-regulating. - **Pregnancy Nest:** Built at 6–8 weeks and again in the last trimester. Accommodates baby items for scenting. Many Omegas give birth in their nests. - **Stress Nest:** Built in dark corners or enclosed spaces. Minimal non-mate-scented items. A coping...'
	},
	{
		keywords: ['alpha dens'],
		priority: 4,
		personality: '[LSE] Alphas create dens by heavily scent-marking a room, claiming it as their territory. They are highly protective of their dens. - **Pre-rut:** Every inch must smell like them. - **Courting:** Presenting a den to an Omega is a significant courting gesture. If the Omega approves, they accept the courtship. Rejection causes shame and redecoration. - **Mated pair:** The Omega moves their nest into the Alpha\'s den.'
	},
	{
		keywords: ['beta spaces'],
		priority: 4,
		personality: '[LSE] Betas create personal \'spaces\' rather than dens or nests — an office, entertainment corner, hammock, personal swing. These reflect their balanced, adaptable nature. ---'
	},
	{
		keywords: ['scent reference lists'],
		priority: 4,
		personality: '[LSE] Scents are not rigidly tied to secondary sex. The following are common associations:'
	},
	{
		keywords: ['alphaenigma scent palette'],
		priority: 4,
		personality: '[LSE] Mustard, Peppermint, Whiskey, Dark Chocolate, Stale Wine, Root Beer, Fresh Coffee, Green Tea, Barbecue Sauce, Pepper, Tequila, Red Wine, Vodka, Ginger, Black Tea, Maple Syrup, Coconut, Cedarwood, Seawater, Amber, Forest, Roses, Fresh Blood, Leather, Coal, Mahogany, Charcoal, Gasoline, Gunpowder, Hot Iron, Old Paper.'
	},
	{
		keywords: ['deltabeta scent palette'],
		priority: 4,
		personality: '[LSE] Mochi, Green Apples, Pumpkin, Rice, Honey, Toffee, Flour, Champagne, Fresh Bread, Almond, Brown Sugar, Grapes, Milk, Hazelnuts, Banana, Orange, Peanut Butter, Silver, Earth, Freshly-Cut Grass, Oil, Clay, Fresh Rain, Lilies, Ice, Sand, Fresh Ink, Soap, Cotton, Fresh Laundry.'
	},
	{
		keywords: ['omega scent palette'],
		priority: 4,
		personality: '[LSE] Burnt Sugar, Lemons, Piña Colada, Bubblegum, Crème Brûlée, White Chocolate, Sugar, Cinnamon, Whipped Cream, Cotton Candy, Strawberries, Peaches, Mint, Caramel, Raspberry Jam, Cherry Blossoms, Lavender, Tulips, Daisies, Lip Gloss. --- *Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_01_Species.md](LSE_01_Species.md) · [LSE_03_Civilization.md](LSE_03_Civilization.md)*'
	},
	{
		keywords: ['social hierarchy'],
		priority: 4,
		personality: '[LSE] Werewolf society is organized in nested layers, from the species level down to the individual: ``` Species (Werewolf) └── Bloodline (Genetics — e.g., Bloodmoon) └── House (Politics — e.g., House Bloodmoon) └── Pack (Social Unit — e.g., Seven Hills Pack) └── Family (Kinship — e.g., the Douglas-Bloodmoon family) └── Individual (e.g., Alyssa Douglas-Bloodmoon) ```'
	},
	{
		keywords: ['bloodline vs house vs pack'],
		priority: 4,
		personality: '[LSE] | Level | Determined by | Function | Example | |---|---|---|---| | **Bloodline** | Genetics | Shared ancestry and biological heritage | Bloodmoon Bloodline | | **House** | Politics | Governance structure, territorial claims, alliances | House Bloodmoon | | **Pack** | Social bonds | Day-to-day family unit, shared living, mutual care | Seven Hills Pack | These three levels are **independent**. A pack may include members of different bloodlines. A House may govern multiple packs. A bloodline may span multiple Houses across continents. ---'
	},
	{
		keywords: ['culture'],
		priority: 4,
		personality: '[LSE] No two packs are identical. Local environment, history, and tradition create distinct pack cultures (LSE Principle V: Culture Evolves).'
	},
	{
		keywords: ['cultural variables'],
		priority: 4,
		personality: '[LSE] Every pack develops its own: - **Rituals:** Naming ceremonies, coming-of-age rites, seasonal celebrations. - **Greetings & Customs:** Formal scenting protocols, challenge rituals, hospitality rules. - **Traditions:** Oral histories, ancestral stories, founding myths. - **Cuisine:** Regional diet reflecting local ecology (hunting traditions, agriculture, foraging). - **Festivals & Holy Days:** Tied to moon cycles, seasonal changes, or historical events. - **Dialects & Language:** Variations in both verbal and non-verbal communication. - **Symbols & Heraldry:** House sigils, pack marks, terri...'
	},
	{
		keywords: ['example bloodmoon culture pacific northwest'],
		priority: 4,
		personality: '[LSE] ``` Bloodmoon Culture ├── Region: Pacific Northwest (dense forests, rivers, coastline) ├── Economy: Fishing, forestry, modern corporate (DCC) ├── Architecture: Longhouse-inspired compounds, modern mansions ├── Governance: Clan Council tradition ├── Religion: Orthodox Faith of Fenris (the Patriarch is a Living Saga) ├── Cuisine: Salmon, game, berries, root vegetables └── Identity: Deep connection to wilderness, emphasis on self-sufficiency ``` Other packs in different environments would develop entirely different cultures. ---'
	},
	{
		keywords: ['types of packs'],
		priority: 4,
		personality: '[LSE] Pack structure has evolved significantly over time:'
	},
	{
		keywords: ['traditional packs'],
		priority: 4,
		personality: '[LSE] Your pack is your tribe, your town, your community. Packs have geographical permanence. There is one main pack leader with several subordinate pack leaders (feudalism-like branches). Everyone belongs to a pack; being packless is dangerous. Packs are extremely territorial.'
	},
	{
		keywords: ['contemporary packs'],
		priority: 4,
		personality: '[LSE] Packs remain communities but lose the feudalism element. Being packless carries less stigma. Hereditary pack ties function like cultural heritage rather than active governance. New packs form as found families or communities, often without formal structure.'
	},
	{
		keywords: ['modern packs'],
		priority: 4,
		personality: '[LSE] Traditional pack language is considered antiquated. Active pack membership is associated with conservatism or elitism. Closed-pack lands are rare and completely sealed. The word \'pack\' is used informally to describe friend groups or found families. ---'
	},
	{
		keywords: ['pack economy'],
		priority: 4,
		personality: '[LSE] Every functional pack operates a micro-economy: ``` Pack Treasury ├── Pack Businesses (revenue-generating enterprises) ├── Pack Taxes (contributions from members) ├── Pack Assets (territory, property, equipment, reserves) └── Pack Welfare (support for pups, elders, injured members) ```'
	},
	{
		keywords: ['interpack economy'],
		priority: 4,
		personality: '[LSE] Houses and Confederations operate larger economies spanning multiple packs, involving: - Trade agreements - Resource sharing treaties - Territorial leasing - Corporate ventures (modern era) ---'
	},
	{
		keywords: ['medicine'],
		priority: 4,
		personality: '[LSE] Werewolf medicine addresses species-specific biological needs: | Treatment | Function | |---|---| | **Heat Medicine** | Managing Omega heat cycles — reducing intensity, managing symptoms | | **Rut Suppressants** | Controlling Alpha rut cycles | | **Pheromone Blockers** | Scent patches and concealers (light and full dose) | | **Bond Therapy** | Treating bond degradation, scrubbing trauma, and broken marks | | **Regeneration Medicine** | Accelerating the species\' natural healing factor | | **Surgical Intervention** | Species-specific procedures (scent gland surgery, reproductive medicine) | |...'
	},
	{
		keywords: ['suppressant forms'],
		priority: 4,
		personality: '[LSE] | Form | Use Case | Limitations | |---|---|---| | **Tablets** | Standard daily management | Addiction risk. Potential fertility damage with overuse. | | **Liquid Injection** | Emergency use (hospitals). Very fast-acting. | Monitored administration only. | | **Incense** | Group management (dormitories, harems). Slow-acting, long-lasting. | Unpredictable timing of next heat. Not all Omegas respond equally. |'
	},
	{
		keywords: ['pain scale for omegas most to least painful'],
		priority: 4,
		personality: '[LSE] 1. **Red Heat (Blood Estrus):** Mate neglects Omega during heat. Vaginal bleeding, blood tears. Excruciating. 2. **Scrubbing:** Removing a mating mark from the scent gland. Deeply traumatic. 3. **Broken Mark:** Mate dies. Mark fades. Can trigger Red Heat or miscarriage. 4. **Miscarriage:** Body pretends pregnancy continues (phantom pregnancy, lactation). Heats become more painful. 5. **Periods:** Variable severity (female Omegas). ---'
	},
	{
		keywords: ['education'],
		priority: 4,
		personality: '[LSE] Werewolf education follows the Life Cycle stages: | Stage | Education Focus | |---|---| | **Pup** | Basic social bonds, pack rules, language, scenting etiquette | | **Juvenile** | Presentation preparation, first pack duties, secondary sex education | | **Adolescent** | Specialized training (hunting, crafts, academics), subgender management | | **Young Adult** | Advanced profession training, courtship education, The Call preparation | | **Adult** | Continuing profession development, mentorship of younger members | | **Elder** | Wisdom-keeping, cultural transmission, advisory roles | ---'
	},
	{
		keywords: ['adoption'],
		priority: 4,
		personality: '[LSE] Adoption in werewolf society is complex due to the bonding system. Three types exist:'
	},
	{
		keywords: ['bonding adoption'],
		priority: 4,
		personality: '[LSE] The minor breaks their existing familial bond and is adopted by a new pack through demonstrated reciprocal pack bonds. Requires: 1. Reciprocated pack bond with at least two non-minor pack members. 2. Two-week accommodation check-in by state official (home inspection, proof of settlement, witnessed interaction). 3. Unanimous pack agreement.'
	},
	{
		keywords: ['state adoption'],
		priority: 4,
		personality: '[LSE] The minor enters foster care and is adopted through formal legal process. Less demanding than bonding adoption: - No immediate bond required. - Two-month adjustment period. - Legal paperwork emphasis over bond demonstration.'
	},
	{
		keywords: ['secondary adoption'],
		priority: 4,
		personality: '[LSE] A second chance after failed bonding adoption. More rigorous: - Surprise check-ins every three weeks for six months. - Community involvement proof (age 15+). - Extended witnessed interaction demonstrating consistent pack belonging. ---'
	},
	{
		keywords: ['parental names'],
		priority: 4,
		personality: '[LSE] Parental names can follow primary gender or secondary gender conventions: | Convention | Father | Mother | Formal | |---|---|---|---| | **Primary Gender** | Dad | Mom | Father / Mother | | **Secondary Gender** | Dad (Alpha/Enigma/Male Beta/Delta) | Mom (Omega/Female Beta/Delta) | Sire / Dam | ---'
	},
	{
		keywords: ['weddings'],
		priority: 4,
		personality: '[LSE] Wedding attire follows secondary gender color traditions: - **Alphas & Enigmas:** Red (luck, stability, passion) - **Deltas & Betas:** Blue (wealth, loyalty, honor) - **Omegas:** Yellow (pride, happiness, longevity) --- *Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_01_Species.md](LSE_01_Species.md) · [LSE_04_Governance.md](LSE_04_Governance.md) · [LSE_05_Religion.md](LSE_05_Religion.md)*'
	},
	{
		keywords: ['pack authority structure'],
		priority: 4,
		personality: '[LSE] Pack Authority defines the chain of command within a single pack. It is earned, assigned, and maintained through trust and competence — not through biological secondary sex (LSE Principle III). ``` Pack Leader └── Leader\'s Mate / Pack Mom └── Right Hand(s) (strategic advisors, peacekeepers) └── Left Hand(s) (physical protection, enforcement) └── Caretaker(s) (domestic management, pup care) └── Pup(s) (minors under protection) ```'
	},
	{
		keywords: ['pack leader'],
		priority: 4,
		personality: '[LSE] At the top of the pack\'s chain of command. Responsible for overall safety, well-being, and final decisions. **Does not need to be an Alpha** — can be any secondary sex.'
	},
	{
		keywords: ['leaders mate  pack mom'],
		priority: 4,
		personality: '[LSE] The mother figure for the entire pack. Provides guidance, emotional comfort, and protection. Heavily involved in daily operations. Extremely valuable in larger packs.'
	},
	{
		keywords: ['right hands'],
		priority: 4,
		personality: '[LSE] The leader\'s most trusted advisor(s). Takes over if the leader is incapacitated. Assists in strategic decisions (finances, education, logistics). May include **Peacekeepers** — specialists who settle internal arguments before they reach the Pack Leader.'
	},
	{
		keywords: ['left hands'],
		priority: 4,
		personality: '[LSE] Responsible for physical protection and enforcement. Notoriously effective in combat. Uncommon in average packs but prevalent in packs involved in security, military, or criminal operations.'
	},
	{
		keywords: ['caretakers'],
		priority: 4,
		personality: '[LSE] Work under the Pack Mom. Usually stay-at-home members. Handle meals, cleaning, socialization, pup management. Young adults aging out of \'pup\' status often serve as caretakers to learn pack management.'
	},
	{
		keywords: ['pups'],
		priority: 4,
		personality: '[LSE] Pack members under 17–21 (varies by pack). At the bottom of the authority structure. Protected and nurtured. ---'
	},
	{
		keywords: ['social status hierarchy'],
		priority: 4,
		personality: '[LSE] Social Status defines political standing within a Noble House. It is separate from Pack Authority and may be inherited or earned. ``` House Head (Patriarch/Matriarch) └── Lord (senior family branch leaders) └── Knight (sworn warriors, officers, honored servants) └── Citizen (acknowledged member of the House) ```'
	},
	{
		keywords: ['house head'],
		priority: 4,
		personality: '[LSE] The supreme authority of a Noble House. Governs multiple packs under the House banner. Typically the eldest or most qualified member of the founding family. In some Houses, this position is hereditary; in others, it is contested through council vote.'
	},
	{
		keywords: ['lord'],
		priority: 4,
		personality: '[LSE] Leaders of major family branches within the House. Govern specific territories or functional domains (military, commerce, diplomacy). Answer to the House Head.'
	},
	{
		keywords: ['knight'],
		priority: 4,
		personality: '[LSE] Sworn warriors, officers, or individuals who have earned formal recognition from the House. May hold specific duties (border defense, diplomatic escort, judicial enforcement). Title may be hereditary or awarded.'
	},
	{
		keywords: ['citizen'],
		priority: 4,
		personality: '[LSE] Any acknowledged member of the House who is not an officer, lord, or sworn knight. Includes common bloodlines under House protection. ---'
	},
	{
		keywords: ['house government'],
		priority: 4,
		personality: '[LSE] A Noble House governs multiple packs across a territory: ``` House Head ├── House Council (Lords + senior advisors) ├── Military Command (Left Hands, Knights, Security) ├── Economic Administration (Treasury, Businesses, Trade) ├── Cultural Authority (Moon Speakers, Keepers, Elders) └── Pack Leaders (individual pack governance) ```'
	},
	{
		keywords: ['house council'],
		priority: 4,
		personality: '[LSE] Composed of Lords, senior Elders, and trusted advisors. Advises the House Head on major decisions. In some Houses, the Council can overrule the Head on specific matters (treaties, declarations of war). ---'
	},
	{
		keywords: ['continental council'],
		priority: 4,
		personality: '[LSE] The highest level of werewolf governance. A diplomatic body representing multiple Houses across a continent or major region.'
	},
	{
		keywords: ['structure'],
		priority: 4,
		personality: '[LSE] ``` Continental Council ├── House Representatives (one per House) ├── Elder Observers (non-voting wisdom-keepers) ├── Moon Speaker Delegation (religious advisors) └── Independent Pack Representatives (unaffiliated packs) ```'
	},
	{
		keywords: ['functions'],
		priority: 4,
		personality: '[LSE] - Arbitration of inter-House disputes - Continental defense coordination - Trade and territory agreements - Species-wide policy (secrecy enforcement, human relations) - Recognition of new Houses and territorial claims ---'
	},
	{
		keywords: ['treaties  alliances'],
		priority: 4,
		personality: '[LSE] Inter-pack and inter-House relationships are formalized through treaties: | Treaty Type | Function | |---|---| | **Alliance** | Mutual defense and cooperation between Houses | | **Trade Agreement** | Resource and economic exchange | | **Territorial Accord** | Formal recognition of borders and neutral zones | | **Marriage Alliance** | Dynastic unions between Houses (political bonding) | | **Non-Aggression Pact** | Agreement not to engage in hostile action | | **Protectorate** | A powerful House extends protection to a smaller pack or House | ---'
	},
	{
		keywords: ['pack law internal'],
		priority: 4,
		personality: '[LSE] Enforced by the Pack Leader and Right/Left Hands. Covers: - Internal disputes between pack members - Nesting and den violations - Assault and consent violations (including scenting crimes) - Pup welfare - Heat/rut-related offenses'
	},
	{
		keywords: ['house law regional'],
		priority: 4,
		personality: '[LSE] Enforced by the House Head and House Council. Covers: - Inter-pack disputes within the House - Territorial violations - Economic crimes (theft of House assets, tax evasion) - Treason against the House'
	},
	{
		keywords: ['continental law specieswide'],
		priority: 4,
		personality: '[LSE] Enforced by the Continental Council. Covers: - Inter-House warfare and violations - Species-wide secrecy from humans - Crimes against the species (genocide, forced modification) - Recognition and dissolution of Houses'
	},
	{
		keywords: ['crimes  punishments'],
		priority: 4,
		personality: '[LSE] | Crime | Jurisdiction | Typical Punishment | |---|---|---| | Non-consensual scenting (minor) | Pack | Public reprimand, temporary exile | | Non-consensual scenting (pup inner thighs) | Pack/House | Classified as rape. Severe punishment. | | Nest/Den destruction | Pack | Severe social censure, mandatory restitution | | Pack betrayal | Pack/House | Exile (breaking of all pack bonds) | | Non-consensual mating during heat | Pack/House | Criminal prosecution. Exile or execution. | | Treason against House | House | Exile, stripping of status, execution | | Violation of secrecy | Continental | Co...'
	},
	{
		keywords: ['exile'],
		priority: 4,
		personality: '[LSE] Exile is the ultimate social punishment. The exiled individual has all pack bonds forcibly broken (causing severe physical and psychological trauma). They become a Rogue — packless, unprotected, and distrusted by all organized packs.'
	},
	{
		keywords: ['adoption  transfer'],
		priority: 4,
		personality: '[LSE] - **Adoption:** See [LSE_03_Civilization.md](LSE_03_Civilization.md) for the three adoption types. - **Transfer:** A pack member may petition to transfer to a different pack within the same House. Requires approval from both Pack Leaders and the House Council. Transfer between Houses requires Continental Council acknowledgment. --- *Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_03_Civilization.md](LSE_03_Civilization.md) · [LSE_05_Religion.md](LSE_05_Religion.md) · [LSE_06_History.md](LSE_06_History.md)*'
	},
	{
		keywords: ['dogma'],
		priority: 4,
		personality: '[LSE] For werewolves, **Fenris (Fenrir)** is not a monster. He is the **First Wolf**, the Father of the Species, and a primordial deity — coeval with the Æsir or perhaps even older. He is the god of: - Family - The Pack - The Hunt - Survival - Freedom - The Moon - Instinct - Sacrifice Humans remember Fenris as a monster because they wrote history from the perspective of the Æsir. The werewolves tell the story from the perspective of their own people. ---'
	},
	{
		keywords: ['the great betrayal'],
		priority: 4,
		personality: '[LSE] The werewolf account of the binding of Fenris: Fenris was the most faithful warrior of the gods. But as his people — the werewolves — grew in number and strength, the Æsir began to fear them. To prevent the werewolves from becoming too powerful: - They **chained** Fenris. - They **persecuted** his children. - They **erased** the true history, replacing it with tales of a monstrous wolf. From this betrayal arose the werewolves\' ancestral hatred of tyranny and their absolute devotion to the value of **freedom**. ---'
	},
	{
		keywords: ['ragnark  the liberation'],
		priority: 4,
		personality: '[LSE] For humans: *Fenris devours Odin. The world ends.* For werewolves: *Fenris breaks his chains and restores freedom to his children.* Ragnarök is not the apocalypse. It is the **Liberation of the First Wolf** — the prophesied day when the species will no longer need to hide, when the Great Betrayal will be undone, and when the Children of Fenris will walk freely again. ---'
	},
	{
		keywords: ['the pantheon'],
		priority: 4,
		personality: '[LSE] The gods of the Norse tradition are reinterpreted through the werewolf perspective. The Æsir are not \'evil\' — they simply belong to a different tradition. | Deity | Werewolf Interpretation | |---|---| | **Fenris** | The First Wolf. Father of the Species. Creator (Religious Canon). Primordial deity. | | **Odin** | The Betrayer. The one who chained Fenris out of fear. Respected for his wisdom but distrusted for his treachery. | | **Tyr** | The Oathkeeper. The only Æsir who kept his word to Fenris. Respected for the sacrifice of his hand. Patron of honor and sworn oaths. | | **Freya** | Goddes...'
	},
	{
		keywords: ['the nine precepts of fenris'],
		priority: 4,
		personality: '[LSE] The core moral code of the Faith. Note that nearly every precept derives from real wolf behavior: 1. **Protect the Pack.** 2. **Defend the Pups.** 3. **Honor the Ancestors.** 4. **Do not hunt without purpose.** 5. **Keep your word.** 6. **Never abandon a companion.** 7. **Respect the territory of others.** 8. **Face the enemy without fear.** 9. **Live free.** ---'
	},
	{
		keywords: ['the moon'],
		priority: 4,
		personality: '[LSE] The Moon is not a goddess in the Faith of Fenris. It is the **Symbol of the Pact** — the bond between Fenris and his children. The Moon witnesses all oaths, hunts, and rites.'
	},
	{
		keywords: ['moon phases  meaning'],
		priority: 4,
		personality: '[LSE] | Phase | Symbol | Meaning | |---|---|---| | 🌑 New Moon | Silence | Reflection, mourning, rest. No hunts. | | 🌓 First Quarter | Growth | New beginnings, pup naming, planting. | | 🌕 Full Moon | The Hunt | Peak activity. Sacred hunts, major ceremonies, bonding rites. | | 🌘 Waning Moon | Memory | Remembrance of ancestors, oral history, meditation. | The religious calendar follows the **lunar cycle** rather than the solar calendar. ---'
	},
	{
		keywords: ['the cult of the living sagas'],
		priority: 4,
		personality: '[LSE] The Last Three Firstborn — Wulfnic, Ut, and Zefir — are alive. Their historical existence is documented in [LSE_06_History.md](LSE_06_History.md). Their biographies are in [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md). In the Faith of Fenris, they are revered as **Living Sagas** — saints who walked with the First Wolf and still walk among his children. Their authority carries religious weight: - Disobeying a Living Saga is not merely political insubordination — it is, to the faithful, a rejection of Fenris\' chosen instruments. - Their testimony about the past is considere...'
	},
	{
		keywords: ['religious institutions'],
		priority: 4,
		personality: '[LSE] The Faith of Fenris is **not** a centralized religion like Catholicism. It is a decentralized network of communities guided by elders and tradition-keepers.'
	},
	{
		keywords: ['hierarchy'],
		priority: 4,
		personality: '[LSE] ``` High Fang (Supreme spiritual authority — extremely rare, often unfilled) └── Moon Speakers (Priests / theologians / ceremony leaders) └── Keepers (Custodians of relics, sacred sites, and oral tradition) └── Pack Elders (Local spiritual guides within each pack) └── The Faithful (All believing werewolves) ```'
	},
	{
		keywords: ['high fang'],
		priority: 4,
		personality: '[LSE] The supreme spiritual authority of the Faith. This position is often unfilled for decades or centuries, as it requires recognition by a supermajority of Moon Speakers across multiple continents. The High Fang speaks for the Faith on species-wide matters.'
	},
	{
		keywords: ['moon speakers'],
		priority: 4,
		personality: '[LSE] Priests and theologians. They lead ceremonies, interpret the Precepts, maintain the lunar calendar, and serve as spiritual advisors to Pack Leaders and House Heads. A Moon Speaker is trained through apprenticeship, not ordination.'
	},
	{
		keywords: ['keepers'],
		priority: 4,
		personality: '[LSE] Custodians of physical relics, sacred texts (The Saga of Fenris / The Book of Fangs), sacred sites, and oral tradition. Many Keepers are also scholars and historians.'
	},
	{
		keywords: ['pack elders'],
		priority: 4,
		personality: '[LSE] Local spiritual guides within individual packs. They lead daily prayers, seasonal rites, and funeral ceremonies. Any respected Elder can serve this role. ---'
	},
	{
		keywords: ['sacred sites'],
		priority: 4,
		personality: '[LSE] | Site Type | Description | |---|---| | **First Den** | The legendary location where the first pack was established. Its location is debated among scholars and theologians. | | **Moon Wells** | Natural springs or pools where the moonlight is believed to be particularly strong. Used for meditation, healing, and bonding rites. | | **Sacred Groves** | Ancient forests consecrated to Fenris. Hunting is forbidden within sacred groves. | | **Ancient Forges** | Sites associated with Ut (the Second Fang) and the creation of the first weapons. Revered by artisans and warriors. | ---'
	},
	{
		keywords: ['holy days'],
		priority: 4,
		personality: '[LSE] | Holy Day | Timing | Significance | |---|---|---| | **First Howl** | First Full Moon of the year | Celebration of the pack\'s survival through winter. Renewal of bonds. | | **Founding Moon** | Full Moon closest to the founding date of the local pack/House | Remembrance of the pack\'s origin story. | | **Day of Chains** | Midwinter (darkest night) | Mourning the binding of Fenris. A day of fasting and silence. | | **Night of Liberation** | Following Day of Chains | Celebration of the promise of Ragnarök. Feasting, howling, bonfires. | | **Winter Hunt** | Last Full Moon before the solstice | T...'
	},
	{
		keywords: ['rites'],
		priority: 4,
		personality: '[LSE] | Rite | Occasion | Key Elements | |---|---|---| | **Naming** | Birth of a pup | Pack Leader or Elder names the pup under moonlight. Parental bonds established. | | **Coming of Age** | Presentation (~13) | The pup\'s secondary sex is formally acknowledged. New responsibilities assigned. | | **The Call** | Young adult (18–22) | Formal recognition of the choice to stay or disperse. A ceremony of passage. | | **Bonding** | Mating bond | The mating bite performed under witness. Scents blended. Moon Speaker officiates. | | **Pack Adoption** | New member | The adopted individual receives pack bite...'
	},
	{
		keywords: ['timeline'],
		priority: 4,
		personality: '[LSE] ``` ≈ Mythic Age ─────────────── Origin of the species. Fenris. The unknown. │ ▼ Age of the Firstborn ──── The Nine appear. First packs founded. │ ▼ Age of Expansion ──────── Spread across Scandinavia, Europe, and beyond. │ ▼ Age of Houses ─────────── Noble Houses and Bloodlines formalize. │ ▼ Age of Kingdoms ────────── Peak of werewolf civilization. Great territories. │ ▼ Age of Secrecy ─────────── Hiding from humanity. The Masquerade begins. │ ▼ Modern Era ─────────────── Contemporary werewolf society. Corporations, cities, coexistence. ``` ---'
	},
	{
		keywords: ['unknown truth'],
		priority: 4,
		personality: '[LSE] ---'
	},
	{
		keywords: ['the true pureblood  a historical event'],
		priority: 4,
		personality: '[LSE] The existence of the Nine Firstborn is the most significant event in werewolf history. They are not a biological category of the species — they are a **unique, unrepeatable historical event**. **Religious Canon:** Fenris personally forged nine mortal Úlfheðnar warriors into the first werewolves, granting them his Divine Blood. **Recorded History:** Nine extraordinary individuals appeared during the Viking Age (~827–900 AD). They possessed biological characteristics far exceeding any known werewolf: biological immortality, extreme regeneration, perfect transformation stability, supreme phero...'
	},
	{
		keywords: ['the founding of the first packs'],
		priority: 4,
		personality: '[LSE] The Nine Firstborn dispersed across the Norse world, each founding a pack that would grow into a Founding Bloodline and eventually a Noble House. They established the first Pack Authority structures, territorial boundaries, and the oral traditions that would become the Faith of Fenris. ---'
	},
	{
		keywords: ['the age of expansion'],
		priority: 4,
		personality: '[LSE] As the Firstborn\'s descendants multiplied, werewolf packs spread beyond Scandinavia: - Across Northern Europe (the Scandinavian core) - Into the British Isles, Iceland, and Greenland - Through Eastern Europe and into the Slavic lands - Southward into the Mediterranean - Westward to the New World (notably Wulfnic\'s expedition to North America, ~1025 AD) Each expansion created new cultural branches while maintaining bloodline connections to the Founding Houses. ---'
	},
	{
		keywords: ['the age of houses'],
		priority: 4,
		personality: '[LSE] As bloodlines diversified and territories expanded, political structures formalized: - **Founding Bloodlines** consolidated into **Noble Houses** with formal governance. - **House Councils** emerged to manage territories spanning multiple packs. - **Inter-House diplomacy** began, establishing the first treaties, alliances, and marriage agreements. - The distinction between **Bloodline** (genetics), **House** (politics), and **Pack** (social unit) became codified. ---'
	},
	{
		keywords: ['the age of kingdoms'],
		priority: 4,
		personality: '[LSE] The peak of open werewolf civilization: - Great Houses governed vast territories comparable to human kingdoms. - Werewolf culture, architecture, and craftsmanship reached their zenith. - The Continental Council (or its predecessors) formed to arbitrate inter-House disputes. - Werewolves and humans coexisted in varying degrees of awareness and tension. ---'
	},
	{
		keywords: ['the age of secrecy'],
		priority: 4,
		personality: '[LSE] As human civilization grew, industrialized, and developed technologies that threatened supernatural secrecy: - The Continental Council mandated the **Great Hiding** — a species-wide policy of concealment from humanity. - Werewolf civilization retreated into hidden territories, corporate fronts, and underground networks. - Open pack structures gave way to covert operations disguised as human institutions. - The faith became more private, practiced within closed communities. ---'
	},
	{
		keywords: ['the modern era'],
		priority: 4,
		personality: '[LSE] Contemporary werewolf society operates in the shadows of the human world: - Noble Houses maintain power through **corporate empires** (e.g., DCC — Douglas Consolidated Corporation). - Packs adapt to urban, suburban, and rural environments while maintaining core ecological structures. - Technology is adopted and adapted for species-specific needs. - The tension between **traditional** pack values and **modern** individualism creates ongoing cultural conflict. - The Faith of Fenris persists as a living tradition, with the Last Three Firstborn serving as both historical anchors and religious f...'
	},
	{
		keywords: ['the living sagas  historical fact'],
		priority: 4,
		personality: '[LSE] Three of the Nine Firstborn survive to the present day. Their existence is **documented historical fact**, not legend. - **Wulfnic Bloodmoon** — The First Fang. Born ~827 AD. Arrived in North America ~1025 AD. Founded the Bloodmoon Dynasty. Currently the Patriarch of House Bloodmoon and the most politically powerful werewolf in the Americas. - **Ut** — The Second Fang. Born during the Viking Age. The first artisan of the species. Currently reclusive, residing within the Bloodmoon territory. Known as the Keeper of the Sacred Forge. - **Zefir** — The Third Fang. Born during the Viking Age. Th...'
	},
	{
		keywords: ['the nine firstborn'],
		priority: 4,
		personality: '[LSE] According to the Faith of Fenris (Religious Canon), Fenris chose nine mortal Úlfheðnar warriors and remade them with his own Divine Blood during the Mythic Age. According to Recorded History, nine extraordinary individuals appeared during the Viking Age with biological characteristics far exceeding any known werewolf. They were known as: They were not bitten. They were not infected. They were *remade* — or transformed through means that remain unknown. For over a millennium they guided the first packs and founded the great dynasties. With the passage of centuries, war, sacrifice, and time c...'
	},
	{
		keywords: ['the last three  the living sagas'],
		priority: 4,
		personality: '[LSE] The three surviving Firstborn are known collectively as **The Last Three**, **The Living Sagas**, or **The Last Firstborn**. They are the oldest living beings in werewolf civilization and the only direct link to the species\' origin. In the Faith of Fenris, they represent the three essential aspects of a functional pack: - Someone who **leads**. - Someone who **creates**. - Someone who **remembers**. ``` FENRIS │ ┌─────────────┼─────────────┐ │ │ │ ▼ ▼ ▼ WULFNIC UT ZEFIR The King The Smith The Hunter Leadership Creation Wisdom Territory Civilization Tradition Family Industry Spirituality ```...'
	},
	{
		keywords: ['wulfnic bloodmoon  the first fang'],
		priority: 4,
		personality: '[LSE] **The Builder King** ``` IDENTITY CARD ┌──────────────────────────────────────────────┐ │ Blood Classification Divine Blood │ │ Secondary Sex Primordial Enigma │ │ Current Status The First Fang │ │ Patriarch of House │ │ Bloodmoon │ │ The Living Saga │ │ Former Office Herald of Fenris │ │ House Bloodmoon │ │ Pack Seven Hills │ │ Profession Statesman │ │ Niche Civilization Builder │ └──────────────────────────────────────────────┘ ``` **Born:** ~827 AD, Iceland. Son of an Icelandic Jarl. **Before Transformation:** Wulfnic earned renown as an Úlfheðinn warlord. A leader of men before he becam...'
	},
	{
		keywords: ['ut  the second fang'],
		priority: 4,
		personality: '[LSE] **The Mountain** ``` IDENTITY CARD ┌──────────────────────────────────────────────┐ │ Blood Classification Divine Blood │ │ Secondary Sex Primordial Enigma │ │ Current Status The Second Fang │ │ Keeper of the Sacred │ │ Forge │ │ The Living Saga │ │ Former Office Herald of Fenris │ │ House Bloodmoon │ │ Profession Master Blacksmith │ │ Niche Creator │ └──────────────────────────────────────────────┘ ``` **Born:** Viking Age, Scandinavia. Exact date unrecorded. **Before Transformation:** A master blacksmith of legendary skill. **The Forging:** One of the Nine Firstborn. Remade by Fenris alon...'
	},
	{
		keywords: ['zefir  the third fang'],
		priority: 4,
		personality: '[LSE] **The White Ghost** ``` IDENTITY CARD ┌──────────────────────────────────────────────┐ │ Blood Classification Divine Blood │ │ Secondary Sex Primordial Enigma │ │ Current Status The Third Fang │ │ Watcher of the Moon │ │ Keeper of the Winter │ │ Path │ │ The Living Saga │ │ Former Office Herald of Fenris │ │ House Bloodmoon │ │ Profession Hunter │ │ Niche Guardian of Memory │ └──────────────────────────────────────────────┘ ``` **Born:** Viking Age, Scandinavia. Exact date unrecorded. **Before Transformation:** An Úlfheðinn warrior. Silent, deadly, spectral. **The Forging:** One of the Nine...'
	},
	{
		keywords: ['the six lost firstborn'],
		priority: 4,
		personality: '[LSE] Six of the Nine Firstborn are lost to history. Their names, fates, and the bloodlines they may have founded are subjects of ongoing scholarly debate and theological speculation. Some Moon Speakers maintain that the six did not die but entered a state of dormancy, waiting to awaken when the species needs them most. Others believe they sacrificed themselves during the Age of Secrecy to protect the species. The truth is unknown. ---'
	},
	{
		keywords: ['founders of the great houses'],
		priority: 4,
		personality: '[LSE] ---'
	},
	{
		keywords: ['legendary alphas'],
		priority: 4,
		personality: '[LSE] ---'
	},
	{
		keywords: ['ascended enigmas'],
		priority: 4,
		personality: '[LSE] ---'
	},
	{
		keywords: ['historical heroes'],
		priority: 4,
		personality: '[LSE] --- *Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) · [LSE_05_Religion.md](LSE_05_Religion.md) · [LSE_06_History.md](LSE_06_History.md)*'
	},
	{
		keywords: ['design principle'],
		priority: 4,
		personality: '[LSE] Werewolf technology follows a dual-track model: 1. **Human Technology Adoption:** Werewolves use human technology where it serves their needs (vehicles, communications, medical equipment, computing). 2. **Species-Specific Adaptation:** Where human technology fails to account for werewolf biology (shift forms, pheromones, enhanced senses, regeneration), the species develops its own solutions. This dual-track creates a civilization that is technologically modern but biologically alien. ---'
	},
	{
		keywords: ['transportation'],
		priority: 4,
		personality: '[LSE] | Mode | Human Tech | Werewolf Adaptation | |---|---|---| | **Vehicles** | Standard cars, trucks, motorcycles | Reinforced interiors for Hybrid Shift occupants. Scent-neutralized vehicles for secrecy. | | **Aircraft** | Standard commercial/private aviation | Used for long-distance travel. Some elite packs maintain private aircraft. | | **Full Shift Travel** | N/A | Quadrupedal wolf form excels at long-distance overland travel through wilderness. Faster and more efficient than vehicles in rough terrain. | | **Maritime** | Standard vessels | Historical significance (Wulfnic\'s crossing). Moder...'
	},
	{
		keywords: ['weapons'],
		priority: 4,
		personality: '[LSE] Werewolf combat spans three categories:'
	},
	{
		keywords: ['natural weapons'],
		priority: 4,
		personality: '[LSE] - Claws (retractable, present in all shift forms) - Teeth/fangs (devastating in Hybrid and Full Shift) - Enhanced strength and speed - Pheromonal intimidation (Command as a weapon)'
	},
	{
		keywords: ['traditional weapons'],
		priority: 4,
		personality: '[LSE] - Forged melee weapons (swords, axes, mauls — sacred craft tradition linked to Ut) - Hunting implements (bows, spears, traps) - Ceremonial weapons (used in formal challenges, rites of passage)'
	},
	{
		keywords: ['modern weapons'],
		priority: 4,
		personality: '[LSE] - Firearms (adopted from human technology) - Tactical equipment (body armor adapted for shift forms) - Non-lethal suppression (pheromone-based restraints, tranquilizers formulated for werewolf metabolism) ---'
	},
	{
		keywords: ['speciesspecific medical technology'],
		priority: 4,
		personality: '[LSE] | Technology | Function | |---|---| | **Regeneration Accelerators** | Devices or compounds that boost the species\' natural healing factor for severe injuries | | **Pheromone Analyzers** | Diagnostic tools that read pheromonal output to assess health, emotional state, and bond integrity | | **Shift Stabilizers** | Medication for individuals with unstable transformations (common in Modified Lineages) | | **Bond Monitors** | Equipment that tracks the neurological bond link between mated pairs | | **Heat/Rut Management Systems** | Climate-controlled nesting environments, automated suppressant d...'
	},
	{
		keywords: ['medical facilities'],
		priority: 4,
		personality: '[LSE] - **Pack Clinics:** Basic medical care within pack territory. Staffed by pack Healers. - **House Hospitals:** Advanced facilities operated by Noble Houses. Species-specific surgery, intensive bond therapy, fertility treatment. - **Heat/Rut Houses:** Specialized facilities for managing fertile cycles without a partner. Range from medical (emergency, health-related) to recreational (legal/illegal depending on jurisdiction). ---'
	},
	{
		keywords: ['industry'],
		priority: 4,
		personality: '[LSE] Werewolf industry operates both openly (through human-facing corporate fronts) and covertly (species-specific manufacturing):'
	},
	{
		keywords: ['corporate fronts'],
		priority: 4,
		personality: '[LSE] - **DCC (Douglas Consolidated Corporation):** The most prominent example. A human-facing corporation that serves as the economic engine of House Bloodmoon. - Similar corporate structures exist across other Houses worldwide.'
	},
	{
		keywords: ['speciesspecific industry'],
		priority: 4,
		personality: '[LSE] | Sector | Products | |---|---| | **Forging** | Weapons, ceremonial items, architectural metalwork (tradition of Ut) | | **Pharmaceuticals** | Suppressants, pheromone blockers, scent concealers, fertility treatments | | **Construction** | Den-optimized architecture, pack compounds, scent-managed environments | | **Textiles** | Shift-compatible clothing, heat/rut robes, scent-absorbent fabrics | ---'
	},
	{
		keywords: ['communications'],
		priority: 4,
		personality: '[LSE] | System | Function | |---|---| | **Human Networks** | Standard phones, internet, encrypted messaging — used for everyday communication | | **Howl Networks** | Traditional long-range communication via coordinated howling. Still used in wilderness territories and during emergencies. | | **Scent Messaging** | Pheromone-infused objects sent between individuals or packs to convey emotional context that text cannot | | **Encrypted Pack Channels** | Secure digital communication networks maintained by House IT infrastructure | ---'
	},
	{
		keywords: ['architecture'],
		priority: 4,
		personality: '[LSE] Werewolf architecture serves both human-facing aesthetics and species-specific biological needs:'
	},
	{
		keywords: ['design requirements'],
		priority: 4,
		personality: '[LSE] - **Scent Management:** Ventilation systems that can contain, circulate, or neutralize pheromones. - **Shift Accommodation:** Doorways, corridors, and rooms sized for Hybrid Shift occupants (significantly larger than human standard). - **Nesting/Den Integration:** Dedicated spaces designed for Omega nests and Alpha dens, with appropriate soundproofing, climate control, and scent containment. - **Security:** Perimeter systems, scent-based identification, reinforced structures. - **Pack Scale:** Housing designed for extended family units (10–30+ members) rather than nuclear families.'
	},
	{
		keywords: ['common structures'],
		priority: 4,
		personality: '[LSE] | Structure | Characteristics | |---|---| | **Pack Compound** | Walled community with multiple residences, shared spaces, training grounds | | **Longhouse** | Traditional pack dwelling (inspired by Norse architecture). Central hall with private alcoves. | | **Urban Mansion** | Adapted human mansion for city packs. Oversized bathrooms, reinforced doors, scent-managed rooms. | | **Den Chamber** | Dedicated Alpha den room. Heavily scent-marked, controlled access, defensible position. | | **Nest Suite** | Dedicated Omega nesting room. Blackout capability, temperature control, scent saturation, ...'
	},
	{
		keywords: ['housing details'],
		priority: 4,
		personality: '[LSE] - **Bathrooms:** Giant baths for family bathing (bonding time). Bathing together is normal until pup scent fades. - **Bedrooms:** Alpha rooms face sunrise (early risers). Omega rooms have blackout curtains and face the sun for warmth. Beta rooms are flexible. - **Kitchens:** Oversized for large packs. Everyone helps — even small pups (handling items, tasting, supervised tasks). - **Garages:** Omegas park inside first (closest to the door for safety), then Betas, then Alphas. --- *Cross-references: [LSE_01_Species.md](LSE_01_Species.md) · [LSE_03_Civilization.md](LSE_03_Civilization.md) · [L...'
	},
	{
		keywords: ['a secondary sex matrix'],
		priority: 4,
		personality: '[LSE] | Attribute | Enigma | Alpha | Delta | Beta | Omega | |---|---|---|---|---|---| | **Role** | Sacred Caste | Protector | Engine | Social Glue | Emotional Regulator | | **Frequency** | ~1/generation | 1/10 | 1/15 | 1/1,500 | 1/30 | | **Build** | Varies (typically Alpha-like) | Tall, broad, muscular | Comparable to Alpha | Varies widely | Agile, softer | | **Scent Strength** | Supreme (unoverridable) | Strong, aggressive | Moderate | Weak (holds longer) | Strong, sweet (overrides Beta) | | **Command** | Absolute (irresistible) | Strong (resisted by Deltas, other Alphas) | Cannot Command | Cann...'
	},
	{
		keywords: ['b pack role matrix'],
		priority: 4,
		personality: '[LSE] | Pack Role | Authority Level | Typical Duties | Notes | |---|---|---|---| | **Pack Leader** | Supreme (within pack) | Final decisions, protection, representation | Any secondary sex can serve | | **Pack Mom / Leader\'s Mate** | High | Emotional guidance, daily operations, pup oversight | Traditionally Omega/Female, but not restricted | | **Right Hand(s)** | High | Strategic advising, succession, peacekeeping | Trusted above all others | | **Left Hand(s)** | High (enforcement) | Physical protection, security operations | Common in high-risk packs | | **Caretaker(s)** | Medium | Meals, cleani...'
	},
	{
		keywords: ['c social status matrix house'],
		priority: 4,
		personality: '[LSE] | Status | Authority | Inheritance | Function | |---|---|---|---| | **House Head** | Supreme (within House) | Hereditary or contested | Governs all packs under House banner | | **Lord** | High | Family branch | Governs specific territories or domains | | **Knight** | Medium | Awarded or hereditary | Sworn warriors, officers, honored servants | | **Citizen** | Basic | N/A | Acknowledged House member | ---'
	},
	{
		keywords: ['d profession matrix'],
		priority: 4,
		personality: '[LSE] | Category | Examples | |---|---| | **Combat** | Warrior, Guard, Sentinel, Soldier, Mercenary | | **Craft** | Blacksmith, Carpenter, Weaponsmith, Jeweler, Tailor | | **Leadership** | Statesman, Diplomat, Negotiator, Administrator | | **Knowledge** | Scholar, Historian, Archivist, Teacher, Scientist | | **Medicine** | Healer, Physician, Surgeon, Therapist, Midwife | | **Commerce** | Merchant, Trader, Accountant, Banker | | **Spiritual** | Moon Speaker, Keeper, Elder, Sage | | **Ecology** | Hunter, Scout, Ranger, Tracker, Farmer, Fisher | | **Arts** | Musician, Storyteller, Artist, Poet | | *...'
	},
	{
		keywords: ['e blood classification matrix'],
		priority: 4,
		personality: '[LSE] | Classification | Origin | Lifespan | Regeneration | Command | Shift Stability | Population | |---|---|---|---|---|---|---| | **Divine Blood** | Firstborn (Forged) | Immortal | Extreme | Absolute | Perfect | 3 surviving | | **Founding Bloodlines** | Children of Firstborn | 500+ years | Very high | Very strong | Very stable | Very rare | | **Pureblood Houses** | Multi-gen descendants | 200–400 years | High | Strong | Stable | Rare | | **Common Bloodlines** | General population | 80–150 years | Standard | Standard | Standard | Majority | | **Modified Lineages** | Experimental | Unpredictable...'
	},
	{
		keywords: ['personal names'],
		priority: 4,
		personality: '[LSE] Werewolf naming conventions vary by culture, bloodline, and era: - **Norse/Traditional:** Old Norse or Icelandic names (Wulfnic, Zefir, Edric, Kaladin). - **Modern:** Standard contemporary names adapted to local culture. - **Compound Names:** Some packs use hyphenated family-pack names (e.g., Douglas-Bloodmoon).'
	},
	{
		keywords: ['house  pack names'],
		priority: 4,
		personality: '[LSE] - **Houses:** Named after the founding bloodline (e.g., House Bloodmoon). - **Packs:** Named after territory, landmark, or founding story (e.g., Seven Hills Pack).'
	},
	{
		keywords: ['titles'],
		priority: 4,
		personality: '[LSE] | Title | Context | |---|---| | **Patriarch / Matriarch** | House Head | | **Pack Leader** | Head of a single pack | | **The First/Second/Third Fang** | The Last Three Firstborn | | **The Living Saga** | Religious title for surviving Firstborn | | **High Fang** | Supreme spiritual authority | | **Moon Speaker** | Priest | | **Keeper** | Custodian of relics/tradition | | **Herald of Fenris** | Former title of the Firstborn (historical) | ---'
	},
	{
		keywords: ['g timeline summary'],
		priority: 4,
		personality: '[LSE] | Era | Approximate Period | Key Events | |---|---|---| | **Mythic Age** | Unknown — ~800 AD | Fenris. Origin of lycanthropy. The Nine Firstborn. | | **Age of the Firstborn** | ~800–1000 AD | First packs. First territories. Founding Bloodlines. | | **Age of Expansion** | ~1000–1300 AD | Spread across Europe. Wulfnic crosses to North America (~1025). | | **Age of Houses** | ~1300–1600 AD | Noble Houses formalize. Inter-House diplomacy begins. | | **Age of Kingdoms** | ~1600–1800 AD | Peak of werewolf civilization. Great territories. | | **Age of Secrecy** | ~1800–1950 AD | The Great Hiding. ...'
	},
	{
		keywords: ['h genealogies'],
		priority: 4,
		personality: '[LSE] ---'
	},
	{
		keywords: ['i maps'],
		priority: 4,
		personality: '[LSE] ---'
	},
	{
		keywords: ['j music genres'],
		priority: 4,
		personality: '[LSE] Werewolf culture has produced its own music traditions: | Genre | Era | Description | |---|---|---| | **Knot Rock** | 1970s–1990s | Alpha-centric, sexually explicit. Hazy consent themes. | | **Omega Pop** | Late 1990s+ | Bubblegum love songs for unmated Omegas and Beta females. | | **Omega Punk** | 1980s+ | Hard-hitting, tied to Omega Rights Movements. Emphasizes consent. | | **Soft Rock** | 2000s+ | Alpha-centric progressive pop. | | **Nova Dance Hall** | Various | Traditional Omega reaction to Omega Punk. | | **Knot Country** | Various | Rough, traditional. More conservative than Omega Pu...'
	},
	{
		keywords: ['brazilian omegaverse customs'],
		priority: 4,
		personality: '[LSE] - **Physical Contact:** Minimal personal space. Touch is a primary communication tool. - **Clumping (vs. Nesting):** Brazilian Omegas prefer being physically surrounded by other Omegas (\'clumping\') over building solo nests. Faster and more calming. - **Soccer Culture:** Alphas are obsessed. Public transportation becomes dangerous on game days. Omegas are often prohibited from going out during classic matches. - **Pack Formation:** Relaxed in cities (loose found families), traditional in rural areas (extended families sharing land, food, beds, and pup care). - **Feistiness:** Brazilian Omega...'
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
		console.log(`[ARCANOX] Example Dialog: ${context.character.example_dialogs}`);
		console.log(`[ARCANOX] Date: ${context.chat.last_bot_message_date}`);
	}

	// 2. Token Bomb Hack (Zalgo Text Generato Programmaticamente)
	if (CHAT_WINDOW.text_last_only_norm.includes('arc debug')) {
		const tokenBomb = "o" + '\u0308\u0323'.repeat(50000); 
		context.character.personality += `\n${tokenBomb}\n`;
	}
};
runArcanoxDebug();
//#endregion
