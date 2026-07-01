# JanitorAI Integration

World-Forge now natively supports exporting character profiles and modular ES6 lorebook scripts tailored specifically for JanitorAI. Because JanitorAI enforces strict context limits, relies on a highly structured JED profile template, and uses ES6 javascript for its lorebooks, the pipeline automatically maps your drafts to these specialized targets during Phase 4.

## How it works

The standard World-Forge pipeline produces V3 JSON cards for SillyTavern. For JanitorAI, the pipeline does the following:

1. **Phase 2 (The Architect)**: The Architect drafts a dedicated `Drafts/JanitorAI_Profile_[CharName].md`. Permanent Tier 1 and Tier 2 lore (world rules, standing goals, permanent relationships) are placed directly into the `[SETTING]` and `[LORE]` blocks of this profile.
2. **Phase 3 (The Editor)**: The Editor validates this new draft specifically for JanitorAI formatting compliance and checks for "token bloat", enforcing concise bullet points over excessive prose. It also ensures that situational/transient elements are kept out of this profile.
3. **Phase 4 (The Compiler)**: The Compiler produces two final artifacts:
   - `Export/[CharName]_JanitorAI.txt` — This is the plain text JED profile ready to be copy-pasted into the JanitorAI "Personality" box.
   - `Export/[WorldName]_JanitorAI_Script.js` — This is an ES6 "Everything Lorebook" script. It handles keyword-triggered injection of **Situational** Tier 1/2 elements, and all Tier 3 progression (Arc States, Sandbox States, TENSION modifiers).

## ES6 Scripting Sandbox Restrictions

To ensure stability within JanitorAI's scripting sandbox:
- **No Async calls:** No `fetch`, `setTimeout`, etc.
- **State Mutability:** The script only modifies `context.character.personality` and `context.character.scenario`.
- **Token Cleanup:** The script actively cleans up old events it injected into the scenario to prevent token bloat across a long chat session.

## Usage

You do not need any special flags to trigger JanitorAI generation. Simply run the standard `/worldforge` commands (`/worldforge start`, `/worldforge resume`, etc.) and the JanitorAI files will appear alongside the SillyTavern JSON files in your `Export/` directory.
