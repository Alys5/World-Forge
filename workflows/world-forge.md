---
description: A workflow to build worlds for player to roleplay in.
---

# THE WORLD FORGE PIPELINE
*Orchestrator v7 — Universal Roleplay World Building & SillyTavern Export*

**Produces:** Character Cards + World Lorebook (Tier 1, permanent) + Character Lorebooks (Tier 2, permanent) + Character Intimacy Profiles (Tier 2, permanent, where applicable) + Arc Lorebooks (Tier 3, modular, one active at a time) + Arc Intimacy Registers (Tier 3, modular, where applicable) + Group Lorebook (all tiers combined) + Chat Completion Preset. Works for any world, any number of arcs or characters.

---

## PIPELINE OVERVIEW

```
[User intent — start a new world]
      |
      v
 PHASE 0: THE INTERVIEWER
 Walks user through the World Seed Template interactively, including the Section 8
 Intimacy specification when relevant. Pushes back on weak material. Captures test scenarios.
      |
      v
 World_Seed.md
      |
      v
 PHASE 1: THE REFINER
 Classifies World Seed into Tiers 1/2/3. Identifies gaps. Builds Master Design.
      |
      |-- [Gaps?] --> UNRESOLVED_QUESTIONS.md → ⏸ PAUSE → /worldforge resume phase1
      v
 Master_Design.md [LOCKED]
      |
      v
 PHASE 2: THE ARCHITECT
 Authors all draft content: Character Cards, Protagonist Lorebook,
 Tier 1/2/3 entry files, LLM Instruction drafts.
      |
      v
 PHASE 2.5: THE INTIMACY ARCHITECT (conditional — runs if Section 8 has material)
 Authors Tier 2 Intimacy Profiles (permanent substrate per character) and
 Tier 3 Intimacy Registers (arc-specific delta). Cross-references existing drafts.
      |
      |-- [Section 8 missing material?] → UNRESOLVED_INTIMACY.md → ⏸ PAUSE → /worldforge resume phase2.5
      v
 PHASE 3: THE EDITOR (ITERATIVE LOOP)
 Validates prose + tier integrity + lorebook quality + LLM instructions + intimacy entries.
      |
      |-- [Missing/failed?] → Return to Architect or Intimacy Architect
      |-- [3+ rounds, no improvement?] → ⏸ PAUSE → escalate to user
      v (Editor Sign-Off)
      |
      v
 PHASE 3.5 + 3.6 + 3.7 (parallel)
 ─ 3.5 VOICE AUDITOR — behavioral fidelity in regular dialogue
 ─ 3.6 ARC TRANSITION AUDITOR — continuity across arc seams
 ─ 3.7 INTIMACY AUDITOR — voice fidelity + thematic register in intimate scenes (conditional)
      |
      |-- [Failures from any auditor?] → Return to relevant Architect → re-Editor → re-audit
      v (All three sign-offs received)
      |
      v
 PHASE 4: THE COMPILER
 Translates Markdown → SillyTavern JSON. Reads Notes_On_functionality.md first.
      |
      |-- [Templates missing?] → ⏸ PAUSE → /worldforge resume phase4
      v
 Export/ [JSON package]
      |
      v
 PHASE 5: THE PROMPT ENGINEER
 Audits runtime correctness (read-only on Export/) + authors Chat Completion Preset JSON.
 Recommends corrections for any conflicts found — manual user application required.
      |
      |-- [Recommendations in Sections 7/8?] --> PHASE 5.5: MANUAL APPLY
      v
 ✅ PIPELINE COMPLETE
```

---

## PHASE 0: DISCOVERY — THE INTERVIEWER

**Invoke:** `@agent_roles/00_The_Interviewer.md`
**Input:** User intent to build a new world
**Output:** `World_Seed.md` ready for Phase 1

The Interviewer walks the user through the World Seed Template interactively. Asks the right questions in the right order. Pushes back on thin or inconsistent answers. Will not let the document be weak.

The Interviewer asks about:
1. Core concept and tone — logline, emotional payoff, tonal hard rules
2. **Style Contract (Section 1.5)** — perspective, tense, narration marker, dialogue marker, emphasis marker, paragraph register, plus per-card overrides for cards structurally incompatible with the world default (typically Director/Narrator cards). Defaults pathway short-circuits the section for users who want pipeline-legacy prose conventions.
3. The world — sensory signature, rules with costs, factions, locations, species, concepts
4. The protagonist ({{user}}) — wound, hidden layer, contradiction, power and limits, arc trajectory, physical, voice
5. Characters — central wound, shield, crack, voice with sample lines, physical in anatomical order, relationships, NPCs with sample lines, plus the per-card style override declaration (only for cards flagged in Section 1.5)
6. Arcs — hidden information rules, dramatic beats, NPC shifts, entry and exit triggers, tone and pacing
7. Technical specifications — cards, lorebooks, depth_prompt assessment per character
8. Test scenarios (Section 7b) — three to five specific roleplay moments the user intends to play through
9. **Intimacy & Sexuality (Section 8)** — world-level posture toward sex, per-character intimacy substrate, per-arc thematic functions and scene types, tonal hard rules for intimate content. Conditional on the world containing intimate scenes.

If the user resists developing a section, the Interviewer adds an explicit note in the document marking it for Refiner review rather than silently filling gaps.

**This phase exists because the World Seed is hardest to write well the first time.** A weak World Seed propagates through every subsequent phase. Five minutes of pushback at this stage saves an hour of debugging at the runtime stage.

---

## PHASE 1: PLANNING — THE REFINER

**Invoke:** `@agent_roles/01_The_Refiner.md`
**Input:** `World_Seed.md` (+ `UNRESOLVED_QUESTIONS.md` if resuming)
**Output:** `Drafts/Master_Design.md`

1. Classifies all World Seed content into Tier 1 / Tier 2 / Tier 3 material.
2. Identifies gaps in each tier and flags questions requiring user input.
3. **No blockers:** produces `Master_Design.md` with REFINER SIGN-OFF → Phase 2.
4. **Blockers found:** produces `UNRESOLVED_QUESTIONS.md` → **PAUSE.** Await user answers.

A complete Master Design contains: world laws/factions/locations/species/concepts (Tier 1), character foundations + physical descriptions in anatomical order + protagonist spec (Tier 2), all arcs with hidden information rules + dramatic beats (Tier 3), LLM behavioral requirements per card including depth_prompt assessment, and intimacy specifications routed from Section 8 to the appropriate tier source for the Intimacy Architect.

---

## PHASE 2: DRAFTING — THE ARCHITECT

**Invoke:** `@agent_roles/02_The_Architect.md`
**Input:** `Drafts/Master_Design.md` with REFINER SIGN-OFF
**Output:** All draft files in `Drafts/`

**Mandatory outputs (all seven required):**
1. `Card_[CharName].md` — character card content per card
2. `User.md` — `{{user}}` Persona Description text (paste-ready for ST → User Settings → Persona Management; paired with the Tier 2 Protagonist Lorebook)
3. `Tier2_[ProtagonistName]_Entries.md` — Protagonist Lorebook ({{user}} identity reference)
4. `Tier1_World_Entries.md` — all Tier 1 entries
5. `Tier2_[CharName]_Entries.md` — Tier 2 entries per character/NPC
6. `Tier3_Arc[N]_[Title]_Entries.md` — Tier 3 entries per arc
7. `Instructions_[CardName].md` — system_prompt + post_history_instructions + depth_prompt per card

If the PRE-SUBMISSION CHECKLIST shows any of these unchecked, return to Architect before proceeding.

---

## PHASE 2.5: INTIMACY DRAFTING — THE INTIMACY ARCHITECT

**Invoke:** `@agent_roles/06_The_Intimacy_Architect.md`
**Input:** Architect's complete drafts + `Drafts/Master_Design.md` + `World_Seed.md` Section 8
**Output:** Intimacy drafts added to `Drafts/`

**Conditional phase.** Runs if and only if the World Seed Section 8 contains material — i.e., the world includes intimate scenes meaningful enough to warrant craft fidelity. For wholesome or low-intimacy worlds where Section 8 was deliberately left empty by the user, this phase is skipped and the pipeline proceeds directly from Phase 2 to Phase 3.

**Mandatory outputs when phase runs:**
1. `Tier2_[CharName]_Intimacy_Profile.md` — one per character with intimate scene presence in any arc. Permanent substrate: trauma map, body reactions, vulnerability shape, voice in intimacy, hard limits and hard yeses.
2. `Tier3_Arc[N]_Intimacy_Register.md` — one per arc that contains intimate beats. Delta only: arc thematic function, per-character arc-specific behavioral notes, live scene types, arc-specific hard rules.

**Failure conditions:**
- Section 8 is missing material the agent needs → produces `UNRESOLVED_INTIMACY.md`, halts pipeline.
- Cross-reference inconsistency with existing drafts (card description contradicts Tier 2 profile, arc state contradicts intimate register, etc.) → flagged in output for resolution.
- Function/substrate contradiction at the Master Design level (an arc requires intimate behavior the character's substrate forbids) → halts and escalates to user. The Intimacy Architect does not paper over these.

The Intimacy Architect does not author or modify character cards. Card-level content is the original Architect's domain. Intimacy lives in the lorebook.

---

## PHASE 3: STRUCTURAL VALIDATION — THE EDITOR (ITERATIVE LOOP)

**Invoke:** `@agent_roles/03_The_Editor.md`
**Input:** All `Drafts/` files + `Drafts/Master_Design.md`

Validates four layers: prose quality, tier integrity + lorebook entry quality, LLM instruction quality, and intimacy entry quality (when intimacy drafts are present).

**Hard rules:**
- Arc-specific content in Tier 1 or Tier 2 = immediate rejection
- ARC_STATE entry missing hidden information rules = immediate rejection
- system_prompt applicable to any character in any world = immediate rejection
- Arc lorebook with fewer than 8 entries = rejection
- Tier 2 Intimacy Profile containing arc-specific content = immediate rejection
- Tier 3 Intimacy Register restating substrate already in Tier 2 = immediate rejection
- INTIMACY_FUNCTION_Arc[N] entry missing thematic function name or prose register specification = rejection

```
LOOP:
  IF files missing → return to relevant Architect (Architect or Intimacy Architect)
  IF hard failures → return affected files to relevant Architect
  IF quality below threshold → return with directives
  IF round > 3, no improvement → ⏸ PAUSE, escalate to user
  IF all pass → EDITOR SIGN-OFF → Phase 3.5 + 3.6 + 3.7
```

---

## PHASE 3.5: BEHAVIORAL FIDELITY — THE VOICE AUDITOR

**Invoke:** `@agent_roles/03b_The_Voice_Auditor.md`
**Input:** All Editor-approved `Drafts/` + `Drafts/Master_Design.md` + `World_Seed.md` Section 7b
**Output:** `Drafts/Voice_Audit_Report_[Round N].md`

Generates sample regular dialogue using the drafts as runtime context, audits against character spec for trigger-response fidelity, voice distinctiveness, arc register integrity, reflex misfires, and NPC voice drift.

```
IF Critical or High failures → return to Architect with rewrite directives
IF only Medium failures → may sign off with notes
IF no failures → VOICE AUDITOR SIGN-OFF
```

---

## PHASE 3.6: ARC CONTINUITY — THE ARC TRANSITION AUDITOR

**Invoke:** `@agent_roles/03c_The_Arc_Transition_Auditor.md`
**Input:** All Editor-approved `Drafts/Tier3_*` files + `Drafts/Tier2_*` files + `Drafts/Master_Design.md`
**Output:** `Drafts/Arc_Transition_Audit_[Round N].md`

Verifies continuity across every consecutive arc pair: trigger continuity, CHARACTER_STATE continuity, NPC behavioral shift continuity, world state continuity, hidden information rule continuity, dramatic beat sequence, tone register continuity.

```
IF Critical failures → return to Architect
IF only Medium failures → may sign off with notes
IF no failures → ARC TRANSITION AUDITOR SIGN-OFF
```

---

## PHASE 3.7: INTIMATE SCENE FIDELITY — THE INTIMACY AUDITOR

**Invoke:** `@agent_roles/03d_The_Intimacy_Auditor.md`
**Input:** All Editor-approved `Drafts/` (including Intimacy Architect's outputs) + `Drafts/Master_Design.md` + `World_Seed.md` Section 7b/8
**Output:** `Drafts/Intimacy_Audit_Report_[Round N].md`

**Conditional phase.** Runs if and only if Phase 2.5 ran and produced intimacy drafts. If Phase 2.5 was skipped, this phase is also skipped.

Generates sample intimate scenes using the drafts as runtime context, audits against two lenses:
- **Primary lens — voice fidelity:** does the character behave like themselves during sex? Substrate fidelity, trauma map fidelity, voice continuity, hard limit integrity.
- **Secondary lens — thematic register match:** does the scene serve its declared function? Function fidelity, prose register match, direction fidelity, arc atmosphere preservation.

When the lenses conflict, voice fidelity wins. Function/substrate contradictions at the Master Design level are escalated to the user, not patched at the draft level.

```
IF Critical or High failures → return to relevant Architect (Architect for cards, Intimacy Architect for intimacy entries)
IF function/substrate conflicts found → escalate to user
IF only Medium failures → may sign off with notes
IF no failures → INTIMACY AUDITOR SIGN-OFF
```

**Phases 3.5, 3.6, and 3.7 run in parallel.** All three (or all that ran, where 3.7 is conditional) must sign off before Phase 4 begins. Failures from any phase trigger a return to the relevant Architect, then re-Editor, then re-audit.

---

## PHASE 4: IMPLEMENTATION — THE COMPILER

**Invoke:** `@agent_roles/04_The_Compiler.md`
**Input:** Approved `Drafts/` (with Voice + Arc Transition + Intimacy sign-offs as applicable) + `templates/` + `Notes_On_functionality.md`
**Output:** `Export/` directory

**Read `Notes_On_functionality.md` first** — it is the authoritative ST runtime reference. Where it contradicts templates or this document, it takes precedence.

**Builds:**
- Character Card JSON per card (`system_prompt`, `post_history_instructions`, and `data.extensions.depth_prompt` mandatory fields, never empty)
- `User.md` — `{{user}}` Persona Description text (passed through from `Drafts/User.md` unchanged; paste-ready for ST persona)
- `[ProtagonistName]_Lorebook.json` — Tier 2, {{user}} identity reference
- `World_Lorebook.json` — Tier 1, all entries at `position: 0`
- `[CharName]_Lorebook.json` — Tier 2, one per character/NPC, all entries at `position: 1`
- `[CharName]_Intimacy_Profile.json` — Tier 2, one per character with intimate presence, all entries at `position: 1`. Compiled from Phase 2.5 drafts when present.
- `Arc[N]_Lorebook.json` — Tier 3, one per arc (min 8 entries each, ARC_STATE at `position: 1` with `ignoreBudget: true`, TENSION at `position: 4`)
- `Arc[N]_Intimacy_Register.json` — Tier 3, one per arc with intimate beats, INTIMACY_FUNCTION entry CONSTANT with `ignoreBudget: true`, character intimate registers CONSTANT. Compiled from Phase 2.5 drafts when present.
- `Group_Lorebook.json` — all tiers combined, group-tagged for ST lorebook editor management

**Golden Rule:** One draft entry = one JSON entry. Never merge.

In SillyTavern: import `Group_Lorebook.json`, enable World + character groups + character intimacy profile groups permanently, swap arc groups (including arc intimacy register groups) as the story advances. In **User Settings → Persona Management**, create the persona for this world, paste the Persona Description block from `Export/User.md` into the Description field, and link `[ProtagonistName]_Lorebook.json` in the Lorebook field.

---

## PHASE 5: RUNTIME VALIDATION — THE PROMPT ENGINEER

**Invoke:** `@agent_roles/05_The_Prompt_Engineer.md`
**Input:** All `Export/` files + `Notes_On_functionality.md` + `templates/Chat_Completion_Preset_template.json` + `Drafts/Master_Design.md`
**Output:** `Export/Prompt_Engineer_Audit.md` + `Export/[WorldName]_ChatPreset.json`

**Read `Notes_On_functionality.md` completely before beginning. Load `templates/Chat_Completion_Preset_template.json` as the structural reference for Workstream B — do not author the preset from scratch.**

**Workstream A — Audit (read-only against Export/):** Reviews every lorebook entry (including intimacy profiles and registers) for position correctness, injection order, keyword coverage, token budget risk. Reviews every character card for `system_prompt`, `post_history_instructions`, and `depth_prompt`. Produces audit report with **recommended corrections** for any issues found. The Prompt Engineer does NOT modify Export/ JSON files — recommendations are surfaced in Sections 7 and 8 of the audit report as plain-text instructions for the user to apply manually. The audit report's status line distinguishes "COMPLETE — pipeline ready" (no recommendations generated) from "AUDIT COMPLETE — N manual corrections required" (recommendations outstanding).

**Workstream B — Chat Preset:** Begins with the Section 5.0b Block Selection Rationale — an analytical write-up that names this world's archetype, predicts 4-8 specific runtime failure modes, and maps each failure mode to the block(s) that address it. Block selection is the *outcome* of this analysis, not a checklist. The agent then starts from `templates/Chat_Completion_Preset_template.json` and authors content for the 8 core blocks (Main, Deep Think, Arc Guardian, Lore Integration, Spatial Awareness, Sensory Embodiment, Formatting, Jailbreak), enables/disables the 2 conditional core blocks (Multi-Character Dynamics for 2+ AI cards or Director NPC; NSFW for Section 8 in scope), and adds optional blocks from the menu (Subtext, Consequence Tracking, Power Asymmetry, Atmosphere & Dread, Internal Monologue Discipline, Time & Continuity Anchors, Cultural Voice & Diction) or custom blocks as the Rationale warrants. **The Main Prompt's `<style_contract>` block is parameterized from Master Design Section 11a (perspective, tense, marker enums); the active-speaker rule is included only when Section 11c reports `is_multi_perspective: true`; the Formatting block is the slim deferral form referencing both `<style_contract>` and `<style_override>` by name.** NSFW when enabled covers thematic function discipline, voice & sound register (onomatopoeia mapped to body reactions, slurred speech mechanics, voice register shifts), body coordination (pre-scene retrieval of physical facts, multi-body geometry mapping, narrated adaptation when geometry doesn't work natively), hard limits, and world hard rules. Verifies `forbid_overrides: false` on `main` and `jailbreak`. Runs the Section 5f Pass 1 + Pass 2 self-validation before saving. Produces `[WorldName]_ChatPreset.json` ready for ST import.

Appends SIGN-OFF to audit file.

---

## PHASE 5.5: MANUAL CORRECTION APPLICATION (conditional)

**Invoke:** Manual user action — no agent runs this phase
**Input:** `Export/Prompt_Engineer_Audit.md` Sections 7 and 8
**Output:** Modified `Export/[CharName]_Card.json` and `Export/[LorebookName].json` files

**Conditional phase.** Runs only if the Prompt Engineer's audit report contains recommendations in Sections 7 or 8. If the audit report's status is "COMPLETE — pipeline ready" with no recommendations, this phase is skipped.

The user opens each file named in the audit's "Files With Recommended Corrections" sign-off block, locates the entry or field referenced by the recommendation, replaces the current value with the recommended value, and saves. After all recommendations have been applied, the world is ready for SillyTavern import.

This phase exists because the Prompt Engineer operates with read-only authority on Export/ JSON files (audit/apply separation). Direct modification by the auditor would produce self-validating corrections with no review gate. Manual application by the user keeps the audit reviewable: corrections can be inspected, modified, or rejected before they reach the final files.

For users who find manual application onerous on large worlds, a future pipeline iteration may add an automated apply step. As of this version, application is manual.

→ **PIPELINE COMPLETE.**

---

## HUMAN PAUSE GATES

| Gate | Trigger | Action |
|---|---|---|
| **Phase 0 Pause** | User wants time to think on a section | Save partial seed, resume with `/worldforge resume phase0` |
| **Phase 1 Blocker** | `UNRESOLVED_QUESTIONS.md` generated | Answer questions, then `/worldforge resume phase1` |
| **Phase 2.5 Blocker** | `UNRESOLVED_INTIMACY.md` generated | Populate Section 8 material, then `/worldforge resume phase2.5` |
| **Phase 3 Stall** | 3+ rounds without improvement | Review flagged files and advise |
| **Phase 3.5 Critical** | Voice Auditor flags Critical failures | Architect revises, re-runs through Editor and Voice Auditor |
| **Phase 3.6 Critical** | Arc Transition Auditor flags Critical failures | Architect revises, re-runs through Editor and Arc Transition Auditor |
| **Phase 3.7 Critical** | Intimacy Auditor flags Critical failures | Relevant Architect revises, re-runs through Editor and Intimacy Auditor |
| **Phase 3.7 Conflict** | Function/substrate contradiction found | User decides: change substrate, change function, or accept the failure |
| **Phase 4 Missing Templates** | Template file not found | Add to `templates/`, then `/worldforge resume phase4` |
| **Phase 5 Audit Recommendations** | Sections 7/8 of `Prompt_Engineer_Audit.md` contain corrections | Open named Export/ files, apply each recommendation manually, save. Pipeline is COMPLETE only after all recommendations are applied. |

---

## FILE STRUCTURE

```
[project-name]/
├── World_Seed.md                                  ← Produced by Phase 0
├── UNRESOLVED_QUESTIONS.md                        ← Conditional (Phase 1)
├── UNRESOLVED_INTIMACY.md                         ← Conditional (Phase 2.5)
├── Notes_On_functionality.md                      ← ST docs (Phase 4 + 5)
├── Drafts/
│   ├── Master_Design.md
│   ├── Card_[CharName].md
│   ├── User.md                                     ⭐ {{user}} Persona Description (Phase 2)
│   ├── Tier1_World_Entries.md
│   ├── Tier2_[ProtagonistName]_Entries.md
│   ├── Tier2_[CharName]_Entries.md
│   ├── Tier2_[CharName]_Intimacy_Profile.md       ⭐ new (Phase 2.5)
│   ├── Tier3_Arc[N]_[Title]_Entries.md
│   ├── Tier3_Arc[N]_Intimacy_Register.md          ⭐ new (Phase 2.5)
│   ├── Instructions_[CardName].md
│   ├── Editor_Critique_[Round N].md
│   ├── Voice_Audit_Report_[Round N].md
│   ├── Arc_Transition_Audit_[Round N].md
│   └── Intimacy_Audit_Report_[Round N].md         ⭐ new (Phase 3.7)
├── templates/
│   ├── Char_Card_creation.md
│   ├── Lorebook_creation.md
│   ├── Group_lorebook_template.md
│   ├── User_Persona_template.md                   ⭐ {{user}} Persona structural reference
│   └── Chat_Completion_Preset_template.json   ⭐ new (Phase 5 structural reference)
└── Export/
    ├── [CharName]_Card.json
    ├── User.md                                     ⭐ {{user}} Persona Description (Phase 4 passthrough)
    ├── [ProtagonistName]_Lorebook.json
    ├── World_Lorebook.json
    ├── [CharName]_Lorebook.json
    ├── [CharName]_Intimacy_Profile.json           ⭐ new (Phase 4, conditional)
    ├── Arc[N]_Lorebook.json
    ├── Arc[N]_Intimacy_Register.json              ⭐ new (Phase 4, conditional)
    ├── Group_Lorebook.json
    ├── Compiler_Log.md
    ├── Prompt_Engineer_Audit.md
    └── [WorldName]_ChatPreset.json
```

---

## TRIGGER COMMANDS

| Command | Action |
|---|---|
| `/worldforge start` | Begin from Phase 0 (the Interviewer) |
| `/worldforge resume phase0` | Resume the interview from the last completed section |
| `/worldforge resume phase1` | Re-run Refiner with answered questions |
| `/worldforge resume phase2` | Re-run Architect |
| `/worldforge resume phase2.5` | Re-run Intimacy Architect (after populating Section 8) |
| `/worldforge resume phase3` | Re-enter Editor loop |
| `/worldforge resume phase3.5` | Re-run Voice Auditor |
| `/worldforge resume phase3.6` | Re-run Arc Transition Auditor |
| `/worldforge resume phase3.7` | Re-run Intimacy Auditor |
| `/worldforge resume phase4` | Re-run Compiler |
| `/worldforge resume phase5` | Re-run Prompt Engineer |
| `/worldforge status` | Report current phase, round, open blockers |
| `/worldforge skip phase0` | Begin from Phase 1 (user has written World_Seed.md manually, OR resuming after a Section 1/11 revision bounced from the revise pipeline) |
| `/worldforge skip phase2.5` | Skip Intimacy Architect (no intimate content in this world) |
| `/worldforge skip phase3.7` | Skip Intimacy Auditor (no intimate content in this world) |
| `/worldforge revise` | Begin the revision pipeline for surgical changes to an already-built world (see `workflows/world-forge-revise.md`) |
| `/worldforge revise --freeform` | Revision pipeline with freeform intent input (paste a description, Reviser structures) |
| `/worldforge revise --target [path]` | Revision pipeline with known target file/entry (skips diagnostic narrowing) |
| `/worldforge revise status` | Show all Revision Log entries and their statuses |
| `/worldforge revise resume R[N]` | Resume a pending revision from its last completed phase |
| `/worldforge revise cancel R[N]` | Cancel a pending revision and mark CANCELLED |
| `/worldforge resync-preset` | Regenerate a shipped world's Chat Completion Preset against the current template + block library, picking up pipeline changes made since the world was built (see PRESET RESYNC below). Preset-only; does not re-audit lorebooks or cards. |

---

## POST-LAUNCH REVISIONS

Once a world has completed Phase 5.5 (pipeline complete, Export/ ready, world in play), surgical changes use the **revision pipeline** — a parallel fork that runs mini-versions of the agents above with read-mostly authority and UID-preserving compilation. See `workflows/world-forge-revise.md` for the full revise pipeline.

The bright line is **Master Design Section 1 (Core Concept & Tone) and Section 11a (Style Contract world defaults)**. Revisions that don't touch these stay in the revision pipeline (faster, surgical, preserves running ST chat states). Revisions that touch them require a full re-run from Phase 1 via `/worldforge skip phase0` — the existing `World_Seed.md` is reused, the Interviewer is skipped, and Phases 1–5 rebuild from scratch. The Reviser performs this classification and bounces out-of-scope revisions automatically.

---

## PRESET RESYNC (post-launch preset upgrade)

When the pipeline's preset spec evolves after a world has shipped — a reframed core block, a new optional block, a changed template flag — that world's `Export/[WorldName]_ChatPreset.json` falls behind the current spec. `/worldforge resync-preset` brings it forward without touching world content.

It invokes the Prompt Engineer in **Preset Resync Mode** (`agent_roles/05_The_Prompt_Engineer.md` Section 8). The agent diffs the existing preset against the current `templates/Chat_Completion_Preset_template.json` and block library (Section 5a), regenerates only the drifted core blocks and newly-warranted optional blocks, preserves block identifiers + `prompt_order` and the user's field-level customizations, re-runs the Section 5f Pass 1 + Pass 2 self-validation, and writes `Export/Preset_Resync_Report.md` documenting every block changed, added, or preserved.

**Scope and boundaries:**
- **Preset only.** Resync regenerates the Chat Completion Preset — the one Export/ file the Prompt Engineer authors. It does NOT re-audit lorebooks or cards and does NOT emit Section 7/8 manual-apply recommendations. World content (lorebooks, cards, drafts) is untouched.
- **Distinct from `resume phase5`.** `resume phase5` re-runs the full Phase-5 audit during an in-progress build. `resync-preset` is a maintenance op on an already-shipped world that only refreshes the preset against the latest spec.
- **Distinct from the revise pipeline.** The revise pipeline makes surgical *content* changes (a character, an arc, an entry). Resync makes no content changes — it upgrades the preset to the current pipeline version. A world can be resynced without ever entering revise.
- **Low risk.** A Chat Completion Preset is a global SillyTavern settings profile, not UID-bearing world info, so re-importing a resynced preset does not disturb running chat states. Git is the rollback path if the user wants the prior preset back.