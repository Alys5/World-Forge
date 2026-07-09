import os
import sys
import json
import re

def parse_yaml_frontmatter(text):
    data = {}
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not match:
        return data
    fm = match.group(1)
    for line in fm.split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if ':' not in line:
            continue
        key, val = line.split(':', 1)
        key = key.strip().lower()
        val = val.strip()
        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
            val = val[1:-1]
        data[key] = val
    return data

def parse_instructions(text):
    system_prompt = ''
    post_history_instructions = ''
    current = None
    lines = text.split('\n')
    for line in lines:
        stripped = line.strip()
        if stripped.lower().startswith('# system_prompt') or stripped.lower().startswith('# system prompt'):
            current = 'system_prompt'
            continue
        if stripped.lower().startswith('# post-history-instructions') or stripped.lower().startswith('# post_history_instructions'):
            current = 'post_history_instructions'
            continue
        if stripped.startswith('# ') and current:
            current = None
            continue
        if current == 'system_prompt':
            system_prompt += line + '\n'
        elif current == 'post_history_instructions':
            post_history_instructions += line + '\n'
    return system_prompt.strip(), post_history_instructions.strip()

def compile_cards(world_name):
    base_dir = os.getcwd()
    drafts_dir = os.path.join(base_dir, 'Drafts', world_name)
    export_dir = os.path.join(base_dir, 'Export', world_name)
    
    if not os.path.exists(drafts_dir) or not os.path.exists(export_dir):
        print(f"Error: Could not find directories for world {world_name}")
        sys.exit(1)
    
    for file in os.listdir(drafts_dir):
        if not file.startswith('Card_') or not file.endswith('.md'):
            continue
            
        char_name = file.replace('Card_', '').replace('.md', '')
        json_file = os.path.join(export_dir, f"{char_name}_Card.json")
        
        if not os.path.exists(json_file):
            print(f"Skipping {char_name}: No JSON found.")
            continue
            
        md_path = os.path.join(drafts_dir, file)
        with open(md_path, 'r', encoding='utf-8') as f:
            card_content = f.read()
            
        instructions_path = os.path.join(drafts_dir, f"Instructions_{char_name}.md")
        instructions_content = ''
        if os.path.exists(instructions_path):
            with open(instructions_path, 'r', encoding='utf-8') as f:
                instructions_content = f.read()
        
        frontmatter = parse_yaml_frontmatter(card_content)
        system_prompt, post_history_instructions = parse_instructions(instructions_content)
        
        with open(json_file, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON for {char_name}: {e}")
                continue
                
        if 'data' not in data:
            print(f"Skipping {char_name}: No 'data' object in JSON.")
            continue
            
        updated = False
        for key in ['description', 'personality', 'scenario', 'first_mes', 'mes_example']:
            if key in frontmatter and frontmatter[key]:
                data['data'][key] = frontmatter[key]
                updated = True
        
        if system_prompt:
            data['data']['system_prompt'] = system_prompt
            updated = True
        if post_history_instructions:
            data['data']['post_history_instructions'] = post_history_instructions
            updated = True
        
        if 'creator_notes' not in data['data']:
            data['data']['creator_notes'] = ""
            updated = True
        if 'alternate_greetings' not in data['data']:
            data['data']['alternate_greetings'] = []
            updated = True
        if 'tags' not in data['data']:
            data['data']['tags'] = []
            updated = True
        if 'character_book' not in data['data']:
            data['data']['character_book'] = {"extensions": {}, "entries": []}
            updated = True
        
        if 'extensions' not in data['data']:
            data['data']['extensions'] = {}
            updated = True
        if 'depth_prompt' not in data['data']['extensions']:
            data['data']['extensions']['depth_prompt'] = {"prompt": "", "depth": 4, "role": "system"}
            updated = True
        if 'world_forge' not in data['data']['extensions']:
            data['data']['extensions']['world_forge'] = {"style_override": None}
            updated = True
        
        if updated:
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            print(f"Updated {char_name}_Card.json")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tools/compile_cards.py <world_name>")
        sys.exit(1)
    compile_cards(sys.argv[1])
