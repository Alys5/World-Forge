# SvartulfrVerse_Urban — Full Re-author + Recompile to New Template Conventions

## Context

The user requested (in Italian): *"dopo le massicce modifiche ai template dobbiamo ricompilare tutti i file per adattarci ai nuovi template — serve una revisione completa e una ricompilazione."* They confirmed scope = **Tutto** (re-author all Drafts + recompile Export + regenerate JanitorAI).

**Critical finding from investigation:** This is **not** a surgical revision — it is a full rebuild-to-template-conventions. The `Reviser`/revise-mini contract (one concern, no scope expansion, Section 1/11 bright line) is exceeded by design, so we execute it as a rebuild, not as a Revision Log entry.

**What actually changed (verified):**
- The JSON *compile* templates (`templates/char_template.json`, `templates/Lorebook_Template.json`) are **byte-identical** to what produced the last Export compile (commit HEAD). So `wf_build_world.py` alone would reproduce ~identical SillyTavern JSON — it does **not** enforce the new authoring conventions.
- The **changed** templates are the *authoring/convention* markdown and the Janitor set:
  - `Char_Card_creation.md`, `Lorebook_creation.md`, `User_Persona_template.md`, `World_Seed_Template.md` (guide how Drafts are *written* — not mechanically enforced by any tool).
  - `Janitor_Bot_Template.md` (added), `Janitor_Lorebook_Script.js`, `Janitor_Bio_Template.html` (consumed by `build_janitor.py` / `build_janitor_profile.py`).
- The build tool (`wf_build_world.py`) only **parses a fixed Draft format and copies content verbatim** into JSON. It does NOT:
  - enforce `Char_Card_creation.md` description-header structure,
  - populate `character_book` Q&A entries from Drafts (it copies the template's 33 placeholder Q&A entries),
  - read `User_Persona_template.md` conventions.

**Therefore "adapt to the new templates" = manually re-author every Draft file to the new conventions, then recompile.** The build step only regenerates JSON from the (now-convention-correct) Drafts; the Janitor step regenerates `JanitorAI_*` artifacts from the new Janitor templates.

**World state:** `World Mode: sandbox`. `perspective: third_omniscient`, `tense: present`. Sandbox conventions apply (SANDBOX_STATE authority, no arc qualifiers, Director card needs a director tag + Director-variant style override).

---

## Preconditions / audit-trail reconciliation (do first)

1. **Close the in-flight revision R3.** `Master_Design.md` Revision Log shows `R3` at status `R1_COMPLETE` (never flipped to `APPLIED`). The revise single-revision rule requires a clean state. Confirm R3's edits are already reflected in the current Drafts/Export (its cascade touched `Tier1_World_Entries.md`, `Card_Erik.md`, geography), then either mark R3 `APPLIED` or, if incomplete, finish it before the full pass. Its log references stale `SvartulfrVerse_EN_*` filenames (real files are `SvartulfrVerse_Urban_*`) — correct the log entry for accuracy.
2. **Git checkpoint.** Commit the current Drafts/ + Export/ so the full recompile diff is reviewable and reversible: `git commit -am "checkpoint before template-convention rebuild"`.
3. **Back up Export.** Copy `Export/SvartulfrVerse_Urban/` to a temp dir before recompiling, for content-loss diffing.

---

## Phase A — Re-author Drafts to new template conventions

For each file, read the matching new template, restructure to its conventions, **preserving all existing world content/intent** (no creative rewrites). The build parser constraints below must be respected or recompile breaks.

### A1. Character cards — `Card_Erik.md`, `Card_Jasper.md`, `Card_Malachia.md`, `Card_Noah.md`, `Card_World_Director.md`
Convention source: `templates/Char_Card_creation.md`.
- Rewrite the `### description` block to use the explicit `###` headers: `### CHARACTER OVERVIEW`, `### APPEARANCE DETAILS` (Full Name/Alias/Race/Sex-Gender/Height/Age/Hair/Eyes/Body/Face/Features/Privates/Appearance Traits+Details/Effects), `### STARTING OUTFIT`, `### ORIGIN (BACKSTORY)`, `### RESIDENCE`, `### CONNECTIONS`, `### INVENTORY`, `### ABILITIES`, `### PERSONALITY` (Archetype + Personality Tags), `### [BEHAVIOR_NOTES]`, `### [SEXUALITY]`.
  - **Why this matters:** the current Export descriptions already contain these `###` headers, but the `Card_*.md` `### description` fields are plain prose. The build tool copies `Card_*.md` description verbatim, so **recompiling without this fix would DELETE the headers from Export** (regression). Make the Drafts the authoritative source of the headers.
- Keep `### personality`, `### scenario`, `### first_mes`, `### mes_example`, `### orientation` as-is (verify they exist).
- Sandbox rule: drop any arc-range qualifiers ("Arc 1–2 only:"); the persona is the full standing self.

### A2. Instruction files — `Instructions_Erik.md`, `Instructions_Jasper.md`, `Instructions_Malachia.md`, `Instructions_Noah.md`, `Instructions_World_Director.md`
Convention source: `Char_Card_creation.md` "WHAT BELONGS IN THE CARD's system_prompt" + sandbox section.
- `# System Prompt` must begin with `{{original}}` and now state: full standing identity, character-specific behavioral mandates, hard prohibitions, trigger-response pairs, **and an explicit statement that the active `SANDBOX_STATE` lorebook entry is the authoritative current register** (currently missing from Erik's instructions).
- `# Post-History Instructions` begins with `{{original}}`, imperative, ≤150 words, the 2–3 most drift-prone rules (currently OK for Erik; verify others).
- Optional `# Depth Prompt` if a behavioral anchor is warranted.

### A3. Lorebook entries — `Tier1_World_Entries.md`, `Tier2_*_Entries.md` (Erik/Jasper/Malachia/Noah/Protagonist), `Tier2_NPC_Principal_Entries.md`, `Tier2_NPC_Roster_Entries.md`, `Tier3_Sandbox_Entries.md`
Convention source: `templates/Lorebook_creation.md`.
- Keep the `### ENTRY:` / `**Category:**` / `**Trigger Keys:**` / `**Selective Logic:**` / `**Constant:**` / `**Injection Position:**` / `**Order Priority:**` / `**Position Rationale:**` / `**Content:**` structure (this is what `wf_build_world.py` parses — do not change field names).
- Apply the **Bell Method** to `Content` bodies (Identity/Physical → Background → Psychological/behavioral/constraint/speech at the bottom) where not already present.
- Verify ENTRY TYPE → POSITION per the template table: world rules/factions/species → 0; character/NPC profiles, arc/sandbox state → 1; TENSION/WORLD_PULSE → 4 (depth 2–4). SANDBOX_STATE → constant:true, ignoreBudget:true, position 1.
- `Tier3_Sandbox_Entries.md`: ensure `SANDBOX_STATE` (two-subsection: `**Standing Situation:**` + `**Tonal Mandate:**` with imperative bullets, incl. aliveness contract) and `WORLD_PULSE` (position 4) conform.

### A4. Intimacy files — `Tier2_*_Intimacy_Profile.md` (Erik, Jake, Jasper, Kaladin, Logan, Malachia, Marcus, Noah, Ut, Wulfnic, Zefir), `Tier2_NPC_Intimacy_Roster.md`, `Tier3_Sandbox_Intimacy_Register.md`
- Re-author to `Lorebook_creation.md` Bell Method + position rules. `Tier3_Sandbox_Intimacy_Register.md` = the single standing register (no arc suffix), position 1, constant+ignoreBudget.

### A5. User personas — `User.md`, `User_Alyssa.md`
Convention source: `templates/User_Persona_template.md`. Restructure to its fields; preserve content.

### A6. `World_Seed.md` (optional)
If it will be reused for any future `/worldforge skip phase0`, align to `templates/World_Seed_Template.md`. Not required for the recompile. Confirm with user.

### A7. Director card special handling — `Card_World_Director.md` + `Instructions_World_Director.md`
Per `Char_Card_creation.md` sandbox Director rules: ensure the card carries a recognized director tag in `tags` (`world-director`/`npc-controller`) and a Director-variant `style_override` at `extensions.world_forge.style_override` (perspective override + Director-variant directive prose from `SHARED_Style_Contract_Reference.md` §3a-D). Verify after recompile.

---

## Phase B — Recompile Export (Drafts → JSON)

Run from `D:\World-Forge`:
```
python tools/wf_build_world.py SvartulfrVerse_Urban
```
This regenerates all `*_Card.json`, `*_Lorebook.json`, intimacy-profile JSON, copies `User.md`/`User_Alyssa.md`, and triggers the Janitor profile build.

**Known behaviors / watch-items:**
- **Fresh UIDs.** The tool renumbers entries 0..n each run. This breaks running SillyTavern chat states (accepted tradeoff for a full recompile; consistent with a rebuild). The `[[NPC_MANIFEST]]` carriers are regenerated against the new UIDs.
- **`character_book` Q&A.** Every card recompiles with the template's 33 placeholder Q&A entries (same as current state — no regression). Populating them from Drafts is **out of scope** unless the user wants a build-tool extension (requires separate approval per CLAUDE.md "no new scripts without explicit approval").
- **Sanity diff.** `git diff --stat Export/SvartulfrVerse_Urban/` and compare against the pre-recompile backup to confirm no content was lost (especially the description `###` headers from Phase A1).

---

## Phase C — Regenerate JanitorAI artifacts (new Janitor templates)

The Phase B run already calls `build_janitor_profile.py`. Also run the script builder explicitly:
```
python tools/build_janitor.py SvartulfrVerse_Urban
python tools/build_janitor_profile.py SvartulfrVerse_Urban
```
Regenerates: `SvartulfrVerse_Urban_JanitorAI.md`, `..._JanitorAI_Bio.html`, `..._JanitorAI_Script_{Family,NPC,NSFW,World}.js` from the new `Janitor_Bot_Template.md` / `Janitor_Lorebook_Script.js` / `Janitor_Bio_Template.html`.

---

## Phase D — Validate

```
python tools/validate_export.py Export/SvartulfrVerse_Urban
```
Must pass: UTF-8/no mojibake, JSON parse, `{{original}}` presence in cards, position-enum validity, UID uniqueness, entry-key/UID parity, snake_case alias fields absent, no leaked inline revision markers. Fix any failures.

---

## Risks / caveats

1. **Description-header inversion (highest risk).** Export currently has `###` headers in descriptions; Drafts do not. If Phase A1 is skipped, recompile silently strips them. A1 is mandatory, not optional.
2. **UID renumber** breaks live chats — by design for a full recompile; communicate to user.
3. **R3 incomplete** — must be closed first or the audit trail and Drafts are inconsistent.
4. **`character_book` Q&A placeholders** remain template stubs (unchanged from current state). Flag to user; populating needs a tool change (separate approval).
5. **Effort is large** — ~40 Draft files restructured. Recommend doing it file-by-file with a git commit per file-group so diffs stay reviewable.

## Rollback
`git` is the rollback path: `git checkout -- Drafts/ Export/` reverts to the pre-rebuild checkpoint. Keep the Export backup dir until validation passes.

## Open questions for user
- Populate `character_book` Q&A entries from Drafts, or leave template stubs? (Needs build-tool change if yes.)
- Re-align `World_Seed.md` to the new template now, or leave it?
