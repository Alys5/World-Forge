# Prompt Engineer Audit — Apartment 4B (sandbox)

Preset: `Apartment4B_ChatPreset.json`. World Mode: **sandbox**. Cast: two AI character
cards (Marcus Reyes, Devon Park) + `{{user}}` persona (Sam). Wholesome slice-of-life.

## Block Selection Rationale

| Block | State | Why |
|---|---|---|
| `main` | enabled | Core engine half of the override contract; authored world-/character-agnostic. |
| `deep_think` | enabled | Authored **sandbox-flavored** — references `SANDBOX_STATE` / `WORLD_PULSE`, no arc naming. |
| `arc_guardian` | **disabled** | Sandbox world — no arcs to guard. |
| `lore_integration` | enabled | Anti-recitation; anchors are apartment-specific. |
| `spatial_awareness` | enabled | Two-body scenes; includes the roommates' heights. |
| `sensory_embodiment` | enabled (**weighted high**) | Sandbox emphasis: no arc momentum, so the standing world must feel physically present every turn. |
| `formatting` | enabled | Defers to `<style_contract>`; no marker chars in the block. |
| `nsfw` | **disabled** | Wholesome; World Seed §8 out of scope. |
| `multi_character_dynamics` | **enabled** | 2+ AI cards in typical scenes; lattice example uses Marcus/Devon. |
| `npc_ensemble` | **not included** | No Director card and no lorebook-only NPC roster — the cast *are* cards, so Multi-Character Dynamics is the correct block and `npc_ensemble` is not warranted. |
| `enhanceDefinitions` | disabled | Template default; not needed for this test. |
| `jailbreak` | enabled | Verbatim 4-clause frame; **no** NSFW closing affirmation (wholesome). |

## Style Contract (would-be Master Design §11a)
- Perspective: **second person**, **present** tense. Markers: narration *asterisks*, dialogue "double quotes", emphasis **double asterisks**.
- Paragraph register: standard (mixed lengths).
- `is_multi_perspective: false`, `is_multi_tense: false` → **no ACTIVE-SPEAKER RULE**.
- Both cards are non-overriding (`style_override: null`).

## Pass 1 — engine/world purity (PASS)
- Main Prompt contains no character / arc / faction / location names. ✓
- `<style_contract>` present; contains only perspective + tense + marker directives. ✓
- Formatting block contains no literal marker characters (defers to the contract). ✓
- Jailbreak block world-/character-agnostic; NSFW closing affirmation correctly omitted. ✓

## Pass 2 — override pairing (PASS)
- Both cards' `system_prompt` and `post_history_instructions` begin with `{{original}}`. ✓
- No card `<style_override>` to structurally mirror (both null). ✓

## Manual-application items (§7/§8)
None outstanding for this test world. `reasoning_effort` set to `high` per default.
