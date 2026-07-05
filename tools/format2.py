import re

try:
    with open(r'd:\World-Forge\wiki\Omegaverse_Guide.md', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Remove CSS garbage
    css_1 = r'#rescontent\{-moz-user-select:none!important;-webkit-user-select:none!important;-ms-user-select:none;user-select:none!important\}#res_area ::selection,#btn_box ::selection,\.mainc ::selection\{background:transparent!important\}#res_area ::-moz-selection,#btn_box ::-moz-selection,\.mainc ::-moz-selection\{background:transparent!important\}'
    css_2 = r'#rescontent\.story_text \.uhNote::before\{content:"Nota"\}'
    
    text = re.sub(css_1, '', text)
    text = re.sub(css_2, '', text)

    # 2. Remove ACFN's Omegaverse Guide artifacts
    text = re.sub(r'# ACFN\'s Omegaverse Guide\n\nAutori \[ACFN\]\(https://www.quotev.com/LiaACFN\)\n\n', '', text)
    text = re.sub(r'# ACFN\'s Omegaverse Guide\n\nAutori \[ACFN\]\(https://www.quotev.com/LiaACFN\)', '', text)

    # 3. Clean up multiple empty lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    # 4. Fix Squished words
    replacements = {
        'SecondaryBonding': 'Secondary\n\nBonding',
        'Scent BlockerIt': '**Scent Blocker**\n\nIt',
        'Scent ConcealerIt': '**Scent Concealer**\n\nIt',
        'Comfort SeekingThis': '**Comfort Seeking**\n\nThis',
        'Pre HeatAround': '**Pre Heat**\n\nAround',
        'PregnancyPregnant': '**Pregnancy**\n\nPregnant',
        'StressMost': '**Stress**\n\nMost',
        'BathroomMost': '**Bathroom**\n\nMost',
        'BedroomThe': '**Bedroom**\n\nThe',
        'KitchenDepending': '**Kitchen**\n\nDepending',
        'GarageIf': '**Garage**\n\nIf',
        'Sympathy CycleSometimes': '**Sympathy Cycle**\n\nSometimes',
        'Stress CycleWhen': '**Stress Cycle**\n\nWhen',
        'Pre-presentationTheir': '**Pre-presentation**\n\nTheir',
        'Newly Presented (age 13-14)Here’s': '**Newly Presented (age 13-14)**\n\nHere’s',
        'GrownOnce': '**Grown**\n\nOnce',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    # 5. Fix double bullets `- **• Neat**` -> `- **Neat**`
    text = re.sub(r'- \*\*• (.*?)\*\*', r'- **\1**', text)

    # 6. Format Pack Roles
    pack_roles = [
        'Pack Leader (Enigma/Alpha/Male Delta)',
        'Leader’s Mate/Pack Mom (Female Delta/Female Beta/Omega)',
        'Right Hand/s (Delta/Beta)',
        'Left Hand/s (Delta/Beta)',
        'Caretaker/s (Female Delta/Female Beta/Omega)',
        'Pup/s'
    ]
    for role in pack_roles:
        # Avoid matching if already formatted or in a weird place.
        # It's usually followed directly by the text or a zero-width space.
        text = re.sub(re.escape(role) + r'[\u200b\ufeff]*([A-Z])', f"**{role}**\n\n\\1", text)

    with open(r'd:\World-Forge\wiki\Omegaverse_Guide.md', 'w', encoding='utf-8') as f:
        f.write(text)

    print("Success!")
except Exception as e:
    import traceback
    traceback.print_exc()

