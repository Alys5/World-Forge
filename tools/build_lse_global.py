import os
import json
import re

wiki_dir = r"d:\World-Forge\wiki\LSE"
export_dir = r"d:\World-Forge\Export\LSE_Global"
template_path = r"d:\World-Forge\templates\Janitor_Script_World_Template.js"

if not os.path.exists(export_dir):
    os.makedirs(export_dir)

# Curated Keyword Mapping
# Maps the Markdown Header exact name to a list of conversational keywords
# If a header is NOT in this list, it is skipped (filters out metadata).
KEYWORD_MAPPING = {
    # Morphologies
    "Partial Shift": ["partial shift", "half shift", "eyes flash", "claws out", "fangs bared"],
    "Hybrid Shift — Species True Form": ["hybrid shift", "true form", "crinos", "bipedal wolf", "werewolf form", "monster form"],
    "Full Shift": ["full shift", "wolf form", "quadruped", "four legs", "paw", "paws"],
    
    # Blood Classification
    "Blood Classification": ["blood classification", "pureblood", "bitten", "turned", "lycan"],
    
    # Secondary Sexes
    "γ Gamma — The Third Primary Gender": ["gamma", "gammas", "third gender"],
    "∑ Enigma — The Sacred Caste": ["enigma", "enigmas", "sacred caste"],
    "α Alpha — The Protector": ["alpha", "alphas", "pack leader", "dominant", "protector"],
    "δ Delta — The Engine": ["delta", "deltas", "the engine", "worker"],
    "β Beta — The Social Glue": ["beta", "betas", "social glue", "mediator"],
    "Ω Omega — The Emotional Regulator": ["omega", "omegas", "submissive", "emotional regulator"],
    
    # Cycles
    "Heat Cycle (Omega)": ["heat cycle", "in heat", "going into heat", "mating cycle", "omega heat", "slick", "nesting"],
    "Rut Cycle (Alpha)": ["rut cycle", "in rut", "rutting", "alpha rut", "knotting", "knot"],
    "Sympathy Cycles": ["sympathy cycle", "sympathy heat", "sympathy rut"],
    "Stress Cycles": ["stress cycle", "stress heat", "stress rut", "panic heat"],
    "Feral State": ["feral state", "going feral", "lost control", "feral wolf"],
    
    # Biology / Pheromones
    "Bonding": ["mating bond", "mate claim", "claiming bite", "bonded mate"],
    "Bond Types": ["bond type", "soul bond", "pack bond"],
    "Scent Glands": ["scent gland", "scent glands", "rubbing scent", "scenting"],
    "The Command — Neurochemical Mechanism": ["the command", "alpha command", "alpha voice", "omega drop", "submission"],
    
    # Society / Pack
    "Alloparenting": ["alloparenting", "pack mom", "pack dad", "raising pups", "pack pup"],
    "Succession: The Call of the Pack": ["succession", "call of the pack", "challenge the alpha", "leadership challenge"],
    "Omega Nests": ["omega nest", "nesting", "building a nest", "nest space"],
    "Alpha Dens": ["alpha den", "den space", "alpha's room"],
    "Beta Spaces": ["beta space", "communal area"],
    
    # Hierarchies
    "Pack Leader": ["pack leader", "head alpha", "leader of the pack"],
    "Right Hand(s)": ["right hand", "second in command", "beta wolf"],
    "Left Hand(s)": ["left hand", "enforcer", "executioner"],
    
    # Laws / Religion
    "Exile": ["exile", "exiled", "lone wolf", "banished", "rogue"],
    "The Great Betrayal": ["the great betrayal", "betrayal of fenris"],
    "Ragnarök — The Liberation": ["ragnarok", "the liberation", "end times"],
    "The Pantheon": ["the pantheon", "werewolf gods", "lupine gods"],
    "The Nine Precepts of Fenris": ["nine precepts", "precepts of fenris", "fenris law"],
    "The Moon": ["the moon", "moon phase", "full moon", "new moon", "lunar"],
    "Moon Speakers": ["moon speaker", "shaman", "seer", "spiritual leader"],
    "High Fang": ["high fang", "pope of fenris", "religious leader"],
    
    # Living Sagas / History
    "The Nine Firstborn": ["nine firstborn", "firstborn", "first werewolves"],
    "The Six Lost Firstborn": ["lost firstborn", "lost fangs", "dormant firstborn"],
    "Wulfnic Bloodmoon — The First Fang": ["wulfnic", "wulfnic bloodmoon", "first fang", "builder king"],
    "Ut — The Second Fang": ["ut", "second fang", "the mountain", "blacksmith"],
    "Zefir — The Third Fang": ["zefir", "third fang", "white ghost", "watcher of the moon"],
    
    # Tech
    "Natural Weapons": ["natural weapons", "fangs", "claws"],
    "Traditional Weapons": ["traditional weapons", "forged blade", "ceremonial weapon"],
    "Modern Weapons": ["modern weapons", "firearms", "guns", "body armor"],
    "Species-Specific Medical Technology": ["regeneration accelerator", "pheromone analyzer", "shift stabilizer", "bond monitor", "suppressant"],
    "Corporate Fronts": ["corporate front", "dcc", "douglas consolidated"]
}

def clean_text(text):
    text = text.replace('\n', ' ').replace('"', "'").replace('\t', ' ')
    text = re.sub(' +', ' ', text)
    return text.strip()

def extract_entries():
    entries = []
    
    for filename in os.listdir(wiki_dir):
        if not filename.endswith('.md'): continue
        if filename == "LSE_Guide.md": continue # Skip the guide itself
        
        filepath = os.path.join(wiki_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = content.split('\n')
        
        current_header = None
        current_text = []
        
        for line in lines:
            line_str = line.strip()
            if line_str.startswith('## ') or line_str.startswith('### '):
                # Save previous
                if current_header and current_text:
                    entries.append((current_header, ' '.join(current_text)))
                    
                current_header = line_str.replace('### ', '').replace('## ', '').strip()
                current_text = []
            elif current_header:
                if line_str and not line_str.startswith('>'): 
                    current_text.append(line_str.replace('> ', ''))
                    
        # Save last
        if current_header and current_text:
            entries.append((current_header, ' '.join(current_text)))

    # Convert to dynamicLore entries
    dynamic_lore_objects = []
    lorebook_entries = {}
    
    uid_counter = 1
    
    for header, text in entries:
        if header not in KEYWORD_MAPPING:
            continue # SKIP Unmapped headers (filters metadata and unneeded lore)
            
        text = clean_text(text)
        if not text: continue
        
        keywords = KEYWORD_MAPPING[header]
            
        # Condense text if too long (Janitor limit per entry is ~600 chars for good performance)
        if len(text) > 800:
            text = text[:797] + "..."
            
        dynamic_lore_objects.append({
            "keywords": keywords,
            "priority": 4,
            "personality": text
        })
        
        lorebook_entries[str(uid_counter)] = {
            "key": keywords,
            "keysecondary": [],
            "comment": header,
            "content": text,
            "constant": False,
            "vectorized": False,
            "order": 100,
            "position": 1,
            "depth": 4,
            "probability": 100,
            "active": True
        }
        uid_counter += 1
        
    return dynamic_lore_objects, lorebook_entries


def build():
    lore_objs, lorebook_entries = extract_entries()
    
    # Write Lorebook
    lorebook = {
        "entries": lorebook_entries
    }
    with open(os.path.join(export_dir, 'LSE_Global_Lorebook.json'), 'w', encoding='utf-8') as f:
        json.dump(lorebook, f, indent=4)
        
    # Write JS
    with open(template_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
        
    match = re.search(r'(const dynamicLore = \[.*?)(\];)', js_content, re.DOTALL)
    if match:
        prefix = js_content[:match.start()] + match.group(1)
        suffix = match.group(2)
        
        injections = []
        for obj in lore_objs:
            kw_str = ", ".join([f"'{k.replace('\'', '\\\'')}'" for k in obj['keywords'] if k])
            if not kw_str: continue
            
            text_str = obj['personality'].replace("'", "\\'")
            
            entry = f"""\t{{
\t\tkeywords: [{kw_str}],
\t\tpriority: {obj['priority']},
\t\tpersonality: '[LSE] {text_str}'
\t}},"""
            injections.append(entry)
            
        final_js = prefix + "\n\t// --- LSE WIKI EXTRACTS ---\n" + "\n".join(injections) + "\n" + suffix
        final_js += js_content[match.end():]
        
        with open(os.path.join(export_dir, 'LSE_Global_JanitorAI_Script.js'), 'w', encoding='utf-8') as f:
            f.write(final_js)
            
        print(f"Successfully generated LSE_Global_JanitorAI_Script.js with {len(lore_objs)} OPTIMIZED entries.")
    else:
        print("Failed to find dynamicLore array in template.")

if __name__ == '__main__':
    build()
