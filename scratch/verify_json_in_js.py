#!/usr/bin/env python3
"""verify_json_in_js.py — Verify that all JSON entries are present in the JanitorAI JS files."""

import json
import os
import re
import glob

base_dir = r"D:\World-Forge"
export_dir = os.path.join(base_dir, "Export", "SvartulfrVerse_Urban")
scratch_dir = os.path.join(base_dir, "scratch")

os.makedirs(scratch_dir, exist_ok=True)

js_files = {
    "Family": os.path.join(export_dir, "SvartulfrVerse_Urban_Janitor_Script_Family.js"),
    "NPC": os.path.join(export_dir, "SvartulfrVerse_Urban_Janitor_Script_NPC.js"),
    "NSFW": os.path.join(export_dir, "SvartulfrVerse_Urban_Janitor_Script_NSFW.js"),
    "World": os.path.join(export_dir, "SvartulfrVerse_Urban_Janitor_Script_World.js"),
}

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

def get_entry_ids_from_js(js_path):
    with open(js_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find the dynamicLore array
    dl_start = content.find("const dynamicLore = [")
    if dl_start == -1:
        return set(), content
    
    first_close = content.find("];", dl_start)
    if first_close == -1:
        return set(), content
    
    dl_content = content[dl_start:first_close + 2]
    
    ids = set()
    for m in re.finditer(r"personality:\s*'((?:\[[^\]]+\]\s*[^']*))'", dl_content):
        text = m.group(1)
        tag_match = re.match(r"\[([^\]]+)\]", text)
        if tag_match:
            ids.add(tag_match.group(1))
    
    return ids, content

# Parse all JSON files
all_entries_by_js = {k: [] for k in js_files}
json_files_in_dir = glob.glob(os.path.join(export_dir, "*.json"))

for jf in sorted(json_files_in_dir):
    entries = extract_entries(jf)
    for entry in entries:
        target = target_js_file(os.path.basename(jf))
        if target and target in all_entries_by_js:
            all_entries_by_js[target].append(entry)

# Verify each JS file
all_missing = []
all_present = []

for js_name, js_path in js_files.items():
    existing_ids, _ = get_entry_ids_from_js(js_path)
    missing = []
    present = []
    
    for entry in all_entries_by_js.get(js_name, []):
        entry_id = entry["comment"]
        found = any(
            entry_id.lower() in eid.lower() or eid.lower() in entry_id.lower()
            for eid in existing_ids
        )
        if found:
            present.append(entry)
        else:
            missing.append(entry)
    
    all_missing.extend(missing)
    all_present.extend(present)
    
    print(f"\n=== {js_name} ===")
    print(f"  Total JSON entries: {len(all_entries_by_js.get(js_name, []))}")
    print(f"  Present in JS: {len(present)}")
    print(f"  Missing from JS: {len(missing)}")
    if missing:
        for e in missing:
            print(f"    MISSING: {e['comment']} (from {e['source_file']})")

# Load and check missing_entries_report.txt
report_path = os.path.join(base_dir, "missing_entries_report.txt")
report_missing = []
if os.path.exists(report_path):
    with open(report_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("[") and "missing entry:" in line:
                # Extract entry identifier
                m = re.search(r"missing entry:\s*(.+)", line)
                if m:
                    report_missing.append(m.group(1).strip())

print(f"\n=== MISSING ENTRIES REPORT CHECK ===")
print(f"  Entries listed in report: {len(report_missing)}")
report_found = 0
report_not_found = []
for entry_id in report_missing:
    found_in_js = False
    for js_name in js_files:
        existing_ids, _ = get_entry_ids_from_js(js_files[js_name])
        if any(entry_id.lower() in eid.lower() or eid.lower() in entry_id.lower() for eid in existing_ids):
            found_in_js = True
            break
    if found_in_js:
        report_found += 1
    else:
        report_not_found.append(entry_id)

print(f"  Found in JS files: {report_found}/{len(report_missing)}")
if report_not_found:
    print(f"  NOT FOUND:")
    for e in report_not_found:
        print(f"    - {e}")

print(f"\n=== FINAL VERDICT ===")
if not all_missing and not report_not_found:
    print(f"  ALL ENTRIES PRESENT (0 missing)")
else:
    print(f"  Still missing {len(all_missing)} entries from JSON files")
    print(f"  Still missing {len(report_not_found)} entries from report")
