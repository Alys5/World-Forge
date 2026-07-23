> [BRAINSTORM NOTES — informal ideation, NOT a World Seed.
> Posture: revision-diagnostic · Written: 2026-07-23 · Replaces any prior Brainstorm_Notes.md in full.]

# Brainstorm Notes (revision diagnostic) — SvartulfrVerse_Urban

## Diagnosed against
`Drafts/Master_Design.md` and `Export/` files for SvartulfrVerse_Urban in active play.

## The primary concern (take this into /worldforge revise)
**Separation between Generic User (AnyPOV / Player Persona) and Canonical User (Alyssa Douglas-Bloodmoon):**
- In `Master_Design.md` Section 6, the architecture explicitly separates **Generic Custom User** (Default / AnyPOV: rank, gender, physique, secret life player-defined) from **Canonical Alyssa** (Optional overlay: White Moon Omega, Pre-Med, 155cm).
- In `Export/SvartulfrVerse_Urban_Janitor_Bio.html`, the bot promises AnyPOV flexibility ("*As an AnyPOV bot, your gender and LSE Rank are entirely up to you. You can choose to be an Alpha, Delta, Beta, or Omega.*").
- However, `Export/SvartulfrVerse_Urban_JanitorAI.md` hardcoded `{{user}}` as an Omega in multiple global lines:
  1. Line 7: `{{user}} is the runaway Omega hunted by their overprotective family`
  2. Line 10: `{{user}} Omega Nest...`
  3. Line 20: `[Hierarchy(... {{user}}=Omega/Protected Center)]`
- This hardcoding creates a prompt-level collision when a user plays an AnyPOV Alpha, Beta, or Delta persona card on JanitorAI.
- **Proposed Revision R3:** Recalibrate `Export/SvartulfrVerse_Urban_JanitorAI.md` to cleanly generalize `{{user}}`'s rank and nest/suite descriptions (`{{user}}=Youngest Sibling/Protected Center`, `{{user}} Private Suite/Solarium`, `{{user}} is the runaway youngest sibling`), ensuring complete separation between AnyPOV Generic User prompt logic in JanitorAI and Canonical Alyssa in SillyTavern.

## Candidate future concerns (separate revisions — not this one)
- Audit SillyTavern `User.md` / `Card_User.md` to ensure `User.md` retains the identity floor for canonical Alyssa without instructing the model to play `{{user}}` (the human plays `{{user}}`).

## Out of scope (flagged)
- None. (This is a clean prompt alignment within surgical revision scope).

## Set aside
- Forcing a single fixed mode for both SillyTavern and JanitorAI — the split architecture is intentional (ST supports full canonical persona lorebooks, while JanitorAI AnyPOV supports open player personas).
