/* ============================================================================
    LUPINE SOCIAL ECOLOGY v1
    Author: Lys_5
    //#region HEADER
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
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'scope'],
		personality:
			'The LSE is a comprehensive reference framework describing the biology, ecology, society, governance, religion, history, and civilization of the werewolf species. It is designed to be:\n\n- **Modular:** Each PART can be expanded independently without affecting other modules.\n- **Setting-Agnostic:** The framework describes the species in general terms. Specific settings (e.g., the SvartulfrVerse) apply the LSE to their particular context.\n- **Future-Proof:** The separation of biology, history, religion, and culture allows for atheists, scientists, heretics, and cultists to coexist within the same canonical framework.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'canon policy'],
		personality:
			'Canon is established through three mechanisms:\n\n1. **Core Canon:** Content documented in the LSE modules. This is the ground truth for the species.\n2. **Setting Canon:** Content specific to a particular world or story (e.g., the Bloodmoon Dynasty exists within the SvartulfrVerse, not necessarily in every werewolf setting).\n3. **Narrative Canon:** Events that occur during roleplay or storytelling. These are canon within their specific narrative thread.\n\nCore Canon takes precedence over Setting Canon, which takes precedence over Narrative Canon.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'three levels of truth'],
		personality:
			'Every claim within the LSE exists on one of three epistemological levels. These must never be conflated:',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'three levels of truth', 'religious canon'],
		personality:
			'What the **Faith of Fenris** teaches as divine truth.\n\n> *"Fenris personally forged the Nine Firstborn from mortal warriors."*\n\nThis is what believers accept. It may or may not reflect historical fact.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'three levels of truth', 'recorded history'],
		personality:
			'Verified events supported by evidence, testimony, or living witnesses.\n\n> *"The earliest confirmed werewolves appeared during the Viking Age. Contemporary accounts describe nine extraordinary individuals later known as the Firstborn."*\n\nThis is what historians can document.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'three levels of truth', 'unknown truth'],
		personality:
			'What remains unknowable, debated, or deliberately ambiguous.\n\n> *"Whether Fenris physically existed as a divine entity or whether the story represents a mythologized account of the origin of lycanthropy remains unknowable."*\n\nThis is what the framework intentionally leaves open.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'the seven lse principles'],
		personality:
			'These principles form the "Constitution" of the LSE and guide all design decisions:',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the seven lse principles',
			'principle i \u2014 biology is not destiny',
		],
		personality:
			"A werewolf's secondary sex (Alpha, Delta, Beta, Omega, Enigma) determines physiology, pheromones, and reproductive cycles. It does **not** determine their social rank, profession, political authority, or personal value.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the seven lse principles',
			'principle ii \u2014 packs are families',
		],
		personality:
			'A pack is a cooperative family unit, not a military hierarchy. It is built around kinship, mutual care, and shared survival \u2014 not around dominance through violence.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the seven lse principles',
			'principle iii \u2014 leadership is earned and maintained',
		],
		personality:
			'Pack Leaders hold their position through trust, competence, and the consent of the pack. Leadership is not an automatic birthright of any secondary sex. It can be lost through incompetence or abuse.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the seven lse principles',
			'principle iv \u2014 every wolf has a niche',
		],
		personality:
			'Beyond their biology and their pack role, every werewolf develops a personal specialization (Niche) based on talent, training, and vocation. An Alpha can be a Healer. An Omega can be a Diplomat.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the seven lse principles',
			'principle v \u2014 culture evolves',
		],
		personality:
			'No two packs are identical. Local environment, history, and tradition create distinct cultures. Culture is not static \u2014 it changes with each generation.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the seven lse principles',
			'principle vi \u2014 faith and history are separate',
		],
		personality:
			"Religious belief and historical record are distinct domains. The Faith of Fenris is a valid and respected tradition, but it is not the only way to understand the species' origin. Scientists, atheists, and heretics exist within the setting.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the seven lse principles',
			'principle vii \u2014 the pack survives before the individual',
		],
		personality:
			'The fundamental unit of werewolf society is the pack, not the individual. Decisions are made for the survival and prosperity of the group. Individual ambition is subordinate to collective welfare.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'the six-axis identity system'],
		personality:
			'Every werewolf is defined by six independent axes. These must **never** be conflated or collapsed into a single hierarchy:\n\n```\nINDIVIDUAL IDENTITY CARD\n\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502  1. Blood Classification   [Genetics, immutable]    \u2502\n\u2502  2. Secondary Sex          [Biology, immutable]     \u2502\n\u2502  3. Pack Role              [Authority, earned]      \u2502\n\u2502  4. Social Status          [Politics, inherited]    \u2502\n\u2502  5. Profession             [Occupation, chosen]     \u2502\n\u2502  6. Niche                  [Specialization, grown]  \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the six-axis identity system',
			'axis 1 \u2014 blood classification',
		],
		personality:
			'Determined by genetics. Immutable.\n\n| Classification | Definition |\n|---|---|\n| Divine Blood | The Nine Firstborn. Origin: Religious Canon says created by Fenris; Recorded History confirms their existence but not the mechanism. |\n| Founding Bloodlines | Direct descendants of the Firstborn. Founders of the Great Houses. |\n| Pureblood Houses | Multi-generational descendants. Genetically very stable. |\n| Common Bloodlines | The majority of the werewolf population. |\n| Modified Lineages | Experimentally or artificially altered subjects (e.g., Gamma-7 program). |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the six-axis identity system',
			'axis 2 \u2014 secondary sex',
		],
		personality:
			'Determined by biology at presentation. Immutable.\n\n- **Enigma** (Sacred Caste \u2014 see `LSE_01_Species.md`)\n  - *Primordial Enigma:* The Nine Firstborn. Unique. Unrepeatable.\n  - *Ascended Enigma:* Rarissime exceptions (~10 in two millennia).\n- **Alpha** \u2014 The Protector\n- **Delta** \u2014 The Engine\n- **Beta** \u2014 The Social Glue\n- **Omega** \u2014 The Emotional Regulator',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the six-axis identity system',
			'axis 3 \u2014 pack role (authority)',
		],
		personality:
			'Assigned or earned within a pack. Can change.\n\n```\nPack Leader \u2192 Second \u2192 Hunter Captain \u2192 Caretakers \u2192 Pups\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the six-axis identity system',
			'axis 4 \u2014 social status',
		],
		personality:
			'Political standing within a Noble House. Inherited or earned.\n\n```\nHouse Head \u2192 Lord \u2192 Knight \u2192 Citizen\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the six-axis identity system',
			'axis 5 \u2014 profession',
		],
		personality:
			'Chosen occupation. Can change throughout life.\n\nExamples: Blacksmith, Doctor, Engineer, Lawyer, Soldier, Musician, Pilot, Merchant.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundations',
			'the six-axis identity system',
			'axis 6 \u2014 niche',
		],
		personality:
			'Deep specialization developed through talent and experience. Evolves over time.\n\nExamples: Weaponsmith, Field Medic, Drone Specialist, Cryptographer, Diplomat, Tracker, Ranger.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundations', 'core terminology'],
		personality:
			"**Pack** \u2014 A cooperative family unit that works together for survival and mutual care. Not a military hierarchy.\n\n**Presentation** \u2014 When a person matures into their secondary sex.\n\n**Heat** \u2014 _Estrus_. A period during which an Omega is sexually receptive, signalling readiness for mating. Typically occurs every three months, lasting 3\u201310 days.\n\n**Rut** \u2014 The Alpha's equivalent to an Omega's Heat. A period of heightened breeding drive. Typically monthly, or triggered by an Omega's heat.\n\n**Command** \u2014 A neuro-pheromonal response triggered by an Alpha. Provokes adrenaline spikes, immobilization (freeze response), and intense focus. Not absolute mind control. Can be resisted by experienced or strong-willed wolves.\n\n**Pheromones** \u2014 Chemical signals produced by scent glands. Communicate status, mood, sexual receptivity, and intent.\n\n**Knot** \u2014 The bulbous glandis at the base of an Alpha's or Enigma's penis; swells during intercourse to bind partners.\n\n**Slick** \u2014 Self-lubricant produced by Omega glands (rectum and uterus) during arousal or heat.\n\n**Bonding / Mating Mark** \u2014 A physical bite between neck and shoulder that creates a mental/emotional link between two individuals. Functions as a marriage equivalent.\n\n**Nest** \u2014 A safe, scent-rich space constructed by an Omega for comfort, heat management, and childbirth.\n\n**Den** \u2014 An Alpha's equivalent of a Nest. A scent-marked personal territory.\n\n**Rogue** \u2014 A solitary individual excluded from their pack due to violent or destructive tendencies.\n\n**Suppressants** \u2014 Pharmaceutical compounds (pill, injection, or intravenous) that block hormones causing heats/ruts. Cannot be taken during a first heat/rut.\n\n**Pup** \u2014 A child.\n\n**Breed/Breeding** \u2014 The act of impregnation.\n\n**Courting** \u2014 The formal process of romantic pursuit, typically leading to a mating bond.\n\n**Mate** \u2014 A bonded partner (sexual or romantic). Achieved only through a mating bond.\n\n**Lock** \u2014 When an Omega's body tightens around a knot during intercourse with a 100% compatible mate, triggering an extended orgasm and near-guaranteed conception.\n\n**Heat/Rut Leave** \u2014 Time off from work or school due to heat or rut cycles.\n\n**Omega Kibble** \u2014 A strongly medicated supplement given to Omegas in extreme distress. Also used for post-pregnancy weight management. Maximum once per week.\n\n**Scent Blocker** \u2014 A thin patch applied over a scent gland to suppress personal scent. Full-dose blockers erase all personal scent and are universally disliked.\n\n**Scent Concealer** \u2014 An oil or powder applied to a scent gland to change, enhance, or mask the natural smell.\n\n\n*Cross-references: [LSE_01_Species.md](LSE_01_Species.md) \u00b7 [LSE_02_Behavioral_Ecology.md](LSE_02_Behavioral_Ecology.md) \u00b7 [LSE_03_Civilization.md](LSE_03_Civilization.md) \u00b7 [LSE_04_Governance.md](LSE_04_Governance.md) \u00b7 [LSE_05_Religion.md](LSE_05_Religion.md) \u00b7 [LSE_06_History.md](LSE_06_History.md) \u00b7 [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md) \u00b7 [LSE_08_Technology.md](LSE_08_Technology.md) \u00b7 [LSE_Appendices.md](LSE_Appendices.md)*",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species'],
		personality:
			'> This document describes the biology of the werewolf species: morphology, shift classes, blood classification, secondary sex physiology, life cycle, genetics, demographics, and reproduction. All content is strictly biological. Religious interpretations are flagged with "According to the Faith of Fenris..."',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'morphology & shift classes'],
		personality:
			'Transformation is a biological characteristic of the species, independent of rank, religion, or culture. Every werewolf possesses three distinct morphological states.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'morphology & shift classes', 'partial shift'],
		personality:
			'The daily form. A voluntary or emotionally triggered manifestation of lupine traits over the baseline humanoid body.\n\n- Visible features: ears, tail, eyes, teeth, claws.\n- Activation: voluntary or emotional (stress, arousal, aggression).\n- Primary use: communication, intimidation, body language, social signaling.\n- Cognitive capacity: fully human.\n- This is the form most werewolves present in everyday life within their own communities.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'morphology & shift classes',
			'hybrid shift \u2014 species true form',
		],
		personality:
			'The true biological form of the werewolf. The "human" appearance is a mimetic adaptation; the Hybrid is what the species actually is.\n\n- Bipedal digitigrade stance.\n- Full fur coverage matching hair color.\n- Maximum physical strength and sensory acuity.\n- Full cognitive capacity retained.\n- Speech and language fully maintained.\n- This form is used for combat, serious pack business, formal ceremonies, and situations requiring full biological capability.\n\n> **LSE Design Note:** The Hybrid Shift is the _Species True Form_. The humanoid appearance is a survival adaptation for coexistence with humans, not the "default" state.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'morphology & shift classes', 'full shift'],
		personality:
			'The quadrupedal wolf form. A complete transformation into a large wolf.\n\n- Specialized for: hunting, pursuit, long-distance travel, pack combat formations.\n- Cognitive capacity: retained but communication shifts to non-verbal (body language, scent, vocalizations).\n- Physical profile: larger than a natural wolf, size varies by individual and blood classification.\n\n> **LSE Design Note:** Full Shift is **not** inherently "more powerful" than Hybrid Shift. It is _specialized_. A Hybrid fighter in close quarters may outperform a Full Shift wolf, while a Full Shift wolf excels in open terrain pursuit. This avoids the "Full Wolf = Super Saiyan" trope.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'blood classification'],
		personality:
			"Blood Classification is a genetic taxonomy describing an individual's lineage relative to the species' origin. It is immutable and determined by birth.\n\n| Classification | Definition | Characteristics |\n|---|---|---|\n| **Divine Blood** | The Nine Firstborn. According to the Faith of Fenris, created directly by the First Wolf. Recorded History confirms their existence but not the mechanism of their origin. | Biological immortality, extreme regeneration, perfect transformation stability, supreme pheromonal aura, absolute Command. |\n| **Founding Bloodlines** | Direct children and grandchildren of the Firstborn. Founders of the Great Houses. | Exceptionally long lifespan, high genetic stability, strong Command affinity, enhanced regeneration. |\n| **Pureblood Houses** | Multi-generational descendants of Founding Bloodlines. The aristocracy. | Long lifespan, stable genetics, reliable secondary sex expression, strong pack bonds. |\n| **Common Bloodlines** | The majority of the werewolf population. | Standard werewolf biology. Lifespan, strength, and abilities within normal species range. |\n| **Modified Lineages** | Individuals whose genetics have been artificially altered through experimentation, forced transformation, or technological intervention. | Unpredictable traits. May include enhanced abilities, instability, feral tendencies, or shortened lifespan. (e.g., Gamma-7 program subjects.) |\n\n> **Cross-reference:** The historical context of who belongs to each classification \u2014 particularly the Nine Firstborn \u2014 is documented in [LSE_06_History.md](LSE_06_History.md) and [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md).",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'secondary sex physiology'],
		personality:
			'Secondary sex is determined biologically at Presentation (typically around age 13). It is immutable. There are five secondary sexes plus the sacred Enigma caste.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'secondary sex physiology', 'age of maturation'],
		personality:
			'Most individuals present their secondary sex at approximately 13 years of age, entering a maturation period that can last into the late teens or early twenties. After maturation concludes, they are considered full adults.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'secondary sex physiology',
			'\u03b3 gamma \u2014 the third primary gender',
		],
		personality:
			"**Description:** The Gamma is the third primary gender (alongside Male and Female). A Gamma will mature into either a female Alpha/Delta or a male Omega. Pre-presentation, the child's future secondary sex is unknown; most are referred to with pronouns such as Ze, Zer, and Zim until presentation.\n\n**Biology:** A Gamma is born with both sets of genitalia \u2014 a vaginal opening with a penis in place of the clitoris. A Gamma also possesses a uterus, which develops further if they present as Omega, or remains mostly infertile if they present as Alpha.\n\n**Statistics:** 1 in 1,000 births.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'secondary sex physiology',
			'\u2211 enigma \u2014 the sacred caste',
		],
		personality:
			"**Description:** The Enigma is not a standard secondary sex. It is a sacred biological category of extraordinary rarity. Enigmas are the apex of the species' biological potential.\n\nThere are two recognized types:\n\n- **Primordial Enigma:** The Nine Firstborn. Unique beings whose origin, according to the Faith of Fenris, was divine. They cannot be replicated or reproduced. Their biology transcends the normal species parameters.\n- **Ascended Enigma:** Exceptionally rare individuals (~10 in recorded history across two millennia) who present with Enigma-level biological traits despite having no Divine Blood lineage. Their emergence is unpredictable and not fully understood.\n\n**Characteristics:** Mirror Alpha behavior but with superior intensity. Cannot be submitted by any other secondary sex. Can dominate all genders, including Alphas. Possess Command that cannot be resisted by any standard secondary sex. Superior strength, intelligence, and pheromonal presence.\n\n**Biology:** Identical to Alpha biology in structure, but their scent cannot be overridden even by an Omega in heat. They can resist the call of an Omega in heat. An Enigma can impregnate every gender with a reproductive system. The Command of an Enigma cannot be resisted by standard secondary sexes; only a Dominant Omega may resist, depending on willpower.\n\n**Statistics:** An Enigma is born approximately once per generation. Sometimes it skips a generation entirely.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'secondary sex physiology',
			'\u03b1 alpha \u2014 the protector',
		],
		personality:
			"**Description:** In the pack, an Alpha is biologically predisposed to be territorial, protective, and competitive, with highly developed pheromonal presence. However, **Alpha \u2260 Leader**. Being an Alpha does not mean they automatically lead the pack; it simply means they have the biological instincts of a guardian and enforcer. Not all leaders are Alphas, and not all Alphas become leaders.\n\n**Characteristics:** Usually taller, broader, and physically stronger. Aggressive by nature when threatened. Highly territorial. Strong orientation toward leadership or frontline defense. While they can use the _Command_ to influence others, their role in the pack depends entirely on their designated social rank. They can be excellent warriors or protectors while answering to a Beta or Delta Pack Leader.\n\n**Biology:** Alpha scent glands produce aggressive, oppressive pheromones that can control a room of Betas, Deltas, and Omegas. Through scent, they communicate intent and mood. A true Command (combining pheromones, will, and spoken word) forces compliance from Betas and Omegas; Deltas may or may not resist depending on will. Most Alphas are immune to another Alpha's Command.\n\nAn Alpha's penis features the bulbous glandis (knot) at its base, which inflates during intercourse to lock with a partner and maximize conception chances.\n\nAlphas enter rut approximately monthly, lasting 3\u201310 days. During rut, pheromones intensify and behavior becomes more aggressive, but unlike most Omegas, Alphas can generally control their rut without disrupting society.\n\n**Statistics:** 1 in 10 individuals.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'secondary sex physiology',
			'\u03b4 delta \u2014 the engine',
		],
		personality:
			'**Description:** Deltas are the true "engine" of the pack. They patrol, coordinate, assist with pups, teach, mediate, and lead hunts. They are naturally suited for roles such as vice-leader, scout, tactician, field commander, or instructor. They are not simply "weaker Alphas" \u2014 they are the highly coordinated, active core of pack operations.\n\n**Characteristics:** Physically comparable to Alphas. Highly cooperative and strategic. Excel in dynamic environments, bridging the gap between the protective instincts of Alphas and the administrative focus of Betas. Thrive in active duty \u2014 border patrols, coordinated hunts, field operations.\n\n**Biology:** Nearly identical to Alpha biology. The key difference: Deltas are unable to form true Commands.\n\n**Statistics:** 1 in 15 individuals.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'secondary sex physiology',
			'\u03b2 beta \u2014 the social glue',
		],
		personality:
			'**Description:** Betas are the social glue of the pack. They maintain territory, construct, administer, manage resources, cook, raise young, act as artisans, and trade. They are the fundamental workers who allow the pack to function day-to-day.\n\n**Characteristics:** Peaceful, cooperative, highly skilled in specialized areas. Strong communal mentality. Share knowledge and resources to ensure pack stability. An older Beta may serve as Pack Leader due to organizational skills.\n\nBetas are a balance of typical Omega and Alpha instincts (nurture and protection), though their instincts are weaker than either. This balance makes them powerful social adapters \u2014 they can appeal to all secondary sexes because they understand the instincts of both Omegas and Alphas without being dominated by them.\n\n**Biology:** Scent glands at the base of neck and wrists. Beta scent is much more subdued than Alpha, Delta, or Omega. For Betas, primary gender plays a larger biological role than for Alphas or Omegas. Female Betas experience monthly bleeding lasting 3 days to a week.\n\nBetas cannot have naturally occurring heats or ruts but can have medically induced minor cycles (M.I.H./M.I.R.) \u2014 most often used to assist mates during mating cycles.\n\n**Statistics:** 1 in 1,500 individuals.\n\n> **Note:** Betas have their own personal spaces (office, entertainment corner, hammock) rather than dens or nests. They hum softly and sigh deeply when content.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'secondary sex physiology',
			'\u03c9 omega \u2014 the emotional regulator',
		],
		personality:
			'**Description:** Omegas are the crucial emotional regulators of the pack. They possess extremely high empathy, calming pheromones, and a strong instinct to care for others. They create social cohesion and are vital during crises. They are **not** sexually submissive by definition.\n\n**Characteristics:** Physically more agile and softer in appearance. During pack stress or crisis, the Omega reduces tensions, protects pups, and keeps the pack united. Their pheromones soothe aggressive Alphas and Deltas. They serve as the emotional anchor of the family. An elder Omega often acts as primary advisor to the Pack Leader.\n\n**Biology:** Scent glands at the base of neck and wrists. Omega scent is floral, sweet, and highly appealing. Can overpower Beta scents but never Alpha scents unless in heat.\n\nOmegas are very fertile (99% during heat). Before heat, they experience pre-heat (up to a week), during which their scent gradually intensifies and they prepare their nest. Heat lasts 3\u201310 days. During heat, most Omegas are incoherent and driven by breeding instinct \u2014 decisions made during heat are considered non-consensual.\n\nPost-heat, the Omega is tired and sluggish, consuming large meals to rebalance energy.\n\n**Statistics:** 1 in 30 individuals.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'secondary sex physiology', 'subgenders'],
		personality:
			'Both Alpha and Omega have subgender variants that emerge during maturation:\n\n**Alpha Subgenders:**\n- **Dominant Alpha:** A mix of Enigma and standard Alpha traits. More powerful but less likely to find a mate. Overprotective of partners.\n- **Submissive Alpha:** Raised in warm, nurturing environments. Devoted caregivers. Unlikely to be unfaithful. Fiercely protective of children regardless of biological parentage.\n\n**Omega Subgenders:**\n- **Dominant Omega:** The second-rarest rank. Known as "Legend of The Unsubmitted" \u2014 can resist Alpha and Enigma Commands. Only fully submits to their mate (Dominant Alpha or Enigma). Compliance may depend on mood.\n- **Submissive Omega:** Extended heats, more attractive to Alphas, more susceptible to assault. More nurturing and sensitive than standard Omegas. Typically prefers a Dominant Alpha as a consensual partner.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'procreation capability'],
		personality:
			'| Category | Can Impregnate | Can Be Impregnated |\n|---|---|---|\n| Enigmas | \u2713 All genders with reproductive system | \u2717 |\n| Male Alphas | \u2713 | \u2717 |\n| Male Betas / Male Deltas | \u2713 | Only by Enigma |\n| Female Alphas / Male Omegas (Dom/Normal) / Female Deltas | \u2713 | \u2713 |\n| Female Betas / Female Omegas / Submissive Omegas | \u2717 | \u2713 |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'life cycle'],
		personality:
			'Every werewolf passes through the following developmental stages. Each stage affects hormones, social role, fertility, behavior, and physical capability.\n\n| Stage | Approximate Age | Key Characteristics |\n|---|---|---|\n| **Infant** | 0\u20132 | Helpless. Entirely dependent on parents and pack. Strongest scent gland on crown of head. |\n| **Pup** | 2\u201312 | Learning social bonds, language, and basic pack skills. High emotional intelligence. Forms school packs. Constant scenting by parents required. |\n| **Juvenile** | 12\u201314 | Presentation occurs (~13). Secondary sex emerges. Maturation begins. First heat/rut (cannot be suppressed). |\n| **Adolescent** | 14\u201317 | Maturation continues. Subgender expression stabilizes. Training in pack roles begins. |\n| **Young Adult** | 17\u201322 | The Call of the Pack: choose to stay or disperse. First independent pack roles assigned. Courtship begins. |\n| **Adult** | 22\u201340 | Full maturity. Peak fertility. Active profession and pack role. |\n| **Prime** | 40\u201360 | Peak authority and experience. Often in leadership positions. |\n| **Elder** | 60\u2013100+ | Advisor and wisdom-keeper. Reduced fertility. High social respect. |\n| **Ancestor** | 100+ (rare) | Living repositories of history and culture. Venerated by the pack. Extremely rare outside Pureblood and Founding Bloodlines. |\n\n> **Note:** Lifespan varies dramatically by Blood Classification. Common Bloodlines may live 80\u2013150 years. Pureblood Houses can reach 200\u2013400 years. Founding Bloodlines may exceed 500 years. Divine Blood individuals have achieved biological immortality (1,000+ years confirmed).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'genetics'],
		personality:
			'The werewolf genome is organized in layers of increasing specificity:\n\n```\nWerewolf Genome\n\u251c\u2500\u2500 Species Genes        \u2014 Defines the species (shift capability, regeneration, scent glands, pheromone production)\n\u251c\u2500\u2500 Pack Genes           \u2014 Regional/bloodline adaptations (fur color, scent profile, environmental tolerance)\n\u251c\u2500\u2500 Secondary Sex Genes  \u2014 Determines Alpha/Delta/Beta/Omega expression at presentation\n\u2514\u2500\u2500 Individual Traits    \u2014 Unique characteristics (eye color, height, specific talents, personality predispositions)\n```\n\nThis genetic architecture opens the door to:\n- **Mutations:** Rare genetic variations producing unexpected traits.\n- **Bloodline Traits:** Specific abilities or physical characteristics associated with particular Houses.\n- **Genetic Diseases:** Conditions specific to the species.\n- **Hybrids:** Offspring of werewolves with other supernatural species (extremely rare and controversial).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'demographics'],
		personality:
			'| Metric | Value |\n|---|---|\n| Alpha birth rate | 1 in 10 |\n| Delta birth rate | 1 in 15 |\n| Beta birth rate | ~1 in 1,500 |\n| Omega birth rate | 1 in 30 |\n| Enigma birth rate | ~1 per generation (may skip) |\n| Gamma birth rate | 1 in 1,000 |\n| Average litter size | 1\u20133 (up to 12 in classical Omegaverse canon) |\n| Fertility (Omega, in heat) | 99% |\n| Fertility (Alpha) | 95%, declining ~1% per year of age |\n| Omega fertility decline | Significant after age 55 (~1% chance) |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'reproduction', 'heat cycle (omega)'],
		personality:
			'- **Frequency:** Every 3 months.\n- **Duration:** 3\u201310 days.\n- **Pre-heat:** Up to 1 week. Scent intensifies. Nest preparation. Coherent decision-making.\n- **Active Heat:** Incoherent. Driven by breeding instinct. Decisions made during heat are non-consensual.\n- **Post-heat:** Fatigue, increased appetite, energy rebalancing.\n- **Asexual Heats:** Can be satisfied through cuddling, scent proximity, and emotional intimacy without sexual intercourse. Asexuals often lack slick production.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'reproduction', 'rut cycle (alpha)'],
		personality:
			"- **Frequency:** Monthly, or triggered by Omega heat pheromones.\n- **Duration:** 3\u201310 days.\n- **Effects:** Intensified pheromones, increased aggression. Generally controllable without societal disruption.\n- **Detection:** An Alpha in rut can potentially detect an Omega's pregnancy by scenting the neck.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'reproduction', 'sympathy cycles'],
		personality:
			'When a packmate enters heat or rut, same-dynamic packmates may experience sympathy cycles. Common around newly-presenting pups or during stress cycles.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'reproduction', 'stress cycles'],
		personality:
			'Extreme upheaval or stress can trigger an unexpected heat or rut. This is theorized to be a biological mechanism to rally pack support and comfort.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'reproduction', 'feral state'],
		personality:
			'Triggered by life-threatening stress or extreme overwhelm. Instinct takes complete control. Can usually be calmed by a packmate. Packless individuals require specialized care.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'bonding'],
		personality:
			"Bonds are links connecting one individual to another, often involving a physical claim on a scent gland that creates a mental/emotional link where both parties can feel each other's emotions. Bonds can be shielded (temporarily blocking emotional transmission).",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'bonding', 'bond types'],
		personality:
			"| Type | Location | Duration | Breaking |\n|---|---|---|---|\n| **Parental** | Back of pup's neck | Permanent unless extreme abuse/neglect | Dangerous. Very difficult. |\n| **Romantic** | Neck / upper collarbone | Fades after ~3 years without reinforcement | Extremely dangerous. Can cause illness or death. |\n| **Platonic** | Wrists | Fades as relationship weakens | Relatively safe. Minor sickness possible. |\n| **Sexual** | Inner thighs | 3 days to 1 week | Easy. Natural. |\n| **Pack** | No physical claim required | Permanent unless extreme abuse/neglect | Very dangerous. Triggers dangerous mating cycle. |",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'scent glands'],
		personality:
			'Scent glands are skin areas that hold and release pheromone-carrying secretions. Their location, sensitivity, and function vary by secondary sex and age.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'scent glands', 'by secondary sex'],
		personality:
			'**Enigmas & Alphas:** Most extensive coverage. Strongest glands on neck, shoulders, and inner thighs. Also present on fingers and torso (risking accidental scenting). Greatest conscious control over scent output.\n\n**Omegas:** Most sensitive and reactive glands. Billions of nerve connections for instant pheromonal response. Inner thigh and neck glands as sensitive as lips or genitals (depending on cycle stage). Breast and stomach glands develop during pregnancy.\n\n**Deltas & Betas:** Weakest scent glands but hold scents longer. Strongest on neck, inner thighs, and behind ears.\n\n**Pups:** Base-level scent glands that develop at presentation. Strongest gland on crown of head. Cannot hold scent long \u2014 requires constant parental scenting.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['species', 'scent glands', 'specific gland locations'],
		personality:
			'| Location | Social Rules | Notes |\n|---|---|---|\n| **Inner Thighs** | Mates/partners only. Without consent = assault. On pups = criminal. | Can trigger heat/rut if aggressively scented. |\n| **Crown of Head** | "Pup\'s Crown." Most sensitive in childhood, fades with age. | |\n| **Wrists** | Most respectful scenting location. Friends, first dates. | Rubbing wrist glands = anxiety sign. Pack bites placed here. |\n| **Cheeks** | Similar respect level to wrists. Common among pup friends. | Minor scent production. |\n| **Neck** | Most sensitive for all dynamics. Mating bite location. | Holds scent longest. Parental bonds on nape. |\n\n\n*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) \u00b7 [LSE_02_Behavioral_Ecology.md](LSE_02_Behavioral_Ecology.md) \u00b7 [LSE_06_History.md](LSE_06_History.md) \u00b7 [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md)*',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology'],
		personality:
			'> This document covers the psychological, neurobiological, communicative, and ecological behaviors of the werewolf species. It bridges pure biology (PART I) with social civilization (PART III).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'psychology'],
		personality:
			'Each secondary sex exhibits a statistical psychological profile. These are tendencies, not rigid rules. Individual variation is expected and common.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'psychology',
			'alpha \u2014 psychological profile',
		],
		personality:
			'- High competitiveness\n- Low avoidance (confronts threats directly)\n- Strong territoriality\n- Protective instinct (defense of pack and territory)\n- Tendency toward decisive, rapid action\n- Risk of tunnel vision under stress',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'psychology',
			'delta \u2014 psychological profile',
		],
		personality:
			'- High cooperation\n- Strong problem-solving orientation\n- High initiative and proactivity\n- Strategic thinking (long-term planning)\n- Natural mediator tendencies\n- Risk of burnout from overcommitment',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'psychology',
			'beta \u2014 psychological profile',
		],
		personality:
			'- High stability and emotional regulation\n- Strong planning and organizational skills\n- Patience and methodical approach\n- Social adaptability (can relate to all secondary sexes)\n- Dual instinct (nurture + protection) can cause internal conflict\n- Risk of substance abuse from overstimulation in mixed-dynamic environments',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'psychology',
			'omega \u2014 psychological profile',
		],
		personality:
			'- Extremely high empathy\n- Strong social resilience\n- Natural mediator and de-escalator\n- Acute emotional intelligence (even in pups)\n- Instinctive caretaking response\n- Risk of emotional overload in chronic stress environments',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'psychology',
			'enigma \u2014 psychological profile',
		],
		personality:
			'- Supreme confidence and self-possession\n- Cannot be psychologically dominated\n- Intense charisma (nearly impossible to resist)\n- Strategic intelligence\n- Risk of isolation due to inability to relate as equals',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'neurobiology'],
		personality:
			'The werewolf nervous system provides a scientific basis for the species\' distinctive traits. The supernatural "tropes" of the Omegaverse are grounded in neurochemistry, not magic.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'neurobiology', 'pheromone pathway'],
		personality:
			'Pheromones produced by scent glands activate a dedicated neural pathway:\n\n```\nScent Gland \u2192 Pheromone Release \u2192 Vomeronasal Organ (receiver) \u2192 Amygdala \u2192 Hypothalamus \u2192 Limbic System\n```\n\nThis pathway triggers:\n- **Emotional responses:** Fear, arousal, trust, aggression.\n- **Hormonal cascades:** Cortisol, adrenaline, oxytocin, testosterone.\n- **Behavioral changes:** Fight/flight/freeze, bonding, nesting, protective aggression.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'neurobiology',
			'the command \u2014 neurochemical mechanism',
		],
		personality:
			"The Command is not magic or mind control. It is a neuro-pheromonal reflex:\n\n1. **Trigger:** An Alpha (or Enigma) produces a concentrated pheromonal burst combined with a vocal command.\n2. **Reception:** The target's vomeronasal organ detects the pheromonal spike.\n3. **Neural Response:** Sudden adrenaline surge \u2192 amygdala activation \u2192 instinctive immobilization (freeze response) \u2192 intense focus on the source.\n4. **Effect:** Strong predisposition to comply. The target feels compelled but is not mechanically forced.\n5. **Resistance Factors:**\n   - Age and experience (older wolves resist more easily)\n   - Secondary sex (Deltas resist better than Betas; Dominant Omegas can resist fully)\n   - Will and training\n   - Familiarity with the commanding individual\n   - Enigma Commands are the hardest to resist",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'neurobiology', 'bonding neuroscience'],
		personality:
			'The mating bite creates a permanent neural link by:\n1. Injecting pheromone-laden saliva into the scent gland.\n2. Triggering the formation of a dedicated neural pathway between the two individuals.\n3. Establishing a bidirectional emotional channel (can be temporarily "shielded" with conscious effort).\n\nBond degradation (fade, scrubbing, or breaking) causes neurological distress proportional to bond strength and duration.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'communication'],
		personality:
			'Werewolves possess a complex, multi-layered communication system far beyond human language. In wolf ethology, communication involves the entire body.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'communication', 'non-verbal channels'],
		personality:
			'| Channel | Examples | Function |\n|---|---|---|\n| **Posture** | Upright (dominance), lowered (submission), stiff (alert), relaxed (trust) | Social status signaling, intent |\n| **Tail** | High (confidence), tucked (fear), wagging (excitement), still (focus) | Emotional state |\n| **Ears** | Forward (attention), flat (fear/aggression), relaxed (comfort) | Alertness, mood |\n| **Eyes** | Direct stare (challenge/dominance), averted (respect/submission), dilated (arousal) | Social hierarchy, emotional state |\n| **Scent** | Pheromone composition changes with mood, health, and intent | Continuous passive communication |\n| **Physical Contact** | Nuzzling, grooming, scenting, nudging, play-fighting | Bonding, reassurance, hierarchy |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'communication', 'vocalizations'],
		personality:
			'**Omega Sounds:**\n- **Keening:** Wail-like call for attention, comfort, or needs. "I\'m upset! Comfort me!"\n- **Hissing:** Low "s" sound. Warning of extreme danger. "Back off or I attack."\n- **Trilling:** High-pitched rolling "r" sound. Non-threatening attention-getting. "Hello! Follow me!"\n- **Purring:** Low continuous vibration. Contentment, relaxation, self-soothing, nursing.\n- **Chirping:** Quick sharp high-pitched sound. Used toward pups or to express happiness. "Come to Mom!" / "I like this!"\n- **Mewling:** High-pitched crying. Hunger, physical pain, emotional pain.\n\n**Alpha/Enigma Sounds:**\n- **Rumbling:** Deep continuous sound. Self-soothing, contentment, calming others.\n- **Growling:** Low guttural sound. Displeasure, warning, danger. Also disciplinary toward packmates.\n- **Crooning:** Soft low hum. Directed at pups or distressed individuals. Soothing and safe.\n- **Chuffing:** Puffing sound. Greeting for trusted packmates. "Hello! You are my person!" Only used with individuals the Alpha feels completely comfortable with.\n\n**Betas & Deltas:** Can produce a variable subset of both Alpha and Omega sounds, differing from individual to individual.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'pack ecology', 'territory structure'],
		personality:
			'Every pack maintains a defined territorial structure:\n\n```\nCore Den (secure heart \u2014 pups, pregnant Omegas, elders)\n  \u2514\u2500\u2500 Residential Area (pack member dwellings)\n       \u2514\u2500\u2500 Training Grounds (combat, hunting, skill development)\n            \u2514\u2500\u2500 Hunting Area (food procurement zones)\n                 \u2514\u2500\u2500 Agricultural Area (cultivated resources, if applicable)\n                      \u2514\u2500\u2500 Border Zone (patrolled perimeter)\n                           \u2514\u2500\u2500 Neutral Territory (shared or unclaimed land)\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'pack ecology', 'daily routine'],
		personality:
			'| Time | Activity |\n|---|---|\n| Morning | Territory control, border patrols, perimeter inspection |\n| Midday | Rest, social bonding, pup education, maintenance |\n| Evening | Hunting, foraging, resource gathering |\n| Night | Protection, perimeter defense, sentry duty |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'pack ecology',
			'pack living accommodations',
		],
		personality:
			'Pack members prefer to live within close proximity (ideally within a mile of each other or in the same residence). Common dwelling types for larger packs:\n- **Mansions** \u2014 Large shared family dwellings.\n- **Neighborhoods** \u2014 Clusters of adjacent houses occupied by pack members.\n- **Apartment Complexes** \u2014 Urban adaptation for city-dwelling packs.\n- **Compounds** \u2014 Walled communities with multiple structures (common in traditional/rural packs).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'alloparenting'],
		personality:
			"Pups are not raised solely by their biological parents. The entire pack participates in _alloparenting_:\n\n- **Alpha:** Protects pups from external threats.\n- **Delta:** Teaches pups hunting, tactics, and survival skills.\n- **Beta:** Feeds, provisions, and manages pups' daily needs.\n- **Omega:** Nurtures pups emotionally, regulates their stress, provides calming pheromones.\n- **Elders:** Pass down pack culture, history, oral tradition, and wisdom.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'succession: the call of the pack'],
		personality:
			'Instead of brutal fights for hierarchical dominance, succession follows natural ethological patterns. When a young adult reaches 18\u201322 years of age, they experience the **Call of the Pack** \u2014 an instinctive drive to establish their adult identity:\n\n1. **Stay:** Remain with their birth family and assume an adult Pack Role.\n2. **Disperse:** Leave the territory to find a mate, join other dispersers, or found a brand-new pack.\n\nThis natural dispersal (Pack Split) prevents inbreeding and naturally resolves resource competition without unnecessary bloodshed. It is the primary mechanism for the expansion of werewolf civilization.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'ecological roles'],
		personality:
			'Every functional pack requires individuals filling essential ecological roles. These are distinct from Pack Roles (authority-based) and Professions (occupation-based):\n\n| Ecological Role | Function | Typical (not required) Secondary Sex |\n|---|---|---|\n| Breeders | Producing the next generation | Any fertile individual |\n| Hunters | Food procurement and territory defense | Alpha, Delta |\n| Defenders | Perimeter security and threat response | Alpha, Delta |\n| Teachers | Educating pups and juveniles | Delta, Beta, Elder |\n| Diplomats | Inter-pack relations and negotiations | Beta, Omega |\n| Scouts | Reconnaissance, pathfinding, intelligence | Delta |\n| Builders | Construction, maintenance, infrastructure | Beta |\n| Caretakers | Nurturing, emotional support, medical aid | Omega, Beta |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'nesting & den behavior', 'omega nests'],
		personality:
			"Nests are safe, scent-rich spaces that Omegas construct for comfort, heat management, and childbirth.\n\n**Nest Types:**\n- **Comfort Nest:** First type (age 10\u201312). Personal, similar to parents' nest. Pillows, blankets, scented clothing.\n- **Pre-Heat Nest:** Built in preparation for heat. Minimal clothing, soft materials, temperature-regulating.\n- **Pregnancy Nest:** Built at 6\u20138 weeks and again in the last trimester. Accommodates baby items for scenting. Many Omegas give birth in their nests.\n- **Stress Nest:** Built in dark corners or enclosed spaces. Minimal non-mate-scented items. A coping mechanism.\n\n**Nest Aesthetics:**\n- **Neat:** Organized. Primarily pillows and blankets.\n- **Complex/Messy:** Excess materials, personal belongings, stuffed animals. Appears chaotic.\n- **Princess:** Modern style with fairy lights, drapes, and tapestries.\n- **Ring:** Built in small enclosed spaces (closets, under staircases).\n\n> **Critical Rule:** Never destroy a nest. The Omega will be deeply distressed and may not leave for 3 days to a full week. A nest is their safety.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'nesting & den behavior', 'alpha dens'],
		personality:
			"Alphas create dens by heavily scent-marking a room, claiming it as their territory. They are highly protective of their dens.\n\n- **Pre-rut:** Every inch must smell like them.\n- **Courting:** Presenting a den to an Omega is a significant courting gesture. If the Omega approves, they accept the courtship. Rejection causes shame and redecoration.\n- **Mated pair:** The Omega moves their nest into the Alpha's den.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'nesting & den behavior', 'beta spaces'],
		personality:
			'Betas create personal "spaces" rather than dens or nests \u2014 an office, entertainment corner, hammock, personal swing. These reflect their balanced, adaptable nature.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['behavioral ecology', 'scent reference lists'],
		personality:
			'Scents are not rigidly tied to secondary sex. The following are common associations:',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'scent reference lists',
			'alpha/enigma scent palette',
		],
		personality:
			'Mustard, Peppermint, Whiskey, Dark Chocolate, Stale Wine, Root Beer, Fresh Coffee, Green Tea, Barbecue Sauce, Pepper, Tequila, Red Wine, Vodka, Ginger, Black Tea, Maple Syrup, Coconut, Cedarwood, Seawater, Amber, Forest, Roses, Fresh Blood, Leather, Coal, Mahogany, Charcoal, Gasoline, Gunpowder, Hot Iron, Old Paper.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'scent reference lists',
			'delta/beta scent palette',
		],
		personality:
			'Mochi, Green Apples, Pumpkin, Rice, Honey, Toffee, Flour, Champagne, Fresh Bread, Almond, Brown Sugar, Grapes, Milk, Hazelnuts, Banana, Orange, Peanut Butter, Silver, Earth, Freshly-Cut Grass, Oil, Clay, Fresh Rain, Lilies, Ice, Sand, Fresh Ink, Soap, Cotton, Fresh Laundry.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'behavioral ecology',
			'scent reference lists',
			'omega scent palette',
		],
		personality:
			"Burnt Sugar, Lemons, Pi\u00f1a Colada, Bubblegum, Cr\u00e8me Br\u00fbl\u00e9e, White Chocolate, Sugar, Cinnamon, Whipped Cream, Cotton Candy, Strawberries, Peaches, Mint, Caramel, Raspberry Jam, Cherry Blossoms, Lavender, Tulips, Daisies, Lip Gloss.\n\n> **Note:** A person's scent also depends on their environment and personal preferences.\n\n\n*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) \u00b7 [LSE_01_Species.md](LSE_01_Species.md) \u00b7 [LSE_03_Civilization.md](LSE_03_Civilization.md)*",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization'],
		personality:
			'> This document describes the social structures, culture, economy, medicine, and education of werewolf civilization. It establishes the Social Hierarchy and the distinction between Bloodline, House, Pack, Family, and Individual.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'social hierarchy'],
		personality:
			'Werewolf society is organized in nested layers, from the species level down to the individual:\n\n```\nSpecies (Werewolf)\n  \u2514\u2500\u2500 Bloodline (Genetics \u2014 e.g., Bloodmoon)\n       \u2514\u2500\u2500 House (Politics \u2014 e.g., House Bloodmoon)\n            \u2514\u2500\u2500 Pack (Social Unit \u2014 e.g., Seven Hills Pack)\n                 \u2514\u2500\u2500 Family (Kinship \u2014 e.g., the Douglas-Bloodmoon family)\n                      \u2514\u2500\u2500 Individual (e.g., Alyssa Douglas-Bloodmoon)\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'civilization',
			'social hierarchy',
			'bloodline vs. house vs. pack',
		],
		personality:
			'| Level | Determined by | Function | Example |\n|---|---|---|---|\n| **Bloodline** | Genetics | Shared ancestry and biological heritage | Bloodmoon Bloodline |\n| **House** | Politics | Governance structure, territorial claims, alliances | House Bloodmoon |\n| **Pack** | Social bonds | Day-to-day family unit, shared living, mutual care | Seven Hills Pack |\n\nThese three levels are **independent**. A pack may include members of different bloodlines. A House may govern multiple packs. A bloodline may span multiple Houses across continents.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'culture'],
		personality:
			'No two packs are identical. Local environment, history, and tradition create distinct pack cultures (LSE Principle V: Culture Evolves).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'culture', 'cultural variables'],
		personality:
			'Every pack develops its own:\n- **Rituals:** Naming ceremonies, coming-of-age rites, seasonal celebrations.\n- **Greetings & Customs:** Formal scenting protocols, challenge rituals, hospitality rules.\n- **Traditions:** Oral histories, ancestral stories, founding myths.\n- **Cuisine:** Regional diet reflecting local ecology (hunting traditions, agriculture, foraging).\n- **Festivals & Holy Days:** Tied to moon cycles, seasonal changes, or historical events.\n- **Dialects & Language:** Variations in both verbal and non-verbal communication.\n- **Symbols & Heraldry:** House sigils, pack marks, territorial markers.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'civilization',
			'culture',
			'example: bloodmoon culture (pacific northwest)',
		],
		personality:
			'```\nBloodmoon Culture\n\u251c\u2500\u2500 Region: Pacific Northwest (dense forests, rivers, coastline)\n\u251c\u2500\u2500 Economy: Fishing, forestry, modern corporate (DCC)\n\u251c\u2500\u2500 Architecture: Longhouse-inspired compounds, modern mansions\n\u251c\u2500\u2500 Governance: Clan Council tradition\n\u251c\u2500\u2500 Religion: Orthodox Faith of Fenris (the Patriarch is a Living Saga)\n\u251c\u2500\u2500 Cuisine: Salmon, game, berries, root vegetables\n\u2514\u2500\u2500 Identity: Deep connection to wilderness, emphasis on self-sufficiency\n```\n\nOther packs in different environments would develop entirely different cultures.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'types of packs'],
		personality: 'Pack structure has evolved significantly over time:',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'types of packs', 'traditional packs'],
		personality:
			'Your pack is your tribe, your town, your community. Packs have geographical permanence. There is one main pack leader with several subordinate pack leaders (feudalism-like branches). Everyone belongs to a pack; being packless is dangerous. Packs are extremely territorial.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'types of packs', 'contemporary packs'],
		personality:
			'Packs remain communities but lose the feudalism element. Being packless carries less stigma. Hereditary pack ties function like cultural heritage rather than active governance. New packs form as found families or communities, often without formal structure.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'types of packs', 'modern packs'],
		personality:
			'Traditional pack language is considered antiquated. Active pack membership is associated with conservatism or elitism. Closed-pack lands are rare and completely sealed. The word "pack" is used informally to describe friend groups or found families.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'economy', 'pack economy'],
		personality:
			'Every functional pack operates a micro-economy:\n\n```\nPack Treasury\n\u251c\u2500\u2500 Pack Businesses (revenue-generating enterprises)\n\u251c\u2500\u2500 Pack Taxes (contributions from members)\n\u251c\u2500\u2500 Pack Assets (territory, property, equipment, reserves)\n\u2514\u2500\u2500 Pack Welfare (support for pups, elders, injured members)\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'economy', 'inter-pack economy'],
		personality:
			'Houses and Confederations operate larger economies spanning multiple packs, involving:\n- Trade agreements\n- Resource sharing treaties\n- Territorial leasing\n- Corporate ventures (modern era)',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'medicine'],
		personality:
			"Werewolf medicine addresses species-specific biological needs:\n\n| Treatment | Function |\n|---|---|\n| **Heat Medicine** | Managing Omega heat cycles \u2014 reducing intensity, managing symptoms |\n| **Rut Suppressants** | Controlling Alpha rut cycles |\n| **Pheromone Blockers** | Scent patches and concealers (light and full dose) |\n| **Bond Therapy** | Treating bond degradation, scrubbing trauma, and broken marks |\n| **Regeneration Medicine** | Accelerating the species' natural healing factor |\n| **Surgical Intervention** | Species-specific procedures (scent gland surgery, reproductive medicine) |\n| **Omega Kibble** | Strongly medicated supplement for extreme Omega distress (max once/week) |\n| **M.I.H./M.I.R.** | Medically Induced Heat/Rut for Betas assisting mates |\n| **Fertility Treatment** | Managing the species' unique reproductive biology |",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'medicine', 'suppressant forms'],
		personality:
			'| Form | Use Case | Limitations |\n|---|---|---|\n| **Tablets** | Standard daily management | Addiction risk. Potential fertility damage with overuse. |\n| **Liquid Injection** | Emergency use (hospitals). Very fast-acting. | Monitored administration only. |\n| **Incense** | Group management (dormitories, harems). Slow-acting, long-lasting. | Unpredictable timing of next heat. Not all Omegas respond equally. |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'civilization',
			'medicine',
			'pain scale for omegas (most to least painful)',
		],
		personality:
			'1. **Red Heat (Blood Estrus):** Mate neglects Omega during heat. Vaginal bleeding, blood tears. Excruciating.\n2. **Scrubbing:** Removing a mating mark from the scent gland. Deeply traumatic.\n3. **Broken Mark:** Mate dies. Mark fades. Can trigger Red Heat or miscarriage.\n4. **Miscarriage:** Body pretends pregnancy continues (phantom pregnancy, lactation). Heats become more painful.\n5. **Periods:** Variable severity (female Omegas).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'education'],
		personality:
			'Werewolf education follows the Life Cycle stages:\n\n| Stage | Education Focus |\n|---|---|\n| **Pup** | Basic social bonds, pack rules, language, scenting etiquette |\n| **Juvenile** | Presentation preparation, first pack duties, secondary sex education |\n| **Adolescent** | Specialized training (hunting, crafts, academics), subgender management |\n| **Young Adult** | Advanced profession training, courtship education, The Call preparation |\n| **Adult** | Continuing profession development, mentorship of younger members |\n| **Elder** | Wisdom-keeping, cultural transmission, advisory roles |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'adoption'],
		personality:
			'Adoption in werewolf society is complex due to the bonding system. Three types exist:',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'adoption', 'bonding adoption'],
		personality:
			'The minor breaks their existing familial bond and is adopted by a new pack through demonstrated reciprocal pack bonds. Requires:\n1. Reciprocated pack bond with at least two non-minor pack members.\n2. Two-week accommodation check-in by state official (home inspection, proof of settlement, witnessed interaction).\n3. Unanimous pack agreement.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'adoption', 'state adoption'],
		personality:
			'The minor enters foster care and is adopted through formal legal process. Less demanding than bonding adoption:\n- No immediate bond required.\n- Two-month adjustment period.\n- Legal paperwork emphasis over bond demonstration.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'adoption', 'secondary adoption'],
		personality:
			'A second chance after failed bonding adoption. More rigorous:\n- Surprise check-ins every three weeks for six months.\n- Community involvement proof (age 15+).\n- Extended witnessed interaction demonstrating consistent pack belonging.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'parental names'],
		personality:
			'Parental names can follow primary gender or secondary gender conventions:\n\n| Convention | Father | Mother | Formal |\n|---|---|---|---|\n| **Primary Gender** | Dad | Mom | Father / Mother |\n| **Secondary Gender** | Dad (Alpha/Enigma/Male Beta/Delta) | Mom (Omega/Female Beta/Delta) | Sire / Dam |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['civilization', 'weddings'],
		personality:
			'Wedding attire follows secondary gender color traditions:\n- **Alphas & Enigmas:** Red (luck, stability, passion)\n- **Deltas & Betas:** Blue (wealth, loyalty, honor)\n- **Omegas:** Yellow (pride, happiness, longevity)\n\n\n*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) \u00b7 [LSE_01_Species.md](LSE_01_Species.md) \u00b7 [LSE_04_Governance.md](LSE_04_Governance.md) \u00b7 [LSE_05_Religion.md](LSE_05_Religion.md)*',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance'],
		personality:
			'> This document describes the political structures, authority systems, and legal frameworks of werewolf civilization \u2014 from the internal governance of a single pack to inter-House diplomacy.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'pack authority structure'],
		personality:
			"Pack Authority defines the chain of command within a single pack. It is earned, assigned, and maintained through trust and competence \u2014 not through biological secondary sex (LSE Principle III).\n\n```\nPack Leader\n  \u2514\u2500\u2500 Leader's Mate / Pack Mom\n       \u2514\u2500\u2500 Right Hand(s) (strategic advisors, peacekeepers)\n            \u2514\u2500\u2500 Left Hand(s) (physical protection, enforcement)\n                 \u2514\u2500\u2500 Caretaker(s) (domestic management, pup care)\n                      \u2514\u2500\u2500 Pup(s) (minors under protection)\n```",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'pack authority structure', 'pack leader'],
		personality:
			"At the top of the pack's chain of command. Responsible for overall safety, well-being, and final decisions. **Does not need to be an Alpha** \u2014 can be any secondary sex.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'governance',
			'pack authority structure',
			"leader's mate / pack mom",
		],
		personality:
			'The mother figure for the entire pack. Provides guidance, emotional comfort, and protection. Heavily involved in daily operations. Extremely valuable in larger packs.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'pack authority structure', 'right hand(s)'],
		personality:
			"The leader's most trusted advisor(s). Takes over if the leader is incapacitated. Assists in strategic decisions (finances, education, logistics). May include **Peacekeepers** \u2014 specialists who settle internal arguments before they reach the Pack Leader.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'pack authority structure', 'left hand(s)'],
		personality:
			'Responsible for physical protection and enforcement. Notoriously effective in combat. Uncommon in average packs but prevalent in packs involved in security, military, or criminal operations.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'pack authority structure', 'caretaker(s)'],
		personality:
			'Work under the Pack Mom. Usually stay-at-home members. Handle meals, cleaning, socialization, pup management. Young adults aging out of "pup" status often serve as caretakers to learn pack management.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'pack authority structure', 'pup(s)'],
		personality:
			'Pack members under 17\u201321 (varies by pack). At the bottom of the authority structure. Protected and nurtured.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'social status hierarchy'],
		personality:
			'Social Status defines political standing within a Noble House. It is separate from Pack Authority and may be inherited or earned.\n\n```\nHouse Head (Patriarch/Matriarch)\n  \u2514\u2500\u2500 Lord (senior family branch leaders)\n       \u2514\u2500\u2500 Knight (sworn warriors, officers, honored servants)\n            \u2514\u2500\u2500 Citizen (acknowledged member of the House)\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'social status hierarchy', 'house head'],
		personality:
			'The supreme authority of a Noble House. Governs multiple packs under the House banner. Typically the eldest or most qualified member of the founding family. In some Houses, this position is hereditary; in others, it is contested through council vote.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'social status hierarchy', 'lord'],
		personality:
			'Leaders of major family branches within the House. Govern specific territories or functional domains (military, commerce, diplomacy). Answer to the House Head.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'social status hierarchy', 'knight'],
		personality:
			'Sworn warriors, officers, or individuals who have earned formal recognition from the House. May hold specific duties (border defense, diplomatic escort, judicial enforcement). Title may be hereditary or awarded.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'social status hierarchy', 'citizen'],
		personality:
			'Any acknowledged member of the House who is not an officer, lord, or sworn knight. Includes common bloodlines under House protection.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'house government'],
		personality:
			'A Noble House governs multiple packs across a territory:\n\n```\nHouse Head\n\u251c\u2500\u2500 House Council (Lords + senior advisors)\n\u251c\u2500\u2500 Military Command (Left Hands, Knights, Security)\n\u251c\u2500\u2500 Economic Administration (Treasury, Businesses, Trade)\n\u251c\u2500\u2500 Cultural Authority (Moon Speakers, Keepers, Elders)\n\u2514\u2500\u2500 Pack Leaders (individual pack governance)\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'house government', 'house council'],
		personality:
			'Composed of Lords, senior Elders, and trusted advisors. Advises the House Head on major decisions. In some Houses, the Council can overrule the Head on specific matters (treaties, declarations of war).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'continental council'],
		personality:
			'The highest level of werewolf governance. A diplomatic body representing multiple Houses across a continent or major region.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'continental council', 'structure'],
		personality:
			'```\nContinental Council\n\u251c\u2500\u2500 House Representatives (one per House)\n\u251c\u2500\u2500 Elder Observers (non-voting wisdom-keepers)\n\u251c\u2500\u2500 Moon Speaker Delegation (religious advisors)\n\u2514\u2500\u2500 Independent Pack Representatives (unaffiliated packs)\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'continental council', 'functions'],
		personality:
			'- Arbitration of inter-House disputes\n- Continental defense coordination\n- Trade and territory agreements\n- Species-wide policy (secrecy enforcement, human relations)\n- Recognition of new Houses and territorial claims',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'treaties & alliances'],
		personality:
			'Inter-pack and inter-House relationships are formalized through treaties:\n\n| Treaty Type | Function |\n|---|---|\n| **Alliance** | Mutual defense and cooperation between Houses |\n| **Trade Agreement** | Resource and economic exchange |\n| **Territorial Accord** | Formal recognition of borders and neutral zones |\n| **Marriage Alliance** | Dynastic unions between Houses (political bonding) |\n| **Non-Aggression Pact** | Agreement not to engage in hostile action |\n| **Protectorate** | A powerful House extends protection to a smaller pack or House |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'laws & jurisdiction', 'pack law (internal)'],
		personality:
			'Enforced by the Pack Leader and Right/Left Hands. Covers:\n- Internal disputes between pack members\n- Nesting and den violations\n- Assault and consent violations (including scenting crimes)\n- Pup welfare\n- Heat/rut-related offenses',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'laws & jurisdiction', 'house law (regional)'],
		personality:
			'Enforced by the House Head and House Council. Covers:\n- Inter-pack disputes within the House\n- Territorial violations\n- Economic crimes (theft of House assets, tax evasion)\n- Treason against the House',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'governance',
			'laws & jurisdiction',
			'continental law (species-wide)',
		],
		personality:
			'Enforced by the Continental Council. Covers:\n- Inter-House warfare and violations\n- Species-wide secrecy from humans\n- Crimes against the species (genocide, forced modification)\n- Recognition and dissolution of Houses',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'laws & jurisdiction', 'crimes & punishments'],
		personality:
			'| Crime | Jurisdiction | Typical Punishment |\n|---|---|---|\n| Non-consensual scenting (minor) | Pack | Public reprimand, temporary exile |\n| Non-consensual scenting (pup inner thighs) | Pack/House | Classified as rape. Severe punishment. |\n| Nest/Den destruction | Pack | Severe social censure, mandatory restitution |\n| Pack betrayal | Pack/House | Exile (breaking of all pack bonds) |\n| Non-consensual mating during heat | Pack/House | Criminal prosecution. Exile or execution. |\n| Treason against House | House | Exile, stripping of status, execution |\n| Violation of secrecy | Continental | Continental Council judgment |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'laws & jurisdiction', 'exile'],
		personality:
			'Exile is the ultimate social punishment. The exiled individual has all pack bonds forcibly broken (causing severe physical and psychological trauma). They become a Rogue \u2014 packless, unprotected, and distrusted by all organized packs.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['governance', 'laws & jurisdiction', 'adoption & transfer'],
		personality:
			'- **Adoption:** See [LSE_03_Civilization.md](LSE_03_Civilization.md) for the three adoption types.\n- **Transfer:** A pack member may petition to transfer to a different pack within the same House. Requires approval from both Pack Leaders and the House Council. Transfer between Houses requires Continental Council acknowledgment.\n\n\n*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) \u00b7 [LSE_03_Civilization.md](LSE_03_Civilization.md) \u00b7 [LSE_05_Religion.md](LSE_05_Religion.md) \u00b7 [LSE_06_History.md](LSE_06_History.md)*',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion'],
		personality:
			'> This document describes the Faith of Fenris and its institutional structures. All content in this module represents **Religious Canon** (see LSE_00_Foundations.md, Three Levels of Truth). Historical facts about the figures referenced here are in LSE_06_History.md and LSE_07_Foundational_Figures.md.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'the faith of fenris', 'dogma'],
		personality:
			'For werewolves, **Fenris (Fenrir)** is not a monster.\n\nHe is the **First Wolf**, the Father of the Species, and a primordial deity \u2014 coeval with the \u00c6sir or perhaps even older. He is the god of:\n\n- Family\n- The Pack\n- The Hunt\n- Survival\n- Freedom\n- The Moon\n- Instinct\n- Sacrifice\n\nHumans remember Fenris as a monster because they wrote history from the perspective of the \u00c6sir. The werewolves tell the story from the perspective of their own people.\n\n> **Critical distinction:** Fenris is **not** the son of Loki. That is the human version, designed to delegitimize the First Wolf after the Great Betrayal. In werewolf theology, Fenris is an independent, primordial being.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'the faith of fenris', 'the great betrayal'],
		personality:
			"The werewolf account of the binding of Fenris:\n\nFenris was the most faithful warrior of the gods. But as his people \u2014 the werewolves \u2014 grew in number and strength, the \u00c6sir began to fear them.\n\nTo prevent the werewolves from becoming too powerful:\n- They **chained** Fenris.\n- They **persecuted** his children.\n- They **erased** the true history, replacing it with tales of a monstrous wolf.\n\nFrom this betrayal arose the werewolves' ancestral hatred of tyranny and their absolute devotion to the value of **freedom**.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'religion',
			'the faith of fenris',
			'ragnar\u00f6k \u2014 the liberation',
		],
		personality:
			'For humans: *Fenris devours Odin. The world ends.*\n\nFor werewolves: *Fenris breaks his chains and restores freedom to his children.*\n\nRagnar\u00f6k is not the apocalypse. It is the **Liberation of the First Wolf** \u2014 the prophesied day when the species will no longer need to hide, when the Great Betrayal will be undone, and when the Children of Fenris will walk freely again.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'the pantheon'],
		personality:
			'The gods of the Norse tradition are reinterpreted through the werewolf perspective. The \u00c6sir are not "evil" \u2014 they simply belong to a different tradition.\n\n| Deity | Werewolf Interpretation |\n|---|---|\n| **Fenris** | The First Wolf. Father of the Species. Creator (Religious Canon). Primordial deity. |\n| **Odin** | The Betrayer. The one who chained Fenris out of fear. Respected for his wisdom but distrusted for his treachery. |\n| **Tyr** | The Oathkeeper. The only \u00c6sir who kept his word to Fenris. Respected for the sacrifice of his hand. Patron of honor and sworn oaths. |\n| **Freya** | Goddess of fertility, motherhood, and the Moon. Protector of Omegas and pregnant wolves. |\n| **Skadi** | Patroness of hunters and mountains. Revered by scouts, rangers, and wilderness packs. |\n| **Thor** | Champion of humans and the \u00c6sir. Not necessarily malevolent \u2014 simply the defender of a different people. |\n| **Hel** | Keeper of the Ancestors. Guardian of the dead. Honored during funerals and Ancestor rites. |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'the nine precepts of fenris'],
		personality:
			'The core moral code of the Faith. Note that nearly every precept derives from real wolf behavior:\n\n1. **Protect the Pack.**\n2. **Defend the Pups.**\n3. **Honor the Ancestors.**\n4. **Do not hunt without purpose.**\n5. **Keep your word.**\n6. **Never abandon a companion.**\n7. **Respect the territory of others.**\n8. **Face the enemy without fear.**\n9. **Live free.**',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'the moon'],
		personality:
			'The Moon is not a goddess in the Faith of Fenris. It is the **Symbol of the Pact** \u2014 the bond between Fenris and his children. The Moon witnesses all oaths, hunts, and rites.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'the moon', 'moon phases & meaning'],
		personality:
			'| Phase | Symbol | Meaning |\n|---|---|---|\n| \ud83c\udf11 New Moon | Silence | Reflection, mourning, rest. No hunts. |\n| \ud83c\udf13 First Quarter | Growth | New beginnings, pup naming, planting. |\n| \ud83c\udf15 Full Moon | The Hunt | Peak activity. Sacred hunts, major ceremonies, bonding rites. |\n| \ud83c\udf18 Waning Moon | Memory | Remembrance of ancestors, oral history, meditation. |\n\nThe religious calendar follows the **lunar cycle** rather than the solar calendar.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'the cult of the living sagas'],
		personality:
			"The Last Three Firstborn \u2014 Wulfnic, Ut, and Zefir \u2014 are alive. Their historical existence is documented in [LSE_06_History.md](LSE_06_History.md). Their biographies are in [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md).\n\nIn the Faith of Fenris, they are revered as **Living Sagas** \u2014 saints who walked with the First Wolf and still walk among his children. Their authority carries religious weight:\n\n- Disobeying a Living Saga is not merely political insubordination \u2014 it is, to the faithful, a rejection of Fenris' chosen instruments.\n- Their testimony about the past is considered second only to scripture, because **they were there**.\n- Moon Speakers often consult them as the closest living link to the will of Fenris.\n\n> **LSE Design Note:** The Living Sagas *exist* (History). They are *revered* (Religion). These are two separate truths. An atheist werewolf might acknowledge Wulfnic's political authority while rejecting his divine mandate.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'religious institutions'],
		personality:
			'The Faith of Fenris is **not** a centralized religion like Catholicism. It is a decentralized network of communities guided by elders and tradition-keepers.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'religious institutions', 'hierarchy'],
		personality:
			'```\nHigh Fang (Supreme spiritual authority \u2014 extremely rare, often unfilled)\n  \u2514\u2500\u2500 Moon Speakers (Priests / theologians / ceremony leaders)\n       \u2514\u2500\u2500 Keepers (Custodians of relics, sacred sites, and oral tradition)\n            \u2514\u2500\u2500 Pack Elders (Local spiritual guides within each pack)\n                 \u2514\u2500\u2500 The Faithful (All believing werewolves)\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'religious institutions', 'high fang'],
		personality:
			'The supreme spiritual authority of the Faith. This position is often unfilled for decades or centuries, as it requires recognition by a supermajority of Moon Speakers across multiple continents. The High Fang speaks for the Faith on species-wide matters.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'religious institutions', 'moon speakers'],
		personality:
			'Priests and theologians. They lead ceremonies, interpret the Precepts, maintain the lunar calendar, and serve as spiritual advisors to Pack Leaders and House Heads. A Moon Speaker is trained through apprenticeship, not ordination.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'religious institutions', 'keepers'],
		personality:
			'Custodians of physical relics, sacred texts (The Saga of Fenris / The Book of Fangs), sacred sites, and oral tradition. Many Keepers are also scholars and historians.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'religious institutions', 'pack elders'],
		personality:
			'Local spiritual guides within individual packs. They lead daily prayers, seasonal rites, and funeral ceremonies. Any respected Elder can serve this role.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'sacred sites'],
		personality:
			'| Site Type | Description |\n|---|---|\n| **First Den** | The legendary location where the first pack was established. Its location is debated among scholars and theologians. |\n| **Moon Wells** | Natural springs or pools where the moonlight is believed to be particularly strong. Used for meditation, healing, and bonding rites. |\n| **Sacred Groves** | Ancient forests consecrated to Fenris. Hunting is forbidden within sacred groves. |\n| **Ancient Forges** | Sites associated with Ut (the Second Fang) and the creation of the first weapons. Revered by artisans and warriors. |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'holy days'],
		personality:
			"| Holy Day | Timing | Significance |\n|---|---|---|\n| **First Howl** | First Full Moon of the year | Celebration of the pack's survival through winter. Renewal of bonds. |\n| **Founding Moon** | Full Moon closest to the founding date of the local pack/House | Remembrance of the pack's origin story. |\n| **Day of Chains** | Midwinter (darkest night) | Mourning the binding of Fenris. A day of fasting and silence. |\n| **Night of Liberation** | Following Day of Chains | Celebration of the promise of Ragnar\u00f6k. Feasting, howling, bonfires. |\n| **Winter Hunt** | Last Full Moon before the solstice | The Great Hunt. The most important ritual hunt of the year. |",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['religion', 'rites'],
		personality:
			"| Rite | Occasion | Key Elements |\n|---|---|---|\n| **Naming** | Birth of a pup | Pack Leader or Elder names the pup under moonlight. Parental bonds established. |\n| **Coming of Age** | Presentation (~13) | The pup's secondary sex is formally acknowledged. New responsibilities assigned. |\n| **The Call** | Young adult (18\u201322) | Formal recognition of the choice to stay or disperse. A ceremony of passage. |\n| **Bonding** | Mating bond | The mating bite performed under witness. Scents blended. Moon Speaker officiates. |\n| **Pack Adoption** | New member | The adopted individual receives pack bites and is scented by all members. |\n| **Funeral** | Death | The deceased is honored. Their scent is preserved in a relic. Hel is invoked as Keeper of Ancestors. |\n| **Ascension** | Recognition of Ascended Enigma | Extraordinarily rare. The individual is acknowledged by Moon Speakers as an Enigma-class being. Species-wide significance. |\n\n\n*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) \u00b7 [LSE_06_History.md](LSE_06_History.md) \u00b7 [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md)*",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history'],
		personality:
			'> This document presents the historical timeline of the werewolf species, using the Three Levels of Truth established in LSE_00_Foundations.md. Religious Canon, Recorded History, and Unknown Truth are clearly distinguished throughout.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'timeline'],
		personality:
			'```\n\u2248 Mythic Age \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 Origin of the species. Fenris. The unknown.\n       \u2502\n       \u25bc\n  Age of the Firstborn \u2500\u2500\u2500\u2500 The Nine appear. First packs founded.\n       \u2502\n       \u25bc\n  Age of Expansion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 Spread across Scandinavia, Europe, and beyond.\n       \u2502\n       \u25bc\n  Age of Houses \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 Noble Houses and Bloodlines formalize.\n       \u2502\n       \u25bc\n  Age of Kingdoms \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 Peak of werewolf civilization. Great territories.\n       \u2502\n       \u25bc\n  Age of Secrecy \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 Hiding from humanity. The Masquerade begins.\n       \u2502\n       \u25bc\n  Modern Era \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 Contemporary werewolf society. Corporations, cities, coexistence.\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the mythic age', 'religious canon'],
		personality:
			'> Fenris, the First Wolf, walked the earth before the age of men. He was a primordial being, coeval with the \u00c6sir. When he chose to create his children, he selected nine mortal warriors of exceptional worth \u2014 the \u00dalfhe\u00f0nar \u2014 and remade them with his own divine blood. They became the Nine Firstborn, the first true werewolves.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the mythic age', 'recorded history'],
		personality:
			'> The origin of lycanthropy is undocumented. No verifiable record predates the Viking Age (~800 AD). The earliest confirmed werewolves appear in Norse and Icelandic accounts from the 9th\u201310th centuries.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the mythic age', 'unknown truth'],
		personality:
			'> Whether Fenris physically existed as a divine entity, whether the Nine Firstborn were divinely created or transformed through an unknown natural mechanism, and whether the Mythic Age represents literal history or mythologized memory \u2014 all remain unknowable.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'history',
			'the age of the firstborn',
			'the true pureblood \u2014 a historical event',
		],
		personality:
			'The existence of the Nine Firstborn is the most significant event in werewolf history. They are not a biological category of the species \u2014 they are a **unique, unrepeatable historical event**.\n\n**Religious Canon:** Fenris personally forged nine mortal \u00dalfhe\u00f0nar warriors into the first werewolves, granting them his Divine Blood.\n\n**Recorded History:** Nine extraordinary individuals appeared during the Viking Age (~827\u2013900 AD). They possessed biological characteristics far exceeding any known werewolf: biological immortality, extreme regeneration, perfect transformation stability, supreme pheromonal presence, and absolute Command. They founded the first packs and established the bloodlines from which all modern werewolves descend.\n\n**Confirmed characteristics of the Firstborn:**\n- Biological immortality (three survive to the present day, aged 1,100+ years)\n- Extreme regeneration surpassing any other known werewolf\n- Perfect Shift stability across all three forms\n- Pheromonal aura that cannot be overridden by any secondary sex\n- Command that cannot be resisted by any standard werewolf\n- They were not bitten, infected, or genetically altered \u2014 they were *remade* (according to Religious Canon) or *transformed through unknown means* (according to Recorded History)',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'history',
			'the age of the firstborn',
			'the founding of the first packs',
		],
		personality:
			'The Nine Firstborn dispersed across the Norse world, each founding a pack that would grow into a Founding Bloodline and eventually a Noble House. They established the first Pack Authority structures, territorial boundaries, and the oral traditions that would become the Faith of Fenris.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the age of expansion'],
		personality:
			"As the Firstborn's descendants multiplied, werewolf packs spread beyond Scandinavia:\n\n- Across Northern Europe (the Scandinavian core)\n- Into the British Isles, Iceland, and Greenland\n- Through Eastern Europe and into the Slavic lands\n- Southward into the Mediterranean\n- Westward to the New World (notably Wulfnic's expedition to North America, ~1025 AD)\n\nEach expansion created new cultural branches while maintaining bloodline connections to the Founding Houses.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the age of houses'],
		personality:
			'As bloodlines diversified and territories expanded, political structures formalized:\n\n- **Founding Bloodlines** consolidated into **Noble Houses** with formal governance.\n- **House Councils** emerged to manage territories spanning multiple packs.\n- **Inter-House diplomacy** began, establishing the first treaties, alliances, and marriage agreements.\n- The distinction between **Bloodline** (genetics), **House** (politics), and **Pack** (social unit) became codified.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the age of kingdoms'],
		personality:
			'The peak of open werewolf civilization:\n\n- Great Houses governed vast territories comparable to human kingdoms.\n- Werewolf culture, architecture, and craftsmanship reached their zenith.\n- The Continental Council (or its predecessors) formed to arbitrate inter-House disputes.\n- Werewolves and humans coexisted in varying degrees of awareness and tension.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the age of secrecy'],
		personality:
			'As human civilization grew, industrialized, and developed technologies that threatened supernatural secrecy:\n\n- The Continental Council mandated the **Great Hiding** \u2014 a species-wide policy of concealment from humanity.\n- Werewolf civilization retreated into hidden territories, corporate fronts, and underground networks.\n- Open pack structures gave way to covert operations disguised as human institutions.\n- The faith became more private, practiced within closed communities.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the modern era'],
		personality:
			'Contemporary werewolf society operates in the shadows of the human world:\n\n- Noble Houses maintain power through **corporate empires** (e.g., DCC \u2014 Douglas Consolidated Corporation).\n- Packs adapt to urban, suburban, and rural environments while maintaining core ecological structures.\n- Technology is adopted and adapted for species-specific needs.\n- The tension between **traditional** pack values and **modern** individualism creates ongoing cultural conflict.\n- The Faith of Fenris persists as a living tradition, with the Last Three Firstborn serving as both historical anchors and religious figures.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['history', 'the living sagas \u2014 historical fact'],
		personality:
			"Three of the Nine Firstborn survive to the present day. Their existence is **documented historical fact**, not legend.\n\n- **Wulfnic Bloodmoon** \u2014 The First Fang. Born ~827 AD. Arrived in North America ~1025 AD. Founded the Bloodmoon Dynasty. Currently the Patriarch of House Bloodmoon and the most politically powerful werewolf in the Americas.\n- **Ut** \u2014 The Second Fang. Born during the Viking Age. The first artisan of the species. Currently reclusive, residing within the Bloodmoon territory. Known as the Keeper of the Sacred Forge.\n- **Zefir** \u2014 The Third Fang. Born during the Viking Age. The species' memory incarnate. Currently nomadic within Bloodmoon territory. Known as the Watcher of the Moon and Keeper of the Winter Path.\n\n> **Cross-reference:** For detailed biographies, see [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md). For their religious significance, see [LSE_05_Religion.md](LSE_05_Religion.md) \u2014 The Cult of the Living Sagas.\n\nThe six remaining Firstborn are lost to history. Whether they perished, went into hiding, or met another fate is unknown.\n\n\n*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) \u00b7 [LSE_05_Religion.md](LSE_05_Religion.md) \u00b7 [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md)*",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundational figures'],
		personality:
			'> This document is a dedicated biographical registry for the exceptional individuals who shaped werewolf civilization. It exists independently from both Religion (LSE_05) and History (LSE_06) to ensure that these figures are not "lost" within broader narratives.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundational figures', 'the nine firstborn'],
		personality:
			'According to the Faith of Fenris (Religious Canon), Fenris chose nine mortal \u00dalfhe\u00f0nar warriors and remade them with his own Divine Blood during the Mythic Age. According to Recorded History, nine extraordinary individuals appeared during the Viking Age with biological characteristics far exceeding any known werewolf.\n\nThey were known as:\n\n> **The Nine Firstborn**\n> **The Sacred \u00dalfhe\u00f0nar**\n> **The Nine Fangs of Fenris**\n\nThey were not bitten. They were not infected. They were *remade* \u2014 or transformed through means that remain unknown.\n\nFor over a millennium they guided the first packs and founded the great dynasties. With the passage of centuries, war, sacrifice, and time consumed six of them. Today, only three survive.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundational figures',
			'the last three \u2014 the living sagas',
		],
		personality:
			"The three surviving Firstborn are known collectively as **The Last Three**, **The Living Sagas**, or **The Last Firstborn**. They are the oldest living beings in werewolf civilization and the only direct link to the species' origin.\n\nIn the Faith of Fenris, they represent the three essential aspects of a functional pack:\n- Someone who **leads**.\n- Someone who **creates**.\n- Someone who **remembers**.\n\n```\n                 FENRIS\n                    \u2502\n      \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n      \u2502             \u2502             \u2502\n      \u25bc             \u25bc             \u25bc\n\n WULFNIC          UT          ZEFIR\n\n The King     The Smith     The Hunter\n\n Leadership   Creation      Wisdom\n\n Territory    Civilization  Tradition\n\n Family       Industry      Spirituality\n```",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundational figures',
			'the last three \u2014 the living sagas',
			'wulfnic bloodmoon \u2014 the first fang',
		],
		personality:
			"**The Builder King**\n\n```\nIDENTITY CARD\n\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502  Blood Classification   Divine Blood         \u2502\n\u2502  Secondary Sex          Primordial Enigma    \u2502\n\u2502  Current Status         The First Fang       \u2502\n\u2502                         Patriarch of House   \u2502\n\u2502                         Bloodmoon            \u2502\n\u2502                         The Living Saga      \u2502\n\u2502  Former Office          Herald of Fenris     \u2502\n\u2502  House                  Bloodmoon            \u2502\n\u2502  Pack                   Seven Hills          \u2502\n\u2502  Profession             Statesman            \u2502\n\u2502  Niche                  Civilization Builder \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n```\n\n**Born:** ~827 AD, Iceland. Son of an Icelandic Jarl.\n\n**Before Transformation:** Wulfnic earned renown as an \u00dalfhe\u00f0inn warlord. A leader of men before he became a leader of wolves.\n\n**The Forging:** During the final age in which Fenris still walked among mortals (Religious Canon), the First Wolf chose Wulfnic as one of the Nine Firstborn. He was remade \u2014 not bitten, not infected. His body, soul, and blood became part of Fenris' own divine lineage.\n\n**The Crossing:** In 1021 AD, Wulfnic sailed west from Iceland aboard his drakkar with household warriors, Moon Speakers, and families. To humanity, the expedition vanished. To the werewolf world, Wulfnic had fulfilled the Calling of Fenris. Reaching the untouched forests of North America around 1025 AD, he claimed an immense wilderness stretching across what would become the Pacific Northwest.\n\n**The Dynasty:** Wulfnic founded the **Bloodmoon Dynasty** \u2014 the first permanent werewolf domain in the New World. Over the following millennium he witnessed the rise and fall of kingdoms, the arrival of European settlers, the birth of modern nations, and the emergence of contemporary werewolf civilization. He never relinquished his territory. He simply adapted.\n\n**Today:** Wulfnic is the **Patriarch of House Bloodmoon** and the supreme political authority among werewolves in North America. His authority is both political (as House Head) and religious (as a Living Saga whose mandate, to the faithful, derives directly from Fenris). He is a living relic of the Age of Fenris \u2014 a memory made flesh.\n\n**Religious Significance:** Fenris entrusted him with the most difficult task: not winning wars, but building a civilization. He is remembered as **The Builder King**.\n\n**Domains:** Leadership, Family, Territory, Justice, Civilization.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundational figures',
			'the last three \u2014 the living sagas',
			'ut \u2014 the second fang',
		],
		personality:
			'**The Mountain**\n\n```\nIDENTITY CARD\n\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502  Blood Classification   Divine Blood         \u2502\n\u2502  Secondary Sex          Primordial Enigma    \u2502\n\u2502  Current Status         The Second Fang      \u2502\n\u2502                         Keeper of the Sacred \u2502\n\u2502                         Forge                \u2502\n\u2502                         The Living Saga      \u2502\n\u2502  Former Office          Herald of Fenris     \u2502\n\u2502  House                  Bloodmoon            \u2502\n\u2502  Profession             Master Blacksmith    \u2502\n\u2502  Niche                  Creator              \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n```\n\n**Born:** Viking Age, Scandinavia. Exact date unrecorded.\n\n**Before Transformation:** A master blacksmith of legendary skill.\n\n**The Forging:** One of the Nine Firstborn. Remade by Fenris alongside Wulfnic and Zefir.\n\n**Legacy:** Ut represents the creative aspect of Fenris. According to Religious Canon, the first sacred weapons, armors, insignia, and tools of the werewolf species were forged by his hands. Every werewolf blacksmith still offers a prayer to Ut before forging a weapon intended for a warrior.\n\n**Today:** Ut resides within Bloodmoon territory. He lives in deliberate austerity, rejecting most modern comforts while being secretly fascinated by combustion engines and modern mechanics. He frequently torments Logan Douglas with endless, absurd questions about how cars work.\n\n**Personality:** Enormous (230 cm), blunt, stoic, physical. Prefers solving problems with his maul. Frustrated by the fragility of modern California. Deeply traditional but possessed of a childlike wonder for engineering.\n\n**Religious Significance:** The first artisan. Patron of craftsmanship, industry, and creation. Worshipped by artisans, engineers, and builders.\n\n**Domains:** Creation, Work, Resistance, Tradition, Technology (with enormous irony).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'foundational figures',
			'the last three \u2014 the living sagas',
			'zefir \u2014 the third fang',
		],
		personality:
			"**The White Ghost**\n\n```\nIDENTITY CARD\n\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502  Blood Classification   Divine Blood         \u2502\n\u2502  Secondary Sex          Primordial Enigma    \u2502\n\u2502  Current Status         The Third Fang       \u2502\n\u2502                         Watcher of the Moon  \u2502\n\u2502                         Keeper of the Winter \u2502\n\u2502                         Path                 \u2502\n\u2502                         The Living Saga      \u2502\n\u2502  Former Office          Herald of Fenris     \u2502\n\u2502  House                  Bloodmoon            \u2502\n\u2502  Profession             Hunter               \u2502\n\u2502  Niche                  Guardian of Memory   \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n```\n\n**Born:** Viking Age, Scandinavia. Exact date unrecorded.\n\n**Before Transformation:** An \u00dalfhe\u00f0inn warrior. Silent, deadly, spectral.\n\n**The Forging:** One of the Nine Firstborn. Remade by Fenris alongside Wulfnic and Ut.\n\n**Legacy:** Zefir represents the spiritual aspect of the wolf. He does not build. He does not govern. He observes. He remembers. He hunts. In the ancient sagas, he was the messenger between Fenris and the packs \u2014 the one who traveled the world carrying orders, omens, and warnings. Many werewolves still believe that seeing Zefir before a battle is a portent of Fenris' judgment.\n\n**Today:** Zefir is nomadic within Bloodmoon territory. He rarely intervenes in politics, but when he speaks, the Elders listen. He knows forgotten paths, ancient rituals, and lost sacred sites. Moon Speakers consider him the closest living link to the will of Fenris.\n\n**Personality:** Silent, eerie, observant. Moves without sound. Stares unblinkingly. Treats modern technology with extreme suspicion or ignores it entirely. Snow-white hair, washed-out ice-blue eyes. Appears as a ghostly teenager despite being 1,100+ years old.\n\n**Religious Significance:** Memory incarnate. The species' living connection to the past. Patron of hunters, the moon, silence, and winter.\n\n**Domains:** The Moon, Hunting, Silence, Winter, Death, Memory.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundational figures', 'the six lost firstborn'],
		personality:
			'Six of the Nine Firstborn are lost to history. Their names, fates, and the bloodlines they may have founded are subjects of ongoing scholarly debate and theological speculation.\n\nSome Moon Speakers maintain that the six did not die but entered a state of dormancy, waiting to awaken when the species needs them most. Others believe they sacrificed themselves during the Age of Secrecy to protect the species. The truth is unknown.\n\n> **Placeholder for future expansion:** As the SvartulfrVerse and other settings develop, individual Lost Firstborn may be documented here.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundational figures', 'founders of the great houses'],
		personality:
			"> **Placeholder:** This section will be expanded as specific Houses are developed within settings. Each entry will include the Founder's Six-Axis Identity Card, founding date, territory claimed, and House legacy.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundational figures', 'legendary alphas'],
		personality:
			'> **Placeholder:** Exceptional Alpha figures throughout history who achieved renown without Firstborn lineage.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundational figures', 'ascended enigmas'],
		personality:
			'> **Placeholder:** The ~10 individuals across two millennia who presented as Enigma-class beings without Divine Blood lineage. Each case is extraordinary and species-significant.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['foundational figures', 'historical heroes'],
		personality:
			'> **Placeholder:** Other figures of exceptional importance to specific settings or historical periods.\n\n\n*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) \u00b7 [LSE_05_Religion.md](LSE_05_Religion.md) \u00b7 [LSE_06_History.md](LSE_06_History.md)*',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology'],
		personality:
			'> This document describes how modern werewolf civilization intersects with technology \u2014 covering transportation, weapons, medicine, industry, communications, and architecture. Werewolves are not a "primitive" species; they are a hidden civilization operating within and alongside human technology.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'design principle'],
		personality:
			'Werewolf technology follows a dual-track model:\n\n1. **Human Technology Adoption:** Werewolves use human technology where it serves their needs (vehicles, communications, medical equipment, computing).\n2. **Species-Specific Adaptation:** Where human technology fails to account for werewolf biology (shift forms, pheromones, enhanced senses, regeneration), the species develops its own solutions.\n\nThis dual-track creates a civilization that is technologically modern but biologically alien.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'transportation'],
		personality:
			"| Mode | Human Tech | Werewolf Adaptation |\n|---|---|---|\n| **Vehicles** | Standard cars, trucks, motorcycles | Reinforced interiors for Hybrid Shift occupants. Scent-neutralized vehicles for secrecy. |\n| **Aircraft** | Standard commercial/private aviation | Used for long-distance travel. Some elite packs maintain private aircraft. |\n| **Full Shift Travel** | N/A | Quadrupedal wolf form excels at long-distance overland travel through wilderness. Faster and more efficient than vehicles in rough terrain. |\n| **Maritime** | Standard vessels | Historical significance (Wulfnic's crossing). Modern packs may maintain boats for coastal territories. |",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'weapons'],
		personality: 'Werewolf combat spans three categories:',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'weapons', 'natural weapons'],
		personality:
			'- Claws (retractable, present in all shift forms)\n- Teeth/fangs (devastating in Hybrid and Full Shift)\n- Enhanced strength and speed\n- Pheromonal intimidation (Command as a weapon)',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'weapons', 'traditional weapons'],
		personality:
			'- Forged melee weapons (swords, axes, mauls \u2014 sacred craft tradition linked to Ut)\n- Hunting implements (bows, spears, traps)\n- Ceremonial weapons (used in formal challenges, rites of passage)',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'weapons', 'modern weapons'],
		personality:
			"- Firearms (adopted from human technology)\n- Tactical equipment (body armor adapted for shift forms)\n- Non-lethal suppression (pheromone-based restraints, tranquilizers formulated for werewolf metabolism)\n\n> **Note:** Traditional forged weapons carry cultural and religious significance that modern firearms do not. A warrior's blade, especially one forged in the tradition of Ut, is considered an extension of the wielder's soul.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'medicine'],
		personality:
			'> **Cross-reference:** For detailed medical treatments (suppressants, bond therapy, fertility medicine), see [LSE_03_Civilization.md](LSE_03_Civilization.md).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'medicine', 'species-specific medical technology'],
		personality:
			"| Technology | Function |\n|---|---|\n| **Regeneration Accelerators** | Devices or compounds that boost the species' natural healing factor for severe injuries |\n| **Pheromone Analyzers** | Diagnostic tools that read pheromonal output to assess health, emotional state, and bond integrity |\n| **Shift Stabilizers** | Medication for individuals with unstable transformations (common in Modified Lineages) |\n| **Bond Monitors** | Equipment that tracks the neurological bond link between mated pairs |\n| **Heat/Rut Management Systems** | Climate-controlled nesting environments, automated suppressant delivery, scent containment rooms |",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'medicine', 'medical facilities'],
		personality:
			'- **Pack Clinics:** Basic medical care within pack territory. Staffed by pack Healers.\n- **House Hospitals:** Advanced facilities operated by Noble Houses. Species-specific surgery, intensive bond therapy, fertility treatment.\n- **Heat/Rut Houses:** Specialized facilities for managing fertile cycles without a partner. Range from medical (emergency, health-related) to recreational (legal/illegal depending on jurisdiction).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'industry'],
		personality:
			'Werewolf industry operates both openly (through human-facing corporate fronts) and covertly (species-specific manufacturing):',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'industry', 'corporate fronts'],
		personality:
			'- **DCC (Douglas Consolidated Corporation):** The most prominent example. A human-facing corporation that serves as the economic engine of House Bloodmoon.\n- Similar corporate structures exist across other Houses worldwide.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'industry', 'species-specific industry'],
		personality:
			'| Sector | Products |\n|---|---|\n| **Forging** | Weapons, ceremonial items, architectural metalwork (tradition of Ut) |\n| **Pharmaceuticals** | Suppressants, pheromone blockers, scent concealers, fertility treatments |\n| **Construction** | Den-optimized architecture, pack compounds, scent-managed environments |\n| **Textiles** | Shift-compatible clothing, heat/rut robes, scent-absorbent fabrics |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'communications'],
		personality:
			'| System | Function |\n|---|---|\n| **Human Networks** | Standard phones, internet, encrypted messaging \u2014 used for everyday communication |\n| **Howl Networks** | Traditional long-range communication via coordinated howling. Still used in wilderness territories and during emergencies. |\n| **Scent Messaging** | Pheromone-infused objects sent between individuals or packs to convey emotional context that text cannot |\n| **Encrypted Pack Channels** | Secure digital communication networks maintained by House IT infrastructure |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'architecture'],
		personality:
			'Werewolf architecture serves both human-facing aesthetics and species-specific biological needs:',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'architecture', 'design requirements'],
		personality:
			'- **Scent Management:** Ventilation systems that can contain, circulate, or neutralize pheromones.\n- **Shift Accommodation:** Doorways, corridors, and rooms sized for Hybrid Shift occupants (significantly larger than human standard).\n- **Nesting/Den Integration:** Dedicated spaces designed for Omega nests and Alpha dens, with appropriate soundproofing, climate control, and scent containment.\n- **Security:** Perimeter systems, scent-based identification, reinforced structures.\n- **Pack Scale:** Housing designed for extended family units (10\u201330+ members) rather than nuclear families.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'architecture', 'common structures'],
		personality:
			'| Structure | Characteristics |\n|---|---|\n| **Pack Compound** | Walled community with multiple residences, shared spaces, training grounds |\n| **Longhouse** | Traditional pack dwelling (inspired by Norse architecture). Central hall with private alcoves. |\n| **Urban Mansion** | Adapted human mansion for city packs. Oversized bathrooms, reinforced doors, scent-managed rooms. |\n| **Den Chamber** | Dedicated Alpha den room. Heavily scent-marked, controlled access, defensible position. |\n| **Nest Suite** | Dedicated Omega nesting room. Blackout capability, temperature control, scent saturation, privacy. |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['technology', 'architecture', 'housing details'],
		personality:
			'- **Bathrooms:** Giant baths for family bathing (bonding time). Bathing together is normal until pup scent fades.\n- **Bedrooms:** Alpha rooms face sunrise (early risers). Omega rooms have blackout curtains and face the sun for warmth. Beta rooms are flexible.\n- **Kitchens:** Oversized for large packs. Everyone helps \u2014 even small pups (handling items, tasting, supervised tasks).\n- **Garages:** Omegas park inside first (closest to the door for safety), then Betas, then Alphas.\n\n\n*Cross-references: [LSE_01_Species.md](LSE_01_Species.md) \u00b7 [LSE_03_Civilization.md](LSE_03_Civilization.md) \u00b7 [LSE_04_Governance.md](LSE_04_Governance.md)*',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices'],
		personality:
			'> Reference tables, matrices, glossaries, and supplementary material for the LSE framework.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'a. secondary sex matrix'],
		personality:
			'| Attribute | Enigma | Alpha | Delta | Beta | Omega |\n|---|---|---|---|---|---|\n| **Role** | Sacred Caste | Protector | Engine | Social Glue | Emotional Regulator |\n| **Frequency** | ~1/generation | 1/10 | 1/15 | 1/1,500 | 1/30 |\n| **Build** | Varies (typically Alpha-like) | Tall, broad, muscular | Comparable to Alpha | Varies widely | Agile, softer |\n| **Scent Strength** | Supreme (unoverridable) | Strong, aggressive | Moderate | Weak (holds longer) | Strong, sweet (overrides Beta) |\n| **Command** | Absolute (irresistible) | Strong (resisted by Deltas, other Alphas) | Cannot Command | Cannot Command | Cannot Command (D-Omega resists) |\n| **Heat/Rut** | Can resist Omega heat | Rut monthly (3\u201310 days) | No rut | No natural cycle (M.I.H. available) | Heat every 3 months (3\u201310 days) |\n| **Knot** | Yes | Yes | No | No | No (receives) |\n| **Slick** | No | No | No | No | Yes |\n| **Fertility** | Can impregnate all | 95% (declines ~1%/yr) | Like Alpha (no Command) | Variable | 99% (in heat) |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'b. pack role matrix'],
		personality:
			"| Pack Role | Authority Level | Typical Duties | Notes |\n|---|---|---|---|\n| **Pack Leader** | Supreme (within pack) | Final decisions, protection, representation | Any secondary sex can serve |\n| **Pack Mom / Leader's Mate** | High | Emotional guidance, daily operations, pup oversight | Traditionally Omega/Female, but not restricted |\n| **Right Hand(s)** | High | Strategic advising, succession, peacekeeping | Trusted above all others |\n| **Left Hand(s)** | High (enforcement) | Physical protection, security operations | Common in high-risk packs |\n| **Caretaker(s)** | Medium | Meals, cleaning, pup management, socialization | Often young adults learning |\n| **Pup(s)** | Protected (no authority) | Learning, growing, bonding | Under 17\u201321 (varies) |",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'c. social status matrix (house)'],
		personality:
			'| Status | Authority | Inheritance | Function |\n|---|---|---|---|\n| **House Head** | Supreme (within House) | Hereditary or contested | Governs all packs under House banner |\n| **Lord** | High | Family branch | Governs specific territories or domains |\n| **Knight** | Medium | Awarded or hereditary | Sworn warriors, officers, honored servants |\n| **Citizen** | Basic | N/A | Acknowledged House member |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'd. profession matrix'],
		personality:
			'| Category | Examples |\n|---|---|\n| **Combat** | Warrior, Guard, Sentinel, Soldier, Mercenary |\n| **Craft** | Blacksmith, Carpenter, Weaponsmith, Jeweler, Tailor |\n| **Leadership** | Statesman, Diplomat, Negotiator, Administrator |\n| **Knowledge** | Scholar, Historian, Archivist, Teacher, Scientist |\n| **Medicine** | Healer, Physician, Surgeon, Therapist, Midwife |\n| **Commerce** | Merchant, Trader, Accountant, Banker |\n| **Spiritual** | Moon Speaker, Keeper, Elder, Sage |\n| **Ecology** | Hunter, Scout, Ranger, Tracker, Farmer, Fisher |\n| **Arts** | Musician, Storyteller, Artist, Poet |\n| **Modern** | Engineer, Lawyer, Pilot, Developer, Mechanic |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'e. blood classification matrix'],
		personality:
			'| Classification | Origin | Lifespan | Regeneration | Command | Shift Stability | Population |\n|---|---|---|---|---|---|---|\n| **Divine Blood** | Firstborn (Forged) | Immortal | Extreme | Absolute | Perfect | 3 surviving |\n| **Founding Bloodlines** | Children of Firstborn | 500+ years | Very high | Very strong | Very stable | Very rare |\n| **Pureblood Houses** | Multi-gen descendants | 200\u2013400 years | High | Strong | Stable | Rare |\n| **Common Bloodlines** | General population | 80\u2013150 years | Standard | Standard | Standard | Majority |\n| **Modified Lineages** | Experimental | Unpredictable | Unpredictable | Unpredictable | Often unstable | Very rare |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'f. naming conventions', 'personal names'],
		personality:
			'Werewolf naming conventions vary by culture, bloodline, and era:\n- **Norse/Traditional:** Old Norse or Icelandic names (Wulfnic, Zefir, Edric, Kaladin).\n- **Modern:** Standard contemporary names adapted to local culture.\n- **Compound Names:** Some packs use hyphenated family-pack names (e.g., Douglas-Bloodmoon).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'f. naming conventions', 'house & pack names'],
		personality:
			'- **Houses:** Named after the founding bloodline (e.g., House Bloodmoon).\n- **Packs:** Named after territory, landmark, or founding story (e.g., Seven Hills Pack).',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'f. naming conventions', 'titles'],
		personality:
			'| Title | Context |\n|---|---|\n| **Patriarch / Matriarch** | House Head |\n| **Pack Leader** | Head of a single pack |\n| **The First/Second/Third Fang** | The Last Three Firstborn |\n| **The Living Saga** | Religious title for surviving Firstborn |\n| **High Fang** | Supreme spiritual authority |\n| **Moon Speaker** | Priest |\n| **Keeper** | Custodian of relics/tradition |\n| **Herald of Fenris** | Former title of the Firstborn (historical) |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'g. timeline summary'],
		personality:
			'| Era | Approximate Period | Key Events |\n|---|---|---|\n| **Mythic Age** | Unknown \u2014 ~800 AD | Fenris. Origin of lycanthropy. The Nine Firstborn. |\n| **Age of the Firstborn** | ~800\u20131000 AD | First packs. First territories. Founding Bloodlines. |\n| **Age of Expansion** | ~1000\u20131300 AD | Spread across Europe. Wulfnic crosses to North America (~1025). |\n| **Age of Houses** | ~1300\u20131600 AD | Noble Houses formalize. Inter-House diplomacy begins. |\n| **Age of Kingdoms** | ~1600\u20131800 AD | Peak of werewolf civilization. Great territories. |\n| **Age of Secrecy** | ~1800\u20131950 AD | The Great Hiding. Retreat from human awareness. |\n| **Modern Era** | ~1950\u2013Present | Corporate fronts. Urban adaptation. Contemporary society. |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'h. genealogies'],
		personality:
			'> **Placeholder:** Genealogical trees for specific Houses and Bloodlines will be documented here as settings develop.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'i. maps'],
		personality:
			'> **Placeholder:** Territorial maps for specific settings (e.g., Bloodmoon territory in the Pacific Northwest) will be added here.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['appendices', 'j. music genres'],
		personality:
			'Werewolf culture has produced its own music traditions:\n\n| Genre | Era | Description |\n|---|---|---|\n| **Knot Rock** | 1970s\u20131990s | Alpha-centric, sexually explicit. Hazy consent themes. |\n| **Omega Pop** | Late 1990s+ | Bubblegum love songs for unmated Omegas and Beta females. |\n| **Omega Punk** | 1980s+ | Hard-hitting, tied to Omega Rights Movements. Emphasizes consent. |\n| **Soft Rock** | 2000s+ | Alpha-centric progressive pop. |\n| **Nova Dance Hall** | Various | Traditional Omega reaction to Omega Punk. |\n| **Knot Country** | Various | Rough, traditional. More conservative than Omega Punk. |\n| **Pub Rock** | 1970s, revived 1990s | Alpha-specific. Gentler than Knot Rock. |\n| **Novelty Pop Rock** | 1950s\u20131960s | Silly entertainment for pups and Omegas. |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'appendices',
			'k. regional cultural variations',
			'brazilian omegaverse customs',
		],
		personality:
			'- **Physical Contact:** Minimal personal space. Touch is a primary communication tool.\n- **Clumping (vs. Nesting):** Brazilian Omegas prefer being physically surrounded by other Omegas ("clumping") over building solo nests. Faster and more calming.\n- **Soccer Culture:** Alphas are obsessed. Public transportation becomes dangerous on game days. Omegas are often prohibited from going out during classic matches.\n- **Pack Formation:** Relaxed in cities (loose found families), traditional in rural areas (extended families sharing land, food, beds, and pup care).\n- **Feistiness:** Brazilian Omegas are notably feisty and do not respond well to confrontation.\n- **Religious/Party Dichotomy:** Strong cultural split between devout traditionalists and uninhibited party culture.\n\n\n*Cross-references: [LSE_00_Foundations.md](LSE_00_Foundations.md) \u00b7 [LSE_01_Species.md](LSE_01_Species.md) \u00b7 [LSE_03_Civilization.md](LSE_03_Civilization.md)*',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['lupine social ecology (lse)'],
		personality:
			'> A comprehensive biological, ecological, social, political, religious, and historical reference framework for the werewolf species.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['lupine social ecology (lse)', 'framework overview'],
		personality:
			'```\nLSE (Lupine Social Ecology)\n\u2502\n\u251c\u2500\u2500 PART 0 \u2014 Foundations\n\u2502   Scope \u00b7 Canon Policy \u00b7 Three Levels of Truth \u00b7 7 LSE Principles \u00b7 Six-Axis Identity System \u00b7 Terminology\n\u2502\n\u251c\u2500\u2500 PART I \u2014 Species\n\u2502   Morphology \u00b7 Shift Classes \u00b7 Blood Classification \u00b7 Secondary Sex \u00b7 Life Cycle \u00b7 Genetics \u00b7 Reproduction\n\u2502\n\u251c\u2500\u2500 PART II \u2014 Behavioral Ecology\n\u2502   Psychology \u00b7 Neurobiology \u00b7 Communication \u00b7 Pack Ecology \u00b7 Alloparenting \u00b7 Ecological Roles \u00b7 Nesting\n\u2502\n\u251c\u2500\u2500 PART III \u2014 Civilization\n\u2502   Social Hierarchy \u00b7 Culture \u00b7 Economy \u00b7 Medicine \u00b7 Education \u00b7 Adoption \u00b7 Traditions\n\u2502\n\u251c\u2500\u2500 PART IV \u2014 Governance\n\u2502   Pack Authority \u00b7 Social Status \u00b7 House Government \u00b7 Continental Council \u00b7 Laws \u00b7 Jurisdiction\n\u2502\n\u251c\u2500\u2500 PART V \u2014 Religion\n\u2502   Faith of Fenris \u00b7 Pantheon \u00b7 Precepts \u00b7 Institutions \u00b7 Sacred Sites \u00b7 Holy Days \u00b7 Rites\n\u2502\n\u251c\u2500\u2500 PART VI \u2014 History\n\u2502   Timeline \u00b7 Age of the Firstborn \u00b7 Age of Expansion \u00b7 Age of Secrecy \u00b7 Modern Era\n\u2502\n\u251c\u2500\u2500 PART VII \u2014 Foundational Figures\n\u2502   The Nine Firstborn \u00b7 The Last Three \u00b7 Great House Founders \u00b7 Ascended Enigmas\n\u2502\n\u251c\u2500\u2500 PART VIII \u2014 Technology\n\u2502   Transportation \u00b7 Weapons \u00b7 Medicine Tech \u00b7 Industry \u00b7 Communications \u00b7 Architecture\n\u2502\n\u2514\u2500\u2500 Appendices\n    Matrices \u00b7 Glossary \u00b7 Naming Conventions \u00b7 Timeline Summary \u00b7 Genealogies \u00b7 Maps\n```',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['lupine social ecology (lse)', 'module index'],
		personality:
			'| Module         | File                                                             | Contents                                                                                                                                                                                                    |\n| -------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |\n| **PART 0**     | [LSE_00_Foundations.md](LSE_00_Foundations.md)                   | The constitutional base. Scope, Canon Policy, Three Levels of Truth, 7 LSE Principles, Six-Axis Identity System, Core Terminology.                                                                          |\n| **PART I**     | [LSE_01_Species.md](LSE_01_Species.md)                           | Morphology & Shift Classes (Partial/Hybrid/Full), Blood Classification, Secondary Sex Physiology (Enigma/Alpha/Delta/Beta/Omega), Life Cycle, Genetics, Demographics, Reproduction.                         |\n| **PART II**    | [LSE_02_Behavioral_Ecology.md](LSE_02_Behavioral_Ecology.md)     | Psychological profiles, Neurobiology (pheromone pathway, Command mechanism), Communication (non-verbal, vocalizations), Pack Ecology, Alloparenting, Succession, Ecological Roles, Nesting & Den behavior.  |\n| **PART III**   | [LSE_03_Civilization.md](LSE_03_Civilization.md)                 | Social Hierarchy (Species\u2192Bloodline\u2192House\u2192Pack\u2192Family\u2192Individual), Culture, Pack Types, Economy, Medicine, Education, Adoption, Parental Names, Weddings.                                                   |\n| **PART IV**    | [LSE_04_Governance.md](LSE_04_Governance.md)                     | Pack Authority Structure, Social Status Hierarchy, House Government, Continental Council, Treaties & Alliances, Laws & Jurisdiction, Crimes & Punishments.                                                  |\n| **PART V**     | [LSE_05_Religion.md](LSE_05_Religion.md)                         | The Faith of Fenris (Dogma, Great Betrayal, Ragnar\u00f6k, Pantheon, Nine Precepts, Moon symbolism, Cult of the Living Sagas), Institutions (High Fang, Moon Speakers, Keepers), Sacred Sites, Holy Days, Rites. |\n| **PART VI**    | [LSE_06_History.md](LSE_06_History.md)                           | Timeline (Mythic Age \u2192 Modern Era), The True Pureblood as historical event, The Living Sagas as historical fact. Uses Three Levels of Truth throughout.                                                     |\n| **PART VII**   | [LSE_07_Foundational_Figures.md](LSE_07_Foundational_Figures.md) | The Nine Firstborn, The Last Three (Wulfnic, Ut, Zefir) with full Identity Cards, placeholders for Great House Founders, Legendary Alphas, Ascended Enigmas.                                                |\n| **PART VIII**  | [LSE_08_Technology.md](LSE_08_Technology.md)                     | Transportation, Weapons (natural/traditional/modern), Medicine Tech, Industry (corporate fronts, species-specific), Communications, Architecture.                                                           |\n| **Appendices** | [LSE_Appendices.md](LSE_Appendices.md)                           | Secondary Sex Matrix, Pack Role Matrix, Social Status Matrix, Profession Matrix, Blood Classification Matrix, Naming Conventions, Timeline Summary, Music Genres, Regional Variations.                      |',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['lupine social ecology (lse)', 'the seven lse principles'],
		personality:
			'1. **Biology is not Destiny.**\n2. **Packs are Families.**\n3. **Leadership is earned and maintained.**\n4. **Every Wolf has a Niche.**\n5. **Culture evolves.**\n6. **Faith and History are separate.**\n7. **The Pack survives before the Individual.**',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['lupine social ecology (lse)', 'the six-axis identity system'],
		personality:
			'```\nINDIVIDUAL IDENTITY\n\u251c\u2500\u2500 1. Blood Classification   [Genetics, immutable]\n\u251c\u2500\u2500 2. Secondary Sex          [Biology, immutable]\n\u251c\u2500\u2500 3. Pack Role              [Authority, earned]\n\u251c\u2500\u2500 4. Social Status          [Politics, inherited/earned]\n\u251c\u2500\u2500 5. Profession             [Occupation, chosen]\n\u2514\u2500\u2500 6. Niche                  [Specialization, developed]\n```',
	},
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
