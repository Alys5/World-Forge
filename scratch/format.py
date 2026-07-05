import re
import traceback
import sys

try:
    with open(r'd:\World-Forge\wiki\Omegaverse_Guide.md', 'r', encoding='utf-8') as f:
        text = f.read()

    # Remove the CSS block completely
    css_block = r'#rescontent\{-moz-user-select:none!important;-webkit-user-select:none!important;-ms-user-select:none;user-select:none!important\}#res_area ::selection,#btn_box ::selection,\.mainc ::selection\{background:transparent!important\}#res_area ::-moz-selection,#btn_box ::-moz-selection,\.mainc ::-moz-selection\{background:transparent!important\}\n\n#rescontent\.story_text \.uhNote::before\{content:"Nota"\}'
    text = re.sub(css_block, '', text)
    
    # Remove CSS if it's on a single line
    css_single = r'#rescontent\{-moz-user-select:none!important;-webkit-user-select:none!important;-ms-user-select:none;user-select:none!important\}#res_area ::selection,#btn_box ::selection,\.mainc ::selection\{background:transparent!important\}#res_area ::-moz-selection,#btn_box ::-moz-selection,\.mainc ::-moz-selection\{background:transparent!important\}'
    text = re.sub(css_single, '', text)

    # Replace the heading headers
    header_pattern = r'ACFN\'s Omegaverse GuideAutori ACFN(.*?)#rescontent\.story_text \.uhNote::before\{content:"Nota"\}'
    text = re.sub(header_pattern, r'## \1\n\n', text)

    # Add spacing where sentences are squished together without space
    # Look for lowercase followed by dot followed by Uppercase (e.g., gender.They) -> gender.\n\nThey
    text = re.sub(r'([a-z\)])\.([A-Z])', r'\1.\n\n\2', text)
    
    # Fix the ' – ' dictionary terms but only if not a heading
    def fix_dict_term(m):
        content = m.group(1)
        if content.startswith('## '):
            return f"{content} – "
        return f"- **{content}** – "
    
    text = re.sub(r'(?<=\n\n)(.*?)( – )', fix_dict_term, text)
    # Also handle the first term under Dictionary/Terms which might be at start of paragraph
    text = re.sub(r'## Dictionary/Terms\n\n(.*?)( – )', lambda m: f"## Dictionary/Terms\n\n- **{m.group(1)}** – ", text)

    # Bold category headers
    for cat in ['Description:', 'Biology:', 'Statistics:', 'Characteristics:', 'Age of Maturation']:
        text = text.replace(cat, f"**{cat}**")

    with open(r'd:\World-Forge\wiki\Omegaverse_Guide.md', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Success!")
except Exception as e:
    traceback.print_exc()
    sys.exit(1)
