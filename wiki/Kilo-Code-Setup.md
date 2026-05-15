# Running World-Forge under Kilo Code

A step-by-step setup tutorial for users who want to drive the World-Forge pipeline with [Kilo Code](https://github.com/Kilo-Org/kilocode) rather than Roo Code. If you are looking for the comparison across tools (Roo Code, Cline, Kilo Code, Claude Code) and the model-selection guidance, read [`Agentic-Tools-and-Models.md`](./Agentic-Tools-and-Models.md) first — this page assumes you have already chosen Kilo and just want it configured correctly.

> **Terminology note (April 2026 rebuild).** Kilo Code renamed **Modes** to **Agents** throughout the UI and docs. Where older guides say "switch to Orchestrator mode," current Kilo builds expose **Code / Plan / Debug** agents with built-in subagent delegation; the dedicated Orchestrator mode is deprecated. This page uses the current terminology and notes the old name in parentheses where useful.

---

## 1. Why Kilo Code works for World-Forge

The pipeline asks four things of a runtime tool: file read/write across the workspace, multi-step autonomy, long-context tolerance, and per-persona configurability. Kilo Code provides all four:

- **File-edit tools** are the same lineage as Roo Code / Cline — read, write, search-and-replace, diff.
- **Subagent delegation** is now built into the full-access agents (Code, Plan, Debug). The top-level agent can dispatch to a custom subagent without you switching modes manually. This maps onto World-Forge's phase-by-phase persona handoffs cleanly.
- **Custom agents** can be pinned to a specific markdown system-prompt file — e.g., a `WorldForge-Architect` agent pinned to `agent_roles/02_The_Architect.md`. Used well, this reduces persona drift on long runs (a real risk by Phase 3).
- **Per-agent model selection** lets you spend on Opus 4.7 for the Editor and Auditors while routing the Refiner and Compiler to cheaper models. See the [§3.3 mixing table](./Agentic-Tools-and-Models.md#33-mixing-models-across-phases).

Nothing in the pipeline itself is Kilo-specific or Roo-specific. The trigger commands (`/worldforge start`, `/worldforge resume phase[N]`) are free-form user prompts that the executing agent interprets against `workflows/world-forge.md` — they are not bound to any tool's slash-command surface.

---

## 2. Install Kilo Code

1. Open VS Code → Extensions panel → search for **`Kilo Code`** (marketplace ID `kilocode.Kilo-Code`).
2. Install. The extension adds a Kilo Code icon to the activity bar (left sidebar).
3. If you use VSCodium or another OpenVSX-based editor, install from [OpenVSX](https://open-vsx.org/extension/kilocode/kilo-code) instead.

You can skip the separate Kilo CLI (`@kilocode/cli`) — it is not needed for the VS Code workflow World-Forge expects.

---

## 3. Configure your model provider

The general flow is the same regardless of provider:

1. Click the Kilo Code icon in the activity bar. The Kilo sidebar opens.
2. Click the **gear icon** in the sidebar header.
3. Under **API Provider**, pick your provider (see the sub-sections below).
4. Fill in the provider-specific fields (API key, base URL, etc.).
5. Save.

Provider settings apply globally across the sidebar agents and any custom agents you define. **Critical for §5 below:** Kilo's per-agent `"model"` field requires a **provider-prefixed** model ID (e.g., `anthropic/claude-opus-4-7`, never bare `claude-opus-4-7`) — note the exact provider ID Kilo assigns when you save your provider, because you will reference it in `kilo.jsonc`.

### 3.1 Direct provider accounts (Anthropic, OpenAI, Google, Bedrock, Vertex)

For each, Kilo has a **dedicated dropdown entry** that exposes the right model picker and provider-specific options. Paste your API key (or configure your cloud credentials for Bedrock / Vertex) and select a model from the auto-populated dropdown.

Model picks for World-Forge: see [§3.2 of the tools wiki page](./Agentic-Tools-and-Models.md#32-recommended-tiers). Short version — Opus 4.7 or Sonnet 4.6 for creative phases, Haiku 4.5 acceptable for the Refiner / Compiler / Prompt Engineer. **Do not** use Flash-tier models for the Compiler — see the [Phase 4 caveat](./Agentic-Tools-and-Models.md#32-recommended-tiers).

### 3.2 Aggregators

**OpenRouter** (recommended if you want one wallet across many model families):

1. **API Provider** → `OpenRouter`.
2. Paste your OpenRouter API key.
3. Kilo auto-fetches the OpenRouter model catalog and presents a searchable dropdown. Model IDs are provider-prefixed in OpenRouter's native format (e.g., `anthropic/claude-opus-4-7`, `openai/gpt-5`, `deepseek/deepseek-chat-v4`).
4. Under **Provider Routing**, configure sort preference (default / lower price / higher throughput / lower latency), an explicit preferred-provider order, and allow/deny lists if you care about which upstream serves a given request. World-Forge has no specific routing requirement, but if you enable **Zero Data Retention (ZDR)** here, be aware Kilo's docs warn this **disables Anthropic and OpenAI upstreams** — verify your preferred models are still available before relying on this setting.
5. **Prompt-caching caveat (cost-material for World-Forge).** OpenRouter forwards Anthropic `cache_control` markers to the upstream and uses sticky routing for cache hits. In practice this usually works, but there are open ecosystem reports of cache misses through OpenRouter SDK paths ([OpenRouterTeam/ai-sdk-provider#35](https://github.com/OpenRouterTeam/ai-sdk-provider/issues/35)). Because the pipeline reloads several thousand tokens of agent specs per phase, a broken cache materially affects cost. On your first run, watch the OpenRouter dashboard's cache-hit metrics; if you see 0% cache hits on Anthropic models with long system prompts, route direct to Anthropic instead.

**Nano-GPT** (smaller aggregator, often used for low-cost or anonymous access):

1. **API Provider** → `Nano-GPT`. It is a first-class entry — do **not** configure it as OpenAI-Compatible.
2. Paste your Nano-GPT API key.
3. Model IDs follow the same provider-prefixed format as OpenRouter (e.g., `openai/gpt-5.2`, `anthropic/claude-opus-4-7`).
4. **Known limitations on Kilo + Nano-GPT (as of May 2026):**
   - The Nano-GPT provider panel is missing the **Reasoning Effort** and **Tool Call Style** toggles that other providers expose ([Kilo issue #4451](https://github.com/Kilo-Org/kilocode/issues/4451)). For World-Forge this matters mainly if you wanted thinking-mode control on reasoning-capable models — the pipeline does not require it, but you cannot tune it from the UI either.
   - The Kilo **CLI's** `/model list` command returns "No models available for this provider" with Nano-GPT active ([#4689](https://github.com/Kilo-Org/kilocode/issues/4689)). The VS Code UI's model picker is unaffected — this is CLI-only and not a concern if you run the pipeline from VS Code.

### 3.3 Local / self-hosted models

The pipeline is demanding (long context, dense agent specs) — most local-hosted models below Kilo's recommended floor will fail in Phase 3 or earlier. Kilo's docs recommend at minimum **24 GB VRAM or 32 GB unified memory** for any non-trivial local agent work, and the pipeline pushes harder than that baseline. Expect to use a hosted provider for the creative phases even if you keep utility phases local.

**Ollama:**

1. **API Provider** → `Ollama`.
2. Default base URL: `http://localhost:11434` (Kilo pre-fills this; override only for remote Ollama).
3. Model is selected from a dropdown Kilo populates from your installed Ollama models — `ollama pull <model>` first if the model you want is not listed.

**LM Studio:**

1. **API Provider** → `LM Studio`.
2. Default base URL: `http://localhost:1234`.
3. Model name is entered manually as the **loaded model's file name** (e.g., `Qwen2.5-72B-Instruct.Q4_K_M.gguf`) — Kilo does not auto-discover here, so make sure LM Studio has the right model loaded before you fire.

**vLLM, llama.cpp server, text-generation-webui, or any other OpenAI-compatible endpoint:**

1. **API Provider** → `OpenAI Compatible`.
2. Supply base URL (`https://your.host/v1` or `http://localhost:8000/v1` — both `/v1` and full `/v1/chat/completions` forms are accepted), API key (or any placeholder if your endpoint is unauthenticated), and the model ID your server exposes.
3. **Do not** use OpenAI Compatible for Azure GPT-5 deployments — Kilo's docs explicitly warn it rejects `max_tokens` on that path. Use the dedicated Azure entry if Kilo's build exposes one.

### 3.4 Recommended setup for World-Forge

For most users running the full pipeline: **OpenRouter** if you want a single wallet and easy model mixing across phases, or **direct Anthropic** if you have an Anthropic account already and want to eliminate the prompt-cache risk noted above. Local-only runs are not recommended for the creative phases (Architect, Editor, Auditors); use a hosted provider there even if you route utility phases (Refiner, Compiler, Prompt Engineer) to a local model to save cost.

---

## 4. Open the workspace

1. Clone World-Forge: `git clone https://github.com/AndreiNicu/world-forge.git`
2. In VS Code: **File → Open Folder → World-Forge/** (or open your world-project folder that contains a copy of `workflows/`, `templates/`, `agent_roles/`, and `Notes_On_functionality.md`).
3. Confirm the file tree shows `workflows/world-forge.md`. If it does not, Kilo will not find the orchestrator when you type `/worldforge start`.

---

## 5. (Recommended) Define custom agents per phase

You *can* run the entire pipeline from Kilo's default **Code** agent — it will read `workflows/world-forge.md` and switch personas internally as the orchestrator dispatches each phase. This works on a first run. On a longer run (multiple arcs, multiple characters, intimacy in scope), persona drift becomes a real cost: the top-level agent's accumulated context bleeds into later phases and the Editor starts being too lenient because the Architect's framing is still warm in its head.

Custom agents pin a specific system-prompt file per persona, so the persona is reset cleanly when the orchestrator dispatches the next phase. This is the Kilo equivalent of Roo's per-mode pinning.

### 5.1 Where custom agents are defined

Kilo reads agent definitions from a JSONC config:

- **Project-scoped (recommended):** `./.kilo/kilo.jsonc` at the workspace root.
- **Global:** `~/.config/kilo/kilo.jsonc`.

Project-scoped wins when both exist, so put the World-Forge agent set in the project file.

### 5.2 A minimal World-Forge agent set

Create `./.kilo/kilo.jsonc` with one entry per pipeline phase. Each agent points at its corresponding `agent_roles/` markdown file as its system prompt and references a provider-prefixed model ID.

**Important:** The `"model"` field requires the **provider-prefixed** form (`<provider_id>/<model_id>`) — bare IDs are silently rejected. The exact `provider_id` is whatever Kilo assigned when you saved your provider in §3 (`anthropic` for direct Anthropic, `openrouter` for OpenRouter, `nano-gpt` for Nano-GPT, `ollama` / `lmstudio` / `openai-compatible` for local). The example below shows two flavors — pick the one that matches your §3 provider, or remix.

**Direct Anthropic flavor** — simplest, no aggregator caching risk:

```jsonc
{
  "agent": {
    "WorldForge-Interviewer": {
      "systemPromptFile": "agent_roles/00_The_Interviewer.md",
      "model": "anthropic/claude-sonnet-4-6"
    },
    "WorldForge-Refiner": {
      "systemPromptFile": "agent_roles/01_The_Refiner.md",
      "model": "anthropic/claude-sonnet-4-6"
    },
    "WorldForge-Architect": {
      "systemPromptFile": "agent_roles/02_The_Architect.md",
      "model": "anthropic/claude-opus-4-7"
    },
    "WorldForge-Editor": {
      "systemPromptFile": "agent_roles/03_The_Editor.md",
      "model": "anthropic/claude-opus-4-7"
    },
    "WorldForge-VoiceAuditor": {
      "systemPromptFile": "agent_roles/03b_The_Voice_Auditor.md",
      "model": "anthropic/claude-opus-4-7"
    },
    "WorldForge-ArcAuditor": {
      "systemPromptFile": "agent_roles/03c_The_Arc_Transition_Auditor.md",
      "model": "anthropic/claude-opus-4-7"
    },
    "WorldForge-IntimacyAuditor": {
      "systemPromptFile": "agent_roles/03d_The_Intimacy_Auditor.md",
      "model": "anthropic/claude-opus-4-7"
    },
    "WorldForge-Compiler": {
      "systemPromptFile": "agent_roles/04_The_Compiler.md",
      "model": "anthropic/claude-sonnet-4-6"
    },
    "WorldForge-PromptEngineer": {
      "systemPromptFile": "agent_roles/05_The_Prompt_Engineer.md",
      "model": "anthropic/claude-sonnet-4-6"
    },
    "WorldForge-IntimacyArchitect": {
      "systemPromptFile": "agent_roles/06_The_Intimacy_Architect.md",
      "model": "anthropic/claude-opus-4-7"
    }
  }
}
```

**OpenRouter flavor** — same structure, OpenRouter model IDs (which are themselves provider-prefixed in OpenRouter's catalog, so the final `"model"` string contains two slashes — `openrouter/<openrouter_catalog_id>`):

```jsonc
{
  "agent": {
    "WorldForge-Interviewer": {
      "systemPromptFile": "agent_roles/00_The_Interviewer.md",
      "model": "openrouter/anthropic/claude-sonnet-4-6"
    },
    "WorldForge-Architect": {
      "systemPromptFile": "agent_roles/02_The_Architect.md",
      "model": "openrouter/anthropic/claude-opus-4-7"
    },
    "WorldForge-Editor": {
      "systemPromptFile": "agent_roles/03_The_Editor.md",
      "model": "openrouter/anthropic/claude-opus-4-7"
    },
    "WorldForge-Compiler": {
      "systemPromptFile": "agent_roles/04_The_Compiler.md",
      "model": "openrouter/deepseek/deepseek-chat-v4"
    }
    // ... etc.
  }
}
```

The exact double-prefix concatenation Kilo uses for OpenRouter (`openrouter/<catalog_id>` vs `openrouter/anthropic/claude-opus-4-7` as a single token) can differ slightly between Kilo builds. After saving, open the Kilo agent picker — if your `WorldForge-*` agents show "Unknown model" or fall back to Auto Free, the prefix concatenation is wrong; click the model field in the agent panel and copy the literal string Kilo shows for that model when you select it manually, then paste that back into `kilo.jsonc`.

**Mixing providers per agent.** You can route different agents to different providers in the same file — e.g., creative phases on direct Anthropic for cache reliability, the Compiler on OpenRouter's cheaper DeepSeek route — by giving each agent a `"model"` string with its own provider prefix. Both providers must be registered in your global Kilo settings first.

The orchestrator (`workflows/world-forge.md`) will dispatch the right persona at the right time as long as the agent names are discoverable to Kilo's top-level Code agent. If your Kilo build uses a different schema key (e.g., `subagents` instead of `agent`, or `system_prompt` instead of `systemPromptFile`), the docs page **Settings → Agent Behaviour → Agents** in your Kilo install is the authoritative reference — the structure above is the conceptual shape, not a guaranteed schema.

### 5.3 Verify the agents loaded

After saving `kilo.jsonc`:

1. Reload VS Code (or use **Kilo Code: Reload Configuration** from the command palette if your build exposes it).
2. Open the Kilo sidebar and check the agent picker — your `WorldForge-*` agents should appear alongside Code / Plan / Debug.

If they do not appear, the JSONC is likely malformed — Kilo silently ignores invalid entries. Validate the file with a JSONC linter before debugging further.

---

## 6. (Optional) Workspace hints for Kilo

Kilo reads two optional files from the workspace root:

- **`AGENTS.md`** — project-level instructions that apply across all agents. World-Forge already ships `CLAUDE.md` which serves the same purpose for Anthropic-aligned tooling. If you want Kilo to honor the same standing context, you can symlink or copy `CLAUDE.md` to `AGENTS.md`, or write a short `AGENTS.md` that points at it:

  ```markdown
  # Project AGENTS.md
  See CLAUDE.md for the full project context, architectural principles, and editing protocol. All of it applies here.
  ```

- **`.kilocodeignore`** — file-access denylist (glob patterns, gitignore-style). World-Forge does not currently require any specific entries. If you maintain a `.gitignore` already, Kilo will not honor it automatically — duplicate any patterns you want Kilo to respect.

Neither file is required to run the pipeline.

---

## 7. First run

1. In the Kilo sidebar, select the **Code** agent (or your `WorldForge-Interviewer` if you defined custom agents).
2. In the chat, type:
   ```
   /worldforge start
   ```
3. The orchestrator should respond as the Interviewer. If it instead asks something like *"what would you like to build?"*, see [§10 Troubleshooting](#10-troubleshooting).
4. Answer the Interviewer's questions. Phase 0 takes the most user time of any phase — 30–60 minutes for a fresh world. Five minutes of friction here saves an hour of debugging at the runtime stage (see the [README quick start](../README.md#quick-start)).
5. Subsequent phases dispatch automatically, pausing at the [pause gates documented in the README](../README.md#pause-gates).
6. When Phase 5 completes, your `Export/` directory contains SillyTavern-importable JSON. If `Prompt_Engineer_Audit.md` lists recommendations, apply them manually per `workflows/world-forge.md` Phase 5.5 before importing.

---

## 8. Auto-approval (optional, advanced)

If you trust the pipeline to write files without per-write confirmation prompts, configure **Settings → Auto-Approving Actions** in the Kilo sidebar:

- **Read** — safe to auto-approve broadly.
- **Edit / Write** — scope to the workspace folder. World-Forge writes to `Drafts/`, `Export/`, `UNRESOLVED_QUESTIONS.md`, `UNRESOLVED_INTIMACY.md`, and audit-report files. Pipeline files (`agent_roles/`, `templates/`, `workflows/`, `Notes_On_functionality.md`) are read-only at runtime — if Kilo asks to edit one of those, **deny** and surface the request: it indicates an agent went off-script.
- **Bash / Terminal** — leave off. The pipeline never executes shell commands.

You can also scope auto-approval per agent in `kilo.jsonc` if your build supports it.

---

## 9. MCP servers — none required

Kilo Code supports Model Context Protocol servers, and it is tempting to install one or more on the assumption that World-Forge will benefit. **It will not.** The pipeline is deliberately self-contained in markdown: it reads agent specs, writes drafts and JSON outputs, and does not hit the web, execute code, query databases, or talk to external services. Built-in file edit tools cover the entire surface.

Adding MCP servers imports complexity for no documented benefit and creates new failure modes (prompt drift from extra tool descriptions, version skew, opaque debugging when validation suddenly stops firing).

**Specifically not recommended:**

- **Iron Manus MCP** ([`dnnyngyen/iron-manus-mcp`](https://github.com/dnnyngyen/iron-manus-mcp)) is sometimes suggested because it brands itself as a multi-phase orchestrator with role-based agents — superficially similar to World-Forge's shape. In practice it is a wrong fit: it is **archived as of February 2026** (no longer maintained), it is built around web-API discovery (`APITaskAgent`) and Python execution (`PythonComputationalTool`) which the pipeline does not use, and its 8-phase FSM duplicates the orchestration already encoded in `workflows/world-forge.md`. Two orchestrators competing for control is worse than one.

**Other MCP categories and how they fit:**

| MCP type | Verdict | Reason |
|---|---|---|
| Filesystem MCP | Skip | Kilo's built-in file tools already cover read/write/diff. |
| Memory or knowledge-graph MCP (e.g., mem0) | Skip | The pipeline uses files as memory by design (`Master_Design.md`, `Drafts/`, audit reports). A separate store competes with that. |
| Sequential-thinking MCP | Skip | Opus 4.7 and Sonnet 4.6 already produce structured reasoning natively on long agent specs. Adds latency for marginal gain. |
| Web fetch / search MCP | Marginal | Useful for *you* during Phase 0 worldbuilding research, but unused once the pipeline runs. Install standalone if you want it for personal use, not as a World-Forge dependency. |
| Git MCP | Marginal | Nice-to-have for committing between phases. The VS Code terminal `git` command already does this. |
| SQLite / Postgres / API integration MCPs | Skip | Out of scope. |

If a future MCP server emerges that genuinely fits the pipeline's shape (for example, a SillyTavern-import validator that round-trips `Export/*.json` against ST's actual loader), this page will be updated. Until then, the answer is: install none.

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Agent ignores `/worldforge start` and asks "what would you like to build?" | Kilo did not read `workflows/world-forge.md` — usually the workspace root is wrong, or the file is excluded by `.kilocodeignore`. | Verify the workspace root contains `workflows/world-forge.md`. Check `.kilocodeignore` for accidental coverage. |
| Custom `WorldForge-*` agents do not appear in the agent picker | `./.kilo/kilo.jsonc` is malformed (Kilo silently drops invalid entries) **or** the schema keys do not match your Kilo build. | Validate the JSONC. Open **Settings → Agent Behaviour → Agents** to see the canonical field names for your version, and adjust. |
| Editor and Auditors agree with the Architect on round 1 | The custom agents are pointing at the wrong `systemPromptFile` (a frequent copy-paste mistake), or your Editor model is too small or sycophantic. | Open the agent in Kilo's agent panel and verify the loaded system prompt is the right `agent_roles/*.md` file. Bump the Editor and Auditor models to Opus 4.7 if not already. |
| Phase 4 JSON output is sparse, missing the `{{original}}` macro from `system_prompt` / `post_history_instructions` | A flash-tier model is being used for the Compiler. | Switch `WorldForge-Compiler` to Sonnet 4.6 or better. The Compiler emits verbatim content; summarization-prone models silently drop macros and break the override architecture. See [§3.2 Not recommended](./Agentic-Tools-and-Models.md#32-recommended-tiers). |
| Persona bleed: the Editor sounds like the Architect | The top-level Code agent ran the phases inline instead of dispatching subagents. | Define custom agents per phase (§5 above) and re-run from the affected phase with `/worldforge resume phase[N]`. |
| Context-window errors in Phase 3+ | The model has < 200K context, or Kilo is auto-including too many workspace files. | Use a 200K+ model. Reduce auto-included files via `.kilocodeignore` for paths that are noise (e.g., `Samples/` if you do not want them in scope). |
| Costs much higher than expected on OpenRouter; OpenRouter dashboard shows 0% cache hits despite long stable system prompts | Anthropic prompt-cache markers are not round-tripping cleanly through OpenRouter to the upstream. Known ecosystem issue with no Kilo-specific fix as of May 2026. | Verify cache-hit rate on the OpenRouter dashboard after the first 2–3 phases. If it stays at 0%, switch the affected agents from `openrouter/anthropic/...` to direct `anthropic/...` (§3.1) — you keep Kilo and the same models, just lose the OpenRouter wallet abstraction. |
| `WorldForge-*` agents show "Unknown model" or fall back to Auto Free in the picker | Wrong `provider_id/model_id` concatenation in `kilo.jsonc` (especially for OpenRouter, where the catalog ID is itself provider-prefixed). | Open the agent in Kilo's panel, click the model field, manually select your intended model, and copy the literal string Kilo displays. Paste that exact string into the `"model"` field in `kilo.jsonc`. |
| Reasoning Effort / Tool Call Style toggles missing on Nano-GPT | Known open Kilo bug ([#4451](https://github.com/Kilo-Org/kilocode/issues/4451)). Not a configuration error on your end. | The pipeline does not require these toggles. If you need them, switch the affected agents to a different provider until the bug is fixed upstream. |
| Local model (Ollama / LM Studio) loops, mis-calls tools, or produces malformed JSON in Phase 4 | The local model is below the capability floor the pipeline needs. Kilo's own docs note small local models loop and mis-call tools. | Route at least the creative and Compiler phases to a hosted provider (Anthropic direct, OpenRouter, or Nano-GPT). Local is acceptable only for the Refiner and Prompt Engineer if at all. |

---

## 11. Where to next

- [`Agentic-Tools-and-Models.md`](./Agentic-Tools-and-Models.md) — tool comparison, model selection per phase, why Claude Code is not currently recommended.
- [`../tutorial.md`](../tutorial.md) — full pipeline walkthrough using the Lucifer worked example.
- [`../CLAUDE.md`](../CLAUDE.md) — architectural principles (Three-Tier Lorebook, Override Architecture, Audit-vs-Apply Separation). Worth reading once before your first run so you can recognize when an agent goes off-script.

If you discover that a Kilo Code feature or setting has changed and this page is out of date, please open an issue or PR — Kilo's release cadence is fast and the docs here are best-effort against current builds.
