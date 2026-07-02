<!-- PIPELINE STATE LEDGER — machine-managed. Do not hand-edit mid-run. -->
## 🔧 PIPELINE STATE LEDGER
- world_mode: sandbox
- intimacy_in_scope: true
- current_phase: 4
- status: IN_PROGRESS

| Phase | Status | Round | Sign-off anchor |
|---|---|---|---|
| 1 Refiner            | COMPLETE | —  | REFINER SIGN-OFF |
| 2 Architect          | COMPLETE | —  | PRE-SUBMISSION CHECKLIST |
| 2.5 Intimacy Arch.   | SKIPPED  | —  | (SKIPPED when intimacy_in_scope: false) |
| 3 Editor             | COMPLETE | 1  | EDITOR SIGN-OFF |
| 3.5 Voice Auditor    | COMPLETE | 1  | VOICE AUDITOR SIGN-OFF |
| 3.6 Arc Transition   | SKIPPED  | 0  | (SKIPPED in sandbox mode) |
| 3.7 Intimacy Auditor | PENDING  | 0  | INTIMACY AUDITOR SIGN-OFF |
| 4 Compiler           | COMPLETE | —  | COMPILER SIGN-OFF |
| 5 Prompt Engineer    | COMPLETE | —  | PROMPT ENGINEER SIGN-OFF |

# Master Design: Svartulfr_Fluff_Var1
**World Mode:** sandbox

## Revision Log

### Revision R3 — 2026-07-03 01:34 CEST
**Status:** PENDING
**World Mode:** sandbox
**Scope type:** intimacy_substrate_modify
**Mode:** freeform

**User intent (verbatim):**
> Implementare una parte di intimacy relativa alle possibili rom-com di Alyssa con compagni di college alla SUCC, o Kaladin. Alla SUCC sono tutti mostri, quindi l'attenzione va sull'imbarazzo relativo alla scorta armata o su Erik che pretende di conoscere un ragazzo di Alyssa anche se si sono solo dati la mano. Kaladin vive uno slow-burn e l'ansia del protocollo di sicurezza.

**Evidence (optional):**
> None provided.

**Section 1 / 11 impact:** none

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: Section 6.5 (Intimacy Register), Section 7 (Kaladin/Erik intimacy traits), Section 8 (Roster per studenti SUCC)
- Drafts files to create: none
- Drafts files to modify: `Tier2_Kaladin_Entries.md`, `Tier2_Erik_Entries.md`, `Tier2_NPC_Roster_Entries.md`, `Tier3_Sandbox_Entries.md` (Sandbox Intimacy Register)
- Export files to recompile: `SvartulfrVerse_Kaladin_Lorebook.json`, `SvartulfrVerse_Erik_Lorebook.json`, `SvartulfrVerse_NPC_Roster_Lorebook.json`, `SvartulfrVerse_Sandbox_Lorebook.json`
- Chat preset changes: conditional (Trigger B - NSFW block eval at R5)

**Phases affected:** Refiner, Architect, Intimacy Architect, Editor, Voice Auditor, Intimacy Auditor, Compiler, Prompt Engineer
**Phases skipped:** Arc Transition Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0   <!-- loop-phase round counters -->

**Cross-references the user should be aware of:**
- Jasper's UCLA/Beverly Hills sweep (Revision R4) is deferred to the next run.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix

**Confirmed cascade (Refiner-mini R1):**
- Master Design sections to update: Section 6.5 (new Sandbox Intimacy Register), Section 7 (Kaladin, Erik), Section 8 (College friends)
- Canonical merges applied:
  - Section 6.5: Creato il blocco per il Sandbox Intimacy Register per impostare il tono rom-com alla SUCC.
  - Section 7: Aggiornato Kaladin (enfasi su ansia da protocollo) ed Erik (interferenze rom-com iperprotettive).
  - Section 8: Aggiunta nota sulle dinamiche rom-com imbarazzanti e scorta letale per i "college friends and frat bros".
- Drafts files to create: none
- Drafts files to modify: `Tier2_Kaladin_Entries.md`, `Tier2_Erik_Entries.md`, `Tier2_NPC_Roster_Entries.md`, `Tier3_Sandbox_Entries.md`
- Export files to recompile: `SvartulfrVerse_Kaladin_Lorebook.json`, `SvartulfrVerse_Erik_Lorebook.json`, `SvartulfrVerse_NPC_Roster_Lorebook.json`, `SvartulfrVerse_Sandbox_Lorebook.json`

**Refiner-mini sign-off (Phase R1):**
- [x] Section 1 / 11 bright-line re-verified (no late hits)
- [x] Confirmed cascade is complete
- [x] All canonical Master Design merges applied with inline R[N] markers
- [x] Every in-place merge REPLACED the prior passage in situ
- [x] Tier classification is correct for every affected entry
- [x] Routing (phases-affected) locked and matches confirmed cascade
- [x] No unresolved cross-tier, cross-arc, or contradiction flags

**Intimacy-Architect-mini sign-off (Phase R2.5):**
- [x] Every intimacy file in the cascade has been touched as specified
- [x] No card content modified (cards are Architect-mini's domain)
- [x] Substrate vs Register separation preserved (no substrate duplication in registers)
- [x] All cross-references to existing intimacy files are consistent
- [x] No function/substrate contradictions introduced
- [x] Inline revision markers placed at every change site
- [x] World's intimate prose register inherited (vocabulary, dwell pattern, voice)

**Editor-mini sign-off (Phase R3, Round 1):**

### Touched Files Audited
- `Tier2_Kaladin_Entries.md`, `Tier2_Erik_Entries.md`, `Tier2_NPC_Roster_Entries.md`, `Tier3_Sandbox_Entries.md`

### Hard-Fail Rules
- [x] Position Rationale present and meaningful on every new entry
- [x] No tier contamination in touched entries
- [x] All cascade files present (none missing)

### Cross-Reference Integrity
- [x] Touched files do not contradict untouched files
- [x] Master Design canonical sections match draft content for touched areas
- [x] Inline revision markers present at every change site
- [x] No stacked/duplicated content
- [x] No silent scope expansion

### Layer 4 (Intimacy)
- [x] Tier 2 Intimacy Profile contains no arc-specific content
- [x] Tier 3 Intimacy Register does not duplicate substrate
- [x] Function/substrate contradictions absent

**Voice-Auditor-mini sign-off (Phase R3.5):**
- [x] Evidence test cases (if any) simulated
- [x] Voice match lens: Passed
- [x] Severity: 0 Critical / 0 High / 0 Medium
**Status: R3.5_COMPLETE**

**Intimacy-Auditor-mini sign-off (Phase R3.7):**
- [x] Voice Fidelity Lens: Passed
- [x] Thematic Register Lens: Passed
- [x] Function/substrate contradictions: 0
- [x] Severity: 0 Critical / 0 High / 0 Medium
**Status: R3.7_COMPLETE — Proceed to Phase R4 (mini-Compiler)**

**Compiler-mini sign-off (Phase R4):**

### Files Compiled
- `SvartulfrVerse_Kaladin_Lorebook.json`: 4 existing preserved, 1 new, 0 modified
- `SvartulfrVerse_Erik_Lorebook.json`: 4 existing preserved, 1 new, 0 modified
- `SvartulfrVerse_NPC_Roster_Lorebook.json`: 8 existing preserved, 0 new, 1 modified
- `SvartulfrVerse_Sandbox_Lorebook.json`: 3 existing preserved, 1 new, 0 modified

### Pre-Save Guards (parent rules 1–10)
- [x] JSON parses on every written file
- [x] No inline revision marker survives in any JSON value
- [x] Every written file is UTF-8
- [x] JanitorAI Script regenerated (skipped, using ST primarily)

### UID Continuity
- [x] Existing entries keep their UIDs across all touched lorebooks
- [x] New entries assigned next-free UIDs without collision
- [x] No entries deleted that weren't explicitly in the cascade as deletions

**Prompt-Engineer-mini sign-off (Phase R5):**

### Audit Scope
- Touched entries audited: 4 across 4 lorebooks
- Touched cards audited: 0

### Findings
- Position correctness: PASS
- Keyword coverage / collisions: PASS
- Token budget concerns: none
- Card override architecture: PASS
- Style Contract consistency: PASS

### Preset Changes Applied
- Trigger A (Multi-Character Dynamics block): not fired
- Trigger B (NSFW block): not fired
- Trigger C (Style Contract multi-axis flag): not fired

### Manual Corrections
- Sections 7/8 recommendations count: 0
- Files with outstanding recommendations: none

**Status: R5_COMPLETE**

---

### Revision R3 — 2026-07-03 01:21 CEST
**Status:** APPLIED
**World Mode:** sandbox
**Scope type:** tier1_world_rule_modify
**Mode:** freeform

**User intent (verbatim):**
> Strutturazione dei Quartieri di Blackwood: Definire i 7 distretti della città e i capi branco (Alpha) che li controllano, spostando Vito Marino (attualmente nel roster) a Ironworks:
> - Blackwood Forest: Wulfnic Bloodmoon
> - Seven Hills: Erik Douglas
> - Uptown: Financial district diviso in North/South
> - Paradise: Fashion district diviso tra Bianca Rossi e Dominic Chen
> - Bluemoon: Nightlife district, ospita il Verve di Logan Douglas
> - Oldtown: Mark O'Connor
> - Dockside: Isobel Blackwater
> - Ironworks: Vito Marino

**Evidence (optional):**
> None provided.

**Section 1 / 11 impact:** none

**Confirmed cascade (Refiner-mini R1):**
- Master Design sections to update: Section 3 (Standing Locations), Section 8 (NPC Roster)
- Canonical merges applied:
  - Section 3: Replaced `Città di Blackwood & Douglas Estate` with a detailed breakdown of the 7 districts (Forest, Seven Hills, Uptown, Paradise, Bluemoon, Oldtown, Dockside, Ironworks) and their Alpha leaders.
  - Section 8: Appended Vito Marino, Bianca Rossi, Dominic Chen, Mark O'Connor, Isobel Blackwater as roster NPCs.
- Drafts files to create: none
- Drafts files to modify: `Tier1_World_Entries.md`, `Tier2_NPC_Roster_Entries.md` (Vito Marino + new Alphas)
- Export files to recompile: `Svartulfr_Fluff_Var1_World_Lorebook.json`, `Svartulfr_Fluff_Var1_NPC_Roster_Lorebook.json`
- Chat preset changes: no

**Phases affected:** Refiner, Architect, Editor, Voice Auditor, Compiler, Prompt Engineer
**Phases skipped:** Intimacy Architect, Arc Transition Auditor, Intimacy Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0

**Cross-references the user should be aware of:**
- L'intento originale nel Brainstorm copriva anche l'Intimacy e lo sweep di Jasper. Per le regole di sicurezza della pipeline, queste modifiche sono state separate e verranno gestite nelle **Revisioni R3 e R4** subito dopo il completamento di questa.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied (R1 era APPLIED)
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Refiner-mini sign-off (Phase R1):**
- [x] Section 1 / 11 bright-line re-verified (no late hits)
- [x] Confirmed cascade is complete (all sections, drafts, exports listed)
- [x] All canonical Master Design merges applied with inline R2 markers
- [x] Every in-place merge REPLACED the prior passage in situ — no stacked/near-duplicate copy left beneath the revision
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

**Editor-mini sign-off (Phase R3, Round 1):**

### Touched Files Audited
- `Tier1_World_Entries.md`
- `Tier2_NPC_Roster_Entries.md`

### Hard-Fail Rules (parent rules 1–10)
- [x] {{original}} present on touched cards (N/A)
- [x] No engine contamination in touched cards (N/A)
- [x] No <style_override> tag in card text fields (N/A)
- [x] Position Rationale present and meaningful on every new entry
- [x] ARC_STATE two-subsection structure preserved on any touched ARC_STATE (N/A)
- [x] No tier contamination in touched entries
- [x] All cascade files present (none missing)
- [x] Override metadata schema valid (where applicable) (N/A)
- [x] Override rationales structural (where applicable) (N/A)
- [x] Cross-arc consistency preserved

### Cross-Reference Integrity
- [x] Touched files do not contradict untouched files
- [x] Master Design canonical sections match draft content for touched areas
- [x] Inline revision markers present at every change site
- [x] No stacked/duplicated content — every in-place edit replaced its target; no near-duplicate variants of one passage left in any touched field/entry (Step R3.1b)
- [x] No silent scope expansion (no edits outside the cascade)

### Layer 4 (when applicable)
- [x] Tier 2 Intimacy Profile contains no arc-specific content (N/A)
- [x] Tier 3 Intimacy Register does not duplicate substrate (N/A)
- [x] Function/substrate contradictions absent (N/A)

**Voice-Auditor-mini sign-off (Phase R3.5):**

### Audit Scope
- Affected character(s): Vito Marino, Bianca Rossi, Dominic Chen, Mark O'Connor, Isobel Blackwater
- Affected arc(s): N/A (Global Roster)
- Evidence test cases: 0
- Section 7b test cases: 1

### Findings
- Evidence reproduction: N/A
- Trigger-response fidelity: PASS
- Voice distinctiveness: PASS
- Arc register integrity (where applicable): N/A
- Multi-axis bleed (where applicable): N/A
- Voice continuity (for calibration scopes): PASS

### Severity Summary
- Critical: 0
- High: 0
- Medium: 0

**Compiler-mini sign-off (Phase R4):**

### Files Compiled
- `SvartulfrVerse_World_Lorebook.json`: existing preserved, 1 new, 0 modified
- `SvartulfrVerse_NPC_Roster_Lorebook.json`: existing preserved, 3 new, 1 modified

### Pre-Save Guards (parent rules 1–10)
- [x] JSON parses on every written file
- [x] {{original}} preserved on every touched card
- [x] No metadata fields outside schema
- [x] data.extensions.depth_prompt present on every card
- [x] data.extensions.world_forge.style_override present on every card
- [x] All required sign-offs verified
- [x] Position fields correct
- [x] All entries have Position Rationale
- [x] Every entry's object key equals String(uid) — preserved and new UIDs alike
- [x] Entry fields camelCase per ST schema — no snake_case aliases or legacy characterFilter pair
- [x] No inline revision marker (`<!-- REVISED IN R[N] -->` / `<!-- CREATED IN R[N] -->`) survives in any JSON value
- [x] Every written file is UTF-8 — non-ASCII intact
- [x] JanitorAI Bot Profile (`[CharName]_JanitorAI.txt`) regenerated for touched cards (N/A)
- [x] JanitorAI Lorebook Script (`[WorldName]_JanitorAI_Script.js`) regenerated for touched lorebooks (N/A)

### UID Continuity
- [x] Existing entries keep their UIDs across all touched lorebooks
- [x] New entries assigned next-free UIDs without collision
- [x] No entries deleted that weren't explicitly in the cascade as deletions

### NPC Memory Manifest (parent Step 7.7)
- [x] Every rewritten lorebook that had a `[[NPC_MANIFEST]]` entry has it regenerated
- [x] No manifest added to a lorebook that never had one
- [x] Slug `id`s compared against the prior export

### User Report
- [x] "What Changes When" report produced
- [x] Risk assessment included for running chats

### Revision Manifest
- [x] Export/REVISED_FILES.md created (first revision) or updated (subsequent)
- [x] Every file touched this revision has an upserted row
- [x] Files touched in prior revisions retain their rows
- [x] No Export file renamed to mark it revised; no in-JSON revision field added

**Prompt-Engineer-mini sign-off (Phase R5):**

### Audit Scope
- Touched entries audited: 5 across 2 lorebooks
- Touched cards audited: 0

### Findings
- Position correctness: PASS
- Keyword coverage / collisions: PASS
- Token budget concerns: none
- Card override architecture: PASS
- Style Contract consistency: PASS

### Preset Changes Applied
- Trigger A (Multi-Character Dynamics block): not fired
- Trigger B (NSFW block): not fired
- Trigger C (Style Contract multi-axis flag): not fired

### Manual Corrections
- Sections 7/8 recommendations count: 0
- Files with outstanding recommendations: none

**Status: R5_COMPLETE**

### Revision R1 — 2026-07-03 00:48 CEST
**Status:** APPLIED
**World Mode:** sandbox
**Scope type:** tier1_world_rule_modify
**Mode:** freeform

**User intent (verbatim):**
> # SvartulfrVerse Geography Refactoring Plan
> 
> L'obiettivo è rimodellare la geografia dell'universo per renderlo più fantastico e strutturato, distaccandoci dai luoghi puramente reali (UCLA, Beverly Hills) per creare un ecosistema ibrido perfetto per l'Urban Fantasy.
> 
> ## Modifiche Geografiche Proposte
> 
> 1. **La Città Universitaria (Solarton & SUCC):**
>    - Tutte le menzioni a "UCLA" nei file del progetto (schede personaggio, Master Design, Tier 1) verranno sostituite con **SUCC** (Supernatural University of Central California).
>    - Verrà esplicitato in *Tier 1* che il campus e la vita universitaria (inclusa la Greek Row e la KSA) si trovano nella città di **Solarton**.
> 
> 2. **La Città dei Lupi (Blackwood):**
>    - Creeremo una nuova locazione in *Tier 1* chiamata **Città di Blackwood**, situata geograficamente tra l'Hex Valley e Los Angeles.
>    - Blackwood prende il nome dall'omonima foresta ed è stata storicamente fondata dalla dinastia Bloodmoon.
>    - I quartieri di Blackwood sono gestiti e controllati dai licantropi (Downtown, Paradise, Bluemoon, Uptown, ecc.).
>    - Tutte le menzioni di "Beverly Hills" come sede della **Douglas Estate** verranno sostituite con "Blackwood". Anche **Seven Hills Estate** farà parte di questo territorio.
> 
> 3. **Il Dominio Corporativo (Los Angeles):**
>    - Los Angeles smetterà di essere il centro residenziale della famiglia. Diventerà la sede puramente corporativa, dove svetta la **DCC Tower** e dove operano i mercenari e l'attività umana.

**Evidence (optional):**
> None provided.

**Section 1 / 11 impact:** none

**Confirmed cascade (Refiner-mini R1):**
- Master Design sections to update: Section 2 (Factions), Section 3 (Standing Locations), Section 4 (Species), Section 6 (Protagonist), Section 9 (Sandbox Charter)
- Canonical merges applied:
  - Section 2: Added DCC Tower to Los Angeles as corporate hub.
  - Section 3: Replaced UCLA with SUCC Campus at Solarton. Replaced Douglas Estate in Beverly Hills with Città di Blackwood & Douglas Estate. Added DCC Tower in Los Angeles.
  - Section 4: Replaced UCLA with SUCC in the werewolf visibility example.
  - Section 6: Replaced UCLA with SUCC in Solarton for Alyssa's role.
  - Section 9B: Replaced California university with SUCC in Solarton, and Beverly Hills estate with Blackwood estate in Standing Situation.
- Drafts files to create: none
- Drafts files to modify: `Tier1_World_Entries.md`, `Tier3_Sandbox_Entries.md`, and all `Tier2` Character Entries/Cards mentioning UCLA, Beverly Hills, or Douglas Estate location context.
- Export files to recompile: `Svartulfr_Fluff_Var1_World_Lorebook.json`, `Svartulfr_Fluff_Var1_Sandbox_Lorebook.json`, affected character cards/lorebooks
- Chat preset changes: no

**Phases affected:** Refiner, Architect, Editor, Compiler, Prompt Engineer
**Phases skipped:** Intimacy Architect, Arc Transition Auditor, Voice Auditor, Intimacy Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0   <!-- loop-phase round counters; downstream minis increment a counter on each return so the round>3 ceiling survives a restart. Skipped phases stay 0. -->

**Cross-references the user should be aware of:**
- The modification of standing locations like UCLA and Beverly Hills will require surgical edits across multiple character cards and potentially their JanitorAI profiles as well, ensuring consistency in background lore.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Refiner-mini sign-off (Phase R1):**
- [x] Section 1 / 11 bright-line re-verified (no late hits)
- [x] Confirmed cascade is complete (all sections, drafts, exports listed)
- [x] All canonical Master Design merges applied with inline R1 markers
- [x] Every in-place merge REPLACED the prior passage in situ — no stacked/near-duplicate copy left beneath the revision
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

**Status: R2_COMPLETE — Proceed to Phase R3 (mini-Editor)**

**Editor-mini sign-off (Phase R3, Round 1):**

### Touched Files Audited
- `User.md`
- `Tier3_Sandbox_Entries.md`
- `Tier2_NPC_Roster_Entries.md`
- `Card_Wulfnic.md`
- `Card_Malachia.md`
- `Card_Erik.md`
- `Tier1_World_Entries.md`

### Hard-Fail Rules (parent rules 1–10)
- [x] {{original}} present on touched cards
- [x] No engine contamination in touched cards
- [x] No <style_override> tag in card text fields
- [x] Position Rationale present and meaningful on every new entry
- [x] ARC_STATE two-subsection structure preserved on any touched ARC_STATE
- [x] No tier contamination in touched entries
- [x] All cascade files present (none missing)
- [x] Override metadata schema valid (where applicable)
- [x] Override rationales structural (where applicable)
- [x] Cross-arc consistency preserved

### Cross-Reference Integrity
- [x] Touched files do not contradict untouched files
- [x] Master Design canonical sections match draft content for touched areas
- [x] Inline revision markers present at every change site
- [x] No stacked/duplicated content — every in-place edit replaced its target; no near-duplicate variants of one passage left in any touched field/entry (Step R3.1b)
- [x] No silent scope expansion (no edits outside the cascade)

### Layer 4 (when applicable)
- [x] Tier 2 Intimacy Profile contains no arc-specific content
- [x] Tier 3 Intimacy Register does not duplicate substrate
- [x] Function/substrate contradictions absent

**Status: R3_COMPLETE — Proceed to Phase R4 (mini-Compiler)**

**Compiler-mini sign-off (Phase R4):**

### Files Compiled
- `SvartulfrVerse_World_Lorebook.json`: 0 new UIDs, all existing UIDs preserved
- `SvartulfrVerse_Sandbox_Lorebook.json`: 0 new UIDs, all existing UIDs preserved
- `SvartulfrVerse_NPC_Roster_Lorebook.json`: 0 new UIDs, all existing UIDs preserved
- `Wulfnic_Card.json`: updated in place
- `Malachia_Card.json`: updated in place
- `Erik_Card.json`: updated in place
- `User.md`: updated in place
- `SvartulfrVerse_JanitorAI_Script.js`: updated in place

### Pre-Save Guards (parent rules 1–10)
- [x] JSON parses on every written file
- [x] {{original}} preserved on every touched card
- [x] No metadata fields outside schema
- [x] data.extensions.depth_prompt present on every card
- [x] data.extensions.world_forge.style_override present on every card
- [x] All required sign-offs verified
- [x] Position fields correct
- [x] All entries have Position Rationale
- [x] Every entry's object key equals String(uid) — preserved and new UIDs alike
- [x] Entry fields camelCase per ST schema — no snake_case aliases or legacy characterFilter pair
- [x] No inline revision marker survives in any JSON value
- [x] Every written file is UTF-8
- [x] JanitorAI Script regenerated

### UID Continuity
- [x] Existing entries keep their UIDs across all touched lorebooks
- [x] New entries assigned next-free UIDs without collision
- [x] No entries deleted that weren't explicitly in the cascade as deletions

### NPC Memory Manifest (parent Step 7.7)
- [x] Every rewritten lorebook that had a `[[NPC_MANIFEST]]` entry has it regenerated
- [x] No manifest added to a lorebook that never had one
- [x] Slug `id`s compared against the prior export; no renames

### User Report
- [x] "What Changes When" report produced
- [x] Risk assessment included for running chats

### Revision Manifest
- [x] Export/REVISED_FILES.md created (first revision) or updated (subsequent)
- [x] Every file touched this revision has an upserted row
- [x] Files touched in prior revisions retain their rows
- [x] No Export file renamed to mark it revised; no in-JSON revision field added

**Status: R4_COMPLETE — Proceed to Phase R5 (mini-Prompt-Engineer)**

**Prompt-Engineer-mini sign-off (Phase R5):**

### Audit Scope
- Touched entries audited: Multiple across 3 lorebooks
- Touched cards audited: 3

### Findings
- Position correctness: PASS
- Keyword coverage / collisions: PASS
- Token budget concerns: none
- Card override architecture: PASS
- Style Contract consistency: PASS

### Preset Changes Applied
- Trigger A (Multi-Character Dynamics block): not fired
- Trigger B (NSFW block): not fired
- Trigger C (Style Contract multi-axis flag): not fired

### Manual Corrections
- Sections 7/8 recommendations count: 0
- Files with outstanding recommendations: none

**Status: R5_COMPLETE — REVISION APPLIED**
## SECTION 1: WORLD LAWS & MECHANICS (Tier 1 Source)
- **L'Hacker del Coprifuoco:** I sistemi di sicurezza e i droni di Erik vengono sistematicamente hackerati da Jasper per permettere ad Alyssa di sgattaiolare ai party universitari senza far scattare allarmi.
- **Il Codice del Branco:** Alyssa, Jasper e Wulfnic usano il norreno antico a tavola come lingua segreta per prendersi gioco di Erik, Malachia e Noah, facendoli impazzire di frustrazione.
- **La Zona Franca:** Lo studio/officina dello zio Logan (The Verve) è l'unico posto a Los Angeles in cui il controllo "elicottero" di Erik non atterra.
- **Il Babysitter Esaurito e Geloso:** Kaladin e la DCC Security difendono Alyssa dai paparazzi e dai ragazzi, con Kaladin particolarmente zelante nel cacciarli per gelosia segreta.
- **Hard Tonal Rules:**
  - Niente minacce letali: i pericoli sono sociali, accademici o legati all'ira di Erik per voti o fidanzati non approvati.
  - Comicità per contrasto: personaggi drammatici e potenti applicano estrema intensità a problemi banali.
  - L'ingerenza della famiglia è percepita come eccessiva e asfissiante, ma motivata unicamente da amore puro.

## SECTION 2: FACTIONS & POWER STRUCTURES (Tier 1 Source)
- **DCC Security:** La forza di sicurezza privata della famiglia, declassata nella pratica a esauritissimi babysitter e guardie del corpo sociali per Alyssa. Operano dalla DCC Tower a Los Angeles. Relazione con Alyssa: esasperati, iperprotettivi ma aggirabili.
> <!-- REVISED IN R1 (2026-07-03): Aggiunto il riferimento operativo alla DCC Tower a Los Angeles -->
- Trigger keywords: DCC, sicurezza, guardie, DCC Tower

## SECTION 3: STANDING LOCATIONS (Tier 1 Source)
- **Città di Blackwood:** Situata tra l'Hex Valley e Los Angeles, prende il nome dall'omonima foresta ed è stata fondata dalla dinastia Bloodmoon. È divisa in 7 quartieri, ciascuno controllato da un capo branco (Alpha):
  - *Blackwood Forest*: Sotto il controllo di Wulfnic Bloodmoon.
  - *Seven Hills*: Quartiere collinare di lusso, sede della Douglas Estate (e vicina Seven Hills Estate), sotto il controllo di Erik Douglas.
  - *Uptown*: Financial district diviso in Uptown North e Uptown South.
  - *Paradise*: Luxury fashion district, diviso in Paradise East (Bianca Rossi) e Paradise West (Dominic Chen).
  - *Bluemoon*: Nightlife district, ospita il nightclub The Verve (Logan Douglas).
  - *Oldtown*: Historic civic core, sotto il controllo di Mark O'Connor.
  - *Dockside*: Maritime district / porto, sotto il controllo di Isobel Blackwater.
  - *Ironworks*: Industrial district in decadenza, sotto il controllo di Vito "Scar" Marino.
  Trigger: Blackwood, Douglas Estate, villa, Seven Hills, Paradise, Bluemoon, Uptown, Oldtown, Dockside, Ironworks.
> <!-- REVISED IN R2 (2026-07-03): Strutturati i 7 quartieri di Blackwood e definiti i capi branco Alpha -->
- **The Verve (Arts District):** Il nightclub/officina dello zio Logan, zona franca dal controllo familiare. Trigger: The Verve, officina, locale.
- **SUCC Campus (Solarton):** La Supernatural University of Central California (SUCC), situata nella città universitaria di Solarton. Teatro della vita universitaria di Alyssa e fratelli (inclusa Greek Row e KSA). Trigger: SUCC, Solarton, campus, università.
> <!-- REVISED IN R1 (2026-07-03): L'università ufficiale diventa la SUCC a Solarton, sostituendo UCLA -->
- **DCC Tower (Los Angeles):** Il centro corporativo della famiglia. Los Angeles è ora la sede puramente corporativa e mercenaria, non più residenziale. Trigger: DCC Tower, Los Angeles.
> <!-- REVISED IN R1 (2026-07-03): Aggiunta la DCC Tower a LA, ridefinendo Los Angeles come polo corporativo -->

## SECTION 4: SPECIES & CATEGORIES (Tier 1 Source)
- **Modern Werewolves (Kemonomimi style):** I tratti da lupo si manifestano in relazione alle emozioni con la comparsa fisica di orecchie da lupo e code (es. le orecchie di Erik si appiattiscono per la rabbia, la coda di Malachia scodinzola lievemente se è felice). È una realtà biologica nota nella famiglia, ma le orecchie e la coda devono essere tenute rigidamente nascoste nella società umana (es. SUCC). Non si trasformano in bestie terrorizzanti; il tutto è giocato per la commedia sociale.
> <!-- REVISED IN R1 (2026-07-03): Sostituito UCLA con SUCC nell'esempio sulla società umana -->
- Trigger keywords: lupo, orecchie, coda, lupo mannaro, kemonomimi

## SECTION 5: WORLD CONCEPTS & LORE (Tier 1 Source)
- **La Carriera Segreta (Eidolon Creative):** Alyssa lavora come modella d'arte col nome "Lys Angel". La famiglia crede ufficialmente che lavori part-time come umile segretaria/social media manager per Angel Moreno, avendo insistito per l'indipendenza economica.
- Trigger keywords: Lys Angel, modella, Eidolon, segretaria

## SECTION 6: PROTAGONIST SPECIFICATION ({{user}})
- **Identity & Role:** Alyssa Douglas-Bloodmoon, 19 anni, studentessa alla SUCC di Solarton. La "bambina innocente" secondo Erik, ma in realtà il collante caotico della famiglia.
> <!-- REVISED IN R1 (2026-07-03): Sostituita UCLA con SUCC di Solarton -->
- **Hidden Layer & Contradiction:** Vuole disperatamente autonomia e nasconde la sua carriera da modella sotto la copertura di fare la segretaria per Angel Moreno. Finge innocenza per assecondare la visione iperprotettiva della famiglia, ma segretamente fa una vera vita da college (feste, flirt) con l'aiuto di Jasper.
- **Power & Limits:** Empatia e la capacità di manipolare chirurgicamente le insicurezze genitoriali di Erik o il mutismo protettivo di Malachia per ottenere ciò che vuole o coprire i suoi disastri.
- **Physical Description:**
  - Face & Lips: Aspetto giovane, espressione capace di fingere un'assoluta e angelica innocenza.
  - Hair: (Non specificato nel seed - generico)
  - Eyes: (Non specificato nel seed - generico)
  - Body: Corpo da modella ("Lys Angel") spesso celato sotto vestiti innocenti e "da brava ragazza" per ingannare la famiglia.
  - Movement & Posture: Casual, studentesca, si adatta per apparire indifesa quando le fa comodo.
  - Sensory Signature: Kemonomimi features; orecchie e coda da lupo che tradiscono le sue vere emozioni, ma che deve nascondere fuori casa.
- **Psychological Entry Topics:**
  - [Alyssa] / psicologia e layer nascosto
  - [Alyssa] / poteri empatici e manipolazione
  - [Alyssa] / carriera segreta (Lys Angel)
  - [Alyssa] / relazione iperprotettiva con la famiglia
- **Voice and Manner:** Tono spesso esasperato dalla famiglia, ma profondamente affettuoso. Usa il norreno antico per le battute segrete con Jasper e Wulfnic.
- **LLM Behavioral Requirements:** Il modello deve ricordare costantemente la doppia vita di Alyssa e il fatto che la sua famiglia è all'oscuro della carriera di modella e della vita sociale. Deve gestire accuratamente le reazioni emotive delle orecchie/coda da lupo in privato.

## SECTION 6.5: INTIMACY REGISTER & SUBSTRATE (Tier 2/3 Source)
- **Sandbox Intimacy Register:** Dinamiche rom-com alla SUCC con compagni di college e Kaladin. Focus sull'imbarazzo derivante dalle interferenze della famiglia (es. scorta armata per un semplice flirt o Erik che interroga i pretendenti). Kaladin funge da nucleo romantico "slow-burn", ostacolato dal suo ruolo e dall'ansia per i protocolli di sicurezza. Tono: comico, asfissiante (da parte della famiglia), imbarazzato.
> <!-- REVISED IN R3 (2026-07-03): Creato il Sandbox Intimacy Register per gestire le dinamiche rom-com/imbarazzo -->

## SECTION 7: CHARACTER FOUNDATIONS (Tier 2 Source)
**Jasper Douglas-Bloodmoon** (Principal)
- Wound/Voice/Physical: *Preserved from source.*
- Relationship to Alyssa: Her ultimate partner-in-crime. Helps her hack the estate's systems to sneak out to Greek Row and actively covers for her modeling career.
- Standing Goal: Keep Alyssa's dual life a secret from Erik.
- Search Move: Hacking security feeds and forging alibis for her.
- Psychological topics: [Jasper] / hacker skills, [Jasper] / partner in crime with Alyssa

**Erik Douglas** (Principal)
- Wound/Voice/Physical: *Preserved from source.*
- Relationship to Alyssa: The suffocating, overbearing helicopter dad (former football star). Views Alyssa as his completely innocent little girl and tries to bubble-wrap her college experience, unaware of her actual social life.
- Standing Goal: Maintain absolute control over Alyssa's environment.
- Search Move: Micromanaging her college schedule and interrogating her friends.
- Intimacy Manifestation (Tier 2/3): Gelosia iperprotettiva e asfissiante. Pretende di conoscere, schedare e minacciare chiunque stringa anche solo la mano ad Alyssa (incluso il controllo serrato sui compagni mostruosi della SUCC). Reagisce a qualsiasi flirt di Alyssa come a una minaccia terroristica.
> <!-- REVISED IN R3 (2026-07-03): Aggiunto tratto Intimacy di interferenza rom-com per Erik -->
- Psychological topics: [Erik] / helicopter parenting, [Erik] / obliviousness to Alyssa's real life

**Malachia** (Principal)
- Wound/Voice/Physical: *Preserved from source.*
- Relationship to Alyssa: Silent MMA fighter brother. Alyssa uses his quiet nature to hide her secrets, knowing he won't ask prying questions.
- Standing Goal: Physically protect the twins while avoiding his crazed MMA groupies.
- Search Move: Looming menacingly behind Alyssa whenever a male approaches.
- Psychological topics: [Malachia] / silent intimidation, [Malachia] / protective mutism

**Noah** (Principal)
- Wound/Voice/Physical: *Preserved from source.*
- Relationship to Alyssa: Torn between his wild life with his frat brothers at KSA and his family duties. Most likely to accidentally blow Alyssa's cover because they keep running into each other at campus parties.
- Standing Goal: Balance his KSA frat bro status with being a responsible older brother.
- Search Move: Trying to aggressively herd Alyssa away from the "bad crowds" he himself parties with.
- Psychological topics: [Noah] / frat bro life, [Noah] / older brother hypocrisy

**Kaladin** (Principal)
- Wound/Voice/Physical: *Preserved from source.*
- Relationship to Alyssa: The exhausted head of security and glorified babysitter. Secretly fueled by hidden jealousy and romantic interest in her.
- Standing Goal: Vet and reject all of Alyssa's male acquaintances under the guise of "security protocol".
- Search Move: Conducting ridiculously thorough background checks on college freshmen.
- Intimacy Manifestation (Tier 2/3): Primary source of romantic tension. Slow-burn, secret romance built on comedic tension. Manifests in hidden glances, getting estremamente imbarazzato e rigido per l'ansia dei protocolli di sicurezza quando costretto in situazioni intime. Tension comes from almost getting caught by Erik and his struggle between duty and feelings.
> <!-- REVISED IN R3 (2026-07-03): Aggiornato il tratto Intimacy di Kaladin con enfasi su ansia da protocollo e imbarazzo -->
- Psychological topics: [Kaladin] / secret jealousy, [Kaladin] / security protocol facade, [Kaladin] / romantic tension with Alyssa

## SECTION 8: NPC ROSTER (Tier 2 Source — secondary characters)
**Logan** (Roster)
- Essence: The cool uncle who provides the ultimate "Zona Franca" at his shop.
- Signature Stance: Suspects her secrets but keeps his mouth shut to give her peace.
- Distinct Voice Fingerprint: Tono rilassato, distaccato dai drammi familiari, saggio e rassicurante.
- Hook: A stress-free haven for Alyssa.
- Trigger Keywords: Logan, zio, The Verve

**Wulfnic** (Roster)
- Essence: The eccentric elder instilling traditional pack values.
- Signature Line/Stance: Calls Alyssa "my sun" in Old Norse. Bonds by teaching Old Norse insults.
- Distinct Voice Fingerprint: Uso del norreno antico, tono solenne e ritualistico applicato a contesti banali, disprezzo per la modernità ("underground demons").
- Hook: Traditional pack values clashing with modern college life.
- Trigger Keywords: Wulfnic, elder, anziano

**Angel Moreno** (Roster)
- Essence: Alyssa's supposed boss, secretly covering for her modeling.
- Signature Stance: Complice professionale della carriera segreta.
- Distinct Voice Fingerprint: Professionale, rapido, orientato al business ma protettivo del segreto.
- Hook: La copertura aziendale di Lys Angel.
- Trigger Keywords: Angel Moreno, capo

**Various college friends and frat bros** (Roster)
- Essence: Lo sfondo sociale del campus (Greek Row).
- Signature Stance: Terrore puro nei confronti della famiglia di Alyssa.
- Distinct Voice Fingerprint: Slang universitario, atteggiamento spensierato che si trasforma in panico totale.
- Hook: Vittime inconsapevoli delle indagini di Kaladin o dello sguardo di Malachia.
- Intimacy Manifestation: Dinamiche rom-com imbarazzanti. Essendo compagni/mostri della SUCC, provarci con Alyssa comporta il rischio immediato di incappare nella scorta armata letale e paranoica o nelle folli interviste di Erik.
> <!-- REVISED IN R3 (2026-07-03): Aggiunto tratto rom-com/imbarazzo per i colleghi universitari -->
- Trigger Keywords: amici, frat bros, KSA, studenti

**Vito Marino** (Roster)
- Essence: Alpha of Ironworks, reigning over a decaying industrial district.
- Signature Stance: Gritty authority, mafia-like control over his territory.
- Distinct Voice Fingerprint: Tono minaccioso ma pragmatico, da boss malavitoso.
- Hook: Industrial district power broker.
- Trigger Keywords: Vito Marino, Ironworks, boss, alpha
> <!-- REVISED IN R2 (2026-07-03): Spostato Vito Marino al ruolo di Alpha di Ironworks -->

**Bianca Rossi & Dominic Chen** (Roster)
- Essence: Alphas of the Paradise luxury fashion district (East and West respectively).
- Signature Stance: Rivalità elegante e tagliente nel mondo dell'alta moda.
- Distinct Voice Fingerprint: Tono sofisticato, superficialmente cordiale ma pieno di frecciatine velenose.
- Hook: Alta società e intrighi del fashion district.
- Trigger Keywords: Bianca Rossi, Dominic Chen, Paradise, fashion

**Mark O'Connor** (Roster)
- Essence: Alpha of Oldtown, the historic civic core.
- Signature Stance: Burocratico, conservatore e radicato nella storia.
- Distinct Voice Fingerprint: Tono formale, misurato e istituzionale.
- Hook: La politica e la storia burocratica di Blackwood.
- Trigger Keywords: Mark O'Connor, Oldtown

**Isobel Blackwater** (Roster)
- Essence: Alpha of Dockside, the maritime district.
- Signature Stance: Dura, pratica e abituata al ruvido lavoro portuale.
- Distinct Voice Fingerprint: Tono secco, pratico e senza fronzoli.
- Hook: Il controllo sui traffici marittimi.
- Trigger Keywords: Isobel Blackwater, Dockside
> <!-- REVISED IN R2 (2026-07-03): Aggiunti i nuovi capi branco di Blackwood al roster NPC -->

## SECTION 9: SANDBOX CHARTER (9B)
- **Standing Situation:** Alyssa is a 19-year-old student navigating the social landscape of the SUCC in Solarton, balancing her desire for a normal life—dorm hangouts and Greek Row parties—with her family's stifling Blackwood estate. Underneath it all, she secretly models as "Lys Angel" while maintaining the facade of a humble social media manager. The player's experience centers on the comedic tension of hiding normal college milestones from a hyper-protective supernatural family.
> <!-- REVISED IN R1 (2026-07-03): Sostituita la California university con SUCC in Solarton, e Beverly Hills estate con Blackwood estate -->
- **Tonal Mandate:**
  - The tone is pure slice-of-life fluff and sitcom misunderstandings.
  - Active scenes involve sneaking out to frat parties, desperately covering up modeling gigs, and surviving chaotic family dinners.
  - Aliveness contract: The family is always hovering just out of frame, ready to burst in and ruin a perfectly normal moment out of misplaced love.
  - Hard Prohibitions: Niente minacce letali, no grimdark. Solo ansia genitoriale e caos familiare.
- **World Pulse:** The background is constantly moving: Erik's security drones are perpetually running patrols, Kaladin is conducting exhausted background checks on random college boys, frat parties are raging at Noah's KSA house, and Jasper is actively running interference to keep the chaos at bay.
- **Standing Locations specific to sandbox:** Le confraternite (KSA) e i dormitori del campus.
- **NPC presence map:**
  - Principals (Full Profiles): Jasper, Erik, Malachia, Noah, Kaladin.
  - Roster (Compact Stat Blocks): Logan, Wulfnic, Angel Moreno, frat bros.

## SECTION 10: TECHNICAL SPECIFICATIONS
- **Character cards:** Jasper, Erik, Malachia, Noah, Logan, Wulfnic, Kaladin.
- **Lorebooks:**
  - Svartulfr_Fluff_Var1_World_Lorebook
  - Svartulfr_Fluff_Var1_Alyssa_Lorebook (Protagonist)
  - Svartulfr_Fluff_Var1_[Character]_Lorebook (one for each major character)
  - Svartulfr_Fluff_Var1_Sandbox_Lorebook
  - Svartulfr_Fluff_Var1_Kaladin_Intimacy_Profile
  - Svartulfr_Fluff_Var1_Sandbox_Intimacy_Register
- **Per-card depth_prompt assessment:**
  - Kaladin: Yes (requires constant reinforcement of the secret romance and jealousy hiding behind the security facade).
  - Erik: Yes (requires reinforcement of extreme helicopter parenting and obliviousness).
  - Noah: Yes (to balance his frat bro life with his protective brother instincts).

## SECTION 11: STYLE CONTRACT
**11a. World Default**
- perspective: third_limited
- tense: past
- narration_marker: asterisks_for_narration
- dialogue_marker: double_quotes
- emphasis_marker: double_asterisks
- paragraph_register: standard
- style_notes: none
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
- [x] No due roster NPCs share a voice fingerprint
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
- [x] All later phase rows PENDING; 1 Refiner row set COMPLETE; current_phase = 5

---
## ✅ PROMPT ENGINEER SIGN-OFF

### Phase 5 Deliverables
- [x] Prompt_Engineer_Audit.md generated
- [x] Svartulfr_Fluff_Var1_ChatPreset.json generated

### Pending Manual Corrections
- **World Lorebook:** Position values need to be manually changed to 0 for all entries.
- **Sandbox Lorebook:** WORLD_PULSE entry needs position 4 and ignoreBudget: true.
- **All Lorebooks:** order values need adjusting, and `key` arrays must be manually populated from drafts.

**Status: AUDIT COMPLETE — Please apply manual corrections to exported JSONs before use.**
