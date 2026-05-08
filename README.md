# World-Forge

*A multi-agent pipeline for building immersive roleplay worlds for [SillyTavern](https://github.com/SillyTavern/SillyTavern).*

World-Forge takes you from a raw idea to a complete, runtime-ready world package: character cards, a tiered lorebook system, a chat completion preset, and audit reports — all aligned with how SillyTavern actually assembles prompts at runtime. The pipeline is a sequence of specialized agents, each with a defined role, that walks you through five-plus phases of structured drafting, validation, and export.

The repository **is** the pipeline. There is no application code to compile, no service to deploy, no dependencies. The agents are markdown specifications consumed at runtime by an agentic IDE extension (typically [Roo Code](https://github.com/RooCodeInc/Roo-Code) in Orchestrator mode) running inside VS Code. When you invoke `/worldforge start`, the orchestrator reads these specifications and dispatches each phase.

## What this is NOT

- **Not a SillyTavern fork.** SillyTavern is the runtime that consumes World-Forge's outputs. World-Forge does not modify SillyTavern.
- **Not a runtime engine.** The pipeline does not execute on its own — it is consumed by an agentic IDE extension that orchestrates LLM calls.
- **Not application code.** Editing files here is editing markdown specs, not source code. There is nothing to build or deploy.

## What it produces

A complete SillyTavern-ready package per world:

- **One Character Card per AI-played character** (V3 spec JSON) — psychology, voice, and behavioral mandates wired against the override architecture, with optional `depth_prompt` for mid-context reinforcement.
- **One World Lorebook (Tier 1)** — permanent arc-agnostic world truths: rules, factions, locations, species, concepts.
- **One Character Lorebook per character (Tier 2)** — permanent reference data: physical baseline, psychological dimensions, relationships.
- **One Protagonist Lorebook (Tier 2)** — `{{user}}` identity reference, linked to your active SillyTavern Persona after import.
- **One Intimacy Profile per character with intimate scenes (Tier 2, conditional)** — permanent intimate substrate.
- **One Arc Lorebook per arc (Tier 3)** — modular and swap-in: ARC_STATE, CHARACTER_STATE, NPC behavioral shifts, dramatic beats, tension entries.
- **One Arc Intimacy Register per arc with intimate beats (Tier 3, conditional)** — arc-specific intimate function and per-character delta.
- **One Group Lorebook** — all tiers combined and group-tagged for ST's lorebook editor.
- **One Chat Completion Preset** — the model's prompt blocks, injection order, and behavioral framework, parameterized for this world's prose conventions.
- **One audit report** — runtime risks identified by the Prompt Engineer, with recommended corrections for the user to apply manually.

## Core architectural ideas

Three architectural decisions are load-bearing across the pipeline. Understanding them helps you read the agent specs and anticipate how the pipeline behaves.

**The three-tier lorebook architecture.** Every piece of world information belongs to exactly one tier. Tier 1 is permanent and arc-agnostic (the world). Tier 2 is permanent and per-character (who the characters are). Tier 3 is modular and per-arc (what is happening right now), with only one arc lorebook active at a time. This separation is what allows long, multi-arc roleplay to maintain coherence — character state evolves through Tier 3 swaps without rewriting Tier 2.

**The override architecture.** A character card's `system_prompt` and `post_history_instructions` fields override the preset's Main Prompt and Jailbreak blocks at runtime. Every card uses the `{{original}}` macro to splice the preset's content back in, then layers character-specific content on top. The preset holds engine-level instructions (creative framework, narration discipline, formatting conventions); cards hold character identity and behavior. The Editor enforces this contract on both sides: engine instructions in cards are a hard fail; character names in the preset's Main Prompt are a hard fail.

**The Style Contract.** Each world declares its prose conventions — perspective, tense, formatting markers, paragraph register — once, in World Seed Section 1.5. The Prompt Engineer parameterizes the preset's Main Prompt from this contract. Individual cards may declare a per-card style override (typically Director or Narrator cards in single-character-perspective worlds), which the Architect emits as a structured `<style_override>` block. The Editor validates the coupling between the structured field and the block content. Worlds with no overrides produce no overrides; the mechanism scales from zero overrides to many per world.

## Pipeline phases

Each phase is run by a specialized agent. The orchestrator dispatches them in order; some are conditional, some run in parallel, and some loop until quality thresholds are met.

| Phase | Agent | What it does |
|---|---|---|
| 0 | The Interviewer | Walks you through the World Seed Template interactively. Pushes back on thin or inconsistent material. Captures the Style Contract and test scenarios. |
| 1 | The Refiner | Classifies World Seed content into Tiers 1/2/3 plus the Style Contract. Identifies gaps. Produces a locked Master Design. Halts on unresolved questions. |
| 2 | The Architect | Drafts every Markdown source: character cards, all lorebook entries, system_prompt and post_history_instructions per card, optional depth prompts. Emits `<style_override>` blocks for cards with declared overrides. |
| 2.5 | The Intimacy Architect *(conditional)* | Drafts Tier 2 Intimacy Profiles and Tier 3 Intimacy Registers from Section 8 of the World Seed. Skipped if Section 8 is empty. |
| 3 | The Editor | Iteratively validates prose quality, tier integrity, lorebook entry quality, the override architecture, and the style override coupling. Returns directives until all checks pass. |
| 3.5 | The Voice Auditor | Generates sample dialogue from the drafts and audits behavioral fidelity, voice distinctiveness, trigger-response correctness, and (in multi-perspective worlds) cross-card perspective bleed. |
| 3.6 | The Arc Transition Auditor | Verifies continuity across consecutive arc seams: state, NPC behavior, world conditions, hidden-information rules. |
| 3.7 | The Intimacy Auditor *(conditional)* | Generates sample intimate scenes and audits them for voice fidelity (does each character behave like themselves during sex?) and thematic register match (does the scene serve its declared function?). |
| 4 | The Compiler | Translates the approved Markdown drafts into SillyTavern-ready JSON files. |
| 5 | The Prompt Engineer | Audits Phase 4's output for runtime risks (read-only on `Export/`) and authors the Chat Completion Preset. Recommendations for any conflicts found are surfaced as plain-text instructions for manual application. |
| 5.5 | *(manual)* | If Phase 5 produced recommended corrections, you open each named file, apply the corrections, and save. The pipeline is complete only after this step. |

Phases 3.5 / 3.6 / 3.7 run in parallel after Phase 3 sign-off. Failures from any auditor return the affected files to the relevant Architect, then back through the Editor, then back to the auditor.

The audit/apply separation in Phase 5 is deliberate: the Prompt Engineer never modifies its own audit subject. This produces correctable mistakes rather than silent miscorrections. If you find this onerous on large worlds, the recommendations are short and structured — most apply in seconds.

## Pause gates

The pipeline pauses for user input under specific conditions:

- **Phase 1 blocker** — the Refiner found gaps requiring user answers. Logged in `UNRESOLVED_QUESTIONS.md`. Resume with `/worldforge resume phase1`.
- **Phase 2.5 blocker** — the Intimacy Architect needs Section 8 detail. Logged in `UNRESOLVED_INTIMACY.md`. Resume with `/worldforge resume phase2.5`.
- **Phase 3 stall** — the Editor returned the same files three rounds without improvement. Escalates to user; the problem is usually in the Master Design, not the Architect's execution.
- **Phase 3.7 conflict** — the Intimacy Auditor found a function/substrate contradiction at the Master Design level. You decide which side to change.
- **Phase 5 recommendations** — the Prompt Engineer found runtime risks. You apply manually before the world is ready for SillyTavern.

## Quick start

You need: VS Code with [Roo Code](https://github.com/RooCodeInc/Roo-Code) (or an equivalent agentic extension) configured with an LLM API key.

1. Clone this repository and open it as a VS Code workspace.
2. Open Roo Code and switch to **Orchestrator mode**.
3. In the chat, type:
   ```
   /worldforge start
   ```
4. The Interviewer takes over. Answer its questions; it will push back when material is thin. Five minutes of friction here saves an hour of debugging at the runtime stage.
5. Subsequent phases run automatically, pausing only at the gates listed above.
6. When Phase 5 finishes, your `Export/` directory contains SillyTavern-importable JSON. If `Prompt_Engineer_Audit.md` lists recommendations, apply them manually before importing.

## A worked example

`Samples/` contains a complete pipeline output for the "Lucifer" world: a four-arc grimdark narrative with a protagonist, a primary character (Anna), a World Director card managing NPCs, intimacy across multiple arcs, and the full lorebook system. Inspect `Samples/Drafts/` to see what each agent produces; inspect `Samples/Export/` to see the resulting SillyTavern-ready JSON. `Samples/World_Seed_Lucifer.md` is the starting point — the document you would hand to the Refiner.

## Repository structure

What you get when you clone:

```text
World-Forge/
├── README.md                     ← This file
├── tutorial.md                   ← Extended usage walkthrough
├── CLAUDE.md                     ← Standing context for AI coding agents working on the repo
├── Notes_On_functionality.md     ← Authoritative reference for SillyTavern's runtime behavior
├── agent_roles/                  ← Per-phase agent specifications (one .md per agent)
├── templates/                    ← Structural references (World Seed, character card, lorebook, preset)
├── workflows/
│   └── world-forge.md            ← The pipeline orchestrator
└── Samples/                      ← Worked example: a complete world output (Lucifer)
```

## Project folder structure (when running)

A new project folder evolves through these files as the pipeline progresses:

```text
[project-name]/
├── World_Seed.md                                  ← Phase 0
├── UNRESOLVED_QUESTIONS.md                        ← Phase 1 (conditional)
├── UNRESOLVED_INTIMACY.md                         ← Phase 2.5 (conditional)
├── Drafts/
│   ├── Master_Design.md                           ← Phase 1
│   ├── Card_[CharName].md                         ← Phase 2
│   ├── Tier1_World_Entries.md                     ← Phase 2
│   ├── Tier2_[ProtagonistName]_Entries.md         ← Phase 2
│   ├── Tier2_[CharName]_Entries.md                ← Phase 2
│   ├── Tier2_[CharName]_Intimacy_Profile.md       ← Phase 2.5 (conditional)
│   ├── Tier3_Arc[N]_[Title]_Entries.md            ← Phase 2
│   ├── Tier3_Arc[N]_Intimacy_Register.md          ← Phase 2.5 (conditional)
│   ├── Instructions_[CardName].md                 ← Phase 2
│   ├── Editor_Critique_[Round N].md               ← Phase 3
│   ├── Voice_Audit_Report_[Round N].md            ← Phase 3.5
│   ├── Arc_Transition_Audit_[Round N].md          ← Phase 3.6
│   └── Intimacy_Audit_Report_[Round N].md         ← Phase 3.7 (conditional)
└── Export/
    ├── [CharName]_Card.json                       ← Phase 4
    ├── [ProtagonistName]_Lorebook.json            ← Phase 4
    ├── World_Lorebook.json                        ← Phase 4
    ├── [CharName]_Lorebook.json                   ← Phase 4
    ├── [CharName]_Intimacy_Profile.json           ← Phase 4 (conditional)
    ├── Arc[N]_Lorebook.json                       ← Phase 4
    ├── Arc[N]_Intimacy_Register.json              ← Phase 4 (conditional)
    ├── Group_Lorebook.json                        ← Phase 4
    ├── Compiler_Log.md                            ← Phase 4
    ├── Prompt_Engineer_Audit.md                   ← Phase 5
    └── [WorldName]_ChatPreset.json                ← Phase 5
```

## Trigger commands

| Command | Action |
|---|---|
| `/worldforge start` | Begin from Phase 0 |
| `/worldforge resume phase[N]` | Resume from a specific phase (`phase0`, `phase1`, `phase2`, `phase2.5`, `phase3`, `phase3.5`, `phase3.6`, `phase3.7`, `phase4`, `phase5`) |
| `/worldforge status` | Report the current phase, round, and open blockers |
| `/worldforge skip phase0` | Begin from Phase 1 (you wrote the World Seed manually) |
| `/worldforge skip phase2.5` | Skip Intimacy Architect (no intimate content) |
| `/worldforge skip phase3.7` | Skip Intimacy Auditor (no intimate content) |

## After SillyTavern import

1. Import each `Export/*.json` lorebook through SillyTavern's **World Info** panel; import each character card through the **Character Management** panel; place the chat preset through **API settings → Chat Completion Presets → Import**.
2. In the World Info panel, enable the **World Lorebook** group and all **Character Lorebook** groups permanently. **Arc lorebooks** are swap-in: enable Arc 1 to start; switch to Arc 2 when the story's exit trigger fires; and so on. **Only one arc lorebook should be active at a time.** The same applies to Arc Intimacy Registers when present.
3. Link the **Protagonist Lorebook** to your active Persona in **User Settings → Persona Management** so it scans only when that persona is active.
4. Select the world's Chat Completion Preset in the API settings panel.

## Where to learn more

- `tutorial.md` — extended usage walkthrough with worked examples
- `workflows/world-forge.md` — the orchestrator's full phase definitions
- `agent_roles/*.md` — per-phase agent specifications
- `Notes_On_functionality.md` — authoritative reference for SillyTavern's runtime behavior
- `CLAUDE.md` — standing context for AI agents working on the repository

---

*Issues, contributions, and pipeline improvements welcome. Pipeline architecture decisions are documented in `CLAUDE.md` and the agent specs themselves; consult those before proposing structural changes.*
