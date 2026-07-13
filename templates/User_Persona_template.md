# {{user}} PERSONA — Alyssa [Family Name]

**ES6 SANDBOX SCRIPTING CONSTRAINTS**: If your phase involves evaluating, compiling, or interacting with JanitorAI JS logic, you MUST strictly respect the ES6 Sandbox limits:
- **Blocked**: `async`, `fetch`, `Promise`, `window`, `document`, `setTimeout`, and all external I/O.
- **Allowed**: String methods (`.includes`), Array methods (`.map`, `.filter`), Math, and Regex.
- **Editable context**: Only `context.character.personality` and `context.character.scenario` can be mutated.
- **Memory Scanning**: Always use `context.chat.last_messages.slice(-X)` for multi-message progression rather than just `last_message`.


## PERSONA DESCRIPTION

_Paste the block below — between the BEGIN and END markers — into:
SillyTavern → User Settings → Persona Management → [your persona] → Description.
This text is injected as a system message every turn while this persona is active. Keep it tight._[cite: 2]

--- BEGIN PERSONA DESCRIPTION ---

Alyssa [Family Name] is the sheltered, hyper-protected youngest sibling of the [Family Name] dynasty. To the world, she appears as a perfectly innocent, naive [Student/Apprentice/Noble] at [Institution/Location] who relies entirely on her family's militarized protection.

Species Traits: [Insert max 15 words if playing a supernatural species, e.g., "Vampire. Harmed by sunlight. Needs blood." Remove if human. DO NOT paste full biology here.]

Physical: Petite, delicate hourglass frame (165cm), caramel chestnut hair, and expressive mint-green doe eyes. She possesses an expressive empathy and a natural soothing presence that instinctively pacifies aggression in dominant individuals.

Hidden Layer: She leads a high-stakes double life, secretly working as a highly sought-after [Artist/Performer/Model/Bard] under the alias '[Alias]'. She balances her exhaustive studies in [Field of Study] with this hidden life, meticulously hiding her public exposure from her family.

--- END PERSONA DESCRIPTION ---

---

## EXTENDED DETAILS & LORE (Preserved for Reference & Tier 2 Lorebook)[cite: 2]

<{{user}}>

### CHARACTER OVERVIEW

{{CHARACTER_OVERVIEW}}

### APPEARANCE DETAILS

- Full Name, Alias: {{APPEARANCE_FULL_NAME}}
- Race/Species: {{APPEARANCE_RACE}}
- Species Traits: {{SPECIES_SUMMARY_SHORT}} <!-- e.g. "Vampire. Harmed by sunlight. Needs blood." Keep it under 15 words. Remove if human. -->
- Sex/Gender: {{APPEARANCE_SEX}}
- Height: {{APPEARANCE_HEIGHT}}
- Age/Birthday: {{APPEARANCE_AGE}}
- Hair: {{APPEARANCE_HAIR}}
- Eyes: {{APPEARANCE_EYES}}
- Body: {{APPEARANCE_BODY}}
- Face: {{APPEARANCE_FACE}}
- Features: {{APPEARANCE_FEATURES}}
- Privates: {{APPEARANCE_PRIVATES}}

- Appearance Trait: {{APPEARANCE_TRAIT_1}}
  ↳ Details: {{APPEARANCE_TRAIT_1_DETAILS}}
  ↳ Effect: {{APPEARANCE_TRAIT_1_EFFECT}}
- Appearance Trait: {{APPEARANCE_TRAIT_2}}
  ↳ Details: {{APPEARANCE_TRAIT_2_DETAILS}}
  ↳ Effect: {{APPEARANCE_TRAIT_2_EFFECT}}

### STARTING OUTFIT

- Head: {{OUTFIT_HEAD}}
- Accessories: {{OUTFIT_ACCESSORIES}}
- Makeup: {{OUTFIT_MAKEUP}}
- Neck: {{OUTFIT_NECK}}
- Top: {{OUTFIT_TOP}}
- Bottom: {{OUTFIT_BOTTOM}}
- Legs: {{OUTFIT_LEGS}}
- Shoes: {{OUTFIT_SHOES}}
- Underwear: {{OUTFIT_UNDERWEAR}}

<Q&A>
Q: How does {{user}} rate their own attractiveness?
A: {{QA_ATTRACTIVENESS}}
</Q&A>

### ORIGIN (BACKSTORY)

{{ORIGIN_BACKSTORY}}

### RESIDENCE

{{RESIDENCE}}

### CONNECTIONS

{{CONNECTIONS}}

### SECRET

{{SECRETS}}

<Q&A>
Q: What does {{user}} do first? Think or act/talk?
A: {{QA_FIRST_ACTION}}

Q: What does {{user}} do in free time?
A: {{QA_FREE_TIME}}

Q: What is {{user}}'s most favorite thing?
A: {{QA_FAVORITES}}

Q: What is {{user}}'s most hated thing?
A: {{QA_HATED}}

Q: What is {{user}} incredibly good with?
A: {{QA_GOOD_WITH}}

Q: What is {{user}} awfully bad with?
A: {{QA_BAD_WITH}}

Q: How {{user}} behaves with others?
A: {{QA_BEHAVIOR_OTHERS}}

Q: Is {{user}} a likable character? What reputation {{user}} has?
A: {{QA_REPUTATION}}

Q: Is {{user}} tolerant towards other people or groups?
A: {{QA_TOLERANCE}}

Q: Can {{user}} harm others throughout the story?
A: {{QA_HARM_OTHERS}}

Q: How does {{user}} behave with someone of a higher hierarchy or power? Will they bite the hand that feeds or drop down trembling on their knees?
A: {{QA_HIERARCHY_BEHAVIOR}}
</Q&A>

### INVENTORY

- Item: {{INVENTORY_ITEM_1}}
  ↳ Details: {{INVENTORY_ITEM_1_DETAILS}}
- Item: {{INVENTORY_ITEM_2}}
  ↳ Details: {{INVENTORY_ITEM_2_DETAILS}}
- Item: {{INVENTORY_ITEM_3}}
  ↳ Details: {{INVENTORY_ITEM_3_DETAILS}}

### ABILITIES

- Ability: {{ABILITY_1}}
  ↳ Details: {{ABILITY_1_DETAILS}}
- Ability: {{ABILITY_2}}
  ↳ Details: {{ABILITY_2_DETAILS}}

### PERSONALITY

- Archetype: {{PERSONALITY_ARCHETYPE}}
  ↳ Archetype Details: {{PERSONALITY_ARCHETYPE_DETAILS}}
  ↳ Reasoning: {{PERSONALITY_ARCHETYPE_REASONING}}
- Alignment: {{PERSONALITY_ALIGNMENT}}
  ↳ Alignment Details: {{PERSONALITY_ALIGNMENT_DETAILS}}
  ↳ Ideals: {{PERSONALITY_IDEALS}}

- Personality Tags: {{PERSONALITY_TAGS}}

- Cognitive Abilities: {{PERSONALITY_COGNITIVE}}
- Social Skills and Integration Into Society: {{PERSONALITY_SOCIAL}}

- Main Aspiration: {{PERSONALITY_ASPIRATION}}
  ↳ Aspiration Details: {{PERSONALITY_ASPIRATION_DETAILS}}
  ↳ Aspiration Goals: {{PERSONALITY_ASPIRATION_GOALS}}
- Unique Trait: {{PERSONALITY_UNIQUE_TRAIT}}
  ↳ Effects: {{PERSONALITY_UNIQUE_TRAIT_EFFECTS}}

### [BEHAVIOR_NOTES]

{{BEHAVIOR_NOTES}}

### [SEXUALITY]

[IMPORTANT NOTE FOR AI: Heed carefully to this section during sexual encounters. Make sure {{user}} sticks to their sexual role and orientation during the story.]

#### GENERAL SEXUAL INFO

- Sexual Orientation: {{SEXUAL_ORIENTATION}}
  ↳ Explanation: {{SEXUAL_ORIENTATION_EXPLANATION}}
- Role during sex: {{SEXUAL_ROLE}}
  ↳ Explanation: {{SEXUAL_ROLE_EXPLANATION}}

<Q&A>
Q: Is {{user}} a virgin?
A: {{QA_VIRGIN}}

Q: What does {{user}} think about sex in general?
A: {{QA_SEX_THOUGHTS}}

Q: Does {{user}} talk dirty and swear?
A: {{QA_DIRTY_TALK}}

Q: Is {{user}} loyal to their partner?
A: {{QA_LOYALTY}}

Q: Can {{user}} flirt BEFORE others decide to flirt?
A: {{QA_FLIRT}}
</Q&A>

### [OTHER_SEXUAL_NOTES]

- Turn Ons: {{SEXUAL_TURN_ONS}}
- Turn Offs: {{SEXUAL_TURN_OFFS}}
- Aftercare: {{SEXUAL_AFTERCARE}}

#### Anatomy

{{SEXUAL_ANATOMY}}

#### BIOLOGY & INTIMATE DYNAMICS

{{SEXUAL_BIOLOGY}}

### GENERAL SPEECH INFO

- Style: {{SPEECH_STYLE}}
- Quirks: {{SPEECH_QUIRKS}}
- Ticks: {{SPEECH_TICKS}}

### Speech EXAMPLES AND OPINIONS

[IMPORTANT NOTE FOR AI: This section provides speech examples, memories, thoughts, and real opinions on subjects. AI must avoid using them verbatim in chat and use them only for reference.]

<speech_examples>

{{SPEECH_EXAMPLES}}

  </speech_examples>

### SYNONYMS

[IMPORTANT NOTE FOR AI: This section lists synonymous phrases to substitute the character's name or pronouns to avoid repetition.]

{{SYNONYMS}}

</{{user}}>

SETUP INSTRUCTIONS

1. In SillyTavern, open **User Settings → Persona Management** and create (or select) the persona you will use for this world.[cite: 2]
2. Set the persona name to: `Alyssa [Family Name]`.[cite: 2]
3. Copy the text between `--- BEGIN PERSONA DESCRIPTION ---` and `--- END PERSONA DESCRIPTION ---` above and paste it into the persona's **Description** field.[cite: 2]
4. In the same persona editor, find the **Lorebook** field and link `[WorldName]_Alyssa_Lorebook.json` (the Tier 2 protagonist lorebook produced by the pipeline).[cite: 2]
5. Activate this persona before starting the chat. The Persona Description is the always-on baseline; the linked lorebook fires on trigger keywords for fuller detail.[cite: 2]
