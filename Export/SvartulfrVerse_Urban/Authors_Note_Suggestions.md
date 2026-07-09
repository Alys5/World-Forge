# Author's Note Suggestions — SvartulfrVerse_Urban

A short, player-facing steering menu. The Author's Note is a *transient*, per-chat lever you paste into SillyTavern's Author's Note panel to nudge a scene in the moment. It ships with nothing and is set by hand.

## Using the Author's Note to steer a scene

The Author's Note is a short instruction *you* add inside SillyTavern, separate from this world's files. It is temporary and per-chat — it is not part of the world package, and you turn it on, change it, or clear it whenever you like.

**Where:** open the **Author's Note** panel (the Extensions menu, or the pushpin icon above the chat box).

**Recommended settings:** Position **In-chat @ Depth**, Depth **4**, Role **System**. This drops the note in near the end of the context, where the model weights it heavily, on every turn. Push harder by lowering the depth toward **2**; soften a heavy-handed note by raising the **interval** so it only re-injects every few messages.

**Keep it short and directive** — one or two present-tense sentences. Macros like `{{char}}` and `{{user}}` work. When the moment passes, rewrite or clear it.

---

## World-tuned example notes

### Pace / scene-hold
**When:** a scene is rushing toward a conclusion you want to savor.
**Paste this as your Author's Note:**
[Stay in this moment. Don't skip ahead or summarize — let the exchange play out beat by beat, one small move at a time.]

### Tonal register dial
**When:** the prose has gone flat or too serious and you want the world's comedic contrast back.
**Paste this as your Author's Note:**
[Lean into comedy through contrast — let the supernatural intensity land on something utterly mundane, and keep the family's love readable through the chaos.]

### NPC agency push
**When:** the family or the cold war should act on its own without waiting on {{user}}.
**Paste this as your Author's Note:**
[Erik is micromanaging {{user}}'s environment right now; have him deploy a drone or run a background check on someone present rather than waiting on {{user}} to act.]

### Refocus (cold-war edge)
**When:** the scene has drifted and you want the Paradise-cusp tension back.
**Paste this as your Author's Note:**
[The wolf/vampire cold war is humming at the Paradise cusp this scene — let a vampire-court presence or a Tactical Cleansing threat brush the moment without erupting.]

### Intimacy pacing (within established bounds)
**When:** an intimate beat is moving too fast for the character's established register.
**Paste this as your Author's Note:**
[Keep the intimacy slow and character-true — dwell on presence and restraint, never widen what the character's profile already permits.]

---

## What not to use it for

The Author's Note is for *transient* steering only. Anything you want to be permanent — a character's identity, a standing world rule, a persistent tonal mandate, the AnyPOV boundaries — belongs in the world package (and is already there), not in an Author's Note. A note that fights the cards or lorebooks just produces conflicting instructions and unpredictable behavior. Rewrite or clear the note when the moment passes.
