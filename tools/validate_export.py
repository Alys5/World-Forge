#!/usr/bin/env python3
"""Read-only validator for World Forge Export/ JSON packages.

Checks the failure modes that slip past "the JSON parses":

  all .json   - strict UTF-8 decode (catches UTF-16 / wrong-encoding writes)
              - mojibake markers ("a-circumflex-euro" / stray "A-tilde" sequences left by
                a Windows-1252 round-trip of em-dashes and curly quotes)
              - strict json.loads parse
  cards       - data.system_prompt and data.post_history_instructions begin with
                {{original}} on its own line
              - data.extensions.depth_prompt structure present
              - data.extensions.world_forge.style_override present (null or 7-key object)
  lorebooks   - every entry's position is an integer in 0..7
              - atDepth (position 4) entries carry an integer depth
              - uid values unique within the file
              - every entry's object key equals String(uid) (ST renders entries via
                entries[uid]; mismatched keys import but never show in the GUI)
              - no snake_case/legacy alias fields (case_sensitive, match_whole_words,
                use_regex, characterFilterNames, characterFilterExclude) - native World
                Info uses camelCase and the characterFilter object
              - any [[NPC_MANIFEST]] entry (NPC Memory Contract): at most one per file;
                carrier has disable:true / key:[]; content parses as a JSON object with
                an integer schema; every npc has a valid slug id + displayName; every
                facet/scene uid resolves to an entry in the same file
  presets     - prompts array and prompt_order present; every enabled prompt_order
                identifier resolves to a prompt

This script NEVER modifies files. It exists as a deterministic backstop for the
Compiler's pre-save guards (agent_roles/04_The_Compiler.md) and the manual checks in
Phase 5.5 - not as a replacement for either. Stdlib only; no dependencies.

Usage:
    python tools/validate_export.py <Export directory or single .json file>

Exit status: 0 = all checks passed, 1 = at least one failure, 2 = usage error.
"""

import json
import re
import sys
from pathlib import Path

# NPC Memory Contract slug rule (section 4): lowercase, _-separated, no leading/trailing/double _.
SLUG_RE = re.compile(r"^[a-z0-9]+(_[a-z0-9]+)*$")
NPC_MANIFEST_MARKER = "[[NPC_MANIFEST]]"

MOJIBAKE_MARKERS = ("â€", "Ã©", "Ã¨", "Ã±", "Â ")
FORBIDDEN_ENTRY_FIELDS = (
    "case_sensitive", "match_whole_words", "use_regex",
    "characterFilterNames", "characterFilterExclude",
)
STYLE_OVERRIDE_KEYS = {
    "perspective_override", "tense_override", "narration_marker_override",
    "dialogue_marker_override", "emphasis_marker_override", "directives",
    "override_rationale",
}


def begins_with_original(text):
    """The field must start with {{original}} on its own line."""
    if not isinstance(text, str):
        return False
    lines = text.splitlines()
    return bool(lines) and lines[0].strip() == "{{original}}"


def check_card(data, fail):
    card = data.get("data", {})
    for field in ("system_prompt", "post_history_instructions"):
        value = card.get(field, "")
        if not begins_with_original(value):
            fail(f"card {field} does not begin with {{{{original}}}} on its own line")
    extensions = card.get("extensions", {})
    depth_prompt = extensions.get("depth_prompt")
    if not isinstance(depth_prompt, dict) or "prompt" not in depth_prompt:
        fail("data.extensions.depth_prompt missing or malformed (mandatory structure; prompt may be empty)")
    world_forge = extensions.get("world_forge")
    if not isinstance(world_forge, dict) or "style_override" not in world_forge:
        fail("data.extensions.world_forge.style_override missing (must be null or a 7-key object)")
    else:
        override = world_forge["style_override"]
        if override is not None:
            if not isinstance(override, dict) or set(override.keys()) != STYLE_OVERRIDE_KEYS:
                fail("style_override is populated but does not have exactly the 7 required keys")


def check_manifest(entry, valid_uids, fail):
    """Validate an [[NPC_MANIFEST]] carrier and its JSON payload (NPC Memory Contract).

    valid_uids is the set of uids present in this lorebook file; facet/scene uids
    must resolve against it (per-file manifests carry file-local uids; the Group
    manifest carries re-sequenced uids - both resolve within their own file).
    """
    if entry.get("disable") is not True:
        fail("[[NPC_MANIFEST]] carrier must have disable: true (it must never reach the prompt)")
    if entry.get("key") not in (None, []):
        fail("[[NPC_MANIFEST]] carrier should have key: [] (it never activates)")
    content = entry.get("content")
    try:
        payload = json.loads(content) if isinstance(content, str) else None
    except json.JSONDecodeError as exc:
        fail(f"[[NPC_MANIFEST]] content is not valid JSON: {exc}")
        return
    if not isinstance(payload, dict):
        fail("[[NPC_MANIFEST]] content must be a single JSON object")
        return
    if not isinstance(payload.get("schema"), int):
        fail("[[NPC_MANIFEST]] payload missing integer 'schema'")
    seen_ids = set()
    for i, npc in enumerate(payload.get("npcs") or []):
        if not isinstance(npc, dict):
            fail(f"[[NPC_MANIFEST]] npcs[{i}] is not an object")
            continue
        nid = npc.get("id")
        if not isinstance(nid, str) or not SLUG_RE.match(nid):
            fail(f"[[NPC_MANIFEST]] npc id {nid!r} is not a valid slug (lowercase, _-separated)")
        elif nid in seen_ids:
            fail(f"[[NPC_MANIFEST]] duplicate npc id {nid!r} - two characters collide on one "
                 "memory key; canonical names must disambiguate")
        else:
            seen_ids.add(nid)
        if not npc.get("displayName"):
            fail(f"[[NPC_MANIFEST]] npc {nid!r} missing displayName")
        facets = npc.get("facets")
        if isinstance(facets, dict):
            for fkey, fuid in facets.items():
                if fuid not in valid_uids:
                    fail(f"[[NPC_MANIFEST]] npc {nid!r} facet {fkey!r} -> uid {fuid!r} "
                         "not found in this lorebook")
    for i, scene in enumerate(payload.get("scenes") or []):
        if not isinstance(scene, dict):
            fail(f"[[NPC_MANIFEST]] scenes[{i}] is not an object")
            continue
        sid = scene.get("id")
        if not isinstance(sid, str) or not SLUG_RE.match(sid):
            fail(f"[[NPC_MANIFEST]] scene id {sid!r} is not a valid slug")
        suid = scene.get("uid")
        if suid is not None and suid not in valid_uids:
            fail(f"[[NPC_MANIFEST]] scene {sid!r} -> uid {suid!r} not found in this lorebook")


def check_lorebook(data, fail):
    entries = data.get("entries")
    if not isinstance(entries, dict):
        fail("lorebook root has no entries dictionary")
        return
    valid_uids = {e.get("uid") for e in entries.values() if isinstance(e, dict)}
    seen_uids = {}
    manifests = []
    for key, entry in entries.items():
        label = entry.get("comment") or key
        position = entry.get("position")
        if not isinstance(position, int) or not 0 <= position <= 7:
            fail(f"entry '{label}': position {position!r} outside world_info_position enum 0-7")
        if position == 4 and not isinstance(entry.get("depth"), int):
            fail(f"entry '{label}': position 4 (atDepth) without an integer depth")
        uid = entry.get("uid")
        if uid in seen_uids:
            fail(f"entry '{label}': uid {uid!r} duplicates entry '{seen_uids[uid]}'")
        else:
            seen_uids[uid] = label
        if str(uid) != key:
            fail(f"entry '{label}': object key {key!r} != String(uid) {str(uid)!r} - "
                 "ST looks entries up via entries[uid]; this entry imports but never renders in the GUI")
        aliases = [field for field in FORBIDDEN_ENTRY_FIELDS if field in entry]
        if aliases:
            fail(f"entry '{label}': snake_case/legacy alias field(s) {aliases} - native World Info "
                 "uses camelCase (caseSensitive, matchWholeWords, scanDepth, useGroupScoring) "
                 "and the optional characterFilter object")
        if str(entry.get("comment") or "").startswith(NPC_MANIFEST_MARKER):
            manifests.append(entry)
    if len(manifests) > 1:
        fail(f"{len(manifests)} [[NPC_MANIFEST]] entries in one lorebook - the contract allows at most one")
    for entry in manifests:
        check_manifest(entry, valid_uids, fail)


def check_preset(data, fail):
    prompts = data.get("prompts")
    order = data.get("prompt_order")
    if not isinstance(prompts, list) or not prompts:
        fail("preset has no prompts array")
        return
    if not isinstance(order, list) or not order:
        fail("preset has no prompt_order array")
        return
    known = {p.get("identifier") for p in prompts if isinstance(p, dict)}
    for character in order:
        for item in character.get("order", []):
            identifier = item.get("identifier")
            if item.get("enabled") and identifier not in known:
                fail(f"prompt_order references enabled identifier '{identifier}' with no matching prompt")


def classify(data):
    if isinstance(data, dict):
        if str(data.get("spec", "")).startswith("chara_card"):
            return "card"
        if "entries" in data:
            return "lorebook"
        if "prompts" in data and "prompt_order" in data:
            return "preset"
    return "other"


def validate_file(path):
    failures = []
    fail = failures.append

    raw = path.read_bytes()
    try:
        text = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        fail(f"not valid UTF-8 ({exc}) - was this written through PowerShell?")
        return failures

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        fail(f"JSON parse error: {exc}")
        return failures

    # Scan the decoded content, not the raw file: \u-escaped mojibake is still mojibake.
    unescaped = json.dumps(data, ensure_ascii=False)
    for marker in MOJIBAKE_MARKERS:
        if marker in unescaped:
            fail(f"mojibake marker {marker!r} found - em-dashes/curly quotes were corrupted by a re-encode")
            break

    kind = classify(data)
    if kind == "card":
        check_card(data, fail)
    elif kind == "lorebook":
        check_lorebook(data, fail)
    elif kind == "preset":
        check_preset(data, fail)
    return failures


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    target = Path(argv[1])
    if target.is_file():
        files = [target]
    elif target.is_dir():
        files = sorted(target.glob("*.json"))
    else:
        print(f"error: {target} is not a file or directory")
        return 2
    if not files:
        print(f"error: no .json files found in {target}")
        return 2

    total_failures = 0
    for path in files:
        failures = validate_file(path)
        status = "PASS" if not failures else "FAIL"
        print(f"[{status}] {path.name}")
        for message in failures:
            print(f"       - {message}")
        total_failures += len(failures)

    print(f"\n{len(files)} file(s) checked, {total_failures} failure(s).")
    return 1 if total_failures else 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except BrokenPipeError:
        # Output was piped into a reader that closed early (e.g. `| head`);
        # exit quietly like other Unix CLIs instead of dumping a traceback.
        sys.stderr.close()
        sys.exit(1)
