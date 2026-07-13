# Running World-Forge under Antigravity

**ES6 SANDBOX SCRIPTING CONSTRAINTS**: If your phase involves evaluating, compiling, or interacting with JanitorAI JS logic, you MUST strictly respect the ES6 Sandbox limits:
- **Blocked**: `async`, `fetch`, `Promise`, `window`, `document`, `setTimeout`, and all external I/O.
- **Allowed**: String methods (`.includes`), Array methods (`.map`, `.filter`), Math, and Regex.
- **Editable context**: Only `context.character.personality` and `context.character.scenario` can be mutated.
- **Memory Scanning**: Always use `context.chat.last_messages.slice(-X)` for multi-message progression rather than just `last_message`.


A setup tutorial for users who want to drive the World-Forge pipeline with **Antigravity**, the newly recommended tool (replacing the deprecated Kilo Code and Roo Code).

---

## 1. Why Antigravity works for World-Forge

The pipeline asks four things of a runtime tool: file read/write across the workspace, multi-step autonomy, long-context tolerance, and per-persona configurability. Antigravity provides all four natively:

- **File-edit tools** — robust reading, writing, and search-and-replace capabilities.
- **Skill Engine (Subagents)** — Antigravity automatically discovers and loads skills from the `.agents/skills/` directory. Each phase of the pipeline is mapped to a skill (e.g., `WorldForge-Architect`, `WorldForge-Editor`). When the orchestrator specifies a phase, Antigravity natively adopts the persona and loads the appropriate `agent_roles/*.md` instructions.
- **No manual configuration** — Unlike legacy tools that required manually configuring `kilo.jsonc` files and UI-based agent pickers, Antigravity reads the skills automatically. You just open the workspace and go.

---

## 2. Install and Configure Antigravity

1. Open VS Code → Extensions panel → search for **Antigravity**.
2. Install the extension.
3. Configure your API key and model selection within the Antigravity settings.
   - **Recommended Models:** DeepSeek 4 Pro or Claude 3.5 Sonnet (Opus 4.7 is also excellent for Editor and Auditor phases).
   - Ensure the model has a large context window, as the pipeline specs are dense.

---

## 3. Open the workspace

1. Clone World-Forge: `git clone https://github.com/AndreiNicu/world-forge.git`
2. In VS Code: **File → Open Folder → World-Forge/** 
3. Confirm the file tree shows `.agents/skills/` and `workflows/world-forge.md`. 

---

## 4. Run the Pipeline

1. Open the Antigravity chat panel.
2. Type:
   ```
   /worldforge start
   ```
3. The orchestrator triggers Phase 0, and Antigravity automatically dispatches to the `WorldForge-Interviewer` skill.
4. Answer the Interviewer's questions. (Phase 0 takes the most user time of any phase — 30–60 minutes for a fresh world).
5. Subsequent phases dispatch automatically based on the workflows, pausing at the pause gates documented in the README.
6. **Phase 6** generates your JanitorAI integrations automatically after the core `Export/` JSON is finalized.

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Antigravity ignores `/worldforge start` | The workspace root is wrong, or the skills did not load. | Verify the workspace root contains `.agents/skills/`. Reload the VS Code window to force skill discovery. |
| Context-window errors in Phase 3+ | The model has a small context limit. | Switch to a model with at least a 200K token window. Antigravity's skill engine keeps context clean per phase, but large worlds still require high context limits. |
| Malformed JSON in Phase 4 | The model is summarizing or below the capability floor. | Ensure you are using a frontier model (DeepSeek V3+, Claude 3.5 Sonnet+) rather than a small local model. |

---

## 6. Where to next

- [`Agentic-Tools-and-Models.md`](./Agentic-Tools-and-Models.md) — Tool comparison and model selection guidance.
- [`../tutorial.md`](../tutorial.md) — Full pipeline walkthrough using the Lucifer worked example.
- [`../CLAUDE.md`](../CLAUDE.md) — Architectural principles. Worth reading once before your first run so you can recognize when an agent goes off-script.
