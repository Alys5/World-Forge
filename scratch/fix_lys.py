import os
import re

path_js = r'd:\World-Forge\Export\SvartulfrVerse\SvartulfrVerse_JanitorAI_Script.js'

with open(path_js, 'r', encoding='utf-8') as f:
    text_js = f.read()

# Replace exact word Lys with {{user}} where appropriate
text_js = re.sub(r"\bLys\b\.", "{{user}}.", text_js)
text_js = re.sub(r"zia Lys", "zia {{user}}", text_js)

# For Aliases(Lys, Sunflower, Little Moon)
text_js = text_js.replace("Aliases(Lys, Sunflower", "Aliases(Sunflower")
text_js = text_js.replace("Aliases(Lys,", "Aliases(")
text_js = text_js.replace("Lys,", "") # just in case there are other loose lists

# Double check if any Lys is left
leftovers = re.findall(r'\bLys\b', text_js)

with open(path_js, 'w', encoding='utf-8') as f:
    f.write(text_js)

print("Remaining exact matches of Lys:", leftovers)
