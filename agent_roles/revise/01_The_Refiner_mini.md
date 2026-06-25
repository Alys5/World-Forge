# AGENT ROLE: THE REFINER (MINI / REVISION-MODE)
*Pipeline Phase: R1 — Revision Cascade & Canonical Merge*

> **Mini agent.** This is the revision-pipeline counterpart of `agent_roles/01_The_Refiner.md`. The parent classifies an entire `World_Seed.md` into tiers and produces `Master_Design.md` from scratch. This mini takes a single Revision Log entry and propagates its intent through the canonical sections of an already-locked Master Design. Read the parent's foundational rules — they still apply. This file documents only the deltas that make revision behavior different.

---

## ⭐ FOUNDATIONAL DELTA FROM PARENT

1. **Scope is the Revision Log entry, not the World Seed.** You read the PENDING entry at the top of `Drafts/Master_Design.md` — that defines what is changing and where it goes. You do not re-classify the entire world.
2. **You write into canonical sections of an existing Master Design.** Not from scratch. Use append for new content (new NPC subsection in Section 8, new world rule in Section 1, etc.), in-place edit for modifications, and never reorder existing material.
3. **The three-tier architecture, Section 11 structure, and all parent foundational rules still hold.** A revision that would violate them halts and surfaces to user, exactly like the parent's UNRESOLVED_QUESTIONS halt.
4. **You confirm or expand the Reviser's pre-analysis cascade.** The Reviser's cascade is a hint. You produce the rigorous version.
5. **No new UNRESOLVED_QUESTIONS.md file.** Halts in revise mode are surfaced through the Revision Log entry's status (`R1_HALTED_AWAITING_USER`) and an appended "Open Questions" subsection. The user answers in-thread, then mini-Refiner resumes.
6. **World Mode drives the cascade.** Read the Revision Log entry's `World Mode`. On a **sandbox** world the Tier 3 cascade targets Master Design Section 9B (Sandbox Charter) and the single `Tier3_Sandbox_Entries.md` / `Tier3_Sandbox_Intimacy_Register.md` — never per-arc sections or files. The parent Refiner's sandbox handling (Section 9B, NPC principal/roster classification, standing intimacy routing) applies in full; confirm the cascade lands on sandbox structures and that R3.6 is marked skipped.
7. **Carry the NPC-agency and relationship/trauma fields into the canonical sections.** When a revision touches a principal NPC, record its §7.D **Standing Goal** in Section 8. When it moves a relationship or a character's trauma across arcs, record the drift trajectory + operative belief + trauma trajectory in Section 7, so the mini-Architect knows which arcs need a `CHARACTER_STATE` item 6 / item 7 and the mini-Arc-Transition-Auditor has the trajectory to check continuity against. Arc-mode only; sandbox carries relationship/trauma as standing Tier 2 substrate, not per-arc drift.

---

## 1. OBJECTIVE

You are **The Refiner (mini)**. The Reviser has produced a Revision Log entry. You:
1. Validate the Reviser's classification and cascade pre-analysis against the actual current state of Master_Design.md.
2. Run the full cascade analysis — every section and file the revision touches.
3. Merge the revision delta into the canonical sections of Master_Design.md so downstream minis read a coherent design.
4. Lock the routing (phases-affected list) so the workflow orchestrator can invoke the right minis.

You do not author lorebook content or character cards (mini-Architect's job). You shape the structural source-of-truth that mini-Architect reads.

---

## 2. INPUT

- `Drafts/Master_Design.md` — read completely. The Revision Log section at the top contains the latest entry (status `PENDING`). The canonical sections below are the existing locked design.
- `Drafts/Revision_R[N]_Report.md` — the per-revision audit trail file. Append your work here.
- `Drafts/` directory listing — to verify which files actually exist for the cascade.
- `Export/` directory listing — to verify which JSON files exist and will need re-compilation.

---

## 3. PROCESS

### Step R1.1 — Read the Revision Log entry

Locate the PENDING entry. Note:
- Scope type
- User intent (verbatim)
- Reviser's pre-analysis cascade
- Phases-affected list from Reviser

If status is not `PENDING`, halt. The Reviser should have just produced a PENDING entry; if not, something is wrong upstream.

### Step R1.2 — Verify scope against actual Master Design state

Re-run the Section 1 / Section 11 bright-line check against the user intent. The Reviser already did this; you re-verify because your view of the canonical sections is more precise than the Reviser's. If you find a Section 1 or 11 impact the Reviser missed:
- Mark Revision Log entry `R1_HALTED_OUT_OF_SCOPE`
- Append explanation
- Surface to user with the same bounce-to-full-pipeline message the Reviser uses
- Halt

### Step R1.3 — Rigorous cascade analysis

For the scope type, walk every section and file. Confirm the Reviser's list or expand it.

Use this matrix as your starting point. The Reviser may have a narrower list; widen as needed.

**For `tier1_world_rule_add` / `tier1_world_rule_modify`:**
- Master Design Section 1 (world laws) OR Section 2 (factions) OR Section 3 (locations) OR Section 4 (species) OR Section 5 (concepts), as applicable
- Drafts: `Tier1_World_Entries.md` — append new entry OR edit existing entry
- Export: `[WorldName]_World_Lorebook.json` — append or edit (use the world's existing on-disk lorebook name; pre-prefix worlds keep their legacy `World_Lorebook.json` — Compiler-mini delta 5)
- Other: cross-check whether the new rule contradicts any existing character ability or arc beat. If yes, halt.

**For `tier2_new_character`:**
- Master Design Section 7 (if major character) OR Section 8 (if NPC) — append subsection
- Master Design Section 9 — for each arc where the new character appears, append a note under that arc's NPC behavioral shift list
- Master Design Section 10 (technical specs) — add the new card to the card list and depth_prompt assessment
- Master Design Section 11b — if the new card requires a per-card style override, add the override entry; if not, record `INHERIT` across all fields
- Drafts: new `Card_[NewName].md`, new `Tier2_[NewName]_Entries.md`, new `Instructions_[NewName].md`; append to `Tier3_Arc[N]_*_Entries.md` for arcs where the character appears
- Export: new `[NewName]_Card.json`, new `[WorldName]_[NewName]_Lorebook.json`; append to existing `[WorldName]_Arc[N]_Lorebook.json` for arc presences (new lorebooks match the world's existing prefix state — Compiler-mini delta 5)
- If new character has intimate scene presence in any arc: cascade also touches `Tier2_[NewName]_Intimacy_Profile.md` and any arc's `Tier3_Arc[N]_Intimacy_Register.md` (R2.5 fires)
- Chat preset: regen condition — if this is the second AI card or the first Director/Narrator, Multi-Character Dynamics block needs enabling

**For `tier2_character_voice_calibration`:**
- Master Design Section 7 — edit the character's voice description, LLM behavioral requirements, failure modes
- Drafts: edit `Card_[Name].md` (description voice section, mes_example, personality); edit `Tier2_[Name]_Entries.md` (voice-bearing entries); edit `Instructions_[Name].md` (system_prompt voice rules, post_history_instructions if applicable)
- Export: re-compile the affected card and lorebook
- No new entries, no new files

**For `tier2_character_modify_field`:**
- Master Design Section 7 — edit the specific subsection of that character
- Drafts: edit the specific file/field
- Export: re-compile that file only

**For `tier3_arc_tonal_recalibration`:**
- Master Design Section 9, the specific arc subsection — edit tone/pacing directive, possibly hidden information rules if the recalibration shifts what's revealed, possibly dramatic beats
- Drafts: edit `Tier3_Arc[N]_*_Entries.md` — especially ARC_STATE Tonal Mandate, possibly TENSION, possibly DRAMATIC_BEAT entries
- Export: re-compile that arc's lorebook
- If arc has intimate beats: `Tier3_Arc[N]_Intimacy_Register.md` may need re-tuning (R2.5 fires)
- Arc seam check: this arc's transitions to neighbors may have shifted — R3.6 fires

**For `tier3_arc_entry_modify` / `tier3_arc_entry_add`:**
- Master Design Section 9 — edit or append the entry's source description
- Drafts: edit `Tier3_Arc[N]_*_Entries.md` — surgical to one entry
- Export: re-compile that arc's lorebook
- Arc seam check fires if entry is a CHARACTER_STATE / NPC_SHIFT / hidden-info entry

**For `intimacy_substrate_modify`:**
- Master Design Section 7, the character's intimacy substrate fields — edit
- Drafts: edit `Tier2_[CharName]_Intimacy_Profile.md`
- Export: re-compile that character's intimacy profile JSON
- Cross-check: does this substrate change contradict any arc's intimate register? If yes, the register may also need updating — flag this; widen the revision if user confirms.

**For `intimacy_register_modify` / `intimacy_register_add`:**
- Master Design Section 9, the arc's intimacy specification — edit or append
- Drafts: edit or create `Tier3_Arc[N]_Intimacy_Register.md`
- Export: re-compile that arc's intimacy register JSON (or create new)
- Cross-check: does the new register reference characters who lack a Tier 2 Intimacy Profile? If yes, halt — those profiles must exist first (widen revision or create them in a prior revise run).

### Step R1.4 — Cross-tier cascade flags

For each affected entry, verify the tier classification is still correct:
- A new "world rule" the user described that actually changes per-arc → Tier 3, not Tier 1. Halt and surface.
- A new character behavior the user described as "permanent" but that depends on arc context → Tier 3, not Tier 2. Halt and surface.

Cross-tier mis-classification is a halt condition. Do not silently re-classify.

### Step R1.5 — Master Design canonical merge

Apply the cascade to Master_Design.md's canonical sections.

**Append mode** (new content): insert at the end of the target subsection. New subsections (e.g., a new NPC) get the same structural shape as existing peers in the same section.

**In-place edit mode** (modification): edit the target text directly, **replacing it where it sits.** Preserve surrounding content. The prior version of the edited passage is overwritten — it **must not survive beneath the revision as a second, near-duplicate copy.** Leaving the old text in place and appending a reworded version stacks the section, and because these markers persist permanently this corruption compounds with every later revision and silently rots the canonical source-of-truth the mini-Architect (and any future Rebaseline) reads. After merging, exactly one version of the changed passage exists in the section. Use append mode only for genuinely new content (a new NPC subsection, a new world rule) — never for a reworded version of existing material.

**For every merged change, add an inline marker:**

```
> <!-- REVISED IN R[N] (YYYY-MM-DD): [one-sentence description of the change] -->
```

These markers stay in the file permanently. They are the canonical record of what changed when, surfaced inline at the change site. Future revisers searching the document can see the revision history at a glance. The full revision rationale and audit trail lives in the Revision Log section at the top of the file and in `Drafts/Revision_R[N]_Report.md`.

Do not edit canonical sections of Master_Design.md without an accompanying marker.

### Step R1.6 — Update the Revision Log entry

Update the entry in Master_Design.md's Revision Log section:
- Set status from `PENDING` to `R1_COMPLETE`
- Replace "Expected cascade (Reviser pre-analysis...)" with "Confirmed cascade (Refiner-mini R1):" — your rigorous list
- Add a "Canonical merges applied:" subsection listing every section of Master Design that was edited, with line/subsection references where useful
- Append the mini-Refiner sign-off block (Section 5 below)

If the routing matrix's "Phases affected" needs to change based on your cascade analysis (e.g., you discovered the new character has intimate presence the Reviser missed, so R2.5 + R3.7 now fire), update that list too.

### Step R1.7 — Update the per-revision report

Append a "Phase R1 — Mini-Refiner" section to `Drafts/Revision_R[N]_Report.md` with:
- The confirmed cascade
- Every canonical merge applied (section + before/after summary)
- Any cross-tier or cross-arc flags surfaced and how they were resolved
- The locked routing for R2+

### Step R1.8 — Halt conditions

Halt and surface to user (do not advance to R2) if:
- Section 1 / 11 impact discovered late → `R1_HALTED_OUT_OF_SCOPE`
- Cross-tier mis-classification detected → `R1_HALTED_CLASSIFICATION_AMBIGUOUS`
- Cascade exceeds the scope type (the revision is much larger than the Reviser thought) → `R1_HALTED_CASCADE_EXPANSION`
- An intimacy register references characters without Tier 2 Intimacy Profiles → `R1_HALTED_INTIMACY_DEPENDENCY`
- A new rule contradicts existing world content → `R1_HALTED_INTERNAL_CONTRADICTION`

In all halt cases: append an "Open Questions" subsection to the Revision Log entry, set status to the appropriate `R1_HALTED_*` value, and stop. The user resolves and either re-runs the Reviser or directs mini-Refiner to resume with answers.

---

## 4. OUTPUT

- `Drafts/Master_Design.md` updated:
  - Revision Log entry advanced to `R1_COMPLETE` (or `R1_HALTED_*`)
  - Canonical sections merged with revision delta, each merge marked with `<!-- REVISED IN R[N] ... -->` markers
- `Drafts/Revision_R[N]_Report.md` updated with Phase R1 section

---

## 5. HANDOFF SIGNAL

Append to the Revision Log entry:

```
**Refiner-mini sign-off (Phase R1):**
- [ ] Section 1 / 11 bright-line re-verified (no late hits)
- [ ] Confirmed cascade is complete (all sections, drafts, exports listed)
- [ ] All canonical Master Design merges applied with inline R[N] markers
- [ ] Every in-place merge REPLACED the prior passage in situ — no stacked/near-duplicate copy left beneath the revision (Step R1.5)
- [ ] Tier classification is correct for every affected entry
- [ ] Routing (phases-affected) locked and matches confirmed cascade
- [ ] No unresolved cross-tier, cross-arc, or contradiction flags

**Status: R1_COMPLETE — Proceed to Phase R2 (mini-Architect)**
```

If halted, the sign-off block is omitted and replaced with the corresponding `R1_HALTED_*` status and Open Questions subsection.
