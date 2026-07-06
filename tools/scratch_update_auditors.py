import re

with open('d:/World-Forge/agent_roles/03b_The_Voice_Auditor.md', 'r', encoding='utf-8') as f:
    content = f.read()

voice_rules_pattern = re.compile(r'(6\. \*\*Sandbox worlds require Step 3I and reframe the arc checks\.\*\*.*?)\n\n---', re.DOTALL)
voice_rules_replacement = r'''\1
7. **The Extremes Test:** You must simulate extreme user inputs (e.g., blunt one-liners, absolute silence, heavy sarcasm) against the drafted profile. Verify that the bot's response maintains its unique behavioral quirks (e.g., stammering, deflecting) and does not default to "generic polite chatbot" mode.
8. **Formatting Consistency:** Verify that the tested outputs strictly separate physical actions (*italics*) from spoken dialogue ("quotes") and internal thoughts ([brackets]). Flag any bleed between formatting layers.

---'''
content = voice_rules_pattern.sub(voice_rules_replacement, content)

with open('d:/World-Forge/agent_roles/03b_The_Voice_Auditor.md', 'w', encoding='utf-8') as f:
    f.write(content)

with open('d:/World-Forge/agent_roles/03d_The_Intimacy_Auditor.md', 'r', encoding='utf-8') as f:
    content = f.read()

intimacy_obj_pattern = re.compile(r'(## 1\. OBJECTIVE\n.*?\n---)', re.DOTALL)
intimacy_obj_replacement = r'''\1

## 1.5 FOUNDATIONAL RULES -- READ FIRST

1. **Trigger Validation (Stress-Testing Bounds):** You must act adversarially against the L_LORE_RELATIONSHIP modules. If a scenario dictates that intimacy operates strictly on the level of physical necessity (or purely platonically), you must actively attempt to push the dialogue toward romance. You must hard-fail the draft if the AI generates unprompted emotional sentiment.
2. **Escalation Auditing:** You must verify that intimacy builds logically through the defined paths in the Trigger Matrix (e.g., Comfort -> Affection). Flag any jumps that skip necessary emotional progression steps.

---'''
content = intimacy_obj_pattern.sub(intimacy_obj_replacement, content)

with open('d:/World-Forge/agent_roles/03d_The_Intimacy_Auditor.md', 'w', encoding='utf-8') as f:
    f.write(content)


with open('d:/World-Forge/agent_roles/03c_The_Arc_Transition_Auditor.md', 'r', encoding='utf-8') as f:
    content = f.read()

arc_obj_pattern = re.compile(r'(## 1\. OBJECTIVE\n.*?\n---)', re.DOTALL)
arc_obj_replacement = r'''\1

## 1.5 FOUNDATIONAL RULES -- READ FIRST

1. **Trigger Firing Check (State Transition Validation):** You must simulate the core inputs defined in the Trigger Matrix (Praise, Tease, Apology, Conflict). Confirm empirically that the drafted bot transitions states correctly under these inputs (e.g., ensuring an apology successfully shifts a Conflict state back to a Repair/Neutral state). Flag any logic blocks that fail to process state transitions.

---'''
content = arc_obj_pattern.sub(arc_obj_replacement, content)

with open('d:/World-Forge/agent_roles/03c_The_Arc_Transition_Auditor.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Auditor Roles.")
