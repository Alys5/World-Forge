# Apartment Test — minimal sandbox world for NPC Memory testing

A deliberately tiny **sandbox** world built to exercise the **NPC Memory Manifest**
(NPC Memory Contract, schema 1) end-to-end: the producer output (this pipeline) and
the consumer (`npc-memory` extension in the SillyTavern fork).

**Premise:** Apartment 4B. `{{user}}` (**Sam**) is a guy in his mid-20s sharing a
cramped two-bedroom with two roommates — **Marcus Reyes** (loud, warm, gym-bro chasing
a personal-training side hustle) and **Devon Park** (quiet, dry CS grad student trying
to ship a thesis). No plot, no arcs — just everyday cohabitation. Both roommates are
**AI-played character cards**; Sam is the **human persona**.

## Files (`Export/`)

| File | Tier | Carries a manifest? |
|---|---|---|
| `Marcus_Card.json` | V3 character card (AI-played) | — (cards never carry manifests) |
| `Devon_Card.json` | V3 character card (AI-played) | — |
| `Apartment_World_Lorebook.json` | Tier 1 — setting (position 0) | No (no NPCs/scenes) |
| `Marcus_Lorebook.json` | Tier 2 — Marcus | **Yes** — `kind: "npc"`, npc `marcus_reyes` |
| `Devon_Lorebook.json` | Tier 2 — Devon | **Yes** — `kind: "npc"`, npc `devon_park` |
| `Sandbox_Lorebook.json` | Tier 3 — `SANDBOX_STATE` + `WORLD_PULSE` | No (sandbox has no scenes) |
| `Apartment4B_ChatPreset.json` | Chat Completion Preset (Prompt Engineer output) | — |
| `Prompt_Engineer_Audit.md` | Block-selection rationale + Pass 1/2 results | — |
| `User.md` | `{{user}}` persona (Sam) | — (persona, configured manually) |

> **Preset.** `Apartment4B_ChatPreset.json` is a **sandbox** preset: `arc_guardian` and
> `nsfw` disabled, `multi_character_dynamics` **enabled** (two AI cards), `npc_ensemble`
> **not** included (no Director/lorebook roster), Sensory Embodiment weighted high. The
> Main Prompt is engine-only; perspective is second-person. See
> `Prompt_Engineer_Audit.md` for the full rationale.

> **No `Group_Lorebook.json`.** The consolidated group lorebook is deprecated
> (issue #40). The post-deprecation model — used here — is that each Tier 2 lorebook
> carries its **own** manifest, and the extension aggregates them across all loaded
> world-info. The cross-roommate `relationships[]` edge in each manifest still
> resolves because both ids exist once every lorebook is loaded.

## What the manifests contain

`Marcus_Lorebook.json` → the `[[NPC_MANIFEST]]` entry (uid 4, `disable: true`, `key: []`):

```jsonc
{
  "schema": 1,
  "lorebook": { "name": "Marcus Reyes", "kind": "npc" },
  "personas": { "user": { "name": "Sam", "aliases": ["Sam", "{{user}}"] } },
  "npcs": [{
    "id": "marcus_reyes",
    "displayName": "Marcus Reyes",
    "aliases": ["Marcus", "Marc", "Reyes"],
    "facets": { "physical": 0, "psychological": 1, "standingGoal": 2 },  // → entry uids
    "relationships": [{ "to": "devon_park", "kind": "roommate", "note": "..." }],
    "tags": ["roommate"]
  }]
}
```

`Devon_Lorebook.json` mirrors it with id `devon_park` and an edge back `to: "marcus_reyes"`.

**Expected stable ids:** `marcus_reyes`, `devon_park` (persona `Sam`). These derive from
the canonical names via the slug rule (lowercase, non-alphanumerics → `_`, collapse,
trim) and stay stable across re-exports — that's the load-bearing property the memory
extension keys on.

## How to set it up in SillyTavern

1. **Import both cards** (`Marcus_Card.json`, `Devon_Card.json`).
2. **Import the lorebooks** as World Info / Lorebooks: `Apartment_World_Lorebook`,
   `Marcus_Lorebook`, `Devon_Lorebook`, `Sandbox_Lorebook`.
3. **Persona:** create a persona named **Sam**, paste `User.md`'s description block in,
   and activate it.
4. **Preset:** import `Apartment4B_ChatPreset.json` as a Chat Completion preset and select it.
5. **Group chat:** create a group with Marcus and Devon. Attach the four lorebooks
   (either as the group's world info, or link the per-character lorebooks to each card
   and the world/sandbox lorebooks globally — both work; the extension reads all loaded
   world-info either way).
6. Start chatting and let the roommates run.

## How to verify the NPC Memory extension

- The `[[NPC_MANIFEST]]` entries are **disabled**, so they should **never appear in the
  prompt** — confirm they don't leak into context.
- The extension should discover **two npcs** with ids `marcus_reyes` and `devon_park`,
  plus the **persona** `Sam` — keyed by id, not by entry UID.
- `facets` should resolve to the right source entries (e.g. Marcus `physical` → his
  Physical Description entry).
- The `relationships[]` edge between the two roommates should resolve in both directions.
- Memory keyed to `marcus_reyes` / `devon_park` should **survive a re-export** (re-import
  and confirm the ids are unchanged even though UIDs may renumber).
- Turn tags (`<!--npcmem:...-->`) are **consumer-owned** (contract §7) — this producer
  emits none; the extension injects/parses them. Nothing to set up here.

## Notes

- **Sandbox, not arc** — so the manifests have **no `scenes[]`** (scenes derive from
  arc `BEAT —` entries, which a sandbox world has none of). To exercise `scenes[]`,
  build an arc world instead.
- Voices are intentionally far apart (Marcus loud/slangy vs. Devon dry/measured) so the
  Voice Auditor's distinctiveness lens and any consumer-side attribution have an easy
  target.
- This sample is illustrative test scaffolding, not a showcase world — kept minimal on
  purpose.
