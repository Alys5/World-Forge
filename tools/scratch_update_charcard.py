import re

with open('d:/World-Forge/templates/Char_Card_creation.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Add to system_prompt rules
sp_pattern = re.compile(r'(> WHAT BELONGS IN THE CARD\'s system_prompt:.*?)(?=  - Identity statement)', re.DOTALL)
sp_replacement = r'\1\n  - **U-Shaped Memory Curve Note:** This block sits early in context. Use it to anchor long-term static identity. Do NOT include transient trivia here.\n  - **Token Budget:** Keep the combined permanent tokens (Personality + Scenario) under ~1,800 tokens to preserve the live conversation window.\n'
content = sp_pattern.sub(sp_replacement, content)

# Add to post_history_instructions rules
phi_pattern = re.compile(r'(> WHAT BELONGS IN THE CARD\'s post_history_instructions:.*?)(?=  - Maximum 150 words)', re.DOTALL)
phi_replacement = r'\1\n  - **U-Shaped Memory Curve Note:** This block sits at the very end of the context (Advanced Prompt). It drives immediate, turn-by-turn behavior. Keep it highly potent and strictly behavioral.\n'
content = phi_pattern.sub(phi_replacement, content)

# Update the JSON structure definitions to match
json_sp_pattern = re.compile(r'("system_prompt": "{{original}}\\n\\nMANDATORY\.)')
json_sp_replacement = r'\1 U-Shaped Memory Note: Anchors long-term static identity. Combined permanent token budget < 1,800.'
content = json_sp_pattern.sub(json_sp_replacement, content)

json_phi_pattern = re.compile(r'("post_history_instructions": "{{original}}\\n\\nMANDATORY\.)')
json_phi_replacement = r'\1 U-Shaped Memory Note: Sits at the end of context. Drives immediate turn-by-turn behavior.'
content = json_phi_pattern.sub(json_phi_replacement, content)

with open('d:/World-Forge/templates/Char_Card_creation.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Char_Card_creation.md")
