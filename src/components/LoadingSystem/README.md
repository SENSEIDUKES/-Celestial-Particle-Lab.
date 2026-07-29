# LoadingSystem

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** src/components/AILoadingVeil.tsx
- **Workshop preview:** `?preview=chapter-generation-manifestation`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-29
- **Last source comparison:** 2026-07-29
- **Replica status:** under refinement

## Workshop history

- **2026-07-29:** Consolidated the AILoadingVeil's two duplicated presentations into one reusable loading system with a normalized task-card format and two visual modes (primary veil / compact indicator).

## What this is

A single reusable loading system for operation UI. Every operation normalizes
its live information into one interchangeable **LoadingTaskCard**
(`taskCard.ts`): operation name, icon, status, description, progress, and
phases — plus tracker detail, time estimate, and compact-mode copy.

Two visual modes render the same card:

- **Primary veil** (`LoadingVeil.tsx`) — full-screen immersive presentation for
  blocking operations. Can be minimized to the compact mode.
- **Compact indicator** (`CompactIndicator.tsx`) — floating corner widget for
  minimized, short, or background operations.

`LoadingSystem.tsx` is the orchestrator and only entry point: it routes between
the modes and keeps very short tasks hidden. Compact mode waits out a grace
window (`compactGraceMs`, default 1200ms); tasks that finish inside it never
render, because they complete too quickly to communicate useful information.

## What was copied or faithfully reconstructed

- Both presentations were moved verbatim from the AILoadingVeil replica — no
  visual redesign. Celestial sigil, Library Seal progress, agent card, phase
  marker, and floating widget all render exactly as before.

## What was mocked

- Nothing new. The system is presentation-only; the Workshop preview simulator
  drives it with local state.

## Preview states

- All AI generation phases (blueprint, initial-arc, steer, cover, chapter)
- Minimized primary veil (compact indicator with expand control)
- Scout tasks routed to compact mode
- Scout quick task (~1s) — stays hidden entirely

## Production dependencies intentionally excluded

- No stores, auth, Firebase, or generation callbacks. Operation logic stays in
  the caller; the system only renders a task card.

## Files needed for transfer

- `src/components/LoadingSystem/taskCard.ts`
- `src/components/LoadingSystem/LoadingVeil.tsx`
- `src/components/LoadingSystem/CompactIndicator.tsx`
- `src/components/LoadingSystem/LoadingSystem.tsx`
- Agent profiles from `src/lib/agents.ts` (already present in the source app)

## Transfer notes

- Requires `lucide-react` and `motion/react`.
- Callers keep their own operation state; they only build a `LoadingTaskCard`
  (or reuse `buildAILoadingTaskCard`) and pass `active`, `minimized`, and
  `onMinimizedChange`. The AILoadingVeil adapter shows the pattern.
- Route short/background tasks with `preferredMode: 'compact'` on the card.
