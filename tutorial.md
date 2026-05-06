# World Forge Pipeline: A Step-by-Step Tutorial

Welcome to the **World Forge**, an agentic pipeline designed to create high-fidelity, highly consistent roleplay worlds for SillyTavern. This tutorial will walk you through setting up your project, understanding the agentic workflow, and creating your first World Seed, using the "Lucifer" project as a practical case study.

---

## 1. Prerequisites and Setup

This pipeline is optimized for use within **Visual Studio Code (VS Code)**, using an agentic extension like **Roo Code** or **Cline**. 

### The Folder Structure
When starting a new world project, your repository must follow this exact folder structure:

```text
[project-name]/
├── World_Seed.md                 ← The starting document (produced by Phase 0)
├── Notes_On_functionality.md     ← SillyTavern mechanics reference
├── Drafts/                       ← Where the Architect and Editor agents build the world
├── templates/                    ← Required structural templates (e.g., World_Seed_Template.md)
├── world-forge.md                ← The master agent instructions
└── Export/                       ← The final compiled SillyTavern JSON package
```

Before beginning, ensure `templates/World_Seed_Template.md` and `world-forge.md` are present. 

---

## 2. The Agentic Pipeline: How it Works

The World Forge operates sequentially. Each phase represents a different agentic persona that hands its work off to the next.

1. **Phase 0: The Interviewer** – An interactive agent that asks you questions to help build your `World_Seed.md`.
2. **Phase 1: The Refiner** – Classifies your seed into world (Tier 1), character (Tier 2), and arc (Tier 3) knowledge, producing a `Drafts/Master_Design.md`.
3. **Phase 2 & 2.5: The Architect (and Intimacy Architect)** – Drafts the actual lorebook entries and character cards based on the design. The conditional Intimacy Architect runs only if your world includes intimate scenes.
4. **Phase 3, 3.5, 3.6, 3.7: The Editor & Auditors** – Iteratively edits the prose and tests the world in simulated roleplay to ensure voice, continuity, and intimacy fidelity.
5. **Phase 4: The Compiler** – Translates the approved Markdown drafts into SillyTavern JSON.
6. **Phase 5: The Prompt Engineer** – Audits the final JSONs and authors a custom Chat Completion Preset for the world.

### Starting the Pipeline
To initiate the process, open your VS Code agent chat (e.g., Roo Code) and type:

```
/worldforge start
```

This command triggers `world-forge.md`, invoking Phase 0 (The Interviewer) to help you build your World Seed. 

Other useful commands include:
- `/worldforge resume phase[N]` — Resumes the pipeline if it was paused for human input (e.g., `/worldforge resume phase1`).
- `/worldforge skip phase0` — Skips the Interviewer if you have already written your `World_Seed.md` manually.

---

## 3. Case Study: Building the Lucifer World Seed

The foundation of the entire pipeline is the **World Seed**. You can see the blank template in `templates/World_Seed_Template.md`, and a completed example in `Samples/World_Seed_Lucifer.md`.

Let's look at how the Lucifer World Seed was constructed to satisfy the pipeline's strict requirements.

### Fleshing out the Core and Tiers (Sections 1-5)
The World Seed strictly divides knowledge into three tiers:
* **Tier 1 (The World):** Permanent truths. In Lucifer, this includes the setting (LA and the Penthouse), the Factions (Black Hand, Heavenly Host), and the Rules of Reality (Demonic Disguises, Sanctity of Free Will).
* **Tier 2 (The Characters):** Permanent biological and psychological facts. Anna's baseline physical description, her tragic backstory, and her core psychological contradictions are defined here.
* **Tier 3 (The Arcs):** Modular, changing states. The Lucifer project spans 4 arcs (Survival Horror → Romance → Urban Fantasy → Cosmic Epic). Anna has a different `ANNA_STATE` entry for each arc, moving from *The Wreckage* (withdrawal) to *The New World* (healing and cosmic stakes). 

> **Crucial Rule:** Never put arc-specific information (like Anna's withdrawal sickness) into a Tier 2 physical baseline. If it changes, it belongs in Tier 3.

### Adding Test Scenarios (Section 7)
In the new pipeline architecture, **Phase 3.5 (Voice Auditor)** and **Phase 3.7 (Intimacy Auditor)** require specific, user-defined roleplay scenarios to test the drafted content. 

In the Lucifer migration, we added scenarios like:
* *Anna's arrival at the penthouse in Arc 1 in the throes of withdrawal.*
* *An intimate scene in Arc 2 where Anna experiences a trauma flinch.*
* *Anna standing between Archangel Michael and Andrei in Arc 3.*

By providing these, the pipeline tests the exact moments you intend to play, ensuring the AI's behavior holds up under the specific pressures of your narrative.

### The Intimacy & Sexuality Specification (Section 8)
The World Forge features a specialized **Phase 2.5 (Intimacy Architect)** and **Phase 3.7 (Intimacy Auditor)**. These phases are conditional. If Section 8 is left blank, the pipeline assumes a wholesome/low-intimacy world and skips them entirely.

For Lucifer, intimacy is a core thematic pillar. The migration required splitting the intimacy data into two distinct parts:

1. **The Substrate (in Section 4):** This is the permanent, arc-agnostic truth about the character's body. We defined Anna's trauma map (freezing when pinned, dissociation during silence), her body reactions, her vulnerability shapes, and her hard limits.
2. **The World & Arc Specification (Section 8):** This defines the *purpose* of intimacy in the story.
   * **World Posture:** Defined as Oppressive, Transactional, shifting to Communion.
   * **Arc 1 Function:** Transaction and Survival. The prose is vigilant; intimacy is attempted as a commodity.
   * **Arc 2 Function:** Communion and Comfort. Frightened discovery of pleasure; the trauma map is highly active.
   * **Arc 3 Function:** Claim and Play.
   * **Arc 4 Function:** Ritual and weight.

By explicitly stating that Arc 1 intimacy is *transactional* and Arc 2 intimacy is *frightened discovery*, the Intimacy Architect and Auditor ensure that the AI will never enthusiastically initiate sex in Arc 1, preserving the narrative's psychological realism.

---

## 4. Next Steps

Once your `World_Seed.md` is complete (whether written manually or with the Phase 0 Interviewer), simply tell the agent to begin Phase 1. 

The Refiner will review your document, identify any gaps, and build the Master Design. From there, the agents will draft, edit, audit, and compile your world, ultimately placing a ready-to-play JSON package in your `Export/` folder.
