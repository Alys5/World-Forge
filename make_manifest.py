import os

export_dir = 'd:/World-Forge/Export/SvartulfrVerse_Urban'
files = [f for f in os.listdir(export_dir) if f.endswith('.json')]

lines = [
    '# Revised Files — Cumulative Manifest',
    '',
    '> Maintained automatically by the mini-Compiler (Phase R4) on every revision.',
    '> Lists every Export/ file ever touched by the revision pipeline. Files NOT',
    '> listed here are exactly as the original full pipeline produced them.',
    '> Export filenames are never renamed to mark revisions — this manifest is the',
    '> sole revision marker on the Export side, so ST imports and UID references',
    '> stay stable.',
    '',
    '| File | Last revised in | Date | Change summary | Revision history |',
    '|---|---|---|---|---|'
]

for f in files:
    lines.append(f'| {f} | R4 | 2026-07-12 | Structural template rebuild | R4 |')

with open(os.path.join(export_dir, 'REVISED_FILES.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')
