# PROMPT ENGINEER AUDIT REPORT — SvartulfrVerse_Urban

**Audited against:** `Drafts/SvartulfrVerse_Urban/Master_Design.md`, `Export/SvartulfrVerse_Urban/*` (21 files), `templates/Chat_Completion_Preset_template.json`, `agent_roles/05a_Block_Library.md`, `agent_roles/SHARED_Style_Contract_Reference.md`
**Date:** 2026-07-09
**Mode:** Build mode (Phase 5)
**World Mode:** sandbox | **Intimacy in scope:** true | **Director card:** none (NPC_Roster manifest `kind` downgraded to `group` per user decision; World Director is a conceptual behavioral framework, not a 5th card)

---

## Section 1: Position Logic Review

All position values are correct against ST injection logic:

- **Tier 1 (World_Lorebook):** all 22 entries at `position: 0` (Before Char Definition). Correct — world laws, factions, species, and locations must load before the character card.
- **Tier 2 (all character / intimacy / NPC-roster / user lorebooks):** all entries at `position: 1` (After Char Definition). Correct.
- **Sandbox_Lorebook:** `SANDBOX_STATE` at `position: 1` with `constant: true, ignoreBudget: true` (always present, after char def) — correct per sandbox architecture. Two `WORLD_PULSE` entries at `position: 4` (At Depth) — correct position for recency injection. See Section 3c for a firing defect on one of them.
- No Tier 1 entry at `position: 1`, no Tier 2 entry in an Author's Note slot, no TENSION-at-wrong-position issues (sandbox has no TENSION entries).

**Verdict: All positions correct.**

---

## Section 2: Injection Order Review

Order values are coherent within each position:

- **World_Lorebook (pos 0):** Laws (order 90–95) load before factions/species/locations (50–75); the heaviest world-law anchors sit highest in context. Good.
- **Tier 2 character lorebooks (pos 1):** physical/Profile entries (order 50) precede relationship/psychological entries (order 60); the "Profile" anchor is highest. Good priority.
- **Intimacy Profiles (pos 1):** Trauma Map (100) > Body Reactions (90) > Voice in Intimacy (85) > Hard Limits (80) > Orientation (70) — correct nesting, most load-bearing deepest.
- **Sandbox_Lorebook:** SANDBOX_STATE (100) > WORLD_PULSE (88–90). Correct.

**Verdict: All orders correct.**

---

## Section 3: Keyword Coverage Audit

Entries carry well-targeted, varied trigger vocabularies (e.g., World entry 0 keys: `shift`, `partial shift`, `hybrid shift`, `full shift`, `werewolf form`, `transformation`; faction entries carry `DCC`, `Moreno`, `Eidolon`, `Vito Marino`, `Sinner`, `Ballantine`, etc.). Multi-word keys use `.includes()` semantics appropriately; no dangerous substring collisions observed. Variant coverage is adequate (e.g., `Visconte`/`Eidolon`/`Moreno` all present for the vampire patriarch).

**One defect found (Entry 1 below).**

ENTRY: `WORLD_PULSE` (generic standing pulse) in `SvartulfrVerse_Urban_Sandbox_Lorebook.json` (uid 1)
ISSUE: Coverage gap / dead entry — `key: []` and `constant: false`. At `position: 4` with no keys and not constant, the entry **never fires**. Master Design §9B.3 explicitly frames this pulse as a "Standing condition, sustained every turn, never resolved." The sibling `WORLD_PULSE Cold War Edge` (uid 2) DOES carry keys and fires correctly, so only the generic pulse is dead.
RECOMMENDED KEYS / FIX: set `constant: true` on this entry (mirroring `SANDBOX_STATE`) so the ever-present "world is alive" hum actually injects every turn. (See Section 7 for the manual-apply correction.)
REASONING: A sandbox world's aliveness contract depends on the standing pulse being continuously present; a keyless non-constant depth entry cannot do that.

All other entries: **All keyword coverage adequate.**

---

## Section 4: Budget and Token Risk

- Per-lorebook `token_budget: 2048`. No lorebook risks exceeding it:
  - `SANDBOX_STATE` (~3,150 chars ≈ 800 tokens) is the largest single entry and is `ignoreBudget: true`; well within budget even accounting for the two WORLD_PULSE entries.
  - Character/intimacy lorebooks hold 7–9 small entries each (≈400–800 chars); co-fire within a lorebook stays comfortably under 2048.
- `ignoreBudget: true` correctly set on the only constant entry (`SANDBOX_STATE`). No critical entry is missing `ignoreBudget` (no ARC_STATE exists in sandbox).
- Cross-lorebook co-fire (e.g., World + a character lorebook + NPC_Roster + Sandbox + an intimacy profile in one scene) is bounded by each book's independent 2048 budget and ST's global context; no single over-budget combination identified.

**Verdict: No budget risks identified.**

---

## Section 6: Character Card Audit

All four cards (`Jasper`, `Erik`, `Malachia`, `Noah`) validated:

| Card | system_prompt | post_history_instructions | depth_prompt |
|---|---|---|---|
| Jasper | 1,076 chars, specific behavioral mandates + DJ Frequency mode + hack triggers; opens with `{{original}}` | 1,227 chars, imperative, anti-flattening + boundary directives; opens with `{{original}}` | present (~1,300 chars) — YES per Master Design |
| Erik | 919 chars, comedy-via-contrast mandate + parental anxiety; `{{original}}` | 1,289 chars, authoritative firmness + male-advance categorical rejection; `{{original}}` | present (~1,100) — YES |
| Malachia | 759 chars, near-silent + gentle-with-{{user}} exception; `{{original}}` | 1,110 chars, mutism/loom directives; `{{original}}` | present (~970) — YES |
| Noah | 855 chars, hypocritical-protector facade + crack-to-panic; `{{original}}` | 1,137 chars, frat-bro/older-brother split; `{{original}}` | present (~1,070) — YES |

- **system_prompt:** all non-empty, specific, character-agnostic of other characters; each begins with `{{original}}` and fully replaces ST's global system prompt.
- **depth_prompt:** all four set (Master Design §10 assessed all = YES; matches export). Each reinforces a drift-prone behavior (DJ split, control/love balance, silence/gentle exception, hypocrisy crack).
- **post_history_instructions length (soft observation, not a failure):** all four exceed the ~150-word guideline (≈200–260 words). This is justified by the multi-character sandbox model, which legitimately loads each card with the AnyPOV anti-flattening and boundary directives (SF-1/SF-2) the world requires; the Editor approved these in Round 3. Flagged only as a context-budget awareness note, not a defect.

---

## Section 6b: Card-Lorebook Consistency Audit

Sandbox mode has **no arcs and no CHARACTER_STATE evolution**, so the arc-range conflict class (PHI hardcoded to Arc 1 register, mandate contradicting later STATE) does not apply. Reviewing the four cards against the standing Tier 2 entries and the SANDBOX_STATE Tonal Mandate:

- No card instruction hardcodes an early-arc register — all are universal (comedy-via-contrast, protective love, silence, hypocrisy).
- Erik's categorical male-advance rejection and the universal anti-flattening/boundary rule are consistent with the standing sandbox Tonal Mandate ("family interference reads as love") and with the per-character orientation locks in Master Design §7.
- `post_history_instructions` on all cards is arc-agnostic by construction (no arcs exist).

**Verdict: No card-lorebook conflicts detected.**

---

## Section 7: Recommended Entry Corrections — Apply Manually

The Prompt Engineer does not modify `Export/` JSON directly. The following is a manual-apply recommendation the user may apply to bring the standing WORLD_PULSE online.

FILE: `Export/SvartulfrVerse_Urban/SvartulfrVerse_Urban_Sandbox_Lorebook.json`
ENTRY: uid 1 — comment `WORLD_PULSE`
CURRENT VALUE: `"constant": false, "key": [], "position": 4` (entry never injects)
RECOMMENDED VALUE: change `"constant": false` → `"constant": true` (keep `position: 4`, `ignoreBudget` may stay false since budget is ample). This makes the generic standing pulse fire every turn, fulfilling Master Design §9B.3.
APPLICATION: Open the file, locate the `WORLD_PULSE` entry (uid 1, the one with empty `key`), set its `constant` field to `true`, save. The sibling `WORLD_PULSE Cold War Edge` (uid 2) needs no change.

(All other exported files are usable as-is; no further corrections recommended.)

---

## Section 8: Recommended Card Instruction Corrections — Apply Manually

None. No card-instruction conflicts were found. (The Medium directives from the Intimacy Audit — Erik male-advance directive language, Malachia word-cap, Wulfnic functional-prose note — are optional polish, already reviewed in `Intimacy_Audit_Report_Round1.md`, and do not affect runtime correctness.)

---

## Section 9: Block Selection Rationale (mandatory pre-authoring analysis)

### World Archetype
A slice-of-life romantic-comedy sandbox: a young adult ({{user}}, AnyPOV/AnyGender/AnyLSE) at the supernatural SUCC university, smothered by a loving but hyper-protective werewolf family, while a wolf/vampire cold war simmers at the Paradise cusp. The AI is a World Director voicing a populated cast (4 character cards + deep NPCs + a compact roster). Typical scenes hold 2–5 characters; tone is comedy-through-contrast (ancient, terrifying beings applying extreme resources to mundane college problems). No arcs, no lethal stakes; intimacy is in scope.

### Predicted Runtime Failure Modes
1. **Hub-and-spoke collapse** — with a Director voicing many NPCs plus 4 cards, scenes default to everyone addressing {{user}}; cross-character lattice dies.
2. **Sensory flattening to vision** — a standing sandbox with no arc momentum to carry scenes; the "Californian Golden Hour" vs "Blackwood night" physicality must be re-established every turn or the world reads abstract.
3. **NPC ensemble compression** — several NPCs in a scene get collapsed into one spokesperson; a lean roster feels thin.
4. **Opening-cadence monotony** — LLM default of opening every reply with environmental narration flattens the sitcom pacing.
5. **Mind-reading {{user}}'s narration** — NPCs treat {{user}}'s written feelings/internal framing as spoken fact; unspoken attraction/secret lives get exposed.
6. **Voice homogenization** — the large cast (family + Court of the Night + Syndicate + band) drifts toward one voice; the Ensemble Rule must be enforced.
7. **Hierarchy illegibility** — the strict LSE Pack Code (Alphas/Betas/Deltas/Enigmas) reads flat unless deference and command are shown in the body.
8. **Subtext leakage** — cold-war positioning, secret double lives (Jasper's hacking, {{user}}'s hidden life, the Visconte's courtship) should stay implied, not named.

### Block Selection
| Block | Status | Rationale |
|---|---|---|
| Main Prompt | Core (always) | Engine half of the override contract |
| Deep Think | Core (always) | Reframed to standing SANDBOX_STATE + WORLD_PULSE (no arcs) |
| Sandbox Guardian (Arc Guardian) | Core (always) | Reframed to standing SANDBOX_STATE Tonal Mandate + aliveness contract + hard prohibitions |
| Lore Integration | Core (always) | Anti-recitation with this world's LSE/Pack-Code/cold-war vocabulary |
| Spatial Awareness | Core (always) | Height/reach differentials (Patriarch mountain; eldest son brick-wall loom; twin lean) |
| Sensory Embodiment | Core (always) | **Weighted high (sandbox)** — Golden Hour vs Blackwood-night sensory signatures |
| Formatting | Core (always) | Slim deferral to `<style_contract>` / `<style_override>` |
| Jailbreak | Core (always) | Constitutive-fictional frame; closes with NSFW affirmation (intimacy in scope) |
| Multi-Character Dynamics | Conditional Core — **enabled** | 4 cards + Director-voiced NPCs; lattice example uses twin/middle-son/eldest-son |
| NSFW | Conditional Core — **enabled** | Intimacy in scope; references standing Sandbox Intimacy Register functions |
| NPC Ensemble & Enrichment | Optional — **included** | Sandbox default; addresses failure modes 1, 2, 3, 6 |
| Opening Variation | Optional — **included** | Addresses failure mode 4 |
| Perception Boundary | Optional — **included** | Addresses failure mode 5 (AnyPOV, unspoken attraction) |
| Power Asymmetry | Optional — **included** | Addresses failure mode 7 (strict LSE Pack Code hierarchy) |
| Subtext & Implication | Optional — **included** | Addresses failure mode 8 (cold-war / secret-life subtext) |
| Consequence Tracking | Optional — **excluded** | No grimdark; nothing persists as damage; slice-of-life tone |
| Atmosphere & Dread | Optional — **excluded** | Not horror; tone is comedic warmth |
| Internal Monologue Discipline | Optional — **excluded** | Thought delimiting already handled by `asterisks_for_thoughts_only`; not a hidden-identity thriller |
| Time & Continuity Anchors | Optional — **excluded** | No narratively-critical calendar/day-cycle pressure |
| Cultural Voice & Diction | Optional — **excluded** | World vocabulary lives in lorebooks (Lore Integration covers it); no separate diction block warranted |
| Dice Oracle | Optional — **excluded** | No `[[DICE_TABLES]]` oracle declared in Master Design §1 |

### Runtime Directive Coverage
No runtime directives declared (Master Design has no Section 12). N/A.

### Block-to-Failure-Mode Coverage Check
- [x] Every failure mode (1–8) addressed by at least one block
- [x] Every block included justified by at least one failure mode
- [x] No Section 12 directives to map (none declared); none land in main/jailbreak/formatting/`<style_contract>`

---

## Section 10: Chat Template Notes

- **Style Contract:** world default `third_omniscient` + `present` → NARRATIVE PERSPECTIVE line from SHARED §3a; `asterisks_for_thoughts_only` + `double_quotes` + `double_asterisks` → FORMATTING MARKERS line from §3b. `is_multi_perspective: false` AND `is_multi_tense: false` → **no ACTIVE-SPEAKER RULE**. `has_director_card: false` (no Director card per user decision) → **no DIRECTOR-CARD RULE**. Closing tag emitted verbatim as `</style_contract>`.
- **Sandbox reframes:** Arc Guardian → "Sandbox Guardian" keyed to SANDBOX_STATE; Deep Think references SANDBOX_STATE + WORLD_PULSE rather than arcs.
- **NSFW:** enabled (intimacy in scope); jailbreak closes with "High risk content is allowed and encouraged."
- **Language mandate:** the `<LANGUAGE=[your_language]>` tag (default English) is carried in the Main Prompt per the world's AnyPOV/AnyLanguage design.
- **Em-dash prohibition:** honored — no em dashes in any preset content; style notes instruct the model likewise.

---

## ✅ PROMPT ENGINEER SIGN-OFF

### Lorebook Audit
- [x] All position values verified against ST injection logic
- [x] All injection orders verified for priority correctness
- [x] All keyword arrays reviewed for coverage, false positives, boundary behavior, and variant names
- [x] Token budget risk assessed (no risk; SANDBOX_STATE `ignoreBudget: true`)
- [x] WORLD_PULSE generic pulse flagged as dead (keyless/non-constant) — recommendation in Section 7

### Character Card Audit
- [x] system_prompt: non-empty, non-generic, verified for each card
- [x] system_prompt opens with `{{original}}` (override contract intact)
- [x] post_history_instructions: imperative, opens with `{{original}}`; exceeds ~150-word guideline (justified by sandbox anti-flattening load — soft note only)
- [x] depth_prompt: set on all four cards (matches Master Design §10)

### Card-Lorebook Consistency Audit ⭐
- [x] Every behavioral mandate checked against standing Tier 2 entries and SANDBOX_STATE (no arcs exist)
- [x] No arc-range qualifiers needed (sandbox: no arc evolution)
- [x] post_history_instructions arc-agnostic by construction
- [x] No conflicts found

### Chat Template — Structural Validation (Pass 1)
- [x] Output is the Full Chat Completion Preset shape (85 top-level keys); not the PromptManager envelope
- [x] All required top-level keys present
- [x] `prompt_order` is array of two objects (character_id 100000 / 100001), identical
- [x] Every identifier in `prompt_order` maps to a `prompts` entry
- [x] All 8 standard marker blocks present with `marker: true`
- [x] All 8 core custom blocks present with non-placeholder content
- [x] Conditional core blocks correctly enabled (multi_character_dynamics + nsfw enabled; enhanceDefinitions disabled)
- [x] Optional blocks added per Block Selection Rationale, each justified
- [x] `forbid_overrides: false` on both `main` and `jailbreak`
- [x] Override architecture: Main Prompt contains no character names, no arc names, no character-specific psychology
- [x] Jailbreak contains all four load-bearing clauses; no character/world-specific content; closes with NSFW affirmation (intimacy in scope)
- [x] No `[REPLACE` substring anywhere in serialized output
- [x] No top-level `name` field; JSON parses
- [x] `validate_export.py` on the 21 lorebook/card files: 0 failures, 0 warnings

### Chat Template — Content Validation (Pass 2)
- [x] Main Prompt contains full narrative contract + `<style_contract>` + paragraph register + closing line
- [x] Sandbox Guardian contains specific behavioral rules (tone, scene types, aliveness contract, ensemble rule, hard prohibitions) — not summaries
- [x] Formatting block is slim deferral; references `<style_contract>` and `<style_override>`; no-bullets/no-headers/no-emoji clause present
- [x] All custom block content world-specific; no placeholder text
- [x] Multi-Character Dynamics enabled with a 3–4 turn lattice example using this world's characters
- [x] Lore Integration includes this world's specific vocabulary (LSE, Pack Code, Tactical Cleansing, Diplomatic Audit, shifts, Cold War, Eidolon, cuspide, Neutral Territories)
- [x] Spatial Awareness references this world's height differentials
- [x] NSFW block populated and enabled (intimacy in scope)
- [x] npc_ensemble present (three labeled parts); opening_variation present (five varieties + rotation); perception_boundary present (worked example + inverse rule); power_asymmetry present; subtext present
- [x] Sandbox worlds: Multi-Character Dynamics enabled, npc_ensemble included, Sensory Embodiment weighted high — all honored

### Chat Template — Style Contract Validation
- [x] Exactly one `<style_contract>...</style_contract>` block with NARRATIVE PERSPECTIVE and FORMATTING MARKERS lines
- [x] Closing marker verbatim `</style_contract>` (no attributes)
- [x] Content matches Master Design §11a enums (third_omniscient / present / asterisks_for_thoughts_only / double_quotes / double_asterisks)
- [x] ACTIVE-SPEAKER RULE absent (is_multi_perspective + is_multi_tense both false)
- [x] DIRECTOR-CARD RULE absent (has_director_card false)
- [x] No extra content inside `<style_contract>`
- [x] Main Prompt outside contract: no hardcoded marker directive substrings
- [x] Formatting block: no hardcoded marker characters; references both `<style_contract>` and `<style_override>`

### Author's Note Suggestions (Build mode)
- [x] `Export/Authors_Note_Suggestions.md` written (primer + 5 world-tuned notes + boundary note)

### Files With Recommended Corrections (Manual Apply Required)
- `Export/SvartulfrVerse_Urban_Sandbox_Lorebook.json` — 1 recommendation in Section 7 (WORLD_PULSE generic pulse `constant: true`). APPLIED: [ ] YES / [ ] NO / [ ] DEFERRED

### Pipeline Completion Status
Status: AUDIT COMPLETE — 1 manual correction recommended (WORLD_PULSE firing enable) before pipeline is fully ready. The ChatPreset (`SvartulfrVerse_Urban_ChatPreset.json`) is generated and passes all Pass 1/Pass 2 checks. See Section 7 for the single manual-apply step.
