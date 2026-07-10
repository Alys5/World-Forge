import os
import re

WIKI_DIR = r"d:\World-Forge\wiki"
DRAFTS_FILE = r"d:\World-Forge\Drafts\LSE_Global\Tier1_World_Entries.md"

FILES = [
    "LSE_00_Foundations.md",
    "LSE_01_Species.md",
    "LSE_02_Behavioral_Ecology.md",
    "LSE_03_Civilization.md",
    "LSE_04_Governance.md",
    "LSE_05_Religion.md",
    "LSE_06_History.md",
    "LSE_07_Foundational_Figures.md",
    "LSE_08_Technology.md",
    "LSE_Appendices.md",
    "LSE_Guide.md"
]

def generate_entry_markdown(breadcrumbs, content_text):
    comment = " - ".join(breadcrumbs)
    
    keys = []
    for b in breadcrumbs:
        clean_b = re.sub(r'[*_`]', '', b).lower().strip()
        if clean_b:
            keys.append(clean_b)
    
    keys_str = ", ".join(keys)
    
    md = f"### ENTRY: {comment}\n"
    md += "**Category:** CONCEPT\n"
    md += f"**Trigger Keys:** {keys_str}\n"
    md += "**Secondary Keys:** \n"
    md += "**Selective Logic:** 0\n"
    md += "**Constant:** No\n"
    md += "**Injection Position:** 0\n"
    md += "**Order Priority:** 50\n"
    md += "**Position Rationale:** DEFAULT\n\n"
    md += "**Content:**\n"
    md += content_text.strip() + "\n\n"
    return md

entries = []

for filename in FILES:
    filepath = os.path.join(WIKI_DIR, filename)
    if not os.path.exists(filepath):
        print(f"Missing {filename}")
        continue
        
    breadcrumbs = []
    current_content = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('#'):
                text = "".join(current_content).strip()
                if len(text) > 0 and breadcrumbs:
                    entries.append(generate_entry_markdown(breadcrumbs, text))
                
                match = re.match(r'^(#+)\s*(.*)', line)
                if match:
                    level = len(match.group(1))
                    title = match.group(2).strip()
                    title = re.sub(r'[*_`]', '', title)
                    title = re.sub(r'^PART [IVX0-9]+ [—-] ', '', title)
                    
                    if level <= len(breadcrumbs):
                        breadcrumbs = breadcrumbs[:level-1]
                    while len(breadcrumbs) < level - 1:
                        breadcrumbs.append("Sub")
                    
                    breadcrumbs.append(title)
                    current_content = []
            else:
                if breadcrumbs:
                    if line.strip() == '---':
                        continue
                    if line.strip().startswith('> This document establishes') or line.strip().startswith('**Version 1.0**'):
                        continue
                    current_content.append(line)
                    
    text = "".join(current_content).strip()
    if len(text) > 0 and breadcrumbs:
        entries.append(generate_entry_markdown(breadcrumbs, text))

with open(DRAFTS_FILE, 'w', encoding='utf-8') as f:
    f.write("".join(entries))

print(f"Generated {len(entries)} entries into {DRAFTS_FILE}")
