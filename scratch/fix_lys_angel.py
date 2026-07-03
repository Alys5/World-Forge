import os
import re

path_js = r'd:\World-Forge\Export\SvartulfrVerse\SvartulfrVerse_JanitorAI_Script.js'

with open(path_js, 'r', encoding='utf-8') as f:
    text_js = f.read()

# The JS file contains JSON strings where quotes are escaped as \"
text_js = text_js.replace(r'Invidiano \"Lys Angel\"', 'Invidiano l\'alter-ego da modella')
text_js = text_js.replace(r'Ammirano \"Lys Angel\"', 'Ammirano l\'alter-ego segreto')
text_js = text_js.replace(r'(\"Lys Angel\")', '')
text_js = text_js.replace(r'sotto il letale alias \"Lys Angel\"', 'sotto un alias segreto')

with open(path_js, 'w', encoding='utf-8') as f:
    f.write(text_js)

print('Occurrences left:', text_js.count('Lys Angel'))
