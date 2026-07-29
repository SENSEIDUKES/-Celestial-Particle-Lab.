# Closed-Door Cultivation Modal V2

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** src/components/IdleCultivationModal.tsx
- **Workshop preview:** `?preview=idle-cultivation-v2`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-29
- **Last source comparison:** 2026-07-29
- **Replica status:** under refinement

## Workshop history

- **2026-07-29:** Created faithful Workshop replica and local state simulator (kept unchanged as `IdleCultivationModal`, `?preview=idle-cultivation`, for side-by-side comparison).
- **2026-07-29:** Duplicated to V2 and reworked the visual space: soft dark ink aura behind the vignette and orb, viewport-fixed positioning with `env(safe-area-inset-bottom)` offsets, swipe pass-through with tap-only activation, shimmer/glow "collect me" cue on the cloud, claim particles visibly ascending from the cultivator, more opaque minimized orb, reduced-motion calming.
- **2026-07-29:** Redrew the cultivator silhouette as a seated meditator — distinct neck and shoulders, tapered torso, forearms folding into visible hands in the lap, and a low crossed-legs base with knees — while preserving the neon rim-light icon language (thin cyan strokes, navy robe gradient, platform rings).

## Component Details

V2 is a refinement variant of the Closed-Door Cultivation idle Qi reward. The original replica is intentionally left untouched so the two can be compared in the Workshop:

- Original: `?preview=idle-cultivation`
- This variant: `?preview=idle-cultivation-v2`

### What changed vs the original replica

- **Protected visual space:** a soft radial "ink aura" (dark gradient, blurred, no hard edges) sits behind the cloud + cultivator + label, and a smaller one behind the collapsed orb, so page artwork no longer competes with the presentation.
- **Viewport anchoring + safe area:** both states stay `position: fixed` and add `env(safe-area-inset-bottom)` to their bottom offsets, keeping the reward above phone browser controls.
- **Swipe vs tap:** the expanded vignette column is `pointer-events-none`; only the claim cloud accepts taps. Both interactive elements use `touch-action: manipulation`, so swipes scroll the page and only a deliberate tap activates.
- **Collect cue:** the cloud gains a pulsing halo, an SMIL shimmer sweep clipped to the cloud shape, a stronger drop-shadow, and a brighter "+N QI" glow.
- **Claim animation:** qi particles now originate at the cultivator figure and visibly ascend before curving into the target emblem; the figure dissolve is delayed slightly so the ascent reads first.
- **Minimized orb:** more opaque background (`/95` + stronger blur), brighter border, and a dark outer shadow ring.

### What was mocked

Same boundary as the original replica: no Firebase, no `useAppStore`, no persistence. `qiEarned`, `onClose`, and `onClaim` come in via props. The preview adds a workshop-only mock library grid (book covers, genre chips, progress rows) purely so collisions with realistic content can be judged.

### Available Preview States

- No Qi (null)
- +11 Qi / +350 Qi / +9999 Qi (expanded view; auto-collapses to orb after 7s)
- Claiming animation (tap the cloud)

### Production dependencies excluded

- Firebase Auth
- Zustand Global Store (`useAppStore`)
- Data fetching logic

### Known visual differences from the source

- The shimmer sweep, ink aura, safe-area offsets, and ascending-particle claim path exist only in V2; the production app still renders the original presentation.

### Exact files needed for transfer

- `IdleCultivationModalV2.tsx` (rename to `IdleCultivationModal.tsx` on transfer; export/prop names otherwise unchanged)
- The mock library grid in the preview is workshop-only — do not transfer.
