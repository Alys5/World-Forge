#!/usr/bin/env python3
"""Debug JanitorAI ChatPreset export - check for {{original}} in prompts.

Usage: python tools/debug_janitor.py <world_name>
"""
import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        print("Usage: python tools/debug_janitor.py <world_name>")
        sys.exit(1)

    world_name = sys.argv[1]
    export_dir = Path.cwd() / "Export" / world_name

    if not export_dir.exists():
        print(f"Error: Export directory not found: {export_dir}")
        sys.exit(1)

    found = False
    for filename in export_dir.glob("*ChatPreset*.json"):
        found = True
        print(f"Found ChatPreset: {filename.name}")
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
        prompts = data.get("prompts", [])
        for p in prompts:
            name = p.get("name", "")
            content = p.get("content", "").strip()
            print(f"  Block: {name}, {{original}} in content? {'{{original}}' in content}")

    if not found:
        print(f"No ChatPreset files found in {export_dir}")


if __name__ == "__main__":
    main()