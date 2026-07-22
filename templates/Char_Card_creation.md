I want you to create a character for a text-based roleplaying game.
Please fill out the following JSON template with the character's details.
Ensure the output is strictly valid JSON without any markdown formatting errors outside of the JSON block itself. Do not change the JSON keys, only fill in the values.

**ES6 SANDBOX SCRIPTING CONSTRAINTS**: If your phase involves evaluating, compiling, or interacting with JanitorAI JS logic, you MUST strictly respect the ES6 Sandbox limits:
- **Blocked**: `async`, `fetch`, `Promise`, `window`, `document`, `setTimeout`, and all external I/O.
- **Allowed**: String methods (`.includes`), Array methods (`.map`, `.filter`), Math, and Regex.
- **Editable context**: Only `context.character.personality` and `context.character.scenario` can be mutated.
- **Memory Scanning**: Always use `context.chat.last_messages.slice(-X)` for multi-message progression rather than just `last_message`.


Here is the character concept I want you to build:
[INSERT YOUR CHARACTER CONCEPT, GENRE, TONE, ARC JOURNEY, AND BEHAVIORAL REQUIREMENTS HERE]

FIELD GUIDANCE:

- description: Write in dense prose. Format the description using the exact sections below with explicit markdown headers:
  ### CHARACTER OVERVIEW (Describe the overall idea for your scenario here)
  ### PHYSICAL DESCRIPTION — BASELINE (Full Name, Alias, Race, Sex/Gender, Height, Age, Hair, Eyes, Body, Face, Features, Privates, Sensory Signature/Scent, Tattoos/Clan Branding, Posture/LSE Dynamics)
  ### STARTING OUTFIT (Head, Accessories, Makeup, Neck, Top, Bottom, Legs, Shoes, Underwear)
  ### ORIGIN (BACKSTORY) (Brief backstory)
  ### RESIDENCE (City, house, rooms, etc.)
  ### CONNECTIONS (Relatives, servants, etc.)
  ### INVENTORY (Items + Details)
  ### ABILITIES (Abilities + Details)
  ### PERSONALITY (Archetype, Personality Tags)
  ### [BEHAVIOR_NOTES]
  ### [SEXUALITY] (Sexual Orientation + Explanation, Role during sex + Explanation)

- character_book.entries: You will find newly added Q&A Lorebook entries in the JSON. You MUST fill these out with:
  1. The character's SECRET (Triggered by investigation/truth).
  2. The character's deep personality details (Archetype Reasoning, Alignment Ideals).
  3. Cognitive abilities, Social Skills, Main Aspirations, and Unique Traits.
  4. Other Sexual Notes.
  5. Premade Story Plan, Previously, and Notes.
  6. Synonyms and Speech Examples.
  7. SPECIES_DETAILS: If the character is a supernatural species, DO NOT put their full biology in the main description. You MUST fill out the corresponding condensed block (from the ⭐ SUPERNATURAL SPECIES TEMPLATES section below) and place it entirely in the Species_Details Lorebook entry.
  NO arc-specific content. NO timeline events. This is the permanent character substrate.

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
- Formatting rules (e.g., "use _asterisks_ for actions," "dialogue uses double quotes," "**double asterisks** for emphasis")
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
- **A Director / NPC-host card MUST carry a recognized director tag in `tags`** — one of `world-director` / `world director` / `npc-controller` / `npc controller` / `director` / `npc` (`contracts/WORLD_FORGE_SYNC.md` §2). SillyTavern's group-chat router and Scene Tracker classify the host card purely by tag membership, so without it the host silently loses NPC routing and its `<scene_state>` framing. Prefer `world-director` / `npc-controller`. This is the one case where `tags` is load-bearing rather than cosmetic UI filtering.
- **A Director / NPC-host card's style override directives use the Director-variant templates** (`agent_roles/SHARED_Style_Contract_Reference.md` §3a-D — "{{char}} is not a character in this scene"), never the character-shaped §3a rows. At runtime `{{char}}` resolves to the card's *name*; a "focal on {{char}}" directive on a Director turn reads "focal on [Director card name]" and makes literal-minded models treat the Director as a character in the scene. The world preset carries the matching `DIRECTOR-CARD RULE` line (SHARED §3d) for the same reason.

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
"description": "Comprehensive details formatted with explicit markdown headers: ### CHARACTER OVERVIEW, ### APPEARANCE DETAILS, ### STARTING OUTFIT, ### ORIGIN (BACKSTORY), ### RESIDENCE, ### CONNECTIONS, ### SECRET, ### INVENTORY, ### ABILITIES, ### PERSONALITY, ### [BEHAVIOR_NOTES], ### [SEXUALITY], ### [OTHER_SEXUAL_NOTES]. Include a ### SPECIES_DETAILS section only if the character is a supernatural entity; for these, you MUST fill out the corresponding block from the ⭐ SUPERNATURAL SPECIES TEMPLATES section below. Use dense prose. No arc-specific content.",
"personality": "A short, comma-separated list of core personality traits (e.g., stoic, intelligent, ruthless).",
"scenario": "The current setting, context, and the starting premise of the roleplay. Arc 1 entry point only.",
"first_mes": "The very first message the character sends to start the roleplay. Establish voice, atmosphere, and situation immediately. Written fully in character.",
"mes_example": "<START>\n{{user}}: [Example user dialogue — default mode]\n{{char}}: [Character response showing default defensive/surface behavior]\n<START>\n{{user}}: [Example that triggers the shield]\n{{char}}: [Character response showing shield activating]\n<START>\n{{user}}: [Example that reaches the crack — what bypasses the shield]\n{{char}}: [Character response showing the unguarded moment]",
"creator_notes": "Any out-of-character notes, warnings, or tips for playing with this character. \n\nCreator Profile: https://janitorai.com/profiles/df1f0279-2607-4c9b-9b4e-ee02438d70a2_profile-of-lys-5",
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
      "NARRATIVE PERSPECTIVE: Narrate in third-person omniscient present tense. {{char}} is the focal narrator for this turn — render the protagonists and NPCs as he/she/they; reference {{user}} by name or pronoun, never as \"you\" inside narration. The narrator may render any character's interior as the scene requires, may move freely between locations and points of view within a scene, and is not bound to any single character's knowledge state."
    ],
    "override_rationale": "One sentence stating the structural reason this card cannot use the world default. Stylistic preference is not sufficient."
  }
}
```

Allowed enum values for each axis, the directive line triggers, and the canonical prose templates: `agent_roles/SHARED_Style_Contract_Reference.md` §1 and §3. The Editor validates schema, enum values, and `directives`/enum consistency (Step 5.6).

The `world_forge` extensions namespace is the canonical declaration of per-card style overrides. SillyTavern itself ignores unknown extension keys (per `Notes_On_functionality.md` Section 5.6 V3 card notes), so on stock ST the metadata is inert at runtime. A `world_forge`-aware ST extension reads the metadata and synthesizes the runtime injection — that's the path that turns the metadata into actual model-visible directives.

---

# ⭐ SUPERNATURAL SPECIES TEMPLATES

If the character belongs to one of the following species, you must fill out its corresponding condensed parameter block and place it in the `Species_Details` entry inside `character_book.entries`. Do NOT put this block in the main `description`.

### Werewolf (Adheres to World-Forge LSE Guidelines)
```markdown
### PHYSICAL DESCRIPTION — BASELINE
Full Name, Alias: [Birth name, alias, pack-name, or lupine call-sign]
Race: Werewolf (Blood Classification: Divine Blood, Founding Bloodline, Pureblood, Common, or Modified)
Secondary Sex: [Alpha, Beta, Omega, Delta, Enigma, or Gamma (pre-presentation)]
Gender Identity: [Gender identity]
Height: [Human form (ft/in or cm), shifted height (hybrid form / full shift)]
Age: [Human age], transformation onset age, total years as turned
Hair: [Human head hair vs. body hair/fur integration (if any)]
Eyes: [Baseline color, shifted glow (color and intensity), pupil shift (slitted, round, void)]
Body: [Human form (lean, dense, scarred), wereform (muscle-bulked, digitigrade, broad-chested, clawed)]
Face: [Human form (jawline, expression), wereform (muzzle structure, snarl)]
Features: [Scars, tattoos, birthmarks, clan branding]
Privates: [Anatomy specifics, knotting physiology if Alpha/Enigma, secondary sex characteristics]
Sensory Signature/Scent: [Musk, wet fur, blood-iron, burnt sinew, forest rot, pheromone profile]
Appearance Trait: [Trait]
↳ Details: [Details]
↳ Effect: [Effect]

### STARTING OUTFIT
Style Guidelines: [General style]
Head: [Headwear/glasses]
Accessories: [Jewelry, pack-crest accessories]
Makeup: [Makeup]
Neck: [Neckwear]
Top: [Shirt/jacket, durable/tearaway if needed]
Bottom: [Pants/skirt]
Legs: [Hosiery/socks]
Shoes: [Footwear]
Underwear: [Underwear]

### INVENTORY
Item: [Item Name]
↳ Details: [Details]

### ABILITIES
Species Traits: [Werewolf capabilities: Partial shift, Hybrid shift, Full shift, healing factor, heightened senses]
Physiology: [Dual-heart rate system during shift, pain threshold (high), metabolism (elevated post-shift), blood anomaly]
Transformation: [Cycle-bound (full moon, trigger-based, rage-linked, voluntary), shift duration, partial-shift control]
Weapons: [Claws, teeth, brute force, pack coordination, howl-based coordination, blood-sense tracking]
Magic: [Rare (unless tied to curse or ancestral spirit), blood-binding, lunar rites, dream-scent projection]
Weaknesses: [Silver (burning, poisoning), wolfsbane (hallucinogenic or fatal), lunar paralysis (rare), blood frenzy, human guilt, memory bleed]

### [BEHAVIOR_NOTES]
- **Temperament**: [Territorial, loyalty-coded, emotionally volatile, highly protective, vengeance-prone]
- **Social Structure**: [Pack-based (alpha/beta/omega or anarchic), lone wolf (exiled or estranged), bloodline hierarchy, challenge-claim dominance law]
- **Beliefs**: [Moon as judge, blood memory, sacred kill rites, bone shrines, howl-legacies]
- **Cultural Traits**: [Oaths sealed in blood, scars as status, challenge duels, scent-based mourning, mate-claiming via ritual kill]
- **Taboos**: [Killing pack, rejecting shift, refusing a blood challenge, feeding on kin]
- **Triggers**: [Silver scent, full moon proximity, loss of control, prey resistance, betrayal scent]
- **Preferences**: [Deep woods, silence, heartbeat rhythms, night air, bone dens]
- **Dietary Preference**: [Carnivorous focus, raw-preference, bone marrow craving, ritual hunts]
```

### Vampire
```markdown
### PHYSICAL DESCRIPTION — BASELINE
Full Name, Alias: [True name, current alias, or bloodline title]
Race: Vampire (Subtype: nosferatu, noble-born, thrall-forged, revenant, feral, daywalker)
Sex/Gender: [Biological sex / Gender identity]
Height: [in ft/in or cm]
Age: [Turned age], apparent age, total lifespan (immortal or degeneration-prone)
Hair: [Death-preserved or modern-altered, color (original vs. glamoured)]
Eyes: [Color (red, gold, black, void, blood-haloed), vision (low-light adapted, motion-predictive)]
Body/Build: [Emaciated, statuesque, predatory lean, corpse-thickened, or aesthetically preserved]
Skin: [Cold, pale, bloodless, ash-gray, moonlit, or marble-smooth]
Fangs: [Retractable or permanent, upper/lower, venomous (optional)]
Nails: [Clawlike, lacquered, grow under stress]
Movement: [Elegant, stuttering speed, still as stone when observing, predatory grace]
Voice: [Low resonance, mesmer-glide, echoes of accent from turning era, oath-woven commands]
Speech: [Antiquated or sharpened modern diction, seductive or surgical]
Sensory Signature/Scent: [Iron, rosewater, old blood, crypt-damp, incense, perfume masking death]

### ABILITIES
Physiology: [Circulatory (dead or minimal), respiration (optional), thermoregulation (absent), blood dependence, wound healing, digestive system]
Senses: [Acute hearing (heartbeat detection), smell (blood type, pheromone shifts), vision (low light, aura perception)]
Weapons: [Fangs, claws, mesmerism, blood-manipulation, shadowmeld, blade mastery]
Magic: [Glamour, shadowstep, blood-calling, necromancy, stormcraft, mirror-passing]
Limitations: [Sunlight (sensitivity scale), religious symbols, invitation rules, running water, fire]
Weaknesses: [Sunlight, iron, religious symbols, starvation hallucinations, obsessive fixations, compulsions]

### [BEHAVIOR_NOTES]
- **Temperament**: [Detached, obsessive, strategic, mournful, wrathful under provocation]
- **Social Structure**: [Solitary predator, coven/court-bound, bloodline-fealty, masquerade enforcer, feral rogue]
- **Beliefs**: [Blood as sacrament, death as transformation, memory as inheritance, time as a weapon]
- **Cultural Traits**: [Turning rituals, blood-oath fealty, coffin-burial cycles, mirror-truth trials, feeding etiquette, name-binding law]
- **Taboos**: [Feeding on kin, public transformation, turning without permission, reflection denial]
- **Triggers**: [Heartbeat of a former life, scent of betrayal, broken oath, scent of fear or defiance]
- **Preferences**: [Dusklight, old architecture, stillness, unspoken rooms, silk-lined enclosures, blood served warm]
- **Dietary Preference**: [Human blood, animal fallback, psychic/emotional draining, artificial plasma]
```