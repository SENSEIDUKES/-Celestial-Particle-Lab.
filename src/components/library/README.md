# Celestial Library component set

Shared, reusable Library-skinned components. Not a Workshop preview feature —
these primitives back the feature replicas (Story Seed, Story Settings,
Relics, Reader surfaces) and transfer to production alongside them.

## LibraryPanel

Glass panel shell — the official Celestial Library section container (main
content surfaces, guidance callouts, footer action strips).

- **Source repository:** SENSEIDUKES UI repo (`UI`)
- **Source location:** `packages/seihouse-ui/src/primitives/sei-panel.tsx`
  (exports `SEIPanel` + `SEIPanelProps`) with `seiPanelVariants` in
  `packages/seihouse-ui/src/styles/variants.ts` (inspected 2026-08-04)
- **Workshop consumer:** `?preview=story-seed` (development fork — the
  two-panel creation workspace shell and its action-bar footer strip)
- **Replica created:** 2026-08-04
- **Last Workshop update:** 2026-08-04
- **Last source comparison:** 2026-08-04
- **Replica status:** faithful port (re-skinned as the Celestial Library glass)

### What was ported

- The component shape: polymorphic `as` (div / section / article / aside /
  header / footer), `variant` + `padding` props, `cn` composition, and the
  `min-w-0 overflow-hidden` containment base.
- The SEIPanel `glass` variant technique: the sheen is an explicit
  `background-image` layer (a `bg-[gradient,color]` list compiles to an
  invalid `background-color` and is dropped); the base color stays opaque
  enough for browsers without `backdrop-filter`, with the translucent body
  layered on behind a `supports-[backdrop-filter]` guard; blur is lighter on
  small screens and fuller from `sm` up.

### What was adapted (stack differences from the source)

- No `tailwind-variants` dependency — plain Record class maps, same pattern
  as `LibraryButton`.
- SEIHouse `--sh-*` theme variables → Library theme tokens (`portal`,
  `gold-accent`, neutral ink).
- Variants trimmed to `default` / `callout` / `footer`; SEIPanel's
  `interactive` and `glow` props were intentionally not carried over.
- The glass is re-skinned to the Celestial Library target: translucent
  black-blue depth, thin luminous cool border, faint inner top highlight,
  and a gentle portal/gold rim glow — premium, not flat black, not neon.
- `footer` has no SEIPanel equivalent: a bottom action strip with a luminous
  top divider, translucent dark body, and backdrop blur. Render it as the
  last child of a `padding="none"` panel so the panel's `overflow-hidden`
  clips its corners to the panel radius.

### Usage

```tsx
import { LibraryPanel } from '../library';

// Main section container:
<LibraryPanel>…</LibraryPanel>

// Guidance / notice block inside a panel:
<LibraryPanel variant="callout">…</LibraryPanel>

// Section shell with a footer action strip:
<LibraryPanel padding="none">
  <main className="p-4 sm:p-8">…</main>
  <LibraryPanel variant="footer" padding="none" className="px-4 py-3.5">…</LibraryPanel>
</LibraryPanel>
```

### Workshop history

- **2026-08-04:** Ported `SEIPanel` from the UI repo, re-skinned it as the
  Celestial Library glass, and adopted it as the Story Seed
  creation-workspace shell (main glass container + action-bar footer strip).

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
