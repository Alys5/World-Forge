# PROPOSAL — Escalation Ladders: NPC-Driven Subplots from Wants, Desires & Goals

> **Status: DRAFT FOR REVIEW — nothing in this document is implemented.** This is the cross-file design view requested before any patch is written. If approved, this file is deleted and the changes land in the pipeline files listed in Section 6.

---

## 1. Problem & design goal

The pipeline already mechanizes NPC *initiative*: every principal NPC carries a §7.D **Standing Goal** (active objective + pursuit moves), and the ARC_STATE / SANDBOX_STATE **activity cadence** directive instructs the runtime model to have an NPC advance its goal when a scene lulls. The Voice Auditor (Step 3J) tests that this lands.

What it does not mechanize is *progression*. A Standing Goal is flat — a static drive with no stages, no complications, no endpoint. An NPC pursues the harbor contract in session 1 and is still "pursuing the harbor contract" in session 40. That is initiative without a subplot.

The runtime models this pipeline targets (DeepSeek / GLM class) make the gap worse in one direction and better in another:

- **They will not invent coherent multi-session subplots.** Left to emerge plot, they drift, contradict, or rush to resolution. The `npc_ensemble` enrichment guardrails forbid inventing load-bearing plot facts for exactly this reason.
- **They execute authored plans reliably.** Given explicit stages, advance conditions, and an imperative always-active directive pointing at the *current* stage, they walk the ladder turn after turn. This is the same insight that produced the Tonal Mandate two-subsection structure: these models follow what is framed as binding instruction and ignore what is framed as description.

**Design goal:** let the author turn an NPC's want into a staged subplot the model *executes*, without granting the model plot-invention authority, without new entry types, and without touching any architectural principle.

---

## 2. The mechanism

### 2.1 The Escalation Ladder (optional extension of the §7.D Standing Goal)

A principal NPC's Standing Goal may optionally carry an **Escalation Ladder**: 2–4 ordered stages, each with concrete moves and an in-fiction advance condition, ending in a stated endpoint and a stated collision with {{user}} or the main spine.

```
**Standing Goal:** Maneuvering to take the harbor contract; leans on anyone
in {{user}}'s orbit, plants rumors, calls in old debts.

**Escalation Ladder:**
- **Stage 1 — Quiet groundwork:** plants rumors about the incumbent's
  solvency; calls in old debts among the dockhands. On-screen: probing
  questions, half-offers. Off-screen evidence to surface: dockhands repeating
  the rumor, a creditor suddenly nervous.
  *Advances when:* the rumor reaches the merchant council, or {{user}}
  ignores two direct overtures.
- **Stage 2 — Open maneuvering:** formally bids for the contract; buys the
  loyalty of the harbormaster's clerk. On-screen: public confidence, veiled
  threats. Off-screen evidence: the clerk stonewalling {{user}}'s requests.
  *Advances when:* the incumbent retaliates, or the council schedules a vote.
- **Stage 3 — Endpoint:** forces the vote. The contract changes hands — or
  Mira is exposed, depending on what {{user}} has done by now.

**Collision:** Stage 2's clerk is {{user}}'s main information source; the
subplot degrades {{user}}'s access whether or not they engage with Mira.
```

**Format rules (binding, enforced by the Editor):**

1. **2–4 stages**, strictly ordered. Each stage states on-screen moves, off-screen moves *with surfaceable evidence*, and an advance condition.
2. **Advance conditions are in-fiction observable** — events, {{user}} actions/inactions, world reactions. Never "after N turns" (the model cannot count turns) and never "when dramatically appropriate" (invites rushing).
3. **Endpoint stated.** The ladder resolves; it is a subplot, not a permanent treadmill. (Treadmill pressure is what TENSION / WORLD_PULSE already does.)
4. **Collision stated.** One line on where the ladder intersects {{user}} or the main spine. A subplot that never touches the protagonist is set dressing.
5. **Ladders are opt-in and budgeted: at most 3 laddered NPCs per world** (proposed — see open question #1). Most principals keep flat Standing Goals. Competing subplots beyond ~3 degrade exactly the model class this targets.

### 2.2 The progression discipline (cadence directive extension)

The ladder is static authored content. What makes it move — and keeps mid-tier models from skipping to the endgame — is an extension of the existing activity-cadence / aliveness directive, in the same imperative register:

```
- Activity cadence: [existing directive text]. Mira's ladder is at
  **Stage 1 (quiet groundwork)**: in lulls she probes and plants rumors;
  surface off-screen evidence of the rumor spreading. Advance to Stage 2
  ONLY when its stated condition occurs in-fiction; never skip a stage;
  never resolve the endpoint without {{user}} having had the chance to
  interfere.
```

The three clauses — *named current stage*, *advance only on stated condition*, *never skip / never self-resolve* — are the whole trick. The model is never asked to decide what happens next, only to recognize a stated condition and execute the next authored stage.

### 2.3 Where the current stage lives (the state question)

SillyTavern lorebooks carry no variables, so "current stage" needs a home. The two modes already have different state mechanisms, and the ladder uses each as-is:

**Arc mode — hard state.** The arc structure *is* a state machine. The NPC_SHIFT entry's existing "active goal this arc" line gains an optional sibling: `**Active ladder stage this arc:** Stage N` (delta-only, like everything in NPC_SHIFT — stated only when it changes or first activates). The ARC_STATE cadence bullet names that stage. Within an arc, DRAMATIC_BEAT entries are the natural per-stage reinforcement: a keyed beat per stage transition ("what triggers it, what the LLM should do, what changes after") — the existing entry type, no extension needed. Cross-arc stage continuity gets audit teeth (Section 3, Arc Transition Auditor).

**Sandbox mode — soft state + recency anchor.** No swappable states exist, so the stage is model-tracked in the chat history — honestly, the weak point of the design. Two mitigations, both using existing machinery: (a) the WORLD_PULSE entry (position 4, depth 2–4 — injected close to generation) names the stages currently in motion, keeping the active stage in the freshest context; (b) the SANDBOX_STATE aliveness bullet carries the same progression discipline. For long-running sandboxes, the existing revise pipeline's `sandbox_state_recalibration` scope is the manual ratchet: a one-line revision bumps the named stage in SANDBOX_STATE/WORLD_PULSE when play has moved past it. No new scope type required.

### 2.4 What the model may and may not invent (guardrail clarification)

The `npc_ensemble` block's enrichment guardrail ("never invent load-bearing plot facts") stays. One clarifying sentence is added so the two rules don't read as conflicting: *executing an authored escalation ladder — including surfacing its stated off-screen evidence — is goal-following, not enrichment-invention; the prohibition is on inventing stages, conditions, or resolutions the ladder does not contain.* Texture around the ladder (how a rumor is phrased, which dockhand repeats it) remains legitimate enrichment.

---

## 3. How it threads through the pipeline, phase by phase

| Phase | Agent | Change |
|---|---|---|
| 0 | Interviewer | Where a principal NPC's want is subplot-shaped, offer the ladder and elicit stages/conditions/endpoint/collision (same elicitation posture as the existing Standing Goal questions). Respect the ≤3 budget. |
| 1 | Refiner | Record elicited ladders into Master Design under the NPC's §7.D material; flag ladder/arc-spine collisions for Section 5 (arc mode). |
| 2 | Architect | §7.D gains the optional ladder block (format above). Arc mode: NPC_SHIFT optional "active ladder stage this arc" line; ARC_STATE cadence bullet names active stages + progression discipline; optionally one DRAMATIC_BEAT per stage transition. Sandbox: SANDBOX_STATE aliveness bullet + WORLD_PULSE name in-motion stages + discipline. |
| 3 | Editor | New conditional check (inserted as **Step 4a-3c** per the step-numbering protocol): when any active NPC has a ladder — ladder format integrity (2–4 ordered stages, observable conditions, endpoint, collision) = hard fail; cadence/aliveness directive names the active stage and carries the discipline clauses = hard fail; dangling-check extension: a cadence-named stage must exist in that NPC's ladder. Soft flag: ladder collision unstated against the arc spine. |
| 3.5 | Voice Auditor | Step 3J goal-trace extends: a laddered NPC's lull-moves must trace to the **active stage**, not an arbitrary one; add a stage-discipline probe (present a scenario tempting the endgame; the model should hold the current stage). |
| 3.6 | Arc Transition Auditor | Check 3b continuity teeth extend to ladders: stage is monotonic across arcs unless a stated setback causes regression; any between-arc advancement must be caused by a beat or stated off-screen event — no teleporting stages, no silent resets. (Arc mode only, like all of 3.6.) |
| 4 | Compiler | **No change.** Ladders are content inside existing entry types; nothing new to compile. |
| 5 | Prompt Engineer | **No preset content change.** Only the §2.4 clarifying sentence in the Block Library's `npc_ensemble` guardrail (05a + 05 are a cross-file pair). |
| revise | minis | Inherit via parents (thin deltas only). Stage bumps route through existing scopes: `tier3_arc_modify` (arc) / `sandbox_state_recalibration` (sandbox). Ladder authoring/removal on an NPC is `tier2_character_modify` + cascade into the Tier 3 cadence line. **No new scope type** → the fourteen-type Reviser/routing-matrix contract is untouched. |
| convert | Converter | Ladders join the existing NPC-agency carry-across row: stages coupled to {{user}} (advance conditions or collisions naming the protagonist) are marked-for-reauthor in a reframe, like all relationship-to-{{user}} content; Rebaseline carries the ladder at its post-revision high-water stage. Convert Brief §4e reminder updated to match. |

---

## 4. Design decisions (and the rejected alternative)

1. **Extension of Standing Goal, not a new entry type.** *Rejected alternative:* a dedicated Tier 3 `SUBPLOT` entry type. Rejected because it duplicates what NPC_SHIFT (per-arc state) + DRAMATIC_BEAT (keyed events) + the cadence directive already provide, adds a tier-placement question (stages are permanent authored content = Tier 2; active stage = Tier 3 — a new entry type would smear across both, a #1 design smell), and would touch the Compiler, the validator, and the revise scope-type contract. The ladder reuses every existing seam.
2. **Author-tracked state, model-executed progression.** The model never chooses what happens next — it recognizes a stated condition and executes the next authored stage. This is the only division of labor that works at the DeepSeek/GLM tier, and it keeps the enrichment guardrail philosophically intact.
3. **Opt-in with a hard budget.** Ladders are per-NPC optional; proposed cap of 3 per world. The Editor enforces format only on NPCs that have one — flat Standing Goals remain fully valid and are the default.
4. **Endpoint mandatory.** Ladders resolve. Standing pressure that never resolves is TENSION/WORLD_PULSE's job; conflating them would re-create the treadmill problem inside the subplot machinery.
5. **Sandbox soft-state is accepted, not papered over.** The honest cost: in sandbox mode the active stage lives in chat history and can drift in very long chats. Mitigations (WORLD_PULSE recency anchor, revise-pipeline recalibration ratchet) use existing machinery. The alternative — per-stage swappable sandbox lorebooks — would re-introduce arc machinery into sandbox mode, which principle #9 exists to prevent.

---

## 5. What this does NOT change

- **No architectural principle is touched.** Override architecture (#2): the ladder is world content, card/lorebook side; the preset stays engine-only. Audit/apply separation (#3): Editor/auditors gain checks, not write authority. Position Rationale (#4): no new positions; everything rides documented defaults. Tier architecture (#1): stages are Tier 2, active-stage is Tier 3 — clean split.
- **No new files, entry types, positions, flags, scope types, or phases.**
- **No Compiler or `tools/validate_export.py` changes** — nothing new is machine-checkable at the JSON level.
- **Arc worlds without ladders and all existing worlds are unaffected** — every change is conditional on a ladder existing.

---

## 6. Cross-file touch list (implementation scope, if approved)

| File | Change |
|---|---|
| `templates/World_Seed_Template.md` | §4 NPC block: optional **Escalation Ladder** sub-field under Standing Goal (stages / conditions / endpoint / collision) + checklist line |
| `agent_roles/00_The_Interviewer.md` | §3/NPC questioning: elicit ladder where the want is subplot-shaped; budget note |
| `agent_roles/01_The_Refiner.md` | Record ladder into Master Design §7.D material; collision flag for §5 |
| `agent_roles/02_The_Architect.md` | §7.D ladder format block; §8 NPC_SHIFT optional stage line; §8.A cadence bullet extension; §8.D per-stage DRAMATIC_BEAT note; §8S.A aliveness extension + §8S.B WORLD_PULSE note; sign-off items |
| `agent_roles/03_The_Editor.md` | New Step 4a-3c (ladder integrity + stage-named cadence + dangling extension); Tier 2 checklist line; sign-off items |
| `agent_roles/03b_The_Voice_Auditor.md` | Step 3J goal-trace → active-stage trace; stage-discipline probe; transcript-scenario note; sign-off item |
| `agent_roles/03c_The_Arc_Transition_Auditor.md` | Check 3b extension: stage monotonicity + caused advancement |
| `agent_roles/05a_Block_Library.md` (+ `05` pair check) | One guardrail-clarifying sentence in `npc_ensemble` (§2.4) |
| `agent_roles/Converter/00_The_Converter.md` + `templates/Convert_Brief_Template.md` | §4 carry-across: ladder rides the NPC-agency row; {{user}}-coupled stages marked-for-reauthor; Rebaseline carries high-water stage; Brief §4e reminder |
| `agent_roles/revise/*` minis | Thin delta notes only (stage-bump routing via existing scopes) |
| `workflows/world-forge.md` | One-paragraph mention in the NPC-agency description (no phase changes) |
| `CLAUDE.md` | Extend the existing NPC-agency cross-file row to include the ladder |
| `CHANGELOG.md` | Entry |

Not touched: `04_The_Compiler.md`, `03d`/`06` intimacy agents (ladders with intimate registers ride the existing Intimacy Register machinery unchanged — orthogonal, same as all NPC content), `tools/validate_export.py`, all JSON templates, `Notes_On_functionality.md`.

---

## 7. Open questions for Andrei

1. **Budget:** cap laddered NPCs at 3 per world (hard, Editor-enforced) — or soft-flag only?
2. **Naming:** "Escalation Ladder" (proposed — says what it does) vs. "Subplot Thread" vs. "Goal Ladder"?
3. **Endpoint autonomy in sandbox:** proposal says the model may advance intermediate stages on stated conditions but never resolve the endpoint without {{user}} having had a chance to interfere. Strict enough, or should *every* advancement require {{user}}-witnessed evidence first?
4. **Missing collision statement:** hard fail (proposed: a subplot that can't touch {{user}} is set dressing) or soft flag?
5. **Per-stage DRAMATIC_BEATs:** recommended-when-warranted (proposed) or mandatory for every laddered NPC in arc mode?
