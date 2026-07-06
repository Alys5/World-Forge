import re

with open('d:/World-Forge/agent_roles/03_The_Editor.md', 'r', encoding='utf-8') as f:
    content = f.read()

rules_pattern = re.compile(r'(10\. \*\*Cross-arc inconsistency\.\*\* A behavioral mandate.*?)\n\n\*\*World Mode gate:\*\*', re.DOTALL)
rules_replacement = r'''\1

11. **U-Shaped Curve Enforcement:** Audit the drafted text blocks for U-Shaped memory compliance. Hard-fail and rewrite any profile that attempts to place critical behavioral triggers in the middle of a text block. Critical instructions must be at the very start (Personality) or very end (Scenario/Advanced Prompt).
12. **Token Budget Auditing:** You must estimate the token count of the permanent context (Personality + Scenario) for any drafted card. If the footprint exceeds ~1,800 tokens, you must hard-fail the draft and demand the Architect delegate more static data to the JS script.

**World Mode gate:**'''
content = rules_pattern.sub(rules_replacement, content)

with open('d:/World-Forge/agent_roles/03_The_Editor.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated 03_The_Editor.md")
