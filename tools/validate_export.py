#!/usr/bin/env python3
"""Read-only validator for World Forge Export/ JSON packages.

Checks the failure modes that slip past "the JSON parses":

  all .json   - strict UTF-8 decode (catches UTF-16 / wrong-encoding writes)
              - mojibake markers ("a-circumflex-euro" / stray "A-tilde" sequences left by
                a Windows-1252 round-trip of em-dashes and curly quotes)
              - strict json.loads parse
              - no inline revision marker (<!-- REVISED IN R[N] --> / <!-- CREATED IN
                R[N] -->) leaked into a string value; those belong only in Drafts/, and
                in an Export value they render into the SillyTavern prompt at runtime
  cards       - data.system_prompt and data.post_history_instructions begin with
                {{original}} on its own line
              - data.extensions.depth_prompt structure present
              - data.extensions.world_forge.style_override present (null or 7-key object)
              - records whether any card carries a recognized Director tag (for the
                export-set WORLD_FORGE_SYNC §2 check below)
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
                an integer schema; lorebook.kind in the allowed enum; every npc has a
                valid slug id + displayName; every multi-word npc's aliases include the
                bare first name (WORLD_FORGE_SYNC §3); every facet/scene uid resolves to
                an entry in the same file
              - any [[WORLD_CALENDAR]] entry (WORLD_FORGE_SYNC §5) is WARN-only (the seam
                is optional and degrades gracefully): at most one per file; carrier is
                enabled (disable:false, unlike the manifest) so the Scene Tracker sees it;
                content parses as a JSON object; start/end month is 0-11; weekdayOfDay1 is
                0-6; end is an object, null, or "infinite"
  presets     - prompts array and prompt_order present; every enabled prompt_order
                identifier resolves to a prompt
  export set  - WORLD_FORGE_SYNC §2: if any manifest declares kind:"director", at least
                one exported card must carry a recognized director tag (directory runs only)

Warnings (lines prefixed [WARN]) never change exit status; only failures do.

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
import unicodedata
from pathlib import Path

# NPC Memory Contract slug rule (section 4): lowercase, _-separated, no leading/trailing/double _.
SLUG_RE = re.compile(r"^[a-z0-9]+(_[a-z0-9]+)*$")
NPC_MANIFEST_MARKER = "[[NPC_MANIFEST]]"
WORLD_CALENDAR_MARKER = "[[WORLD_CALENDAR]]"
# Inline revision markers belong only on the Drafts side; the Export side's sole
# revision marker is REVISED_FILES.md. A marker that reached a JSON string value
# leaked through the mini-Compiler (agent_roles/revise/04_The_Compiler_mini.md
# Foundational Rule 9) and would render verbatim into the SillyTavern prompt.
REVISION_MARKER_RE = re.compile(r"<!--\s*(?:REVISED|CREATED) IN R.*?-->")

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

# Manifest lorebook.kind enum (NPC Memory Contract / WORLD_FORGE_SYNC §2).
LOREBOOK_KIND_ENUM = {"npc", "arc", "world", "group", "director"}

# WORLD_FORGE_SYNC.md §2: the recognized Director / NPC-host card tag set, matched
# case/accent-insensitively with hyphens, underscores, and spaces all equivalent.
# Normalizing collapses "world-director"/"world director" and
# "npc-controller"/"npc controller" to one form each.
DIRECTOR_TAG_NAMES = {"director", "npc", "world director", "npc controller"}

# Honorifics are not a "first name" for the WORLD_FORGE_SYNC §3 bare-first-name check.
HONORIFICS = {
    "mr", "mrs", "ms", "miss", "mx", "dr", "prof", "professor", "sir",
    "madam", "madame", "lady", "lord", "st", "fr", "rev", "capt", "captain",
    "col", "gen", "sgt", "lt", "maj",
}


def normalize_tag(value):
    """Lowercase, strip accents, and collapse -/_/whitespace to single spaces."""
    if not isinstance(value, str):
        return ""
    decomposed = unicodedata.normalize("NFKD", value)
    stripped = "".join(c for c in decomposed if not unicodedata.combining(c))
    return re.sub(r"[\s\-_]+", " ", stripped).strip().lower()


def alias_token(value):
    """Lowercase a name/alias and trim surrounding punctuation for comparison."""
    if not isinstance(value, str):
        return ""
    return value.strip().strip(".,'\"").lower()


def bare_first_name(display_name):
    """The first non-honorific token of a multi-word display name, else None."""
    tokens = [t for t in str(display_name or "").split() if alias_token(t) not in HONORIFICS]
    return tokens[0] if len(tokens) > 1 else None


def begins_with_original(text):
    """The field must start with {{original}} on its own line."""
    if not isinstance(text, str):
        return False
    lines = text.splitlines()
    return bool(lines) and lines[0].strip() == "{{original}}"


def check_card(data, fail, info=None):
    card = data.get("data", {})
    if info is not None:
        tags = card.get("tags") or data.get("tags") or []
        if any(normalize_tag(t) in DIRECTOR_TAG_NAMES for t in tags):
            info["director_card_tag"] = True
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
    must resolve against it (each manifest is a per-file carrier whose uids are
    file-local).
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
    lorebook = payload.get("lorebook")
    kind = lorebook.get("kind") if isinstance(lorebook, dict) else None
    if kind is not None and kind not in LOREBOOK_KIND_ENUM:
        fail(f"[[NPC_MANIFEST]] lorebook.kind {kind!r} not in "
             f"{sorted(LOREBOOK_KIND_ENUM)} (NPC Memory Contract / WORLD_FORGE_SYNC §2)")
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
        display_name = npc.get("displayName")
        if not display_name:
            fail(f"[[NPC_MANIFEST]] npc {nid!r} missing displayName")
        else:
            # WORLD_FORGE_SYNC.md §3: a multi-word npc's aliases MUST include the bare
            # first name, or the Scene Tracker round-trip slugifies "Anna" to a
            # different id than "anna_larsson" and the NPC's memory silently splits.
            first = bare_first_name(display_name)
            if first is not None:
                alias_tokens = {alias_token(a) for a in (npc.get("aliases") or [])}
                if alias_token(first) not in alias_tokens:
                    fail(f"[[NPC_MANIFEST]] npc {nid!r} aliases must include the bare first "
                         f"name {first!r} of {display_name!r} (WORLD_FORGE_SYNC §3 - the "
                         "Scene Tracker resolves prose first names to ids via aliases)")
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
    return kind


def check_world_calendar(entry, warn):
    """Validate a [[WORLD_CALENDAR]] carrier (WORLD_FORGE_SYNC §5) — WARN-only.

    The seam is optional and the Scene Tracker no-ops on anything malformed, so
    nothing here is fatal; these warnings catch producer mistakes that would make
    the date seed silently do nothing.
    """
    # Unlike [[NPC_MANIFEST]] (disable:true), the calendar carrier is read from
    # getSortedEntries() with an explicit !disable filter, so a disabled entry is
    # silently skipped and the world seeds nothing.
    if entry.get("disable") is True:
        warn("[[WORLD_CALENDAR]] carrier has disable:true; the Scene Tracker reads it with a "
             "!disable filter and will skip it (WORLD_FORGE_SYNC §5.2) - emit it enabled with "
             "key:[] and constant:false so it stays inert but visible")
    content = entry.get("content")
    try:
        payload = json.loads(content) if isinstance(content, str) else None
    except json.JSONDecodeError as exc:
        warn(f"[[WORLD_CALENDAR]] content is not valid JSON: {exc}")
        return
    if not isinstance(payload, dict):
        warn("[[WORLD_CALENDAR]] content must be a single JSON object")
        return
    schema = payload.get("schema")
    if schema is not None and not isinstance(schema, int):
        warn(f"[[WORLD_CALENDAR]] 'schema' should be an integer, got {schema!r}")
    wd = payload.get("weekdayOfDay1")
    if wd is not None and not (isinstance(wd, int) and 0 <= wd <= 6):
        warn(f"[[WORLD_CALENDAR]] 'weekdayOfDay1' should be an integer 0-6 (0=Sun), got {wd!r}")
    for which in ("start", "end"):
        node = payload.get(which)
        # `end` may legitimately be null or "infinite" (open-ended); `start` may be absent.
        if node is None or (which == "end" and node == "infinite"):
            continue
        if not isinstance(node, dict):
            suffix = ' (or null / "infinite")' if which == "end" else ""
            warn(f"[[WORLD_CALENDAR]] '{which}' should be an object {{month, year}}{suffix}, "
                 f"got {node!r}")
            continue
        month = node.get("month")
        if not (isinstance(month, int) and 0 <= month <= 11):
            warn(f"[[WORLD_CALENDAR]] '{which}.month' should be a 0-indexed integer 0-11 "
                 f"(0=January, 11=December), got {month!r}")


def check_lorebook(data, fail, info=None, warn=None):
    entries = data.get("entries")
    if not isinstance(entries, dict):
        fail("lorebook root has no entries dictionary")
        return
    valid_uids = {e.get("uid") for e in entries.values() if isinstance(e, dict)}
    seen_uids = {}
    manifests = []
    calendars = []
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
        comment = str(entry.get("comment") or "")
        if comment.startswith(NPC_MANIFEST_MARKER):
            manifests.append(entry)
        if WORLD_CALENDAR_MARKER in comment:
            calendars.append(entry)
    if len(manifests) > 1:
        fail(f"{len(manifests)} [[NPC_MANIFEST]] entries in one lorebook - the contract allows at most one")
    for entry in manifests:
        kind = check_manifest(entry, valid_uids, fail)
        if info is not None and kind == "director":
            info["director_manifest"] = True
    if warn is not None:
        if len(calendars) > 1:
            warn(f"{len(calendars)} [[WORLD_CALENDAR]] entries in one lorebook - the Scene Tracker "
                 "uses the first and ignores the rest (WORLD_FORGE_SYNC §5.2)")
        for entry in calendars:
            check_world_calendar(entry, warn)


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


def validate_file(path, info=None):
    failures = []
    warnings = []
    fail = failures.append
    warn = warnings.append

    raw = path.read_bytes()
    try:
        text = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError as exc:
        fail(f"not valid UTF-8 ({exc}) - was this written through PowerShell?")
        return failures, warnings

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        fail(f"JSON parse error: {exc}")
        return failures, warnings

    # Scan the decoded content, not the raw file: \u-escaped mojibake is still mojibake.
    unescaped = json.dumps(data, ensure_ascii=False)
    for marker in MOJIBAKE_MARKERS:
        if marker in unescaped:
            fail(f"mojibake marker {marker!r} found - em-dashes/curly quotes were corrupted by a re-encode")
            break

    leaked = REVISION_MARKER_RE.findall(unescaped)
    if leaked:
        sample = leaked[0] if len(leaked) == 1 else f"{leaked[0]} (+{len(leaked) - 1} more)"
        fail(f"inline revision marker leaked into a JSON value: {sample} - markers belong only in "
             "Drafts/; strip them (mini-Compiler Foundational Rule 9). They render into the prompt at runtime")

    kind = classify(data)
    if kind == "card":
        check_card(data, fail, info)
    elif kind == "lorebook":
        check_lorebook(data, fail, info, warn)
    elif kind == "preset":
        check_preset(data, fail)
    return failures, warnings


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

    # Cross-file facts collected while validating individual files, used for the
    # WORLD_FORGE_SYNC §2 export-set check below.
    info = {"director_manifest": False, "director_card_tag": False}

    total_failures = 0
    total_warnings = 0
    for path in files:
        failures, warnings = validate_file(path, info)
        status = "PASS" if not failures else "FAIL"
        print(f"[{status}] {path.name}")
        for message in failures:
            print(f"       - {message}")
        for message in warnings:
            print(f"       [WARN] {message}")
        total_failures += len(failures)
        total_warnings += len(warnings)

    # WORLD_FORGE_SYNC §2: a Director-role world (a lorebook manifest with
    # kind:"director") must ship a card carrying a recognized director tag, or the
    # group-chat router and Scene Tracker have no host to bind to. Only checkable
    # across a full export set, so skip it for single-file invocations.
    if target.is_dir() and info["director_manifest"] and not info["director_card_tag"]:
        msg = ("a manifest declares lorebook.kind:\"director\" but no exported card carries a "
               "recognized director tag (world-director / npc-controller / director / npc); the "
               "group-chat router and Scene Tracker classify the host card by tag alone "
               "(WORLD_FORGE_SYNC §2)")
        print(f"[FAIL] (export set)\n       - {msg}")
        total_failures += 1

    print(f"\n{len(files)} file(s) checked, {total_failures} failure(s), {total_warnings} warning(s).")
    return 1 if total_failures else 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except BrokenPipeError:
        # Output was piped into a reader that closed early (e.g. `| head`);
        # exit quietly like other Unix CLIs instead of dumping a traceback.
        sys.stderr.close()
        sys.exit(1)
