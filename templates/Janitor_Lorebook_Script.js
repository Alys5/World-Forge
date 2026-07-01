// === CONTEXT GUARDS ===
try {
  context.character = context.character || {};
  context.character.personality = context.character.personality || "";
  context.character.scenario = context.character.scenario || "";

  var last = context.chat.last_message ? context.chat.last_message.toLowerCase() : "";
  var padded = " " + last + " ";
  var count = context.chat.message_count || 0;

  // Clean old situational states to prevent token bloat
  // We remove previous "==== ACTIVE SITUATION ====" blocks from the scenario
  if (context.character.scenario.includes("==== ACTIVE SITUATION ====")) {
    var parts = context.character.scenario.split("==== ACTIVE SITUATION ====");
    context.character.scenario = parts[0].trim();
  }
  var activeSituation = "";

  // === MODULAR LOREBOOK (THE EVERYTHING LOREBOOK FRAMEWORK) ===
  var lorebook = {
    definitionalLore: [
      // [INSERT TIER 1 WORLD LOREBOOK ENTRIES HERE]
      // Example: { keywords: ["city", "haven"], scenario: " The neon lights of Haven flicker in the rain." }
    ],
    relationalLore: [
      // [INSERT SITUATIONAL TIER 2 CHARACTER LOREBOOK ENTRIES HERE]
      // Note: Permanent Tier 1/2 lore should be in the Bot Profile's [LORE] block, not here.
      // Example: { keywords: ["anna", "larsson"], personality: ", sarcastic and observant.", scenario: " Anna stands nearby, arms crossed." }
    ],
    eventLore: [
      // [INSERT TIER 3 ARC_STATE OR SANDBOX_STATE ENTRIES HERE]
      // Example: { trigger: count % 10 === 0, scenario: " A distant siren echoes through the streets." }
    ]
  };

  // --- PROCESS LOREBOOK ---

  // Process Definitional Lore (Situational Tier 1)
  for (var i = 0; i < lorebook.definitionalLore.length; i++) {
    var entry = lorebook.definitionalLore[i];
    for (var j = 0; j < entry.keywords.length; j++) {
      if (padded.indexOf(" " + entry.keywords[j] + " ") !== -1) {
        if (entry.personality) context.character.personality += entry.personality;
        if (entry.scenario) activeSituation += entry.scenario;
        break;
      }
    }
  }

  // Process Relational Lore (Situational Tier 2)
  for (var i = 0; i < lorebook.relationalLore.length; i++) {
    var entry = lorebook.relationalLore[i];
    for (var j = 0; j < entry.keywords.length; j++) {
      if (padded.indexOf(" " + entry.keywords[j] + " ") !== -1) {
        if (entry.personality) context.character.personality += entry.personality;
        if (entry.scenario) activeSituation += entry.scenario;
        break;
      }
    }
  }

  // Process Event Lore (Tier 3 Pulse/Beats/States)
  for (var i = 0; i < lorebook.eventLore.length; i++) {
    var entry = lorebook.eventLore[i];
    if (entry.trigger) {
      if (entry.personality) context.character.personality += entry.personality;
      if (entry.scenario) activeSituation += entry.scenario;
    }
  }

  // Append situational text dynamically
  if (activeSituation.trim() !== "") {
    context.character.scenario += "\n==== ACTIVE SITUATION ====\n" + activeSituation.trim();
  }

} catch (error) {
  console.error("Lorebook Script Error:", error);
}
