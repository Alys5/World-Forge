# Image Prompt Generation Guide (PixAI / NovelAI / Danbooru Tags)

**ES6 SANDBOX SCRIPTING CONSTRAINTS**: If your phase involves evaluating, compiling, or interacting with JanitorAI JS logic, you MUST strictly respect the ES6 Sandbox limits:
- **Blocked**: `async`, `fetch`, `Promise`, `window`, `document`, `setTimeout`, and all external I/O.
- **Allowed**: String methods (`.includes`), Array methods (`.map`, `.filter`), Math, and Regex.
- **Editable context**: Only `context.character.personality` and `context.character.scenario` can be mutated.
- **Memory Scanning**: Always use `context.chat.last_messages.slice(-X)` for multi-message progression rather than just `last_message`.


> [!WARNING]
> **ARCHITECTURE UPDATE**: The monolithic `Janitor_Lorebook_Script.js` is deprecated. The World-Forge pipeline now uses a strict 4-template domain system for ES6 scripts: `World`, `Family`, `NPC`, and `NSFW`. Ensure any manual script or prompt alignment respects this new separation of concerns.

This guide outlines the standard rules and best practices for generating image prompts, specifically tailored for PixAI, NovelAI, and models trained on Danbooru-style tags.

## 1. Prompt Anatomy

Every image prompt should be constructed using a highly granular, **Modular 5-Layer Structure**. This approach (used heavily for the Presa Ancestral and Alyssa prompts) provides extreme control over character aesthetics and staging.

1. **Prefix / Global Style**
   High-level quality tags and overarching aesthetic styles placed at the very beginning.
   *Example: `(masterpiece), best quality, amazing quality, ultra-detailed, semi-realistic, niji style, BREAK`*

2. **Core Subject**
   Who or what the picture focuses on. This establishes the base entity.
   *Example: `1girl, solo, werewolf girl, kemonomimi, highly detailed face`*

3. **Granular Details (Body & Outfit)**
   Break down the character's physical traits into distinct categories:
   - `head:` (eyes, face shape, expressions, makeup)
   - `hair & tail:` (color, style, texture)
   - `body:` (physique, skin texture)
   - `hands:` (pose, structure)
   - `outfit:` (clothing layers, accessories, footwear)

4. **Staging (Pose, Environment, Lighting, Atmosphere)**
   Define the physical space and the character's interaction within it:
   - `pose:` (stance, gaze, camera angle like close-up)
   - `environment:` (location, background details)
   - `lighting:` (cinematic lighting, rim light, time of day)
   - `atmosphere:` (mood, energy)

5. **Post-processing & Color**
   Final rendering directives placed at the very end.
   - `style:` (anime style, realistic, UI instructions)
   - `color palette:` (warm tones, specific accents)
   - *Example: `4k, ultra detailed, cinematic, masterpiece, neutral white balance`*

---

## 2. Subject Tagging Advice

Since most base models are heavily trained on female anime art, specific tagging strategies are required depending on the subject.

### Generating Women
- Always start with `1girl` (or `multiple girls`, etc.).
- **Proportions:** Specify breast size using standard tags (`Large/Medium/Average/Small Breasts`).
  > [!WARNING]
  > Using size descriptors (especially `Large Breasts`) will often cause the model to sexualize the clothing. To prevent this, add `NSFW` to your **Negative Prompt**.
- **Hair:** Separate hair length and hair color for better results in NovelAI (e.g., `short hair`, `black hair`).
- **Eyes:** Heterochromia is notoriously difficult. It's often better to generate normal eyes and use **Inpainting** to fix each eye color individually.

### Generating Men
- Always start with `1guy`.
- > [!IMPORTANT]
  > Without specific modifiers, models will often generate female-looking characters even with the `1guy` tag. To fix this, use the tags `Handsome` and/or `Mature`.
  - `Handsome`: Generates typical younger anime men.
  - `Mature`: Adds adult features like facial hair and muscles.
- **Example:** `1guy, handsome, mature, short hair, black suit`

### Defining Features
Giving a character a specific identifying object (e.g., a hairclip, a wristwatch) helps make the character distinct, though it can sometimes be difficult for the AI to keep consistent.

---

## 3. Posing and Expressions

- **Faces:** The `looking at viewer` tag is highly recommended. It keeps the subject's face in full view, giving expressions much more impact.
- **Expressions:** Use clear, simple emotional tags like `smiling`, `irritated`, `crying`.
- **Weapons:** Models struggle heavily with firearms, swords, etc. You can try tags like `holding weapon` or `holding shotgun`, but expect to do multiple generations or use inpainting to fix the results.

---

## 4. Backgrounds and Themes

Pictures in a void are rarely interesting. 

- **Lighting and Themes:** `Dark Theme` is highly recommended as it trends toward darker clothing and a moody overall style that looks great. `Light theme` or `Colorful theme` are also viable.
- **Backgrounds:** Be broad and conceptual. Instead of micromanaging the background details, use sweeping tags like `vampire home lit by fireplace` or `convenience store, indoors`.

---

## 5. Image Descriptors & Stylization

The jury is out on exactly how much these impact the image, but the standard baseline includes:
- `High Quality`, `Detailed`, `Masterpiece`
- **Avoid:** Tags like `absurd` (creates weird styles) or `Raytracing` (doesn't work as expected).

### LORAs and Checkpoints
- **Recommended LORA:** `Add More Details`. Use it at a subdued strength (e.g., `0.3`) so it enhances the image (better textures, lighting, visible background items) without overwhelming the base model's strengths.
- **Recommended Model Style:** `Cetus Mix` combined with the `Add More Details` LORA gives a very pleasant, slightly "washed out" aesthetic.

---

## 6. Aspect Ratios

The dimensions of your picture greatly affect the AI's composition:
- **Portrait (Taller than wide):** The AI will focus heavily on a single character.
- **Landscape/Wide (Wider than tall):** The AI will focus more on the background and multiple characters.

---

## 7. Inpainting Best Practices

Inpainting allows you to fix specific parts of an otherwise perfect image (e.g., changing eye color, fixing an outfit). 

> [!TIP]
> **The Golden Rules of Inpainting**
> 1. **One thing at a time:** Never try to inpaint multiple unconnected areas at once. The AI will get confused. Focus on one uninterrupted space.
> 2. **Give it room to breathe:** Unless you need absolute precision, paint an area slightly *larger* than what you need to change. If you're fixing a hand, paint over the hand, the wrist, and some of the forearm. The model needs surrounding context to generate a natural replacement.
> 3. **Hands:** You probably aren't going to get the hands right. Hide them in the pose if possible, or prepare for a long battle.

---

## 8. Douglas-Bloodmoon Family Aesthetic (Standardized Prompting)

To maintain visual consistency across all characters of the Douglas-Bloodmoon family, use a strictly separated prompt structure. Keep the style and negative blocks identical every time, and only swap out the character-specific traits.

To maintain visual consistency across all characters of the Douglas-Bloodmoon family, use the granular prompt structure. Keep the style, negative block, and settings identical, swapping out only character-specific traits.

### Prompt Template:
```text
[Prefix / Global Style]
masterpiece, best quality, ultra-detailed, semi-realistic, painterly realism, photorealistic skin texture, niji style, BREAK

[Core Subject]
[1girl/1guy, natural anatomy, highly detailed face, close-up portrait]

[Granular Details]
head: [specifics]
hair: [specifics]
body: [specifics]
outfit: [specifics]

[Staging]
pose: [specifics]
environment: california beach promenade background, palm trees, blurred buildings
lighting: soft cinematic lighting, balanced natural lighting, subtle golden hour glow, soft afternoon light
atmosphere: [specifics]

[Post-processing]
style: shallow depth of field, bokeh background
color palette: balanced color grading, neutral white balance
```

### Negativo Fisso (Fixed, always use identically):
```text
NSFW, lowres, worst quality, low quality, bad anatomy, bad hands, extra fingers, mutated hands, deformed face, asymmetrical eyes, plastic skin, sepia tone, orange color cast, warm color grading, watermark, signature, text, cropped, blurry face, absurd, messy lineart, sloppy lineart, rough edges, jagged edges, artifacts, jpeg artifacts, noise, smudge, blurry details, unfinished, unclear edges
```

### Settings Fissi (Confirmed):
- **Steps:** 7-8
- **Sampler:** Euler a
- **CFG:** 1.6-2.0
- **VAE:** Liquid9745VAE or Default
- **LoRA Niji semi realism:** 0.75-0.85
- **LoRA Add More Details:** 0.3

---

## 9. Werewolf (Presa Ancestral) Aesthetic

To generate werewolves (specifically for the Presa Ancestral guild or similar dominant primal figures), use this highly detailed prompt structure to capture the dark fantasy, feral, and majestic atmosphere.

### Prompt:
```text
(masterpiece), best quality, amazing quality, ultra-detailed, absurdres, newest, very aesthetic, high resolution, cinematic dark fantasy, BREAK, depth of field, volumetric lighting

male wolf furry, anthropomorphic wolf, clearly a furry, humanoid body with a wolf head, tall and imposing, primal presence, apex predator aura, extremely attractive and dominant

head: wolf head, sharp muzzle, defined snout, thick fur, expressive wolf features, intense glowing amber eyes, predatory gaze, slightly narrowed eyes, confident and dangerous expression, subtle scars on the muzzle

fur: dense and well-groomed fur, dark gray base with black and silver highlights, soft but thick texture, slightly rough in some areas, visible layering and depth

body: muscular and highly defined physique, broad shoulders, strong chest, visible abs, powerful arms, thick forearms, narrow waist, wide hips, extremely strong thighs, athletic and primal build, balanced between humanoid and beast

hands: clawed hands, sharp black claws, strong grip, slightly tense fingers

legs: digitigrade legs (wolf-like), powerful calves, strong stance, stable and grounded

outfit:
tribal hunter aesthetic, dark and primal

– leather harness across the chest, minimal coverage, emphasizing the torso
– fur-lined shoulder piece made from hunted beasts
– layered belts and straps around the waist
– dark cloth draped asymmetrically, leaving legs partially exposed
– bone ornaments, teeth necklaces, claws attached to armor
– arm wraps and bracers made of leather and bone
– subtle red markings or war paint across the body

pose: dominant and confident stance, chest forward, shoulders relaxed but powerful, one hand resting on a weapon or hip, the other slightly raised, head tilted slightly downward with an intense gaze, alpha presence

environment: territory of the Presa Ancestral guild, wild forest mixed with rocky terrain, bones scattered, tribal markings on stones, faint fog, signs of hunting and dominance

lighting:
dramatic lighting with strong shadows
warm highlights mixed with darker tones
subtle rim light outlining fur and muscles

atmosphere:
feral, seductive, dominant, primal energy, aura of control and strength

style: realistic fantasy splash art, no UI, no text, no card frame

color palette: dark gray, black, brown, bone white, deep red accents
4k, ultra detailed, cinematic, masterpiece
```

---

## 10. Alyssa (Werewolf Girl) Aesthetic

To generate Alyssa (a werewolf girl with a gentle presence wearing her boyfriend's oversized varsity jacket), use this specific prompt and model configuration. This setup leverages a lower step count (Hyper model) for fast, high-quality generation.

### Prompt:
```text
(masterpiece), best quality, amazing quality, ultra-detailed, absurdres, newest, very aesthetic, high resolution, semi-realistic, painterly realism, photorealistic skin texture, niji style, BREAK, shallow depth of field, soft cinematic lighting, bokeh background

1girl, solo, werewolf girl, kemonomimi, highly detailed face, natural anatomy, relaxed and gentle presence, extremely attractive and approachable

head: highly detailed face, mint green eyes with gold flecks, creased eyes, double eyelid, detailed iris, light freckles across the nose and cheeks, gentle smile, minimal makeup, natural beauty, looking directly at viewer, uncovered head, openly displaying her fluffy wolf ears, animal ear piercing, silver ear cuff

hair & tail: long wavy hair, caramel chestnut hair color, highly detailed locks, soft texture, matching fluffy wolf tail behind her protruding through a custom tail-slit

body: feminine physique, natural anatomy, large breasts, soft skin with photorealistic texture, relaxed posture

hands: delicate hands, resting chin on hand, natural finger positioning

outfit:
modest "good girl" aesthetic mixed with boyfriend's clothes

– wearing a massive, oversized varsity jacket (Malachia's jacket), way too big for her, hanging loosely off her shoulders, making her look small and protected
– modest summer sundress underneath
– mandatory high-tech biometric security watch/tracker on one wrist
– delicate moonstone bracelet on the other wrist
– delicate sunflower necklace and layered necklaces
– (lower body context): modest skirt, bare legs, sensible college sneakers

pose: close-up portrait, resting chin on one hand, looking at viewer, relaxed pose, inviting and warm stance

environment: california beach promenade background, tall palm trees, blurred buildings in the distance, sunny coastal atmosphere

lighting:
soft cinematic lighting, balanced natural lighting
subtle golden hour glow, soft afternoon light
gentle rim light on her wavy hair

atmosphere:
warm, peaceful, relaxed, sunny, gentle summer energy

style: semi-realistic anime style, niji style, close-up portrait, no UI, no text

color palette: warm tones, caramel, mint green, gold accents, soft coastal blues and oranges, contrasting colors from the oversized varsity jacket
4k, ultra detailed, cinematic, masterpiece, neutral white balance, balanced color grading
```

### Settings Fissi per Alyssa:
- **Modello:** VXP_XL v2.2 (Hyper)
- **LoRA Add More Details (concept):** 0.3
- **LoRA Niji semi realism [Illustrious] (SDXL v3.5):** 0.7
- **Negativo:** `NSFW, lowres, worst quality, low quality, bad anatomy, bad hands, extra fingers, mutated hands, deformed face, asymmetrical eyes, plastic skin, sepia tone, orange color cast, warm color grading, watermark, signature, text, cropped, blurry face, absurd, messy lineart, sloppy lineart, rough edges, jagged edges, artifacts, jpeg artifacts, noise, smudge, blurry details, unfinished, unclear edges`
- **Steps:** 8
- **Sampler:** Euler a
- **CFG:** 1.5
- **VAE:** Liquid9745VAE
