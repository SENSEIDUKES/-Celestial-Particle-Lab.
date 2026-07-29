# Light Novel Workshop

A standalone visual workshop for SEN and the Light-Novels app.

Use this repository to build, preview, refine, and approve portable UI pieces before moving them into the main `SENSEIDUKES/Light-Novels` repository.

## Coding agents: read this first

Before making changes, read [`AGENTS.md`](./AGENTS.md). It explains the purpose of the workshop, the preview workflow, and how new components should be organized for clean re-import into Light-Novels.

## What belongs here

Examples include:

- backgrounds and ambient effects
- loading and generation animations
- Closed-Door Cultivation UI and motion
- relic cards and reward reveals
- Library icon sets
- Reader and Codex components
- small mobile-first interface experiments

This is not a second version of the full app. It is a clean visual development space with mock content only.

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the local or forwarded Vite preview, usually on port `5173`.

## Current workshop entries

The home screen is driven by [`src/workshop/manifest.ts`](./src/workshop/manifest.ts). Each approved experiment should have its own preview and a clear entry in that manifest.

Current entry:

- **Celestial Particle Backdrop** — `?preview=celestial-backdrop`

The approved Library glyph set remains in [`public/icons`](./public/icons).

## Moving work into Light-Novels

Workshop components should stay portable: minimal dependencies, no auth, no database, and no production persistence. Once approved, copy the actual component, styles, and required assets into the corresponding place in `Light-Novels`; do not import the workshop shell itself.
