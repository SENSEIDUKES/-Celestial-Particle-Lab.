# Celestial Library component set

Shared, reusable Library-skinned components. Not a Workshop preview feature —
these primitives back the feature replicas (Story Seed, Story Settings,
Relics, Reader surfaces) and transfer to production alongside them.

## Component ownership

`src/components/library/` is the single Workshop owner for the reusable
Celestial Library UI system:

- `LibraryButton`, `LibraryPanel`, and `LibraryNavigationDrawer`
- `LibraryBottomNavigation` — the mobile bottom navigation bar
- `LibraryTextBox` and `LibraryTextArea`
- `LibraryHeaderBadge` and its emblem/header spectrum treatments
- `SEIButton`, `SEIBottomNavigation`, `cn`, shared glass-field styles, and the
  Library spectrum styles
- the public `index.ts` exports used by feature consumers

Feature folders import these components from the Library barrel. They must not
keep local copies or compatibility barrels. Feature-only presentation remains
with the feature; for example, Story Seed owns only its workspace ambience in
`src/components/story-seed/development/story-seed.css`.

Reusable visual names use the `library-*` namespace:
`library-spectrum-glow`, `library-spectrum-flow`,
`library-title-presence`, and `library-subtitle-shimmer`. There are no legacy
`seed-*` aliases.

### Shared-component history

- **2026-08-04:** Ported `SEIBottomNavigation` from the SEIHouse UI repo and
  added `LibraryBottomNavigation`, the Celestial Library mobile bottom
  navigation skin. Story Seed is the first consumer (Sections / Settings /
  Profile); future Library pages import it from this barrel.
- **2026-08-04:** Consolidated `LibraryTextBox`, `LibraryTextArea`,
  `LibraryHeaderBadge`, the glass-field skin, and the shared spectrum styles
  from Story Seed into this canonical folder. Updated the public barrel and
  removed the Story Seed compatibility path without changing component APIs or
  presentation.

## LibraryTextBox and LibraryTextArea

The official single-line and multi-line Library fields. Both preserve the
existing controlled/uncontrolled behavior, forwarded refs, generated IDs,
accessible descriptions and errors, required markers, compact/comfortable
sizes, icon slots, completion state, and the shared glass skin.

Import them through the shared barrel:

```tsx
import { LibraryTextArea, LibraryTextBox } from '../../library';
```

## LibraryHeaderBadge

The reusable Library identity header: optional linked emblem, spectral aura,
luminous title, and optional shimmering subtitle. Its reduced-motion handling
and spectrum classes live in `library-spectrum.css`.

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
  black-blue depth with a top-light falloff, a crisp luminous cool border,
  strengthened inner rim lighting, and a gentle portal/gold rim glow that
  lifts the panel off the void page. A thin spectral ring — the SEIHouse
  portal → violet → gold spectrum on a conic gradient, masked to the outer
  1px (longhand masks only: the `mask` shorthand resets `mask-composite` and
  would wash the gradient over the whole panel) and screen-blended at low
  opacity — adds iridescent life along the top edge and corners without ever
  reading as a rainbow stripe. Premium, not flat black, not neon.
- `footer` has no SEIPanel equivalent: a bottom action strip with a crisp
  luminous top divider, a soft portal glow rising above the divider, a
  translucent dark body with its own top sheen, and backdrop blur. Render it
  as the last child of a `padding="none"` panel so the panel's
  `overflow-hidden` clips its corners to the panel radius.

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

- **2026-08-04:** Premium refinement pass toward the Celestial Library glass
  reference: crisper, brighter border; deeper body glass with a top-light
  falloff; strengthened inner rim lighting and page-separating rim glow; a
  thin masked spectral edge (SEIHouse portal → violet → gold) adding
  iridescent life along the top edge and corners; and a polished footer
  strip with a crisp luminous divider and soft upward glow. Story Seed
  markup untouched — the refinement is entirely inside the panel skin.
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
  sidebar renders the panel; mobile opens the drawer from the bottom
  navigation's Sections tab)
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

- The drawer's optional `profile` block is a placeholder capability for the
  future Library profile tab/menu access — it renders no account behavior.
  Story Seed no longer uses it: profile access lives in the bottom
  navigation's Profile tab, and the Story Seed drawer/sidebar render pure
  Story/World section navigation.

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

## LibraryBottomNavigation

The official mobile bottom navigation — a soft floating dock of icon + label
tabs skinned in the Celestial Library glass, reusable by any Library page.
Story Seed is the first consumer (Sections / Settings / Profile).

- **Source repository:** SENSEIDUKES UI repo (`UI`)
- **Source location:** `packages/seihouse-ui/src/layout/sei-bottom-navigation.tsx`
  (exports `SEIBottomNavigation` + `SEIBottomNavigationProps`, inspected 2026-08-04)
- **Workshop consumer:** `?preview=story-seed` (development fork — mobile
  bottom bar; Sections opens the existing section drawer, Settings opens the
  utility sheet, Profile is a placeholder)
- **Replica created:** 2026-08-04
- **Last Workshop update:** 2026-08-04
- **Last source comparison:** 2026-08-04
- **Replica status:** faithful port (re-skinned as the Celestial Library glass)

### What was ported

- The component shape: required `aria-label` landmark, `items` with stable
  `id` / `label` / decorative `icon` / `active` / `onSelect(id)`, and the
  presentational contract (the page owns routing/state).
- Sticky bottom placement, safe-area bottom padding, the icon-over-label tab
  layout, `max-w-40` tab cap with `flex-1` sharing below it, truncated labels,
  and the `aria-current="page"` / `data-selected` state hooks.
- 44px+ touch targets (`min-h-13` tab rows).

### What was adapted (stack differences from the source)

- Same split as `SEIButton` / `LibraryButton`: `SEIBottomNavigation.tsx`
  keeps structure and behavior only; the SEIHouse `--sh-*` glass and
  interactive colors stayed behind. `--sh-safe-bottom` became the standard
  `env(safe-area-inset-bottom)` used across this app (enabled by
  `viewport-fit=cover` in `index.html`).
- The skin (`LibraryBottomNavigation.tsx`) shapes the base's inner tab row
  into a soft floating dock — a rounded glass pill (`rounded-[1.5rem]`)
  inset 1rem from the screen edges, with a cool top sheen over translucent
  dark depth, a soft luminous border, backdrop blur, and a deep drop shadow
  with a faint portal tint. The outer `<nav>` stays a transparent sticky,
  safe-area-aware container. Tab styling applies from the nav down so the
  base stays unstyled: quiet cloud labels (Alegreya SC, small caps) in
  rounded bubble tabs that wake on hover, settle on press, and light portal
  blue with a soft inner glow when selected, with the standard portal focus
  ring.
- Compose guidance: render the dock as the last element of the page flow
  below the desktop breakpoint (`lg:hidden`) and keep any footer action
  strip in flow above it (no sticky bottom offset on the strip) so the two
  never overlap. The Story Seed Forge strip follows this.

### Usage

```tsx
import { LibraryBottomNavigation } from '../library';

<LibraryBottomNavigation
  aria-label="Story Seed navigation"
  className="lg:hidden"
  items={[
    { id: 'sections', label: 'Sections', icon: <List size={20} />, active: drawerOpen, onSelect: openDrawer },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, onSelect: openSettings },
  ]}
/>
```

### Workshop history

- **2026-08-04:** Restyled from a full-bleed bar into a soft floating dock:
  rounded glass pill inset from the screen edges, bubble tab radius, softer
  border, inner-glow portal active state. Same items contract and sticky,
  safe-area-aware behavior.
- **2026-08-04:** Ported `SEIBottomNavigation` from the UI repo, re-skinned it
  as the Celestial Library bottom navigation, and adopted it in Story Seed as
  the first integration proof.
