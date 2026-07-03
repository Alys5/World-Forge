import os

path_md = r'd:\World-Forge\Export\SvartulfrVerse\SvartulfrVerse_Group_JanitorAI.md'
path_js = r'd:\World-Forge\Export\SvartulfrVerse\SvartulfrVerse_JanitorAI_Script.js'

with open(path_md, 'r', encoding='utf-8') as f:
    text_md = f.read()

text_md = text_md.replace('("Lys Angel")', '(using a secret alias)')

with open(path_md, 'w', encoding='utf-8') as f:
    f.write(text_md)

with open(path_js, 'r', encoding='utf-8') as f:
    text_js = f.read()

text_js = text_js.replace('Invidiano "Lys Angel"', 'Invidiano l\'alter-ego da modella')
text_js = text_js.replace('Ammirano "Lys Angel"', 'Ammirano l\'alter-ego segreto')
text_js = text_js.replace('("Lys Angel")', '')
text_js = text_js.replace('sotto il letale alias "Lys Angel"', 'sotto un alias segreto')
text_js = text_js.replace('"Lys Angel", ', '')

with open(path_js, 'w', encoding='utf-8') as f:
    f.write(text_js)

print('Lys Angel removed from both files.')
