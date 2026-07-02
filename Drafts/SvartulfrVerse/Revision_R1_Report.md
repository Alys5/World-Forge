### Revision R1 — 2026-07-03 00:48 CEST
**Status:** PENDING
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

## Phase R1 — Mini-Refiner

**Confirmed Cascade:**
As listed above, the geographic refactoring touches several Tier 1 foundations. The cascade has been expanded to correctly map the required changes across Section 2, 3, 4, 6, and 9B. All drafts referencing the old geography (UCLA, Beverly Hills) will be surgically updated by the Architect.

**Canonical Merges Applied:**
- **Section 2:** Edited DCC Security to establish operations at DCC Tower in Los Angeles.
- **Section 3:** Replaced Douglas Estate in Beverly Hills with Blackwood (including Seven Hills). Replaced UCLA with SUCC Campus at Solarton. Added DCC Tower as the corporate hub in Los Angeles.
- **Section 4:** Updated the 'gesellschaft' masking example from UCLA to SUCC.
- **Section 6:** Updated Alyssa's identity to student at SUCC in Solarton.
- **Section 9B:** Updated the Sandbox Standing Situation to reflect SUCC in Solarton and the Blackwood estate.

**Cross-tier Flags:** None. All geographic adjustments belong to Tier 1 and properly propagate to Sandbox Tier 3 and Character Tier 2 context.

**Refiner-mini sign-off (Phase R1):**
- [x] Section 1 / 11 bright-line re-verified (no late hits)
- [x] Confirmed cascade is complete (all sections, drafts, exports listed)
- [x] All canonical Master Design merges applied with inline R1 markers
- [x] Every in-place merge REPLACED the prior passage in situ — no stacked/near-duplicate copy left beneath the revision
- [x] Tier classification is correct for every affected entry
- [x] Routing (phases-affected) locked and matches confirmed cascade
- [x] No unresolved cross-tier, cross-arc, or contradiction flags

**Status: R1_COMPLETE — Proceed to Phase R2 (mini-Architect)**

## Phase R2 — Mini-Architect

**Files created:** None.

**Files modified:**
- `User.md`: Surgically updated university location to SUCC in Solarton.
- `Tier3_Sandbox_Entries.md`: Replaced UCLA with SUCC and added DCC Tower/Blackwood references in the Standing Situation and Obscura Art Quarterly beat.
- `Tier2_NPC_Roster_Entries.md`: Replaced "Beverly Hills" with "Blackwood" in Angel Moreno's signature line.
- `Card_Wulfnic.md`: Replaced "Beverly Hills mansion" with "Blackwood mansion".
- `Card_Malachia.md`: Replaced "UCLA coffee shop" with "SUCC coffee shop".
- `Card_Erik.md`: Replaced UCLA with SUCC across scenario and mes_example.
- `Tier1_World_Entries.md`: Swept and updated all occurrences of UCLA and Beverly Hills to SUCC and Blackwood. Ensured all entry IDs and trigger keys reflect the new locations correctly.

**Cross-reference notes:** 
- The family estate is still the "Douglas Estate", but its geographical location has shifted from Beverly Hills to the newly founded werewolf city of Blackwood.
- Los Angeles is now treated purely as the corporate/mercenary hub (DCC Tower).

**Open questions:** None. All structural structural changes mapped clearly to the refactoring plan.

## Phase R3 — Mini-Editor — Round 1

**Audit Results:**
- **Cards and Tier 2:** `Card_Wulfnic.md`, `Card_Malachia.md`, `Card_Erik.md`, `Tier2_NPC_Roster_Entries.md`, and `User.md` were checked. The in-place edits cleanly replaced the old locations without creating any duplicated text (no stacking). The `<!-- REVISED IN R1 -->` markers are properly placed. No engine content or tier contamination.
- **Tier 3 Sandbox:** `Tier3_Sandbox_Entries.md` maintains its required two-subsection sandbox structure. The location swaps are consistent with the world's tonal mandate.
- **Tier 1 World:** `Tier1_World_Entries.md` correctly reflects SUCC, Solarton, Blackwood, and DCC Tower across all entry bodies and trigger keys. The surgical replacements did not corrupt the `[UID] Field(value)` syntax.
- **Cross-Reference Integrity:** All references align with the updated Sections 2, 3, 4, 6, and 9B in the canonical Master Design. 

**Hard Failures Found:** 0

**Status: R3_COMPLETE — Proceed to Phase R4 (mini-Compiler)**

## Phase R4 — Mini-Compiler

**Summary:**
- Successfully transcribed the geographic revisions from Drafts into the existing Export JSON lorebooks and cards.
- **UID Continuity Preserved:** All existing lorebook entries retained their original UIDs. No runtime chat states were broken.
- **Marker Sanitization:** Draft revision markers (`<!-- REVISED IN R1... -->`) were stripped during compilation; JSON content is clean.
- Created the cumulative revision manifest `Export/SvartulfrVerse/REVISED_FILES.md`.
- Generated user instructions in `Drafts/SvartulfrVerse/Revise_R1_Compile_Log.md`.

**Status: R4_COMPLETE — Proceed to Phase R5 (mini-Prompt-Engineer)**

## Phase R5 — Mini-Prompt-Engineer

**Summary:**
- **Audit Verdict:** Passed. Runtime integrity is verified.
- **Preset Modified:** No. Triggers A, B, and C did not fire. The `ChatPreset.json` is read-only.
- **Manual Corrections:** 0.
- **Full Audit:** See `Drafts/SvartulfrVerse/Revise_R1_Prompt_Engineer_Audit.md`

**Status: REVISION APPLIED — Pipeline Complete**
