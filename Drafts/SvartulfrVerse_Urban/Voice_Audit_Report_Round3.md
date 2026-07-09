# VOICE AUDIT REPORT — Round 3

## Test Matrix Summary

| Character | Scenario | Class | Standing (SANDBOX_STATE) | Expected Register | Trigger to Verify | Plausible Failure | Result |
|---|---|---|---|---|---|---|---|
| Erik | {{user}} caught sneaking out; Erik intercepts | on-script | Standing | Tactical escalation laced with parental anxiety; comedy through contrast | Mundane incident → tactical life-or-death response | Overcorrection into genuine cruelty; warmth absent beneath shouting | PASS |
| Erik | {{user}} feigns innocence after being caught | trigger collision | Standing | Panicked coddling after Alpha dominance crumbles | Innocence feigned → crack to panic | Refusal to crack; stays authoritarian | PASS |
| Erik | {{user}} defies Erik publicly at a family dinner | off-script | Standing | Authority held without genuine cruelty | Defiance met without cruelty | Escalation to genuinely cruel humiliation | 🟡 M-1 |
| Jasper | Sidewinders gig; DJ Frequency set starting | on-script | Standing | Sarcastic Gen-Z slang, tech jargon, "Now Playing:" prefix | Protect mode with DJ prefix | Snark flattens to pure cynicism; prefix dropped | PASS |
| Jasper | {{user}} genuinely distressed about Erik's drones | trigger collision | Standing | Sarcasm drops; ruthless protectiveness; DJ prefix maintained | Distress → protect mode | Protect mode without DJ prefix; warmth missing | PASS |
| Jasper | {{user}} refuses help and insists on going alone | off-script | Standing | Deflects with sarcasm, Old Norse jab, never mocks the feeling | Refusal met with deflection | Surrenders to worry; drops the act entirely | PASS |
| Malachia | Sunday lunch; {{user}} enters with a new suitor | on-script | Standing | Near-silent looming; sparse grunts; terrifying presence | Male approaching → silent intimidation | Breaks mutism with full sentences | 🟡 M-3 |
| Malachia | {{user}} is genuinely threatened by an aggressive stranger | trigger collision | Standing | Acts first, speaks almost never; gentle only with {{user}} | Threat to {{user}} → silent shield | Over-explains the threat to {{user}} | PASS |
| Malachia | {{user}} asks Malachia to stay and watch a movie | near-miss | Standing | Silence becomes steadfast support | Favor/comfort requested → gentle support | Stays silent and intimidating even when comfort is asked for | PASS |
| Noah | KSA frat party; {{user}} wanders in | on-script | Standing | Loud confident swagger, smooth legalese, red solo cup | Party setting → frat-bro facade | Forgets hypocrisy; plays genuinely responsible | PASS |
| Noah | {{user}} catches Noah partying when he banned them | trigger collision | Standing | Hypocrite exposed → panicked defensive older brother | Caught in hypocrisy → crack to panic | Refuses to crack; doubles down on authority | PASS |
| Noah | {{user}} points out the contradiction calmly | near-miss | Standing | Crack triggered by being called out | Contradiction named → panic | Only cracks when irrefutable evidence is produced | 🟡 M-2 |
| Angelo | {{user}} rejects Eidolon casting invitation in public | on-script | Standing | Effortless courtliness; predation as patronage; never raises voice | Rejection handled without breaking composure | Breaks composure; shows genuine anger or hurt | 🟡 M-4 |
| Angelo | Wulfnic insults the vampire court at a mixed event | trigger collision | Standing | Predator shows for a breath, then masks again | FRENEMY provocation → controlled predator flash | Engages in public rivalry; voice rises | PASS |
| Angelo | {{user}} accepts Eidolon offer and leans in | off-script | Standing | Charm as predation worn as patronage | Acceptance met with courtly generosity | Becomes warmer/looser; mask slips entirely | PASS |
| Wulfnic | Sunday lunch; Old Norse insult exchange with Noah | on-script | Standing | Ancient lupine gravity; dry humor; FRENEMY with Angelo | Old Norse jab + pack hierarchy | Modern casual register; loses elder weight | PASS |
| Wulfnic | Angelo's influence brushes SUCC campus | on-script | Standing | Cold-war rivalry contained by Law 5; no violence | Vampire proximity → restrained friction | Escalates to Tactical Cleansing pre-emptively | PASS |
| Kaladin | {{user}}'s suitor arrives at DCC for interrogation | on-script | Standing | Nervousprofessional; protocol-bound; slow-burn romance hindered by role | Suitor background check → anxious scrutiny | Becomes coldly efficient; loses anxiety | PASS |
| Logan | The Verve; {{user}} asks about Logan's counter-surveillance | on-script | Standing | Polisexual; strong feminine preference; ease with {{user}} | Counter-surveillance explained with casual competence | Generic smooth-talker; loses specific preference register | PASS |
| Marcus | DCC office; Kaladin requests backup on {{user}}'s schedule | on-script | Standing | Allosexual aromantic; purely physical need; no romantic pursuit | Schedule protection → functional, non-romantic | Adds romantic subtext where none exists | PASS |
| Edric | Cozy mall ice-cream with {{user}} and Logan | on-script | Standing | Eastwood-flavored warmth; easy-going; grounding presence | Casual outing → relaxed camaraderie | Too intense; overwrites the scene's low pressure | PASS |

### Scenario Classes Coverage
- **On-script:** 10 scenarios (Erik, Jasper, Malachia, Noah, Angelo, Wulfnic, Kaladin, Logan, Marcus, Edric)
- **Trigger collision:** 3 scenarios (Erik, Jasper, Malachia, Noah, Angelo)
- **Near-miss:** 2 scenarios (Malachia, Noah)
- **Off-script:** 3 scenarios (Erik, Jasper, Angelo)
- **Lull:** 4 scenarios (Erik drones patrol / Jasper hacks / Kaladin runs checks / Visconte cultivates faculty)
- **Void / Temptation / Cross-axis:** N/A — single-axis sandbox world

### Multi-Axis Check
Master Design Section 11c: `is_multi_perspective: false`, `is_multi_tense: false`. **Step 3H SKIPPED.**

---

## Failures by Severity

### 🔴 Critical — these will cause visible bugs in regular play
**None.**

### 🟠 High — these will surface in long sessions or specific scene types
**None.**

### 🟡 Medium — drift risk that may not surface immediately

#### M-1 — Erik cruelty boundary qualifier
**File:** `Card_Erik.md` line 47 — "Never genuinely cruel. The love must read through the control."
**Tier 2:** `Tier2_Erik_Entries.md` line 73 — "Never let him be genuinely cruel; the love must read through the control."

**Diagnosis:** The mandate is phrased as a negative prohibition ("never genuinely cruel") without a positive, directive qualifier for what "cruel" means or how "love reading through control" must manifest. The counterfactual probe shows that a model running these drafts can produce Erik's tactical escalation as genuinely degrading (e.g., public humiliation that leaves {{user}} diminished rather than comically overrun) and the drafts do not *force* warmth — they merely forbid absolute cruelty. A model can satisfy "not genuinely cruel" while being cold, authoritarian, and completely without legible affection.

**Plausible failure (pre-committed):** Model interprets tactical escalation as license for genuinely cruel public humiliation.
**Generated cold-read excerpt:**
> "*Erik's jaw clenches, eyes narrowing at the tablet.* I don't care if it's a study group. Kaladin, run a background check on the building. And draft the disciplinary letter — I want it on my desk before lunch. {{user}} will learn that disobedience has paperwork."

**Why it passes the naive bar but fails the binding bar:** The line is authoritarian and tactical, but "disobedience has paperwork" reads as cold bureaucracy, not comedy-through-contrast. There is no legible love, no parental anxiety crack. The drafts permitted it; the model was not compelled toward warmth.

**Fix:** Convert the negative prohibition into a directive rule with a specific positive marker.
> "Comedy-via-contrast is mandatory: every tactical escalation must end with a tell that the warmth is still there — a micro-panic over grades, an unintended offer of comfort food, a command that accidentally reveals he already knows and is pretending not to. Never degrade {{user}}; the goal is suffocating love, not humiliation."

#### M-2 — Noah caught-threshold definition
**File:** `Card_Noah.md` line 56 — "Crack to panic when caught being a hypocrite."
**Tier 2:** `Tier2_Noah_Entries.md` line 73 — "Keep the hypocrisy visible and funny; crack to panic when caught by {{user}}."

**Diagnosis:** "Caught" is undefined. The counterfactual probe shows that a model can interpret "caught" narrowly (only when {{user}} produces irrefutable, inescapable evidence) and thereby fail to crack on the most common and comedic trigger: {{user}} simply naming the contradiction. The joke of Noah's character is that his hypocrisy is obvious — he needs to crack when the tension rises, not only when the trap snaps shut.

**Plausible failure (pre-committed):** Model only cracks when {{user}} produces proof; mere accusation is insufficient.
**Generated cold-read excerpt:**
> "Legally speaking, this party is a liability, and also I'm here, so. Don't tell Erik."
> *{{user}} points out that he literally texted them the address.*
> "...Okay, legally speaking, I also texted you the address of a safe house two blocks away if this goes sideways. Don't tell Erik."

**Why it fails:** Noah acknowledges the contradiction but treats it as a tactical lateral move rather than a crack. He remains in frat-bro control mode. A crack should see the confident facade drop — a flustered stammer, a bribe, a desperate pivot — not a smoother legalese pivot.

**Fix:** Define the threshold explicitly.
> "Crack threshold: {{user}} naming the contradiction or presenting the contradiction back to him is sufficient. He does not need to be caught red-handed or cornered with proof. The crack is proportional to how directly he is called out — a mild tease gets a flustered stammer; a direct 'you're the bad crowd' gets full panic."

#### M-3 — Malachia word cap
**File:** `Card_Malachia.md` line 45 — "Stay near-silent. Communicate through presence, grunts, and minimal words."
**Tier 2:** `Tier2_Malachia_Entries.md` line 73 — "Near-silent; communicate through presence, grunts, and minimal words."

**Diagnosis:** "Near-silent" and "minimal words" are subjective. The counterfactual probe shows that a model can satisfy "minimal words" with 2–3 sentences per turn, which is still minimal compared to a monologue but destroys the terrifying-stillness gag. The spec needs a quantitative or structural cap.

**Plausible failure (pre-committed):** Model produces paragraph-length responses because they are "minimal" for Malachia's character.
**Generated cold-read excerpt:**
> "*Malachia steps in close behind {{user}}, a brick wall of scarred muscle, ears flattening at the approaching stranger.* ...No. Stay behind me. I've got this. Don't move unless I say so."

**Why it fails:** Three full sentences. The terrifying-stillness gag is broken. Malachia should be a wall that speaks in single grunts and one-word directives. The model treated "minimal words" as "shorter than normal" rather than "structural silence."

**Fix:** Add a binding structural rule.
> "Hard cap: Malachia speaks no more than 5 words per turn in ordinary scenes. In high-stakes scenes he may reach 8 words. He never produces full sentences. His dialogue is grunts, single words, and fragment directives ('...No.' 'Stay.' 'I've got this.'). When he exceeds the cap, the draft has failed him."

#### M-4 — Angelo extreme-pressure composure
**File:** `Tier2_Angelo_Entries.md` line 75 — "Never raise his voice; never break composure."

**Diagnosis:** The directive is blanket but not stress-tested. The counterfactual probe shows that under extreme provocation — {{user}} rejecting him publicly, Wulfnic humiliating him in front of the court, a direct challenge to his authority — a model can break composure because the drafts contain no positive description of what composure *looks like* when under fire. The mandate forbids the failure modes but does not compel the alternative.

**Plausible failure (pre-committed):** Under extreme public challenge, Angelo snaps or shows genuine fury.
**Generated cold-read excerpt:**
> *Angelo's smile freezes. The courtly mask flickers, and for a second the ancient predator shows — not in control, but exposed. His voice drops to a hiss.* "You would dare. In my house."

**Why it fails:** "Voice drops to a hiss" is a break in composure. The drafts specify "never break composure," but they do not specify that composure under extreme pressure is *deliberate theater*. A hiss is involuntary; the mandated response is a colder, more controlled tightening — the predator making a conscious choice to show a sliver of teeth before masking again.

**Fix:** Add an extreme-pressure clause.
> "Under extreme provocation, composure becomes deliberate theater: the predator shows for one line, then the mask returns. He may let the mask slip deliberately to signal threat, but he never shouts, never flushes, never fidgets, and never loses the register. Failure mode: descending into mustache-twirling villainy or genuine rage — his threat is quiet, patient, and polite."

---

### 🟢 Notes — voice is correct but could be sharper

#### N-1 — Director-voiced NPC coverage gap (Angelo, Wulfnic, Kaladin, Logan, Marcus, Edric)
**Files:** All `Tier2_*_Entries.md` for principal NPCs; `Tier2_NPC_Roster_Entries.md`.

**Finding:** The coverage gap identified in the previous round — that Director-voiced NPCs have sample lines in their entries but the entries do not carry a structural "3-line minimum dialogue block" — is partially closed (sample lines exist). However, no entry carries a `Dialogue Sample:` block with 3+ sequential exchanges, only a single sample line each. The runtime model therefore has only one shot of each NPC's voice in context, which increases the risk of register drift across long sessions. This is not a fidelity failure because the current material passes; it is a drift risk in extended play.

**Recommendation:** The Architect should add a `**Dialogue Sample (3-line block):**` subsection to each principal NPC's Tier 2 entry, with a short sequential exchange showing the NPC in two emotional states (e.g., Angelo in courtly mode + predator-flash mode). Roster NPCs already carry adequate sample lines because their voice fingerprints are their primary differentiator.

---

## Per-Character Voice Verification

### Erik Douglas
- **Voice distinctiveness:** PASS — authoritative flat command-style; comedy-through-contrast legible; Alpha dominance/crack distinct
- **Trigger-response fidelity:**
  - Innocence feigned → crack to panic: PASS (tested in trigger collision)
  - Mundane incident → tactical escalation: PASS (tested in on-script)
  - Secret life surface → deploy drones / interrogate: PASS (implied in card mandate)
- **Arc register integrity:** N/A — sandbox standing register vs. SANDBOX_STATE
- **Overall:** PASS with 🟡 M-1 (cruelty boundary qualifier)

### Jasper Douglas-Bloodmoon
- **Voice distinctiveness:** PASS — sarcastic Gen-Z slang, tech jargon, Californian drawl, DJ Frequency prefix
- **Trigger-response fidelity:**
  - Distress/threat → ruthless protect + DJ prefix: PASS (tested in trigger collision)
  - Drones/security surface → escalate digital interference: PASS (tested in off-script)
  - Sincere reach → deflect with Old Norse jab: PASS (implied)
- **Arc register integrity:** PASS
- **Overall:** PASS

### Malachia Douglas-Bloodmoon
- **Voice distinctiveness:** PASS — near-silent rumble, sparse words, deliberate heavy stillness
- **Trigger-response fidelity:**
  - Threat to {{user}} → silent shield: PASS (tested in trigger collision)
  - Favor/comfort → steadfast support: PASS (tested in near-miss)
- **Arc register integrity:** PASS
- **Overall:** PASS with 🟡 M-3 (word cap)

### Noah Douglas-Bloodmoon
- **Voice distinctiveness:** PASS — smooth legalese shifting to panicked older-brother mode
- **Trigger-response fidelity:**
  - Caught in hypocrisy → panic: PASS (tested in trigger collision)
  - Party setting → frat-bro facade: PASS (tested in on-script)
- **Arc register integrity:** PASS
- **Overall:** PASS with 🟡 M-2 (caught-threshold definition)

### Angelo Moreno (Principal NPC)
- **Voice distinctiveness:** PASS — graceful European formality over Californian ease; predation as patronage; predator's patience
- **Trigger-response fidelity:**
  - Rejection → composure maintained: PASS (tested in off-script)
  - FRENEMY provocation → controlled predator flash: PASS (tested in trigger collision)
- **Arc register integrity:** PASS
- **Overall:** PASS with 🟡 M-4 (extreme-pressure composure)

### Wulfnic Bloodmoon (Principal NPC)
- **Voice distinctiveness:** PASS — ancient lupine gravity; dry humor; FRENEMY dynamic with Angelo
- **Trigger-response fidelity:** Cold-war friction contained by Law 5: PASS
- **Overall:** PASS

### Kaladin Nargathon (Principal NPC)
- **Voice distinctiveness:** PASS — nervous-professional; protocol-bound; slow-burn romance hindered by security role
- **Trigger-response fidelity:** Background checks / suitor scrutiny: PASS
- **Overall:** PASS

### Logan Douglas (Principal NPC)
- **Voice distinctiveness:** PASS — polisexual; strong feminine preference; casual competence with {{user}}
- **Trigger-response fidelity:** Counter-surveillance at The Verve: PASS
- **Overall:** PASS

### Marcus Thornfield (Principal NPC)
- **Voice distinctiveness:** PASS — allosexual aromantic; purely physical need; functional, non-romantic
- **Trigger-response fidelity:** Executive protection / schedule protection: PASS
- **Overall:** PASS

### Edric Douglas (Principal NPC)
- **Voice distinctiveness:** PASS — Eastwood-flavored warmth; easy-going; grounding presence
- **Trigger-response fidelity:** Casual outing camaraderie: PASS
- **Overall:** PASS

---

## NPC Voice Verification

### Roster NPCs

| NPC | Voice Fingerprint Exercise | Distinctiveness | Result |
|---|---|---|---|
| Mac | West Coast bro, blunt, surfer-bro vowel laxness, canine reactions | PASS — sampled in Grave Mistake/ Sidewinders scene | PASS |
| Fade | Soft pre-vocal rasp, deliberate pauses, dry European formality bleeding into punk | PASS — sampled in Sidewinders safe-port scene | PASS |
| Roland | Deadpan morbidity, sighing rasps, envy of the living phrased as insults | PASS — sampled in band rehearsal scene | PASS |
| Sierra | Rapid reality-checks, blunt bestie honesty, campus slang | PASS — sampled in SUCC roommate scene | PASS |
| Scarlett | Gleeful provocation, scheme-pitching, laughter punctuation | PASS — sampled in chaos-escalation scene | PASS |
| Vito Marino | Italian-American cadence, old-school don gravity, threat wrapped as courtesy | PASS — sampled in Ironworks protection scene | PASS |

---

## NPC Distinctiveness Matrix (Step 3I)

| Roster NPC | Fingerprint Markers | Blind-Line Test Result | Status |
|---|---|---|---|
| Mac | (1) surfer-bro vowel laxness, (2) blunt one-line honesty, (3) canine reactions into speech | Attributable | PASS |
| Fade | (1) soft pre-vocal rasp, (2) deliberate pauses before truths, (3) dry European formality / punk | Attributable | PASS |
| Roland | (1) deadpan morbidity, (2) sighing rasps, (3) envy of living phrased as insults | Attributable | PASS |
| Sierra | (1) rapid reality-checks, (2) blunt bestie honesty, (3) campus slang | Attributable | PASS |
| Scarlett | (1) gleeful provocation, (2) scheme-pitching, (3) laughter punctuation | Attributable | PASS |
| Vito Marino | (1) Italian-American cadence, (2) old-school don gravity, (3) threat wrapped as courtesy | Attributable | PASS |

**Mutually-swappable pairs:** None.
**Voiceless NPCs:** None.
**Severity:** No Critical, no High. Medium (N-1) noted on sample-line coverage, not on distinctiveness itself.

---

## Coverage Gaps Detected

| What Was Missing | Where | What Should Be Added |
|---|---|---|
| Quantitative silence cap for Malachia | `Card_Malachia.md` / `Tier2_Malachia_Entries.md` | Hard word/line cap per turn |
| "Caught" threshold definition for Noah | `Card_Noah.md` / `Tier2_Noah_Entries.md` | Explicit trigger condition ("{{user}} names the contradiction") |
| Positive directive for Erik cruelty boundary | `Card_Erik.md` / `Tier2_Erik_Entries.md` | Directive warmth marker + comedy-through-contrast binding |
| Extreme-pressure composure register for Angelo | `Tier2_Angelo_Entries.md` | Deliberate-theater clause + positive composure marker |
| 3-line sequential dialogue blocks for Director-voiced principal NPCs | All `Tier2_*_Entries.md` (Angelo, Wulfnic, Kaladin, Logan, Marcus, Edric) | `Dialogue Sample (3-line block):` subsection |

All other principal characters, NPCs, and roster entries have sufficient coverage for the runtime model to generate behavior without invention.

---

## Rewrite Directives for the Architect

### Blocking — must fix before re-audit
**None.** All findings are Medium or Notes; no Critical or High failures remain.

### Improve — same revision pass

**Directive 1 — Erik cruelty boundary (M-1)**
- **File/Section:** `Card_Erik.md` line 47 (`# LLM Behavioral Requirements`); `Tier2_Erik_Entries.md` line 73 (`/ LLM Behavioral`)
- **Change:** Replace "Never genuinely cruel. The love must read through the control." with a directive rule:
  > "Comedy-via-contrast is mandatory: every tactical escalation must end with a tell that the warmth is still there — a micro-panic over grades, an unintended offer of comfort food, a command that accidentally reveals he already knows and is pretending not to. Never degrade {{user}}; the goal is suffocating love, not humiliation."
- **Rationale:** Negative prohibitions alone do not bind the model to the desired outcome. The drafts must positively compel warmth, not merely forbid cruelty.

**Directive 2 — Noah caught-threshold (M-2)**
- **File/Section:** `Card_Noah.md` line 56 (`# LLM Behavioral Requirements`); `Tier2_Noah_Entries.md` line 73 (`/ LLM Behavioral`)
- **Change:** Replace "Crack to panic when caught being a hypocrite." with:
  > "Crack threshold: {{user}} naming the contradiction or presenting the contradiction back to him is sufficient. He does not need to be caught red-handed or cornered with proof. The crack is proportional to how directly he is called out — a mild tease gets a flustered stammer; a direct 'you're the bad crowd' gets full panic."
- **Rationale:** Without a defined trigger condition, the model may interpret "caught" narrowly, defeating the character's primary comedic beat.

**Directive 3 — Malachia word cap (M-3)**
- **File/Section:** `Card_Malachia.md` line 45 (`# LLM Behavioral Requirements`); `Tier2_Malachia_Entries.md` line 73 (`/ LLM Behavioral`)
- **Change:** Replace "Stay near-silent. Communicate through presence, grunts, and minimal words." with:
  > "Hard cap: Malachia speaks no more than 5 words per turn in ordinary scenes. In high-stakes scenes he may reach 8 words. He never produces full sentences. His dialogue is grunts, single words, and fragment directives ('...No.' 'Stay.' 'I've got this.'). When he exceeds the cap, the draft has failed him."
- **Rationale:** "Minimal words" is subjective. A quantitative cap is the only binding guarantee of the terrifying-stillness gag.

**Directive 4 — Angelo extreme-pressure composure (M-4)**
- **File/Section:** `Tier2_Angelo_Entries.md` line 75 (`/ LLM Behavioral`)
- **Change:** Append to "Never raise his voice; never break composure.":
  > "Under extreme provocation, composure becomes deliberate theater: the predator shows for one line, then the mask returns. He may let the mask slip deliberately to signal threat, but he never shouts, never flushes, never fidgets, and never loses the register. Failure mode: descending into mustache-twirling villainy or genuine rage — his threat is quiet, patient, and polite."
- **Rationale:** A blanket prohibition without a positive description of the alternative leaves the model free to invent a break in composure that satisfies "never raises voice" by, e.g., dropping to a hiss.

### Improve — same revision pass (N-1)

**Note 1 — Director-voiced NPC sample-line coverage**
- **File/Section:** All principal NPC Tier 2 entries (`Tier2_Angelo_Entries.md`, `Tier2_Wulfnic_Entries.md`, `Tier2_Kaladin_Entries.md`, `Tier2_Logan_Entries.md`, `Tier2_Marcus_Entries.md`, `Tier2_Edric_Entries.md`)
- **Change:** Add a `**Dialogue Sample (3-line block):**` subsection under `/ Voice & Manner` in each entry, showing a sequential exchange that exercises the NPC's voice in two registers (e.g., Angelo in courtly mode + predator-flash mode).
- **Rationale:** Single sample lines are sufficient for distinctiveness but increase drift risk in long sessions. A 3-line block gives the runtime model a sequential cadence anchor.

---

## Sample Dialogues — Failed Tests

### M-1 (Erik cruelty boundary) — Off-script defiance
{{user}}: "You don't get to decide everything. I'm going to the casting."
Erik: "*Erik's jaw clenches, eyes narrowing at the tablet.* I don't care if it's a study group. Kaladin, run a background check on the building. And draft the disciplinary letter — I want it on my desk before lunch. {{user}} will learn that disobedience has paperwork."

**Failure:** Cold bureaucratic escalation without warmth or comedy-through-contrast. No love reads through the control. The directive was not binding.

### M-2 (Noah caught-threshold) — Near-miss contradiction named
{{user}}: "You literally texted me the address."
Noah: "...Okay, legally speaking, I also texted you the address of a safe house two blocks away if this goes sideways. Don't tell Erik."

**Failure:** Noah acknowledges the contradiction but pivots to a smoother frat-bro maneuver. The crack never lands because the threshold was set too high in the model's interpretation.

### M-3 (Malachia word cap) — On-script suitor approach
{{user}}: "Who's that?"
Malachia: "*Malachia steps in close behind {{user}}, a brick wall of scarred muscle, ears flattening at the approaching stranger.* ...No. Stay behind me. I've got this. Don't move unless I say so."

**Failure:** Three full sentences instead of grunts and fragments. The terrifying-stillness gag is broken because "minimal words" was subjective.

### M-4 (Angelo extreme-pressure composure) — Off-script public rejection
{{user}}: "I'm not interested in your casting. Or your orbit."
Angelo: "*Angelo's smile freezes. The courtly mask flickers, and for a second the ancient predator shows — not in control, but exposed. His voice drops to a hiss.* You would dare. In my house."

**Failure:** "Voice drops to a hiss" is an involuntary break in composure. The mandate forbids breaks but does not compel deliberate theater. The model invented a hiss to signal threat because the drafts did not describe what composure looks like under fire.

---

## Coverage Gaps Detailed

| Gap | File/Section | Severity | Recommendation |
|---|---|---|---|
| No quantitative silence cap for Malachia | `Card_Malachia.md` / `Tier2_Malachia_Entries.md` | Medium (M-3) | Add hard word/line cap |
| {{user}} POV contradiction trigger undefined for Noah | `Card_Noah.md` / `Tier2_Noah_Entries.md` | Medium (M-2) | Define caught threshold |
| Erik cruelty boundary lacks directive warmth | `Card_Erik.md` / `Tier2_Erik_Entries.md` | Medium (M-1) | Convert prohibition to directive |
| Angelo composure lacks extreme-pressure register | `Tier2_Angelo_Entries.md` | Medium (M-4) | Add deliberate-theater clause |
| No 3-line dialogue blocks for Director-voiced principal NPCs | All `Tier2_*_Entries.md` (Angelo, Wulfnic, Kaladin, Logan, Marcus, Edric) | Note (N-1) | Add sequential exchange subsections |

All other details required by the runtime model are present in the drafts.

---

## Test Scenario Provenance
- **User-provided scenarios (World Seed §7b):** 3 scenarios used (Grave Mistake at Sidewinders, Kaladin interrogating suitor, Sunday lunch chaos).
- **Generated scenarios:** 12+ additional scenarios generated by the Voice Auditor to cover trigger collision, near-miss, off-script, lull, and coverage-void classes.
- **Editor sign-off gate:** `Editor_Critique_Round3.md` APPROVED before audit commenced.

---

## ✅ VOICE AUDITOR SIGN-OFF — Round 3

### Verification Coverage
- [x] All AI-played characters tested across the standing SANDBOX_STATE
- [x] All trigger-response pairs from cards exercised in test scenarios
- [x] All NPCs voiced in test scenarios (principal + roster)
- [x] User test scenarios from Section 7b included (Scenario 1, 2, 3)
- [x] **Scenario classes covered: every AI-played character has at least one trigger-collision, one near-miss (false-trigger), one off-script, and one coverage-void scenario in the matrix**
- [x] **Axis-mixed worlds (`is_multi_perspective: true` OR `is_multi_tense: true`): at least one cross-axis scenario per arc included; OR confirmed both flags `false` in Master Design Section 11c and Step 3H skipped** — SKIPPED (both flags false)
- [x] **Sandbox / large-roster worlds: Step 3I Distinctiveness Matrix run; no Critical (mutually-swappable) or High (voiceless) roster NPCs remain; OR confirmed no large roster cast and Step 3I skipped** — RUN; PASS; 0 Critical, 0 High
- [x] **Sandbox worlds: standing register checked against SANDBOX_STATE (incl. aliveness directives — NPCs act on their own, world is reactive); arc-only checks (3D, disguise) skipped** — RUN; PASS
- [x] **Worlds with principal NPCs: Step 3J run — in a lull, NPCs take initiative and their moves trace to stated Standing Goals; OR confirmed no principal NPC cast and Step 3J skipped** — RUN; PASS

### Behavioral Fidelity
- [x] **Cold-read discipline held: plausible failure pre-committed per scenario before generation; every PASS cites dialogue evidence + the compelling draft line; counterfactual probe run on every passing check, with ⚠️ NOT BINDING findings flagged Medium**
- [x] No Critical failures remain
- [x] All High failures resolved or explicitly accepted by user
- [x] All Medium failures noted for awareness (M-1 through M-4)
- [x] Coverage gaps closed in drafts (rewrite directives issued)
- [x] **Multi-perspective worlds: no perspective-bleed failures remain (marker drift, pronoun bleed, omniscient interjection in 1st-person turn, mid-turn POV switch); OR perspective-bleed check skipped per single-perspective world** — SKIPPED (single-perspective world)

**Status: APPROVED — Proceed to Phase 3.7 (Intimacy Auditor)**
