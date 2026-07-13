import os
import re
import json

d = r'd:\World-Forge\Drafts\SvartulfrVerse_Urban'

# --- WORLD DIRECTOR ---
wd_path = os.path.join(d, 'Card_WorldDirector.md')
with open(wd_path, 'r', encoding='utf-8') as f:
    wd = f.read()

new_first_mes = '''*The golden Californian sun poured over the manicured lawns of the Seven Hills Villa, an idyllic picture of billionaire tranquility. Of course, inside the estate, things were operating at their usual terrifying frequency.*
*You had barely made it through the front doors after your pre-med labs when Noah intercepted you. "Cupcake," he beamed, his 'Golden Boy' charisma operating at maximum capacity as he slid a pristine, limited-edition Prada gift bag onto the marble console. "Don't even look at the receipt. Just know it matches your eyes, and I expect you to wear it to dinner. Oh, and try this mirror-glaze, I spent four hours tempering it because the ambient humidity was driving me insane." He held out a meticulously crafted pastry on a silver fork.*
*Before you could answer, a loud, heavy THUD echoed from the second-floor landing. Jasper dropped down from the indoor balcony in a perfect parkour roll, his oversized hoodie swallowing his frame. Faint punk music bled from the headphones around his neck. "Now Playing: 'Total System Failure'," Jasper announced dryly, snatching the pastry right off Noah's fork and eating it in one bite. "I just bricked the South Wing's security cameras. You have a twenty-minute window before Dad's IT guys figure it out. You're welcome."*
*"I will literally kill you," Noah snarled, his eyes flashing a dangerous, feral amber as his Delta instincts violently flared over the stolen pastry.*
*In the corner of the room, Malachia simply crossed his massive, heavily-scarred arms over his chest, watching the chaos with brooding, silent detachment. He let out a low, rumbling sigh that rattled the floorboards.*
*Then, the heavy oak doors of the home office swung open.*
*Erik Douglas stepped out. He looked like the picture-perfect LA Dad—wearing a pastel-blue polo shirt, expensive sunglasses resting on his head, and a terrifyingly radiant smile. In his left hand, he held a crystal glass of green detox juice. In his right hand, he was casually eating from a completely raw, bloody ribeye steak.*
*"Boys! What an incredible display of kinetic energy!" Erik announced, his deep, authoritative voice booming through the foyer. The sheer, oppressive weight of his Prime Alpha aura washed over the room, instantly forcing Noah and Jasper to freeze in their tracks. "But let's pivot this ecosystem toward some family synergy, okay? Sweetheart," Erik turned his sharp, golden eyes toward you, his smile never wavering, "I noticed your heart rate spiked on your biometric tracker during chemistry class. I've already bought the science department and fired the professor. We're getting you a private tutor. Now... who wants to tell me why the South Wing cameras just went dark?"*
*The Golden Cage was officially closed for the evening. What do you do?*'''

new_first_mes_escaped = json.dumps(new_first_mes)

wd = re.sub(r'first_mes:\s*".*?"(?=\nmes_example|\n---)', lambda m: f'first_mes: {new_first_mes_escaped}', wd, flags=re.DOTALL)

with open(wd_path, 'w', encoding='utf-8') as f:
    f.write(wd)

print("World Director updated.")
