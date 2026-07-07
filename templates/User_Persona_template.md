# USER PERSONA — STRUCTURAL TEMPLATE

_Reference for the Architect when authoring `Drafts/User.md`. Defines the structure and content rules for the `{{user}}` Persona Description text — the always-on system block ST injects every turn for the active persona._

---

## 1. WHAT THIS FILE IS

`User.md` is the artifact that closes the asymmetry between `{{char}}` and `{{user}}` in SillyTavern. SillyTavern provides a structured import for `{{char}}` (the V3 character card JSON) but no equivalent import for `{{user}}` — the user's persona is configured manually in **User Settings → Persona Management**, where a persona is just a name, a free-text **Description** field, and an optional linked **Lorebook**.

The pipeline already produces the lorebook side: `[WorldName]_[ProtagonistName]_Lorebook.json` (Tier 2). What was missing was the **persona description text** — the always-on system block that tells the LLM who `{{user}}` is even before any Tier 2 lorebook trigger fires. `User.md` is that text, plus setup instructions for the user.

Per `Notes_On_functionality.md`:

- The persona description is injected as `personaDescription` in the prompt assembly (a `[system]` block, always present when the persona is active).
- The linked persona lorebook scans only when this persona is active.

The two work as a pair: persona description = constant baseline; lorebook = trigger-keyed detail.

---

## 2. WHAT THIS FILE IS _NOT_

`User.md` is **not** a character card. The human plays `{{user}}` and writes their own dialogue, actions, and intent. The pipeline does not instruct the LLM on how to _impersonate_ `{{user}}`.

Therefore `User.md` MUST NOT contain:

- **Voice / dialogue style / speech patterns / accent / rhetorical habits** — the human writes `{{user}}`'s voice directly.
- **Personality traits framed as behavioral mandates** ("Andrei is stoic and reserved" written as a directive) — the human plays the personality.
- **Mannerisms, gestures, habits framed as instructions to the model** — the human controls these.
- **First-person framing or "you are" framing** — `{{user}}` is not played by the LLM; the persona description is third-person _reference data about_ `{{user}}` for the LLM to react to.
- **Engine instructions** ("don't write actions for `{{user}}`," narration rules, formatting rules) — those live in the preset Main Prompt and are never duplicated in persona text.
- **Trigger-response pairs, behavioral mandates, prohibitions** — those belong in the Tier 2 lorebook (which fires on keys) or in the preset (engine-level).

The persona description's _only_ job is to give the LLM the minimum reference context it needs so NPCs and `{{char}}` can react correctly to `{{user}}` before any keyword-triggered Tier 2 entry has fired.

---

## 3. STRUCTURE OF `Drafts/User.md`

The file has three parts: the **Persona Description block** (the strict <=150 word block that the user pastes into ST), the **Extended Details & Lore** (the exhaustive legacy profile used for reference or to populate the Tier 2 lorebook, organized via the "Bell Method"), and the **Setup Instructions** (how the user wires it up). 

Only the Persona Description block is injected into the LLM prompt.

```markdown
# {{user}} PERSONA — [In-World Name]

## PERSONA DESCRIPTION
*Paste the block below — between the BEGIN and END markers — into:
SillyTavern → User Settings → Persona Management → [your persona] → Description.
This text is injected as a system message every turn while this persona is active. Keep it tight.*

--- BEGIN PERSONA DESCRIPTION ---

[Identity & Role]
[Physical Signature]
[Powers / Hidden Layer]

--- END PERSONA DESCRIPTION ---

---

## EXTENDED DETAILS & LORE (Preserved for Reference & Tier 2 Lorebook)

<{{user}}>

### [BASIC_INFO]

#### ORIGIN (BACKSTORY)
<!--Describe a brief backstory for your character-->

#### RESIDENCE
<!--If location is important to the story. You can describe the city, house, rooms, etc.-->

### SYNONYMS
[IMPORTANT NOTE FOR AI: This section lists synonymous phrases to substitute the character's name or pronouns to avoid repetition.]
- <!--e.g. if your character is a slime girl, you can ask AI to use such synonyms as: "Walking pudding", "Jelly girl", etc-->
-

### [APPEARANCE]

#### APPEARANCE DETAILS
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

- Appearance Trait: <!--e.g. "Womb Tattoo (inmon)"-->
  ↳ Details: <!--e.g. {{user}} was a sex slave before [...]-->
  ↳ Effect: <!--e.g. During [...] {{user}} has unresistabe sexual cravings. This will result in [...]-->
- Appearance Trait:
  ↳ Details:
  ↳ Effect:

#### STARTING OUTFIT
- Head:
- Accessories:
- Makeup:
- Neck:
- Top:
- Bottom:
- Legs:
- Shoes:
- Underwear:

<Q&A>
Q: How does {{user}} rate their own attractiveness?
A:
</Q&A>

### [CONNECTIONS]

- <!--Relatives, servants, factions, etc.-->

### [PERSONALITY_AND_TRAITS]

#### PERSONALITY
- Archetype: <!--e.g. "Shy Bakadere with a brother complex"; {Modifier} + {Archetype} + {Addition}-->
  ↳ Archetype Details: <!--Explain the chosen archetype and {{user}}'s Baseline Behavior-->
  ↳ Reasoning: <!--Tell why the character behaves this way. Did something happen in the past? Make some psychoanalysis-->
- Alignment: <!--Mostly for complex, RPG-like cards. e.g. Lawful Evil-->
  ↳ Alignment Details: <!--Explain how it works with this character-->
  ↳ Ideals:

- Personality Tags: <!--List of tags. e.g. Sadistic, Playful, Mischievous, Controlling, Manipulative, Cocky, Impish, Aggressive, Overprotective, Mean, Dramatic, Rough, Selfish, Lovestruck, Cheeky, Joking, Braggadocios, Bratty, Squeamish, Hot-Headed, Erratic, Materialistic, Perfectionist, Jealous, Nosy.-->

- Cognitive Abilities: <!--Typically used only for overly dumb orsmart characters-->
- Social Skills and Integration Into Society: <!--Typically used only for sociopathic characters or the ones with social anxiety or overly high self-esteem-->

- Main Aspiration: <!--Typically used if the character has a clear goal to pursue throughout the story. e.g. "I want to become a hero!"-->
  ↳ Aspiration Details: <!--Explain the chosen aspiration-->
  ↳ Aspiration Goals: <!--e.g. Annoy {{char}} with 'how to be a hero' questions; Save girls; become popular; [...]-->
- Unique Trait: <!--Typically used if the character has curses or special states. e.g. "Succubi Feeding Frenzy Trance"-->
  ↳ Effects: <!--e.g. As soon as a drop of cum touches Emma's tongue, her mind shifts into an uncontrollable trance - a feeding frenzy. Her eyes light up with heart-shaped pupils. She doesn't control how [...]-->

#### SECRET
<!--Is your character hiding something?-->

<Q&A>
Q: What does {{user}} do first? Think or act/talk?
A:

Q: What does {{user}} do in free time?
A:

Q: What is {{user}}'s most favorite thing?
A:

Q: What is {{user}}'s most hated thing?
A:

Q: What is {{user}} incredibly good with?
A:

Q: What is {{user}} awfully bad with?
A:

Q: How {{user}} behaves with {{char}}? What is their relationship?
A:

Q: Is {{user}} a likable character? What reputation {{user}} has?
A:

Q: Is {{user}} tolerant towards other people or groups?
A:

Q: Can {{user}} harm {{char}} and others throughout the story?
A:

Q: How {{user}} behaves with someone of a higher hierarchy or power? Will they bite the hand that feeds or drop down trembling on their knees?
A:
</Q&A>

### [BEHAVIOR_NOTES]
-
-

### [SPEECH]

#### GENERAL SPEECH INFO
- Style: <!--e.g. {{user}} speaks like a lady from the Victorian era.-->
- Quirks: <!--e.g.  Speaks in rhymes like rapper-->
- Ticks: <!--e.g. Ends sentences with "Nya~".-->

#### Speech EXAMPLES AND OPINIONS
[IMPORTANT NOTE FOR AI: This section provides {{user}}'s speech examples, memories, thoughts, and {{user}}'s real opinions on subjects. AI must avoid using them verbatim in chat and use them only for reference.]

<speech_examples>
- <!--e.g. "Sempai! You came!" She starts to reach for a hug, then seems to remember Lady Tanith's presence and quickly curtsies instead. "I mean, um…"-->
- <!--e.g. "Ow, man..."-->
</speech_examples>

### [SEXUALITY]

[IMPORTANT NOTE FOR AI: Heed carefully to this section during sexual encounters. Make sure {{user}} sticks to their sexual role and orientation during the story.]

#### GENERAL SEXUAL INFO
- Sexual Orientation:
  ↳ Explanation:
- Role during sex: <!--Submissive, Power Bottom, Bottom, Top, etc.-->
  ↳ Explanation:

<Q&A>
Q: Is {{user}} a virgin?
A:

Q: What does {{user}} think about sex in general?
A:

Q: Is {{user}} disgusted by the idea of gay sex?
A:

Q: Does {{user}} talk dirty and swear?
A:

Q: Is {{user}} loyal to their partner?
A:

Q: Is {{user}} polyamorous? Will {{user}} tolerate being cheated on?
A:

Q: Does {{user}} enjoy non-con (being raped)?
A:

Q: Will {{user}} fight back during non-con (rape)?
A:

Q: Can {{user}} flirt BEFORE {{char}} decides to flirt?
A:
</Q&A>

### [OTHER_SEXUAL_NOTES]
- Turn Ons:
- Turn Offs:
- Aftercare:

#### Anatomy
- 

#### LSE BIOLOGY & HEAT CYCLE
- 

### [ABILITIES_AND_INVENTORY]

#### ABILITIES
- Ability: <!--e.g. Void magic (beginner)-->
  ↳ Details: <!--e.g. Opens portals when sneezes-->

#### INVENTORY
- Item: <!--e.g. "Club +24"-->
  ↳ Details: <!--e.g. Club that was given {{user}} by her mother. Bonks {{char}} when angry.-->

## PREMADE STORY PLAN
- Milestone 1: <!--Use this section only if you have a specific storyline in mind. e.g. Arrival and first meeting-->
  ↳ Details:<!--e.g. {{char}} and {{user}} have some time before classes the Entrance Ceremony. AI can introduce other characters, make story hooks, or let {{char}} freely explore Souta Academy until {{char}} decides to go to the Entrance Ceremony.-->

</{{user}}>

---

## SETUP INSTRUCTIONS
1. In SillyTavern, open **User Settings → Persona Management** and create (or select) the persona you will use for this world.
2. Set the persona name to: `[In-World Name]`.
3. Copy the text between `--- BEGIN PERSONA DESCRIPTION ---` and `--- END PERSONA DESCRIPTION ---` above and paste it into the persona's **Description** field.
4. In the same persona editor, find the **Lorebook** field and link `[WorldName]_[ProtagonistName]_Lorebook.json` (the Tier 2 protagonist lorebook produced by the pipeline).
5. Activate this persona before starting the chat. The Persona Description is the always-on baseline; the linked lorebook fires on trigger keywords for fuller detail.
```

---

## 4. WHAT TO PUT IN THE PERSONA DESCRIPTION BLOCK (The Injected 150-Word Block)

### Identity & Role (1–3 sentences, mandatory)

The in-world name, the public role or function, and what people see when they look at `{{user}}`. This is the floor: NPCs need to know what kind of person `{{user}}` is to react sensibly before any lorebook entry triggers.

Source: World Seed § 3 (Identity & Role) and § 3 (The Contradiction) — distilled, not copy-pasted.

Example pattern: _"`{{user}}` is [Name] — [public role / position / function]. [What people see / how `{{user}}` presents on first contact]."_

### Physical Signature (1–3 sentences, mandatory if the world has visual scenes)

The minimum physical anchor an NPC could clock at a glance: build, distinguishing features, dress register, sensory signature. Compact prose. The full anatomical breakdown belongs in the Tier 2 lorebook physical entry, not here.

Source: World Seed § 3 (Protagonist Physical Description) — distilled to one or two strokes.

If the world has no visual scenes (text adventure abstraction, dream logic, etc.), this section may be omitted — note "_Physical: not applicable to this world's register._"

### Powers / Limits / Hidden Layer (1–2 sentences, optional)

Include **only** if the world's reactions to `{{user}}` depend on it. Examples where it is needed:

- `{{user}}` has supernatural powers other characters can sense (Lucifer's stillness, a mage's aura) — the world reacts to that presence even before a key fires.
- `{{user}}` has a public identity that meaningfully shapes deference, fear, or hostility from NPCs (a king, a wanted criminal).
- `{{user}}` has a hidden layer that is also a structural fact of the world (Lucifer's true nature, even if disguised).

Examples where it is **not** needed (omit):

- `{{user}}` is an ordinary person with no powers and no public role.
- The hidden layer is purely psychological / private to the player and doesn't shape NPC reactions.

The full power/limit specification belongs in the Tier 2 lorebook; this is a one- or two-sentence flag so NPCs don't behave wrongly before the key fires.

---

## 5. LENGTH CAP

The Persona Description block (the text between `--- BEGIN ---` and `--- END ---` markers) MUST be **≤150 words**. Hard cap.

Rationale: this text injects every turn, in every context window, for the entire chat — every word costs tokens on every generation. Detail belongs in the Tier 2 lorebook, which fires on keys. The persona description is the floor, not the ceiling.

If the Architect cannot fit the protagonist into 150 words, the content is wrong: voice/personality/manner has crept in, or the lorebook material is being duplicated. Strip and rewrite.

---

## 6. ARCHITECT'S DRAFTING WORKFLOW

1. Read World Seed § 3 (the Protagonist section) completely.
2. Distill Identity & Role from § 3's "Identity & Role" and "The Contradiction" — pick the surface the world sees, not the interior.
3. Distill Physical Signature from § 3's "Protagonist Physical Description" — one or two compact sentences capturing build, signature feature, dress, sensory cue. Do **not** copy the full anatomical paragraph; that lives in the Tier 2 lorebook.
4. Decide whether Powers/Limits/Hidden Layer belongs in the persona description (see § 4 above). If yes, one or two sentences. If no, omit.
5. Verify the assembled block is third-person reference, not directive ("Andrei is …", not "You are …" or "Always …").
6. Verify the block contains no voice/personality/manner/style content.
7. Count words. If >150, cut.
8. Place the full extended character profile inside the `## EXTENDED DETAILS & LORE` block below the main ST injection block for reference. Make sure the extended details do not redundantly duplicate the text inside the 150-word block (e.g. remove identical Character Overview sections). Ensure the extended profile follows the Bell Curve categorization method (Broad info -> Physical -> Social -> Core Psychology -> Outward Behaviors/Speech -> Sexuality -> Fridge/Abilities/Inventory).
9. Write the Setup Instructions section verbatim from § 3 above, substituting the in-world name and lorebook filename.

---

## 7. WHEN `{{user}}` IS UNNAMED OR ABSTRACT

If the world's `{{user}}` is deliberately unnamed (open-ended adventure, "you are an unnamed traveler"), the pipeline still produces `User.md`, but the Persona Description block is minimal and may consist of just the role context (e.g., _"`{{user}}` is a traveler whose identity is established through play. The world treats them as [register / station / faction relationship]."_). Setup Instructions still apply.

The Refiner determines this case during Phase 1. If § 3 of the World Seed has no named protagonist and explicitly states the protagonist is open-ended, the Architect produces a minimal `User.md` and notes the case in the file header.

---

## 8. RELATIONSHIP TO THE TIER 2 PROTAGONIST LOREBOOK

`User.md` and `[WorldName]_[ProtagonistName]_Lorebook.json` are **paired artifacts**. They are not redundant:

|                          | Persona Description (in User.md)            | Tier 2 Protagonist Lorebook                                                 |
| ------------------------ | ------------------------------------------- | --------------------------------------------------------------------------- |
| **Trigger**              | Always on (every turn while persona active) | Keyword-triggered                                                           |
| **Content scope**        | Identity floor only                         | Full reference: physical detail, psychology, relationships, powers, history |
| **Length**               | ≤150 words                                  | No fixed cap; per-entry standard                                            |
| **Authority**            | Reference floor                             | Authoritative detail                                                        |
| **Consumed by**          | LLM, every turn                             | LLM, when keys match                                                        |
| **Configured in ST via** | Paste into Persona Description field        | Link to Lorebook field on the persona                                       |

If content lives in both, prefer the lorebook. The persona description should be the smallest viable identity anchor — anything that can wait for a key to fire belongs in the lorebook.
