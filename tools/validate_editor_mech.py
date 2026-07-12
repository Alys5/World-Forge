import os, re

draft_dir = r'D:\World-Forge\Drafts\SvartulfrVerse_Urban'

# 1. File completeness
required_files = [
    'Card_Erik.md', 'Card_Jasper.md', 'Card_Malachia.md', 'Card_Noah.md', 'Card_World_Director.md',
    'User.md',
    'Tier1_World_Entries.md',
    'Tier2_Protagonist_Entries.md', 'Tier2_Erik_Entries.md', 'Tier2_Jasper_Entries.md',
    'Tier2_Malachia_Entries.md', 'Tier2_Noah_Entries.md', 'Tier2_NPC_Principal_Entries.md', 'Tier2_NPC_Roster_Entries.md',
    'Tier3_Sandbox_Entries.md',
    'Instructions_Erik.md', 'Instructions_Jasper.md', 'Instructions_Malachia.md', 'Instructions_Noah.md', 'Instructions_World_Director.md'
]
missing = [f for f in required_files if not os.path.exists(os.path.join(draft_dir, f))]
print('=== MISSING FILES ===')
for m in missing:
    print(f'MISSING: {m}')
if not missing:
    print('All required files present.')

# 2. {{original}} and engine contamination check
instructions = ['Instructions_Erik.md', 'Instructions_Jasper.md', 'Instructions_Malachia.md', 'Instructions_Noah.md', 'Instructions_World_Director.md']
contamination = [
    'narration discipline', 'formatting rules', 'format actions in asterisks', 'use *asterisks* for',
    'use asterisks for narration', 'dialogue uses double quotes', 'double quotes for dialogue',
    '**double asterisks** for emphasis', 'step-by-step pacing', 'show don\'t tell', 'show, don\'t tell',
    'vary your vocabulary', 'varied vocabulary', 'proactive writing', 'perspective rules',
    'do not act for {{user}}', 'don\'t act for {{user}}', '{{user}} controls their own', '{{user}} controls his own',
    '{{user}} controls her own', 'this is a fictional collaboration', 'creative writing exercise',
    'embody the character authentically'
]
print('\n=== {{original}} & ENGINE CONTAMINATION CHECK ===')
for fname in instructions:
    path = os.path.join(draft_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    sys_idx = None
    ph_idx = None
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == '# System Prompt':
            sys_idx = i
        if stripped == '# Post-History Instructions':
            ph_idx = i
    
    # Find first non-empty line after header
    def first_nonempty(start):
        for j in range(start+1, len(lines)):
            if lines[j].strip():
                return lines[j].strip()
        return None
    
    if sys_idx is not None:
        sys_first = first_nonempty(sys_idx)
        if sys_first != '{{original}}':
            print(f'HARD FAIL {fname}: system_prompt first non-empty line after header is not {{{{original}}}}. Found: {repr(sys_first)}')
    
    if ph_idx is not None:
        ph_first = first_nonempty(ph_idx)
        if ph_first != '{{original}}':
            print(f'HARD FAIL {fname}: post_history_instructions first non-empty line after header is not {{{{original}}}}. Found: {repr(ph_first)}')
    
    full_text = ''.join(lines)
    if '<style_override>' in full_text or '</style_override>' in full_text:
        print(f'HARD FAIL {fname}: literal <style_override> tag found')
    
    for phrase in contamination:
        if re.search(re.escape(phrase), full_text, re.IGNORECASE):
            print(f'HARD FAIL {fname}: engine contamination phrase found: "{phrase}"')

# 3. Post-history word count (content after {{original}} until end)
print('\n=== POST-HISTORY WORD COUNT CHECK ===')
for fname in instructions:
    path = os.path.join(draft_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    ph_idx = None
    for i, line in enumerate(lines):
        if line.strip() == '# Post-History Instructions':
            ph_idx = i
    if ph_idx is not None:
        content_lines = []
        found_original = False
        for line in lines[ph_idx+1:]:
            stripped = line.strip()
            if not found_original:
                if stripped == '{{original}}':
                    found_original = True
                continue
            content_lines.append(stripped)
        content = ' '.join(content_lines)
        word_count = len(content.split())
        if word_count > 150:
            print(f'HARD FAIL {fname}: post-history content is {word_count} words (max 150)')
        else:
            print(f'OK {fname}: post-history content is {word_count} words')

# 4. Check card files for {{original}} (should not be there)
print('\n=== DEPTH_PROMPT {{original}} CHECK ===')
card_files = ['Card_Erik.md', 'Card_Jasper.md', 'Card_Malachia.md', 'Card_Noah.md', 'Card_World_Director.md']
for fname in card_files:
    path = os.path.join(draft_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    if '{{original}}' in text:
        print(f'HARD FAIL {fname}: card contains {{original}} (should only be in instructions)')
    else:
        print(f'OK {fname}: no {{original}} in card')

# 5. Check Card_World_Director style_override against Section 11b
print('\n=== STYLE OVERRIDE vs SECTION 11b CHECK ===')
director_path = os.path.join(draft_dir, 'Card_World_Director.md')
with open(director_path, 'r', encoding='utf-8') as f:
    content = f.read()
if '## style_override' in content:
    print(f'HARD FAIL Card_World_Director.md: contains style_override but Section 11b says \'N/A — no overriding cards\' (all cards inherit world default)')
else:
    print('OK: Card_World_Director.md has no style_override section')

for fname in ['Card_Erik.md', 'Card_Jasper.md', 'Card_Malachia.md', 'Card_Noah.md']:
    path = os.path.join(draft_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if '## style_override' in content:
        print(f'HARD FAIL {fname}: contains style_override but Section 11b says \'N/A — no overriding cards\'')

# 6. Check forbidden phrases in User.md persona block
user_path = os.path.join(draft_dir, 'User.md')
with open(user_path, 'r', encoding='utf-8') as f:
    user_text = f.read()
user_forbidden = [
    'You are', 'you must', 'you should', 'you will', 'always ', 'never ', 'do not', 'don\'t ',
    'speaks with', 'speech pattern', 'sentence structure', 'vocabulary', 'accent', 'voice',
    'dialogue', 'mannerism', 'manner of speech', 'rhetorical', 'narration rules', 'formatting rules',
    'do not act for {{user}}', 'don\'t act for {{user}}', '{{user}} controls', 'trigger-response'
]
print('\n=== USER.md FORBIDDEN PHRASE CHECK ===')
begin_match = re.search(r'--- BEGIN PERSONA DESCRIPTION ---(.*?)--- END PERSONA DESCRIPTION ---', user_text, re.DOTALL)
if begin_match:
    persona_block = begin_match.group(1)
    for phrase in user_forbidden:
        if re.search(re.escape(phrase), persona_block, re.IGNORECASE):
            print(f'HARD FAIL User.md: forbidden phrase in persona block: "{phrase}"')
else:
    print('HARD FAIL User.md: Persona Description markers not found')

# 7. Check User.md structure
print('\n=== USER.md STRUCTURE CHECK ===')
if '## PERSONA DESCRIPTION' not in user_text:
    print('HARD FAIL User.md: missing ## PERSONA DESCRIPTION section')
if '## SETUP INSTRUCTIONS' not in user_text:
    print('HARD FAIL User.md: missing ## SETUP INSTRUCTIONS section')

# 8. Word count of User.md persona block
print('\n=== USER.md WORD COUNT CHECK ===')
begin_match = re.search(r'--- BEGIN PERSONA DESCRIPTION ---(.*?)--- END PERSONA DESCRIPTION ---', user_text, re.DOTALL)
if begin_match:
    persona_block = begin_match.group(1)
    word_count = len(persona_block.split())
    if word_count > 150:
        print(f'HARD FAIL User.md: Persona Description is {word_count} words (max 150)')
    else:
        print(f'OK User.md: Persona Description is {word_count} words')

# 9. Check for literal style_override tags in Instructions files
print('\n=== STYLE OVERRIDE TAG CHECK ===')
for fname in instructions:
    path = os.path.join(draft_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    if '<style_override>' in text or '</style_override>' in text:
        print(f'HARD FAIL {fname}: literal <style_override> tag present')
    else:
        print(f'OK {fname}: no literal <style_override> tag')

# 10. Check that post-history content does not hardcode arc behavior
print('\n=== POST-HISTORY ARC-CONTENT CHECK (Rule #10 soft check) ===')
for fname in instructions:
    path = os.path.join(draft_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    ph_match = re.search(r'# Post-History Instructions\s*\n\s*\{\{\{original\}\}\}\s*\n(.*)', text, re.DOTALL)
    if ph_match:
        ph_content = ph_match.group(1).strip()
        # Check for early-arc-specific language
        if 'this arc' in ph_content.lower() or 'earlier' in ph_content.lower():
            print(f'SOFT FLAG {fname}: post-history may contain arc-specific language')
        else:
            print(f'OK {fname}: post-history defers to SANDBOX_STATE')

# 11. Ambiguous keyword soft-flags in cards
print('\n=== AMBIGUOUS KEYWORD SOFT-FLAG CHECK (cards) ===')
soft_kw = ['narration', 'perspective', 'asterisks', 'formatting', 'emphasis', 'vocabulary']
for fname in card_files:
    path = os.path.join(draft_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    for kw in soft_kw:
        if re.search(re.escape(kw), text, re.IGNORECASE):
            print(f'SOFT FLAG {fname}: keyword "{kw}" present in card text')
