import React, { useId } from "react";

// ============================================================================
// Form Field Components
// ============================================================================

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "url"
    | "password"
    | "date"
    | "time";
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  maxLength?: number;
  name?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  spellCheck?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  rows = 3,
  required = false,
  maxLength,
  name,
  autoComplete,
  inputMode,
  spellCheck,
  ariaInvalid,
  ariaDescribedBy,
}: InputFieldProps) {
  const id = useId();
  const baseClasses =
    "w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 text-sm transition-colors";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          spellCheck={spellCheck}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={`${baseClasses} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          spellCheck={spellCheck}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={baseClasses}
        />
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  name?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  name,
}: SelectFieldProps) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-dark-card border-zinc-200 dark:border-dark-border focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-zinc-900 dark:text-white text-sm transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
}

export function CheckboxField({
  label,
  checked,
  onChange,
  name,
}: CheckboxFieldProps) {
  const id = useId();

  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer group">
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden="true"
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-dark-card ${
          checked
            ? "bg-violet-600 border-violet-600"
            : "border-zinc-300 dark:border-zinc-600 group-hover:border-violet-400"
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
    </label>
  );
}
