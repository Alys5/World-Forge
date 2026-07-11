import json
import os
import sys
import re

def build_janitor(world_name):
    base_dir = os.getcwd()
    export_dir = os.path.join(base_dir, 'Export', world_name)
    template_path = os.path.join(base_dir, 'templates', 'Janitor_Lorebook_Script.js')
    
    if not os.path.exists(export_dir):
        print(f"Error: Export directory not found for {world_name}")
        sys.exit(1)
        
    config_path = os.path.join(export_dir, f"{world_name}_janitor_split_config.json")
    family_list = []
    npc_list = []
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            family_list = cfg.get("Family", [])
            npc_list = cfg.get("NPC", [])
    
    # Store entries by group
    groups = {"World": [], "Family": [], "NPC": [], "NSFW": []}
    
    for filename in os.listdir(export_dir):
        if not (filename.endswith('.json') and (f"{world_name}_" in filename or "Card" in filename)):
            continue
            
        fpath = os.path.join(export_dir, filename)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception:
            continue
            
        # Determine group
        group = None
        if "Intimacy" in filename or "Register" in filename:
            group = "NSFW"
        elif any(w in filename for w in ["Sandbox_Lorebook", "Arc_Lorebook", "ChatPreset", "World_Lorebook", "Director"]):
            group = "World"
        else:
            matched = False
            for name in family_list:
                if name in filename:
                    group = "Family"
                    matched = True
                    break
            if not matched:
                for name in npc_list:
                    if name in filename:
                        group = "NPC"
                        matched = True
                        break
            if not matched:
                if "NPC" in filename:
                    group = "NPC"
                else:
                    group = "Family" # Fallback

        if not group:
            continue
            
        # Extract entries based on file type
        file_entries = []
        if "Card" in filename:
            entries = data.get("data", {}).get("character_book", {}).get("entries", [])
            for e in entries:
                keys = e.get("keys", [])
                content = e.get("content", "").strip()
                if content:
                    file_entries.append({"source": filename, "keys": keys, "content": content})
                    
        elif "Lorebook" in filename or "Register" in filename:
            entries = data.get("entries", {})
            if isinstance(entries, dict):
                for uid, e in entries.items():
                    keys = e.get("key", [])
                    content = e.get("content", "").strip()
                    if content:
                        file_entries.append({"source": filename, "keys": keys, "content": content})
            elif isinstance(entries, list):
                for e in entries:
                    keys = e.get("key", []) or e.get("keys", [])
                    content = e.get("content", "").strip()
                    if content:
                        file_entries.append({"source": filename, "keys": keys, "content": content})

        elif "ChatPreset" in filename:
            prompts = data.get("prompts", [])
            for p in prompts:
                content = p.get("content", "").strip()
                name = p.get("name", "")
                if content and "original" not in content and name != "Main Prompt" and name != "NSFW Prompt":
                    file_entries.append({"source": filename, "keys": [], "content": f"[{name}]\n{content}", "always_on": True})

        groups[group].extend(file_entries)

    if not os.path.exists(template_path):
        print(f"Error: Template {template_path} not found.")
        sys.exit(1)
        
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()

    template_content = re.sub(r'let APPLY_LIMIT\s*=\s*6;', 'let APPLY_LIMIT = 15;', template_content)

    pattern = r'(const dynamicLore\s*=\s*\[)(.*?)(// 🛑🛑🛑 DO NOT EDIT BELOW THIS LINE 🛑🛑🛑\s*\];)'
    match = re.search(pattern, template_content, flags=re.DOTALL)

    if not match:
        print("Could not find dynamicLore block in template!")
        sys.exit(1)

    before = template_content[:match.start(1)]
    after = template_content[match.end(3):]
    
    for group_name, entries in groups.items():
        if not entries:
            continue
            
        js_elements = []
        for entry in entries:
            content_safe = json.dumps(entry["content"])
            keys_safe = json.dumps(entry["keys"])
            
            if entry.get("always_on") or not entry["keys"]:
                js_entry = f"  // Source: {entry['source']}\n  {{\n    priority: 5,\n    personality: {content_safe}\n  }}"
            else:
                js_entry = f"  // Source: {entry['source']}\n  {{\n    keywords: {keys_safe},\n    personality: {content_safe}\n  }}"
            js_elements.append(js_entry)

        generated_lore = "[\n" + ",\n".join(js_elements) + "\n];"
        final_content = before + "const dynamicLore = " + generated_lore + "\n\n// 🛑🛑🛑 DO NOT EDIT BELOW THIS LINE 🛑🛑🛑\n" + after
        
        out_path = os.path.join(export_dir, f"{world_name}_JanitorAI_Script_{group_name}.js")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
        print(f"Successfully wrote {len(entries)} entries to {out_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tools/build_janitor.py <world_name>")
        sys.exit(1)
    build_janitor(sys.argv[1])
