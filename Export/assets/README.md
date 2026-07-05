# 0_assets Inventory

This folder is the approved asset inventory for SvartulfrVerse exports and templates.

## Current inventory

- `ASSET_REGISTRY.json`: canonical registry for approved image metadata, dimensions, trigger keywords, duplicate/archive notes, and local paths.
- `images/`: all local raster image assets.
  - `images/characters/<Character>/<AssetKey>/<filename>`: character portraits, polaroids, scenes, references, and variants.
  - `images/locations/<LocationKey>/<filename>`: location and environment assets.
  - `images/families/<FamilyKey>/<AssetKey>/<filename>`: family and duo assets.
  - `images/interface/<InterfaceKey>/<filename>`: banners, dividers, emblems, and UI-style assets.
  - `images/archive/duplicates/<filename>`: duplicate local images retained for audit traceability.
  - `images/archive/unclassified/<filename>`: local images kept in the registry but requiring review before public export use.

## Current audit summary

Current `0_assets` inventory contains:

- 103 local image files under `images/`;
- 103 local entries in `ASSET_REGISTRY.json`;
- 78 approved assets, 14 local references, 9 duplicates, and 2 unclassified archive assets;
- 0 missing local paths in `ASSET_REGISTRY.json`;
- 0 files under `images/unassigned/`.

The registry remains the source of truth for exports and templates. Review `images/archive/unclassified/` before using those assets in a public bot card.

## Naming conventions

- Keep original filenames. Do not rename approved assets after they are registered.
- Folder names are derived from registry structure:
  - Character assets use `Character/<Name>/<AssetKey>`.
  - Family assets use `Family/<FamilyKey>/<AssetKey>`.
  - Location assets use `Location/<LocationKey>`.
  - Interface assets use `Interface/<InterfaceKey>`.
- Use forward slashes in registry paths and project references, even on Windows.
- Keep `ASSET_REGISTRY.json` at the root of `0_assets/`.

## Location guidelines

- Use `local_path` from `ASSET_REGISTRY.json` when referencing local approved assets.
- Use `md_tag` from `ASSET_REGISTRY.json` when embedding images in Markdown.
- Keep `web_url` as provenance for the original approved external source when present.
- Do not add new root-level media files. Put new assets into the matching subfolder before updating the registry.
- Do not reference `TODO-CANON/` from export scripts.
- Do not use image metadata from memory, old copies, or external guesses. The registry is the source of truth.

## Unassigned local assets

There are currently no files under `images/unassigned/`.

The registry does contain two archive assets marked `unclassified`; review them before using them in an export:

- `images/archive/unclassified/ATvSGz9zAsohoY-GyHK0M.webp`
- `images/archive/unclassified/image.jpg`

## Reference examples

Relative to `0_assets/ASSET_REGISTRY.json`:

```json
{
  "local_path": "./images/characters/Erik/Avatar_Primary/qziRZ5Fs2BugaH80j-RSY.webp",
  "md_tag": "!Erik's authority"
}
```

Relative to `2_Export/World/Modern/TwinXFamily/TXF_Bio.html`:

```html
<img src="../../../../0_assets/images/characters/Erik/Avatar_Primary/qziRZ5Fs2BugaH80j-RSY.webp" alt="Erik portrait">
```

## Maintenance checklist

Before exporting or publishing a bot card:

1. Confirm the image filename exists in the expected `0_assets/images/...` path.
2. Confirm `ASSET_REGISTRY.json` has the same filename, `local_path`, `md_tag`, `resolution`, and trigger keyword.
3. Confirm the export uses the local path, not an old root-level path.
4. Confirm unassigned assets are either registered or intentionally excluded.
5. Run link validation after moving, renaming, or adding assets.
