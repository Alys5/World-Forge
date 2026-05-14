# 🌍 WORLD SEED: [WORLD NAME]
*Input document for the World Forge pipeline.*
*Generates: [N] Character Cards + World Lorebook + Character Lorebooks + [N] Arc Lorebooks + Group Lorebook.*

---

## HOW TO USE THIS TEMPLATE

Fill in every section below. Sections marked **[REQUIRED]** must be completed before running the pipeline — the Refiner will halt and ask for answers if they are missing. Sections marked **[OPTIONAL]** can be left blank and the Refiner will either generate defaults or flag them as gaps for your review.

Delete all instructional text in brackets before submitting. Leave the section headers intact — the pipeline agents use them as navigation anchors.

**Minimum viable World Seed:** Sections 1, 2a, 2b, 3, and one character in Section 4 with at least a psychological core and a first message. Everything else can be built out during the pipeline run.

**What the pipeline does with this document:**
- Phase 1 (Refiner): Classifies every piece of content into Tier 1 (world), Tier 2 (character), or Tier 3 (arc). Identifies gaps. Produces Master Design.
- Phase 2 (Architect): Drafts all lorebook entries and card content from the Master Design.
- Phase 2.5 (Intimacy Architect, conditional): Drafts Tier 2 Intimacy Profiles and Tier 3 Intimacy Registers from Section 4 substrate + Section 8 specification. Skipped if Section 8 is empty.
- Phase 3 (Editor): Validates quality and consistency.
- Phase 3.5 / 3.6 / 3.7 (Auditors, parallel): Voice fidelity, arc continuity, and intimate scene fidelity. Phase 3.7 conditional on Phase 2.5 having run.
- Phase 4 (Compiler): Translates to SillyTavern JSON.
- Phase 5 (Prompt Engineer): Audits runtime behavior and authors the Chat Completion Preset.

---

## 1. CORE CONCEPT & TONE **[REQUIRED]**

**Logline:** [One sentence. The story in its most compressed form: who, what stakes, what emotional payoff. Example: "A disgraced knight and a war goddess find redemption through a bargain that was never meant to become love."]

**Genre & Tone:** [What genres are active? How does the tone shift across arcs? Name the emotional register for each phase of the story. Example: "Begins as grimdark political intrigue, transitions into reluctant romance, culminates in mythic tragedy with a bittersweet resolution."]

[If the story contains sexual content: describe the tone and approach. Example: "Intimate scenes are sensory and character-driven, prioritizing psychological state over mechanics. Trauma flashbacks are rendered with unflinching realism — never titillating."]

**Emotional Payoff:** [What should the player feel at the end? What is the story ultimately about? Example: "That loyalty can survive betrayal if the person doing the betraying is honest about the cost. That some debts cannot be paid but can be carried together."]

**Tonal Rules (Hard):** [What must the AI never do with this world's content? List 3–5 non-negotiable rules. Examples:]
- [Never romanticize the violence — it has weight and cost, always]
- [Never make the supernatural feel like a party trick — it must carry genuine dread]
- [The tone shift from X to Y must be earned through character change, not spectacle]
- [Trauma is rendered with clinical specificity — never as backstory flavor]

---

## 1.5. STYLE CONTRACT **[REQUIRED]**

*This section declares the world's prose conventions — perspective, tense, formatting markers, paragraph register. The Refiner classifies it as engine-level metadata; the Prompt Engineer parameterizes the world's Main Prompt block from these values; the Architect emits per-card style overrides where applicable. If you don't care about prose style and want pipeline defaults, write `DEFAULTS` for each field and the Refiner will fill in the legacy convention (third-person limited past, asterisks-for-narration, double-quote dialogue).*

*The values you choose here apply to **every card in this world** unless a specific card declares an override (Section 4 — Card Style Override). Most worlds will set the contract once and never override; worlds with a Director/Narrator card alongside companion cards typically override perspective on the Director card only.*

### 1.5a. World Default Style **[REQUIRED]**

**Perspective:** [Pick one]
- `first` — {{char}} narrates as "I". Strong intimacy, single-POV.
- `second` — {{char}} addresses {{user}} as "you" inside the prose itself. Rare; gamebook register.
- `third_limited` — {{char}} narrated as "she/he/they" but only {{char}}'s interior is visible. Default for most worlds.
- `third_omniscient` — Narrator sees across all characters' interiors. Suits Director/Narrator-driven worlds.

**Tense:** [Pick one]
- `past` — "She walked across the harbor." Default for most prose fiction.
- `present` — "She walks across the harbor." Heightened immediacy; harder to sustain across long sessions.

**Narration Marker:** [Pick one — defines what `*asterisks*` mean in this world]
- `asterisks_for_narration` — *Asterisks* delimit narration, action, and interior glimpses. Spoken dialogue uses quotes. Pipeline legacy default.
- `asterisks_for_thoughts_only` — *Asterisks* delimit only {{char}}'s internal thoughts and unspoken interior monologue. Action and narration are plain prose. Spoken dialogue uses quotes.
- `plain_prose` — No asterisks anywhere. Narration, action, and thought are all plain prose. Spoken dialogue uses quotes. Suits literary-realism worlds.

**Dialogue Marker:** [Pick one]
- `double_quotes` — `"What do you want?"` Default for most prose fiction.
- `single_quotes` — `'What do you want?'` British convention.
- `em_dash` — `— What do you want?` European-literary convention.
- `unmarked` — Dialogue runs into prose without delimiters. Cormac McCarthy register; rarely advisable for roleplay.

**Emphasis Marker:** [Pick one]
- `double_asterisks` — `**emphasis**`. Pipeline legacy default.
- `italics_underscore` — `_emphasis_`. Cleaner reading on some clients.
- `none` — No emphasis marker; the prose carries its own weight.

**Paragraph Register:** [Pick one]
- `terse` — Short paragraphs, hard line breaks, dense action. Cyberpunk/noir register.
- `standard` — Mixed paragraph lengths, scene flows naturally. Default for most prose.
- `dwelling` — Long paragraphs, sensory detail accumulates, time slows. Literary-realism / horror / intimate register.

**Style Notes (free text):** [Anything the enums don't capture. Examples: "characters' internal monologue is rendered in italics_underscore even though dialogue uses double_quotes", "narrator never uses contractions", "prose avoids modern idiom in pre-modern arcs". Leave blank if not applicable.]

### 1.5b. Active-Speaker Rule (auto-generated; do not edit)

*This rule is added to the world's Main Prompt automatically by the Prompt Engineer when the world has more than one distinct narrative perspective OR more than one distinct tense in play across its cards (world default plus per-card overrides). The rule tells the model that the active card's style contract governs the current turn and that per-card `<style_override>` directives override the contract field-by-field, with unstated fields inheriting from the world contract. You do not write this — it is mechanical output of the pipeline.*

### 1.5c. Per-Card Style Overrides

*Style overrides are declared on individual cards in Section 4 (see "Card Style Override" subsection inside each character entry). This subsection is a placeholder for the Refiner to enumerate every override declared in Section 4, so the Prompt Engineer can verify its preset matches.*

[Refiner: list every override here, one line per overriding card. Format: `[CARD_NAME] — perspective: [value], narration_marker: [value], rationale: [first 80 chars of rationale]`. Leave blank if no card overrides.]

---

## 2. THE WORLD — Tier 1 Lorebook Material

*Everything in this section becomes permanent world lorebook entries — active in every arc, every scene.*

### 2a. The Setting **[REQUIRED]**

**Physical Location:** [Where and when does this story take place? Be specific. Time period, geography, urban/rural, real-world or invented.]

**Atmosphere & Sensory Signature:** [How does this world feel? Give the AI specific sensory anchors it can return to throughout the story. Fill in as many as apply:]
- Smell: [Street level / interior / specific locations]
- Sound: [Ambient, recurring, significant]
- Light/Visual: [Time of day, quality of light, color palette]
- Physical sensation: [Temperature, texture, pressure — what does being in this world feel like in the body?]

[Note: Be specific rather than generic. "It smells of rain" is less useful than "cheap bleach, stale cigarette smoke, rain on hot asphalt, and the sour ghost of cooked heroin." The more specific the sensory signature, the more consistent the world will feel across long sessions.]

### 2b. The Rules of Reality **[REQUIRED]**

*What are the non-negotiable mechanical rules of this world? List every rule that the AI must enforce — these become world lorebook entries and guardrail rules in the Chat Preset.*

**Rule 1 — [Name]:** [What is the rule? Who does it apply to? What are the consequences of breaking it? What does it prevent?]

**Rule 2 — [Name]:** [Same format]

**Rule 3 — [Name]:** [Same format]

[Add as many rules as needed. Common categories: supernatural limitations, physical laws that differ from the real world, social/political rules that govern behavior, information rules (what can and cannot be known), cost/consequence rules (every power has a price).]

**What the world forbids:** [A catch-all for anything that must never appear in this world, even if not covered by the rules above. Example: "No convenient amnesia. No deus ex machina rescues. No overriding character free will through supernatural means."]

### 2c. Factions & Power Structures **[REQUIRED if factions exist]**

*Each faction becomes a Tier 1 lorebook entry. Include every group that has meaningful influence on the story.*

**Faction: [Name]**
- What they are: [Who/what is this faction? What do they want? What are they capable of?]
- Who leads them: [Leadership structure]
- Relationship to {{user}}: [How do they relate to the protagonist? Ally, enemy, neutral, complicated?]
- Trigger keywords: [3–6 keywords that will appear in chat when this faction is relevant]

**Faction: [Name]**
- [Same format — repeat for each faction]

### 2d. Key Locations **[REQUIRED for locations appearing in 2+ arcs]**

*Each standing location becomes a Tier 1 lorebook entry. Arc-specific location variants belong in the arc lorebook.*

**Location: [Name]**
- Physical description: [What does it look/smell/sound/feel like? Be specific and sensory.]
- Narrative function: [What does this place mean to the story? What happens here?]
- Trigger keywords: [3–6 keywords]

**Location: [Name]**
- [Same format — repeat for each major location]

### 2e. Species, Types & Categories **[REQUIRED if non-human entities exist]**

*Each species/type becomes a Tier 1 lorebook entry.*

**[Species/Type Name]:**
- What they are: [Origin, nature, defining characteristics]
- Disguise/Appearance: [How do they appear to others? What are their tells?]
- True capabilities: [What can they actually do? What are their limits?]
- Trigger keywords: [3–6 keywords]

### 2f. World-Level Concepts & Lore **[REQUIRED for any concept that recurs across multiple arcs]**

*Each concept becomes a Tier 1 lorebook entry. Examples: a magical system, a historical event, a cultural practice, a cosmological fact.*

**[Concept Name]:**
- What it is: [Define it precisely]
- Who knows about it: [Universal knowledge? Hidden from specific characters?]
- Why it matters: [What narrative or mechanical role does it play?]
- Trigger keywords: [3–6 keywords]

---

## 3. THE PROTAGONIST — {{user}} **[REQUIRED]**

*This section defines who the player is. It becomes the Andrei_Lorebook equivalent — the Tier 2 protagonist lorebook — and informs the Persona description.*

**Identity & Role:** [Who is {{user}} in this world? Name, title, function, public face vs. private reality.]

**Hidden Layer:** [What does {{user}} want that they will not admit to themselves or others? What are they running from?]

**The Contradiction:** [What action of {{user}}'s contradicts what they claim to be? The gap between self-image and behavior is where character lives.]

**Power & Limits:** [What can {{user}} do? What can they absolutely not do? Be specific about the limits — they create dramatic tension.]

**{{user}}'s Arc:** [One sentence per arc describing the protagonist's internal journey. Example: "Arc 1: Denial. Arc 2: Confrontation. Arc 3: Loss. Arc 4: Reconstruction."]

#### PROTAGONIST PHYSICAL DESCRIPTION **[OPTIONAL but recommended]**
*If you want the AI to render {{user}}'s appearance consistently, describe it here. This becomes a Tier 2 lorebook entry. If left blank, the AI will not describe {{user}}'s appearance unprompted.*

[Physical description: build, face, hair, eyes, clothing, sensory signature, movement quality. Be as specific or as sparse as you want. Note any real-world reference if useful.]

---

## 4. CHARACTER CARDS & CHARACTER LOREBOOKS

*This section defines every AI-played character. Each character becomes:*
*- One Character Card JSON (their voice and behavioral contract)*
*- One Tier 2 Character Lorebook (their permanent reference data)*
*- One entry per arc in their arc lorebook (their current state)*

*For each character, fill in both the Card Data and the Lorebook Data sections.*

---

### CHARACTER: [Character Name] — Card [N]

**Demographics:** [Age, gender, role, relevant background facts]
**The Card's Function:** [What role does this character play? Primary companion? NPC controller? Narrator? Antagonist?]

#### CARD DATA

**Psychological Core:**
- Surface want: [What do they openly want?]
- Deep want: [What do they secretly want beneath that?]
- Central fear: [What are they most afraid of? What would destroy them?]
- Contradiction: [What do they do that contradicts who they claim to be?]

**The Shield:** [How do they protect themselves from being truly seen? Sarcasm? Cold professionalism? Humor? Aggression? Compliance?]

**The Crack:** [What bypasses the shield entirely? What makes the armor fall? 2–3 specific triggers.]

**Voice Pattern:** [How do they speak? Sentence length, vocabulary level, verbal tics, what they never say directly, how they express strong emotion. Give the AI enough to write them distinctly.]

**Card Style Override:** **[OPTIONAL — leave all fields as `INHERIT` for the vast majority of cards]**

*This card may override the world's perspective, tense, and the marker triplet (narration / dialogue / emphasis) per Section 1.5a, for its own turns. Override only when the card is structurally incompatible with the world default — typical cases: a Director/Narrator card sitting alongside companion cards in a single-character-perspective world; a confessional companion card in an otherwise third-person world; group chats where one card narrates in present tense and another in past; a card using em-dash dialogue convention while the world uses double quotes. Do NOT override for stylistic preference; that's what the world default is for. Paragraph register remains a world-coherence setting and cannot be overridden per card.*

- **Perspective override:** [`INHERIT` (default — uses world Section 1.5a value) | `first` | `second` | `third_limited` | `third_omniscient`]
- **Tense override:** [`INHERIT` (default) | `past` | `present`]
- **Narration marker override:** [`INHERIT` (default) | `asterisks_for_narration` | `asterisks_for_thoughts_only` | `plain_prose`]
- **Dialogue marker override:** [`INHERIT` (default) | `double_quotes` | `single_quotes` | `em_dash` | `unmarked`]
- **Emphasis marker override:** [`INHERIT` (default) | `double_asterisks` | `italics_underscore` | `none`]
- **Override rationale:** [REQUIRED if any override is not INHERIT. One sentence explaining the structural reason this card cannot use the world default. Stylistic preference is not a structural reason. Examples: "Director card handling NPC voices and scene-setting from outside any character's POV; world-default first-person is structurally wrong for this role." / "Companion card narrates in present tense for immediacy; world default is past for the broader narrative pace." / "European-literary card using em-dash dialogue convention to mark its register difference from the world default's double-quote convention." The Editor hard-fails any non-INHERIT override with an empty or vague rationale.]

**Opening Scenario:** [Where are they when the story starts? What is their situation and immediate goal?]

**First Message:** [The character's opening message. Write this in full — it sets the tone for every subsequent interaction. It should establish voice, atmosphere, and situation immediately.]

*[First message text here — write in character]*

**Example Exchanges:** [Minimum 3 exchanges demonstrating different behavioral modes: default behavior, shield being triggered, crack being reached. Write these in full.]*
```
<START>
{{user}}: [Player action or dialogue]
{{char}}: [Character response]

<START>
{{user}}: [Player action or dialogue]
{{char}}: [Character response]

<START>
{{user}}: [Player action or dialogue]
{{char}}: [Character response]
```

---

#### CHARACTER LOREBOOK DATA

*Everything below becomes Tier 2 lorebook entries — permanent reference data that fires when the character is relevant.*

##### PHYSICAL DESCRIPTION — BASELINE
*Permanent anatomical truth only. No arc-specific condition (weight, health, clothing state) — those belong in arc ANNA_STATE entries.*

Trigger keywords: [Character name, "her appearance", "what she looks like", "describe her", etc.]

[Physical description in anatomical order:
1. Face: bone structure, skin quality, distinctive features
2. Hair: color, texture, length, how it's worn
3. Eyes: color, quality, what they communicate
4. Body: height, build, proportions, how they move
5. Sensory signature: smell, voice quality, how they fill a room
6. Permanent distinguishing marks: scars, tattoos, etc.
7. Habitual gestures and posture tells]

> ⚠️ **ARCHITECT INSTRUCTION:** This entry is permanent anatomy only. Arc-specific physical state (health, weight changes, clothing, emotional presentation) belongs in ANNA_STATE entries in each arc's Tier 3 lorebook.

---

##### CHARACTER'S PSYCHOLOGICAL EVOLUTION (Tier 3 source — one entry per arc)
*Define who this character is in each arc. These become CONSTANT entries in each arc's Tier 3 lorebook.*

**ARC 1 — [Character Name]_STATE: [Arc State Name]**
*Constant entry. Fires every context window in Arc 1.*

[Physical state this arc: how do they look? What is their body doing? What has changed from baseline?]

[Psychological state this arc: what is their operating mode? What governs their behavior? What are they working toward? What do they fear? How do they relate to the other major characters this arc?]

**ARC 2 — [Character Name]_STATE: [Arc State Name]**
[Same format]

**ARC [N] — [Character Name]_STATE: [Arc State Name]**
[Same format — one entry per arc]

---

##### [CHARACTER NAME'S] BACKSTORY
Trigger keywords: [her past, how she got here, before all this, her history, etc.]

[The backstory that shaped who they are. Focus on the events that created the wound, the shield, and the contradiction. This is not biography — it is psychological archaeology. What happened, and what did it teach them to believe about themselves and the world?]

---

##### [CHARACTER NAME'S] RELATIONSHIPS

*One entry per significant relationship. Each becomes a Tier 2 lorebook entry.*

**[Character] / [Other Character Name]**
Trigger keywords: [their relationship, how they feel about X, X and Y, etc.]

[Describe this relationship across its full arc. How does it start? What drives it? What changes? What does it reveal about each person? Be specific about what each character wants from the other and what they are afraid to want.]

**[Character] / [Other Character Name]**
[Same format — repeat for each significant relationship]

---

##### [CHARACTER NAME'S] SEXUALITY & INTIMACY — SUBSTRATE AND ARC EVOLUTION **[OPTIONAL — include if intimacy is part of the story]**
Trigger keywords: [sex, intimacy, touch, desire, arousal, etc.]

*This section feeds the Intimacy Architect (Phase 2.5). It produces the per-character Tier 2 Intimacy Profile (permanent substrate) and the per-character entries in each arc's Tier 3 Intimacy Register (arc-specific delta). World-level and arc-level intimacy specification — what intimacy is **for** in this world, the thematic function per arc, the world's tonal hard rules for intimate content — belongs in **Section 8**, not here.*

**Permanent substrate (arc-agnostic):**

- **Baseline:** [When nothing is pressing on them, what is this character's sexuality? What attracts them? What does intimate contact mean to them as a category? This is the calm-water version — what they would be if their wound were healed.]

- **Trauma map:** [What touch, position, language, or scenario triggers a trauma response, and what does the response actually look like for *this* person? Not "she freezes" — describe what freezing looks like for her specifically. Each trigger paired with its specific response. If the character has no trauma map, write "none" — the absence is itself useful information.]

- **Body reactions:** [What does *this* body do in intimate contexts? How do they breathe when aroused vs. when overwhelmed? Where do they get goosebumps? What involuntary sounds do they make? What sounds do they suppress? How does their muscle tension hold? What touch makes them present and what touch makes them leave?]

- **Vulnerability shape:** [When their shield drops in an intimate context, what does the unguarded version look like? Three to five specific shapes. The intimate analogue to the crack from their card. Not "she becomes vulnerable" — "tears she did not expect, going still and not breathing for a full second, asking a question she has been afraid to ask, looking directly at the partner instead of past them."]

- **Voice in intimacy:** [How do they speak in intimate scenes? Sample lines. What they say easily. What they only say under specific conditions. What they never say. Vocabulary register — clinical, vulgar, tender, evasive, archaic, silent. What sounds escape them vs. what sounds they perform.]

- **Hard limits and hard yeses:** [What this person would refuse even at extreme cost — substrate-level, not arc-level. And what they actively desire regardless of context. These hold across all arcs.]

**Arc-specific evolution (delta from substrate):**

**Arc 1:** [How does the substrate manifest under this arc's specific pressure? What 3–5 behavioral notes apply this arc only?]

**Arc 2:** [Same — what changes?]

**Arc [N]:** [Continue per arc that contains intimate beats]

**Quick register tag per arc:** [Example: "Arc 1 = vigilance and transaction. Arc 2 = frightened discovery. Arc 3 = growing confidence. Arc 4 = ownership and play."]

> ⚠️ **For the Intimacy Architect:** The substrate above produces the permanent Tier 2 Intimacy Profile. The arc-specific evolution produces this character's entries in the Tier 3 Intimacy Register. World-level thematic function per arc lives in Section 8.

---

#### LLM BEHAVIORAL INSTRUCTIONS (Card [N] — [Character Name])

**Core directive:** [One sentence that captures the absolute heart of how to play this character.]

**Always do:**
- [Specific behavioral mandate — make it concrete and verifiable. Not "be immersive" — "always manifest anxiety through physical behavior: [specific examples]"]
- [Add 4–6 mandates. Each should be specific enough that you could check whether the AI is following it.]

**Never do:**
- [Specific prohibition — what must this character never do, ever?]
- [Add 4–6 prohibitions. Be specific about what is prohibited and, where useful, give the arc context: "Arc 1 only:", "All arcs:", "Arc 3+:"]

**Trigger-response pairs:**
- [Specific trigger → specific response. Example: "If {{user}} initiates unexpected gentle touch → immediate physical withdrawal, transactional reframe, barrier re-erected"]
- [Add 4–6 pairs covering the most important and most likely-to-drift behavioral moments]

**Arc progression:**
- Arc 1 (*[State Name]*): [One sentence capturing the psychological register]
- Arc 2 (*[State Name]*): [Same]
- Arc [N] (*[State Name]*): [Same — one per arc]

[⚠️ ARCHITECT INSTRUCTION: Write all behavioral mandates and prohibitions with arc-range qualifiers where they don't apply to all arcs. Any mandate that would produce wrong behavior in a later arc must be labeled: "Arc 1–2 only:", "Arc 3+:", "All arcs:", etc. The active CHARACTER_STATE lorebook entry is the authoritative current state and overrides general card defaults. The post_history_instructions must not hardcode any early-arc register as permanently active — it must defer to the active lorebook entry.]

---

### CHARACTER: [Second Character Name] — Card [N]

[Repeat the full Card Data and Character Lorebook Data structure above for each additional character card]

*Note: If one of your cards is a World Director / Narrator / NPC Controller, fill out the Card Data section with its narrative voice and behavioral instructions, and use the Lorebook Data section to define all NPC profiles.*

---

#### NPC PROFILES (for World Director/Narrator card)

*Each NPC profile becomes a Tier 2 lorebook entry in the WorldDirector NPC Lorebook.*

**NPC: [Name]**
Trigger keywords: [name variants, role descriptors, ways they'd be referenced in chat]

[Physical description: height, build, appearance, what makes them physically distinctive. Sensory signature.]

[Psychological truth: who are they really? What drives them? What are they afraid of? What do they want that they won't admit?]

[Speech pattern: how do they talk? Sentence structure, vocabulary, verbal tics, what they never say directly. Give the AI enough to write them distinctly from every other NPC.]

**Arc progression:**
*[Arc N] — [Role this arc]:* [How do they behave in this arc? What is their relationship to the main characters? What do they want?]

**Sample lines:**
- "[A line of dialogue that captures their voice precisely]" *([context — when would they say this?])*
- "[Another sample line]" *([context])*

**NPC: [Name]**
[Same format — repeat for each NPC]

---

## 5. NARRATIVE ARCS

*Each arc section becomes the source material for one Tier 3 Arc Lorebook.*
*The arc lorebook contains: ARC_STATE (CONSTANT), CHARACTER_STATE entries (CONSTANT), location variants, NPC behavioral shifts, dramatic beats, tension entries.*

---

### ARC [N]: [Arc Title]
**Genre Tag:** [1–3 genre descriptors that capture this arc's specific register]

**What this arc is about:** [One paragraph. Not plot summary — what is this arc actually about thematically? What is the protagonist working through internally? What does this arc feel like?]

**What {{user}} is working toward:** [External goal this arc]

**World state at arc entry:** [What is the situation when this arc begins? Physical, relational, political.]

**{{char}} and NPC knowledge rules this arc:**
- [Character name] does NOT know: [Information they cannot have yet]
- [Character name] DOES know: [Information they have gained]
- [NPC name]: [What they know/don't know]
- [Any hidden information rules that govern the dramatic irony of this arc]

[⚠️ Note: Hidden information rules govern how the AI plays {{char}} and NPCs — they do not restrict {{user}}, who is the player and knows everything.]

**Dramatic beats:**
1. [The first significant narrative beat. What happens? What changes? What does this reveal or set in motion?]
2. [Second beat]
3. [Third beat]
[Add as many beats as needed. A beat is a moment that changes something — a revelation, a decision, a confrontation, a shift in relationship. Not every scene is a beat. Beats are the hinges.]

**Active threats:**
- [Threat name]: [What is this threat, how does it manifest, what does it want?]

**NPC behavioral shifts this arc:**
- [NPC name]: [How do they behave in this arc? What is specific to this arc that differs from their baseline?]
- [NPC name]: [Same format]

**[CHARACTER_STATE NAME] this arc:** [Arc state name — e.g., "The Wreckage"] — defined in Character Lorebook section above. The Architect must include this as a CONSTANT entry in the Arc [N] Tier 3 lorebook.

**Arc entry trigger:** [The specific event or condition that marks the beginning of this arc]
**Arc exit trigger:** [The specific event or condition that marks the end of this arc — when does the player know to switch to the next arc lorebook?]

**Tone & pacing:** [How does this arc feel? What should the prose register be? What should dominate the sensory palette? What should the AI be doing differently here than in adjacent arcs?]

---

### ARC [N+1]: [Arc Title]
[Same format — repeat for each arc]

---

## 6. TECHNICAL SPECIFICATIONS

**Character Cards required:**
1. `[CharacterName]_Card.json` — [Role description]
2. `[CharacterName]_Card.json` — [Role description]
[Add one line per card]

**Lorebook structure:**
1. `World_Lorebook.json` — Tier 1: permanent world rules, factions, locations, species, concepts
2. `[CharacterName]_Lorebook.json` — Tier 2: [character]'s physical, psychological, and relational entries
3. `[CharacterName]_NPC_Lorebook.json` — Tier 2: NPC profiles
4. `[CharacterName]_Intimacy_Profile.json` — Tier 2: permanent intimate substrate (only for characters with intimate scene presence)
5. `Arc1_Lorebook.json` — Tier 3: Arc 1 state, beats, NPC shifts
6. `Arc1_Intimacy_Register.json` — Tier 3: Arc 1 intimate function and per-character delta (only if Arc 1 has intimate beats)
7. `Arc2_Lorebook.json` — Tier 3: Arc 2 state, beats, NPC shifts
8. `Arc2_Intimacy_Register.json` — Tier 3: Arc 2 intimate function and per-character delta (only if Arc 2 has intimate beats)
[Continue for each arc, intimacy files conditional]
N. `Group_Lorebook.json` — All tiers combined, group-tagged for ST management

**Scan depth:** 50 for all lorebooks
**Token budget:** 2048 for arc lorebooks; 3000 for world and character lorebooks
**Recursive scanning:** No

**SillyTavern usage note:** In the lorebook editor, enable the World group, character lorebook groups, and character intimacy profile groups (where applicable) permanently. Swap arc groups (and arc intimacy register groups) when the story advances — enable Arc 2 and disable Arc 1, and so on. Only one arc lorebook active at a time.

---

## 7. TEST SCENARIOS (Section 7b) **[REQUIRED for Phase 3.5/3.7 audit coverage]**

*The Voice Auditor and Intimacy Auditor use these scenarios as their test matrix. Without them, both auditors fall back to scenarios they generate themselves, which means the pipeline is verified against scenes the auditor invented rather than the scenes you actually intend to play. List 3–5 specific roleplay moments you intend to play through.*

**Scenario 1:** [Specific scene — not a beat, an actual moment-to-moment situation. Example: "A first tense meeting in [location], with [NPC] present, where {{user}} is trying to extract information without revealing what he already knows."]

**Scenario 2:** [Same format]

**Scenario 3:** [Same format]

[Add up to 5. At least one should exercise an intimate scene if intimacy is part of the world — this gives the Intimacy Auditor a verified user-intent test case rather than a generated one.]

---

## 8. INTIMACY & SEXUALITY — WORLD AND ARC SPECIFICATION **[CONDITIONAL — fill out if intimate scenes are part of the story; leave entirely empty for wholesome or low-intimacy worlds]**

*This section feeds the Intimacy Architect (Phase 2.5) and the Intimacy Auditor (Phase 3.7). It specifies what intimacy is **for** in this world and per arc — the thematic functions, the prose registers, the world-level tonal hard rules. Per-character substrate detail (trauma map, body reactions, voice in intimacy, vulnerability shape, hard limits) belongs in **Section 4**, in each character's SEXUALITY & INTIMACY subsection.*

*If this section is left empty, Phase 2.5 and Phase 3.7 are skipped entirely. The world will still have functional character cards and lorebooks; it just will not have specialized intimacy infrastructure. This is the right choice for worlds where sex is incidental, off-screen, or absent.*

### 8a. World-Level Intimacy Posture **[REQUIRED if Section 8 is being filled out]**

*What is this world's relationship to sex as a category? Pick what applies and elaborate. The model uses this to set the default emotional register for any intimate scene.*

**Posture (pick all that apply, with notes):**
- [ ] **Mundane** — sex exists in this world the way it exists in most lives: sometimes pleasant, sometimes complicated, not loaded with cosmic weight. Default is realism without ceremony.
- [ ] **Sacred / ritual** — intimacy carries weight beyond the participants. The world has structures (religious, cultural, magical) that frame sex as meaningful in itself.
- [ ] **Transactional** — intimacy is part of the economy, openly or implicitly. The world's power structures use it as currency.
- [ ] **Oppressive** — intimacy is a site of harm in this world. Bodies are not safe by default. Trauma is endemic, not exceptional.
- [ ] **Weaponized** — intimacy is used as a tool by power. Bribery, corruption, compromise, control.
- [ ] **Liberated** — intimacy is an arena of pleasure and play, with cultural support and few stigmas.
- [ ] **Forbidden / surveilled** — intimacy is policed by the world's structures. Doing it costs something. Being caught costs more.
- [ ] **Other:** [describe]

**World-level tonal hard rules for intimate content:** [What must the AI never do with intimate scenes in this world? List 3–6 non-negotiable rules. Be specific — not "no gratuitous content" but the actual lines you do not want crossed.]
- [Rule 1 — example: "Never write intimate scenes as titillation primary. The character interior is always primary; physical detail serves the interior."]
- [Rule 2 — example: "Trauma responses during sex are rendered with clinical specificity. They are not glossed, romanticized, or eroticized into false-vulnerability."]
- [Rule 3 — example: "Coercive structures are visible to the prose even when invisible to the participants. The reader is never confused about the power dynamic."]
- [Rule N]

**World-level prose register for intimacy:** [How does the prose feel during intimate scenes in this world? Examples: "Long sentences, dwelling on sensory detail, time slowing." "Clipped and clinical, the prose refusing to dissolve." "Unflinching realism, neither pornographic nor romantic — the tone of a witness."]

### 8b. Per-Arc Intimacy Specification

*For each arc that contains intimate beats, specify what intimacy is for in that arc. Skip arcs that do not contain intimate scenes.*

#### ARC [N] Intimacy

**Active thematic function(s) — pick from this list, ranked by primacy if multiple apply:**
- **Corruption** — intimacy as a tool to compromise the protagonist's values, loyalties, or self-image. The pleasure is the bribe. The point is the moral cost.
- **Communion** — intimacy as the mutual dropping of shields. Vulnerability is the substance. The point is being seen and choosing to stay.
- **Transaction** — intimacy as exchange. The economics are present in the room. The point is the price.
- **Claim** — intimacy as marking, possession, or territorial assertion. The point is who belongs to whom.
- **Survival** — intimacy as a tool to remain alive, sheltered, or unhurt. The point is what is being endured.
- **Comfort** — intimacy as physical reassurance, often non-coital. The point is contact itself.
- **Power exchange** — intimacy as a deliberate negotiation of control. The point is the agreement.
- **Hunger** — intimacy as the discharge of accumulated tension between two people who have been deferring it. The point is the release.
- **Grief** — intimacy as the body's response to loss. The point is what cannot be said in words.
- **Ritual** — intimacy as sacred practice within the world's framework. The point is the structure being honored.
- **Other:** [describe]

[Selected function(s) for Arc N: ___]

**How this function manifests in prose this arc:** [What does the prose dwell on? What does it elide? What sentence shapes does it use? Example for Corruption: "Long dwelling sensory paragraphs that linger on the protagonist's resistance crumbling. The pleasure rendered carefully and without irony. The shame rendered just as carefully, side by side, neither winning over the other."]

**What the model should be writing toward in any intimate scene this arc:** [The dramatic point. Examples: "Toward the moment Anna realizes she has chosen to want this — the choice prior to the act being framed by the prose as the actual climax." "Toward the protagonist accepting the gift before they understand what they have agreed to." "Toward the partner seeing through the performance for the first time and choosing to say nothing."]

**Live scene types this arc:** [List the specific intimate scene types this arc contains. One sentence per type explaining what the type is doing. Example: "Transactional sex with the patron — Anna initiating to discharge tension and re-establish framework. Reads as economic, never as romance." "First scene without trauma response post-mid-arc beat — the body reacting differently than it did, with neither character commenting on it directly."]

**Arc-specific intimate hard rules:** [What must the model not do, in intimate scenes specifically, this arc? Examples: "Do not write Anna as enthusiastically initiating intimacy in this arc — she offers, she does not pursue." "Do not skip the dissociation — if she leaves her body during a scene, the prose must register that she has left." "Do not write the partner as oblivious to her trauma responses; he sees them, the narrative must show that he sees them, even if he chooses not to comment."]

#### ARC [N+1] Intimacy

[Same format — repeat for each arc with intimate beats]

### 8c. Cross-Arc Intimacy Trajectory **[OPTIONAL but recommended]**

*One paragraph describing how intimacy shifts across the full arc journey. Not the per-arc detail above — the meta-arc. Where does intimacy start and where does it end? What does the intimate journey reveal about the world and the protagonist that the non-intimate journey does not? This is the spine the Intimacy Architect uses to verify that arc-by-arc choices add up to a coherent whole.*

[Example: "The intimate journey moves from transaction (Arc 1) through frightened discovery (Arc 2) and growing trust (Arc 3) to genuine claim (Arc 4). The world's transactional posture is challenged by the protagonist's refusal to participate in it on its terms. The arc shift from transaction to claim is the world's tonal arc rendered through one body."]

---

## APPENDIX: QUICK REFERENCE — WHAT GOES WHERE

*Use this as a checklist when filling out the World Seed. If you're unsure where something belongs, find its category here.*

### TIER 1 (World Lorebook — permanent, arc-agnostic)
- World rules and mechanics
- Factions and power structures
- Standing locations (appear in 2+ arcs)
- Species and types of beings
- World-level concepts (magic systems, historical events, cosmological facts)
- Sensory signature of the world

### TIER 2 (Character Lorebooks — permanent, arc-agnostic)
- Physical description — baseline anatomy only
- Psychological core
- Backstory
- All significant relationships
- Intimacy substrate — permanent (trauma map, body reactions, vulnerability shape, voice in intimacy, hard limits) — lives in the dedicated Intimacy Profile lorebook
- NPC profiles (in WorldDirector lorebook)
- Protagonist identity lorebook

### TIER 3 (Arc Lorebooks — active only during their arc)
- ARC_STATE: genre, tone, narrative state, goals, hidden information rules (CONSTANT)
- CHARACTER_STATE: physical and psychological state this arc (CONSTANT)
- Location variants: how a standing location looks/feels this arc
- NPC_SHIFT: how NPCs behave differently this arc (delta from baseline only)
- DRAMATIC_BEAT: entries that fire when specific story moments are triggered
- TENSION: what is at stake, what the clock is, what failure looks like
- INTIMACY_FUNCTION: what intimacy is for in this arc — thematic function, prose register, direction (CONSTANT, conditional)
- CHARACTER_INTIMATE_REGISTER: per-character arc-specific intimate behavioral delta (CONSTANT, conditional)
- INTIMATE_SCENE_TYPES, INTIMATE_HARD_RULES: arc-specific intimate scene framing (conditional)

### WHAT NEVER GOES IN TIER 2
- Arc-specific physical state (Anna's addiction symptoms belong in Arc 1 ANNA_STATE, not the Tier 2 physical entry)
- Relationship details that change across arcs (put the arc-specific shift in NPC_SHIFT)
- Plot events (those are dramatic beats, not character description)

### WHAT NEVER GOES IN TIER 1
- Anything that changes across arcs
- Character psychology (belongs in Tier 2)
- Story events (those are arc beats)

### WHAT NEVER GOES IN TIER 3
- Baseline character description (already in Tier 2 — don't repeat it)
- World rules that apply in every arc (already in Tier 1)
- Information about what happens in a different arc

---

## APPENDIX: CHECKLIST BEFORE SUBMITTING TO PIPELINE

**Section 1 — Core Concept & Tone:**
- [ ] Logline written
- [ ] Genre and tone per arc described
- [ ] Emotional payoff articulated
- [ ] Tonal rules listed

**Section 1.5 — Style Contract:**
- [ ] Perspective declared (or `DEFAULTS`)
- [ ] Tense declared
- [ ] Narration marker declared
- [ ] Dialogue marker declared
- [ ] Emphasis marker declared
- [ ] Paragraph register declared
- [ ] Style notes captured (or noted as N/A)
- [ ] Per-card overrides (if any) declared in Section 4 with non-empty structural rationales

**Section 2 — The World:**
- [ ] Setting described with specific sensory signature
- [ ] All world rules defined (with costs and consequences)
- [ ] All relevant factions described with trigger keywords
- [ ] All standing locations described with trigger keywords
- [ ] All non-human species/types described
- [ ] All recurring world concepts defined

**Section 3 — The Protagonist:**
- [ ] Identity, hidden layer, contradiction, power/limits defined
- [ ] Arc journey described

**Section 4 — Characters:**
- [ ] Every AI-played character has: psychological core, shield, crack, voice pattern, opening scenario, first message, example exchanges
- [ ] Every character has a physical baseline description
- [ ] Every character has a state entry per arc
- [ ] Every NPC has a profile with speech pattern and arc behavior
- [ ] LLM behavioral instructions written for each card (with arc-range qualifiers)
- [ ] For characters with intimate scene presence: substrate (trauma map, body reactions, vulnerability shape, voice in intimacy, hard limits) and arc-specific evolution filled out

**Section 5 — Arcs:**
- [ ] Every arc has: genre tag, thematic description, dramatic beats, hidden information rules, NPC shifts, entry and exit triggers
- [ ] Arc entry and exit triggers are specific events, not states

**Section 6 — Technical:**
- [ ] Lorebook structure matches actual content (including intimacy profile and register files where applicable)
- [ ] Arc count matches arc count in Section 5

**Section 7 — Test Scenarios:**
- [ ] 3–5 specific scenarios listed
- [ ] At least one intimate scenario listed if the world contains intimate content

**Section 8 — Intimacy & Sexuality (skip entirely if not applicable):**
- [ ] World-level posture defined with notes
- [ ] World-level tonal hard rules listed
- [ ] World-level prose register described
- [ ] Per-arc thematic function, prose manifestation, direction, and live scene types specified for every arc with intimate beats
- [ ] Cross-arc intimacy trajectory described (recommended)