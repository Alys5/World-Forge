import re

with open('d:/World-Forge/agent_roles/05_The_Prompt_Engineer.md', 'r', encoding='utf-8') as f:
    content = f.read()

rules_pattern = re.compile(r'(8\. \*\*Pass 1 \+ Pass 2 self-validation run before saving\*\* \(Section 5f\)\. Skipping these is the failure pattern this section exists to prevent\. Read your candidate output and check every box\.\n)')
rules_replacement = r'''\1
9. **Image Generation Taxonomy (Danbooru):** When drafting image generation prompts (e.g. for character avatars), you must strictly follow the 4-layer taxonomy: [Subject], [Pose/Expression], [Background/Theme], [Descriptors].
10. **Negative Prompting:** Always append standard safety and quality tags (e.g., NSFW) to negative prompts, especially if character clothing distortion is a risk.
'''
content = rules_pattern.sub(rules_replacement, content)

with open('d:/World-Forge/agent_roles/05_The_Prompt_Engineer.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated 05_The_Prompt_Engineer.md")
