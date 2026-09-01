import React from "react";

interface BaseProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

type InputProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & { as?: "input" };

export const TextField = ({ label, name, error, required, hint, ...rest }: InputProps) => (
  <div>
    <label htmlFor={name} className="field-label">
      {label} {required && <span className="text-coral-500">*</span>}
    </label>
    <input id={name} name={name} className="field-input" {...rest} />
    {hint && !error && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    {error && <p className="field-error">{error}</p>}
  </div>
);

type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextareaField = ({ label, name, error, required, ...rest }: TextareaProps) => (
  <div>
    <label htmlFor={name} className="field-label">
      {label} {required && <span className="text-coral-500">*</span>}
    </label>
    <textarea id={name} name={name} rows={3} className="field-input resize-none" {...rest} />
    {error && <p className="field-error">{error}</p>}
  </div>
);

interface Option {
  value: string | number;
  label: string;
}

type SelectProps = BaseProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: Option[];
    placeholder?: string;
  };

export const SelectField = ({
  label,
  name,
  error,
  required,
  options,
  placeholder = "اختر...",
  ...rest
}: SelectProps) => (
  <div>
    <label htmlFor={name} className="field-label">
      {label} {required && <span className="text-coral-500">*</span>}
    </label>
    <select id={name} name={name} className="field-input" {...rest}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="field-error">{error}</p>}
  </div>
);

type CheckboxProps = Omit<BaseProps, "required"> &
  React.InputHTMLAttributes<HTMLInputElement>;

export const CheckboxField = ({ label, name, error, ...rest }: CheckboxProps) => (
  <div>
    <label htmlFor={name} className="flex cursor-pointer items-center gap-2.5">
      <input
        id={name}
        name={name}
        type="checkbox"
        className="h-4.5 w-4.5 rounded border-ink/25 text-primary-500 focus:ring-primary-300"
        {...rest}
      />
      <span className="text-sm font-bold text-ink/80">{label}</span>
    </label>
    {error && <p className="field-error">{error}</p>}
  </div>
);
