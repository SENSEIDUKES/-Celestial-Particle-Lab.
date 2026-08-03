import React, { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  id: string;
  label: ReactNode;
  value?: string;
  onChange: (value: string) => void;
  helpText?: ReactNode;
  rightElement?: ReactNode;
  /** Small contextual icon resting inside the field's top-left edge. */
  icon?: LucideIcon;
  /** Marks the field invalid (keeps the glass surface, warning-colored edge). */
  invalid?: boolean;
  children?: ReactNode; // For overlays
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  helpText,
  rightElement,
  icon: Icon,
  invalid = false,
  children,
  className = '',
  maxLength,
  ...rest
}) => {
  const complete = !invalid && Boolean(value?.trim());
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <label
          className="block flex gap-2 items-center font-sc text-xs text-neutral-400 uppercase tracking-widest"
          htmlFor={id}
        >
          {label}
        </label>

        <div className="flex items-center gap-3">
          {maxLength !== undefined && (
             <span className="text-[10px] font-mono text-neutral-500">
               {(value || '').length} / {maxLength}
             </span>
          )}
          {rightElement && <span>{rightElement}</span>}
        </div>
      </div>

      {helpText && (
        <p className="text-neutral-500 font-sans text-xs mb-3 leading-relaxed">
          {helpText}
        </p>
      )}

      <div className="glass-field-wrap">
        {Icon && (
          <Icon size={15} aria-hidden="true" className="glass-field-icon top-[1rem]" />
        )}
        <textarea
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          data-complete={complete || undefined}
          data-invalid={invalid || undefined}
          className={`glass-field resize-none p-3 text-sm ${Icon ? 'pl-10' : ''} ${className}`}
          {...rest}
        />
        {children}
      </div>
    </div>
  );
};
