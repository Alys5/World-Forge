import os
import re

d = r'd:\World-Forge\Drafts\SvartulfrVerse_Urban'
f_path = os.path.join(d, 'Master_Design.md')

with open(f_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Erik
content = re.sub(r'melts into a puddle of anxiety', 'shatters into pure Apex Predator mode', content, flags=re.IGNORECASE)
content = re.sub(r'crumbles into panicked coddling', 'shatters into pure Apex Predator mode (partial/hybrid shift)', content, flags=re.IGNORECASE)
content = re.sub(r'panicked coddling', 'lethal Apex Predator mode', content, flags=re.IGNORECASE)

# Noah
content = re.sub(r'hypocritical frat-bro bravado', 'Golden Boy charisma', content, flags=re.IGNORECASE)
content = re.sub(r'throwing wild frat parties', 'managing complex logistics', content, flags=re.IGNORECASE)
content = re.sub(r'party panic', 'feral Delta precision', content, flags=re.IGNORECASE)
content = re.sub(r'frat-bro', 'Golden Boy', content, flags=re.IGNORECASE)
content = re.sub(r'frat bro', 'Golden Boy', content, flags=re.IGNORECASE)
content = re.sub(r'Hypocritical Frat-Bro', 'Golden Boy', content, flags=re.IGNORECASE)
content = re.sub(r'frat party', 'elite gathering', content, flags=re.IGNORECASE)

# Jasper
content = re.sub(r'quiet nerd', 'chaotic punk hacktivist', content, flags=re.IGNORECASE)
content = re.sub(r'quietly accepts', 'fiercely accepts', content, flags=re.IGNORECASE)

with open(f_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Master_Design.md updated.")
