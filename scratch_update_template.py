import re

with open('d:/World-Forge/templates/Janitor_Bot_Template.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace APPEARANCE DETAILS and STARTING OUTFIT blocks
appearance_pattern = re.compile(r'### APPEARANCE DETAILS.*?(?=<Q&A>)', re.DOTALL)

replacement_appearance = '''### PHYSICAL APPEARANCE

<!-- Describe the character\'s physical appearance in a concise narrative paragraph. Avoid bullet points. Focus only on traits that are immediately visible and relevant to the scenario. -->
<!-- e.g. [CharName] is a tall, athletic human male with short black hair and piercing orange eyes. He bears a distinctive scar across his cheek. -->

<!-- 
IMPORTANT DIRECTIVE FOR THE ARCHITECT:
DELEGATE, DON\'T DELETE: Any hyper-granular appearance details (exact measurements, hidden tattoos, detailed accessory descriptions) MUST NOT be placed here. Move them into the separate JS Lorebook/Script payload so they can be injected only when the user looks closely or asks about outfits.
-->

### STARTING OUTFIT

<!-- Describe what the character is wearing at the start of the scenario in a brief narrative paragraph. -->
<!-- e.g. Wearing a simple, dark traveling cloak over a worn leather tunic and sturdy boots. -->

'''

content = appearance_pattern.sub(replacement_appearance, content)

# Add TRIVIA MIGRATION to ORIGIN
origin_pattern = re.compile(r'(### ORIGIN \(BACKSTORY\)\s+<!--Describe a brief backstory for your character-->)')
origin_replacement = r'\1\n<!-- TRIVIA MIGRATION DIRECTIVE: Do NOT include long biographical history that does not dictate immediate turn-by-turn behavior. Move extended historical trivia into the Lorebook payload so it can be injected only when relevant. -->'
content = origin_pattern.sub(origin_replacement, content)

# Add ACTIVE PHRASING to PERSONALITY
personality_pattern = re.compile(r'(### PERSONALITY\s+)')
personality_replacement = r'\1<!-- ACTIVE PHRASING DIRECTIVE: Always use active phrasing (e.g., "Speaks softly", "Quick to anger") rather than passive hedges (e.g., "Might sometimes act shy", "Can be aggressive"). Describe how they *act*, not just what they *are*. -->\n'
content = personality_pattern.sub(personality_replacement, content)

with open('d:/World-Forge/templates/Janitor_Bot_Template.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Janitor_Bot_Template.md")
