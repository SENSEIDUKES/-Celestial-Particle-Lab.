# Chapter Generation Manifestation

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/AILoadingVeil.tsx`
- **Workshop preview:** `?preview=chapter-generation-manifestation`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-30
- **Last source comparison:** 2026-07-29
- **Replica status:** under refinement

## Workshop history

- **2026-07-29:** Created faithful Workshop replica and local state simulator.
- **2026-07-29:** Consolidated presentation into a shared `LoadingSystem` (primary veil + compact indicator driven by a normalized task card).
- **2026-07-29:** Refined the Development veil: dropped the atmospheric phase phrase and the phase marker pill for a more compact card, lowered Versa's emblem for more breathing room.
- **2026-07-29:** Reorganized into the standard feature workspace layout — `reference/` and `development/` folders (formerly `AILoadingVeil`/`LoadingSystem` mixed with `Dev*` file prefixes), with `shared/` holding the task-card format and compact indicator both versions reuse. Selected with the Original Reference / Development / Compare control instead of two labeled buttons on one page.
- **2026-07-30:** Added `development/SwordCultivatorClash.tsx` — two flying sword cultivators drift in, clash once at center with a spark, recoil, and glide out on an 8-second loop, with flowing circular qi trails, an outward pulse ring, and ambient motes. Deepened Versa's purple aura toward the reference image: saturated violet nebula with a bright core, twin counter-rotating cloak wisps, stronger ground pool, six brighter qi motes, violet-dominant cast on the figure.
- **2026-07-30:** Rebuilt the Development veil as a single 100dvh mobile composition — no vertical scrolling. Three zones: Versa hero (aura kept, tighter footprint, spills over the card's top edge), compact chapter status (Chapter · ~Ns row, Manifesting N/20, progress bar; library seal and continuity note removed from the default layout; workshop-only "Animation Concept 2" copy dropped), and an animation area that flex-grows into the remaining viewport with scenes scaled contain. The animation area is a swipeable carousel (`SwordCultivatorClash` + new `CelestialChannel` scene) with compact title, dot navigation, and an expand toggle that collapses chapter status to one thin row.

## Folder layout

```
reference/AILoadingVeil.tsx    — untouched adapter, feeds a LoadingTaskCard into reference/LoadingSystem
reference/LoadingSystem.tsx    — orchestrator: routes primary veil vs compact indicator
reference/LoadingVeil.tsx      — full-screen immersive veil presentation

development/AILoadingVeil.tsx   — active Workshop adapter (formerly DevLoadingVeil)
development/LoadingSystem.tsx   — active orchestrator (formerly DevLoadingSystem)
development/LoadingVeilCard.tsx — active veil presentation: 100dvh three-zone mobile composition
development/SwordCultivatorClash.tsx — stage-only looping clash diorama
development/CelestialChannel.tsx     — stage-only calm orbit diorama (second carousel scene)

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
- Versa's floating emblem inside a deepened violet aura (saturated nebula + bright core + counter-rotating wisps) and a `CelestialParticleShower` backdrop tinted to the active agent.
- The whole veil is a locked 100dvh mobile composition: Versa hero on top, compact chapter status, and a swipeable animation carousel filling the rest of the viewport. An expand toggle lets the animation take over while chapter status collapses to one thin row.
- Scout's presentation stays a compact card without the animation zone.

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
- `development/LoadingVeilCard.tsx`, `development/LoadingSystem.tsx`, `development/AILoadingVeil.tsx`, `development/SwordCultivatorClash.tsx`, `development/CelestialChannel.tsx` (once approved, transfer as the new reference implementation)
- Agent profiles from `src/lib/agents.ts` (already present in the source app)

### Transfer notes

- Requires `lucide-react` and `motion/react`.
- Callers keep their own operation state; they only build a `LoadingTaskCard` (or reuse `buildAILoadingTaskCard`) and pass `active`, `minimized`, and `onMinimizedChange`.
- Route short/background tasks with `preferredMode: 'compact'` on the card.
- The veil assumes a `100dvh` viewport container and `overflow: hidden` at the root; host pages must not add their own vertical scroll inside the manifestation experience.
