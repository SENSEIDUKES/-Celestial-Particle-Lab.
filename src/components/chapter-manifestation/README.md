# Chapter Generation Manifestation

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/AILoadingVeil.tsx`
- **Workshop preview:** `?preview=chapter-generation-manifestation`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-29
- **Last source comparison:** 2026-07-29
- **Replica status:** under refinement

## Workshop history

- **2026-07-29:** Created faithful Workshop replica and local state simulator.
- **2026-07-29:** Consolidated presentation into a shared `LoadingSystem` (primary veil + compact indicator driven by a normalized task card).
- **2026-07-29:** Refined the Development veil: dropped the atmospheric phase phrase and the phase marker pill for a more compact card, lowered Versa's emblem for more breathing room.
- **2026-07-29:** Reorganized into the standard feature workspace layout — `reference/` and `development/` folders (formerly `AILoadingVeil`/`LoadingSystem` mixed with `Dev*` file prefixes), with `shared/` holding the task-card format and compact indicator both versions reuse. Selected with the Original Reference / Development / Compare control instead of two labeled buttons on one page.

## Folder layout

```
reference/AILoadingVeil.tsx    — untouched adapter, feeds a LoadingTaskCard into reference/LoadingSystem
reference/LoadingSystem.tsx    — orchestrator: routes primary veil vs compact indicator
reference/LoadingVeil.tsx      — full-screen immersive veil presentation

development/AILoadingVeil.tsx   — active Workshop adapter (formerly DevLoadingVeil)
development/LoadingSystem.tsx   — active orchestrator (formerly DevLoadingSystem)
development/LoadingVeilCard.tsx — active veil presentation under iteration (formerly DevLoadingVeilCard)

shared/taskCard.ts          — LoadingTaskCard format + buildAILoadingTaskCard, used by both versions
shared/CompactIndicator.tsx — floating corner widget, identical in both versions
```

## What this is

A single reusable loading system for operation UI. Every operation normalizes its live information into one interchangeable **LoadingTaskCard** (`shared/taskCard.ts`): operation name, icon, status, description, progress, and phases — plus tracker detail, time estimate, and compact-mode copy.

Two visual modes render the same card:

- **Primary veil** — full-screen immersive presentation for blocking operations. Can be minimized to the compact mode.
- **Compact indicator** (`shared/CompactIndicator.tsx`) — floating corner widget for minimized, short, or background operations.

`LoadingSystem` is the orchestrator and only entry point: it routes between the modes and keeps very short tasks hidden. Compact mode waits out a grace window (`compactGraceMs`, default 1200ms); tasks that finish inside it never render, because they complete too quickly to communicate useful information.

## What changed in Development vs Reference

- Compact card: no atmospheric phrase, no phase marker pill.
- Live "Manifesting N/20" tracker detail (was "N passages formed") while a chapter streams in.
- Versa's floating emblem given more breathing room (`mb-10 mt-10`) and a `CelestialParticleShower` backdrop tinted to the active agent.

## What was mocked

Nothing beyond the AILoadingVeil replica boundary — the system is presentation-only; the Workshop preview simulator drives it with local state.

### Preview states

- Primary veil — phase selector covering blueprint, initial-arc, steer, cover, and chapter, switched between Reference and Development via the workspace control.
- Versa compact — background chapter task; expandable back into the veil.
- Scout compact — retrieval task; always compact, never blocks the screen.

### Production dependencies intentionally excluded

No stores, auth, Firebase, or generation callbacks. Operation logic stays in the caller; the system only renders a task card.

### Files needed for transfer

- `shared/taskCard.ts`, `shared/CompactIndicator.tsx`
- `development/LoadingVeilCard.tsx`, `development/LoadingSystem.tsx`, `development/AILoadingVeil.tsx` (once approved, transfer as the new reference implementation)
- Agent profiles from `src/lib/agents.ts` (already present in the source app)

### Transfer notes

- Requires `lucide-react` and `motion/react`.
- Callers keep their own operation state; they only build a `LoadingTaskCard` (or reuse `buildAILoadingTaskCard`) and pass `active`, `minimized`, and `onMinimizedChange`.
- Route short/background tasks with `preferredMode: 'compact'` on the card.
