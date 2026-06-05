# Changelog

All notable changes to the **World Forge** pipeline.

World Forge is a multi-agent pipeline that turns a world idea into a complete
SillyTavern-ready roleplay package — character cards, layered (three-tier)
lorebooks, a `{{user}}` persona, and a tuned Chat Completion Preset — through
staged drafting and auditing for voice, tier integrity, and runtime fidelity.

The pipeline ships as living markdown specifications rather than versioned
software, so entries are grouped by date and pull request rather than release
numbers. Newest first.

---

## 2026-06-05 — Sandbox-aware revise pipeline

The post-launch revision pipeline (`/worldforge revise`) now handles sandbox
worlds, closing the gap flagged when Sandbox Mode shipped.

### Added
- Three sandbox revision **scope types** (taxonomy 11 → 14): `sandbox_state_recalibration`
  (the `SANDBOX_STATE` / aliveness-contract analog of `tier3_arc_tonal_recalibration`),
  `sandbox_entry_modify`, and `sandbox_entry_add`. The Reviser reads `World Mode` and
  uses these in place of the `tier3_arc_*` types on sandbox worlds.
- Mode-aware NPC and intimacy scopes: `tier2_new_character` / `tier2_character_voice_calibration`
  classify principal vs. roster NPCs (roster changes fire the Voice Auditor's
  Distinctiveness Matrix); `intimacy_*` scopes target the single standing
  `Sandbox_Intimacy_Register` and NPC intimacy (principal profile / roster §6.5 block).

### Changed
- The **Arc Transition Auditor (R3.6) never fires** on a sandbox revision — no arc seams.
- Thin sandbox deltas threaded through every revise mini (they inherit their now
  sandbox-aware parents); routing matrix, Reviser scope table, and the deferral notes
  in CLAUDE.md / the orchestrator / the tutorial updated accordingly.

### Notes
- *Flipping* a world between arc and sandbox stays out of revise scope — a Section 1
  `World Mode` change bounces to a full rebuild (`skip phase0`). An automated
  arc→sandbox converter remains the one deferred piece.

---

## 2026-06-05 — Sandbox Mode

A first-class alternative to arc-driven worlds, for open-ended experiences that
have no narrative arc — power-fantasy, world-director, and life-sim worlds
anchored by a standing world-state and a large NPC cast.

### Added
- **Sandbox World Mode** (#17). Declared in World Seed §1 (`World Mode: arc | sandbox`)
  or via `/worldforge start --sandbox`. A branch *through* the existing pipeline,
  not a parallel fork — the same agents run with the Tier 3 spine and large-cast
  NPC format repointed. `arc` remains the default; all existing worlds are unaffected.
- **Sandbox Lorebook** (Tier 3, always active) replacing per-arc lorebooks:
  `SANDBOX_STATE` (the `ARC_STATE` analog — standing situation + tonal mandate +
  an **aliveness contract**) and `WORLD_PULSE` (the `TENSION` analog — a sustained
  "the world is alive and reactive" directive). No `CHARACTER_STATE`/`NPC_SHIFT`/
  `DRAMATIC_BEAT`/arc-trigger entries.
- **Two-tier NPC model** for large casts: principal NPCs keep full profiles; the
  rest become compact roster stat blocks with a binding voice-fingerprint
  uniqueness rule. The Voice Auditor gains a sandbox-only **Distinctiveness Matrix**
  (Step 3I) — a blind-line test that flags interchangeable or voiceless NPCs.
- **NPC Ensemble & Enrichment** preset block (`npc_ensemble`, #17): NPC-to-NPC
  dialogue, ensemble prose scaling for multi-NPC scenes, and organic NPC enrichment
  within guardrails (the NPC-roster analogue of `enhanceDefinitions`). Plus a
  sandbox sensory-emphasis weighting on the Sensory Embodiment block.
- **Sandbox + NPC intimacy** (#17): the Tier 3 intimacy register folds into a single
  standing `Sandbox_Intimacy_Register`; NPC intimacy follows the principal/roster
  split (full profiles for principals, compact §6.5 intimate stat blocks for roster
  NPCs). The Intimacy Auditor adds an NPC intimate coverage + distinctiveness check
  (Step 3H).
- **Documentation & template catch-up** (#18): tutorial Section 7 (Sandbox worlds),
  new trigger commands, and sandbox guidance in the lorebook / card / group-lorebook
  authoring templates.

### Changed
- Phase 3.6 (Arc Transition Auditor) is **skipped** in sandbox mode — there are no
  arc seams to audit. The ≥8-entries-per-arc floor and cross-arc qualifiers do not apply.

### Notes
- Pipeline-only; no existing worlds were modified. *(The revise pipeline was made
  sandbox-aware in a follow-up — see the entry above; an automated arc→sandbox
  converter remains deferred future work.)*

---

## 2026-05-23 — Post-launch maintenance & runtime refinements

### Added
- **Revision pipeline** (#11) — `/worldforge revise`, a surgical post-launch fork that
  runs scope-locked mini-agents with read-mostly authority and UID-preserving
  compilation, keeping running SillyTavern chat states viable across edits. Includes a
  cumulative revision manifest in the mini-Compiler.
- **Preset Resync** (#13) — `/worldforge resync-preset`, a maintenance op that
  regenerates a shipped world's Chat Completion Preset against the current template +
  block library, re-deriving block content from the post-revision Master Design while
  preserving identifiers, order, and user customizations.
- **Scope-of-Turn** step in Deep Think (#14) — frames each reply as one move in an
  ongoing scene to curb beat-rushing and premature resolution.

### Changed
- **Deep Think** reframed as a checklist of considerations rather than a numbered
  procedure (#12), so it steers a reasoning model's attention without flattening its
  own process.
- **Jailbreak block** high-risk permission line gated on NSFW scope (#16); a dead group
  preset was removed.
- README documents the revise and resync commands; CLAUDE.md updated for the template
  inventory, the `wiki/` directory, and preset resync (#15).

---

## 2026-05-18 — Optional preset blocks

### Added
- **Opening Variation** and **Perception Boundary** optional Prompt Engineer blocks (#10):
  rotate response entry points to avoid the narration-first AI cadence, and keep
  in-scene characters from "reading" `{{user}}`'s narration and inner thoughts.

---

## 2026-05-15 — Jailbreak frame & setup docs

### Changed
- **Constitutive-fictional jailbreak frame** (#8) — replaced jailbreak boilerplate with a
  world-agnostic frame: a self-contained fictional metaverse, `{{user}}`-as-actor,
  authority deferred to in-context surfaces (lorebooks, chat log), and the four refusal
  axes named explicitly.

### Added
- Dedicated **Kilo Code setup** tutorial; MCP-servers guidance (none required); provider
  coverage for OpenRouter, Nano-GPT, and local models, surfaced across the docs.

---

## 2026-05-14 — Style Contract & architecture pass

### Added
- **Style Contract system** (#5) — per-world prose conventions (perspective, tense,
  narration / dialogue / emphasis markers, paragraph register) with per-card overrides,
  threaded through the World Seed, card template, Interviewer, Refiner, Architect, Editor,
  Voice Auditor, and the Prompt Engineer's preset. Per-card overrides are metadata-only
  (`extensions.world_forge.style_override`), consumed by a `world_forge`-aware extension at
  runtime and inert on stock SillyTavern.
- A phase-by-phase **tutorial** rewrite walking the Lucifer world, and an expanded README
  (architecture, Phase 5.5, Style Contract, Samples reference).
- README model-choice disclaimer and a note on the companion SillyTavern fork.

### Changed
- Agent specs refactored for attention coherence (foundational-rules headers + a shared
  Style Contract reference); Compiler guardrail against echoing the write-tool path into
  JSON content.

### Removed
- `Samples2/` demo-only output (#6), keeping `main` free of large generated artifacts.

---

## 2026-05-12 — Tooling guidance

### Added
- **Agentic Tools & Models** wiki page (#4): tool comparison (Roo / Kilo / Cline) and model
  recommendations, including a documented Gemini Flash failure mode.

---

## 2026-05-09 — `{{user}}` persona artifact

### Added
- **`User.md`** persona artifact (#3) — the paste-ready `{{user}}` Persona Description
  (≤150 words, reference-only) that closes SillyTavern's missing persona-import gap and
  pairs with the Tier 2 Protagonist Lorebook to give `{{user}}` parity with `{{char}}`.

---

## 2026-05-07 — Foundations

### Added
- **`CLAUDE.md`** (#2) — standing context and guardrails for AI coding agents working on the
  pipeline.
- **ARC_STATE two-subsection format** in the Architect and Editor — `Dramatic Situation`
  (descriptive) + `Tonal Mandate` (binding directive), so arc behavioral cues are read as
  commands rather than world-flavor.
