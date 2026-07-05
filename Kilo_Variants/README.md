# Kilo_Variants

Drop-in alternates for the shipped `.kilo/kilo.jsonc` — same 23 World-Forge agents, different model on every seat:

| File | Model (all seats) | Temperatures | Reasoning | Routing pin |
|---|---|---|---|---|
| `kilo.glm-5.2.jsonc` | `openrouter/z-ai/glm-5.2` | none (reasoner — ignores sampling) | effort high | `only: ["Z.AI"]` (hard pin, no fallback) |
| `kilo.kimi-k2.5.jsonc` | `openrouter/moonshotai/kimi-k2.5` | per-phase values kept (chat-tuned) | n/a | `order: ["Moonshot AI"]` (fallbacks allowed) |

The two variants differ in shape because the models differ in kind: GLM 5.2 is reasoning-class, so its variant strips every `temperature` field and controls depth via the per-model `reasoning: { "effort": "high" }` routing option; Kimi K2.5 is the general-line chat-tuned Kimi, so its variant keeps the shipped per-phase temperature table (`wiki/Agentic-Tools-and-Models.md` §3.5) exactly as the DeepSeek config does.

**To use one:** back up `.kilo/kilo.jsonc`, copy the variant over it (keeping the name `kilo.jsonc`), reload VS Code, and confirm the `WorldForge-*` agents appear in the agent picker. Kilo does **not** load anything from this folder directly, and the `{file:...}` prompt paths inside the variants only resolve from the `.kilo/` location.

On either variant, watch the Editor's round 1 for sycophancy — the known weak spot of budget-class models under audit — and run `python tools/validate_export.py Export/` after every Phase 4 compile.

To mix models per seat instead of switching wholesale, stay on the shipped `.kilo/kilo.jsonc` — its `agent` section opens with a per-seat swap guide.
