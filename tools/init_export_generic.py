import os
import json
import sys
import re

world_name = sys.argv[1]
drafts_dir = os.path.join("d:\\World-Forge\\Drafts", world_name)
export_dir = os.path.join("d:\\World-Forge\\Export", world_name)
templates_dir = "d:\\World-Forge\\templates"

os.makedirs(export_dir, exist_ok=True)

char_template_path = os.path.join(templates_dir, "char_template.json")
with open(char_template_path, 'r', encoding='utf-8') as f:
    char_template = json.load(f)

for file in os.listdir(drafts_dir):
    if file.startswith("Card_") and file.endswith(".md"):
        char_name = file.replace("Card_", "").replace(".md", "")
        new_data = char_template.copy()
        new_data["name"] = char_name
        json_file = os.path.join(export_dir, f"{char_name}_Card.json")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4)

group_template_path = os.path.join(templates_dir, "char_template.json")
new_group_data = char_template.copy()
new_group_data["name"] = f"{world_name}_Group"
json_file = os.path.join(export_dir, f"{world_name}_Group.json")
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(new_group_data, f, indent=4)

lb_template_path = os.path.join(templates_dir, "World_Lorebook_template.json")
if os.path.exists(lb_template_path):
    with open(lb_template_path, 'r', encoding='utf-8') as f:
        lb_template = json.load(f)
    lb_file = os.path.join(export_dir, f"{world_name}_Lorebook.json")
    with open(lb_file, 'w', encoding='utf-8') as f:
        json.dump(lb_template, f, indent=4)
