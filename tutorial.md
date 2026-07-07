# World Forge Pipeline: A Step-by-Step Tutorial

## JanitorAI Integration & Separation of Concerns

This fork by **Lys_5** (JanitorAI Profile: https://janitorai.com/profiles/df1f0279-2607-4c9b-9b4e-ee02438d70a2_profile-of-lys-5) introduces a highly specialized architecture to bypass JanitorAI's context limitations:

1. **The Compiler (JSON Surface):** Extracts only the core identity, physical appearance, and personality, outputting a lightweight JSON profile (~1,500 tokens).
2. **The Converter (ES6 Backend):** Translates deep logic (L_LORE_SECRET, L_LORE_RELATIONSHIP, Trigger Matrix) into an executable, minified JavaScript payload.
3. **Red-Team Auditors:** The Voice, Intimacy, and Arc Auditors proactively stress-test the draft against extreme inputs, relational boundaries, and logic transitions before export.

---

## 1. Prerequisites and Setup

You need:

- **VS Code** with an agentic extension — [Antigravity](https://github.com/Antigravity/kilocode) (recommended) or [Cline](https://github.com/cline/cline) — configured with an LLM API key.
- A clone of this repository, opened as a VS Code workspace.

That is the entire setup. The pipeline is markdown specifications — there is nothing to build or install.

**Two settings worth getting right before a long run:** which model runs which phase (spend the most on the Editor and Auditors), and sampling temperature per phase (creative seats hot, the Compiler near zero). Antigravity users get both preconfigured: the repo ships a `.agents/skills/` with per-phase agents, and the temperature settings are already baked into the shipped `.agents/skills/`.

### Repository structure (what you cloned)

```text
World-Forge/
├── README.md                     ← Entry-point overview
├── tutorial.md                   ← This file
├── CLAUDE.md                     ← Standing context for AI coding agents
├── Notes_On_functionality.md     ← Authoritative SillyTavern runtime reference
├── agent_roles/                  ← Per-phase agent specifications
├── templates/                    ← Structural references (World Seed, card, lorebook, preset)
├── workflows/world-forge.md      ← The pipeline orchestrator
└── Samples/                      ← Worked example outputs
```

### Project folder structure (what gets generated when you run)

When you start a new world, all data is generated into a strict split-folder structure. There is no root project folder; everything goes into specific subdirectories for that world:

```text
World-Forge/
├── Drafts/
│   └── [WorldName]/
│       ├── Master_Design.md                       ← Phase 1 locked design
│       ├── UNRESOLVED_QUESTIONS.md                ← Phase 1 (conditional)
│       ├── UNRESOLVED_INTIMACY.md                 ← Phase 2.5 (conditional)
│       └── Card_[Name].md / etc.                  ← Phase 2–3 outputs
└── Export/
    └── [WorldName]/
        ├── World_Seed.md                          ← Phase 0 (or hand-written)
        └── [WorldName]_[Language]_*.json          ← Phase 4–5 final JSON and JanitorAI package
```

The `templates/`, `agent_roles/`, `workflows/`, and `Notes_On_functionality.md` files travel with the repo and are read by the agents at runtime; you do not need to copy them per project.

---

## 2. Pipeline Overview

Each phase is run by a specialized agent. Some phases are conditional, some loop, and Phase 3.5/3.6/3.7 run in parallel.

```
[user intent]
      |
      v
 PHASE 0 — The Interviewer        (skip with /worldforge skip phase0)
      v
 World_Seed.md
      v
 PHASE 1 — The Refiner            → Master_Design.md
      v
 PHASE 2 — The Architect          → all Drafts/
      v
 PHASE 2.5 — Intimacy Architect   (conditional on World Seed Section 8)
      v
 PHASE 3 — The Editor             [loops until quality gate passes]
      v
 PHASE 3.5 + 3.6 + 3.7            (parallel auditors)
      v
 PHASE 4 — The Compiler           → Export/*.json + JanitorAI files
      v
 PHASE 5 — The Prompt Engineer    → ChatPreset + audit report
      v
 PHASE 5.5 — Manual application   (conditional on audit recommendations)
      v
 ✅ READY FOR SILLYTAVERN
```

### Trigger commands

| Antigravity Command (Type in Chat) | Action / Skill Dispatched |
| --- | --- |
| `/worldforge brainstorm` | Dispatches to **WorldForge-Brainstormer**. Optional ideation upstream of Phase 0. Generates premise directions, writes informal `Brainstorm_Notes.md`. |
| `/worldforge start` | Dispatches to **WorldForge-Interviewer**. Begins from Phase 0 (arc mode by default). |
| `/worldforge start --sandbox` | Dispatches to **WorldForge-Interviewer**. Begins from Phase 0 in sandbox mode. |
| `/worldforge skip phase0` | Dispatches to **WorldForge-Refiner**. Begins from Phase 1 (useful if you authored the World Seed manually). |
| `/worldforge resume phase[N]` | Dispatches to the relevant phase agent (e.g., **WorldForge-Editor** for Phase 3) to resume after a pause gate. |
| `/worldforge revise` | Dispatches to **WorldForge-Reviser**. Post-launch surgical edits to a shipped world. |
| `/worldforge revise --brainstorm` | Dispatches to **WorldForge-Brainstormer** to diagnose issues, then hands off to Reviser. |
| `/worldforge convert <target>` | Dispatches to **WorldForge-Converter**. Reframes a shipped world into a new build. |
| `/worldforge convert <target> --rebaseline` | Consolidate a revised world into a clean rebuild. |

> This table is a quick subset. **Section 10** is the full command reference — every trigger and flag with an example invocation and the _why_ behind it.

## 4. Reading the artifacts

`Samples/` is structured to be navigable. If you want to understand a specific aspect of the pipeline, here is where to look:

| Question                                                                             | File to read                                                                                                            |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| How does a World Seed actually look when complete?                                   | `Drafts/[WorldName]/World_Seed.md`                                                                                         |
| How does the Refiner organize a world into tiers?                                    | `Drafts/[WorldName]/Master_Design.md`                                                                                       |
| What does a fully-drafted character card look like?                                  | `Drafts/[WorldName]/Card_Anna.md`, `Drafts/[WorldName]/Card_World_Director.md`                                                  |
| What does a `User.md` persona description look like?                                 | `Drafts/[WorldName]/User.md` (Architect draft) → `Export/[WorldName]/User.md` (final, paste-ready)                              |
| How are Tier 1/2/3 lorebook entries structured?                                      | `Drafts/[WorldName]/Tier1_World_Entries.md`, `Drafts/[WorldName]/Tier2_Anna_Entries.md`, `Drafts/[WorldName]/Tier3_Arc1_Entries.md` |
| What is the difference between Tier 2 Intimacy Profile and Tier 3 Intimacy Register? | `Drafts/[WorldName]/Tier2_Anna_Intimacy_Profile.md` vs. `Drafts/[WorldName]/Tier3_Arc1_Intimacy_Register.md`                    |
| How does the Editor flag and resolve issues?                                         | `Drafts/[WorldName]/Editor_Critique_Round1.md` (failures) → `Round3.md` (clean sign-off)                                    |
| What does an auditor's test matrix and dialogue audit look like?                     | `Drafts/[WorldName]/Voice_Audit_Report_Round1.md`                                                                           |
| How does the Compiler verify the pipeline's chain of sign-offs?                      | `Export/[WorldName]/Compiler_Log.md`                                                                                        |
| What does the final Chat Completion Preset look like?                                | `Export/[WorldName]/[WorldName]_ChatPreset.json`                                                                                |
| How thorough is the runtime audit?                                                   | `Export/[WorldName]/Prompt_Engineer_Audit.md`                                                                               |

---

## 5. After SillyTavern import

Once your `Export/` directory is ready:

1. Import each `*.json` lorebook through SillyTavern's **World Info** panel. Import each character card through the **Character Management** panel. Import the chat preset through **API settings → Chat Completion Presets → Import**.
2. In the World Info panel, enable the **World Lorebook** group and all **Character Lorebook** groups permanently. **Arc lorebooks** are swap-in: enable Arc 1 to start; switch to Arc 2 when the story's exit trigger fires ; and so on. **Only one arc lorebook should be active at a time.** The same applies to Arc Intimacy Registers when present.
3. Wire up the `{{user}}` persona. SillyTavern provides no structured import for personas, so this step is manual but quick:
   - Open **User Settings → Persona Management** and create (or select) the persona for this world. Use the in-world name from the top of `Export/User.md` .
   - Open `Export/User.md`. Copy the text between `--- BEGIN PERSONA DESCRIPTION ---` and `--- END PERSONA DESCRIPTION ---` and paste it into the persona's **Description** field.
   - In the same persona editor, link `[WorldName]_[ProtagonistName]_Lorebook.json`  in the persona's **Lorebook** field. The persona description is the always-on identity floor (≤150 words, injected every turn); the lorebook fires on keys for fuller detail.
   - Activate this persona before starting the chat.
4. Select the world's Chat Completion Preset (e.g., `[WorldName]_ChatPreset.json`) in the API settings panel.

You are ready to roleplay.

> Note: `User.md` deliberately does **not** contain voice, personality, or speech patterns for `{{user}}`. The human plays `{{user}}` and writes their own dialogue and actions — those are the human's domain, not the LLM's. `User.md` is reference data the LLM uses to react _to_ `{{user}}` correctly.

---

## 6. Common gotchas

- **Phase 1 paused with UNRESOLVED_QUESTIONS.md.** This is the Refiner finding gaps. Read the file, answer the questions in your World Seed, then `/worldforge resume phase1`. Do not skip — gaps propagate forward and produce broken cards.
- **Phase 3 looped three times without improvement.** The Editor escalates to you. The problem is usually in the Master Design, not the Architect's execution. Re-examine the Master Design's relevant section.
- **Auditor flagged a Critical failure that ties to the Master Design itself.** Sometimes the bug is structural — an arc's exit trigger doesn't causally connect to the next arc's entry; a character's substrate forbids a behavior the world wants in scene. The fix is to update the Master Design and re-run from Phase 2, not to patch the symptom in the drafts.
- **Phase 5 audit ended "AUDIT COMPLETE — N manual corrections required."** Phase 5.5 is not optional in this case. Open each Export/ file named in the audit, apply the recommended corrections, save. Only then is the world ready.
- **Forgot to paste `User.md` into the persona Description field.** SillyTavern will run the world without it, but NPCs will react oddly to `{{user}}` in opening turns until a Tier 2 keyword fires. Always paste the persona description before starting a chat.
- **Unfamiliar files in Samples/.** The `Samples/Drafts/` directory contains files from a complex multi-arc project. A simpler world produces fewer files. The structure is the same; the volume scales with the world.

---

## 7. Sandbox worlds (an alternative World Mode)

An **arc world** moves through a fixed progression of arcs, each with entry/exit triggers, dramatic beats, and per-character evolution. Some worlds have no arc at all — open-ended power-fantasy, world-director, and life-sim worlds where the experience is "live in this world and do things," not "move through a story." Those run in **sandbox mode**.

Sandbox mode is **not a separate pipeline** — it is a branch _through_ the same phases you just read. The same Interviewer, Refiner, Architect, Editor, Voice Auditor, Compiler, and Prompt Engineer run. Only the Tier 3 spine and the large-cast NPC format change.

### Declaring sandbox mode

Mode is declared in **World Seed Section 1** (`World Mode: arc | sandbox`). `arc` is the default; every existing world is an arc world. To build a sandbox world:

```
/worldforge start --sandbox
```

This pre-sets the Interviewer, but the World Seed field is the source of truth — a hand-written seed or a `skip phase0` run carries the signal too. When sandbox mode is set, the Interviewer walks a **Sandbox Charter** (World Seed Section 5B) instead of the arc questions.

### What changes vs. an arc world

| Aspect              | Arc world                                           | Sandbox world                                                                                                             |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Tier 3**          | One Arc Lorebook per arc, swapped in/out                      | **One always-active Sandbox Lorebook** — never swapped                                                                    |
| **Standing anchor** | `ARC_STATE` per arc (Dramatic Situation + Tonal Mandate)      | `SANDBOX_STATE` (Standing Situation + Tonal Mandate, with an **aliveness contract**) + a `WORLD_PULSE` entry              |
| **Per-arc entries** | `CHARACTER_STATE`, `NPC_SHIFT`, `DRAMATIC_BEAT`, arc triggers | none — there is no arc                                                                                                    |
| **NPC cast**        | Full profiles per NPC                                         | **Principal/roster split** — a few deep principals, the rest as compact roster stat blocks with unique voice fingerprints |
| **Phase 3.6**       | Arc Transition Auditor runs                                   | Skipped (no arc seams)                                                                                                    |
| **Phase 3.5**       | Arc-register checks                                           | Standing-register checks **+ NPC Distinctiveness Matrix** (a blind-line test across the roster)                           |
| **Preset**          | Standard blocks                                               | Adds the **NPC Ensemble & Enrichment** block and weights Sensory Embodiment high                                          |

### The aliveness contract

The single most important thing a sandbox world needs is the thing an arc carries for free: momentum and tone. With no arc driving the experience, the `SANDBOX_STATE` Tonal Mandate and the `WORLD_PULSE` entry carry an **aliveness contract** — NPCs pursue their own agendas and initiate scenes, the world reacts to and remembers `{{user}}`'s actions and reputation, off-screen life continues, and the world never freezes waiting for `{{user}}`. This is what keeps a sandbox from playing like an inert menu of NPCs that only exist when summoned.

The contract is made concrete by **per-NPC standing goals**: each principal NPC carries an active objective and the moves that advance it (Architect §7.D), and the cadence directive tells the model to have a present or off-screen NPC advance its goal when a scene lulls. The Voice Auditor's Step 3J tests exactly this — that NPCs take initiative and that each move traces to a stated goal. (The same goal/cadence mechanic runs in arc worlds through the `ARC_STATE` activity-cadence directive; NPCs exist in both modes, so it is mode-agnostic.)

### Keeping a large NPC cast distinct

A sandbox usually runs on a big cast voiced by a World Director card. The failure mode at that scale is not per-NPC infidelity — it is **homogenization**: thirty NPCs collapsing into two or three generic voices. Two mechanisms defend against it:

- **Roster NPC stat blocks** (Architect §7.E) — each roster NPC gets a compact block whose load-bearing field is a **voice fingerprint**: three concrete, unique speech markers no other NPC shares. The binding rule is that no two roster NPCs are confusable from a single line of dialogue.
- **The NPC Ensemble & Enrichment preset block** (`npc_ensemble`) — encourages NPC-to-NPC dialogue (not just hub-and-spoke around `{{user}}`), scales prose up when several NPCs share a scene, and lets NPCs grow organic detail _not_ in the lorebook, within guardrails (consistent with their established voice, never contradicting the lorebook, treated as canon once established).

### Intimacy in a sandbox

Sandbox worlds usually carry sexual material across the NPC cast. The intimacy infrastructure threads the same way:

- The Tier 3 intimacy register folds into a single standing **`Sandbox_Intimacy_Register`** (a standing `INTIMACY_FUNCTION`, not per-arc).
- **NPC intimacy follows the principal/roster split** — principal NPCs get full Tier 2 Intimacy Profiles; roster NPCs get compact §6.5 intimate stat blocks (intimate essence, body & sound signature, voice in intimacy, a limit/yes, stance), with the same uniqueness rule: no two NPCs interchangeable in an intimate scene.
- The Intimacy Auditor adds an **NPC intimate coverage & distinctiveness check** (Step 3H): every sexual NPC has substrate, and no two read as the same in bed.

### After SillyTavern import (sandbox)

The import flow is the same as Section 5, with one difference: there are no arc lorebooks to swap. Enable the **World Lorebook**, all **Character/NPC Lorebook** groups, and the single **Sandbox Lorebook** group permanently — and leave them on. The `SANDBOX_STATE` entry is constant and `ignoreBudget`, so it fires every turn. If the world has intimate content, enable the **Sandbox Intimacy Register** group the same way.

### Note on retrofitting

Flipping World Mode is a Section 1 change, which the revise pipeline bounces. There are two paths: a from-scratch rebuild via hand-editing the World Seed (`World Mode: sandbox`, rewrite Section 5 as a Sandbox Charter, reclassify NPCs into principal/roster) and running `/worldforge skip phase0`; or the **Convert pipeline** (Section 8 below), which is the structured path for arc↔sandbox flips and other big reframings — it reads the source world's `Master_Design.md` read-only, walks you through what to keep and what to regenerate, and writes a new seed in a fresh project folder. Convert is usually the right choice for a mode flip because it preserves the Tier 1 work (rules, factions, locations) and most of Tier 2 (characters) — `start --sandbox` from scratch would make you rebuild all of that. Surgical edits to a shipped sandbox world — recalibrating `SANDBOX_STATE`, tweaking `WORLD_PULSE`, adding roster NPCs, adjusting sandbox intimacy — _are_ handled by the revise pipeline (`/worldforge revise`), which is sandbox-aware via the `sandbox_*` scope types.

---

## 8. Converting a shipped world (`/worldforge convert`)

Sometimes a shipped world's world-building is worth reusing under a different angle. Suppose you've finished a gritty urban fantasy story and you want to play through the same world — same city, same factions, same cosmology — but as a completely different protagonist. Or suppose you want the same world but as an open-ended sandbox without fixed arcs.

Both are exactly what the **Convert pipeline** is for. It is the third post-launch operation alongside revise and resync-preset, and it is the legitimate path for the change-categories the revise pipeline bounces: a different protagonist, a `World Mode` flip (arc ↔ sandbox), a different Style Contract at the world level, or a different Core Concept & Tone (Master Design Section 1).

### What Convert does and does not do

| What it does                                                                                                   | What it doesn't do                                 |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Reads the source world's `Master_Design.md` read-only                                                          | Modifies the source project (never)                |
| Walks a preservation matrix with you (keep / modify / drop / regenerate per source section)                    | Writes anything other than the new `World_Seed.md` |
| Surfaces role reassignments explicitly (old protagonist → NPC, source NPC → new `{{user}}`, power-tier shifts) | Replace `/worldforge start` for fully fresh worlds |
| Writes a new `World_Seed.md` in your target folder                                                             | Replace `/worldforge revise` for surgical edits    |
| Hands off to `/worldforge skip phase0` for the standard build                                                  | Merge two source worlds (single source only)       |

The Converter is one phase (C0). After it finishes, you run the standard pipeline (Phase 1 onward) against the target folder, exactly as if you had hand-written the new seed.

### Invocation

```
# Interactive: the Converter interviews you through the preservation matrix
/worldforge convert path/to/source-world path/to/target-world

# Brief-driven: fill in templates/Convert_Brief_Template.md first, then
/worldforge convert path/to/source-world path/to/target-world --brief path/to/Convert_Brief.md
```

The Brief is recommended for non-trivial conversions because it is version-controllable and reviewable. The brief-driven mode still interviews you — but only on gaps and ambiguities in the brief.

### The overlap floor refusal

Convert is **reframe or rebaseline, never reskin**. If you are replacing setting + protagonist + factions + tone all at once, the Converter refuses with an explicit bounce to `/worldforge start`. At that scale, the source is creative reference, not a structural source — pretending otherwise produces a Frankenstein seed that the downstream pipeline cannot build cleanly. The Converter classifies your intent against four axes (setting, protagonist, factions, tone), counts how many are being replaced, and:

- **0 or 1 replaced** — well-shaped conversion; proceed
- **2 replaced** — borderline ("half a new world"); surface to you, proceed on explicit confirm
- **3 or 4 replaced** — refuse; run `/worldforge start` against the target folder, use the source's `Master_Design.md` as creative reference during Phase 0

This refusal is intentional and not configurable. Changing setting, protagonist, factions, and tone all at once constitutes a new world, not a conversion.

### Convert Example

Suppose you want to reframe an existing world to play as a new protagonist. You'd run `/worldforge convert` and the Converter will walk you through redefining the protagonist, updating Tier 1 faction relationships to match the new perspective, dropping obsolete Tier 2 character sheets, and regenerating a new set of narrative arcs (Section 5) shaped around the new protagonist.

## 9. Brainstorming a world (`/worldforge brainstorm`)

Everything so far assumes you arrive with a concept solid enough for the Interviewer to interrogate. Sometimes you don't — you have a vibe, an image, a single character, a "what if," and nothing with a shape yet. The **Brainstormer** is the optional front porch for that state. It is the Interviewer's divergent counterpart: where the Interviewer converges (walks the template, pushes for specificity, refuses thin material), the Brainstormer diverges (throws out options, follows whatever you light up on, helps an idea find its own shape). It writes informal `Brainstorm_Notes.md` — explicitly _not_ a World Seed — and hands you to `/worldforge start`, where the Interviewer reads those notes as a warm start and still runs the full interview.

```
/worldforge brainstorm
```

It is entirely optional and skippable — if you already know what you're building, go straight to `/worldforge start`.

### It makes suggestions, not just prompts

The Brainstormer is built to be _proactive_. Rather than only asking questions, it offers material:

- **Touchstones, not just adjectives.** Hand it a genre or mood and it reaches for the works that own that territory: "a horror sandbox in a small neighborhood" is Stephen King country — ordinary streets with something wrong humming underneath. It names the touchstone _and_ describes its texture, so it lands whether or not you know the work, and it offers two or three so you can feel which direction has heat.
- **Excerpt sketches.** When a register is hard to describe, it writes a few lines of the world's prose in the tone it's proposing and asks if that's warmer or colder than what you meant.
- **Cast on request.** Ask "who else is in here?" and it generates a handful of distinct candidates with a hook each, rather than handing the question back.
- **Clichés, dodged but offered.** It steers toward the fresher angle by default, but tropes are tools — when it steers around one it says so and offers the familiar version too, because the well-worn path is often the easier build. You choose.
- **"Where does it sag?"** It will play a premise forward and name where it tends to go flat (a sandbox with no internal pressure becomes a diorama; a one-note antagonist gets boring by the third scene), then offer ways to firm it up. This is a sounding board, not a verdict — it never scores your idea.

### The four domain lenses

When a brainstorm turns toward a domain where ideas reliably go generic, the Brainstormer pulls in a matching **lens** — craft grounding that sharpens its suggestions away from cliché. The lenses produce _leanings for the notes_, never locked content; the downstream agents still do all the authoring.

| Lens                     | Guards against                      | Example nudge                                                                                                                                                                                              |
| ------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Intimacy & Dynamics**  | interchangeable, generic sex scenes | make a scene fit the _specific pair_ — a shorter man and a taller woman reshapes the staging and the power play                                                                                            |
| **Appearance & Style**   | the default body-type cliché        | "a curvy distance runner" is in tension — distance running builds a lean frame; want yoga instead, or keep the body and call it genetics?                                                                  |
| **Realism**              | hand-wavy mechanics                 | a team chasing the World Cup can't train 24/7 — injuries, recovery, and politics are where the stakes live. (Genre-aware: it steps aside for power-fantasy, where "realism" becomes internal consistency.) |
| **Character Psychology** | the flat archetype                  | a "cold crime boss" is a costume — what does he _want_ underneath, and what's the one line he won't cross, or already crossed?                                                                             |

The appearance/realism nudge is a coherence check, not a rule: it surfaces the tension once, offers the resolutions, and drops it the moment you choose — "curvy and genetically gifted" is a complete answer.

### Three postures

The Brainstormer runs in one of three modes depending on how it's invoked:

1. **Fresh start** (`/worldforge brainstorm`) — the default above: a blank page and a vibe.
2. **Rebaseline improvement** (`/worldforge convert ... --rebaseline --then-brainstorm`) — brainstorming _changes_ to an already-consolidated world before the Interviewer reworks the seed. Covered in [Section 8](#8-converting-a-shipped-world-worldforge-convert).
3. **Revision diagnostic** (`/worldforge revise --brainstorm`) — the next subsection.

### "Something feels off but I can't name it" (`/worldforge revise --brainstorm`)

The revision pipeline (`/worldforge revise`, Section 7's retrofitting note) assumes you can name what to change — "Anna's voice is too snarky in Arc 2," "add an NPC to the market district." But sometimes a shipped world just feels _off_ in play and you can't point at why. That's the pre-articulation case, and grinding through the Reviser's narrowing questions doesn't help when you have no starting noun.

```
/worldforge revise --brainstorm
```

This runs the Brainstormer in its **revision-diagnostic posture** _before_ the Reviser. It reads your `Master_Design.md` read-only, plays the world back, and asks what bugged you in the last session — then diagnoses divergently, using the four lenses in reverse as a diagnostic vocabulary (a scene that fell flat → the psychology lens; samey intimate beats → the intimacy lens; an arc with no pressure → the "where does it sag" move). It converges on **one primary concern**, phrased as a revision intent, plus a few candidate future concerns, and writes them to `Brainstorm_Notes.md`. The Reviser then reads that file, captures the primary concern as your verbatim intent, and classifies and scopes the revision as normal.

It respects the same bright line as the Reviser: if the thing that's "off" turns out to be the world's core concept, tone, Style Contract, or World Mode, it says so and points you to a full re-run or a `/worldforge convert` rather than dressing a structural change up as a surgical one. And like every Brainstormer posture, it writes only informal notes — it never classifies tiers or scopes the revision itself. That stays the Reviser's job.

---

## 10. Command reference — every trigger, by example

This section collects every `/worldforge` command in one place, each with an example invocation, what it does, and _why_ you would reach for it. The examples assume you are operating within a standard World-Forge project structure. Two conventions throughout:

- **Paths point at project folders** — the directory that holds `World_Seed.md`, `Drafts/`, and `Export/` — not at individual files, except where a flag explicitly takes a file (`--brief`, `--target`).
- **You type these in your agentic extension's chat** (the **Code** agent in Antigravity, or the default agent in Cline), with the World-Forge repo open as the workspace.

A run moves left-to-right through a lifecycle: _(optional) brainstorm → start/skip → resume/skip while building → ship → revise / resync-preset / convert after launch._

### 10.1 Starting a build

**`/worldforge brainstorm`** — _optional, before everything_

```
/worldforge brainstorm
```

Divergent ideation for when you have only a vibe. Generates premise directions, reaches for touchstones, sketches excerpts, and pulls in the four domain lenses (Section 9). Writes informal `Brainstorm_Notes.md` and stops — it never writes a World Seed.
**Why:** use it when you can't yet answer the Interviewer's "what's the central wound?" because the idea has no shape. Skip it when you already know what you're building.

**`/worldforge start`** — _the normal entry_

```
/worldforge start
```

Begins at Phase 0 (the Interviewer) in **arc mode** — the default. The Interviewer walks the World Seed Template, pushes back on thin material, and produces `World_Seed.md`. If `Brainstorm_Notes.md` is present it's read as a warm start.
**Why:** the standard path for nearly every new world.

**`/worldforge start --sandbox`** — _open-ended worlds_

```
/worldforge start --sandbox
```

Same as `start`, but pre-sets **sandbox mode** (Section 7): no narrative arcs, a single always-active Sandbox Lorebook, and a large principal/roster NPC cast. The `World Mode: sandbox` field in the seed is the real source of truth, so this flag just pre-seeds it for the Interviewer.
**Why:** power-fantasy, world-director, and life-sim worlds where you "live in" the world rather than move through a story.

**`/worldforge skip phase0`** — _you wrote the seed yourself_

```
/worldforge skip phase0
```

Begins at Phase 1 (the Refiner), assuming you authored `World_Seed.md` by hand against `templates/World_Seed_Template.md`.
**Why:** you have a fully-formed concept and prefer writing the seed directly to being interviewed — or you're resuming after a Section 1 / 11a revision bounced out of the revise pipeline.

### 10.2 Controlling a run in flight

**`/worldforge status`**

```
/worldforge status
```

Reports the current phase, round, and any open blockers, read from the Pipeline State Ledger at the top of `Master_Design.md` (not reconstructed from memory).
**Why:** any time you're unsure where a paused run actually stands.

**`/worldforge resume phase[N]`**

```
/worldforge resume phase1      # after answering UNRESOLVED_QUESTIONS.md
/worldforge resume phase2.5    # after filling in Section 8 intimacy detail
/worldforge resume phase3      # re-enter the Editor loop
/worldforge resume phase5      # re-run the Prompt Engineer audit
```

Resumes from a specific phase after a pause gate. Valid phases: `phase0, phase1, phase2, phase2.5, phase3, phase3.5, phase3.6, phase3.7, phase4, phase5`.
**Why:** continue after you've resolved whatever caused a pause — a Refiner gap, an Editor stall, an intimacy blocker.

**`/worldforge skip phase2.5` · `skip phase3.6` · `skip phase3.7`**

```
/worldforge skip phase2.5   # no intimate content — skip the Intimacy Architect
/worldforge skip phase3.7   # no intimate content — skip the Intimacy Auditor
/worldforge skip phase3.6   # arc-seam auditor; auto-skipped in sandbox mode anyway
```

Tells the orchestrator a conditional phase doesn't apply, instead of letting it ask. The two intimacy phases (2.5 and 3.7) are skipped together for worlds with no intimate content; the Arc Transition Auditor (3.6) is auto-skipped in sandbox mode.
**Why:** declare up front that a conditional phase is irrelevant to this world.

### 10.3 Post-launch: surgical edits (`/worldforge revise`)

Once a world has shipped (Export/ exists), the revision pipeline makes small, scope-locked changes. It preserves UIDs, so running SillyTavern chats survive the edit. The bright line: anything touching the world's Core Concept / tone (Master Design Section 1) or Style Contract world defaults (Section 11a) — including an arc↔sandbox flip — bounces to a full re-run or a `convert`.

**`/worldforge revise`** — _interview mode (default)_

```
/worldforge revise
```

The Reviser asks what feels off, narrows it to one concern, classifies the scope, runs the bright-line check, and writes a Revision Log entry.
**Why:** you know roughly what's wrong and want to be walked through pinning it down.

**`/worldforge revise --freeform`** — _you'll describe it yourself_

```
/worldforge revise --freeform
```

You paste a description of the change; the Reviser structures and classifies it, then echoes its interpretation back for confirmation.
**Why:** you can state the change in a sentence or two and don't need the interview.

**`/worldforge revise --target [path]`** — _you know the file_

```
/worldforge revise --target Drafts/Tier2_Anna_Entries.md
```

Skips diagnostic narrowing and goes straight to "what's wrong with this file, and what should it become?"
**Why:** you've already located the exact draft entry to change.

**`/worldforge revise --brainstorm`** — _something feels off, but you can't name it_

```
/worldforge revise --brainstorm
```

Runs the Brainstormer's revision-diagnostic posture (Section 9) first: it reads `Master_Design.md` read-only, plays the world back, diagnoses divergently with the lenses, and writes one primary concern to `Brainstorm_Notes.md` — which the Reviser then picks up and scopes.
**Why:** play feels wrong but you have no starting noun to hand the interview.

**`/worldforge revise status` · `resume R[N]` · `cancel R[N]`**

```
/worldforge revise status        # list all revisions and their statuses
/worldforge revise resume R3     # continue pending revision R3 from its last phase
/worldforge revise cancel R3     # cancel R3, roll back its draft edits, mark CANCELLED
```

Manage in-flight or past revisions. `R[N]` is the revision id from the Revision Log (R1 is the first revision; the initial build is unnumbered).
**Why:** `status` checks for a pending revision (only one runs at a time); `resume` continues after a pause; `cancel` abandons one cleanly.

### 10.4 Post-launch: refresh the preset (`/worldforge resync-preset`)

```
/worldforge resync-preset
```

Regenerates a shipped world's `Export/[WorldName]_ChatPreset.json` against the current preset template and block library, picking up pipeline improvements and any content changes that surface inside preset blocks. It makes **no content changes** and touches only the preset — re-importing it does not disturb running chats, because a preset is a global settings profile, not UID-bearing world info.
**Why:** the pipeline's preset spec has evolved since you built the world, or revisions changed content that should reflect in preset blocks. This is _not_ `resume phase5` — that re-runs the full Phase-5 audit during an in-progress build; resync is a maintenance op on an already-shipped world.

### 10.5 Post-launch: reframe or consolidate (`/worldforge convert`)

Convert reads a shipped world read-only and writes a _new_ `World_Seed.md` to a target folder — the legitimate path for the big changes the revise pipeline bounces (different protagonist, World Mode flip, Style Contract or Core Concept change). The full walkthrough is Section 8; here are the invocations side by side.

**`/worldforge convert <source> <target>`** — _reframe (interactive)_

```
/worldforge convert path/to/source-world path/to/source-world-as-God
```

Interviews you through the preservation matrix (keep / modify / drop / regenerate per source section), surfaces role reassignments, and writes the new seed. You then run `/worldforge skip phase0` against the target.
**Why:** play the same world from a different angle — e.g., an urban fantasy world from the perspective of the antagonist instead of the protagonist. (Replacing setting + protagonist + factions + tone all at once is refused — that's a new world, use `start`.)

**`--brief <path>`** — _reframe (brief-driven)_

```
/worldforge convert path/to/source-world path/to/source-world-as-God --brief path/to/Convert_Brief.md
```

Drives the conversion from a pre-filled `templates/Convert_Brief_Template.md` instead of a live interview; it still interviews you on gaps and ambiguities.
**Why:** non-trivial conversions you want version-controlled and reviewable.

**`--rebaseline`** — _consolidate a revised world_

```
/worldforge convert path/to/source-world path/to/source-world-clean --rebaseline
```

Same world, same protagonist: rebuilds a clean seed from the _post-revision_ Master Design when accumulated revisions have made surgical editing unwieldy. Revision content carries; revision markers don't. Combines with `--brief`.
**Why:** a world is layered with `<!-- REVISED IN R[N] -->` markers and the next change feels too big for another surgical revision. **Trade-off:** the rebuild compiles fresh UIDs, so running chats don't migrate — that's the price of a clean baseline; `revise` is the UID-preserving alternative.

**`--rebaseline --then-interview`** — _consolidate, then change a lot_

```
/worldforge convert path/to/source-world path/to/source-world-clean --rebaseline --then-interview
```

After writing the consolidated seed, hands straight into the Interviewer (seed-revision posture) to interview your changes at full depth before Phase 1, instead of `skip phase0`. Requires `--rebaseline`.
**Why:** the consolidation is a staging step and you already know what you want to change.

**`--rebaseline --then-brainstorm`** — _consolidate, then decide what to change_

```
/worldforge convert path/to/source-world path/to/source-world-clean --rebaseline --then-brainstorm
```

Inserts the Brainstormer (improvement posture) ahead of that Interviewer: it brainstorms _what_ to change against the consolidated world, writes `Brainstorm_Notes.md`, and the seed-revision Interviewer reads those as proposals. Requires `--rebaseline`; supersedes `--then-interview`.
**Why:** you want to evolve the world but haven't decided how.

---

## 11. Setting your prose style (the Style Contract)

World Forge has no house voice. It does not decide what good prose is, and it does **not** strip "slop" — what reads as overwrought to one person is another's register. Instead, **you declare the world's prose conventions once**, in World Seed **Section 1.5 (the Style Contract)**, and every card in the world inherits them. (A Director/Narrator card can override perspective — Section 1.5c — but most worlds set the contract once and never override.)

The Style Contract has six enum fields plus one free-text field:

| Field                       | What it controls                                                  |
| --------------------------- | ----------------------------------------------------------------- |
| **Perspective**             | `first` / `second` / `third_limited` / `third_omniscient`         |
| **Tense**                   | `past` / `present`                                                |
| **Narration Marker**        | what `*asterisks*` mean: narration+action, thoughts-only, or none |
| **Dialogue Marker**         | `double_quotes` / `single_quotes` / `em_dash` / `unmarked`        |
| **Emphasis Marker**         | `double_asterisks` / `italics_underscore` / `none`                |
| **Paragraph Register**      | `terse` / `standard` / `dwelling`                                 |
| **Style Notes** (free text) | anything the enums don't capture                                  |

The six enums pick the _mechanics_ (POV, tense, what the markup means). The seventh — **Style Notes** — is where you steer the _feel_: contractions or not, modern idiom or not, and what you do or don't want the prose to do.

### What `DEFAULTS` does

If you don't care about prose style, write `DEFAULTS` for each field and the Refiner fills in the pipeline's new standard convention:

```text
Perspective:        third_omniscient   (Narrator sees across all characters' interiors)
Tense:              present
Narration Marker:   asterisks_for_thoughts_only   (*asterisks* wrap only thoughts; narration is plain prose)
Dialogue Marker:    double_quotes      ("Like this.")
Emphasis Marker:    double_asterisks   (**like this**)
Paragraph Register: standard
Style Notes:        (Mandatory constraints: First-person present for {{user}}, NO em-dashes, In-Universe Text in backticks, Narrator/Events in triple asterisks, Native language dialogue as "phrase" ([your_language] translation))
```

This is the modern roleplay register — third-person omniscient (allowing group chats and multi-character sandboxes), present tense, plain prose for action and narration, asterisks reserved strictly for internal thoughts, and double quotes for dialogue. It's the most flexible and robust default for World-Forge. A turn under this contract reads like:

> She sets the cup down without looking at him, her shoulders held too still. "I wasn't expecting you tonight." *Why did he have to come back now?*

### Example: a more direct, "typical roleplay" register

If you want prose that reads less like a literary novel and more like how chat roleplay usually looks — tighter, present-tense, less ornament — set the contract explicitly instead of taking `DEFAULTS`:

```text
Perspective:        second             (addresses you as "you" in the prose)
Tense:              present
Narration Marker:   asterisks_for_narration
Dialogue Marker:    double_quotes
Emphasis Marker:    double_asterisks
Paragraph Register: terse              (short paragraphs, dense, fast)
Style Notes:        Keep the prose direct and concrete. Prefer plain statements
                    over poetic phrasing — "his hand is shaking" rather than "a
                    tremor betrays the weight he carries." Avoid antithetical
                    "X, not Y" / "not X but Y" constructions. No purple metaphor;
                    one sensory detail per beat is enough.
```

That produces the punchy, second-person-present, action-in-asterisks style most roleplay uses, and the Style Notes steer it away from the literary tropes the enums can't express on their own:

> _She sets the cup down and meets your eyes._ "You're early." _A beat. Her jaw tightens._ "What do you want?"

### Tuning the feel with Style Notes

The six enums can't capture everything about _voice_. **Style Notes is free text that flows into the world's Main Prompt**, so it's where you put preferences the enums miss:

- **Plainness / anti-"slop":** _"Prefer concrete, factual phrasing over poetic abstraction; avoid 'X rather than Y' and 'with the X of someone who Y' constructions."_
- **Register quirks:** _"The narrator never uses contractions."_ · _"Prose avoids modern idiom in the pre-modern arcs."_
- **Mixed markup:** _"Internal monologue uses `\_italics-underscore_`even though dialogue uses`double*quotes`."*

Two things worth knowing:

- **This is the supported way to control "slop."** World Forge carries no opinion about tropes or clichés. If you want them avoided, _name them here_ — the more concrete your examples, the better the model holds the line. There is no separate trope-removal pass by design; the contract is the lever.
- **Style Notes governs runtime narration** — the prose the model generates as it plays. It's the knob for how your _sessions_ read, not a cleanup pass over the lorebook text.

### Where this gets applied

You set the contract in Section 1.5 of the World Seed — the Interviewer asks for it in Phase 0, or you fill it in directly on a `skip phase0` build. From there the Refiner validates the enum values and records them in the Master Design, the Prompt Engineer parameterizes the preset's Main Prompt from them, and the Architect emits per-card overrides for any Director/Narrator card that declares one. By the time you import into SillyTavern, your style choices are baked into the preset that drives every turn.

---

## 12. Where to learn more

- `README.md` — high-level overview of what the pipeline produces and how the architecture is organized
- `workflows/world-forge.md` — full phase-by-phase orchestrator definition with pause gates and trigger commands
- `workflows/world-forge-revise.md` — the revise pipeline (surgical post-launch edits, R0–R5.5)
- `workflows/world-forge-convert.md` — the convert pipeline (reframe a shipped world into a new build, C0)
- `agent_roles/*.md` — the actual specification each agent runs against (read these if you want to know what an agent will or will not do)
- `Notes_On_functionality.md` — authoritative reference for SillyTavern's runtime behavior (position values, lorebook scanning, prompt assembly, override mechanics)
- `CLAUDE.md` — standing context for AI agents working on the repo itself; useful if you want to extend or modify the pipeline
- `templates/World_Seed_Template.md` — the blank template you fill in for a new world (or that the Interviewer fills in for you)
- `templates/User_Persona_template.md` — the structural reference for `User.md`
- `templates/Convert_Brief_Template.md` — the preservation matrix as a fillable brief, for brief-driven conversions
