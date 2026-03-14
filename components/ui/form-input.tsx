import { FieldError } from "react-hook-form";
import { Label } from "./label";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  hint?: string;
}

export function FormInput({ label, error, hint, id, ...props }: FormInputProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <input
        id={fieldId}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-border focus:border-brand-400 focus:ring-brand-100"
        }`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, error, options, id, ...props }: FormSelectProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <select
        id={fieldId}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-border focus:border-brand-400 focus:ring-brand-100"
        }`}
        {...props}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: FieldError;
}

export function FormTextarea({ label, error, id, ...props }: FormTextareaProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <textarea
        id={fieldId}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-border focus:border-brand-400 focus:ring-brand-100"
        }`}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
