# Kilo_Variants

Drop-in alternates for the shipped `.kilo/kilo.jsonc` — same 23 World-Forge agents, different model on every seat:

| File | Model (all seats) | Reasoning | Routing pin |
|---|---|---|---|
| `kilo.glm-5.2.jsonc` | `openrouter/z-ai/glm-5.2` | high | `only: ["Z.AI"]` (hard pin, no fallback) |
| `kilo.kimi-k2.7-code.jsonc` | `openrouter/moonshotai/kimi-k2.7-code` | high | `order: ["Moonshot AI"]` (fallbacks allowed) |

Both are reasoning-class models, so neither variant carries `temperature` fields — the per-phase temperature table (`wiki/Agentic-Tools-and-Models.md` §3.5) does not apply; depth is set via the per-model `reasoning: { "effort": "high" }` routing option instead.

**To use one:** back up `.kilo/kilo.jsonc`, copy the variant over it (keeping the name `kilo.jsonc`), reload VS Code, and confirm the `WorldForge-*` agents appear in the agent picker. Kilo does **not** load anything from this folder directly, and the `{file:...}` prompt paths inside the variants only resolve from the `.kilo/` location.

⚠️ **Read the header of `kilo.kimi-k2.7-code.jsonc` before using it.** Kimi K2.7 Code is the coding-tuned variant — the model class `wiki/Agentic-Tools-and-Models.md` §3.2 warns against for the creative seats — and its 16K max output can truncate the Compiler's larger lorebook JSON. Run `python tools/validate_export.py Export/` after every Phase 4 compile on it.

To mix models per seat instead of switching wholesale, stay on the shipped `.kilo/kilo.jsonc` — its `agent` section opens with a per-seat swap guide.
