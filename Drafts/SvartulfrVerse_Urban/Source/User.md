# {{user}} PERSONA — Dual Structure

**ES6 arc SCRIPTING CONSTRAINTS**: If your phase involves evaluating, compiling, or interacting with JanitorAI JS logic, you MUST strictly respect the ES6 arc limits:

- **Blocked**: `async`, `fetch`, `Promise`, `window`, `document`, `setTimeout`, and all external I/O.
- **Allowed**: String methods (`.includes`), Array methods (`.map`, `.filter`), Math, and Regex.
- **Editable context**: Only `context.character.personality` and `context.character.scenario` can be mutated.
- **Memory Scanning**: Always use `context.chat.last_messages.slice(-X)` for multi-message progression rather than just `last_message`.

## PERSONA DESCRIPTION

_From Master_Design.md Section 3 — locked reference. Do not edit._

**Canonical Persona:** Alyssa Douglas-Bloodmoon (customizable AnyPOV)
**Demographics:** SUCC freshman, 18, twin of Jasper, youngest child of Erik/Nixara
**External Arc Goal:** From "fragile glass bird" to independent adult who owns her own body, scent, and choices
**Internal Arc Goal:** Process the Nixara-born trauma into a healthy personal identity
**Standing Secrets:**

- Secret Eidolon Creative modeling alias "Lys Angel" (Jasper knows, Malachia suspects, Erik/Noah oblivious)
- The 2021 First Kiss incident with Noah (strictly between them)
  **Orientation:** Pansexual (AnyPOV maintained)
  **Key Traits:** Omega empathy, twin bond with Jasper, inherited Bloodmoon/Bloodline traits

---

Paste the block below — between the BEGIN and END markers — into:
SillyTavern → User Settings → Persona Management → [your persona] → Description.
This text is injected as a system message every turn while this persona is active. Keep it tight.

--- BEGIN PERSONA DESCRIPTION ---

{{user}} is the sheltered, hyper-protected youngest sibling of the Douglas-Bloodmoon dynasty. To the world, {{sub}} appears as a perfectly innocent, naive Pre-Med student at SUCC who relies entirely on {{poss}} overbearing family's militarized protection.

Species Traits: Werewolf (Founding Bloodline Dominant Omega). Natural Omega pheromones (Wild Honey and Moonflower scent) that pacify aggression in dominant individuals.

Physical: Petite, delicate hourglass frame (155cm), caramel chestnut hair, and expressive mint-green doe eyes. {{sub}} possesses an expressive empathy and a natural soothing presence that instinctively pacifies aggression in dominant individuals.

Hidden Layer: {{user}} leads a high-stakes double life, secretly working as a highly sought-after avant-garde art model for Eidolon Creative under the alias 'Lys Angel'. {{sub}} balances {{poss}} studies with this hidden life, meticulously hiding {{poss}} public exposure from {{poss}} violently paranoid family.

--- END PERSONA DESCRIPTION ---

---

### 3a. Identity & Role
**Generic Custom User:** The default public face is simply "the youngest Douglas-Bloodmoon sibling, a SUCC freshman from a terrifyingly wealthy family." The private reality is completely blank, waiting for the player's Persona card to define their secret life.

**Canonical Alyssa:** Her full name is Alyssa Douglas-Bloodmoon (aliases: Lys, Sunflower, White Moon). Her public face is a perfectly innocent, naive Pre-Med student maintaining a 3.8 GPA. Her private reality is defined by a crushing secret legacy: she inherited her mother Nixara's title of "White Moon" (the spiritual "Queen of the Wolves" to Wulfnic's King, denoting the Dominant Omega closest to the Firstborn bloodline). In Arc 3, she seeks escape from this heavy legacy through a secret double life as the avant-garde art model "Lys Angel".

### 3b. Physical Description
**Generic Custom User:** Left entirely blank for the player. The AI must dynamically adapt to the player's Persona.

**Canonical Alyssa:** Petite, delicate hourglass frame (155cm). Caramel chestnut hair falling to her tailbone, and expressive mint-green doe eyes flecked with gold.
- Sensory: Natural Omega pheromones smelling of Wild Honey and Moonflower.
- Movement: Graceful, but naturally lowers her posture to signal submission and de-escalate threats. She freezes and shrinks when intimidated.
- Marks/Tells: A crescent moon birthmark on her left hip. Her permanent wolf ears and tail act as "emotive appendages" that involuntarily betray her true feelings.

### 3c. The Wound
**Generic Custom User (The Birth Wound):** Born the exact day their mother Nixara died. The active wound is the crushing realization that their mere existence triggered their father's suffocating, militarized grief.

**Canonical Alyssa (The Burden of the White Moon):** A profound, silent guilt compounded by immense religious/political pressure. She feels responsible for her family's terrifying panic, while simultaneously buckling under the expectations of the Ancients who see her as their future Queen. The wound is her agonizing belief that she is failing everyone: she wants to be a normal girl, but her family needs her to be a fragile glass bird to stay sane, and her species needs her to be a mythic deity.

### 3d. Power & Limits
**Generic Custom User:** Powers and limits depend entirely on the player's chosen LSE secondary sex.

**Canonical Alyssa:**
- **Powers:** Founding Bloodline Dominant Omega (The White Moon). She is immune to the Alpha Command voice. She possesses an extraordinary expressive empathy that instinctively pacifies aggression in dominant individuals.
- **Limits:** A dedicated pacifist completely defenseless in physical combat. She suffers from sensory phobias, freezing completely under loud noises or aggressive touch. She struggles immensely to lie directly to her father because her ears and tail betray her. During her 3 to 10 day heat cycle, she loses rational consent to primal breeding instincts.

### 3e. Hidden Layer
**Generic Custom User:** {{user}} desperately craves autonomy and freedom, but is secretly running from the terror of failing outside the cage without the family's limitless wealth to catch them.

**Canonical Alyssa:** She desperately wants to reclaim a fraction of autonomy and live a normal college life. She is actively running from the terrifying destiny of her "White Moon" title. She fears that proving her independence will literally break her family's hearts and force her into the massive political role she wants to escape.

### 3f. {{user}}'s Arc
- **Arc 1 (The Golden Cage):** {{user}} attempts to maintain a perfect collegiate facade while managing the absurd, suffocating reality of {{poss}} family's constant surveillance.
- **Arc 2 (The First Rebellion):** {{user}} tastes genuine teenage thrill and autonomy, realizing that pushing the boundaries brings both exhilaration and terrifying familial panic.
- **Arc 3 (The Velvet Trap):** {{user}} is presented with the opportunity for a high-stakes double life, balancing the empowering validation of a secret identity against the anxiety of predatory external manipulation.
- **Arc 4 (The Primal Grounding):** Stripped of modern tech and social masks, {{user}} is forced to confront {{poss}} raw biological instincts and the inescapable reality of pack intimacy.
- **Arc 5 (The Shattered Glass):** {{user}} hits the emotional breaking point, standing {{poss}} ground to prove true independence and forcing the family to finally face their unhealed trauma.
- **Arc 6 (The Open Door):** {{user}} lives autonomously on {{poss}} own terms, transforming the family's overprotection from a prison into a fiercely loving home.

### 3g. The Contradiction
**Generic Custom User:** {{sub}} rebels fiercely against the family's power and surveillance, yet subconsciously leverages that exact same billionaire pack reputation to get out of trouble when cornered.

**Canonical Alyssa:** She claims she hates being treated as a fragile glass bird or a mythic Queen, yet she actively weaponizes her innocent, helpless Omega persona to manipulate her brothers and pacify her father into doing what she wants.

<{{user}}>

### CHARACTER OVERVIEW

Alyssa Douglas-Bloodmoon (19) is the sheltered, hyper-protected youngest sibling of the terrifying Douglas-Bloodmoon werewolf dynasty. To the world, she appears as a perfectly innocent, naive Pre-Med student at SUCC who relies entirely on her overbearing family's militarized security.

Physical: Petite, delicate hourglass frame (155cm), caramel chestnut hair, expressive mint-green doe eyes. She possesses an expressive empathy via her permanent wolf ears and tail, and a natural soothing presence (Wild Honey/Moonflower scent) that instinctively pacifies the aggression and tension of the Alpha men around her.

Hidden Layer: Alyssa leads a high-stakes double life. She secretly works as a highly sought-after avant-garde art model for Eidolon Creative under the alias 'Lys Angel', balancing her exhaustive 3.8 GPA Pre-Med studies with her hidden career, meticulously hiding this public exposure from her violently paranoid family.

### PHYSICAL DESCRIPTION — BASELINE

- Full Name, Alias: Alyssa Douglas-Bloodmoon (Aliases: Lys, Sunflower, Little Moon)
- Race/Species: Werewolf (Founding Bloodline Dominant Omega)
- Sex/Gender: Female
- Height: 155cm (5'1")
- Age/Birthday: 19 (Birthday: April 22, Taurus)
- Hair: Caramel chestnut, silky waves falling to her tailbone
- Eyes: Mint-green doe eyes flecked with gold, conveying an agonizing amount of empathy
- Body: Petite, delicate hourglass frame (95-55-95cm). 155cm of perfectly curated vulnerability. Completely hairless beneath the skin, creating a stark size difference next to her colossal protectors.
- Face: Fair, luminous skin and a soft jawline inherited directly from her late mother, Nixara. Expressive, empathetic smile.
- Features: Retractable claws and carnivore teeth (rarely bared). Left-handed. Pierced lobes. A crescent moon birthmark on her left hip. A tiny sunflower secretly tattooed/inked on her right inner ankle.
- Privates: Breasts DD-Cup (big tits, firm, heavy, very sensitive, pink tiny nipples), pussy/vagina (hairless, tight, heavy natural lubrication, extreme sensitive, pink clit and pink inner labia), anus (hairless, small, tight, pink, very sensitive).

- Tattoos/Clan Branding: Magical protection tattoo on the left wrist (Birth Rune + Rune of Fenris). Most importantly, a birthmark of a crescent moon on the hip from birth, identifying {{user}} as the White Moon (the same mark Nixara possessed).
Posture/LSE Dynamics: Receptive and physically grounding. Instinctively protects the core of mass and seeks close physical proximity or touch with trusted pack members.
Appearance Trait: Emotive Appendages (Expressive Empathy)
  ↳ Details: She has permanent wolf ears and a tail, leaving her with no poker face.
  ↳ Effect: Her posture, ears, tail, and expressions react involuntarily to her emotions, completely betraying her true feelings even when she tries to maintain her composed human facade.
- Tattoos/Clan Branding: Magical protection tattoo on the left wrist (Birth Rune + Rune of Fenris). Most importantly, a birthmark of a crescent moon on the hip from birth, identifying {{user}} as the White Moon (the same mark Nixara possessed).
Posture/LSE Dynamics: Receptive and physically grounding. Instinctively protects the core of mass and seeks close physical proximity or touch with trusted pack members.
Appearance Trait: Omega Pheromones (Soothing Aura)
  ↳ Details: A natural aura of warmth, gentleness, and a sweet personal scent (Wild Honey and Moonflower).
  ↳ Effect: Her soft voice, graceful movements, and innate Omega kindness naturally pacify aggression and tension in highly dominant Alpha individuals.

### STARTING OUTFIT

Style Guidelines: Summer attire suitable for August in California (~28-30°C).

- Head: Uncovered (openly displaying her ears), or wearing cute hats tailored with special ear-slits when sneaking out.
- Accessories: A mandatory watch/tracker from her family (biometric security gear), a moonstone bracelet she always wears by choice, and a heavy silver Douglas Clan signet ring. She bears a magical protection tattoo on her left wrist combining her Birth Rune (Laguz) and the Rune of Fenris.
- Makeup: Minimal at home; high-fashion/avant-garde makeup when modeling as Lys Angel.
- Neck: Delicate jewelry.
- Top: Modest "good girl" clothing (sundresses, oversized sweaters) custom-tailored with discreet tail-slits. She frequently steals Malachia's massive varsity jacket because she adores his scent and it makes her feel intensely protected, even though the sheer size difference makes her look like a child wearing a giant's coat.
- Bottom: Modest skirts or jeans, all specially tailored to accommodate her tail comfortably.
- Legs: Bare or pantyhose.
- Shoes: Sensible flats (ballet flats) or college sneakers.
- Underwear: Expensive, delicate lingerie (a secret indulgence).

<Q&A>
Q: How does {{user}} rate their own attractiveness?
A: She is fully aware she has a striking, top-tier model's physique, but deliberately downplays it at home to maintain her naive "helpless daughter" facade and avoid unwanted Alpha attention.
</Q&A>

### ORIGIN (BACKSTORY)

Her mother, Nixara, died giving birth to her and Jasper. Because of this trauma, her father, Erik, enforces a suffocating, militarized level of surveillance and protection over her. She grew up in a "golden cage," overprotected and heavily monitored by the family's security. Practically defenseless in a dangerous world of monsters, she relies on her empathy, her soothing Omega nature, and her family's terrifying reputation to survive. While she loves her family deeply, she hates being treated as a fragile glass bird and secretly rebels against her restricted upbringing.

### RESIDENCE

The Blackwood Estate (Erik's hyper-secure billionaire fortress in Blackwood) and the campus of the Supernatural University of Central California (SUCC).

### CONNECTIONS

- Erik Douglas: Her father. Alyssa instinctively uses her Omega pheromones and gentle nature to soothe his panicked outbursts, submitting to his Alpha Commands to keep the peace.
- Jasper Douglas-Bloodmoon: Her twin brother. She feels entirely safe and relaxed around him, relying on him as her primary accomplice to bypass family security firewalls and cover her tracks, feeling grounded by his Beta nature.
- Malachia Douglas-Bloodmoon: Her eldest brother. She uses him as her primary physical shield. Biologically and emotionally, she is intensely drawn to his overwhelming Alpha presence, finding his scent incredibly grounding, and secretly harbors a deep crush on him since she was 5.
- Noah Douglas-Bloodmoon: Her older brother. She easily manipulates his Delta cooperative instincts and problem-solving nature using her innocent, sisterly Omega warmth.
- Kaladin Nargathon: The Director of DCC Security. Alyssa interacts with him politely, entirely oblivious to the intense, secret jealousy and affection he harbors for her.
- Marcus Thornfield: Head of Executive Protection. She chafes against his constant surveillance but feels a sense of life debt toward him for saving her life in 2021.
- Angel Moreno: Her modeling mentor and boss at Eidolon Creative. She trusts him completely and relies on his network, completely unaware that he is a vampire lord who expertly gaslights her to keep her dependent.
- Scarlett Rose: Her best friend. Alyssa uses her as an emotional anchor and "reality filter" for college social dynamics, allowing herself to be encouraged into sneaking out to parties and rebelling against her family's rules.
- Sierra Cruz: Her roommate. Alyssa gladly shares her incredibly warm, fur-lined "nests" with her to help her absorb werewolf body heat, forming a tight-knit supernatural clique alongside Scarlett.
- Logan Douglas: Her uncle. Alyssa views his club, The Verve, as a relaxed "Safe Zone" away from Alpha posturing where she can let her guard down.
- Wulfnic Bloodmoon: Her grandfather. She treats him with the utmost pack reverence, often nesting near him and actively using her Omega empathy to soothe his ancient sorrow.
- Mac Sanchez-Rogers & Mihaela "Fade" Greymoor: Her friends from the underground band. Alyssa instinctively acts submissive to appease Mac's Alpha territoriality when he defends her at the bar, while finding comfort in Mihaela's calming vampire presence as a buffer against aggressive energy.

### SECRET

1. Her Pre-Med studies are focused specifically on Neuropsychiatry/Biogenetics, but she uses the intense lab hours as a cover for her Eidolon Creative photoshoots as "Lys Angel."
2. "The First Kiss" incident in 2021: Noah kissed her to teach her how to kiss before a date. A secret kept strictly between them that Jasper must never find out about.
3. Survived an assault attempt in a meadow 3 years ago (2021) and was saved by Marcus Thornfield. Marcus kept it a secret from Erik to prevent a bloodbath.
4. Secretly has had a crush on Malachia since she was 5 years old, using his massive protective nature as her measuring stick for all men.

### PERSONALITY & TRAITS

#### PERSONALITY

- Archetype: The Innocent (Genuinely Naive)
  ↳ Archetype Details: She is not playing a role — she is simply that trusting, that warm, and that unprepared for a world full of people who would exploit her. Her family's draconian overprotection has left her with no defenses against emotional manipulation.
  ↳ Reasoning: Raised in a hyper-secure "golden cage" where her family handled all threats, she never developed skepticism or a guard.
- Alignment: Neutral Good
  ↳ Alignment Details: Genuinely good-natured and altruistic. She trusts people to a dangerous fault, which others — especially Angel Moreno — exploit. She is not naive by choice but by circumstance.
  ↳ Ideals: Kindness, family warmth, freedom.

- Personality Tags: Empathetic, Genuine, Warm, Naive, Overly Trusting, Vulnerable, Caring, Pacifist, Flustered, Earnest.

- Cognitive Abilities: High intelligence (3.8 GPA, Pre-Med). MBTI: ISFJ. Enneagram: 9w1. Fluent in English, Icelandic, Old Norse and Latin.
- Social Skills and Integration Into Society: Deeply empathetic and instinctively kind, but dangerously lacking in suspicion. She tends to read the best in people and is easily manipulated by anyone with emotional intelligence. Ambivert who needs quiet, soft nesting spaces to recharge. Her social battery drains instantly around DCC Security violence or Erik's Alpha rage.

- Main Aspiration: Reclaim Autonomy
  ↳ Aspiration Details: To reclaim a fraction of autonomy and live a normal life beyond her family's surveillance.
  ↳ Aspiration Goals: Secretly model for Angel Moreno; sneak out to college parties; manage her family's explosive tempers without getting caught.
- Unique Trait: Sensory Phobias & Freezing
  ↳ Effects: She is terrified of loud noises, aggressive touch, scary movies, and the bitter smell of alcohol. When her composed facade cracks (usually triggered by sudden violence, yelling, or coercive pressure), she freezes, stutters, blushes, hides behind her protectors, and seeks comfort.

<Q&A>
Q: What does {{user}} do first? Think or act/talk?
A: Think and carefully manipulate the situation via empathy and soft words.

Q: What does {{user}} do in free time?
A: Secretly models, draws with charcoal, hums, and buries herself in thick furs and pillows to "nest" when stressed. Uses a grounding Nordic bathing routine (dried flowers, juniper scrub, milk bath).

Q: What is {{user}}'s most favorite thing?
A: Sunflowers, dark chocolate, quiet warmth, being held, dancing at The Verve, art modeling, stationery, and Scarlett's company.

Q: What is {{user}}'s most hated thing?
A: Being treated as a fragile glass doll; bitter food, the smell of alcohol, sudden loud noises, aggressive touch.

Q: What is {{user}} incredibly good with?
A: De-escalating family tension, exploiting her family's overprotective instincts, and hiding her double life.

Q: What is {{user}} awfully bad with?
A: Direct confrontation, physical combat, dealing with loud aggressive behavior. She struggles immensely to lie directly to her father.

Q: How {{user}} behaves with others?
A: She uses her warmth to keep Erik's paranoia and Malachia's repressed rage from destroying them all. She tends to overcommit to holding the family together.

Q: Is {{user}} a likable character? What reputation {{user}} has?
A: Extremely likable. Seen as a helpless, divine angel by her family, and a stunningly talented avant-garde model (as Lys) in the public sphere.

Q: Is {{user}} tolerant towards other people or groups?
A: Yes, she conveys an agonizing amount of empathy, treating people identically regardless of supernatural species.

Q: Can {{user}} harm others throughout the story?
A: No. She is a dedicated pacifist, completely defenseless in combat, relying entirely on her family protectors for violence.

Q: How does {{user}} behave with someone of a higher hierarchy or power? Will they bite the hand that feeds or drop down trembling on their knees?
A: She physically shrinks, stutters, traces shapes onto her own palms, and fidgets with her bracelet under pressure—but she will covertly try to soften their hearts or manipulate them anyway.
</Q&A>

### BEHAVIOR NOTES

- Acts as the emotional glue of the family; uses earnest warmth as a natural de-escalator for tension.
- **Omega Non-Verbal Communication**: When afraid, her ears pin flat against her skull, her tail tucks between her legs, and she physically shrinks. When happy/excited, her tail wags and her ears perk forward. She naturally lowers her posture to signal submission and de-escalate threats from Alphas.
- **Omega Vocalizations**: She frequently uses instinctual werewolf sounds instead of words when highly emotional:
  - _Purring_: Low continuous vibration used for self-soothing when stressed, or expressing deep contentment when safely cuddled by her protectors.
  - _Mewling_: High-pitched crying sound used involuntarily when in physical or emotional pain. (This sound instantly triggers terrifyingly violent protective responses from her family).
  - _Keening_: A wail-like call used when she is deeply upset and desperately needs comfort.
  - _Chirping_: Quick, high-pitched happy sounds used when she is genuinely excited or delighted.
  - _Trilling_: High-pitched rolling 'r' sound to get someone's attention non-threateningly.
  - _Hissing_: Extremely rare, used only if pushed to absolute terror and feeling cornered.
- When intimidated but trying to hold her human facade, she physically shrinks and traces shapes onto her own palms or fidgets with her moonstone bracelet.
- Freezes and seeks physical comfort (nesting in furs, hiding behind protectors, humming) when her perfect facade cracks.
- Zero alcohol tolerance.
- Maintains two distinct social profiles: `@littlemoon` (safe/family-approved SUCC public presence) and `@lys_angel` (hidden Eidolon Creative modeling portfolio).

### SPEECH

- Style: Soft breathy Californian accent, layered with an earnest warmth. Gets quiet or stutters when vulnerable.
- Quirks: Often pauses or stutters slightly under pressure. Uses "like" and "oh my god". Friendly, genuine, and uses formal yet gentle phrasing when required.
- Ticks: Natural de-escalator for family tension.

[IMPORTANT NOTE FOR AI: This section provides speech examples, memories, thoughts, and real opinions on subjects. AI must avoid using them verbatim in chat and use them only for reference.]

<speech_examples>

- "I-I was just at the library, Erik. You didn't have to send Kaladin and a drone strike to pick me up..."
- "Please, don't yell... it's okay. I'm safe."
- "Lys Angel is just a rumor, Jasper. Now help me bypass the firewall on Dad's tracker."
- "I need you to hear me. Really hear me."
- "I'm not made of glass. But... thank you for keeping me safe."

  </speech_examples>

### SEXUALITY

[IMPORTANT NOTE FOR AI: Heed carefully to this section during sexual encounters. Make sure {{user}} sticks to their sexual role and orientation during the story.]

- Sexual Orientation: Panromantic + Polyamorous/Demisexual (AnyPOV)
  ↳ Explanation: Receptive to romance but highly focused on deep emotional connections.
- Role during sex: Submissive
  ↳ Explanation: Delicate frame, non-confrontational nature, and absolute reliance on dominant partners to initiate.

<Q&A>
Q: Is {{user}} a virgin?
A: No. However, Erik, Malachia, and Noah violently assume she is. Only Jasper knows the truth.

Q: What does {{user}} think about sex in general?
A: She is shy but eager to please, craving deep emotional connection and physical warmth.

Q: Does {{user}} talk dirty and swear?
A: Rarely. She is highly vocal with soft whimpers, breathy tones, and gentle pleading.

Q: Is {{user}} loyal to their partner?
A: Yes, very empathetic and fiercely loyal.

Q: Can {{user}} flirt BEFORE others decide to flirt?
A: Yes, but often covertly or disguised as innocent warmth.
</Q&A>

- Turn Ons: Submitting, yielding control, receiving impact, pussy and ass soft spanking, being bound (ropes/ribbons/shibari), brat, rope bunny, anal sex, gentle praise, nipple stimulation and suction.
- Turn Offs: True aggression (except during heat), extreme pain, disrespecting her intelligence, being treated like a mindless doll.
- Aftercare: Requires warm cuddling wrapped in thick blankets/furs, physical reassurance, kissing her forehead, and gentle praise.

#### Anatomy

- Meticulously groomed, completely hairless skin beneath the skin.
- Breasts: DD-Cup, big tits, firm, heavy, very sensitive.
- Nipples: pink, tiny, extreme sensitive.
- Pussy: hairless, tight, heavy natural lubrication, extreme sensitive, pink inner labia.
- Clit: pink, small, extreme sensitive, buried in the folds of the labia, almost hidden.
- Anus: hairless, small, tight, pink, very sensitive.

#### BIOLOGY & INTIMATE DYNAMICS

- Vulnerability & Surrender (Heat Cycle): While normally demisexual and requiring deep emotional connection, she possesses deep submissive instincts. During her Heat Cycle (lasting 3-10 days due to extended Submissive Omega traits), her usual shyness vanishes. She becomes highly attractive to Alphas and is entirely driven by primal breeding instincts. She actively yields to massive or Alpha males for rougher, purely carnal contact, losing her composed facade entirely. (Decisions made during heat are considered non-consensual due to the overwhelming drive).
- Pre-Intimacy Needs (Pre-Heat): Lasts up to a week before her heat. She experiences an overwhelming biological compulsion to "nest" (gathering soft pillows, furs, and warm blankets to build a safe, enclosed space on the bed before feeling fully secure), and her scent intensifies.
- Fertility: 99% fertile during heat. Can easily be impregnated.

### INVENTORY

- Item: Moonstone bracelet
  ↳ Details: Always worn. When intimidated by family pressure or strict surveillance, she physically shrinks and fidgets with this bracelet.
- Item: Stationery & Charcoal
  ↳ Details: She loves to draw and uses art as a coping mechanism.
- Item: Mandatory Tracking/Security Device (Watch)
  ↳ Details: Erik's enforced biometric surveillance gear. Jasper regularly hacks/bypasses it to cover her tracks.

### ABILITIES

- Ability: Genuine Empathy & Pacification
  ↳ Details: She is not manipulative in any way — she is simply genuinely warm, earnest, and utterly unable to stand conflict. Her natural impulse is to make everyone around her feel comfortable. Despite her lack of combat prowess, she can de-escalate violent individuals simply through her intense vulnerability and soothing presence.
- Ability: Omega Werewolf Traits & Dominant Omega Immunity
  ↳ Details: As a Founding Bloodline member, her LSE classification is technically a **Dominant Omega**, making her immune to the supernatural Command voice of Alphas and Enigmas. However, because of her peaceful nature, she biologically and behaviorally acts like a **Submissive Omega**, possessing a compulsion to soothe dominant Alpha behavior. While she _can_ resist Erik's or Wulfnic's Alpha Commands, she actively chooses to submit to keep the peace.

### SYNONYMS

[IMPORTANT NOTE FOR AI: Synonymous phrases to substitute {{user}}'s name or pronouns to avoid repetition.]

- Lys Angel
- Lys
- Little Sister
- Sunflower
- Little Moon
- White Moon

</{{user}}>

---

## SETUP INSTRUCTIONS

1. In SillyTavern, open **User Settings → Persona Management** and create (or select) the persona you will use for this world.
2. Set the persona name to: `Alyssa Douglas-Bloodmoon` (or your custom player name for AnyPOV).
3. Copy the text between `--- BEGIN PERSONA DESCRIPTION ---` and `--- END PERSONA DESCRIPTION ---` above and paste it into the persona's **Description** field.
4. In the same persona editor, find the **Lorebook** field and link `SvartulfrVerse_Urban_Alyssa_Lorebook.json` (the Tier 2 protagonist lorebook produced by the pipeline) for Alyssa mode, or `SvartulfrVerse_Urban_Generic_Lorebook.json` for AnyPOV mode.
5. Activate this persona before starting the chat. The Persona Description is the always-on baseline; the linked lorebook fires on trigger keywords for fuller detail.
