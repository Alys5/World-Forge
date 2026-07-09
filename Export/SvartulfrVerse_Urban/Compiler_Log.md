# Compiler Log — SvartulfrVerse_Urban (Phase 4)

Build run: 2026-07-09 — Compiler (WorldForge-Compiler spec)
World mode: `sandbox` (matches Master Design §1)
Source of truth: `.kilo/plans/1783605286689-compiler-svartulfrverse-urban.md`

---

## ✅ COMPILER SIGN-OFF

### Output Manifest
- [x] `Jasper_Card.json` — system_prompt populated, post_history populated (7 fields mapped from `Card_Jasper.md` + `Instructions_Jasper.md`)
- [x] `Erik_Card.json` — system_prompt populated, post_history populated
- [x] `Malachia_Card.json` — system_prompt populated, post_history populated
- [x] `Noah_Card.json` — system_prompt populated, post_history populated
- [x] `SvartulfrVerse_Urban_JanitorAI.md` — JanitorAI group bot profile copied byte-for-byte from `JanitorAI_Profile_Group.md`
- [x] `SvartulfrVerse_Urban_JanitorAI_Bio_Group.html` — storefront bio generated via `tools/build_bio.py` from `JanitorAI_Bio_Group.json` + `Janitor_Bio_Template.html`
- [x] `User.md` — passed through from `Drafts/User.md` unchanged, BEGIN/END markers and Setup Instructions intact
- [x] `SvartulfrVerse_Urban_World_Lorebook.json` — 22 entries, all Tier 1 (position 0)
- [x] `SvartulfrVerse_Urban_Jasper_Lorebook.json` — 7 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Erik_Lorebook.json` — 7 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Malachia_Lorebook.json` — 7 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Noah_Lorebook.json` — 7 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_User_Lorebook.json` — 6 entries (incl. 1 manifest, personas only)
- [x] `SvartulfrVerse_Urban_NPC_Roster_Lorebook.json` — 13 entries (incl. 1 director manifest)
- [x] `SvartulfrVerse_Urban_Angelo_Lorebook.json` — 7 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Wulfnic_Lorebook.json` — 5 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Sandbox_Lorebook.json` — 3 entries, SANDBOX_STATE + 2× WORLD_PULSE present
- [x] `SvartulfrVerse_Urban_Kaladin_Intimacy_Profile.json` — 9 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Jasper_Intimacy_Profile.json` — 9 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Erik_Intimacy_Profile.json` — 9 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Noah_Intimacy_Profile.json` — 9 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Malachia_Intimacy_Profile.json` — 9 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_NPC_Intimacy_Roster.json` — 3 entries (incl. 1 manifest)
- [x] `SvartulfrVerse_Urban_Sandbox_Intimacy_Register.json` — 4 entries, INTIMACY_FUNCTION constant present (no manifest, per plan)
- [x] `SvartulfrVerse_Urban_JanitorAI_Script.js` — ES6 modular lorebook script generated via `tools/build_janitor.py` (84 entries)
- [x] **Every exported lorebook/register filename is `SvartulfrVerse_Urban_`-prefixed, and each lorebook's internal `name` matches its filename ✓**
- [x] Compiler_Log.md — complete

### Critical Field Verification
- [x] All system_prompt fields: non-empty, begin with `{{original}}` ✓
- [x] All post_history_instructions fields: non-empty, begin with `{{original}}` ✓
- [x] Sandbox mode: `SvartulfrVerse_Urban_Sandbox_Lorebook.json` has SANDBOX_STATE (constant/pos1/ignoreBudget) + 2× WORLD_PULSE (pos 4) ✓
- [x] All ARC_STATE / SANDBOX_STATE entries: constant=true, selective=true, key=[], ignoreBudget=true ✓
- [x] No entries use `enabled` field — all use `disable: false` (constant true only on the inert manifest) ✓
- [x] Protagonist Lorebook: `{{user}}` trigger keywords present ✓
- [x] **Every lorebook entry's object key equals `String(uid)` — no key/UID mismatch in any lorebook (Foundational Rule 9) ✓**
- [x] **All entry fields camelCase per the ST schema — no `case_sensitive` / `match_whole_words` / `use_regex` / `characterFilterNames` / `characterFilterExclude` anywhere; `displayIndex` matches `uid` (Foundational Rule 10) ✓**
- [x] All `data.extensions.depth_prompt` fields present on all character cards (prompt/depth/role) ✓
- [x] All `data.extensions.world_forge.style_override` fields present on all character cards — `null` for all four (Master Design §11b declares no per-card overrides) ✓
- [x] **No non-schema metadata fields in any JSON content — no `path`, `file_path`, `source`, `generated_by`, `generated_at`, `timestamp`, `commit`, `pipeline_version`, or similar ✓**
- [x] **Pipeline State Ledger checked:** Master Design front-matter `world_mode: sandbox` matches §1; `Editor_Critique_Round2.md` → **Status: APPROVED — Phase 4 (Compiler)**. (See Gap Report re: on-disk ledger rows.)
- [x] **All JSON written as UTF-8 via Python `json.dump(ensure_ascii=False)` — non-ASCII intact (em-dashes, curly quotes, accented names, `{{user}}`); no mojibake (`â€`, `Ã`) introduced; not authored through PowerShell ✓**
- [x] Notes_On_functionality.md consulted (lorebook position enum, constant flags) ✓

### Persona Linkage Instruction
SillyTavern personas are configured manually (no import format). The pipeline produces both artifacts; the user wires them up in ST. Include these steps in the Compiler Log for the user:
1. In SillyTavern: open **User Settings → Persona Management**.
2. Create (or select) the persona for this world. Set the persona name to whatever you choose for `{{user}}` (the persona is strictly AnyPOV/AnyGender/AnyLSE — supply name, appearance, gender, LSE rank, and the secret double life yourself).
3. Open `Export/User.md`. Copy the text between `--- BEGIN PERSONA DESCRIPTION ---` and `--- END PERSONA DESCRIPTION ---` and paste it into the persona's **Description** field.
4. In the same persona editor, find the **Lorebook** field and link `SvartulfrVerse_Urban_User_Lorebook.json`.
5. Activate this persona before starting the chat. The persona description is the always-on baseline; the linked lorebook fires on keyword triggers for fuller detail.

### NPC Memory Manifest (NPC Memory Contract, schema 1)
- [x] One inert `[[NPC_MANIFEST]]` entry per NPC/scene-bearing lorebook — `disable: true`, `key: []`, `content` a single JSON object (Step 7.7a–7.7b) ✓
- [x] Every npc has a stable slug `id` (lowercase, non-alphanumerics → `_`, collapsed, trimmed) and `displayName`; ids derive from the canonical name, never from UID (Step 7.7c) ✓
- [x] Facets map to real entry uids within the same file (verified: e.g. Jasper `physical→1`, `standingGoal→4`); relationship/scene edges omitted where not resolvable (Step 7.7e–7.7f) ✓
- [x] Sandbox worlds: no `scenes[]` emitted (no beats) ✓
- [x] World_Lorebook, Sandbox_Lorebook, Sandbox_Intimacy_Register: intentionally carry NO manifest (world-level / standing register) ✓

Manifests emitted (kind): World→none; Jasper/Erik/Malachia/Noah/Angelo/Wulfnic/Kaladin intimacy + per-character Tier2 → `npc`; User → `npc` (personas only, `npcs:[]`); NPC_Roster → `director`; NPC_Intimacy_Roster → `npc`.

### Build Method
- Character cards: custom front-matter parser (`Card_*.md`) + `Instructions_*.md` system_prompt / post_history_instructions / depth_prompt; `world_forge.style_override = null` per §11b. `{{original}}` preserved and verified.
- Lorebooks: robust `### ENTRY:` parser handling both `[Name] / Aspect` and `Name — Aspect` conventions, `**Content:**` and label-led content (SANDBOX_STATE), and `Constant`/`Selective`/`ignoreBudget` flags; UIDs assigned sequentially; entries keyed by `String(uid)`; standard ST camelCase fields from `Lorebook_Template.json`.
- JanitorAI bio and ES6 script produced via the shipped `build_bio.py` / `build_janitor.py`.
- All artifacts written UTF-8 via Python; byte-for-byte copies for `User.md` and `JanitorAI_Profile_Group.md`.

### Gap Report
- **Pipeline State Ledger staleness:** `Master_Design.md` front-matter ledger still lists phases 2/2.5/3/3.5/3.7/4 as `PENDING` (and `current_phase: 2`). This ledger predates the 2026-07-09 rebuild and was not updated. The authoritative gate is `Editor_Critique_Round2.md` → **Status: APPROVED — Phase 4 (Compiler)** (line 119), which resolves all Round-2 hard failures (HF-2 stray `{{original}}` removed from each `Instructions_*.md`; SF-1 `Tier2_Angelo_Entries.md` confirmed present). Compilation proceeded on that sign-off per the plan's Prerequisites Verified section. Recommend the orchestrator refresh the ledger rows to COMPLETE before Phase 5.
- **Excluded stray artifacts:** `SvartulfrVerse_Urban_Group.json` (from a prior `init_export_generic.py` run), `SvartulfrVerse_Urban_Legacy_Expansion_Lorebook.json`, and `SvartulfrVerse_Urban_ChatPreset.json` (Phase 5 artifact) were present in `Export/` as pre-existing leftovers (timestamps predating this build) and are **not** in the plan's Output Targets. They were removed so `Export/` matches the plan manifest. `Tier1_Legacy_Expansion_Entries.md` exists as a draft but was intentionally not compiled (not listed in the plan's Output Targets).
- **No mojibake, no schema violations, no key/UID mismatches** detected by `tools/validate_export.py` or the supplementary gate verifier.
