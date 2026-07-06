import re

with open('d:/World-Forge/agent_roles/02_The_Architect.md', 'r', encoding='utf-8') as f:
    content = f.read()

rules_pattern = re.compile(r'(10\. \*\*World Mode governs Tier 3 and the NPC format\.\*\*[^\n]+\n)')
rules_replacement = r'''\1
11. **Mandatory Delegation (Delegate, Don't Delete):** You are strictly forbidden from placing heavy lore, inventory, or granular physical measurements in the main Janitor profile text blocks. You must generate these exclusively for the [WorldName]_JanitorAI_Script.js payload.

12. **Trivia Migration & Case Study:** Do not put complex biographical plots into the main context unless they dictate immediate behavior. For instance, if a character has a secret career—such as secretly working for a fashion agency under the stage name 'Lys Angel' while hiding it from family members like Malachia and Noah—this highly specific plot hook belongs in a targeted L_LORE_SECRET JS module. The main profile only needs the behavioral consequence (e.g., 'Acts defensive and evasive when asked about her schedule or income').

13. **Active Phrasing Enforcement:** Automatically rewrite passive character traits into active, repeatable behaviors. Use "Speaks softly and averts her eyes" rather than "Might sometimes act shy".
'''
content = rules_pattern.sub(rules_replacement, content)

with open('d:/World-Forge/agent_roles/02_The_Architect.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated 02_The_Architect.md")
