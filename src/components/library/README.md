# Celestial Library component set

Shared, reusable Library-skinned components. Not a Workshop preview feature —
these primitives back the feature replicas (Story Seed, Story Settings,
Relics, Reader surfaces) and transfer to production alongside them.

## LibraryNavigationDrawer

Navigation drawer/menu shell used as the Story Seed section menu and reusable
by future Library pages.

- **Source repository:** SENSEIDUKES UI repo (`UI`)
- **Source location:** `packages/seihouse-ui/src/layout/sei-navigation-drawer.tsx`
  (exports `SEINavigationDrawer` + `SEINavigationDrawerPanel`, inspected 2026-08-04)
- **Workshop consumer:** `?preview=story-seed` (development fork — desktop
  sidebar renders the panel; mobile opens the drawer from the Sections button)
- **Replica created:** 2026-08-04
- **Last Workshop update:** 2026-08-04
- **Last source comparison:** 2026-08-04
- **Replica status:** faithful port (adapted to the Workshop stack)

### What was ported

- Profile/account header with optional close button.
- Grouped icon + label destinations with section headings and taglines.
- 44px+ touch-target rows, truncated labels, `aria-current="page"` active
  state, and a right-side status/trailing slot.
- Mobile drawer behavior: slides in over a scrim, 85vw width capped at 20rem,
  scrim tap / Escape / close button dismissal, body scroll lock,
  overscroll-contained nav, safe-area bottom padding.

### What was adapted (stack differences from the source)

- The source builds on the Base UI `Dialog` primitive (focus trap, scroll
  lock, Escape) and SEIHouse theme CSS variables. This port uses `motion`
  (already a Workshop dependency) for the scrim/slide transition, a small
  Escape listener + body scroll lock, and the Library theme tokens
  (`void`, `signal`, `portal`, `gold-accent`, `human`, `font-sc`).
- Active-row accents are Library-native: `portal` (blue) and `gold`.
- No focus trap — the Base UI Dialog provided it. If production adopts
  `@seihouse/ui` directly, re-base this on the real `SEINavigationDrawer`
  instead of maintaining the port.

### Mocked

- The `profile` block is a persistent placeholder for the future Library
  profile tab/menu access. It has no account/auth behavior; the Story Seed
  consumer renders `SENSEI` / `Cultivator Profile` with a gold initial
  medallion.

### Usage

```tsx
import {
  LibraryNavigationDrawer,
  LibraryNavigationDrawerPanel,
} from '../library';

// Desktop sidebar — the panel stands alone:
<LibraryNavigationDrawerPanel aria-label="…" profile={…} sections={…} />

// Mobile drawer — controlled by the parent:
<LibraryNavigationDrawer
  open={open}
  onClose={() => setOpen(false)}
  aria-label="…"
  profile={…}
  sections={…}
/>
```

### Workshop history

- **2026-08-04:** Ported `SEINavigationDrawer` from the UI repo and adopted it
  as the Story Seed section menu shell (desktop sidebar + mobile drawer).
