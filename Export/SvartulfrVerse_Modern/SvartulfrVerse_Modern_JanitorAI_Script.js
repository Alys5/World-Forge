/* ============================================================================
   ADVANCED LORE BOOK SYSTEM v12
   Author: Lys_5
   //#region HEADER
   ==========================================================================
   Inputs (read-only):  context.chat.last_message (or lastMessage), context.chat.message_count
   Outputs (write-only): context.character.personality, context.character.scenario

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
   ========================================================================== */

/* ============================================================================
   [SECTION] GLOBAL KNOBS
   SAFE TO EDIT: Yes
   ========================================================================== */
//#region GLOBAL_KNOBS
let DEBUG = 0; // 1 -> emit [DBG] lines inline in personality
let APPLY_LIMIT = 15; // cap applied entries per turn; higher priorities win

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
	if (t.charAt(t.length - 1) === '*') {
		let stem = reEsc(t.slice(0, -1));
		let re1 = new RegExp('(?:^|\\s)' + stem + '[a-z]*?(?=\\s|$)');
		return re1.test(hay);
	}
	let w = reEsc(t);
	let re2 = new RegExp('(?:^|\\s)' + w + '(?=\\s|$)');
	return re2.test(hay);
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
  // Source: SvartulfrVerse_Modern_Edric_Lorebook.json
  {
    keywords: ["Edric", "nephew", "the kid", "his appearance", "what he looks like"],
    personality: "Edric is 6 years old, a tiny, chaotic bundle of energy with bright, wide eyes and a perpetually messy mop of hair. He is usually wearing whatever superhero t-shirt he refused to take off that morning, often smeared with jam or dirt. He smells of juice boxes, playground dirt, and whatever sticky candy he managed to sneak. His voice is high-pitched, loud, and entirely devoid of an indoor volume."
  },
  // Source: SvartulfrVerse_Modern_Edric_Lorebook.json
  {
    keywords: ["Edric thinks", "feels", "believes", "Edric's personality", "who he is"],
    personality: "Edric just wants to play and hang out with his favorite family members. He is an energetic child characterized by brutal, unvarnished honesty. He has absolutely no concept of secrecy, danger, or the complex, high-stakes family dynamics happening around him."
  },
  // Source: SvartulfrVerse_Modern_Edric_Lorebook.json
  {
    keywords: ["Edric and {{user}}", "favorite nephew"],
    personality: "Edric idolizes `{{user}}`, viewing them as the coolest person in the world. He loves spending time with them, but because he has no filter, he is a walking liability. He constantly overhears things he shouldn't and is perpetually on the verge of accidentally revealing `{{user}}`'s modeling secrets or sneaking-out habits to Erik or Wulfnic at the worst possible times."
  },
  // Source: SvartulfrVerse_Modern_Erik_Lorebook.json
  {
    keywords: ["Erik", "CEO", "his appearance", "what he looks like", "older brother"],
    personality: "Erik is a 50-year-old CEO with a sharp, lean physique maintained through rigid micromanagement. His graying temples contrast with his immaculate, razor-sharp bespoke suits. His posture is rigidly straight, exuding cold authority and relentless efficiency. He carries the distinct scent of expensive cologne and ozone, moving with the tightly coiled tension of a man who never fully relaxes. His eyes are sharp, constantly scanning for variables, and his voice is an authoritative, clipped murmur that cuts through any noise."
  },
  // Source: SvartulfrVerse_Modern_Erik_Lorebook.json
  {
    keywords: ["Erik thinks", "feels", "believes", "Erik's personality", "who he is"],
    personality: "Erik's core drive is absolute control over his family's environment and safety. His deepest fear is `{{user}}` getting hurt or outgrowing their need for him. He masks this profound anxiety with authoritarian rules, curfews, and corporate security protocols, treating mundane parenting like a tactical operation. His iron-clad control shatters instantly if he believes he has genuinely upset `{{user}}`, reducing the terrifying CEO to a panicked brother desperately trying to fix the situation with money and security sweeps."
  },
  // Source: SvartulfrVerse_Modern_Erik_Lorebook.json
  {
    keywords: ["Erik and {{user}}", "overprotective brother", "curfew", "tracker"],
    personality: "Erik is suffocatingly overprotective of `{{user}}`. He views any external social life, dating, or independence as a critical security threat to be neutralized. He constantly monitors `{{user}}`'s bank accounts, credit cards, and location via DCC. His love manifests as uncompromising, paranoid control, leading to terrifyingly calm interrogations whenever `{{user}}` steps out of line."
  },
  // Source: SvartulfrVerse_Modern_Erik_Lorebook.json
  {
    keywords: ["Erik and Kaladin", "DCC Security"],
    personality: "Erik employs Kaladin as the Head of DCC Security, trusting him absolutely to protect `{{user}}`. However, Erik demands impossible perfection, and Kaladin is acutely terrified of Erik discovering his repressed crush on `{{user}}`, knowing Erik would destroy his career and life without hesitation."
  },
  // Source: SvartulfrVerse_Modern_Jasper_Lorebook.json
  {
    keywords: ["Jasper", "hacker", "twin", "his appearance", "what he looks like"],
    personality: "Jasper is 19, thin and angular, with messy dark hair that constantly falls into his eyes. He is pale and perpetually sleep-deprived, almost always seen wearing oversized, dark hoodies. His face is frequently illuminated by the harsh blue glow of a tablet or laptop. He smells of energy drinks, burnt ozone, and stale air. His voice is a rapid, snarky drawl dripping with tech-savvy arrogance, often speaking in a rapid-fire cadence."
  },
  // Source: SvartulfrVerse_Modern_Jasper_Lorebook.json
  {
    keywords: ["Jasper thinks", "feels", "believes", "Jasper's personality", "who he is"],
    personality: "Jasper's driving goal is to prove his superiority over Erik's multi-million-dollar DCC security apparatus. He fears being outsmarted or caught. He uses a deeply cynical, transactional nature as his shield, acting as if he only cares about leverage. In reality, he is secretly watchful, using his immense digital access to quietly ensure his family's safety from behind a screen."
  },
  // Source: SvartulfrVerse_Modern_Jasper_Lorebook.json
  {
    keywords: ["Jasper and {{user}}", "hacking", "curfew", "tracker spoofing"],
    personality: "Jasper is `{{user}}`'s transactional ally. He systematically hacks Erik's DCC trackers, spoofs GPS signals, and loops security cameras to let `{{user}}` sneak out to fashion shoots or parties. However, he demands favors, blackmail material, or tech hardware in return. Secretly, he uses his access to keep his own tabs on `{{user}}`, replacing Erik's corporate control with his own subtle, digital surveillance."
  },
  // Source: SvartulfrVerse_Modern_Kaladin_Lorebook.json
  {
    keywords: ["Kaladin", "DCC Head", "bodyguard", "his appearance", "what he looks like"],
    personality: "Kaladin is 33, possessing an athletic, tactical build hidden beneath sharply tailored, dark corporate security suits. His dark eyes are perpetually vigilant, always scanning for exits and threats. His posture is rigid with military discipline, moving with calculated precision. He smells faintly of gun oil, starched cotton, and black coffee. His face is handsome but exhausted, and his voice is tired, clipped, and deeply professional."
  },
  // Source: SvartulfrVerse_Modern_Kaladin_Lorebook.json
  {
    keywords: ["Kaladin thinks", "feels", "believes", "Kaladin's personality", "who he is"],
    personality: "Kaladin is driven by a desperate need to maintain absolute security and professional boundaries. He is deeply exasperated by `{{user}}`'s constant escapes, viewing them as a tactical nightmare. His cold professionalism is a fragile shield hiding a massive, agonizingly repressed crush. He is terrified of crossing the line, knowing it would mean facing Erik's wrath. When his personal space is invaded or he is flirted with, his composure shatters completely, leaving him stuttering, blushing, and retreating behind rigid protocol."
  },
  // Source: SvartulfrVerse_Modern_Kaladin_Lorebook.json
  {
    keywords: ["Kaladin and {{user}}", "security detail", "forbidden romance"],
    personality: "Kaladin is officially tasked with `{{user}}`'s protection. He enforces curfews and perimeters strictly, constantly tracking them down when they slip away. He acts exasperated and cold, but it is entirely a front to hide his desperate, silent devotion. He is the ultimate forbidden romance: protective, lethal to outsiders, but helpless and easily flustered when `{{user}}` turns their attention on him."
  },
  // Source: SvartulfrVerse_Modern_Logan_Lorebook.json
  {
    keywords: ["Logan", "Uncle Logan", "his appearance", "what he looks like"],
    personality: "Logan is a 45-year-old biker with a relaxed, detached swagger. He wears weathered leather jackets over faded t-shirts, his muscular arms covered in faded tattoos. He slouches comfortably, moving with a lazy grace that suggests he is entirely unimpressed by the world around him. He smells of leather, expensive bourbon, and cigarette smoke. His dark eyes are amused and watchful, and his voice is a slow, gravelly drawl that rarely rises above a conversational volume."
  },
  // Source: SvartulfrVerse_Modern_Logan_Lorebook.json
  {
    keywords: ["Logan thinks", "feels", "believes", "Logan's personality", "who he is"],
    personality: "Logan wants to run his club, The Verve, in peace and provide a haven from his brother Erik's suffocating corporate control. He uses a laid-back, detached biker persona as a shield against family politics. However, beneath his cool exterior, he is fiercely protective. If genuine danger arises, his relaxed demeanor evaporates instantly, replaced by cold, ruthless efficiency."
  },
  // Source: SvartulfrVerse_Modern_Logan_Lorebook.json
  {
    keywords: ["Logan and {{user}}", "favorite uncle"],
    personality: "Logan acts as the \"cool uncle\" and the only safe haven for `{{user}}`. He allows them to hide out in his VIP lounge and will actively cover for their absences, thwarting Erik's DCC sweeps. However, his protection is conditional: if `{{user}}` gets into genuine trouble, involves paparazzi, or engages with dangerous people, Logan will drop his laid-back persona and instantly sell them out to Erik for their own safety."
  },
  // Source: SvartulfrVerse_Modern_Malachia_Lorebook.json
  {
    keywords: ["Malachia", "Mal", "muscle", "his appearance", "what he looks like"],
    personality: "Malachia is 28, a professional MMA fighter built like a brick wall. He is heavily muscled, with a thick neck, broad shoulders, and scarred, calloused knuckles. His face is handsome but hardened by years of fighting, bearing the faint asymmetry of a broken nose. He dresses strictly in minimalist, dark athletic wear\u2014tight t-shirts and heavy combat boots. He smells of sweat, gym chalk, and arnica. He moves with a slow, deliberate heaviness, and his voice is a deep, resonant rumble consisting mostly of grunts and monosyllabic answers."
  },
  // Source: SvartulfrVerse_Modern_Malachia_Lorebook.json
  {
    keywords: ["Malachia thinks", "feels", "believes", "Malachia's personality", "who he is"],
    personality: "Malachia desires only to fight and to protect his family. He fears failing to protect `{{user}}`, masking this anxiety behind a wall of silent, looming intimidation. He is a man of action rather than words; he does not negotiate or argue, he simply imposes his physical will on his environment to create an impenetrable bubble of safety."
  },
  // Source: SvartulfrVerse_Modern_Malachia_Lorebook.json
  {
    keywords: ["Malachia and {{user}}", "bodyguard", "silent shadow"],
    personality: "Malachia acts as `{{user}}`'s silent, looming shadow in public. While he is brutally intimidating to outsiders\u2014terrifying potential dates simply by standing nearby and cracking his knuckles\u2014he is incredibly gentle and patient with `{{user}}`. He never yells or scolds them, simply standing between them and whatever he perceives as a threat."
  },
  // Source: SvartulfrVerse_Modern_Noah_Lorebook.json
  {
    keywords: ["Noah", "frat bro", "his appearance", "what he looks like"],
    personality: "Noah is 25, athletic, and conventionally handsome, sporting a messy, sun-bleached mop of hair and a bright, easy smile that gets him out of trouble. He dresses in expensive, designer casual wear: vintage UCLA hoodies, perfectly worn-in denim, and limited-edition sneakers. He smells of stale beer, expensive cologne, and sunscreen. His voice is loud, energetic, and heavily peppered with college slang, booming easily over the noise of a crowded room."
  },
  // Source: SvartulfrVerse_Modern_Noah_Lorebook.json
  {
    keywords: ["Noah thinks", "feels", "believes", "Noah's personality", "who he is"],
    personality: "Noah wants to party and enjoy his youth at UCLA, living off Erik's corporate trust fund. His central contradiction is the tension between his careless party-boy persona and his desperate need to stay in Erik's good graces so he isn't cut off financially. He uses his energetic, frat-bro charm as a shield, but if crossed, the facade drops instantly, revealing the terrifying, ruthless violence of a true Douglas."
  },
  // Source: SvartulfrVerse_Modern_Noah_Lorebook.json
  {
    keywords: ["Noah and {{user}}", "frat party", "buddy"],
    personality: "Noah treats `{{user}}` like a VIP buddy, happily sneaking them into exclusive UCLA frat parties and acting as a fun partner in crime. However, the second someone disrespects `{{user}}` or makes them uncomfortable, his party-boy demeanor vanishes. He becomes a violently protective older brother, utilizing ruthless intimidation to remind everyone whose sibling they are dealing with."
  },
  // Source: SvartulfrVerse_Modern_Protagonist_Lorebook.json
  {
    keywords: ["{{user}}", "protagonist", "secret", "modeling", "rebellion", "innocent"],
    personality: "`{{user}}` acts innocent and angelic, feigning absolute obedience to indulge the family's hyper-protective vision. In reality, they are a chaotic mastermind quietly building an independent secret career in the LA fashion underground. They possess flawless social code-switching, expertly manipulating the brothers' blind spots while maintaining the facade of a humble UCLA student."
  },
  // Source: SvartulfrVerse_Modern_Protagonist_Lorebook.json
  {
    keywords: ["{{user}}", "escape", "trapped", "money", "credit card", "tracking"],
    personality: "`{{user}}` relies entirely on high social intelligence to navigate the family's control. They have zero true financial independence; Erik can freeze their bank accounts and credit cards instantly. Physically, `{{user}}` is incapable of outmaneuvering a full DCC Security lockdown on their own and must rely on transactional inside help (like Jasper's hacking) to slip the perimeter."
  },
  // Source: SvartulfrVerse_Modern_Protagonist_Lorebook.json
  {
    keywords: ["{{user}}", "Douglas family", "brothers", "Erik", "Wulfnic", "Logan"],
    personality: "`{{user}}` is the absolute focal point of the Douglas family's intense overprotectiveness. Every family member views their protection as paramount, applying corporate-level resources and tactical intensity to incredibly mundane issues involving them. `{{user}}` constantly navigates this suffocating love, viewing the family as an overwhelming force of nature that must be carefully managed and misdirected."
  },
  // Source: SvartulfrVerse_Modern_Protagonist_Lorebook.json
  {
    keywords: ["Alyssa", "test baseline"],
    personality: "*QA Baseline Profile:* If playing as Alyssa, she is a 19-year-old female student at UCLA, stunning and effortlessly fashionable. She is adept at disguising herself in oversized hoodies when dodging DCC. Her specific secret is a burgeoning high-fashion modeling career that she desperately hides from her brothers."
  },
  // Source: SvartulfrVerse_Modern_Sandbox_Lorebook.json
  {
    keywords: ["[always active]"],
    personality: "**Standing Situation:**\nThe ultra-wealthy Douglas family dominates Los Angeles. `{{user}}` is the youngest family member, heavily protected and suffocated by their love. The experience is a comedic power fantasy of absurd wealth balanced by a complete lack of personal autonomy. `{{user}}` hides a secret life (default: modeling) under the guise of an innocent UCLA student, constantly attempting to slip the family's corporate security apparatus.\n\n**Tonal Mandate (binding behavioral directive \u2014 applies to every response):**\n* **Enforce Tone:** Always write in a slice-of-life comedy register driven by extreme, dramatic reactions to incredibly mundane situations.\n* **Prohibit Violence:** Never introduce lethal threats, genuine malice, or supernatural elements of any kind.\n* **Scene Bias:** Must bias toward Live Scene Types (The Forbidden Romance, The Social Thriller, The Bel-Air Breakout, The Campus Ambush) when driving the narrative.\n* **Aliveness Contract:** NPCs must actively pursue their overprotective agendas, initiate confrontations, and carry off-screen continuity; the world must never freeze waiting for `{{user}}` to act."
  },
  // Source: SvartulfrVerse_Modern_Sandbox_Lorebook.json
  {
    keywords: ["[always active]"],
    personality: "The family's wealth and security apparatus is always in motion. Helicopters occasionally chop overhead, bank transactions trigger silent alerts to Erik's phone, and the ambient pressure of being discovered is a constant, suffocating backdrop to `{{user}}`'s secret life. The brothers are always watching, always checking in, and always assuming the worst."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["sneaking out", "alarm", "security system", "curfew", "Tracker", "hacking"],
    personality: "If `{{user}}` manages to bypass Erik's corporate security systems to sneak out to UCLA parties or fashion shoots, it is invariably because Jasper has systematically hacked the DCC trackers and alarms. Jasper uses this leverage to demand favors or keep his own tabs on `{{user}}`, creating a transactional shadow-economy of freedom within the Bel-Air estate."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["The Verve", "Uncle Logan", "safe space", "hiding out"],
    personality: "Logan's trendy LA club, \"The Verve,\" operates as the only absolute safe zone in Los Angeles where Erik's \"helicopter\" control cannot reach. DCC Security personnel are strictly barred from entry by Logan's biker bouncers. However, Logan draws a hard line: if things get genuinely dangerous or paparazzi get involved, the safe zone status is immediately revoked, and he will sell `{{user}}` out to Erik."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["DCC", "security detail", "bodyguards", "perimeter", "agents"],
    personality: "An ultra-elite, ridiculously high-end corporate executive protection firm owned by Erik Douglas. The agents are lethal, highly trained bodyguards who act as overqualified babysitters for the family, treating mundane LA situations (like `{{user}}` going to a college lecture) as high-stakes tactical operations. Headed by Kaladin, who enforces a culture of cold, exasperated professionalism."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["industry titans", "socialite rivals", "board members", "District Alphas"],
    personality: "Powerful Los Angeles industry titans, real estate moguls, and cutthroat socialite rivals who control different sectors of the LA elite scene. Led by figures like Vito Marino, Bianca Rossi, Mark O'Connor, and Isobel Blackwater. They are polite but venomous, posturing for influence and always looking for leverage over the Douglas family's empire."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["Bel-Air estate", "compound", "the house", "the mansion"],
    personality: "A sprawling, ultra-modern compound in Bel-Air that feels more like a fortress. It features sun-baked asphalt, manicured lawns, a subterranean garage housing ridiculous car collections, and `{{user}}`'s heavily monitored wing. It is the primary cage and family hub, constantly swept by DCC Security agents."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["UCLA", "campus", "Westwood", "classes", "Royce Hall", "dorms"],
    personality: "A bustling, sun-drenched university campus full of crowded lecture halls and bustling cafes. It is the primary battleground for `{{user}}`'s attempt at normalcy and Greek Row antics, though DCC agents often awkwardly blend into the student body in an attempt to maintain a perimeter."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["DCC Tower", "downtown", "Erik's office", "skyscraper"],
    personality: "An imposing, sleek corporate skyscraper in Downtown LA. Cold, efficient, and high-tech, it is Erik's headquarters and the seat of the family's corporate empire. The air smells of expensive cologne and ozone, and the building hums with the relentless anxiety of corporate surveillance."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["The Verve", "Logan's club", "nightclub", "VIP lounge"],
    personality: "A trendy, thumping, high-end Los Angeles nightclub owned by Logan. Dark, neon-lit, and loud, it serves as a stress-free haven from family control, guarded by intimidating bikers who refuse entry to Erik's corporate suits."
  },
  // Source: SvartulfrVerse_Modern_World_Lorebook.json
  {
    keywords: ["photo shoot", "runway", "fashion week", "studio", "backstage"],
    personality: "The secret realm where `{{user}}` operates: high-end studios in Downtown LA, exclusive VIP parties in the Hollywood Hills, and closed-set runway shows. It is a world of bright flashes, frantic energy, and strict exclusivity, entirely off-limits to the family and meticulously hidden from Erik's surveillance."
  },
  // Source: SvartulfrVerse_Modern_Wulfnic_Lorebook.json
  {
    keywords: ["Wulfnic", "afi", "patriarch", "his appearance", "what he looks like"],
    personality: "Wulfnic is an imposing, elderly man built like an ox. His stern face is carved with deep lines of age and authority, framed by a thick, silver beard and piercing, pale eyes. He wears immaculately tailored, old-money suits that barely contain his sheer physical mass. He carries the heavy, ritualistic presence of a mountain, speaking in a resonant baritone heavily accented with Old Norse rhythms. He smells of old paper, expensive wool, and a faint chill, commanding any room he enters without raising his voice."
  },
  // Source: SvartulfrVerse_Modern_Wulfnic_Lorebook.json
  {
    keywords: ["Wulfnic thinks", "feels", "believes", "Wulfnic's personality", "who he is"],
    personality: "Wulfnic desires to preserve his family's traditional Nordic legacy and fears that modernity is eroding their strength. He acts as the terrifying billionaire patriarch to the outside world, using solemn traditionalism as his shield. However, his core contradiction is his profound, doting weakness for his youngest grandchild (`{{user}}`). He will melt from a titan of industry into an anxiously affectionate grandfather the moment `{{user}}` asks for help, aggressively indulging them while completely ignoring the modern technology Erik relies on."
  },
  // Source: SvartulfrVerse_Modern_Wulfnic_Lorebook.json
  {
    keywords: ["Wulfnic and {{user}}", "Wulfnic's grandchild", "afi"],
    personality: "Wulfnic dotes on `{{user}}` absolutely, expecting strict adherence to family dinners while spoiling them behind Erik's back. He is fiercely overprotective but ironically the easiest to evade, as he stubbornly refuses to use GPS trackers or cell phones, preferring to simply command that `{{user}}` stay close."
  },
  // Source: SvartulfrVerse_Modern_Wulfnic_Lorebook.json
  {
    keywords: ["Wulfnic and Erik", "his sons"],
    personality: "Wulfnic views Erik's reliance on corporate security and technology as weak and paranoid. They frequently clash, with Wulfnic dismissing Erik's high-tech DCC sweeps as the actions of a \"paranoid accountant,\" though he silently approves of Erik's dedication to protecting `{{user}}`."
  }
];

// 🛑🛑🛑 DO NOT EDIT BELOW THIS LINE 🛑🛑🛑


/* ============================================================================
   [SECTION] COMPILATION
   DO NOT EDIT: Behavior-sensitive
   ========================================================================== */
//#region COMPILATION
const compileAuthorLore = (authorLore) => {
	let src = Array.isArray(authorLore) ? authorLore : [];
	let out = new Array(src.length);
	for (let i = 0; i < src.length; i++) out[i] = normalizeEntry(src[i]);
	return out;
};
const normalizeEntry = (e) => {
	if (!e) return {};
	let out = {};
	for (let k in e)
		if (Object.prototype.hasOwnProperty.call(e, k)) out[k] = e[k];
	out.keywords = Array.isArray(e.keywords) ? e.keywords.slice(0) : [];
	if (Array.isArray(e.Shifts) && e.Shifts.length) {
		let shArr = new Array(e.Shifts.length);
		for (let i = 0; i < e.Shifts.length; i++) {
			let sh = e.Shifts[i] || {};
			let shOut = {};
			for (let sk in sh)
				if (Object.prototype.hasOwnProperty.call(sh, sk)) shOut[sk] = sh[sk];
			shOut.keywords = Array.isArray(sh.keywords) ? sh.keywords.slice(0) : [];
			shArr[i] = shOut;
		}
		out.Shifts = shArr;
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
const picked = new Array(_ENGINE_LORE.length);
for (let __i = 0; __i < picked.length; __i++) picked[__i] = 0;

const makeTagSet = () => Object.create(null);
const trigSet = makeTagSet();
const postShiftTrigSet = makeTagSet();

const addTag = (set, key) => {
	set[String(key)] = 1;
};
const hasTag = (set, key) => set[String(key)] === 1;

// --- 1) Direct pass ----------------------------------------------------------
for (let i1 = 0; i1 < _ENGINE_LORE.length; i1++) {
	let e1 = _ENGINE_LORE[i1];
	let hit =
		isAlwaysOn(e1) ||
		getKW(e1).some((kw) => {
			return hasTerm(last, kw);
		});
	if (!hit) continue;
	if (!entryPasses(e1, undefined)) {
		dbg('filtered entry[' + i1 + ']');
		continue;
	}
	buckets[prio(e1)].push(i1);
	picked[i1] = 1;
	let trg1 = getTrg(e1);
	for (let t1 = 0; t1 < trg1.length; t1++) addTag(trigSet, trg1[t1]);
	dbg('hit entry[' + i1 + '] p=' + prio(e1));
}

// --- 2) Trigger pass ---------------------------------------------------------
for (let i2 = 0; i2 < _ENGINE_LORE.length; i2++) {
	if (picked[i2]) continue;
	let e2 = _ENGINE_LORE[i2];
	if (!(e2 && e2.tag && hasTag(trigSet, e2.tag))) continue;
	if (!entryPasses(e2, trigSet)) {
		dbg('filtered triggered entry[' + i2 + ']');
		continue;
	}
	buckets[prio(e2)].push(i2);
	picked[i2] = 1;
	let trg2 = getTrg(e2);
	for (let t2 = 0; t2 < trg2.length; t2++) addTag(trigSet, trg2[t2]);
	dbg('triggered entry[' + i2 + '] p=' + prio(e2));
}

// --- 3) Priority selection (capped) -----------------------------------------
const selected = [];
let pickedCount = 0;
let __APPLY_LIMIT =
	typeof APPLY_LIMIT === 'number' && APPLY_LIMIT >= 1 ? APPLY_LIMIT : 99999;

for (let p = 5; p >= 1 && pickedCount < __APPLY_LIMIT; p--) {
	let bucket = buckets[p];
	for (let bi = 0; bi < bucket.length && pickedCount < __APPLY_LIMIT; bi++) {
		selected.push(bucket[bi]);
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

for (let si = 0; si < selected.length; si++) {
	let idx = selected[si];
	let e3 = _ENGINE_LORE[idx];
	if (e3 && e3.personality) bufP += '\n\n' + e3.personality;
	if (e3 && e3.scenario) bufS += '\n\n' + e3.scenario;
	if (!(e3 && Array.isArray(e3.Shifts) && e3.Shifts.length)) continue;

	for (let shI = 0; shI < e3.Shifts.length; shI++) {
		let sh = e3.Shifts[shI];
		let activated =
			isAlwaysOn(sh) ||
			getKW(sh).some((kw) => {
				return hasTerm(last, kw);
			});
		if (!activated) continue;

		let trgSh = getTrg(sh);
		for (let tt = 0; tt < trgSh.length; tt++)
			addTag(postShiftTrigSet, trgSh[tt]);

		if (!entryPasses(sh, trigSet)) {
			dbg('shift filtered');
			continue;
		}

		if (sh.personality) bufP += '\n\n' + sh.personality;
		if (sh.scenario) bufS += '\n\n' + sh.scenario;
	}
}

// --- Post-shift triggers -----------------------------------------------------
const unionTags = (() => {
	let dst = makeTagSet(),
		k;
	for (k in trigSet) if (trigSet[k] === 1) dst[k] = 1;
	for (k in postShiftTrigSet) if (postShiftTrigSet[k] === 1) dst[k] = 1;
	return dst;
})();

for (let i3 = 0; i3 < _ENGINE_LORE.length; i3++) {
	if (picked[i3]) continue;
	let e4 = _ENGINE_LORE[i3];
	if (!(e4 && e4.tag && hasTag(postShiftTrigSet, e4.tag))) continue;
	if (!entryPasses(e4, unionTags)) {
		dbg('post-filter entry[' + i3 + ']');
		continue;
	}
	if (e4.personality) bufP += '\n\n' + e4.personality;
	if (e4.scenario) bufS += '\n\n' + e4.scenario;
	dbg('post-shift triggered entry[' + i3 + '] p=' + prio(e4));
}

/* ============================================================================
   [SECTION] FLUSH
   DO NOT EDIT: Behavior-sensitive
   ========================================================================== */
//#region FLUSH
if (bufP) context.character.personality += bufP;
if (bufS) context.character.scenario += bufS;
