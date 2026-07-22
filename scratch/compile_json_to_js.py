#!/usr/bin/env python3
"""compile_json_to_js.py — Parse JSON entries and inject them into JanitorAI Lorebook Engine JS files using clean templates."""

import json
import os
import re
import glob
import shutil

base_dir = r"D:\World-Forge"
export_dir = os.path.join(base_dir, "Export", "SvartulfrVerse_Urban")
templates_dir = os.path.join(base_dir, "templates")
scratch_dir = os.path.join(base_dir, "scratch")

os.makedirs(scratch_dir, exist_ok=True)

SCRIPT_NAME = "SvartulfrVerse_Urban JanitorAI Lorebook"
VERSION = "2.2.1"

# Map target JS files to templates
js_header_map = {
    "Family": ("SvartulfrVerse_Urban JanitorAI Script — Family", VERSION),
    "NPC": ("SvartulfrVerse_Urban JanitorAI Script — NPC", VERSION),
    "NSFW": ("SvartulfrVerse_Urban JanitorAI Script — NSFW", VERSION),
    "World": ("SvartulfrVerse_Urban JanitorAI Script — World", VERSION),
}

# Map target JS files to templates
js_template_map = {
    "Family": os.path.join(templates_dir, "Janitor_Script_Family_Template.js"),
    "NPC": os.path.join(templates_dir, "Janitor_Script_NPC_Template.js"),
    "NSFW": os.path.join(templates_dir, "Janitor_Script_NSFW_Template.js"),
    "World": os.path.join(templates_dir, "Janitor_Script_World_Template.js"),
}

js_files = {k: os.path.join(export_dir, f"SvartulfrVerse_Urban_Janitor_Script_{k}.js") for k in js_template_map}

# Card JS mapping
CARD_FAMILY = {"Erik", "Malachia", "Jasper", "Noah"}
CARD_NPC = {"Angelo", "Edric", "Kaladin", "Logan", "Marcus", "Scarlett", "Sierra", "Ut", "Wulfnic", "Zefir"}

def extract_entries(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    entries = []
    name = data.get("name", os.path.basename(json_path))
    if "entries" in data:
        for key, entry in data["entries"].items():
            comment = entry.get("comment", "")
            content = entry.get("content", "")
            jskey = entry.get("key", [])
            if comment and content:
                entries.append({
                    "name": f"{name} — {comment}",
                    "comment": comment,
                    "content": content,
                    "keywords": jskey,
                    "source_file": os.path.basename(json_path),
                })
    elif data.get("spec") == "chara_card_v3" or "description" in data.get("data", {}):
        desc = data.get("data", {}).get("description", "")
        char_name = data.get("data", {}).get("name", os.path.basename(json_path).replace(".json", ""))
        if desc:
            entries.append({
                "name": f"{char_name} — Character Description",
                "comment": f"Character Description — {char_name}",
                "content": desc,
                "keywords": [char_name, char_name.lower()],
                "source_file": os.path.basename(json_path),
            })
    return entries

def target_js_file(source_file):
    sf = source_file.lower()
    if "_intimacy_profile" in sf or "_intimacy_register" in sf:
        return "NSFW"
    if "chatpreset" in sf:
        return "World"
    if "_arc" in sf and "_lorebook" in sf:
        return "World"
    if "world_lorebook" in sf:
        return "World"
    if "npc_lorebook" in sf:
        return "NPC"
    if "user_lorebook" in sf:
        return "Family"
    char_name = source_file.replace(".json", "")
    if char_name in CARD_FAMILY:
        return "Family"
    elif char_name in CARD_NPC:
        return "NPC"
    for family_char in CARD_FAMILY:
        if family_char.lower() in sf and "_lorebook" in sf:
            return "Family"
    for npc_char in CARD_NPC:
        if npc_char.lower() in sf and "_lorebook" in sf:
            return "NPC"
    return None

def format_js_entry(entry):
    content = entry["content"]
    content = content.replace("\\", "\\\\")
    content = content.replace("'", "\\'")
    content = content.replace("\n", "\\n")
    content = content.replace("\r", "\\r")
    content = content.replace("\t", "\\t")
    keywords_str = json.dumps(entry["keywords"], ensure_ascii=False)
    return f"\t,{{\n\t\tkeywords: {keywords_str},\n\t\tpriority: 3,\n\t\tpersonality: '[{entry['comment']}] {content}'\n\t}}"

# Collect all JSON entries by target JS
all_entries_by_js = {k: [] for k in js_template_map}
json_files_in_dir = glob.glob(os.path.join(export_dir, "*.json"))

for jf in sorted(json_files_in_dir):
    entries = extract_entries(jf)
    for entry in entries:
        target = target_js_file(os.path.basename(jf))
        if target and target in all_entries_by_js:
            all_entries_by_js[target].append(entry)

# Process each JS file
for js_name, js_path in js_files.items():
    template_path = js_template_map[js_name]
    
    # Read template
    with open(template_path, "r", encoding="utf-8") as f:
        template_content = f.read()
    
    # Find dynamicLore start and end
    dl_start = template_content.find("const dynamicLore = [")
    dl_end = template_content.find("];", dl_start)
    if dl_start == -1 or dl_end == -1:
        print(f"ERROR: Could not find dynamicLore array in template {js_name}")
        continue
    
    dl_end_close = dl_end + 2
    
    # Extract the dynamicLore array content
    dl_content = template_content[dl_start:dl_end_close]
    
    # Build new entries string
    entries = all_entries_by_js.get(js_name, [])
    new_entries_str = "".join(["," + format_js_entry(e) for e in entries])
    
    # Insert new entries before the closing `];`
    new_dl_content = dl_content[:-2] + new_entries_str + "\n];"
    
    # Reconstruct the template
    new_content = template_content[:dl_start] + new_dl_content + template_content[dl_end_close:]
    
    # Replace header placeholders
    name, ver = js_header_map[js_name]
    new_content = new_content.replace(
        "[[WF_INJECT: LOREBOOK NAME]]",
        name
    )
    new_content = new_content.replace(
        "[[WF_INJECT: VERSION (UPDATE BASED ON MINOR/MAJOR RELEASE)]]",
        ver
    )
    
    # Write to Export JS file
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"{js_name}: injected {len(entries)} entries into {os.path.basename(js_path)}")

print("\nVerifying syntax...")
for js_name, js_path in js_files.items():
    ret = os.system(f'node --check "{js_path}" 2>&1')
    if ret == 0:
        print(f"  {js_name}: OK")
    else:
        print(f"  {js_name}: FAILED")
