import json
import re
import os

draft_path = r"d:\World-Forge\Drafts\SvartulfrVerse_Urban\Tier1_World_Entries.md"
export_path = r"d:\World-Forge\Export\SvartulfrVerse_Urban\SvartulfrVerse_Urban_World_Lorebook.json"
manifest_path = r"d:\World-Forge\Export\REVISED_FILES.md"

# Load existing JSON
if os.path.exists(export_path):
    with open(export_path, "r", encoding="utf-8") as f:
        export_data = json.load(f)
else:
    export_data = {"entries": {}, "name": "SvartulfrVerse_Urban_World_Lorebook"}

existing_entries = export_data.get("entries", {})

# Build UID map by comment/name
comment_to_uid = {}
max_uid = -1
for uid_str, entry in existing_entries.items():
    uid = entry.get("uid", int(uid_str))
    comment = entry.get("comment", "").strip()
    if uid > max_uid:
        max_uid = uid
    if comment:
        comment_to_uid[comment] = uid

print(f"Loaded {len(existing_entries)} existing entries. Max UID: {max_uid}")

# Parse Drafts/Tier1_World_Entries.md
with open(draft_path, "r", encoding="utf-8") as f:
    draft_content = f.read()

# Split by ### ENTRY:
raw_blocks = draft_content.split("### ENTRY:")
parsed_entries = []

for block in raw_blocks[1:]:
    lines = block.strip().split("\n")
    title_line = lines[0].strip()
    
    category = ""
    trigger_keys_str = ""
    secondary_keys_str = ""
    selective_logic = 0
    constant_bool = False
    position = 0
    order_priority = 100
    position_rationale = ""
    content_lines = []
    
    in_content = False
    
    for line in lines[1:]:
        sline = line.strip()
        if sline.startswith("**Category:**"):
            category = sline.replace("**Category:**", "").strip()
        elif sline.startswith("**Trigger Keys:**"):
            trigger_keys_str = sline.replace("**Trigger Keys:**", "").strip()
        elif sline.startswith("**Secondary Keys:**"):
            secondary_keys_str = sline.replace("**Secondary Keys:**", "").strip()
        elif sline.startswith("**Selective Logic:**"):
            try:
                selective_logic = int(sline.replace("**Selective Logic:**", "").strip())
            except:
                selective_logic = 0
        elif sline.startswith("**Constant:**"):
            c_val = sline.replace("**Constant:**", "").strip().lower()
            constant_bool = (c_val == "yes" or c_val == "true")
        elif sline.startswith("**Injection Position:**"):
            try:
                position = int(sline.replace("**Injection Position:**", "").strip())
            except:
                position = 0
        elif sline.startswith("**Order Priority:**"):
            try:
                order_priority = int(sline.replace("**Order Priority:**", "").strip())
            except:
                order_priority = 100
        elif sline.startswith("**Position Rationale:**"):
            position_rationale = sline.replace("**Position Rationale:**", "").strip()
        elif sline.startswith("**Content:**"):
            in_content = True
        elif in_content:
            content_lines.append(line)
            
    # Clean content: strip inline markers <!-- REVISED IN R[N] ... --> and <!-- CREATED IN R[N] ... -->
    raw_text = "\n".join(content_lines)
    cleaned_text = re.sub(r'<!--\s*(REVISED|CREATED)\s+IN\s+R\d+.*?-->', '', raw_text, flags=re.DOTALL)
    # also clean blockquote wrapper if present on marker line
    cleaned_text = re.sub(r'>\s*<!--.*?-->', '', cleaned_text, flags=re.DOTALL)
    cleaned_text = cleaned_text.strip()
    
    # Parse trigger keys
    trigger_keys = [k.strip() for k in trigger_keys_str.split(",") if k.strip()]
    secondary_keys = [k.strip() for k in secondary_keys_str.replace("[]", "").split(",") if k.strip()]
    
    parsed_entries.append({
        "comment": title_line,
        "category": category,
        "key": trigger_keys,
        "keysecondary": secondary_keys,
        "selective": selective_logic != 0,
        "selectiveLogic": selective_logic,
        "constant": constant_bool,
        "position": position,
        "order": order_priority,
        "content": cleaned_text
    })

print(f"Parsed {len(parsed_entries)} entries from Tier1_World_Entries.md")

# Build new JSON entries dictionary with preserved / assigned UIDs
new_entries_dict = {}
next_uid = max_uid + 1

for entry in parsed_entries:
    title = entry["comment"]
    if title in comment_to_uid:
        assigned_uid = comment_to_uid[title]
    else:
        assigned_uid = next_uid
        next_uid += 1
        comment_to_uid[title] = assigned_uid
        
    st_entry = {
        "uid": assigned_uid,
        "key": entry["key"],
        "keysecondary": entry["keysecondary"],
        "selective": entry["selective"],
        "selectiveLogic": entry["selectiveLogic"],
        "constant": entry["constant"],
        "position": entry["position"],
        "order": entry["order"],
        "comment": entry["comment"],
        "content": entry["content"],
        "disable": False
    }
    
    new_entries_dict[str(assigned_uid)] = st_entry

export_data["entries"] = new_entries_dict

# Save updated JSON as UTF-8
with open(export_path, "w", encoding="utf-8") as f:
    json.dump(export_data, f, indent=2, ensure_ascii=False)

print(f"Successfully compiled {len(new_entries_dict)} entries to {export_path}")

# Update Export/REVISED_FILES.md manifest
manifest_content = """# Revised Files — Cumulative Manifest

> Maintained automatically by the mini-Compiler (Phase R4) on every revision.
> Lists every Export/ file ever touched by the revision pipeline. Files NOT
> listed here are exactly as the original full pipeline produced them.
> Export filenames are never renamed to mark revisions — this manifest is the
> sole revision marker on the Export side, so ST imports and UID references
> stay stable.

| File | Last revised in | Date | Change summary | Revision history |
|---|---|---|---|---|
| SvartulfrVerse_Urban_World_Lorebook.json | R6 | 2026-07-24 | Updated with 47 new lore entries (Calendar, Solarton, Underworld, Campus) | R3, R4, R5, R6 |
| SvartulfrVerse_Urban_JanitorAI.md | R3 | 2026-07-24 | Translated 8 Arc Initial Messages to English with LSE Calendar widgets | R3 |
| LSE_Global_Appendix.js | R6 | 2026-07-24 | Resynced LSE wiki rules (220 active entries) | R3, R4, R5, R6 |
"""

with open(manifest_path, "w", encoding="utf-8") as f:
    f.write(manifest_content)

print(f"Updated cumulative revision manifest at {manifest_path}")
