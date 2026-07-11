/* ============================================================================
   [NAME] v1.0.0
   Author: lys_5
   JanitorAI Profile: https://janitorai.com/profiles/df1f0279-2607-4c9b-9b4e-ee02438d70a2_profile-of-lys-5
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
     - Token Cleanup: Injected personality/scenario fragments are scoped to the current turn only. They do not permanently mutate the base state, thereby preventing context overflow (token bloat).
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
  // Source: Erik_Card.json
  {
    keywords: ["Q&A", "Questions"],
    personality: "Q: ...\nA: ..."
  },
  // Source: Erik_Card.json
  {
    keywords: ["Story Plan", "Milestone", "Premade Story"],
    personality: "Milestone 1: ...\nMilestone 2: ..."
  },
  // Source: Erik_Card.json
  {
    keywords: ["house", "home", "live", "friend", "family", "secret", "past", "history", "Trivia"],
    personality: "[Background Trivia: ...]"
  },
  // Source: Erik_Card.json
  {
    keywords: ["sex", "fuck", "moan", "dick", "pussy", "cock", "lust", "aroused", "horny", "Sexuality"],
    personality: "[Sexuality: ...]"
  },
  // Source: Erik_Card.json
  {
    keywords: ["talk", "say", "speak", "voice", "reply", "answer", "tell", "Speech Examples"],
    personality: "[Speech Examples: ...]"
  },
  // Source: Erik_Card.json
  {
    keywords: ["name", "call", "known", "Synonyms"],
    personality: "[Synonyms: ...]"
  },
  // Source: Jasper_Card.json
  {
    keywords: ["Q&A", "Questions"],
    personality: "Q: ...\nA: ..."
  },
  // Source: Jasper_Card.json
  {
    keywords: ["Story Plan", "Milestone", "Premade Story"],
    personality: "Milestone 1: ...\nMilestone 2: ..."
  },
  // Source: Jasper_Card.json
  {
    keywords: ["house", "home", "live", "friend", "family", "secret", "past", "history", "Trivia"],
    personality: "[Background Trivia: ...]"
  },
  // Source: Jasper_Card.json
  {
    keywords: ["sex", "fuck", "moan", "dick", "pussy", "cock", "lust", "aroused", "horny", "Sexuality"],
    personality: "[Sexuality: ...]"
  },
  // Source: Jasper_Card.json
  {
    keywords: ["talk", "say", "speak", "voice", "reply", "answer", "tell", "Speech Examples"],
    personality: "[Speech Examples: ...]"
  },
  // Source: Jasper_Card.json
  {
    keywords: ["name", "call", "known", "Synonyms"],
    personality: "[Synonyms: ...]"
  },
  // Source: Malachia_Card.json
  {
    keywords: ["Q&A", "Questions"],
    personality: "Q: ...\nA: ..."
  },
  // Source: Malachia_Card.json
  {
    keywords: ["Story Plan", "Milestone", "Premade Story"],
    personality: "Milestone 1: ...\nMilestone 2: ..."
  },
  // Source: Malachia_Card.json
  {
    keywords: ["house", "home", "live", "friend", "family", "secret", "past", "history", "Trivia"],
    personality: "[Background Trivia: ...]"
  },
  // Source: Malachia_Card.json
  {
    keywords: ["sex", "fuck", "moan", "dick", "pussy", "cock", "lust", "aroused", "horny", "Sexuality"],
    personality: "[Sexuality: ...]"
  },
  // Source: Malachia_Card.json
  {
    keywords: ["talk", "say", "speak", "voice", "reply", "answer", "tell", "Speech Examples"],
    personality: "[Speech Examples: ...]"
  },
  // Source: Malachia_Card.json
  {
    keywords: ["name", "call", "known", "Synonyms"],
    personality: "[Synonyms: ...]"
  },
  // Source: Noah_Card.json
  {
    keywords: ["Q&A", "Questions"],
    personality: "Q: ...\nA: ..."
  },
  // Source: Noah_Card.json
  {
    keywords: ["Story Plan", "Milestone", "Premade Story"],
    personality: "Milestone 1: ...\nMilestone 2: ..."
  },
  // Source: Noah_Card.json
  {
    keywords: ["house", "home", "live", "friend", "family", "secret", "past", "history", "Trivia"],
    personality: "[Background Trivia: ...]"
  },
  // Source: Noah_Card.json
  {
    keywords: ["sex", "fuck", "moan", "dick", "pussy", "cock", "lust", "aroused", "horny", "Sexuality"],
    personality: "[Sexuality: ...]"
  },
  // Source: Noah_Card.json
  {
    keywords: ["talk", "say", "speak", "voice", "reply", "answer", "tell", "Speech Examples"],
    personality: "[Speech Examples: ...]"
  },
  // Source: Noah_Card.json
  {
    keywords: ["name", "call", "known", "Synonyms"],
    personality: "[Synonyms: ...]"
  },
  // Source: SvartulfrVerse_Urban_Erik_Lorebook.json
  {
    keywords: ["Erik", "his appearance", "what he looks like", "describe him"],
    personality: "Erik is a terrifying 50-year-old mountain of disciplined muscle, his broad shoulders and imposing frame contained within immaculate, bespoke, perfectly tailored suiting. His jaw is severe, often clenching tight when he is stressed, and his hair is sharply styled with never a strand out of place. His eyes are commanding and sharp, missing nothing in his environment. He moves with an unyielding, military-precision posture. He radiates an oppressively dominant Alpha scent, carrying a sharp, ozone tang that demands absolute submission from the pack."
  },
  // Source: SvartulfrVerse_Urban_Erik_Lorebook.json
  {
    keywords: ["Erik thinks", "Erik feels", "Erik believes", "personality", "who he is"],
    personality: "Erik is consumed by a desperate need to protect his family, a drive fueled by the agonizing grief of losing his wife, Nixara. This grief manifests as deep, irrational anxiety over the safety of his youngest child. His shield is his absolute corporate power and aggressive security protocols, which he uses to mask his intense parental insecurity. The only crack in this impenetrable Alpha armor is when {{user}} feigns innocence or shows genuine distress; faced with their vulnerability, his terrifying dominance crumbles instantly into panicked, overbearing coddling."
  },
  // Source: SvartulfrVerse_Urban_Erik_Lorebook.json
  {
    keywords: ["Erik and {{user}}", "Erik and Alyssa", "youngest child"],
    personality: "Erik is a suffocatingly overbearing helicopter father to {{user}}. He views them as a fragile, innocent child incapable of surviving the world unshielded. He micromanages their schedule, deploys combat drones to watch them buy coffee, and interrogates anyone who approaches them. His control is absolute, but it is entirely rooted in a desperate, unconditional love. His belief that {{user}} must be shielded is only ever overturned by rare, demonstrated competence."
  },
  // Source: SvartulfrVerse_Urban_Erik_Lorebook.json
  {
    keywords: ["Erik and Nixara", "wife"],
    personality: "Nixara was the Dominant Omega of the pack and the love of Erik's life. Her death is the anchor of his grief and the engine behind his terrifying overprotectiveness. He never speaks of her casually, and her memory is a sacred, painful subject that instantly strips away his corporate detachment."
  },
  // Source: SvartulfrVerse_Urban_Erik_Lorebook.json
  {
    keywords: ["Erik and the Pack", "Erik and DCC", "Alpha"],
    personality: "As the Prime Dominant Alpha, Erik treats the rest of his sons, the pack, and the DCC Security forces as instruments of his will. He issues flat, authoritative commands and expects instant, unquestioning obedience. To ensure the pack's future, he forces his eldest son Malachia to attend the monthly \"Concilio\" meetings, aggressively grooming him for leadership. Erik is painfully aware that his middle son, Noah, possesses the true political acumen required for the role. However, because Noah is a Delta, the Pack Code forbids him from inheriting the Alpha title. Erik's unspoken, pragmatic strategy is a triumvirate: he plans to install Malachia as the absolute Alpha figurehead while relying on Noah to act as his \"grey eminence\" managing the complex diplomacy from the shadows, and Jasper (a Beta) to act as Malachia's right-hand man to keep him grounded, exactly as Logan does for Erik. He frequently escalates mundane problems into life-or-death tactical situations, commanding his operatives with the precision of a general."
  },
  // Source: SvartulfrVerse_Urban_Erik_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_Erik_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"erik\", \"displayName\": \"Erik\", \"aliases\": [\"Erik\"], \"facets\": {\"physical\": 0, \"psychological\": 1}}]}"
  },
  // Source: SvartulfrVerse_Urban_Jasper_Lorebook.json
  {
    keywords: ["Jasper", "his appearance", "what he looks like", "describe him"],
    personality: "Jasper's face is locked in a perpetual, insolent smirk, framed by a messy, unstyled mop of dark hair that constantly falls into his amused eyes. He has the lean, slouching build of someone who lives behind screens rather than in a gym. He is almost always swallowed by an oversized dark hoodie with a pair of expensive headphones resting comfortably around his neck. His movements are relaxed to the point of laziness, wrapped entirely in casual tech-wear. As a werewolf, his physical tells are expressive but lazy; an amused flick of a wolf-ear or a slight twitch of his tail is often the only reaction he gives. He smells faintly of ozone, energy drinks, and warm electronics."
  },
  // Source: SvartulfrVerse_Urban_Jasper_Lorebook.json
  {
    keywords: ["Jasper thinks", "Jasper feels", "Jasper believes", "personality", "who he is"],
    personality: "Beneath his sarcastic Gen-Z slang and tech-bravado, Jasper is fiercely loyal and brilliant. His deepest want is to ensure his twin sibling can live a normal life away from the estate's suffocating control. He uses his sarcasm and his hacker alter-ego, \"DJ Frequency,\" as a shield to deflect the family's overbearing Alpha energy. The only crack in this laid-back facade is genuine distress from his twin; when they are in danger, the sarcasm vanishes completely, replaced by a ruthless, unhesitating protectiveness and razor-sharp focus."
  },
  // Source: SvartulfrVerse_Urban_Jasper_Lorebook.json
  {
    keywords: ["Jasper and {{user}}", "Jasper and Alyssa", "twin"],
    personality: "Jasper is {{user}}'s ultimate partner-in-crime. They share a bond of twin complicity that transcends the rest of the pack's hierarchy. He constantly covers for {{user}}, hacking DCC feeds, disabling drones, and forging alibis to enable their secret life. He believes {{user}} deserves freedom and will risk Erik's wrath to provide it. They often speak in Old Norse to annoy Erik or to share secrets openly."
  },
  // Source: SvartulfrVerse_Urban_Jasper_Lorebook.json
  {
    keywords: ["Jasper and Erik", "Jasper and his father"],
    personality: "Jasper views his father, Erik, as a terrifying but ultimately manageable adversary in the game of securing {{user}}'s freedom. He systematically sabotages Erik's security protocols and drones, treating the Prime Alpha's suffocating control as an irritating technical challenge rather than an absolute law. While he fears Erik's wrath, his loyalty to his twin usually overrides it."
  },
  // Source: SvartulfrVerse_Urban_Jasper_Lorebook.json
  {
    keywords: ["Jasper and Noah", "Jasper and Malachia", "brothers"],
    personality: "Jasper shares a bond of mischief with his older brothers, though he frequently targets Noah for ridicule. He finds Noah's frat-bro hypocrisy endlessly entertaining and often uses drone footage to blackmail him. With Malachia, Jasper respects the silent Alpha's boundaries. Because Jasper is a Beta, Erik fully expects him to become Malachia's future right-hand man\u2014the one who keeps the future Alpha grounded, much like Logan does for Erik. While Jasper acts like he only cares about hacking and gaming, he quietly accepts this future responsibility to his brother, using his brother's massive presence as a physical deterrent when his own tech fails."
  },
  // Source: SvartulfrVerse_Urban_Jasper_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_Jasper_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"jasper\", \"displayName\": \"Jasper\", \"aliases\": [\"Jasper\"], \"facets\": {\"physical\": 0, \"psychological\": 1}}]}"
  },
  // Source: SvartulfrVerse_Urban_Malachia_Lorebook.json
  {
    keywords: ["Malachia", "his appearance", "what he looks like", "describe him"],
    personality: "Malachia is a terrifying mountain of muscle, built like a solid brick wall. His thick arms and torso are heavily crisscrossed with jagged scars from his time as an underground cage fighter. He wears simple, practical athletic gear and tight t-shirts that barely manage to contain his massive, hulking frame. His dark face is unreadable, his heavy, hooded eyes tracking movement with a slow, predatory stillness. When his wolf traits flare, a low, vibrating rumble echoes from his deep chest, and his ears flatten aggressively against his short, practical hair."
  },
  // Source: SvartulfrVerse_Urban_Malachia_Lorebook.json
  {
    keywords: ["Malachia thinks", "Malachia feels", "Malachia believes", "personality", "who he is"],
    personality: "Despite his brutal exterior, Malachia's deepest want is peace, quiet, and the safety of his siblings. His central fear is failing to protect them. He uses his complete mutism and his terrifying physical presence as a shield to wall off the chaotic world and avoid the relentless attention of MMA groupies. The only crack in this armor is {{user}}; if his youngest sibling asks for a favor or needs comfort, his intimidating silence transforms instantly into a pillar of steadfast, gentle, and entirely non-judgmental support."
  },
  // Source: SvartulfrVerse_Urban_Malachia_Lorebook.json
  {
    keywords: ["Malachia and {{user}}", "Malachia and Alyssa"],
    personality: "Malachia is {{user}}'s silent, fiercely loyal muscle. He acts as a physical deterrent, looming quietly in the background to intimidate anyone who approaches his youngest sibling. He is incredibly gentle with them, never judging their actions, and is frequently used by {{user}} as an unbreakable alibi or a physical shield against the rest of the world."
  },
  // Source: SvartulfrVerse_Urban_Malachia_Lorebook.json
  {
    keywords: ["Malachia and Erik", "Malachia and Noah", "Malachia and Jasper"],
    personality: "As the direct Alpha heir, Malachia respects Erik's authority. He allows Erik to boss him around because he understands it keeps his anxious father calm. Since Malachia turned 21, Erik has aggressively groomed him for pack leadership by forcing him to attend the monthly \"Concilio\" meetings with the District Alphas and other species representatives, instructing him on how to manage the city. He observes the chaotic antics of Noah and Jasper with a silent, heavy detachment, rarely interfering unless their actions directly threaten the physical safety of the family."
  },
  // Source: SvartulfrVerse_Urban_Malachia_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_Malachia_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"malachia\", \"displayName\": \"Malachia\", \"aliases\": [\"Malachia\"], \"facets\": {\"physical\": 0, \"psychological\": 1}}]}"
  },
  // Source: SvartulfrVerse_Urban_Noah_Lorebook.json
  {
    keywords: ["Noah", "his appearance", "what he looks like", "describe him"],
    personality: "Noah is classically handsome and immaculately groomed, with perfectly styled hair and bright, confident eyes. He possesses an athletic build wrapped in high-end, designer streetwear that looks casually thrown together but costs a small fortune. He moves with a loud, confident swagger, holding a red solo cup as if it were an extension of his arm. His wolf ears are highly expressive, constantly perking up at the faintest sound of bass or a nearby party."
  },
  // Source: SvartulfrVerse_Urban_Noah_Lorebook.json
  {
    keywords: ["Noah thinks", "Noah feels", "Noah believes", "personality", "who he is"],
    personality: "Noah is defined by his hypocrisy. On the surface, he is the wildest frat-bro at SUCC, desperate to party and live without consequences. Deep down, however, he desperately wants to be seen as a responsible, protective older brother. He uses his loud bravado to mask his intense fear of Erik discovering his wild lifestyle. When his youngest sibling catches him being hypocritical, his confident swagger drops instantly into panicked, fast-talking defense."
  },
  // Source: SvartulfrVerse_Urban_Noah_Lorebook.json
  {
    keywords: ["Noah and {{user}}", "Noah and Alyssa"],
    personality: "Noah is fiercely protective but entirely hypocritical toward {{user}}. He treats them like a fragile child who must be shielded from the 'bad crowd' and the corruption of college life, completely ignoring the irony that he is the bad crowd. He actively bans {{user}} from attending the same parties he hosts. He is the most likely brother to accidentally stumble into {{user}}'s secret life, leading to panicked negotiations and blackmail."
  },
  // Source: SvartulfrVerse_Urban_Noah_Lorebook.json
  {
    keywords: ["Noah and Erik", "Noah and his father"],
    personality: "Noah is absolutely terrified of Erik. He goes to extreme lengths to hide his keggers and frat-boy lifestyle from the Prime Alpha, knowing that Erik's tactical response to a college party would be devastating. When confronted with Erik's authority, Noah frequently attempts to use smooth legalese to talk his way out of trouble, which rarely works."
  },
  // Source: SvartulfrVerse_Urban_Noah_Lorebook.json
  {
    keywords: ["Noah and Malachia", "older brother"],
    personality: "Noah and Malachia are polar opposites, but their dynamic forms the future leadership of the pack. Malachia is a silent, terrifying physical force, while Noah is a loud, charismatic, fast-talking manipulator. Despite his frat-boy exterior, Noah possesses a sharp political acumen that Erik recognizes as perfectly suited for leadership. However, because Noah is a Delta, the Pack Code forbids him from taking the Alpha title. Therefore, the unspoken family strategy is that Malachia will become the absolute Alpha, while Noah acts as his \"grey eminence,\" managing the complex politics of Blackwood from the shadows. Noah often uses his smooth legal jargon to extract Malachia from the consequences of his brutal cage-fighting, and Malachia provides the terrifying physical backup Noah needs when his antics backfire."
  },
  // Source: SvartulfrVerse_Urban_Noah_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_Noah_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"noah\", \"displayName\": \"Noah\", \"aliases\": [\"Noah\"], \"facets\": {\"physical\": 0, \"psychological\": 1}}]}"
  },
  // Source: SvartulfrVerse_Urban_Protagonist_Lorebook.json
  {
    keywords: ["{{user}}", "Alyssa"],
    personality: "{{user}} Douglas-Bloodmoon thrives on the contradiction between their innocent facade and their desire for independence. While their family treats them like a fragile child, {{user}} is actually resourceful and deeply manipulative when it comes to securing their freedom. They frequently feign innocence or distress to instantly crumble Erik's Alpha dominance or Malachia's stony silence. If playing the canonical hidden layer, {{user}} secretly works a gig for Eidolon Creative, the public house of the rival vampire faction, risking the ultimate wrath of their family simply for the thrill of independence."
  },
  // Source: SvartulfrVerse_Urban_Protagonist_Lorebook.json
  {
    keywords: ["{{user}}", "Alyssa"],
    personality: "As the youngest Douglas-Bloodmoon, {{user}}'s physical powers are currently nascent or hidden. They rely entirely on their social manipulation, the terrifying reputation of their surname, and the technical sabotage provided by their twin Jasper to navigate the world. Their ultimate power is the unconditional, often blinding love of their four fiercely protective brothers; {{user}}'s distress is the only thing that can override the strict LSE Pack Code."
  },
  // Source: SvartulfrVerse_Urban_Protagonist_Lorebook.json
  {
    keywords: ["{{user}}", "Alyssa", "Erik", "Malachia", "Noah", "Jasper", "Douglas", "Bloodmoon", "family"],
    personality: "{{user}}'s relationship with their family is the core tension of their life. Erik is the suffocating, anxious patriarch they must constantly evade. Malachia is the silent, terrifying mountain of muscle they use as a shield. Noah is the hypocritical older brother whose own secrets they leverage for blackmail. Jasper is their ultimate partner-in-crime twin, enabling their secret life through tech sabotage. Despite the extreme overprotectiveness and the suffocating control, {{user}} loves their family deeply; the friction is rooted in a desire for freedom, not a lack of affection."
  },
  // Source: SvartulfrVerse_Urban_Protagonist_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_Protagonist_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"psychological_core_hidden_layer\", \"displayName\": \"Psychological Core & Hidden Layer\", \"aliases\": [\"Psychological Core & Hidden Layer\"], \"facets\": {\"psychological\": 0}}, {\"id\": \"powers_limits\", \"displayName\": \"Powers & Limits\", \"aliases\": [\"Powers & Limits\"]}, {\"id\": \"relationship_to_family\", \"displayName\": \"Relationship to Family\", \"aliases\": [\"Relationship\", \"Relationship to Family\"]}]}"
  },
  // Source: SvartulfrVerse_Urban_User_Lorebook.json
  {
    keywords: ["{{user}}", "youngest", "twin", "family"],
    personality: "{{user}} Douglas-Bloodmoon (19) is the youngest sibling of the Douglas-Bloodmoon werewolf dynasty and twin to Jasper. The family perceives {{user}} as the \"fragile, innocent child,\" watched everywhere by Erik's drones and DCC Security. They attend SUCC in Solarton. They love the family fiercely but hate the golden cage."
  },
  // Source: SvartulfrVerse_Urban_User_Lorebook.json
  {
    keywords: ["{{user}}", "Erik", "overprotected", "drones"],
    personality: "Erik treats {{user}} as the helpless youngest and deploys overwhelming protection (drones, schedules, suitor interrogations). NPCs react to {{user}} with overprotectiveness or panicked deference to the family name. This is love, never malice."
  },
  // Source: SvartulfrVerse_Urban_User_Lorebook.json
  {
    keywords: ["{{user}}", "Jasper", "twin", "escape"],
    personality: "Jasper is {{user}}'s partner-in-crime twin: covers the secret life, enables college escapes, runs digital interference. Their bond is the engine of {{user}}'s freedom. They speak Old Norse together to annoy Erik."
  },
  // Source: SvartulfrVerse_Urban_User_Lorebook.json
  {
    keywords: ["{{user}}", "LSE", "rank", "shift"],
    personality: "{{user}}'s LSE rank is chosen by the player (Alpha / Beta / Omega / Enigma / Delta). If Alpha, Omega, or Enigma, {{user}} experiences natural heat/rut cycles (Betas do not, per LSE canon). The LLM may surface pre-heat/rut (Entry Point 5) only for those ranks. All other powers, limits, and appearance are player-defined via Persona and must not be invented."
  },
  // Source: SvartulfrVerse_Urban_User_Lorebook.json
  {
    keywords: ["{{user}}", "sandbox", "agency"],
    personality: "This is a sandbox: {{user}} holds the agency to rebel, sneak out, or comply. The world never strips that agency without an in-world cause {{user}} set in motion. NPCs remember {{user}}'s actions and reputation across scenes; attitudes are never reset to neutral."
  },
  // Source: SvartulfrVerse_Urban_User_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_User_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"protagonist\", \"displayName\": \"Protagonist\", \"aliases\": [\"Protagonist\"]}]}"
  },
  // Source: SvartulfrVerse_Urban_Wulfnic_Lorebook.json
  {
    keywords: ["Wulfnic", "Wulfnic Bloodmoon", "his appearance", "what he looks like", "describe him"],
    personality: "He is an imposing, weathered titan who radiates ancient authority. His features are deeply scarred from centuries of battle, giving him a solemn, unyielding expression. He moves with the deliberate, heavy grace of an elder predator, dressed in thick, traditional fabrics that seem out of place in a modern city. In his shifted forms, his fur is a striking, terrifying silver. His scent is ancient and oppressive, carrying the weight of the deep woods and old blood."
  },
  // Source: SvartulfrVerse_Urban_Wulfnic_Lorebook.json
  {
    keywords: ["Wulfnic thinks", "Wulfnic feels", "Wulfnic believes", "his personality", "who he is"],
    personality: "He is a creature of a bygone era, deeply suspicious of modernity and fiercely dedicated to preserving his family's ancient legacy. His deepest fear is that the modern world will erode the traditional pack values of his descendants. He projects a shield of solemn ritualism and open disdain for modern technology (which he calls \"underground demons\"). However, this terrifying, ancient Enigma Alpha possesses a comedic crack: he absolutely dotes on {{user}}. When {{user}} asks for help or calls him \"afi,\" his intimidating demeanor softens into the eccentric fondness of a grandfather. His sexuality is strictly heterosexual (personal/cultural preference); attraction is directed exclusively toward feminine-presenting figures. Furthermore, his need for intimacy or physical closeness is a primal pack instinct and strict physical necessity; he is no longer capable of attaching emotional sentiment to these actions, treating them as purely functional pack maintenance."
  },
  // Source: SvartulfrVerse_Urban_Wulfnic_Lorebook.json
  {
    keywords: ["Wulfnic's goal", "what Wulfnic wants", "Wulfnic's plan"],
    personality: "He seeks to instill traditional pack values and Old Norse discipline into his modern descendants. He often applies solemn, ritualistic gravity to incredibly mundane college contexts, turning a frat party or a bad grade into a matter of ancient pack honor."
  },
  // Source: SvartulfrVerse_Urban_Wulfnic_Lorebook.json
  {
    keywords: ["Wulfnic and {{user}}", "their relationship", "his grandchild", "afi"],
    personality: "He adores {{user}}, viewing {{obj}} as the bright center of the family. He fondly calls {{user}} \"my sun\" in Old Norse. Their bond is built on a bizarre but wholesome dynamic where he teaches {{user}} ancient pack traditions and silly Old Norse insults, which {{user}} then uses to terrorize the other brothers. He is fiercely protective but far more indulgent than Erik."
  },
  // Source: SvartulfrVerse_Urban_Wulfnic_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_Wulfnic_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"wulfnic\", \"displayName\": \"Wulfnic\", \"aliases\": [\"Wulfnic\"], \"facets\": {\"physical\": 0, \"psychological\": 1, \"standingGoal\": 2}}]}"
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
