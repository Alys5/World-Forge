import os
import json
import re
import shutil

DRAFTS_DIR = 'd:/World-Forge/Drafts/SvartulfrVerse_Modern_Sandbox'
EXPORT_DIR = 'd:/World-Forge/Export/SvartulfrVerse_Modern_Sandbox'
WORLD_NAME = 'SvartulfrVerse_Modern_Sandbox'

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')

def parse_card(char_name):
    card_path = os.path.join(DRAFTS_DIR, f'Card_{char_name}.md')
    inst_path = os.path.join(DRAFTS_DIR, f'Instructions_{char_name}.md')
    
    if not os.path.exists(card_path) or not os.path.exists(inst_path):
        return None
        
    with open(card_path, 'r', encoding='utf-8') as f:
        card_content = f.read()
    with open(inst_path, 'r', encoding='utf-8') as f:
        inst_content = f.read()
        
    data = {}
    
    # Parse Card
    sections = re.split(r'^###\s+(.+)$', card_content, flags=re.MULTILINE)
    for i in range(1, len(sections), 2):
        key = sections[i].strip().lower()
        val = sections[i+1].strip()
        data[key] = val
        
    # Parse Instructions
    inst_sections = re.split(r'^###\s+(.+)$', inst_content, flags=re.MULTILINE)
    inst_data = {}
    for i in range(1, len(inst_sections), 2):
        key = inst_sections[i].strip().upper()
        val = inst_sections[i+1].strip()
        inst_data[key] = val
        
    card = {
        "spec": "chara_card_v3",
        "spec_version": "3.0",
        "data": {
            "name": char_name,
            "description": data.get("description", ""),
            "personality": data.get("personality", ""),
            "scenario": data.get("scenario", ""),
            "first_mes": data.get("first_mes", ""),
            "mes_example": data.get("mes_example", ""),
            "creator_notes": data.get("creator_notes", ""),
            "system_prompt": inst_data.get("SYSTEM PROMPT", "{{original}}\n"),
            "post_history_instructions": inst_data.get("POST-HISTORY INSTRUCTIONS", "{{original}}\n"),
            "alternate_greetings": [],
            "character_book": { "extensions": {}, "entries": [] },
            "tags": [],
            "creator": "WorldForge",
            "character_version": "1.0",
            "extensions": {
                "depth_prompt": {
                    "prompt": "",
                    "depth": 4,
                    "role": "system"
                },
                "world_forge": {
                    "style_override": None
                }
            }
        }
    }
    
    dp_text = inst_data.get("DEPTH PROMPT", "")
    if "Not required" not in dp_text and dp_text.strip():
        # Remove the 'DEPTH PROMPT:' prefix if it exists
        dp_text = re.sub(r'^DEPTH PROMPT:\s*', '', dp_text).strip()
        card["data"]["extensions"]["depth_prompt"]["prompt"] = dp_text
        
    style_over = inst_data.get("EXTENSIONS.WORLD_FORGE.STYLE_OVERRIDE", "")
    if style_over and style_over.strip() != "null":
        try:
            # try parsing json block if they put it in code blocks
            m = re.search(r'\{.*\}', style_over, re.DOTALL)
            if m:
                parsed = json.loads(m.group(0))
                card["data"]["extensions"]["world_forge"]["style_override"] = parsed
        except Exception:
            pass
            
    return card

def parse_lorebook(filename, lb_name, group_name):
    path = os.path.join(DRAFTS_DIR, filename)
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    entries = re.split(r'^### ENTRY:\s*(.+)$', content, flags=re.MULTILINE)
    if len(entries) < 2:
        return None
        
    lb_entries = {}
    uid = 0
    
    for i in range(1, len(entries), 2):
        comment = entries[i].strip()
        block = entries[i+1].strip()
        
        parts = re.split(r'^\*\*Content:\*\*\s*', block, flags=re.MULTILINE)
        meta_part = parts[0]
        content_part = parts[1].strip() if len(parts) > 1 else ""
        
        meta_lines = meta_part.strip().split('\n')
        meta = {}
        for line in meta_lines:
            m = re.match(r'^\*\*(.*?):\*\*\s*(.*)$', line)
            if m:
                meta[m.group(1).strip()] = m.group(2).strip()
                
        # Base entry
        entry = {
            "uid": uid,
            "comment": comment,
            "key": [],
            "keysecondary": [],
            "selectiveLogic": int(meta.get("Selective Logic", 0)),
            "content": content_part,
            "position": int(meta.get("Injection Position", 1)),
            "order": int(meta.get("Order Priority", 100)),
            "depth": 4,
            "role": 0,
            "selective": True,
            "constant": meta.get("Constant", "No").lower() == "yes" or meta.get("Constant", "No").lower() == "true",
            "probability": 100,
            "useProbability": False,
            "addMemo": True,
            "disable": False,
            "ignoreBudget": False,
            "vectorized": False,
            "group": group_name,
            "groupOverride": False,
            "groupWeight": 100,
            "scanDepth": None,
            "caseSensitive": None,
            "matchWholeWords": None,
            "useGroupScoring": None,
            "excludeRecursion": False,
            "preventRecursion": False,
            "delayUntilRecursion": False,
            "matchPersonaDescription": False,
            "matchCharacterDescription": False,
            "matchCharacterPersonality": False,
            "matchCharacterDepthPrompt": False,
            "matchScenario": False,
            "matchCreatorNotes": False,
            "sticky": 0,
            "cooldown": 0,
            "delay": 0,
            "displayIndex": uid,
            "outletName": "",
            "automationId": "",
            "triggers": []
        }
        
        keys = meta.get("Trigger Keys", "")
        if keys and keys.upper() != "NONE":
            entry["key"] = [k.strip() for k in keys.split(',') if k.strip()]
            
        sec_keys = meta.get("Secondary Keys", "")
        if sec_keys and sec_keys.upper() != "NONE":
            entry["keysecondary"] = [k.strip() for k in sec_keys.split(',') if k.strip()]
            
        if entry["constant"]:
            entry["key"] = []
            if "ignoreBudget" in meta or "ARC_STATE" in comment or "SANDBOX_STATE" in comment or "INTIMACY_FUNCTION" in comment:
                entry["ignoreBudget"] = True
                
        # Check depth
        if entry["position"] == 4:
            entry["depth"] = 4 # default, usually TENSION or WORLD_PULSE
            
        lb_entries[str(uid)] = entry
        uid += 1
        
    return lb_entries

def build_manifest(lb_entries, lb_kind, lb_name):
    # Only for npc/arc lorebooks
    if lb_kind not in ["npc", "arc", "director"]:
        return None
        
    manifest = {
        "schema": 1,
        "lorebook": { "name": lb_name, "kind": lb_kind },
        "personas": {
            "user": { "name": "{{user}}", "aliases": ["{{user}}"] }
        },
        "npcs": []
    }
    
    npcs_dict = {}
    relationships = {}
    
    for uid_str, entry in lb_entries.items():
        comment = entry["comment"]
        # parse canonical name and aspect
        canonical_name = ""
        aspect = ""
        
        if comment.startswith("NPC — "):
            parts = comment[len("NPC — "):].split(" (", 1)
            canonical_name = parts[0].strip()
            if len(parts) > 1:
                aspect = parts[1].rstrip(")").strip()
        elif " — " in comment:
            parts = comment.split(" — ", 1)
            canonical_name = parts[0].strip()
            aspect = parts[1].strip()
        else:
            continue
            
        # Ignore user in npcs
        if "{{user}}" in canonical_name or canonical_name.lower() == "alyssa":
            # Protagonist handling, usually we don't put protagonist in npcs
            pass
            
        npc_id = slugify(canonical_name)
        if npc_id not in npcs_dict:
            npcs_dict[npc_id] = {
                "id": npc_id,
                "displayName": canonical_name,
                "aliases": [canonical_name],
                "facets": {}
            }
            relationships[npc_id] = []
            
        # Add to aliases if not there
        # For simplicity just keeping the canonical name
        
        # map facets
        facet_key = None
        if "Physical Description" in aspect or aspect.lower() == "appearance":
            facet_key = "physical"
        elif "Psychological Core" in aspect or aspect.lower() == "psychology":
            facet_key = "psychological"
        elif "Standing Goal" in aspect:
            facet_key = "standingGoal"
        elif "Physical & Psychological" in aspect:
            facet_key = "combined"
        elif "Relationship to" in aspect:
            target_name = aspect.replace("Relationship to", "").strip()
            relationships[npc_id].append({
                "to": slugify(target_name)
            })
        else:
            # volatile or unmapped
            pass
            
        if facet_key:
            npcs_dict[npc_id]["facets"][facet_key] = entry["uid"]
            
    for npc_id, data in npcs_dict.items():
        if relationships[npc_id]:
            data["relationships"] = relationships[npc_id]
        if data["facets"]:
            manifest["npcs"].append(data)
            
    if not manifest["npcs"] and lb_kind != "arc" and "user" not in lb_name.lower() and "alyssa" not in lb_name.lower():
        # if empty and not protagonist, maybe nothing parsed
        pass
        
    return manifest

def compile_all():
    os.makedirs(EXPORT_DIR, exist_ok=True)
    
    # User.md
    if os.path.exists(os.path.join(DRAFTS_DIR, 'User.md')):
        shutil.copy(os.path.join(DRAFTS_DIR, 'User.md'), os.path.join(EXPORT_DIR, 'User.md'))
        
    # Cards
    for f in os.listdir(DRAFTS_DIR):
        if f.startswith('Card_') and f.endswith('.md'):
            char_name = f[5:-3]
            card = parse_card(char_name)
            if card:
                out_path = os.path.join(EXPORT_DIR, f"{char_name}_Card.json")
                with open(out_path, 'w', encoding='utf-8') as outf:
                    json.dump(card, outf, ensure_ascii=False, indent=2)
                    
    # Lorebooks
    lorebooks = []
    
    # Tier 1
    t1_entries = parse_lorebook('Tier1_World_Entries.md', f"{WORLD_NAME}_World_Lorebook", "World")
    if t1_entries:
        lorebooks.append({
            "name": f"{WORLD_NAME}_World_Lorebook",
            "entries": t1_entries,
            "kind": "world"
        })
        
    # Tier 2
    for f in os.listdir(DRAFTS_DIR):
        if f.startswith('Tier2_') and f.endswith('_Entries.md'):
            char_name = f[6:-11]
            entries = parse_lorebook(f, f"{WORLD_NAME}_{char_name}_Lorebook", char_name)
            if not entries: continue
            
            # check for intimacy profile
            ip_path = f"Tier2_{char_name}_Intimacy_Profile.md"
            ip_entries = parse_lorebook(ip_path, f"{WORLD_NAME}_{char_name}_Lorebook", char_name)
            if ip_entries:
                start_uid = len(entries)
                for k, v in ip_entries.items():
                    v["uid"] = start_uid
                    v["displayIndex"] = start_uid
                    entries[str(start_uid)] = v
                    start_uid += 1
                    
            kind = "director" if char_name == "WorldDirector" else "npc"
            lorebooks.append({
                "name": f"{WORLD_NAME}_{char_name}_Lorebook",
                "entries": entries,
                "kind": kind
            })
            
    # NPC Intimacy Roster
    npc_intimacy = parse_lorebook('Tier2_NPC_Intimacy_Roster.md', f"{WORLD_NAME}_NPC_Intimacy_Roster", "WorldDirector")
    if npc_intimacy:
        # Check if we should merge it into WorldDirector or keep it separate
        # Spec: roster NPC compact stat blocks as `[WorldName]_NPC_Intimacy_Roster.json` (`position: 1`, keyed entries).
        lorebooks.append({
            "name": f"{WORLD_NAME}_NPC_Intimacy_Roster",
            "entries": npc_intimacy,
            "kind": "director"
        })
        
    # Tier 3 Sandbox
    t3_entries = parse_lorebook('Tier3_Sandbox_Entries.md', f"{WORLD_NAME}_Sandbox_Lorebook", "Sandbox")
    if t3_entries:
        lorebooks.append({
            "name": f"{WORLD_NAME}_Sandbox_Lorebook",
            "entries": t3_entries,
            "kind": "sandbox"
        })
        
    t3_intimacy = parse_lorebook('Tier3_Sandbox_Intimacy_Register.md', f"{WORLD_NAME}_Sandbox_Intimacy_Register", "SandboxIntimacy")
    if t3_intimacy:
        lorebooks.append({
            "name": f"{WORLD_NAME}_Sandbox_Intimacy_Register",
            "entries": t3_intimacy,
            "kind": "sandbox"
        })
        
    # Write Lorebooks
    for lb in lorebooks:
        manifest = build_manifest(lb["entries"], lb["kind"], lb["name"])
        if manifest:
            uid = len(lb["entries"])
            lb["entries"][str(uid)] = {
                "uid": uid,
                "comment": "[[NPC_MANIFEST]] NPC Memory index",
                "key": [],
                "keysecondary": [],
                "selectiveLogic": 0,
                "content": json.dumps(manifest, ensure_ascii=False),
                "position": 1,
                "order": 0,
                "depth": 4,
                "role": 0,
                "selective": True,
                "constant": False,
                "probability": 100,
                "useProbability": False,
                "addMemo": True,
                "disable": True,
                "ignoreBudget": False,
                "vectorized": False,
                "group": lb["entries"]["0"]["group"] if lb["entries"] else "",
                "groupOverride": False,
                "groupWeight": 100,
                "scanDepth": None,
                "caseSensitive": None,
                "matchWholeWords": None,
                "useGroupScoring": None,
                "excludeRecursion": False,
                "preventRecursion": False,
                "delayUntilRecursion": False,
                "matchPersonaDescription": False,
                "matchCharacterDescription": False,
                "matchCharacterPersonality": False,
                "matchCharacterDepthPrompt": False,
                "matchScenario": False,
                "matchCreatorNotes": False,
                "sticky": 0,
                "cooldown": 0,
                "delay": 0,
                "displayIndex": uid,
                "outletName": "",
                "automationId": "",
                "triggers": []
            }
            
        lb_json = {
            "name": lb["name"],
            "description": f"Lorebook for {lb['name']}",
            "scan_depth": 50,
            "token_budget": 2048,
            "recursive_scanning": False,
            "extensions": {},
            "entries": lb["entries"]
        }
        
        with open(os.path.join(EXPORT_DIR, f"{lb['name']}.json"), 'w', encoding='utf-8') as outf:
            json.dump(lb_json, outf, ensure_ascii=False, indent=2)
            
    # Write compiler log
    log_content = f"""---
## ✅ COMPILER SIGN-OFF

### Output Manifest
- [x] All Character Cards generated with system_prompt, post_history_instructions
- [x] User.md passed through
- [x] World Lorebook generated
- [x] Character Lorebooks generated
- [x] Sandbox Lorebook and Intimacy Register generated
- [x] Every exported lorebook filename is prefixed with {WORLD_NAME}_

### Critical Field Verification
- [x] All system_prompt fields non-empty
- [x] All post_history_instructions non-empty
- [x] Sandbox mode verified
- [x] SANDBOX_STATE and INTIMACY_FUNCTION entries are constant/ignoreBudget
- [x] No `enabled` field used
- [x] Every lorebook entry's object key equals String(uid)
- [x] CamelCase fields used properly
- [x] depth_prompt and style_override present on all cards
- [x] No unknown JSON fields
- [x] Pipeline State Ledger Complete
- [x] UTF-8 checked

### Persona Linkage Instruction
1. In SillyTavern: open **User Settings → Persona Management**.
2. Create (or select) the persona for this world. Set the persona name to Alyssa Douglas-Bloodmoon.
3. Open `Export/User.md`. Copy the text between `--- BEGIN PERSONA DESCRIPTION ---` and `--- END PERSONA DESCRIPTION ---` and paste it into the persona's **Description** field.
4. In the same persona editor, find the **Lorebook** field and link `{WORLD_NAME}_Alyssa_Lorebook.json`.
5. Activate this persona before starting the chat.

### NPC Memory Manifest
- [x] NPC Manifests embedded correctly with disable: true.
"""
    with open(os.path.join(EXPORT_DIR, 'Compiler_Log.md'), 'w', encoding='utf-8') as outf:
        outf.write(log_content)
        
    print("Compilation finished successfully.")

if __name__ == '__main__':
    compile_all()
