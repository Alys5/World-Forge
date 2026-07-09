# Compile Plan — SvartulfrVerse_Urban (Phase 4: The Compiler)

## Context
The SvartulfrVerse_Urban drafts (`Drafts/SvartulfrVerse_Urban/`) have cleared the Editor hard-fail audit in `Editor_Critique_Round3.md` (stray `{{original}}` removed, cross-world "Cassandra Lannister"/"cascade" contamination purged, Tier 1/2/3 structure and Position Rationale audit all pass). The task is to transcribe the approved drafts into SillyTavern/JanitorAI JSON under `Export/SvartulfrVerse_Urban/`.

A dedicated, spec-complete builder exists for this world: **`tools/wf_build_svartulfr.py`**. Do NOT use the generic `init_export_generic.py` / `compile_lorebooks.py` / `compile_cards.py` — those are incomplete for this 16-file set (init only scaffolds 4 cards + 1 world lorebook, and the generic card compiler omits `extensions.depth_prompt`).

## ⛔ Blocker — Pipeline State Ledger must be advanced FIRST (Foundational Rule 6)
`Drafts/Master_Design.md` ledger currently reads (Phase row / status):
- 2 Architect → PENDING
- 2.5 Intimacy → PENDING
- 3 Editor → PENDING
- 3.5 Voice → PENDING
- 3.7 IntimacyAudit → PENDING
- 4 Compiler → PENDING

`Editor_Critique_Round3.md` declares the set **APPROVED — Phase 4 (Compiler)**, so the work is done but the ledger was not advanced. Per the Compiler spec, every required phase must read `COMPLETE` (conditional 2.5/3.6/3.7 COMPLETE or SKIPPED) before compiling.

**Owner of this fix:** the orchestrator / Refiner (or the user). The Compiler is read-only on drafts and must NOT edit `Master_Design.md` itself. Advance the ledger to:
- 2 Architect → COMPLETE
- 2.5 Intimacy → COMPLETE
- 3 Editor → COMPLETE
- 3.5 Voice → COMPLETE
- 3.7 IntimacyAudit → COMPLETE
- 4 Compiler → IN_PROGRESS
- keep 3.6 Continuity → SKIPPED (sandbox mode, correct)
- confirm `world_mode: sandbox` matches Section 1 and `status` is neither BLOCKED nor ESCALATED.

Until this is done, the compile is forbidden by the spec. All scripts below are otherwise ready to run.

## Build steps (run from repo root `D:\World-Forge`)
The builder uses `os.getcwd()`, so run from `D:\World-Forge` so `Drafts/` and `Export/` resolve.

1. **Scaffold + compile core (lorebooks, cards, copies):**
   `python tools/wf_build_svartulfr.py`
   - Builds all 16 lorebook/register JSONs (`SvartulfrVerse_Urban_*`) with correct `[WorldName]_` prefix, internal `name` matching filename.
   - Populates `data.extensions.depth_prompt.prompt` from each `Instructions_*.md` `# depth_prompt`; sets `world_forge.style_override: null`.
   - Guards `{{original}}` at the start of every `system_prompt` / `post_history_instructions` (raises SystemExit if missing — none missing per Round 3).
   - Writes entries with `key == String(uid)`, `displayIndex == uid`, `selective: true` on constant entries, `ignoreBudget: true` on SANDBOX_STATE / constant-position-1 entries, WORLD_PULSE at `position: 4`/`depth: 4`.
   - Emits one inert `[[NPC_MANIFEST]]` entry (`disable: true`, `key: []`) per NPC/scene-bearing lorebook (Step 7.7).
   - Byte-for-byte copies `User.md` → `Export/User.md` and `JanitorAI_Profile_Group.md` → `Export/SvartulfrVerse_Urban_JanitorAI.md`.

2. **JanitorAI storefront bio HTML:**
   `python tools/build_bio.py SvartulfrVerse_Urban`
   - Reads `JanitorAI_Bio_Group.json` → writes `Export/SvartulfrVerse_Urban_JanitorAI_Bio_Group.html`.

3. **JanitorAI dynamic lorebook ES6 script:**
   `python tools/build_janitor.py SvartulfrVerse_Urban`
   - Reads all `*_Lorebook.json` + `*_Card.json` in Export → writes `Export/SvartulfrVerse_Urban_JanitorAI_Script.js`.
   - Note: only files with "Lorebook" or "Card" in the name are included; intimacy profiles/registers are excluded from the JS (they remain as standalone SillyTavern lorebooks). Acceptable per Step 7.8.

4. **Compiler_Log.md** — write `Export/Compiler_Log.md` manually with the output manifest, field-mapping table, and the Sign-Off checklist from the Compiler spec (system_prompt/post_history non-empty; SANDBOX_STATE constant+ignoreBudget; key==uid parity; camelCase only; depth_prompt + style_override present; no non-schema metadata; UTF-8 clean; pipeline ledger verified). Include the Persona Linkage instructions (User.md Description block + link `SvartulfrVerse_Urban_User_Lorebook.json`).

5. **Validate (read-only backstop):**
   `python tools/validate_export.py Export/SvartulfrVerse_Urban`
   - Checks UTF-8/mojibake, JSON parse, `{{original}}` in cards, unique uid, valid position enum (0–7). Fix at the **draft** level (never hand-edit Export JSON) if anything fails; re-run the relevant builder step.

## Expected output (`Export/SvartulfrVerse_Urban/`)
- Cards: `Jasper_Card.json`, `Erik_Card.json`, `Malachia_Card.json`, `Noah_Card.json`
- Tier 1: `SvartulfrVerse_Urban_World_Lorebook.json`
- Tier 2: `…_Jasper_Lorebook.json`, `…_Erik_Lorebook.json`, `…_Malachia_Lorebook.json`, `…_Noah_Lorebook.json`, `…_User_Lorebook.json`, `…_NPC_Roster_Lorebook.json`, `…_Angelo_Lorebook.json`, `…_Wulfnic_Lorebook.json`
- Tier 3: `…_Sandbox_Lorebook.json`
- Intimacy: `…_Kaladin_Intimacy_Profile.json`, `…_Jasper_Intimacy_Profile.json`, `…_Erik_Intimacy_Profile.json`, `…_Noah_Intimacy_Profile.json`, `…_Malachia_Intimacy_Profile.json`, `…_NPC_Intimacy_Roster.json`, `…_Sandbox_Intimacy_Register.json`
- Copies: `User.md`, `SvartulfrVerse_Urban_JanitorAI.md`
- JanitorAI: `SvartulfrVerse_Urban_JanitorAI_Bio_Group.html`, `SvartulfrVerse_Urban_JanitorAI_Script.js`
- `Compiler_Log.md`

## Risks / notes
- **Encoding:** all scripts use `open(..., encoding='utf-8')` + `json.dump(ensure_ascii=False)` → UTF-8 safe; no PowerShell writes. Verify by grepping output for `â€`/`Ã` (expect zero).
- **Ledger gate** is the only hard blocker; content itself is compile-ready per Round 3.
- The `User_Entries` manifest will include a single "Protagonist" npc entry (harmless deviation from the "personas only" ideal); the World and Sandbox_Intimacy_Register lorebooks correctly get no manifest.
- `build_janitor.py` injects intimacy-register content only if their filenames contain "Lorebook"; they don't, so they're intentionally absent from the JanitorAI JS (fine — they persist as ST lorebooks).

## Validation (done when)
- Ledger advanced (prerequisite) ✓
- All 5 script/copy steps ran without error ✓
- `validate_export.py` reports "All checks passed" ✓
- `Compiler_Log.md` written with full sign-off ✓
