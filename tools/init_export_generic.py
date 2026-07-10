#!/usr/bin/env python3
"""Initialize Export/ directory for a world from templates.

Usage: python tools/init_export_generic.py <world_name>
"""
import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        print("Usage: python tools/init_export_generic.py <world_name>")
        sys.exit(1)

    world_name = sys.argv[1]
    base_dir = Path.cwd()
    drafts_dir = base_dir / "Drafts" / world_name
    export_dir = base_dir / "Export" / world_name
    templates_dir = base_dir / "templates"

    if not drafts_dir.exists():
        print(f"Error: Drafts directory not found: {drafts_dir}")
        sys.exit(1)

    export_dir.mkdir(parents=True, exist_ok=True)

    char_template_path = templates_dir / "char_template.json"
    if not char_template_path.exists():
        print(f"Error: Character template not found: {char_template_path}")
        sys.exit(1)

    with open(char_template_path, "r", encoding="utf-8") as f:
        char_template = json.load(f)

    # Create character cards from Card_*.md files
    for file in drafts_dir.glob("Card_*.md"):
        char_name = file.stem.replace("Card_", "")
        new_data = char_template.copy()
        new_data["name"] = char_name
        json_file = export_dir / f"{char_name}_Card.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(new_data, f, indent=4, ensure_ascii=False)
        print(f"Created {json_file.name}")

    # Create group card
    group_data = char_template.copy()
    group_data["name"] = f"{world_name}_Group"
    group_file = export_dir / f"{world_name}_Group.json"
    with open(group_file, "w", encoding="utf-8") as f:
        json.dump(group_data, f, indent=4, ensure_ascii=False)
    print(f"Created {group_file.name}")

    # Create world lorebook from template
    lb_template_path = templates_dir / "Lorebook_Template.json"
    if lb_template_path.exists():
        with open(lb_template_path, "r", encoding="utf-8") as f:
            lb_template = json.load(f)
        lb_file = export_dir / f"{world_name}_Lorebook.json"
        with open(lb_file, "w", encoding="utf-8") as f:
            json.dump(lb_template, f, indent=4, ensure_ascii=False)
        print(f"Created {lb_file.name}")
    else:
        print(f"Warning: World lorebook template not found: {lb_template_path}")


if __name__ == "__main__":
    main()