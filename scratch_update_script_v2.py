import re

with open('d:/World-Forge/templates/Janitor_Lorebook_Script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hasTerm
hasterm_pattern = re.compile(r'const hasTerm = \(hay, term\) => \{.*?return re2\.test\(hay\);\n\};', re.DOTALL)
hasterm_replacement = '''const hasTerm = (hay, term) => {
	let t = (term == null ? '' : String(term)).toLowerCase().trim();
	if (!t) return false;
	// Usa \\b per un matching chirurgico ES6-compliant
	let re = new RegExp('\\\\b' + reEsc(t) + '\\\\b', 'i');
	return re.test(hay);
};'''
content = hasterm_pattern.sub(hasterm_replacement, content)

# Replace dynamicLore array
dynamiclore_pattern = re.compile(r'const dynamicLore = \[.*?// 🛑🛑🛑 DO NOT EDIT BELOW THIS LINE 🛑🛑🛑\n\];', re.DOTALL)
dynamiclore_replacement = '''const dynamicLore = [
	// 🟢🟢🟢 SAFE TO EDIT BELOW THIS LINE 🟢🟢🟢

	// L_APP: Aspetto fisico (Innescato solo su indagine visiva)
	{
		keywords: ['look', 'outfit', 'clothes', 'appearance', 'wearing', 'dress'],
		priority: 5,
		scenario: ' [Appearance: <Architect inserts granular details here>]'
	},
	// L_INV: Oggetti e Armi (Innescato in azione)
	{
		keywords: ['weapon', 'pocket', 'bag', 'draw', 'inventory', 'shoot'],
		priority: 4,
		scenario: ' [Inventory: <Architect inserts hidden items or weapons>]'
	},
	// L_LORE_RELATIONSHIP: Intimità fisica (Zero inferenze romantiche se non previste)
	{
		keywords: ['touch', 'kiss', 'closer', 'intimacy'],
		priority: 5,
		personality: ' [Behavior: <Architect defines strict physical/intimacy boundaries here>]'
	},

	// 🛑🛑🛑 DO NOT EDIT BELOW THIS LINE 🛑🛑🛑
];'''
content = dynamiclore_pattern.sub(dynamiclore_replacement, content)

with open('d:/World-Forge/templates/Janitor_Lorebook_Script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Janitor_Lorebook_Script.js")
