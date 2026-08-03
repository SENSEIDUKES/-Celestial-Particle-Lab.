import React from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from './cn';

/**
 * SEIButton — base button behavior ported from the SEIHouse UI repo
 * (`packages/seihouse-ui/src/primitives/sei-button.tsx`).
 *
 * This is the behavior layer only: safe `type` default, loading + disabled
 * handling, `aria-busy`, icon slots, and the `data-icon-only` / `data-loading`
 * hooks. It carries no Celestial Library styling — the skin lives in
 * `LibraryButton`, which is what pages should import.
 *
 * Icon-only buttons require an accessible name at compile time. For navigation
 * use an anchor rather than a click-handling button.
 */

interface SEIButtonOwnProps {
  /** Lucide icon rendered before the visible label. Decorative. */
  icon?: LucideIcon;
  /** Custom decorative content rendered before the visible label. */
  iconLeft?: ReactNode;
  /** Custom decorative content rendered after the visible label. */
  iconRight?: ReactNode;
  /** Marks the button busy and prevents repeat activation until work finishes. */
  loading?: boolean;
  /** Replaces the default spinner while `loading` is true. */
  loadingIndicator?: ReactNode;
  /** Size of the built-in `icon` glyph, in px. */
  iconSize?: number;
}

type TextButtonContent = {
  children: ReactNode;
};

type NamedIconButtonContent = {
  children?: null;
} & (
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string }
);

export type SEIButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  SEIButtonOwnProps &
  (TextButtonContent | NamedIconButtonContent);

function hasRenderableContent(node: ReactNode): boolean {
  return React.Children.toArray(node).some(child => child !== '');
}

export const SEIButton = React.forwardRef<HTMLButtonElement, SEIButtonProps>(function SEIButton(
  {
    className,
    icon: Icon,
    iconLeft,
    iconRight,
    loading = false,
    loadingIndicator,
    iconSize = 16,
    disabled,
    children,
    type = 'button',
    'aria-busy': ariaBusy,
    ...props
  },
  ref,
) {
  const hasLeadingIcon = Icon != null || hasRenderableContent(iconLeft);
  const hasTrailingIcon = hasRenderableContent(iconRight);
  const iconOnly = !hasRenderableContent(children) && (hasLeadingIcon || hasTrailingIcon || loading);

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={cn(
        'inline-flex touch-manipulation items-center justify-center gap-2 whitespace-nowrap',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading ? true : ariaBusy}
      data-icon-only={iconOnly ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
    >
      {loading ? (
        loadingIndicator ?? (
          <span
            aria-hidden="true"
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )
      ) : hasRenderableContent(iconLeft) ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center">
          {iconLeft}
        </span>
      ) : null}

      {!loading && Icon ? (
        <Icon aria-hidden="true" focusable="false" size={iconSize} className="shrink-0" />
      ) : null}

      {children}

      {hasRenderableContent(iconRight) ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center">
          {iconRight}
        </span>
      ) : null}
    </button>
  );
});
