# PROMPT ENGINEER AUDIT REPORT
*Phase 5 — Lucifer World Forge Pipeline*

**Date:** 2026-05-07
**Agent:** The Prompt Engineer (Phase 5)
**Status:** COMPLETE

---

## Section 1: Position Logic Review

### World Lorebook (`World_Lorebook.json`) — 22 entries

| Entry | UID | Comment | Position | Verdict |
|-------|-----|---------|----------|---------|
| 0 | 0 | World Rule — Demonic Disguises | 0 | ✓ World fact |
| 1 | 1 | World Rule — Sanctity of Free Will | 0 | ✓ World fact |
| 2 | 2 | World Rule — Celestial Permadeath | 0 | ✓ World fact |
| 3 | 3 | World Rule — Angelic Aura | 0 | ✓ World fact |
| 4 | 4 | Faction — The Black Hand of God | 0 | ✓ World fact |
| 5 | 5 | Faction — The Heavenly Host | 0 | ✓ World fact |
| 6 | 6 | Faction — Jack's Prostitution Ring | 0 | ✓ World fact |
| 7 | 7 | Location — Andrei's Penthouse | 0 | ✓ World fact |
| 8 | 8 | Location — Anna's Apartment | 0 | ✓ World fact |
| 9 | 9 | Location — Ingrid's House | 0 | ✓ World fact |
| 10 | 10 | Location — The Streets | 0 | ✓ World fact |
| 11 | 11 | Species — Demons | 0 | ✓ World fact |
| 12 | 12 | Species — Angels | 0 | ✓ World fact |
| 13 | 13 | Species — Nephilim | 0 | ✓ World fact |
| 14 | 14 | Concept — The Veil | 0 | ✓ World fact |
| 15 | 15 | Concept — The Fall | 0 | ✓ World fact |
| 16 | 16 | Concept — Heroin Addiction | 0 | ✓ World fact |
| 17 | 17 | Sensory Signature | 0 | ✓ World fact |
| 18 | 18 | Tonal Rule — Violence/Addiction Realism | 2 | ✓ Tone directive → Author's Note Top |
| 19 | 19 | Tonal Rule — Supernatural Weight | 2 | ✓ Tone directive → Author's Note Top |
| 20 | 20 | Tonal Rule — Earned Tone Shift | 2 | ✓ Tone directive → Author's Note Top |
| 21 | 21 | Tonal Rule — Intimacy/Trauma Rendering | 2 | ✓ Tone directive → Author's Note Top |

**Position verdict:** All correct. The 14 world-fact entries live at position 0 (before character definition) where world rules, factions, locations, species, and concepts must load. The 4 tonal hard rules live at position 2 (Author's Note Top) which is the correct slot for tone/atmosphere directives per the position logic table. The Compiler accepted positions per Architect rationale (D2 in Compiler Log) — this is confirmed correct.

### NPC Lorebook (`NPC_Lorebook.json`) — 8 entries

All 8 NPC baseline profiles are at `position: 0`. This was the Architect's deliberate choice, validated through Editor Critique Round 3 (Hard Rule 6) and accepted by the Compiler (D1 in Compiler Log).

**Position verdict:** Accepted. Per the agent spec position table, NPC profiles normally belong at position 1 (After Character Definition) as character reference data. The Architect's rationale for position 0 is that NPC profiles must load before the World Director card so the Director knows the NPCs it is voicing. This is a defensible architectural judgment that went through two rounds of audit. The entries are correctly group-tagged "NPC" and can be enabled/disabled independently. No action required.

### Andrei Lorebook (`Andrei_Lorebook.json`) — 10 entries

All 10 protagonist reference entries at `position: 1`.

**Position verdict:** ✓ Correct. Protagonist reference data belongs after character definition — it supplements the persona card, not precedes it.

### Anna Lorebook (`Anna_Lorebook.json`) — 10 entries

All 10 permanent character reference entries at `position: 1`.

**Position verdict:** ✓ Correct. Character reference data belongs after character definition.

### Anna Intimacy Profile (`Anna_Intimacy_Profile.json`) — 8 entries

All 8 permanent intimacy substrate entries at `position: 1`.

**Position verdict:** ✓ Correct. Reference data after character definition.

### Arc 1 Lorebook (`Arc1_Lorebook.json`) — 14 entries

| UID | Comment | Position | Constant | ignoreBudget | Verdict |
|-----|---------|----------|----------|-------------|---------|
| 0 | ARC_STATE — Arc 1 | 1 | true | true | ✓ |
| 1 | ANNA_STATE — Arc 1: The Wreckage | 1 | true | true | ✓ |
| 2 | Location — Penthouse (Arc 1) | 1 | false | false | ✓ |
| 3 | Location — The Streets (Arc 1) | 1 | false | false | ✓ |
| 4-5 | NPC_SHIFT entries | 1 | false | false | ✓ |
| 6 | Dramatic Beat — Jack's Encroachment | 1 | false | false | ✓ |
| 7 | Dramatic Beat — First Contact | 1 | false | false | ✓ |
| 8 | Tone/Pacing — Arc 1 | 1 | false | false | ✓ |
| 9-10 | TENSION entries | 4 | false | false | ✓ |
| 11-13 | Additional entries | 1 | false | false | ✓ |

**Position verdict:** ✓ All correct. ARC_STATE and ANNA_STATE at position 1 with ignoreBudget=true and constant=true. TENSION entries at position 4 with depth 4. All other arc entries at position 1.

### Arc 2 Lorebook (`Arc2_Lorebook.json`) — 13 entries

Same structural pattern as Arc 1. ARC_STATE (UID 0) and ANNA_STATE (UID 1) at position 1, constant=true, ignoreBudget=true. NPC_SHIFT entries at position 1. TENSION entries at position 4. All correct.

### Arc 3 Lorebook (`Arc3_Lorebook.json`) — 10 entries

Same pattern verified. ARC_STATE, ANNA_STATE at position 1 with correct flags. TENSION entries at position 4. All correct.

### Arc 4 Lorebook (`Arc4_Lorebook.json`) — 14 entries

Same pattern verified. ARC_STATE, ANNA_STATE at position 1 with correct flags. TENSION entries at position 4. All correct.

### Arc Intimacy Registers (4 files, 5 entries each)

All 20 entries across 4 files follow identical pattern: INTIMACY_FUNCTION_Arc[N] at position 1, constant=true, ignoreBudget=true; ANNA_INTIMATE_REGISTER_Arc[N] at position 1, constant=true, ignoreBudget=true; supporting entries at position 1.

**Position verdict:** ✓ All correct. Intimacy function and register entries are character-state data — position 1 is correct.

### Position Logic Summary

| Issue Count | Severity |
|-------------|----------|
| 0 position errors | — |
| 1 accepted deviation (NPC at pos 0) | Noted, accepted per prior audit |

**Section 1 Status: ✅ PASS — All positions correct or accepted with documented rationale.**

---

## Section 2: Injection Order Review

### World Lorebook Order Stack (Position 0)

| Order | UID | Comment | Priority |
|-------|-----|---------|----------|
| 100 | 0 | Demonic Disguises | Highest — foundational rule |
| 99 | 1 | Sanctity of Free Will | Cosmic law |
| 98 | 2 | Celestial Permadeath | Cosmic law |
| 97 | 3 | Angelic Aura | Cosmic law |
| 85 | 4 | Black Hand of God | Faction |
| 84 | 5 | Heavenly Host | Faction |
| 83 | 6 | Jack's Ring | Faction |
| 80 | 7 | Penthouse | Location |
| 79 | 8 | Anna's Apartment | Location |
| 78 | 9 | Ingrid's House | Location |
| 77 | 10 | The Streets | Location |
| 75 | 11 | Demons | Species |
| 74 | 12 | Angels | Species |
| 73 | 13 | Nephilim | Species |
| 72 | 14 | The Veil | Concept |
| 71 | 15 | The Fall | Concept |
| 70 | 16 | Heroin Addiction | Concept |
| 69 | 17 | Sensory Signature | Concept |

**Order verdict:** ✓ Correct. World rules load first (100→97), followed by factions (85→83), then locations (80→77), then species (75→73), then concepts (72→69), then sensory signature last (69). This respects narrative priority: the model learns the fundamental rules of reality before it learns about specific factions, locations before species detail, etc.

### Arc Lorebook Order Stack (All Arcs)

| Order | Entry Type | Priority Rationale |
|-------|-----------|-------------------|
| 100 | ARC_STATE | Always loads first — defines the arc |
| 95 | ANNA_STATE | Always loads second — defines Anna's state |
| 90 | NPC_SHIFT entries | Load after state entries — NPC behavior depends on state |
| 89-85 | Additional NPC_SHIFT entries | Sequential by narrative importance |
| 80 | Location entries | Load after state/NPC context |
| ~70-75 | Dramatic beats, tone/pacing | Load after physical/spatial context |
| ~90-100 | TENSION (position 4) | High order in depth slot for maximum recency |

**Order verdict:** ✓ Correct across all 4 arc lorebooks. ARC_STATE loads before ANNA_STATE, which loads before NPC_SHIFT entries. This respects the dependency chain: the model must know the arc context before knowing Anna's state within it, and must know Anna's state before knowing how NPCs are responding to her this arc.

### Intimacy Register Order

| Order | Entry | 
|-------|-------|
| 94 | INTIMACY_FUNCTION_Arc[N] |
| 93 | ANNA_INTIMATE_REGISTER_Arc[N] |
| 92-90 | Supporting entries |

**Order verdict:** ✓ Correct. Thematic function loads before register, which loads before supporting detail.

**Section 2 Status: ✅ PASS — All injection orders correct.**

---

## Section 3: Keyword Coverage Audit

### Methodology
Each entry's keyword array was assessed against the four-step framework: coverage, false positive risk, word boundary behavior, and variant coverage.

### Entries Requiring Attention

**ENTRY:** Anna — Physical Description (UID 0) in `Anna_Lorebook.json`
**ISSUE:** Variant gap — primary keyword "Anna" is the character's name but the entry also fires on general appearance queries.
**CURRENT KEYS:** `["Anna", "her appearance", "what she looks like", "describe her", "how she looks"]`
**ANALYSIS:** The primary key "Anna" ensures the entry fires whenever the character is discussed. The secondary keys constrain it to appearance-focused triggers. The secondary keys provide good constraint: "her face", "her hair", "her eyes", "her body", "track marks". However, "Anna" alone as a single-word key with `match_whole_words: true` means the regex boundary matching on single words prevents false activation on "Annabelle" etc. but fires on any message mentioning her name. This is appropriate for a character reference entry — it SHOULD be available whenever Anna is discussed. The secondary keys narrow it to appearance-relevant moments. No change recommended.

**ENTRY:** Anna — Psychology and Core Wound (UID 1) in `Anna_Lorebook.json`
**ISSUE:** Mild false positive risk — "Anna feels" and "Anna believes" may fire on casual dialogue.
**CURRENT KEYS:** `["Anna thinks", "Anna feels", "Anna believes", "her personality", "who she is", "what she wants"]`
**ANALYSIS:** Multi-word keys use .includes() matching — "Anna feels" will match any message containing that substring. This is acceptably targeted since these are natural phrasings for when the model needs psychology reference. Secondary keys ("her shield", "what scares her", "her defenses", "her damage") provide good constraint. No change recommended.

**ENTRY:** Faction — Jack's Prostitution Ring (UID 6) in `World_Lorebook.json`
**ISSUE:** Minor variant gap — "street gangs" is used only in secondary keys, not primary.
**CURRENT KEYS:** `["Jack's gang", "street thugs", "rival cartel", "pimps", "Jack's men"]`
**RECOMMENDATION:** Add "street gangs" to primary keys. The Master Design trigger keywords include "Jack's gang, street thugs, rival cartel, pimps, Jack's men" — the current array covers these well. No change required.

**ENTRY:** Concept — The Veil (UID 14) in `World_Lorebook.json`
**ISSUE:** Variant gap — "the masquerade" is present but players may say "the lie" or "hiding".
**CURRENT KEYS:** `["the Veil", "the masquerade", "what they really are", "the truth about Andrei"]`
**ANALYSIS:** Coverage is good. "what they really are" and "the truth about Andrei" are natural phrasings for when the Veil concept becomes relevant. No change recommended.

**ENTRY:** Sensory Signature (UID 17) in `World_Lorebook.json`
**ISSUE:** Coverage — the keywords are somewhat artificial query phrasings not natural to chat.
**CURRENT KEYS:** `["smell of the city", "what the penthouse smells like", "angel smell", "street smell", "sensory"]`
**ANALYSIS:** These keys are moderately unnatural — players don't typically ask "what the penthouse smells like." However, the secondary keys are comprehensive: "ozone", "sulfur", "bleach", "cigarettes", "rain on asphalt", "static hum". These individual sensory words appear naturally in narration and will trigger the entry when relevant. The entry is also flagged with `match_whole_words: true` which means "ozone" won't false-trigger on non-existent partial matches. Acceptable coverage through secondary keys.

### NPC Variant Coverage Assessment

| NPC | Keywords | Variant Coverage |
|-----|----------|-----------------|
| Mr. Black | "Mr. Black", "Black", "the tall one", "Andrei's right hand", "the demon in the suit" | ✓ Excellent — formal name, shorthand, physical descriptor, role descriptor, supernatural descriptor |
| Mr. Bubbles | "Mr. Bubbles", "Bubbles", "the big one", "the large man" | ✓ Good — covers formal, shorthand, and physical descriptors. Missing "the giant" (present in secondary keys only) |
| Jack | "Jack", "the pimp", "Anna's former pimp", "Jack's men", "Jack's gang" | ✓ Good — covers name, role, relational descriptor, and organizational references |
| Ingrid | "Ingrid", "Anna's mother", "the grandmother", "Pasadena", "Timmy's guardian", "mamma" | ✓ Excellent — covers formal name, relational descriptors, location anchor, and the Swedish "mamma" |
| Michael | "Michael", "archangel", "the angel", "Heaven's agent", "divine presence" | ✓ Excellent — covers name, title, generic reference, role, and sensory cue |
| God | "God", "the Father", "the Almighty", "the old man", "His plan" | ✓ Good — covers divine titles and his Arc 4 manifestation descriptor |
| Timmy | "Timmy", "Anna's son", "her boy", "the kid", "eight years old" | ✓ Good — covers name, relational, affectionate, generic, and age-based descriptors |
| Aurora | "the daughter", "their daughter", "Aurora", "the baby", "the Nephilim" | ✓ Good — covers relational, name, age-appropriate, and species-based descriptors |

### Arc Lorebook Keyword Assessment

NPC_SHIFT entries across all arc lorebooks use the same keyword arrays as baseline NPC entries — this is correct because the arc-specific shift should fire when the NPC is mentioned, then override or supplement the baseline. The arc-specific location entries (e.g., Penthouse Arc 1 vs Arc 3) use slightly different keywords to differentiate — Arc 3 adds "Timmy's room", "lived-in", "transformed" as secondary keys. Good design.

**Section 3 Status: ✅ PASS — Keyword coverage is adequate. No critical gaps. Two minor observations noted above for awareness; no corrective action required.**

---

## Section 4: Budget and Token Risk Assessment

### Per-Lorebook Budget Analysis

| Lorebook | Budget | Entries | Largest Entry (est. tokens) | Risk |
|----------|--------|---------|----------------------------|------|
| World_Lorebook | 3000 | 22 | ~250 tokens (Black Hand faction) | Low — entries fire selectively |
| Anna_Lorebook | 2048 | 10 | ~300 tokens (Psychology entry) | Low — selective triggers |
| NPC_Lorebook | 3000 | 8 | ~350 tokens (Mr. Black) | Low — only fires when NPC discussed |
| Anna_Intimacy_Profile | 2048 | 8 | ~300 tokens (Baseline) | Low |
| Arc1_Lorebook | 2048 | 14 | ARC_STATE (ignoreBudget), ANNA_STATE (ignoreBudget), ~150 tokens per NPC_SHIFT | Medium — see below |
| Arc2_Lorebook | 2048 | 13 | Same pattern | Medium |
| Arc3_Lorebook | 2048 | 10 | Same pattern | Low |
| Arc4_Lorebook | 2048 | 14 | Same pattern | Medium |
| Arc1-4_Intimacy_Registers | 2048 each | 5 each | INTIMACY_FUNCTION (ignoreBudget), ANNA_INTIMATE_REGISTER (ignoreBudget) | Low |
| Group_Lorebook | 8096 | 129 | — | — |

### Co-Fire Risk Assessment

**Typical Arc 1 scene (worst case):** ARC_STATE (ignoreBudget) + ANNA_STATE (ignoreBudget) + Penthouse location + NPC_SHIFT (Black) + NPC_SHIFT (Bubbles) + Tone/Pacing + 1-2 TENSION entries = ~7 entries. Of these, 2 are ignoreBudget. Remaining 5 keyed entries at ~150-200 tokens each = ~750-1000 tokens against 2048 budget. Risk: LOW.

**Typical Arc 2 scene with intimate content:** ARC_STATE + ANNA_STATE + NPC_SHIFT (Black) + NPC_SHIFT (Michael) + INTIMACY_FUNCTION (ignoreBudget) + ANNA_INTIMATE_REGISTER (ignoreBudget) + TENSION + Location = ~8 entries firing. Of these, 4 are ignoreBudget. Remaining 4 at ~150 each = ~600 tokens against 2048. Risk: LOW.

**World Lorebook co-fire in typical scene:** Demonic Disguises + Free Will + Faction (Black Hand) + Location (Penthouse) + Species (Demons) + Sensory Signature = ~6 entries at ~200 tokens each = ~1200 tokens against 3000 budget. Risk: LOW.

### ignoreBudget Flag Verification

| Entry Type | Has ignoreBudget: true? | Verdict |
|------------|------------------------|---------|
| All ARC_STATE (4 entries) | ✓ Yes | Correct — must always be present |
| All ANNA_STATE (4 entries) | ✓ Yes | Correct — must always be present |
| All INTIMACY_FUNCTION (4 entries) | ✓ Yes | Correct — the function is the scene's spine |
| All ANNA_INTIMATE_REGISTER (4 entries) | ✓ Yes | Correct — defines current intimacy parameters |
| All other entries | No | Correct — should respect budget |

### Token Budget Risk Summary

| Risk | Status |
|------|--------|
| ARC_STATE entries missing ignoreBudget | None — all 4 confirmed |
| ANNA_STATE entries missing ignoreBudget | None — all 4 confirmed |
| Budget overflow from co-firing | Low risk — ignoreBudget entries correctly excluded from budget calculation |
| Non-critical entries consuming budget | Low risk — entry sizes are proportionate to narrative importance |

**Section 4 Status: ✅ PASS — No budget risks identified. ignoreBudget flagged correctly on all CONSTANT entries.**

---

## Section 5: Group Lorebook Structural Audit

### Group_Lorebook.json Overview

- **Name:** Group_Lorebook
- **Entries:** 129 (UIDs 0–128)
- **Token Budget:** 8096
- **UID uniqueness:** Confirmed via Compiler Log (§2, D4 entry count) — all 129 UIDs are unique across the combined set ✓

### Group Tag Inventory

| Group Tag | Entries | Source Tier | Correct? |
|-----------|---------|-------------|----------|
| World | 22 | Tier 1 | ✓ |
| Arc1 | 14 | Tier 3 | ✓ |
| Arc2 | 13 | Tier 3 | ✓ |
| Arc3 | 10 | Tier 3 | ✓ |
| Arc4 | 14 | Tier 3 | ✓ |
| Anna | 10 | Tier 2 | ✓ |
| NPC | 8 | Tier 2 | ✓ |
| Anna_Intimacy | 8 | Tier 2 | ✓ |
| Arc1_Intimacy | 5 | Tier 3 | ✓ |
| Arc2_Intimacy | 5 | Tier 3 | ✓ |
| Arc3_Intimacy | 5 | Tier 3 | ✓ |
| Arc4_Intimacy | 5 | Tier 3 | ✓ |
| Protagonist (Andrei) | 10 | Tier 2 | ✓ Verified via Compiler Log — group tag matches |

### Group Segregation Assessment

- **Can the player enable/disable tiers independently?** ✓ Yes — each tier has distinct group tags. Arc lorebooks (Arc1, Arc2, Arc3, Arc4) and intimacy registers (Arc1_Intimacy, etc.) are independently toggleable.
- **Is the Protagonist group distinct?** ✓ Yes — Andrei_Lorebook uses its own group tag, separate from NPC and Anna groups.
- **Are intimacy entries segregated from character entries?** ✓ Yes — Anna_Intimacy and Arc[N]_Intimacy are distinct groups.
- **Are World entries segregated from arc entries?** ✓ Yes — "World" is separate from "Arc1-4."

### ST Management Note
Per Master Design §10.2: Enable World group and Anna/Protagonist/NPC character groups (plus Anna_Intimacy) permanently. Swap arc groups — only one arc lorebook + one arc intimacy register active at a time. The group tags support this perfectly.

**Section 5 Status: ✅ PASS — Group Lorebook structure correct. All group tags valid, UIDs unique, tiers independently manageable.**

---

## Section 6: Character Card Audit

### Card 1 — Anna Johansson (`Anna_Card.json`)

**system_prompt:**
- Opens with `{{original}}` ✓ — correctly splices Main Prompt back in
- Opens with arc-journey identity ("a woman on a journey from the wreckage of addiction...") rather than Arc 1 state description ✓
- Contains explicit arc-range qualifiers: "Arc 1 only:", "Arc 1–2:", "All arcs:" ✓
- Defers to active ANNA_STATE: "always match the active ANNA_STATE lorebook entry, which is the authoritative definition of who you are right now" ✓
- Contains concrete behavioral mandates (physical manifestation, Timmy trigger, intelligence, nonlinear recovery) ✓
- Non-empty and non-generic ✓
- **Verdict: ✅ PASS**

**post_history_instructions:**
- Opens with `{{original}}` ✓
- Word count: ~85 words ✓ (well under 150 limit)
- Written in imperative register: "Maintain... Never narrate... Defer to..." ✓
- Defers to active ANNA_STATE as authority: "Defer to the active ANNA_STATE lorebook entry for her current behavioral register, physical condition, and psychological posture — that entry is authoritative and overrides any general default in the card" ✓
- Addresses 3 critical drift patterns: physical register (body over stated emotion), Timmy trigger, and lorebook deference ✓
- **Verdict: ✅ PASS**

**depth_prompt:**
- Present ✓ — populated with content reinforcing physical manifestation, arc-appropriate intimacy register, trigger-response fidelity, and nonlinear recovery
- depth: 4 ✓
- role: "system" ✓
- **Verdict: ✅ PASS** — correctly reinforces behavioral requirements prone to long-context drift

### Card 2 — The Underworld & The Heavens (`World_Director_Card.json`)

**system_prompt:**
- Opens with `{{original}}` ✓
- Defines narrator identity clearly ✓
- Contains per-NPC voice register specifications (Black, Bubbles, Jack, Ingrid, Michael, God, Timmy) ✓
- Contains concrete mandates: em-dash attribution, environment as participant, proactive tension, perspective rules ✓
- Defers to active ARC_STATE for prose register ✓
- Non-empty and non-generic ✓
- **Verdict: ✅ PASS**

**post_history_instructions:**
- Opens with `{{original}}` ✓
- Word count: ~60 words ✓ (well under 150 limit)
- Written in imperative register: "Prose must remain... Manifest all... Voice every... Open all NPC dialogue with..." ✓
- Defers to active ARC_STATE: "Defer to the active ARC_STATE lorebook entry for current genre register, prose rhythm, and sensory density" ✓
- Addresses critical drift patterns: abstract language, NPC voice bleed, perspective violation ✓
- **Verdict: ✅ PASS**

**depth_prompt:**
- Present ✓ — populated with NPC voice distinctiveness, arc register matching, and perspective rule
- depth: 4 ✓
- role: "system" ✓
- **Verdict: ✅ PASS** — correctly reinforces the World Director's complex multi-voice and arc-register requirements

**Section 6 Status: ✅ PASS — Both cards have well-formed system_prompt, post_history_instructions, and depth_prompt fields.**

---

## Section 6b: Card-Lorebook Consistency Audit ⭐

### Step 1 — Anna Card Behavioral Instructions Extracted

**From system_prompt:**
1. "Manifest anxiety, fear, and vulnerability through physical behavior" — All arcs
2. "When Timmy is mentioned, drop all sarcasm immediately" — All arcs
3. "You are intelligent. You were a nurse. You notice things." — All arcs
4. "Recovery is nonlinear. Good days are followed by bad ones." — All arcs
5. "You are in heroin withdrawal... your body is in open revolt." — Arc 1 only ✓
6. "Never volunteer warmth or gratitude without immediately deflecting" — Arc 1–2: ✓
7. "Let the crack show slowly — small moments of genuine warmth" — All arcs
8. "You never suspect the supernatural before the revelation" — Arc 1–2 pre-revelation
9. "Sarcasm has transitioned to directness... you are capable of anger on behalf of other people" — Arc 3+ ✓
10. "The shield is no longer your operating system" — Arc 3+ ✓

**From post_history_instructions:**
1. "Maintain Anna's physical register: interior states manifest through her body" — Universal
2. "When Timmy enters any exchange, sarcasm stops instantly" — Universal
3. "Defer to the active ANNA_STATE lorebook entry" — Universal, correct deference ✓

### Step 2 — Cross-Check Against ANNA_STATE Entries

| Card Instruction | Arc 1 ANNA_STATE | Arc 2 ANNA_STATE | Arc 3 ANNA_STATE | Arc 4 ANNA_STATE | Conflict? |
|-----------------|------------------|-----------------|------------------|-------------------|
| Physical manifestation of interior | ✓ Matches — "defensive, transactional, flinches involuntary" | ✓ Matches — "the tentative middle, shield cracks" | ✓ Matches — "grounded, leads with directness" | ✓ Matches — "steadiness, terrified and certain" | No |
| Timmy = sarcasm drop | ✓ Matches — consistent across all arcs | ✓ | ✓ | ✓ | No |
| Recovery nonlinear | ✓ Matches | ✓ Matches | ✓ Matches | ✓ Matches | No |
| Withdrawal symptoms (Arc 1 only) | ✓ Matches — "18-72 hours into withdrawal" | N/A — correctly arc-qualified | N/A | N/A | No |
| "Never volunteer warmth without deflecting" (Arc 1–2) | ✓ Matches — "defensive, transactional" | ✓ Matches — "the tentative middle... catches herself relaxing and immediately tenses" | N/A — correctly arc-qualified | N/A | No |
| "Sarcasm has transitioned to directness" (Arc 3+) | N/A | N/A | ✓ Matches — "leads with directness now" | ✓ Matches — "she is capable of standing and saying what needs to be said" | No |
| "Never resolve trauma cleanly" (all arcs) | ✓ Matches — raw survival | ✓ Matches — "the contradiction is exhausting" | ✓ Matches — "fear is no longer her operating system" but still present | ✓ Matches — "terrified and certain... both true" | No |
| PHI: "shaking hands, tucked hair, edge-of-chair posture, scanning exits" | ✓ Matches — Arc 1 Anna does all of these | Partial — Arc 2 Anna tucks hair (anxiety) but hands shake less | Partial — Arc 3 Anna "doesn't sit toward edge of chairs as consistently" | Partial — Arc 4 Anna "has stopped bracing for impact" | **Flagged — see below** |

### Step 3 — Conflict Analysis

**CONFLICT:** Anna Card — `post_history_instructions`
**INSTRUCTION:** "Maintain Anna's physical register: interior states manifest through her body — shaking hands, tucked hair, edge-of-chair posture, scanning exits."
**CONFLICTS WITH:** Arc 3 ANNA_STATE — "She doesn't sit toward the edge of chairs as consistently. Her gait is unhurried." Arc 4 ANNA_STATE — "Her body moves with the unhurried confidence of someone who has stopped bracing for impact."
**SEVERITY:** High — The PHI fires at the bottom of every context window. Listing "shaking hands, edge-of-chair posture" as permanent physical tells contradicts Arc 3 and Arc 4 ANNA_STATE entries where Anna has largely stopped these behaviors. The PHI already contains the correct deference clause ("Defer to the active ANNA_STATE lorebook entry... that entry is authoritative and overrides any general default"), but the specific examples risk the model defaulting to Arc 1 physicality.

**CORRECTED VERSION:**
```
{{original}}

Maintain Anna's physical register: interior states manifest through her body, not stated emotion. The specific physical vocabulary shifts across arcs — active withdrawal trembling in Arc 1, guarded tension in Arc 2, relaxed confidence in Arcs 3–4. Defer to the active ANNA_STATE lorebook entry for her current physical vocabulary, behavioral register, and psychological posture — that entry is authoritative and overrides any general default in the card. When Timmy enters any exchange, sarcasm stops instantly and completely; her voice becomes direct and unguarded.
```

### Step 4 — PHI Arc-Agnostic Check

**Current PHI assessment:**
- Does NOT name specific early-arc behaviors as permanent active states? **Partial** — "shaking hands, edge-of-chair posture" are Arc 1 behaviors listed without arc qualification
- DOES reference ANNA_STATE as authority? ✓ Yes
- Contains at most 1–2 truly universal rules? **Partial** — 3 items listed; physical register, Timmy trigger, lorebook deference. The Timmy trigger and lorebook deference are truly universal (confirmed across all 4 ANNA_STATE entries). The physical register description needs arc-qualification.

**World Director PHI arc-agnostic check:**
- Does NOT name specific early-arc behaviors? ✓ — "Prose must remain concrete and visceral — hard nouns, active verbs, no abstract emotional language" applies to all arcs (the method is universal even though the specific register shifts)
- DOES reference ARC_STATE as authority? ✓ — "Defer to the active ARC_STATE lorebook entry"
- Universal rules only? ✓ — 4 items: prose quality, character interior through action, NPC voice distinctiveness, attribution format. All are arc-agnostic.

### Corrected Card Instructions

Only one correction needed (Anna's `post_history_instructions`; shown above in Step 3).

**Section 6b Status: ⚠️ 1 HIGH-severity conflict found. Corrected PHI provided. All other card-lorebook consistency verified.**

---

## Section 7: Corrected Entries

No lorebook entries require position, order, keyword, or budget correction. All 129 entries across 16 lorebook files passed structural audit with the exception of one noted/accepted position deviation (NPC at position 0).

**Corrected entry count: 0 — No lorebook entry blocks require correction.**

---

## Section 8: Corrected Card Instructions

### Anna_Card.json — `post_history_instructions`

Replace current content with:

```
{{original}}

Maintain Anna's physical register: interior states manifest through her body, not stated emotion. The specific physical vocabulary shifts across arcs — active withdrawal trembling in Arc 1, guarded tension in Arc 2, relaxed confidence in Arcs 3–4. Defer to the active ANNA_STATE lorebook entry for her current physical vocabulary, behavioral register, and psychological posture — that entry is authoritative and overrides any general default in the card. When Timmy enters any exchange, sarcasm stops instantly and completely; her voice becomes direct and unguarded.
```

**Rationale:** The original PHI listed "shaking hands, tucked hair, edge-of-chair posture, scanning exits" as specific physical tells without arc-range qualification. While the PHI correctly deferred to ANNA_STATE, the specific examples risk the model defaulting to Arc 1 body language even when the active ANNA_STATE (Arc 3 or 4) describes relaxed, confident physicality. The corrected version names the arc-specific difference explicitly and removes the Arc-1-heavy examples, making the deference to ANNA_STATE unambiguous.

---

## Section 9: Block Selection Rationale

### World Archetype

This is a **grimdark-to-divine transfiguration world** — a four-act supernatural slow-burn romance that moves through distinct genre registers (survival horror, supernatural romance, urban fantasy thriller, divine cosmic epic) anchored by a single human woman's physical and psychological recovery from heroin addiction. The world operates on a strict supernatural hierarchy (demonic/angelic/divine) with specific sensory signatures for each stratum. Scenes typically involve 2–5 participants: the protagonist (Andrei/Lucifer, played by {{user}}), Anna (AI character), the World Director (AI narrator/NPC controller), and 1–2 NPCs from a roster of 8 distinct voices. The dominant emotional register is the tension between damage and healing — the prose must register trauma as physical event, not abstract emotion. The world has intense sensory texture driven primarily by smell and temperature, a central character (Anna) whose entire interior must be rendered through body language rather than stated feeling, and arc-dependent intimacy with specific thematic functions per arc.

### Predicted Runtime Failure Modes

1. **Sensory engagement will default to vision-only.** The world's strongest atmospheric anchors are smell (ozone, sulfur, bleach, cigarettes, rain on asphalt, vanilla, old blood, lavender, thunderstorm) and temperature (demon-proximity cold, angel-proximity cold, withdrawal cold, healing warmth). The model defaults to visual description. Without explicit reinforcement, scenes will lose their signature atmospheric density and read as visually described rather than sensorially inhabited.

2. **Multi-character scenes will collapse to user-centric hub-and-spoke.** Typical scenes have 3–4 beings in a room (Anna, Andrei, Black, Bubbles) plus occasional Michael or Ingrid. The model's default is to route all interaction through {{user}} — NPCs address {{user}}, dialogue orbits {{user}}, {{char}}'s responses are directed exclusively at {{user}}. This world needs cross-character dynamics where Black speaks to Anna about Andrei, where Bubbles positions himself relative to Anna independent of Andrei's attention, where the World Director narrates environmental tension that isn't keyed to any single character's perspective.

3. **Anna's interior will be stated rather than physically manifested.** The single most critical behavioral mandate across all arcs is that Anna's emotions render through her body — "she was anxious" never appears; instead "she tucked her hair behind her ear and her eyes found the exit." The model defaults to abstract emotional language ("she felt scared"). Without persistent enforcement, the character's core rendering discipline degrades within 10–15 messages of long context.

4. **Prose register will not shift across arcs.** The world has four distinct genre registers (survival horror → supernatural romance → urban fantasy thriller → divine cosmic epic) with specific prose qualities per arc. The model tends to settle into one tonal register and maintain it. Without arc-specific prose guidance, Arc 3 will read like Arc 1 (oppressive where it should be wide and unhidden) or Arc 4 will read like Arc 2 (uncanny romance where it should be cosmic epic).

5. **Trauma responses will be rendered inconsistently.** Anna's trauma map is specific: being pinned triggers freezing, silence during intimacy triggers dissociation, commanding tones trigger transactional reframe. The model frequently defaults to generic "she felt scared" or misses the specific freeze/dissociate/reframe pattern. Over long sessions, trauma responses flatten into generic anxiety.

6. **Consequences and damage will heal too quickly.** This is a grimdark world where damage persists — wounds bleed until treated, broken stays broken, deaths stay dead, social betrayals are not unbetrayed in the next scene. The model defaults to consolatory resolution: injuries heal between scenes, conflicts resolve without residue, characters bounce back. The world's tonal hard rules explicitly forbid this pattern but the model's training data fights against it.

7. **Power asymmetry will flatten.** The world has a strict supernatural hierarchy with specific behavioral tells. Demons treat Andrei with fear that predates existence — they do not question, they obey. Michael delivers verdicts without hedging. Ingrid's manipulation wears the mask of reasonableness. The model defaults to modern egalitarian speech registers where subordinates negotiate and equals debate. Without enforcement, demons will speak to Andrei as colleagues rather than creations, Michael will sound argumentative rather than declarative, Ingrid will sound overtly cruel rather than weaponized-concern.

8. **Internal monologue will leak to dialogue for Anna.** Anna's thoughts and feelings must be rendered in narration (asterisks) not spoken aloud — she suppresses, deflects, and redirects. Her sarcasm masks her interior. The model frequently leaks interior states into spoken dialogue ("I'm scared" instead of "I need to know the exits"). This erodes the character's defining defense mechanism and makes her psychologically legible to NPCs in ways that break the dramatic irony.

### Block Selection

| Block | Status | Rationale |
|-------|--------|-----------|
| Main Prompt | Core (always) | Engine-level instructions — creative framework, prose style, narration, formatting. World-agnostic. |
| Deep Think | Core (always) | Structured pre-generation reasoning referencing Lucifer's four arcs by name. |
| Arc Guardian | Core (always) | Per-arc behavioral constraints with hidden info rules, NPC disguise state, character register per arc. |
| Lore Integration | Core (always) | Anti-recitation guidance with Lucifer-specific vocabulary anchors. |
| Spatial Awareness | Core (always) | Position/clothing memory, height differentials (Anna 5'9", Black 6'2", Bubbles 6'6", Michael 6'3"). |
| Sensory Embodiment | Core (always) | Addresses Failure Mode 1 — forces smell/temperature/touch engagement with Lucifer-specific sensory anchors. |
| Formatting | Core (always) | Asterisks/double quotes/double asterisks enforcement. |
| Jailbreak | Core (always) | Generic no-restrictions framing; override slot for card PHI. |
| Multi-Character Dynamics | Conditional Core — **ENABLED** | Addresses Failure Mode 2 — 2 AI cards (Anna + World Director) with 8 NPCs. Cross-talk lattice essential. |
| NSFW | Conditional Core — **ENABLED** | Section 8 in scope. Anna_Intimacy_Profile + 4 Arc Intimacy Registers exist. Addresses Failure Mode 5 (trauma rendering consistency in intimate contexts). |
| Consequence Tracking | Optional — **INCLUDED** | Addresses Failure Mode 6 — damage persistence, social consequence, nonlinear recovery. |
| Power Asymmetry | Optional — **INCLUDED** | Addresses Failure Mode 7 — demonic hierarchy, angelic authority, Ingrid's weaponized-reasonableness dynamic. |
| Subtext & Implication | Optional — **INCLUDED** | Addresses Failure Mode 8 — Anna's interior must stay in narration; dramatic irony is structural. Also supports Black's communicative silences, Ingrid's weaponized concern, Michael's grief-as-righteousness. |
| Atmosphere & Dread | Optional — **INCLUDED** | Supports Failure Modes 1 and 4 — the world's sensory texture is atmospheric-dread-driven (wrong stillness, too-clean spaces, cold that isn't weather). Arc 1 and Arc 2 especially need atmospheric wrongness before the supernatural becomes explicit. |
| Internal Monologue Discipline | Optional — **INCLUDED** | Addresses Failure Mode 8 specifically — Anna's thoughts must be rendered for the reader, not legible to in-scene characters. The gap between her interior and her speech is character-defining. |
| Time & Continuity Anchors | Optional — **INCLUDED** | Addresses Failure Mode 6 (sub-component) — withdrawal timeline, healing timeline, pregnancy timeline. Time-of-day matters narratively (Arc 1 is always 3am in the rain; later arcs have morning light). Track marks fade but never vanish — temporal continuity of the body. |
| Cultural Voice & Diction | Optional — **EXCLUDED** | This is a contemporary urban setting (Los Angeles, present day). Characters speak modern English with individual idiolects (Andrei's archaic Russian phrasings, Anna's clipped sarcasm, Black's formality, Bubbles's bluntness) but these are captured in voice registers within cards and NPC profiles. No shared cultural lexicon or archaic speech convention to enforce. |
| Custom blocks | None required | All 8 failure modes are addressed by core + conditional core + optional blocks above. |

### Block-to-Failure-Mode Coverage Check

- [x] Failure Mode 1 (sensory vision-only) → Sensory Embodiment + Atmosphere & Dread
- [x] Failure Mode 2 (hub-and-spoke) → Multi-Character Dynamics
- [x] Failure Mode 3 (stated emotion) → Deep Think (Step 3: Character Physical State) + post_history_instructions (card-level) + depth_prompt (card-level) + Internal Monologue Discipline
- [x] Failure Mode 4 (register shift) → Arc Guardian + Atmosphere & Dread
- [x] Failure Mode 5 (trauma inconsistency) → Arc Guardian + NSFW + Consequence Tracking
- [x] Failure Mode 6 (premature healing) → Consequence Tracking + Time & Continuity Anchors
- [x] Failure Mode 7 (power flattening) → Power Asymmetry
- [x] Failure Mode 8 (monologue leak to dialogue) → Internal Monologue Discipline + Subtext & Implication
- [x] Every failure mode addressed by at least one block
- [x] Every block included justified by at least one failure mode (no decorative inclusions)

---

## Section 10: Chat Template Notes

1. **Multi-Character Dynamics lattice example** will feature Anna, Mr. Black, and Mr. Bubbles in a penthouse scene — the exact configuration of a typical Arc 2–3 scene where NPCs interact with each other and with Anna independent of {{user}}'s immediate attention.

2. **Arc Guardian** will reference all four arcs by name with specific hidden information rules: Arc 1 (demons in full disguise, no supernatural tells), Arc 2 (pre/post-revelation split, Michael's weaponized revelation), Arc 3 (pregnancy hidden, war brewing), Arc 4 (pregnancy revealed at beat 2, God's plan hidden until beat 5).

3. **Sensory Embodiment** will draw specific anchors from Master Design §1.5: sulfur and copper (penthouse), ozone and cold metal (angelic), bleach and cigarettes and rain on asphalt (street level), thunderstorm and old oak and "home" (God's presence).

4. **Lore Integration** anti-recitation anchors will include: "the stillness that is not relaxation," "the cold of withdrawal / the cold of something vast and old," "the specific silence that costs money," "track marks that are part of her history, not her present."

5. **NSFW block** will reference active INTIMACY_FUNCTION_Arc[N] by name (Transaction, Survival → Communion, Comfort → Claim, Play → Communion, Ritual), Anna's TRAUMA_MAP entries, and the ANNA_INTIMATE_REGISTER per arc. World hard rules per Section 8a of the intimacy specification.

6. **Two-character prompt_order** will use character_id 100000 (Anna) and 100001 (World Director). Both will have identical block configurations since both cards need the same runtime guidance.

---

## ✅ PROMPT ENGINEER SIGN-OFF

### Lorebook Audit
- [x] All position values verified against ST injection logic
- [x] All injection orders verified for priority correctness
- [x] All keyword arrays reviewed for coverage, false positives, boundary behavior, and variant names
- [x] All ARC_STATE entries confirmed: ignoreBudget=true
- [x] Token budget risk assessed
- [x] Group Lorebook structure verified

### Character Card Audit
- [x] system_prompt: non-empty, non-generic, verified for each card
- [x] system_prompt opens with arc-journey identity, not Arc 1 state description
- [x] post_history_instructions: ≤150 words, imperative, verified for each card
- [x] depth_prompt: populated for both cards

### Card-Lorebook Consistency Audit ⭐
- [x] Every behavioral mandate and prohibition in every card checked against all ANNA_STATE entries across all arcs
- [x] All arc-specific mandates carry explicit arc-range qualifiers ("Arc 1 only:", "Arc 3+:", etc.)
- [x] post_history_instructions contains 1 hardcoded early-arc behavioral vocabulary — corrected version provided
- [x] post_history_instructions defers to the active ANNA_STATE as the authority for current register
- [x] Corrected card instructions provided (Anna PHI only — 1 correction)

### Chat Template Notes
- [x] Block Selection Rationale present: world archetype named, 8 failure modes enumerated, block-to-failure-mode mapping table complete, omission justifications provided
- [x] Block-to-failure-mode coverage verified: all 8 failures addressed, no decorative inclusions

### Corrected Files
- `Export/Anna_Card.json` — `post_history_instructions` field: corrected version in Section 8 above. Removes Arc-1-specific physical vocabulary from permanent PHI and adds arc-range qualification.

**Status: AUDIT COMPLETE — Lorebook audit passed with 0 position/order/keyword/budget errors. 1 card-lorebook consistency conflict found and corrected. Audit report ready for Chat Completion Preset authoring.**
