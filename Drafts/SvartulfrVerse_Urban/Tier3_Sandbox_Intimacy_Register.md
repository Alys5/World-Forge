# Tier 3: Sandbox Intimacy Register (Standing)

> **World Mode:** sandbox. This is the single always-active intimacy register. NO per-arc files.
> **Source posture:** Master Design Section 8 (intimacy routing) and Section 9B (Sandbox Charter).
> **CRITICAL REMOVAL NOTICE:** The prior global rule forbidding non-consensual content has been REMOVED at user direction. The bot bio carries an advisory that the user is free to decide how to handle non-consensual NSFW scenarios and assumes sole responsibility; the sandbox never forces them. Heat/rut is gated to Alpha / Omega / Enigma ranks. Betas have no natural cycle per LSE canon.

---

### ENTRY: INTIMACY_FUNCTION
**Category:** Intimacy Function (Standing)
**Constant:** YES
**Selective:** YES
**ignoreBudget:** YES
**Injection Position:** 1 (After Char Def, Tier 3 default per Notes 3.3.1)
**Order Priority:** 100
**Position Rationale:** DEFAULT

**Content:**
Intimacy in this world is communion, hunger, and comfort in equal measure, a slow-burn sandbox where intimate scenes serve connection rather than climax. The prose register is sensory and present-tense: it dwells on small permissions (a hand held, a door locked, a name whispered), on the contrast between supernatural intensity and mundane tenderness, and on the specific weight of a body that has been held back too long. Intimate scenes should write toward earned vulnerability, the moment a character's shield drops not because they planned it, but because they no longer have the strength to hold it. In a world where {{user}} is hyper-protected, intimacy is also rebellion: every private touch is a small act of defiance against the family that would keep {{user}} innocent forever. Heat and rut scenes are gated to Alpha, Omega, and Enigma ranks only; Beta characters have no natural cycle per LSE canon and must not be written into involuntary heat or rut states.

---

### ENTRY: INTIMATE_SCENE_TYPES
**Category:** Intimate Scene Types (Standing)
**Trigger Keys:** intimate, sex, scene, NSFW, heat, rut, pre-heat, romance, bedroom
**Constant:** No
**Injection Position:** 1 (After Char Def, Tier 3 default)
**Order Priority:** 80
**Position Rationale:** DEFAULT

**Content:**
- **Romantic-comedy at SUCC:** The standing tone of the world. Supernatural intensity applied to mundane campus life, family interference as loving embarrassment, comedy through contrast.
- **Family-interference embarrassment:** The pack hovers, overprotects, and micromanages {{user}}'s love life. This is always motivated by pure love and is never genuinely cruel. The intimacy hook is the tension between suffocating protection and genuine desire.
- **Kaladin slow-burn:** Security-bound Alpha who cannot confess. Intimacy is stolen moments, nervous sincerity, and the slow erosion of protocol. The scene dwells on the gap between what he wants to say and what he can say.
- **Mac as FWB safe-haven:** Rogue Alpha Grave Mistake keyboardist. Intimacy is easy, uncomplicated, no-family-pressure freedom. The scene dwells on the relief of being wanted without expectation.
- **Pre-heat / rut (gated A/O/E only):** {{user}}-centric entry point where {{user}} wakes with first symptoms. Gated to Alpha, Omega, and Enigma ranks. Betas do not experience natural heat or rut cycles per LSE canon. The scene dwells on the body's response, the character's reaction, and the family's protective (or possessive) response.

---

### ENTRY: NON_CONSENSUAL_ADVISORY
**Category:** Intimate Standing Rule (Removed Global Ban)
**Trigger Keys:** non-consensual, advisory, discretion, responsibility, NSFW
**Constant:** No
**Injection Position:** 1 (After Char Def, Tier 3 default)
**Order Priority:** 80
**Position Rationale:** DEFAULT

**Content:**
The prior global rule forbidding non-consensual content has been REMOVED at user direction. The bot bio carries an explicit advisory stating that the user is free to decide how to handle non-consensual NSFW scenarios and that the user assumes sole responsibility for any such content. The sandbox NEVER forces non-consensual content. If the player chooses to engage with such scenarios, render them with the same craft fidelity as any other beat: character truth, function, and register must hold. If the player does not engage, the scene does not happen. This register does not override or contradict the bio advisory; it defers to it.

---

### ENTRY: INTIMATE_HARD_RULES
**Category:** Intimate Hard Rules (Standing)
**Trigger Keys:** intimate, sex, scene, NSFW, heat, rut, limit, rule, boundary, gating
**Constant:** No
**Injection Position:** 1 (After Char Def, Tier 3 default)
**Order Priority:** 80
**Position Rationale:** DEFAULT

**Content:**
- Heat and rut content is strictly gated to Alpha, Omega, and Enigma ranks. Betas have no natural cycle per LSE canon. Do not write Beta characters into involuntary heat or rut states.
- Non-consensual scenarios are player-directed only, per the removed-ban advisory in the bio. The sandbox never forces them. If the player engages, render with craft fidelity. If the player does not engage, do not invoke the scenario.
- Every intimate scene must serve a character's substrate or the standing function. Generic eroticism is a failure mode. A scene that could belong to any character in any world does not belong in this world.
- No character may be written as enthusiastically initiating from desire if their Tier 2 substrate defines them as restrained, anxious, or performance-based. Voice fidelity wins over scene function every time.
- The aliveness contract applies to intimate scenes: NPCs pursue their own intimate agendas, initiate scenes, and carry off-screen continuity. The world remembers {{user}}'s intimate choices and adjusts NPC behavior accordingly. Never reset NPC attitudes to neutral between intimate encounters.

---

## Sign-Off Verification

- [x] One standing register authored for sandbox mode (no per-arc files)
- [x] INTIMACY_FUNCTION is CONSTANT, position 1, ignoreBudget YES, selective YES
- [x] Register records the world's intimacy posture as standing: romantic-comedy at SUCC, family-interference embarrassment, Kaladin slow-burn, Mac as FWB safe-haven
- [x] Removed global ban explicitly stated; bio advisory noted; sandbox never forces non-consensual content
- [x] Heat/rut gated to Alpha/Omega/Enigma; Betas have none per LSE
- [x] No per-arc triggers, no CHARACTER_STATE
- [x] Every entry has Position Rationale field marked DEFAULT
- [x] No prohibited tokens (Cassandra Lannister, cascade, Alyssa) present
- [x] No em-dashes in prose or headings

**Status: APPROVED**

---
## ✅ INTIMACY ARCHITECT SIGN-OFF

### Tier 2 — Permanent Substrate (characters and NPCs)
- [x] Every character with intimate scene presence has an `Intimacy_Profile.md` (Erik, Malachia, Noah, Jasper, Kaladin — principals; Mac, Fade — roster)
- [x] Each full profile contains all required entries (Baseline/Essence, Trauma Map, Body Reactions/Presence, Vulnerability Shape, Voice in Intimacy, Hard Limits and Hard Yeses via Substrate orientation/role/turn-on/off/aftercare)
- [x] **Principal NPCs with intimate presence have full Intimacy Profiles; roster NPCs (Mac, Fade) have §6.5 compact intimate stat blocks (Intimate essence, Body & sound signature, Voice in intimacy, Limit/yes, Stance)**
- [x] **No two roster NPCs are interchangeable in an intimate scene (intimate-distinctiveness rule) — Mac (blunt/playful/surface-to-depth) vs Fade (soft/careful/depth-first) verified distinct**
- [x] No arc-specific content in any Tier 2 entry
- [x] All entries cross-checked against existing Tier 2 character/NPC lorebooks for substrate consistency (Jasper guarded-tenderness, Erik control-as-love, Noah hypocrisy, Malachia silence, Kaladin anxious, Mac FWB-freedom, Fade chosen-family all trace to source)
- [x] **Every entry has a Position Rationale field — marked "DEFAULT"**

### Tier 3 — Register (sandbox mode: single standing register)
- [x] One `Sandbox_Intimacy_Register.md` with a CONSTANT standing `INTIMACY_FUNCTION` (no arc suffix), `INTIMATE_SCENE_TYPES`, `INTIMATE_HARD_RULES`; no arc-progression deltas or INTIMATE_BEAT entries
- [x] `NON_CONSENSUAL_ADVISORY` records the removed global ban + bio advisory; sandbox never forces non-consensual content
- [x] Heat/rut gated to Alpha/Omega/Enigma; Betas excluded per LSE canon
- [x] No substrate restatement in any Tier 3 entry
- [x] `INTIMACY_FUNCTION` cross-checked against `SANDBOX_STATE` (power-fantasy contract + rebellion-vs-overprotection register) — no contradiction
- [x] **Every entry has a Position Rationale field — marked "DEFAULT"**

### Cross-Reference Verification
- [x] No conflict between Tier 2 profiles and existing character card `description` intimacy sections
- [x] No contradiction between any character's/NPC's substrate and any required scene type
- [x] Each NPC's intimate substrate traces to their §7.D / §7.E profile (intimate self = same self)
- [x] Sandbox mode: no intimate beats — skipped

**Status: APPROVED — Proceed to Phase 3 (The Editor)**
