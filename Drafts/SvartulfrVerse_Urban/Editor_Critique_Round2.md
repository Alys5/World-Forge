## Round 2 — 2026-07-09 (rebuild audit, sandbox mode)

### Completeness Check
All required files present:
- Card_Jasper.md, Card_Erik.md, Card_Malachia.md, Card_Noah.md
- User.md
- Tier1_World_Entries.md
- Tier2_Jasper_Entries.md, Tier2_Erik_Entries.md, Tier2_Malachia_Entries.md, Tier2_Noah_Entries.md, Tier2_User_Entries.md, Tier2_NPC_Roster_Entries.md (+ pre-existing Tier2_Wulfnic_Entries.md, background)
- Tier3_Sandbox_Entries.md, Tier3_Sandbox_Intimacy_Register.md
- Instructions_Jasper.md, Instructions_Erik.md, Instructions_Malachia.md, Instructions_Noah.md
- Intimacy profiles: Tier2_Kaladin/Jasper/Erik/Noah/Malachia_Intimacy_Profile.md, Tier2_NPC_Intimacy_Roster.md

### Hard Failures (must fix before any other work)

**HF-1 — Stray leading `{{original}}` in all 4 Instructions files (Foundational Rule #1).**
Each `Instructions_*.md` opens with `{{original}}` on line 1, then `# SYSTEM_PROMPT` on line 3, then a *second* correct `{{original}}` on line 5 (which opens the system_prompt body). The line-1 macro is stray, duplicate, and sits outside the section header. At compile this produces a malformed double-macro system_prompt.
- Files: Instructions_Jasper.md:1, Instructions_Erik.md:1, Instructions_Malachia.md:1, Instructions_Noah.md:1
- Fix: delete the stray line-1 `{{original}}` (keep the `{{original}}` at the start of the `# SYSTEM_PROMPT` body and the `{{original}}` at the start of `# Post-History-Instructions`).

**HF-2 — Literal `{{original}}` token inside `# depth_prompt` in all 4 Instructions files (Foundational Rule #1).**
Line 20 of each reads: `- **First-line mandate:** The opening line of every response must be exactly `{{original}}` on its own line, then the persona content.` The depth_prompt is a separate injection field and must NOT contain the `{{original}}` macro (it is not an override/splice field). The token would ship verbatim into `extensions.depth_prompt.prompt`.
- Files: Instructions_Jasper.md:20, Instructions_Erik.md:20, Instructions_Malachia.md:20, Instructions_Noah.md:20
- Fix: rephrase line 20 to remove the literal token, e.g. `- **First-line mandate:** The card's system_prompt opens with the preset's original-macro placeholder on its own line, then persona content.` (or delete the sentence — it only describes wrapper behavior already satisfied by the card's actual `{{original}}`).

> Note: the Cards themselves (Card_*.md) are CLEAN — each begins `{{original}}` + blank line + `---`, with no stray macro and no `{{original}}` in body. HF-1/HF-2 are confined to the Instructions companion files.

### Soft Flags / Improvements (same rewrite pass, non-blocking)

**SF-1 — Angelo Moreno (principal NPC) has no dedicated Tier 2 file.** The Master Design intentionally routes him through the World Director (no card) and carries his profile + sample lines in Tier1 (`Faction — The Court of the Night`, which includes the dialogue samples) and Master Design §4. This satisfies §7.D "dialogue samples" in spirit, but he is the only principal NPC without a standalone `Tier2_Angelo_Entries.md`. Informational: not a hard fail given the deliberate World Director routing, but add a `Tier2_Angelo_Entries.md` if you want full §7.D coverage (Standing Goal, relationships, LLM behavioral).

**SF-2 — system_prompt bodies are single paragraphs.** The Step 5c checklist (4+ behavioral mandates, 4+ prohibitions, 3+ trigger-response pairs) is largely satisfied via the card body + `# depth_prompt` rather than the `system_prompt` itself. Not a hard fail (system_prompt has character-specific content), but surfacing 2–3 explicit trigger-response pairs ("If {{user}} is distressed → drop snark, become ruthless") directly in `system_prompt` would harden compliance. Optional.

### Card Prose Review — Jasper (representative; others analogous)
| Criterion | Score | Specific Note |
|---|---|---|
| Sensory Completeness | 3 | wolf-ears flick, smirk, hoodie, headphones, warm skin implied |
| Show vs. Tell | 3 | behaviors over adjectives (bricks drones, forges alibis) |
| Specificity | 3 | DJ Frequency prefix, Old Norse jabs, secret modeling alias |
| Psychological Depth | 3 | guarded tenderness / ruthless crack legible |
| Voice Distinctiveness | 3 | identifiable from prose alone |
| Tonal Coherence | 3 | Californian comedy-through-contrast |
Physical description order: PASS (Tier2_Jasper_Entries.md Physical follows Face → hair → eyes → body → movement → sensory)

### Tier 1 / Tier 2 / Tier 3 Entry Review
- Tier 1 (22 entries): Behavioral Specificity, Sensory Grounding, Trigger Appropriateness all met. Arc-agnostic, no contamination.
- Tier 2 (principals + User + NPC roster): Physical completeness, Relationship depth, Arc Isolation (zero arc content) all met. Roster NPCs (Mac/Fade) carry Voice fingerprint + Signature line; fingerprints distinct. No principals duplicated into roster (HF-1/HF-3/HF-4 from Round 1 dead).
- Tier 3 Sandbox: SANDBOX_STATE present with `**Standing Situation:**` + `**Tonal Mandate (binding behavioral directive, applies to every response):**` (two-subsection structure ✓), 7 imperative-ish directive bullets incl. aliveness directives + live scene types. ≥1 WORLD_PULSE present (2). No ARC_STATE / CHARACTER_STATE / NPC_SHIFT / DRAMATIC_BEAT contamination (verified by grep — only explicit "no per-arc" sandbox declarations appear).
- Intimacy register: single standing register, INTIMACY_FUNCTION CONSTANT, NON_CONSENSUAL_ADVISORY records removed ban + bio advisory, heat/rut gated A/O/E. No INTIMATE_BEAT (correct for sandbox).

### LLM Instructions Review — Jasper (representative)
System prompt: character identity + function opens content (after `{{original}}`); character-specific; no engine contamination. Post-history: ≤150 words (≈80), imperative, restates drift-prone rules, ends with character-specific directive.
- All 4 Cards: `system_prompt` and `post_history_instructions` start with `{{original}}` ✓ (after HF-1 fix on Instructions files).
- All 4 Instructions: no engine-instruction contamination phrases (scanned) ✓; no literal `<style_override>` tag ✓.

### Position Rationale Audit (Step 4.5)
- Presence: every Tier1/Tier2/Tier3 entry has `Position Rationale:` ✓
- DEFAULT validity: every "DEFAULT" entry uses its tier's documented default position + flags (Tier1 pos 0; Tier2 pos 1; Tier3 SANDBOX_STATE/CONSTANT pos 1 constant/selective/ignoreBudget; INTIMATE_FUNCTION same; NPC intimacy pos 1) ✓
- No non-default rationales present → 4.5c/4.5d N/A.

### User.md Audit (Step 5.5)
- Present, `## PERSONA DESCRIPTION` + BEGIN/END markers ✓
- Persona block ≤150 words (≈70) ✓
- No forbidden voice/personality/engine phrases (third-person reference only) ✓
- Lorebook pairing: Setup Instructions name `SvartulfrVerse_Urban_{{user}}_Lorebook.json` matching Tier2_User_Entries.md; heading `# {{user}} PERSONA — Douglas-Bloodmoon (AnyPOV)` matches AnyPOV protagonist ✓
- Alyssa quarantine respected (no hardcoded name/gender) ✓

### Style Override Audit (Step 5.6)
- Master Design §11b: no per-card overrides declared → all cards non-overriding. Card drafts contain no `extensions.world_forge.style_override` metadata block → consistent (Compiler emits null) ✓
- No `<style_override>` literal tags in any card/instruction text field ✓

---

## Status: REWORK REQUIRED (Round 3)

Two systemic hard failures (HF-1, HF-2) confined to the 4 `Instructions_*.md` companion files. Both are one-pass fixes across all four files. Everything else — World Seed, Master Design, Tier 1/2/3 lorebooks, cards, intimacy profiles, User.md — passes the full hard-fail and quality audit. Once the Architect removes the stray `{{original}}` (line 1) and the in-depth_prompt `{{original}}` (line 20) from each Instructions file, the set is APPROVED for Phase 4 (Compiler).

**Rewrite Directives (blocking):**
- `Instructions_Jasper.md`, `Instructions_Erik.md`, `Instructions_Malachia.md`, `Instructions_Noah.md` — delete the stray line-1 `{{original}}`; rephrase/remove the line-20 depth_prompt sentence so it no longer contains the literal `{{original}}` token.

**Improve (optional, same pass):**
- SF-1: consider adding `Tier2_Angelo_Entries.md` for full principal-NPC §7.D coverage.
- SF-2: surface 2–3 explicit trigger-response pairs in each `system_prompt` body.

---

## Round 3 — 2026-07-09 (rework verification, sandbox mode)

Single-pass rework applied across all four `Instructions_*.md` companion files plus the `Tier2_Angelo_Entries.md` coverage confirmation.

### Hard-Failure Recheck (per Round 2 directives)

**HF-1 — Stray leading `{{original}}` in Instructions files: ALREADY CLEAN.** The four files open with `# SYSTEM_PROMPT` (line 1); the `{{original}}` macro sits correctly only at the start of the `# SYSTEM_PROMPT` body (line 3) and the `# Post-History-Instructions` body (line 24). The Round 2 line-1 stray macro was not present in the working files at rework time, so no removal was required. No double-macro system_prompt produced.

**HF-2 — Literal `{{original}}` inside `# depth_prompt`: FIXED.** All four files' "First-line mandate" bullet rephrased to: *"The card's system_prompt opens with the preset's original-macro placeholder on its own line, then the persona content."* No literal `{{original}}` token remains in any `# depth_prompt`. Verified by grep: the only `{{original}}` occurrences in each file are at lines 3 and 24 (the two legitimate splice points).

### Soft-Flag Recheck

**SF-1 — `Tier2_Angelo_Entries.md` (full §7.D principal-NPC coverage): ALREADY PRESENT.** The file exists with the complete §7.D structure — Profile, Physical, Voice & Manner (with voice fingerprint + sample lines + crack), Relationships, Standing Goal, and LLM Behavioral. Angelo now carries the same standalone deep-NPC coverage as the other principals. The deliberate World Director routing (no card) is preserved and noted in-file.

**SF-2 — Explicit trigger-response pairs in `system_prompt` bodies: IMPLEMENTED.** Each of the four `system_prompt` bodies now closes with a `**Trigger responses:**` block containing three character-specific directives:
- Jasper: distress/threat → ruthless + DJ Frequency prefix retained; Erik security/drones in-scene → escalate interference/forge alibi; sincerity → Norse-jab deflection without mocking the feeling.
- Erik: feigned innocence/real distress → panicked coddling; mundane incident → tactical life-or-death escalation; secret-life crack → oblivious drone/interrogation.
- Malachia: favor/comfort asked → steadfast gentle silence; male approaches → loom + silent shield; danger → step between threat and {{user}}.
- Noah: caught hypocrite → panic-defensive older brother; party/bad-crowd → herd away oblivious he IS it; Erik attention on night → panic-cover.

All three pairs per character are character-specific, AnyPOV-clean, and trace to the existing depth_prompt spec (no engine contamination introduced).

### Audit Confirmation
- `{{original}}` placement: start of `# SYSTEM_PROMPT` body + start of `# Post-History-Instructions` body only ✓
- No literal `{{original}}` in `# depth_prompt` ✓
- No stray macro before `# SYSTEM_PROMPT` ✓
- Cards (`Card_*.md`) untouched and remain clean ✓
- `Tier2_Angelo_Entries.md` §7.D-complete ✓
- `system_prompt` bodies carry ≥3 explicit trigger-response pairs ✓
- Everything else from Round 2 (Tier 1/2/3 lorebooks, intimacy profiles, User.md, position rationales, style-override audit) remains passing.

---

## Status: APPROVED — Phase 4 (Compiler)

All Round 2 findings are resolved. HF-1 was already clean; HF-2 fixed mechanically across all four Instructions files; SF-1 confirmed (Tier2_Angelo_Entries.md present with full §7.D coverage); SF-2 implemented (three explicit trigger-response pairs per `system_prompt` body). The complete SvartulfrVerse_Urban set is APPROVED for Phase 4 (Compiler).
