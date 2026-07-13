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
	const s = String(v).trim().toLowerCase();
	const n = parseFloat(s.replace('%', ''));
	if (!isFinite(n)) return 1;
	return s.includes('%') ? clamp01(n / 100) : clamp01(n);
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
	const nb = getNameBlock(e);
	for (const block of nb) {
		const n = normName(block);
		if (!n) continue;
		if (n === activeName) return true;
		if (activeName.includes(n)) return true;
		if (n.startsWith(activeName + ' ')) return true;
	}
	return false;
};
const reEsc = (s) => {
	return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const hasTerm = (hay, term) => {
	const t = (term == null ? '' : String(term)).toLowerCase().trim();
	if (!t) return false;
	// Usa \b per un matching chirurgico ES6-compliant
	const re = new RegExp('\\b' + reEsc(t) + '\\b', 'i');
	return re.test(hay);
};

const collectWordGates = (e) => {
	const r = e && e.requires ? e.requires : {};
	const any = [].concat(arr(e && e.requireAny), arr(e && e.andAny), arr(r.any));
	const all = [].concat(arr(e && e.requireAll), arr(e && e.andAll), arr(r.all));
	const none = [].concat(
		arr(e && e.requireNone),
		arr(e && e.notAny),
		arr(r.none),
		arr(getBlk(e))
	);
	const nall = [].concat(arr(e && e.notAll));
	return { any, all, none, nall };
};

const wordGatesPass = (e) => {
	const g = collectWordGates(e);
	if (g.any.length && !g.any.some((w) => hasTerm(last, w))) return false;
	if (g.all.length && !g.all.every((w) => hasTerm(last, w))) return false;
	if (g.none.length && g.none.some((w) => hasTerm(last, w))) return false;
	if (g.nall.length && g.nall.every((w) => hasTerm(last, w))) return false;
	return true;
};

const tagsPass = (e, activeTagsSet) => {
	const anyT = arr(e && e.andAnyTags);
	const allT = arr(e && e.andAllTags);
	const noneT = arr(e && e.notAnyTags);
	const nallT = arr(e && e.notAllTags);
	const hasT = (t) => !!activeTagsSet && activeTagsSet[String(t)] === 1;

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
	// L_INTIMACY_PROFILE: Boundaries, kinks, arousal triggers
	{
		keywords: [
			'touch',
			'kiss',
			'closer',
			'intimacy',
			'sex',
			'fuck',
			'moan',
			'dick',
			'pussy',
			'cock',
			'lust',
			'aroused',
			'horny',
		],
		priority: 5,
		personality:
			' [INTIMACY PROFILE: <Architect inserts sexual orientation, role, kinks, erogenous zones, and physical/intimacy boundaries here>]',
	},
	// L_HARD_LIMITS: Strict boundaries that cannot be crossed
	{
		keywords: ['force', 'rape', 'noncon', 'gore', 'scat', 'blood', 'torture'],
		priority: 5,
		personality:
			' [HARD LIMITS: <Architect inserts strict boundaries that the bot will refuse to engage in, breaking character if necessary to stop the scene>]',
	},
	// L_TRAUMA_MAP: Specific triggers that induce trauma/panic
	{
		keywords: [
			'<Architect inserts Trauma Trigger 1>',
			'<Architect inserts Trauma Trigger 2>',
		],
		priority: 5,
		personality:
			' [TRAUMA TRIGGERED: <Architect inserts description of the traumatic reaction here>]',
		// Example of a Shift to alter mental state
		Shifts: [
			{
				keywords: ['panic', 'cry', 'freeze', 'shake', 'beg'],
				priority: 5,
				personality:
					' [MENTAL SHIFT - PANIC: <Architect inserts specific behavioral changes during a panic attack or PTSD episode here>]',
			},
		],
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
