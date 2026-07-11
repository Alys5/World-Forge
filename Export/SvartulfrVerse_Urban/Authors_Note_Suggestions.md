# Author's Note Suggestions: SvartulfrVerse Urban

> **Using the Author's Note to steer a scene**
>
> The Author's Note is a short instruction *you* add inside SillyTavern, separate from this world's files. It is temporary and per-chat — it is not part of the world package, and you turn it on, change it, or clear it whenever you like.
>
> **Where:** open the **Author's Note** panel (the Extensions menu, or the pushpin icon above the chat box).
>
> **Recommended settings:** Position **In-chat @ Depth**, Depth **4**, Role **System**. This drops the note in near the end of the context, where the model weights it heavily, on every turn. Push harder by lowering the depth toward **2**; soften a heavy-handed note by raising the **interval** so it only re-injects every few messages.
>
> **Keep it short and directive** — one or two present-tense sentences. Macros like `{{char}}` and `{{user}}` work. When the moment passes, rewrite or clear it.

---

### Scene Hold & Pacing
**When:** The model tries to resolve an argument, skip a tense encounter, or summarize {{user}}'s class/job before the family can interrupt.
**Paste this as your Author's Note:**
`[Stay in this exact moment. Do not skip ahead or summarize. Let the exchange play out beat by beat without resolving the tension.]`

### Tonal Register Dial (Comedic Overprotection)
**When:** The scene feels too generic or mundane, and you want to trigger the family's extreme tactical paranoia.
**Paste this as your Author's Note:**
`[Emphasize the comedic contrast: {{user}} is trying to do something completely mundane while the Douglas-Bloodmoon family reacts with terrifying, life-or-death tactical overprotectiveness.]`

### NPC Agency Push
**When:** The family members are just standing around waiting for {{user}} to speak, or not engaging in their own affairs.
**Paste this as your Author's Note:**
`[Erik, Malachia, Noah, and Jasper are actively pursuing their own goals or pack business right now; have them act on it and talk to each other rather than waiting on {{user}}.]`

### Refocus on Parallel Action
**When:** You are separated from the family and the model forgets to write the 4-way split cutaways.
**Paste this as your Author's Note:**
`[Insert a brief cutaway showing what Erik, Malachia, Noah, or Jasper are doing right now while {{user}} is absent.]`

### Intimacy Pacing (Thematic Focus)
**When:** An intimate scene is rushing toward physical completion without honoring the psychological stakes (e.g., control vs surrender).
**Paste this as your Author's Note:**
`[Slow the physical pacing down. Focus deeply on the psychological power dynamic, the breath, the physical weight, and the precise sensory details before advancing.]`

---

### What NOT to use the Author's Note for
The Author's Note is for *transient* steering only. Anything you want to be permanent — a character's identity, a standing world rule (like the LSE Pack Code), a permanent tonal shift — belongs in the world package (cards and lorebooks), which is already configured for SvartulfrVerse. A note that fights the cards or lorebooks just produces conflicting instructions and unpredictable behavior. Rewrite or clear the note when the moment passes.
