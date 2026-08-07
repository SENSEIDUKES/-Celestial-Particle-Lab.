import React from 'react';

import { cn } from './cn';
import {
  BASE as LIBRARY_BUTTON_BASE,
  ICON_GLYPH_SIZE,
  SIZES as LIBRARY_BUTTON_SIZES,
  type LibraryButtonSize,
} from './LibraryButton';
import { SPECTRAL_EDGE } from './LibraryPanel';
import { SEIButton, type SEIButtonProps } from './SEIButton';

/**
 * ManifestButton — the Library's universal creation action.
 *
 * "Manifest" is the Library's creation language: every primary button that
 * brings something into being (a World Blueprint, a Story, a chapter) uses
 * this component with a label that names what it creates — "Manifest World
 * Blueprint", "Manifest Story", and so on. Secondary actions (Save, Edit,
 * Copy, Continue, Export) stay on the quieter `LibraryButton` variants.
 *
 * Behavior comes from `SEIButton` (loading, disabled, icon slots, accessible
 * naming) and the shape/rhythm is shared with `LibraryButton` (same BASE and
 * SIZES), so idle, hover, focus, loading, disabled, and mobile behavior match
 * the rest of the Library. The skin echoes the Library header emblem: a gold
 * rim over gilded obsidian, the spectral portal → violet → gold 1px conic
 * edge shared with `LibraryPanel` (SPECTRAL_EDGE), and the flowing SEIHouse
 * rainbow spectrum (the same gradient as the emblem and title plaque) masked
 * to a soft halo band just outside the button that brightens on hover and
 * while a manifestation is in flight.
 *
 * Usage:
 *   <ManifestButton onClick={manifest} loading={busy}>Manifest World Blueprint</ManifestButton>
 *   <ManifestButton size="md" fullWidth className="sm:w-auto">Manifest Story</ManifestButton>
 */

const MANIFEST_SKIN = [
  // Gilded obsidian body with a gold rim — the same warm dark as
  // LibraryButton primary, dark enough that the rim and halo carry the
  // emphasis; never a flat rainbow fill.
  'border border-gold-accent/55',
  'bg-[linear-gradient(180deg,rgba(24,20,12,0.97),rgba(6,6,9,0.97))]',
  'text-[#F4E8C6]',
  // Idle glow: gold-forward with portal/violet depth, echoing the emblem.
  'shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_0_14px_-2px_rgba(212,175,55,0.50),0_0_34px_-6px_rgba(4,172,255,0.22),0_0_44px_-10px_rgba(124,92,255,0.30)]',
  // Hover: rim and glow brighten across the spectrum.
  'hover:border-gold-accent/90 hover:text-[#FBF3DA]',
  'hover:shadow-[0_1px_0_0_rgba(255,255,255,0.09)_inset,0_0_20px_-2px_rgba(212,175,55,0.70),0_0_52px_-8px_rgba(124,92,255,0.40)]',
  'active:bg-[linear-gradient(180deg,rgba(16,13,8,0.98),rgba(4,4,6,0.98))]',
  // The iridescent 1px rim, shared with LibraryPanel. It wakes up on hover
  // and stays lit while a manifestation is in flight (aria-busy).
  SPECTRAL_EDGE,
  'hover:before:opacity-90 aria-busy:before:opacity-85',
  // The rainbow spectrum halo: the emblem's flowing gradient, masked to the
  // 5px band just outside the button (same mask-composite technique as
  // SPECTRAL_EDGE) so it reads as light bleeding off the rim, never a wash
  // over the body. Blurred soft; brightens on hover and while busy.
  'after:pointer-events-none after:absolute after:-inset-[5px] after:rounded-[inherit] after:p-[5px] after:content-[""]',
  'after:[background:linear-gradient(115deg,#04ACFF,#7C5CFF,rgba(212,175,55,0.75),#04ACFF)] after:[background-size:300%_300%]',
  'after:animate-[library-spectrum-flow_18s_ease-in-out_infinite] motion-reduce:after:animate-none',
  'after:[-webkit-mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)] after:[-webkit-mask-clip:content-box,border-box] after:[-webkit-mask-composite:xor]',
  'after:[mask-image:linear-gradient(#fff_0_0),linear-gradient(#fff_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude]',
  'after:opacity-40 after:blur-[5px]',
  'hover:after:opacity-75 hover:after:blur-[7px] aria-busy:after:opacity-60',
].join(' ');

export interface ManifestButtonOwnProps {
  /** Same size scale as `LibraryButton`; generation actions default to `lg`. */
  size?: LibraryButtonSize;
  /** Stretch to the container width — useful in mobile action bars. */
  fullWidth?: boolean;
}

export type ManifestButtonProps = SEIButtonProps & ManifestButtonOwnProps;

export const ManifestButton = React.forwardRef<HTMLButtonElement, ManifestButtonProps>(
  function ManifestButton({ size = 'lg', fullWidth = false, className, iconSize, ...props }, ref) {
    return (
      <SEIButton
        {...(props as SEIButtonProps)}
        ref={ref}
        iconSize={iconSize ?? ICON_GLYPH_SIZE[size]}
        data-variant="manifest"
        data-size={size}
        className={cn(
          LIBRARY_BUTTON_BASE,
          MANIFEST_SKIN,
          LIBRARY_BUTTON_SIZES[size],
          fullWidth && 'w-full',
          className,
        )}
      />
    );
  },
);
