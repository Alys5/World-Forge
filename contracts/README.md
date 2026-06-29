# Shared contracts (canonical)

This directory is the **canonical source of truth** for the design contracts
shared between the World-Forge pipeline and the `world-forge` + `npc-memory`
SillyTavern extensions in the fork.

| File | Covers |
| --- | --- |
| [`MEMORY_CONTRACT.md`](./MEMORY_CONTRACT.md) | The npc-memory data channel: `[[NPC_MANIFEST]]`, facets, stable ids, the `npcmem` turn tag, scenes registry, prose fallback. |
| [`WORLD_FORGE_SYNC.md`](./WORLD_FORGE_SYNC.md) | The runtime seams: Director-card tag, narration-surface alias coverage, the `</style_contract>` marker, `style_override` runtime, plus a producer conformance checklist. |

These files live here, next to `tools/validate_export.py` — the producer that
must conform to them. The SillyTavern fork carries a read-only mirror and keeps
it byte-identical via its `scripts/sync-contracts.sh` plus a CI drift check.
Edit the contracts here; the fork re-syncs from this directory.
