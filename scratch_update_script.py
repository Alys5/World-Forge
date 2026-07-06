import re

with open('d:/World-Forge/templates/Janitor_Lorebook_Script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add note about Token Cleanup in the HEADER
header_pattern = re.compile(r'(Output formatting:\s+- Engine prepends "\\n\\n" before each applied personality/scenario fragment.)')
header_replacement = r'\1\n     - Token Cleanup: Injected personality/scenario fragments are scoped to the current turn only. They do not permanently mutate the base state, thereby preventing context overflow (token bloat).'
content = header_pattern.sub(header_replacement, content)

# Add appearance injection logic to dynamicLore
lore_pattern = re.compile(r'(const dynamicLore = \[\s+// 🟢🟢🟢 SAFE TO EDIT BELOW THIS LINE 🟢🟢🟢)')
lore_replacement = r'''\1

	/* L_APP — Dynamic Appearance Injection (Delegate, Don't Delete)
     What it does: Injects granular appearance or outfit details when the user looks or asks about them.
     Why use: Keeps the main character profile lean. High-fidelity details (exact clothing, deep lore) are held here and injected only when relevant to the immediate scene, saving "rent" on tokens.
  */
	{
		keywords: ['look', 'outfit', 'clothes', 'appearance', 'wearing', 'dress'],
		priority: 5,
		personality:
			' {{char}} is highly aware of their appearance and outfit.',
		scenario:
			' [Granular Appearance: (The Architect should insert detailed clothing, measurements, and physical descriptions here, to be injected into context only when triggered.)]',
	},'''
content = lore_pattern.sub(lore_replacement, content)

with open('d:/World-Forge/templates/Janitor_Lorebook_Script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Janitor_Lorebook_Script.js")
