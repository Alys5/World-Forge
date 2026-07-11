import json
import os
import sys

def build_bio(world_name):
    base_dir = os.getcwd()
    drafts_dir = os.path.join(base_dir, 'Drafts', world_name)
    export_dir = os.path.join(base_dir, 'Export', world_name)
    template_path = os.path.join(base_dir, 'templates', 'Janitor_Bio_Template.html')
    
    if not os.path.exists(export_dir):
        os.makedirs(export_dir, exist_ok=True)
        
    if not os.path.exists(template_path):
        print(f"Error: Template {template_path} not found.")
        sys.exit(1)
        
    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()

    processed_count = 0
    for filename in os.listdir(drafts_dir):
        if filename.startswith("JanitorAI_Bio_") and filename.endswith(".json"):
            name = filename.replace("JanitorAI_Bio_", "").replace(".json", "")
            fpath = os.path.join(drafts_dir, filename)
            
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                continue
                
            storefront = data.get("storefront_text", {})
            visuals = data.get("visuals", {})
            roster = data.get("roster", [])
            
            # Also read corresponding Character Card to get first messages
            card_path = os.path.join(export_dir, f"{name}_Card.json")
            char_messages_html = ""
            if os.path.exists(card_path):
                with open(card_path, 'r', encoding='utf-8') as cf:
                    cdata = json.load(cf)
                    f_mes = cdata.get("data", {}).get("first_mes", "")
                    alts = cdata.get("data", {}).get("alternate_greetings", [])
                    if f_mes:
                        char_messages_html += f"<blockquote>**[{name}] - First Message:**<br/>{f_mes}</blockquote><br/>"
                    for i, alt in enumerate(alts):
                        char_messages_html += f"<blockquote>**[{name}] - Alternate Greeting {i+1}:**<br/>{alt}</blockquote><br/>"
            
            # Map placeholders
            html_content = template_content
            html_content = html_content.replace("{{TITLE}}", storefront.get("title", f"The {world_name} Universe"))
            html_content = html_content.replace("{{SUBTITLE}}", storefront.get("subtitle", ""))
            html_content = html_content.replace("{{HOOK}}", storefront.get("hook", ""))
            html_content = html_content.replace("{{IMPACT_LINE}}", storefront.get("impact_line", ""))
            html_content = html_content.replace("{{BLURB}}", storefront.get("blurb", ""))
            html_content = html_content.replace("{{WORLD_TEASER}}", storefront.get("world_teaser", ""))
            html_content = html_content.replace("{{CLOSING_LINE}}", storefront.get("closing_line", ""))
            html_content = html_content.replace("{{WARNINGS}}", storefront.get("warnings", "Fiction only."))
            
            html_content = html_content.replace("{{FIRST_MESSAGES_PREVIEWS}}", char_messages_html)
            
            # Additional placeholders from template updates
            html_content = html_content.replace("{{GENRE}}", "")
            html_content = html_content.replace("{{SETTING}}", "")
            html_content = html_content.replace("{{ROLE}}", "")
            html_content = html_content.replace("{{POV}}", "AnyPOV")
            html_content = html_content.replace("{{GENDER}}", "AnyGender")
            html_content = html_content.replace("{{DEFINED_ABOUT_CHARACTERS_AND_USER}}", "")
            html_content = html_content.replace("{{IMPLIED_BY_SCENARIO}}", "")
            html_content = html_content.replace("{{SCENARIOS}}", "")
            html_content = html_content.replace("{{WORLD_AND_FACTIONS}}", "")
            html_content = html_content.replace("{{LOREBOOK_ENGINE_DESCRIPTION}}", "")
            html_content = html_content.replace("{{DISCOVERY_TAGS}}", "")
            html_content = html_content.replace("{{ART_CREDITS}}", "")
            html_content = html_content.replace("{{FOOTER_LINKS}}", "")
            
            main_vis = visuals.get("main_portrait_1x1", {})
            html_content = html_content.replace("{{MAIN_PORTRAIT_PROMPT}}", main_vis.get("generation_prompt", ""))
            html_content = html_content.replace("{{MAIN_PORTRAIT_URL}}", main_vis.get("placeholder_url", "https://placecats.com/300/300"))
            
            banner_vis = visuals.get("supporting_image_banner", {})
            html_content = html_content.replace("{{BANNER_PROMPT}}", banner_vis.get("generation_prompt", ""))
            html_content = html_content.replace("{{BANNER_URL}}", banner_vis.get("placeholder_url", "https://placecats.com/800/300"))
            
            # Roster section
            roster_html = ""
            for i, npc in enumerate(roster):
                npc_name = npc.get("name", "")
                npc_sub = npc.get("subtitle", "")
                npc_desc = npc.get("description", "")
                npc_img = npc.get("image", {})
                npc_prompt = npc_img.get("generation_prompt", "")
                npc_url = npc_img.get("placeholder_url", "")
                
                roster_html += f"<!-- 🎨 PROMPT {npc_name.upper()}: {npc_prompt} -->\n"
                roster_html += f"""
<p style="text-align: center;">
  <img src="{npc_url}" alt="{npc_name}" width="200" /><br />
  <span style="font-size: 1.1em; color: rgb(249, 226, 175);"><strong>{npc_name}</strong></span><br />
  <span style="font-size: 0.9em; color: rgb(166, 173, 200);"><em>{npc_sub}</em></span>
</p>
<p style="text-align: justify;">
  <span style="font-size: 0.9em; color: rgb(250, 179, 135);">{npc_desc}</span>
</p>
<br />
"""

            html_content = html_content.replace("{{ROSTER_SECTION}}", roster_html)
            
            out_path = os.path.join(export_dir, f"{world_name}_JanitorAI_Bio_{name}.html")
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
                
            print(f"Generated storefront Bio: {out_path}")
            processed_count += 1
            
    print(f"Bio build complete. {processed_count} bios generated.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tools/build_bio.py <world_name>")
        sys.exit(1)
    build_bio(sys.argv[1])
