import React from 'react';

import { cn } from './cn';
import { SEIButton, type SEIButtonProps } from './SEIButton';

/**
 * LibraryButton — the official Celestial Library button.
 *
 * Behavior comes from `SEIButton` (the SEIHouse base: safe defaults, loading,
 * disabled, icon slots, accessible naming). This file owns the Library skin:
 * a dark mystical surface, gold/portal glow, and a calm press response.
 *
 * Pages should import `LibraryButton`, never the raw `SEIButton`. If a page
 * needs a different look, add a variant here rather than passing one-off
 * Tailwind classes from the page.
 *
 * Usage:
 *   <LibraryButton onClick={save} icon={Bookmark}>Save Draft</LibraryButton>
 *   <LibraryButton variant="primary" size="lg" loading={busy}>Forge</LibraryButton>
 *   <LibraryButton variant="ghost" size="icon" icon={X} aria-label="Close" />
 */

export type LibraryButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type LibraryButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BASE = [
  // Shape and rhythm
  'relative isolate rounded-lg font-sc font-bold uppercase leading-none tracking-[0.14em]',
  'select-none cursor-pointer',
  // Motion — settle on press, restrained lift on hover.
  'transition-[background,border-color,box-shadow,color,opacity,transform] duration-200 ease-out',
  'active:translate-y-px',
  'motion-reduce:transition-none motion-reduce:active:translate-y-0',
  // Focus — one clean portal ring everywhere, on any dark backdrop.
  'outline-none focus-visible:ring-2 focus-visible:ring-portal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
  // Disabled / busy
  'disabled:pointer-events-none disabled:opacity-45',
  'aria-busy:cursor-progress',
  // Icon-only buttons stay square regardless of size.
  'data-[icon-only=true]:aspect-square data-[icon-only=true]:px-0',
].join(' ');

const VARIANTS: Record<LibraryButtonVariant, string> = {
  /** The single strongest action on a view — gilded obsidian with a lit rim. */
  primary: [
    'border border-gold-accent/45',
    'bg-[linear-gradient(180deg,rgba(34,28,14,0.96),rgba(9,9,11,0.96))]',
    'text-[#F4E8C6]',
    'shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_12px_30px_-14px_rgba(212,175,55,0.55)]',
    'hover:border-gold-accent/85 hover:text-[#FBF3DA]',
    'hover:shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_0_18px_-4px_rgba(212,175,55,0.55),0_16px_38px_-16px_rgba(4,172,255,0.45)]',
    'active:bg-[linear-gradient(180deg,rgba(24,20,10,0.98),rgba(6,6,8,0.98))]',
  ].join(' '),

  /** Supporting actions — quiet obsidian panel that wakes to portal blue. */
  secondary: [
    'border border-neutral-800 bg-neutral-950/85 text-neutral-200',
    'shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]',
    'hover:border-portal/60 hover:text-portal',
    'hover:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_0_16px_-6px_rgba(4,172,255,0.6)]',
    'active:bg-neutral-900',
  ].join(' '),

  /** Inline, low-weight actions that should not compete with the page. */
  ghost: [
    'border border-transparent bg-transparent text-neutral-400',
    'hover:border-white/10 hover:bg-white/[0.04] hover:text-portal',
    'active:bg-white/[0.07]',
  ].join(' '),

  /** Destructive or irreversible actions only. */
  danger: [
    'border border-human/60 bg-human-brand/25 text-[#FFD9D9]',
    'shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]',
    'hover:border-human hover:bg-human-brand/45 hover:text-signal',
    'hover:shadow-[0_0_18px_-6px_rgba(255,51,51,0.65)]',
    'active:bg-human-brand/60',
  ].join(' '),
};

/**
 * Heights clear the 44px comfortable tap target at `md` and above; `sm` is for
 * dense toolbars where the control sits alongside other small controls.
 */
const SIZES: Record<LibraryButtonSize, string> = {
  sm: 'min-h-9 gap-1.5 px-3 py-1.5 text-[11px]',
  md: 'min-h-11 gap-2 px-4 py-2 text-xs',
  lg: 'min-h-12 gap-2.5 px-5 py-2.5 text-sm sm:px-7',
  icon: 'min-h-11 min-w-11 gap-0 p-0 text-xs',
};

const ICON_GLYPH_SIZE: Record<LibraryButtonSize, number> = {
  sm: 13,
  md: 15,
  lg: 17,
  icon: 18,
};

export interface LibraryButtonOwnProps {
  variant?: LibraryButtonVariant;
  size?: LibraryButtonSize;
  /** Stretch to the container width — useful in mobile action bars. */
  fullWidth?: boolean;
}

export type LibraryButtonProps = SEIButtonProps & LibraryButtonOwnProps;

export const LibraryButton = React.forwardRef<HTMLButtonElement, LibraryButtonProps>(
  function LibraryButton(
    { variant = 'secondary', size = 'md', fullWidth = false, className, iconSize, ...props },
    ref,
  ) {
    return (
      <SEIButton
        {...(props as SEIButtonProps)}
        ref={ref}
        iconSize={iconSize ?? ICON_GLYPH_SIZE[size]}
        data-variant={variant}
        data-size={size}
        className={cn(
          BASE,
          VARIANTS[variant],
          SIZES[size],
          fullWidth && 'w-full',
          className,
        )}
      />
    );
  },
);
