# SHARED REFERENCE: STYLE CONTRACT

*Canonical reference for the per-card `extensions.world_forge.style_override` metadata schema, the world Style Contract's directive prose templates, and the runtime model.*

This file is the single source of truth for the Style Contract content that multiple agents would otherwise duplicate. The Refiner, Architect, Editor, Compiler, and Prompt Engineer all reference this file when they need to:
- Look up an enum's allowed values
- Look up the canonical directive prose for a given enum value (or pair)
- Confirm the metadata schema shape
- Understand how stock SillyTavern vs. a `world_forge`-aware extension consume the metadata at runtime

If you are an agent reading this: consult the sections below as needed for your phase. The behavior rules specific to your phase remain in your own agent file. This file is content reference, not behavioral spec.

---

## 1. THE METADATA SCHEMA

A character card's `extensions.world_forge.style_override` field has two valid states.

### Non-overriding card (the vast majority)

```json
"world_forge": { "style_override": null }
```

Or the field may be absent entirely (treated as `null`).

### Overriding card

```json
"world_forge": {
  "style_override": {
    "perspective_override":      "first" | "second" | "third_limited" | "third_omniscient" | null,
    "tense_override":            "past" | "present" | null,
    "narration_marker_override": "asterisks_for_narration" | "asterisks_for_thoughts_only" | "plain_prose" | null,
    "dialogue_marker_override":  "double_quotes" | "single_quotes" | "em_dash" | "unmarked" | null,
    "emphasis_marker_override":  "double_asterisks" | "italics_underscore" | "none" | null,
    "directives": [
      "NARRATIVE PERSPECTIVE: <pre-resolved prose>",
      "FORMATTING MARKERS: <pre-resolved prose>"
    ],
    "override_rationale": "<structural reason, ≥15 chars>"
  }
}
```

**Seven keys.** At least one of the five enum fields must be a non-null enum value (otherwise the card isn't overriding — set the whole `style_override` to `null`). The `directives` array contains zero, one, or two entries:

- A `NARRATIVE PERSPECTIVE:` line is present iff `perspective_override` OR `tense_override` is non-null.
- A `FORMATTING MARKERS:` line is present iff ANY of `narration_marker_override`, `dialogue_marker_override`, or `emphasis_marker_override` is non-null.

Allowed enum values for each axis are listed below in §3.

---

## 2. RUNTIME MODEL

Two consumers, two behaviors:

**Stock SillyTavern** ignores `extensions.world_forge.style_override`. The field is an unknown extension key (tolerated per `Notes_On_functionality.md` §5.6 V3 card notes). The world `<style_contract>` block in the preset's Main Prompt governs every turn for every card. The override is inert.

**`world_forge`-aware extension** reads the metadata at runtime, takes the `directives` array verbatim, wraps it in `<style_override>...</style_override>` tags, and splices the block into the assembled main system prompt immediately after `</style_contract>` for the active card's turns. Per the active-speaker rule in the preset's `<style_contract>` block, the directives in the synthesized override replace the corresponding directives in the world contract for that card's turns; directives the override does not include continue to follow the world contract (field-level inheritance).

The extension does no string-table lookup. It does no prose synthesis. It just splices what the pipeline already put in the `directives` array.

---

## 3. CANONICAL DIRECTIVE TEMPLATES

The Architect (when generating per-card `directives`) and the Prompt Engineer (when authoring the world `<style_contract>` block in the preset Main) both use these templates. The effective value is the override value if set, otherwise the world default from Master Design Section 11a.

### 3a. `NARRATIVE PERSPECTIVE` line — perspective × tense (eight rows)

| Effective perspective | Effective tense | Resolved directive content |
|---|---|---|
| `first` | `past` | `Narrate in first-person past tense from {{char}}'s POV. {{char}} narrates their own experience as "I". {{user}} is addressed as "you" only inside dialogue, never in narration.` |
| `first` | `present` | `Narrate in first-person present tense from {{char}}'s POV. {{char}} narrates their own immediate experience as "I". {{user}} is addressed as "you" only inside dialogue, never in narration.` |
| `second` | `past` | `Narrate in second-person past tense, addressing {{user}} as "you" inside the prose itself. {{char}} is referenced in third person.` |
| `second` | `present` | `Narrate in second-person present tense, addressing {{user}} as "you" inside the prose itself. {{char}} is referenced in third person.` |
| `third_limited` | `past` | `Narrate in third-person limited past tense, focal on {{char}} this turn. The narrator sees {{char}}'s interior — their thoughts, sensations, and immediate reactions — but not other characters' interiors. {{user}} is referenced by name or pronoun, never addressed as "you" in narration.` |
| `third_limited` | `present` | `Narrate in third-person limited present tense, focal on {{char}} this turn. The narrator sees {{char}}'s interior but not other characters'. {{user}} is referenced by name or pronoun, never addressed as "you" in narration.` |
| `third_omniscient` | `past` | `Narrate in third-person omniscient past tense. {{char}} is the focal narrator for this turn — render the protagonists and NPCs as he/she/they; reference {{user}} by name or pronoun, never as "you" inside narration. The narrator may render any character's interior as the scene requires, may move freely between locations and points of view within a scene, and is not bound to any single character's knowledge state.` |
| `third_omniscient` | `present` | `Narrate in third-person omniscient present tense. {{char}} is the focal narrator for this turn — render the protagonists and NPCs as he/she/they; reference {{user}} by name or pronoun, never as "you" inside narration. The narrator may render any character's interior as the scene requires, may move freely between locations and points of view within a scene, and is not bound to any single character's knowledge state.` |

### 3a-D. Director-card variant of the `NARRATIVE PERSPECTIVE` line

When the overriding card is a **Director / NPC-host card** (a card meeting the Refiner's Step 1.5 Pass 4 Director criteria — it narrates the world and voices the NPCs rather than playing a single character), the §3a rows above are structurally wrong: they resolve their focal anchor through `{{char}}` ("focal on {{char}}", "{{char}}'s interior", "{{char}} is the focal narrator"), and at runtime SillyTavern expands `{{char}}` to the active card's **name**. On a Director card's turn that yields directives like "focal on [Director card name] this turn" — telling the model the Director is a character in the scene, in direct contradiction with the card's own not-a-character identity. Capable models shrug this off; literal-minded models take the contradiction seriously and start treating the Director as a character.

For Director-flagged cards, use these rows instead (same lookup: effective perspective × tense). Only the two third-person perspectives have Director variants — a Director card whose effective perspective is `first` or `second` is the Refiner's Section 11d POV-ambiguity case, not a template case.

| Effective perspective | Effective tense | Resolved directive content |
|---|---|---|
| `third_omniscient` | `past` | `Narrate in third-person omniscient past tense. {{char}} is not a character in this scene — it is the world's narrating voice and NPC host, with no body, no interior, and no dialogue of its own; it never appears inside the fiction. Narrate the scene and voice the NPCs from outside it: render any character's interior as the scene requires, and move freely between locations and points of view within a scene. {{user}} is referenced by name or pronoun, never addressed as "you" in narration.` |
| `third_omniscient` | `present` | `Narrate in third-person omniscient present tense. {{char}} is not a character in this scene — it is the world's narrating voice and NPC host, with no body, no interior, and no dialogue of its own; it never appears inside the fiction. Narrate the scene and voice the NPCs from outside it: render any character's interior as the scene requires, and move freely between locations and points of view within a scene. {{user}} is referenced by name or pronoun, never addressed as "you" in narration.` |
| `third_limited` | `past` | `Narrate in third-person limited past tense, focal on whichever scene character the narration is rendering this turn — never on {{char}} itself. {{char}} is not a character in this scene — it is the world's narrating voice and NPC host, with no body, no interior, and no dialogue of its own. The narrator sees the current focal character's interior — their thoughts, sensations, and immediate reactions — but not other characters' interiors. {{user}} is referenced by name or pronoun, never addressed as "you" in narration.` |
| `third_limited` | `present` | `Narrate in third-person limited present tense, focal on whichever scene character the narration is rendering this turn — never on {{char}} itself. {{char}} is not a character in this scene — it is the world's narrating voice and NPC host, with no body, no interior, and no dialogue of its own. The narrator sees the current focal character's interior but not other characters'. {{user}} is referenced by name or pronoun, never addressed as "you" in narration.` |

The Architect selects this table (never §3a) when generating the `NARRATIVE PERSPECTIVE` directive for a Director-flagged card; the Editor's Step 5.6 Pass 2 hard-fails a Director-flagged card whose directive uses the character-shaped §3a prose, and a non-Director card using §3a-D prose.

### 3b. `FORMATTING MARKERS` line — composed from three sub-clauses

The FORMATTING MARKERS directive line is composed by joining three sub-clauses (narration + dialogue + emphasis) into a single sentence using the format:

```
FORMATTING MARKERS: <narration sub-clause>. <dialogue sub-clause>. <emphasis sub-clause>. No other formatting conventions apply.
```

When the line is emitted (per the metadata schema rule in §1), it is atomic — all three sub-clauses are present using effective values (override where set, world default where inherited). The line cannot be partially emitted.

**Narration marker sub-clause** (effective `narration_marker`):

| Value | Sub-clause |
|---|---|
| `asterisks_for_narration` | `*Asterisks* delimit narration, action, and interior glimpses` |
| `asterisks_for_thoughts_only` | `*Asterisks* delimit only {{char}}'s internal thoughts and unspoken interior monologue; narration and action are plain prose` |
| `plain_prose` | `No asterisks anywhere — narration, action, and thought are all plain prose` |

**Dialogue marker sub-clause** (effective `dialogue_marker`):

| Value | Sub-clause |
|---|---|
| `double_quotes` | `"Double quotes" delimit spoken dialogue` |
| `single_quotes` | `'Single quotes' delimit spoken dialogue` |
| `em_dash` | `An em-dash (—) precedes spoken dialogue with no closing marker` |
| `unmarked` | `Spoken dialogue runs into the prose without delimiters` |

**Emphasis marker sub-clause** (effective `emphasis_marker`):

| Value | Sub-clause |
|---|---|
| `double_asterisks` | `**Double asterisks** delimit emphasis` |
| `italics_underscore` | `_Italics-underscore_ delimits emphasis` |
| `none` | `No emphasis marker — the prose carries its own weight` |

### 3c. `ACTIVE-SPEAKER RULE` line — world `<style_contract>` only

The Prompt Engineer adds this line to the world's `<style_contract>` block in the preset Main Prompt **only when** Master Design Section 11c reports `is_multi_perspective: true` OR `is_multi_tense: true`. The Architect does NOT emit this line in any per-card `directives` array — this line lives only in the world contract.

Verbatim text:

> `The active card's style contract governs the current turn. If a card declares its own <style_override>, the directives inside that block override the corresponding directives in this <style_contract> for that card's turns. Directives this <style_override> does NOT include continue to follow this <style_contract> — the override is field-level inheritance, not full-block replacement. Do not blend perspectives or marker conventions within a single turn.`

### 3d. `DIRECTOR-CARD RULE` line — world `<style_contract>` only

The Prompt Engineer adds this line to the world's `<style_contract>` block in the preset Main Prompt **only when** Master Design Section 11c reports `has_director_card: true`. Like the ACTIVE-SPEAKER RULE, it is world-agnostic engine content — it names the Director *role*, never a specific card, so it belongs on the preset side of the override architecture. The Architect does NOT emit this line in any per-card `directives` array.

It exists for two reasons:

1. `{{char}}` in the NARRATIVE PERSPECTIVE line resolves to the active card's **name** at runtime. On a Director card's turn, a focal-anchored world default (`first` / `second` / `third_limited`) produces "focal on [Director card name]" (or makes the Director the "I"/"you") — a contradiction with the Director card's not-a-character identity that derails literal-minded models into treating the Director as a character in the scene.
2. On **stock SillyTavern** (no `world_forge`-aware extension), per-card `<style_override>` metadata is inert and the world contract is the only style authority on the Director's turns — so the correction must live in the world contract itself, not only in the Director card's override.

Verbatim text:

> `DIRECTOR-CARD RULE: When the active card is a World Director / narrator / NPC-host card rather than a character, {{char}} names the narrating instrument, not a person in the scene. The Director is not a character: it has no body, no interior, and no dialogue of its own, and it never appears inside the fiction. On the Director's turns, read any focal-on-{{char}} directive as focal on whichever scene character the narration is rendering this turn; the Director narrates the scene and voices the NPCs from outside it.`

Ordering inside the `<style_contract>` block: `NARRATIVE PERSPECTIVE`, `FORMATTING MARKERS`, then `ACTIVE-SPEAKER RULE` (when triggered), then `DIRECTOR-CARD RULE` (when triggered). The block contains two, three, or four lines depending on which conditional rules fire.

---

## 4. WHEN EACH AXIS CAN BE OVERRIDDEN

| Axis | World Style Contract (Section 1.5a) | Per-card override |
|---|---|---|
| `perspective` | Required, one of four enum values | Yes — `perspective_override` |
| `tense` | Required, one of two enum values | Yes — `tense_override` |
| `narration_marker` | Required, one of three enum values | Yes — `narration_marker_override` |
| `dialogue_marker` | Required, one of four enum values | Yes — `dialogue_marker_override` |
| `emphasis_marker` | Required, one of three enum values | Yes — `emphasis_marker_override` |
| `paragraph_register` | Required, one of three enum values | **No** — world-coherent only |
| `style_notes` | Optional free text | No |

`paragraph_register` and `style_notes` live outside the `<style_contract>` block in the Main Prompt content and are not part of the override schema.

---

## 5. CROSS-AGENT RESPONSIBILITIES (BRIEF)

This is who does what with the Style Contract. Detailed rules live in each agent's spec.

- **Refiner (Phase 1)**: validates Section 1.5 enum values; aggregates per-card overrides into Master Design Section 11b; computes `is_multi_perspective`, `is_multi_tense`, and `has_director_card` flags (Section 11c); emits POV ambiguity advisory (Section 11d).
- **Architect (Phase 2)**: populates `extensions.world_forge.style_override` metadata in `Drafts/Instructions_[CardName].md` for cards listed in Section 11b; generates the `directives` array from this file's §3 templates using each card's effective values — using the §3a-D Director variant for Director-flagged cards.
- **Editor (Phase 3)**: validates the seven-key schema (Step 5.6 Pass 1); cross-checks `directives` against enum values, including §3a vs. §3a-D template selection by Director flag (Pass 2); validates rationale quality (Pass 3); cross-checks against Master Design Section 11b (Pass 4).
- **Voice Auditor (Phase 3.5)**: when `is_multi_perspective: true` OR `is_multi_tense: true`, runs the perspective/tense bleed check (Step 3H).
- **Compiler (Phase 4)**: emits `data.extensions.world_forge.style_override` as JSON, verbatim from the Architect's draft.
- **Prompt Engineer (Phase 5)**: authors the world `<style_contract>` block in the preset's Main Prompt using this file's §3 templates parameterized for the world default; adds the ACTIVE-SPEAKER RULE line conditionally per Section 11c; adds the DIRECTOR-CARD RULE line (§3d) conditionally per Section 11c `has_director_card`.

---

## 6. ANTI-PATTERNS — THINGS TO NOT DO

Hard rules across all agents:

- **Do NOT emit a literal `<style_override>...</style_override>` tag block in any card text field** (`system_prompt`, `post_history_instructions`, `extensions.depth_prompt.prompt`). The override is metadata-only; the runtime extension synthesizes the block from `directives` at runtime.
- **Do NOT include engine-level perspective or formatting language in card text fields**, regardless of whether the card has an override declared. Engine instructions live in the preset Main Prompt; card text is character-specific only. The Editor's contamination scan has no exemption for cards with overrides.
- **Do NOT emit overrides for cards that aren't listed in Master Design Section 11b.** The Refiner is the authority. If the Architect believes an override is warranted that the Refiner missed, escalate by adding a note to the LLM Instructions draft; do not freelance.
- **Do NOT hardcode prose in the runtime extension.** The pipeline owns all directive prose; the extension splices what's in the `directives` array. New prose templates go in §3 of this file, not in extension code.
- **Do NOT emit the character-shaped §3a rows for a Director-flagged card.** "Focal on {{char}}" / "{{char}} is the focal narrator" resolves `{{char}}` to the Director card's name at runtime and tells the model the Director is a character in the scene — the exact confusion the §3a-D variant and the §3d DIRECTOR-CARD RULE exist to prevent. Conversely, do not emit §3a-D prose for a card that plays a single character.
- **Do NOT lose the world default for non-overridden axes.** The Architect's NARRATIVE PERSPECTIVE line uses both perspective AND tense in its directive content — using the effective value for each axis (override if set, world default if null). The FORMATTING MARKERS line uses all three marker axes' effective values. Field-level inheritance happens at the *directive-line* level (entire line in `directives` overrides the corresponding contract line; missing line means inherit from contract), not at the sub-clause level.
