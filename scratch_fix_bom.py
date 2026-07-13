import os

d = r'd:\World-Forge\Drafts\SvartulfrVerse_Urban'
erik_path = os.path.join(d, 'Instructions_Erik.md')

# Read keeping BOM if any
with open(erik_path, 'r', encoding='utf-8-sig') as f:
    erik = f.read()

# Write without BOM
with open(erik_path, 'w', encoding='utf-8') as f:
    f.write(erik)

print("Fixed encoding.")
