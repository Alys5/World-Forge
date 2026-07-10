# Compiler Log â€” SvartulfrVerse_Urban_

## Build Summary
- World Mode: sandbox
- Character Cards: 5
- Tier 1 World Lorebook: 1 (26 entries)
- Tier 2 Character Lorebooks: 7 (Jasper, Erik, Malachia, Noah, Protagonist, NPC_Deep, NPC_Roster)
- Tier 3 Sandbox Lorebook: 1 (4 entries)
- Intimacy Profiles: 8 (4 principal + 3 principal-adjacent NPCs + 1 roster)
- Sandbox Intimacy Register: 1 (3 entries)
- User.md: 1

## Output Manifest
Export/
â”œâ”€â”€ Jasper_Card.json
â”œâ”€â”€ Erik_Card.json
â”œâ”€â”€ Malachia_Card.json
â”œâ”€â”€ Noah_Card.json
â”œâ”€â”€ World_Director_Card.json
â”œâ”€â”€ User.md
â”œâ”€â”€ SvartulfrVerse_Urban__World_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__Jasper_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__Erik_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__Malachia_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__Noah_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__Protagonist_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__NPC_Deep_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__NPC_Roster_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__Sandbox_Lorebook.json
â”œâ”€â”€ SvartulfrVerse_Urban__Jasper_Intimacy_Profile.json
â”œâ”€â”€ SvartulfrVerse_Urban__Erik_Intimacy_Profile.json
â”œâ”€â”€ SvartulfrVerse_Urban__Malachia_Intimacy_Profile.json
â”œâ”€â”€ SvartulfrVerse_Urban__Noah_Intimacy_Profile.json
â”œâ”€â”€ SvartulfrVerse_Urban__Kaladin_Intimacy_Profile.json
â”œâ”€â”€ SvartulfrVerse_Urban__Wulfnic_Intimacy_Profile.json
â”œâ”€â”€ SvartulfrVerse_Urban__Logan_Intimacy_Profile.json
â”œâ”€â”€ SvartulfrVerse_Urban__NPC_Intimacy_Roster.json
â””â”€â”€ SvartulfrVerse_Urban__Sandbox_Intimacy_Register.json

## Critical Field Verification
- All system_prompt fields: non-empty, begin with {original} [OK]
- All post_history_instructions fields: non-empty, begin with {original} [OK]
- All depth_prompt structures present [OK]
- All style_override fields present (null or object) [OK]
- World Lorebook entries: position 0 [OK]
- Character Lorebook entries: position 1 [OK]
- SANDBOX_STATE: position 1, constant=true, ignoreBudget=true [OK]
- WORLD_PULSE entries: position 4, depth 2-4 [OK]
- NPC Memory Manifests embedded in each NPC-bearing lorebook [OK]
- Entry key == String(uid) for all entries [OK]
- CamelCase per-entry fields (scanDepth, caseSensitive, etc.) [OK]
- No snake_case aliases (case_sensitive, match_whole_words, etc.) [OK]
- No metadata fields (path, source, generated_at, etc.) [OK]
- UTF-8 encoding verified (no mojibake) [OK]
- JSON syntax valid [OK]

## Sign-Off Chain Verified
- Editor Critique Round 1: APPROVED
- Voice Auditor Round 1: APPROVED
- Intimacy Auditor Round 1: APPROVED
- Intimacy Architect: APPROVED

Status: READY FOR SILLYTAVERN IMPORT
