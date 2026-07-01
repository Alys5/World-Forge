// === CONTEXT GUARDS ===
context.character = context.character || {};
context.character.personality = context.character.personality || "";
context.character.scenario = context.character.scenario || "";

var last = context.chat.last_message.toLowerCase();
var padded = " " + last + " ";
var count = context.chat.message_count;

// === MODULAR LOREBOOK (THE EVERYTHING LOREBOOK FRAMEWORK) ===
// I want you to compile the World-Forge Tier 1, Tier 2, and Tier 3 lorebooks into this structure.
var lorebook = {
  // Tier 2: Characters
  people: [
    // [INSERT TIER 2 CHARACTER LOREBOOK ENTRIES HERE]
    // Example: { keywords: ["anna", "larsson"], personality: ", sarcastic and observant.", scenario: "Anna stands nearby, arms crossed." }
  ],
  
  // Tier 1: World Facts, Factions, Locations
  world: [
    // [INSERT TIER 1 WORLD LOREBOOK ENTRIES HERE]
    // Example: { keywords: ["city", "haven"], scenario: "The neon lights of Haven flicker in the rain." }
  ],

  // Tier 3: Arc States / Sandbox States
  states: [
    // [INSERT TIER 3 ARC_STATE OR SANDBOX_STATE ENTRIES HERE]
    // Example: { keywords: ["tension", "fight"], personality: ", adrenaline surging, ready for conflict." }
  ],

  // Sandbox Pulses / Arc Beats
  events: [
    // [INSERT TIER 3 WORLD_PULSE OR TENSION ENTRIES HERE]
    // Example: { trigger: "count % 10 === 0", scenario: "A distant siren echoes through the streets." }
  ]
};

// --- PROCESS LOREBOOK ---

// Process People (Tier 2)
for (var i = 0; i < lorebook.people.length; i++) {
  var entry = lorebook.people[i];
  for (var j = 0; j < entry.keywords.length; j++) {
    if (padded.indexOf(" " + entry.keywords[j] + " ") !== -1) {
      context.character.personality += entry.personality || "";
      context.character.scenario += entry.scenario || "";
      break;
    }
  }
}

// Process World (Tier 1)
for (var i = 0; i < lorebook.world.length; i++) {
  var entry = lorebook.world[i];
  for (var j = 0; j < entry.keywords.length; j++) {
    if (padded.indexOf(" " + entry.keywords[j] + " ") !== -1) {
      context.character.personality += entry.personality || "";
      context.character.scenario += entry.scenario || "";
      break;
    }
  }
}

// Process States (Tier 3 Arc/Sandbox State)
for (var i = 0; i < lorebook.states.length; i++) {
  var entry = lorebook.states[i];
  for (var j = 0; j < entry.keywords.length; j++) {
    if (padded.indexOf(" " + entry.keywords[j] + " ") !== -1) {
      context.character.personality += entry.personality || "";
      context.character.scenario += entry.scenario || "";
      break;
    }
  }
}

// Process Events (Tier 3 Pulse/Beats)
for (var i = 0; i < lorebook.events.length; i++) {
  var entry = lorebook.events[i];
  // Simple eval alternative for triggers since eval is risky in sandboxes
  // For basic modulo checking or exact count
  if (entry.trigger === "count % 10 === 0" && count > 0 && count % 10 === 0) {
    context.character.scenario += entry.scenario || "";
  }
}
