# AGENTS.md — standing instructions for agentic tools

## JanitorAI Integration & Separation of Concerns

This fork by **Lys_5** (JanitorAI Profile: https://janitorai.com/profiles/df1f0279-2607-4c9b-9b4e-ee02438d70a2_profile-of-lys-5) introduces a highly specialized architecture to bypass JanitorAI's context limitations:
1. **The Compiler (JSON Surface):** Extracts only the core identity, physical appearance, and personality, outputting a lightweight JSON profile (~1,500 tokens).
2. **The Converter (ES6 Backend):** Translates deep logic (L_LORE_SECRET, L_LORE_RELATIONSHIP, Trigger Matrix) into an executable, minified JavaScript payload.
3. **Red-Team Auditors:** The Voice, Intimacy, and Arc Auditors proactively stress-test the draft against extreme inputs, relational boundaries, and logic transitions before export.


> Read this first. It applies to Antigravity, Cline, and any other agentic IDE
> tool opening this workspace. It is deliberately short — it routes you to the right
> document for your session type instead of duplicating them.

---

## Directory Structure Rule
Per the user's request, when generating or refining worlds, the active project folder MUST NOT be the root of the World-Forge repository. 
Instead, all data for a specific world must follow this exact split structure:
- **Drafts**: MUST be saved in `d:\World-Forge\Drafts\[WorldName]\`
- **Exports & World Seed**: MUST be saved in `d:\World-Forge\Export\[WorldName]\`

Whenever a pipeline phase requires reading or writing files, you MUST use these specific `Drafts\[WorldName]` and `Export\[WorldName]` subdirectories rather than the root project folders.

## World-Agnostic Toolchain
All build tools in `tools/` are world-agnostic and accept the `world_name` as a required CLI argument:
- `python tools/wf_build_world.py <world_name>` — Full Drafts→Export compilation
- `python tools/resync_world.py <world_name>` — Regenerate Chat Completion Preset + JanitorAI script
- `python tools/compile_cards.py <world_name>` — Compile character cards
- `python tools/compile_lorebooks.py <world_name>` — Compile lorebooks
- `python tools/build_janitor.py <world_name>` — Build ES6 JanitorAI script
- `python tools/validate_export.py <Export_dir>` — Read-only Export/ JSON validator
- `python tools/init_export_generic.py <world_name>` — Initialize Export/ from templates

Isolated parsing utilities live in `tools/project_parsers/`.

## Antigravity Subagent Execution
The legacy subagents have been converted to Antigravity Skills in `d:\World-Forge\.agents\skills\`.
When following the orchestration workflow (`workflows/world-forge.md`) and instructed to dispatch to a subagent (e.g., `WorldForge-Interviewer` or `WorldForge-Refiner`), do not attempt to use legacy task delegation. 
Instead, rely on the Antigravity Skill matching engine. As Antigravity, you can natively adopt these personas because the Skills will automatically trigger and provide you with the correct `agent_roles/*.md` specification file for the requested phase.

---

- **Read `CLAUDE.md` completely before any edit.** It holds the load-bearing
  architectural principles, the cross-file consistency table (most pipeline files have
  paired files that must change together), and the editing protocol.
- Never edit pipeline files while a `/worldforge` run is in progress — the runtime agent
  is reading them.

---

## Hard invariants (one line each — full rationale in `CLAUDE.md`)

1. **Three-tier lorebook architecture.** Tier 1 world (position 0), Tier 2 character
   (position 1), Tier 3 arc/sandbox (modular). Every piece of content belongs to exactly
   one tier.
2. **The `{{original}}` mandate.** Every card's `system_prompt` and
   `post_history_instructions` begins with `{{original}}` on its own line. Engine rules
   live in the preset; character specifics live in cards/lorebooks. Never mix the two.
3. **Audit/apply separation.** Editor, Voice/Arc/Intimacy Auditors, and Prompt Engineer
   are read-only on the files they audit. Only the Architects write drafts; only the
   Compiler writes Export/ JSON (narrow preset-only exceptions documented in CLAUDE.md #3).
4. **Position values come from the table**, not from memory — `Notes_Quick_Reference.md`
   has the enum (0–7); `Notes_On_functionality.md` is the authority behind it.
5. **Every lorebook entry carries a `Position Rationale:`** — `DEFAULT` or a one-sentence
   justification.
6. **ARC_STATE / SANDBOX_STATE entries use the two-subsection structure** — descriptive
   situation + binding Tonal Mandate with imperative directives.
7. **Export JSON is written as UTF-8, never through PowerShell.** After Phase 4, the
   read-only check `python tools/validate_export.py Export/[WorldName]` verifies parse validity,
   mojibake, `{{original}}` presence, and position enums. It never modifies files.
8. **Export Directory Structure.** All generated drafts and final exports MUST be placed in their respective `Drafts/[WorldName]/` and `Export/[WorldName]/` subdirectories, never in the root `Drafts/` or `Export/` folder.

---

## Context discipline (all models — not a hard window limit)

This pipeline was sized against 200K-context frontier models. Nominal windows vary
widely (DeepSeek 4 Pro: 1M; GLM 5: 200K; others differ) — do not treat any fixed number
as the constraint. The real constraint is that **effective recall and instruction
adherence degrade well before nominal limits on every current model**, and what degrades
first is exactly what this pipeline depends on: hard-fail rules mid-spec, position
tables, sign-off checklists. So:

- **Use per-phase custom agents** — strongly recommended on any model (clean window per
  phase + persona isolation so the Editor stays strict), and effectively mandatory on
  200K-and-below windows for large worlds, where inline runs genuinely overflow by
  Phase 3.
- The shipped `.gitignore` keeps `Samples/` and maintenance docs out of
  auto-included context. Do not remove entries from it to "be thorough."
- The `📂 CONTEXT MANIFEST` blocks exist primarily for you. When a manifest says "load on
  demand," that means *do not preload* — open the file at the step that needs it. A
  bigger window is headroom for the *world's* drafts and history, not an invitation to
  preload reference material the phase does not need.
