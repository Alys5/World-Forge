import json
import os
import sys
import re
from pathlib import Path

def parse_master_design(world_name, drafts_dir):
    md_path = drafts_dir / "Master_Design.md"
    setting = {
        "time": "Modern Day", 
        "world": "Urban Fantasy", 
        "genre": "",
        "standing_situation": "",
        "world_pulse": ""
    }
    if md_path.exists():
        text = md_path.read_text(encoding="utf-8")
        genre_m = re.search(r"\*\*Genre & Tone:\*\*\s*(.*)", text)
        if genre_m:
            setting["genre"] = genre_m.group(1).strip()
            setting["world"] = setting["genre"]
            
        m_sit = re.search(r"### 9B\.1 — Standing Situation[^\n]*\n\n(.*?)(?=\n###|\Z)", text, re.DOTALL)
        if m_sit:
            setting["standing_situation"] = m_sit.group(1).strip()
            
        m_pulse = re.search(r"### 9B\.3 — World Pulse[^\n]*\n\n(.*?)(?=\n###|\Z)", text, re.DOTALL)
        if m_pulse:
            setting["world_pulse"] = m_pulse.group(1).strip()
            
    return setting

def build_janitor_profile(world_name):
    base_dir = Path.cwd()
    drafts_dir = base_dir / "Drafts" / world_name
    export_dir = base_dir / "Export" / world_name
    template_path = base_dir / "templates" / "Janitor_Bot_Template.md"
    
    if not template_path.exists():
        print(f"Error: Template {template_path} not found.")
        sys.exit(1)
        
    tpl_text = template_path.read_text(encoding="utf-8")
    setting = parse_master_design(world_name, drafts_dir)
    
    # Extract Character Template Block
    # Look for the <{{CharName_1}}> ... </{{CharName_1}}> block
    char_block_match = re.search(r'(<\{\{CharName_1\}\}>.*?</\{\{CharName_1\}\}>)', tpl_text, re.DOTALL)
    if not char_block_match:
        print("Error: Could not find <{{CharName_1}}> block in template.")
        sys.exit(1)
        
    char_block_template = char_block_match.group(1)
    
    # Find all character cards in Export/
    card_files = sorted(export_dir.glob("*_Card.json"))
    if not card_files:
        print("No Character Cards found in Export directory.")
        sys.exit(1)
        
    cards = []
    for cf in card_files:
        with open(cf, "r", encoding="utf-8") as f:
            card_data = json.load(f)
            # Skip World_Director or non-actual characters if necessary
            if card_data["data"]["name"].lower() == "world director":
                continue
            cards.append(card_data)
            
    def extract_section(text, section_name):
        pattern = rf'#+\s*{section_name}\s*\n(.*?)(?=\n#+\s*[A-Z]|\Z)'
        m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        return m.group(1).strip() if m else ""

    def extract_key_value(text):
        data = {}
        for line in text.split('\n'):
            if ':' in line:
                parts = line.split(':', 1)
                data[parts[0].strip()] = parts[1].strip()
        return data

    # Process Character Blocks
    all_chars_text = []
    char_names = []
    all_messages = []
    for card in cards:
        name = card["data"]["name"]
        char_names.append(name)
        desc = card["data"].get("description", "")
        personality = card["data"].get("personality", "")
        scenario = card["data"].get("scenario", "")
        first_mes = card["data"].get("first_mes", "")
        alt_greetings = card["data"].get("alternate_greetings", [])
        
        char_overview = extract_section(desc, "CHARACTER OVERVIEW")
        appearance_details = extract_section(desc, "APPEARANCE DETAILS")
        starting_outfit = extract_section(desc, "STARTING OUTFIT")
        origin = extract_section(desc, r"ORIGIN\s*\(BACKSTORY\)")
        residence = extract_section(desc, "RESIDENCE")
        connections = extract_section(desc, "CONNECTIONS")
        inventory = extract_section(desc, "INVENTORY")
        abilities = extract_section(desc, "ABILITIES")
        personality_sec = extract_section(desc, "PERSONALITY")
        
        app_kv = extract_key_value(appearance_details)
        outfit_kv = extract_key_value(starting_outfit)
        
        cb = char_block_template
        # Replace name tags
        cb = cb.replace("<{{CharName_1}}>", f"<{name}>")
        cb = cb.replace("</{{CharName_1}}>", f"</{name}>")
        cb = cb.replace("[{{CharName_1}}]", f"[{name}]")
        cb = cb.replace("[CharName_1]", name)
        
        cb = cb.replace("{{CHARACTER_OVERVIEW}}", char_overview or scenario or "Detailed in Lorebook.")
        
        cb = cb.replace("{{APPEARANCE_FULL_NAME}}", app_kv.get("Full Name", app_kv.get("Full Name, Alias", name)))
        cb = cb.replace("{{APPEARANCE_RACE}}", app_kv.get("Race", ""))
        cb = cb.replace("{{APPEARANCE_SEX}}", app_kv.get("Sex/Gender", ""))
        cb = cb.replace("{{APPEARANCE_HEIGHT}}", app_kv.get("Height", ""))
        cb = cb.replace("{{APPEARANCE_AGE}}", app_kv.get("Age", ""))
        cb = cb.replace("{{APPEARANCE_HAIR}}", app_kv.get("Hair", ""))
        cb = cb.replace("{{APPEARANCE_EYES}}", app_kv.get("Eyes", ""))
        cb = cb.replace("{{APPEARANCE_BODY}}", app_kv.get("Body", ""))
        cb = cb.replace("{{APPEARANCE_FACE}}", app_kv.get("Face", ""))
        cb = cb.replace("{{APPEARANCE_FEATURES}}", app_kv.get("Features", ""))
        cb = cb.replace("{{APPEARANCE_PRIVATES}}", app_kv.get("Privates", "Unstated"))
        
        # Appearance Traits (up to 2)
        # We need to extract them from the raw text because extract_key_value doesn't handle duplicate keys well
        app_text = extract_section(card["data"].get("description", ""), "APPEARANCE DETAILS")
        trait_matches = re.findall(r"Appearance Trait:\s*(.*?)\n\s*↳\s*Details:\s*(.*?)\n\s*↳\s*Effect:\s*(.*?)(?=\nAppearance Trait|\Z)", app_text, re.DOTALL)
        
        for i in range(1, 3):
            if i <= len(trait_matches):
                t, d, e = trait_matches[i-1]
                cb = cb.replace(f"{{{{APPEARANCE_TRAIT_{i}}}}}", t.strip())
                cb = cb.replace(f"{{{{APPEARANCE_TRAIT_{i}_DETAILS}}}}", d.strip())
                cb = cb.replace(f"{{{{APPEARANCE_TRAIT_{i}_EFFECT}}}}", e.strip())
            else:
                cb = re.sub(rf"Appearance Trait: \{{\{{APPEARANCE_TRAIT_{i}\}}\}}.*?Effect: \{{\{{APPEARANCE_TRAIT_{i}_EFFECT\}}\}}\n?", "", cb, flags=re.DOTALL)
        
        cb = cb.replace("{{OUTFIT_HEAD}}", outfit_kv.get("Head", ""))
        cb = cb.replace("{{OUTFIT_ACCESSORIES}}", outfit_kv.get("Accessories", ""))
        cb = cb.replace("{{OUTFIT_MAKEUP}}", outfit_kv.get("Makeup", ""))
        cb = cb.replace("{{OUTFIT_NECK}}", outfit_kv.get("Neck", ""))
        cb = cb.replace("{{OUTFIT_TOP}}", outfit_kv.get("Top", ""))
        cb = cb.replace("{{OUTFIT_BOTTOM}}", outfit_kv.get("Bottom", ""))
        cb = cb.replace("{{OUTFIT_LEGS}}", outfit_kv.get("Legs", ""))
        cb = cb.replace("{{OUTFIT_SHOES}}", outfit_kv.get("Shoes", ""))
        cb = cb.replace("{{OUTFIT_UNDERWEAR}}", outfit_kv.get("Underwear", ""))
        
        cb = cb.replace("{{CONNECTIONS}}", extract_section(card["data"].get("description", ""), "CONNECTIONS"))

        # Inventory
        inv_text = extract_section(card["data"].get("description", ""), "INVENTORY")
        inv_matches = re.findall(r"Item:\s*(.*?)\n\s*↳\s*Details:\s*(.*?)(?=\nItem|\Z)", inv_text, re.DOTALL)
        
        for i in range(1, 3):
            if i <= len(inv_matches):
                t, d = inv_matches[i-1]
                cb = cb.replace(f"{{{{INVENTORY_ITEM_{i}}}}}", t.strip())
                cb = cb.replace(f"{{{{INVENTORY_ITEM_{i}_DETAILS}}}}", d.strip())
            else:
                cb = re.sub(rf"Item: \{{\{{INVENTORY_ITEM_{i}\}}\}}.*?Details: \{{\{{INVENTORY_ITEM_{i}_DETAILS\}}\}}\n?", "", cb, flags=re.DOTALL)
        
        # Abilities
        ab_text = extract_section(card["data"].get("description", ""), "ABILITIES")
        species_m = re.search(r"Species Traits:\s*(.*?)(?=\nAbility|\Z)", ab_text, re.DOTALL)
        if species_m:
            cb = cb.replace("{{SPECIES_SUMMARY_SHORT}}", species_m.group(1).strip())
        else:
            cb = re.sub(r"Species Traits: \{\{SPECIES_SUMMARY_SHORT\}\}\s*<!--.*?-->\n*", "", cb)
            
        ab_matches = re.findall(r"Ability:\s*(.*?)\n\s*↳\s*Details:\s*(.*?)(?=\nAbility|\Z)", ab_text, re.DOTALL)
        
        for i in range(1, 3):
            if i <= len(ab_matches):
                t, d = ab_matches[i-1]
                cb = cb.replace(f"{{{{ABILITY_{i}}}}}", t.strip())
                cb = cb.replace(f"{{{{ABILITY_{i}_DETAILS}}}}", d.strip())
            else:
                cb = re.sub(rf"Ability: \{{\{{ABILITY_{i}\}}\}}.*?Details: \{{\{{ABILITY_{i}_DETAILS\}}\}}\n?", "", cb, flags=re.DOTALL)
        cb = cb.replace("{{OUTFIT_BOTTOM}}", outfit_kv.get("Bottom", ""))
        cb = cb.replace("{{OUTFIT_LEGS}}", outfit_kv.get("Legs", ""))
        cb = cb.replace("{{OUTFIT_SHOES}}", outfit_kv.get("Shoes", ""))
        cb = cb.replace("{{OUTFIT_UNDERWEAR}}", outfit_kv.get("Underwear", ""))
        
        cb = cb.replace("{{ORIGIN_BACKSTORY}}", origin or "Background details are stored in the Lorebook.")
        cb = cb.replace("{{RESIDENCE}}", residence or "Unknown")
        cb = cb.replace("{{CONNECTIONS}}", connections or "None")
        
        cb = re.sub(r'Item: \{\{INVENTORY_ITEM_1\}\}.*?\{\{INVENTORY_ITEM_2_DETAILS\}\}', inventory or "None", cb, flags=re.DOTALL)
        cb = re.sub(r'Species Traits: \{\{SPECIES_SUMMARY_SHORT\}\}\s*<!--.*?-->\n+', "", cb)
        cb = re.sub(r'Ability: \{\{ABILITY_1\}\}.*?\{\{ABILITY_2_DETAILS\}\}', abilities or "None", cb, flags=re.DOTALL)
        
        pers_kv = extract_key_value(personality_sec)
        cb = cb.replace("{{PERSONALITY_ARCHETYPE}}", pers_kv.get("Archetype", personality))
        cb = cb.replace("{{PERSONALITY_TAGS}}", pers_kv.get("Personality Tags", ""))
        cb = cb.replace("{{BEHAVIOR_NOTES}}", "Detailed in Lorebook.")
        
        sexual_info = extract_section(desc, "GENERAL SEXUAL INFO")
        speech_info = extract_section(desc, "GENERAL SPEECH INFO")
        
        def safe_extract(pattern, text, default):
            m = re.search(pattern, text)
            return m.group(1).strip() if m else default
            
        cb = cb.replace("{{SEXUAL_ORIENTATION}}", safe_extract(r"Sexual Orientation:\s*(.*)", sexual_info, "Unstated"))
        cb = cb.replace("{{SEXUAL_ORIENTATION_EXPLANATION}}", safe_extract(r"Sexual Orientation:.*?\n\s*[\u21b3\w]+\s*Explanation:\s*(.*?)(?=\nRole|\Z)", sexual_info, "See Lorebook."))
        cb = cb.replace("{{SEXUAL_ROLE}}", safe_extract(r"Role during sex:\s*(.*)", sexual_info, "Unstated"))
        cb = cb.replace("{{SEXUAL_ROLE_EXPLANATION}}", safe_extract(r"Role during sex:.*?\n\s*[\u21b3\w]+\s*Explanation:\s*(.*)", sexual_info, "See Lorebook."))
        
        cb = cb.replace("{{SPEECH_STYLE}}", safe_extract(r"Style:\s*(.*)", speech_info, "See Lorebook."))
        cb = cb.replace("{{SPEECH_QUIRKS}}", safe_extract(r"Quirks:\s*(.*)", speech_info, "See Lorebook."))
        cb = cb.replace("{{SPEECH_TICKS}}", safe_extract(r"Ticks:\s*(.*)", speech_info, "See Lorebook."))
        
        all_chars_text.append(cb)
        
        if first_mes:
            all_messages.append(f"**[{name}] - First Message:**\n\n{first_mes}")
        for idx, alt in enumerate(alt_greetings):
            all_messages.append(f"**[{name}] - Alternate Greeting {idx+1}:**\n\n{alt}")
        
    # Reassemble the final markdown
    # 1. Replace SETTING fields
    main_chars = "{{user}}, " + ", ".join(char_names)
    final_md = tpl_text
    final_md = re.sub(r'(- Time/Period:).*', lambda m: f"{m.group(1)} {setting['time']}", final_md)
    final_md = re.sub(r'(- World Details:).*', lambda m: f"{m.group(1)} {setting['world']}", final_md)
    final_md = re.sub(r'(- Main Characters:).*', lambda m: f"{m.group(1)} {main_chars}", final_md)
    
    # 2. Replace the character section
    # The template has CharName_1 and CharName_2 and a duplicate note. We remove everything from <[CharName_1]> up to # [AI BEHAVIOR NOTES (MULTI-CHAR)]
    # and replace it with our joined character blocks.
    pattern = r'<\{\{CharName_1\}\}>.*?---(?=\n\n# \[AI BEHAVIOR NOTES \(MULTI-CHAR\)\])'
    
    match = re.search(pattern, final_md, flags=re.DOTALL)
    if match:
        joined_chars = "\n\n---\n\n".join(all_chars_text)
        final_md = final_md[:match.start()] + joined_chars + "\n\n---" + final_md[match.end():]
    else:
        print("Warning: Could not do strict block replacement. Attempting fallback.")
        
    # Clean up any leftover <!-> comments if needed, but the template says to delete them. 
    final_md = re.sub(r'<!--.*?-->', '', final_md, flags=re.DOTALL)
    
    # Clean multiple empty lines
    final_md = re.sub(r'\n{3,}', '\n\n', final_md)
    
    # 2.5 Inject initial messages block
    messages_str = "\n\n---\n\n".join(all_messages) if all_messages else "No initial messages provided."
    final_md = final_md.replace("{{INITIAL_MESSAGES_BLOCK}}", messages_str)
    
    # 2.6 Replace global Janitor template fields
    final_md = final_md.replace("{{LORE}}", setting.get("world_pulse") or "See Lorebook for world laws, factions, and locations.")
    final_md = final_md.replace("{{SCENARIO_OVERVIEW}}", setting.get("standing_situation") or "Detailed in the Lorebook.")
    final_md = final_md.replace("{{GROUP_RELATIONSHIPS}}", "See individual Character Cards and Lorebooks for standing stances.")
    final_md = final_md.replace("{{GROUP_ATTITUDE}}", "Varies dynamically based on character. See Lorebooks.")
    final_md = final_md.replace("{{GROUP_HIERARCHY}}", "Defined by the LSE Pack Code. See Lorebook.")
    
    # Clean up any remaining uppercase placeholders
    final_md = re.sub(r'\{\{[A-Z0-9_]+\}\}', '', final_md)
    
    out_path = export_dir / f"{world_name}_JanitorAI.md"
    out_path.write_text(final_md, encoding="utf-8")
    print(f"Successfully generated Janitor Profile: {out_path.name}")

    # 3. Generate Janitor Bio
    bio_json_path = drafts_dir / "JanitorAI_Bio_Group.json"
    bio_template_path = base_dir / "templates" / "Janitor_Bio_Template.html"
    if bio_template_path.exists():
        bio_html = bio_template_path.read_text(encoding="utf-8")
        
        sf = {}
        vis = {}
        if bio_json_path.exists():
            bio_data = json.loads(bio_json_path.read_text(encoding="utf-8"))
            sf = bio_data.get("storefront_text", {})
            vis = bio_data.get("visuals", {})
            
            # Build roster from JSON if present
            roster_blocks = []
            for r in bio_data.get("roster", []):
                r_img = r.get("image", {}).get("placeholder_url", "")
                r_name = r.get("name", "")
                r_sub = r.get("subtitle", "")
                r_desc = r.get("description", "")
                
                block = f'''<p style="text-align: center">
        <img src="{r_img}" alt="{r_name}" width="200" /><br />
        <span style="font-size: 1.1em; color: rgb(249, 226, 175)"><strong>{r_name}</strong></span><br />
        <span style="font-size: 0.9em; color: rgb(166, 173, 200)"><em>{r_sub}</em></span>
    </p>
    <p style="text-align: justify">
        <span style="font-size: 0.9em; color: rgb(250, 179, 135)">{r_desc}</span>
    </p>'''
                roster_blocks.append(block)
                
            bio_html = bio_html.replace("{{ROSTER_SECTION}}", "\n".join(roster_blocks))
        
        bio_html = bio_html.replace("{{TITLE}}", sf.get("title", f"The {world_name} Universe"))
        bio_html = bio_html.replace("{{SUBTITLE}}", sf.get("subtitle", "A Multi-Character Interactive Experience"))
        
        main_vis = vis.get("main_portrait_1x1", {})
        bio_html = bio_html.replace("{{MAIN_PORTRAIT_URL}}", main_vis.get("placeholder_url", "https://placecats.com/300/300"))
        
        bio_html = bio_html.replace("{{IMPACT_LINE}}", sf.get("impact_line", ""))
        bio_html = bio_html.replace("{{HOOK}}", sf.get("hook", ""))
        bio_html = bio_html.replace("{{BLURB}}", sf.get("blurb", ""))
        
        sup_vis = vis.get("supporting_image_banner", {})
        bio_html = bio_html.replace("{{BANNER_URL}}", sup_vis.get("placeholder_url", "https://placecats.com/800/300"))
        
        bio_html = bio_html.replace("{{WORLD_TEASER}}", sf.get("world_teaser", ""))
        bio_html = bio_html.replace("{{CLOSING_LINE}}", sf.get("closing_line", ""))
        bio_html = bio_html.replace("{{WARNINGS}}", sf.get("warnings", "Fiction only."))
        
        # New Tags added by user template updates
        bio_html = bio_html.replace("{{GENRE}}", setting.get("genre", ""))
        bio_html = bio_html.replace("{{SETTING}}", setting.get("world", ""))
        
        # Build first messages previews from extracted all_messages
        if all_messages:
            preview_html = ""
            for msg in all_messages:
                # msg format is **[Name] - First Message:**\n\n[text]
                # we just format it as blockquote
                preview_html += f"<blockquote>{msg}</blockquote><br/>\n"
            bio_html = bio_html.replace("{{FIRST_MESSAGES_PREVIEWS}}", preview_html)
        
        # Clean up any remaining uppercase placeholders
        bio_html = re.sub(r'\{\{[A-Z0-9_]+\}\}', '', bio_html)
        
        bio_out_path = export_dir / f"{world_name}_JanitorAI_Bio.html"
        bio_out_path.write_text(bio_html, encoding="utf-8")
        print(f"Successfully generated Janitor Bio: {bio_out_path.name}")
        

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tools/build_janitor_profile.py <world_name>")
        sys.exit(1)
    build_janitor_profile(sys.argv[1])
