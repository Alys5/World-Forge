import json
import os
import sys

world_name = 'SvartulfrVerse'
export_dir = os.path.join(os.getcwd(), 'Export', world_name)
for filename in os.listdir(export_dir):
    if 'ChatPreset' in filename:
        print('Found ChatPreset:', filename)
        with open(os.path.join(export_dir, filename), 'r', encoding='utf-8') as f:
            data = json.load(f)
        prompts = data.get('prompts', [])
        for p in prompts:
            name = p.get('name', '')
            content = p.get('content', '').strip()
            print(f"Block: {name}, original in content? {'original' in content}")
