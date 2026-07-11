import json
import os
import sys
import re
from pathlib import Path

def parse_master_design(world_name, drafts_dir):
    md_path = drafts_dir / "Master_Design.md"
    setting = {"time": "Modern Day", "world": "Urban Fantasy", "genre": ""}
    if md_path.exists():
        text = md_path.read_text(encoding="utf-8")
        genre_m = re.search(r"\*\*Genre & Tone:\*\*\s*(.*)", text)
        if genre_m:
            setting["genre"] = genre_m.group(1).strip()
            setting["world"] = setting["genre"]
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
    # Look for the <[CharName_1]> ... </[CharName_1]> block
    char_block_match = re.search(r'(<\[CharName_1\]>\n.*?\n</\[CharName_1\]>)', tpl_text, re.DOTALL)
    if not char_block_match:
        print("Error: Could not find <[CharName_1]> block in template.")
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
        
        # We will use the entire desc for PHYSICAL APPEARANCE
        physical = desc.strip() if desc.strip() else "Physical appearance details are integrated in the Lorebook."
        # Cross reference for STARTING OUTFIT per user instruction
        outfit = "Outfit and clothing details are integrated within the Physical Appearance section above."
        
        # Replace placeholders in the block
        cb = char_block_template
        # Replace name tags
        cb = cb.replace("<[CharName_1]>", f"<{name}>")
        cb = cb.replace("</[CharName_1]>", f"</{name}>")
        cb = cb.replace("[[CharName_1]]", f"[{name}]")
        cb = cb.replace("[CharName_1]", name)
        
        # Inject Character Overview (Scenario)
        cb = re.sub(r'(## CHARACTER OVERVIEW\n(?:<!--.*?-->\n)?)(.*?)(?=\n## APPEARANCE DETAILS)', lambda m: m.group(1) + (scenario if scenario else "Detailed in Lorebook.") + "\n", cb, flags=re.DOTALL)
        
        # Inject Physical Appearance
        cb = re.sub(r'(## APPEARANCE DETAILS\n)(.*?)(?=\n## STARTING OUTFIT)', lambda m: m.group(1) + physical + "\n", cb, flags=re.DOTALL)
        
        # Inject Starting Outfit
        cb = re.sub(r'(## STARTING OUTFIT\n)(.*?)(?=\n## ORIGIN \(BACKSTORY\))', lambda m: m.group(1) + outfit + "\n", cb, flags=re.DOTALL)
        
        # Inject Origin
        cb = re.sub(r'(## ORIGIN \(BACKSTORY\)\n(?:<!--.*?-->\n)?)(.*?)(?=\n## RESIDENCE)', lambda m: m.group(1) + "Background details are stored in the Lorebook payload.\n", cb, flags=re.DOTALL)
        
        # Inject Personality
        cb = re.sub(r'(Archetype:)(.*?\n)', lambda m: f"Archetype: {personality}\n", cb)
        
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
    pattern = r'<\[CharName_1\]>.*?---(?=\n\n# \[AI BEHAVIOR NOTES \(MULTI-CHAR\)\])'
    
    match = re.search(pattern, final_md, flags=re.DOTALL)
    if match:
        joined_chars = "\n\n---\n\n".join(all_chars_text)
        final_md = final_md[:match.start()] + joined_chars + "\n\n---" + final_md[match.end():]
    else:
        print("Warning: Could not do strict block replacement. Attempting fallback.")
        
    # Clean up any leftover <!-> comments if needed, but the template says to delete them. 
    final_md = re.sub(r'<!--.*?-->\n?', '', final_md, flags=re.DOTALL)
    
    # Clean multiple empty lines
    final_md = re.sub(r'\n{3,}', '\n\n', final_md)
    
    # 2.5 Inject initial messages block
    messages_str = "\n\n---\n\n".join(all_messages) if all_messages else "No initial messages provided."
    final_md = final_md.replace("{{INITIAL_MESSAGES_BLOCK}}", messages_str)
    
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
        
        bio_out_path = export_dir / f"{world_name}_JanitorAI_Bio.html"
        bio_out_path.write_text(bio_html, encoding="utf-8")
        print(f"Successfully generated Janitor Bio: {bio_out_path.name}")
        

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tools/build_janitor_profile.py <world_name>")
        sys.exit(1)
    build_janitor_profile(sys.argv[1])
