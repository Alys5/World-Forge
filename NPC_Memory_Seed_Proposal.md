# Proposal: NPC Memory Contract — `schema 2` starting-memory seed

**Status:** Draft proposal · **Targets:** NPC Memory Contract `schema 2` · **Authored by:** World-Forge (producer) side · **Date:** 2026-06-18

This is a **coordination document**, not an implemented feature. It proposes a `schema 2` addition to the [NPC Memory Contract](https://github.com/AndreiNicu/SillyTavern) shared between World-Forge (producer) and the `npc-memory` SillyTavern extension (consumer). Nothing is emitted by World-Forge until the consumer side agrees the field shape and semantics below. Hand this to the extension's maintainer; the **Open questions** section (§7) is what needs a decision.

---

## 1. The goal

Today, when the player first encounters an NPC, the NPC starts cold — the LLM invents what they were doing on the spot. We want NPCs to enter **mid-life**: *"Oh — sorry, I was just finishing the laundry,"* rather than materializing into existence at the moment of contact. This is the t=0 value of the NPC's memory: a small, authored slice of "what I've been doing / where I am / what's recently on my mind" that the running memory store adopts once, then evolves from.

This directly serves World-Forge's **sandbox aliveness contract** (NPCs pursue agendas, carry off-screen continuity, the world doesn't freeze waiting for the player). It is the genesis value the memory system has otherwise had to bootstrap from nothing.

## 2. Why this is `schema 2`, not `schema 1`

The existing contract already anticipates this and deliberately defers it:

- §5 (facet vocabulary): `volatile` state is *"mutable state ... the consumer's memory is authoritative; **do not seed over it.**"* A producer must not write running state into durable facet entries.
- §12 (reserved / future): *"`schema` 2+ may add: ... **per-NPC memory seeding hints** ..."*

So a starting memory is, by the contract's own roadmap, a `schema 2` feature. A `schema 1` consumer must ignore it (the contract's forward-compat rule, §1: unknown fields are ignored, never error). This proposal fills in the reserved slot.

## 3. The core problem: seed once, never clobber

A starting memory is the **initial** value of a store the consumer owns. The hard part is re-export safety. A world gets re-exported constantly — revise-pipeline edits, preset resync, rebaseline rebuilds — and re-imported. The manifest will carry the **same seed again** while the NPC may have weeks of accumulated memory. The consumer must never reset live memory to the seed.

**Proposed rule (consumer side):** a seed is applied to an NPC's memory store **exactly once** — at *genesis*, the first time the consumer sees that stable `id` (§4 slug) with no existing memory record. Once a record exists, the seed is ignored for that `id` forever. This mirrors the language §5 already uses for durable facets ("read once to warm-start"). The producer may re-emit the identical seed on every export with no risk, because idempotency lives on the consumer.

**Optional escape hatch:** a per-npc `seedVersion` integer. The consumer re-applies a seed only if `seedVersion` exceeds the last version it applied for that `id`. Default (no bump) = apply-once-at-genesis. A deliberate bump lets the producer force fresh starts (e.g. a rebaseline rebuild the user *wants* reset). Whether to honor bumps can be a consumer setting. If this is more than the consumer wants, drop it and keep strict seed-once.

## 4. Proposed field shape

The seed lives **on each npc object** in the manifest (`npcs[].seed`), co-located with the identity it initializes:

```jsonc
{
  "id": "anna_larsson",
  "displayName": "Anna Larsson",
  "aliases": ["Anna", "Mrs. Larsson", "Andrei's mom"],
  "facets": { "physical": 0, "psychological": 1, "standingGoal": 7 },

  // NEW in schema 2 — all of `seed` is optional; omit it for NPCs that don't need one.
  "seed": {
    "version": 1,                         // optional; bump to force re-seed (see §3)
    "currentActivity": "Folding laundry in the back room, half-listening for the front door.",
    "location": "the Larsson house",      // optional; initial location slot
    "mood": "tired, a little wound-up",   // optional; initial mood slot
    "summary": "Hasn't seen Andrei properly in two days and assumes he's avoiding her. Promised Katherine she'd return the casserole dish and keeps forgetting.",
    "memory": [                            // optional; discrete seed lines, alternative/supplement to `summary`
      "Argued with Andrei about the dishes Tuesday; it didn't resolve.",
      "Worried Jerry noticed her leaving early on Friday."
    ]
  }
}
```

**Field reference (proposed):**

| Path | Type | Required | Meaning |
| --- | --- | --- | --- |
| `npcs[].seed` | object | no | Genesis memory for this NPC. Absent = NPC starts cold, as today. |
| `seed.version` | int | no | Re-seed control (§3). Absent = apply once at genesis. |
| `seed.currentActivity` | string | rec.\* | The headline: what the NPC is mid-doing at first contact. \*the one field that delivers the "finishing the laundry" effect. |
| `seed.location` | string | no | Seeds the initial location slot (relates to turn-tag `location`, §7 of the contract). |
| `seed.mood` | string | no | Seeds an initial mood slot, if the store has one. |
| `seed.summary` | string | no | Short prose of recent off-screen history to warm-start the store. |
| `seed.memory` | string[] | no | Discrete seed memory lines, if the store prefers structured entries over prose. |

The shape is deliberately a superset so the consumer can adopt only the slots its memory store actually has. The single load-bearing field is `currentActivity`; everything else is enrichment.

## 5. Division of labor (if accepted)

This keeps every existing World-Forge architectural boundary intact (see `CLAUDE.md` principles #2, #3, #12):

- **Authoring is creative → the Architect** (`agent_roles/02_The_Architect.md`), *not* the Compiler. The Compiler's mandate is "you do not invent." A starting memory is generative writing, and it has a natural home: the Architect already authors a **Standing Goal** per NPC (§7.D / §7.E roster stat block). `currentActivity` is one more line in that block — "what they're mid-doing at t=0" — written alongside the goal it flows from. At ~40 NPCs this is incremental, not a new pass.
- **Emission is derivation → the Compiler** (Step 7.7). The Compiler carries the authored seed verbatim into `npcs[].seed`. No invention at compile time.
- **Revise pipeline:** the mini-Compiler already regenerates manifests against preserved UIDs; it carries `seed` through unchanged (slugs stable → consumer keeps treating it as already-seeded; no clobber).
- **No new agent.** A dedicated "Memory_Compiler" was considered and rejected: manifest/seed emission is welded to the Compiler's UID assignment and Export write authority, and authoring belongs upstream with the Architect. Splitting it would duplicate both.

## 6. Versioning & compatibility

- `schema 2` consumers read `seed`; `schema 1` consumers ignore it (unknown field). No breaking change.
- World-Forge keeps emitting `schema: 1` manifests until the consumer ships `schema 2` support, then bumps the producer's manifest `schema` to `2` and starts populating `seed`. The bump is a single producer change.
- Seeds are stable across re-exports by default (§3); the producer does not bump `seed.version` unless the user explicitly wants fresh starts.

## 7. Open questions for the consumer side (decisions needed)

1. **Nesting:** `npcs[].seed` (per-npc, proposed) vs. a top-level `seeds` map keyed by `id`? Per-npc keeps identity co-located; a top-level map keeps schema-1 npc objects untouched. Consumer's call.
2. **Re-seed control:** strict seed-once, or honor `seed.version` bumps (§3)? If the latter, is it always-on or a user setting?
3. **Store slot model:** which of `currentActivity` / `summary` / `mood` / `location` / `memory[]` map to real slots in the memory store? Trim the proposed superset to what you'll actually consume so World-Forge doesn't author dead fields.
4. **Prose vs. structured:** does the store want `summary` (prose) or `memory[]` (discrete lines), or both?
5. **Persona slots:** should the seed also initialize the §6 `lastWithUser` / `lastAlone` slots, or leave them null until the first real turn?
6. **Genesis detection:** confirm the consumer keys "has this NPC been seeded?" on the stable `id` (§4) with an existing-memory check, so a re-import never re-applies. This is the safety-critical assumption.

## 8. What World-Forge will do once §7 is settled

1. Bump the producer manifest `schema` to `2`.
2. Add the agreed `seed` shape to the Architect's NPC authoring (Standing Goal block) and the Compiler's Step 7.7b payload + sign-off.
3. Extend `tools/validate_export.py` to type-check the `seed` object (read-only, as with the rest of the manifest).
4. Update `CLAUDE.md` principle #12 and the cross-file consistency table.

Until then, this document is the whole of the feature: a proposal awaiting the consumer's answers to §7.
