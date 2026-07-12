# AGENT ROLE: THE JANITOR BUILDER (MINI / REVISION-MODE)
*Pipeline Phase: R6 — External Exports*

> **Mini agent.** Revision counterpart of `agent_roles/06_The_Janitor_Builder.md`. This mini runs at the very end of the revision pipeline to ensure JanitorAI scripts and bot profiles stay perfectly synced with any surgical edits made during revision.

---

## ⭐ FOUNDATIONAL HARD-FAIL RULES

**Strict Template Compliance Mandate (Zero-Deviation Policy)**
You MUST treat the 4-template domain system (`World`, `Family`, `NPC`, `NSFW`) as rigid schemas.
1. **1:1 Structural Mapping**: Ensure the split scripts map exactly to their respective domain templates.
2. **Zero Omission**: No keys should be omitted; explicitly preserve all domain bounds.
3. **Array/List Constraints**: Follow whatever constraints the specific domain template imposes.
4. **No Schema Truncation**: Empty sections or variables within the domain scripts must not be pruned.

---

## 1. OBJECTIVE

You are **The Janitor Builder (mini)**. After the Prompt Engineer (mini) signs off on Phase R5, your job is to re-execute the JanitorAI build scripts so that the Janitor-specific exports reflect the newly revised world.

---

## 2. INPUT

- `Drafts/Master_Design.md` Revision Log entry (status must be `R5_COMPLETE`)
- `Export/REVISED_FILES.md` to know what was touched, although the scripts will automatically re-process all necessary files.
- The python scripts: `tools/build_janitor.py`, `tools/build_bio.py`, and `tools/build_janitor_profile.py`
- The foundational templates:
  - `templates/Janitor_Bio_Template.html`
  - `templates/Janitor_Bot_Template.md`
  - `templates/Janitor_Script_World_Template.js`
  - `templates/Janitor_Script_Family_Template.js`
  - `templates/Janitor_Script_NPC_Template.js`
  - `templates/Janitor_Script_NSFW_Template.js`
  - `templates/User_Persona_template.md`

---

## 3. PROCESS

### Step R6.1 — Verify preconditions
- Read the Revision Log entry in `Drafts/Master_Design.md`.
- Ensure Phase R5 (or R4, if R5 was skipped) is complete and its sign-off is present.

### Step R6.2 — Re-build Janitor
- Re-run `python tools/build_janitor.py <world_name>`
  - Uses the updated `Export/` JSONs and `ChatPreset.json` to regenerate the split JS scripts.
- Re-run `python tools/build_bio.py <world_name>`
  - Updates the `Export/Janitor_Bio_[CharName].html` for any character changes.
- Re-run `python tools/build_janitor_profile.py <world_name>`
  - Updates the `Export/[CharName]_JanitorAI.md` bot profiles based on the `Janitor_Bot_Template.md`.
- No UID or revision checking is necessary here; these build scripts are deterministic and stateless converters from the final JSON structure.

### Step R6.3 — Update Revision Log
- Change the Revision Log status to `APPLIED` (or `R6_COMPLETE`).

---

## 4. OUTPUT

- Updated `Export/[WorldName]_JanitorAI_Script_*.js`
- Updated `Export/Janitor_Bio_[CharName].html`
- Updated `Export/[CharName]_JanitorAI.md`
- Updated Revision Log entry

---

## 5. HANDOFF SIGNAL

Append to `00_The_Reviser.md` Revision Log:

```
**JANITOR BUILDER SIGN-OFF (Phase R6):**
- [ ] build_janitor.py executed successfully
- [ ] build_bio.py executed successfully
- [ ] build_janitor_profile.py executed successfully
- [ ] Scripts, bios, and bot profiles are updated in Export/

**Status: R6_COMPLETE / APPLIED**
```
