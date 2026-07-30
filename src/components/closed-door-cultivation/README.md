# Closed-Door Cultivation

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/IdleCultivationModal.tsx`
- **Workshop preview:** `?preview=idle-cultivation`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-30
- **Last source comparison:** 2026-07-29
- **Replica status:** under refinement

## Workshop history

- **2026-07-29:** Created faithful Workshop replica and local state simulator.
- **2026-07-29:** Duplicated into a second variant to redesign the idle Qi reward's protected visual space, safe-area anchoring, swipe pass-through, collect cues, and ascending claim particles.
- **2026-07-29:** Redrew the cultivator silhouette as a seated meditator with distinct neck, shoulders, and folded hands, and added a full-viewport dim + blur scrim behind the expanded vignette.
- **2026-07-29:** Reorganized into the standard feature workspace layout — `reference/` (untouched replica) and `development/` (the redesigned variant, formerly a separate "V2" duplicate) under one `?preview=idle-cultivation` route, switched with the Original Reference / Development / Compare control instead of a second homepage card.
- **2026-07-30:** Layout optimization pass (SEIHouse Layout Optimization): tablet now anchors bottom-right while keeping the 6rem bottom-nav clearance (desktop's 1.5rem corner offset moves to `lg:`), and the cloud, cultivator figure, ink aura, QI text, label, and collapsed orb scale up fluidly across `sm`/`lg` instead of staying at mobile pixel sizes.
- **2026-07-30:** Added a progression block above the Qi cloud in Development — "DAYS CULTIVATING", the day count, and a quote that escalates through 20 tenure milestones (under 1 day → 180 days) via the new optional `daysCultivating` prop, with five timeless quotes mixed in at a 25% roll per reward cycle. The block fades out with the claim animation. Preview mocks `daysCultivating={7}`.
- **2026-07-30:** Shortened the post-claim hold from 2.4s to 1.9s (`CLAIM_CLOSE_MS`) so the scrim and vignette release about half a second sooner once the qi flight and emblem glow have finished.
- **2026-07-30:** Performance pass (SEIHouse Components Performance): added a low-power heuristic (reduced motion or ≤4 CPU cores) that skips the full-viewport backdrop blur and trims the claim particle burst from 26 to 12; a failed `onClaim` now restores the vignette for retry instead of closing and silently losing the reward; pending close timers are cleared when a reward cycle resets or a new claim starts.

## Folder layout

```
reference/IdleCultivationModal.tsx    — untouched replica of production, locked
development/IdleCultivationModal.tsx  — active Workshop version, starts as a copy of reference
```

Both are rendered inside `src/workshop/previews/closed-door-cultivation/ClosedDoorCultivationWorkspace.tsx`, which shares one mock library backdrop, emblem target, and preview-state control panel between them via `FeatureWorkspace`.

## What was copied

The entire SVG cultivator, particle flight animation (`motion/react`), claim/collapse state machine, and styling from `IdleCultivationModal.tsx` in Light-Novels.

## What changed in Development vs Reference

- Protected visual space: a soft radial "ink aura" sits behind the cloud, cultivator, and label so page artwork no longer competes with the presentation.
- Viewport anchoring + safe area: both states stay `position: fixed` and add `env(safe-area-inset-bottom)` to their bottom offsets.
- Swipe vs tap: the expanded vignette column is `pointer-events-none`; only the claim cloud and cultivator accept taps.
- Collect cue: pulsing halo, shimmer sweep, brighter "+N QI" glow.
- Claim animation: qi particles originate at the cultivator figure and visibly ascend before curving into the target emblem.
- Minimized orb: more opaque background, brighter border, dark outer shadow ring.
- Redrawn cultivator silhouette: distinct neck/shoulders, tapered torso, folded hands, low crossed-legs base.

## What was mocked

The `useAppStore` global state hook and Firebase `auth` + `awardDirectQi` methods were removed in both versions. Each relies on `qiEarned`, `onClose`, and `onClaim` passed via props. The preview adds a workshop-only mock library grid purely so collisions with realistic content can be judged in Development.

### Available Preview States

- No Qi (hidden)
- +11 Qi / +350 Qi / +9999 Qi (auto-collapses to a floating orb after 7s)
- Claiming animation (tap the cloud)

### Production dependencies excluded

- Firebase Auth
- Zustand Global Store (`useAppStore`)
- Data fetching logic

### Exact files needed for transfer

- `development/IdleCultivationModal.tsx` (once approved) → `IdleCultivationModal.tsx` in Light-Novels.
- The mock library grid in the preview is workshop-only — do not transfer.

## Lifecycle

1. **Import** — copy production's current implementation into `reference/`.
2. **Fork once** — `development/` starts as a copy of `reference/`.
3. **Refine** — every Workshop task modifies `development/` only.
4. **Approve** — once approved, transfer `development/` back to Light-Novels.
5. **Resynchronize** — refresh `reference/` from the newly integrated production code, record the new comparison date, and reset `development/` for the next redesign cycle. There is no V2/V3 — only "what production currently is" vs "what we are currently trying to make it become."
