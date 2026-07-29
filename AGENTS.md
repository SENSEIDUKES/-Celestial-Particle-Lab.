# Coding Agent Instructions

Read this file before making changes.

## Purpose

This repository is the **Light Novel Workshop**: a standalone visual development space for SEN and the main `SENSEIDUKES/Light-Novels` application.

Use it to isolate, preview, and refine UI components, animations, icons, rewards, and visual effects without needing the production app, authentication, story data, or migration infrastructure.

## Core rule

Build workshop pieces so the finished component can be moved cleanly into `Light-Novels`.

Do not turn this repository into a second full application. Use mock data and preview-only wrappers where necessary, but keep the actual component portable and separate from the workshop shell.

## Organization

- `src/workshop/manifest.ts` lists every workshop entry shown on the home screen.
- `src/workshop/` contains preview wrappers and workshop-only presentation.
- Reusable component logic may live in `src/components/` or an appropriately named feature folder.
- Static visual assets belong in `public/` under a clearly named folder.
- Keep component-specific styles close to the component when practical.

When adding a new experiment:

1. Give it a focused component or feature folder.
2. Add a preview wrapper under `src/workshop/`.
3. Add one entry to `src/workshop/manifest.ts`.
4. Make it reachable through a simple `?preview=<id>` URL.
5. Document any files that must be copied into `Light-Novels`.

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

Do not automatically change `Light-Novels` unless the user explicitly asks. When a workshop piece is approved, identify the exact component, styles, assets, and dependencies needed for transfer, and leave workshop-only navigation or mock wrappers behind.
