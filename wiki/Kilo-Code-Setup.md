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

1. Click the Kilo Code icon in the activity bar. The Kilo sidebar opens.
2. Click the **gear icon** in the sidebar header.
3. Under **API Provider**, pick your provider (Anthropic, OpenAI, OpenRouter, Google, Bedrock, Vertex, local OpenAI-compatible endpoint, etc.).
4. Paste your API key into the provider-specific field.
5. Save.

Provider settings apply globally across the sidebar agents and any custom agents you define.

**Model picks for World-Forge.** See [§3.2 of the tools wiki page](./Agentic-Tools-and-Models.md#32-recommended-tiers). Short version: Opus 4.7 or Sonnet 4.6 for creative phases, Haiku 4.5 acceptable for the Refiner / Compiler / Prompt Engineer. **Do not** use Flash-tier models for the Compiler — see the [Phase 4 caveat](./Agentic-Tools-and-Models.md#32-recommended-tiers).

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

Create `./.kilo/kilo.jsonc` with one entry per pipeline phase. Each agent points at its corresponding `agent_roles/` markdown file as its system prompt. Example sketch (adapt to your installed Kilo version's exact schema — open Kilo's **Settings → Agent Behaviour → Agents** panel to confirm field names before pasting):

```jsonc
{
  "agent": {
    "WorldForge-Interviewer": {
      "systemPromptFile": "agent_roles/00_The_Interviewer.md",
      "model": "claude-sonnet-4-6"
    },
    "WorldForge-Refiner": {
      "systemPromptFile": "agent_roles/01_The_Refiner.md",
      "model": "claude-sonnet-4-6"
    },
    "WorldForge-Architect": {
      "systemPromptFile": "agent_roles/02_The_Architect.md",
      "model": "claude-opus-4-7"
    },
    "WorldForge-Editor": {
      "systemPromptFile": "agent_roles/03_The_Editor.md",
      "model": "claude-opus-4-7"
    },
    "WorldForge-VoiceAuditor": {
      "systemPromptFile": "agent_roles/03b_The_Voice_Auditor.md",
      "model": "claude-opus-4-7"
    },
    "WorldForge-ArcAuditor": {
      "systemPromptFile": "agent_roles/03c_The_Arc_Transition_Auditor.md",
      "model": "claude-opus-4-7"
    },
    "WorldForge-IntimacyAuditor": {
      "systemPromptFile": "agent_roles/03d_The_Intimacy_Auditor.md",
      "model": "claude-opus-4-7"
    },
    "WorldForge-Compiler": {
      "systemPromptFile": "agent_roles/04_The_Compiler.md",
      "model": "claude-sonnet-4-6"
    },
    "WorldForge-PromptEngineer": {
      "systemPromptFile": "agent_roles/05_The_Prompt_Engineer.md",
      "model": "claude-sonnet-4-6"
    },
    "WorldForge-IntimacyArchitect": {
      "systemPromptFile": "agent_roles/06_The_Intimacy_Architect.md",
      "model": "claude-opus-4-7"
    }
  }
}
```

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

---

## 11. Where to next

- [`Agentic-Tools-and-Models.md`](./Agentic-Tools-and-Models.md) — tool comparison, model selection per phase, why Claude Code is not currently recommended.
- [`../tutorial.md`](../tutorial.md) — full pipeline walkthrough using the Lucifer worked example.
- [`../CLAUDE.md`](../CLAUDE.md) — architectural principles (Three-Tier Lorebook, Override Architecture, Audit-vs-Apply Separation). Worth reading once before your first run so you can recognize when an agent goes off-script.

If you discover that a Kilo Code feature or setting has changed and this page is out of date, please open an issue or PR — Kilo's release cadence is fast and the docs here are best-effort against current builds.
