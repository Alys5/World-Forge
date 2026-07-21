// All agent rules have been consolidated to the root /AGENTS.md

**ES6 SANDBOX SCRIPTING CONSTRAINTS**: If your phase involves evaluating, compiling, or interacting with JanitorAI JS logic, you MUST strictly respect the ES6 Sandbox limits:
- **Blocked**: `async`, `fetch`, `Promise`, `window`, `document`, `setTimeout`, and all external I/O.
- **Allowed**: String methods (`.includes`), Array methods (`.map`, `.filter`), Math, and Regex.
- **Editable context**: Only `context.character.personality` and `context.character.scenario` can be mutated.
- **Memory Scanning**: Always use `context.chat.last_messages.slice(-X)` for multi-message progression rather than just `last_message`.


## Wiki Sync Mandate
When modifications are made to the `d:\World-Forge\wiki\LSE` directory, you MUST automatically run `python tools/sync_lse_wiki.py` to synchronize these changes to the Export files (`LSE_Global_JanitorAI_Bio_LSE.html` and `LSE_Global_Appendix.js`). Do not wait for the user to prompt you to sync.
