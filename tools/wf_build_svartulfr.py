import os
import re
import json

WORLD = "SvartulfrVerse_Urban"
BASE = os.getcwd()
DRAFTS = os.path.join(BASE, "Drafts", WORLD)
EXPORT = os.path.join(BASE, "Export", WORLD)
TEMPLATES = os.path.join(BASE, "templates")

with open(os.path.join(TEMPLATES, "char_template.json"), encoding="utf-8") as f:
    CHAR_TPL = json.load(f)
with open(os.path.join(TEMPLATES, "Lorebook_Template.json"), encoding="utf-8") as f:
    LB_TPL = json.load(f)

os.makedirs(EXPORT, exist_ok=True)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

META_KEYS = [
    "Category", "Trigger Keys", "Selective Logic", "Constant",
    "Injection Position", "Order Priority", "Position Rationale",
    "Selective", "ignoreBudget", "Depth",
]


def slug(name):
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")


def parse_int(s):
    if not s:
        return None
    m = re.search(r"-?\d+", s)
    return int(m.group()) if m else None


def parse_bool(s):
    if not s:
        return False
    return s.strip().lower().startswith(("y", "t", "1"))


def parse_keys(s):
    if not s:
        return []
    s2 = re.sub(r"\([^)]*\)", "", s)
    parts = [p.strip() for p in s2.split(",") if p.strip()]
    parts = [p for p in parts if p.lower() != "none"]
    return parts


def canonical_name(comment):
    c = comment.strip()
    if c.startswith("NPC_INTIMACY:"):
        return c[len("NPC_INTIMACY:"):].strip()
    m = re.match(r"^\[([^\]]+)\]\s*/\s*(.+)$", c)
    if m:
        return m.group(1).strip()
    m = re.match(r"^[^—]+—\s*(.+)$", c)
    if m:
        return m.group(1).strip()
    if c.startswith("NPC — "):
        return c[len("NPC — "):].strip()
    return c.strip()


def aspect_of(comment):
    m = re.match(r"^\[[^\]]+\]\s*/\s*(.+)$", comment.strip())
    if m:
        return m.group(1).strip()
    m = re.match(r"^[^—]+—\s*(.+)$", comment.strip())
    if m:
        return m.group(1).strip()
    return None


def facet_key(aspect):
    a = (aspect or "").lower()
    if "standing goal" in a:
        return "standingGoal"
    if "physical" in a and "psycholog" in a:
        return "combined"
    if "psycholog" in a:
        return "psychological"
    if "physical" in a or "appearance" in a:
        return "physical"
    return None


# ---------------------------------------------------------------------------
# Lorebook entry parser
# ---------------------------------------------------------------------------

def parse_entries(md_path):
    with open(md_path, encoding="utf-8") as f:
        text = f.read()
    blocks = text.split("### ENTRY:")
    out = []
    for b in blocks:
        b = b.strip()
        if not b:
            continue
        lines = b.split("\n")
        comment = lines[0].strip()
        meta = {}
        content_start = len(lines)
        for i in range(1, len(lines)):
            ls = lines[i].strip()
            m = re.match(r"^\*\*([A-Za-z][A-Za-z ]*?):\*\*\s*(.*)$", ls)
            if not m:
                continue
            key = m.group(1).strip()
            val = m.group(2).strip()
            if key == "Content":
                content_start = i + 1
                break
            if key in META_KEYS:
                meta[key] = val
                content_start = i + 1
        content = "\n".join(lines[content_start:]).strip()
        content = content.strip("-\n ").strip()
        if not meta and not content:
            continue
        out.append({"comment": comment, "meta": meta, "content": content})
    return out


def make_entry(uid, comment, content, meta, group):
    position = parse_int(meta.get("Injection Position"))
    position = position if position is not None else 1
    order = parse_int(meta.get("Order Priority"))
    order = order if order is not None else 100
    constant = parse_bool(meta.get("Constant"))
    selective_logic = parse_int(meta.get("Selective Logic"))
    selective_logic = selective_logic if selective_logic is not None else 0
    explicit_depth = parse_int(meta.get("Depth"))
    depth = explicit_depth if explicit_depth is not None else 4

    if constant:
        keys = []
    else:
        keys = parse_keys(meta.get("Trigger Keys", ""))

    ignore_budget = False
    if "ignoreBudget" in meta and parse_bool(meta["ignoreBudget"]):
        ignore_budget = True
    elif constant and position == 1 and not keys:
        ignore_budget = True

    e = dict(LB_TPL["entries"]["0"])
    e.update({
        "uid": uid,
        "comment": comment,
        "key": keys,
        "selectiveLogic": selective_logic,
        "content": content,
        "position": position,
        "order": order,
        "depth": depth,
        "role": 0,
        "selective": True,
        "constant": constant,
        "ignoreBudget": ignore_budget,
        "group": group,
        "displayIndex": uid,
        "useProbability": False,
        "probability": 100,
        "disable": False,
        "addMemo": True,
    })
    return e


# ---------------------------------------------------------------------------
# Manifest builder
# ---------------------------------------------------------------------------

ALIAS_EXTRAS = {
    "Jasper Douglas-Bloodmoon": ["Jasper", "DJ Frequency"],
    "Erik Douglas": ["Erik", "Dad", "Patriarch"],
    "Malachia Douglas-Bloodmoon": ["Malachia"],
    "Noah Douglas-Bloodmoon": ["Noah"],
    "Visconte Angelo Moreno": ["Angelo", "Moreno", "Visconte", "Eidolon"],
    "Wulfnic Bloodmoon": ["Wulfnic", "afi"],
    "Kaladin Nargathon": ["Kaladin"],
    "Mac Sanchez-Rogers": ["Mac"],
    "Mihaela Fade Greymoor": ["Fade", "Mihaela"],
    "Logan Douglas": ["Logan"],
    "Marcus Thornfield": ["Marcus"],
    "Vito Marino": ["Vito"],
    "Grave Mistake": ["Grave Mistake", "Grave"],
    "District Alphas": ["District Alphas", "District"],
    "Ut & Zefir": ["Ut", "Zefir"],
}


def build_npcs(entries_with_uid, single_display):
    if single_display:
        groups = {single_display: list(entries_with_uid)}
    else:
        groups = {}
        for uid, comment, content in entries_with_uid:
            cn = canonical_name(comment)
            groups.setdefault(cn, []).append((uid, comment, content))
    npcs = []
    for display, items in groups.items():
        facets = {}
        for uid, comment, content in items:
            fk = facet_key(aspect_of(comment))
            if fk:
                facets[fk] = uid
        npc = {
            "id": slug(display),
            "displayName": display,
            "aliases": sorted(set([display] + ALIAS_EXTRAS.get(display, []))),
        }
        if facets:
            npc["facets"] = facets
        npcs.append(npc)
    return npcs


def build_manifest(internal_name, kind, entries_with_uid, single_display):
    npcs = []
    if kind != "no_manifest" and kind is not None:
        if single_display is None:
            npcs = build_npcs(entries_with_uid, None)
        else:
            npcs = build_npcs(entries_with_uid, single_display)
    manifest = {
        "schema": 1,
        "lorebook": {"name": internal_name, "kind": kind if kind else "world"},
        "personas": {"user": {"name": "{{user}}", "aliases": ["{{user}}"]}},
        "npcs": npcs,
    }
    return manifest


# ---------------------------------------------------------------------------
# Lorebook config
# (internal_name, source_md, group, kind, single_display or None)
# ---------------------------------------------------------------------------

LOREBOOKS = [
    ("SvartulfrVerse_Urban_World_Lorebook", "Tier1_World_Entries.md", "World", None, None),
    ("SvartulfrVerse_Urban_Jasper_Lorebook", "Tier2_Jasper_Entries.md", "Jasper", "npc", "Jasper Douglas-Bloodmoon"),
    ("SvartulfrVerse_Urban_Erik_Lorebook", "Tier2_Erik_Entries.md", "Erik", "npc", "Erik Douglas"),
    ("SvartulfrVerse_Urban_Malachia_Lorebook", "Tier2_Malachia_Entries.md", "Malachia", "npc", "Malachia Douglas-Bloodmoon"),
    ("SvartulfrVerse_Urban_Noah_Lorebook", "Tier2_Noah_Entries.md", "Noah", "npc", "Noah Douglas-Bloodmoon"),
    ("SvartulfrVerse_Urban_User_Lorebook", "Tier2_User_Entries.md", "User", "npc", None),
    ("SvartulfrVerse_Urban_NPC_Roster_Lorebook", "Tier2_NPC_Roster_Entries.md", "NPC_Roster", "group", None),
    ("SvartulfrVerse_Urban_Angelo_Lorebook", "Tier2_Angelo_Entries.md", "Angelo", "npc", "Visconte Angelo Moreno"),
    ("SvartulfrVerse_Urban_Wulfnic_Lorebook", "Tier2_Wulfnic_Entries.md", "Wulfnic", "npc", "Wulfnic Bloodmoon"),
    ("SvartulfrVerse_Urban_Sandbox_Lorebook", "Tier3_Sandbox_Entries.md", "Sandbox", None, None),
    ("SvartulfrVerse_Urban_Kaladin_Intimacy_Profile", "Tier2_Kaladin_Intimacy_Profile.md", "Kaladin_Intimacy_Profile", "npc", "Kaladin Nargathon"),
    ("SvartulfrVerse_Urban_Jasper_Intimacy_Profile", "Tier2_Jasper_Intimacy_Profile.md", "Jasper_Intimacy_Profile", "npc", "Jasper Douglas-Bloodmoon"),
    ("SvartulfrVerse_Urban_Erik_Intimacy_Profile", "Tier2_Erik_Intimacy_Profile.md", "Erik_Intimacy_Profile", "npc", "Erik Douglas"),
    ("SvartulfrVerse_Urban_Noah_Intimacy_Profile", "Tier2_Noah_Intimacy_Profile.md", "Noah_Intimacy_Profile", "npc", "Noah Douglas-Bloodmoon"),
    ("SvartulfrVerse_Urban_Malachia_Intimacy_Profile", "Tier2_Malachia_Intimacy_Profile.md", "Malachia_Intimacy_Profile", "npc", "Malachia Douglas-Bloodmoon"),
    ("SvartulfrVerse_Urban_NPC_Intimacy_Roster", "Tier2_NPC_Intimacy_Roster.md", "NPC_Intimacy_Roster", "npc", None),
    ("SvartulfrVerse_Urban_Sandbox_Intimacy_Register", "Tier3_Sandbox_Intimacy_Register.md", "Sandbox_Intimacy_Register", None, None),
]


def write_lorebook(internal_name, source_md, group, kind, single_display):
    md_path = os.path.join(DRAFTS, source_md)
    parsed = parse_entries(md_path)
    entries_list = []
    entries_with_uid = []
    for uid, p in enumerate(parsed):
        e = make_entry(uid, p["comment"], p["content"], p["meta"], group)
        entries_list.append(e)
        entries_with_uid.append((uid, p["comment"], p["content"]))

    if kind is not None:
        manifest = build_manifest(internal_name, kind, entries_with_uid, single_display)
        uid = len(entries_list)
        me = dict(LB_TPL["entries"]["0"])
        me.update({
            "uid": uid,
            "comment": f"[[NPC_MANIFEST]] {internal_name} NPC Memory index",
            "key": [],
            "selectiveLogic": 0,
            "content": json.dumps(manifest, ensure_ascii=False),
            "position": 1,
            "order": 0,
            "depth": 4,
            "role": 0,
            "selective": True,
            "constant": False,
            "ignoreBudget": False,
            "disable": True,
            "addMemo": True,
            "group": group,
            "displayIndex": uid,
            "useProbability": False,
            "probability": 100,
        })
        entries_list.append(me)

    data = {
        "name": internal_name,
        "description": LB_TPL.get("description", ""),
        "scan_depth": LB_TPL.get("scan_depth", 50),
        "token_budget": LB_TPL.get("token_budget", 2048),
        "recursive_scanning": LB_TPL.get("recursive_scanning", False),
        "extensions": LB_TPL.get("extensions", {}),
        "entries": {str(e["uid"]): e for e in entries_list},
    }
    out_path = os.path.join(EXPORT, internal_name + ".json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"Wrote {internal_name}.json ({len(entries_list)} entries)")


# ---------------------------------------------------------------------------
# Cards
# ---------------------------------------------------------------------------

def parse_card_frontmatter(text):
    lines = text.split("\n")
    fm_start = None
    for i, l in enumerate(lines):
        if l.strip() == "---":
            fm_start = i
            break
    fm_end = None
    for i in range(fm_start + 1, len(lines)):
        if lines[i].strip() == "---":
            fm_end = i
            break
    fm = {}
    if fm_start is None or fm_end is None:
        return fm
    for line in lines[fm_start + 1:fm_end]:
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip()
    return fm


def parse_instructions(text):
    sections = {}
    cur = None
    buf = []
    for line in text.split("\n"):
        m = re.match(r"^#\s+(.*)$", line)
        if m:
            if cur:
                sections[cur] = "\n".join(buf).strip()
            header = m.group(1).strip().lower()
            if header.startswith("system_prompt"):
                cur = "system_prompt"
            elif header.startswith("depth_prompt"):
                cur = "depth_prompt"
            elif header.startswith("post") or header.startswith("post-history"):
                cur = "post_history"
            else:
                cur = None
            buf = []
        else:
            if cur is not None:
                buf.append(line)
    if cur:
        sections[cur] = "\n".join(buf).strip()
    return sections


def write_card(card_md, display_name):
    char = card_md.replace("Card_", "").replace(".md", "")
    md_path = os.path.join(DRAFTS, card_md)
    with open(md_path, encoding="utf-8") as f:
        fm = parse_card_frontmatter(f.read())

    inst_path = os.path.join(DRAFTS, f"Instructions_{char}.md")
    with open(inst_path, encoding="utf-8") as f:
        inst = parse_instructions(f.read())

    card = json.loads(json.dumps(CHAR_TPL))
    card["name"] = display_name
    card["data"]["name"] = display_name
    for field in ("description", "personality", "scenario", "first_mes", "mes_example"):
        if fm.get(field):
            card["data"][field] = fm[field]

    sp = inst.get("system_prompt", "")
    ph = inst.get("post_history", "")
    if not sp.startswith("{{original}}"):
        raise SystemExit(f"system_prompt missing {{original}} for {char}")
    if not ph.startswith("{{original}}"):
        raise SystemExit(f"post_history missing {{original}} for {char}")
    card["data"]["system_prompt"] = sp
    card["data"]["post_history_instructions"] = ph
    card["data"]["extensions"] = {
        "depth_prompt": {
            "prompt": inst.get("depth_prompt", ""),
            "depth": 4,
            "role": "system",
        },
        "world_forge": {"style_override": None},
    }
    out_path = os.path.join(EXPORT, f"{char}_Card.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(card, f, ensure_ascii=False, indent=4)
    print(f"Wrote {char}_Card.json")


# ---------------------------------------------------------------------------
# Byte-for-byte copies
# ---------------------------------------------------------------------------

def copy_binary(src_name, dst_name):
    src = os.path.join(DRAFTS, src_name)
    dst = os.path.join(EXPORT, dst_name)
    with open(src, "rb") as f:
        data = f.read()
    with open(dst, "wb") as f:
        f.write(data)
    print(f"Copied {src_name} -> {dst_name}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    for internal_name, src, group, kind, single in LOREBOOKS:
        write_lorebook(internal_name, src, group, kind, single)

    write_card("Card_Jasper.md", "Jasper Douglas-Bloodmoon")
    write_card("Card_Erik.md", "Erik Douglas")
    write_card("Card_Malachia.md", "Malachia Douglas-Bloodmoon")
    write_card("Card_Noah.md", "Noah Douglas-Bloodmoon")

    copy_binary("User.md", "User.md")
    copy_binary("JanitorAI_Profile_Group.md", f"{WORLD}_JanitorAI.md")
    print("Done.")


if __name__ == "__main__":
    main()
