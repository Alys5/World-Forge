#!/usr/bin/env python3
"""Generic World Forge builder - compiles Drafts/ to Export/ for any world.

Usage: python tools/wf_build_world.py [<world_name>]

Auto-discovers world name from Drafts/ if not provided.
"""
import json
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Auto-discovery
# ---------------------------------------------------------------------------

def discover_world_name(base_dir: Path) -> str:
    """Auto-detect world name from Drafts directory structure."""
    drafts_root = base_dir / "Drafts"
    if not drafts_root.exists():
        raise RuntimeError(f"Drafts directory not found: {drafts_root}")

    for d in drafts_root.iterdir():
        if d.is_dir() and (d / "Tier1_World_Entries.md").exists():
            return d.name
    raise RuntimeError("Could not auto-detect world name from Drafts/*/Tier1_World_Entries.md")


def get_world_name() -> str:
    """Get world name from CLI arg or auto-discover."""
    if len(sys.argv) > 1:
        return sys.argv[1]
    return discover_world_name(Path.cwd())


# ---------------------------------------------------------------------------
# Configuration loading
# ---------------------------------------------------------------------------

def load_alias_extras(base_dir: Path, world_name: str) -> dict[str, list[str]]:
    """Load alias extras from world config file if it exists."""
    config_path = base_dir / "tools" / "world_configs" / f"{world_name}.json"
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        return config.get("alias_extras", {})
    return {}


def load_lorebook_config(base_dir: Path, world_name: str) -> list[tuple]:
    """Load lorebook configuration, overlaying explicit config on auto-discovery.

    Config file: tools/world_configs/<world_name>.json
    Returns list of (source_md, group, kind, single_display) tuples.

    Discovery still classifies every lorebook (the source of truth for which files
    exist). The optional `lorebook_configs` array overlays overrides keyed by
    `group` — e.g. forcing the Protagonist lorebook to `kind: "personas_only"`
    to emit a personas-only manifest (Compiler §7.7h) without re-listing every file.
    """
    drafts_dir = base_dir / "Drafts" / world_name
    discovered = discover_lorebooks(drafts_dir)

    config_path = base_dir / "tools" / "world_configs" / f"{world_name}.json"
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        overrides = {c["group"]: c for c in config.get("lorebook_configs", [])}
        if overrides:
            discovered = [
                (
                    src,
                    grp,
                    o.get("kind", knd) if (o := overrides.get(grp)) is not None else knd,
                    o.get("single_display", sd) if (o := overrides.get(grp)) is not None else sd,
                )
                for (src, grp, knd, sd) in discovered
            ]

    return discovered


def discover_lorebooks(drafts_dir: Path) -> list[tuple]:
    """Auto-discover lorebook files from Drafts directory.

    Returns list of (source_md, group, kind, single_display) tuples.
    """
    lorebooks = []

    # Tier 1 - World
    if (drafts_dir / "Tier1_World_Entries.md").exists():
        lorebooks.append(("Tier1_World_Entries.md", "World", None, None))

    # Tier 2 - Character entries, profiles, registers
    for md_file in sorted(drafts_dir.glob("Tier2_*_Entries.md")):
        name = md_file.stem.replace("Tier2_", "").replace("_Entries", "")
        kind = "npc" if name not in ("NPC_Roster", "NPC_Deep", "Protagonist", "User") else ("group" if name in ("NPC_Roster", "NPC_Deep") else "npc")
        single_display = None if name in ("NPC_Roster", "NPC_Deep", "Protagonist", "User") else name.replace("_", " ")
        lorebooks.append((md_file.name, name, kind, single_display))

    # Tier 2 - Intimacy profiles/registers
    for md_file in sorted(drafts_dir.glob("Tier2_*_Intimacy_Profile.md")):
        name = md_file.stem.replace("Tier2_", "").replace("_Intimacy_Profile", "")
        lorebooks.append((md_file.name, f"{name}_Intimacy_Profile", "npc", name.replace("_", " ")))

    if (drafts_dir / "Tier2_NPC_Intimacy_Roster.md").exists():
        lorebooks.append(("Tier2_NPC_Intimacy_Roster.md", "NPC_Intimacy_Roster", "npc", None))

    # Tier 3 - Arc/Sandbox entries
    for md_file in sorted(drafts_dir.glob("Tier3_*_Entries.md")):
        name = md_file.stem.replace("Tier3_", "").replace("_Entries", "")
        lorebooks.append((md_file.name, name, None, None))

    # Tier 3 - Intimacy register
    if (drafts_dir / "Tier3_Sandbox_Intimacy_Register.md").exists():
        lorebooks.append(("Tier3_Sandbox_Intimacy_Register.md", "Sandbox_Intimacy_Register", None, None))

    return lorebooks


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

META_KEYS = [
    "Category", "Trigger Keys", "Selective Logic", "Constant",
    "Injection Position", "Order Priority", "Position Rationale",
    "Selective", "ignoreBudget", "Depth",
]

# Inline revision markers (<!-- REVISED IN R3 -->) and any other HTML comments
# belong only in Drafts/, never in Export/ JSON (Compiler Foundational Rule 9 +
# validate_export.py). Strip them during transcription so the audit trail in the
# Drafts does not leak into the clean runtime prompt at export time.
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)

def strip_html_comments(text: str | None) -> str | None:
    """Remove <!-- ... --> comment spans (incl. inline revision markers)."""
    if not text:
        return text
    return HTML_COMMENT_RE.sub("", text).strip()


def slug(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")


def parse_int(s: str | None):
    if not s:
        return None
    m = re.search(r"-?\d+", s)
    return int(m.group()) if m else None


def parse_bool(s: str | None) -> bool:
    if not s:
        return False
    return s.strip().lower().startswith(("y", "t", "1"))


def parse_keys(s: str | None) -> list[str]:
    if not s:
        return []
    s2 = re.sub(r"\([^)]*\)", "", s)
    parts = [p.strip() for p in s2.split(",") if p.strip()]
    return [p for p in parts if p.lower() != "none"]


def canonical_name(comment: str) -> str:
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


def aspect_of(comment: str) -> str | None:
    m = re.match(r"^\[[^\]]+\]\s*/\s*(.+)$", comment.strip())
    if m:
        return m.group(1).strip()
    m = re.match(r"^[^—]+—\s*(.+)$", comment.strip())
    if m:
        return m.group(1).strip()
    return None


def facet_key(aspect: str | None) -> str | None:
    if not aspect:
        return None
    a = aspect.lower()
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

def parse_entries(md_path: Path) -> list[dict]:
    text = md_path.read_text(encoding="utf-8")
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


def make_entry(uid: int, comment: str, content: str, meta: dict, group: str, lb_tpl: dict) -> dict:
    content = strip_html_comments(content) or ""
    position = parse_int(meta.get("Injection Position")) or 1
    order = parse_int(meta.get("Order Priority")) or 100
    constant = parse_bool(meta.get("Constant"))
    selective_logic = parse_int(meta.get("Selective Logic")) or 0
    explicit_depth = parse_int(meta.get("Depth"))
    depth = explicit_depth if explicit_depth is not None else 4

    keys = [] if constant else parse_keys(meta.get("Trigger Keys"))

    ignore_budget = False
    if "ignoreBudget" in meta and parse_bool(meta["ignoreBudget"]):
        ignore_budget = True
    elif constant and position == 1 and not keys:
        ignore_budget = True

    e = dict(lb_tpl["entries"]["0"])
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

def build_npcs(entries_with_uid: list[tuple], single_display: str | None, alias_extras: dict) -> list[dict]:
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
            "aliases": sorted(set([display] + alias_extras.get(display, []))),
        }
        if facets:
            npc["facets"] = facets
        npcs.append(npc)
    return npcs


def build_manifest(internal_name: str, kind: str | None, entries_with_uid: list[tuple], single_display: str | None, alias_extras: dict) -> dict:
    # "personas_only" (Compiler §7.7h): the protagonist's Tier 2 lorebook carries a
    # personas-only manifest — npcs: [] with a valid kind ("npc"). This sidesteps the
    # legacy "no_manifest" sentinel, whose emitted kind was not in the contract enum.
    personas_only = (kind == "personas_only")
    npcs = []
    if kind and not personas_only:
        npcs = build_npcs(entries_with_uid, single_display, alias_extras)
    output_kind = "npc" if personas_only else (kind if kind else "world")
    return {
        "schema": 1,
        "lorebook": {"name": internal_name, "kind": output_kind},
        "personas": {"user": {"name": "{{user}}", "aliases": ["{{user}}"]}},
        "npcs": npcs,
    }


# ---------------------------------------------------------------------------
# Card parsing
# ---------------------------------------------------------------------------

def parse_card_markdown(text: str) -> dict:
    sections = {}
    current_section = None
    buffer = []
    
    # Check for frontmatter just in case
    lines = text.split("\n")
    in_fm = False
    for line in lines:
        if line.strip() == "---" and not sections and current_section is None:
            in_fm = not in_fm
            continue
        if in_fm:
            if ":" in line:
                k, v = line.split(":", 1)
                sections[k.strip()] = v.strip()
            continue
            
        m = re.match(r"^##\s+(.+)$", line)
        if m:
            if current_section:
                sections[current_section] = "\n".join(buffer).strip()
            current_section = m.group(1).strip().lower()
            buffer = []
        else:
            if current_section:
                buffer.append(line)
    
    if current_section:
        sections[current_section] = "\n".join(buffer).strip()

    return sections


def parse_tags(text: str | None) -> list[str] | None:
    """Parse a `## tags` body (comma- or newline-separated) into a tag list."""
    if not text:
        return None
    tags = []
    for part in re.split(r"[\n,]", text):
        t = part.strip()
        if t and t.lower() not in ("none", "tag1", "tag2", "tag3"):
            tags.append(t)
    # de-dupe preserving order
    seen = set()
    out = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out or None


def parse_instructions(text: str) -> dict:
    sections = {}
    cur = None
    buf = []
    for line in text.split("\n"):
        m = re.match(r"^#+\s+(.*)$", line)
        if m:
            if cur:
                sections[cur] = "\n".join(buf).strip()
            header = m.group(1).strip().lower()
            if header.startswith("system_prompt") or header.startswith("system prompt"):
                cur = "system_prompt"
            elif header.startswith("depth_prompt") or header.startswith("depth prompt"):
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


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    base_dir = Path.cwd()
    world_name = get_world_name()
    drafts_dir = base_dir / "Drafts" / world_name
    export_dir = base_dir / "Export" / world_name
    templates_dir = base_dir / "templates"

    if not drafts_dir.exists():
        print(f"Error: Drafts directory not found: {drafts_dir}")
        sys.exit(1)

    export_dir.mkdir(parents=True, exist_ok=True)

    # Load templates
    with open(templates_dir / "char_template.json", encoding="utf-8") as f:
        char_tpl = json.load(f)
    with open(templates_dir / "Lorebook_Template.json", encoding="utf-8") as f:
        lb_tpl = json.load(f)

    # Load world-specific config
    alias_extras = load_alias_extras(base_dir, world_name)
    lorebook_configs = load_lorebook_config(base_dir, world_name)

    print(f"Building world: {world_name}")
    print(f"Drafts: {drafts_dir}")
    print(f"Export: {export_dir}")

    # Build lorebooks
    for src_md, group, kind, single_display in lorebook_configs:
        src_path = drafts_dir / src_md
        if not src_path.exists():
            print(f"Warning: Source not found, skipping: {src_path}")
            continue

        internal_name = f"{world_name}_{group}_Lorebook" if kind else f"{world_name}_{group}_Lorebook"
        if "Intimacy_Profile" in group or "Intimacy_Register" in group:
            internal_name = f"{world_name}_{group}"

        parsed = parse_entries(src_path)
        entries_list = []
        entries_with_uid = []
        for uid, p in enumerate(parsed):
            e = make_entry(uid, p["comment"], p["content"], p["meta"], group, lb_tpl)
            entries_list.append(e)
            entries_with_uid.append((uid, p["comment"], p["content"]))

        if kind is not None:
            manifest = build_manifest(internal_name, kind, entries_with_uid, single_display, alias_extras)
            uid = len(entries_list)
            me = dict(lb_tpl["entries"]["0"])
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
            "description": lb_tpl.get("description", ""),
            "scan_depth": lb_tpl.get("scan_depth", 50),
            "token_budget": lb_tpl.get("token_budget", 2048),
            "recursive_scanning": lb_tpl.get("recursive_scanning", False),
            "extensions": lb_tpl.get("extensions", {}),
            "entries": {str(e["uid"]): e for e in entries_list},
        }
        out_path = export_dir / f"{internal_name}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Wrote {out_path.name} ({len(entries_list)} entries)")

    # Build character cards from Card_*.md files
    for card_md in sorted(drafts_dir.glob("Card_*.md")):
        char_key = card_md.stem.replace("Card_", "")
        fm = parse_card_markdown(card_md.read_text(encoding="utf-8"))

        inst_path = drafts_dir / f"Instructions_{char_key}.md"
        if not inst_path.exists():
            print(f"Warning: Instructions file not found for {char_key}, skipping")
            continue
        inst = parse_instructions(inst_path.read_text(encoding="utf-8"))

        display_name = fm.get("name", char_key.replace("_", " "))

        sp = strip_html_comments(inst.get("system_prompt", ""))
        ph = strip_html_comments(inst.get("post_history", ""))
        if not sp.startswith("{{original}}"):
            raise SystemExit(f"system_prompt missing {{original}} for {char_key}")
        if not ph.startswith("{{original}}"):
            raise SystemExit(f"post_history missing {{original}} for {char_key}")

        card = json.loads(json.dumps(char_tpl))
        card["name"] = display_name
        card["data"]["name"] = display_name
        for field in ("description", "personality", "scenario", "first_mes", "mes_example", "orientation"):
            if fm.get(field):
                card["data"][field] = strip_html_comments(fm[field])

        # Per-card tags: override template defaults when the draft declares them.
        draft_tags = parse_tags(fm.get("tags"))
        if draft_tags:
            card["data"]["tags"] = draft_tags

        # Per-card style_override: read a JSON object from `## style_override`.
        style_override = None
        so_raw = fm.get("style_override")
        if so_raw:
            try:
                style_override = json.loads(so_raw)
            except json.JSONDecodeError as e:
                raise SystemExit(
                    f"style_override for {char_key} is not valid JSON: {e}"
                )

        card["data"]["system_prompt"] = sp
        card["data"]["post_history_instructions"] = ph
        card["data"]["extensions"] = {
            "depth_prompt": {
                "prompt": strip_html_comments(inst.get("depth_prompt", "")),
                "depth": 4,
                "role": "system",
            },
            "world_forge": {"style_override": style_override},
        }
        out_path = export_dir / f"{char_key}_Card.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(card, f, ensure_ascii=False, indent=4)
        print(f"Wrote {out_path.name}")

    # Copy User.md and other markdown files byte-for-byte
    for copy_file in ("User.md", "User_Alyssa.md"):
        src = drafts_dir / copy_file
        if src.exists():
            dst = export_dir / copy_file
            dst.write_bytes(src.read_bytes())
            print(f"Copied {copy_file}")

    # Generate JanitorAI profile
    import subprocess
    print("Generating JanitorAI profile...")
    subprocess.run([sys.executable, str(base_dir / "tools" / "build_janitor_profile.py"), world_name], check=True)
    
    print("Done.")


if __name__ == "__main__":
    main()