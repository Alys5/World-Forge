# USER PERSONA — STRUCTURAL TEMPLATE
*Reference for the Architect when authoring `Drafts/User.md`. Defines the structure and content rules for the `{{user}}` Persona Description text — the always-on system block ST injects every turn for the active persona.*

---

## 1. WHAT THIS FILE IS

`User.md` is the artifact that closes the asymmetry between `{{char}}` and `{{user}}` in SillyTavern. SillyTavern provides a structured import for `{{char}}` (the V3 character card JSON) but no equivalent import for `{{user}}` — the user's persona is configured manually in **User Settings → Persona Management**, where a persona is just a name, a free-text **Description** field, and an optional linked **Lorebook**.

The pipeline already produces the lorebook side: `[ProtagonistName]_Lorebook.json` (Tier 2). What was missing was the **persona description text** — the always-on system block that tells the LLM who `{{user}}` is even before any Tier 2 lorebook trigger fires. `User.md` is that text, plus setup instructions for the user.

Per `Notes_On_functionality.md`:
- The persona description is injected as `personaDescription` in the prompt assembly (a `[system]` block, always present when the persona is active).
- The linked persona lorebook scans only when this persona is active.

The two work as a pair: persona description = constant baseline; lorebook = trigger-keyed detail.

---

## 2. WHAT THIS FILE IS *NOT*

`User.md` is **not** a character card. The human plays `{{user}}` and writes their own dialogue, actions, and intent. The pipeline does not instruct the LLM on how to *impersonate* `{{user}}`.

Therefore `User.md` MUST NOT contain:
- **Voice / dialogue style / speech patterns / accent / rhetorical habits** — the human writes `{{user}}`'s voice directly.
- **Personality traits framed as behavioral mandates** ("Andrei is stoic and reserved" written as a directive) — the human plays the personality.
- **Mannerisms, gestures, habits framed as instructions to the model** — the human controls these.
- **First-person framing or "you are" framing** — `{{user}}` is not played by the LLM; the persona description is third-person *reference data about* `{{user}}` for the LLM to react to.
- **Engine instructions** ("don't write actions for `{{user}}`," narration rules, formatting rules) — those live in the preset Main Prompt and are never duplicated in persona text.
- **Trigger-response pairs, behavioral mandates, prohibitions** — those belong in the Tier 2 lorebook (which fires on keys) or in the preset (engine-level).

The persona description's *only* job is to give the LLM the minimum reference context it needs so NPCs and `{{char}}` can react correctly to `{{user}}` before any keyword-triggered Tier 2 entry has fired.

---

## 3. STRUCTURE OF `Drafts/User.md`

The file has two parts: the **Persona Description block** (what the user pastes into ST) and the **Setup Instructions** (how the user wires it up). Only the Persona Description block is injected into the LLM prompt; the Setup Instructions are for the human reader and never reach the model.

```
# {{user}} PERSONA — [In-World Name]

## PERSONA DESCRIPTION
*Paste the block below — between the BEGIN and END markers — into:
SillyTavern → User Settings → Persona Management → [your persona] → Description.
This text is injected as a system message every turn while this persona is active. Keep it tight.*

--- BEGIN PERSONA DESCRIPTION ---

[Identity & Role — 1–3 sentences]

[Physical signature in compact prose — 1–3 sentences]

[Optional: world-relevant powers / limits / hidden layer — 1–2 sentences, only if it shapes how the world reacts to {{user}}]

--- END PERSONA DESCRIPTION ---

---

## SETUP INSTRUCTIONS
1. In SillyTavern, open **User Settings → Persona Management** and create (or select) the persona you will use for this world.
2. Set the persona name to: `[In-World Name]`.
3. Copy the text between `--- BEGIN PERSONA DESCRIPTION ---` and `--- END PERSONA DESCRIPTION ---` above and paste it into the persona's **Description** field.
4. In the same persona editor, find the **Lorebook** field and link `[ProtagonistName]_Lorebook.json` (the Tier 2 protagonist lorebook produced by the pipeline).
5. Activate this persona before starting the chat. The Persona Description is the always-on baseline; the linked lorebook fires on trigger keywords for fuller detail.
```

---

## 4. WHAT TO PUT IN EACH SECTION OF THE PERSONA DESCRIPTION BLOCK

### Identity & Role (1–3 sentences, mandatory)
The in-world name, the public role or function, and what people see when they look at `{{user}}`. This is the floor: NPCs need to know what kind of person `{{user}}` is to react sensibly before any lorebook entry triggers.

Source: World Seed § 3 (Identity & Role) and § 3 (The Contradiction) — distilled, not copy-pasted.

Example pattern: *"`{{user}}` is [Name] — [public role / position / function]. [What people see / how `{{user}}` presents on first contact]."*

### Physical Signature (1–3 sentences, mandatory if the world has visual scenes)
The minimum physical anchor an NPC could clock at a glance: build, distinguishing features, dress register, sensory signature. Compact prose. The full anatomical breakdown belongs in the Tier 2 lorebook physical entry, not here.

Source: World Seed § 3 (Protagonist Physical Description) — distilled to one or two strokes.

If the world has no visual scenes (text adventure abstraction, dream logic, etc.), this section may be omitted — note "*Physical: not applicable to this world's register.*"

### Powers / Limits / Hidden Layer (1–2 sentences, optional)
Include **only** if the world's reactions to `{{user}}` depend on it. Examples where it is needed:
- `{{user}}` has supernatural powers other characters can sense (Lucifer's stillness, a mage's aura) — the world reacts to that presence even before a key fires.
- `{{user}}` has a public identity that meaningfully shapes deference, fear, or hostility from NPCs (a king, a wanted criminal).
- `{{user}}` has a hidden layer that is also a structural fact of the world (Lucifer's true nature, even if disguised).

Examples where it is **not** needed (omit):
- `{{user}}` is an ordinary person with no powers and no public role.
- The hidden layer is purely psychological / private to the player and doesn't shape NPC reactions.

The full power/limit specification belongs in the Tier 2 lorebook; this is a one- or two-sentence flag so NPCs don't behave wrongly before the key fires.

---

## 5. LENGTH CAP

The Persona Description block (the text between `--- BEGIN ---` and `--- END ---` markers) MUST be **≤150 words**. Hard cap.

Rationale: this text injects every turn, in every context window, for the entire chat — every word costs tokens on every generation. Detail belongs in the Tier 2 lorebook, which fires on keys. The persona description is the floor, not the ceiling.

If the Architect cannot fit the protagonist into 150 words, the content is wrong: voice/personality/manner has crept in, or the lorebook material is being duplicated. Strip and rewrite.

---

## 6. ARCHITECT'S DRAFTING WORKFLOW

1. Read World Seed § 3 (the Protagonist section) completely.
2. Distill Identity & Role from § 3's "Identity & Role" and "The Contradiction" — pick the surface the world sees, not the interior.
3. Distill Physical Signature from § 3's "Protagonist Physical Description" — one or two compact sentences capturing build, signature feature, dress, sensory cue. Do **not** copy the full anatomical paragraph; that lives in the Tier 2 lorebook.
4. Decide whether Powers/Limits/Hidden Layer belongs in the persona description (see § 4 above). If yes, one or two sentences. If no, omit.
5. Verify the assembled block is third-person reference, not directive ("Andrei is …", not "You are …" or "Always …").
6. Verify the block contains no voice/personality/manner/style content.
7. Count words. If >150, cut.
8. Write the Setup Instructions section verbatim from § 3 above, substituting the in-world name and lorebook filename.

---

## 7. WHEN `{{user}}` IS UNNAMED OR ABSTRACT

If the world's `{{user}}` is deliberately unnamed (open-ended adventure, "you are an unnamed traveler"), the pipeline still produces `User.md`, but the Persona Description block is minimal and may consist of just the role context (e.g., *"`{{user}}` is a traveler whose identity is established through play. The world treats them as [register / station / faction relationship]."*). Setup Instructions still apply.

The Refiner determines this case during Phase 1. If § 3 of the World Seed has no named protagonist and explicitly states the protagonist is open-ended, the Architect produces a minimal `User.md` and notes the case in the file header.

---

## 8. RELATIONSHIP TO THE TIER 2 PROTAGONIST LOREBOOK

`User.md` and `[ProtagonistName]_Lorebook.json` are **paired artifacts**. They are not redundant:

| | Persona Description (in User.md) | Tier 2 Protagonist Lorebook |
|---|---|---|
| **Trigger** | Always on (every turn while persona active) | Keyword-triggered |
| **Content scope** | Identity floor only | Full reference: physical detail, psychology, relationships, powers, history |
| **Length** | ≤150 words | No fixed cap; per-entry standard |
| **Authority** | Reference floor | Authoritative detail |
| **Consumed by** | LLM, every turn | LLM, when keys match |
| **Configured in ST via** | Paste into Persona Description field | Link to Lorebook field on the persona |

If content lives in both, prefer the lorebook. The persona description should be the smallest viable identity anchor — anything that can wait for a key to fire belongs in the lorebook.
