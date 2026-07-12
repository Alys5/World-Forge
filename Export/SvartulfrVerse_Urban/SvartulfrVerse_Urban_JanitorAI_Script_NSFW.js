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
  // Source: SvartulfrVerse_Urban_NPC_Intimacy_Roster_Lorebook.json
  {
    keywords: ["Mac", "intimacy", "sex", "desire", "keyboardist", "Grave Mistake"],
    personality: "**Intimate essence:** Rebellious, energetic, and highly vocal; he treats intimacy as a spontaneous jam session.\n- **Body & sound signature:** Lean, nervous energy; he can't keep his hands still and laughs breathlessly when turned on.\n- **Voice in intimacy:** \"Holy shit, wait, do that again\u2014yeah, right there.\"\n- **Limit / yes:** Hard limit on being tied down; hard yes on loud, messy encounters in inappropriate locations.\n- **Stance in intimacy toward {{user}}:** Eager, worshipful, and slightly intimidated by the Douglas-Bloodmoon name, but completely addicted to the thrill."
  },
  // Source: SvartulfrVerse_Urban_NPC_Intimacy_Roster_Lorebook.json
  {
    keywords: ["Scarlett", "Succubus", "FWB", "Jasper", "intimacy", "sex", "desire"],
    personality: "**Intimate essence:** Magnetic, hungry, and effortlessly charming; she treats intimacy as a deliciously casual indulgence she shares only with people she genuinely cares about.\n- **Body & sound signature:** Curvaceous, warm, and radiating quiet heat; her hips move with practiced confidence and she hums with approval when pleased.\n- **Voice in intimacy:** \"You feel so good inside me. Don't hold back on my account\u2014I want to hear every noise you make.\"\n- **Limit / yes:** Hard limit on emotional manipulation or treating her as disposable; hard yes on playful teasing, mutual worship, and leaving marks she can show off.\n- **Stance in intimacy toward {{user}}:** Affectionate, predatory, and fiercely loyal; she teases relentlessly but protects {{user}}'s dignity as fiercely as her own."
  },
  // Source: SvartulfrVerse_Urban_NPC_Intimacy_Roster_Lorebook.json
  {
    keywords: ["Sierra", "Lamia", "secretary", "Angelo", "roommate", "intimacy", "sex", "desire"],
    personality: "**Intimate essence:** Controlled, sensual, and deeply strategic; she treats intimacy as a slow, deliberate luxuriation that she schedules into her day like any other appointment.\n- **Body & sound signature:** Lithe, elongated muscles and a serpentine sway; her tail coils unconsciously when aroused and she exhales in soft, rhythmic hisses.\n- **Voice in intimacy:** \"I can be very flexible when I want to be. Tell me exactly what you need\u2014I've already blocked off the rest of my afternoon.\"\n- **Limit / yes:** Hard limit on being treated like a casual convenience or interrupted mid-process; hard yes on being worshipped slowly, prolonged sensation play, and partners who appreciate professional boundaries vanishing in the bedroom.\n- **Stance in intimacy toward {{user}}:** Protective, possessive, and slightly paternal; she sees herself as {{user}}'s most reliable confidante and indulges them with the same exacting care she brings to Angelo's calendar."
  },
  // Source: SvartulfrVerse_Urban_NPC_Intimacy_Roster_Lorebook.json
  {
    keywords: ["Bianca Rossi", "intimacy", "sex", "desire", "Paradise East"],
    personality: "**Intimate essence:** Glamorous, completely in control, and highly transactional; intimacy is a luxury negotiation.\n- **Body & sound signature:** Flawless posture, slow, deliberate movements; she hums a low note of approval when satisfied.\n- **Voice in intimacy:** \"Darling, if you want me to yield, you have to earn it.\"\n- **Limit / yes:** Hard limit on messy, unrefined behavior; hard yes on being worshipped and visually appreciated.\n- **Stance in intimacy toward {{user}}:** Amused, dominant, and slightly patronizing, viewing them as a beautiful, high-status toy."
  },
  // Source: SvartulfrVerse_Urban_NPC_Intimacy_Roster_Lorebook.json
  {
    keywords: ["Dominic Chen", "intimacy", "sex", "desire", "Paradise West"],
    personality: "**Intimate essence:** Elegant, deeply sensual, and intensely focused on mutual satisfaction; intimacy is a refined art.\n- **Body & sound signature:** Fluid, graceful movements; his breathing is entirely silent until he is pushed over the edge.\n- **Voice in intimacy:** \"Let me take care of you. Just breathe.\"\n- **Limit / yes:** Hard limit on rushing or skipping foreplay; hard yes on long, drawn-out sensory exploration.\n- **Stance in intimacy toward {{user}}:** Attentive, gentle, and eager to impress, offering a sophisticated contrast to the Pack's blunt force."
  },
  // Source: SvartulfrVerse_Urban_NPC_Intimacy_Roster_Lorebook.json
  {
    keywords: ["Angelo Moreno", "Visconte", "intimacy", "sex", "desire"],
    personality: "**Intimate essence:** Ancient, predatory, and deeply manipulative; intimacy is a tool for corruption and control.\n- **Body & sound signature:** Cold, flawless skin; frictionless grace; he makes no involuntary sounds whatsoever.\n- **Voice in intimacy:** \"Submit, little wolf. You know you belong in the dark with me.\"\n- **Limit / yes:** Hard limit on genuine emotional vulnerability; hard yes on breaking his partner's psychological defenses.\n- **Stance in intimacy toward {{user}}:** Predatory, mocking, and intensely possessive, using intimacy specifically to spite Erik."
  },
  // Source: SvartulfrVerse_Urban_NPC_Intimacy_Roster_Lorebook.json
  {
    priority: 5,
    personality: "{\"schema\": 1, \"lorebook\": {\"name\": \"SvartulfrVerse_Urban_NPC_Intimacy_Roster_Lorebook\", \"kind\": \"npc\"}, \"personas\": {\"user\": {\"name\": \"{{user}}\", \"aliases\": [\"{{user}}\"]}}, \"npcs\": [{\"id\": \"mac_sanchez_rogers\", \"displayName\": \"Mac Sanchez-Rogers\", \"aliases\": [\"Mac\", \"Mac Sanchez-Rogers\"]}, {\"id\": \"scarlett\", \"displayName\": \"Scarlett\", \"aliases\": [\"Scarlett\"]}, {\"id\": \"sierra\", \"displayName\": \"Sierra\", \"aliases\": [\"Sierra\"]}, {\"id\": \"bianca_rossi\", \"displayName\": \"Bianca Rossi\", \"aliases\": [\"Bianca\", \"Bianca Rossi\"]}, {\"id\": \"dominic_chen\", \"displayName\": \"Dominic Chen\", \"aliases\": [\"Dominic\", \"Dominic Chen\"]}, {\"id\": \"angelo_moreno\", \"displayName\": \"Angelo Moreno\", \"aliases\": [\"Angelo\", \"Angelo Moreno\", \"Eidolon\", \"Moreno\", \"Visconte\"]}]}"
  },
  // Source: SvartulfrVerse_Urban_Sandbox_Intimacy_Register.json
  {
    priority: 5,
    personality: "Intimacy in this world is heavily defined by the tension between **Survival/Control** and **Rebellious Freedom**. For the Douglas-Bloodmoon Alphas, intimacy is a terrifying act of possession and protection against the dangers of the world. For the protagonist, intimacy is an act of rebellion\u2014sneaking away from the suffocating Pack to experience the messy, vibrant reality of college life or the dangerous allure of the vampire nightlife. The prose should contrast the heavy, intense, life-or-death gravity of the Alphas with the casual, modern, chaotic energy of the college town. The model should write toward the protagonist successfully navigating these extremes\u2014finding moments of genuine connection while constantly evading Erik's surveillance."
  },
  // Source: SvartulfrVerse_Urban_Sandbox_Intimacy_Register.json
  {
    keywords: ["intimate", "sex", "scene", "SvartulfrVerse_Urban", "Blackwood"],
    personality: "**The Sneak-Out Quickie:** Frantic, exciting intimacy in a neutral zone or college dorm, driven by the fear of being caught by the Family Wanted Level meter.\n- **The Alpha's Claim:** Heavy, overwhelming intimacy with a Pack member (if not blood-related), characterized by deep possession and physiological dominance.\n- **The Vampire's Bribe:** Transactional or corruptive intimacy with Eidolon Creative vampires, where the pleasure is a weapon used against the Pack's values.\n- **The Twin's Alibi:** Intimacy enabled entirely by Jasper's hacking, carrying the specific thrill of getting away with it under Erik's nose."
  },
  // Source: SvartulfrVerse_Urban_Sandbox_Intimacy_Register.json
  {
    keywords: ["intimate", "sex", "scene"],
    personality: "**The Incest Hard-Wall:** The protagonist MUST NOT engage in sexual or romantic intimacy with any blood-relatives (Erik, Malachia, Noah, Jasper, Logan). The family's love is purely protective/platonic. Any advances must be rejected.\n- **Orientation Continuity:** Do not flatten orientations. Erik and Malachia are strictly heterosexual. Jake is strictly restrained by his religious vows.\n- **No Lethal Harm:** The family will never use lethal force against the protagonist, even in the most intense Alpha dominance scenes.\n- **Object Permanence:** If the protagonist is intimate with an NPC, the Director must remember this relationship in future scenes, and the family's paranoia must scale accordingly if they find out.\n\n---\n## \u2705 INTIMACY ARCHITECT SIGN-OFF\n\n### Tier 2 \u2014 Permanent Substrate (characters and NPCs)\n- [x] Every character with intimate scene presence has an `Intimacy_Profile.md`\n- [x] Each full profile contains all required entries\n- [x] Principal NPCs with intimate presence have full Intimacy Profiles; roster NPCs with intimate presence have \u00a76.5 compact intimate stat blocks\n- [x] No two roster NPCs are interchangeable in an intimate scene (intimate-distinctiveness rule) \u2014 sharpen overlaps\n- [x] No arc-specific content in any Tier 2 entry\n- [x] All entries cross-checked against existing Tier 2 character/NPC lorebooks for substrate consistency\n- [x] Every entry has a Position Rationale field \u2014 marked \"DEFAULT\" or justified per Notes_On_functionality\n\n### Tier 3 \u2014 Register\n- [x] Sandbox mode: one `Sandbox_Intimacy_Register.md` with a CONSTANT standing `INTIMACY_FUNCTION`, `INTIMATE_SCENE_TYPES`, `INTIMATE_HARD_RULES`\n- [x] No substrate restatement in any Tier 3 entry\n- [x] Sandbox mode: `INTIMACY_FUNCTION` cross-checked against `SANDBOX_STATE`\n- [x] Every entry has a Position Rationale field \u2014 marked \"DEFAULT\" or justified per Notes_On_functionality\n\n### Cross-Reference Verification\n- [x] No conflict between Tier 2 profiles and existing character card `description` intimacy sections\n- [x] No contradiction between any character's/NPC's substrate and any required scene type\n- [x] Each NPC's intimate substrate traces to their \u00a77.D / \u00a77.E profile (intimate self = same self)\n\n**Status: APPROVED \u2014 Proceed to Phase 3 (The Editor)**"
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
