import re

with open('d:/World-Forge/templates/Janitor_Bot_Template.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace INVENTORY and ABILITIES
inventory_pattern = re.compile(r'### INVENTORY\n\n.*?(?=---)', re.DOTALL)
inventory_replacement = '''<!-- 
IMPORTANT DIRECTIVE FOR THE ARCHITECT:
TRIVIA MIGRATION DIRECTIVE: Do NOT list [INVENTORY] or [ABILITIES] in this profile. 
Complex equipment, weapons, and magic spells are token sinks. 
Migrate these into the JS Lorebook/Script payload so they can be injected only when the user triggers an action (via L_INV or L_ABIL).
-->\n\n'''
content = inventory_pattern.sub(inventory_replacement, content)

# Replace speech_examples
speech_pattern = re.compile(r'<speech_examples>\n\n.*?</speech_examples>', re.DOTALL)
speech_replacement = '''<speech_examples>
<!-- ARCHITECT DIRECTIVE: Structure speech examples by Emotional State. Do NOT use random strings. -->
- [Praise/Affection]: "..."
- [Conflict/Anger]: "..."
- [Repair/Vulnerability]: "..."
- [Default/Neutral]: "..."
</speech_examples>'''
content = speech_pattern.sub(speech_replacement, content)

with open('d:/World-Forge/templates/Janitor_Bot_Template.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Janitor_Bot_Template.md")
