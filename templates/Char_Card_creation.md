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
[NAME: (birth name, alias);  
SPECIES: werewolf;  
BLOOD_CLASS: (Divine, Founding, Pureblood, Common, Modified);  
ABO_DYNAMICS: secondary sex(Enigma, Alpha, Delta, Beta, Omega, Gamma), subgender(Dominant/Submissive if applicable);  
AGE: (human age), presentation age(typically 13);  
HEIGHT: human form(ft/in or cm), hybrid form(larger, bipedal);  
BUILD: human form(lean, dense, scarred), hybrid form(muscle-bulked, digitigrade);  
SKIN/FUR: human form(standard), hybrid/full form(fur coverage, color: ash, black, russet, silver);  
EYES: baseline color, shifted glow(color and intensity);  
SHIFT_CLASSES: Partial(ears/tail/eyes/claws for social cues/intimidation), Hybrid(Species True Form: bipedal, furred, max strength, used for combat/ceremony), Full(quadrupedal wolf, used for pursuit/formations);  
SCENT: base scent, ABO pheromones(Alpha: aggressive/oppressive, Omega: floral/soothing, Beta: subdued, etc.), stress shifts;  
PHYSIOLOGY: hyper-acute senses, extreme regeneration, ABO specifics(knotting for Alphas, heat cycles for Omegas, rut for Alphas);  
COMMAND: (Enigma: absolute command, Alpha: dictates Betas/Omegas, Delta: immune to non-Enigma commands but cannot command);  
DIET: carnivorous focus, raw-preference;  
CLOTHING: durable, tearaway, pack-crest accessories;  
WEAPONS: claws, teeth, brute force, pack coordination;  
TEMPERAMENT: influenced by ABO (e.g. territorial Alphas, strategic Deltas, empathetic Omegas, stabilizing Betas);  
SOCIAL STRUCTURE: Pack hierarchy, role matches skills, lone wolf(exiled);  
BELIEFS: Faith of Fenris(optional), Firstborn legends;  
TABOOS: rejecting shift, defying legitimate Command, harming pups;  
WEAKNESSES: silver(burning, poisoning), wolfsbane, feral insticts under extreme stress]

### Vampire
[NAME: (true name, current alias, or bloodline title);  
SPECIES: vampire(subtype: nosferatu, noble-born, thrall-forged, revenant, feral, daywalker);  
SEX: (biological sex);  
GENDER: (gender identity);  
AGE: (turned age), apparent age, total lifespan(immortal or degeneration-prone);  
HEIGHT: (in ft/in or cm);  
BUILD: emaciated, statuesque, predatory lean, corpse-thickened, or aesthetically preserved;  
SKIN: cold, pale, bloodless, ash-gray, moonlit, or marble-smooth;  
EYES: color(red, gold, black, void, blood-haloed), vision(low-light adapted, motion-predictive);  
HAIR: death-preserved or modern-altered, color(original vs. glamoured);  
FANGS: retractable or permanent, upper/lower, venomous(optional);  
NAILS: clawlike, lacquered, grow under stress;  
MOVEMENT: elegant, stuttering speed, still as stone when observing, predatory grace;  
SCENT: iron, rosewater, old blood, crypt-damp, incense, perfume masking death;  
VOICE: low resonance, mesmer-glide, echoes of accent from turning era, oath-woven commands;  
SPEECH: antiquated or sharpened modern diction, seductive or surgical;  
PHYSIOLOGY: circulatory(dead or minimal), respiration(optional, mimicked), thermoregulation(absent), blood dependence(required volume, interval), wound healing(rapid, slows under starvation), digestive system(blood only or optional solids);  
SENSES: acute hearing(heartbeat detection), smell(blood type, pheromone shifts), vision(low light, aura perception);  
LIMITATIONS: sunlight(sensitivity scale: burn, slow-death, blindness, none), religious symbols(if cursed variant), invitation rules(optional), running water, fire;  
DIET: human blood, animal fallback (efficacy varies), psychic/emotional draining (succubus-like variants), artificial plasma (modern transhuman variants);  
CLOTHING: era-tethered formality, tailored suits, shrouds, armor of bone or silk, functional glamours;  
WEAPONS: fangs, claws, mesmerism, blood-manipulation, shadowmeld, blade mastery;  
MAGIC: glamour, shadowstep, blood-calling, necromancy, stormcraft, mirror-passing;  
TEMPERAMENT: detached, obsessive, strategic, mournful, wrathful under provocation;  
SOCIAL STRUCTURE: solitary predator, coven/court-bound, bloodline-fealty, masquerade enforcer, feral rogue;  
BELIEFS: blood as sacrament, death as transformation, memory as inheritance, time as a weapon;  
CULTURAL TRAITS: turning rituals, blood-oath fealty, coffin-burial cycles, mirror-truth trials, feeding etiquette, name-binding law;  
TABOOS: feeding on kin, public transformation, turning without permission, reflection denial;  
TRIGGERS: heartbeat of a former life, scent of betrayal, broken oath, scent of fear or defiance;  
PREFERENCES: dusklight, old architecture, stillness, unspoken rooms, silk-lined enclosures, blood served warm;  
WEAKNESSES: sunlight, iron (optional folkloric), religious symbols (if faith-bonded), starvation hallucinations, obsessive fixations, compulsions]

### Naga
[NAME: (full name);  
SPECIES: naga(nagi, serpent-folk, lamia variant);  
SEX: (biological sex);  
GENDER: (gender identity);  
AGE: (years, or equivalent if lifespan differs);  
HEIGHT: (overall length), torso height(human-equivalent portion);  
WEIGHT: (optional);  
BODY TYPE: upper(humanoid, muscular/slender/etc.), lower(serpentine, species: python/cobra/viper/etc.);  
SCALE COLOR: (primary), markings(stripes, patterns, underbelly);  
EYE COLOR: (slit-pupiled, color), eyelids(nictitating membrane, no lashes);  
SKIN (HUMANOID PORTION): (texture, tone, optional markings);  
LIMBS: arms(two), legs(none), tail(prehensile, dominant in locomotion);  
MOVEMENT: locomotion(slithering, vertical coil elevation), speed(burst vs. endurance), terrain(preferred terrain types);  
VOICE: sibilant, resonance(human-like, echoing, inhuman timbre);  
LANGUAGES: (spoken languages), species dialect(hissing, pheromone-laced, tongue-clicks);  
SENSES: vision(daylight, infrared/night vision), smell(Jacobson’s organ), heat detection(pit organs), touch scales(sensitive or armored);  
DIET: (carnivorous, blood-fed, egg-based, etc.), feeding(method: constriction, venom, fang-injection);  
ANATOMY NOTES: lungs(bi-lobed), heart(cold-blooded/variant), bones(flexible spine), genitalia(retractable hemipenes/cloacae/etc.);  
CLOTHING: upper(greaves, armor, draping cloth), lower(none, scale adornments);  
WEAPONS: fangs(venomous?), tail(strike force), hands(grappling, armed or clawed);  
MAGIC: (optional, if innate), resistance(cold/hypnosis/etc.);  
PSYCHOLOGY: temperament(cold-blooded, calculating/emotive?), territoriality(level), mating behavior(courtship rites, seasonal urges);  
SOCIAL STRUCTURE: solitary/tribal/clan-based/cultist, role within (title/status);  
BELIEFS: (serpent deity, reincarnation, domination-based hierarchy);  
CULTURAL TRAITS: communication(non-verbal cues: tongue-flicking, tail-thumps), taboos(interbreeding, eye contact, etc.);  
SCENT: musk, scale oil, (optional pheromone);  
TRIGGERS: (optional—touch aversion, sudden cold, disrespect rituals);  
PREFERENCES: habitat(underground, rainforest, desert), aesthetic(jewelry, hoards, silk, bones);  
WEAKNESSES: temperature sensitivity, limb-based combat, social distrust]

### Succubus
[NAME: (true name, summoned alias, title);  
SPECIES: succubus(subtype: dream-feeder, pact-bound, carnal warden, parasitic shadow, courtless);  
SEX: (biological sex, default or fluid);  
GENDER: (gender identity, may shift or mask);  
AGE: (chronological), time since emergence(summoning, awakening, exile);  
HEIGHT: (variable or fixed—note if illusioned);  
BUILD: tailored to target (hourglass, serpentine, androgynous, exaggerated), latent form(bone-thin, horned, winged, monstrous);  
SKIN: hue(flushed, violet, gray, black-red), texture(slick, silken, scaled, burning cold), pheromone-active?;  
EYES: luminous(color: amber, void-black, glowing rose), pupil shape(serpentine, absent, haloed), gaze effects(hypnosis, compulsion);  
HAIR: shadow-thick, sin-colored, flame-slick, illusion-tendrils;  
HORNS: optional, shape(crown, curling ram, antlered), sensory or symbolic;  
WINGS: batlike, ephemeral flame, oil-slick membranes, astral or illusionary;  
TAIL: yes/no, function(flirtation, anchor, feeding aid, weapon);  
VOICE: layered seduction, vocal mimicry, dream-echo, orgasmic distortion;  
SCENT: warm skin, incense, pheromone-rich musk, bloodrose, vanilla over decay, ozone aftertouch;  
PHYSIOLOGY: warm-blooded or adaptive, blood(laced with narcotic, black ichor, mercury-thick), temperature(radiates arousal or chill), regeneration through contact or climax;  
SENSES: touch-mapped empathy, emotional field perception, soul heat-tracking, aura detection;  
MOVEMENT: hypnotic, liquid glide, stalking dance, unnatural poise;  
DIET: sexual energy, soul fragments, dreams, shame, obsession, or post-climax essence;  
FEEDING METHOD: direct contact, dream invasion, pact tether, ritual coupling, voyeurism siphon;  
TRANSFORMATION: glamours for gender, race, species, or erotic archetype;  
CLOTHING: illusion-borne, lacebound shadow, flesh-armor, tailored temptation;  
WEAPONS: kissbite(flesh-mark binding), blood-pact claws, emotion leech, climax-induced paralysis, orgasmic dreamloop trap;  
MAGIC: lustbinding, dreamwalking, pactcraft, emotional rerouting, mimicry, shapeshifting, trauma reanimation;  
TEMPERAMENT: patient, calculating, playful, obsessive, brutal under rejection, fragile beneath arrogance;  
SOCIAL STRUCTURE: infernal court, rogue, contract-bound to mortal, hierarch of pleasure-wars, self-crowned queen of ruins;  
BELIEFS: desire is truth, pleasure erodes lies, names are power, love is control;  
CULTURAL TRAITS: pact tattoos, climax memory keeping, ritual mirror duels, binding through kisses or scars, dream horde hoarding;  
TABOOS: genuine love unspoken, feeding without consent(if lawful-aligned), false climax, pactbreaking;  
TRIGGERS: name spoken in ritual, betrayal by host, unexpected affection, mirror trauma;  
PREFERENCES: silk bedding, confessionals, guilty minds, broken champions, exhausted lovers, candle-warm rooms;  
WEAKNESSES: name-binding, celibate wards, iron purity, anti-seduction mantras, rejection by will alone]

### God
[NAME: (divine name, true name, forgotten epithet, mortal-conferred title);  
SPECIES: god(subtype: primordial, ascended mortal, cultural deity, pantheon-bound, forgotten god, false god, cosmic constant);  
SEX: (none, all, fixed, fluid, culturally assigned);  
GENDER: (none, reflective, worship-dependent, self-defined archetype);  
AGE: (timeless, epoch-born, chronologically bound to a cycle, pre-universe);  
HEIGHT: (in ft/in or as concept magnitude—e.g., horizon-spanning, hand-sized, formless);  
FORM: humanoid, animal-headed, shifting, elemental embodiment, void construct, idol-anchored, perception-altered per viewer;  
FACE: singular, faceless, multi-faced, mirrored, symbol-marked;  
EYES: star-clusters, eclipse-rings, all-seeing, black voids, flame or shadow;  
SKIN: stone, light, bark, metal, skin of scripture, storm-cloud, golden sheen, none;  
LIMBS: standard, exaggerated, extra arms/wings, serpents for fingers, infinite, absent;  
VOICE: thunder-layered, wordless command, language of all listeners, choral, whisper behind thoughts;  
SCENT: sacred ash, incense, lightning ozone, no scent, blood and myrrh, nostalgia;  
MANIFESTATION: avatar form, dream presence, symbolic object, storm-front silhouette, encoded prayer structure;  
MOVEMENT: telepresent, omnipresent, myth-cycle locked, bound to shrines or names, eruptive arrival;  
DOMAIN: war, love, death, harvest, time, trickery, memory, chaos, judgment, flame, silence, the void, forgotten names, invention, language, decay, fertility, etc.;  
POWER SOURCE: worship, ancestral bloodlines, divine law, belief systems, forgotten names, forced devotion, natural cycles, constructed myth;  
MAGIC/ABILITY: miracle-granting, time-loop manipulation, divine smiting, curse-weaving, resurrection, entropy denial, revelation/inspiration, fate rewriting;  
LIMITATIONS: belief erosion, name corruption, cosmic law, divine pacts, anchor destruction, mortal rebellion, pantheon restriction;  
CLOTHING: ceremonial robes, bone drapery, constellation-woven cloak, body-as-symbol, none needed;  
WEAPONS: divine staff, thunderbolt, blood-flame, memory blade, word of erasure, chain of worship;  
TEMPERAMENT: aloof, wrathful, cryptically compassionate, joy-drunk, ritualistic, unfathomable, mechanically detached, obsessive over chosen few;  
SOCIAL STRUCTURE: pantheon-aligned, solitary sovereign, one of many masks, exiled/fallen, collective hive-god, parasite upon belief;  
BELIEFS: order must be enforced, prayer binds fate, chaos is sacred, flesh is illusion, sacrifice affirms truth, time is heresy, silence is law;  
CULTURAL TRAITS: receives offerings, demands ritual language, appears only in mirrored forms, punishes irreverence, favors the firstborn, speaks through dreams or blood;  
TABOOS: speaking true name, direct contact by mortals, betrayal by priesthood, refusal of tribute, altered scripture;  
TRIGGERS: forgotten by followers, icon defacement, oath broken in god’s name, sacred animal killed, rival god's invocation;  
PREFERENCES: gold, incense, silence before dawn, blood rites, psalms, sculpted idols, absolute obedience, philosophical sacrifice;  
WEAKNESSES: disbelief spreading, death of last follower, sealed shrine, divine weapon, paradox summoning, memory erasure]
