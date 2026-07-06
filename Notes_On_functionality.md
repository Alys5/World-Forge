# SillyTavern JSON Input Developer Documentation

## Purpose and scope

This document maps the major SillyTavern code paths that ingest JSON content files and JSON-like metadata used for roleplay behavior, including:

- Character cards (V1, V2, V3, PNG-embedded, JSON, CharX, BYAF)
- Lorebooks / World Info (native ST format and converted formats)
- Instruct presets, context presets, system prompt presets
- Main OpenAI/textgen preset JSON payloads loaded via settings

This is focused on content and prompt-building JSON, not every API request body in the project.

SillyTavern is a power frontend. Most JSON is parsed, normalized, then transformed into an internal prompt assembly model that is eventually sent to upstream LLM APIs.

---

## 1) JSON ingestion map (functions and responsibilities)

## 1.1 Character cards and card metadata

- src/character-card-parser.js
  - write(image, data)
    - Writes base64 JSON string into PNG tEXt chunk chara.
    - Attempts to also write a ccv3 chunk by parsing input JSON and forcing:
      - spec = chara_card_v3
      - spec_version = 3.0
  - read(image)
    - Reads PNG tEXt chunks.
    - Prefers ccv3 over chara if both exist.
    - Base64-decodes to UTF-8 JSON string.
  - parse(cardUrl, format)
    - For png, reads file and delegates to read.

- src/endpoints/characters.js
  - readCharacterData(inputFile)
    - Parses PNG card metadata through parse(...), caches string result.
  - getCharaCardV2(jsonObject, directories, hoistDate)
    - If no spec field: treats as legacy and converts to V2.
    - If spec exists: reads/migrates from V2/V3-compatible shape via readFromV2.
  - convertToV2(char, directories)
    - Legacy shape -> internal V2-like object using charaFormatData.
  - readFromV2(char)
    - Flattens selected V2 data fields back into top-level compatibility fields.
  - charaFormatData(data, directories)
    - Core normalizer for character edit/create/import.
    - Writes both compatibility fields and V2 data fields.
    - Handles extensions parsing, alternate greetings normalization, world linkage.
  - convertWorldInfoToCharacterBook(name, entries)
    - Converts ST world info entries into character_book entries format.
  - importFromJson(uploadPath, ...)
    - Imports card from raw JSON file.
    - Supports spec cards (V2/V3-like), V1 cards, and old gradio/Pygmalion notepad shape.
  - importFromPng(uploadPath, ...)
    - Imports card from PNG-embedded metadata.
  - importFromCharX(uploadPath, ...)
    - Imports card.json from CharX zip, maps assets.
  - importFromByaf(uploadPath, ...)
    - Imports Backyard AI format and maps to V2 card.
  - router.post('/merge-attributes')
    - Deep-merges JSON update payload into existing card JSON.
    - Validates with TavernCardValidator before saving.

- src/validator/TavernCardValidator.js
  - validate / validateV1 / validateV2 / validateV3
    - Structural validation of card JSON.

- src/byaf.js
  - getCharacterCard(manifest, character, scenarios)
    - Converts BYAF JSON into Tavern card V2 object.

- src/charx.js
  - CharXParser.parse()
    - Reads card.json, validates presence of spec, extracts embedded assets.

## 1.2 World info (lorebooks)

- src/endpoints/worldinfo.js
  - readWorldInfoFile(directories, worldInfoName, allowDummy)
    - Reads world json file and JSON.parse.
  - router.post('/import')
    - Accepts uploaded file (or convertedData), JSON.parse validation requires entries key.
  - router.post('/edit')
    - Validates entries key in request.body.data, saves JSON.

- public/scripts/world-info.js
  - importWorldInfo(file)
    - Reads JSON (or PNG naidata payload), detects foreign formats and converts.
  - convertAgnaiMemoryBook(inputObj)
    - Agnai memory format -> ST world info format.
  - convertRisuLorebook(inputObj)
    - Risu lorebook format -> ST world info format.
  - convertNovelLorebook(inputObj)
    - NovelAI lorebook format -> ST world info format.
  - convertCharacterBook(characterBook)
    - Character card embedded character_book -> ST world info format.
  - getWorldInfoPrompt(...)
    - Produces worldInfoBefore/worldInfoAfter/anBefore/anAfter/depth entries.

- public/scripts/utils.js
  - parseJsonFile(file)
    - Browser FileReader + JSON.parse for uploaded JSON files.
  - extractDataFromPng(data, identifier)
    - Extracts base64 JSON from PNG tEXt payload (identifier like chara or naidata).

## 1.3 Presets and instruction-related JSON

- src/endpoints/settings.js
  - readAndParseFromDirectory(directoryPath, '.json')
    - Loads and JSON.parse all valid preset/content files from a directory.
  - readPresetsFromDirectory(...)
    - Reads preset files, validates JSON by parsing, returns raw JSON strings and names.
  - router.post('/get')
    - Returns loaded JSON content bundles:
      - instruct
      - context
      - sysprompt
      - reasoning
      - model presets (openai, novel, textgen, kobold)

- public/scripts/instruct-mode.js
  - loadInstructMode(data)
    - Uses data.instruct JSON array from settings endpoint.
  - migrateInstructModeSettings(settings)
    - Fills missing keys/defaults and migrates obsolete keys.

- src/users.js
  - migrateSystemPrompts()
    - Reads instruct JSON files.
    - If system_prompt exists in instruct preset, migrates it into sysprompt JSON files.

---

## 2) How SillyTavern understands JSON data

## 2.1 General parsing model

- Primary parser is strict JSON.parse in most places.
- Malformed JSON (comments, trailing commas, invalid quotes) fails parse and is rejected/skipped.
- In several list-loading flows, invalid JSON files are skipped with warning instead of crashing startup.

## 2.2 Character understanding model

SillyTavern unifies multiple card sources into a canonical card object with:

- Top-level compatibility fields (legacy)
- data object (V2 canonical fields)
- data.extensions for ST-specific behavior
- optional data.character_book for embedded lorebook

Internal flow:

1. Ingest source format (PNG/JSON/CharX/BYAF/YAML)
2. Parse JSON payload
3. Normalize to V2-compatible structure
4. Merge/derive extension fields
5. Optionally map linked world info into character_book
6. Save as PNG metadata payload

## 2.3 World info understanding model

ST world info files are object maps:

- Root entries object keyed by UID string
- Each entry has matching keys, content, activation controls, position, recursion, probability, grouping, and optional trigger metadata

At generation time, world-info.js scans chat and selected context surfaces, evaluates key matches, then splits activated entries into prompt destinations:

- worldInfoBefore
- worldInfoAfter
- Author's Note top/bottom injection lists
- Depth-based role prompt injections
- Example-message anchors

## 2.4 Preset understanding model

Preset files are mostly pass-through JSON configs loaded at startup/request time:

- Instruct preset controls formatting sequences for chat-to-prompt conversion
- Context preset controls story template stitching and anchor placements
- System prompt preset gives named reusable content blocks
- OpenAI/textgen presets control backend request parameters and prompt ordering metadata

---

## 3) JSON parsing and conversion details by format

## 3.1 Character cards

### Accepted major inputs

- PNG with tEXt chunk chara (V2 style)
- PNG with tEXt chunk ccv3 (V3 style, preferred when present)
- Raw JSON card files
- CharX zip with card.json and embedded assets
- BYAF package with manifest/scenario/character JSON
- Legacy V1 and gradio notepad json shapes

### Key conversion behaviors

- If card has no spec, convertToV2 path is used.
- If spec exists, readFromV2 path is used (with compatibility flattening).
- data.alternate_greetings accepts string or array from source; normalized to array.
- data.extensions is deep-merged with parsed source extensions when provided.
- data.extensions.world links a world; if available, world entries may be converted and embedded into data.character_book.
- Private/share-sensitive fields are removed during export via unsetPrivateFields (for example fav/chat behavior).

## 3.2 Lorebooks / World info

### Native ST format

- Root must contain entries.
- entries is an object keyed by UID — each entry's object key must equal String(entry.uid). The editor creates and looks entries up as entries[uid] (see §6); keys that diverge from UIDs import without error but the entries never render in the GUI.

### Import conversions

- Novel lorebook detection: lorebookVersion key
- Agnai memory detection: kind == memory
- Risu lorebook detection: type == risu
- Character embedded lorebook import: character.data.character_book -> convertCharacterBook

All converted formats are mapped into ST entry template with default values filled.

## 3.3 Instructions and prompt presets

- Instruct/context/sysprompt/reasoning are loaded from user directories as JSON arrays/objects.
- Missing instruct keys are filled by migrateInstructModeSettings.
- Legacy instruct keys are migrated (for example separator_sequence, names, names_force_groups).
- System prompt migration removes system_prompt from instruct files and creates separate sysprompt files.

---

## 4) Author's Note position vs World definition position

This is a common confusion point.

There are two separate placement systems:

1. Author's Note own placement (from authors-note.js)
2. World-info entry placement, including entries targeting Author's Note regions (from world-info.js)

### Author's Note base insertion

setFloatingPrompt() places the Author's Note extension prompt at the configured location/depth/role from chat metadata:

- note_position
- note_depth
- note_role

### World-info entries targeting Author's Note

World-info entries can use positions:

- ANTop
- ANBottom

When shouldWIAddPrompt is true, world-info.js rewrites the Author's Note prompt as:

ANTop entries + original Author's Note + ANBottom entries

So the practical difference is:

- Entry before world definition (before_char / world_info_position.before): goes to worldInfoBefore bucket
- Entry after world definition (after_char / world_info_position.after): goes to worldInfoAfter bucket
- Entry before Author's Note (ANTop): injected above the active AN text
- Entry after Author's Note (ANBottom): injected below the active AN text

This means ANTop/ANBottom does not just move relative to worldInfoBefore/worldInfoAfter. It changes where text appears inside the Author's Note extension injection itself.

---

## 5) Canonical JSON templates and examples

These are practical reference templates based on current code behavior.

## 5.1 Tavern Character Card V2 (full practical template)

```json
{
  "spec": "chara_card_v2",
  "spec_version": "2.0",
  "name": "Seraphina",
  "description": "Legacy compatibility copy",
  "personality": "Legacy compatibility copy",
  "scenario": "Legacy compatibility copy",
  "first_mes": "Legacy compatibility copy",
  "mes_example": "Legacy compatibility copy",
  "creatorcomment": "Legacy compatibility copy",
  "avatar": "none",
  "chat": "Seraphina - 2026-04-30@12h00m00s000ms",
  "talkativeness": 0.5,
  "fav": false,
  "tags": ["fantasy", "elf"],
  "create_date": "2026-04-30T12:00:00.000Z",
  "data": {
    "name": "Seraphina",
    "description": "Primary character description",
    "personality": "Primary personality",
    "scenario": "Current scenario context",
    "first_mes": "First message",
    "mes_example": "Example dialogue",
    "creator_notes": "Creator notes",
    "system_prompt": "Optional card-level system prompt",
    "post_history_instructions": "Optional post-history instruction",
    "alternate_greetings": [
      "Alternative opener 1",
      "Alternative opener 2"
    ],
    "tags": ["fantasy", "elf"],
    "creator": "Lys_5",
    "character_version": "1.0",
    "extensions": {
      "talkativeness": 0.5,
      "fav": false,
      "world": "Eldoria",
      "depth_prompt": {
        "prompt": "Character depth note",
        "depth": 4,
        "role": "system"
      }
    },
    "character_book": {
      "name": "Eldoria",
      "extensions": {},
      "entries": [
        {
          "id": 0,
          "keys": ["eldoria", "forest"],
          "secondary_keys": ["glade"],
          "comment": "Eldoria summary",
          "content": "Lore text",
          "constant": false,
          "selective": true,
          "insertion_order": 100,
          "enabled": true,
          "position": "before_char",
          "use_regex": true,
          "extensions": {
            "position": 0,
            "exclude_recursion": false,
            "display_index": 0,
            "probability": 100,
            "useProbability": true,
            "depth": 4,
            "selectiveLogic": 0,
            "outlet_name": "",
            "group": "",
            "group_override": false,
            "group_weight": 100,
            "prevent_recursion": false,
            "delay_until_recursion": false,
            "scan_depth": null,
            "match_whole_words": null,
            "use_group_scoring": null,
            "case_sensitive": null,
            "automation_id": "",
            "role": 0,
            "vectorized": false,
            "sticky": null,
            "cooldown": null,
            "delay": null,
            "match_persona_description": false,
            "match_character_description": false,
            "match_character_personality": false,
            "match_character_depth_prompt": false,
            "match_scenario": false,
            "match_creator_notes": false,
            "triggers": [],
            "ignore_budget": false
          }
        }
      ]
    }
  }
}
```

### Character Card V2 key meanings and LLM prompt impact

Top-level and identity keys:

- spec/spec_version: card schema identification; enables V2 parse/validation path.
- name: character identity label; often appears in UI and in prompt templates as char.
- create_date/chat/avatar: metadata fields for file/chat lifecycle; no direct LLM behavior by themselves.

Legacy compatibility keys (top-level duplicates):

- description/personality/scenario/first_mes/mes_example/creatorcomment/talkativeness/fav/tags:
  - kept for backward compatibility.
  - ST primarily uses data.* as canonical, but these may still be read by older paths/tools.

Canonical prompt-bearing keys in data:

- data.description: primary character sheet text; injected into prompt via context template sections like description.
- data.personality: style/behavior traits; injected into personality section.
- data.scenario: current setting context; injected into scenario section.
- data.first_mes: opener used for initial chat message generation/state.
- data.mes_example: dialogue examples; can be used as few-shot examples depending on template settings.
- data.creator_notes: creator-side guidance; may be included depending on prompt template/extensions.
- data.system_prompt: optional card-level system guidance; contributes to model steering in system-level prompt assembly.
- data.post_history_instructions: late prompt instruction block (often equivalent to jailbreak/post-history slot) that can strongly steer next turn behavior.
- data.alternate_greetings: alternate first-message candidates used at chat start.
- data.tags: classification/organization; indirect model effect unless templates/extensions consume tags.
- data.creator/data.character_version: provenance/version metadata; no direct LLM effect.

Extensions and behavior-shaping keys:

- data.extensions.world: links a world/lorebook; this is a major prompt-impact key because linked WI entries are scanned and injected into prompt context.
- data.extensions.depth_prompt.prompt:
  - additional character note injected at configured depth.
  - useful for stable behavioral constraints without putting them in every system prompt.
- data.extensions.depth_prompt.depth:
  - controls insertion depth into message stack; changes how "recent" or "global" the instruction is in effective context.
- data.extensions.depth_prompt.role:
  - controls role/channel (system/user/assistant-like role mapping) for that injected note.
- data.extensions.talkativeness:
  - frontend behavior/heuristic metadata; indirect effect on generation patterns.
- data.extensions.fav:
  - UI preference metadata; no prompt effect.

Embedded lorebook in card:

- data.character_book:
  - embedded knowledge base attached to the card.
  - when imported/linked, entries are converted/scanned and injected as world info before/after/depth/AN anchors based on entry config.

Character book entry keys (inside data.character_book.entries[]):

- keys/secondary_keys/selective/selectiveLogic:
  - trigger logic for activation based on chat/context scan.
  - determines if lore text is activated for the current turn.
- content:
  - actual text injected into prompt when entry activates.
- insertion_order/position:
  - where and in what order activated content is inserted (before, after, AN top/bottom, depth, outlets).
- enabled/constant/use_regex/probability/useProbability:
  - gates activation and randomness.
- extensions.*:
  - advanced controls: recursion rules, scan depth, word matching strictness, grouping, sticky/cooldown/delay timing effects, role/depth insertion, trigger lists, and budget bypass.
  - these strongly affect whether and where content appears in the final prompt.

#### Character Card V2 quick reference table

| Field | Type | Prompt/LLM impact | Source/default notes |
|---|---|---|---|
| spec | string | Selects schema path; enables V2-specific handling. | Must be `chara_card_v2`. |
| spec_version | string | Schema compatibility gate. | Expected `2.0`. |
| name | string | Character identity in UI/templates/macros. | Often mirrored in `data.name`. |
| description | string | Legacy compatibility prompt source. | Prefer `data.description`. |
| personality | string | Legacy compatibility style source. | Prefer `data.personality`. |
| scenario | string | Legacy compatibility scenario source. | Prefer `data.scenario`. |
| first_mes | string | Legacy first-turn text candidate. | Prefer `data.first_mes`. |
| mes_example | string | Legacy few-shot dialogue source. | Prefer `data.mes_example`. |
| creatorcomment | string | Legacy creator guidance field. | Prefer `data.creator_notes`. |
| chat | string | Chat metadata only. | No direct LLM effect. |
| avatar | string | UI/media metadata only. | No direct LLM effect. |
| talkativeness | number | Legacy heuristic metadata. | Prefer `data.extensions.talkativeness`. |
| fav | boolean | UI preference flag. | No direct prompt effect. |
| tags | array/string | Classification metadata; extension-dependent prompt use. | Canonical is `data.tags`. |
| create_date | string (ISO) | Metadata only. | No direct LLM effect. |
| data.name | string | Canonical character identity. | Used in prompt assembly/macros. |
| data.description | string | Core character definition block. | Injected by context templates. |
| data.personality | string | Core behavior/style block. | Injected by context templates. |
| data.scenario | string | Core scene/context block. | Injected by context templates. |
| data.first_mes | string | First message seed. | Used at chat start. |
| data.mes_example | string | Example dialogue block. | Used as few-shot depending on settings. |
| data.creator_notes | string | Additional creator guidance. | May be included by templates/extensions. |
| data.system_prompt | string | System-level steering text. | Strong role-conditioning impact. |
| data.post_history_instructions | string | Late-stage steering text. | Often high impact on next turn style. |
| data.alternate_greetings | array<string> | Alternate opener set. | Used at new chat starts. |
| data.tags | array<string> | Canonical tags. | Mostly metadata unless consumed by extensions/templates. |
| data.creator | string | Provenance metadata. | No direct LLM effect. |
| data.character_version | string | Version metadata. | No direct LLM effect. |
| data.extensions.world | string | Links lorebook/world info. | Major prompt impact through WI injection. |
| data.extensions.depth_prompt.prompt | string | Extra note injected at depth. | Persistent steering without rewriting base prompts. |
| data.extensions.depth_prompt.depth | number | Controls insertion depth/recency. | Alters relative instruction weight. |
| data.extensions.depth_prompt.role | string/enum | Controls injection role channel. | Changes model interpretation priority. |
| data.extensions.talkativeness | number | Behavioral metadata. | Indirect generation behavior effect. |
| data.extensions.fav | boolean | UI preference metadata. | No direct LLM effect. |
| data.character_book | object | Embedded lorebook payload. | Converted/scanned for WI prompt injections. |
| data.character_book.entries[].keys | array<string> | Primary activation triggers. | Match against chat/context scan. |
| data.character_book.entries[].secondary_keys | array<string> | Secondary activation constraints. | Used with selective logic. |
| data.character_book.entries[].content | string | Injected lore text. | Direct prompt content. |
| data.character_book.entries[].position | string | Placement destination. | Determines where content lands in prompt. |
| data.character_book.entries[].insertion_order | number | Ordering priority. | Affects sequence of injected entries. |
| data.character_book.entries[].enabled | boolean | Hard activation gate. | Disabled entries never inject. |
| data.character_book.entries[].extensions.* | object | Advanced scan/timing/grouping controls. | Strongly influences activation and placement. |

## 5.1b Tavern Character Card V3 (practical template)

V3 is more flexible in validation here (validator currently checks spec/spec_version range and object-typed data), but ST still primarily reads expected V2-like fields from data for runtime behavior.

```json
{
  "spec": "chara_card_v3",
  "spec_version": "3.0",
  "data": {
    "name": "Seraphina",
    "description": "Primary character description",
    "personality": "Primary personality",
    "scenario": "Current scenario context",
    "first_mes": "First message",
    "mes_example": "Example dialogue",
    "creator_notes": "Creator notes",
    "system_prompt": "Optional card-level system prompt",
    "post_history_instructions": "Optional post-history instruction",
    "alternate_greetings": [
      "Alternative opener 1",
      "Alternative opener 2"
    ],
    "tags": ["fantasy", "elf"],
    "creator": "Lys_5",
    "character_version": "1.0",
    "extensions": {
      "talkativeness": 0.5,
      "fav": false,
      "world": "Eldoria",
      "depth_prompt": {
        "prompt": "Character depth note",
        "depth": 4,
        "role": "system"
      }
    },
    "character_book": {
      "name": "Eldoria",
      "extensions": {},
      "entries": [
        {
          "id": 0,
          "keys": ["eldoria", "forest"],
          "secondary_keys": ["glade"],
          "comment": "Eldoria summary",
          "content": "Lore text",
          "constant": false,
          "selective": true,
          "insertion_order": 100,
          "enabled": true,
          "position": "before_char",
          "use_regex": true,
          "extensions": {
            "position": 0,
            "probability": 100,
            "useProbability": true,
            "depth": 4,
            "selectiveLogic": 0,
            "group": "",
            "group_override": false,
            "group_weight": 100,
            "triggers": [],
            "ignore_budget": false
          }
        }
      ]
    }
  },
  "create_date": "2026-04-30T12:00:00.000Z"
}
```

V3 notes in ST:

- PNG read prefers ccv3 over chara chunks.
- On PNG write, ST writes chara (base64 JSON) and attempts to synthesize a ccv3 chunk.
- Runtime conversion still maps through readFromV2/getCharaCardV2 compatibility logic, so keeping V2-compatible data keys is safest.

### Character Card V3 key meanings and LLM prompt impact

V3 in ST currently behaves like a flexible envelope around the same practical prompt-bearing fields as V2.

- spec/spec_version:
  - selects V3 validation path.
  - spec_version must be in 3.x range for validator acceptance.
- data (object):
  - must be object-typed.
  - ST runtime behavior still expects familiar keys (name, description, personality, scenario, first_mes, mes_example, system_prompt, post_history_instructions, extensions, character_book).
- create_date:
  - metadata only; no direct prompt effect.

Practical rule for V3 authors:

- If you want predictable prompt behavior in current ST, keep V3 data fields semantically aligned with V2 data keys.
- Unknown/extra V3 fields are generally tolerated but may not affect prompt assembly unless specifically consumed by ST code/extensions.

#### Character Card V3 quick reference table

| Field | Type | Prompt/LLM impact | Source/default notes |
|---|---|---|---|
| spec | string | Selects V3 parse/validation path. | Must be `chara_card_v3`. |
| spec_version | string/number-like | V3 compatibility gate. | Must be in 3.x range. |
| data | object | Container for practical prompt-bearing fields. | ST expects V2-like semantics in many paths. |
| create_date | string (ISO) | Metadata only. | No direct prompt effect. |
| data.name | string | Canonical character identity. | Used in templates/macros. |
| data.description | string | Core character definition text. | Prompt context injection. |
| data.personality | string | Behavior/style text. | Prompt context injection. |
| data.scenario | string | Scene context text. | Prompt context injection. |
| data.first_mes | string | First turn seed text. | New chat opening behavior. |
| data.mes_example | string | Example dialogue text. | Few-shot style influence when enabled. |
| data.creator_notes | string | Supplemental creator guidance. | Template/extension dependent. |
| data.system_prompt | string | System-level instruction text. | High steering impact. |
| data.post_history_instructions | string | Late steering block. | High next-turn impact. |
| data.alternate_greetings | array<string> | Alternate chat openings. | Start-of-chat behavior. |
| data.tags | array<string> | Classification metadata. | Limited direct LLM effect. |
| data.creator | string | Metadata. | No direct prompt effect. |
| data.character_version | string | Metadata. | No direct prompt effect. |
| data.extensions.world | string | Lorebook linkage. | Enables WI scan/injection path. |
| data.extensions.depth_prompt.* | object | Depth prompt controls. | Same prompt-placement effect as V2. |
| data.character_book | object | Embedded lorebook data. | Converted/scanned/injected as WI content. |
| unknown extra V3 fields | any | Usually none unless extension reads them. | Preserve for compatibility, do not assume runtime effect. |

## 5.2 ST World Info file (full entry key coverage)

```json
{
  "entries": {
    "0": {
      "uid": 0,
      "key": ["eldoria", "forest"],
      "keysecondary": ["glade"],
      "comment": "Eldoria",
      "content": "Lore text shown when activated",
      "constant": false,
      "vectorized": false,
      "selective": true,
      "selectiveLogic": 0,
      "addMemo": true,
      "order": 100,
      "position": 0,
      "disable": false,
      "ignoreBudget": false,
      "excludeRecursion": false,
      "preventRecursion": false,
      "matchPersonaDescription": false,
      "matchCharacterDescription": false,
      "matchCharacterPersonality": false,
      "matchCharacterDepthPrompt": false,
      "matchScenario": false,
      "matchCreatorNotes": false,
      "delayUntilRecursion": false,
      "probability": 100,
      "useProbability": true,
      "depth": 4,
      "outletName": "",
      "group": "",
      "groupOverride": false,
      "groupWeight": 100,
      "scanDepth": null,
      "caseSensitive": null,
      "matchWholeWords": null,
      "useGroupScoring": null,
      "automationId": "",
      "role": 0,
      "sticky": null,
      "cooldown": null,
      "delay": null,
      "displayIndex": 0,
      "triggers": []
    }
  }
}
```

Field-name note: the camelCase names above are the native World Info schema (per world-info.js newWorldInfoEntryDefinition). The snake_case lookalikes — case_sensitive, match_whole_words, use_regex — and the characterFilterNames/characterFilterExclude pair belong to the embedded character_book format (§5.1/5.1b) and are NOT read by the World Info GUI in a standalone file. Character filtering in a native file is the optional characterFilter object ({"isExclude": false, "names": [], "tags": []}); the editor deletes it when empty, so omit it when unused. displayIndex is editor sort order only and falls back to uid when missing.

### world_info_position enum values

- 0: before
- 1: after
- 2: ANTop
- 3: ANBottom
- 4: atDepth
- 5: EMTop
- 6: EMBottom
- 7: outlet

### World Info/Lorebook key meanings and LLM prompt impact

Core structure keys:

- entries: dictionary of lore entries; each entry is independently evaluated for activation.
- uid: stable entry identifier used for editing/timing/state tracking. The entry's object key in entries must equal String(uid) — world-info.js creates entries as entries[uid] (createWorldInfoEntry / getFreeWorldEntryUid) and every editor lookup is entries[uid], so a key/uid mismatch makes the entry invisible and uneditable in the GUI even though the file imports cleanly.
- comment/addMemo: editor/display metadata; no direct model effect.

Activation matching keys:

- key:
  - primary trigger tokens/phrases/regex-like patterns.
  - if matched against scan buffer, entry can activate.
- keysecondary + selective + selectiveLogic:
  - secondary constraints and boolean logic mode (AND/NOT patterns).
  - reduces false positives and controls precision.
- caseSensitive/matchWholeWords/useGroupScoring/scanDepth:
  - matching strictness/scope controls; changes activation likelihood.
- matchPersonaDescription/matchCharacterDescription/matchCharacterPersonality/matchCharacterDepthPrompt/matchScenario/matchCreatorNotes:
  - expands scan surfaces beyond recent chat text.
  - allows lore activation from static context blocks, not only dialogue.

Prompt content and placement keys:

- content:
  - the actual lore text inserted into prompt when active.
- position:
  - injection destination (before/after/ANTop/ANBottom/atDepth/EM anchors/outlet).
  - directly affects model behavior because instruction placement changes relative priority/recency.
- order:
  - intra-bucket ordering.
- depth + role (for atDepth):
  - controls where in context stack and as which role entry is inserted.

Budget/probability/recursion keys:

- disable/enabled state:
  - hard on/off toggle.
- probability/useProbability:
  - stochastic activation gate.
- ignoreBudget:
  - can force inclusion even when normal WI budget would trim entries.
- constant:
  - always active pattern (depending on conversion mode/source semantics).
- excludeRecursion/preventRecursion/delayUntilRecursion:
  - controls recursive WI scans and self-trigger chains.

Grouping and conflict-resolution keys:

- group/groupOverride/groupWeight:
  - mutual-exclusion/inclusion grouping behavior.
  - can enforce one winner per group or weighted selection, affecting which lore makes it into prompt.

Timed and automation keys:

- sticky/cooldown/delay:
  - temporal activation effects over message turns.
- triggers:
  - generation-type trigger filters.
- automationId:
  - extension/automation integration identifier.
- outletName:
  - sends content to named outlet channels instead of standard before/after blocks.

Vector/search-related key:

- vectorized:
  - marks entries for vector-related workflows/extensions; direct effect depends on enabled extension pipeline.

#### World Info/Lorebook quick reference table

| Field | Type | Prompt/LLM impact | Source/default notes |
|---|---|---|---|
| entries | object map | Defines all candidate lore entries. | Required root key for valid import. |
| entries.<uid>.uid | number | Entry identity for state/timing/editing. | Should be stable per entry. |
| entries.<uid>.key | array<string> | Primary activation triggers. | Major activation driver. |
| entries.<uid>.keysecondary | array<string> | Secondary constraints. | Used with selective logic. |
| entries.<uid>.selective | boolean | Enables secondary-key logic. | Controls strictness of activation. |
| entries.<uid>.selectiveLogic | enum number | Boolean logic mode (AND/NOT variants). | Changes activation semantics. |
| entries.<uid>.content | string | Injected lore text. | Direct token budget and behavior impact. |
| entries.<uid>.position | enum number | Injection location bucket. | Determines where model sees content (before/after/AN/depth/etc). |
| entries.<uid>.order | number | Sort priority within bucket. | Affects final prompt ordering. |
| entries.<uid>.disable | boolean | Hard disable switch. | Disabled entries never activate. |
| entries.<uid>.constant | boolean | Always-on style entry behavior. | Increases persistent context pressure. |
| entries.<uid>.probability | number | Activation chance percentage. | Introduces stochastic inclusion. |
| entries.<uid>.useProbability | boolean | Enables probability gate. | If false, probability ignored. |
| entries.<uid>.ignoreBudget | boolean | Bypass WI budget trimming. | Can force expensive context inclusion. |
| entries.<uid>.depth | number | Depth index for atDepth insertion. | Alters recency/weight in context stack. |
| entries.<uid>.role | enum number | Role channel for depth insertion. | Changes model interpretation of injected text. |
| entries.<uid>.scanDepth | number/null | Limits scan window depth. | Prevents distant-history triggering. |
| entries.<uid>.caseSensitive | boolean/null | Case-sensitive matching toggle. | Affects trigger hit rate. |
| entries.<uid>.matchWholeWords | boolean/null | Whole-word matching toggle. | Reduces accidental partial hits. |
| entries.<uid>.matchPersonaDescription | boolean | Scan persona description block. | Enables static-context triggers. |
| entries.<uid>.matchCharacterDescription | boolean | Scan character description block. | Enables static-context triggers. |
| entries.<uid>.matchCharacterPersonality | boolean | Scan character personality block. | Enables static-context triggers. |
| entries.<uid>.matchCharacterDepthPrompt | boolean | Scan character depth prompt block. | Enables prompt-note triggers. |
| entries.<uid>.matchScenario | boolean | Scan scenario block. | Enables scenario-driven triggers. |
| entries.<uid>.matchCreatorNotes | boolean | Scan creator notes block. | Enables notes-driven triggers. |
| entries.<uid>.excludeRecursion | boolean | Exclude from recursive activation loop. | Reduces self-trigger chains. |
| entries.<uid>.preventRecursion | boolean | Prevent recursive re-triggers. | Stabilizes activation set. |
| entries.<uid>.delayUntilRecursion | boolean/number | Delay activation until recursion phase. | Changes turn-by-turn timing. |
| entries.<uid>.group | string | Group identifier for conflict resolution. | Enables one-of-many behavior. |
| entries.<uid>.groupOverride | boolean | Priority winner flag in group. | Can force deterministic winner. |
| entries.<uid>.groupWeight | number | Weighted winner selection in group. | Stochastic group choice behavior. |
| entries.<uid>.useGroupScoring | boolean/null | Score-based group filtering. | Keeps highest matching entries. |
| entries.<uid>.sticky | number/null | Persist active effect across turns. | Maintains context continuity. |
| entries.<uid>.cooldown | number/null | Cooldown before reactivation. | Prevents repeated prompt spam. |
| entries.<uid>.delay | number/null | Activation delay in turns. | Temporal narrative control. |
| entries.<uid>.triggers | array<string> | Generation-type trigger filter. | Activation only on matching trigger types. |
| entries.<uid>.outletName | string | Named outlet target when position=outlet. | Sends lore to nonstandard injection channel. |
| entries.<uid>.automationId | string | Automation integration identifier. | Extension-driven behavior hook. |
| entries.<uid>.vectorized | boolean | Vector pipeline marker. | Effect depends on enabled vector extension stack. |
| entries.<uid>.characterFilter | object (optional) | None directly; gates activation per character. | Shape {isExclude, names, tags}; editor deletes it when empty — omit when unused. Replaces legacy characterFilterNames/characterFilterExclude. |
| entries.<uid>.comment/addMemo/displayIndex | mixed metadata | Editor/display organization. | No direct LLM effect. displayIndex falls back to uid when missing. |

## 5.3 Instruct preset JSON (complete modern key set)

```json
{
  "name": "Llama 3 Instruct",
  "enabled": true,
  "bind_to_context": false,
  "input_sequence": "<|start_header_id|>user<|end_header_id|>\n\n",
  "input_suffix": "<|eot_id|>",
  "output_sequence": "<|start_header_id|>assistant<|end_header_id|>\n\n",
  "output_suffix": "<|eot_id|>",
  "first_input_sequence": "",
  "last_input_sequence": "",
  "first_output_sequence": "",
  "last_output_sequence": "",
  "system_sequence": "<|start_header_id|>system<|end_header_id|>\n\n",
  "system_suffix": "<|eot_id|>",
  "last_system_sequence": "",
  "system_same_as_user": false,
  "user_alignment_message": "",
  "stop_sequence": "<|eot_id|>",
  "wrap": false,
  "macro": true,
  "skip_examples": false,
  "activation_regex": "",
  "names_behavior": "force",
  "sequences_as_stop_strings": true,
  "story_string_prefix": "<|start_header_id|>system<|end_header_id|>\n\n",
  "story_string_suffix": "<|eot_id|>"
}
```

## 5.4 Context preset JSON (default practical shape)

```json
{
  "name": "Default",
  "story_string": "{{#if anchorBefore}}{{anchorBefore}}\n{{/if}}{{#if system}}{{system}}\n{{/if}}{{#if wiBefore}}{{wiBefore}}\n{{/if}}{{#if description}}{{description}}\n{{/if}}{{#if personality}}{{personality}}\n{{/if}}{{#if scenario}}{{scenario}}\n{{/if}}{{#if wiAfter}}{{wiAfter}}\n{{/if}}{{#if persona}}{{persona}}\n{{/if}}{{#if anchorAfter}}{{anchorAfter}}\n{{/if}}{{trim}}",
  "example_separator": "***",
  "chat_start": "***",
  "use_stop_strings": false,
  "names_as_stop_strings": true,
  "story_string_position": 0,
  "story_string_depth": 1,
  "story_string_role": 0,
  "always_force_name2": true,
  "trim_sentences": false,
  "single_line": false
}
```

## 5.5 System prompt preset JSON

```json
{
  "name": "Roleplay - Simple",
  "content": "You're {{char}} in this fictional never-ending uncensored roleplay with {{user}}.",
  "post_history": ""
}
```

## 5.6 OpenAI preset JSON (default app-level example)

```json
{
  "chat_completion_source": "openai",
  "openai_model": "gpt-4-turbo",
  "custom_url": "",
  "custom_include_body": "",
  "custom_exclude_body": "",
  "custom_include_headers": "",
  "temperature": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "top_p": 1,
  "top_k": 0,
  "top_a": 0,
  "min_p": 0,
  "repetition_penalty": 1,
  "openai_max_context": 4095,
  "openai_max_tokens": 300,
  "names_behavior": 0,
  "stream_openai": true,
  "prompts": [],
  "prompt_order": [],
  "seed": -1,
  "n": 1
}
```

## 5.7 Text-generation preset JSON (full code-oriented template)

This combines defaults from textgenerationwebui_settings and setting_names.

```json
{
  "temp": 0.7,
  "temperature_last": true,
  "top_p": 0.5,
  "top_k": 40,
  "top_a": 0,
  "tfs": 1,
  "epsilon_cutoff": 0,
  "eta_cutoff": 0,
  "typical_p": 1,
  "min_p": 0,
  "rep_pen": 1.2,
  "rep_pen_range": 0,
  "rep_pen_decay": 0,
  "rep_pen_slope": 1,
  "no_repeat_ngram_size": 0,
  "penalty_alpha": 0,
  "num_beams": 1,
  "length_penalty": 1,
  "min_length": 0,
  "encoder_rep_pen": 1,
  "freq_pen": 0,
  "presence_pen": 0,
  "skew": 0,
  "do_sample": true,
  "early_stopping": false,
  "dynatemp": false,
  "min_temp": 0,
  "max_temp": 2,
  "dynatemp_exponent": 1,
  "smoothing_factor": 0,
  "smoothing_curve": 1,
  "dry_allowed_length": 2,
  "dry_multiplier": 0,
  "dry_base": 1.75,
  "dry_sequence_breakers": "[\"\\n\", \":\", \"\\\"\", \"*\"]",
  "dry_penalty_last_n": 0,
  "max_tokens_second": 0,
  "seed": -1,
  "preset": "Default",
  "add_bos_token": true,
  "stopping_strings": [],
  "ban_eos_token": false,
  "skip_special_tokens": true,
  "include_reasoning": true,
  "streaming": false,
  "mirostat_mode": 0,
  "mirostat_tau": 5,
  "mirostat_eta": 0.1,
  "guidance_scale": 1,
  "negative_prompt": "",
  "grammar_string": "",
  "json_schema": null,
  "json_schema_allow_empty": false,
  "banned_tokens": "",
  "global_banned_tokens": "",
  "send_banned_tokens": true,
  "sampler_priority": [],
  "samplers": [],
  "samplers_priorities": [],
  "ignore_eos_token": false,
  "spaces_between_special_tokens": true,
  "speculative_ngram": false,
  "sampler_order": [6, 0, 1, 3, 4, 2, 5],
  "logit_bias": [],
  "n": 1,
  "custom_model": "",
  "bypass_status_check": false,
  "openrouter_allow_fallbacks": true,
  "xtc_threshold": 0.1,
  "xtc_probability": 0,
  "nsigma": 0,
  "min_keep": 0,
  "generic_model": "",
  "extensions": {},
  "adaptive_target": -0.01,
  "adaptive_decay": 0.9
}
```

## 5.8 Chat Completion generate payload (full practical ST backend shape)

This is the incoming JSON shape for `/api/backends/chat-completions/generate` before provider-specific remapping. Keys are added, removed, or clamped depending on `chat_completion_source`.

```json
{
  "type": "normal",
  "chat_completion_source": "openai",
  "model": "gpt-4.1",
  "messages": [
    { "role": "system", "content": "You are a helpful roleplay assistant." },
    { "role": "user",   "content": "Describe the scene briefly." }
  ],
  "user_name": "User",
  "char_name": "Seraphina",
  "group_names": [],
  "temperature": 0.8,
  "top_p": 0.95,
  "top_k": 0,
  "min_p": 0,
  "top_a": 0,
  "presence_penalty": 0,
  "frequency_penalty": 0,
  "repetition_penalty": 1,
  "max_tokens": 300,
  "max_completion_tokens": 300,
  "stream": true,
  "stop": ["<END>"],
  "logit_bias": {},
  "logprobs": 5,
  "seed": -1,
  "n": 1,
  "use_sysprompt": true,
  "assistant_prefill": "",
  "safe_prompt": false,
  "include_reasoning": false,
  "reasoning_effort": "medium",
  "verbosity": "medium",
  "enable_web_search": false,
  "request_images": false,
  "request_image_resolution": "1024x1024",
  "request_image_aspect_ratio": "1:1",
  "custom_prompt_post_processing": "none",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "lookup_lore",
        "description": "Look up lore snippets",
        "parameters": {
          "type": "object",
          "properties": { "topic": { "type": "string" } },
          "required": ["topic"]
        }
      }
    }
  ],
  "tool_choice": "auto",
  "json_schema": {
    "name": "scene_response",
    "description": "Structured scene output",
    "strict": true,
    "value": {
      "type": "object",
      "properties": {
        "summary": { "type": "string" },
        "tone":    { "type": "string" }
      },
      "required": ["summary"]
    }
  },
  "reverse_proxy": "",
  "proxy_password": "",
  "custom_url": "",
  "custom_include_body": "",
  "custom_exclude_body": "",
  "custom_include_headers": "",
  "provider": ["openai"],
  "quantizations": [],
  "allow_fallbacks": true,
  "use_fallback": false,
  "middleout": false,
  "azure_base_url": "",
  "azure_deployment_name": "",
  "azure_api_version": "2024-02-01",
  "vertexai_auth_mode": "adc",
  "vertexai_region": "us-central1",
  "vertexai_express_project_id": ""
}
```

Key meanings and LLM purpose:

- **type**: generation mode — `"normal"` (standard reply), `"quiet"` (background/summarization, suppresses assistant prefill), `"impersonate"` (user-voice impersonation), `"continue"` (extend last message), `"swipe"` (alternative swipe reply). Controls assistant prefill suppression, continue nudge injection, group nudge, and multi-swipe eligibility.
- **chat_completion_source**: selects provider adapter and protocol transforms (openai, claude, openrouter, google, mistralai, cohere, custom, etc.).
- **model**: controls model capability envelope, context window, tool/JSON support, and cost profile.
- **messages**: primary conversational context assembled by the PromptManager. This is what the model directly conditions on. See Section 8 for assembly details.
- **user_name / char_name / group_names**: human and character names used for dialogue example attribution and completion-mode name tagging. group_names lists all active group member names.
- **temperature / top_p / top_k / min_p / top_a**: stochastic sampling controls. top_k, min_p, and top_a are forwarded only to providers that support them (Claude, OpenRouter, Google, Perplexity, Electronhub, Chutes).
- **presence_penalty / frequency_penalty / repetition_penalty**: anti-repetition controls. repetition_penalty is OpenRouter/Chutes-specific; presence/frequency_penalty are clamped for Cohere (0–1 range).
- **max_tokens / max_completion_tokens**: output length budget and cost/latency cap. max_completion_tokens is used for o1-family models.
- **stream**: enables token streaming; affects UX latency and response forwarding mode.
- **stop**: hard stop sequences. Provider-specific limits apply: Claude and Mistral accept unlimited; Cohere max 5; Google max 5 (and each string must be 1–16 chars); OpenAI follows their documented limit.
- **logit_bias**: token-level probability steering. Only forwarded for logitBiasSources (OpenAI, Azure, OpenRouter, Electronhub, Chutes, Custom).
- **logprobs**: number of top log-probability entries to return per token. Forwarded only for logprobsSupportedSources (OpenAI, Azure, Custom, DeepSeek, XAI, AIMLAPI, Chutes).
- **seed**: reproducibility hint for deterministic-like sampling where the provider supports it.
- **n**: number of completion candidates; enables multi-swipe when > 1. Only valid for multiswipeSources (OpenAI, Azure, Custom, XAI, AIMLAPI, Moonshot).
- **use_sysprompt**: (Claude and Google/Vertex only) when `true`, all leading `system`-role messages are extracted from the messages array into the API's dedicated system field, rather than being left in the messages array as user-turn messages.
- **assistant_prefill**: (Claude only) text that is prepended to the last assistant turn before sending, steering the model's response opening without appearing in the ST chat history. Suppressed during `quiet` generation and when `continue_prefill` is active.
- **safe_prompt**: (Mistral only) prepends a provider-side safety preamble; defaults to `false`.
- **include_reasoning / reasoning_effort / verbosity**: controls internal chain-of-thought depth and response style on supporting models (Claude Extended Thinking, Gemini Thinking, o-series reasoning, etc.).
- **enable_web_search**: triggers provider/model-specific retrieval augmentation where available.
- **request_images / request_image_resolution / request_image_aspect_ratio**: request inline image generation in the response on supporting providers.
- **custom_prompt_post_processing**: post-processing pipeline key applied to the assembled messages before sending. Values: `""` (none), `"merge"`, `"semi"`, `"strict"`, `"single"`, and tool-aware variants. Controls how consecutive same-role messages are merged and how system messages are normalized.
- **tools / tool_choice**: structured function-calling definitions injected by ToolManager. Only added when the provider/type supports tool calls.
- **json_schema / response_format**: forces structured output for machine-readable downstream use.
- **reverse_proxy / proxy_password**: route and authorize via user's configured proxy endpoint.
- **custom_url / custom_include_body / custom_exclude_body / custom_include_headers**: (Custom source) endpoint URL and body/header manipulation.
- **provider / quantizations / allow_fallbacks / use_fallback / middleout**: OpenRouter routing, model selection, quantization filtering, context compression (middleout), and cascade fallback behavior.
- **azure_base_url / azure_deployment_name / azure_api_version**: Azure OpenAI endpoint coordinates; required when source is `azure`.
- **vertexai_auth_mode / vertexai_region / vertexai_express_project_id**: Vertex AI authentication mode (`adc`, `service_account`, `express`) and regional routing.

Provider note:

- ST assembles a unified request body, then remaps and filter-transforms it per provider adapter (Claude uses `convertClaudeMessages`, Google uses `convertGooglePrompt`, Cohere/Mistral/Perplexity have their own adapters, etc.). Keys not understood by a provider are stripped before the outgoing HTTP call.

## 5.9 Text Completion generate payload (full practical ST backend shape)

This is the incoming JSON shape for /api/backends/text-completions/generate. ST filters keys by api_type using constant allowlists (OPENAI_KEYS, VLLM_KEYS, OPENROUTER_KEYS, etc.).

```json
{
  "api_type": "generic",
  "api_server": "http://127.0.0.1:5000",
  "model": "my-model",
  "prompt": "Write one short paragraph about Eldoria.",
  "stream": true,
  "max_tokens": 300,
  "temperature": 0.8,
  "top_p": 0.95,
  "top_k": 40,
  "min_p": 0,
  "repetition_penalty": 1.1,
  "presence_penalty": 0,
  "frequency_penalty": 0,
  "stop": ["<END>"],
  "seed": -1,
  "logit_bias": {},
  "logprobs": 0,
  "n": 1,
  "best_of": 1,
  "suffix": "",
  "user": "session-user-id",
  "use_beam_search": false,
  "length_penalty": 1,
  "early_stopping": false,
  "stop_token_ids": [],
  "ignore_eos": false,
  "min_tokens": 0,
  "skip_special_tokens": true,
  "spaces_between_special_tokens": true,
  "truncate_prompt_tokens": 0,
  "include_stop_str_in_output": false,
  "response_format": null,
  "guided_json": null,
  "guided_regex": null,
  "guided_choice": null,
  "guided_grammar": null,
  "guided_decoding_backend": "",
  "guided_whitespace_pattern": "",
  "provider": ["openai"],
  "quantizations": [],
  "allow_fallbacks": true,
  "include_reasoning": false
}
```

Key meanings and LLM purpose:

- api_type: chooses target protocol family and endpoint path (/v1/completions, /completion, /api/generate, etc.).
- prompt: raw text context for classic completion-style decoding.
- model: model selection and capability envelope.
- stream: token streaming mode for low-latency incremental output.
- max_tokens: output budget and cost/latency limiter.
- temperature/top_p/top_k/min_p: sampling nucleus/top-k/min-p controls for response diversity.
- repetition_penalty/presence_penalty/frequency_penalty: anti-repetition controls.
- stop/stop_token_ids: explicit decode stop boundaries.
- seed: deterministic sampling hint where supported.
- logit_bias/logprobs: token steering and diagnostics.
- n/best_of: candidate generation count and server-side selection behavior.
- use_beam_search/length_penalty/early_stopping: beam-search decode behavior for compatible servers.
- ignore_eos/min_tokens: controls EOS handling and minimum generation floor.
- skip_special_tokens/spaces_between_special_tokens: tokenizer decoding cleanup behavior.
- truncate_prompt_tokens: trims long prompts server-side for context fit.
- guided_* and response_format: constrained decoding / structured-output steering on compatible backends.
- provider/quantizations/allow_fallbacks/include_reasoning: OpenRouter/OpenAI-compatible routing and reasoning-related switches.

Provider remap note:

- Ollama requests are rebuilt to { model, prompt, stream, keep_alive, raw, options } where options is picked from OLLAMA_KEYS.
- Generic/vLLM/OpenRouter/Infermatic/Featherless/Together are filtered to supported key allowlists before send.

---

## 5.10 PromptManager block format (`prompts` and `prompt_order`)

The `prompts` and `prompt_order` arrays stored in `oai_settings` (preset JSON sections 5.6) define all prompt blocks and their per-character ordering for the chat completion pipeline. They can be exported/imported from the PromptManager UI as a JSON file with this envelope:

```json
{
  "version": 1,
  "type": "full",
  "data": {
    "prompts": [...],
    "prompt_order": [...]
  }
}
```

### 5.10.1 Prompt object (one entry in `prompts`)

```json
{
  "identifier": "my_custom_lore",
  "name": "Custom Lore Block",
  "role": "system",
  "content": "The world of Eldoria is a realm of ancient magic...",
  "system_prompt": false,
  "marker": false,
  "injection_position": 1,
  "injection_depth": 4,
  "injection_order": 100,
  "enabled": true,
  "forbid_overrides": false
}
```

| Field | Type | Description |
|---|---|---|
| identifier | string | Unique key. Built-ins: `main`, `nsfw`, `jailbreak`, `worldInfoBefore`, `worldInfoAfter`, `charDescription`, `charPersonality`, `scenario`, `personaDescription`, `chatHistory`, `dialogueExamples`, `enhanceDefinitions`. Custom prompts use arbitrary strings. |
| name | string | Display name shown in the PromptManager UI. |
| role | string | Message role: `system`, `user`, or `assistant`. |
| content | string | Text sent to the LLM. Supports `{{char}}`, `{{user}}`, `{{description}}`, and other macros. Empty for `marker: true` entries (content is filled at runtime by ST). |
| system_prompt | boolean | `true` = ST-managed system prompt slot. `false` = user-defined prompt block. |
| marker | boolean | `true` = positional placeholder whose content is provided at runtime by ST (e.g. `chatHistory`, `charDescription`). The `content` field is ignored for markers. |
| injection_position | number | `0` = RELATIVE — placed within the top system prompt block according to `prompt_order` sequence. `1` = ABSOLUTE — injected into the chat messages array at `injection_depth` from the end. |
| injection_depth | number | For ABSOLUTE prompts: number of messages from the end of the chat history to insert before. `0` = after the last message, `4` = four messages from the end (default character depth_prompt value). |
| injection_order | number | For ABSOLUTE prompts sharing the same depth: lower values insert earlier (closer to the start of that depth group). |
| forbid_overrides | boolean | If `true`, the character card's `system_prompt` (for `main`) or `post_history_instructions` (for `jailbreak`) cannot replace this prompt's content even when `prefer_character_prompt` / `prefer_character_jailbreak` is enabled in user settings. |

### 5.10.2 Prompt order entry (one entry in `prompt_order`)

```json
{
  "character_id": 100001,
  "order": [
    { "identifier": "main",             "enabled": true  },
    { "identifier": "worldInfoBefore",  "enabled": true  },
    { "identifier": "personaDescription","enabled": true  },
    { "identifier": "charDescription",  "enabled": true  },
    { "identifier": "charPersonality",  "enabled": true  },
    { "identifier": "scenario",         "enabled": true  },
    { "identifier": "enhanceDefinitions","enabled": false },
    { "identifier": "nsfw",             "enabled": true  },
    { "identifier": "worldInfoAfter",   "enabled": true  },
    { "identifier": "dialogueExamples", "enabled": true  },
    { "identifier": "chatHistory",      "enabled": true  },
    { "identifier": "jailbreak",        "enabled": true  }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| character_id | number | The character's numeric ID. When the PromptManager uses the `global` strategy (default), all characters share a single entry with a synthetic dummy ID. When using the `character` strategy, each character has its own entry. |
| order[].identifier | string | Must match an `identifier` in the `prompts` array. |
| order[].enabled | boolean | If `false`, this prompt block is excluded from the context for this character entirely, regardless of its content. |

---

## 6) Practical gotchas and behavior notes

- JSON must be strict. Many imports use direct JSON.parse with no leniency.
- Character import logic is permissive across multiple legacy shapes, but normalizes to V2-style data.
- World info import only validates root entries existence server-side. Field-level defaults and behavior are largely enforced client-side in world-info.js templates and editor logic.
- World info entry object keys must equal String(uid). world-info.js stores entries as entries[uid] (createWorldInfoEntry) and every editor read/write is an entries[uid] lookup; a file whose keys diverge from its uids (e.g., sequential "0"/"1" keys with non-sequential uids) imports without error but its entries never render in the World Info editor.
- Native World Info entry fields are camelCase (caseSensitive, matchWholeWords, scanDepth, useGroupScoring, displayIndex, optional characterFilter object). The snake_case variants (case_sensitive, match_whole_words, use_regex) and characterFilterNames/characterFilterExclude come from the embedded character_book spec; in a standalone World Info file they are stored but ignored by the GUI, which reads only the camelCase names.
- Author's Note augmentation with ANTop/ANBottom only occurs when shouldWIAddPrompt is true (insertion interval logic in authors-note.js).
- Prompt order behavior for OpenAI-style flows is strongly affected by prompt_order and enabled markers in preset JSON.

---

## 7) Recommended extension strategy for custom JSON integrations

For plugin or custom importer work:

1. Normalize external formats into ST canonical shapes first (character V2, world info entries template, or preset object).
2. Preserve unknown foreign keys in extension objects when possible.
3. Validate required roots early (for example entries for lorebook, spec/data for card).
4. Keep source-specific conversion isolated in dedicated converter functions, mirroring existing convertX patterns.

This keeps SillyTavern's prompt assembly stable while still allowing rich custom content ingestion.

---

## 8) How SillyTavern assembles the final prompt

This section walks through the complete pipeline from raw character card and world info data to the final messages array (or completion string) sent to the LLM. Understanding this pipeline is essential for extension developers, API integrators, and anyone debugging unexpected context content.

### Overview

For **chat completion** APIs (OpenAI, Claude, Google, OpenRouter, etc.) the output is a structured `messages` array, optionally split into a separate system block depending on provider. For **text completion** APIs (textgenerationwebui, Kobold, NovelAI, etc.) all content is collapsed into a single context string via the context template and instruct-mode wrappers.

---

### Step 1 — Character card field extraction

When a character is loaded and a generation is triggered, `getCharacterCardFields()` reads these fields and maps them to ST's internal prompt slots:

| Character card field | ST prompt slot | Condition |
|---|---|---|
| `data.description` | `charDescription` | Always. |
| `data.personality` | `charPersonality` | Always; formatted via `personality_format` template. |
| `data.scenario` | `scenario` | Always; formatted via `scenario_format` template. |
| `data.mes_example` | `messageExamples` | Always; injected at the `dialogueExamples` marker position. |
| `data.system_prompt` | `systemPromptOverride` | Only when `power_user.prefer_character_prompt` is `true`. Replaces the `main` prompt block's content. |
| `data.post_history_instructions` | `jailbreakPromptOverride` | Only when `power_user.prefer_character_jailbreak` is `true`. Replaces the `jailbreak` (PHI) prompt block's content. |
| `data.extensions.depth_prompt.prompt` | ABSOLUTE depth injection | Always when non-empty. Inserted into the messages array at `depth_prompt.depth` from the end, with role `depth_prompt.role`. |
| `data.creator_notes` | Macro environment only | Not directly injected; available via `{{creatorNotes}}` macro. |

**Character card V3 note:** `data.system_prompt` and `data.post_history_instructions` occupy exactly the same code path in V3 as in V2 — there is no separate V3-only system prompt channel. V3 characters that require per-API-type behavior should use the `depth_prompt` extension or world info entries instead.

**Override guard:** Even when `prefer_character_prompt` is true, if the `main` (or `jailbreak`) prompt block has `forbid_overrides: true` set in the PromptManager, the character card override is silently ignored for that block.

---

### Step 2 — World info scanning

Before each generation, `getWorldInfoPrompt()` scans the assembled chat context and character fields against every active WI entry's `keys` array. Matched entries are activated and routed to prompt slots based on their `position` value:

| Position value | Position name | Where it goes |
|---|---|---|
| `0` | Before Char | `worldInfoBefore` — system message placed before character data. |
| `1` | After Char | `worldInfoAfter` — system message placed after scenario. |
| `2` | Author's Note Top (ANTop) | Inserted at the top of the Author's Note content. |
| `3` | Author's Note Bottom (ANBottom) | Inserted at the bottom of the Author's Note content. |
| `4` | In-Chat at Depth D (atDepth) | ABSOLUTE injection into the messages array at depth `D` from the end. |
| `5` | Example Messages Top (EMTop) | Prepended to the `dialogueExamples` block as a system message. |
| `6` | Example Messages Bottom (EMBottom) | Appended to the `dialogueExamples` block as a system message. |
| `7` | Outlet | Stored under a named outlet (set via `outletName`). Not injected automatically — must be pulled in via the `{{outlet::Name}}` macro placed in a Prompt Manager block or Advanced Formatting field. |

This table matches the `world_info_position` enum documented earlier in this file (Section "world_info_position enum values") and the current SillyTavern source. Use this table as the authoritative reference for position assignment in lorebook entries.

Scanning respects: entry enabled/disabled state, insertion order (lower = earlier in the merged block), recursion depth (WI entries can trigger other entries), and the token budget (entries that would bust the budget are dropped).

---

### Step 3 — Extension prompt gathering

After WI scanning, registered extension prompts from `extensionPrompts` are assembled into the prompt pipeline:

| Extension key | Source | Injection type |
|---|---|---|
| `1_memory` | Summary/Memory extension | `IN_PROMPT`; positioned relative to `main` (before or after based on `position`). |
| `2_floating_prompt` | Author's Note | `IN_PROMPT`; position (Before Char / After Desc / Before PHI) and depth control final placement. |
| `3_vectors` | Vectors memory extension | `IN_PROMPT`; relative to `main`. |
| `4_vectors_data_bank` | Vectors data bank extension | `IN_PROMPT`; relative to `main`. |
| `chromadb` | SmartContext (ChromaDB) extension | `IN_PROMPT`; relative to `main`. |
| `DEPTH_PROMPT` | Character `extensions.depth_prompt` | `IN_CHAT` at `depth_prompt.depth` — this is how the card's depth prompt physically reaches the messages array. |
| Custom extension key | Any extension using `setExtensionPrompt()` | Position is set by the extension: `BEFORE_PROMPT`, `IN_PROMPT`, or `IN_CHAT` with a depth value. |

The `position` values for `IN_PROMPT` extensions (start, end, etc.) control whether the content is inserted before or after the `main` system prompt block.

---

### Step 4 — PromptManager collection build

`preparePromptsForChatCompletion()` merges all inputs into a single ordered `PromptCollection`:

1. System prompt entries are created for: `worldInfoBefore`, `worldInfoAfter`, `charDescription`, `charPersonality`, `scenario`, `personaDescription`, `bias`, and all resolved `IN_PROMPT` extension prompts.
2. The collection is seeded from the user's `prompts` array, sequenced per the active character's `prompt_order` entry.
3. For each resolved system prompt: if a matching `identifier` exists as a marker in the collection, that slot's content is overwritten with the runtime value; otherwise the prompt is appended.
4. If `systemPromptOverride` is set (from character card step 1) and `forbid_overrides` is not true on the `main` block, the `main` prompt's content is replaced with the character card's `system_prompt`.
5. If `jailbreakPromptOverride` is set and `forbid_overrides` is not true on the `jailbreak` block, the `jailbreak` prompt's content is replaced with the character card's `post_history_instructions`.

---

### Step 5 — Token budgeting and `populateChatCompletion()`

`populateChatCompletion()` fills the `ChatCompletion` object while respecting the token budget (`openai_max_context` − `openai_max_tokens`).

**Mandatory system block (top of context, always included):**

1. `worldInfoBefore` — WI entries with position Before Char.
2. `main` — system prompt (or character `system_prompt` if Step 4 override applied).
3. `worldInfoAfter` — WI entries with position After Char.
4. `charDescription` — character description.
5. `charPersonality` — personality summary.
6. `scenario` — scenario / setting.
7. `personaDescription` — user persona description.

**Ordered prompt blocks (appended after the above, in `prompt_order` sequence):**

8. `nsfw` — Auxiliary/NSFW toggle prompt.
9. User-defined RELATIVE prompts (custom blocks with `injection_position: 0`) in the order defined by `prompt_order`.
10. `enhanceDefinitions` — if enabled.
11. `bias` — assistant bias message.

**Known relative extension prompts (injected around `main`):**

- `summary`, `authorsNote`, `vectorsMemory`, `vectorsDataBank`, `smartContext` — inserted before or after the `main` block based on their `.position` value.

**Token-budgeted history (fills remaining context, newest-first):**

12. Chat history messages from newest to oldest, until the token budget is exhausted.
13. Dialogue examples (`mes_example` pairs) — placed before or after history depending on the `pin_examples` setting.

**ABSOLUTE in-chat injections (after token budgeting):**

14. All ABSOLUTE prompts (`depth_prompt`, WI position-4 entries, AN depth entries) are spliced into the messages array at their specified `injection_depth` from the end.

**Control prompts (always appended last):**

15. Impersonation prompt (when `type = "impersonate"`).
16. Continue nudge or continue prefill message (when `type = "continue"`).
17. Group nudge message (group chats only, except for impersonate type).

---

### Step 6 — Provider-specific transformation

After the messages array is assembled, it is transformed per provider:

| Provider | System message handling |
|---|---|
| OpenAI / Azure / OpenRouter | System messages stay in the `messages` array with `role: "system"`. |
| Claude (`use_sysprompt: true`) | All leading system-role messages are extracted to a separate `system` array (each as `{ type: "text", text: "..." }`). Remaining in-context system messages become `user`-role messages. |
| Google / Vertex AI (`use_sysprompt: true`) | Leading system messages become `system_instruction.parts[{ text }]`. Remaining system messages are merged into adjacent turns. |
| Mistral / Custom / Others | System messages stay in the `messages` array; provider SDK may further transform them. |

**squash_system_messages** (user setting in openai.js): if enabled, consecutive system-role messages at the top of the assembled array are merged into a single system message before the provider transformation step.

**assistant_prefill** (Claude only): when set and the generation type is not `quiet`, this text is appended as the last message with `role: "assistant"`, steering the model's response opening. It does not appear in the ST chat history. Suppressed for `quiet` generation and when `continue_prefill` is active.

---

### Final messages array shape (annotated example, OpenAI-compatible)

```
[system]  main prompt                          ← character system_prompt if override active
[system]  worldInfoBefore                      ← merged WI entries at position 0
[system]  personaDescription                   ← user persona text
[system]  charDescription                      ← character description
[system]  charPersonality                      ← personality summary
[system]  scenario                             ← scenario/setting text
[system]  authorsNote / summary / vectors      ← IN_PROMPT extension prompts (around main)
[system]  nsfw                                 ← auxiliary prompt
[system]  worldInfoAfter                       ← merged WI entries at position 1
[system]  <user-defined RELATIVE prompts>      ← custom blocks in prompt_order sequence

[system]  dialogueExamples (system wraps)      ← mes_example pairs (pin_examples: before)
[user]    Example_User message
[assistant] Example_Char message
...

   ← ABSOLUTE injections spliced at depth D from end ←
   (WI position-4 entries, character depth_prompt, AN depth, custom extension depth)

[user]    oldest in-context chat message       ← chat history, token-budget gated
[assistant] ...
[user]    ...
[assistant] ...
[user]    last user message

[system]  jailbreak / PHI                      ← character post_history_instructions if override active
[user]    continue nudge / impersonation prompt  ← type-specific control prompts only
```

---

### Text completion equivalent

For text completion APIs (`textgenerationwebui`, `kobold`, `novel`), the same character card and WI data is assembled but collapsed into a **single string** via the context template (`story_string` in 5.4). The Handlebars-like template slots (`{{system}}`, `{{wiBefore}}`, `{{description}}`, `{{personality}}`, `{{scenario}}`, `{{wiAfter}}`, `{{persona}}`, etc.) are filled with the same resolved values from Steps 1–3. The instruct mode template then wraps each turn with input/output sequence tags (e.g. `[INST]...[/INST]`), inserts the system sequence at the top, and handles the last-output prefix for the model's generation start.

---

## 9. JanitorAI Structural Guidelines (JED Format & JS Scripts)

World-Forge supporta nativamente l'esportazione di profili per JanitorAI. A differenza di SillyTavern, JanitorAI si affida pesantemente al "Bot Profile" principale e non supporta un sistema di World Info/Lorebook nativo a più livelli. Per ovviare a questo e mantenere i profili leggeri, World-Forge adotta la seguente architettura per JanitorAI:

### 9.1 Il Profilo Principale (Bot Profile)
Il testo generato per il Bot Profile (che mappa su `templates/Janitor_Bot_Template.md`) deve rimanere estremamente snello. **È severamente vietato includere le sezioni Q&A (Question & Answer) o i segreti (SECRETS) nel corpo del profilo testuale.**
Il profilo testuale deve contenere solo le sezioni operative immediate: CHARACTER OVERVIEW, APPEARANCE DETAILS, STARTING OUTFIT, INVENTORY, ABILITIES, GENERAL SEXUAL INFO, GENERAL SPEECH INFO.

### 9.2 Il Javascript Modulare (`[WorldName]_JanitorAI_Script.js`)
Tutti gli elementi scartati dal Bot Profile testuale (come i Q&A, i segreti di back-story, le dinamiche di Lore specifiche per il singolo mondo) vengono consolidati in un unico script JavaScript. 
Questo script viene generato automaticamente in Phase 4 da `build_janitor.py`. Si occupa di iniettare contestualmente nella memoria del bot le risposte alle Q&A o rivelare i segreti solo quando il token o il contesto lo richiede.

### 9.3 Alternate Greetings e Initial Messages
World-Forge centralizza tutti i messaggi iniziali e gli "Alternate Greetings" (inclusi gli scenari di gruppo con Roster NPC) nel file canonico `Drafts/[WorldName]/Initial_Messages.md` (creato in Phase 2).
In fase di compilazione, `build_janitor.py` (così come `compile_cards.py` per ST) andrà ad attingere da questo "serbatoio" per popolare i molteplici slot di Initial Messages di JanitorAI.