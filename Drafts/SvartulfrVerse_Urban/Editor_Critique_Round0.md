# EDITOR CRITIQUE — ROUND 0

**World:** SvartulfrVerse Urban
**World Mode:** sandbox (`intimacy_in_scope: true`)
**Phase:** 3 — Editor (read-only on drafts)
**Date:** 2026-07-09
**Editor persona:** Strict, structure-first, no mercy on hard-fails.

---

## STATUS DECISION: ⛔ REVISE

The draft set is structurally near-complete and the prose is strong, but **four hard-fail violations** must be corrected before this world can proceed to Phase 3.5 (Voice) / 4 (Compiler). Three are Tier contamination or Position-Rationale gaps; one is cross-world content contamination that would corrupt the export. None require re-architecting — all are surgical fixes.

---

## HARD-FAIL TABLE (must fix)

| # | File | Line(s) | Rule Violated | Evidence | Directive |
|---|------|---------|---------------|----------|-----------|
| HF-1 | `Tier2_NPC_Intimacy_Roster.md` | 3–65 | **Tier contamination / duplication** (Tier 2 principal deep profiles leaking into NPC roster) | Entries `NPC_INTIMACY — Erik` (3), `— Jasper` (19), `— Noah` (35), `— Malachia` (51) appear in the NPC roster. These four principals ALREADY have dedicated deep Tier 2 profiles (`Tier2_Erik_Intimacy_Profile.md`, etc.). The roster is defined as compact stat blocks for *Roster* NPCs only (per `implementation_plan.md` Component 2 and the Intimacy Architect spec §6.5). Duplicating principals here double-injects and bloats context. | **Delete** the four principal entries (Erik, Jasper, Noah, Malachia) from the roster. Keep only: Kaladin (recall), Mac, Logan, Wulfnic, Marcus, Fade, Roland, Scarlett, Sierra, and Edric's Hard Rule. |
| HF-2 | `Tier3_Sandbox_Entries.md` | WORLD_PULSE block (after SANDBOX_STATE) | **Position Rationale missing** (Tier 3, non-constant) | `WORLD_PULSE` entry has `Injection Position: 6`, `Constant: Yes`, but **no `Position Rationale:` field**. Hard-fail rule #4 applies to Tier 2/3. (Note: SANDBOX_STATE correctly carries `Position Rationale: DEFAULT`.) | Add `**Position Rationale:** DEFAULT` (or one sentence) to the WORLD_PULSE entry header. |
| HF-3 | `Tier2_NPC_Intimacy_Roster.md` | Mac entry, line 77 | **Cross-world content contamination** | Content references *"the cascade-written Cassandra Lannister metamodern"* — "Cassandra Lannister" is not a SvartulfrVerse character (reads as a Game-of-Thrones crossover artifact) and "metamodern" is undefined in this world. Neither appears in `Master_Design.md` or `World_Seed.md`. | Remove the "Cassandra Lannister metamodern" phrase. Rewrite Mac's `Stance` to reference only in-world dynamics (e.g., `{{user}}`'s escape from the estate, FWB at SUCC). |
| HF-4 | `Tier2_NPC_Intimacy_Roster.md` | Jasper (33), Mac (77/81), Scarlett (165/173) | **Undefined mechanic contamination ("cascade")** | Recurring term *"cascade"* (e.g., "Scarlett cascade context", "Unburdened cascade action via {{user}} cheating", "cascade, FWB") has no definition in this world's lore. Likely leaked from another project's vocabulary. | Strip all "cascade" references. Replace with concrete in-world phrasing (e.g., "hookup context with Scarlett", "uncomplicated intimacy with {{user}} away from family drama"). |

---

## ADVISORY NOTES (non-blocking, recommend before Compiler)

- **A-1 — Edric Hard Rule uses non-standard field `ignoreBudget: Yes`** (`Tier2_NPC_Intimacy_Roster.md`, line 201). This field is not in the documented lorebook schema (Position, Constant, Selective Logic, Order Priority, Trigger Keys, Category). The intent (always fire the child-protection rule) is sound — achieve it via `Constant: Yes` + high `Order Priority` instead, which is portable to SillyTavern export.
- **A-2 — Card/Instructions structural split is inconsistent.** `Card_Malachia.md` and `Card_Noah.md` embed `system_prompt`/`post_history_instructions` (with `{{original}}`) directly; `Card_Erik.md` and `Card_Jasper.md` leave `### description` empty and rely on `Instructions_*.md`. Both patterns compile, but standardize on one. Confirm the Compiler expects the `Instructions_*.md` split (recommended) so the empty `### description` headers in Erik/Jasper are intentional.
- **A-3 — `Card_Erik.md` / `Card_Jasper.md` `### description` header is empty.** The `[BASIC_INFO]`…`[SEXUALITY]` blocks follow and serve as the description body, but the explicit `{{original}}` line is absent from the description header (present in Noah/Malachia). Add `{{original}}` under `### description` for consistency if the Compiler reads it literally.
- **A-4 — NPC Roster `Category` values** mix `NPC Intimacy (Roster)` (principals/roster) and `RULE` (Edric). After HF-1 removes principals, all remaining entries should use `NPC Intimacy (Roster)` except Edric (`RULE`). Verify uniform.

---

## PROSE QUALITY NOTES (per spec §"Prose Quality" — sensory completeness, show vs tell, specificity)

- **Strength:** The four principal deep profiles (Erik, Jasper, Noah, Malachia) are excellent — each carries concrete body signatures (Erik's held-breath/jaw-lock; Jasper's thrashing tail; Noah's posture-checking; Malachia's chest rumble), voice samples, and hard-limit/hard-yes pairs. This satisfies sensory completeness and specificity.
- **Strength:** The Sandbox Intimacy Register's `INTIMATE_HARD_RULES` correctly forbids non-consensual content and keeps Kaladin anxiously passive — on-voice for the comedic-slow-burn charter.
- **Minor:** Several roster NPC entries are tell-heavy on *essence* but light on *concrete sensory action* (e.g., Logan "mature, grounded" — add a signature tactile tell like Malachia's rumble). Acceptable for compact blocks, but enrich if token budget allows.
- **No show-vs-tell regression** detected in the deep profiles.

---

## CROSS-FILE CONSISTENCY

- `Master_Design.md` §10 now lists all 16 lorebook files including the 5 Tier 2 intimacy profiles + NPC roster + Tier 3 register. ✅
- `World_Seed.md` §6 lorebook list updated to match (items 9–15 added). ✅
- `intimacy_in_scope: true` and `world_mode: sandbox` consistent top-of-file in both. ✅
- Tier 1 `Tier1_World_Entries.md` correctly omits Position Rationale (Tier 1 exempt). ✅
- All Tier 2 character entries (`Tier2_*_Entries.md`) and intimacy profiles carry `Position Rationale: DEFAULT`. ✅ (except the contaminated roster — see HF-1/3/4)

---

## DIRECTIVES TO ARCHITECT (next round)

1. **HF-1:** Strip Erik/Jasper/Noah/Malachia entries from `Tier2_NPC_Intimacy_Roster.md`.
2. **HF-2:** Add `Position Rationale` to `WORLD_PULSE` in `Tier3_Sandbox_Entries.md`.
3. **HF-3:** Purge "Cassandra Lannister metamodern" from Mac's entry.
4. **HF-4:** Purge all "cascade" tokens from Jasper/Mac/Scarlett entries; replace with in-world phrasing.
5. **A-1 (recommended):** Replace `ignoreBudget: Yes` on Edric rule with `Constant: Yes` + high priority.

Re-submit for Editor re-check after fixes. Do **not** proceed to Compiler with HF-1…HF-4 open.

**Editor sign-off: WITHHELD pending HF-1…HF-4 correction.**
