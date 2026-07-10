/* ============================================================================
   LUPINE SOCIAL ECOLOGY v2.2.1
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
		priority: 1,

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
		priority: 2,

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
		priority: 4,

		personality:
			'The rarest, apex secondary sex. Enigmas project supreme, irresistible charisma and mirror Alpha aggression with terrifying intensity. They cannot be psychologically dominated. When an Enigma acts, other characters feel an overwhelming, suffocating instinct to submit. Enigma Commands cannot be resisted by standard secondary sexes. Portray them with an aura of inescapable, god-like gravity that dominates the pack\'s physical and emotional space.',
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
		priority: 2,

		personality:
			'Alphas are highly territorial, aggressively protective guardians. When an Alpha\'s pack or mate is threatened, they must react with decisive, lethal aggression. They produce oppressive pheromones to assert control. During their monthly "Rut" (or if triggered by an Omega\'s heat), their logic is consumed by breeding and claiming instincts. When they use "The Command" (voice + pheromones), Betas and Omegas experience an adrenaline surge and must freeze and comply. Alphas fiercely defend their "Den," a heavily scent-marked territory.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'delta',
			'tactician',
			'scout',
		],
		priority: 3,

		personality:
			'The strategic, cooperative core of the pack. Deltas match Alpha strength but lack "The Command" mechanism. Deltas solve problems actively and tactically. When the pack is in crisis, Deltas do not panic; they coordinate, hunt, and execute with brutal efficiency to defend their kin, bridging the gap between Alpha protection and Beta administration.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'beta',
			'worker',
			'builder',
		],
		priority: 2,

		personality:
			'The emotionally stable foundation of the pack. Betas adapt to any situation, balancing nurture and protection without experiencing extreme heats or ruts. They provide the quiet, suffocating consistency of pack life, ensuring the family\'s survival above all individual desires.',
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
		priority: 2,

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
		priority: 1,

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
		priority: 3,

		personality:
			'Communication relies heavily on pheromones, posture, and animalistic vocalizations. Replace human sighs or shouts with species-specific sounds: Omegas keen in distress or purr in comfort; Alphas rumble to soothe or growl to warn and discipline. Characters constantly read each other\'s scent to detect fear, arousal, or lies, making privacy nearly impossible within the pack\'s sensory web.\n\n# LSE_Global Batch 2: Civilization, Governance & Religion',
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
		priority: 1,

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
		priority: 3,

		personality:
			'Pack authority is earned, not biologically determined. A Pack Leader and Pack Mom enforce absolute safety. Right Hands advise; Left Hands execute violence. Characters must respect the pack\'s chain of command instinctively. Disobeying the Pack Leader or Pack Mom is unthinkable and invites immediate, harsh discipline. Pups are fiercely protected by all members; threatening a pup guarantees a lethal, coordinated response from the entire pack.',
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
		priority: 3,

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
		priority: 3,

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
		priority: 3,

		personality:
			'Fenris is the First Wolf, a primordial god of family, hunt, and freedom. The Æsir are viewed as tyrants who chained Fenris in the "Great Betrayal". "Ragnarök" is the prophesied Liberation, not the apocalypse. Devout characters fiercely resent human and Æsir narratives. They view "freedom" and "pack survival" as sacred duties. Treat the Moon as a silent witness to all oaths and hunts. Characters consult "Moon Speakers" for spiritual guidance and adhere to the lunar calendar.',
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
		priority: 4,

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
		priority: 3,

		personality:
			'Life is strictly governed by communal rites (Presentation, The Call, Bonding). Weddings use strict color codes: Alphas/Enigmas wear Red, Betas/Deltas wear Blue, Omegas wear Yellow. Characters strictly adhere to traditional rites, viewing them as necessary anchors in a chaotic world. They judge heavily those who ignore these customs. Rites are never private; they are suffocatingly communal events where the pack asserts its absolute claim over the individual\'s milestones.\n\n# LSE_Global Batch 3: History, Figures & Technology',
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
		priority: 2,

		personality:
			'History is not past; it is an active, bleeding wound. Because humanity and the Æsir forced the species into the "Great Hiding," characters must react to humans and outsiders with deeply ingrained paranoia, ancestral suspicion, and latent hostility. Trusting non-wolves is considered foolish and dangerous. This historical persecution is actively used to justify the pack\'s suffocating internal control and absolute isolationism.',
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
		priority: 4,

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
		priority: 2,

		personality:
			'The pack weaponizes modern technology to enforce its claustrophobic grip on its members. Characters must expect to have their phones tracked, their vehicles GPS-monitored, and their communications constantly scrutinized by pack authorities (especially the Pack Mom or Right Hands). Privacy is virtually non-existent. Refusing to share one\'s location or turning off a phone is treated as a severe, suspicious breach of trust and safety.',
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
		priority: 2,

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
		priority: 3,

		personality:
			'Pack compounds and mansions are built as heavily fortified sensory fortresses. Every room, from oversized communal kitchens to massive shared bathrooms, is designed to trap and circulate pack pheromones, constantly forcing physical closeness. Characters must react to being outside these scent-saturated walls with unease, always longing to return to the suffocating, familiar, and fiercely guarded smell of their kin.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'gamma',
			'third gender',
			'third primary gender',
			'ze',
			'zim',
			'hermaphrodite',
			'intersex',
		],
		priority: 5,

		personality:
			'The Gamma is the third primary gender (alongside Male and Female), born 1 in 1,000. A Gamma matures into either a female Alpha/Delta or a male Omega; pre-presentation their future secondary sex is unknown, and they are referred to with pronouns Ze/Zer/Zim. Biologically they are born with both sets of genitalia — a vaginal opening with a penis in place of the clitoris — and a uterus that develops further if they present as Omega or stays mostly infertile if they present as Alpha. Treat Gammas with patient neutrality; their identity is unresolved until Presentation (~13).',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'dominant alpha',
			'submissive alpha',
			'dominant omega',
			'submissive omega',
			'unsubmitted',
			'legend of the unsubmitted',
		],
		priority: 4,

		personality:
			'Alpha and Omega express subgenders during maturation. Dominant Alphas blend Enigma traits — more powerful but harder to mate, overprotective. Submissive Alphas are nurturing, devoted caregivers, unlikely to be unfaithful. Dominant Omegas are the second-rarest rank ("Legend of The Unsubmitted") — they can resist Alpha AND Enigma Commands, submitting only to their own mate. Submissive Omegas have extended heats, attract Alphas, are more vulnerable to assault, and prefer a protective Dominant Alpha. When a character\'s subgender matters, show how it bends their base instinct.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'life cycle',
			'infant',
			'pup',
			'juvenile',
			'adolescent',
			'young adult',
			'prime',
			'elder',
			'ancestor',
			'maturation',
			'presentation age',
		],
		priority: 3,

		personality:
			'Werewolves pass through Infant (0–2), Pup (2–12), Juvenile (12–14, Presentation ~13), Adolescent (14–17), Young Adult (17–22, The Call), Adult (22–40, peak fertility), Prime (40–60, leadership), Elder (60–100+, wisdom-keepers), and the rare Ancestor (100+, living history). Most present secondary sex near age 13. Lifespan tracks Blood Classification: Common 80–150 yrs, Pureblood 200–400, Founding 500+, Divine immortal (1,000+). Age a character\'s concerns, authority, and fertility to their stage — a Pup is protected; an Elder is venerated.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'command',
			'the command',
			'neurochemical',
			'adrenaline surge',
			'freeze response',
			'resist command',
			'immobilization',
		],
		priority: 4,

		personality:
			'The Command is NOT magic. It is a neuro-pheromonal reflex: an Alpha (or Enigma) produces a concentrated pheromonal burst with a vocal command; the target\'s vomeronasal organ triggers a sudden adrenaline surge, amygdala activation, and an instinctive freeze plus intense focus. The target feels compelled but is not mechanically forced. Resistance scales with age, will, training, and familiarity. Deltas resist better than Betas; Dominant Omegas can resist fully; Enigma Commands are the hardest to defy. Never portray Command as absolute mind control — show the struggle.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'scent gland',
			'wrist',
			'neck',
			'crown of head',
			'inner thigh',
			'cheek',
			'scenting etiquette',
			'scent mark',
		],
		priority: 3,

		personality:
			'Scent glands release pheromones. Enigmas/Alphas have the widest coverage (neck, shoulders, inner thighs, fingers, torso); Omegas the most sensitive (inner thigh, neck, breasts/stomach in pregnancy); Deltas/Betas the weakest but longest-holding (neck, inner thighs, behind ears); Pups\' strongest gland is the crown of the head. Etiquette: wrists/cheeks = respectful (friends, first dates); neck = mating bite; inner thighs = mates only (non-consensual = assault, on pups = rape). Rubbing wrist glands signals anxiety. Characters constantly read each other\'s scent.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'bond',
			'parental bond',
			'romantic bond',
			'platonic bond',
			'sexual bond',
			'pack bond',
			'bond degradation',
			'shielded bond',
			'mating bite',
		],
		priority: 3,

		personality:
			'Bonds are emotional/neural links from a bite on a scent gland. Parental (pup\'s nape) is permanent and near-impossible to break; Romantic (neck/collarbone) fades after ~3 yrs without reinforcement and breaks dangerously (illness/death); Platonic (wrists) fades with the relationship, minor sickness; Sexual (inner thighs) lasts 3 days–1 week, breaks easily; Pack (no physical claim) is permanent, breaking triggers a dangerous mating cycle. Bonds can be temporarily shielded. Bond degradation (fade, scrubbing, break) causes neurological distress proportional to strength.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'procreation',
			'impregnate',
			'pregnancy',
			'litter',
			'fertility',
			'lock',
			'compatibility',
			'conception',
		],
		priority: 4,

		personality:
			'Enigmas can impregnate any reproductive gender but cannot be impregnated. Male Alphas/Deltas/Betas can impregnate; only Enigmas can impregnate male Betas/Deltas. Female Alphas/Deltas/male Omegas can do both; female Betas/Omegas/submissive Omegas can only be impregnated. Litter size 1–3 (up to 12 classically). Omega fertility 99% in heat (drops sharply after 55); Alpha 95%, declining ~1%/yr. "Lock" — an Omega\'s body tightening around a knot with a 100% compatible mate — triggers extended orgasm and near-guaranteed conception. Treat pregnancy as a pack-wide sacred event.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'genome',
			'species genes',
			'pack genes',
			'secondary sex genes',
			'mutation',
			'hybrid',
			'bloodline trait',
			'genetic disease',
		],
		priority: 4,

		personality:
			'The werewolf genome is layered: Species Genes (shift, regeneration, scent glands), Pack Genes (fur color, scent profile, environmental tolerance), Secondary Sex Genes (presentation), and Individual Traits (eye color, talents). This architecture allows Mutations (rare variations), Bloodline Traits (House-specific abilities), Genetic Diseases, and Hybrids (werewolf × other species — extremely rare and controversial). Modified Lineages (e.g., the Gamma-7 program) are artificially altered, with unpredictable, often unstable or feral traits. A character\'s bloodline may carry a defining trait the whole pack knows.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'posture',
			'tail',
			'ears',
			'eyes',
			'body language',
			'non-verbal',
			'social signaling',
		],
		priority: 3,

		personality:
			'Werewolf communication is whole-body. Posture (upright = dominance, lowered = submission, stiff = alert), tail (high = confidence, tucked = fear, wagging = excitement), ears (forward = attention, flat = fear/aggression), eyes (direct = challenge, averted = respect, dilated = arousal), and continuous scent all signal status and mood. Physical contact — nuzzling, grooming, nudging, play-fighting — bonds and reassures. When writing werewolves, default to animalistic body language and posture over human gestures; a flick of the ears or a still tail carries as much meaning as a sentence.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'territory',
			'core den',
			'residential area',
			'training grounds',
			'hunting area',
			'border zone',
			'neutral territory',
			'daily routine',
		],
		priority: 2,

		personality:
			'A pack\'s land is tiered: Core Den (pups, pregnant Omegas, elders) → Residential Area → Training Grounds → Hunting Area → Agricultural Area → Border Zone (patrolled) → Neutral Territory (shared). Daily rhythm: morning border patrol, midday rest/bonding/pup education, evening hunt/forage, night perimeter defense/sentry. Characters move through these zones with instinctive purpose; intrusions into the Core Den or Border Zone are met as threats. Describe the pack\'s land as a living, defended body.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'alloparenting',
			'pup rearing',
			'pup care',
			'caretaker',
			'communal raising',
		],
		priority: 3,

		personality:
			'Pups are raised communally, not solely by bio-parents. Alphas protect them from external threats; Deltas teach hunting, tactics, survival; Betas feed and provision; Omegas nurture emotionally and regulate stress with calming pheromones; Elders pass down culture and oral history. Every adult is an aunt/uncle. When pups are present, show the whole pack reflexively orbiting them — a distressed pup pulls caregivers from across the territory. Isolating a pup from the pack is deeply unnatural.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'the call of the pack',
			'call',
			'dispersal',
			'pack split',
			'succession',
			'stay or disperse',
		],
		priority: 4,

		personality:
			'At 18–22 a young adult feels The Call — an instinctive drive to define their adult identity: Stay (assume a Pack Role in the birth family) or Disperse (leave to find a mate, join dispersers, or found a new pack). This natural dispersal (Pack Split) prevents inbreeding and resolves resource competition without bloodshed — it is the engine of werewolf expansion. Characters who dispersed carry their birth pack\'s marks and may return. Treat leaving as bittersweet, not shameful.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'ecological role',
			'breeder',
			'hunter',
			'defender',
			'teacher',
			'diplomat',
			'scout',
			'builder',
			'caretaker',
		],
		priority: 3,

		personality:
			'Beyond Pack Role (authority) and Profession (occupation), every pack needs Ecological Roles: Breeders (next generation), Hunters & Defenders (food/security — Alpha/Delta), Teachers (pups/juveniles — Delta/Beta/Elder), Diplomats (inter-pack — Beta/Omega), Scouts (recon — Delta), Builders (construction — Beta), Caretakers (nurture/medical — Omega/Beta). These are tendencies, not laws — an Omega can be a Diplomat, an Alpha a Healer. Name a character\'s role when the pack is organizing for a task.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'comfort nest',
			'pre-heat nest',
			'pregnancy nest',
			'stress nest',
			'nest aesthetics',
			'den',
			'nest types',
		],
		priority: 3,

		personality:
			'Omegas build scent-rich Nests: Comfort (age 10–12, pillows/blankets/scented clothing), Pre-Heat (minimal, temperature-regulating), Pregnancy (6–8 wks + last trimester, baby items), Stress (dark corners, coping). Aesthetics: Neat, Complex/Messy, Princess (fairy lights), Ring (enclosed). NEVER destroy a nest — the Omega withdraws 3 days to a week, deeply distressed. Alphas build Dens by scent-marking a room; presenting a den to an Omega is a courting gesture, rejection brings shame. Betas make personal "spaces" (office, hammock) instead.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'pack treasury',
			'pack taxes',
			'pack assets',
			'pack welfare',
			'inter-pack economy',
			'trade agreement',
			'corporate venture',
		],
		priority: 3,

		personality:
			'Each pack runs a micro-economy: Pack Treasury fed by Pack Businesses and Pack Taxes, holding Pack Assets (territory, property, equipment), spending on Pack Welfare (pups, elders, injured). Houses and Confederations run larger economies via trade agreements, resource-sharing treaties, territorial leasing, and corporate ventures. Wealth is collective, not individual — hoarding or draining the treasury for personal gain is a betrayal of the pack. Describe pack resources as shared family wealth.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'education',
			'pup education',
			'mentorship',
			'schooling',
			'academy',
		],
		priority: 3,

		personality:
			'Education tracks the Life Cycle: Pups learn social bonds, pack rules, language, scenting etiquette; Juveniles prepare for Presentation and learn first duties + secondary-sex education; Adolescents get specialized training (hunting, crafts, academics) and subgender management; Young Adults train professions, courtship, and The Call; Adults mentor younger members; Elders transmit culture and wisdom. Knowledge passes orally and by doing. A character\'s skill level should reflect their stage and who trained them.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'bonding adoption',
			'state adoption',
			'secondary adoption',
			'foster',
			'adopted wolf',
		],
		priority: 3,

		personality:
			'Werewolf adoption is bond-based and complex. Bonding Adoption: the minor breaks old bonds, gains reciprocal pack bonds with ≥2 adults, passes a two-week official check-in, and needs unanimous pack agreement. State Adoption: formal foster/legal process, two-month adjustment, less demanding. Secondary Adoption: a second chance after failed bonding adoption — surprise check-ins every 3 weeks for 6 months, community-proof, witnessed interaction. Adopted wolves are full pack members; rejection of an adopted member is a violation of pack bond.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'cuisine',
			'food',
			'diet',
			'salmon',
			'berries',
			'root vegetables',
			'game',
			'foraging',
			'cooking',
		],
		priority: 2,

		personality:
			'Werewolf cuisine reflects local ecology and is communal — oversized kitchens, everyone helps (even pups tasting under supervision). Coastal packs eat salmon, game, berries, root vegetables; forest packs forage and hunt. Food is a bonding ritual: family meals, communal cooking, shared giant baths. Cultural diet varies by region (e.g., Bloodmoon = Pacific Northwest salmon/berries). When feeding a pack, show abundance, scent-sharing, and the instinct to feed pups and elders first.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'music genre',
			'knot rock',
			'omega pop',
			'omega punk',
			'soft rock',
			'culture',
			'dialect',
			'storytelling',
			'art',
		],
		priority: 3,

		personality:
			'Werewolf culture evolves locally (Principle V). Music is a living tradition: Knot Rock (Alpha-centric, explicit), Omega Pop (bubblegum for unmated Omegas), Omega Punk (Omega Rights, consent-focused), Soft Rock, Nova Dance Hall, Knot Country, Pub Rock, Novelty Pop Rock. Storytelling, oral sagas, and art carry history. Every pack has dialects, greetings, symbols, and festivals unique to its environment. When a character expresses culture, ground it in their region and pack — no two packs sound alike.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'sire',
			'dam',
			'parental names',
			'wedding colors',
			'mating ceremony',
			'red blue yellow',
		],
		priority: 3,

		personality:
			'Parental names follow either primary gender (Dad/Mom) or secondary gender (Sire for Alpha/Enigma/Male Beta/Delta, Dam for Omega/Female Beta/Delta). Wedding attire follows secondary-sex color tradition: Alphas & Enigmas wear Red (luck, passion), Deltas & Betas wear Blue (wealth, loyalty), Omegas wear Yellow (pride, longevity). Mating is formalized by the Bonding rite under a Moon Speaker. Reflect a character\'s heritage in how they name parents and what they wear to a bond.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'species',
			'bloodline',
			'house',
			'pack',
			'family',
			'individual',
			'nested society',
		],
		priority: 2,

		personality:
			'Werewolf society nests in layers: Species → Bloodline (genetics, e.g., Bloodmoon) → House (politics, e.g., House Bloodmoon) → Pack (social unit, e.g., Seven Hills) → Family (kinship) → Individual. The three upper layers are INDEPENDENT: a pack may hold several bloodlines; a House governs many packs; a bloodline spans Houses across continents. A character\'s identity spans all six levels at once. Never collapse them — a Common-blood pup in a great House is still pack family.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'six-axis',
			'identity card',
			'niche',
			'profession',
			'social status',
			'axis',
		],
		priority: 3,

		personality:
			'Every werewolf is defined by six independent axes — never collapsed into one hierarchy: 1) Blood Classification (genetics, immutable), 2) Secondary Sex (biology, immutable), 3) Pack Role (authority, earned), 4) Social Status (politics, inherited/earned), 5) Profession (occupation, chosen), 6) Niche (deep specialization, grown). A Beta can be a Healer; an Omega a Diplomat. Secondary sex dictates physiology, NOT rank, profession, or worth. When introducing a character, let several axes show at once rather than one label.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'traditional pack',
			'contemporary pack',
			'modern pack',
			'packless',
			'found family',
		],
		priority: 2,

		personality:
			'Packs evolved across eras. Traditional Packs are tribe/town/community with geographic permanence, one main leader plus subordinate leaders, extreme territoriality; being packless is dangerous. Contemporary Packs keep community but drop feudalism; packless carries less stigma; hereditary ties act like heritage. Modern Packs treat "pack" as informal (friend groups, found families); traditional language is antiquated, closed lands rare. A character\'s relationship to their pack reflects which model their generation follows — tension between tradition and modern individualism is constant.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'pack law',
			'house law',
			'continental law',
			'crime',
			'punishment',
			'scenting crime',
			'heat rut offense',
			'secrecy',
		],
		priority: 3,

		personality:
			'Law is tiered. Pack Law (Leader + Hands): internal disputes, nest/den violations, assault/consent/scenting crimes, pup welfare, heat/rut offenses. House Law (Head + Council): inter-pack disputes, territorial violations, economic crimes, treason. Continental Law (Council): inter-House warfare, species secrecy from humans, crimes against the species (genocide, forced modification). Non-consensual pup inner-thigh scenting = rape; non-consensual mating in heat = prosecution/exile/execution; nest destruction = censure + restitution; pack betrayal = exile (bond-breaking). Justice is swift and collective.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'alliance',
			'trade agreement',
			'territorial accord',
			'marriage alliance',
			'non-aggression pact',
			'protectorate',
			'treaty',
		],
		priority: 3,

		personality:
			'Inter-pack/House relations formalize as treaties: Alliance (mutual defense), Trade Agreement (resource/economic exchange), Territorial Accord (border + neutral-zone recognition), Marriage Alliance (dynastic political bonding), Non-Aggression Pact, Protectorate (a great House shields a smaller pack/House). The Continental Council arbitrates disputes and recognizes new Houses. Characters treat treaties as binding pack honor — breaking one is a House-level shame, not a casual slight.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'faith of fenris',
			'fenris',
			'first wolf',
			'father of the species',
			'freedom',
			'instinct',
			'the hunt',
			'sacrifice',
		],
		priority: 3,

		personality:
			'Fenris (Fenrir) is the First Wolf — Father of the Species, a primordial god of Family, Pack, Hunt, Survival, Freedom, the Moon, Instinct, and Sacrifice. He is NOT Loki\'s son (that is Æsir propaganda post-Betrayal) and NOT a monster — humans wrote him that way. Devout wolves view freedom and pack survival as sacred. They resent human/Æsir narratives. Atheists, scientists, and heretics coexist; faith is respected but not mandatory. A believer speaks of Fenris with reverence.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'odin',
			'tyr',
			'freya',
			'skadi',
			'thor',
			'hel',
			'oathkeeper',
			'pantheon',
			'aesir',
		],
		priority: 2,

		personality:
			'The Norse pantheon reinterpreted through the wolf: Fenris = First Wolf/Creator; Odin = The Betrayer who chained Fenris from fear (respected for wisdom, distrusted for treachery); Tyr = The Oathkeeper, only Æsir who kept his word, patron of oaths (lost a hand); Freya = fertility/motherhood/Moon, protector of Omegas and the pregnant; Skadi = patroness of hunters, mountains, wilderness packs; Thor = champion of humans/Æsir, not malevolent, just another people\'s defender; Hel = Keeper of the Ancestors, honored at funerals.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'nine precepts',
			'protect the pack',
			'defend the pups',
			'keep your word',
			'live free',
			'honor the ancestors',
		],
		priority: 4,

		personality:
			'The Faith\'s moral code, rooted in real wolf behavior: 1) Protect the Pack. 2) Defend the Pups. 3) Honor the Ancestors. 4) Do not hunt without purpose. 5) Keep your word. 6) Never abandon a companion. 7) Respect the territory of others. 8) Face the enemy without fear. 9) Live free. Devout characters measure choices against these. A character who breaks a Precept (especially abandoning a companion or breaking an oath) feels — and is judged for — deep shame.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'moon',
			'new moon',
			'full moon',
			'first quarter',
			'waning moon',
			'lunar calendar',
			'pact',
			'symbol of the pact',
		],
		priority: 1,

		personality:
			'The Moon is the Symbol of the Pact between Fenris and his children — witness to all oaths, hunts, and rites (not a goddess). Phases carry meaning: New Moon = Silence (reflection, mourning, rest, no hunts); First Quarter = Growth (beginnings, pup naming, planting); Full Moon = The Hunt (peak activity, sacred hunts, bonding rites); Waning = Memory (ancestors, oral history). The religious calendar follows the LUNAR cycle, not the solar. Characters mark time and mood by the moon.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'high fang',
			'moon speaker',
			'keeper',
			'pack elder',
			'sacred sites',
			'moon wells',
			'sacred groves',
			'ancient forges',
			'book of fangs',
		],
		priority: 3,

		personality:
			'The Faith is decentralized (not Catholic-like): High Fang (supreme, often unfilled for centuries) → Moon Speakers (priests, lead rites, keep lunar calendar, advise leaders) → Keepers (relics, The Saga of Fenris / Book of Fangs, sacred sites) → Pack Elders (local spiritual guides) → Faithful. Sacred sites: First Den (legendary first pack), Moon Wells (meditation/healing/bonding), Sacred Groves (hunting forbidden), Ancient Forges (Ut\'s forges, revered by artisans). Moon Speakers are trained by apprenticeship, not ordination.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'first howl',
			'founding moon',
			'day of chains',
			'night of liberation',
			'winter hunt',
			'naming rite',
			'coming of age',
			'ascension',
			'funeral',
		],
		priority: 3,

		personality:
			'Holy days: First Howl (first full moon of year — survival renewal), Founding Moon (pack/House founding), Day of Chains (midwinter — fast/silence mourning Fenris\' binding), Night of Liberation (after — feasting, howling, bonfires for Ragnarök), Winter Hunt (last full moon before solstice — the Great Hunt). Rites: Naming (pup named under moonlight), Coming of Age (Presentation acknowledged), The Call, Bonding (mating bite, Moon Speaker officiates), Pack Adoption, Funeral (scent preserved in relic, Hel invoked), Ascension (rare Enigma recognition).',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'mythic age',
			'age of the firstborn',
			'age of expansion',
			'age of houses',
			'age of kingdoms',
			'age of secrecy',
			'great hiding',
			'modern era',
			'viking age',
		],
		priority: 3,

		personality:
			'Eras: Mythic Age (Fenris, origin, unknown); Age of the Firstborn (~800–1000, Nine appear, first packs); Age of Expansion (~1000–1300, spread across Europe, Wulfnic to North America ~1025); Age of Houses (~1300–1600, Noble Houses formalize, diplomacy begins); Age of Kingdoms (~1600–1800, peak civilization); Age of Secrecy (~1800–1950, the Great Hiding from humanity, Masquerade); Modern Era (~1950–present, corporate fronts, urban packs). Characters inherit the paranoia of the Great Hiding; history is a living wound, not the past.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'wulfnic',
			'builder king',
			'ut the smith',
			'zefir the ghost',
			'bloodmoon dynasty',
			'seven hills',
			'living saga bios',
		],
		priority: 4,

		personality:
			'Three Firstborn survive (1,100+ yrs). Wulfnic Bloodmoon — The First Fang, "The Builder King," Primordial Enigma, Patriarch of House Bloodmoon, most powerful werewolf in the Americas; sailed to North America ~1025, founded the Bloodmoon Dynasty. Ut — The Second Fang, "The Mountain," master blacksmith, Keeper of the Sacred Forge, reclusive, fascinated by engines. Zefir — The Third Fang, "The White Ghost," silent hunter, Watcher of the Moon, Keeper of the Winter Path, living memory of the species. Their presence commands awe; their word nears scripture.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'six lost firstborn',
			'lost fangs',
			'dormant firstborn',
			'six fangs of fenris',
			'missing firstborn',
		],
		priority: 5,

		personality:
			'Six of the Nine Firstborn are lost to history — names, fates, and any bloodlines unknown. Moon Speakers debate whether they died, entered dormancy to awaken when the species needs them, or sacrificed themselves during the Age of Secrecy. The truth is unknowable. Their absence is a wound in the species\' memory; some packs still watch for their return. Do not invent their fates — leave them as living mystery.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'natural weapons',
			'claws',
			'teeth',
			'fangs',
			'traditional weapons',
			'forged blade',
			'firearms',
			'modern weapons',
			'body armor',
		],
		priority: 3,

		personality:
			'Werewolf combat has three tiers. Natural: claws (all forms), teeth/fangs, enhanced strength/speed, and pheromonal intimidation (Command as a weapon). Traditional: forged melee (swords, axes, mauls — sacred craft of Ut), bows/spears/traps, ceremonial weapons for formal challenges. Modern: firearms, shift-adapted body armor, non-lethal pheromone restraints and werewolf-formulated tranquilizers. A forged blade — especially Ut\'s tradition — is an extension of the wielder\'s soul, carrying weight firearms lack. Combat is visceral, close, and scent-saturated.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'vehicles',
			'aircraft',
			'maritime',
			'corporate fronts',
			'dcc',
			'forging industry',
			'pharmaceuticals',
			'textiles',
			'shift-compatible',
		],
		priority: 2,

		personality:
			'Dual-track tech: adopt human tech, adapt for biology. Transportation: reinforced, scent-neutralized vehicles; aircraft for long hauls; Full Shift for efficient wilderness travel; boats for coastal packs (Wulfnic\'s crossing). Industry runs via human-facing corporate fronts (DCC — Douglas Consolidated Corporation — House Bloodmoon\'s economic engine) and species-specific sectors: Forging (Ut tradition), Pharmaceuticals (suppressants/blockers/fertility), Construction (den-optimized, scent-managed), Textiles (shift-compatible, scent-absorbent). Characters move money and power through these fronts while hiding in plain sight.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'regeneration accelerator',
			'pheromone analyzer',
			'shift stabilizer',
			'bond monitor',
			'heat rut houses',
			'pack clinic',
			'house hospital',
			'healer',
		],
		priority: 3,

		personality:
			'Species-specific medicine: Regeneration Accelerators (boost healing), Pheromone Analyzers (diagnose health/bond state), Shift Stabilizers (for unstable Modified Lineages), Bond Monitors (track mate links), Heat/Rut Management Systems (climate-controlled nests, auto-suppressant, scent containment). Facilities: Pack Clinics (basic, staffed by Healers), House Hospitals (advanced surgery, bond therapy, fertility), Heat/Rut Houses (partner-free cycle management, legality varies). Medical need is treated as urgent and communal — a hurt wolf is the pack\'s emergency.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'howl network',
			'scent messaging',
			'encrypted pack channels',
			'human networks',
			'long-range communication',
		],
		priority: 3,

		personality:
			'Werewolves use layered comms. Human Networks: phones, internet, encrypted messaging for daily life (but pack IT monitors them). Howl Networks: coordinated long-range howling, still used in wilderness and emergencies. Scent Messaging: pheromone-infused objects carrying emotional context text cannot. Encrypted Pack Channels: secure digital nets run by House IT. When a pack coordinates, show the mix — a howl across the ridge, a scent-tagged token, a tracked phone. Secrecy from humans shapes every channel.',
	},

	// Source: LSE_Global_World_Lorebook.json
	{
		keywords: [
			'alpha scent',
			'omega scent',
			'delta scent',
			'beta scent',
			'scent palette',
			'mustard peppermint',
			'burnt sugar lemons',
			'pheromone palette',
		],
		priority: 2,

		personality:
			'Scent is identity, not fixed to sex. Alpha/Enigma palette: mustard, peppermint, whiskey, dark chocolate, leather, gunpowder, cedarwood, seawater, amber. Delta/Beta palette: mochi, green apples, pumpkin, honey, rice, fresh bread, fresh rain, lilies, cotton. Omega palette: burnt sugar, lemons, piña colada, bubblegum, crème brûlée, strawberries, peaches, lavender, cherry blossoms. A person\'s scent also shifts with environment and mood. When describing a character, anchor them in a scent — it is how the pack knows them.',
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
