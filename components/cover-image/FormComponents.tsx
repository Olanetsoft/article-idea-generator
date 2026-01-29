// ============================================================================
// Cover Image Generator - Reusable UI Components
// ============================================================================

import { ReactNode } from "react";

// ============================================================================
// Form Components
// ============================================================================

interface FormLabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}

export function FormLabel({
  children,
  htmlFor,
  required,
}: FormLabelProps): JSX.Element {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {children}
      {required && " *"}
    </label>
  );
}

interface FormInputProps {
  type?: "text" | "number";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

export function FormInput({
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  className = "",
}: FormInputProps): JSX.Element {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 ${className}`}
    />
  );
}

interface FormTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function FormTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: FormTextareaProps): JSX.Element {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
    />
  );
}

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
}

export function FormSelect({
  value,
  onChange,
  options,
}: FormSelectProps): JSX.Element {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

interface FormCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function FormCheckbox({
  checked,
  onChange,
  label,
  className = "",
}: FormCheckboxProps): JSX.Element {
  return (
    <label
      className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
      />
      {label}
    </label>
  );
}

// ============================================================================
// Slider Component
// ============================================================================

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
}: SliderProps): JSX.Element {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}: {displayValue}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-violet-600"
      />
    </div>
  );
}

// ============================================================================
// Button Components
// ============================================================================

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: ReactNode;
}

const buttonVariants = {
  primary: "bg-violet-600 text-white hover:bg-violet-700",
  secondary:
    "bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border",
  danger:
    "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30",
  gradient:
    "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-4 py-3",
};

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  icon,
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

// ============================================================================
// Toggle Button Group
// ============================================================================

interface ToggleButtonGroupProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function ToggleButtonGroup<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: ToggleButtonGroupProps<T>): JSX.Element {
  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
            value === option
              ? "bg-violet-600 text-white border-violet-600"
              : "bg-gray-50 dark:bg-dark-card/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-violet-400"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Color Picker
// ============================================================================

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

export function ColorPicker({
  value,
  onChange,
  presets = [],
}: ColorPickerProps): JSX.Element {
  return (
    <div className="flex gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-dark-border"
      />
      {presets.length > 0 && (
        <div className="flex gap-1">
          {presets.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                value === color
                  ? "border-violet-600 scale-105"
                  : "border-gray-200 dark:border-dark-border"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Gradient Picker
// ============================================================================

interface GradientSwatchProps {
  colors: string[];
  selected: boolean;
  onClick: () => void;
  title?: string;
}

export function GradientSwatch({
  colors,
  selected,
  onClick,
  title,
}: GradientSwatchProps): JSX.Element {
  const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[colors.length - 1]} 100%)`;

  return (
    <button
      onClick={onClick}
      title={title}
      className={`aspect-square rounded-lg border-2 transition-all ${
        selected
          ? "border-violet-600 scale-105 shadow-lg"
          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      style={{ background: gradient }}
    />
  );
}

// ============================================================================
// Pill Button
// ============================================================================

interface PillButtonProps {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}

export function PillButton({
  children,
  selected,
  onClick,
}: PillButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
        selected
          ? "bg-violet-600 text-white border-violet-600"
          : "bg-gray-50 dark:bg-dark-card/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-violet-400"
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Card Component
// ============================================================================

interface CardButtonProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export function CardButton({
  title,
  description,
  selected,
  onClick,
}: CardButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`p-3 text-left rounded-xl border transition-all ${
        selected
          ? "bg-violet-50 dark:bg-violet-900/20 border-violet-500"
          : "bg-gray-50 dark:bg-dark-card/50 border-gray-200 dark:border-dark-border hover:border-violet-400"
      }`}
    >
      <span className="font-medium text-sm text-gray-900 dark:text-white block">
        {title}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {description}
      </span>
    </button>
  );
}

// ============================================================================
// Loading Spinner
// ============================================================================

export function LoadingSpinner({
  className = "h-5 w-5",
}: {
  className?: string;
}): JSX.Element {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ============================================================================
// Feature Card
// ============================================================================

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps): JSX.Element {
  return (
    <div className="p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
