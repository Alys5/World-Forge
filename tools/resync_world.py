#!/usr/bin/env python3
"""Generic World Forge preset resync - refreshes Chat Completion Preset for any world.

Usage: python tools/resync_world.py <world_name>

Loads the world's ChatPreset JSON and updates the Main Prompt and Jailbreak blocks
from template files in tools/preset_templates/<world_name>/ or tools/preset_templates/default/
"""
import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        print("Usage: python tools/resync_world.py <world_name>")
        sys.exit(1)

    world_name = sys.argv[1]
    base_dir = Path.cwd()
    export_dir = base_dir / "Export" / world_name

    # Find ChatPreset file
    preset_files = list(export_dir.glob("*ChatPreset*.json"))
    if not preset_files:
        print(f"Error: No ChatPreset file found in {export_dir}")
        sys.exit(1)
    if len(preset_files) > 1:
        print(f"Warning: Multiple ChatPreset files found, using first: {preset_files[0].name}")

    preset_path = preset_files[0]
    print(f"Loading preset: {preset_path}")

    with open(preset_path, "r", encoding="utf-8") as f:
        preset = json.load(f)

    # Look for template files
    world_template_dir = base_dir / "tools" / "preset_templates" / world_name
    default_template_dir = base_dir / "tools" / "preset_templates" / "default"

    main_template = None
    jailbreak_template = None

    # Check world-specific templates first
    for template_dir in [world_template_dir, default_template_dir]:
        if not template_dir.exists():
            continue
        main_file = template_dir / "main_prompt.txt"
        jailbreak_file = template_dir / "jailbreak_prompt.txt"
        if main_file.exists():
            main_template = main_file.read_text(encoding="utf-8")
        if jailbreak_file.exists():
            jailbreak_template = jailbreak_file.read_text(encoding="utf-8")
        if main_template and jailbreak_template:
            break

    if not main_template or not jailbreak_template:
        print("Error: Could not find both main_prompt.txt and jailbreak_prompt.txt templates")
        print(f"  Looked in: {world_template_dir}")
        print(f"  Looked in: {default_template_dir}")
        sys.exit(1)

    # Update preset
    for p in preset.get("prompts", []):
        if p.get("identifier") == "main":
            p["content"] = main_template
            print("Updated 'main' prompt block")
        elif p.get("identifier") == "jailbreak":
            p["content"] = jailbreak_template
            print("Updated 'jailbreak' prompt block")

    with open(preset_path, "w", encoding="utf-8") as f:
        json.dump(preset, f, indent=4, ensure_ascii=False)

    print(f"Updated {preset_path.name}")


if __name__ == "__main__":
    main()