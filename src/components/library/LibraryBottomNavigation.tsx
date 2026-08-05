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
 * file owns the Library skin: the footer-strip glass (crisp luminous top
 * divider, translucent dark body, backdrop blur, soft upward portal glow)
 * and quiet cloud tabs that light portal blue when selected.
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

// Surface — the same glass language as LibraryPanel's `footer` strip: crisp
// luminous top divider, a soft portal glow rising above it, translucent dark
// body with its own top sheen, and backdrop blur (lighter on small screens).
const SURFACE = [
  'border-t border-t-[rgba(190,216,255,0.22)]',
  '[background-image:linear-gradient(180deg,rgba(190,214,255,0.05),transparent_60%)]',
  'bg-[rgba(5,8,14,0.88)] supports-[backdrop-filter]:bg-[rgba(5,8,14,0.55)]',
  'backdrop-blur-md backdrop-saturate-150 sm:backdrop-blur-lg',
  'shadow-[0_-14px_32px_-18px_rgba(4,172,255,0.14)]',
].join(' ');

// Tabs — applied from the nav down so the base stays unstyled (the SEIButton
// port precedent). Quiet cloud labels that wake to ivory on hover, settle on
// press, and light portal blue when selected; one clean portal focus ring.
const TABS = [
  '[&_button]:cursor-pointer [&_button]:select-none',
  '[&_button]:font-sc [&_button]:text-[10px] [&_button]:font-bold [&_button]:uppercase [&_button]:leading-none [&_button]:tracking-[0.16em]',
  '[&_button]:text-neutral-400',
  '[&_button]:transition-[background,color,box-shadow] [&_button]:duration-150 [&_button]:motion-reduce:transition-none',
  '[&_button]:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-portal/70 [&_button]:focus-visible:ring-offset-2 [&_button]:focus-visible:ring-offset-black',
  '[&_button:hover]:bg-white/5 [&_button:hover]:text-neutral-200',
  '[&_button:active]:bg-white/[0.07]',
  '[&_button[data-selected=true]]:bg-portal/10 [&_button[data-selected=true]]:text-portal [&_button[data-selected=true]]:shadow-[0_0_14px_rgba(4,172,255,0.08)]',
].join(' ');

export function LibraryBottomNavigation({ className, ...props }: LibraryBottomNavigationProps) {
  return (
    <SEIBottomNavigation
      {...props}
      className={cn(SURFACE, TABS, className)}
    />
  );
}
