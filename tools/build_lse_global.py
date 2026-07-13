import os
import json
import re

wiki_dir = r"d:\World-Forge\wiki\LSE"
export_dir = r"d:\World-Forge\Export\LSE_Global"
template_path = r"d:\World-Forge\templates\Janitor_Script_World_Template.js"

if not os.path.exists(export_dir):
    os.makedirs(export_dir)

def clean_text(text):
    text = text.replace('\n', ' ').replace('"', "'").replace('\t', ' ')
    text = re.sub(' +', ' ', text)
    return text.strip()

def extract_entries():
    entries = []
    
    for filename in os.listdir(wiki_dir):
        if not filename.endswith('.md'): continue
        if filename == "LSE_Guide.md": continue # Skip the guide itself
        
        filepath = os.path.join(wiki_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = content.split('\n')
        
        current_header = None
        current_text = []
        
        for line in lines:
            line_str = line.strip()
            if line_str.startswith('## ') or line_str.startswith('### '):
                # Save previous
                if current_header and current_text:
                    entries.append((current_header, ' '.join(current_text)))
                    
                current_header = line_str.replace('### ', '').replace('## ', '').strip()
                current_text = []
            elif current_header:
                if line_str and not line_str.startswith('>'): # Skip blockquotes/notes for brevity if preferred, or keep them. Let's keep them but remove > 
                    current_text.append(line_str.replace('> ', ''))
                    
        # Save last
        if current_header and current_text:
            entries.append((current_header, ' '.join(current_text)))

    # Convert to dynamicLore entries
    dynamic_lore_objects = []
    lorebook_entries = {}
    
    uid_counter = 1
    
    for header, text in entries:
        text = clean_text(text)
        if not text: continue
        
        # Heuristic keywords from header
        kw = header.lower()
        # Remove non alpha
        kw_clean = re.sub(r'[^a-z ]', '', kw).strip()
        keywords = [kw_clean]
        
        # Split by and/or
        if ' and ' in kw_clean:
            keywords.extend([k.strip() for k in kw_clean.split(' and ')])
        if ' or ' in kw_clean:
            keywords.extend([k.strip() for k in kw_clean.split(' or ')])
            
        # Condense text if too long (Janitor limit)
        if len(text) > 600:
            text = text[:597] + "..."
            
        dynamic_lore_objects.append({
            "keywords": keywords,
            "priority": 4,
            "personality": text
        })
        
        lorebook_entries[str(uid_counter)] = {
            "key": keywords,
            "keysecondary": [],
            "comment": header,
            "content": text,
            "constant": False,
            "vectorized": False,
            "order": 100,
            "position": 1,
            "depth": 4,
            "probability": 100,
            "active": True
        }
        uid_counter += 1
        
    return dynamic_lore_objects, lorebook_entries


def build():
    lore_objs, lorebook_entries = extract_entries()
    
    # Write Lorebook
    lorebook = {
        "entries": lorebook_entries
    }
    with open(os.path.join(export_dir, 'LSE_Global_Lorebook.json'), 'w', encoding='utf-8') as f:
        json.dump(lorebook, f, indent=4)
        
    # Write JS
    with open(template_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
        
    # Find the closing brace of L_SCENE_ORCHESTRATOR
    # We will inject the new lore just before `];` that closes `dynamicLore = [`
    
    match = re.search(r'(const dynamicLore = \[.*?)(\];)', js_content, re.DOTALL)
    if match:
        prefix = js_content[:match.start()] + match.group(1)
        suffix = match.group(2)
        
        # We can remove the placeholder templates (L_WORLD_RULES, etc.) to keep it clean, 
        # or just append. Let's just append at the end of the array.
        
        injections = []
        for obj in lore_objs:
            kw_str = ", ".join([f"'{k}'" for k in obj['keywords'] if k])
            if not kw_str: continue # Skip if no keywords
            
            text_str = obj['personality'].replace("'", "\\'")
            
            entry = f"""\t{{
\t\tkeywords: [{kw_str}],
\t\tpriority: {obj['priority']},
\t\tpersonality: '[LSE] {text_str}'
\t}},"""
            injections.append(entry)
            
        final_js = prefix + "\n\t// --- LSE WIKI EXTRACTS ---\n" + "\n".join(injections) + "\n" + suffix
        # Also need to add the rest of the JS file
        final_js += js_content[match.end():]
        
        with open(os.path.join(export_dir, 'LSE_Global_JanitorAI_Script.js'), 'w', encoding='utf-8') as f:
            f.write(final_js)
            
        print(f"Successfully generated LSE_Global_JanitorAI_Script.js with {len(lore_objs)} entries.")
    else:
        print("Failed to find dynamicLore array in template.")

if __name__ == '__main__':
    build()
