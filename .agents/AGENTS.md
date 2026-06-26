# Project-Scoped Rules for World-Forge Workspace

## Directory Structure Rule
Per the user's request, when generating or refining worlds, the active project folder MUST NOT be the root of the World-Forge repository. 
Instead, all data for a specific world must follow this exact split structure:
- **Drafts**: MUST be saved in `d:\World-Forge\Drafts\[WorldName]\`
- **Exports & World Seed**: MUST be saved in `d:\World-Forge\Export\[WorldName]\`

Whenever a pipeline phase requires reading or writing files, you MUST use these specific `Drafts\[WorldName]` and `Export\[WorldName]` subdirectories rather than the root project folders.

## Antigravity Subagent Execution
The `kilo.jsonc` subagents have been converted to Antigravity Skills in `d:\World-Forge\.agents\skills\`.
When following the orchestration workflow (`workflows/world-forge.md`) and instructed to dispatch to a subagent (e.g., `WorldForge-Interviewer` or `WorldForge-Refiner`), do not attempt to use Kilo's task delegation. 
Instead, rely on the Antigravity Skill matching engine. As Antigravity, you can natively adopt these personas because the Skills will automatically trigger and provide you with the correct `agent_roles/*.md` specification file for the requested phase.
