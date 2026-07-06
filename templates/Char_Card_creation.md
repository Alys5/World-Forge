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

A card may declare a per-card override of the world's **perspective**, **tense**, and the **marker triplet** (narration / dialogue / emphasis) when structurally incompatible with the world default — typical cases: a Director/Narrator card alongside companion cards in a single-character-perspective world; a group chat where one card narrates in present tense and another in past; a card using em-dash dialogue convention while the world uses double quotes. Paragraph register remains world-coherent and is not per-card overridable.

**The override is declared exclusively through structured metadata at `extensions.world_forge.style_override`.** No `<style_override>` tag block appears in any card text field. The "no engine-level content in cards" rule applies in full — no in-text exception.

The metadata schema, runtime model, and canonical directive prose templates are in `agent_roles/SHARED_Style_Contract_Reference.md`. Specifically:
- **§1** documents the seven-key schema and the two valid metadata states (`null` for non-overriding cards; a populated object for overriding cards).
- **§2** documents how stock SillyTavern (ignores the field) and a `world_forge`-aware extension (reads `directives`, splices a synthesized `<style_override>` block after `</style_contract>` at runtime) consume the metadata.
- **§3** is the canonical prose template tables that the Architect uses to fill the `directives` array at compile time.

The split between **enum fields** and **`directives` array** is intentional. The enum fields exist for tooling (Editor validates, Refiner cross-checks). The `directives` array exists for runtime (extension splices verbatim, no lookup tables, no drift). The Architect populates both at compile time.

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

SANDBOX-MODE CARDS (worlds with `World Mode: sandbox` — no narrative arc):
- There are no arcs and no CHARACTER_STATE entries. Drop the arc-range qualifiers ("Arc 1–2 only:", etc.) — they have nothing to qualify against.
- The card carries the character's FULL standing range directly (the whole self, not an early-arc snapshot), and defers to the standing **SANDBOX_STATE** entry as the authoritative current register instead of CHARACTER_STATE.
- Everything else is identical: `{{original}}` on its own line, character-specific content only, no engine instructions. A sandbox World Director card still voices the NPC roster; its NPC profiles live in the lorebook (principal full profiles + roster compact stat blocks), not in the card.

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
    "creator_notes": "Any out-of-character notes, warnings, or tips for playing with this character. \\n\\nCreator Profile: https://janitorai.com/profiles/df1f0279-2607-4c9b-9b4e-ee02438d70a2_profile-of-lys-5",
    "system_prompt": "{{original}}\n\nMANDATORY. U-Shaped Memory Note: Anchors long-term static identity. Combined permanent token budget < 1,800. Character-specific content only. Identity across full arc journey. Character-specific behavioral mandates with arc-range qualifiers. Character-specific hard prohibitions with arc-range qualifiers. Character-specific trigger-response pairs. Explicit statement that active CHARACTER_STATE lorebook entry is authoritative current register. NO engine instructions — those come from the preset via {{original}}.",
    "post_history_instructions": "{{original}}\n\nMANDATORY. U-Shaped Memory Note: Sits at the end of context. Drives immediate turn-by-turn behavior. Max 150 words after {{original}}. Imperative tone. 2–3 drift-prone CHARACTER-SPECIFIC rules. Arc-agnostic or defer to active CHARACTER_STATE entry. NO engine instructions.",
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
    "creator": "Lys_5",
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

For cards that DO declare a per-card style override (typically a Director/Narrator card, a group chat with mixed-tense cards, or a card using a different dialogue convention), `extensions.world_forge.style_override` is populated as a seven-key object. Compact example (Director card overriding only perspective):

```json
"world_forge": {
  "style_override": {
    "perspective_override": "third_omniscient",
    "tense_override": null,
    "narration_marker_override": null,
    "dialogue_marker_override": null,
    "emphasis_marker_override": null,
    "directives": [
      "NARRATIVE PERSPECTIVE: Narrate in third-person omniscient past tense. {{char}} is the focal narrator for this turn — render the protagonists and NPCs as he/she/they; reference {{user}} by name or pronoun, never as \"you\" inside narration. The narrator may render any character's interior as the scene requires, may move freely between locations and points of view within a scene, and is not bound to any single character's knowledge state."
    ],
    "override_rationale": "One sentence stating the structural reason this card cannot use the world default. Stylistic preference is not sufficient."
  }
}
```

Allowed enum values for each axis, the directive line triggers, and the canonical prose templates: `agent_roles/SHARED_Style_Contract_Reference.md` §1 and §3. The Editor validates schema, enum values, and `directives`/enum consistency (Step 5.6).

The `world_forge` extensions namespace is the canonical declaration of per-card style overrides. SillyTavern itself ignores unknown extension keys (per `Notes_On_functionality.md` Section 5.6 V3 card notes), so on stock ST the metadata is inert at runtime. A `world_forge`-aware ST extension reads the metadata and synthesizes the runtime injection — that's the path that turns the metadata into actual model-visible directives.