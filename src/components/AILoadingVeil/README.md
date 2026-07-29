# AILoadingVeil

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** src/components/AILoadingVeil.tsx
- **Workshop preview:** `?preview=chapter-generation-manifestation`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-29
- **Last source comparison:** 2026-07-29
- **Replica status:** faithful replica

## Workshop history

- **2026-07-29:** Created faithful Workshop replica and local state simulator.

## Component Notes

- Replicated the manifestation UI for chapter generation, including the celestial sigil, agent badge, and active status tracking.
- Removed tight coupling to `useAppStore` and `useGenerationStore`.
- Added standard React props to allow the Workshop simulator to control progress, agent assignment, and state changes.
- Requires `lucide-react` and `motion/react` dependencies to animate as originally designed.
