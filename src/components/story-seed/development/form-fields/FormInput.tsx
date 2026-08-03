import React, { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  id: string;
  label: ReactNode;
  value?: string | number;
  onChange: (value: string) => void;
  helpText?: ReactNode;
  rightElement?: ReactNode;
  /** Small contextual icon resting inside the field's left edge. */
  icon?: LucideIcon;
  /** Marks the field invalid (keeps the glass surface, warning-colored edge). */
  invalid?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  value,
  onChange,
  helpText,
  rightElement,
  icon: Icon,
  invalid = false,
  className = '',
  type = 'text',
  ...rest
}) => {
  const complete = !invalid && value !== undefined && value !== null && String(value).trim().length > 0;
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <label
          className="block flex gap-2 items-center font-sc text-xs text-neutral-400 uppercase tracking-widest"
          htmlFor={id}
        >
          {label}
        </label>
        {rightElement && <span>{rightElement}</span>}
      </div>

      {helpText && (
        <p className="text-neutral-500 font-sans text-xs mb-3 leading-relaxed">
          {helpText}
        </p>
      )}

      <div className="glass-field-wrap">
        {Icon && (
          <Icon size={15} aria-hidden="true" className="glass-field-icon top-1/2 -translate-y-1/2" />
        )}
        <input
          id={id}
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          data-complete={complete || undefined}
          data-invalid={invalid || undefined}
          className={`glass-field min-h-[2.75rem] px-4 py-2.5 text-sm ${Icon ? 'pl-10' : ''} ${className}`}
          {...rest}
        />
      </div>
    </div>
  );
};
