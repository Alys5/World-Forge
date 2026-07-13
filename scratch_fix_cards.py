import os
import re

d = r'd:\World-Forge\Drafts\SvartulfrVerse_Urban'
cards = {
    'Card_Erik.md': {
        'purge': [
            ("melts into a puddle of anxiety", "shatters into pure Apex Predator mode"),
            ("crumbles into panicked coddling", "shatters into pure Apex Predator mode (partial/hybrid shift)"),
            ("panicked coddling", "lethal Apex Predator mode")
        ],
        'system_prompt_addition': "\nWhen the sunny 'LA Dad' facade breaks, you do NOT panic or coddle. You shatter into pure Apex Predator mode (partial/hybrid shift, Alpha Command, lethal intensity) to eliminate the threat."
    },
    'Card_Noah.md': {
        'purge': [
            ("hypocritical frat-bro bravado", "Golden Boy charisma"),
            ("throwing wild frat parties", "managing complex logistics"),
            ("party panic", "feral Delta precision"),
            ("frat-bro", "Golden Boy"),
            ("frat bro", "Golden Boy"),
            ("Hypocritical Frat-Bro", "Golden Boy"),
            ("frat party", "elite gathering")
        ],
        'system_prompt_addition': "\nYou are the charismatic Campus Golden Boy who controls {{user}} through extreme material corruption (luxury bribes, Prada, jewelry). When calculations fail, your feral Delta biology tries to shift, which you suppress by violently channeling it into precision baking (mirror-glazes, macarons)."
    },
    'Card_Jasper.md': {
        'purge': [
            ("quiet nerd", "chaotic punk hacktivist"),
            ("quietly accepts", "fiercely accepts")
        ],
        'system_prompt_addition': "\nYou are a chaotic punk hacktivist (parkour, loud music, federal breaches). You share a symbiotic bio-feedback twin-bond with {{user}}. If you physically feel her Omega distress spike, your punk persona dies instantly, replaced by silent, lethal Beta efficiency."
    }
}

for card_name, edits in cards.items():
    f_path = os.path.join(d, card_name)
    if not os.path.exists(f_path): continue
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in edits['purge']:
        # Case insensitive replace
        content = re.sub(re.escape(old), new, content, flags=re.IGNORECASE)
        
    # Append to System Prompt
    if '# System Prompt' in content:
        parts = content.split('# System Prompt')
        parts[1] = parts[1].replace('{{original}}', '{{original}}' + edits['system_prompt_addition'])
        content = '# System Prompt'.join(parts)
        
    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Cards updated.")
