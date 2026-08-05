import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

/**
 * SEIBottomNavigation — base bottom-navigation behavior ported from the
 * SEIHouse UI repo
 * (`UI/packages/seihouse-ui/src/layout/sei-bottom-navigation.tsx`,
 * inspected 2026-08-04).
 *
 * This is the behavior layer only: sticky bottom placement, safe-area bottom
 * padding, the icon + label tab layout, 44px+ touch targets, and the
 * `aria-current` / `data-selected` state hooks. It carries no Celestial
 * Library styling — the skin lives in `LibraryBottomNavigation`, which is
 * what pages should import.
 *
 * The original paints its glass surface and interactive colors from SEIHouse
 * `--sh-*` theme variables, which this repository does not carry; those stay
 * out of the base, exactly like the SEIButton port. `--sh-safe-bottom`
 * becomes the standard `env(safe-area-inset-bottom)` used across this app.
 *
 * The bar is presentational by design: the parent owns routing/state and
 * reacts through each item's `onSelect`.
 */

export interface SEIBottomNavigationItem {
  /** Stable id used as the React key and passed to `onSelect`. */
  id: string;
  /** Visible label rendered under the icon. */
  label: string;
  /** Decorative icon node (e.g. a Lucide icon), hidden from assistive tech. */
  icon: ReactNode;
  /** Marks the item as the current destination (`aria-current="page"`). */
  active?: boolean;
  /** Called with the item `id` when the item is selected. */
  onSelect?: (id: string) => void;
}

export interface SEIBottomNavigationProps extends HTMLAttributes<HTMLElement> {
  /** Accessible label for the navigation landmark (required for a11y). */
  'aria-label': string;
  /** Destinations rendered as icon + label tab buttons (3–5 works best). */
  items: SEIBottomNavigationItem[];
  /** Visually hide labels while keeping them available to screen readers. */
  showLabels?: boolean;
}

/**
 * The bar sticks to the viewport bottom while its page section is in view
 * and rests at its natural position at the end of the page. Footer action
 * strips above it should stay in flow (no sticky bottom offset) so the two
 * never overlap.
 */
export function SEIBottomNavigation({ items, className, showLabels = true, ...props }: SEIBottomNavigationProps) {
  return (
    <nav
      className={cn(
        'sticky bottom-0 z-20 w-full',
        'px-2 pt-2',
        'pb-[calc(0.5rem+env(safe-area-inset-bottom))]',
        className,
      )}
      {...props}
    >
      <div className="flex items-stretch justify-center gap-1">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            aria-current={item.active ? 'page' : undefined}
            data-selected={item.active ? 'true' : undefined}
            aria-label={item.label}
            onClick={() => item.onSelect?.(item.id)}
            className={cn(
              // `max-w-40` keeps tabs from stretching apart on tablet/desktop;
              // below the cap they still share the full width via `flex-1`.
              // `min-h-13` keeps every tab above the 44px touch-target floor.
              'flex min-h-13 min-w-0 max-w-40 flex-1 touch-manipulation flex-col items-center justify-center rounded-xl px-2 py-1.5',
              showLabels ? 'gap-1' : 'gap-0',
            )}
          >
            <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center">
              {item.icon}
            </span>
            <span className={showLabels ? 'max-w-full truncate' : 'sr-only'}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
