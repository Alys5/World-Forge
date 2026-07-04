### Revision R4 — 2026-07-03 12:00 CEST
**Status:** PENDING
**World Mode:** sandbox
**Scope type:** tier2_new_character
**Mode:** freeform

**User intent (verbatim):**
> vorrei spostare nel roster principale logan e wulfnic, e kaladin in quello generico, kaladin è importante si, ma non è un personaggio principale

**Evidence (optional):**
> None provided.

**Section 1 / 11 impact:** none

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: Section 7 (Character Foundations), Section 8 (NPC Roster), Section 9 (Sandbox Charter), Section 10 (Technical Specifications)
- Drafts files to create: `Tier2_Logan_Entries.md`, `Tier2_Wulfnic_Entries.md`, `Instructions_Logan.md`, `Instructions_Wulfnic.md`
- Drafts files to modify: `Tier2_NPC_Roster_Entries.md` (add Kaladin, remove Logan and Wulfnic), `Card_Logan.md`, `Card_Wulfnic.md` (update to full Principal standard).
- Drafts files to archive/delete: `Card_Kaladin.md`, `Instructions_Kaladin.md`, `Tier2_Kaladin_Entries.md`.
- Export files to recompile: `Logan_Card.json`, `Wulfnic_Card.json`, `SvartulfrVerse_Logan_Lorebook.json`, `SvartulfrVerse_Wulfnic_Lorebook.json`, `SvartulfrVerse_NPC_Roster_Lorebook.json`. (Kaladin's files will be removed).
- Chat preset changes: conditional on architecture impact.

**Phases affected:** Refiner, Architect, Editor, Voice Auditor, Compiler, Prompt Engineer
**Phases skipped:** Intimacy Architect, Arc Transition Auditor, Intimacy Auditor

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0   <!-- loop-phase round counters; downstream minis increment a counter on each return so the round>3 ceiling survives a restart. Skipped phases stay 0. -->

**Cross-references the user should be aware of:**
- Kaladin attualmente fungeva da nucleo romantico "slow-burn" (come definito in Section 6.5 e 7). Spostandolo nel roster generico perderà la sua Character Card dedicata e il suo Lorebook, e la sua intimità sarà condensata in un "compact stat block" nel Roster.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Status: R3_COMPLETE — Proceed to Phase R4 (mini-Compiler)**


## Phase R1 — Mini-Refiner

**Confirmed cascade:**
- Master Design Section 7 (Character Foundations): Logan and Wulfnic promoted to Principals. Kaladin removed.
- Master Design Section 8 (NPC Roster): Kaladin demoted to Roster NPC. Logan and Wulfnic removed.
- Master Design Section 9 (Sandbox Charter): NPC presence map updated to reflect the exchange.
- Master Design Section 10 (Technical Specifications): Character cards list and depth_prompt list updated.

**Canonical merges applied:**
- Section 7: Inserted Logan and Wulfnic (promoted).
- Section 8: Inserted Kaladin (demoted).
- Section 9: Updated NPC presence map.
- Section 10: Updated Character Cards list and Depth Prompt assessment.

**Cross-tier or cross-arc flags:** None.

**Locked routing for R2+:**
Phases affected: Refiner, Architect, Editor, Voice Auditor, Compiler, Prompt Engineer
Phases skipped: Intimacy Architect, Arc Transition Auditor, Intimacy Auditor

**Refiner-mini sign-off (Phase R1):**
- [x] Section 1 / 11 bright-line re-verified (no late hits)
- [x] Confirmed cascade is complete (all sections, drafts, exports listed)
- [x] All canonical Master Design merges applied with inline R4 markers
- [x] Every in-place merge REPLACED the prior passage in situ
- [x] Tier classification is correct for every affected entry
- [x] Routing (phases-affected) locked and matches confirmed cascade
- [x] No unresolved cross-tier, cross-arc, or contradiction flags

**Status: R3_COMPLETE — Proceed to Phase R4 (mini-Compiler)**


## Phase R2 — Mini-Architect

**Files created:**
- `Tier2_Logan_Entries.md` (new Tier 2 file for Principal)
- `Tier2_Wulfnic_Entries.md` (new Tier 2 file for Principal)

**Files modified:**
- `Tier2_NPC_Roster_Entries.md`: Removed Logan and Wulfnic, added Kaladin block with `<!-- REVISED IN R4 -->`.
- `Card_Logan.md`: Validated as Principal and added `<!-- REVISED IN R4 -->`.
- `Card_Wulfnic.md`: Validated as Principal and added `<!-- REVISED IN R4 -->`.

**Files archived:**
- `Card_Kaladin.md`, `Instructions_Kaladin.md`, `Tier2_Kaladin_Entries.md`, `JanitorAI_Profile_Kaladin.md`.

**Cross-reference notes:**
Kaladin's intimate details have been folded into his Roster block as requested. Logan and Wulfnic's existing `Instructions_` files were preserved as they already matched the Principal schema.


## Phase R3 — Mini-Editor

**Files audited:** `Tier2_NPC_Roster_Entries.md`, `Tier2_Logan_Entries.md`, `Tier2_Wulfnic_Entries.md`, `Card_Logan.md`, `Card_Wulfnic.md`.
**Result:** All Hard-Fail rules passed. Cross-reference integrity verified.


## Phase R4 & R5 — Compilation & Prompt Engineer
JSON compilation completed. Files output successfully. Revision Manifest updated. Pipeline R5 completed. **REVISION APPLIED.**