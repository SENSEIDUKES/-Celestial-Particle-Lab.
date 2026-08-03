import React, { forwardRef, ReactNode, useId } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * LibraryTextBox — the official Celestial Library text input.
 *
 * Behavior is ported from SEIHouse UI's `SEIInput` / `SEIField`
 * (UI repo: `packages/seihouse-ui/src/forms/sei-input.tsx` and `sei-field.tsx`,
 * ported 2026-08-03 — only the text-input behavior, not the whole package):
 *
 * - `forwardRef` to the underlying `<input>`
 * - `useId`-generated fallback id, so `label htmlFor` and message ids always wire up
 * - `aria-describedby` wiring — the error message wins over the helper text
 * - `aria-invalid` driven by `invalid` or a present `error`
 * - required marker (visual `*` plus an sr-only "(required)")
 * - `size` variants: `comfortable` (default, 44px touch target) and `compact`
 * - icon-bearing surface wrapper (`glass-field-wrap` + `glass-field-icon`)
 *
 * The skin stays entirely on the Library glass field system (`glass-field.css`):
 * dark glass surface, cool-blue focus glow, quiet completed accent, warning
 * edge when invalid, small-caps serif label, helper text above the field.
 *
 * Architecture rule: pages and workspaces import `LibraryTextBox` — never a raw
 * `<input>` or a page-specific input component. If a surface needs a different
 * visual mood, add a `variant` value here instead of creating a new component.
 */
export interface LibraryTextBoxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size'> {
  /** DOM id. Optional — a stable id is generated when omitted. Preview scripts rely on explicit ids, so keep passing them where they exist. */
  id?: string;
  label?: ReactNode;
  value?: string | number;
  onChange: (value: string) => void;
  /** Guidance rendered between the label and the field. */
  helpText?: ReactNode;
  /** Error message rendered under the field; also marks the field invalid. */
  error?: string;
  /** Small node rendered at the right end of the label row (e.g. a character count). */
  rightElement?: ReactNode;
  /** Small contextual icon resting inside the field's left edge. */
  icon?: LucideIcon;
  /** Marks the field invalid without a message (keeps the glass surface, warning-colored edge). */
  invalid?: boolean;
  /** `comfortable` is the default touch-friendly size; `compact` matches the workspace compact fields. */
  size?: 'comfortable' | 'compact';
  /** Visual mood. Only the Celestial glass skin exists today — add new moods here, never as a new component. */
  variant?: 'glass';
}

const sizeClasses: Record<NonNullable<LibraryTextBoxProps['size']>, string> = {
  comfortable: 'min-h-[2.75rem] px-4 py-2.5 text-sm',
  compact: 'px-2.5 py-1.5 text-xs',
};

export const LibraryTextBox = forwardRef<HTMLInputElement, LibraryTextBoxProps>(
  function LibraryTextBox(
    {
      id,
      label,
      value,
      onChange,
      helpText,
      error,
      rightElement,
      icon: Icon,
      invalid = false,
      size = 'comfortable',
      variant = 'glass',
      required = false,
      disabled = false,
      className = '',
      type = 'text',
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(error);
    const isInvalid = invalid || hasError;
    const describedBy = hasError ? errorId : helpText ? helperId : undefined;
    const complete = !isInvalid && value !== undefined && value !== null && String(value).trim().length > 0;

    const compact = size === 'compact';

    return (
      <div data-disabled={disabled || undefined}>
        {(label != null || rightElement) && (
          <div className={`flex justify-between items-end ${compact ? 'mb-1' : 'mb-2'}`}>
            <label
              className={`block flex gap-2 items-center font-sc ${compact ? 'text-[10px]' : 'text-xs'} text-neutral-400 uppercase tracking-widest ${disabled ? 'opacity-45' : ''}`}
              htmlFor={inputId}
            >
              {label}
              {required && (
                <>
                  <span aria-hidden="true" className="text-human">*</span>
                  <span className="sr-only">(required)</span>
                </>
              )}
            </label>
            {rightElement && <span>{rightElement}</span>}
          </div>
        )}

        {helpText && (
          <p
            id={helperId}
            className={`text-neutral-500 font-sans text-xs ${compact ? 'mb-2' : 'mb-3'} leading-relaxed`}
          >
            {helpText}
          </p>
        )}

        <div className={variant === 'glass' ? 'glass-field-wrap' : ''}>
          {Icon && (
            <Icon
              size={compact ? 13 : 15}
              aria-hidden="true"
              className="glass-field-icon top-1/2 -translate-y-1/2"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            aria-invalid={isInvalid || undefined}
            aria-describedby={describedBy}
            data-complete={complete || undefined}
            data-invalid={isInvalid || undefined}
            className={`glass-field ${sizeClasses[size]} ${Icon ? (compact ? 'pl-8' : 'pl-10') : ''} ${className}`}
            {...rest}
          />
        </div>

        {hasError && (
          <p id={errorId} className="mt-2 font-sans text-xs text-human">
            {error}
          </p>
        )}
      </div>
    );
  },
);
