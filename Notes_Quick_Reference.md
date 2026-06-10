# Notes Quick Reference — SillyTavern runtime facts the pipeline uses constantly

> **DERIVED DOCUMENT — do not edit directly.** Every fact here is distilled from
> `Notes_On_functionality.md`, which remains the sole authority (and is itself verified
> against the official SillyTavern source). If the two ever disagree, the full Notes file
> wins and this file must be regenerated from it. When editing `Notes_On_functionality.md`,
> check whether the corresponding fact below needs the same correction (see the
> cross-file consistency table in `CLAUDE.md`).
>
> **Purpose:** agents consult this ~3 KB card for routine position/flag/budget questions
> instead of loading the full ~67 KB reference. Open `Notes_On_functionality.md` only when
> a question is not settled here or an agent spec explicitly requires a section of it.

---

## 1. `world_info_position` enum (authoritative routing table)

Source: Notes §5.2 ("world_info_position enum values") and §8 Step 2.

| Value | Name | Where the content goes |
|---|---|---|
| 0 | before (Before Char) | `worldInfoBefore` — system message before character data. **Tier 1 default.** |
| 1 | after (After Char) | `worldInfoAfter` — system message after scenario. **Tier 2 / ARC_STATE / SANDBOX_STATE default.** |
| 2 | ANTop | Top of the Author's Note content (only injected when AN's insertion interval fires). |
| 3 | ANBottom | Bottom of the Author's Note content (same AN caveat). |
| 4 | atDepth | ABSOLUTE injection into the messages array at `depth` from the end, with `role`. **TENSION / WORLD_PULSE default (depth 2–4).** |
| 5 | EMTop | **Prepended** to the `dialogueExamples` block. |
| 6 | EMBottom | **Appended** to the `dialogueExamples` block. |
| 7 | outlet | Stored under `outletName`; injected ONLY where a `{{outlet::Name}}` macro is placed. Never injected automatically. |

Positions 2 and 3 are tone-directive slots — no Tier 1/Tier 2 lore there.

## 2. Card override mechanics (the `{{original}}` contract)

Source: Notes §8 Steps 1 and 4.

- `data.system_prompt` **replaces** the preset's `main` block content when
  `prefer_character_prompt` is true; `data.post_history_instructions` likewise replaces
  the `jailbreak` (PHI) block.
- The `{{original}}` macro at the start of the card field splices the replaced preset
  content back in — this is why both fields MUST begin with `{{original}}` on its own line.
- A `forbid_overrides: true` on the preset's `main`/`jailbreak` block silently disables
  the card override — the pipeline requires `forbid_overrides: false` on both.
- V3 cards use exactly the same code path as V2 here; there is no separate V3 channel.
- `data.extensions.depth_prompt.prompt` is an ABSOLUTE in-chat injection at
  `depth_prompt.depth` from the end, role per `depth_prompt.role`. Mandatory structure on
  every pipeline card (prompt may be empty string).

## 3. Prompt assembly order (chat completion)

Source: Notes §8 Step 5 (`populateChatCompletion()`).

1. **Mandatory system block, in order:** `worldInfoBefore` (pos 0) → `main` (or card
   `system_prompt` override) → `worldInfoAfter` (pos 1) → `charDescription` →
   `charPersonality` → `scenario` → `personaDescription`.
2. **Ordered prompt blocks** per `prompt_order` (nsfw, custom RELATIVE blocks,
   enhanceDefinitions, bias).
3. **Chat history**, newest-first, fills the remaining token budget
   (`openai_max_context` − `openai_max_tokens`); dialogue examples placed per
   `pin_examples`.
4. **ABSOLUTE injections spliced after budgeting:** `depth_prompt`, WI position-4
   entries, AN depth entries — at their `injection_depth` from the end. ABSOLUTE entries
   land *inside recent chat*, which is why depth 2–4 directives dominate recency.
5. **Control prompts last** (impersonation / continue nudge / group nudge).

Within a WI bucket, lower `order` = earlier in the merged block. Entries that would bust
the WI budget are dropped — unless `ignoreBudget: true`.

## 4. Lorebook flags that change behavior (not just metadata)

Source: Notes §5.2 key-meanings table.

- `constant: true` — always active while the lorebook is enabled (no key match needed).
  ARC_STATE / SANDBOX_STATE pattern: `constant: true` + `ignoreBudget: true` + position 1.
- `disable: true` — hard off; entry never activates.
- `key` / `keysecondary` + `selective` + `selectiveLogic` — primary triggers and AND/NOT
  secondary logic.
- `scanDepth` / `caseSensitive` / `matchWholeWords` — match strictness and window.
- `probability` + `useProbability` — stochastic activation gate (probability ignored when
  `useProbability` is false).
- `excludeRecursion` / `preventRecursion` / `delayUntilRecursion` — WI entries can
  trigger other entries; these control self-trigger chains.
- `group` / `groupOverride` / `groupWeight` / `useGroupScoring` — one-winner-per-group
  conflict resolution among co-activated entries.
- `sticky` / `cooldown` / `delay` — temporal effects across message turns.
- `uid` — stable identity; chat state tracking depends on it (revise pipeline preserves
  UIDs on unchanged entries).
- `comment` / `addMemo` / `displayIndex` — editor metadata only, no model effect.

## 5. Strictness and provider gotchas

Source: Notes §6 and §8 Step 6.

- **JSON must be strict** — imports use bare `JSON.parse` with no leniency. (Mojibake
  from a wrong-encoding write still parses — that is a separate check; see
  `tools/validate_export.py`.)
- Lorebook import only validates that root `entries` exists; field defaults are enforced
  client-side. Don't rely on the importer to catch a bad field.
- **Claude / Google via ST:** `use_sysprompt: true` is required for leading system
  messages to reach the provider's system channel; with it false, system prompts degrade
  to user-role messages.
- ANTop/ANBottom content only ships when the Author's Note itself fires (insertion
  interval logic) — another reason they are unsafe slots for permanent lore.
