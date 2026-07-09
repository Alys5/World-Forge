import os, json, re

EXPORT = r"D:\World-Forge\Export\SvartulfrVerse_Urban"
errors = []
warns = []

SNAKE = ["case_sensitive", "match_whole_words", "use_regex",
         "characterFilterNames", "characterFilterExclude", "enabled"]

def check_lb(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    entries = data.get("entries", {})
    # key/uid parity
    for k, e in entries.items():
        if str(e["uid"]) != k:
            errors.append(f"{os.path.basename(path)}: key {k} != uid {e['uid']}")
        for sk in SNAKE:
            if sk in e:
                errors.append(f"{os.path.basename(path)} uid {e['uid']}: snake field {sk}")
        # displayIndex == uid
        if "displayIndex" in e and e["displayIndex"] != e["uid"]:
            errors.append(f"{os.path.basename(path)} uid {e['uid']}: displayIndex {e['displayIndex']}")
    # manifest checks
    for k, e in entries.items():
        if isinstance(e.get("comment"), str) and e["comment"].startswith("[[NPC_MANIFEST]]"):
            if not e.get("disable"):
                errors.append(f"{os.path.basename(path)} manifest not disable:true")
            try:
                m = json.loads(e["content"])
            except Exception as ex:
                errors.append(f"{os.path.basename(path)} manifest not JSON: {ex}")
                continue
            if m.get("schema") != 1:
                errors.append(f"{os.path.basename(path)} manifest schema != 1")
            ids = [n["id"] for n in m.get("npcs", [])]
            if len(ids) != len(set(ids)):
                errors.append(f"{os.path.basename(path)} manifest duplicate npc ids")
            # facets resolve
            uids = set(e2["uid"] for e2 in entries.values())
            for n in m.get("npcs", []):
                for fk, fuid in n.get("facets", {}).items():
                    if fuid not in uids:
                        errors.append(f"{os.path.basename(path)} npc {n['id']} facet {fk} -> missing uid {fuid}")

def check_card(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    d = data["data"]
    if not d.get("system_prompt", "").startswith("{{original}}"):
        errors.append(f"{os.path.basename(path)} system_prompt missing {{original}}")
    if not d.get("post_history_instructions", "").startswith("{{original}}"):
        errors.append(f"{os.path.basename(path)} post_history missing {{original}}")
    if "depth_prompt" not in d.get("extensions", {}):
        errors.append(f"{os.path.basename(path)} missing depth_prompt")
    else:
        dp = d["extensions"]["depth_prompt"]
        if not isinstance(dp, dict) or "prompt" not in dp or "depth" not in dp or "role" not in dp:
            errors.append(f"{os.path.basename(path)} depth_prompt malformed")
    if "world_forge" not in d.get("extensions", {}):
        errors.append(f"{os.path.basename(path)} missing world_forge")
    elif "style_override" not in d["extensions"]["world_forge"]:
        errors.append(f"{os.path.basename(path)} missing world_forge.style_override")

# positions
def pos_check(path, expected):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    for k, e in data.get("entries", {}).items():
        if k.startswith("[[") or (isinstance(e.get("comment"), str) and e["comment"].startswith("[[NPC_MANIFEST]]")):
            continue
        if e["position"] != expected:
            errors.append(f"{os.path.basename(path)} uid {e['uid']} pos {e['position']} != {expected} ({e.get('comment')})")

for fn in os.listdir(EXPORT):
    p = os.path.join(EXPORT, fn)
    if fn.endswith(".json"):
        if "Card" in fn:
            check_card(p)
        else:
            check_lb(p)

# mojibake
for root, _, files in os.walk(EXPORT):
    for fn in files:
        if fn.endswith((".json", ".md", ".html", ".js")):
            with open(os.path.join(root, fn), encoding="utf-8") as f:
                c = f.read()
            for mk in ["â€", "Ã", "â€™"]:
                if mk in c:
                    errors.append(f"{fn}: mojibake {mk}")

# position spot checks (file-agnostic)
WORLD_LB = os.path.join(EXPORT, "SvartulfrVerse_Urban_World_Lorebook.json")
SANDBOX_LB = os.path.join(EXPORT, "SvartulfrVerse_Urban_Sandbox_Lorebook.json")
SANDBOX_REG = os.path.join(EXPORT, "SvartulfrVerse_Urban_Sandbox_Intimacy_Register.json")

# Tier 1 world -> position 0
with open(WORLD_LB, encoding="utf-8") as f:
    wl = json.load(f)
for e in wl["entries"].values():
    if e["position"] != 0:
        errors.append(f"World_Lorebook uid {e['uid']} pos {e['position']} != 0")

# All other lorebooks (except sandbox pair) -> Tier2/intimacy entries position 1
for fn in os.listdir(EXPORT):
    if not fn.endswith(".json"):
        continue
    if fn in ("SvartulfrVerse_Urban_World_Lorebook.json",
              "SvartulfrVerse_Urban_Sandbox_Lorebook.json",
              "SvartulfrVerse_Urban_Sandbox_Intimacy_Register.json"):
        continue
    if "Card" in fn:
        continue
    with open(os.path.join(EXPORT, fn), encoding="utf-8") as f:
        ld = json.load(f)
    if "entries" not in ld:
        continue
    for e in ld["entries"].values():
        if isinstance(e.get("comment"), str) and e["comment"].startswith("[[NPC_MANIFEST]]"):
            if e["position"] != 1:
                errors.append(f"{fn} manifest pos {e['position']} != 1")
            continue
        if e["position"] != 1:
            errors.append(f"{fn} uid {e['uid']} pos {e['position']} != 1 ({e.get('comment')})")

# SANDBOX_STATE / WORLD_PULSE specifics
with open(os.path.join(EXPORT, "SvartulfrVerse_Urban_Sandbox_Lorebook.json"), encoding="utf-8") as f:
    sb = json.load(f)
for e in sb["entries"].values():
    c = e.get("comment", "")
    if c == "SANDBOX_STATE":
        if not (e["constant"] and e["position"] == 1 and e["ignoreBudget"] and e["key"] == []):
            errors.append("SANDBOX_STATE flags wrong")
    if c.startswith("WORLD_PULSE"):
        if e["position"] != 4:
            errors.append(f"{c} position {e['position']} != 4")

if errors:
    print("FAILURES:")
    for e in errors:
        print("  -", e)
else:
    print("ALL GATES PASSED")
print(f"Total files checked: {len([f for f in os.listdir(EXPORT) if f.endswith(('.json','.md','.html','.js'))])}")
