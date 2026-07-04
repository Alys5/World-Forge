import os
import sys
import json

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
            content = f.read()
            
        sections = {
            'description': '',
            'personality': '',
            'scenario': '',
            'first_mes': '',
            'mes_example': ''
        }
        
        current_section = None
        lines = content.split('\n')
        for line in lines:
            if line.startswith('### '):
                sec_name = line.replace('### ', '').strip().lower()
                if sec_name in sections:
                    current_section = sec_name
                    continue
                    
            if current_section:
                sections[current_section] += line + '\n'
                
        # Clean up trailing/leading whitespace
        for k in sections:
            sections[k] = sections[k].strip()
            
        # Update the JSON
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
        for k, v in sections.items():
            if v:
                data['data'][k] = v
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
