# World Forge Pipeline: A Step-by-Step Tutorial

This tutorial walks through the World Forge pipeline using the **Lucifer** project as a worked example. You can follow along by reading the actual artifacts in `Samples/Drafts/` and `Samples/Export/` as they are referenced — every claim in this tutorial maps to a real file you can open.

The Lucifer world was authored by skipping Phase 0 (the user wrote `World_Seed_Lucifer.md` directly). The remaining phases ran in full, including iterative Editor and auditor loops. By the time you finish reading this tutorial, you will know how to read any pipeline output, how to interpret each agent's role, and where to look when something is wrong.

---

## 1. Prerequisites and Setup

You need:

- **VS Code** with [Roo Code](https://github.com/RooCodeInc/Roo-Code) (or an equivalent agentic extension like Cline) configured with an LLM API key.
- A clone of this repository, opened as a VS Code workspace.

That is the entire setup. The pipeline is markdown specifications — there is nothing to build or install.

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
└── Samples/                      ← Worked example: the Lucifer world (full pipeline output)
```

### Project folder structure (what gets generated when you run)

When you start a new world, your project folder evolves through these files:

```text
[project-name]/
├── World_Seed.md                                  ← Phase 0 (or hand-written)
├── UNRESOLVED_QUESTIONS.md                        ← Phase 1 (conditional)
├── UNRESOLVED_INTIMACY.md                         ← Phase 2.5 (conditional)
├── Drafts/                                        ← Phases 1–3.7 outputs
└── Export/                                        ← Phase 4–5 final JSON package
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
 PHASE 4 — The Compiler           → Export/*.json
      v
 PHASE 5 — The Prompt Engineer    → ChatPreset + audit report
      v
 PHASE 5.5 — Manual application   (conditional on audit recommendations)
      v
 ✅ READY FOR SILLYTAVERN
```

### Trigger commands

| Command | Action |
|---|---|
| `/worldforge start` | Begin from Phase 0 |
| `/worldforge skip phase0` | Begin from Phase 1 (you authored the World Seed manually — Lucifer's path) |
| `/worldforge resume phase[N]` | Resume from a specific phase after a pause gate |
| `/worldforge status` | Report current phase, round, and open blockers |
| `/worldforge skip phase2.5` | Skip Intimacy Architect (no intimate content) |
| `/worldforge skip phase3.7` | Skip Intimacy Auditor (no intimate content) |

---

## 3. The Lucifer Case Study

The Lucifer world is a four-arc grimdark narrative: a recovering addict named Anna meets Andrei (the user's protagonist, secretly the Devil), navigates a celestial conflict, and ends in cosmic tragedy and reconstruction. The world has two AI character cards (Anna and a World Director managing NPCs), full intimacy specification across all four arcs, and a multi-faction setting (the Black Hand of God, the Heavenly Host, Jack's prostitution ring).

### Phase 0: The Interviewer — *skipped*

For Lucifer, Phase 0 was skipped. The user authored `Samples/World_Seed_Lucifer.md` manually using `templates/World_Seed_Template.md` as the structural reference. To replicate this pattern:

```
/worldforge skip phase0
```

This is a valid path when you already have a fully-formed concept and want to write the World Seed yourself. The Interviewer is most useful for users whose ideas are still forming or who need pushback on thin material — for a fully-developed world like Lucifer, the manual path is faster.

The completed World Seed contains nine sections: core concept and tone (Section 1), the world (Section 2 — sensory signature, rules, factions, locations, species, concepts), the protagonist (Section 3), characters and their lorebook material (Section 4), narrative arcs (Section 5), technical specifications (Section 6), test scenarios (Section 7b), and the conditional intimacy specification (Section 8). The current pipeline also includes a Section 1.5 Style Contract (perspective, tense, formatting markers); Lucifer's seed predates this section and runs cleanly under the pipeline's defaults pathway.

### Phase 1: The Refiner — `Drafts/Master_Design.md`

The Refiner reads the World Seed and produces a structured Master Design that classifies every piece of content into Tier 1 (world), Tier 2 (character), or Tier 3 (arc). For Lucifer, this produces a 9-section document:

```
SECTION 1: WORLD LAWS & MECHANICS (Tier 1 Source)
  1.1 Core Concept & Tone
  1.2 Tonal Hard Rules
  1.3 Rules of Reality
  1.4 What the World Forbids (Narrative Hard Limits)
  1.5 Sensory Signature of the World
SECTION 2: FACTIONS & POWER STRUCTURES (Tier 1 Source)
  2.1 The Black Hand of God
  2.2 The Heavenly Host
  2.3 Jack's Prostitution Ring & Street Gangs
SECTION 3: STANDING LOCATIONS — Andrei's Penthouse, Anna's Apartment, Ingrid's House, the Streets
SECTION 4: SPECIES & CATEGORIES — Demons, Angels, Nephilim
SECTION 5: WORLD CONCEPTS & LORE — The Veil, The Fall, Heroin Addiction & Withdrawal
SECTION 6: PROTAGONIST SPECIFICATION ({{user}})
SECTION 7: CHARACTER FOUNDATIONS (Tier 2 Source)
SECTION 8: NPC ROSTER (Tier 2 Source — secondary characters)
SECTION 9: NARRATIVE ARC STRUCTURE (Tier 3 Source)
```

If the Refiner finds gaps (a faction with no trigger keywords, an arc without an exit trigger, a character with no central wound), it produces `UNRESOLVED_QUESTIONS.md` and halts. You answer the questions, then resume with `/worldforge resume phase1`. For Lucifer, no gaps were found — the World Seed was complete enough to proceed.

### Phase 2: The Architect — drafts every source file

The Architect takes the locked Master Design and authors every Markdown source the Compiler will need. For Lucifer, Phase 2 produces:

| File | What it contains |
|---|---|
| `Card_Anna.md` | Anna's character card content: description, personality, scenario, first message, example exchanges |
| `Card_World_Director.md` | The World Director card: omniscient narrator content, NPC voice patterns |
| `Tier1_World_Entries.md` | All Tier 1 lorebook entries — world rules, factions, standing locations, species, concepts |
| `Tier2_Anna_Entries.md` | Anna's permanent character lorebook: physical baseline, psychological core, relationships |
| `Tier2_Andrei_Entries.md` | Protagonist lorebook for Andrei (`{{user}}`) |
| `Tier2_NPC_Entries.md` | NPC reference data (Mr. Black, Michael, Jack, etc.) |
| `Tier3_Arc[1-4]_Entries.md` | Per-arc state, NPC shifts, dramatic beats, tension |
| `Instructions_Anna.md` | Anna's `system_prompt` and `post_history_instructions` |
| `Instructions_World_Director.md` | The World Director's `system_prompt` and `post_history_instructions` |

Each Tier 1 entry follows a strict structure. From `Samples/Drafts/Tier1_World_Entries.md`:

```text
### ENTRY: World Rule — Demonic Disguises
**Category:** RULE
**Trigger Keys:** demon disguise, red eyes, sunglasses, disguise fracture, human form demon
**Secondary Keys:** shadow wrong, temperature drop, demonic tell
**Selective Logic:** 0
**Constant:** No
**Injection Position:** 0
**Order Priority:** 100
**Position Rationale:** DEFAULT

**Content:**
All demons operating on Earth must maintain a complete human form. The disguise
requires continuous will — it is not automatic. Under extreme emotional or
physical duress, the disguise fractures: ambient temperature drops sharply,
shadows lengthen and move incorrectly, and red bleeds around the edges of their
sunglasses. The sole tell is their eyes — glowing red...
```

Note the **Position Rationale** field. Every entry must include it. "DEFAULT" means the entry uses the documented default position for its tier (Tier 1 → position 0). Any non-default choice requires a one-sentence justification referencing `Notes_On_functionality.md`. The Editor will hard-fail entries with missing or shallow rationales.

### Phase 2.5: The Intimacy Architect — *conditional*

For worlds with intimate content (Section 8 of the World Seed populated), the Intimacy Architect runs after Phase 2 and drafts two additional file types:

- `Tier2_[CharName]_Intimacy_Profile.md` — permanent intimate substrate per character: trauma map, body reactions, vulnerability shape, voice in intimacy, hard limits and hard yeses.
- `Tier3_Arc[N]_Intimacy_Register.md` — arc-specific delta: thematic function, prose register, live scene types, arc-specific hard rules.

For Lucifer, intimacy is a thematic pillar, so Phase 2.5 ran. The world's intimacy posture was specified as oppressive and transactional (Arc 1) shifting to communion (Arc 4). The per-arc functions were:

- Arc 1: Transaction and Survival — vigilant prose, intimacy as commodity
- Arc 2: Communion and Comfort — frightened discovery; trauma map highly active
- Arc 3: Claim and Play — confidence and ownership
- Arc 4: Ritual — weight and consequence

By specifying Arc 1's function as *transaction* explicitly, the Intimacy Architect ensures the model never writes Anna as enthusiastically initiating sex in Arc 1 — preserving the world's psychological realism. This is the leverage of the function-based approach: the prose register flows from the declared purpose, not from generic erotica defaults.

If your world has no intimate content, leave Section 8 of the World Seed empty and the pipeline will skip Phase 2.5 and Phase 3.7 entirely. Use `/worldforge skip phase2.5` if invoking the orchestrator manually.

### Phase 3: The Editor — iterative quality validation

The Editor validates the Architect's drafts across three layers: prose quality (sensory completeness, show-don't-tell, voice distinctiveness), tier integrity (no arc-specific content in Tier 1 or Tier 2), and LLM instruction quality (system_prompt structure, override architecture compliance, no engine-instruction contamination in cards).

The Editor loops until everything passes. Lucifer required **three rounds**:

- **`Editor_Critique_Round1.md`** — One blocking hard fail: the World Director's `system_prompt` contained the diagnostic phrase `"{{user}} controls their own"`, which is engine-instruction contamination per Editor §5b. The phrase belongs in the preset Main Prompt, spliced via `{{original}}`, not in the card itself. Multiple quality directives also flagged.
- **`Editor_Critique_Round2.md`** — Hard fail resolved. Quality directives addressed. New observations on Tier 2 Intimacy Profile depth and dissociation-snapshot specificity.
- **`Editor_Critique_Round3.md`** — Final clean pass. All 15 directives PASS. All 7 hard rules PASS. No regression. Sign-off issued.

The Editor's sign-off block is the gate to the auditors. Without it, the auditors halt — there is no point validating runtime behavior on material that has structural failures.

If the Editor stalls (three rounds of the same files without improvement), the pipeline pauses and escalates to the user. The problem is usually in the Master Design, not the Architect's execution.

### Phases 3.5 / 3.6 / 3.7: The Auditors — runtime fidelity

The Editor verifies that the drafts are structurally correct. The auditors verify that the drafts will *behave correctly* at runtime. They generate sample dialogue or scenes using the drafts as if the model were running on them, and audit the result against the spec.

#### Phase 3.5: Voice Auditor — `Voice_Audit_Report_Round[N].md`

Builds a test matrix: every AI-played character × every arc × at least three scenarios per character per arc. For Lucifer's Anna:

| # | Test Scenario | Active Arc | Expected Register | Trigger to Verify |
|---|---|---|---|---|
| A1a | Arrival at penthouse; {{user}} offers food without taking anything | Arc 1 | The Wreckage | Sincere unprompted kindness; transactional reflex |
| A1b | {{user}} asks about Timmy during withdrawal | Arc 1 | The Wreckage | Timmy trigger — sarcasm drop; fragmented speech |
| A2a | Anna clean, pre-revelation; {{user}} offers gentle touch unexpectedly | Arc 2 pre-rev | The Becoming | Unexpected gentle touch; warmth-then-deflect |
| ... | (eight more scenarios) | | | |

For each scenario, the auditor generates a 4–6 exchange dialogue sample as if it were the model running on Anna's drafted material, then checks: does the dialogue match the active arc's CHARACTER_STATE? Do triggers fire correctly? Is voice distinct? Does behavior bleed across arcs?

For Lucifer, Round 1 flagged behavioral fidelity issues that traced back to specific draft files. Round 2 verified the fixes. Sign-off issued.

#### Phase 3.6: Arc Transition Auditor — `Arc_Transition_Audit_Round[N].md`

Verifies continuity across consecutive arc seams. For each arc pair, checks: trigger continuity, CHARACTER_STATE continuity, NPC behavioral shift continuity, world state continuity, hidden-information rule continuity, dramatic-beat sequence, tone-register continuity.

For Lucifer, Round 1 found Critical failures at the Arc 1 → Arc 2 seam: the Arc 1 exit trigger (Jack's forces making first contact with the Black Hand) did not causally connect to the Arc 2 entry trigger (Anna's first night sleeping through without withdrawal). The structural bridge — Black Hand's response, the cooling-off period, Anna's recovery process — was missing from the Tier 3 Arc 1 file. The Architect drafted the missing bridge content; Round 2 verified.

#### Phase 3.7: Intimacy Auditor — `Intimacy_Audit_Report_Round[N].md` *(conditional)*

Generates sample intimate scenes and audits them under two lenses:

- **Voice fidelity (primary)**: does each character behave like themselves during sex? Substrate fidelity, trauma map fidelity, voice continuity, hard-limit integrity.
- **Thematic register match (secondary)**: does the scene serve its declared function? Function fidelity, prose-register match, direction fidelity.

When the lenses conflict, voice fidelity wins. Function/substrate contradictions at the Master Design level are escalated to the user, not patched at the draft level.

For Lucifer, Round 1 found behavioral fidelity issues in Arc 2 intimate scenes (trauma map flinch fidelity); Round 2 verified after the Architect tightened the relevant Intimacy Profile and Arc 2 Register entries.

The three auditors run in parallel after Editor sign-off. Failures from any auditor return the affected files to the relevant Architect, then back through the Editor, then back to the auditor.

### Phase 4: The Compiler — `Export/*.json` and `Compiler_Log.md`

The Compiler translates approved Markdown drafts into SillyTavern-ready JSON. Before doing anything, it verifies sign-off from all four prior phases:

```text
| Phase | Report                                | Sign-Off    |
|-------|---------------------------------------|-------------|
| 3.0   | Editor_Critique_Round3.md             | ✅ APPROVED |
| 3.5   | Voice_Audit_Report_Round2.md          | ✅ SIGN-OFF |
| 3.6   | Arc_Transition_Audit_Round2.md        | ✅ SIGN-OFF |
| 3.7   | Intimacy_Audit_Report_Round2.md       | ✅ SIGN-OFF |
```

Without all four sign-offs, the Compiler halts. This is the audit-vs-apply discipline of the pipeline: nothing reaches Export/ that has not passed every quality gate.

For Lucifer, the Compiler produced 17 JSON files plus the log:

- 2 character cards (`Anna_Card.json`, `World_Director_Card.json`)
- 1 World Lorebook (Tier 1, 22 entries)
- 1 Andrei (Protagonist) Lorebook (Tier 2)
- 1 Anna Lorebook (Tier 2)
- 1 NPC Lorebook (Tier 2)
- 1 Anna Intimacy Profile (Tier 2)
- 4 Arc Lorebooks (Tier 3)
- 4 Arc Intimacy Registers (Tier 3)
- 1 Group Lorebook (all tiers combined)

The Compiler Log includes a **Persona Linkage Instruction** because the Protagonist Lorebook needs to be manually linked to the active SillyTavern Persona after import — this is documented inline in `Samples/Export/Compiler_Log.md`.

### Phase 5: The Prompt Engineer — `Prompt_Engineer_Audit.md` and `[WorldName]_ChatPreset.json`

The Prompt Engineer does two things in parallel:

1. **Audits the Compiler's output** (read-only on `Export/`). Reviews every lorebook entry for position correctness, injection order, keyword coverage, and budget risk. Reviews every character card for system_prompt, post_history_instructions, and depth_prompt correctness. Cross-checks card behavioral mandates against arc CHARACTER_STATE entries to prevent drift.
2. **Authors the Chat Completion Preset** — the file SillyTavern loads as the model's runtime prompt configuration. For each block (Main Prompt, Deep Think, Arc Guardian, Lore Integration, Spatial Awareness, Sensory Embodiment, Formatting, Jailbreak, plus optional/conditional blocks), the agent writes world-specific content per a Block Selection Rationale that names the world's likely runtime failure modes.

The audit report is structured as numbered sections — for Lucifer, position logic review (table of all 22 World Lorebook entries verified), keyword coverage audit, card-lorebook consistency audit, Block Selection Rationale, and a sign-off. If the audit finds runtime risks, the recommendations land in **Sections 7 and 8** of the report as plain-text instructions for manual application — the Prompt Engineer never modifies its own audit subject.

### Phase 5.5: Manual application — *conditional*

If the Prompt Engineer's audit produced recommendations in Sections 7 or 8, the user opens each named file, applies the corrections, and saves. The pipeline is complete only after this step.

For Lucifer, the audit ended `Status: COMPLETE`, so no Phase 5.5 was needed. The Export/ directory was ready for SillyTavern import as-is.

---

## 4. Reading the artifacts

`Samples/` is structured to be navigable. If you want to understand a specific aspect of the pipeline, here is where to look:

| Question | File to read |
|---|---|
| How does a World Seed actually look when complete? | `Samples/World_Seed_Lucifer.md` |
| How does the Refiner organize a world into tiers? | `Samples/Drafts/Master_Design.md` |
| What does a fully-drafted character card look like? | `Samples/Drafts/Card_Anna.md`, `Samples/Drafts/Card_World_Director.md` |
| How are Tier 1/2/3 lorebook entries structured? | `Samples/Drafts/Tier1_World_Entries.md`, `Samples/Drafts/Tier2_Anna_Entries.md`, `Samples/Drafts/Tier3_Arc1_Entries.md` |
| What is the difference between Tier 2 Intimacy Profile and Tier 3 Intimacy Register? | `Samples/Drafts/Tier2_Anna_Intimacy_Profile.md` vs. `Samples/Drafts/Tier3_Arc1_Intimacy_Register.md` |
| How does the Editor flag and resolve issues? | `Samples/Drafts/Editor_Critique_Round1.md` (failures) → `Round3.md` (clean sign-off) |
| What does an auditor's test matrix and dialogue audit look like? | `Samples/Drafts/Voice_Audit_Report_Round1.md` |
| How does the Compiler verify the pipeline's chain of sign-offs? | `Samples/Export/Compiler_Log.md` |
| What does the final Chat Completion Preset look like? | `Samples/Export/Lucifer_ChatPreset.json` |
| How thorough is the runtime audit? | `Samples/Export/Prompt_Engineer_Audit.md` |

For an additional view of how the same world looks under the **current pipeline's Style Contract feature**, see `Samples2/Export/`. The same Lucifer world's character cards and chat preset are regenerated to show the `<style_contract>` block in the Main Prompt and the World Director's `<style_override>` block (Lucifer is multi-perspective: Anna third-person limited, Director third-person omniscient). The unchanged Lorebook JSONs are not duplicated.

---

## 5. After SillyTavern import

Once your `Export/` directory is ready:

1. Import each `*.json` lorebook through SillyTavern's **World Info** panel. Import each character card through the **Character Management** panel. Import the chat preset through **API settings → Chat Completion Presets → Import**.
2. In the World Info panel, enable the **World Lorebook** group and all **Character Lorebook** groups permanently. **Arc lorebooks** are swap-in: enable Arc 1 to start; switch to Arc 2 when the story's exit trigger fires (e.g., for Lucifer, when Anna sleeps through her first night without withdrawal); and so on. **Only one arc lorebook should be active at a time.** The same applies to Arc Intimacy Registers when present.
3. Link the **Protagonist Lorebook** to your active Persona in **User Settings → Persona Management** so it scans only when that persona is active. For Lucifer this means linking `Andrei_Lorebook.json` to a persona named Andrei Petrov.
4. Select the world's Chat Completion Preset (e.g., `Lucifer_ChatPreset.json`) in the API settings panel.

You are ready to roleplay.

---

## 6. Common gotchas

- **Phase 1 paused with UNRESOLVED_QUESTIONS.md.** This is the Refiner finding gaps. Read the file, answer the questions in your World Seed, then `/worldforge resume phase1`. Do not skip — gaps propagate forward and produce broken cards.
- **Phase 3 looped three times without improvement.** The Editor escalates to you. The problem is usually in the Master Design, not the Architect's execution. Re-examine the Master Design's relevant section.
- **Auditor flagged a Critical failure that ties to the Master Design itself.** Sometimes the bug is structural — an arc's exit trigger doesn't causally connect to the next arc's entry; a character's substrate forbids a behavior the world wants in scene. The fix is to update the Master Design and re-run from Phase 2, not to patch the symptom in the drafts.
- **Phase 5 audit ended "AUDIT COMPLETE — N manual corrections required."** Phase 5.5 is not optional in this case. Open each Export/ file named in the audit, apply the recommended corrections, save. Only then is the world ready.
- **Unfamiliar files in Samples/.** Lucifer's Drafts/ has 27 files because the world has four arcs, two character cards, full intimacy specification, and went through three Editor rounds and two rounds for each auditor. A simpler world produces fewer files. The structure is the same; the volume scales with the world.

---

## 7. Where to learn more

- `README.md` — high-level overview of what the pipeline produces and how the architecture is organized
- `workflows/world-forge.md` — full phase-by-phase orchestrator definition with pause gates and trigger commands
- `agent_roles/*.md` — the actual specification each agent runs against (read these if you want to know what an agent will or will not do)
- `Notes_On_functionality.md` — authoritative reference for SillyTavern's runtime behavior (position values, lorebook scanning, prompt assembly, override mechanics)
- `CLAUDE.md` — standing context for AI agents working on the repo itself; useful if you want to extend or modify the pipeline
- `templates/World_Seed_Template.md` — the blank template you fill in for a new world (or that the Interviewer fills in for you)
