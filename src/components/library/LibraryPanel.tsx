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
 * target: a modern dark glass surface — translucent black-blue depth with a
 * top-light falloff, subtle backdrop blur, soft rounded corners, a crisp
 * luminous border, a strengthened inner top highlight, and a gentle
 * portal/gold rim glow that separates the panel from the page. A thin
 * spectral ring (the SEIHouse portal → violet → gold spectrum on a masked
 * 1px conic edge, screen-blended at low opacity) adds iridescent life along
 * select edges and corners — an accent, never a rainbow stripe. Premium and
 * cultivated; never a flat black box, never neon.
 *
 * Variants are deliberately minimal:
 * - `default` — the main glass section container.
 * - `callout` — a quieter gold-tinted inset glass for guidance / notice
 *   blocks inside a panel.
 * - `footer` — a bottom action strip: luminous top divider with a soft
 *   upward glow, translucent dark body, backdrop blur. Render it as the last
 *   child of a `padding="none"` panel; the panel's `overflow-hidden` clips
 *   its corners to the panel radius. It has no rounding or outer border of
 *   its own.
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

/**
 * The spectral edge ring: the SEIHouse spectrum (portal #04ACFF → violet
 * #7C5CFF → gold #D4AF37) painted on a conic gradient, then masked down to
 * the outer 1px so it reads as iridescence inside the border itself. The
 * light is concentrated across the top edge and the corners; the bottom edge
 * stays nearly quiet. Screen blend + low opacity keep it folded into the
 * cool glass lighting instead of sitting on top of it.
 */
export const SPECTRAL_EDGE = [
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:p-px',
  "before:content-['']",
  'before:[background:conic-gradient(from_0deg_at_50%_50%,rgba(198,224,255,0.34)_0deg,rgba(4,172,255,0.24)_24deg,rgba(124,92,255,0.22)_52deg,rgba(212,175,55,0.17)_78deg,rgba(4,172,255,0.06)_112deg,transparent_150deg,rgba(212,175,55,0.13)_166deg,transparent_196deg,rgba(4,172,255,0.05)_226deg,rgba(4,172,255,0.15)_252deg,rgba(4,172,255,0.06)_286deg,rgba(124,92,255,0.15)_322deg,rgba(150,200,255,0.24)_348deg,rgba(198,224,255,0.34)_360deg)]',
  // Longhand masks only — the `mask` shorthand resets `mask-composite` to
  // `add`, and Tailwind orders the shorthand after the longhand, which would
  // wash the gradient over the whole panel instead of clipping it to the
  // outer 1px ring.
  'before:[-webkit-mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)] before:[-webkit-mask-clip:content-box,border-box] before:[-webkit-mask-composite:xor]',
  'before:[mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)] before:[mask-clip:content-box,border-box] before:[mask-composite:exclude]',
  'before:opacity-55 before:mix-blend-screen',
].join(' ');

const VARIANTS: Record<LibraryPanelVariant, string> = {
  /** The main Celestial Library glass surface. */
  default: [
    // Crisp luminous border — bright enough to read against the void page.
    'rounded-[1.35rem] border border-[rgba(190,216,255,0.26)]',
    // Body depth: a cool top light falling off into the dark, over a soft
    // sheen. Gradients are an explicit background-image: a
    // `bg-[gradient,color]` list compiles to an invalid background-color and
    // is dropped (SEIPanel note).
    '[background-image:radial-gradient(130%_100%_at_50%_0%,rgba(130,180,255,0.09),transparent_52%),linear-gradient(168deg,rgba(205,225,255,0.09),rgba(255,255,255,0.02)_40%,rgba(3,6,12,0.14))]',
    // Opaque enough for browsers without backdrop-filter support; the
    // translucent body is layered on behind a supports() guard (SEIPanel
    // glass technique).
    'bg-[rgba(8,12,20,0.95)] supports-[backdrop-filter]:bg-[rgba(8,12,20,0.60)]',
    // Lighter blur on small screens, where high-DPR mobile GPUs pay the most
    // for backdrop sampling; fuller blur from sm up.
    'backdrop-blur-md backdrop-saturate-150 sm:backdrop-blur-xl',
    // Inner rim lighting (bright top highlight, faint cool bottom rim,
    // hairline inner edge), then near-field + deep drop shadow and the
    // portal/gold rim glow that lifts the panel off the page.
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(150,195,255,0.07),inset_0_0_0_1px_rgba(255,255,255,0.045),0_2px_10px_rgba(0,0,0,0.5),0_28px_80px_rgba(0,0,0,0.55),0_0_52px_rgba(4,172,255,0.12),0_0_110px_rgba(212,175,55,0.06)]',
    SPECTRAL_EDGE,
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
   * panel clips it. Crisp luminous top divider, a soft portal glow rising
   * above it, and a translucent dark body with its own top sheen so the
   * strip reads as polished glass separating from the content.
   */
  footer: [
    'border-t border-t-[rgba(190,216,255,0.22)]',
    '[background-image:linear-gradient(180deg,rgba(190,214,255,0.05),transparent_60%)]',
    'bg-[rgba(5,8,14,0.88)] supports-[backdrop-filter]:bg-[rgba(5,8,14,0.55)]',
    'backdrop-blur-md backdrop-saturate-150 sm:backdrop-blur-lg',
    'shadow-[0_-14px_32px_-18px_rgba(4,172,255,0.14)]',
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
