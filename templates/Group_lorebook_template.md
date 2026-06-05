I need you to generate a world lorebook tailored for a multi-character group chat in a text-based roleplaying game.
Please output the result strictly as a valid JSON file using the exact structure provided below. Do not include markdown formatting errors, and do not include any comments in the final JSON output.

Here is the overarching concept, the setting, and the roster of characters in this group chat:
[INSERT YOUR GROUP CHAT SETTING, LOCATION, AND CHARACTER ROSTER HERE]

Your task is to create lorebook entries that focus on the relationships, shared history, and group dynamics between these characters. Focus on establishing tense alliances, shifting loyalties, past betrayals, and the rules of the specific environment they are currently navigating.

Break down the group lore into separate entries. Fill out this exact SillyTavern Lorebook JSON structure. Add as many entries ("0", "1", "2", etc.) as necessary.

POSITION VALUES:
- 0 = Before Character Definition — world rules and shared mechanics that all characters must understand.
- 1 = After Character Definition — relationship dynamics, shared history, NPC behavioral notes. Standard default for group lorebook entries.
- 2 = Author's Note Top — tone/atmosphere directives only.
- 3 = Author's Note Bottom — tone/atmosphere directives only.
- 4 = At Depth — urgency injections that need maximum recency. Set depth: 2-4.

KEY FIELD RULES:
- "uid": unique integer per entry, sequential from 0, never duplicated.
- "selectiveLogic": 0 = AND ANY (fires if any key present — use for individual character entries), 3 = AND ALL (fires only if ALL keys present — use when you want lore to fire only when two specific characters are interacting).
- "useProbability": false for standard entries that always fire when triggered.
- "disable": false for all active entries. Do NOT use "enabled: true".
- "group": use to group related entries for ST lorebook editor management. In an arc world the Tier 3 groups are per-arc ("Arc1", "Arc2", …) and swapped in/out as the story advances. In a **sandbox world** there is a single always-active Tier 3 group ("Sandbox") that is never swapped — its SANDBOX_STATE entry is constant + ignoreBudget and fires every turn.

{
  "name": "Group_Dynamics_Lorebook",
  "description": "Rules, relationships, and shared history governing the current group chat.",
  "scan_depth": 50,
  "token_budget": 2048,
  "recursive_scanning": false,
  "extensions": {},
  "entries": {
    "0": {
      "uid": 0,
      "comment": "Internal title/memo (e.g., 'Character A and Character B Rivalry').",
      "key": ["Character A", "Character B", "Shared Location"],
      "keysecondary": [],
      "selectiveLogic": 0,
      "content": "The lore text explaining the specific dynamic, shared history, or rule of the environment. Keep it concise and behaviorally directive.",
      "position": 1,
      "order": 100,
      "depth": 4,
      "role": 0,
      "selective": true,
      "constant": false,
      "probability": 100,
      "useProbability": false,
      "addMemo": true,
      "disable": false,
      "ignoreBudget": false,
      "vectorized": false,
      "case_sensitive": false,
      "match_whole_words": true,
      "use_regex": false,
      "group": "",
      "groupOverride": false,
      "groupWeight": 100,
      "characterFilterNames": [],
      "characterFilterExclude": false,
      "excludeRecursion": false,
      "preventRecursion": false,
      "delayUntilRecursion": false,
      "matchPersonaDescription": false,
      "matchCharacterDescription": false,
      "matchCharacterPersonality": false,
      "matchCharacterDepthPrompt": false,
      "matchScenario": false,
      "matchCreatorNotes": false,
      "sticky": 0,
      "cooldown": 0,
      "delay": 0,
      "outletName": "",
      "automationId": "",
      "triggers": []
    }
  }
}

Add sequential entries ("1", "2", "3") under "entries" following the exact same field structure.
"role": 0 = System (use this — the model treats group dynamics as absolute fact).
"order": higher numbers inject first. Default 100.
