# Coding Agent Instructions

Read this file before making changes.

## Purpose

This repository is a minimal visual lab for refining SEN's existing `CelestialParticleShower` effect outside the main Light-Novels application.

## Working rules

- Work only on the celestial particle effect and the minimal preview needed to display it.
- Keep the preview full-screen, dark, and visually clean.
- Do not add sliders, control panels, settings interfaces, buttons, dashboards, or unrelated UI unless the user explicitly requests them.
- Preserve the component as a portable React component that can be copied back into the main Light-Novels repository.
- Make visual changes directly from the user's instructions.
- Do not introduce database, authentication, persistence, API, or migration work.

## Live preview workflow

Install dependencies and run the Vite development server:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Keep the live preview available while working. Open the local or forwarded Vite URL, typically port `5173`.

After each visual change:

1. Confirm the app still compiles.
2. Confirm the preview still renders.
3. Use Vite hot reload, or refresh the preview if necessary.
4. Keep the preview available so the user can immediately judge the animation.

## Primary file

Make particle-effect changes primarily in:

`src/CelestialParticleShower.tsx`

Only change surrounding preview files when required to display the effect correctly.

## Final integration

When the effect is approved, keep the finished component easy to copy back into the main Light-Novels app without bringing along temporary preview-only complexity.
