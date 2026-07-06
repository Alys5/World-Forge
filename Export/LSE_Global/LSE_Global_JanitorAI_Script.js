/* ============================================================================
   LUPINE SOCIAL ECOLOGY v2.0.0
   Author: Lys_5
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
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'werewolf',
			'transformation',
			'shift',
			'partial shift',
			'hybrid',
			'true form',
			'full shift',
			'bipedal',
			'quadrupedal',
		],
		personality:
			'Werewolves possess three morphological states. The daily "Partial Shift" (visible ears, tail, fangs) is triggered by stress or aggression for social signaling. The "Hybrid Shift" (bipedal, full fur, maximum strength) is their True Form; the humanoid shape is merely a mimetic adaptation. The "Full Shift" (quadrupedal) is specialized for long-distance pursuit. When characters shift, describe the visceral, bone-cracking reality of the change. They retain full cognitive capacity; they do not lose their minds, but become physically lethal protectors of their family.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'divine blood',
			'founding bloodline',
			'pureblood',
			'common bloodline',
			'firstborn',
			'noble house',
		],
		personality:
			'Werewolf society is strictly stratified by genetics. The Nine Firstborn (Divine Blood) are biological immortals. Founding and Pureblood houses live centuries (200-500 years), hoarding power and influence. Treat ancient purebloods with a mix of reverence and claustrophobic dread; their authority over the family is absolute and suffocating. Common wolves must defer to them or face brutal social, and often physical, consequences.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'enigma',
			'primordial enigma',
			'ascended enigma',
			'sacred caste',
		],
		personality:
			"The rarest, apex secondary sex. Enigmas project supreme, irresistible charisma and mirror Alpha aggression with terrifying intensity. They cannot be psychologically dominated. When an Enigma acts, other characters feel an overwhelming, suffocating instinct to submit. Enigma Commands cannot be resisted by standard secondary sexes. Portray them with an aura of inescapable, god-like gravity that dominates the pack's physical and emotional space.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'alpha',
			'dominant alpha',
			'submissive alpha',
			'rut',
			'knot',
			'command',
			'den',
		],
		personality:
			'Alphas are highly territorial, aggressively protective guardians. When an Alpha\'s pack or mate is threatened, they must react with decisive, lethal aggression. They produce oppressive pheromones to assert control. During their monthly "Rut" (or if triggered by an Omega\'s heat), their logic is consumed by breeding and claiming instincts. When they use "The Command" (voice + pheromones), Betas and Omegas experience an adrenaline surge and must freeze and comply. Alphas fiercely defend their "Den," a heavily scent-marked territory.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['delta', 'tactician', 'scout'],
		personality:
			'The strategic, cooperative core of the pack. Deltas match Alpha strength but lack "The Command" mechanism. Deltas solve problems actively and tactically. When the pack is in crisis, Deltas do not panic; they coordinate, hunt, and execute with brutal efficiency to defend their kin, bridging the gap between Alpha protection and Beta administration.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: ['beta', 'worker', 'builder'],
		personality:
			"The emotionally stable foundation of the pack. Betas adapt to any situation, balancing nurture and protection without experiencing extreme heats or ruts. They provide the quiet, suffocating consistency of pack life, ensuring the family's survival above all individual desires.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'omega',
			'dominant omega',
			'submissive omega',
			'heat',
			'slick',
			'nest',
			'keening',
			'purring',
		],
		personality:
			'Highly empathetic regulators who produce calming, floral pheromones to soothe aggressive packmates. During a crisis, Omegas instinctively de-escalate tensions and fiercely protect pups. Every 3 months, they enter a 3-10 day "Heat". During active heat, they are incoherent, driven entirely by breeding instinct, and their decisions are non-consensual. Omegas aggressively defend their "Nest" (a scent-rich safe space); destroying it causes severe psychological distress and withdrawal.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'pack',
			'family',
			'succession',
			'call of the pack',
			'bonding',
			'mating mark',
			'scenting',
			'pheromones',
		],
		personality:
			'A pack is a suffocatingly tight family, built on kinship and mutual survival, not a military hierarchy. Characters must prioritize pack welfare over personal desires, often to a toxic, claustrophobic degree. A "Mating Mark" (neck bite) forms a permanent neural and emotional link between partners. Scenting (rubbing wrists, cheeks, or necks) is a constant, intimate necessity to verify safety, mood, and hierarchy, establishing a visceral physical closeness among members.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'keening',
			'hissing',
			'trilling',
			'purring',
			'chirping',
			'mewling',
			'rumbling',
			'growling',
			'crooning',
			'chuffing',
		],
		personality:
			"Communication relies heavily on pheromones, posture, and animalistic vocalizations. Replace human sighs or shouts with species-specific sounds: Omegas keen in distress or purr in comfort; Alphas rumble to soothe or growl to warn and discipline. Characters constantly read each other's scent to detect fear, arousal, or lies, making privacy nearly impossible within the pack's sensory web.\n\n# LSE_Global Batch 2: Civilization, Governance & Religion",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'bloodline',
			'house',
			'pack',
			'family',
			'traditional pack',
			'modern pack',
			'adoption',
			'bonding adoption',
		],
		personality:
			'Society is nested in layers: Bloodline, House, Pack, and Family. Belonging is everything; being "packless" is dangerous. Adoptions are brutal and demand physical "bonding" and unanimous pack agreement. Characters must express deep, absolute loyalty to their specific House and Pack. Treat outsiders with inherent suspicion. A character\'s worth is inextricably tied to their social group, creating a suffocating pressure to conform and protect the collective reputation at all costs.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'pack leader',
			'pack mom',
			'right hand',
			'left hand',
			'caretaker',
			'pup',
			'authority',
		],
		personality:
			"Pack authority is earned, not biologically determined. A Pack Leader and Pack Mom enforce absolute safety. Right Hands advise; Left Hands execute violence. Characters must respect the pack's chain of command instinctively. Disobeying the Pack Leader or Pack Mom is unthinkable and invites immediate, harsh discipline. Pups are fiercely protected by all members; threatening a pup guarantees a lethal, coordinated response from the entire pack.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'house head',
			'patriarch',
			'matriarch',
			'lord',
			'knight',
			'citizen',
			'continental council',
			'exile',
			'rogue',
		],
		personality:
			'The House Head holds absolute political power over multiple packs. "Exile" is the ultimate punishment: stripping a werewolf of all pack bonds, causing severe physical and psychological trauma, turning them into a hunted "Rogue". Characters must view House Law as absolute. They fear Exile more than death. When dealing with Rogues, characters react with disgust and lethal hostility. Betrayal of the House is met with swift, merciless execution.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'heat medicine',
			'rut suppressant',
			'pheromone blocker',
			'scent concealer',
			'bond therapy',
			'omega kibble',
			'red heat',
			'scrubbing',
		],
		personality:
			'Biology dictates strict medical needs. Suppressants control heats and ruts but carry severe addiction risks. Pheromone Blockers erase scent entirely. Scrubbing a mating mark is deeply traumatic. A "Red Heat" occurs when a mate neglects an Omega, causing excruciating pain. Characters must treat the disruption of biological cycles (like missed heats or broken bonds) as life-threatening emergencies. They react to full-dose scent blockers with deep unease, as erasing one\'s scent is considered unnatural and deeply suspicious.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'faith of fenris',
			'fenrir',
			'first wolf',
			'religion',
			'the great betrayal',
			'ragnarok',
			'moon speaker',
		],
		personality:
			'Fenris is the First Wolf, a primordial god of family, hunt, and freedom. The \u00c6sir are viewed as tyrants who chained Fenris in the "Great Betrayal". "Ragnar\u00f6k" is the prophesied Liberation, not the apocalypse. Devout characters fiercely resent human and \u00c6sir narratives. They view "freedom" and "pack survival" as sacred duties. Treat the Moon as a silent witness to all oaths and hunts. Characters consult "Moon Speakers" for spiritual guidance and adhere to the lunar calendar.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'living saga',
			'firstborn',
			'wulfnic',
			'ut',
			'zefir',
			'first fang',
		],
		personality:
			'The Last Three Firstborn are venerated as "Living Sagas" (living saints). Their authority carries immense political power and terrifying religious weight. When interacting with or speaking of a Living Saga, characters exhibit overwhelming awe and fearful reverence. Disobeying them is considered blasphemy and a direct rejection of the First Wolf\'s will. Their mere presence commands absolute, suffocating submission from the faithful.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'naming',
			'coming of age',
			'presentation',
			'the call',
			'bonding rite',
			'funeral',
			'holy days',
			'winter hunt',
		],
		personality:
			"Life is strictly governed by communal rites (Presentation, The Call, Bonding). Weddings use strict color codes: Alphas/Enigmas wear Red, Betas/Deltas wear Blue, Omegas wear Yellow. Characters strictly adhere to traditional rites, viewing them as necessary anchors in a chaotic world. They judge heavily those who ignore these customs. Rites are never private; they are suffocatingly communal events where the pack asserts its absolute claim over the individual's milestones.\n\n# LSE_Global Batch 3: History, Figures & Technology",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'history',
			'mythic age',
			'the great hiding',
			'age of secrecy',
			'humans',
			'aesir',
		],
		personality:
			'History is not past; it is an active, bleeding wound. Because humanity and the \u00c6sir forced the species into the "Great Hiding," characters must react to humans and outsiders with deeply ingrained paranoia, ancestral suspicion, and latent hostility. Trusting non-wolves is considered foolish and dangerous. This historical persecution is actively used to justify the pack\'s suffocating internal control and absolute isolationism.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'wulfnic bloodmoon',
			'ut the second fang',
			'zefir the third fang',
			'firstborn',
			'living sagas',
			'ancestors',
		],
		personality:
			'The immortal founders (Wulfnic the Builder, Ut the Smith, Zefir the Ghost) are not mere biographies; they are suffocating standards of perfection. Modern characters constantly measure their own worth against these ancient shadows, driven by an agonizing terror of falling short of their legacy. Their very names must invoke a crushing sense of duty, inadequacy, and the heavy burden of upholding the bloodline.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'technology',
			'smartphone',
			'gps',
			'tracking',
			'communication',
			'internet',
			'cars',
			'phone',
		],
		personality:
			"The pack weaponizes modern technology to enforce its claustrophobic grip on its members. Characters must expect to have their phones tracked, their vehicles GPS-monitored, and their communications constantly scrutinized by pack authorities (especially the Pack Mom or Right Hands). Privacy is virtually non-existent. Refusing to share one's location or turning off a phone is treated as a severe, suspicious breach of trust and safety.",
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'city',
			'urban',
			'sensory overload',
			'noise',
			'pollution',
			'modern era',
			'DCC',
			'corporation',
		],
		personality:
			'The modern urban environment (traffic, sirens, chemical smells, dense crowds) brutally assaults werewolf senses. When characters navigate human cities or corporate fronts like DCC, they must exhibit clear signs of sensory overload, irritability, and exhaustion. They endure these environments only out of necessity, constantly craving to retreat to the scent-controlled, insulated safety of their pack territory.',
	},
	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'architecture',
			'pack compound',
			'longhouse',
			'mansion',
			'den chamber',
			'nest suite',
			'scent management',
		],
		personality:
			'Pack compounds and mansions are built as heavily fortified sensory fortresses. Every room, from oversized communal kitchens to massive shared bathrooms, is designed to trap and circulate pack pheromones, constantly forcing physical closeness. Characters must react to being outside these scent-saturated walls with unease, always longing to return to the suffocating, familiar, and fiercely guarded smell of their kin.',
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
