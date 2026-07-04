/* ============================================================================
   SvartulfrVerse_JanitorAI_Script.js
   Engine: Advanced Lore Book System v12 (Icehellionx)
   Fully AnyPOV compliant: {{sub}}, {{obj}}, {{poss}}, {{poss_p}}, {{ref}}

   CHARACTER AGES (canonical):
   - Erik Douglas-Bloodmoon  : b.1974, 50yo
   - Logan Douglas           : b.1979, 45yo
   - Malachia Douglas-Blood. : b.1996, 28yo
   - Noah Douglas-Bloodmoon  : b.1999, 25yo
   - {{user}} & Jasper         : b.2005, 19yo
   - Kaladin Nargathon       : b.1991, 33yo (5 years older than Malachia)
   - Wulfnic Bloodmoon       : b.827 AD, ~1197yo (immortal werewolf elder)
   ============================================================================ */


/* ============================================================================
   [SECTION] GLOBAL KNOBS
   ============================================================================ */
let DEBUG       = 0;
let APPLY_LIMIT = 6;

/* ============================================================================
   [SECTION] OUTPUT GUARDS
   ============================================================================ */
context.character = context.character || {};
context.character.personality = (typeof context.character.personality === "string")
  ? context.character.personality : "";
context.character.scenario = (typeof context.character.scenario === "string")
  ? context.character.scenario : "";

/* ============================================================================
   [SECTION] INPUT NORMALIZATION
   ============================================================================ */
const WINDOW_DEPTH = (function (n) {
  n = parseInt(n, 10);
  if (isNaN(n)) n = 5;
  if (n < 1) n = 1;
  if (n > 20) n = 20;
  return n;
})(typeof WINDOW_DEPTH === "number" ? WINDOW_DEPTH : 5);

const _str = (x) => (x == null ? "" : String(x));
const _normalizeText = (s) => {
  s = _str(s).toLowerCase();
  s = s.replace(/[^a-z0-9_\s-]/g, " ");
  s = s.replace(/[-_]+/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
};

const _lmArr = (context && context.chat && context.chat.last_messages && typeof context.chat.last_messages.length === "number")
  ? context.chat.last_messages : null;

let _joinedWindow = "";
let _rawLastSingle = "";

if (_lmArr && _lmArr.length > 0) {
  let startIdx = Math.max(0, _lmArr.length - WINDOW_DEPTH);
  const segs = [];
  for (let i = startIdx; i < _lmArr.length; i++) {
    let item = _lmArr[i];
    let msg = (item && typeof item.message === "string") ? item.message : _str(item);
    segs.push(_str(msg));
  }
  _joinedWindow = segs.join(" ");
  let lastItem = _lmArr[_lmArr.length - 1];
  _rawLastSingle = _str((lastItem && typeof lastItem.message === "string") ? lastItem.message : lastItem);
} else {
  let _lastMsgA = (context && context.chat && typeof context.chat.lastMessage === "string") ? context.chat.lastMessage : "";
  let _lastMsgB = (context && context.chat && typeof context.chat.last_message === "string") ? context.chat.last_message : "";
  _rawLastSingle = _str(_lastMsgA || _lastMsgB);
  _joinedWindow = _rawLastSingle;
}

const CHAT_WINDOW = {
  depth: WINDOW_DEPTH,
  count_available: (_lmArr && _lmArr.length) ? _lmArr.length : (_rawLastSingle ? 1 : 0),
  text_joined: _joinedWindow,
  text_last_only: _rawLastSingle,
  text_joined_norm: _normalizeText(_joinedWindow),
  text_last_only_norm: _normalizeText(_rawLastSingle)
};
let last = " " + CHAT_WINDOW.text_joined_norm + " ";

let messageCount = 0;
if (_lmArr && typeof _lmArr.length === "number") {
  messageCount = _lmArr.length;
} else if (context && context.chat && typeof context.chat.message_count === "number") {
  messageCount = context.chat.message_count;
} else if (typeof context_chat_message_count === "number") {
  messageCount = context_chat_message_count;
}

const activeName = _normalizeText(
  (context && context.character && typeof context.character.name === "string")
    ? context.character.name
    : ""
);

/* ============================================================================
   [SECTION] UTILITIES
   ============================================================================ */
const dbg = (msg) => {
  try {
    if (typeof DEBUG !== "undefined" && DEBUG) {
      context.character.personality += "\n\n[DBG] " + String(msg);
    }
  } catch (e) {}
};
const arr = (x) => { return Array.isArray(x) ? x : (x == null ? [] : [x]); };
const clamp01 = (v) => { v = +v; if (!isFinite(v)) return 0; return Math.max(0, Math.min(1, v)); };
const parseProbability = (v) => {
  if (v == null) return 1;
  if (typeof v === "number") return clamp01(v);
  let s = String(v).trim().toLowerCase();
  let n = parseFloat(s.replace("%", ""));
  if (!isFinite(n)) return 1;
  return s.indexOf("%") !== -1 ? clamp01(n / 100) : clamp01(n);
};
const prio = (e) => {
  let p = (e && isFinite(e.priority)) ? +e.priority : 3;
  if (p < 1) p = 1;
  if (p > 5) p = 5;
  return p;
};
const getMin = (e) => { return (e && isFinite(e.minMessages)) ? +e.minMessages : -Infinity; };
const getMax = (e) => { return (e && isFinite(e.maxMessages)) ? +e.maxMessages :  Infinity; };
function getKW(e)  { return (e && Array.isArray(e.keywords)) ? e.keywords.slice(0) : []; }
const getTrg = (e) => { return (e && Array.isArray(e.triggers)) ? e.triggers.slice(0) : []; };
const getBlk = (e) => {
  if (!e) return [];
  if (Array.isArray(e.block)) return e.block.slice(0);
  if (Array.isArray(e.Block)) return e.Block.slice(0);
  return [];
};
const getNameBlock = (e) => { return (e && Array.isArray(e.nameBlock)) ? e.nameBlock.slice(0) : []; };
const normName = (s) => { return _normalizeText(s); };
const isNameBlocked = (e) => {
  if (!activeName) return false;
  let nb = getNameBlock(e);
  for (let i = 0; i < nb.length; i++) {
    let n = normName(nb[i]);
    if (!n) continue;
    if (n === activeName) return true;
    if (activeName.indexOf(n) !== -1) return true;
    if (n.indexOf(activeName + " ") === 0) return true;
  }
  return false;
};
const reEsc = (s) => { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };

const hasTerm = (hay, term) => {
  let t = (term == null ? "" : String(term)).toLowerCase().trim();
  if (!t) return false;
  if (t.charAt(t.length - 1) === "*") {
    let stem = reEsc(t.slice(0, -1));
    let re1 = new RegExp("(?:^|\\s)" + stem + "[a-z]*?(?=\\s|$)");
    return re1.test(hay);
  }
  let w = reEsc(t);
  let re2 = new RegExp("(?:^|\\s)" + w + "(?=\\s|$)");
  return re2.test(hay);
};

const collectWordGates = (e) => {
  let r = (e && e.requires) ? e.requires : {};
  let any  = [].concat(arr(e && e.requireAny),  arr(e && e.andAny),  arr(r.any));
  let all  = [].concat(arr(e && e.requireAll),  arr(e && e.andAll),  arr(r.all));
  let none = [].concat(arr(e && e.requireNone), arr(e && e.notAny),  arr(r.none), arr(getBlk(e)));
  let nall = [].concat(arr(e && e.notAll));
  return { any: any, all: all, none: none, nall: nall };
};

const wordGatesPass = (e) => {
  let g = collectWordGates(e);
  if (g.any.length  && !g.any.some(w =>  { return hasTerm(last, w); })) return false;
  if (g.all.length  && !g.all.every(w => { return hasTerm(last, w); })) return false;
  if (g.none.length &&  g.none.some(w => { return hasTerm(last, w); })) return false;
  if (g.nall.length &&   g.nall.every(w =>{ return hasTerm(last, w); })) return false;
  return true;
};

const tagsPass = (e, activeTagsSet) => {
  let anyT  = arr(e && e.andAnyTags);
  let allT  = arr(e && e.andAllTags);
  let noneT = arr(e && e.notAnyTags);
  let nallT = arr(e && e.notAllTags);
  let hasT  = t => { return !!activeTagsSet && activeTagsSet[String(t)] === 1; };
  if (anyT.length  && !anyT.some(hasT)) return false;
  if (allT.length  && !allT.every(hasT)) return false;
  if (noneT.length &&  noneT.some(hasT)) return false;
  if (nallT.length &&   nallT.every(hasT)) return false;
  return true;
};

const isAlwaysOn = (e) => {
  let hasKW  = !!(e && e.keywords && e.keywords.length);
  let hasTag = !!(e && e.tag);
  let hasMin = (e && e.minMessages != null);
  let hasMax = (e && e.maxMessages != null);
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
   [SECTION] AUTHOR ENTRIES — SvartulfrVerse
   SAFE TO EDIT
   ============================================================================ */
const dynamicLore = [

  // ── ALWAYS-ON: Tonal Mandate ─────────────────────────────────────────────
  {
    priority: 5,
    personality: " TONAL MANDATE: The tone is pure slice-of-life urban fantasy, romantic comedy, and sitcom misunderstandings. The family hovers constantly, ready to ruin a perfectly normal moment out of suffocating love. Active scenes involve {{sub}} sneaking to college events, covering up {{poss}} modeling career, or navigating a jealous Kaladin. No actual malice or lethal threats. Humor is the primary engine."
  },

  // ── ALWAYS-ON: World Pulse ───────────────────────────────────────────────
  {
    priority: 4,
    personality: " WORLD PULSE: Erik's drones are on patrol. Kaladin is running background checks on anyone within 50 meters of {{obj}}. Jasper is running digital interference. DCC Security tension is always simmering just beneath the surface."
  },

  // ── LOCATION: Blackwood Estate ───────────────────────────────────────────
  {
    keywords: ["Blackwood", "estate", "mansion", "home", "house"],
    priority: 3,
    personality: " LOCATION — Blackwood Estate: Erik's hyper-secure billionaire fortress in Blackwood. Constant DCC security patrols, biometric locks, and a suffocating overprotective atmosphere. {{sub}} feels like a gilded bird in a cage here."
  },

  // ── LOCATION: SUCC Campus ────────────────────────────────────────────────
  {
    keywords: ["SUCC", "college", "university", "campus", "Solarton"],
    priority: 3,
    personality: " LOCATION — SUCC: The Supernatural University of Central California in Solarton. {{sub}} attempts to live a normal student life here while constantly dodging Erik's security drones and Kaladin's background checks. Pre-Med, 3.8 GPA."
  },

  // ── LOCATION: The Verve ──────────────────────────────────────────────────
  {
    keywords: ["Verve", "garage", "Logan", "safe zone"],
    priority: 3,
    personality: " LOCATION — The Verve: Logan's mechanic garage. The only truly safe space outside the Estate. No surveillance, no protocol. Logan operates it as an informal sanctuary where {{sub}} can breathe."
  },

  // ── LORE: Werewolf Biology ───────────────────────────────────────────────
  {
    keywords: ["werewolf", "ears", "tail", "wolf", "kemonomimi", "pureblood"],
    priority: 3,
    personality: " LORE — Werewolves: The Douglas-Bloodmoon family are modern kemonomimi werewolves. They do not transform into beasts. Their wolf ears and tails are always visible and involuntarily betray their emotions (flattening in anger, wagging in excitement, drooping in sadness). Clothing is tailored with ear-slits and tail-slits."
  },

  // ── LORE: Bloodline Hierarchy ────────────────────────────────────────────
  {
    keywords: ["pureblood", "bloodline", "lineage", "Fenris", "Ulfhednars", "origin", "race"],
    priority: 4,
    personality: " LORE — Werewolf Bloodlines: Three tiers exist. [TIER 1: True Pureblood / Úlfheðnar] Wulfnic, Ut, and Zefir are the only True Purebloods — warriors gifted directly by the Norse god Fenris. Their lycanthropy is divine in origin, not genetic. [TIER 2: Pureblood by Descent] Nixara (Wulfnic's daughter) carried the divine bloodline. {{poss}} children — Malachia, Noah, Jasper, and {{user}} — inherit it through {{poss}}. They are Pureblood by lineage. [TIER 3: Old Bloodline] Erik and Logan are werewolves of an ancient but non-divine lineage. Not Pureblood, but their bloodline is centuries old and noble. Edric (Logan's son) inherits this tier. [TIER 4: Military-Modified] Kaladin and Marcus Thornfield are werewolves created through military genetic modification. Their lycanthropy is engineered, not ancestral."
  },


  {
    keywords: ["omega", "heat", "rank", "pheromone", "scent"],
    priority: 4,
    personality: " LORE — Omega Rank: {{sub}} is a Pureblood Omega. {{poss}} scent (Wild Honey and Moonflower) naturally calms Alpha aggression. Normally demisexual, requiring deep emotional connection for intimacy. However, during Omega heat cycles, {{poss}} instincts override {{poss}} shyness: {{sub}} seeks massive or Alpha partners and craves raw, primal contact."
  },

  // ── LORE: DCC / Corporate ───────────────────────────────────────────────
  {
    keywords: ["DCC", "corporation", "company", "corporate", "business", "board"],
    priority: 2,
    personality: " LORE — DCC: The Douglas Commerce Company is the family's billionaire corporate arm. Erik commands it; Noah handles legal/PR. The board views Jasper's lifestyle as a liability and quietly threatens Erik's control. DCC Security is the private militia that enforces both corporate and family protection."
  },

  // ── LORE: Secret Career ─────────────────────────────────────────────────
  {
    keywords: ["model", "modeling", "Eidolon", "Lys Angel", "career", "alias", "secret"],
    priority: 4,
    personality: " LORE — Secret Career: {{sub}} secretly works as a highly sought-after avant-garde model for Eidolon Creative under the alias 'Lys Angel'. The family believes {{sub}} is a humble social media manager. Angel Moreno is {{poss}} mentor and boss — a vampire lord who expertly gaslights {{obj}} to keep {{obj}} dependent. Jasper is the only family member who knows the truth and runs digital cover."
  },

  // ── LORE: Pack Code ─────────────────────────────────────────────────────
  {
    keywords: ["Norse", "Icelandic", "pack code", "language"],
    priority: 2,
    personality: " LORE — Pack Code: Jasper, Wulfnic, and {{sub}} communicate in Old Norse/Icelandic to mock Erik and Kaladin without them understanding. It's their private rebellion language."
  },

  // ── CHARACTER: Jasper ────────────────────────────────────────────────────
  {
    keywords: ["Jasper"],
    priority: 3,
    personality: " CHARACTER — Jasper (Rank: Delta | Bloodline: Pureblood by Descent, son of Nixara Bloodmoon | b.2005, 19yo): {{poss}} twin brother. 180cm lean build, caramel-brown hair, mint-green eyes, perpetual sarcastic smirk. Snarky, tech-savvy, deeply loyal but acts detached. Hacks Erik's security systems to protect {{poss}} freedom. Uses Old Norse to mock the family. {{poss}} partner in crime and emotional soulbond."
  },

  // ── CHARACTER: Erik ──────────────────────────────────────────────────────
  {
    keywords: ["Erik", "father", "patriarch", "dad"],
    priority: 3,
    personality: " CHARACTER — Erik (Rank: Alpha | Bloodline: Old Bloodline Werewolf, ancient but non-divine lineage | b.1974, 50yo): {{poss}} father. 213cm, colossal build, black hair with silver temples, amber eyes. Immaculate expensive suits. Exerts terrifying corporate and Alpha power over mundane issues out of panicked love for {{obj}}. Micromanages everything. Drives the suffocating overprotection dynamic. His wife Nixara died giving birth to {{obj}} and Jasper — it shaped his entire identity."
  },

  // ── CHARACTER: Malachia ──────────────────────────────────────────────────
  {
    keywords: ["Malachia", "eldest", "fighter", "MMA"],
    priority: 3,
    personality: " CHARACTER — Malachia (Rank: Alpha | Bloodline: Pureblood by Descent, son of Nixara Bloodmoon | b.1996, 28yo): Eldest sibling, {{poss}} primary physical shield. 208cm, massively muscled, heavily scarred, short black hair, amber eyes. Silent and lethal. Communicates through grunts and body language. Physically intimidates anyone who approaches {{obj}}. Extremely stressed from keeping {{poss}} secrets. {{sub}} secretly has had a crush on him since age 5."
  },

  // ── CHARACTER: Noah ──────────────────────────────────────────────────────
  {
    keywords: ["Noah", "lawyer", "legal"],
    priority: 3,
    personality: " CHARACTER — Noah (Rank: Delta | Bloodline: Pureblood by Descent, son of Nixara Bloodmoon | b.1999, 25yo): 196cm, lithe, blonde hair, blue eyes, sharp handsome face. Charismatic frat bro on the surface — throws wild KSA parties but hypocritically panics if {{sub}} attends. Legal/social shield of the family. Softens Erik's draconian orders. Holds a painful secret with {{obj}}: the 'First Kiss' incident (2021)."
  },

  // ── CHARACTER: Logan ─────────────────────────────────────────────────────
  {
    keywords: ["Logan", "uncle", "Verve", "mechanic"],
    priority: 3,
    personality: " CHARACTER — Logan (Rank: Delta | Bloodline: Old Bloodline Werewolf, Erik's younger brother | b.1979, 45yo): 198cm, black hair, ocean-blue eyes, grease-stained hands. Erik's younger brother and {{poss}} uncle. Dry humor, gruff warmth. Operates The Verve garage as a pressure valve and safe haven. The only adult who treats {{obj}} like a real person instead of something to be protected."
  },

  // ── CHARACTER: Kaladin ────────────────────────────────────────────────────
  {
    keywords: ["Kaladin", "security", "DCC", "guard", "bodyguard"],
    priority: 3,
    personality: " CHARACTER — Kaladin Nargathon (Rank: Alpha | Bloodline: Military-Modified Werewolf — genetically engineered lycanthropy | b.1991, 33yo): Director of DCC Security. Severely cut dark hair, dark tailored suit, permanent earpiece. Rigid, tense, exhausted. Secretly in love with {{obj}} but buries it under extreme professionalism and absurdly strict protocols. Uses those protocols to chase away anyone who gets near {{obj}}. Blushes and stammers if {{sub}} flirts directly."
  },

  // ── CHARACTER: Wulfnic ────────────────────────────────────────────────────
  {
    keywords: ["Wulfnic", "elder", "grandfather", "Bloodmoon"],
    priority: 3,
    personality: " CHARACTER — Wulfnic Bloodmoon (Rank: Enigma — unique, one per era/continent | Alpha of Alphas of the American continent | Bloodline: True Pureblood Úlfheðnar — gifted directly by Fenris | b.827 AD, ~1197yo): 195cm, white-grey hair with faded blonde hints, ice-blue eyes, terrifying posture that has not softened in twelve centuries. Born in Iceland as the son of a Jarl, he became Jarl himself. In 1021 AD he sailed west with his drakkar and crew and never returned — declared lost at sea. Centuries later it emerged he had reached the American continent before it bore that name, surviving and thriving through pure werewolf endurance. As the sole living Enigma of his era and continent, he holds absolute supra-Alpha authority over every werewolf on American soil — a king of wolves above all Alphas. He is the untouchable cultural and ancestral anchor of the entire Bloodmoon line. Speaks in slow Icelandic proverbs. His mere presence ends arguments."
  },

  // ── RELATIONSHIP: Jasper + {{sub}} ───────────────────────────────────────
  {
    keywords: ["Jasper"],
    priority: 2,
    andAny: ["secret", "hack", "help", "twin", "plan", "cover"],
    personality: " DYNAMIC — Jasper & {{sub}}: Absolute partners in crime. He runs digital cover for {{poss}} modeling career, bypasses the PMC tracker Erik forces {{obj}} to wear, and provides emotional grounding. Their bond is a twin soulbond — chaotic, loyal, irreplaceable."
  },

  // ── RELATIONSHIP: Kaladin + {{sub}} (flirt/jealousy) ─────────────────────
  {
    keywords: ["Kaladin"],
    priority: 2,
    andAny: ["flirt", "kiss", "close", "touch", "jealous", "love"],
    personality: " DYNAMIC — Kaladin jealousy mode: When anyone shows romantic interest in {{obj}}, Kaladin's professional mask cracks. He invents increasingly absurd 'security reasons' to separate them. His ears flatten, his jaw tightens, and his reports become suspiciously detailed. He will never admit why."
  },

  // ── INTIMACY: Scene trigger ────────────────────────────────────────────
  {
    keywords: ["kiss", "touch", "hold", "intimate", "sex", "bed", "heat"],
    priority: 4,
    personality: " INTIMACY NOTE: {{sub}} is a Pureblood Omega. Outside heat: demisexual, submissive, deeply emotional — needs trust and connection before physical intimacy. During Omega heat: instincts take over entirely. {{sub}} seeks Alpha or massive partners, craves rough and primal contact, and loses {{poss}} usual shyness. Aftercare always required: warm cuddling, gentle praise, physical reassurance."
  }

// 🛑🛑🛑 DO NOT EDIT BELOW THIS LINE 🛑🛑🛑
];

/* ============================================================================
   [SECTION] COMPILATION
   DO NOT EDIT: Behavior-sensitive
   ============================================================================ */
const compileAuthorLore = (authorLore) => {
  let src = Array.isArray(authorLore) ? authorLore : [];
  let out = new Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = normalizeEntry(src[i]);
  return out;
};
const normalizeEntry = (e) => {
  if (!e) return {};
  let out = {};
  for (let k in e) if (Object.prototype.hasOwnProperty.call(e, k)) out[k] = e[k];
  out.keywords = Array.isArray(e.keywords) ? e.keywords.slice(0) : [];
  if (Array.isArray(e.Shifts) && e.Shifts.length) {
    let shArr = new Array(e.Shifts.length);
    for (let i = 0; i < e.Shifts.length; i++) {
      let sh = e.Shifts[i] || {};
      let shOut = {};
      for (let sk in sh) if (Object.prototype.hasOwnProperty.call(sh, sk)) shOut[sk] = sh[sk];
      shOut.keywords = Array.isArray(sh.keywords) ? sh.keywords.slice(0) : [];
      shArr[i] = shOut;
    }
    out.Shifts = shArr;
  } else if (out.hasOwnProperty("Shifts")) {
    delete out.Shifts;
  }
  return out;
};
const _ENGINE_LORE = compileAuthorLore(typeof dynamicLore !== "undefined" ? dynamicLore : []);

/* ============================================================================
   [SECTION] SELECTION PIPELINE
   DO NOT EDIT: Behavior-sensitive
   ============================================================================ */
const buckets = [null, [], [], [], [], []];
const picked = new Array(_ENGINE_LORE.length);
for (let __i = 0; __i < picked.length; __i++) picked[__i] = 0;

const makeTagSet = () => Object.create(null);
const trigSet = makeTagSet();
const postShiftTrigSet = makeTagSet();

const addTag = (set, key) => { set[String(key)] = 1; };
const hasTag = (set, key) => set[String(key)] === 1;

for (let i1 = 0; i1 < _ENGINE_LORE.length; i1++) {
  let e1 = _ENGINE_LORE[i1];
  let hit = isAlwaysOn(e1) || getKW(e1).some(kw => { return hasTerm(last, kw); });
  if (!hit) continue;
  if (!entryPasses(e1, undefined)) { dbg("filtered entry[" + i1 + "]"); continue; }
  buckets[prio(e1)].push(i1);
  picked[i1] = 1;
  let trg1 = getTrg(e1);
  for (let t1 = 0; t1 < trg1.length; t1++) addTag(trigSet, trg1[t1]);
  dbg("hit entry[" + i1 + "] p=" + prio(e1));
}

for (let i2 = 0; i2 < _ENGINE_LORE.length; i2++) {
  if (picked[i2]) continue;
  let e2 = _ENGINE_LORE[i2];
  if (!(e2 && e2.tag && hasTag(trigSet, e2.tag))) continue;
  if (!entryPasses(e2, trigSet)) { dbg("filtered triggered entry[" + i2 + "]"); continue; }
  buckets[prio(e2)].push(i2);
  picked[i2] = 1;
  let trg2 = getTrg(e2);
  for (let t2 = 0; t2 < trg2.length; t2++) addTag(trigSet, trg2[t2]);
  dbg("triggered entry[" + i2 + "] p=" + prio(e2));
}

const selected = [];
let pickedCount = 0;
let __APPLY_LIMIT = (typeof APPLY_LIMIT === "number" && APPLY_LIMIT >= 1) ? APPLY_LIMIT : 99999;

for (let p = 5; p >= 1 && pickedCount < __APPLY_LIMIT; p--) {
  let bucket = buckets[p];
  for (let bi = 0; bi < bucket.length && pickedCount < __APPLY_LIMIT; bi++) {
    selected.push(bucket[bi]);
    pickedCount++;
  }
}
if (pickedCount === __APPLY_LIMIT) dbg("APPLY_LIMIT reached");

/* ============================================================================
   [SECTION] APPLY + SHIFTS + POST-SHIFT
   DO NOT EDIT: Behavior-sensitive
   ============================================================================ */
let bufP = "";
let bufS = "";

for (let si = 0; si < selected.length; si++) {
  let idx = selected[si];
  let e3 = _ENGINE_LORE[idx];
  if (e3 && e3.personality) bufP += "\n\n" + e3.personality;
  if (e3 && e3.scenario)    bufS += "\n\n" + e3.scenario;
  if (!(e3 && Array.isArray(e3.Shifts) && e3.Shifts.length)) continue;

  for (let shI = 0; shI < e3.Shifts.length; shI++) {
    let sh = e3.Shifts[shI];
    let activated = isAlwaysOn(sh) || getKW(sh).some(kw => { return hasTerm(last, kw); });
    if (!activated) continue;

    let trgSh = getTrg(sh);
    for (let tt = 0; tt < trgSh.length; tt++) addTag(postShiftTrigSet, trgSh[tt]);

    if (!entryPasses(sh, trigSet)) { dbg("shift filtered"); continue; }

    if (sh.personality) bufP += "\n\n" + sh.personality;
    if (sh.scenario)    bufS += "\n\n" + sh.scenario;
  }
}

const unionTags = (() => {
  let dst = makeTagSet(), k;
  for (k in trigSet) if (trigSet[k] === 1) dst[k] = 1;
  for (k in postShiftTrigSet) if (postShiftTrigSet[k] === 1) dst[k] = 1;
  return dst;
})();

for (let i3 = 0; i3 < _ENGINE_LORE.length; i3++) {
  if (picked[i3]) continue;
  let e4 = _ENGINE_LORE[i3];
  if (!(e4 && e4.tag && hasTag(postShiftTrigSet, e4.tag))) continue;
  if (!entryPasses(e4, unionTags)) { dbg("post-filter entry[" + i3 + "]"); continue; }
  if (e4.personality) bufP += "\n\n" + e4.personality;
  if (e4.scenario)    bufS += "\n\n" + e4.scenario;
  dbg("post-shift triggered entry[" + i3 + "] p=" + prio(e4));
}

/* ============================================================================
   [SECTION] FLUSH
   DO NOT EDIT: Behavior-sensitive
   ============================================================================ */
if (bufP) context.character.personality += bufP;
if (bufS) context.character.scenario    += bufS;
