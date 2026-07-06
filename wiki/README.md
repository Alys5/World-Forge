# Wiki staging

This directory holds markdown source for pages that belong on the project's GitHub Wiki. GitHub wikis are stored in a separate `.wiki` git repository and do not accept pull requests through GitHub's normal PR flow, so wiki content is drafted here in the main repo (where it is reviewable) and then copy-pasted into the wiki after merge.

## Current pages

- [`JanitorAI-Integration.md`](./JanitorAI-Integration.md) — Documentation on how the pipeline natively compiles highly structured character profiles and ES6 sandbox scripts for JanitorAI.
- [`Image-Prompt-Guide.md`](./Image-Prompt-Guide.md) — Guide for generating character/scene image prompts with PixAI, NovelAI, and Danbooru tags.

## Publishing a page to the wiki

1. Review and merge the PR introducing the page here.
2. Open the project's GitHub Wiki tab.
3. Create a new page with the same name as the file (minus `.md`).
4. Paste the contents.
5. Adjust any relative links (`../README.md`, `../CLAUDE.md`) to absolute GitHub URLs as needed for the wiki context.
