# Coding Agent Instructions

Read this file before making changes.

## Purpose

This repository is the **SEN Development space**: a centralized visual development and preview environment for SEN components and the main `SENSEIDUKES/Light-Novels` application.

Use it to isolate, preview, and refine UI components, animations, icons, rewards, and visual effects without needing the production app, authentication, story data, or migration infrastructure.

## Required skills

Before beginning any implementation, download, install or otherwise make available, and read all required skills for this repository.

Current required skills:

- **Sensei Skill** — the governing SEN/SEIHouse product, design, restraint, and implementation guidance.
- **Workshop Replica Skill** — [`skills/workshop-replica/SKILL.md`](./skills/workshop-replica/SKILL.md), used whenever a real page, screen, component, animation, or flow is brought into the Workshop.

These skills are part of the repository workflow and are not optional. Do not silently proceed without them.

At the beginning of the task:

1. Confirm that both required skills were downloaded or are available in the agent environment.
2. Read both skills before changing code.
3. State clearly if either skill cannot be accessed.
4. Do not invent a replacement version of a missing skill.

When the user asks to bring a real page, screen, component, animation, or flow from another repository into this Workshop, the Workshop Replica Skill is mandatory. It covers faithful visual replication, local state simulation, production-boundary rules, portability, verification, and dated component history.

## Core rule

Build workshop pieces so the finished component can be moved cleanly into `Light-Novels` or another SEN application.

Do not turn this repository into a second full application. Use mock data and preview-only wrappers where necessary, but keep the actual component portable and separate from the workshop shell.

## Organization

- `src/workshop/manifest.ts` lists every workshop entry shown on the home screen.
- `src/workshop/` contains preview wrappers and workshop-only presentation.
- Reusable component logic may live in `src/components/` or an appropriately named feature folder.
- Static visual assets belong in `public/` under a clearly named folder.
- Keep component-specific styles close to the component when practical.
- Portable agent skills live under `skills/`.

When adding a new experiment:

1. Give it a focused component or feature folder.
2. Add a preview wrapper under `src/workshop/`.
3. Add one entry to `src/workshop/manifest.ts`.
4. Make it reachable through a simple `?preview=<id>` URL.
5. Add a component README containing source information, current dates, Workshop history, mock boundaries, and transfer instructions.
6. Document any files that must be copied into the source application.

## Dating requirement

Every replicated page or component must record:

- replica creation date
- last Workshop update date
- last source comparison date
- current lifecycle status
- a concise dated Workshop history

Use the real current calendar date. Update the history whenever the replica receives a material visual or structural change. Do not update the source-comparison date unless the source was actually inspected again.

## Working style

- Keep previews mobile-first and easy to inspect on the deployed Vercel site.
- Make visual changes directly from the user's instructions.
- Avoid unnecessary dashboards, controls, settings, or architecture unless requested.
- Do not add database, authentication, API, persistence, or migration work.
- Reuse the existing app stack and keep dependencies minimal.
- Preserve currently approved work while adding new workshop entries.

## Live preview workflow

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Keep the local or forwarded preview available, usually on port `5173`. After changes, confirm the app compiles and the relevant preview still renders on mobile and desktop.

## Final integration

Do not automatically change a source application unless the user explicitly asks. When a Workshop piece is approved, identify the exact component, styles, assets, and dependencies needed for transfer, and leave Workshop-only navigation, mocks, and preview controls behind.
