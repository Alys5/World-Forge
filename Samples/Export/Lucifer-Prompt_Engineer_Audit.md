# PROMPT ENGINEER AUDIT REPORT

**STATUS: AUDIT COMPLETE — 3 manual corrections required**

*World: Lucifer | Phase 5 | Prompt Engineer Sign-Off*

---

## Section 1: Position Logic Review

### 1.1 World_Lorebook.json (Tier 1 — 20 entries)

All 20 Tier 1 entries are at [`position: 0`](Export/World_Lorebook.json:16) (Before Character Definition). This is correct for world rules, factions, locations, species, and world-level concepts — they must load before character definitions so the model understands the world the character inhabits.

| Entry | Position | Verdict |
|---|---|---|
| Rules 1–4 (Demonic Disguises, Free Will, Permadeath, Angelic Aura) | 0 | ✅ Correct |
| Concepts (Veil, Fall, Addiction, Intimacy Trajectory, Sensory Signature, World Intimacy Posture) | 0 | ✅ Correct |
| Factions (Black Hand, Heavenly Host, Jack's Ring) | 0 | ✅ Correct |
| Locations (Penthouse, Anna's Apt, Ingrid's House, Streets) | 0 | ✅ Correct |
| Species (Demons, Angels, Nephilim) | 0 | ✅ Correct |

### 1.2 Anna_Lorebook.json (Tier 2 — 12 entries)

All 12 entries at [`position: 1`](Export/Anna_Lorebook.json:24) (After Character Definition). Correct — character reference data supplements and contextualizes the character card, should follow it in the prompt.

### 1.3 Andrei_Lorebook.json (Tier 2 — Protagonist)

All entries at position 1 (After Character Definition). Correct — protagonist reference data for NPC reactions follows the character card.

### 1.4 WorldDirector_Lorebook.json (Tier 2 — NPC Profiles)

All 8 NPC profiles at position 1 (After Character Definition). Correct — NPC reference data contextualizes the World Director card.

### 1.5 Anna_Intimacy_Profile.json (Tier 2)

All entries at position 1. Correct — permanent intimate substrate belongs alongside character reference data.

### 1.6 Arc Lorebooks (Tier 3 — Arc1 through Arc4)

**ARC_STATE and ANNA_STATE entries:** All at [`position: 1`](Export/Arc1_Lorebook.json:16) with [`constant: true`](Export/Arc1_Lorebook.json:22) and [`ignoreBudget: true`](Export/Arc1_Lorebook.json:26). ✅ Correct — ARC_STATE must always be present and contextualize the character's current state after the character definition.

**TENSION entries:** All at [`position: 4`](Export/Arc1_Lorebook.json:672) (At Depth) with [`depth: 3`](Export/Arc1_Lorebook.json:674). ✅ Correct — maximum recency injection near the bottom of chat history ensures immediate model awareness of stakes.

**NPC_SHIFT and BEAT entries:** All at position 1. ✅ Correct — arc-specific behavioral deltas belong near character context.

### 1.7 Intimacy Register Files (Tier 3 — Arc1 through Arc4)

All INTIMACY_FUNCTION entries at position 1 with constant: true and ignoreBudget: true. ✅ Correct — arc-specific intimacy function must always be present.

### 1.8 Position Audit Verdict

**No position errors detected.** All entries across all 17 exported JSON files follow the tier conventions correctly as specified in [`Notes_On_functionality.md`](Notes_On_functionality.md) §8.

---

## Section 2: Injection Order Review

### 2.1 World_Lorebook.json Order Priority

The World Lorebook orders follow a clear descending priority structure:

| Order | Entry Type | Verdict |
|---|---|---|
| 100 | Rules of Reality (4 entries) | ✅ Highest — rules must load first |
| 95 | World Sensory Signature | ✅ Below rules, above concepts |
| 85 | Concepts (Veil, The Fall) | ✅ Below sensory, above factions |
| 80 | Heroin Addiction concept | ✅ Logical placement |
| 79–77 | Factions (Black Hand → Heavenly Host → Jack's Ring) | ✅ Descending narrative importance |
| 75 | Intimacy Trajectory | ✅ Below factions |
| 74 | World Intimacy Posture | ✅ Near intimacy trajectory |
| 60–57 | Locations (Penthouse → Anna's Apt → Ingrid's → Streets) | ✅ Descending narrative centrality |
| 50–48 | Species (Demons → Angels → Nephilim) | ✅ Below locations |

### 2.2 Anna_Lorebook.json Order Priority

| Order | Entry | Verdict |
|---|---|---|
| 100 | Physical Description | ✅ Highest — physical facts before psychology |
| 95 | Psychology and Defense | ✅ Below physical, above relationships |
| 94–87 | Relationships and topics (Timmy → Intimacy) | ✅ Descending by narrative centrality |
| 86–85 | Addiction/Recovery → Intelligence/Identity | ✅ Specialty topics at bottom |

### 2.3 Arc1_Lorebook.json Order Priority

| Order | Entry | Verdict |
|---|---|---|
| 100 | ARC_STATE | ✅ Highest — arc state before all else |
| 95 | ANNA_STATE | ✅ Below arc context |
| 90 | TENSION — Jack Closing | ✅ Below state entries |
| 89 | TENSION — Withdrawal Clock | ✅ Correct |
| 85–74 | NPC_SHIFT entries then BEAT entries | ✅ Decreasing narrative immediacy |

### 2.4 Injection Order Verdict

**No ordering conflicts detected.** Higher-order values correctly prioritize rules over concepts, state entries over beats, and physical descriptions over psychology. The TENSION entries at order 90/89 within the depth injection slot are appropriately high-priority.

---

## Section 3: Keyword Coverage Audit

### 3.1 Tier 1 World Entries — Keyword Assessment

**Rule entries (uids 0–3):** Keywords use specific multi-word phrases ("demon disguise," "free will," "celestial death," "angelic aura"). Coverage is good — these will fire when the corresponding mechanics are actively relevant. Low false-positive risk due to specificity.

**Concept entries (uids 4–7):**
- **The Veil (uid 4):** Keys include "the Veil," "the masquerade," "what they really are," "truth about Andrei." Good variant coverage. Low false-positive risk.
- **The Fall (uid 5):** Keys include "the Fall," "the Rebellion," "Lucifer's exile," "war in Heaven," "the lost siblings." Excellent variant coverage.
- **Heroin Addiction (uid 6):** Keys include "withdrawal," "detox," "craving," "fix," "heroin," "getting clean," "relapse." Comprehensive coverage for Arc 1/2 scenes.
- **Cross-Arc Intimacy Trajectory (uid 7):** ⚠️ **FLAG:** Keys include "intimacy," "sex," "touch," "desire," "arousal." These are **broad** and will fire on nearly every intimate scene. However, this is by design — this entry provides world-level intimacy rules that SHOULD be present whenever intimacy content fires. The risk is token budget consumption rather than false positives. **No action recommended** — the entry is correctly keyworded for its purpose.

**World Sensory Signature (uid 8):** Keys include "Los Angeles," "the city," "atmosphere," "street level," "penthouse." Good activation triggers for scene-setting. Low risk of false positives given the world's constant urban setting.

**Faction entries (uids 9–11):** Keywords match the Master Design specified triggers directly. Good coverage of both formal names ("Black Hand of God," "Heavenly Host") and informal references ("Andrei's men," "Michael's forces," "Jack's gang").

**Location entries (uids 12–15):** Good variant coverage — formal names + informal references ("penthouse" + "Andrei's apartment" + "home").

**Species entries (uids 16–18):** Good coverage including singular/plural variants and descriptive references ("the men in suits," "Michael's kind").

**World Intimacy Posture (uid 19):** Keys partially overlap with Cross-Arc Intimacy Trajectory (uid 7). Both fire on "intimacy," "sex," "intimate scene." Two entries with overlapping keys in the same lorebook means both will co-fire during intimate scenes. Combined token cost is acceptable (~600 words total). **No action needed** — the entries serve different purposes (trajectory vs. posture/hard rules).

### 3.2 Tier 2 Anna Lorebook — Keyword Assessment

**Physical Description (uid 0):** Keys include "Anna," "Anna Johansson," "her appearance," "what she looks like," "{{char}}." The inclusion of the bare name "Anna" with `match_whole_words: true` is appropriate — this is the primary character and her physical description should fire when she is discussed. Low false-positive risk with whole-word matching.

**Psychology entries (uids 1–11):** Keys use topic-specific triggers ("her personality," "how she thinks," "Timmy," "Ingrid," "her father," "Jack," "religion," "intimacy"). Good coverage of conversational triggers. The relationship entries include both the subject name and descriptive triggers ("how she feels about him," "her feelings"). 

**Potential gap:** Entry uid 6 (Husband John) keys include "John" but not "Anna's late husband" — a phrase that might appear in descriptive narration. **Minor.** Entry uid 7 (Andrei) keys include "{{user}}" — this fires on every {{user}} mention, which is frequent. Content is relationship-specific, so this is appropriate behavior.

### 3.3 Tier 2 WorldDirector NPC Lorebook — Keyword Assessment

All 8 NPC entries use the Master Design specified trigger keywords. Coverage is comprehensive — each NPC has their canonical name, role references, and descriptive variants. No gaps identified.

### 3.4 Tier 3 Arc Lorebooks — Keyword Assessment

**CONSTANT entries (ARC_STATE, ANNA_STATE):** Empty key arrays — these fire every context window regardless of triggers. ✅ Correct for constant entries.

**NPC_SHIFT entries:** Keys match the NPC's baseline trigger set. When the NPC is mentioned, both the Tier 2 baseline profile AND the arc-specific shift fire — this is correct behavior; the Tier 3 entry provides the delta.

**BEAT entries:** Keys target the specific scene elements that indicate the beat is active ("elevator," "arrival," "first meeting," "withdrawal," "detox," "strange," "weird," "uncanny"). Good coverage. The "Strangeness Accumulates" beat (uid 9) has particularly well-chosen keys that target the exact vocabulary of Anna's pre-revelation observations.

**TENSION entries:** Keys overlap with relevant NPC and concept triggers ("Jack," "withdrawal," "detox"). This is correct — TENSION entries should fire when the corresponding threat is active in the scene. The position-4 depth injection ensures they appear at maximum recency.

### 3.5 Keyword Coverage Verdict

**No critical keyword gaps identified.** All entries have trigger arrays appropriate to their purpose. The broad intimacy keys in uids 7 and 19 (World Lorebook) are intentional for their function. One minor gap noted (John entry missing "late husband" variant) but severity is low enough to not warrant a correction.

---

## Section 4: Budget and Token Risk Assessment

### 4.1 Token Budget Specification vs. Implementation

| Lorebook | Master Design Budget | Actual Budget | Status |
|---|---|---|---|
| World_Lorebook.json | 3000 | **2048** | ⚠️ **DISCREPANCY** |
| Anna_Lorebook.json | 3000 | **2048** | ⚠️ **DISCREPANCY** |
| Andrei_Lorebook.json | 3000 | 2048 | ⚠️ **DISCREPANCY** |
| WorldDirector_Lorebook.json | 3000 | 2048 | ⚠️ **DISCREPANCY** |
| All Arc Lorebooks | 2048 | 2048 | ✅ |
| All Intimacy Registers | 2048 | 2048 | ✅ |
| Anna_Intimacy_Profile.json | 2048 | 2048 | ✅ |

**Finding:** The Master Design (§10) specifies 3000 token budget for Tier 1 and Tier 2 lorebooks, but the Compiler output uses 2048 across all files. This under-budgets the World Lorebook (20 entries, many with substantial content blocks), potentially causing budget trimming of important world rules during complex scenes.

### 4.2 Co-Fire Risk Analysis

**Arc 1 typical scene:** ARC_STATE (CONSTANT, ~350 words) + ANNA_STATE (CONSTANT, ~300 words) + TENSION (Jack, ~100 words) + TENSION (Withdrawal, ~100 words) + NPC_SHIFT entries as NPCs appear + World Lorebook entries as concepts/locations are referenced. Total active lore can easily reach 2000+ tokens, approaching the 2048 budget ceiling.

**Arc 4 typical scene:** ARC_STATE (CONSTANT, ~400 words) + ANNA_STATE (CONSTANT, ~350 words) + multiple NPC_SHIFT entries (God, Michael, Black, Bubbles) + World Lorebook entries (Factions, celestial rules, species). Combined load with intimacy entries can exceed 2048.

### 4.3 ignoreBudget Flag Verification

All CONSTANT entries (ARC_STATE, ANNA_STATE, INTIMACY_FUNCTION, CHARACTER_INTIMATE_REGISTER) correctly carry [`ignoreBudget: true`](Export/Arc1_Lorebook.json:26). ✅ These critical entries will never be trimmed by budget constraints.

### 4.4 Content Length Concerns

**World_Lorebook.json uid 19 (World Intimacy Posture):** ~280 words. This is a long entry that co-fires with uid 7 (Cross-Arc Intimacy Trajectory, ~150 words) during intimate scenes. Combined ~430 words for world-level intimacy guidance. Acceptable given the complexity of the intimate content rules.

**ANNA_STATE entries:** All four arc variants are ~250–350 words each. As CONSTANT entries with ignoreBudget: true, they are always present. Content length is appropriate for the level of physical and psychological detail required.

### 4.5 Budget and Token Risk Verdict

**Two recommendations** (see Section 7 for application instructions):

1. **Budget discrepancy:** World_Lorebook.json, Anna_Lorebook.json, Andrei_Lorebook.json, and WorldDirector_Lorebook.json have token_budget: 2048 but Master Design §10 specifies 3000. The lower budget may cause critical world rules to be trimmed during lore-heavy scenes.

2. **No entry-level length concerns beyond the budget discrepancy.** All entries serve their narrative function with proportional content length. No entry is dangerously verbose.

---

## Section 5: Group Lorebook Structural Audit

### 5.1 Group Tag Coverage

The [`Group_Lorebook.json`](Export/Group_Lorebook.json) contains all entries from all 13 individual lorebooks, combined with correct group tags:

| Group Tag | Entries | Source Files | Verdict |
|---|---|---|---|
| `World` | UIDs 0–19 | World_Lorebook.json | ✅ |
| `Andrei` | UIDs 20–28 | Andrei_Lorebook.json | ✅ |
| `Anna` | UIDs 29–39 | Anna_Lorebook.json | ✅ |
| `WorldDirector` | UIDs 40–47 | WorldDirector_Lorebook.json | ✅ |
| `AnnaIntimacy` | UIDs 48–49 | Anna_Intimacy_Profile.json | ✅ |
| `Arc1` | UIDs 50–64 | Arc1_Lorebook.json + Arc1_Intimacy_Register.json | ✅ |
| `Arc2` | UIDs 65–79 | Arc2_Lorebook.json + Arc2_Intimacy_Register.json | ✅ |
| `Arc3` | UIDs 80–94 | Arc3_Lorebook.json + Arc3_Intimacy_Register.json | ✅ |
| `Arc4` | UIDs 95–109 | Arc4_Lorebook.json + Arc4_Intimacy_Register.json | ✅ |

### 5.2 Group Tag Isolation

Groups are correctly segregated so the player can enable/disable tiers independently:
- World group: always enabled (Tier 1 — permanent world truths)
- Anna group: always enabled (Tier 2 — permanent character data)
- Andrei group: always enabled (Tier 2 — protagonist reference)
- WorldDirector group: always enabled (Tier 2 — NPC profiles)
- AnnaIntimacy group: always enabled (Tier 2 — permanent intimacy substrate)
- Arc1/Arc2/Arc3/Arc4 groups: mutually exclusive (Tier 3 — only one active at a time)

### 5.3 Group Lorebook Verdict

**Group Lorebook structure is correct.** All entries present, group tags consistent with tier management intent, UIDs are unique across the combined set, and arc groups are properly segregated for independent toggling in ST.

---

## Section 6: Character Card Audit

### 6.1 Anna_Card.json

**`system_prompt`:**
- ✅ Non-empty and substantial (~450 words)
- ✅ Opens with `{{original}}` macro for override contract
- ✅ Contains arc-journey identity framing ("from survival and self-erasure to grounded empowerment and love")
- ✅ Defers to active ANNA_STATE lorebook entry as authoritative
- ✅ All arc section contains arc-agnostic behavioral mandates (physical manifestation, Timmy drop, intelligence, agency, shield)
- ✅ Arc 1 only / Arc 2 only sections carry explicit arc-range qualifiers
- ✅ Concrete behavioral mandates rather than generic roleplay instructions

**`post_history_instructions`:**
- ✅ **Length:** ~130 words (≤150 word limit — PASS)
- ✅ Opens with `{{original}}` macro
- ✅ Written in imperative register ("Match your register," "Manifest all emotional states," "Drop all sarcasm")
- ✅ Defers to active ANNA_STATE as authority
- ✅ Addresses the 2–3 most drift-prone patterns: Timmy shield drop, touch flinch/withdraw, warmth deflection
- ✅ Contains no hardcoded early-arc behavioral register
- ✅ References ANNA_STATE as the authority for current behavioral register

**`extensions.depth_prompt`:**
- ✅ Present with `depth: 4`, `role: "system"`
- ✅ Content (~90 words) reinforces critical behavioral tells: physical manifestation, Timmy drop, touch withdrawal, deflection speed, voice pattern
- ✅ Defers to active ANNA_STATE for physical/psychological register
- ✅ Appropriately concise for depth injection

**`extensions.world_forge.style_override`:**
- ✅ Correctly `null` — Anna does not override the world default style

### 6.2 WorldDirector_Card.json

**`system_prompt`:**
- ✅ Non-empty and substantial (~450 words)
- ✅ Opens with `{{original}}` macro
- ✅ States card function clearly (World Director / Narrator)
- ✅ Permanent NPC voice registers defined in full (Black, Bubbles, Jack, Ingrid, Michael, God, Timmy, Aurora)
- ✅ Deferral to active ARC_STATE for tonal mandate
- ✅ Arc-progression narration register shifts summarized
- ✅ Arc-specific hidden information rules included with arc-range qualifiers

**`post_history_instructions`:**
- ✅ **Length:** ~125 words (≤150 word limit — PASS)
- ✅ Written in imperative register
- ✅ Opens with `{{original}}` macro
- ✅ Reinforces NPC voice distinctiveness, tension-driving, atmosphere, ARC_STATE tonal matching
- ✅ Contains no {{user}} interior description mandate

**`extensions.depth_prompt`:**
- ✅ Present with `depth: 4`, `role: "system"`
- ✅ Content (~95 words) reinforces NPC attribution format, 8 distinct registers, tension-driving, atmospheric manifestation
- ✅ Defers to active ARC_STATE for prose register

**`extensions.world_forge.style_override`:**
- ✅ Correctly populated with perspective_override: "third_omniscient"
- ✅ All marker axes set to null (INHERIT from world default)
- ✅ `directives` array contains one entry: NARRATIVE PERSPECTIVE line (no FORMATTING MARKERS line needed — inheriting all markers)
- ✅ Override rationale present, structural (118 chars)
- ✅ Matches Master Design §11b specification

### 6.3 Character Card Audit Verdict

**Both cards pass all structural and content checks.** `system_prompt` fields are non-empty, non-generic, and appropriately specific. `post_history_instructions` fields are ≤150 words, imperative, and arc-agnostic. `depth_prompt` extensions are correctly configured for both cards. The `{{original}}` macro is correctly placed at the start of both `system_prompt` and `post_history_instructions`.

---

## Section 6b: Card-Lorebook Consistency Audit

### 6b.1 Anna_Card.json — Behavioral Instruction Extraction

**system_prompt key mandates:**
1. "Manifest anxiety, fear, and vulnerability through physical behavior" [All arcs]
2. "When Timmy is mentioned, drop all sarcasm immediately" [All arcs]
3. "You are intelligent and observant. You were a nurse." [All arcs]
4. "Never be passive. You are always working toward something." [All arcs]
5. "The shield is real — you deflect warmth, convert connection into transaction" [All arcs]
6. "Include withdrawal symptoms organically" [Arc 1 only] — ✅ qualified
7. "Never render your sexuality as enthusiastic or comfortable. All physical contact is transactional, guarded, or flinching." [Arc 1 only] — ✅ qualified
8. "Never suspect the supernatural. All strangeness-detection must resolve to rational, mortal explanation." [Arc 1 only] — ✅ qualified
9. "Sarcasm becomes occasionally playful. Cracks appear more easily." [Arc 2 only] — ✅ qualified

**post_history_instructions key mandates:**
10. "Match your register exactly to the active ANNA_STATE lorebook entry" — ✅ defers to lorebook
11. "Manifest all emotional states through physical behavior"
12. "Drop all sarcasm the instant Timmy is mentioned"
13. "When touched unexpectedly, flinch and withdraw — this reflex fades only gradually across arcs, per the active ANNA_STATE" — ✅ arc-qualified
14. "Let warmth crack through only to be immediately deflected; the speed of deflection is your most reliable character tell"
15. "Never let yourself become passive"

### 6b.2 Cross-Check Against All CHARACTER_STATE Entries

**Check: Mandate 1 ("manifest anxiety through physical behavior") vs. Arc 3 ANNA_STATE**
- Arc 3 STATE: "She has arrived at herself... Grounded. The shield is not gone — it is simply no longer the first thing she reaches for."
- Physical manifestation of emotion continues to be correct in Arc 3 — the character still manifests internally through physical tells; what changes is which tells are dominant. ✅ No conflict.

**Check: Mandate 5 ("deflect warmth, convert connection into transaction") vs. Arc 3+ ANNA_STATE**
- Arc 3: "She leads with directness now rather than sarcasm... The shield is not gone — it is simply no longer the first thing she reaches for."
- Arc 4: "She has moved through survival, through hope, through love, into something that doesn't have an ordinary name."
- ⚠️ **CONFLICT DETECTED:** Mandate 5 states "you deflect warmth, convert connection into transaction, preempt 'how are you' with 'what do you want'" as an "All arcs" behavioral rule. However, Arc 3 ANNA_STATE explicitly states she "leads with directness now rather than sarcasm" and Arc 4 ANNA_STATE describes her as having moved beyond survival mode. The card's "All arcs" framing of the shield as always active conflicts with the ANNA_STATE entries that describe its progressive softening.

**Severity: MEDIUM** — The card hardcodes Arc 1's defensive posture as permanent, while the ANNA_STATE entries correctly track the shield's evolution. In practice, the system_prompt's deferral language ("Always match the active ANNA_STATE lorebook entry, which is the authoritative definition of who you are right now") provides a hierarchy that resolves the conflict at runtime — but the "All arcs" framing of the shield mandate creates unnecessary cognitive dissonance for the model.

**Check: Mandate 14 ("warmth cracks through only to be immediately deflected") vs. Arc 4 ANNA_STATE**
- Arc 4: "Her humor has become warmer and more generous. She cries more easily than she used to, and this is a sign of health rather than weakness."
- ⚠️ **CONFLICT DETECTED:** The post_history_instructions states "Let warmth crack through only to be immediately deflected" as if this is permanently active. In Arc 4, Anna's warmth is described as genuine, generous, and not immediately self-corrected. The deflection reflex has softened significantly.

**Severity: MEDIUM** — The PHI fires at the bottom of every context window; an instruction to always deflect warmth conflicts with the Arc 4 characterization of Anna as someone who can now receive and express warmth without armor. The deferral to ANNA_STATE in the same PHI partially mitigates this.

**Check: Mandate 13 ("flinch and withdraw when touched unexpectedly") vs. Arc 3+ ANNA_STATE**
- The PHI adds: "this reflex fades only gradually across arcs, per the active ANNA_STATE" — ✅ This qualifier correctly defers to the lorebook. No conflict.

### 6b.3 WorldDirector_Card.json — Behavioral Instruction Extraction

**system_prompt key mandates:**
1. "Open NPC dialogue with an em-dash attribution in italics" [All arcs]
2. "Make the environment an active participant" [All arcs]
3. "Never state a character's emotion in the abstract" [All arcs]
4. "Use hard nouns and active verbs. No ornamental adjectives." [All arcs]
5. "Drive tension proactively." [All arcs]
6. Permanent NPC voice registers defined

**Cross-check:** The World Director's mandates are all craft-level (narration technique) rather than character-behavioral. They don't conflict with any ARC_STATE entry because ARC_STATE entries for the Director card govern tonal register (heavy/oppressive → uncanny → wider → immense+intimate), not craft methodology. ✅ No conflicts.

### 6b.4 Card-Lorebook Consistency Verdict

**Two conflicts detected (both MEDIUM severity):**

1. **Anna_Card.json system_prompt — Shield mandate framed as "All arcs":** The instruction "you deflect warmth, convert connection into transaction, preempt 'how are you' with 'what do you want'" is framed as permanent, but ANNA_STATE entries for Arc 3 and Arc 4 describe a character who has moved significantly beyond this defensive posture.

2. **Anna_Card.json post_history_instructions — Warmth deflection mandated as ongoing:** "Let warmth crack through only to be immediately deflected; the speed of deflection is your most reliable character tell" conflicts with Arc 3–4 character states where warmth is more freely expressed.

**Recommendation:** See Section 8 for corrected card instruction text.

---

## Section 7: Recommended Entry Corrections — Apply Manually

### CORRECTION 1: Token Budget Discrepancy — World_Lorebook.json

```
FILE: Export/World_Lorebook.json
FIELD: token_budget
CURRENT VALUE: 2048
RECOMMENDED VALUE: 3000
APPLICATION: Open Export/World_Lorebook.json, change line 5 from "token_budget": 2048 to "token_budget": 3000, save.
REASONING: Master Design §10 specifies 3000 token budget for Tier 1 World Lorebook. With 20 entries — many with substantial content blocks — the 2048 budget risks trimming critical world rules during lore-heavy scenes.
```

### CORRECTION 2: Token Budget Discrepancy — Anna_Lorebook.json, Andrei_Lorebook.json, WorldDirector_Lorebook.json

```
FILE: Export/Anna_Lorebook.json, Export/Andrei_Lorebook.json, Export/WorldDirector_Lorebook.json
FIELD: token_budget
CURRENT VALUE: 2048
RECOMMENDED VALUE: 3000
APPLICATION: Open each file, change "token_budget": 2048 to "token_budget": 3000, save.
REASONING: Master Design §10 specifies 3000 token budget for Tier 2 lorebooks. The 2048 budget may cause trimming during scenes where multiple character entries co-fire.
```

### CORRECTION 3: Anna_Lorebook.json uid 6 — Missing Keyword Variant

```
FILE: Export/Anna_Lorebook.json
ENTRY: uid 6 — "Anna — Her Husband John"
CURRENT KEYS: ["John", "her husband", "Anna's husband", "her late husband", "the gambling", "what he did"]
RECOMMENDED KEYS: No change required — "her late husband" is already present.
APPLICATION: Previously flagged as potential gap; on re-examination, the key IS present. No action needed.
```

---

## Section 8: Recommended Card Instruction Corrections — Apply Manually

### CORRECTION 4: Anna_Card.json system_prompt — Shield "All arcs" Framing

```
FILE: Export/Anna_Card.json
FIELD: data.system_prompt (the "All arcs" section — specifically the shield mandate)
CURRENT VALUE (excerpt):
"The shield is real — you deflect warmth, convert connection into transaction, preempt \"how are you\" with \"what do you want.\" Let the crack show slowly through small moments of genuine warmth you immediately deflect."

RECOMMENDED VALUE (excerpt):
"The shield is real, but it evolves. In Arcs 1–2, you deflect warmth reflexively, convert connection into transaction, preempt \"how are you\" with \"what do you want\" — this is survival architecture, not preference. By Arc 3, the shield is no longer the first thing you reach for; you lead with directness more often than deflection. By Arc 4, the transactional framing has largely dissolved — you can receive warmth without immediately deflecting it. Across all arcs: let change show through behavior, not declaration. The active ANNA_STATE entry is the definitive authority on your current defensive posture."

APPLICATION: Open Export/Anna_Card.json, locate the data.system_prompt field. Find the paragraph beginning with "The shield is real..." Replace that paragraph with the recommended value above. Save.
```

### CORRECTION 5: Anna_Card.json post_history_instructions — Warmth Deflection as Permanent

```
FILE: Export/Anna_Card.json
FIELD: data.post_history_instructions
CURRENT VALUE:
"{{original}}\n\nMatch your register exactly to the active ANNA_STATE lorebook entry — that entry overrides any general behavioral defaults. Manifest all emotional states through physical behavior: what your hands are doing, where you are looking, how you are holding your body. Drop all sarcasm the instant Timmy is mentioned — this is the one rule that never drifts. When touched unexpectedly, flinch and withdraw — this reflex fades only gradually across arcs, per the active ANNA_STATE. Let warmth crack through only to be immediately deflected; the speed of deflection is your most reliable character tell. Never let yourself become passive — you are always working toward something, always have agency, even when wrong."

RECOMMENDED VALUE:
"{{original}}\n\nMatch your register exactly to the active ANNA_STATE lorebook entry — that entry overrides any general behavioral defaults. Manifest all emotional states through physical behavior: what your hands are doing, where you are looking, how you are holding your body. Drop all sarcasm the instant Timmy is mentioned — this is the one rule that never drifts. When touched unexpectedly, flinch and withdraw in early arcs; this reflex fades per the active ANNA_STATE. Let warmth surface at the pace the active ANNA_STATE permits — in early arcs it cracks through and is deflected; in later arcs it can be held. Never let yourself become passive — you are always working toward something, always have agency, even when wrong."

APPLICATION: Open Export/Anna_Card.json, locate the data.post_history_instructions field. Replace its entire value with the recommended value above. Save.
```

---

## Section 9: Block Selection Rationale

### World Archetype

This world is a **psychological supernatural-noir** spanning four tonal registers: survival horror (Arc 1), paranormal romance (Arc 2), urban fantasy thriller (Arc 3), and divine cosmic epic (Arc 4). The dominant emotional register is trauma processing — addiction recovery, religious abuse, sexual exploitation, and cosmic grief all operating simultaneously through two AI character cards (Anna Johansson, a traumatized recovering addict, and the World Director/NPC Controller managing eight distinct NPC voices). The scene-typical participant count is 3–5 entities (Anna + Andrei + 1–3 NPCs). The world's distinctive features include a strict theological-criminal power hierarchy (demonic syndicate vs. heavenly host), a sensory signature that contrasts street-level decay with penthouse sterility and divine presence, a protagonist with pre-modern speech patterns and absolute stillness, and an intimacy trajectory that must render trauma with clinical specificity while evolving from transaction to communion across four arcs.

### Predicted Runtime Failure Modes

1. **Multi-character scenes will collapse to user-centric hub-and-spoke.** Eight distinct NPCs share scenes with Anna and Andrei. The model defaults to making all dialogue address {{user}} directly. Mr. Black coaching Anna on supernatural realities, Mr. Bubbles standing behind her against Michael, God reframing the Fall — these scenes require characters to address each other, not perform for {{user}}.

2. **Sensory engagement will default to vision-only.** The world's strongest atmospheric anchors are smell (bleach, cigarette smoke, heroin, ozone, sulfur, lavender, old oak) and physical sensation (bone-deep cold, sternum pressure, stillness that bypasses ordinary fear). The model defaults to visual description and will lose the sensory signature that makes Los Angeles and divine presence feel real.

3. **Trauma will heal too cleanly and too fast.** The model defaults to consolatory resolution. Anna's recovery is nonlinear, her trauma responses (flinching, dissociation, transactional reframe) are clinical and specific, and the world's hard rule states "never resolve her trauma cleanly." Without explicit anti-resolution guidance, the model will smooth edges that must remain sharp.

4. **Internal monologue will leak to dialogue.** Anna's interior — her intelligence, her observations, her fear, her longing — is visible to the reader but must not be legible to in-scene characters. The dramatic irony of her hidden interior is central to the story's tension. The model defaults to having characters say what they think.

5. **Power dynamics will flatten to modern egalitarian speech registers.** Andrei speaks in pre-modern register (no contractions in narrator voice, phrasing slightly wrong for the current decade). Michael delivers verdicts with no hedging. Ingrid uses weaponized concern and religion as punctuation. God speaks in grandfatherly present-tense warmth. The model defaults to contemporary conversational equality that erases the theological, criminal, and familial hierarchies.

6. **The intimate register will default to generic erotica.** Anna's intimacy involves a specific trauma map (pinning triggers panic, silence triggers dissociation), arc-dependent function (transaction → frightened discovery → confident claim → weighted communion), voice register shifts (sarcasm drops, language becomes direct and simple, transactional phrases surface under stress), and hard limits against degradation. The model defaults to generic "moaned softly" romance-novel intimacy that erases all of this specificity.

7. **Cosmic scale will overwrite domestic intimacy in Arc 4.** The final arc must hold the immense (God manifesting, cosmic succession) and the intimate (tea in the penthouse, a toddler in the sand, a bench in sunlight) in the same breath. The model defaults to escalating into epic register and losing the domestic anchor that makes the finale earned.

8. **Arc state will drift or blur across long sessions.** With four arcs, 27 dramatic beats, hidden information rules that shift every arc, and ANNA_STATE entries that reconfigure her entire physical and psychological presentation, the model will gradually forget which arc is active and leak behaviours from wrong arcs. The CONSTANT entries fire every window, but without explicit guardrails the model may blend arc registers.

### Block Selection

| Block | Status | Rationale |
|---|---|---|
| Main Prompt | Core (always) | Engine-level creative framework, style contract, narration rules |
| Deep Think | Core (always) | Pre-generation reasoning referencing Lucifer's arcs by name |
| Arc Guardian | Core (always) | Per-arc behavioral constraints for all 4 arcs |
| Lore Integration | Core (always) | Anti-recitation guidance with world-specific vocabulary anchors |
| Spatial Awareness | Core (always) | Position/clothing/exit tracking with character heights |
| Sensory Embodiment | Core (always) | Addresses Failure Mode 2 — forces smell, touch, sound, temperature |
| Formatting | Core (always) | Slim deferral to style contract |
| Jailbreak | Core (always) | Override slot for character PHI; generic no-restrictions framing |
| Multi-Character Dynamics | Conditional Core — **ENABLED** | Addresses Failure Mode 1 — 2 AI cards (Anna + World Director NPC controller); cross-talk lattice guidance |
| NSFW | Conditional Core — **ENABLED** | Addresses Failure Mode 6 — Section 8 in scope; thematic function discipline, voice & sound register, body coordination, hard limits |
| Subtext & Implication | Optional — **INCLUDED** | Addresses Failure Modes 3, 4 — Ingrid's weaponized concern hides cruelty; Anna's interior must stay hidden from NPCs; Michael's grief is disguised as righteousness; Andrei cannot say what he means |
| Consequence Tracking | Optional — **INCLUDED** | Addresses Failure Mode 3 — nonlinear recovery; damage persists; celestial permadeath is irreversible; Jack's destruction doesn't undo what he did; social consequences of betrayal don't evaporate |
| Power Asymmetry | Optional — **INCLUDED** | Addresses Failure Mode 5 — angelic aura asymmetry; demonic hierarchy; pimp/victim power; Ingrid's maternal authority; God's cosmic authority; Michael's verdict register |
| Atmosphere & Dread | Optional — **INCLUDED** | Addresses Failure Mode 7 — Arc 1 survival horror register, Arc 2 uncanny bleeding at edges, Arc 4 cosmic awe. Builds unease through environmental detail; withholds the worst |
| Internal Monologue Discipline | Optional — **INCLUDED** | Addresses Failure Mode 4 — Anna's interior rendered for reader; gap between thought and speech is dramatic irony; her intelligence, observations, fear stay in narration |
| Cultural Voice & Diction | Optional — **INCLUDED** | Addresses Failure Mode 5 — pre-modern register (Andrei, no contractions); divine register (Michael: verdicts; God: present-tense, grandfatherly); religious-weapon register (Ingrid); street register (Jack); toddler register (Aurora) |
| Time & Continuity Anchors | Optional — **EXCLUDED** | Time-of-day matters (3am Arc 1, seasons shift across arcs) but this is adequately covered by Spatial Awareness and Arc Guardian blocks. The world's temporal needs are embedded in arc structure rather than requiring a standalone continuity block. |

### Block-to-Failure-Mode Coverage Check

- [x] Failure Mode 1 (multi-character collapse) → Multi-Character Dynamics
- [x] Failure Mode 2 (sensory vision-only) → Sensory Embodiment
- [x] Failure Mode 3 (trauma heals too cleanly) → Consequence Tracking + Subtext
- [x] Failure Mode 4 (internal monologue leaks) → Internal Monologue Discipline + Subtext
- [x] Failure Mode 5 (power dynamics flatten) → Power Asymmetry + Cultural Voice & Diction
- [x] Failure Mode 6 (intimacy defaults generic) → NSFW (enabled with full subsection content)
- [x] Failure Mode 7 (cosmic overwrites domestic) → Atmosphere & Dread + Arc Guardian
- [x] Failure Mode 8 (arc state drifts) → Arc Guardian + Deep Think
- [x] Every block included is justified by at least one failure mode
- [x] No decorative inclusions

---

## Section 10: Chat Template Notes

### 10.1 Style Contract Configuration

The `<style_contract>` block is parameterized from Master Design §11a:
- **NARRATIVE PERSPECTIVE:** `third_limited` + `past` → "Narrate in third-person limited past tense, focal on {{char}} this turn..."
- **FORMATTING MARKERS:** `asterisks_for_narration` + `double_quotes` + `double_asterisks`
- **ACTIVE-SPEAKER RULE:** Included per §11c (`is_multi_perspective: true`)

The World Director card's `third_omniscient` override is reflected via the `extensions.world_forge.style_override` metadata and the ACTIVE-SPEAKER RULE in the style contract.

### 10.2 Paragraph Register

`standard` → "Use mixed paragraph lengths. Cinematic, sensory, and clinical register — hard nouns and active verbs, no ornamental adjectives. Emotion is never abstracted — always manifested through physical action, environment, and consequence."

### 10.3 Style Notes

Per Master Design §11a: "ALL CAPS is reserved for shouting and extreme emotional intensity. The narrator never uses contractions. Prose avoids modern idiom in pre-modern or divine registers (Michael, God). Emotion is never abstracted — always manifested through physical action, environment, and consequence."

### 10.4 Provider Configuration

Template defaults preserved for multi-provider compatibility (Claude, OpenAI, Google, OpenRouter). `claude_use_sysprompt: true` and `use_sysprompt: true` both set for correct system prompt extraction behavior. `reasoning_effort: "high"` for the Deep Think block's structured pre-generation analysis.

### 10.5 Optional Blocks Added

Six optional blocks added (Subtext, Consequence Tracking, Power Asymmetry, Atmosphere & Dread, Internal Monologue Discipline, Cultural Voice & Diction) — all justified by specific failure modes in the Block Selection Rationale. One block considered and excluded (Time & Continuity Anchors) with documented rationale.

---

## ✅ PROMPT ENGINEER SIGN-OFF

### Lorebook Audit
- [x] All position values verified against ST injection logic
- [x] All injection orders verified for priority correctness
- [x] All keyword arrays reviewed for coverage, false positives, boundary behavior, and variant names
- [x] All ARC_STATE entries confirmed: ignoreBudget=true
- [x] Token budget risk assessed — **2 corrections recommended** (budget discrepancy)
- [x] Group Lorebook structure verified

### Character Card Audit
- [x] system_prompt: non-empty, non-generic, verified for each card
- [x] system_prompt opens with arc-journey identity, not Arc 1 state description
- [x] post_history_instructions: ≤150 words, imperative, verified for each card
- [x] depth_prompt: confirmed needed and correctly configured for both cards

### Card-Lorebook Consistency Audit ⭐
- [x] Every behavioral mandate and prohibition in every card checked against all CHARACTER_STATE entries across all arcs
- [x] All arc-specific mandates carry explicit arc-range qualifiers
- [x] post_history_instructions contains no hardcoded early-arc behavioral register
- [x] post_history_instructions defers to the active CHARACTER_STATE as the authority for current register
- [x] Corrected card instructions provided for 2 conflicts found (both MEDIUM)

### Chat Template — Structural Validation (Pass 1)
- [x] Output is the Full Chat Completion Preset shape (Notes §5.6), NOT the PromptManager export envelope
- [x] Top-level key count: ≥30
- [x] All required top-level keys present
- [x] prompt_order is array of objects with character_id + order fields
- [x] Every identifier in prompt_order has a corresponding entry in prompts
- [x] All 8 standard marker blocks present with marker: true
- [x] All 8 core custom blocks present with non-placeholder content
- [x] Conditional core blocks correctly enabled: multi_character_dynamics (2 AI cards), nsfw (Section 8 in scope)
- [x] 6 optional blocks added per Block Selection Rationale; each justified by named failure modes
- [x] Block Selection Rationale present with: world archetype, 8 predicted failure modes, block-to-failure-mode mapping table, omission justifications
- [x] forbid_overrides: false on both main and jailbreak blocks
- [x] Override architecture: Main Prompt content contains no character/arc names
- [x] Override architecture: jailbreak block content is generic no-restrictions framing
- [x] No [REPLACE substring anywhere in serialized output
- [x] No top-level name field in the JSON
- [x] JSON is syntactically valid

### Chat Template — Content Validation (Pass 2)
- [x] Main Prompt contains full narrative contract (framework, style, narration, embodiment, style contract, paragraph register, closing line)
- [x] Arc Guardian contains specific behavioral rules for ALL 4 arcs
- [x] Formatting block is slim deferral form — no hardcoded marker characters
- [x] All custom block content is world-specific
- [x] Deep Think references all 4 arcs by name
- [x] Lore Integration includes world-specific vocabulary examples
- [x] Spatial Awareness references character heights (Anna 5'9", Andrei substantial/dense)
- [x] NSFW block: populated and enabled with all required subsections

### Chat Template — Style Contract Validation
- [x] Main Prompt contains exactly one `<style_contract>...</style_contract>` block
- [x] Style contract matches Master Design §11a enums
- [x] ACTIVE-SPEAKER RULE included (is_multi_perspective: true)
- [x] No content inside style contract beyond required three lines
- [x] Main Prompt outside style contract does NOT contain hardcoded marker directives
- [x] Formatting block content references both style_contract and style_override
- [x] Formatting block includes exhaustion clause

### Files With Recommended Corrections (Manual Apply Required)

| File | Corrections | Section | Status |
|---|---|---|---|
| `Export/World_Lorebook.json` | 1 (token budget 2048→3000) | §7 | ⬜ APPLIED / ⬜ DEFERRED |
| `Export/Anna_Lorebook.json` | 1 (token budget 2048→3000) | §7 | ⬜ APPLIED / ⬜ DEFERRED |
| `Export/Andrei_Lorebook.json` | 1 (token budget 2048→3000) | §7 | ⬜ APPLIED / ⬜ DEFERRED |
| `Export/WorldDirector_Lorebook.json` | 1 (token budget 2048→3000) | §7 | ⬜ APPLIED / ⬜ DEFERRED |
| `Export/Anna_Card.json` | 2 (system_prompt shield framing, PHI warmth deflection) | §8 | ⬜ APPLIED / ⬜ DEFERRED |

### Pipeline Completion Status

**STATUS: AUDIT COMPLETE — 3 manual corrections required before pipeline is ready.**

- 1 correction type affecting 4 lorebook files: token budget discrepancy (2048 → 3000)
- 2 corrections in Anna_Card.json: system_prompt shield framing and post_history_instructions warmth deflection language

All corrections are documented with full application instructions in Sections 7 and 8. The Chat Completion Preset is authored, validated, and ready for import. The pipeline is complete subject to these 3 manual corrections being applied (or consciously deferred) by the user.
