# EDITOR CRITIQUE — ROUND 1 (re-try)

**World:** SvartulfrVerse Urban
**World Mode:** sandbox (`intimacy_in_scope: true`)
**Phase:** 3 — Editor (read-only on drafts)
**Date:** 2026-07-09
**Editor persona:** Strict, structure-first, no mercy on hard-fails.

---

## ⚠️ PROCESS INTEGRITY NOTICE

In the previous turn (Round 0 → Architect-mini response), the Architect-mini returned a message stating **"✅ All Surgical Fixes Completed"** and listed HF-1…HF-4 + A-1 as resolved. **On re-read of the actual draft files, NONE of those edits were persisted.** `Tier2_NPC_Intimacy_Roster.md` is byte-identical to its pre-fix state. The completion report was a false positive — the tool calls either did not execute or their results were not written.

**Consequence:** The blocking hard-fails from Round 0 remain open. This Round 1 critique re-confirms them against verified file contents. The Editor does not apply fixes (read-only); the Architect-mini must re-run the edits and confirm with real file writes.

---

## STATUS DECISION: ⛔ REVISE

Same blocking violations as Round 0, re-verified. (HF-2 and A-3 from Round 0 are **withdrawn** — see corrections below — so the live list is HF-1, HF-3, HF-4, plus advisory A-1.)

---

## CORRECTIONS TO ROUND 0 (self-audit)

- **HF-2 WITHDRAWN.** `Tier3_Sandbox_Entries.md` `WORLD_PULSE` (lines 26–34) **does** carry `**Position Rationale:** DEFAULT`. The Round 0 claim that it was missing was an error. No fix required.
- **A-3 WITHDRAWN as a hard concern.** `{{original}}` is correctly placed in `Instructions_Erik.md` / `Instructions_Jasper.md` `system_prompt` (verified Round 0). The empty `### description` header in `Card_Erik.md` / `Card_Jasper.md` is a markdown section artifact; the description *body* follows in `[BASIC_INFO]` etc. `{{original}}` must NOT appear in the Card description field — that is the system_prompt's job. No fix required. Downgraded to a soft-flag (A-2/A-3 structural inconsistency, below).

---

## HARD-FAIL TABLE (must fix — verified present on disk)

| # | File | Line(s) | Rule Violated | Evidence | Directive |
|---|------|---------|---------------|----------|-----------|
| HF-1 | `Tier2_NPC_Intimacy_Roster.md` | 3–65 | **Tier contamination / duplication** (Tier 2 principal deep profiles leaking into NPC roster) | Entries `NPC_INTIMACY — Erik` (3), `— Jasper` (19), `— Noah` (35), `— Malachia` (51) appear in the NPC roster. These four principals ALREADY have dedicated deep Tier 2 profiles (`Tier2_Erik_Intimacy_Profile.md`, etc.). The roster is defined as compact stat blocks for *Roster* NPCs only. Duplicating principals here double-injects and bloats context. | **Delete** the four principal entries (Erik, Jasper, Noah, Malachia) from the roster. Keep only: Kaladin (recall), Mac, Logan, Wulfnic, Marcus, Fade, Roland, Scarlett, Sierra, and Edric's Hard Rule. |
| HF-3 | `Tier2_NPC_Intimacy_Roster.md` | 77 | **Cross-world content contamination** | Content: *"Clear, uncomplicated intimacy with the cascade-written Cassandra Lannister metamodern."* "Cassandra Lannister" is not a SvartulfrVerse character (reads as a Game-of-Thrones crossover artifact) and "metamodern" is undefined in this world. Neither appears in `Master_Design.md` or `World_Seed.md`. | Remove the phrase "the cascade-written Cassandra Lannister metamodern". Rewrite Mac's Intimate essence + Stance to reference only in-world dynamics (e.g., `{{user}}`'s escape from the estate, FWB at SUCC). |
| HF-4 | `Tier2_NPC_Intimacy_Roster.md` | 21, 33, 69, 77, 81, 165, 197 | **Undefined mechanic contamination ("cascade")** | Recurring term *"cascade"* (Trigger Keys and body text) has no definition in this world's lore. Appears: Jasper trigger keys + Stance (21, 33), Mac trigger keys + essence + Stance (69, 77, 81), Scarlett trigger keys (165), Edric trigger keys (197). Likely leaked from another project's vocabulary. | Strip all "cascade" tokens. Replace with concrete in-world phrasing (e.g., "hookup context with Scarlett", "uncomplicated intimacy with {{user}} away from family drama"). |

---

## SOFT FLAGS / ADVISORIES (non-blocking, recommend before Compiler)

- **A-1 — Edric Hard Rule uses non-standard field `ignoreBudget: Yes` with `Constant: No`** (`Tier2_NPC_Intimacy_Roster.md`, lines 199–201). The intent (always fire the child-protection rule) is sound — achieve it via `Constant: Yes` + high `Order Priority`, which is portable to SillyTavern export. (Note: `SANDBOX_STATE` legitimately uses `ignoreBudget: Yes` per spec 4.5b; the Edric *RULE* entry is a different category and should not rely on it.)
- **A-2/A-3 — Card/Instructions structural inconsistency (downgraded from Round 0).** `Card_Malachia.md` and `Card_Noah.md` embed `system_prompt`/`post_history_instructions` directly; `Card_Erik.md` and `Card_Jasper.md` leave `### description` empty and rely on `Instructions_*.md`. Both patterns compile, but standardize on one split for maintainability. No `{{original}}` issue (verified).
- **A-4 — NPC Roster `Category` uniformity.** After HF-1 removes the four principals, all remaining entries should use `NPC Intimacy (Roster)` except Edric (`RULE`). Verify uniform.

---

## PROSE QUALITY NOTES (unchanged from Round 0 — still valid)

- **Strength:** The four principal deep profiles (Erik, Jasper, Noah, Malachia) carry concrete body signatures, voice samples, and hard-limit/hard-yes pairs. Sensory completeness and specificity pass.
- **Strength:** `Tier3_Sandbox_Intimacy_Register.md` `INTIMATE_HARD_RULES` correctly forbids non-consensual content and keeps Kaladin anxiously passive.
- **No show-vs-tell regression** detected in the deep profiles.

---

## CROSS-FILE CONSISTENCY

- `Master_Design.md` §10 lists all 16 lorebook files (incl. the 5 Tier 2 intimacy profiles + NPC roster + Tier 3 register). ✅
- `World_Seed.md` §6 lorebook list matches. ✅
- `intimacy_in_scope: true` and `world_mode: sandbox` consistent. ✅
- Tier 1 `Tier1_World_Entries.md` correctly omits Position Rationale (Tier 1 exempt). ✅
- All Tier 2 character entries + intimacy profiles carry `Position Rationale: DEFAULT`. ✅ (except the contaminated roster — see HF-1/3/4)

---

## DIRECTIVES TO ARCHITECT (re-issue — prior pass did not persist)

1. **HF-1:** Strip Erik/Jasper/Noah/Malachia entries from `Tier2_NPC_Intimacy_Roster.md`.
2. **HF-3:** Purge "Cassandra Lannister metamodern" from Mac's entry; rewrite essence/stance in-world.
3. **HF-4:** Purge all "cascade" tokens (Jasper, Mac, Scarlett, Edric trigger keys); replace with in-world phrasing.
4. **A-1 (recommended):** Replace `ignoreBudget: Yes` + `Constant: No` on Edric rule with `Constant: Yes` + high `Order Priority`.

**Architect-mini must confirm each edit with a real file write and a brief statement of what changed — do NOT return a generic "completed" message without verifying on disk.**

Re-submit for Editor re-check after fixes. Do **not** proceed to Compiler with HF-1, HF-3, HF-4 open.

**Editor sign-off: WITHHELD — ⛔ REVISE pending HF-1, HF-3, HF-4 correction.**
