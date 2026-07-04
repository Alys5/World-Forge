# Revision R9 Report — SvartulfrVerse_EN
**World Mode:** sandbox
**Scope type:** tier2_character_modify_field (AnyPOV macro cleanup)
**Date:** 2026-07-04

---

## Revision Log Entry (copied from Master Design)

### Revision R9 — 2026-07-04 06:28 CEST
**Status:** PENDING — blocked until R8 APPLIED
**Scope type:** tier2_character_modify_field
**Mode:** freeform

**User intent (verbatim):**
> ci sono ancora riferimenti a {{user}} che non matchano AnyPOV (es. SvartulfrVerse_Erik_Lorebook.json:L51 e altri). Pulire tutti i file da riferimenti hardcoded a "Alyssa"/"she"/"her"/"hers"/"herself" quando si riferiscono a {{user}}; sostituire con le macro AnyPOV: {{user}}, {{sub}}, {{obj}}, {{poss}}, {{poss_p}}, {{ref}}. Valido su tutti i draft file e tutti gli Export JSON lorebook.

---

## Phase R0 (Reviser): Complete

---

## AnyPOV Macro Reference (for Architect)

| Macro | Meaning |
|---|---|
| `{{user}}` | The user's name |
| `{{sub}}` | Subjective pronoun (he/she/they) |
| `{{obj}}` | Objective pronoun (him/her/them) |
| `{{poss}}` | Possessive adjective (his/her/their) |
| `{{poss_p}}` | Possessive pronoun (his/hers/theirs) |
| `{{ref}}` | Reflexive pronoun (himself/herself/themselves) |

## Audit Targets

Files to audit for hardcoded "Alyssa"/gendered pronoun violations:
- All `Tier2_*.md` files
- All `Card_*.md` files
- All `Instructions_*.md` files
- All `JanitorAI_Profile_*.md` files
- All Export JSON lorebook `content` fields
- `Drafts/User.md`

## Known violations (Reviser pre-scan)
- `Tier2_Alyssa_Entries.md` L40: `birth name Alyssa` — must be removed (R10 will handle persona pruning; R9 handles macro hygiene)
- `JanitorAI_Profile_Group.md`: Uses "Alyssa" in at least one passage referencing {{user}} as a character
- Various lorebook JSON `content` fields: may contain "she"/"her" when referring to {{user}} outside of character voice passages

## Note on scope boundary
R9 does NOT remove persona content from lorebooks — that is R10's job.
R9 only replaces hardcoded gendered pronouns / name "Alyssa" with AnyPOV macros where they appear as *references to {{user}}*.
Character voice passages (e.g., Erik *talking about* his daughter) use AnyPOV macros; third-person narrator references to {{user}} also use macros.

---

## Phase R1: mini-Refiner — AWAITING (blocked on R8)

---

## Phase R2: mini-Architect — AWAITING

---

## Phase R3: mini-Editor — AWAITING

---

## Phase R4: mini-Compiler — AWAITING

---

## Phase R5: mini-Prompt Engineer — AWAITING
