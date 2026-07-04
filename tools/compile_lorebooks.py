import os
import sys
import json
import re

def parse_md_lorebook(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    entries = []
    raw_entries = content.split('### ENTRY:')
    for raw in raw_entries:
        raw = raw.strip()
        if not raw: continue
        
        lines = raw.split('\n')
        comment = lines[0].strip()
        
        keys = []
        constant = False
        position = 1
        order = 100
        ignore_budget = False
        depth = 4
        
        content_lines = []
        in_content = False
        
        for line in lines[1:]:
            line_str = line.strip()
            if in_content:
                content_lines.append(line)
                continue
                
            if line_str.startswith('**Trigger Keys:**'):
                keys_str = line_str.replace('**Trigger Keys:**', '').strip()
                keys = [k.strip() for k in keys_str.split(',') if k.strip() and k.strip().lower() != 'none']
            elif line_str.startswith('**Constant:**'):
                val = line_str.replace('**Constant:**', '').strip().lower()
                constant = (val == 'yes' or val == 'true')
            elif line_str.startswith('**Injection Position:**'):
                try:
                    position = int(line_str.replace('**Injection Position:**', '').strip())
                except:
                    pass
            elif line_str.startswith('**Order Priority:**'):
                try:
                    order = int(line_str.replace('**Order Priority:**', '').strip())
                except:
                    pass
            elif line_str.startswith('**Content:**'):
                in_content = True
        
        # Determine specific ST flags based on position and conventions
        if position == 4:
            depth = 4 # Default for TENSION/WORLD_PULSE
        
        if constant and position == 1 and not keys:
            ignore_budget = True # Typical for ARC_STATE / SANDBOX_STATE
            
        content_text = '\n'.join(content_lines).strip()
        
        entries.append({
            'comment': comment,
            'key': keys,
            'constant': constant,
            'position': position,
            'order': order,
            'ignoreBudget': ignore_budget,
            'depth': depth,
            'content': content_text
        })
        
    return entries

def compile_lorebooks(world_name):
    base_dir = os.getcwd()
    drafts_dir = os.path.join(base_dir, 'Drafts', world_name)
    export_dir = os.path.join(base_dir, 'Export', world_name)
    
    if not os.path.exists(drafts_dir) or not os.path.exists(export_dir):
        print(f"Error: Could not find directories for world {world_name}")
        sys.exit(1)
        
    for file in os.listdir(drafts_dir):
        if not file.endswith('_Entries.md'):
            continue
            
        parts = file.replace('.md', '').split('_')
        if len(parts) < 3:
            continue
            
        group_parts = parts[1:-1]
        group_name = '_'.join(group_parts)
        
        json_name = f"{world_name}_{group_name}_Lorebook.json"
        
        md_path = os.path.join(drafts_dir, file)
        json_path = os.path.join(export_dir, json_name)
        
        if not os.path.exists(json_path):
            print(f"Skipping {md_path} - matching JSON not found in Export (must be initialized by Compiler).")
            continue
            
        new_entries = parse_md_lorebook(md_path)
        
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"Failed to parse {json_name}: {e}")
                continue
            
        data['entries'] = {}
        for idx, entry in enumerate(new_entries):
            uid = str(idx)
            data['entries'][uid] = {
                'uid': idx,
                'comment': entry['comment'],
                'key': entry['key'],
                'keysecondary': [],
                'selectiveLogic': 0,
                'content': entry['content'],
                'position': entry['position'],
                'order': entry['order'],
                'depth': entry['depth'],
                'role': 0,
                'selective': not entry['constant'],
                'constant': entry['constant'],
                'probability': 100,
                'useProbability': False,
                'addMemo': True,
                'disable': False,
                'ignoreBudget': entry['ignoreBudget'],
                'vectorized': False,
                'group': group_name,
                'groupOverride': False,
                'groupWeight': 100,
                'preventRecursive': False,
                'delayUntilRecursion': False
            }
            
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            
        print(f"Compiled {len(new_entries)} entries for {json_name}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tools/compile_lorebooks.py <world_name>")
        sys.exit(1)
    compile_lorebooks(sys.argv[1])
