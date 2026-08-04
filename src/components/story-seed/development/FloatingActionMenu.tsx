import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

export interface FloatingActionMenuAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  disabled?: boolean;
  title?: string;
  /** Momentary confirmation state (e.g. "Saved") that swaps label and icon. */
  active?: boolean;
  activeLabel?: string;
  activeIcon?: LucideIcon;
}

/**
 * FloatingActionMenu — the Story Seed floating action menu.
 *
 * A circular Ⓢ trigger keeps the workspace header completely clear; tapping
 * it fans the secondary actions (Save, Import) upward above the sticky Forge
 * bar. The trigger never morphs into an "X" — the Ⓢ mark stays in place and
 * simply lights up portal blue while the menu is open. Tapping anywhere
 * outside, pressing Escape, or choosing an action closes the menu.
 *
 * Styling follows the Celestial Library skins from `LibraryButton` (obsidian
 * surfaces, gold rim, portal hover) so the menu reads as native product UI,
 * not a Workshop control.
 */
export function FloatingActionMenu({ actions }: { actions: FloatingActionMenuAction[] }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.16;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      {/* Click-catcher only — no scrim, so the workspace stays fully visible
          and usable-looking while the menu is open. */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Clears the sticky Forge action bar (≈76px) with room to breathe. */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2.5 sm:right-6">
        <AnimatePresence>
          {open &&
            actions.map((action, index) => {
              const Icon = action.active && action.activeIcon ? action.activeIcon : action.icon;
              const label = action.active && action.activeLabel ? action.activeLabel : action.label;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration, ease: 'easeOut', delay: reduceMotion ? 0 : index * 0.045 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      action.onSelect();
                    }}
                    disabled={action.disabled}
                    title={action.title}
                    className={[
                      'flex items-center gap-2 rounded-full border px-4 py-2.5 backdrop-blur-sm',
                      'font-sc text-[11px] font-bold uppercase leading-none tracking-[0.14em]',
                      'transition-[background,border-color,box-shadow,color,opacity,transform] duration-200 ease-out',
                      'active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0',
                      'outline-none focus-visible:ring-2 focus-visible:ring-portal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                      'disabled:pointer-events-none disabled:opacity-45',
                      action.active
                        ? 'border-portal/60 bg-portal/10 text-portal shadow-[0_0_16px_-6px_rgba(4,172,255,0.6)]'
                        : 'border-neutral-800 bg-neutral-950/90 text-neutral-200 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.8)] hover:border-portal/60 hover:text-portal hover:shadow-[0_0_16px_-6px_rgba(4,172,255,0.6)]',
                    ].join(' ')}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                </motion.div>
              );
            })}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? 'Close story actions' : 'Open story actions'}
          className={[
            'relative flex h-14 w-14 items-center justify-center rounded-full border',
            'transition-[background,border-color,box-shadow,color,transform] duration-200 ease-out',
            'active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0',
            'outline-none focus-visible:ring-2 focus-visible:ring-portal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            open
              ? 'border-portal/70 bg-[linear-gradient(180deg,rgba(10,22,32,0.97),rgba(6,8,12,0.97))] text-portal shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_0_22px_-4px_rgba(4,172,255,0.65)]'
              : 'border-gold-accent/45 bg-[linear-gradient(180deg,rgba(34,28,14,0.96),rgba(9,9,11,0.96))] text-[#F4E8C6] shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_12px_30px_-14px_rgba(212,175,55,0.55)] hover:border-gold-accent/85 hover:text-[#FBF3DA] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_0_18px_-4px_rgba(212,175,55,0.55),0_16px_38px_-16px_rgba(4,172,255,0.45)]',
          ].join(' ')}
        >
          <span aria-hidden="true" className="font-display text-2xl leading-none">
            S
          </span>
        </button>
      </div>
    </>
  );
}
