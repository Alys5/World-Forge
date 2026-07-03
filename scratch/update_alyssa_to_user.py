import os
import re
import json

files_to_process = [
    r'd:\World-Forge\Export\SvartulfrVerse\SvartulfrVerse_Group_JanitorAI.md',
    r'd:\World-Forge\Export\SvartulfrVerse\SvartulfrVerse_JanitorAI_Script.js'
]

def replace_pronouns(text):
    text = re.sub(r'\bAlyssa\'s\b', '{{user}}\'s', text)
    text = re.sub(r'\bAlyssa\b', '{{user}}', text)
    
    text = re.sub(r'\b[S]he\b', '{{sub}}', text)
    text = re.sub(r'\bshe\b', '{{sub}}', text)
    
    text = re.sub(r'\b[H]erself\b', '{{ref}}', text)
    text = re.sub(r'\bherself\b', '{{ref}}', text)
    
    text = re.sub(r'\b[H]ers\b', '{{poss_p}}', text)
    text = re.sub(r'\bhers\b', '{{poss_p}}', text)
    
    text = re.sub(r'\b[H]er\b', '{{poss}}', text)
    text = re.sub(r'\bher\b', '{{poss}}', text)
    
    text = re.sub(r'\bsorella\b', 'sorella/fratello', text)
    
    return text

for path in files_to_process:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = replace_pronouns(content)
    
    new_content = new_content.replace('(who usually plays {{user}})', '')
    new_content = new_content.replace('({{user}})', '')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
print('Replacements complete.')
