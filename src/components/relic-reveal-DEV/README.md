# Relic Reveal — DEV

- **Copy of:** `src/components/relic-reveal/RelicReveal.tsx` (the faithful replica, kept untouched as the reference)
- **Ultimate source:** SENSEIDUKES/Light-Novels `src/components/ModalsAndToasts.tsx`
- **Workshop preview:** `?preview=relics-dev`
- **Replica created:** 2026-07-30
- **Replica status:** active UI-work copy — iterate here first

## What this copy is for

UI work on the relic reveal sequence happens here, so the reference replica
(and by extension the production flow in Light-Novels) stays stable as a
comparison point. When a change is approved in this DEV copy, port it back to
the reference replica, then to Light-Novels.

## Differences from the reference copy (2026-07-30 cleanup pass)

1. **Rank background theme lighting only appears after the reveal.** The
   celestial particle backdrop stays rank-neutral while the card is sealed;
   the rarity tint arrives with the reveal instead of spoiling it.
2. **The initial Claim Relic card is rebuilt as the closed face of the final
   premium card** — same frame, hairline border, and rotating sigil rendered
   in the neutral sealed tone, with a shield wax-seal core — replacing the
   placeholder grid panel.
3. **The bottom-right info box no longer repeats the rank.** It names the
   artifact type ("Relic") only; the rank lives in the header label.
4. **Sparks shake loose during the reveal spin** — a deterministic one-shot
   burst flung outward from the card rim as it rotates open (disabled under
   reduced motion).

## Unchanged from the reference

- Rarity theme ladder, effect flags, drift motes, reveal flare, edge shimmer
- Ornate sigil SVG assembly and twinkling motes
- Reveal/claim interaction flow, vibration patterns, reduced-motion handling
- `replayKey` workshop tool and `artifact` / `onClaim` / `onDismiss` props
