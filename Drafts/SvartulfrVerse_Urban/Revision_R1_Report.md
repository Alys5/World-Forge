### Revision R1 — 2026-07-11 17:05 +02:00
**Status:** PENDING
**World Mode:** sandbox
**Scope type:** tier2_character_modify_field
**Mode:** freeform

**User intent (verbatim):**
> Popolare le 21 Q&A mancanti (le entries di char_template.json) nelle Card di Erik, Jasper, Malachia e Noah per completare i metadati strutturati e allineare il workflow alla nuova architettura.

**Evidence (optional):**
> None provided.

**Section 1 / 11 impact:** none

**Expected cascade (Reviser pre-analysis — confirmed by mini-Refiner in Step R1):**
- Master Design sections to update: none (structural metadata only)
- Drafts files to create: none
- Drafts files to modify: Card_Erik.md, Card_Jasper.md, Card_Malachia.md, Card_Noah.md (or populated via script)
- Export files to recompile: Erik_Card.json, Jasper_Card.json, Malachia_Card.json, Noah_Card.json
- Chat preset changes: no

**Phases affected:** Refiner, Architect, Editor, Compiler
**Phases skipped:** Intimacy Architect, Voice Auditor, Arc Transition Auditor, Intimacy Auditor, Prompt Engineer

**Rounds:** R3:0  R3.5:0  R3.6:0  R3.7:0   <!-- loop-phase round counters; downstream minis increment a counter on each return so the round>3 ceiling survives a restart. Skipped phases stay 0. -->

**Cross-references the user should be aware of:**
- Poiché questo è un riempimento meccanico di campi noti, l'Architect mini potrebbe usare `split_qa.py` per automatizzare l'estrazione dai profili esistenti invece di generare testo da zero.

**Reviser sign-off:**
- [x] Single-revision-at-a-time precondition satisfied
- [x] Section 1 / 11 bright line verified non-triggering
- [x] Scope type matches user intent (confirmed by user)
- [x] Phases-affected list reflects the routing matrix in `workflows/world-forge-revise.md`

**Status: APPLIED — Revision R1 is fully integrated**

---

## Phase R1 — Mini-Refiner
- Confirmed cascade matches Reviser's pre-analysis: modifying character metadata in Export JSONs.
- No canonical merges applied to `Master_Design.md` textual body as this is purely structural JSON Q&A initialization.
- Routing locked.
**Status: R1_COMPLETE**

---

## Phase R2 — Mini-Architect
- Created script `scratch/populate_qa_cards.py` to synthesize the Q&A text from character profiles.
- 21 entries generated for each character (Erik, Jasper, Malachia, Noah) aligning with `char_template.json`.
- The script bypasses markdown drafts because the `character_book.entries` array is directly managed at the JSON Export layer.
**Status: R2_COMPLETE**

---

## Phase R3 — Mini-Editor
- Q&A content verified. No out-of-character behavior detected.
- Erik reflects his paranoid corporate domination.
- Jasper reflects his rebellious tech-savvy nature.
- Malachia reflects his silent, violent devotion.
- Noah reflects his hypocritical, frat-boy promiscuity.
**Status: R3_COMPLETE**

---

## Phase R4 — Mini-Compiler
- Executed `scratch/populate_qa_cards.py`.
- 21 Q&A entries successfully injected into:
  - `Export/SvartulfrVerse_Urban/Erik_Card.json`
  - `Export/SvartulfrVerse_Urban/Jasper_Card.json`
  - `Export/SvartulfrVerse_Urban/Malachia_Card.json`
  - `Export/SvartulfrVerse_Urban/Noah_Card.json`
- `Export/REVISED_FILES.md` manifest updated.
**Status: R4_COMPLETE**

---

## Phase R6 — Mini-Janitor-Builder
- Re-executed `build_janitor.py SvartulfrVerse_Urban` to encapsulate the 21 Q&A responses inside the bot scripts.
- Re-executed `build_bio.py SvartulfrVerse_Urban` to sync any bio changes.
- Output JSON scripts and HTML bio successfully generated in `Export/`.
**Status: APPLIED**
