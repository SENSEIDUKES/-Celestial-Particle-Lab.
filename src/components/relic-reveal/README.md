# Relic Reveal (Artifact Celebration)

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/ModalsAndToasts.tsx` (the `unlockedArtifactAlert` full-screen celebration block, plus the rarity theme/effect constants at the top of the file)
- **Workshop preview:** `?preview=relics-gallery` (Reveal button under each relic)
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-29
- **Last source comparison:** 2026-07-29
- **Replica status:** faithful replica

## Workshop history

- **2026-07-29:** Created faithful Workshop replica of the full-screen Relic Reveal flow. Wired a Reveal button under each small relic in the Relics Gallery and added a Workshop-only Replay Effects tool.

## What was copied

The complete artifact celebration experience, preserved 1:1:

- mystery "Claim Relic / Tap to Reveal" card entrance and flip
- rarity theme ladder (Common → Transcendent) with per-rarity hex, halo, pulse, edge shimmer, warm glow, drift motes, brighter seal, and one-shot reveal flare
- ornate rotating relic sigil SVG (spinning assembly, counter-rotating tick ring, compass star core) with the relic-type icon at its heart
- celestial particle shower backdrop tinted to the rarity accent
- Qi/rarity stats box and the "Claim Relic" button
- reduced-motion handling and vibration patterns (`heavyTap` on reveal, `softTap` on claim)

## What was mocked

- The `useAppStore` reveal queue (`enqueueRelicReveal`, `popPendingRelic`, `canShowRelicInReader`) — the overlay is driven directly by preview state.
- `vibrate()` from `src/lib/vibration.ts` — replaced with an inline 7-line helper using the same patterns, so no library import is needed.
- Artifact data comes from `src/workshop/previews/relics/mockData.ts`.

## Preview states

- **mystery** — default when a Reveal button is clicked; tap the card to reveal.
- **revealed** — full rarity celebration. The Workshop-only "Replay Effects" button (bottom center) jumps straight here and replays the entrance + one-shot flare + particle ramp for fine-tuning.

## Reusable Workshop dependencies

- `src/CelestialParticleShower.tsx` (already in the Workshop, same `accent` prop API as the source).
- Tailwind theme tokens in `src/styles.css` (`portal`, `gold-accent` — added for this replica).

## Production dependencies intentionally excluded

- `useAppStore` / reveal queue, story engine, `react-focus-lock`, Firebase, persistence.

## Known visual differences from the source

- None known. Vibration is preserved via the same patterns. The Workshop Reveal/Replay buttons are preview chrome, not part of the source presentation.

## Files needed for later transfer

- `src/components/relic-reveal/RelicReveal.tsx` — the portable component.
- `src/components/relics/types.ts` — the `CosmicArtifact` interface (or point the import back to the real `src/types.ts` in Light-Novels).
- `src/CelestialParticleShower.tsx` — already exists in Light-Novels; do not overwrite without a diff.
- `--color-gold-accent: #D4AF37` theme token, if the target stylesheet lacks it.

## Transfer notes

- In Light-Novels this flow currently lives inline inside `ModalsAndToasts.tsx`; transferring back means extracting it into its own component and feeding it `unlockedArtifactAlert` + `dismissArtifactAlert` from the store instead of the `artifact` / `onClaim` props.
- The `replayKey` prop is a Workshop fine-tuning tool; it can be dropped or kept when transferring.
