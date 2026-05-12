# Agentic Tools and Models for World-Forge

This page covers which agentic VS Code extensions can drive the World-Forge pipeline, how to configure them, and which underlying LLMs perform well in each phase. It is aimed at users who already understand what the pipeline does (see the [README](../README.md) and [tutorial.md](../tutorial.md)) and want to set up the *runtime environment* that executes it.

> **TL;DR** — The pipeline was designed against **Roo Code in Orchestrator mode**, which remains the strongest fit. **Cline** and **Kilo Code** work well as alternatives. The pipeline is **not** optimized for code-focused agents like Claude Code — see [Why Claude Code is a poor fit](#why-claude-code-is-a-poor-fit-currently). For the underlying LLM, prefer literary-register models (Claude Opus / Sonnet, GPT-5, Gemini 2.5 Pro) over coding-tuned variants.

---

## 1. What the pipeline asks of an agentic tool

World-Forge is not application code. It is a set of markdown agent specifications, templates, and an orchestrator (`workflows/world-forge.md`) that an external agentic IDE extension reads and executes. For a tool to drive the pipeline well, it needs:

1. **File read/write tools** across the workspace (the agents produce `Drafts/*.md` and `Export/*.json` artifacts).
2. **Multi-step, multi-file autonomy** — phases run sequentially and each phase consumes the previous phase's outputs.
3. **Long-context tolerance** — by Phase 3 the working set (Master Design + all drafts + Notes_On_functionality.md) can exceed 100K tokens.
4. **Per-phase persona or mode switching** — each agent in `agent_roles/` is a *different* persona with different rules. Tools that can swap system prompts or modes mid-run handle this cleanly.
5. **A trigger-command convention** — the pipeline is driven by `/worldforge start`, `/worldforge resume phase[N]`, etc. The tool needs to let you type free-form instructions that the executing agent interprets against `workflows/world-forge.md`.

You do **not** need: code execution, terminal automation, build/test integration, or git automation. Nothing in the pipeline runs code.

---

## 2. Supported agentic tools

### 2.1 Roo Code (recommended — reference tool)

[Roo Code](https://github.com/RooCodeInc/Roo-Code) is the tool the pipeline was authored against. Its **Orchestrator mode** is the load-bearing feature: it lets a top-level "orchestrator" agent delegate subtasks to specialized "worker" agents, which maps cleanly onto World-Forge's phase-by-phase persona swaps.

**Why it fits:**
- Orchestrator mode treats each phase's persona (`agent_roles/00_The_Interviewer.md`, `agent_roles/02_The_Architect.md`, etc.) as a distinct subtask with its own system prompt. You don't have to manually re-prime the agent between phases.
- Strong file-edit toolchain (read, write, diff, search-and-replace) — required for the Architect's draft files and the Compiler's JSON output.
- Supports any OpenAI-compatible API endpoint, so you can route to Anthropic, OpenAI, Google, OpenRouter, or a local server.
- Custom modes — useful if you want, e.g., a dedicated "Editor" mode with read-only filesystem access mirroring the [Audit-vs-Apply separation](../CLAUDE.md#3-audit-vs-apply-separation).

**Setup:**
1. Install the Roo Code extension from the VS Code marketplace.
2. Open this repository (or your world project that includes a copy of `workflows/`, `templates/`, `agent_roles/`, and `Notes_On_functionality.md`) as the VS Code workspace.
3. In Roo Code's settings, configure your model provider (see [§3](#3-model-recommendations)).
4. Switch to **Orchestrator** mode.
5. In the chat, type `/worldforge start`.

**Tip:** If you have the budget, define a custom mode per phase that pins the system prompt to the matching agent spec file (e.g., a "WorldForge-Architect" mode pinned to `agent_roles/02_The_Architect.md`). This reduces drift on long runs.

### 2.2 Cline

[Cline](https://github.com/cline/cline) (formerly Claude Dev) is a simpler, single-mode agentic extension. It runs the pipeline competently but without per-phase mode switching — you rely on the orchestrator file to keep the agent on-script.

**Why it works:**
- File read/write tools are robust and well-tested.
- Conservative auto-approval defaults make it easy to step through each phase manually, which is useful during your first run.
- Wide model provider support (Anthropic, OpenAI, Bedrock, Vertex, OpenRouter, local).

**Tradeoffs vs. Roo Code:**
- No native Orchestrator mode. The agent stays in one persona across the run, so you depend on `workflows/world-forge.md` to instruct it to "now act as the Editor" at the right moment. In practice this works but is more prone to persona bleed on long runs.
- No custom modes — you can't enforce read-only filesystem access for auditor phases at the tool level; you depend on the auditor agent specs themselves to honor the [Audit-vs-Apply separation](../CLAUDE.md#3-audit-vs-apply-separation).

**Setup:**
1. Install Cline from the VS Code marketplace.
2. Configure your model provider in Cline settings.
3. Open the workspace and type `/worldforge start` in the chat.

**Recommendation:** Good first-time choice if you want a simpler tool with fewer knobs. Migrate to Roo Code's Orchestrator mode once you're comfortable with the pipeline's structure.

### 2.3 Kilo Code

[Kilo Code](https://github.com/Kilo-Org/kilocode) is an open-source fork that merges features from Roo Code and Cline. It has Orchestrator-equivalent functionality and the same file-edit tools.

**Why consider it:**
- Open source under a permissive license — useful if you want to audit or extend the tool itself.
- Feature-compatible with Roo Code for the pipeline's purposes (modes, orchestration, file edits).
- Active development cadence and rapid uptake of new model APIs.

**Tradeoffs:**
- Smaller community than Roo Code or Cline, so fewer third-party guides and prompts.
- If you encounter a bug, you may be filing it upstream rather than finding an existing issue.

**Setup:** Same shape as Roo Code — install, configure provider, switch to its orchestrator-equivalent mode, run `/worldforge start`.

### 2.4 Compatibility summary

| Tool | Orchestrator / multi-mode | File edit tools | Custom modes | Recommended for |
|---|---|---|---|---|
| **Roo Code** | Yes (Orchestrator) | Yes | Yes | Production runs, long pipelines, repeat users |
| **Cline** | No (single-mode) | Yes | No | First-time users, simpler runs |
| **Kilo Code** | Yes (orchestrator-equivalent) | Yes | Yes | Users who want an open-source Roo Code alternative |

---

## 3. Model recommendations

The pipeline is unusually demanding of the underlying LLM. Most phases are *literary* tasks (prose drafting, voice consistency, character psychology, tonal register) rather than *engineering* tasks. Choose models accordingly.

### 3.1 What to optimize for

- **Literary register** — the model must hold tone across many turns. The Editor and Voice Auditor explicitly grade this.
- **Character psychology** — the Architect and Intimacy Architect produce prose that depicts internal states, contradiction, trauma response, and shifting registers across arcs. Models that flatten everything to "helpful assistant" voice will fail Phase 3.5.
- **Long context** — Phase 3+ work easily exceeds 100K input tokens once drafts, Notes_On_functionality, and arc files are loaded.
- **Instruction adherence under length** — agent specs are long (some over 1000 lines). Models that "lose the system prompt" after a few thousand tokens of conversation will silently drift off-architecture.

### 3.2 Recommended tiers

**Strongest fit for creative phases (Interviewer, Architect, Editor, all Auditors, Intimacy Architect):**
- **Claude Opus 4.7** — best literary register and characterization currently available; expensive but worth it for the auditor phases where false negatives are costly.
- **Claude Sonnet 4.6** — the best price/quality balance for the bulk of the run. The pipeline was authored against Sonnet-class models and works well end-to-end on it.
- **GPT-5** — strong literary capability, very long context. Slightly more "instructed" feel than Claude in prose registers; sometimes over-explains.
- **Gemini 2.5 Pro** — excellent at long-context cross-reference work (useful for the Editor's cross-tier validation). Prose register is acceptable but tends toward neutral; pair with explicit tonal directives.

**Acceptable for utility phases (Refiner classification, Compiler JSON transformation, Prompt Engineer block assembly):**
- Claude Haiku 4.5 — cheap and fast, sufficient for structured-output transformations where literary judgment is not required.
- GPT-4.1 mini / GPT-5 mini — similar role.

**Not recommended:**
- Small open-weights models (7B–13B) — context handling and instruction adherence are insufficient for the multi-phase orchestration.
- Coding-tuned model variants — same failure mode as Claude Code (see below): voice flattens, characterization gets generic.
- Models without ~200K usable context — you will hit context limits in Phase 3.

### 3.3 Mixing models across phases

If your agentic tool supports per-mode model configuration (Roo Code and Kilo Code do), a cost-effective pattern is:

| Phase | Suggested model |
|---|---|
| Phase 0 (Interviewer) | Sonnet 4.6 |
| Phase 1 (Refiner) | Sonnet 4.6 or Haiku 4.5 |
| Phase 2 / 2.5 (Architect / Intimacy Architect) | Opus 4.7 or Sonnet 4.6 |
| Phase 3 (Editor) | Opus 4.7 |
| Phase 3.5 / 3.6 / 3.7 (Auditors) | Opus 4.7 |
| Phase 4 (Compiler) | Sonnet 4.6 or Haiku 4.5 |
| Phase 5 (Prompt Engineer) | Sonnet 4.6 |

Spend the most where the literary judgment is most load-bearing (Architect, Editor, Auditors). Save on structural transformation phases.

---

## 4. Why Claude Code is a poor fit (currently)

[Claude Code](https://claude.com/claude-code) is Anthropic's official CLI agent. It is excellent at software engineering. It is **not** a good driver for this pipeline, for reasons unrelated to the underlying model.

The issues are at the agent-harness level, not the model level:

1. **System prompt orientation.** Claude Code's harness primes the model toward "software engineering tasks": bug fixing, refactoring, code review, dependency management. The pipeline's phases — especially the Architect, Editor, and Auditors — are *creative writing* tasks. The harness's "be concise, edit files, run tests, commit" framing actively works against the literary register the pipeline needs.

2. **Discouraged narration and comments.** Claude Code is tuned to write terse code without commentary. Phase 2 (Architect) and Phase 3 (Editor) produce drafts that *are* commentary — long prose, descriptive passages, tonal register notes. The harness frequently shortens or strips this content.

3. **Code-quality reflexes applied to prose.** When the Editor or Architect produces a long, deliberately dense character description, Claude Code's harness instincts (DRY, "remove redundant content," "extract to a helper") fire inappropriately. Prose redundancy is sometimes intentional (e.g., the [ARC_STATE two-subsection structure](../CLAUDE.md#5-arc_state-two-subsection-structure) repeats some content across the descriptive and directive subsections — this is load-bearing, not a bug).

4. **No native multi-persona mode.** Unlike Roo Code's Orchestrator, Claude Code expects a single coherent task scope per session. Re-priming it with a different persona spec mid-run is awkward and the previous persona bleeds through.

5. **Tool surface is wrong for the job.** Claude Code's strengths (Bash execution, git integration, type checking, build tools) are unused here. Its weaknesses for this use case (terse output, code-style reflexes) are exposed every turn.

The *model* under Claude Code (Claude Opus / Sonnet) is in fact the best model for the pipeline. The issue is the harness. Run the same model through Roo Code, Cline, or Kilo Code and the experience is materially different — the agent reads agent specs as creative-writing instructions rather than as engineering tickets, and the prose output matches the pipeline's register expectations.

> **Future note:** If a future Claude Code release supports custom personas or a "creative-writing" mode that swaps the orientation, this guidance would change. As of writing, it does not.

---

## 5. Other tools and IDEs (briefly)

These are not the recommended path but come up often enough to be worth a sentence each:

- **Cursor / Windsurf** — separate IDEs (VS Code forks), not extensions. They can run the pipeline, but their agent UX is optimized for in-editor coding rather than long agentic runs. Workable but not recommended over Roo Code.
- **GitHub Copilot (Agent mode)** — the agent mode is improving but is currently weaker on long-context multi-file orchestration than Roo Code or Cline.
- **Continue** — primarily a chat / inline-edit assistant, not an agentic orchestrator. Insufficient for the pipeline.
- **Aider** — CLI, not VS Code. Works if you prefer the terminal, but loses the workspace file tree affordance the pipeline assumes.
- **Antigravity** (Google) — early-stage agentic IDE platform. May be a future option as it matures.

---

## 6. Troubleshooting setup

| Symptom | Likely cause | Fix |
|---|---|---|
| Agent ignores `/worldforge start` and asks "what would you like to build?" | Tool didn't read `workflows/world-forge.md` — usually because the workspace root isn't this repo, or the file isn't visible. | Open this repo (or your world project containing it) as the VS Code workspace root. Confirm `workflows/world-forge.md` exists and is readable. |
| Agent jumps phases or skips auditors | Single-mode tool (e.g., Cline) lost the orchestrator instructions after a long Phase 2. | Re-prime with `/worldforge resume phase[N]`. Consider switching to Roo Code Orchestrator mode for longer worlds. |
| Voice is flat, generic, "AI-assistant" register | Wrong model tier or wrong tool harness. | Switch to Sonnet 4.6 or Opus 4.7. If already on those models via Claude Code, switch tools to Roo Code or Cline. |
| Editor passes everything on round 1 | Model is being sycophantic (often a small or coding-tuned model). | Switch to a stronger creative model. Verify the Editor agent spec is being loaded. |
| Context-window errors in Phase 3+ | Model has insufficient context. | Use a 200K+ context model. Verify the tool isn't loading every file in the workspace by default (some tools auto-include too much). |

---

## 7. Summary

- **Tool:** Roo Code (Orchestrator mode) is the reference. Cline and Kilo Code are valid alternatives. Claude Code is not currently recommended.
- **Model:** Spend on Opus 4.7 / Sonnet 4.6 / GPT-5 / Gemini 2.5 Pro for creative phases. Use cheaper models for the Refiner, Compiler, and Prompt Engineer if you want to save cost.
- **Setup:** Open this repo as a VS Code workspace, configure your tool's model provider, switch to orchestrator mode if available, type `/worldforge start`.

If you discover a tool not listed here that works well, please open an issue or PR against this page.
