---
description: A surgical-revision workflow for worlds that have already been built. Adds NPCs, recalibrates arcs, fixes voice drift, modifies entries — without re-running the full pipeline.
---

# THE WORLD FORGE REVISION PIPELINE
*Orchestrator (revise fork) — Surgical Revisions to Built Worlds*

**When to use:** the world has been built (Phase 0–5 complete, Export/ exists), is in active play or post-launch, and needs a surgical change — a new NPC, a voice calibration, an arc tonal recalibration, an entry tweak. The minis read existing Drafts/ and Export/, make targeted insertions or edits, preserve UIDs, and audit only the touched surfaces.

**When NOT to use:** any change that touches Master Design Section 1 (Core Concept & Tone) or Section 11a (Style Contract world defaults). Those require a full pipeline re-run from Phase 1, with the existing World_Seed.md reused and the Interviewer skipped (`/worldforge skip phase0`). **Flipping `World Mode` (arc↔sandbox) is a Section 1 change** — it bounces out of the revise pipeline to a full rebuild, exactly like a tonal-rule change. The revise pipeline edits a world *within* its mode; it does not convert between modes.

**Sandbox worlds are supported.** A `World Mode: sandbox` world is revised through the same minis, using the `sandbox_*` scope types for its single always-active Sandbox Lorebook and the mode-aware NPC/intimacy scopes for its roster. The only structural difference: the Arc Transition Auditor (R3.6) never fires, because there are no arc seams.

---

## REVISE PIPELINE OVERVIEW

```
[User runs /worldforge revise]
      |
      v
 PHASE R0: THE REVISER
 Captures intent, classifies scope, runs Section 1/11 bright-line check,
 writes Revision Log entry to top of Master_Design.md.
      |
      |-- [Section 1/11 hit?] --> Out of scope. Bounce to full pipeline.
      |-- [User cancels?] --> Mark CANCELLED, halt.
      v
 Drafts/Master_Design.md updated with Revision R[N] PENDING entry
 Drafts/Revision_R[N]_Report.md created
      |
      v
 PHASE R1: THE REFINER (mini)
 Confirms scope, runs full cascade analysis, merges Revision Log delta
 into the canonical Master Design sections, locks the routing for R2+.
      |
      |-- [Cascade exceeds revision scope?] --> Escalate to user.
      v
 Master_Design.md canonical sections updated; routing locked
      |
      v
 PHASE R2: THE ARCHITECT (mini)  — conditional on markdown-change scopes
 Surgical inserts/edits to Drafts/ files only as scoped by R1.
      |
      v
 PHASE R2.5: THE INTIMACY ARCHITECT (mini) — conditional on intimacy scopes
 Surgical inserts/edits to intimacy drafts only.
      |
      v
 PHASE R3: THE EDITOR (mini)
 Validates ONLY the files touched by R2/R2.5 against the original Editor's
 hard-fail rules. Cross-references unchanged files for tier integrity.
      |
      |-- [Failures?] --> Return to R2/R2.5 with directives.
      |-- [3+ rounds, no progress?] --> ⏸ PAUSE, escalate to user.
      v (Mini-Editor sign-off on touched files)
      |
      v
 PHASE R3.5 / R3.6 / R3.7 (parallel, all conditional)
 ─ R3.5 VOICE AUDITOR (mini) — fires for character/arc behavioral scopes
 ─ R3.6 ARC TRANSITION AUDITOR (mini) — fires for arc seam-touching scopes
 ─ R3.7 INTIMACY AUDITOR (mini) — fires for intimacy scopes
      |
      |-- [Failures?] --> Return to relevant Architect mini → re-Editor → re-audit
      v (All applicable mini-auditors sign off)
      |
      v
 PHASE R4: THE COMPILER (mini)
 Re-compiles ONLY touched files. Preserves UIDs in unchanged entries.
 Appends new entries with next free UIDs.
 Outputs "what changes when" report (effects on running ST chat states).
      |
      v
 PHASE R5: THE PROMPT ENGINEER (mini)
 Audits new/changed entries (read-only). Recommends manual corrections
 for any issues. Modifies preset JSON only if scope warrants
 (multi-character dynamics block toggle, NSFW block activation, etc.).
      |
      |-- [Recommendations?] --> PHASE R5.5: MANUAL APPLY (same as full pipeline 5.5)
      v
 Revision R[N] marked APPLIED in Master_Design.md Revision Log
      |
      v
 ✅ REVISION COMPLETE
```

---

## ROUTING MATRIX

The Reviser writes "Phases affected" / "Phases skipped" into the Revision Log entry. The matrix below is the source of truth — the Reviser copies the row, the orchestrator (this file) reads the row to decide invocation.

Always-fire phases: **R0 (Reviser), R1 (Refiner-mini), R3 (Editor-mini), R4 (Compiler-mini), R5 (Prompt Engineer-mini).** Conditional phases per scope type below.

| Scope type | R2 Architect-mini | R2.5 Intimacy-Architect-mini | R3.5 Voice-Auditor-mini | R3.6 Arc-Transition-Auditor-mini | R3.7 Intimacy-Auditor-mini |
|---|---|---|---|---|---|
| `tier1_world_rule_add` | ✓ | — | — | — | — |
| `tier1_world_rule_modify` | ✓ | — | — | — | — |
| `tier2_new_character` | ✓ | conditional¹ | ✓ | — | conditional¹ |
| `tier2_character_voice_calibration` | ✓ | — | ✓ | — | — |
| `tier2_character_modify_field` | ✓ | — | conditional² | — | — |
| `tier3_arc_tonal_recalibration` | ✓ | conditional³ | ✓ | ✓ | conditional³ |
| `tier3_arc_entry_modify` | ✓ | — | conditional² | conditional⁴ | — |
| `tier3_arc_entry_add` | ✓ | — | conditional² | ✓ | — |
| `sandbox_state_recalibration` | ✓ | conditional³ | ✓ | — | conditional³ |
| `sandbox_entry_modify` | ✓ | — | conditional² | — | — |
| `sandbox_entry_add` | ✓ | — | conditional² | — | — |
| `intimacy_substrate_modify` | — | ✓ | — | — | ✓ |
| `intimacy_register_modify` | — | ✓ | — | — | ✓ |
| `intimacy_register_add` | — | ✓ | — | conditional⁴ | ✓ |

Footnotes:
1. The new character has intimate scene presence in any arc → Intimacy Architect-mini drafts the profile + register; Intimacy Auditor-mini audits.
2. The modified field is voice-bearing (`personality`, `mes_example`, `post_history_instructions`, CHARACTER_STATE_Arc[N] / SANDBOX_STATE Tonal Mandate, voice-related Tier 2 entry, roster NPC voice fingerprint) → Voice Auditor-mini fires.
3. The arc / sandbox has intimate beats → Intimacy register may need re-tuning; Intimacy Auditor re-audits.
4. The change touches an entry that participates in arc-seam continuity (CHARACTER_STATE, NPC_SHIFT, hidden information rules, ARC_STATE Tonal Mandate) → Arc Transition Auditor-mini fires. **This footnote never applies in sandbox mode** — a sandbox world has no arc seams, so R3.6 never fires for the `sandbox_*` scope types (or for any scope on a `World Mode: sandbox` world).

**World Mode awareness (load-bearing):** the Reviser reads `World Mode` from the Master Design before classifying. On an **arc** world, use the `tier1_*` / `tier2_*` / `tier3_arc_*` / `intimacy_*` rows. On a **sandbox** world, the `tier3_arc_*` rows are replaced by the three `sandbox_*` rows (there are no arcs to revise), and the NPC + intimacy scopes are **mode-aware**:
- `tier2_new_character` / `tier2_character_voice_calibration` classify the NPC as **principal** (full profile) or **roster** (compact §7.E stat block). A roster NPC add or voice change fires R3.5, which runs the **Distinctiveness Matrix (Step 3I)** across the roster.
- `intimacy_*` scopes target the single standing `Sandbox_Intimacy_Register` and NPC intimacy (principal full profile / roster §6.5 compact block) — never a per-arc register.
- **R3.6 (Arc Transition Auditor) is never invoked on a sandbox world.**

If a scope type isn't in the matrix, escalate to the user; the Reviser misclassified.

---

## PHASE R0: DISCOVERY — THE REVISER

**Invoke:** `@agent_roles/revise/00_The_Reviser.md`
**Input:** User intent + existing `Drafts/Master_Design.md` + existing `Drafts/` + existing `Export/` + `Brainstorm_Notes.md` if a `--brainstorm` run produced one
**Output:** Revision Log entry in `Drafts/Master_Design.md` (status `PENDING`) + `Drafts/Revision_R[N]_Report.md`

Captures the user's intent (interview by default; `--freeform` for direct paste; `--target` for known-target mode). Reads `World Mode` and classifies into one of the fourteen scope types (the three `sandbox_*` types apply only to `World Mode: sandbox` worlds; the `tier3_arc_*` types only to arc worlds). Runs the Section 1/11 bright-line check — a World Mode flip (arc↔sandbox) is a Section 1 change and bounces to full pipeline. Otherwise writes the Revision Log entry and signs off.

**Diagnostic front door (`--brainstorm`).** For the pre-articulation case — something feels off but the user can't name what to revise — `/worldforge revise --brainstorm` runs the **Brainstormer in its revision-diagnostic posture** (`agent_roles/Brainstormer/00_The_Brainstormer.md` Section 9) first. It reads `Drafts/Master_Design.md` read-only, diagnoses divergently (the four domain lenses are its diagnostic vocabulary; the "where does it sag" move is its primary instrument), converges on one primary concern plus candidate future concerns, and writes them to `Brainstorm_Notes.md` — informal notes, no Master Design edits, no scope classification. The Reviser then reads that file and captures the primary concern as this revision's intent, exactly as it would a typed-in concern. The Brainstormer respects the same Section 1 / 11a / World Mode bright line and flags any out-of-scope diagnosis as a bounce rather than a revision.

---

## PHASE R1: PLANNING — THE REFINER (MINI)

**Invoke:** `@agent_roles/revise/01_The_Refiner_mini.md`
**Input:** Latest Revision Log entry (status `PENDING`) + full `Drafts/Master_Design.md` + `Drafts/` files relevant to the cascade
**Output:** `Drafts/Master_Design.md` canonical sections updated with the revision delta + Revision Log entry advanced to `R1_COMPLETE`

Runs the rigorous cascade analysis. Confirms the Reviser's pre-analysis cascade list or expands it (with surfaced flags). Merges new content into the canonical Master Design sections — adding new subsections under Section 7/8/9 for new characters, appending Tier 1 rules to Sections 1–5, etc. Updates the Revision Log entry with the final confirmed cascade.

**Halt conditions:** if the cascade is larger than the scope type implies (e.g., user said "add NPC" but mini-Refiner discovers the NPC requires a new world rule), surface to user. Either widen the revision (user explicit), narrow it, or cancel and re-classify.

---

## PHASE R2: DRAFTING — THE ARCHITECT (MINI)

**Invoke:** `@agent_roles/revise/02_The_Architect_mini.md`
**Input:** Updated `Drafts/Master_Design.md` (with R1 merges) + the Revision Log entry's confirmed cascade
**Output:** New or modified files in `Drafts/` strictly within the cascade

Surgical inserts and edits only. New file creation when the scope adds a new character or arc-entry-type. Append-mode edits for additions to existing files. Replace-mode edits for field modifications. Never touches a file outside the cascade.

**Architectural rules from the parent Architect still apply** — `{{original}}` mandate, no engine instructions in cards, Position Rationale on every new entry, ARC_STATE two-subsection structure if touched, style override metadata-only if a per-card override changes.

---

## PHASE R2.5: INTIMACY DRAFTING — THE INTIMACY ARCHITECT (MINI)

**Invoke:** `@agent_roles/revise/02b_The_Intimacy_Architect_mini.md`
**Input:** Updated `Drafts/Master_Design.md` (with R1 merges) + the Revision Log entry's confirmed cascade + relevant `Drafts/` cross-references
**Output:** New or modified intimacy drafts (Tier 2 Profile / Tier 3 Register)

**Conditional phase.** Runs when scope type is `tier2_new_character` with intimate presence, `tier3_arc_tonal_recalibration` with intimate beats, or any of the three intimacy-specific scopes. Surgical inserts only.

---

## PHASE R3: VALIDATION — THE EDITOR (MINI)

**Invoke:** `@agent_roles/revise/03_The_Editor_mini.md`
**Input:** Files touched by R2/R2.5 + the unchanged surrounding files needed for cross-reference (tier integrity, cross-arc consistency)
**Output:** Validation report for touched files only

Same hard-fail rules as the parent Editor. Scope is narrowed: only the files in the Revision Log entry's cascade. Cross-arc checks run against existing untouched arcs as read-only references.

```
LOOP:  (each return increments R3 in the Revision Log entry's Rounds line)
  IF hard failures in touched files → return to R2/R2.5
  IF round > 3 (per Revision Log Rounds), no improvement → ⏸ PAUSE, escalate to user (status R3_STALLED)
  IF all pass → MINI-EDITOR SIGN-OFF → Phase R3.5/R3.6/R3.7 (per matrix)
```

---

## PHASE R3.5: BEHAVIORAL FIDELITY — THE VOICE AUDITOR (MINI)

**Invoke:** `@agent_roles/revise/03b_The_Voice_Auditor_mini.md`
**Input:** Touched files + Master Design + Section 7b test scenarios (filtered to the affected character/arc)
**Output:** `Drafts/Revise_R[N]_Voice_Audit.md`

Generates sample dialogue for the affected character or arc only. Audits against the original Voice Auditor's criteria. If the user attached chat excerpts as Evidence in the Revision Log entry, uses them as ground-truth test cases.

---

## PHASE R3.6: ARC CONTINUITY — THE ARC TRANSITION AUDITOR (MINI)

**Invoke:** `@agent_roles/revise/03c_The_Arc_Transition_Auditor_mini.md`
**Input:** Touched arc files + the immediate neighbors (arc N-1 and arc N+1, if they exist)
**Output:** `Drafts/Revise_R[N]_Arc_Transition_Audit.md`

Verifies that the changed arc still transitions cleanly to its predecessor and successor. Other arc-seams not touching the change are not re-audited.

**Never fires on a sandbox world.** A `World Mode: sandbox` world has no arcs and no seams; the `sandbox_*` scope types route R3.6 to skipped unconditionally, mirroring Phase 3.6 being skipped in the initial sandbox build.

---

## PHASE R3.7: INTIMATE SCENE FIDELITY — THE INTIMACY AUDITOR (MINI)

**Invoke:** `@agent_roles/revise/03d_The_Intimacy_Auditor_mini.md`
**Input:** Touched intimacy drafts + affected character cards + Master Design + Section 7b test scenarios filtered to intimate cases
**Output:** `Drafts/Revise_R[N]_Intimacy_Audit.md`

Generates sample intimate scenes for the affected character or arc only. Voice fidelity + thematic register lenses, same as parent.

---

## BOUNDED LOOP (R3.5 / R3.6 / R3.7)

The three mini-auditors share the parent's failure handling: a Critical (or High, for Voice/Intimacy) failure returns the touched files to the relevant Architect-mini, then re-runs Editor-mini and the auditor. Each return increments that phase's counter in the Revision Log entry's `**Rounds:**` line, so the ceiling survives a context summary or restart. If a counter exceeds 3 with no improvement, do **not** loop again — ⏸ PAUSE and escalate to the user (status `R3.5_STALLED` / `R3.6_STALLED` / `R3.7_STALLED`), the same ceiling the R3 mini-Editor loop uses. R3.7 function/substrate conflicts escalate immediately, regardless of round.

---

## PHASE R4: IMPLEMENTATION — THE COMPILER (MINI)

**Invoke:** `@agent_roles/revise/04_The_Compiler_mini.md`
**Input:** Approved touched drafts + `Notes_On_functionality.md` + existing `Export/` JSON files for UID continuity + existing `Export/REVISED_FILES.md` (if present)
**Output:** Updated `Export/` files (only those touched) + updated `Export/REVISED_FILES.md` (cumulative manifest) + `Drafts/Revise_R[N]_Compile_Log.md` + "what changes when" user report

**Operationally different from the full Compiler.** Append + dedupe + UID preservation, not build-fresh. Reads each Export file before rewriting it: new entries get the next free UID, existing entries keep their UIDs, deleted entries are flagged (mini-Compiler does not delete by default — user confirms via the audit report).

The "what changes when" report tells the user which lorebooks need re-import in their running ST session, which can be hot-reloaded, and whether any chat states are at risk.

**Revision marking.** Export filenames are never renamed and the JSON gets no extra fields — both would break ST imports / UID references or violate the Compiler's schema rule. Instead the mini-Compiler maintains `Export/REVISED_FILES.md`, a cumulative manifest listing every Export file ever touched by a revision (file, last-revised revision ID, date, one-line change summary, accumulated revision history). It is the single at-a-glance index of what has changed across all revisions, sitting alongside the files it indexes.

---

## PHASE R5: RUNTIME VALIDATION — THE PROMPT ENGINEER (MINI)

**Invoke:** `@agent_roles/revise/05_The_Prompt_Engineer_mini.md`
**Input:** Newly compiled / re-compiled `Export/` files + `Notes_On_functionality.md` + existing `Export/[WorldName]_ChatPreset.json` + `Drafts/Master_Design.md`
**Output:** `Drafts/Revise_R[N]_Prompt_Engineer_Audit.md` + optionally modified `Export/[WorldName]_ChatPreset.json`

Audits new/changed entries only (read-only on Export/). Recommends manual corrections same as parent Phase 5.

Preset modification is conditional and tightly scoped:
- New AI card or Director NPC added that triggers Multi-Character Dynamics block (was disabled) → enables block
- Intimacy register added when no other arc/register had intimate content → enables NSFW block
- A per-card style override changed that affects the multi-perspective / multi-tense flags → updates Style Contract ACTIVE-SPEAKER RULE line
- A Director / NPC-host card added or removed that flips Section 11c `has_director_card` → adds or removes the Style Contract DIRECTOR-CARD RULE line (SHARED §3d)
- **Sandbox roster grows and the preset lacks the `npc_ensemble` block** (e.g., the world predates it) → flag in the audit that `/worldforge resync-preset` should add NPC Ensemble & Enrichment; the mini does not author the block itself (block authoring is a full-Phase-5 / resync concern, not a surgical toggle)
- Otherwise: preset is untouched

If the audit produces recommendations in its Sections 7/8, proceed to R5.5 manual apply.

---

## PHASE R5.5: MANUAL CORRECTION APPLICATION (conditional)

**Invoke:** Manual user action — no agent runs this phase
**Input:** `Drafts/Revise_R[N]_Prompt_Engineer_Audit.md` Sections 7 and 8
**Output:** Modified `Export/[CharName]_Card.json` and `Export/[LorebookName].json` files

Same semantics as the full pipeline's Phase 5.5. User opens each named file, applies the recommendation, saves. After all recommendations applied:

- Revision Log entry status: `APPLIED`
- Append `## ✅ REVISION COMPLETE` to the Revision Log entry
- Revision is closed; another `/worldforge revise` may now run

---

## HUMAN PAUSE GATES (revise pipeline)

| Gate | Trigger | Action |
|---|---|---|
| **R0 Out-of-Scope** | Section 1/11 bright line hit | Reviser refuses; user runs full pipeline with `/worldforge skip phase0` |
| **R0 Pending Conflict** | Prior revision still `PENDING` | Halt; complete or cancel prior revision first |
| **R0 Cascade Surprise** | Reviser surfaces a cross-reference user did not flag | User confirms whether to widen scope, defer it, or treat as separate revise |
| **R1 Cascade Expansion** | mini-Refiner finds cascade exceeds scope type | User confirms widening, narrows the revision, or cancels |
| **R3 Stall** | Revision Log `Rounds:` R3 > 3 without improvement | Review flagged files and advise |
| **R3.5/R3.6/R3.7 Critical / Stall** | Any auditor flags Critical, or its Revision Log `Rounds:` counter > 3 | Architect-mini revises, re-runs through Editor-mini and the auditor; on Stall, escalate to user |
| **R5 Audit Recommendations** | Audit report Sections 7/8 contain corrections | User applies manually, then `/worldforge revise status` to mark APPLIED |

---

## FILE STRUCTURE (revise additions)

```
[project-name]/
├── Drafts/
│   ├── Master_Design.md                                  ← Now contains ## Revision Log section at top
│   ├── Revision_R[N]_Report.md                           ⭐ per-revision durable audit trail
│   ├── Revise_R[N]_Voice_Audit.md                        ⭐ conditional
│   ├── Revise_R[N]_Arc_Transition_Audit.md               ⭐ conditional
│   ├── Revise_R[N]_Intimacy_Audit.md                     ⭐ conditional
│   ├── Revise_R[N]_Compile_Log.md                        ⭐ mini-Compiler's log + "what changes when" report
│   └── Revise_R[N]_Prompt_Engineer_Audit.md              ⭐ mini-Prompt Engineer's audit
└── Export/
    ├── (existing files surgically updated; UIDs preserved)
    └── REVISED_FILES.md                                   ⭐ cumulative revision manifest (maintained by mini-Compiler)
```

The `Drafts/Revision_R[N]_Report.md` is the single source of truth for what happened in revision R[N]. Each mini appends its work to it. Cross-references the Revision Log entry in Master_Design.md by ID.

---

## TRIGGER COMMANDS

| Command | Action |
|---|---|
| `/worldforge revise` | Begin from R0 (interview mode) |
| `/worldforge revise --freeform` | Begin from R0 (freeform mode — paste a description, Reviser structures) |
| `/worldforge revise --target [path]` | Begin from R0 (target mode — skip diagnostic narrowing) |
| `/worldforge revise --brainstorm` | Begin from R0 in **diagnostic mode** — for when something feels off but you can't name it. Runs the Brainstormer (revision-diagnostic posture, Section 9) to locate the concern, then the Reviser reads its `Brainstorm_Notes.md` and classifies as normal |
| `/worldforge revise status` | Show all Revision Log entries, their statuses, any pending |
| `/worldforge revise resume R[N]` | Resume a pending revision from its last completed phase |
| `/worldforge revise cancel R[N]` | Cancel a pending revision (rolls back any draft edits, marks CANCELLED) |
