import type { ElementType, HTMLAttributes } from 'react';

import { cn } from './cn';

/**
 * LibraryPanel — the official Celestial Library panel.
 *
 * Ported from the SEIHouse UI repo's `SEIPanel`
 * (`UI/packages/seihouse-ui/src/primitives/sei-panel.tsx` +
 * `seiPanelVariants` in `UI/packages/seihouse-ui/src/styles/variants.ts`,
 * inspected 2026-08-04). The original composes `tailwind-variants` and the
 * SEIHouse `--sh-*` theme variables, which this repository does not carry;
 * this port keeps the same component shape (polymorphic `as`, `variant` +
 * `padding` props, `cn` composition) on plain class maps and the Library
 * theme tokens, following the LibraryButton / LibraryNavigationDrawer ports.
 *
 * The skin is SEIPanel's `glass` variant re-tuned to the Celestial Library
 * target: a modern dark glass surface — translucent black-blue depth, subtle
 * backdrop blur, soft rounded corners, a thin luminous border, a faint inner
 * top highlight, and a gentle portal/gold rim glow. Premium and cultivated;
 * never a flat black box, never neon.
 *
 * Variants are deliberately minimal:
 * - `default` — the main glass section container.
 * - `callout` — a quieter gold-tinted inset glass for guidance / notice
 *   blocks inside a panel.
 * - `footer` — a bottom action strip: luminous top divider, translucent dark
 *   body, backdrop blur. Render it as the last child of a `padding="none"`
 *   panel; the panel's `overflow-hidden` clips its corners to the panel
 *   radius. It has no rounding or outer border of its own.
 *
 * Usage:
 *   <LibraryPanel>…</LibraryPanel>
 *   <LibraryPanel variant="callout">…</LibraryPanel>
 *   <LibraryPanel padding="none">
 *     <main className="p-4 sm:p-8">…</main>
 *     <LibraryPanel variant="footer" padding="none" className="px-4 py-3.5">…</LibraryPanel>
 *   </LibraryPanel>
 */

export type LibraryPanelVariant = 'default' | 'callout' | 'footer';
export type LibraryPanelPadding = 'none' | 'sm' | 'md' | 'lg';

type LibraryPanelElement = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer';

const BASE = [
  // min-w-0 lets the panel shrink inside flex/grid tracks so long content is
  // contained instead of overflowing the layout (kept from SEIPanel).
  // Shape (radius / border / shadow) lives in the variants so the footer
  // strip never has to fight the base in CSS ordering.
  'relative min-w-0 overflow-hidden',
  'text-neutral-200',
  'transition-[background,border-color,box-shadow,color,opacity] duration-200 ease-out',
  'motion-reduce:transition-none',
].join(' ');

const VARIANTS: Record<LibraryPanelVariant, string> = {
  /** The main Celestial Library glass surface. */
  default: [
    'rounded-[1.35rem] border border-[rgba(165,198,255,0.16)]',
    // Sheen is an explicit background-image: a `bg-[gradient,color]` list
    // compiles to an invalid background-color and is dropped (SEIPanel note).
    '[background-image:linear-gradient(165deg,rgba(190,214,255,0.065),rgba(255,255,255,0.015)_42%)]',
    // Opaque enough for browsers without backdrop-filter support; the
    // translucent body is layered on behind a supports() guard (SEIPanel
    // glass technique).
    'bg-[rgba(7,10,17,0.94)] supports-[backdrop-filter]:bg-[rgba(7,10,17,0.62)]',
    // Lighter blur on small screens, where high-DPR mobile GPUs pay the most
    // for backdrop sampling; fuller blur from sm up.
    'backdrop-blur-md backdrop-saturate-150 sm:backdrop-blur-xl',
    // Faint inner top highlight + hairline inner rim, deep drop shadow, then
    // the restrained portal/gold rim glow.
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_0_0_1px_rgba(255,255,255,0.03),0_24px_70px_rgba(0,0,0,0.45),0_0_42px_rgba(4,172,255,0.08),0_0_90px_rgba(212,175,55,0.05)]',
  ].join(' '),

  /** Quieter gold-tinted inset glass for guidance / notice blocks. */
  callout: [
    'rounded-[1.35rem] border border-gold-accent/25',
    '[background-image:linear-gradient(180deg,rgba(212,175,55,0.075),rgba(212,175,55,0.028))]',
    'bg-[rgba(12,12,16,0.72)]',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_28px_rgba(212,175,55,0.05)]',
  ].join(' '),

  /**
   * Bottom action strip: no rounding or outer border of its own — the parent
   * panel clips it. Luminous top divider, translucent dark body, blur.
   */
  footer: [
    'border-t border-t-[rgba(165,198,255,0.14)]',
    'bg-[rgba(4,6,10,0.82)] supports-[backdrop-filter]:bg-[rgba(4,6,10,0.6)]',
    'backdrop-blur-md backdrop-saturate-150',
  ].join(' '),
};

const PADDING: Record<LibraryPanelPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export interface LibraryPanelProps extends HTMLAttributes<HTMLElement> {
  as?: LibraryPanelElement;
  variant?: LibraryPanelVariant;
  padding?: LibraryPanelPadding;
}

export function LibraryPanel({
  as = 'div',
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: LibraryPanelProps) {
  const Component = as as ElementType;

  return (
    <Component
      data-variant={variant}
      className={cn(BASE, VARIANTS[variant], PADDING[padding], className)}
      {...props}
    />
  );
}
