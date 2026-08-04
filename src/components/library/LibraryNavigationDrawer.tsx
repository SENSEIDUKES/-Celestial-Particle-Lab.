import React, { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';

import { cn } from './cn';
import { LibraryButton } from './LibraryButton';

/**
 * LibraryNavigationDrawer — the Celestial Library navigation drawer/menu shell.
 *
 * Ported from the SEIHouse UI repo's `SEINavigationDrawer`
 * (`UI/packages/seihouse-ui/src/layout/sei-navigation-drawer.tsx`, inspected
 * 2026-08-04). The original is built on the Base UI Dialog primitive and
 * SEIHouse theme CSS variables, which this repository does not carry; this
 * port keeps the same structure and mobile behavior (profile header, grouped
 * icon + label destinations, 44px rows, 85vw drawer capped at 20rem, scrim
 * tap / Escape / close button to dismiss, scroll lock, overscroll-contained
 * nav, safe-area bottom padding) on the Workshop stack: `motion` for the
 * slide transition and the Library theme tokens (void black, gold, portal
 * blue, Alegreya SC labels).
 *
 * The shell is presentational: the parent owns the open state, the selected
 * destination, and what happens on selection. `LibraryNavigationDrawerPanel`
 * is the content half and can also render standalone — e.g. as a static
 * desktop sidebar — while `LibraryNavigationDrawer` adds the mobile scrim and
 * slide-in behavior around it.
 *
 * The optional `profile` block at the top is a persistent placeholder for the
 * future Library profile tab/menu access. It renders no account behavior.
 */

export type LibraryNavigationDrawerAccent = 'portal' | 'gold';

export interface LibraryNavigationDrawerItem {
  /** Stable id used as the React key and passed to `onSelect`. */
  id: string;
  /** Visible label rendered next to the icon. */
  label: string;
  /** Decorative icon node (e.g. a Lucide icon), hidden from assistive tech. */
  icon?: React.ReactNode;
  /** Marks the item as the current destination (`aria-current="page"`). */
  active?: boolean;
  /** Active-row accent — portal blue or Library gold. Defaults to gold. */
  accent?: LibraryNavigationDrawerAccent;
  /** Renders a red `*` after the label for required destinations. */
  required?: boolean;
  /** Optional right-side status affordance (check, dot, chevron, …). */
  trailing?: React.ReactNode;
  /** Called with the item `id` when the item is selected. */
  onSelect?: (id: string) => void;
}

export interface LibraryNavigationDrawerSection {
  /** Stable id used as the React key. */
  id: string;
  /** Optional heading rendered above the section's items. */
  label?: string;
  /** Small secondary line under the heading. */
  tagline?: string;
  /** Decorative heading icon node, hidden from assistive tech. */
  icon?: React.ReactNode;
  /** Destinations grouped under this section. */
  items: LibraryNavigationDrawerItem[];
  /** Optional guidance rendered under the section's items. */
  footer?: React.ReactNode;
}

export interface LibraryNavigationDrawerProfile {
  /** Display name shown in the header; the first letter seeds the emblem. */
  name: string;
  /** Secondary line under the name (e.g. "Cultivator Profile"). */
  detail?: string;
  /** Custom emblem node. Defaults to a gold-rimmed initial medallion. */
  emblem?: React.ReactNode;
}

export interface LibraryNavigationDrawerPanelProps {
  /** Accessible label for the navigation landmark (required for a11y). */
  'aria-label': string;
  /** Grouped destinations rendered as icon + label rows. */
  sections: LibraryNavigationDrawerSection[];
  /** Optional profile placeholder pinned to the header. */
  profile?: LibraryNavigationDrawerProfile;
  /** When provided, a close button renders in the header. */
  onClose?: () => void;
  /** Accessible name for the header close button. */
  closeLabel?: string;
  className?: string;
}

const ROW_BASE = [
  // `py-3` keeps the row at a comfortable 44px+ touch target.
  'group flex w-full touch-manipulation items-center gap-3 rounded-xl border px-3 py-3 text-left',
  'transition-[background,border-color,color,box-shadow] duration-150',
  'motion-reduce:transition-none',
  'outline-none focus-visible:ring-2 focus-visible:ring-portal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
].join(' ');

const ROW_INACTIVE = 'border-transparent text-neutral-400 hover:bg-white/5 hover:text-neutral-200';

const ROW_ACTIVE: Record<LibraryNavigationDrawerAccent, string> = {
  portal: 'border-portal/50 bg-portal/10 text-signal shadow-[0_0_14px_rgba(4,172,255,0.08)]',
  gold: 'border-gold-accent/40 bg-gold-accent/10 text-signal shadow-[0_0_14px_rgba(212,175,55,0.10)]',
};

function DrawerRow({ item }: { item: LibraryNavigationDrawerItem }) {
  return (
    <button
      type="button"
      aria-current={item.active ? 'page' : undefined}
      data-selected={item.active ? 'true' : undefined}
      onClick={() => item.onSelect?.(item.id)}
      className={cn(ROW_BASE, item.active ? ROW_ACTIVE[item.accent ?? 'gold'] : ROW_INACTIVE)}
    >
      {item.icon ? (
        <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center">
          {item.icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate font-sc text-sm font-bold uppercase tracking-widest">
        {item.label}
        {item.required ? (
          <span className="ml-1 text-human" aria-label="required">*</span>
        ) : null}
      </span>
      {item.trailing ? (
        <span className="inline-flex shrink-0 items-center gap-1.5">{item.trailing}</span>
      ) : null}
    </button>
  );
}

/**
 * Presentational navigation content: an optional profile header with close
 * button, grouped icon + label destinations in a scrollable nav, and bottom
 * safe-area padding. Rendered inside `LibraryNavigationDrawer` on mobile;
 * also usable standalone (e.g. as a static desktop sidebar).
 */
export function LibraryNavigationDrawerPanel({
  sections,
  profile,
  onClose,
  closeLabel = 'Close menu',
  className,
  'aria-label': ariaLabel,
}: LibraryNavigationDrawerPanelProps) {
  const showHeader = Boolean(profile) || Boolean(onClose);

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      {showHeader ? (
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          {profile ? (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {profile.emblem ?? (
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-accent/40 bg-gold-accent/10 font-sc text-sm font-bold text-gold-accent"
                >
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate font-sc text-sm font-bold uppercase tracking-widest text-signal">
                  {profile.name}
                </span>
                {profile.detail ? (
                  <span className="block truncate font-sans text-[11px] text-neutral-500">
                    {profile.detail}
                  </span>
                ) : null}
              </span>
            </div>
          ) : (
            <span className="min-w-0 flex-1" />
          )}
          {onClose ? (
            <LibraryButton
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={closeLabel}
              icon={X}
            />
          ) : null}
        </div>
      ) : null}

      <nav
        aria-label={ariaLabel}
        className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <div className="space-y-6">
          {sections.map(section => (
            <div
              key={section.id}
              role={section.label ? 'group' : undefined}
              aria-label={section.label}
            >
              {section.label ? (
                <div className="mb-1.5 flex items-center gap-2 px-3">
                  {section.icon ? (
                    <span aria-hidden="true" className="inline-flex shrink-0 items-center">
                      {section.icon}
                    </span>
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-sc text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                      {section.label}
                    </p>
                    {section.tagline ? (
                      <p className="font-sans text-[10px] text-neutral-600">{section.tagline}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <ul className="space-y-1">
                {section.items.map(item => (
                  <li key={item.id}>
                    <DrawerRow item={item} />
                  </li>
                ))}
              </ul>
              {section.footer ? <div className="mt-2 px-3">{section.footer}</div> : null}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

export interface LibraryNavigationDrawerProps extends LibraryNavigationDrawerPanelProps {
  /** Controls visibility (controlled — the parent owns the state). */
  open: boolean;
  /** Called when the drawer asks to close (close button, Escape, scrim tap). */
  onClose: () => void;
  /**
   * Restrict the drawer to below the `lg` breakpoint (default true), where
   * the desktop layout renders `LibraryNavigationDrawerPanel` as a static
   * sidebar instead. Set false for surfaces that want the drawer on desktop.
   */
  mobileOnly?: boolean;
}

/**
 * Mobile navigation drawer that slides in from the left over a scrim.
 *
 * On phones the panel caps at 85vw so a scrim sliver (and its tap-to-close
 * affordance) stays visible; from `sm` up the compact 20rem width takes over.
 * Escape closes, body scroll locks while open, and the slide transition
 * collapses under `prefers-reduced-motion`. Presentational by design: the
 * parent owns selection state and closes via `onClose`.
 */
export function LibraryNavigationDrawer({
  open,
  onClose,
  mobileOnly = true,
  className,
  ...panelProps
}: LibraryNavigationDrawerProps) {
  const reduceMotion = useReducedMotion();

  // Escape closes the drawer — the Base UI original gets this from Dialog.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Lock body scroll while the drawer is open so only the nav list scrolls.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-[250]', mobileOnly && 'lg:hidden')}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label={panelProps['aria-label']}
            className={cn(
              'absolute inset-y-0 left-0 w-[85vw] max-w-xs border-r border-neutral-800 bg-neutral-950',
              'shadow-[0_40px_120px_rgba(0,0,0,0.55)]',
              className,
            )}
          >
            <LibraryNavigationDrawerPanel {...panelProps} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
