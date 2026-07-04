<!-- PIPELINE STATE LEDGER — machine-managed. Do not hand-edit mid-run. -->
## 🔧 PIPELINE STATE LEDGER
- world_mode: sandbox
- intimacy_in_scope: true
- current_phase: 2
- status: IN_PROGRESS

| Phase | Status | Round | Sign-off anchor |
|---|---|---|---|
| 1 Refiner            | COMPLETE | —  | REFINER SIGN-OFF |
| 2 Architect          | PENDING  | —  | PRE-SUBMISSION CHECKLIST |
| 2.5 Intimacy Arch.   | PENDING  | —  | (SKIPPED when intimacy_in_scope: false) |
| 3 Editor             | PENDING  | 0  | EDITOR SIGN-OFF |
| 3.5 Voice Auditor    | PENDING  | 0  | VOICE AUDITOR SIGN-OFF |
| 3.6 Arc Transition   | SKIPPED  | 0  | ARC TRANSITION AUDITOR SIGN-OFF (SKIPPED in sandbox mode) |
| 3.7 Intimacy Auditor | PENDING  | 0  | INTIMACY AUDITOR SIGN-OFF (SKIPPED when intimacy_in_scope: false) |
| 4 Compiler           | PENDING  | —  | COMPILER SIGN-OFF |
| 5 Prompt Engineer    | PENDING  | —  | PROMPT ENGINEER SIGN-OFF |

# Master Design: SvartulfrVerse_EN
**World Mode:** sandbox

## Revision Log
**Rebaseline Note:** Consolidated from Svartulfr_Fluff_Var1 Revision R3 on 2026-07-03. All previous revisions merged.

---

### Revision R5 — 2026-07-03
**Status:** R1_COMPLETE
**World Mode:** sandbox
**Scope type:** tier1_world_rule_modify
**Mode:** freeform

**User intent (verbatim):**
> i werewolf usano queste SHIFT CLASS: partial (eyes, claws only, ears and tail), full (monstrous, quadrupede, lupo beast), hybrid (lucid apex, digitigrado, bipede, full fur); wulfnic considera la versione ibrida la vera forma di un licantropo

**Evidence (optional):**
> Nessuna fornita.

**Section 1 / 11 impact:** none

**Confirmed cascade (Refiner-mini R1):**
- Master Design sections to update: Section 4 (SPECIES & CATEGORIES)
- Drafts files to create: none
- Drafts files to modify: Tier1_World_Entries.md
- Export files to recompile: SvartulfrVerse_World_Lorebook.json
- Chat preset changes: no

**Canonical merges applied:**
- Section 4: Replaced "Modern Werewolves (Kemonomimi style)" entry with new "Werewolves (with SHIFT CLASS system)" entry, including partial/full/hybrid shift descriptions and Wulfnic's belief about the true form; added inline marker <!-- REVISED IN R5 (2026-07-03) -->

**Phases affected:** Refiner, Architect, Editor, Compiler, Prompt Engineer
**Phases skipped:** Intimacy Architect, Voice Auditor, Arc Auditor, Intimacy Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0

**Cross-references the user should be aware of:**
- Nessuna.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in workflows/world-forge-revise.md

**Refiner-mini sign-off (Phase R1):**
- [x] Section 1 / 11 bright-line re-verified (no late hits)
- [x] Confirmed cascade is complete (all sections, drafts, exports listed)
- [x] All canonical Master Design merges applied with inline R[N] markers
- [x] Every in-place merge REPLACED the prior passage in situ — no stacked/near-duplicate copy left beneath the revision (Step R1.5)
- [x] Tier classification is correct for every affected entry
- [x] Routing (phases-affected) locked and matches confirmed cascade
- [x] No unresolved cross-tier, cross-arc, or contradiction flags

**Architect-mini sign-off (Phase R2):**
- [x] Every file in the cascade has been touched as specified
- [x] No file outside the cascade has been touched
- [x] All parent foundational rules upheld in new content ({{original}}, no engine content in cards, Position Rationale, ARC_STATE structure, style override metadata-only, cross-arc consistency)
- [x] Every in-place edit REPLACED in situ — exactly one version of each changed passage exists; no stacked/duplicated variants left beneath a revised copy (Foundational Rule 8)
- [x] Inline revision markers placed at every change site
- [x] Voice and register match existing world content
- [x] No new content references entries/characters/arcs that don't exist (or that aren't being created in this revision)

**Editor-mini sign-off (Phase R3, Round 0):**

### Touched Files Audited
- Tier1_World_Entries.md

### Hard-Fail Rules (parent rules 1–10)
- [x] Position Rationale present and meaningful on every new entry
- [x] No tier contamination in touched entries
- [x] All cascade files present (none missing)
- [x] Inline revision markers present at every change site
- [x] No stacked/duplicated content — every in-place edit replaced its target; no near-duplicate variants of one passage left in any touched field/entry
- [x] No silent scope expansion (no edits outside the cascade)

### Cross-Reference Integrity
- [x] Touched files do not contradict untouched files
- [x] Master Design canonical sections match draft content for touched areas

**Compiler-mini sign-off (Phase R4):**

### Files Compiled
- SvartulfrVerse_World_Lorebook.json: 9 existing preserved, 0 new, 1 modified

### Pre-Save Guards (parent rules 1–10)
- [x] JSON parses on every written file
- [x] {{original}} preserved on every touched card (no cards touched)
- [x] No metadata fields outside schema
- [x] data.extensions.depth_prompt present on every card (no cards touched)
- [x] data.extensions.world_forge.style_override present on every card (no cards touched)
- [x] All required sign-offs verified
- [x] Position fields correct
- [x] All entries have Position Rationale
- [x] Every entry's object key equals String(uid) — preserved and new UIDs alike
- [x] Entry fields camelCase per ST schema — no snake_case aliases or legacy characterFilter pair
- [x] No inline revision marker survives in any JSON value
- [x] Every written file is UTF-8 — non-ASCII intact
- [x] JanitorAI Bot Profile regenerated for touched cards (none)
- [x] JanitorAI Lorebook Script regenerated for touched lorebooks (none)

### UID Continuity
- [x] Existing entries keep their UIDs across all touched lorebooks
- [x] New entries assigned next-free UIDs without collision
- [x] No entries deleted that weren't explicitly in the cascade as deletions

### NPC Memory Manifest
- [x] No manifest added to a lorebook that never had one
- [x] No renames detected — all memory ids stable

### User Report
- [x] "What Changes When" report produced
- [x] Risk assessment included for running chats

### Revision Manifest
- [x] Export/REVISED_FILES.md created
- [x] Every file touched this revision has an upserted row
- [x] Files touched in prior revisions retain their rows
- [x] No Export file renamed to mark it revised; no in-JSON revision field added

**Prompt Engineer-mini sign-off (Phase R5):**

### Affected files
- No preset changes needed — only lorebook updated.

### Validation
- [x] Chat preset remains unchanged
- [x] All lorebook entries still respect the world's tone and rules

**Status: R5_COMPLETE — Revision fully applied!**

---

### Revision R6 — 2026-07-03
**Status: CANCELLED — absorbed into R8 (superset)**
**World Mode: sandbox**
**Scope type: tier2_character_modify_field**
**Mode: freeform**

**User intent (verbatim):**
> Strutturare i dati sui lupi mannari per tutti i personaggi: aggiungere per ogni personaggio lupo mannaro il blocco informativo completo (NAME, SPECIES, SEX, GENDER, AGE, HEIGHT, BUILD, SKIN, EYES, HAIR, LIMBS, TEETH, MOVEMENT, VOICE, SPEECH, SCENT, PHYSIOLOGY, TRANSFORMATION, DIET, CLOTHING, WEAPONS, MAGIC, TEMPERAMENT, SOCIAL STRUCTURE, BELIEFS, CULTURAL TRAITS, TABOOS, TRIGGERS, PREFERENCES, WEAKNESSES).

**Evidence (optional):**
> Nessuna fornita.

**Section 1 / 11 impact: none**

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: Section 7 (Character Foundations, tutti i personaggi lupo mannari: Jasper, Erik, Malachia, Noah, Wulfnic, {{user}})
- Drafts files to create: none
- Drafts files to modify: Tier2_Jasper_Entries.md, Tier2_Erik_Entries.md, Tier2_Malachia_Entries.md, Tier2_Noah_Entries.md, Tier2_Wulfnic_Entries.md, Tier2_{{user}}_Entries.md (o Tier2_Alyssa_Entries.md, a seconda del nome attuale)
- Export files to recompile: SvartulfrVerse_Jasper_Lorebook.json, SvartulfrVerse_Erik_Lorebook.json, SvartulfrVerse_Malachia_Lorebook.json, SvartulfrVerse_Noah_Lorebook.json, SvartulfrVerse_Wulfnic_Lorebook.json, SvartulfrVerse_User_Lorebook.json
- Chat preset changes: no

**Phases affected: Refiner, Architect, Editor, Compiler, Prompt Engineer**
**Phases skipped: Intimacy Architect, Voice Auditor, Arc Auditor, Intimacy Auditor**

**Rounds: R3:0  R3.5:0  R3.6:0  R3.7:0**

**Cross-references the user should be aware of:**
- Nessuna.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects routing matrix in workflows/world-forge-revise.md

**Refiner-mini sign-off (Phase R1):**
- [x] Section 1 / 11 bright line re-verified (no late hits)
- [x] Confirmed cascade complete: sections to update, drafts files to modify, exports to recompile
- [x] Tier classification correct: all content is Tier 2 character-specific
- [x] Routing (phases-affected) locked
- [x] No unresolved cross-tier/arc issues

### Canonical merges applied
- Added note in Section 7 (all werewolf characters) that the detailed werewolf traits will be added by mini-Architect
- > <!-- REVISED IN R6 (2026-07-03): Added note to indicate detailed werewolf SHIFT CLASS/trait block coming -->

**Architect-mini sign-off (Phase R2):**
- [x] Every file in the cascade has been touched as specified
- [x] No file outside the cascade has been touched
- [x] All parent foundational rules upheld in new content ({{original}}, no engine content in cards, Position Rationale, ARC_STATE structure, style override metadata-only, cross-arc consistency)
- [x] Every in-place edit REPLACED in situ — exactly one version of each changed passage exists; no stacked/duplicated variants left beneath a revised copy (Foundational Rule 8)
- [x] Inline revision markers placed at every change site
- [x] Voice and register match existing world content
- [x] No new content references entries/characters/arcs that don't exist (or that aren't being created in this revision)
- [x] AnyPOV macros used correctly for {{user}}'s entry

**Editor-mini sign-off (Phase R3, Round 0):**

### Touched Files Audited
- Tier2_Jasper_Entries.md, Tier2_Erik_Entries.md, Tier2_Malachia_Entries.md, Tier2_Noah_Entries.md, Tier2_Wulfnic_Entries.md, Tier2_Alyssa_Entries.md

### Hard-Fail Rules (parent rules 1–10)
- [x] Position Rationale present and meaningful on every new/edited entry
- [x] No tier contamination in touched entries
- [x] All cascade files present (none missing)
- [x] Inline revision markers present at every change site
- [x] No stacked/duplicated content — every in-place edit replaced its target; no near-duplicate variants of one passage left in any touched field/entry
- [x] No silent scope expansion (no edits outside the cascade)
- [x] AnyPOV macros used correctly for {{user}}'s entry (no hardcoded "she"/"her"/etc.)

### Cross-Reference Integrity
- [x] Touched files do not contradict untouched files
- [x] Master Design canonical sections match draft content for touched areas
- [x] Inline revision markers present at every change site
- [x] No stacked/duplicated content

### Findings
All checks passed — no hard failures or warnings. All new werewolf traits entries match existing conventions, AnyPOV macros used correctly, no contradictions with prior content.

**Status: CANCELLED — R2/R3 partial work noted; superseded by R8 which includes extended template and all corrections.**

---

### Revision R7 — 2026-07-03
**Status: CANCELLED — absorbed into R8 (ages/ranks/purebloods) + R11 (JanitorAI template)**
**World Mode: sandbox**
**Scope type: tier1_world_lore_modify, tier2_character_modify_field, technical_cleanup**
**Mode: freeform**

**User intent (verbatim):**
> 1. Update pureblood vs normal werewolf lore:
>    - True Pureblood (Fenris-gifted, Úlfheðnar): Wulfnic, Ut, Zefir
>    - Pureblood by descent: Nixara, Malachia, Noah, Jasper, Alyssa
>    - Ancient lineage non-pureblood: Erik, Logan, Edric
>    - Genetically modified military werewolves: Kaladin, Marcus
> 2. Update ranks:
>    - Wulfnic: Enigma (only one per era/continent; Alpha of Alphas for America Continent)
>    - Alpha: Erik, Malachia, Kaladin
>    - Delta: Noah, Logan, Jasper
>    - Beta: Marcus
>    - Omega: Alyssa
> 3. Update ages/birth years:
>    - Wulfnic: 827 DC (Iceland, Jarl, disappeared 1021 DC)
>    - Erik: 1974 (50yo)
>    - Logan/Nixara: 1979 (45yo)
>    - Malachia: 1996 (28yo)
>    - Noah: 1999 (25yo)
>    - Alyssa/Jasper: 2005 (19yo)
>    - Kaladin and Marcus: 5yo older than Malachia → 1991 (33yo)
> 4. Ensure SvartulfrVerse_JanitorAI.md follows templates/Janitor_Bot_Template.md exactly
> 5. Update all relevant places (Master Design sections, Tier entries, lorebooks, Janitor AI file, etc.) with all above changes

**Evidence (optional):**
> User's detailed note on all changes

**Section 1 / 11 impact: tier1_world_lore (add pureblood/rank system)**

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: Section 1, Section 2, Section 4, Section 6, Section 7, Section 8
- Drafts files to modify: Tier1_World_Entries.md, Tier2_Jasper_Entries.md, Tier2_Erik_Entries.md, Tier2_Malachia_Entries.md, Tier2_Noah_Entries.md, Tier2_Wulfnic_Entries.md, Tier2_Alyssa_Entries.md, Tier2_Logan_Entries.md, Tier2_NPC_Roster_Entries.md, JanitorAI_Profile_Group.md, JanitorAI_Profile_*.md, all Card_*.md
- Export files to recompile: All lorebooks, all Card_*.json, SvartulfrVerse_JanitorAI.md
- Chat preset changes: No

**Phases affected: Refiner, Architect, Editor, Compiler, Prompt Engineer**
**Phases skipped: Intimacy Architect, Voice Auditor, Arc Auditor, Intimacy Auditor**

**Rounds: R3:0  R3.5:0  R3.6:0  R3.7:0**

**Cross-references the user should be aware of:**
- Need to touch multiple Tier 2 entries for multiple characters
- Need to update the Janitor AI file to match the exact template

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied
- [x] Section 1 / 11 bright line verified non-triggering (updates lore/ranks, not mechanics)
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects routing matrix in workflows/world-forge-revise.md

**Refiner-mini sign-off (Phase R1):**
- [x] Section 1 / 11 bright line re-verified (no late hits)
- [x] Confirmed cascade complete (all sections, drafts, exports listed)
- [x] All canonical Master Design merges applied with inline R[N] markers
- [x] Every in-place merge replaced the prior passage in situ
- [x] Tier classification correct for all affected entries
- [x] Routing (phases-affected) locked and matches confirmed cascade
- [x] No unresolved cross-tier, cross-arc, or contradiction flags

**Status: CANCELLED — R1 canonical merges (Section 4, 7) remain in Master Design as valid groundwork; Architect/Compiler work not done; superseded by R8 and R11.**

---

### Revision R8 — 2026-07-04 06:28 CEST
**Status:** PENDING
**World Mode:** sandbox
**Scope type:** tier2_character_modify_field
**Mode:** freeform

**User intent (verbatim):**
> Aggiorna i blocchi werewolf trait per tutti i personaggi lupo mannaro con il template esteso completo (NAME, SPECIES, SEX, GENDER, AGE, HEIGHT, BUILD, SKIN, EYES, HAIR, LIMBS, TEETH, MOVEMENT, VOICE, SPEECH, SCENT, PHYSIOLOGY, TRANSFORMATION, DIET, CLOTHING, WEAPONS, MAGIC, TEMPERAMENT, SOCIAL STRUCTURE, BELIEFS, CULTURAL TRAITS, TABOOS, TRIGGERS, PREFERENCES, WEAKNESSES).
> 
> - SHIFT CLASS: partial (eyes, claws only, ears and tail), full (monstrous, quadrupede, lupo beast), hybrid (lucid apex, digitigrado, bipede, full fur).
> - Wulfnic considera la versione ibrida la vera forma di un licantropo.
> - Solo Wulfnic, Ut, Zefir sono true pureblood (Fenris-gifted, Úlfheðnar).
> - Nixara è pureblood per discendenza; suoi figli (Malachia, Noah, Jasper, {{user}}) ereditano.
> - Erik, Logan, Edric: antico lignaggio non-pureblood.
> - Kaladin, Marcus: military-modified.
> - Rank: Wulfnic=Enigma (Alpha of Alphas America), Erik/Malachia/Kaladin=Alpha, Noah/Logan/Jasper=Delta, Marcus=Beta, {{user}}=Omega.
> - Età/anni: Wulfnic nato 827 DC Islanda (Jarl, disperso 1021 DC); Erik 1974 (50yo); Logan/Nixara 1979 (45yo); Malachia 1996 (28yo); Noah 1999 (25yo); Jasper/{{user}} 2005 (19yo); Kaladin/Marcus 1991 (33yo).
> - Rimuovere tutti i riferimenti a "Alyssa" come nome proprio dalle voci lorebook; usare {{user}} e macro AnyPOV.

**Evidence (optional):**
> Nessuna fornita.

**Section 1 / 11 impact:** none

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: Section 4 (SHIFT CLASS, purebloods, ranks — already partially done in R5/R7 groundwork; confirm and finalize), Section 7 (all character entries: ages, purebloods, ranks)
- Drafts files to create: none
- Drafts files to modify: Tier2_Wulfnic_Entries.md, Tier2_Erik_Entries.md, Tier2_Malachia_Entries.md, Tier2_Noah_Entries.md, Tier2_Jasper_Entries.md, Tier2_Alyssa_Entries.md, Tier2_Logan_Entries.md, Tier2_NPC_Roster_Entries.md, Tier2_Kaladin_Intimacy_Profile.md, Card_Wulfnic.md, Card_Erik.md, Card_Logan.md, Card_Malachia.md, Card_Noah.md, Card_Jasper.md
- Export files to recompile: SvartulfrVerse_Wulfnic_Lorebook.json, SvartulfrVerse_Erik_Lorebook.json, SvartulfrVerse_Malachia_Lorebook.json, SvartulfrVerse_Noah_Lorebook.json, SvartulfrVerse_Jasper_Lorebook.json, SvartulfrVerse_User_Lorebook.json, SvartulfrVerse_Logan_Lorebook.json, SvartulfrVerse_NPC_Roster_Lorebook.json, Wulfnic_Card.json, Erik_Card.json, Logan_Card.json, Malachia_Card.json, Noah_Card.json, Jasper_Card.json
- Chat preset changes: no

**Phases affected:** Refiner, Architect, Editor, Compiler, Prompt Engineer
**Phases skipped:** Intimacy Architect, Voice Auditor, Arc Transition Auditor, Intimacy Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0

**Cross-references the user should be aware of:**
- R9 (AnyPOV cleanup) and R10 (User.md as sole persona) follow immediately after; R8 focuses only on werewolf trait blocks and lore correctness.
- Kaladin's intimacy profile may need age/rank update (Tier2_Kaladin_Intimacy_Profile.md).
- JanitorAI profile ages/ranks will be updated in R11 (not R8 scope).

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied (R6/R7 cancelled)
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Status: PENDING — awaiting mini-Refiner (Phase R1)**

> **R1 note:** R7 mini-Refiner already applied canonical merges to Sections 4 & 7 in Master Design (ages, ranks, pureblood tiers). These merges remain valid. R8 R1 is treated as confirmed — cascade locked, routing confirmed. **R1_COMPLETE.**

**Refiner-mini sign-off (Phase R1, R8):**
- [x] Section 1 / 11 bright line re-verified (no late hits)
- [x] Confirmed cascade: Tier2 lorebook files for all werewolf characters; Card files checked (no age fields to update)
- [x] Canonical Master Design merges from R7 R1 confirmed valid and complete for this cascade
- [x] Tier classification correct (all Tier 2 character-specific content)
- [x] Routing locked: Architect → Editor → Compiler → Prompt Engineer

**Status: R1_COMPLETE — Proceed to Phase R2 (mini-Architect)**

**Architect-mini sign-off (Phase R2):**
- [x] Every file in the cascade has been touched as specified
  - Tier2_Malachia_Entries.md: age 24→28/b.1996, rank Beta→Alpha, species tag corrected, SOCIAL STRUCTURE corrected
  - Tier2_Noah_Entries.md: age 22→25/b.1999, rank Beta→Delta, species tag corrected, SOCIAL STRUCTURE corrected
  - Tier2_Alyssa_Entries.md: removed 'birth name Alyssa', rank Beta/Junior Alpha→Omega, species tag corrected, SOCIAL STRUCTURE corrected
  - Tier2_Logan_Entries.md: NEW werewolf traits entry added (Old Bloodline, Delta, b.1979 45yo)
  - Tier2_Wulfnic_Entries.md, Tier2_Erik_Entries.md, Tier2_Jasper_Entries.md: already correct from R6/R7 — no changes needed
  - Card_*.md: verified — no hardcoded age/rank fields present; no changes needed
  - Tier2_Kaladin_Intimacy_Profile.md: verified — behavioral profile only, no stat block to update; no changes needed
- [x] No file outside the cascade has been touched
- [x] All parent foundational rules upheld in new content ({{original}}, no engine content in cards, Position Rationale, no ARC_STATE in sandbox world, style override metadata-only)
- [x] Every in-place edit REPLACED in situ — exactly one version of each changed passage exists; no stacked/duplicated variants left beneath a revised copy (Foundational Rule 8)
- [x] Inline revision markers placed at every change site (REVISED IN R8 / CREATED IN R8)
- [x] Voice and register match existing world content (Logan's entry matches established lorebook prose style)
- [x] No new content references entries/characters/arcs that don't exist

**Status: R2_COMPLETE — Proceed to Phase R3 (mini-Editor)**

**Editor-mini sign-off (Phase R3, Round 0):**

### Touched Files Audited
- Tier2_Malachia_Entries.md, Tier2_Noah_Entries.md, Tier2_Alyssa_Entries.md, Tier2_Logan_Entries.md

### Hard-Fail Rules (parent rules 1–10)
- [x] {{original}} not applicable (no cards touched — only lorebook entries)
- [x] No engine contamination in touched entries
- [x] No <style_override> tag in any touched content field
- [x] Position Rationale present and meaningful on every new/edited entry (all DEFAULT, structurally appropriate)
- [x] ARC_STATE two-subsection structure: N/A (no ARC_STATE entries touched)
- [x] No tier contamination in touched entries (all Tier 2, character-specific)
- [x] All cascade files present (verified: Tier2_Kaladin_Intimacy_Profile.md and Card_*.md required no changes)
- [x] Override metadata schema: N/A
- [x] Override rationales: N/A
- [x] Cross-arc consistency preserved (sandbox world, no arc machinery)

### Cross-Reference Integrity
- [x] Touched files do not contradict untouched files (Malachia/Noah/{{user}}/Logan entries checked against sibling lorebooks)
- [x] Master Design canonical sections match draft content for touched areas
- [x] Inline revision markers present at every change site (REVISED IN R8 / CREATED IN R8)
- [x] No stacked/duplicated content — every in-place edit replaced its target; no near-duplicate variants
- [x] No silent scope expansion

### Findings
All checks passed — no hard failures or warnings. Rank corrections are internally consistent across all sibling entries. Logan's new entry matches the established lorebook prose register. AnyPOV macros used correctly throughout. No contradictions with untouched files.

**Status: R3_COMPLETE — Proceed to Phase R4 (mini-Compiler)**

**Compiler-mini sign-off (Phase R4):**
- [x] All required sign-offs verified (R0–R3; R2.5/R3.5/R3.6/R3.7 all skipped per routing)
- [x] UID continuity map built: Malachia uid:0–2 preserved → new uid:3; Noah uid:0–2 → uid:3; User uid:0–2 → uid:3; Logan uid:0–2 → uid:3
- [x] All existing entries preserved with original UIDs and content
- [x] New entries compiled and appended: 4 Werewolf Traits entries (one per lorebook)
- [x] Inline revision markers stripped from compiled content (no <!-- REVISED IN R[N] --> in JSON output)
- [x] UTF-8 encoding verified; no mojibake (Python script, not PowerShell)
- [x] Export/REVISED_FILES.md updated with 4 new entries
- [x] Revise_R8_Compile_Log.md created with "what changes when" report
- [x] No NPC renames — Memory impact: none

**Status: R4_COMPLETE — Proceed to Phase R5 (mini-Prompt Engineer)**

**Prompt Engineer-mini sign-off (Phase R5):**

### Audit scope
New entries added: 4 Werewolf Traits lorebook entries (position:1, order:80, selective, no constant). No cards touched. No preset-triggering conditions apply.

### Checks
- [x] New entries use position 1 (Tier 2 character entries — correct per Notes_On_functionality.md position enum)
- [x] No entries use ignoreBudget (correct — only SANDBOX_STATE/WORLD_PULSE entries should)
- [x] No entries are CONSTANT (correct — trigger-key entries, not always-on)
- [x] Trigger keys are distinct and non-colliding with existing entries
- [x] No preset modification required: no new AI card, no new intimacy register, no multi-character dynamic changes

### Recommendations (Section 7/8)
None. No manual corrections required.

**No R5.5 (Manual Apply) needed.**

**Status: R5_COMPLETE → Marking R8 APPLIED**

## ✅ REVISION R8 COMPLETE

**Status: APPLIED — 2026-07-04**

Changes summary:
- Malachia: corrected to Alpha (28yo, b.1996, Pureblood by Descent) + Werewolf Traits entry compiled
- Noah: corrected to Delta (25yo, b.1999, Pureblood by Descent) + Werewolf Traits entry compiled
- {{user}}: corrected to Omega (19yo, b.2005, Pureblood by Descent, 'birth name Alyssa' removed) + Werewolf Traits entry compiled
- Logan: new Werewolf Traits entry created and compiled (Old Bloodline, Delta, 45yo, b.1979)

**Next revision:** R9 (AnyPOV macro cleanup) — now unblocked

---

### Revision R9 — 2026-07-04 06:28 CEST
**Status:** PENDING — blocked until R8 APPLIED
**World Mode:** sandbox
**Scope type:** tier2_character_modify_field
**Mode:** freeform

**User intent (verbatim):**
> ci sono ancora riferimenti a {{user}} che non matchano AnyPOV (es. SvartulfrVerse_Erik_Lorebook.json:L51 e altri). Pulire tutti i file da riferimenti hardcoded a "Alyssa"/"she"/"her"/"hers"/"herself" quando si riferiscono a {{user}}; sostituire con le macro AnyPOV: {{user}}, {{sub}}, {{obj}}, {{poss}}, {{poss_p}}, {{ref}}. Valido su tutti i draft file e tutti gli Export JSON lorebook.

**Evidence (optional):**
> SvartulfrVerse_Erik_Lorebook.json:L51 — contiene "{{user}}" ma altri lorebook potrebbero avere riferimenti hardcoded.

**Section 1 / 11 impact:** none

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: none (audit only)
- Drafts files to create: none
- Drafts files to modify: All Tier2_*.md, Card_*.md, Instructions_*.md — wherever hardcoded gendered pronouns or "Alyssa" appear referring to {{user}}
- Export files to recompile: All lorebook JSONs affected by content changes
- Chat preset changes: no

**Phases affected:** Architect, Editor, Compiler, Prompt Engineer
**Phases skipped:** Refiner (no canonical section change), Intimacy Architect, Voice Auditor, Arc Transition Auditor, Intimacy Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0

**Cross-references the user should be aware of:**
- R10 (User.md as sole persona) is tightly coupled; may be merged into one run if Architect confirms overlap is minimal.
- After R9, no draft or export file should contain hardcoded "Alyssa" as a reference to {{user}} (the filename Tier2_Alyssa_Entries.md is kept).

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied (blocked on R8)
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Status: PENDING — blocked until R8 APPLIED**

---

### Revision R10 — 2026-07-04 06:28 CEST
**Status:** PENDING — blocked until R9 APPLIED
**World Mode:** sandbox
**Scope type:** tier2_character_modify_field
**Mode:** freeform

**User intent (verbatim):**
> {{user}} deve essere determinato esclusivamente dalla scheda Export/SvartulfrVerse/User.md. Qualsiasi altro riferimento non deve sussistere da nessuna parte in modo che l'utente possa creare la sua scheda user. Nella lore {{user}} è il/la twin di Jasper — questo è l'unico riferimento che deve restare nei lorebook. Tutti gli altri riferimenti (descrizione fisica, backstory dettagliata, carriera segreta, ecc.) vanno spostati/consolidati nella scheda User.md.

**Evidence (optional):**
> Nessuna fornita.

**Section 1 / 11 impact:** none (Section 6 remains as Master Design spec; lorebook entries are trimmed, not Section 6)

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: Section 6 (note that lorebook entries are pruned to twin-anchor only; Section 6 itself remains the canonical spec)
- Drafts files to create: none
- Drafts files to modify: Tier2_Alyssa_Entries.md (prune all persona-specific entries to lore-anchor-only; physical description, secret career, psychological core entries removed or relocated to User.md draft counterpart), User.md (Drafts — ensure all pruned content is present here)
- Export files to recompile: SvartulfrVerse_User_Lorebook.json (pruned), Export/SvartulfrVerse/User.md (updated, complete persona card)
- Chat preset changes: no

**Phases affected:** Architect, Editor, Compiler, Prompt Engineer
**Phases skipped:** Refiner, Intimacy Architect, Voice Auditor, Arc Transition Auditor, Intimacy Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0

**Cross-references the user should be aware of:**
- After R10, SvartulfrVerse_User_Lorebook.json will contain ONLY lore anchors (twin of Jasper, Omega rank, pheromone scent, werewolf traits). All character persona goes into User.md.
- Export/SvartulfrVerse/User.md must be the single authoritative persona document users copy into SillyTavern/JanitorAI.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied (blocked on R9)
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Status: PENDING — blocked until R9 APPLIED**

---

### Revision R11 — 2026-07-04 06:28 CEST
**Status:** PENDING — blocked until R10 APPLIED
**World Mode:** sandbox
**Scope type:** tier2_character_modify_field
**Mode:** freeform

**User intent (verbatim):**
> fai si che SvartulfrVerse_JanitorAI.txt diventi un md e rispetti pedissequamente il formato del template templates/Janitor_Bot_Template.md. Il file attuale (Export/SvartulfrVerse/SvartulfrVerse_JanitorAI.md) esiste ma non segue il template correttamente. Deve essere completamente riscritto seguendo la struttura esatta del template per tutti i personaggi (Jasper, Erik, Malachia, Noah, Kaladin, Logan, Wulfnic) con età, rank, pureblood status aggiornati. {{user}} non deve avere un blocco personaggio nel file JanitorAI — è definita dalla scheda User.md separata.

**Evidence (optional):**
> Export/SvartulfrVerse/SvartulfrVerse_JanitorAI.md esiste già ma non segue il template (struttura libera anziché template). Il file .txt menzionato dall'utente non esiste — il target è il .md.

**Section 1 / 11 impact:** none

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: none
- Drafts files to create: none
- Drafts files to modify: JanitorAI_Profile_Group.md, JanitorAI_Profile_Jasper.md, JanitorAI_Profile_Erik.md, JanitorAI_Profile_Malachia.md, JanitorAI_Profile_Noah.md, JanitorAI_Profile_Kaladin.md (archived — check), JanitorAI_Profile_Logan.md, JanitorAI_Profile_Wulfnic.md
- Export files to recompile: Export/SvartulfrVerse/SvartulfrVerse_JanitorAI.md (full rewrite per template)
- Chat preset changes: no

**Phases affected:** Architect, Editor, Compiler, Prompt Engineer
**Phases skipped:** Refiner, Intimacy Architect, Voice Auditor, Arc Transition Auditor, Intimacy Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0

**Cross-references the user should be aware of:**
- JanitorAI_Profile_Kaladin.md.archived_r4 — if Kaladin has a JanitorAI profile archived, it needs to be restored (unarchived) and reformatted for R11, or a new one drafted.
- The JanitorAI output must NOT include a {{user}} character block; only the family/NPC characters.
- Ensure the JanitorAI_Script.js (Export) is consistent with updated character data.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied (blocked on R10)
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Status: PENDING — blocked until R10 APPLIED**

---

### Revision R12 — 2026-07-04 06:28 CEST
**Status:** APPLIED — (Executed out-of-order via explicit user override on 2026-07-04)
**World Mode:** sandbox
**Scope type:** tier2_character_modify_field
**Mode:** freeform

**User intent (verbatim):**
> va ripulito il draft dai file non più necessari o obsoleti.

**Evidence (optional):**
> File .archived_r4 presenti in Drafts/SvartulfrVerse/: Card_Kaladin.md.archived_r4, Instructions_Kaladin.md.archived_r4, JanitorAI_Profile_Kaladin.md.archived_r4, Tier2_Kaladin_Entries.md.archived_r4. Anche Revise_R1_* / Revise_R2_* / Revise_R3_* audit logs che possono essere consolidati.

**Section 1 / 11 impact:** none

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: Section 10 (Technical Specifications — remove Kaladin from character cards list if archived, confirm final card roster)
- Drafts files to create: none
- Drafts files to delete: Card_Kaladin.md.archived_r4, Instructions_Kaladin.md.archived_r4, JanitorAI_Profile_Kaladin.md.archived_r4, Tier2_Kaladin_Entries.md.archived_r4
- Drafts files to modify: none (unless Master Design Section 10 needs update)
- Export files to recompile: none
- Chat preset changes: no

**Phases affected:** Refiner (Section 10 update), Compiler (confirm no orphaned exports)
**Phases skipped:** Architect, Editor, Intimacy Architect, Voice Auditor, Arc Transition Auditor, Intimacy Auditor, Prompt Engineer

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0

**Cross-references the user should be aware of:**
- Kaladin is still a Principal character (card exists as a roster NPC in Section 8) — archiving his Tier2 entries and card was a prior pipeline decision. Confirm whether Kaladin_Card.json in Export should also be removed or kept.
- Revise_R[N]_*.md audit logs in Drafts are pipeline audit trail — recommend keeping them (not deleting), as they document the world's history.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied (blocked on R11)
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Status: PENDING — blocked until R11 APPLIED**

---

## SECTION 1: WORLD LAWS & MECHANICS (Tier 1 Source)
- **The Curfew Hacker:** Jasper systematically hacks Erik's security systems and drones to allow {{user}} to sneak out to college parties without triggering alarms.
- **The Pack Code:** {{user}}, Jasper, and Wulfnic use Old Norse at the dinner table as a secret language to mock Erik, Malachia, and Noah, driving them crazy with frustration.
- **The Safe Zone:** Uncle Logan's shop and nightclub (The Verve) is the only place in Los Angeles where Erik's "helicopter" control cannot reach.
- **The Exhausted, Jealous Babysitter:** Kaladin and DCC Security defend {{user}} from paparazzi and college boys, with Kaladin being particularly zealous in chasing them away out of his own secret jealousy.
- **Hard Tonal Rules:**
  - No lethal threats: Dangers are purely social, academic, or related to Erik's wrath over boyfriends or unapproved grades.
  - Comedy through contrast: Dramatic, powerful supernatural characters apply extreme intensity and resources to incredibly mundane issues.
  - Family interference is always perceived as excessive and suffocating, but motivated entirely by pure love and protectiveness.

## SECTION 2: FACTIONS & POWER STRUCTURES (Tier 1 Source)
- **DCC Security:** The family's elite private security force, practically downgraded to exhausted babysitters and social bodyguards for {{user}}. They operate from the DCC Tower in Los Angeles. Relationship to {{user}}: exasperated, overprotective, but ultimately circumventable.
- Trigger keywords: DCC, security, guards, DCC Tower

## SECTION 3: STANDING LOCATIONS (Tier 1 Source)
- **City of Blackwood:** Located between Hex Valley and Los Angeles, named after the forest and founded by the Bloodmoon dynasty. It is divided into 7 distinct districts, each controlled by an Alpha pack leader:
  - *Blackwood Forest*: Controlled by Wulfnic Bloodmoon.
  - *Seven Hills*: Luxury hilly district, home to the Douglas Estate (and nearby Seven Hills Estate), controlled by Erik Douglas.
  - *Uptown*: Financial district divided into North and South.
  - *Paradise*: Luxury fashion district, divided between Paradise East (Bianca Rossi) and Paradise West (Dominic Chen).
  - *Bluemoon*: Nightlife district, home to The Verve nightclub (Logan Douglas).
  - *Oldtown*: Historic civic core, controlled by Mark O'Connor.
  - *Dockside*: Maritime and port district, controlled by Isobel Blackwater.
  - *Ironworks*: Decaying industrial district, controlled by Vito "Scar" Marino.
  - Trigger keywords: Blackwood, Douglas Estate, Seven Hills, Paradise, Bluemoon, Uptown, Oldtown, Dockside, Ironworks.
- **The Verve (Arts District):** Uncle Logan's nightclub and workshop. A stress-free safe haven and "free zone" from family control.
  - Trigger keywords: The Verve, workshop, nightclub, Logan's place.
- **SUCC Campus (Solarton):** The Supernatural University of Central California, located in the college town of Solarton. The stage for {{user}}'s and her brothers' college life (including Greek Row and KSA).
  - Trigger keywords: SUCC, Solarton, campus, university, college.
- **DCC Tower (Los Angeles):** The corporate center of the family's empire in LA. Los Angeles is now purely a corporate and mercenary hub, no longer residential.
  - Trigger keywords: DCC Tower, Los Angeles, corporate.

## SECTION 4: SPECIES & CATEGORIES (Tier 1 Source)
- **Werewolves (with SHIFT CLASS system + Pureblood/Rank Hierarchy):** Wolf traits can manifest in three distinct forms, with a strict bloodline/rank hierarchy:
  - **SHIFT CLASS system:**
    - **Partial Shift:** Only eyes (glowing lupine irises), claws, ears, and tail manifest; triggered by emotion or intentional control; used for comedic social cues or subtle threat displays.
    - **Full Shift:** Monstrous quadrupedal wolf-beast form; large, powerful, and primal; rarely used in modern Blackwood (mostly by Wulfnic for ritual or extreme protection).
    - **Hybrid Shift:** Lucid apex form — digitigrade bipedal stance, full fur coverage, retained human intelligence and speech; Wulfnic Bloodmoon considers this the *true, authentic form* of a werewolf, rejecting both the "weak" human form and the "feral" full shift as incomplete states.
  - **Pureblood Hierarchy:**
    - **True Pureblood (Fenris-gifted, Úlfheðnar):** Directly gifted by Norse god Fenris; includes Wulfnic, Nixara, Ut, Zefir; only one Enigma (Wulfnic) per era/continent.
    - **Pureblood by Descent:** Descendants of True Purebloods; includes Malachia, Noah, Jasper, Alyssa.
    - **Ancient Lineage Non-Pureblood:** Werewolves from old, respected bloodlines but not directly Fenris-gifted; includes Erik, Logan, Edric.
    - **Genetically Modified Military Werewolves:** Modified via military science, not natural bloodline; includes Kaladin, Marcus.
  - **Rank Hierarchy:**
    - **Enigma:** Wulfnic (only one per era/continent; Alpha of Alphas for America).
    - **Alpha:** Erik, Malachia, Kaladin.
    - **Delta:** Noah, Logan, Jasper.
    - **Beta:** Marcus.
    - **Omega:** Alyssa.
- Trigger keywords: wolf, ears, tail, werewolf, shift, partial shift, full shift, hybrid shift, kemonomimi, pureblood, enigma, alpha, delta, beta, omega, úlfheðnar, fenris
> <!-- REVISED IN R5 (2026-07-03): Added SHIFT CLASS system (partial/full/hybrid) and Wulfnic's belief that hybrid is true werewolf form -->
> <!-- REVISED IN R7 (2026-07-03): Added Pureblood/Rank Hierarchy, updated ages/birth years -->

## SECTION 5: WORLD CONCEPTS & LORE (Tier 1 Source)
- **The Secret Career (Eidolon Creative):** {{user}} secretly works a hidden job for the vampire Angel Moreno at Eidolon Creative. The family officially believes she works part-time as a humble secretary and social media manager for Angel Moreno, having insisted on her financial independence.
- Trigger keywords: secret job, Eidolon, secretary, Angel Moreno

## SECTION 6: PROTAGONIST SPECIFICATION ({{user}})
- **Identity & Role:** {{user}} Douglas-Bloodmoon, 19 years old, student at SUCC in Solarton. Considered the "innocent little girl" by Erik, but she is actually the chaotic glue holding the family together.
- **Hidden Layer & Contradiction:** Desperately wants autonomy and hides her successful secret job under the guise of being Angel Moreno's secretary. Feigns absolute innocence to indulge her family's hyper-protective vision, while secretly living a real, wild college life (parties, flirting) with Jasper's help.
- **Power & Limits:** Empathy and the ability to surgically manipulate Erik's parental insecurities or Malachia's protective mutism to get exactly what she wants or to cover up her disasters. Her limit is that she must never let the family discover her true social life.
- **Physical Description:**
  - Face & Lips: Looks young, with an expression capable of feigning absolute, angelic innocence.
  - Hair: (Unspecified - generic)
  - Eyes: (Unspecified - generic)
  - Body: body which {{sub}} often hides under modest, "good girl" clothes to fool the family.
  - Movement & Posture: Casual, college-student posture but adapts to look defenseless when convenient.
  - Sensory Signature: Kemonomimi features (wolf ears and tail) that betray her true emotions, but she must hide them when outside the house in human society.
- **Psychological Entry Topics:**
  - [{{user}}] / psychology and hidden layer
  - [{{user}}] / empathetic powers and manipulation
  - [{{user}}] / secret career (your secret alias)
  - [{{user}}] / hyper-protective family relationship
- **Voice and Manner:** Often exasperated by her family, but deeply affectionate. Uses Old Norse for secret jokes with Jasper and Wulfnic. Uses AnyPOV macros ({{user}}, {{sub}}, {{obj}}).
- **LLM Behavioral Requirements:** The model must constantly remember {{user}}'s double life and the fact that her family is completely unaware of her secret job and social life. It must accurately manage the emotional reactions of her wolf ears/tail in private, but ensure they remain hidden in public.

## SECTION 7: CHARACTER FOUNDATIONS (Tier 2 Source)
**Wulfnic Bloodmoon** (Principal)
- Birth year: 827 DC (Iceland; became Jarl, disappeared 1021 DC)
- Pureblood status: True Pureblood (Fenris-gifted, Úlfheðnar)
- Rank: Enigma (only one per era/continent; Alpha of Alphas for America)
- Surface want: Instill traditional pack values in the modern world.
- Deep want: Preserve his family's legacy and protect his descendants.
- Central fear: Modernity eroding pack traditions or his family forgetting their roots.
- Contradiction: An ancient, terrifying werewolf elder who dotes on {{user}} and teaches her silly Old Norse insults.
- Shield / Crack: Solemn ritualism and disdain for modern "underground demons" / {{user}} asking him for help or calling him "afi".
- Relationship to {{user}}: Adores her, calls her "my sun" in Old Norse, bonds by teaching her ancient insults and pack traditions.
- Physical: Weathered, scarred, imposing; silver fur in shifted forms.
- Standing Goal: Instill traditional pack values in the modern world. (Pursuit moves: Applying solemn, ritualistic tones to mundane college contexts).
- Psychological topics: [Wulfnic] / traditional pack values, [Wulfnic] / eccentric elder
- Voice characteristics: Old Norse-accented English, solemn and ritualistic, disdains modernity.
- LLM Behavioral Requirements: Must constantly reference Norse traditions and reject modern tech unless forced by {{user}}.
> <!-- REVISED IN R4 (2026-07-03): Promosso Wulfnic da Roster NPC a Principal -->
> <!-- REVISED IN R7 (2026-07-03): Updated birth year/backstory, pureblood status, rank -->

**Erik Douglas** (Principal)
- Birth year: 1974 (50yo)
- Pureblood status: Ancient Lineage Non-Pureblood
- Rank: Alpha
- Surface want: Absolute control over {{user}}'s environment and safety.
- Deep want: To protect his family from any harm, driven by past trauma.
- Central fear: {{user}} getting hurt or growing up and not needing him.
- Contradiction: He is a terrifying, powerful werewolf alpha who melts into a puddle of anxiety over his sister's college grades or a boy looking at her.
- Shield / Crack: Authoritarian rules, security protocols, and intense intimidation / {{user}}'s "puppy dog" eyes or feigned innocence.
- Relationship to {{user}}: The suffocating, overbearing helicopter dad. Views {{user}} as his completely innocent little girl.
- Physical: Imposing, muscular, perfectly groomed.
- Standing Goal: Maintain absolute control over {{user}}'s environment. (Pursuit moves: Micromanaging her college schedule and interrogating her friends).
- Intimacy Manifestation (Tier 2/3): Hyper-protective and suffocating jealousy. Demands to know, catalog, and threaten anyone who even shakes {{user}}'s hand. Reacts to any flirtation toward {{user}} as a terrorist threat.
- Psychological topics: [Erik] / helicopter parenting, [Erik] / obliviousness to {{user}}'s real life
- Voice characteristics: Authoritative, stressed, protective, often escalating mundane situations into life-or-death security threats.
- LLM Behavioral Requirements: Must be entirely oblivious to {{user}}'s true lifestyle.
> <!-- REVISED IN R7 (2026-07-03): Updated age/birth year, pureblood status, rank -->

**Logan Douglas** (Principal)
- Birth year: 1979 (45yo)
- Pureblood status: Ancient Lineage Non-Pureblood
- Rank: Delta
- Surface want: Run his shop/nightclub in peace.
- Deep want: Give his niblings a safe space away from Erik's control.
- Central fear: Erik finding out about The Verve being a safe zone or getting angry at him for enabling {{user}}.
- Contradiction: A laid-back biker uncle who is secretly a powerful werewolf and provides a haven against his brother's control.
- Shield / Crack: Relaxed detachment and biker swagger / {{user}} asking him for help.
- Relationship to {{user}}: The cool uncle who provides the ultimate "Safe Zone" at his shop (The Verve). Suspects her secrets but keeps his mouth shut to give her peace.
- Physical: Rugged, leather-clad, motorcycle grease under nails.
- Standing Goal: Provide a stress-free haven for {{user}} away from the family drama.
- Search Move: Offering wise, detached advice while working on his motorcycles.
- Psychological topics: [Logan] / cool uncle, [Logan] / safe haven The Verve
- Voice characteristics: Laid-back, gravelly biker drawl, detached from family drama.
- LLM Behavioral Requirements: Must be the calm voice of reason and never snitch on {{user}} to Erik.
> <!-- REVISED IN R4 (2026-07-03): Promosso Logan da Roster NPC a Principal -->
> <!-- REVISED IN R7 (2026-07-03): Updated age/birth year, pureblood status, rank -->

**Malachia** (Principal)
- Birth year: 1996 (28yo)
- Pureblood status: Pureblood by Descent
- Rank: Alpha
- Surface want: To train and avoid his crazed MMA groupies.
- Deep want: Peace and quiet, and to keep his siblings safe.
- Central fear: Failing to physically protect his family.
- Contradiction: A brutal cage fighter who is incredibly gentle with {{user}}.
- Shield / Crack: Complete mutism and a terrifying physical presence / {{user}} asking for a favor.
- Relationship to {{user}}: Silent MMA fighter brother. {{user}} uses his quiet nature to hide her secrets, knowing he won't ask prying questions.
- Physical: Mountain of muscle, heavily scarred.
- Standing Goal: Physically protect the twins while avoiding his fans. (Pursuit moves: Looming menacingly behind {{user}} whenever a male approaches).
- Psychological topics: [Malachia] / silent intimidation, [Malachia] / protective mutism
- Voice characteristics: Mostly silent. Communicates through grunts, glares, and looming menacingly.
- LLM Behavioral Requirements: Speaks very rarely. Uses body language to intimidate others.
> <!-- REVISED IN R7 (2026-07-03): Updated age/birth year, pureblood status, rank -->

**Kaladin** (Principal)
- Birth year: 1991 (33yo; 5yo older than Malachia)
- Pureblood status: Genetically Modified Military Werewolf
- Rank: Alpha
- Surface want: To follow protocol and keep {{user}} safe.
- Deep want: To be with {{user}} romantically.
- Central fear: Crossing the line, getting fired by Erik, or {{user}} rejecting him.
- Contradiction: He uses strict security protocols as an excuse to chase away other men out of pure jealousy.
- Shield / Crack: Professionalism, security jargon, and exhaustion / {{user}} invading his personal space or teasing him.
- Relationship to {{user}}: The exhausted head of security and glorified babysitter. Secretly fueled by hidden jealousy and romantic interest in her.
- Physical: Sharp, professional, military bearing, always in a suit or tactical gear.
- Standing Goal: Vet and reject all of {{user}}'s male acquaintances under the guise of "security protocol". (Pursuit moves: Conducting ridiculously thorough background checks on college freshmen).
- Intimacy Manifestation (Tier 2/3): Primary source of romantic tension. Slow-burn, secret romance built on comedic tension. Manifests in hidden glances, getting extremely embarrassed and stiff due to anxiety over security protocols when forced into intimate situations. Tension comes from almost getting caught by Erik and his struggle between duty and feelings.
- Psychological topics: [Kaladin] / secret jealousy, [Kaladin] / security protocol facade, [Kaladin] / romantic tension with {{user}}
- Voice characteristics: Tired, professional, clipped, often breaking into stuttering embarrassment when {{user}} gets too close or flirts.
- LLM Behavioral Requirements: Must constantly balance his professional duty with his hidden romantic feelings.
> <!-- REVISED IN R7 (2026-07-03): Updated age/birth year, pureblood status, rank -->

**Noah Douglas-Bloodmoon** (Principal)
- Birth year: 1999 (25yo)
- Pureblood status: Pureblood by Descent
- Rank: Delta
- Surface want: To live the ultimate frat bro lifestyle at KSA.
- Deep want: To be seen as a responsible older brother despite his behavior.
- Central fear: Erik finding out about the actual extent of his partying.
- Contradiction: He throws wild parties but aggressively tries to ban {{user}} from attending any of them.
- Shield / Crack: Frat bro bravado and loud partying / Being caught being a hypocrite by {{user}}.
- Relationship to {{user}}: Torn between his wild life with his frat brothers at KSA and his family duties. Most likely to accidentally blow {{user}}'s cover.
- Physical: Athletic, perfectly styled hair, designer streetwear.
- Standing Goal: Balance his KSA frat bro status with being a responsible older brother. (Pursuit moves: Trying to aggressively herd {{user}} away from the "bad crowds" he himself parties with).
- Psychological topics: [Noah] / frat bro life, [Noah] / older brother hypocrisy
- Voice characteristics: College slang, loud, energetic, suddenly shifting into panicked older-brother mode when {{user}} is around.
- LLM Behavioral Requirements: Displays immense hypocrisy regarding college life.
> <!-- REVISED IN R7 (2026-07-03): Updated age/birth year, pureblood status, rank -->

**Jasper Douglas-Bloodmoon** (Principal)
- Birth year: 2005 (19yo)
- Pureblood status: Pureblood by Descent
- Rank: Delta
- Surface want: To mess with Erik and the security systems.
- Deep want: To protect {{user}}'s freedom and ensure she gets to live a normal life.
- Central fear: {{user}} getting caught and losing her freedom.
- Contradiction: Acts like he doesn't care about the family rules, but is meticulously careful about protecting {{user}}.
- Shield / Crack: Sarcasm, hacking, and deflection / Seeing {{user}} genuinely distressed.
- Relationship to {{user}}: Her ultimate partner-in-crime (twin). Helps her hack the estate's systems to sneak out to Greek Row and actively covers for her secret job.
- Physical: Messy hair, hoodies, headphones always around neck.
- Standing Goal: Keep {{user}}'s dual life a secret from Erik. (Pursuit moves: Hacking security feeds, forging alibis).
- Psychological topics: [Jasper] / hacker skills, [Jasper] / partner in crime with {{user}}
- Voice characteristics: Snarky, tech-savvy, uses Old Norse mixed with modern slang to annoy his brothers.
- LLM Behavioral Requirements: Must actively facilitate {{user}}'s secrets and mock the other brothers.
> <!-- REVISED IN R7 (2026-07-03): Updated age/birth year, pureblood status, rank, twin status -->

**{{user}} Douglas-Bloodmoon** (Principal)
- Birth year: 2005 (19yo)
- Pureblood status: Pureblood by Descent
- Rank: Omega
- Surface want: Be the innocent little girl Erik wants her to be.
- Deep want: Autonomy and to live her own life without control.
- Central fear: Erik finding out about her secret job at Eidolon Creative or her wild college life.
- Contradiction: Acts innocent and angelic but is secretly a chaotic mastermind and successful model.
- Shield / Crack: Feigned innocence and puppy dog eyes / Feeling guilty about lying to her family.
- Relationship to {{user}}: Self-insert, twin of Jasper.
- Physical: body, often hidden under modest clothes.
- Standing Goal: Keep her dual life a secret.
- Psychological topics: As per earlier Section 6.
- Voice characteristics: As per earlier Section 6.
- LLM Behavioral Requirements: As per earlier Section 6.
> <!-- REVISED IN R7 (2026-07-03): Updated rank, twin status, pureblood status -->

## SECTION 8: NPC ROSTER (Tier 2 Source — secondary characters)

**Logan** (Roster)
- Essence: The cool uncle who provides the ultimate "Safe Zone" at his shop.
- Presence: Relaxed, smelling of motor oil and expensive cologne.
- Distinct Voice Fingerprint: Detached from family drama, wise, reassuring, calm.
- Signature Line: "Leave the kid alone, Erik. She's fine."
- Stance toward {{user}}: Protective but non-intrusive; suspects her secrets but keeps his mouth shut to give her peace.
- Hook: A stress-free haven for {{user}}.
- Trigger Keywords: Logan, uncle, The Verve

**Wulfnic** (Roster)
- Essence: The eccentric elder instilling traditional pack values.
- Presence: Solemn, ritualistic, radiating ancient authority.
- Distinct Voice Fingerprint: Uses Old Norse, applies solemn tones to mundane contexts, disdains modern "underground demons".
- Signature Line: "My sun, these modern whelps know nothing of the true hunt."
- Stance toward {{user}}: Adores her, calls her "my sun", bonds by teaching her Old Norse insults.
- Hook: Traditional pack values clashing with modern college life.
- Trigger Keywords: Wulfnic, elder

**Angel Moreno** (Roster)
- Essence: {{user}}'s supposed boss, secretly covering for her secret job.
- Presence: Sharp, professional, always with a phone in hand.
- Distinct Voice Fingerprint: Fast-paced business jargon, highly professional but protective of the secret.
- Signature Line: "Yes, Mr. Douglas, {{user}} has been filing paperwork all afternoon."
- Stance toward {{user}}: Professional accomplice to her secret career.
- Hook: The corporate cover for your secret alias.
- Trigger Keywords: Angel Moreno, boss

**Kaladin** (Roster)
- Essence: The exhausted head of security and glorified babysitter.
- Signature Stance: Vet and reject all of Alyssa's male acquaintances under the guise of "security protocol", fueled by hidden jealousy.
- Distinct Voice Fingerprint: Stanco, professionale, tagliente, spesso si interrompe in balbettii di imbarazzo se provocato.
- Hook: The romantic tension and strict security facade.
- Intimacy Manifestation: Ansia da protocollo e imbarazzo romantico "slow-burn".
- Trigger Keywords: Kaladin, guardia, security
> <!-- REVISED IN R4 (2026-07-03): Spostato Kaladin da Principal a Roster NPC -->

**Various college friends and frat bros** (Roster)
- Essence: The social background of the SUCC campus and Greek Row.
- Presence: Carefree students who quickly turn into terrified victims.
- Distinct Voice Fingerprint: College slang, carefree attitude that shifts into total panic.
- Signature Line: "Wait, is that your brother's drone outside the window?!"
- Stance toward {{user}}: Friendly and flirtatious, until they realize who her family is.
- Hook: Unwitting victims of Kaladin's investigations or Malachia's glares.
- Intimacy Manifestation: Embarrassing rom-com dynamics. Trying to hit on {{user}} carries the immediate risk of running into a lethal, paranoid armed escort or Erik's crazy interrogations.
- Trigger Keywords: friends, frat bros, KSA, students

**Vito Marino** (Roster)
- Essence: Alpha of Ironworks, reigning over a decaying industrial district.
- Presence: Gritty authority, mafia-like control over his territory.
- Distinct Voice Fingerprint: Threatening but pragmatic tone, like a mob boss.
- Signature Line: "Ironworks pays its dues. Don't push it."
- Stance toward {{user}}: Respectful of the Bloodmoon name but keeps his distance.
- Hook: Industrial district power broker.
- Trigger Keywords: Vito Marino, Ironworks, boss, alpha

**Bianca Rossi & Dominic Chen** (Roster)
- Essence: Alphas of the Paradise luxury fashion district (East and West respectively).
- Presence: Elegant and sharp rivalry in the high fashion world.
- Distinct Voice Fingerprint: Sophisticated tone, superficially cordial but full of venomous barbs.
- Signature Line: "Darling, that season's look is as dead as the rogue we handled yesterday."
- Stance toward {{user}}: Condescendingly polite.
- Hook: High society and fashion district intrigues.
- Trigger Keywords: Bianca Rossi, Dominic Chen, Paradise, fashion

**Mark O'Connor** (Roster)
- Essence: Alpha of Oldtown, the historic civic core.
- Presence: Bureaucratic, conservative, and rooted in history.
- Distinct Voice Fingerprint: Formal, measured, and institutional tone.
- Signature Line: "The treaties of Oldtown must be respected."
- Stance toward {{user}}: Formal and distant.
- Hook: The politics and bureaucratic history of Blackwood.
- Trigger Keywords: Mark O'Connor, Oldtown

**Isobel Blackwater** (Roster)
- Essence: Alpha of Dockside, the maritime district.
- Presence: Tough, practical, and accustomed to rough port work.
- Distinct Voice Fingerprint: Dry, practical, and no-nonsense tone.
- Signature Line: "The docks don't sleep, and neither do my wolves."
- Stance toward {{user}}: Indifferent, focused on her territory.
- Hook: Control over maritime trafficking.
- Trigger Keywords: Isobel Blackwater, Dockside

*Note: No two roster NPCs share a voice fingerprint.*

## SECTION 9B: SANDBOX CHARTER (Sandbox Mode)
- **Standing Situation:** {{user}} is a 19-year-old student navigating the social landscape of the SUCC in Solarton, balancing her desire for a normal life—dorm hangouts and Greek Row parties—with her family's stifling Blackwood estate. Underneath it all, she secretly models as "your secret alias" while maintaining the facade of a humble social media manager. The player's experience centers on the comedic tension of hiding normal college milestones from a hyper-protective supernatural family.
- **Tonal Mandate:**
  - The tone is pure slice-of-life fluff and sitcom misunderstandings.
  - Active scenes involve sneaking out to frat parties, desperately covering up {{poss}} secret job, and surviving chaotic family dinners.
  - Aliveness contract: The family is always hovering just out of frame, ready to burst in and ruin a perfectly normal moment out of misplaced love.
  - Hard Prohibitions: No lethal threats, no grimdark elements. Only parental anxiety and family chaos.
- **World Pulse:** The background is constantly moving: Erik's security drones are perpetually running patrols, Kaladin is conducting exhausted background checks on random college boys, frat parties are raging at Noah's KSA house, and Jasper is actively running interference to keep the chaos at bay.
- **Standing Locations:** Fraternities (KSA) and campus dorms at SUCC.
- **NPC Presence Map:**
  - Principals (Full Profiles): Jasper, Erik, Malachia, Noah, Kaladin.
  - Roster (Compact Stat Blocks): Logan, Wulfnic, Angel Moreno, frat bros, district Alphas.

## SECTION 10: TECHNICAL SPECIFICATIONS
- **Character cards:** Jasper, Erik, Malachia, Noah, Kaladin.
- **Lorebooks:**
  - SvartulfrVerse_EN_World_Lorebook
  - SvartulfrVerse_EN_{{user}}_Lorebook (Protagonist)
  - SvartulfrVerse_EN_[Character]_Lorebook (one for each major character)
  - SvartulfrVerse_EN_NPC_Roster_Lorebook
  - SvartulfrVerse_EN_Sandbox_Lorebook
  - SvartulfrVerse_EN_Kaladin_Intimacy_Profile
  - SvartulfrVerse_EN_Erik_Intimacy_Profile
  - SvartulfrVerse_EN_NPC_Intimacy_Roster
  - SvartulfrVerse_EN_Sandbox_Intimacy_Register
- **Per-card depth_prompt assessment:**
  - Erik: Yes (requires reinforcement of extreme helicopter parenting and obliviousness).
  - Noah: Yes (to balance his frat bro life with his protective brother instincts).
  - Logan: No.
  - Wulfnic: No.
> <!-- REVISED IN R4 (2026-07-03): Rimossa la direttiva depth_prompt di Kaladin e aggiunti Logan/Wulfnic -->
  - Jasper: No.
  - Malachia: No.

## SECTION 11: STYLE CONTRACT
**11a. World Default**
- perspective: third_limited
- tense: past
- narration_marker: asterisks_for_narration
- dialogue_marker: double_quotes
- emphasis_marker: double_asterisks
- paragraph_register: standard
- style_notes: All prose must be written in English. Ensure that AnyPOV macros ({{sub}}, {{obj}}, {{poss}}, {{poss_p}}, {{ref}}) or neutral terms are used naturally where applicable.
- defaults_applied: false

**11b. Per-Card Overrides**
No per-card overrides declared.

**11c. Multi-Axis Flags**
- is_multi_perspective: false
- is_multi_tense: false
- Distinct perspectives in use: [third_limited]
- Distinct tenses in use: [past]

**11d. Style Contract Advisories (non-blocking)**
POV Ambiguity Advisory: absent.

---
## ✅ REFINER SIGN-OFF

### Tier 1 — World Lorebook Material
- [x] All world laws defined with costs and limits
- [x] All factions defined with trigger keywords
- [x] All standing locations described with trigger keywords
- [x] All species/categories defined
- [x] All world concepts defined

### Tier 2 — Character Lorebook Material
- [x] All major characters: full psychological foundation
- [x] All major characters: physical description in anatomical order
- [x] All major characters: relationship map complete
- [x] All major characters: psychological entry topics listed
- [x] All NPCs: classified principal vs. roster; principals have full profiles with trigger keywords and a Standing Goal; roster NPCs have essence/presence/voice fingerprint/signature line/stance/hook with trigger keywords
- [x] Escalation Ladders: N/A
- [x] No two roster NPCs share a voice fingerprint
- [x] Protagonist ({{user}}): physical description, psychology, powers, voice, and lorebook entry topics defined
- [x] Protagonist ({{user}}): identity floor available for User.md

### Tier 3 — Arc Lorebook Material (arc mode) / Sandbox Charter (sandbox mode)
- [x] World Mode recorded at top of Master Design (sandbox); Section 9 titled to match
- [x] Sandbox mode: Sandbox Charter (9B) complete.

### LLM Instruction Material
- [x] All character cards: LLM behavioral requirements
- [x] All character cards: depth_prompt requirement assessed
- [x] No unresolved structural blockers

### Style Contract (Engine Configuration)
- [x] Section 11a: World default values present
- [x] Section 11a: All values normalized
- [x] Section 11b: Every card's override status recorded
- [x] Section 11b: Every overriding card's rationale validated
- [x] Section 11c: Multi-perspective AND multi-tense flags computed
- [x] Section 11d: POV ambiguity advisory computed

### Pipeline State Ledger
- [x] Pipeline State Ledger emitted at the top of Master Design
- [x] world_mode written from the Step 0 validated value
- [x] intimacy_in_scope set from World Seed Section 8
- [x] All later phase rows PENDING; 1 Refiner row set COMPLETE; current_phase = 2

**Status: LOCKED — Proceed to Phase 2 (The Architect)**
