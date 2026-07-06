import re

with open('d:/World-Forge/templates/World_Seed_Template.md', 'r', encoding='utf-8') as f:
    content = f.read()

# For Protagonist
protag_pattern = re.compile(r'(#### PROTAGONIST PHYSICAL DESCRIPTION.*?\n\n  \[Physical description.*?\]\n)')
protag_replacement = r'\1\n  **Avatar Image Prompt (PixAI / Danbooru):** [OPTIONAL. If generating an avatar, use the 4-layer structure: [Subject e.g. 1girl/1guy], [Pose/Expression e.g. looking at viewer], [Background/Theme], [Descriptors e.g. detailed, masterpiece]]\n'
content = protag_pattern.sub(protag_replacement, content)

# For Character Cards
card_pattern = re.compile(r'(#### CARD DATA\n)')
card_replacement = r'\1\n  **Avatar Image Prompt (PixAI / Danbooru):** [OPTIONAL. If generating an avatar, use the 4-layer structure: [Subject e.g. 1girl/1guy], [Pose/Expression e.g. looking at viewer], [Background/Theme], [Descriptors e.g. detailed, masterpiece]]\n'
content = card_pattern.sub(card_replacement, content)

with open('d:/World-Forge/templates/World_Seed_Template.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated World_Seed_Template.md")
