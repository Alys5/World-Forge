# Revision R11 Report — SvartulfrVerse_EN
**World Mode:** sandbox
**Scope type:** tier2_character_modify_field (JanitorAI full rewrite per template)
**Date:** 2026-07-04

---

## Revision Log Entry (copied from Master Design)

### Revision R11 — 2026-07-04 06:28 CEST
**Status:** PENDING — blocked until R10 APPLIED
**Scope type:** tier2_character_modify_field
**Mode:** freeform

**User intent (verbatim):**
> fai si che SvartulfrVerse_JanitorAI.txt diventi un md e rispetti pedissequamente il formato del template templates/Janitor_Bot_Template.md. Il file attuale (Export/SvartulfrVerse/SvartulfrVerse_JanitorAI.md) esiste ma non segue il template correttamente. Deve essere completamente riscritto seguendo la struttura esatta del template per tutti i personaggi (Jasper, Erik, Malachia, Noah, Kaladin, Logan, Wulfnic) con età, rank, pureblood status aggiornati. {{user}} non deve avere un blocco personaggio nel file JanitorAI — è definita dalla scheda User.md separata.

---

## Phase R0 (Reviser): Complete

Note: The `.txt` file does not exist. The target file is `Export/SvartulfrVerse/SvartulfrVerse_JanitorAI.md` (already exists but does not follow `templates/Janitor_Bot_Template.md`). This revision is a **full rewrite** of that file.

---

## Template Structure Reference

The output file must follow `templates/Janitor_Bot_Template.md` exactly:

```
# [SETTING]
- Time/Period:
- World Details:
- Main Characters: (list — {{user}} NOT included as a <CharName> block)

## LORE
## SCENARIO OVERVIEW

---

# [GROUP DYNAMICS AND RELATIONSHIPS]
- Internal Relationships:
- Attitude toward {{user}}:
- Hierarchy/Roles:

---

<CharName>
# [CharName]
## CHARACTER OVERVIEW
## [APPEARANCE]
### APPEARANCE DETAILS
### STARTING OUTFIT
<Q&A>...</Q&A>
## [BASIC_INFO]
### ORIGIN (BACKSTORY)
### RESIDENCE
### CONNECTIONS
### SECRET
### INVENTORY
### ABILITIES
## [PERSONALITY_AND_TRAITS]
### PERSONALITY
<Q&A>...</Q&A>
## [BEHAVIOR_NOTES]
## [SEXUALITY]
### GENERAL SEXUAL INFO
<Q&A>...</Q&A>
## [OTHER_SEXUAL_NOTES]
## [SPEECH]
### GENERAL SPEECH INFO
## Speech EXAMPLES AND OPINIONS
<speech_examples>...</speech_examples>
## SYNONYMS
## PREMADE STORY PLAN
</CharName>
```

Characters to include (in order): Jasper, Erik, Malachia, Noah, Kaladin, Logan, Wulfnic
{{user}} block: NOT included (defined by User.md)

## Ages/Ranks for JanitorAI (canonical after R8)
| Character | Age | Rank | Bloodline |
|---|---|---|---|
| Jasper | 19yo (b.2005) | Delta | Pureblood by Descent |
| Erik | 50yo (b.1974) | Alpha | Old Bloodline |
| Malachia | 28yo (b.1996) | Alpha | Pureblood by Descent |
| Noah | 25yo (b.1999) | Delta | Pureblood by Descent |
| Kaladin | 33yo (b.1991) | Alpha | Military-Modified |
| Logan | 45yo (b.1979) | Delta | Old Bloodline |
| Wulfnic | ~1197yo (b.827 DC) | Enigma / Alpha of Alphas | True Pureblood (Fenris-gifted) |

## Kaladin Profile Note
`JanitorAI_Profile_Kaladin.md.archived_r4` exists — needs to be unarchived (restored) or a new profile drafted for R11. Do NOT skip Kaladin in the JanitorAI output.

---

## Phase R1: mini-Refiner — AWAITING (blocked on R10)

---

## Phase R2: mini-Architect — AWAITING

---

## Phase R3: mini-Editor — AWAITING

---

## Phase R4: mini-Compiler — AWAITING

Output: `Export/SvartulfrVerse/SvartulfrVerse_JanitorAI.md` (full rewrite, UTF-8)

---

## Phase R5: mini-Prompt Engineer — AWAITING
