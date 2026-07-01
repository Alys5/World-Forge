I want you to create a character profile formatted for JanitorAI using the JED (Just Enough Definitions) template structure.
Please map the fields from the World-Forge character card draft into the following Markdown template.
Ensure the output is strictly valid Markdown. Do not change the headings unless necessary, only fill in the values based on the drafted `Card_[Name].md`.

FIELD GUIDANCE:
- Use the Draft's `description` to fill the Appearance and Personality sections.
- Use the Draft's `scenario` and `first_mes` to inform the PRESCENARIO and PREVIOUSLY sections.
- The `system_prompt` and `post_history_instructions` behavioral rules should be distilled into the [BEHAVIOR_NOTES] section.
- **MULTI-BOT / ROSTER CARDS**: If the drafted card represents a Sandbox Director, system narrator, or a roster of multiple characters, do NOT output a single generic character block. Instead, duplicate the entire `<Name> ... </Name>` block (replacing `{{char}}` with the specific character's name) for EACH character in the roster, filling out their individual details.

Please fill out this exact JanitorAI Bot Template (JED):

```markdown
# [SETTING]
- Time/Period: 
- World Details: 

## LORE
<!-- Extract Tier 1 world rules relevant to this character -->

## SCENARIO OVERVIEW
<!-- Extract the scenario from the card -->

- - -

<{{char}}>

# [{{char}}]

## CHARACTER OVERVIEW
<!-- Short summary of the character -->

- - -

## [APPEARANCE]

### APPEARANCE DETAILS
- Full Name, Alias: 
- Race: 
- Sex/Gender: 
- Height: 
- Age: 
- Hair: 
- Eyes: 
- Body: 
- Face: 
- Features: 
- Privates: 

### STARTING OUTFIT
- Head: 
- Accessories: 
- Top: 
- Bottom: 
- Shoes: 
- Underwear: 

- - -

## [BASIC_INFO]

### ORIGIN (BACKSTORY)
<!-- Briefly extract backstory from the description -->

### ABILITIES
- Ability: 
  ↳ Details: 

- - -

## [PERSONALITY_AND_TRAITS]

### PERSONALITY
- Archetype: 
- Alignment: 
- Personality Tags: <!-- Comma-separated list of traits -->

- Main Aspiration: 
  ↳ Aspiration Details: 

- - -

## [BEHAVIOR_NOTES]
<!-- Extract the core mandates from the system_prompt and post_history_instructions -->
- 
- 
- 

- - -

## [SPEECH]

### GENERAL SPEECH INFO
- Style: 

## Speech EXAMPLES AND OPINIONS
<speech_examples>
<!-- Extract dialogue examples from mes_example if present -->
- 
</speech_examples>

</{{char}}>

- - -

## [PRESCENARIO]

## PREVIOUSLY
<!-- Context leading up to the first message -->
```
