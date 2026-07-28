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

Edit `src/CelestialParticleShower.tsx` to refine the effect. When finished, copy that component back into the main Light-Novels repository.
