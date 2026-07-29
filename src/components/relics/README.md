# Relics UI

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** `src/components/UserProfileInventoryPanel.tsx`
- **Workshop preview:** `?preview=relics-gallery`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-29
- **Last source comparison:** 2026-07-29
- **Replica status:** faithful replica

## Workshop history

- **2026-07-29:** Created faithful Workshop replica, extracted RelicCard and RelicModal out of UserProfileInventoryPanel.tsx, mocked CosmicArtifact types and data, and separated by rank in the preview.
- **2026-07-29:** Added a Reveal button under each small relic that opens the full-screen Relic Reveal celebration flow (see `src/components/relic-reveal/`), plus a Workshop-only Replay Effects tool for fine-tuning the rarity effects.

## Replication Notes

- Extracted the visual treatment for `CosmicArtifact` objects, which appear as "Relic" cards in the inventory.
- Abstracted the `CosmicArtifact` interface into a local `types.ts` without including all full-stack types from `Light-Novels`.
- Discarded real cloud synchronization, Firebase API calls, and actual submission logic to keep this purely presentational.
- In `Light-Novels`, the relics are part of the `UserProfileInventoryPanel`. Here, they are isolated in `RelicCard` and `RelicModal` components for easier iteration and reusability.

## Later Transfer

- Copy `RelicCard.tsx` and `RelicModal.tsx` to `Light-Novels` if their visual behavior changes.
- Ensure the imports of `CosmicArtifact` point back to the real `src/types.ts` in `Light-Novels` instead of the local mock.
