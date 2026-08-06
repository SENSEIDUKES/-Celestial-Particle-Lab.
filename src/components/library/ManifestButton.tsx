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
 * the rest of the Library. The skin is the spectral rainbow: the SEIHouse
 * portal → violet → gold spectrum on the masked 1px conic edge shared with
 * `LibraryPanel` (SPECTRAL_EDGE), over a deep obsidian body with a restrained
 * portal/violet/gold glow that brightens on hover and while a manifestation
 * is in flight.
 *
 * Usage:
 *   <ManifestButton onClick={manifest} loading={busy}>Manifest World Blueprint</ManifestButton>
 *   <ManifestButton size="md" fullWidth className="sm:w-auto">Manifest Story</ManifestButton>
 */

const MANIFEST_SKIN = [
  // Deep obsidian body with a cool tint — dark enough that the spectral rim
  // carries the emphasis, never a flat rainbow fill.
  'border border-portal/35',
  'bg-[linear-gradient(180deg,rgba(12,18,30,0.97),rgba(5,6,10,0.97))]',
  'text-[#E9F3FF]',
  // Idle glow: portal core, violet mid-field, faint gold depth.
  'shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_0_16px_-6px_rgba(4,172,255,0.55),0_0_26px_-10px_rgba(124,92,255,0.45),0_14px_32px_-18px_rgba(212,175,55,0.40)]',
  // Hover: rim and glow brighten across the whole spectrum.
  'hover:border-portal/70 hover:text-white',
  'hover:shadow-[0_1px_0_0_rgba(255,255,255,0.09)_inset,0_0_22px_-4px_rgba(4,172,255,0.70),0_0_34px_-8px_rgba(124,92,255,0.55),0_18px_40px_-16px_rgba(212,175,55,0.50)]',
  'active:bg-[linear-gradient(180deg,rgba(8,12,20,0.98),rgba(3,4,7,0.98))]',
  // The spectral rainbow rim itself, shared with LibraryPanel. It wakes up
  // on hover and stays lit while a manifestation is in flight (aria-busy).
  SPECTRAL_EDGE,
  'hover:before:opacity-90 aria-busy:before:opacity-85',
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
