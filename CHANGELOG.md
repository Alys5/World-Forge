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

## 2026-06-11 — Escalation Ladders: NPC-driven subplots from wants, desires, and goals

The pipeline mechanized NPC *initiative* (§7.D Standing Goals + the activity-cadence
directive) but not *progression* — a Standing Goal is a flat drive with no stages,
complications, or resolution. Mid-tier runtime models (DeepSeek/GLM class) won't
invent coherent multi-session subplots, but they reliably *execute* authored plans.
The Escalation Ladder closes the gap on that division of labor: the author stages
the subplot; the model recognizes stated conditions and runs the next authored stage.

### Added
- **Escalation Ladder** — optional extension of the §7.D Standing Goal
  (`agent_roles/02_The_Architect.md`): 2–4 ordered stages (on-screen moves,
  off-screen moves with surfaceable evidence, an in-fiction observable advance
  condition each), a stated **endpoint** (ladders resolve; standing pressure stays
  TENSION/WORLD_PULSE's job), and a stated **collision** with `{{user}}` or the
  main spine (missing collision = Editor hard fail). Opt-in per NPC; >3 laddered
  NPCs per world is a soft flag. Seed field in `templates/World_Seed_Template.md`;
  elicitation in the Interviewer; recording + integrity pre-check in the Refiner.
- **Stage state, per mode.** Arc mode gets hard state: an optional
  `Active ladder stage this arc` delta line in NPC_SHIFT, named by the ARC_STATE
  cadence bullet, with stage transitions as optional keyed DRAMATIC_BEATs.
  Sandbox mode gets soft state: the stage is named in the SANDBOX_STATE aliveness
  bullet and anchored by WORLD_PULSE's depth-2–4 recency injection, with the
  revise pipeline's `sandbox_state_recalibration` as the manual ratchet when play
  moves past the named stage.
- **Progression discipline** in the cadence/aliveness directive: named current
  stage, advance only when the stated condition occurs in-fiction, never skip a
  stage, never resolve the endpoint without `{{user}}` having had the chance to
  interfere.
- **Audit teeth.** Editor Step 4a-3c (ladder format integrity, stage-named
  cadence, dangling-stage extension — hard fails; >3 ladders + unchoreographed
  collisions — soft flags). Voice Auditor Step 3J extensions (stage-trace: lull
  moves belong to the *active* stage; a "temptation" scenario probes that the
  model holds the stage instead of jumping to the endgame). Arc Transition
  Auditor Check 3b extension (stages monotonic across seams, advancement
  satisfies the authored condition via a beat or stated off-screen event, no
  off-page endpoint resolution).

### Changed
- `agent_roles/05a_Block_Library.md` — one clarifying sentence in the
  `npc_ensemble` enrichment guardrail: executing an authored ladder (including
  surfacing its stated off-screen evidence) is goal-following, not
  enrichment-invention; inventing stages/conditions/resolutions remains forbidden.
- `agent_roles/Converter/00_The_Converter.md` + `templates/Convert_Brief_Template.md`
  — the ladder rides the Standing Goal carry-across rule, with per-stage and
  collision audits (protagonist-coupled parts strip + mark); active stage never
  carries (it is Tier 3 state). Rebaseline carries the ladder verbatim with the
  rebuild starting at the post-revision high-water stage.
- `agent_roles/revise/00_The_Reviser.md` — no new scope types; stage bumps route
  through `tier3_arc_entry_modify` (arc) / `sandbox_state_recalibration`
  (sandbox); examples added.

### Unchanged on purpose
- No new entry types, positions, flags, phases, or scope types; no Compiler or
  `tools/validate_export.py` changes; no preset content changes. Flat Standing
  Goals remain the default and fully valid — every new check is conditional on a
  ladder existing, so existing worlds are unaffected.

---

## 2026-06-11 — Convert Rebaseline mode: consolidate a revised world into a clean rebuild

A world that has been through several revisions (R1…R[N]) accumulates `<!-- REVISED
IN R[N] -->` markers across `Master_Design.md` and `Drafts/`, while its
`World_Seed.md` stays frozen at Phase 0 — revisions never back-propagate to the
seed. Until now there was no consolidation path: `skip phase0` rebuilds from the
stale seed (losing every revision), and regular Convert always regenerates the
protagonist and arc spine (losing them too). Rebaseline closes the gap.

### Added
- **Rebaseline mode** (`/worldforge convert <source> <target> --rebaseline`;
  combines with `--brief`) — the zero-axes-replaced conversion, formalized: same
  world, same protagonist, rebuilt clean from the *post-revision* Master Design,
  optionally folding in new mechanics at seed level. Spec lives in
  `agent_roles/Converter/00_The_Converter.md` **Section 9**; operation in the
  new **REBASELINE MODE** section of `workflows/world-forge-convert.md`.
  Load-bearing properties:
  - **The always-regenerate rules invert.** Foundational rule 8's premise ("the
    protagonist has changed by definition") is absent, so Sections 3 / 5 / 7b,
    per-arc/standing intimate functions, per-card style overrides,
    relationship-to-`{{user}}` content, and the four Section 4 strip rules
    (Standing Goal / drift / operative belief / trauma trajectory) all flip to
    keep/carry — distilled from the post-revision Master Design at **seed grade**
    (distill, never dump; no entry-level content in the seed).
  - **Zero-axes gate** replaces the overlap floor: any replaced axis reclassifies
    the run as a regular (reframe) conversion — announced, not refused. A
    rebaseline with no revisions and no new mechanics is flagged as a no-op copy.
  - **Revision reports become required reading** (`Drafts/Revision_R*.md` +
    `Export/REVISED_FILES.md`), with a source-integrity check: every reported
    change must be visible in the current Master Design, else halt — a drifted
    source would silently lose a revision. The revision high-water mark is
    recorded in the Conversion Manifest.
  - **Clean means marker-free.** Revision content carries; `REVISED IN R[N]`
    markers do not. Provenance moves to `<!-- REBASELINED FROM ... -->` comments
    + the manifest. The new project's revision counter restarts at R1.
  - **The honest cost is stated, not implied:** the rebuild compiles fresh UIDs,
    so running SillyTavern chats do not migrate (revise preserves UIDs precisely
    to avoid this; rebaseline trades it for cleanliness). The Converter prints
    this at hand-off and records the acknowledgment in the manifest.
- **`--then-interview` hand-off + the Interviewer's seed-revision posture.**
  `/worldforge convert <source> <target> --rebaseline --then-interview` chains
  the consolidation directly into **Phase 0** for when the rebaseline is a
  staging step for major changes: instead of `skip phase0`, the C0 hand-off
  dispatches the Interviewer in the new **seed-revision posture**
  (`agent_roles/00_The_Interviewer.md` Section 9) — read the complete
  consolidated seed + Conversion Manifest, play the world back, interview *only
  the user's changes* at full Phase 0 depth, re-elicit the cascade on coupled
  fields (changed arcs drag drift / trauma-trajectory / intimate-function lines;
  a changed protagonist drags relationship-to-`{{user}}` content, with an honest
  pointer that reframe conversion automates those strips), mark changed sections
  `<!-- CHANGED IN SEED-REVISION INTERVIEW -->`, append a dated note to the
  Conversion Manifest, sign off, and hand to Phase 1. The flag requires
  `--rebaseline`; in reframe mode the C0 interview already does this work. The
  posture is also dispatchable standalone against any complete pre-build seed.

### Changed
- **`agent_roles/Converter/00_The_Converter.md`** — header + rule 8 carve-out,
  `--rebaseline` / `--then-interview` invocations, Step 2 / Step 3 / matrix
  touch-points, manifest fields (`Operating mode`, revision high-water mark,
  rebaseline manifest variant), Section 9 Step H hand-off variant, sign-off
  gains a rebaseline checklist + Operating Mode block, context manifest notes
  the rebaseline-required reads.
- **`agent_roles/00_The_Interviewer.md`** — new Section 9 (seed-revision
  posture); context manifest now loads the existing `World_Seed.md` in that
  posture as well as on resume.
- **`templates/Convert_Brief_Template.md`** — Section 1 gains `Operating mode:
  reframe | rebaseline`; Section 2 gains the new-mechanics field; per-section
  *Rebaseline:* notes mirror the Section 9 inversions (Sections 5/6 become
  keep-from-source); sign-off updated. The Brief remains row-for-row consistent
  with the preservation matrix.
- **`workflows/world-forge-convert.md`** — operating-modes table, REBASELINE MODE
  section, three new pause gates (Reclassify / No-Op / Source Integrity), trigger
  commands, and the operations-comparison table.
- **`workflows/world-forge.md`** — CONVERT section and trigger commands document
  the mode; the "always-regenerated content" property is now reframe-scoped.
- **`CLAUDE.md`** — principle #10 retitled "Convert Pipeline (Reframe +
  Rebaseline)" with the mode's load-bearing properties; principle #6 points
  accumulated-revision consolidation at Rebaseline; cross-file consistency row
  updated. `tutorial.md` §8 gains a Rebaseline subsection + trigger-table row;
  the Converter's `kilo.jsonc` description mentions the mode.

No downstream agent changes: a rebaselined seed is a maximally-preserved
converted seed with Section 5 populated — the normal hand-written-seed path the
Refiner already handles.

---

## 2026-06-11 — Kilo config: DeepSeek 4 Pro on every seat; revise minis as subagents

Catch-up entry for two config changes shipped without changelog entries, plus
the documentation drift they left behind.

### Changed
- **`.kilo/kilo.jsonc` — all seats now run `deepseek/deepseek-v4-pro`** (via
  OpenRouter). The Editor and the three Auditors previously ran `deepseek-r1`
  with no temperature (reasoner endpoints ignore sampling parameters); as
  chat-tuned seats they now carry explicit temperatures — Editor 0.3, Auditors
  0.6 — alongside the existing per-phase values (creative seats 0.8, Refiner 0.4,
  Compiler 0.1, Prompt Engineer 0.3, Reviser 0.5, Converter 0.6). All 21 agents
  verified against the models wiki §3.5 ranges. The header comment documents the
  optional upgrade path back to a reasoning model for the strongest audits.
- **`.kilo/kilo.jsonc` — the nine revise minis (`agent_roles/revise/*`) are now
  defined as agents**, so the top-level Code agent can dispatch them as subagents
  per `AGENTS.md`'s delegation instructions. Temperatures mirror their parents.

### Fixed
- **Stale reasoner references in the wikis.** `Agentic-Tools-and-Models.md` §3.5
  claimed the shipped `kilo.jsonc` runs audit seats on a reasoner ("they need no
  temperature profile"), and `Kilo-Code-Setup.md` §5.4 still said "the Editor and
  the three Auditors run `deepseek-r1`" with no temperature set. Both rewritten
  to match the shipped config (chat-tuned DeepSeek 4 Pro with temperatures
  everywhere; drop the `temperature` field only if you upgrade a seat to a
  reasoner-class model).

---

## 2026-06-10 — Preconfigured Kilo Code project config

### Added
- **`.kilo/kilo.jsonc`** — project-scoped Kilo Code agent definitions, auto-loaded
  when the workspace opens (takes precedence over the global config). Twelve
  agents: the ten initial-build phases plus the Reviser and Converter entry
  points. Schema verified against the official Kilo docs
  (kilo.ai/docs/customize/custom-subagents): each agent uses `prompt:
  "{file:../agent_roles/...}"` to pin its phase spec as the system prompt
  (paths resolve relative to the config file), `mode: "all"` (user-selectable
  and Task-dispatchable), a provider-prefixed `model`, and a per-agent
  `temperature` from the models wiki §3.5 table. Models route through
  OpenRouter — DeepSeek 4 Pro on drafting/utility seats, `deepseek-reasoner`
  on the Editor + Auditor seats (no temperature set — reasoner endpoints
  ignore sampling parameters). API keys are never read from this file;
  non-OpenRouter users edit the `"model"` prefixes per the header comment.
  Wiki §5 rewritten against the verified schema (incl. the `.kilo/agents/`
  markdown-agent alternative and the per-agent `permission` field); the
  hand-written walkthrough remains as reference for alternative flavors.
- **Sampling-temperature guidance for the pipeline agents.** Models wiki gains
  §3.5 — a per-phase temperature table (creative seats 0.7–0.9, auditors mid,
  Editor low, Compiler ~0) with the two-temperatures scope note (agent sampling
  vs. the runtime preset's `temperature` field) and the reasoner caveat. The
  values are baked into the shipped `.kilo/kilo.jsonc` as per-agent
  `temperature` fields; Kilo setup §5.4 documents adjusting them. Tutorial §1
  points at both.

---

## 2026-06-10 — Agentic-friendliness: context discipline for small-context models

The pipeline was sized against 200K-context frontier models; this change makes it run
well on non-frontier models (DeepSeek 4, GLM 5) under Kilo Code / Roo Code by controlling
*what gets loaded per phase* rather than shrinking any spec content. The discipline is
framed as quality-and-cost engineering, not a hard window ceiling — nominal windows vary
(DeepSeek 4 Pro 1M, GLM 5 200K), but effective recall degrades well before nominal
limits on every model. No behavioral rule of any agent changed except where reading
mandates were scoped (see Changed).

### Added
- **`AGENTS.md`** — standing instructions for agentic tools (Kilo reads this, not
  `CLAUDE.md`). Routes sessions by type: pipeline *runs* go to `workflows/world-forge.md`
  with the runtime read-only rules; pipeline *maintenance* goes to `CLAUDE.md`. Carries
  the hard invariants compressed to one line each.
- **`.kilocodeignore`** — shipped denylist keeping `Samples/` (>1 MB), `wiki/`,
  `CLAUDE.md`, `CHANGELOG.md`, and `tutorial.md` out of auto-included runtime context.
- **`📂 CONTEXT MANIFEST` blocks** at the top of all eleven main agent specs — an
  explicit "load now / load on demand / do NOT load" read-set per phase, derived from
  each spec's INPUT section. Smaller models over-read or under-read without this; the
  manifests also document each spec's true dependencies. New editing-protocol rule:
  manifests must stay in sync with INPUT sections.
- **`Notes_Quick_Reference.md`** — a ~5 KB DERIVED distillation of
  `Notes_On_functionality.md` (position enum + routing, `{{original}}` override
  mechanics, prompt assembly order, behavior-bearing lorebook flags, strictness/provider
  gotchas). Agents consult it first; the full Notes file remains the sole authority and
  the quick reference must be regenerated when it changes (new cross-file consistency
  row).
- **`agent_roles/05a_Block_Library.md`** — the Prompt Engineer's Section 5a block
  library (~37 KB, half the spec) split into its own file. The audit workstream never
  needed it; now it loads only for preset authoring and Preset Resync. Section numbering
  (5a / 5a-detail) preserved so existing cross-references resolve. Parent spec drops
  from 114 KB to 78 KB.
- **`tools/validate_export.py`** — a stdlib-only, strictly **read-only** validator for
  `Export/` JSON: strict UTF-8 decode, mojibake markers (the PowerShell re-encode
  signature that passes `JSON.parse`), parse validity, `{{original}}` at the top of both
  card override fields, `depth_prompt` / `style_override` structure, position enum 0–7,
  UID uniqueness, and preset `prompts`/`prompt_order` resolution. An explicit, documented
  exception to the repo's no-code rule (approved 2026-06-10); it modifies nothing and
  exists as a deterministic backstop for the Compiler's pre-save guards.
- **Wiki: models page §3.4** — context discipline on DeepSeek/GLM: per-phase agents
  strongly recommended everywhere and effectively mandatory on 200K-and-below windows
  for large worlds, where to spend a frontier seat (Editor/Auditors — sycophancy under
  audit is these models' weak spot, not prose), DeepSeek automatic prefix caching,
  GLM 5 added to the recommended tiers. **Kilo setup page** — DeepSeek/GLM `kilo.jsonc`
  flavor, shipped `AGENTS.md`/`.kilocodeignore` documentation, validator allowlisting
  note, updated troubleshooting rows.

### Changed
- **Prompt Engineer reading mandate scoped.** "Read `Notes_On_functionality.md`
  completely before any audit" became: quick reference in full + Notes §5.2 / §5.10 / §8
  completely (the sections runtime judgments rest on), rest on demand. The Compiler's
  "read Notes first" similarly routes through the quick reference + targeted schema
  sections. No validation rule weakened — only the reading path to the same facts.
- **Phase 4 post-compile check** added to the orchestrator: run
  `python tools/validate_export.py Export/` (read-only) when a Python runtime is
  available; failures mean fix the source and re-compile, never hand-edit Export/ JSON.
- `CLAUDE.md` — repository tree, file authority levels, cross-file consistency table
  (four new/updated rows), editing protocol (manifest-sync rule), and the out-of-scope
  exceptions updated to match all of the above.

---

## 2026-06-09 — Convert pipeline (reframe a shipped world into a new build)

A fourth operating mode alongside initial-build / revise / preset-resync,
landing the "deferred arc→sandbox converter" called out in the Sandbox Mode
entries below — and broader in scope than just mode flips. The Convert pipeline
is the legitimate path for the change-categories the revise pipeline explicitly
bounces: a different protagonist, a `World Mode` flip (arc ↔ sandbox), a
different Style Contract at the world level, or a different Core Concept &
Tone (Master Design Section 1). It preserves the structural world-building
work (Tier 1 rules / factions / locations / cosmology, most of Tier 2
characters) that a from-scratch `/worldforge start` would discard (#24).

### Added
- **`/worldforge convert <source> <target>`** — a single-phase pipeline (C0)
  driven by the new **Converter** agent (`agent_roles/Converter/00_The_Converter.md`).
  Reads the source world's `Drafts/Master_Design.md` **read-only**, walks the
  user through a preservation matrix (keep / modify / drop / regenerate per
  source section), surfaces role reassignments explicitly (old protagonist
  becoming an NPC, source NPC becoming the new `{{user}}`, power-tier shifts),
  and writes a new `World_Seed.md` to the target project folder. The user then
  runs `/worldforge skip phase0` against the target and the standard pipeline
  (Phases 1–5.5) builds the new world end-to-end. Convert is **upstream** of
  the standard pipeline, not parallel to it — no downstream agent needs special
  handling for a converted world.
- **Overlap floor refusal (the reskin refusal).** The Converter classifies
  conversion intent against four axes — setting, protagonist, factions, tone —
  and refuses outright if three or four are replaced. At that scale the source
  is creative reference, not a structural source; the user is bounced to
  `/worldforge start` fresh. Borderline (two axes replaced) is surfaced for
  explicit user confirmation. Single source only — no mashups.
- **Convert Brief** (`templates/Convert_Brief_Template.md`) — an optional
  pre-authored brief mirroring the preservation matrix row-for-row. The
  brief-driven mode (`--brief <path>`) validates the brief against the source
  and interviews only on gaps / ambiguities, making non-trivial conversions
  version-controllable and reviewable.
- **Conversion Manifest** at the top of every converted seed — records source
  path, intent verbatim, overlap floor classification, per-section preservation
  decisions, role reassignments, and cross-references the user should be aware
  of. The Refiner reads it at Phase 1 to route accordingly. HTML-comment
  markers throughout the seed (`<!-- CONVERTED FROM ... -->`,
  `<!-- RELATIONSHIP TO {{user}} TO BE REAUTHORED FOR NEW PROTAGONIST -->`,
  `<!-- WAS SOURCE PROTAGONIST — TIER 2 BLOCK REAUTHORED ... -->`) make
  provenance traceable for both downstream agents and human readers.
- **Section 4 carry-across rules** for the four mechanics added in PR #23
  (NPC `Standing Goal`, relationship `How it drifts (arc worlds)`,
  `Operative belief`, intimacy `Trauma trajectory (arc worlds)`). Each field
  couples to the regenerated parts of a converted seed (Section 3 protagonist
  + Section 5 arcs), so carrying them naively produces a seed that mentions
  arcs that don't exist yet and a protagonist who doesn't exist yet. Rules:
  Standing Goal preserves if protagonist-agnostic else strips with a reauthor
  marker; drift always strips (arcs regenerate); Operative belief preserves
  only between two preserved characters AND not about `{{user}}`; Trauma
  trajectory always strips (arc-coupled). The base Trauma map (trigger +
  response, no trajectory) carries through normally.
- **CLAUDE.md principle #10 (Convert Pipeline)**, repo-structure tree updates,
  and three new cross-file consistency rows (Convert three-file contract;
  Interviewer Section 3 ↔ Converter Step 4 protagonist authoring; NPC agency
  / relationship-belief / trauma-trajectory machinery ↔ Converter Section 4
  carry-across).
- **`workflows/world-forge-convert.md`** — the convert orchestrator (phase
  outline, role reassignment surfacing for the five canonical cases, handoff
  semantics, pause gates, file structure, trigger commands, relationship to
  other pipeline operations).
- **Tutorial Section 8** — worked example (Lucifer → God): how the Converter
  walks the preservation matrix, what carries forward verbatim, what gets
  reauthored downstream, and how the four new Section 4 fields are handled
  automatically.

### Notes
- **Always-regenerated content** is not user-overridable: Section 3 (`{{user}}`),
  Section 5 (arcs / Sandbox Charter), Section 7b (test scenarios), per-arc /
  standing intimate functions, per-card style overrides, and every preserved
  Tier 2 character's relationship-to-`{{user}}`. These are protagonist-shaped
  or downstream-derived and cannot transfer mechanically; the downstream
  Refiner / Architect produces them in the new build.
- **Boundaries.** Convert does not touch SillyTavern, the override architecture
  (CLAUDE.md #2), audit/apply separation (#3), Position Rationale (#4), or any
  other architectural principle. It is purely an upstream seed-production
  operation. The Pipeline State Ledger (this same date, below) is unaffected —
  it lives at the top of `Master_Design.md`, written by the Refiner; the
  Converter writes only `World_Seed.md`.
- Older changelog entries that reference "an automated arc→sandbox converter
  remains deferred" (Sandbox Mode and Sandbox-aware revise pipeline entries
  below) describe the gap that this change closes. The remaining out-of-scope
  case is **pure reskin** (replacing setting + protagonist + factions + tone
  at once); that is intentionally bounced to `/worldforge start` fresh and
  will not be added as a Convert mode.

---

## 2026-06-08 — Compiler encoding guard (PowerShell mojibake)

### Fixed
- **Em-dash / non-ASCII corruption in Export JSON** (#23). Agents running on
  Windows (notably Kilo Code) tended to write JSON through PowerShell, whose
  `Out-File` / `Set-Content` / `>` redirection re-encodes to UTF-16 / Windows-1252
  and silently mangles em-dashes (—), curly quotes, and accented names into mojibake
  (`—` → `â€"`). Because the mangled file still parses as valid JSON, the Compiler's
  "JSON parses" guard never caught it. The **Compiler** and **mini-Compiler** now
  carry an explicit **FILE-WRITING & ENCODING guard**: write UTF-8 via the file tool
  or a Python / Node script (never PowerShell), and after each write verify non-ASCII
  survived (grep for `â€` / `Ã`, expect zero) — with matching sign-off checks and a
  `CLAUDE.md` common-failure-mode note. The mini-Compiler guard is doubly load-bearing
  since it reads existing non-ASCII content and rewrites it.

---

## 2026-06-08 — Character & world realism mechanics

Three mechanics that turn NPCs and characters from static descriptions into
persistent agents — the world acts on its own, remembers what `{{user}}` did, and
lets wounds heal visibly — authored as auditable state rather than prose the
runtime model is merely trusted to honor (#23).

### Added
- **NPC agency — standing goals + activity cadence** (both modes). Each principal
  NPC carries a **Standing Goal** (Architect §7.D — an active objective + the moves
  that advance it), and the `ARC_STATE` / `SANDBOX_STATE` Tonal Mandate gains an
  **activity-cadence** directive: when a scene lulls, a present or off-screen NPC
  advances its goal rather than the world freezing on `{{user}}`. The Editor adds a
  conditional hard-fail (Step 4a-3b — arcs with active NPCs need the directive, and
  it must not be dangling); the Voice Auditor adds **Step 3J** (initiative +
  goal-trace in a lull). The generic engine half already lived preset-side
  (`npc_ensemble`); only the world-specific goals live in Tier 3.
- **Relationship & belief state** (arc mode). `CHARACTER_STATE` gains item 6 and
  `NPC_SHIFT` its counterpart — a per-arc **relational-stance delta**: where a
  load-bearing bond now stands, the beat that moved it, and the operative belief
  driving behavior ("believes `{{user}}` spared her brother"). The Arc Transition
  Auditor's new **Check 3b** verifies the drift is earned — no teleporting bonds,
  un-caused belief flips, or silent memory resets. In sandbox mode the equivalent is
  the standing accumulation the aliveness contract already carries (the world
  remembers; attitudes never reset between scenes).
- **Trauma de-escalation tracking** (arc mode). `CHARACTER_STATE` gains item 7 — a
  per-arc **trauma-trajectory delta** (a trigger's current intensity + the beat that
  moved it). The Arc Transition Auditor's trauma-continuity check (Check 2) and the
  Voice Auditor's active-vs-dormant check (Step 3A) now verify against the *authored*
  fade rather than inferring it: fades are shown, never sudden vanishings.
  Intimate-context trauma continues to ride the per-arc Intimacy Register.

### Notes
- All three are authored as **per-arc delta only** — no new entry types, no
  per-dyad-per-arc explosion; only relationships/triggers that actually change get a
  line, and static Tier 2 baselines are never restated. Each is elicited by the
  Interviewer, recorded by the Refiner, and fielded in the World Seed template, with
  consistency-table rows in `CLAUDE.md`. Agency is genuinely cross-mode; memory and
  trauma de-escalation are arc-centric (sandbox has no seam to audit). The revise
  minis inherit the parent rules, and existing scope types cover their revision.

---

## 2026-06-08 — Pipeline reliability: durable loop state

Loop state (current phase, round count, sign-offs) lived only in the runtime
agent's memory, so a context summary or session restart could silently reset a
round counter or mis-route a mode-aware branch. Both pipelines now keep that state
on disk (#23).

### Added
- **Pipeline State Ledger** — a machine-managed block at the top of
  `Master_Design.md` (validated `world_mode`, `intimacy_in_scope`, `current_phase`,
  and a per-phase status + round table). It is the single on-disk source of truth for
  `/worldforge status` and for every `round > N` escalation. The Refiner initializes
  it and now **hard-validates `World Mode`** — an unrecognized value blocks instead of
  silently defaulting to `arc`. The Compiler verifies the ledger before compiling.
- **Bounded auditor loops** — the Voice / Arc Transition / Intimacy auditors
  (Phases 3.5 / 3.6 / 3.7) gain the `round > 3 → escalate` ceiling the Editor loop
  already had; they previously looped with no bound.

### Changed
- **Revise pipeline durable rounds** — the Revision Log entry gains a `Rounds:`
  counter line, and the mini-auditors (R3.5 / R3.6 / R3.7) gain the round-ceiling
  escalation (`R3.x_STALLED`) the mini-Editor already had. The revise pipeline keeps
  its existing Revision Log as its state record — no second ledger.

### Notes
- Additive and documentation-only; no behavior removed, and the tier model and
  override contract are untouched. The orchestrator is the single writer of ledger
  rows, so durability comes from file writes at phase boundaries rather than trusted
  memory.

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
