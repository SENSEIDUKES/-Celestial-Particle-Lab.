# Celestial Particle Lab

A minimal standalone React/Vite preview of SEN's existing `CelestialParticleShower` effect.

## Coding agents: read this first

Before making any changes, read [`AGENTS.md`](./AGENTS.md). It contains the required scope, live-preview workflow, and rules for keeping the component easy to move back into the main Light-Novels app.

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the local or forwarded Vite preview, usually on port `5173`, and keep it available while refining the animation.

The preview intentionally contains only the particle canvas, black backdrop, and the two ambient glow layers used behind relic reveals. There are no controls or unrelated UI.

## Approved Library glyph set

The first six custom Library glyphs are stored in [`public/icons`](./public/icons):

- `yin-yang.svg`
- `shen-long-dragon.svg`
- `sacred-tree.svg`
- `thunder-cloud.svg`
- `book-scroll.svg`
- `cultivator.svg`

These are the approved symbol direction for the particle system. Coding agents should use and refine these assets rather than replacing them with generic space, wizard, planet, or fantasy-game icons.

Edit `src/CelestialParticleShower.tsx` to refine the effect. When finished, copy that component and any finalized glyph assets back into the main Light-Novels repository.