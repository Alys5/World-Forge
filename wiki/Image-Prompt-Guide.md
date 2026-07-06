# Image Prompt Generation Guide (PixAI / NovelAI / Danbooru Tags)

This guide outlines the standard rules and best practices for generating image prompts, specifically tailored for PixAI, NovelAI, and models trained on Danbooru-style tags.

## 1. Prompt Anatomy

Every image prompt should be constructed using four distinct layers of information, added in the following order:

1. **The Subject (Red Line)**
   Who or what the picture focuses on. This includes physical descriptors (hair color, eye color, clothing, sex, etc.).
   *Example: `1girl, short hair, black hair, jeans, t-shirt`*

2. **Pose Information (Green Line)**
   How the subject is posed and their expression.
   *Example: `looking at viewer, hand on hips`*

3. **Miscellaneous & Background (Blue Line)**
   The environment, background, and overarching thematic colors. Keep it general rather than overly specific.
   *Example: `convenience store background, indoors, dark theme`*

4. **Image Descriptors (White Line)**
   Keywords that influence the model's output quality, style, and artist imitation.
   *Example: `detailed, masterpiece, high quality`*

**Full Prompt Example:**
> `1girl, short hair, black hair, orange eyes, jeans, t-shirt, looking at viewer, smiling, convenience store background, indoors, detailed, masterpiece`

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

### 1. Blocco STILE (Fixed, always use identically):
```text
masterpiece, best quality, ultra-detailed, semi-realistic, painterly realism, photorealistic skin texture, soft cinematic lighting, balanced natural lighting, subtle golden hour glow, niji style, natural anatomy, highly detailed face, close-up portrait, shallow depth of field, bokeh background, california beach promenade background, palm trees, blurred buildings, soft afternoon light, balanced color grading, neutral white balance
```

### 2. Negativo Fisso (Fixed, always use identically):
```text
NSFW, lowres, worst quality, low quality, bad anatomy, bad hands, extra fingers, mutated hands, deformed face, asymmetrical eyes, plastic skin, sepia tone, orange color cast, warm color grading, watermark, signature, text, cropped, blurry face, absurd, messy lineart, sloppy lineart, rough edges, jagged edges, artifacts, jpeg artifacts, noise, smudge, blurry details, unfinished, unclear edges
```

### 3. Settings Fissi (Confirmed):
- **Steps:** 7-8
- **Sampler:** Euler a
- **CFG:** 1.6-2.0
- **VAE:** Liquid9745VAE or Default
- **LoRA Niji semi realism:** 0.75-0.85
- **LoRA Add More Details:** 0.3

### 4. Blocco PERSONAGGIO (Modular, replace per character):
Here, insert *only* the specific traits — sex/gender, race, body type, hair, eyes, outfit, distinctive accessories.
