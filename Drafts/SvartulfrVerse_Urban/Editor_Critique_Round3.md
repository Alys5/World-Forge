## Round 3 — 2026-07-09 (post-rebuild audit, sandbox mode)

### Completeness Check
All required files present:
- Card_Jasper.md, Card_Erik.md, Card_Malachia.md, Card_Noah.md
- User.md
- Tier1_World_Entries.md
- Tier2_Jasper_Entries.md, Tier2_Erik_Entries.md, Tier2_Malachia_Entries.md, Tier2_Noah_Entries.md, Tier2_User_Entries.md, Tier2_NPC_Roster_Entries.md, Tier2_Wulfnic_Entries.md, Tier2_Angelo_Entries.md
- Tier3_Sandbox_Entries.md, Tier3_Sandbox_Intimacy_Register.md
- Instructions_Jasper.md, Instructions_Erik.md, Instructions_Malachia.md, Instructions_Noah.md
- Intimacy profiles: Tier2_Kaladin/Jasper/Erik/Noah/Malachia_Intimacy_Profile.md, Tier2_NPC_Intimacy_Roster.md

### Hard Failures (must fix before any other work)

**None.** All Foundational Hard-Fail Rules pass.

- **Rule 1 (`{{original}}`):** All four Cards begin with `{{original}}` on line 1, followed by blank line, then `---` and character-specific content. All four Instructions files have `{{original}}` at the start of the `# SYSTEM_PROMPT` body (line 3) and at the start of `# Post-History-Instructions` body (line 24). No stray leading macro. No `{{original}}` inside `# depth_prompt`.
- **Rule 2 (Engine contamination):** No diagnostic phrases from Step 5b found in any card or instruction text field. No narration/formatting/perspective engine language in character-specific content.
- **Rule 3 (`<style_override>` tag):** No literal `<style_override>` or `</style_override>` tags in any card or instruction text field.
- **Rule 4 (Position Rationale):** Every entry across all tiers has `Position Rationale:` field. All are marked `DEFAULT` and all use documented default positions/flags for their tier and entry type.
- **Rule 5 (SANDBOX_STATE structure):** `Tier3_Sandbox_Entries.md` contains exactly one `SANDBOX_STATE` entry with `**Standing Situation:**` followed by `**Tonal Mandate (binding behavioral directive, applies to every response):**`. Seven imperative directive bullets covering register, dwells/elides, live scene types, power-fantasy contract, aliveness directives, and hard prohibitions. Two `WORLD_PULSE` entries at position 4. No ARC_STATE / CHARACTER_STATE / NPC_SHIFT / DRAMATIC_BEAT / arc-trigger contamination.
- **Rule 6 (Tier contamination):** No arc-specific content in Tier 1 or Tier 2. No baseline restatement in Tier 3.
- **Rule 7 (Required files):** All present, including `User.md`.
- **Rule 8 (Override metadata):** No card declares `extensions.world_forge.style_override`; all are non-overriding per Master Design §11b. Consistent.
- **Rule 9 (`override_rationale`):** N/A — no overrides.
- **Rule 10 (Cross-arc inconsistency):** N/A — sandbox mode has no arcs.

### Soft Flags / Improvements (non-blocking)

**SF-1 — Orientation integration in character cards.** The user's orientation directive has been integrated into Master Design §7/§8, the intimacy profiles, and the Tier 2 entry files. However, the four `Card_*.md` character cards do not yet carry an explicit orientation note in their `description` or `personality` fields. The cards themselves remain valid (they describe behavior, not orientation), but if the Compiler or Prompt Engineer needs to surface orientation constraints at runtime, the card-level substrate is the most reliable injection point. Optional improvement: add a single orientation sentence to each card's `description` field (e.g., "Strictly heterosexual; any advance from {{user}} outside his orientation is rejected categorically.").

**SF-2 — Anti-flattening rule in Instructions files.** The Master Design §7 now carries the `Anti-Flattening & Boundaries Rule (AnyPOV)` block, but the four `Instructions_*.md` files do not yet replicate this rule in their `system_prompt` or `post_history_instructions` bodies. The rule is therefore present in the source of truth but not wired into the runtime instruction set. Optional improvement: append a short boundary sentence to each card's `post_history_instructions` reinforcing that orientation is intrinsic and non-negotiable.

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

Analogs:
- Erik: PASS across all six criteria; Alpha scent dominance + command voice distinctive.
- Malachia: PASS; near-silent presence + cage-fighter physicality distinctive.
- Noah: PASS; legalese-to-panic voice shift distinctive.

### Tier 1 Entry Review
- 22 entries total: Laws (6), Factions (3), Locations (8), Species (3), Concepts (2).
- Behavioral Specificity: All entries describe how the LLM should behave, not just what is true. ✓
- Sensory Grounding: Key locations carry sensory detail (smells of motor oil, cheap beer, clove smoke, welding). ✓
- Trigger Appropriateness: Trigger keys match in-chat usage patterns. ✓
- Arc-agnostic: Zero arc-specific content. ✓

### Tier 2 Entry Review — Jasper (representative)

| Entry | Criterion | Result |
|---|---|---|
| Physical | Completeness / anatomical order | PASS — Face → hair → eyes → body → movement → sensory |
| Relationships | Depth / behavioral manifestations | PASS — specific behaviors (Old Norse jabs, alibi forging) |
| Psychological | Want/fear/contradiction present | PASS — Surface/Deep Want, Fear, Contradiction all stated |
| Voice | Distinctiveness | PASS — DJ Frequency prefix, sarcasm, tech jargon |
| Standing Goal | Active + specific | PASS — hack DCC feeds, disable drones, forge alibis |
| Arc Isolation | Zero arc content | PASS — sandbox standing only, no arc deltas |

Analogs: Erik, Malachia, Noah, Angelo, Wulfnic, Kaladin, User, NPC Roster — all pass.

### Tier 3 Entry Review — Sandbox

**SANDBOX_STATE: PASS**
- Two-subsection structure: `**Standing Situation:**` + `**Tonal Mandate (binding behavioral directive, applies to every response):**` ✓
- Standing Situation: persistent premise + genre tag + {{user}} standing/power + power-fantasy contract ✓
- Tonal Mandate: 7 directive bullets in imperative language ✓
  - Active register (bright, warm, sitcom-flavored)
  - Prose dwells on (Golden Hour texture, comedic gap)
  - Prose elides (graphic violence, genuine peril, family-as-love violation)
  - Live scene types (9 canonical entry points)
  - Power-fantasy contract (agency, no stripping without cause)
  - Aliveness directives (NPCs pursue Standing Goals, initiate, carry off-screen continuity, world reacts/remembers, never freeze, rotate cast)
  - Hard prohibitions (no lethal threats, family-as-love, no attitude reset, no agency strip, no voice flattening)
- Every principal NPC has a §7.D Standing Goal for the aliveness/cadence directive to act on ✓

**WORLD_PULSE (2 entries): PASS**
- Position 4, depth 2–4, system role ✓
- Standing pressure sustained, not a countdown ✓

**No mode contamination:** Zero ARC_STATE / CHARACTER_STATE / NPC_SHIFT / DRAMATIC_BEAT / arc-trigger content ✓

### Tier 2 Intimacy Profile Review

| Profile | Orientation Updated | Distinctiveness Gate | Status |
|---|---|---|---|
| Kaladin | Heterosexual | Anxious/protocol-bound; distinct from Erik (controlling), Jasper (playful), Malachia (silent), Noah (hypocritical) | PASS |
| Erik | Heterosexual + hard boundary | Controlling/grief-anchored; distinct | PASS |
| Malachia | Heterosexual | Near-silent/gentle-only; distinct | PASS |
| Noah | Allosexual + aromantic | Hypocritical/panicked; distinct | PASS |
| Jasper | Pansexual | Playful-guarded/DJ-soft; distinct | PASS |
| NPC Roster (Wulfnic, Logan, Marcus, Mac, Fade) | All assigned | All five fingerprints diverge completely; no interchangeability | PASS |

### Tier 3 Intimacy Register Review

- Single standing register for sandbox mode ✓
- INTIMACY_FUNCTION: CONSTANT, position 1, ignoreBudget YES, selective YES ✓
- NON_CONSENSUAL_ADVISORY: removed global ban recorded; bio advisory noted; sandbox never forces ✓
- Heat/rut gated to Alpha/Omega/Enigma; Betas excluded ✓
- No per-arc triggers, no CHARACTER_STATE ✓
- All entries have Position Rationale: DEFAULT ✓

### LLM Instructions Review — Jasper (representative)

**System prompt:**
- Opens with `{{original}}` on its own line, blank line, then character-specific content ✓
- Character identity and function open the content ✓
- 3 explicit trigger-response pairs in `**Trigger responses:**` block ✓
- No engine-instruction contamination ✓
- No `<style_override>` tags ✓

**Post-history instructions:**
- Opens with `{{original}}` on its own line, blank line, then content ✓
- Word count: ≈80 words (≤150 cap) ✓
- Imperative tone throughout ✓
- Restates drift-prone rules (sarcasm/protectiveness split, DJ Frequency prefix, AnyPOV macros) ✓
- Ends with character-specific directive ✓

**Depth prompt:**
- No `{{original}}` token present ✓
- Character-specific behavioral spec only ✓

Analogs: Erik, Malachia, Noah — all pass identical checks.

### User.md Audit (Step 5.5)

- Present with `## PERSONA DESCRIPTION` + `--- BEGIN PERSONA DESCRIPTION ---` / `--- END PERSONA DESCRIPTION ---` markers ✓
- Word count: ≈70 words (≤150 cap) ✓
- Third-person reference only; no voice/personality/mannerism directives ✓
- No forbidden phrases (no "you are", "you must", "speaks with", "voice", "dialogue", etc.) ✓
- Setup Instructions name `SvartulfrVerse_Urban_{{user}}_Lorebook.json` matching Tier2_User_Entries.md ✓
- Heading `# {{user}} PERSONA — Douglas-Bloodmoon (AnyPOV)` matches protagonist name in Tier 2 lorebook ✓
- Alyssa quarantine respected (no hardcoded name/gender; clean Tabula Rasa) ✓

### Style Override Audit (Step 5.6)

- Master Design §11b: no per-card overrides declared → all cards non-overriding ✓
- No card declares `extensions.world_forge.style_override` metadata → consistent with Master Design ✓
- No literal `<style_override>` or `</style_override>` tags in any card or instruction text field ✓
- Pass 1–5 all pass trivially (no overrides to validate beyond absence) ✓

### Position Rationale Audit (Step 4.5)

- **Presence:** Every entry across all draft files carries `Position Rationale:` ✓
- **DEFAULT validity:** All "DEFAULT" entries use documented default positions/flags:
  - Tier 1: position 0, constant false ✓
  - Tier 2 standard: position 1, constant false ✓
  - Tier 2 Intimacy: position 1, constant false ✓
  - Tier 3 SANDBOX_STATE: position 1, constant true, selective true, ignoreBudget true ✓
  - Tier 3 WORLD_PULSE: position 4, depth 2–4, system role ✓
  - Tier 3 INTIMACY_FUNCTION: position 1, constant true, selective true, ignoreBudget true ✓
  - Tier 2 NPC roster intimacy: position 1, constant false ✓
- **Non-default rationales:** None present → 4.5c/4.5d N/A

### NPC / Character Identity Integrity (Step 4.6)

- **Comment form:** No NPC/character entries use comment-style headers in the draft files reviewed; entries use `### ENTRY:` markdown headers. No comment-form violations.
- **Name consistency:** All canonical names used verbatim across entries (Jasper Douglas-Bloodmoon, Erik Douglas, Malachia Douglas-Bloodmoon, Noah Douglas-Bloodmoon, Kaladin Nargathon, Angelo Moreno, Logan Douglas, Wulfnic Bloodmoon, Marcus Thornfield). ✓
- **Slug collision:** No collisions detected. ✓
- **Unmarked multi-person entry:** None. ✓
- **Mislabeled shared entry:** None. ✓
- **Protagonist as NPC:** `{{user}}` never authored as an NPC. ✓

### World Calendar Carrier Validation (Step 4.7)
- No `### CARRIER: [[WORLD_CALENDAR]]` block present in Tier1_World_Entries.md. Absence is not a gap. N/A.

### Dice Oracle Carrier Validation (Step 4.8)
- No `### CARRIER: [[DICE_TABLES]]` block present in Tier1_World_Entries.md. Absence is not a gap. N/A.

---

## ✅ EDITOR SIGN-OFF — Round 3

### Approved Files
- [x] Card_Jasper.md
- [x] Card_Erik.md
- [x] Card_Malachia.md
- [x] Card_Noah.md
- [x] User.md
- [x] Tier1_World_Entries.md
- [x] Tier2_Jasper_Entries.md
- [x] Tier2_Erik_Entries.md
- [x] Tier2_Malachia_Entries.md
- [x] Tier2_Noah_Entries.md
- [x] Tier2_User_Entries.md
- [x] Tier2_NPC_Roster_Entries.md
- [x] Tier2_Wulfnic_Entries.md
- [x] Tier2_Angelo_Entries.md
- [x] Tier2_Kaladin_Intimacy_Profile.md
- [x] Tier2_Jasper_Intimacy_Profile.md
- [x] Tier2_Erik_Intimacy_Profile.md
- [x] Tier2_Noah_Intimacy_Profile.md
- [x] Tier2_Malachia_Intimacy_Profile.md
- [x] Tier2_NPC_Intimacy_Roster.md
- [x] Tier3_Sandbox_Entries.md
- [x] Tier3_Sandbox_Intimacy_Register.md
- [x] Instructions_Jasper.md
- [x] Instructions_Erik.md
- [x] Instructions_Malachia.md
- [x] Instructions_Noah.md

### Quality Certification
- All prose: criteria ≥2, at least three = 3 ✓
- All Tier 1 entries: quality criteria met ✓
- All Tier 2 entries: quality criteria met, arc isolation verified ✓
- **Sandbox mode: SANDBOX_STATE has Standing Situation + Tonal Mandate (7 imperative bullets incl. aliveness directives + live scene types); ≥1 WORLD_PULSE; no arc/CHARACTER_STATE/NPC_SHIFT/DRAMATIC_BEAT contamination (Step 4a-S) ✓**
- **Roster NPCs (§7.E): each has Voice fingerprint + Signature line; fingerprints distinct across the roster ✓**
- **NPC/Character Identity Integrity (Step 4.6): comment form + em-dash valid; one canonical name per character used verbatim; no slug collisions; `{{user}}` not authored as an NPC ✓**
- **All entries: Position Rationale present (DEFAULT or justified) ✓**
- **All "DEFAULT" rationales: position + flags match documented default for tier and entry type ✓**
- **`User.md` present, structurally valid, ≤150 words, no voice/personality/engine content, lorebook filename matches Tier 2 Protagonist draft ✓**
- **All LLM instructions: checklists passed ✓**
- **All cards: `system_prompt` and `post_history_instructions` start with `{{original}}` ✓**
- **All cards: no engine-instruction contamination (hard-fail phrase scan passed) ✓**
- **All cards: no literal `<style_override>` tag block in any card text field ✓**
- **All overriding cards: none declared; consistent with Master Design §11b ✓**
- **Orientation rules integrated into Master Design §7/§8, intimacy profiles, and Tier 2 entry files ✓**
- **Anti-flattening/boundaries AnyPOV rule documented in Master Design §7 ✓**
- No structural failures ✓
- **Sandbox mode: Sandbox Lorebook has SANDBOX_STATE + ≥1 WORLD_PULSE ✓**

**Status: APPROVED — Proceed to Phase 4 (The Compiler)**
