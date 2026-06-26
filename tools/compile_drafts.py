import os
import glob
import json
import re
import shutil

DRAFTS_DIR = 'd:/World-Forge/Drafts'
EXPORT_DIR = 'd:/World-Forge/Export'
WORLD_PREFIX = 'SvartulfrVerse_'

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')

def parse_card(name):
    card_file = os.path.join(DRAFTS_DIR, f'Card_{name}.md')
    inst_file = os.path.join(DRAFTS_DIR, f'Instructions_{name}.md')
    
    if not os.path.exists(card_file) or not os.path.exists(inst_file):
        return None
        
    with open(card_file, 'r', encoding='utf-8') as f:
        card_content = f.read()
    with open(inst_file, 'r', encoding='utf-8') as f:
        inst_content = f.read()
        
    def extract_section(text, header):
        match = re.search(fr'###\s+{header}\s*(.*?)(?=###|$)', text, re.DOTALL | re.IGNORECASE)
        return match.group(1).strip() if match else ""
        
    description = extract_section(card_content, 'description')
    personality = extract_section(card_content, 'personality')
    scenario = extract_section(card_content, 'scenario')
    first_mes = extract_section(card_content, 'first_mes')
    mes_example = extract_section(card_content, 'mes_example')
    
    system_prompt = extract_section(inst_content, 'system_prompt')
    post_history = extract_section(inst_content, 'post_history_instructions')
    
    # Handle the fact that system_prompt might not start with {{original}} if it wasn't strictly formatted, 
    # but foundational rule 2 requires it. We ensure it's there.
    if not system_prompt.startswith('{{original}}'):
        system_prompt = "{{original}}\n\n" + system_prompt
    if not post_history.startswith('{{original}}'):
        post_history = "{{original}}\n\n" + post_history
        
    card = {
        "spec": "chara_card_v3",
        "spec_version": "3.0",
        "data": {
            "name": name,
            "description": description,
            "personality": personality,
            "scenario": scenario,
            "first_mes": first_mes,
            "mes_example": mes_example,
            "system_prompt": system_prompt,
            "post_history_instructions": post_history,
            "creator_notes": "",
            "tags": [],
            "creator": "",
            "character_version": "",
            "alternate_greetings": [],
            "character_book": {"extensions": {}, "entries": []},
            "extensions": {
                "depth_prompt": {"prompt": "", "depth": 4, "role": "system"},
                "world_forge": {"style_override": None}
            }
        }
    }
    
    return card

def parse_entries(filepath, default_position=1):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    raw_entries = content.split('### ENTRY:')
    parsed_entries = []
    
    uid = 0
    for raw in raw_entries[1:]:
        lines = raw.strip().split('\n')
        if not lines: continue
        
        comment = lines[0].strip()
        entry_data = {
            "uid": uid,
            "key": [],
            "keysecondary": [],
            "comment": comment,
            "content": "",
            "constant": False,
            "selective": True,
            "position": default_position,
            "order": 100,
            "selectiveLogic": 0,
            "addMemo": True,
            "disable": False,
            "ignoreBudget": False,
            "probability": 100,
            "useProbability": False,
            "displayIndex": uid,
            "excludeRecursion": False,
            "preventRecursion": False,
            "delayUntilRecursion": False,
            "matchPersonaDescription": False,
            "matchCharacterDescription": False,
            "matchCharacterPersonality": False,
            "matchCharacterDepthPrompt": False,
            "matchScenario": False,
            "matchCreatorNotes": False
        }
        
        content_lines = []
        in_content = False
        
        for line in lines[1:]:
            if in_content:
                content_lines.append(line)
                continue
                
            if line.startswith('**Content:**'):
                in_content = True
                continue
                
            match = re.match(r'\*\*(.*?):\*\*\s*(.*)', line)
            if match:
                k, v = match.groups()
                k = k.lower().strip()
                v = v.strip()
                if 'category' in k:
                    pass
                elif 'trigger keys' in k:
                    if v.lower() != 'none':
                        entry_data['key'] = [x.strip() for x in v.split(',') if x.strip()]
                elif 'selective logic' in k:
                    entry_data['selectiveLogic'] = int(v)
                elif 'constant' in k:
                    entry_data['constant'] = (v.lower() == 'yes' or v.lower() == 'true')
                elif 'injection position' in k:
                    entry_data['position'] = int(v)
                elif 'order priority' in k:
                    entry_data['order'] = int(v)
                elif 'ignorebudget' in k:
                    entry_data['ignoreBudget'] = (v.lower() == 'yes' or v.lower() == 'true')

        entry_data['content'] = '\n'.join(content_lines).strip()
        
        # Adjust flags for CONSTANT
        if entry_data['constant']:
            entry_data['key'] = []
            entry_data['ignoreBudget'] = True
            
        parsed_entries.append(entry_data)
        uid += 1
        
    return parsed_entries

def build_manifest(entries, filename, protagonist_name=None):
    manifest = {
        "schema": 1,
        "lorebook": {"name": filename.replace('.json', ''), "kind": "world"},
        "personas": {},
        "npcs": []
    }
    
    if 'Arc' in filename:
        manifest['lorebook']['kind'] = 'arc'
    elif 'NPC' in filename or 'Director' in filename:
        manifest['lorebook']['kind'] = 'director'
    elif protagonist_name and protagonist_name in filename:
        manifest['lorebook']['kind'] = 'npc'
    elif 'Tier2' in filename or 'Profile' in filename or 'Lorebook' in filename:
        if 'World' not in filename and 'Sandbox' not in filename:
            manifest['lorebook']['kind'] = 'npc'
            
    npc_map = {}
    
    for entry in entries:
        comment = entry['comment']
        if 'BEAT —' in comment and manifest['lorebook']['kind'] == 'arc':
            if 'scenes' not in manifest: manifest['scenes'] = []
            seq = len(manifest['scenes']) + 1
            manifest['scenes'].append({
                "id": f"{manifest['lorebook']['name'].split('_')[1].lower()}_beat{seq}",
                "uid": entry['uid'],
                "arc": manifest['lorebook']['name'].split('_')[1],
                "seq": seq,
                "title": comment.replace('BEAT —', '').strip()
            })
            continue
            
        # Parse canonical name and facet
        canon_name = comment
        if canon_name.startswith('NPC — '):
            canon_name = canon_name[6:]
            
        facet = 'volatile'
        if ' — ' in canon_name:
            parts = canon_name.split(' — ')
            canon_name = parts[0].strip()
            aspect = parts[1].strip().lower()
        elif '(' in canon_name and ')' in canon_name:
            match = re.match(r'(.*?)\s*\((.*?)\)', canon_name)
            canon_name = match.group(1).strip()
            aspect = match.group(2).strip().lower()
        else:
            aspect = ''
            
        if 'physical description' in aspect or 'appearance' in aspect:
            facet = 'physical'
        elif 'psychological core' in aspect or 'psychology' in aspect:
            facet = 'psychological'
        elif 'standing goal' in aspect:
            facet = 'standingGoal'
        elif 'physical & psychological' in aspect or aspect == 'baseline' or not aspect:
            facet = 'combined'
            
        is_relationship = False
        if 'relationship to' in aspect:
            is_relationship = True
            target = aspect.replace('relationship to', '').strip()
            
        slug = slugify(canon_name)
        
        # Skip generic lore entries that aren't specific NPCs/Characters
        # Simple heuristic: if it doesn't look like a character aspect, skip it.
        # Since we're in Tier 2/Intimacy, mostly everything is a character.
        if manifest['lorebook']['kind'] not in ['npc', 'director']:
            continue
            
        if slug not in npc_map:
            npc_map[slug] = {
                "id": slug,
                "displayName": canon_name,
                "aliases": [canon_name],
                "facets": {},
                "relationships": [],
                "tags": []
            }
            
        if is_relationship:
            npc_map[slug]['relationships'].append({
                "to": slugify(target),
                "kind": "relationship"
            })
        elif facet in ['physical', 'psychological', 'standingGoal', 'combined']:
            npc_map[slug]['facets'][facet] = entry['uid']
            
    # Process protagonist vs npcs
    # Assuming any lorebook with the protagonist's name is just the persona
    if protagonist_name and protagonist_name in filename:
        manifest['personas']['user'] = {
            "name": protagonist_name,
            "aliases": [protagonist_name, "{{user}}"]
        }
        # The protagonist's Tier 2 lorebook ONLY contains personas, no npcs
        npc_map = {}
    elif manifest['lorebook']['kind'] in ['npc', 'director']:
        for slug, npc in npc_map.items():
            if not npc['facets']: del npc['facets']
            if not npc['relationships']: del npc['relationships']
            if not npc['tags']: del npc['tags']
            manifest['npcs'].append(npc)
            
    return manifest

def main():
    ensure_dir(EXPORT_DIR)
    
    # 1. Cards
    for md_file in glob.glob(os.path.join(DRAFTS_DIR, 'Card_*.md')):
        name = os.path.basename(md_file).replace('Card_', '').replace('.md', '')
        card = parse_card(name)
        if card:
            with open(os.path.join(EXPORT_DIR, f'{name}_Card.json'), 'w', encoding='utf-8') as f:
                json.dump(card, f, ensure_ascii=False, indent=4)
                
    # 2. Lorebooks
    lorebooks = []
    
    def process_md_to_lorebook(pattern, out_suffix, default_pos=1):
        for md_file in glob.glob(os.path.join(DRAFTS_DIR, pattern)):
            # Special case for Tier 2 to get character name
            name_part = ""
            if 'Tier2_' in os.path.basename(md_file):
                name_part = os.path.basename(md_file).replace('Tier2_', '').replace('_Entries.md', '').replace('_Intimacy_Profile.md', '')
            
            # Construct exact filename based on instructions
            if 'World_Entries' in md_file:
                out_name = f'{WORLD_PREFIX}World_Lorebook.json'
            elif 'Sandbox_Entries' in md_file:
                out_name = f'{WORLD_PREFIX}Sandbox_Lorebook.json'
            elif 'Sandbox_Intimacy_Register' in md_file:
                out_name = f'{WORLD_PREFIX}Sandbox_Intimacy_Register.json'
            elif 'NPC_Intimacy_Roster' in md_file:
                out_name = f'{WORLD_PREFIX}NPC_Intimacy_Roster.json'
            elif 'Intimacy_Profile' in md_file:
                out_name = f'{WORLD_PREFIX}{name_part}_Intimacy_Profile.json'
            elif 'Arc' in md_file:
                # e.g. Tier3_Arc1_Title_Entries.md -> SvartulfrVerse_Arc1_Lorebook.json
                arc_num = re.search(r'Arc\d+', os.path.basename(md_file)).group(0)
                out_name = f'{WORLD_PREFIX}{arc_num}_Lorebook.json'
            else:
                out_name = f'{WORLD_PREFIX}{name_part}_Lorebook.json'
                
            entries = parse_entries(md_file, default_pos)
            
            # For Sandbox pulse/tension, position is 4
            for e in entries:
                if 'WORLD_PULSE' in e['comment'] or 'TENSION' in e['comment']:
                    e['position'] = 4
                    e['depth'] = 4
                    
            # Set groups
            group = "World"
            if "Sandbox" in out_name: group = "Sandbox"
            elif "Arc" in out_name: group = re.search(r'Arc\d+', out_name).group(0) if re.search(r'Arc\d+', out_name) else "Arc"
            elif name_part: group = name_part
            
            for e in entries:
                if 'group' not in e: e['group'] = group
                
            # Add manifest if applicable
            # We don't have a reliable protagonist detector here so we assume Alyssa and Jasper are protagonists.
            # A robust script would read Section 6, but hardcoding for our spec.
            protagonist = None
            if "Alyssa" in out_name: protagonist = "Alyssa Douglas-Bloodmoon"
            elif "Jasper" in out_name: protagonist = "Jasper Douglas-Bloodmoon"
            
            manifest_obj = build_manifest(entries, out_name, protagonist)
            
            # Emit manifest entry if it's npc/director/arc
            if manifest_obj['lorebook']['kind'] != 'world' and not (manifest_obj['lorebook']['kind'] == 'npc' and not manifest_obj.get('npcs') and not manifest_obj.get('personas')):
                manifest_uid = len(entries)
                entries.append({
                    "uid": manifest_uid,
                    "key": [],
                    "keysecondary": [],
                    "comment": "[[NPC_MANIFEST]] NPC Memory index",
                    "content": json.dumps(manifest_obj, ensure_ascii=False),
                    "constant": False,
                    "selective": True,
                    "position": 1,
                    "order": 0,
                    "selectiveLogic": 0,
                    "addMemo": True,
                    "disable": True,
                    "ignoreBudget": False,
                    "probability": 100,
                    "useProbability": False,
                    "displayIndex": manifest_uid,
                    "excludeRecursion": False,
                    "preventRecursion": False,
                    "delayUntilRecursion": False,
                    "matchPersonaDescription": False,
                    "matchCharacterDescription": False,
                    "matchCharacterPersonality": False,
                    "matchCharacterDepthPrompt": False,
                    "matchScenario": False,
                    "matchCreatorNotes": False
                })
                
            lorebook = {
                "name": out_name.replace('.json', ''),
                "description": "",
                "scan_depth": 100,
                "token_budget": 2048,
                "recursive_scanning": False,
                "extensions": {},
                "entries": {str(e['uid']): e for e in entries}
            }
            
            with open(os.path.join(EXPORT_DIR, out_name), 'w', encoding='utf-8') as f:
                json.dump(lorebook, f, ensure_ascii=False, indent=4)
                
    process_md_to_lorebook('Tier1_*.md', '', default_pos=0)
    process_md_to_lorebook('Tier2_*.md', '', default_pos=1)
    process_md_to_lorebook('Tier3_*.md', '', default_pos=1)
    
    # User.md
    user_draft = os.path.join(DRAFTS_DIR, 'User.md')
    if os.path.exists(user_draft):
        shutil.copy2(user_draft, os.path.join(EXPORT_DIR, 'User.md'))
        
    print("Compilation completed successfully.")

if __name__ == '__main__':
    main()
