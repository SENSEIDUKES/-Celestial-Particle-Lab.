import { cn } from './cn';
import {
  SEIBottomNavigation,
  type SEIBottomNavigationItem,
  type SEIBottomNavigationProps,
} from './SEIBottomNavigation';

/**
 * LibraryBottomNavigation — the official Celestial Library bottom navigation.
 *
 * Behavior comes from `SEIBottomNavigation` (the SEIHouse base: sticky bottom
 * placement, safe-area padding, icon + label tabs, 44px+ touch targets,
 * `aria-current` / `data-selected` hooks, presentational `onSelect`). This
 * file owns the Library skin: a soft floating dock rather than a full-bleed
 * bar — the tab row becomes a rounded glass pill, slightly inset from the
 * screen edges and lifted off the device bezel, with a whisper of portal
 * light underneath. Quiet cloud tabs settle on press and light portal blue
 * when selected.
 *
 * Pages should import `LibraryBottomNavigation`, never the raw
 * `SEIBottomNavigation`. It is presentational: the page owns selection state
 * and reacts through each item's `onSelect`.
 *
 * Mobile-first: render it below the desktop breakpoint (where a sidebar or
 * header already covers wayfinding) as the last element of the page flow,
 * and keep any footer action strip in flow above it (no sticky bottom on
 * the strip) so the two stack without overlapping.
 *
 * Usage:
 *   <LibraryBottomNavigation
 *     aria-label="Story Seed navigation"
 *     className="lg:hidden"
 *     items={[
 *       { id: 'sections', label: 'Sections', icon: <List size={20} />, onSelect: openSections },
 *       { id: 'settings', label: 'Settings', icon: <Settings size={20} />, onSelect: openSettings },
 *     ]}
 *   />
 */

export type LibraryBottomNavigationItem = SEIBottomNavigationItem;
export type LibraryBottomNavigationProps = SEIBottomNavigationProps;

// Dock — applied to the base's inner tab row so the outer <nav> stays a
// transparent sticky container. The pill floats 1rem off the screen edges
// (base `px-2` + this `mx-2`) and clears the home indicator via the base's
// safe-area padding. Glass: a cool top sheen over translucent dark depth,
// a soft luminous border, backdrop blur, and a deep drop shadow with a
// faint portal tint separating the pill from the page.
const DOCK = [
  '[&>div]:mx-2 [&>div]:rounded-[1.5rem] [&>div]:p-1.5',
  '[&>div]:border [&>div]:border-[rgba(190,216,255,0.16)]',
  '[&>div]:[background-image:linear-gradient(180deg,rgba(205,225,255,0.06),transparent_55%)]',
  '[&>div]:bg-[rgba(8,12,20,0.82)] [&>div]:supports-[backdrop-filter]:bg-[rgba(8,12,20,0.58)]',
  '[&>div]:backdrop-blur-xl [&>div]:backdrop-saturate-150',
  '[&>div]:shadow-[0_18px_44px_-16px_rgba(0,0,0,0.75),0_0_28px_-10px_rgba(4,172,255,0.18),inset_0_1px_0_rgba(255,255,255,0.09)]',
].join(' ');

// Tabs — applied from the nav down so the base stays unstyled (the SEIButton
// port precedent). Rounded bubbles inside the dock: quiet cloud labels that
// wake to ivory on hover, settle on press, and light portal blue with a
// soft inner glow when selected; one clean portal focus ring.
const TABS = [
  '[&_button]:cursor-pointer [&_button]:select-none [&_button]:rounded-2xl',
  '[&_button]:font-sc [&_button]:text-[10px] [&_button]:font-bold [&_button]:uppercase [&_button]:leading-none [&_button]:tracking-[0.16em]',
  '[&_button]:text-neutral-400',
  '[&_button]:transition-[background,color,box-shadow] [&_button]:duration-150 [&_button]:motion-reduce:transition-none',
  '[&_button]:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-portal/70 [&_button]:focus-visible:ring-offset-2 [&_button]:focus-visible:ring-offset-black',
  '[&_button:hover]:bg-white/5 [&_button:hover]:text-neutral-200',
  '[&_button:active]:bg-white/[0.07]',
  '[&_button[data-selected=true]]:bg-portal/12 [&_button[data-selected=true]]:text-portal',
  '[&_button[data-selected=true]]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_16px_-6px_rgba(4,172,255,0.45)]',
].join(' ');

export function LibraryBottomNavigation({ className, ...props }: LibraryBottomNavigationProps) {
  return (
    <SEIBottomNavigation
      {...props}
      className={cn(DOCK, TABS, className)}
    />
  );
}
