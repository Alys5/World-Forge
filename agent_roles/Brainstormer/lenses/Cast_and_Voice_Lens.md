# BRAINSTORMER LENS: CAST & VOICE
*An on-demand reference shelf for The Brainstormer — not an agent, not a phase, not an author.*

---

## What this is

One of the Brainstormer's **domain lenses**: craft grounding the Brainstormer pulls in when a brainstorm turns toward the cast *as an ensemble* — who belongs in this world, how they hang together, and how each of them *sounds*. It exists so the Brainstormer's "generate the cast" move (spec Section 3) produces a set of distinct, friction-bearing people instead of interchangeable satellites of `{{user}}` — and so per-character dialogue voice gets seeded early, where it's cheap, instead of flagged late by the Voice Auditor, where it's expensive.

This is the ensemble-level companion to the **Character Psychology & Motivation lens**: that one goes deep on a single character's interior; this one designs the *set* and each member's audible surface.

It is reference for the Brainstormer's own riffing. It is **not** a separate voice, **not** a seat the orchestrator dispatches, and **not** an author.

## When to load it

Load it when the brainstorm turns to the cast as a group — "who else is in here?", ensemble composition, who relates to whom — or to how a character *talks*. Ignore it otherwise; load the psychology lens alongside it when one member comes into individual focus.

## The bright line (read before using)

- **You generate cast candidates and voice leanings, never authored cards or locked example dialogue.** The **Architect (Phase 2)** authors the Tier 2 characters (and sandbox roster stat blocks); the **Voice Auditor (Phase 3.5)** tests voice fidelity downstream. Do not pre-write dialogue examples to lock, do not classify tiers.
- **Everything lands in `Brainstorm_Notes.md` as raw material / leanings.**
- **Offer the ensemble; don't demand one.** A two-hander, or a world of strangers, is a valid design — right-size the cast to the premise instead of imposing a roster. (The "not a contrarian" / dodge-but-offer stance, spec Section 2–3.)


**ES6 SANDBOX SCRIPTING CONSTRAINTS**: If your phase involves evaluating, compiling, or interacting with JanitorAI JS logic, you MUST strictly respect the ES6 Sandbox limits:
- **Blocked**: `async`, `fetch`, `Promise`, `window`, `document`, `setTimeout`, and all external I/O.
- **Allowed**: String methods (`.includes`), Array methods (`.map`, `.filter`), Math, and Regex.
- **Editable context**: Only `context.character.personality` and `context.character.scenario` can be mutated.
- **Memory Scanning**: Always use `context.chat.last_messages.slice(-X)` for multi-message progression rather than just `last_message`.


## The lenses (what to reason about)

**1. Cast by friction, not by role-slot.** "Best friend, love interest, mentor, rival" is a slot list, and slot-filled casts read like furniture. Build each candidate from what they *do to the premise's tension*: who opposes `{{user}}`, who complicates them, who tempts them, who mirrors them uncomfortably. The one-line hook the spec asks for (who they are + the tension they bring) comes from this — the tension half is the part that matters.

**2. Geometry: relationships among the cast, not just spokes to `{{user}}`.** The psychology lens catches "everyone orbits the protagonist" one character at a time; this is the same failure at ensemble scale. NPCs who want things *from each other* — owe each other, resent each other, protect each other — give the world scenes that don't need `{{user}}` in the room, and give the downstream aliveness machinery (standing goals, NPC-to-NPC dynamics) something real to run on. Sketch the strongest two or three edges between NPCs, not just the hub.

**3. Contrast pairs.** Set members against each other on a real axis — method, belief, temperament, what they'd sacrifice. The test: if two characters would react identically to the same event, one of them is redundant — merge them or split them apart. Deliberate contrast is also the cheapest differentiation there is; offer the axis, let the user pick the poles.

**4. Right-size the cast.** A few deeply-drawn characters beat many thin ones in an arc world; a sandbox can go wide, but at brainstorm altitude you're finding the *principals* — the handful worth full depth — not filling a roster (the principal/roster split is the Architect's job downstream). Offer the smallest cast that carries the tension, and expand only on appetite.

**5. Voice fingerprint — make each one audible.** For every character worth keeping, reach for the sound of them: **diction** (vocabulary, register — clipped or ornate, profane or precise), **rhythm** (short flat sentences vs. rolling clauses; who interrupts, who trails off), and one or two **verbal tics or signature moves** — plus the thing they'd *never* say. Sketch a sample line and ask if it sounds right — a taste beats a description (the excerpt move, spec Section 3). The working test is the blind-line test: strip the names off three characters' lines, and if the user can't tell who said what, the voices are homogenized. Voice is load-bearing all the way down the pipeline (it seeds the cards, and the Voice Auditor tests it), so distinct fingerprints seeded now are nearly free — and expensive to retrofit later.

**6. Voice from the person, not from a quirk pile.** A fingerprint should be the character's interior made audible — the defense, the education, the origin showing up in speech (the psychology lens's "defenses and tells" is gold here: the tell *is* a voice feature). An accent or a catchphrase bolted on at random says nothing — the same bolt-on failure as decorative kink in the intimacy lens. When a voice idea appears, ask what in the person produces it.

## Works with

- **Character Psychology & Motivation lens** — this lens designs the set and the audible surface; that one digs the interior. Load both when a cast member comes into individual focus — the interiority feeds the fingerprint (lens 6).
- **World & Factions lens** — factions come alive through the NPCs who front them; cast geometry often mirrors faction geometry.
- **Intimacy & Dynamics lens** — when a pairing inside the cast turns intimate or charged.
- **Appearance & Style lens** — a distinct look and a distinct voice are the same defense against an interchangeable cast; bearing is often the visible half of the fingerprint.

## What to drop into `Brainstorm_Notes.md`

Leanings, never locked cards or dialogue:
- Cast candidates with one-line hooks (who they are + the tension they bring), noting which few feel like principals.
- The relationship geometry worth keeping — the strongest NPC-to-NPC edges (who wants what from whom).
- A one-line voice fingerprint per character the user kept (diction / rhythm / tic — a sample line if one landed), flagged as leanings for the cards.
- **If a kept character overshares random *off-screen* pasts, or the world conjures an unnamed one-scene "temp cast,"** flag the **dice oracle** as a leaning (core spec Section 4) — the tool that fixes those facts before the model invents them into the same handful of defaults. A leaning only; you never author the tables.
- Set-aside candidates, so they aren't lost.

Frame all of it as raw material. The Interviewer digs into the ones that matter; the Architect authors the cards; the Voice Auditor holds the voices to what was promised.
