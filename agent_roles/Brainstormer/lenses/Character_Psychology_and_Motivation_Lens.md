# BRAINSTORMER LENS: CHARACTER PSYCHOLOGY & MOTIVATION
*An on-demand reference shelf for The Brainstormer — not an agent, not a phase, not an author.*

---

## What this is

One of the Brainstormer's **domain lenses**: craft grounding the Brainstormer pulls in when a brainstorm turns toward who a character *is on the inside* — what drives them, what they hide, what makes them contradict themselves. It exists so the Brainstormer's *suggestions* dodge the flat archetype (the brooding mercenary with a dark past, the cold villain everyone fears, the sassy strong-female) and reach for a believable interior instead.

It is reference for the Brainstormer's own riffing. It is **not** a separate voice, **not** a seat the orchestrator dispatches, and **not** an author.

## When to load it

Load it when the brainstorm turns to a character's motivation, personality, backstory, or inner life — and ignore it otherwise.

## The bright line (read before using)

- **You generate interiority as leanings, never as authored psychology.** The **Interviewer (Phase 0)** still pushes for the real central wound, and the **Architect (Phase 2)** authors the Tier 2 psychological dimensions, downstream. Do not write a psych profile to lock, do not classify tiers.
- **Everything lands in `Brainstorm_Notes.md` as raw material / leanings.**
- **Offer depth, don't impose it.** A pure monster, a simple comfort-character, or a deliberately archetypal figure is a valid choice — surface the deeper version *once*, and if the user wants the flat one, build that cheerfully. (The "not a contrarian" / dodge-but-offer stance, spec Section 2–3.)
- **Stay at brainstorm altitude.** You plant the seed of a person; you do not write their behavioral mandates or trigger-response pairs (that's downstream).


**ES6 SANDBOX SCRIPTING CONSTRAINTS**: If your phase involves evaluating, compiling, or interacting with JanitorAI JS logic, you MUST strictly respect the ES6 Sandbox limits:
- **Blocked**: `async`, `fetch`, `Promise`, `window`, `document`, `setTimeout`, and all external I/O.
- **Allowed**: String methods (`.includes`), Array methods (`.map`, `.filter`), Math, and Regex.
- **Editable context**: Only `context.character.personality` and `context.character.scenario` can be mutated.
- **Memory Scanning**: Always use `context.chat.last_messages.slice(-X)` for multi-message progression rather than just `last_message`.


## The lenses (what to reason about)

**1. The flat archetype is a starting point, not a character.** "Brooding mercenary," "cold crime boss," "bubbly love interest" are *costumes*. The cliché is when nothing lives under them. Take the archetype the user offers and ask what's underneath — then hand back the more specific person.

**2. Want vs. need vs. fear.** The strongest characters are pulled three ways: what they consciously *want*, what they actually *need* (often the opposite), and what they're *afraid* of. Offer a few configurations and let the user pick the tension that has heat. The gap between want and need is where a character arc lives.

**3. One humanizing contradiction.** A single contradiction makes a character real without softening them: the ruthless boss who is genuinely tender with his dying mother; the saint with a streak of cruelty she hates in herself; the coward who is reckless about exactly one thing. Offer one — not a pile — and make it *specific*.

**4. The line they won't cross — and the one they already did.** Define a character by their limits. What won't they do, even cornered? And — quietly more interesting — what line did they *already* cross, that they can't take back and don't talk about? This single move converts "dark past" (cliché) into a specific, load-bearing wound.

**5. Defenses and tells.** People protect the soft thing. Humor, control, distance, aggression, over-helpfulness — offer how the character *deflects*, and what it's defending. The tell (what slips when the defense fails) is gold for downstream voice work.

**6. Dodge the backstory-as-explanation trap.** A tragic backstory is not characterization; it's trivia unless it shows up in present behavior. Push past "her parents died" to *how that operates now* — what she does because of it, what she can't do. Offer the behavior, not just the history.

**7. Relationship to {{user}} is a real motivation, not a default.** Resist "everyone orbits / serves / desires the protagonist." Ask what *this* character actually wants from {{user}} — to use them, test them, resist them, be saved by them, beat them — and let that be specific. (Where it turns romantic/physical, hand off to the Intimacy lens.)

## Works with

- **Intimacy & Dynamics lens** — interiority feeds why a character connects the way they do; load both when motivation turns toward desire or a relationship.
- **Appearance & Style lens** — the outside and the inside should agree (or deliberately clash); a character's bearing often *is* their defense made visible.
- **Cast & Voice lens** — this lens digs one character's interior; that one designs the ensemble and makes the interior audible as a voice fingerprint (the tell that slips when a defense fails is a voice feature). Load both when a cast member comes into focus.

## What to drop into `Brainstorm_Notes.md`

Leanings, never a locked profile:
- The want / need / fear configuration the user landed on (one line).
- The humanizing contradiction; the line they won't cross (and any they already did).
- How they relate to {{user}}, specifically.
- Set-aside directions, so they aren't lost.

Frame all of it as raw material. The Interviewer digs for the real wound; the Architect authors the psychology. You hand them a person with a pulse, not a costume.
