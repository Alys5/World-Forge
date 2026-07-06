import re

with open('d:/World-Forge/agent_roles/05_The_Prompt_Engineer.md', 'r', encoding='utf-8') as f:
    content = f.read()

rules_pattern = re.compile(r'(9\. \*\*Image Generation Taxonomy \(Danbooru\):\*\*.*?\n10\. \*\*Negative Prompting:\*\*.*?\n)', re.DOTALL)
rules_replacement = r'''9. **Image Generation Taxonomy (Douglas-Bloodmoon Standard):** You must assemble visual prompts using the strict modular formula: [BLOCCO STILE FISSO] + [BLOCCO PERSONAGGIO DINAMICO].
10. **Architectural Constants (Hardcoded):** When generating image prompts, you must always use these fixed constants:
    *   **Fixed Style Block:** masterpiece, best quality, ultra-detailed, semi-realistic, painterly realism, photorealistic skin texture, soft cinematic lighting, balanced natural lighting, subtle golden hour glow, niji style, natural anatomy, highly detailed face, close-up portrait, shallow depth of field, bokeh background, california beach promenade background, palm trees, blurred buildings, soft afternoon light, balanced color grading, neutral white balance. *(Note: You must keep the lighting fixed, but you may replace the specific location "california beach promenade background, palm trees" if the character requires a different contextual background for their Storefront).*
    *   **Fixed Negative Block:** NSFW, lowres, worst quality, low quality, bad anatomy, bad hands, extra fingers, mutated hands, deformed face, asymmetrical eyes, plastic skin, sepia tone, orange color cast, warm color grading, watermark, signature, text, cropped, blurry face, absurd, messy lineart, sloppy lineart, rough edges, jagged edges, artifacts, jpeg artifacts, noise, smudge, blurry details, unfinished, unclear edges.
    *   **Generation Parameters:** Always print these confirmed settings at the bottom of the output as a reminder for the rendering phase: Steps: 7-8, Sampler: Euler a, CFG: 1.6-2.0, VAE: Liquid9745VAE or Default, LoRA Niji semi realism: 0.75-0.85, LoRA Add More Details: 0.3.
'''
content = rules_pattern.sub(rules_replacement, content)

with open('d:/World-Forge/agent_roles/05_The_Prompt_Engineer.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated 05_The_Prompt_Engineer.md")
