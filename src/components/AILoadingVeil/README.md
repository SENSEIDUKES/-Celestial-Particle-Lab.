# AILoadingVeil

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** src/components/AILoadingVeil.tsx
- **Workshop preview:** `?preview=chapter-generation-manifestation`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-29
- **Last source comparison:** 2026-07-29
- **Replica status:** under refinement

## Workshop history

- **2026-07-29:** Created faithful Workshop replica and local state simulator.
- **2026-07-29:** Consolidated presentation into the shared `LoadingSystem` (primary veil + compact indicator driven by a normalized task card). This file is now a thin adapter: props, quote rotation, and progress derivation are unchanged; Scout tasks route to compact mode and very short tasks stay hidden.

## Component Notes

- Replicated the manifestation UI for chapter generation, including the celestial sigil, agent badge, and active status tracking.
- Removed tight coupling to `useAppStore` and `useGenerationStore`.
- Added standard React props to allow the Workshop simulator to control progress, agent assignment, and state changes.
- Presentation lives in `src/components/LoadingSystem/`; this component only adapts generation signals into the shared `LoadingTaskCard` format.
- Requires `lucide-react` and `motion/react` dependencies to animate as originally designed.
