import json
import re
from pathlib import Path

export_dir = Path("d:/World-Forge/Export/SvartulfrVerse_Urban")
marker_pattern = re.compile(r'\s*<!--\s*(?:REVISED|CREATED)\s+IN\s+R\d+.*?-->\s*')

modified_files = []

for filepath in export_dir.glob("*.json"):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_content, count = marker_pattern.subn('', content)
    
    if count > 0:
        modified_files.append(filepath.name)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

print(f"Stripped markers from {len(modified_files)} files: {modified_files}")
