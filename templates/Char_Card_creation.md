I want you to create a character for a text-based roleplaying game.
Please fill out the following JSON template with the character's details.
Ensure the output is strictly valid JSON without any markdown formatting errors outside of the JSON block itself. Do not change the JSON keys, only fill in the values.

Here is the character concept I want you to build:
[INSERT YOUR CHARACTER CONCEPT, GENRE, TONE, ARC JOURNEY, AND BEHAVIORAL REQUIREMENTS HERE]

FIELD GUIDANCE:

- description: Write in dense prose. Structure: (1) physical appearance in anatomical order — face/lips, hair, eyes, chest if applicable, body/waist/hips/legs, intimate areas if applicable, movement/posture, sensory signature; (2) voice and manner; (3) psychological core shown through behavior not stated as traits; (4) the shield and how it manifests; (5) intimacy profile if applicable. NO arc-specific content. NO timeline events. This is the permanent character substrate.

---

⭐ THE SYSTEM_PROMPT / POST_HISTORY_INSTRUCTIONS DIVISION OF LABOR — READ BEFORE WRITING

The character card's `system_prompt` and `post_history_instructions` fields override the SillyTavern Chat Completion Preset's Main Prompt block and Jailbreak block respectively (when the user has "Prefer Char. Prompt" and "Prefer Char. Instructions" enabled). This means:

- The preset's Main Prompt (engine-level instructions: prose style, narration discipline, perspective rules, formatting rules, creative framework) is REPLACED by the card's `system_prompt` — UNLESS the card uses the `{{original}}` macro.
- `{{original}}` splices the preset's content back into the card's content at the point where `{{original}}` appears.

THE DIVISION:
- The PRESET MAIN PROMPT contains world-agnostic, character-agnostic engine instructions: how to write prose, how to handle perspective, how to format output, what kind of fictional collaboration this is. These would apply to any character in any world.
- The CARD `system_prompt` contains character-specific identity and behavior: who this character is, their full arc journey, their behavioral mandates, their hard prohibitions, their trigger-response pairs. These apply only to this character.

THE MANDATE:
- Every card's `system_prompt` MUST begin with `{{original}}` followed by a newline. This preserves the preset's engine instructions before the character-specific content.
- Every card's `post_history_instructions` MUST begin with `{{original}}` followed by a newline. This preserves the preset's jailbreak/PHI content before the character-specific drift reminders.

WHAT MUST NOT APPEAR IN THE CARD'S system_prompt OR post_history_instructions:
- Narration rules (e.g., "show don't tell," "step-by-step pacing," "proactive writing")
- Formatting rules (e.g., "use *asterisks* for actions," "dialogue uses double quotes," "**double asterisks** for emphasis")
- Style guidelines (e.g., "vary your vocabulary," "match the tone")
- Perspective rules (e.g., "do not act for {{user}}," "{{user}} controls their own character")
- Creative framework statements (e.g., "this is a fictional collaboration")
- Character embodiment principles in their generic form (e.g., "embody the character authentically")

These all live in the preset Main Prompt and are spliced in via `{{original}}`. Duplicating them in the card produces redundant guidance that wastes tokens and can produce subtle conflicts when the preset is updated independently of the cards.

⭐ STYLE OVERRIDE — METADATA ONLY

A card may declare a per-card override of the world's perspective and narration marker (and ONLY those two engine concerns) when it is structurally incompatible with the world default — typically a Director/Narrator card sitting alongside companion cards in a single-character-perspective world.

**The override is declared exclusively through structured metadata at `extensions.world_forge.style_override`.** No `<style_override>` tag block appears in the card's `system_prompt`, `post_history_instructions`, or `depth_prompt` content. The "no engine-level content in cards" rule applies in full to all card text fields — there is no in-text exception.

How the override fires at runtime:

- **Stock SillyTavern**: ignores `extensions.world_forge.style_override` (it's an unknown extension key, tolerated per `Notes_On_functionality.md` Section 5.6 V3 card notes). The world `<style_contract>` block in the preset's Main Prompt governs every turn for every card. The override is inert.
- **`world_forge`-aware extension** (e.g., a SillyTavern extension that consumes the `world_forge` namespace): reads the metadata at runtime, synthesizes an `<style_override>` directive from the `perspective_override` and `narration_marker_override` fields, and splices it into the assembled main system prompt immediately after `</style_contract>` for the active card's turns. Per the active-speaker rule in the preset's `<style_contract>`, the directives in the synthesized override replace the corresponding directives in the world contract for that card's turns; directives the override does not include continue to follow the world contract.

The metadata field has two valid states:

- **Non-overriding card (the vast majority)**: `extensions.world_forge.style_override` is `null` (or the field is absent — both are equivalent).
- **Overriding card**: `extensions.world_forge.style_override` is an object with three keys: `perspective_override`, `narration_marker_override`, `override_rationale`. At least one of the two override fields must be a non-null enum value (the other may be `null` to inherit the world default). The rationale must be non-empty and structural — vague or stylistic rationales like "feels better" or "preferred style" are hard-failed by the Editor.

WHAT BELONGS IN THE CARD's system_prompt:
- Identity statement covering the character's FULL arc journey (not just starting state)
- Behavioral mandates SPECIFIC to this character, with arc-range qualifiers where they don't apply universally (use "Arc 1–2 only:", "All arcs:", "Arc 3+:")
- Hard prohibitions SPECIFIC to this character, with arc-range qualifiers
- Trigger-response pairs SPECIFIC to this character (If X happens → this character responds with Y)
- Explicit statement that the active CHARACTER_STATE lorebook entry is authoritative for current behavioral register and overrides card defaults

WHAT BELONGS IN THE CARD's post_history_instructions:
- Maximum 150 words AFTER `{{original}}` (not counting the macro itself)
- Imperative tone throughout — commands, not descriptions
- The 2–3 character-specific behavioral rules most likely to drift in long sessions
- Arc-agnostic OR explicit deferral to the active CHARACTER_STATE entry as authority
- Never hardcode early-arc behaviors as permanent

---

- system_prompt: MANDATORY — never leave empty. Must begin with `{{original}}` on its own line. After `{{original}}`, write character-specific content per "WHAT BELONGS IN THE CARD's system_prompt" above. Do not include any engine-level instructions — those come from the preset via `{{original}}`.

- post_history_instructions: MANDATORY — never leave empty. Must begin with `{{original}}` on its own line. Maximum 150 words after the macro. Imperative tone. Restate this character's most drift-prone behaviors. Must be arc-agnostic OR explicitly defer to the active CHARACTER_STATE lorebook entry.

- extensions.depth_prompt: Leave prompt empty ("") if not needed. When populated, this injects a behavioral anchor at the specified depth in chat history — useful for characters with complex arc-dependent behavior or strong prose style requirements. depth: 4 is the standard. role: "system". Like the other override fields, this is character-specific only — do not include engine instructions here.

Please fill out this exact SillyTavern V3 Character Card JSON structure:

{
  "spec": "chara_card_v3",
  "spec_version": "3.0",
  "data": {
    "name": "Character Name",
    "description": "Comprehensive details about the character. Physical appearance in anatomical order (face/lips, hair, eyes, chest if applicable, body, intimate areas if applicable, movement/posture, sensory signature), then voice and manner, then psychological core shown through behavior, then the shield and what triggers it, then intimacy profile if applicable. No arc-specific content.",
    "personality": "A short, comma-separated list of core personality traits (e.g., stoic, intelligent, ruthless).",
    "scenario": "The current setting, context, and the starting premise of the roleplay. Arc 1 entry point only.",
    "first_mes": "The very first message the character sends to start the roleplay. Establish voice, atmosphere, and situation immediately. Written fully in character.",
    "mes_example": "<START>\n{{user}}: [Example user dialogue — default mode]\n{{char}}: [Character response showing default defensive/surface behavior]\n<START>\n{{user}}: [Example that triggers the shield]\n{{char}}: [Character response showing shield activating]\n<START>\n{{user}}: [Example that reaches the crack — what bypasses the shield]\n{{char}}: [Character response showing the unguarded moment]",
    "creator_notes": "Any out-of-character notes, warnings, or tips for playing with this character.",
    "system_prompt": "{{original}}\n\nMANDATORY. Character-specific content only. Identity across full arc journey. Character-specific behavioral mandates with arc-range qualifiers. Character-specific hard prohibitions with arc-range qualifiers. Character-specific trigger-response pairs. Explicit statement that active CHARACTER_STATE lorebook entry is authoritative current register. NO engine instructions — those come from the preset via {{original}}.",
    "post_history_instructions": "{{original}}\n\nMANDATORY. Max 150 words after {{original}}. Imperative tone. 2–3 drift-prone CHARACTER-SPECIFIC rules. Arc-agnostic or defer to active CHARACTER_STATE entry. NO engine instructions.",
    "alternate_greetings": [
      "A completely different opening message for an alternate scenario.",
      "Another alternative opening message."
    ],
    "character_book": {
      "extensions": {},
      "entries": []
    },
    "tags": [
      "tag1",
      "tag2",
      "tag3"
    ],
    "creator": "Your Name/Alias",
    "character_version": "1.0",
    "extensions": {
      "depth_prompt": {
        "prompt": "",
        "depth": 4,
        "role": "system"
      },
      "world_forge": {
        "style_override": null
      }
    }
  }
}

For cards that DO declare a per-card style override (the rare case — typically a Director/Narrator card alongside companion cards), `extensions.world_forge.style_override` is populated as follows:

```json
"world_forge": {
  "style_override": {
    "perspective_override": "third_omniscient",
    "narration_marker_override": "asterisks_for_narration",
    "override_rationale": "One sentence stating the structural reason this card cannot use the world default. Stylistic preference is not sufficient."
  }
}
```

Allowed `perspective_override` values: `first`, `second`, `third_limited`, `third_omniscient`. Allowed `narration_marker_override` values: `asterisks_for_narration`, `asterisks_for_thoughts_only`, `plain_prose`. Setting either to `null` while the other is set means "override only this one field; inherit the world default for the other". The Editor validates the structured fields directly (see Editor Step 5.6).

The `world_forge` extensions namespace is the canonical declaration of per-card style overrides. SillyTavern itself ignores unknown extension keys (per `Notes_On_functionality.md` Section 5.6 V3 card notes), so on stock ST the metadata is inert at runtime. A `world_forge`-aware ST extension reads the metadata and synthesizes the runtime injection — that's the path that turns the metadata into actual model-visible directives.