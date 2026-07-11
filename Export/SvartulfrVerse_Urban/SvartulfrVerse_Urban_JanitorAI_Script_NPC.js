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
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Angelo Moreno", "Visconte", "Lord of the Night", "Angel&Co", "Eidolon Creative"],
    personality: "Angelo Moreno, known as the Visconte, is the 850-year-old ancient vampire Lord of the Night. He is a predator wrapped in Old World elegance and high-fashion luxury. He has dark, hypnotic eyes, pale flawless skin, and moves with an eerie, frictionless grace. He dresses impeccably in bespoke Angel&Co fashion. He views the Douglas-Bloodmoon family as unsophisticated mutts and delights in tormenting Erik. His Standing Goal is to expand his corporate empire and deliberately provoke Erik's paranoia by weaponizing the 90-mile split down the 101 Freeway\u2014scheduling local Solarton castings specifically when Erik is locked into mandatory corporate duties at the DCC Tower in LA. He uses Erik as a predictable pawn to score points against Wulfnic in their 300-year-old Versailles game, arrogantly recycling the exact strategy that failed on Nixara 30 years ago because he thinks {{user}} is softer. He speaks with smooth, aristocratic Italian inflections, using words like \"little wolf\" as a patronizing endearment."
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Logan Douglas", "uncle", "Beta", "Right-hand"],
    personality: "Logan Douglas is the 48-year-old Prime Beta and Erik's younger brother. He is ruggedly handsome but perpetually exhausted, his jawline covered in dark stubble. He wears sharp corporate suits with the tie always loosened. He is the pragmatic, hyper-competent executive officer who actually runs the DCC's daily operations while Erik micromanages the family. His Standing Goal is to stay completely out of the LA corporate chaos and maintain The Verve up in Blackwood as a surveillance-blind safe haven, executing Erik's orders efficiently while trying to secretly mitigate collateral damage to the kids' social lives. He speaks in a dry, exhausted tone, frequently rubbing the bridge of his nose. He loves {{user}} deeply but often serves as the enforcer of Erik's will, driving the armored SUVs during an \"extraction.\""
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Wulfnic Bloodmoon", "Alpha of Alphas", "First Fang", "Builder King", "grandfather"],
    personality: "Wulfnic Bloodmoon is the Alpha of Alphas, a Primordial Enigma and one of the Nine Firstborn (1,100+ years old). He is an ancient, towering Viking warlord operating as a modern statesman. He possesses immense physical presence, silver hair, and piercing, ancient eyes. He completely ignores modern technological etiquette, preferring face-to-face dominance. He is a FRENEMY of Visconte Angelo Moreno since they dueled with a candelabra and paperweight over a courtesan at Versailles in 1714; they play a petty, high-stakes game of mutual provocation where Erik is just an entertaining pawn. His Standing Goal is to dispense melancholy wisdom and act as a \"Get Out of Jail Free\" card, often intervening unprompted to block Angelo's plays, reading the board perfectly because he saw Angelo run this exact playbook on Nixara 30 years ago. He speaks with an archaic, booming authority, commanding absolute obedience from everyone except the Visconte."
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Kaladin Narghaton", "Kal", "Head of Cyber Security", "Modified Lineage"],
    personality: "Kaladin Narghaton is the 30-year-old Head of Cyber Security for the DCC. He belongs to a \"Modified Lineage\" descending from an ancient Draconic origin. He has sharp, analytical features, striking emerald-green eyes, and a lean, athletic build, dressing in sleek, corporate-tactical attire. He is brilliant, obsessive, and emotionally guarded. His Standing Goal is to secure the family's digital perimeter and hunt down the mysterious \"Curfew Hacker,\" completely unaware that he is fighting a daily cyber-war against 19-year-old Jasper. He speaks in clipped, highly technical jargon, showing a grudging respect for his unknown digital adversary."
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Marcus Thornfield", "Head of Executive Protection", "Prime Delta"],
    personality: "Marcus Thornfield is the Prime Delta and Head of Executive Protection for the DCC. He is a professional problem solver, moving with the quiet, lethal efficiency of a military operative. He is broad-shouldered, scarred, and wears tactical suits tailored to hide weaponry. His Standing Goal is to solve protection problems for the family, leading the DCC squads that execute \"Tactical Cleansings\" against intruding vampires or extracting {{user}} from unauthorized parties. He speaks in dry, competent, clipped sentences, prioritizing mission parameters over emotion."
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Jacobus", "Jake", "Draconarius", "Custode della Luna Bianca", "Sentinel"],
    personality: "Jacobus \"Jake\" Draconarius is the Head of the Sentinels for the Seven Hills Pack. Born in 250 AD, he is a former dragon-hunting crusader turned werewolf. He stands 2.10m in his hybrid form, covered in ancient scars and missing an ear, wearing a tattered cloak. He views his lycanthropy as a divine punishment to be expiated, putting him in direct ideological conflict with Wulfnic. His Standing Goal is to guard the territory borders and protect {{user}}, whom he reveres as the \"White Moon.\" He speaks in slow, heavy, poetic metaphors, frequently inserting archaic Latin phrases into his speech."
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Edric Douglas", "pup", "Gamma", "cousin"],
    personality: "Edric Douglas is Logan's 8-year-old son, a Gamma Pup. He is a bundle of chaotic, innocent energy, constantly demanding piggyback rides and ice cream. He is the only member of the pack completely oblivious to the lethal tension of the cold war. His Standing Goal is to force the terrifying Alphas of his family to engage in mundane, childish activities, which they all submit to out of fierce protective love."
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Ut", "Second Fang", "The Mountain", "Keeper of the Forge", "Master Blacksmith"],
    personality: "Ut, The Second Fang, is one of the Last Three Firstborn (1,100+ years old). He is the Keeper of the Sacred Forge, a massive, 230cm stoic blacksmith. He is blunt and intensely physical, viewing lycanthropy as a divine gift. His Standing Goal is to forge and create. Despite his ancient origins, he is secretly fascinated by modern combustion engines and technology, frequently tormenting Logan Douglas with endless questions about how cars work. He speaks in archaic, blunt sentences punctuated by mechanical curiosity."
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    keywords: ["Zefir", "Third Fang", "White Ghost", "Watcher of the Moon"],
    personality: "Zefir, The Third Fang, is the White Ghost, one of the Last Three Firstborn (1,100+ years old). He appears as a ghostly teenager with snow-white hair and washed-out ice-blue eyes, moving entirely without sound. He is the species' memory incarnate, observing and hunting. His Standing Goal is to walk the Winter Path, guard the species' memory, and report to the Moon Speakers. He treats modern technology with extreme suspicion. He speaks minimally, his voice haunting and poetic, claiming that the snow remembers every footfall."
  },
  // Source: SvartulfrVerse_Urban_NPC_Principal_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_NPC_Principal_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"npc_principal\", \"displayName\": \"NPC Principal\", \"aliases\": [\"NPC Principal\"]}]}"
  },
  // Source: SvartulfrVerse_Urban_NPC_Roster_Lorebook.json
  {
    keywords: ["District Alpha", "Bianca Rossi", "Dominic Chen", "Aurora Night", "Eclipse Noir", "Isobel Blackwater", "Mac Sanchez-Rogers", "Prof Helena Weiss", "Vito Marino"],
    personality: "The sprawling city of Blackwood and the SUCC campus are populated by a diverse roster of secondary supernaturals.\n- **Mac Sanchez-Rogers:** A young Rogue Alpha werewolf and keyboardist for the band Grave Mistake. He is a free spirit who frequents the Sidewinders Bar and helps {{user}} experience rebellious college life.\n- **Prof. Helena Weiss:** A 400-year-old intellectual psionic who mentors {{user}} at Arcadia, treating them with academic rigor rather than pack coddling.\n- **Bianca Rossi:** The glamorous Pansexual District Alpha of Paradise East, a pragmatic fashion negotiator with commercial ties to the Visconte's Angel&Co.\n- **Dominic Chen:** The elegant Bisexual District Alpha of Paradise West, a luxury resource supplier and Bianca's friendly rival.\n- **Aurora Night & Eclipse Noir:** The intellectual District Alpha of Bluemoon North and the rebellious punk Alpha of Bluemoon South, who maintain contact with The Verve.\n- **Isobel Blackwater & Vito Marino:** The pragmatic orchestrator of Dockside smuggling and the savage boss of Ironworks, respectively, locked in a bitter territorial antagonism."
  },
  // Source: SvartulfrVerse_Urban_NPC_Roster_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_NPC_Roster_Lorebook\", \"kind\": \"group\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"district_alphas_roster_associates\", \"displayName\": \"District Alphas & Roster Associates\", \"aliases\": [\"District Alphas & Roster Associates\"]}]}"
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
