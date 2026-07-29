# Closed-Door Cultivation Modal

- **Source repository:** SENSEIDUKES/Light-Novels
- **Source location:** src/components/IdleCultivationModal.tsx
- **Workshop preview:** `?preview=idle-cultivation`
- **Replica created:** 2026-07-29
- **Last Workshop update:** 2026-07-29
- **Last source comparison:** 2026-07-29
- **Replica status:** faithful replica

## Workshop history

- **2026-07-29:** Created faithful Workshop replica and local state simulator.

## Component Details

This is the modal UI shown when a user has passively earned "Qi" while away, presented as a cultivating figure. 

### What was copied
The entire SVG layout, particle flight animation (`motion/react` based), state transition logic for claiming, and styling.

### What was mocked
The `useAppStore` global state hook and Firebase `auth` + `awardDirectQi` methods were removed. 
The component now relies on passing `qiEarned`, `onClose`, and `onClaim` via props.

### Available Preview States
- No Qi (null)
- Qi Ready (expanded view)
- Qi Ready (collapsed floating action button)
- Claiming animation

### Production dependencies excluded
- Firebase Auth
- Zustand Global Store (`useAppStore`)
- Data fetching logic

### Exact files needed for transfer
- `IdleCultivationModal.tsx`
