"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "block w-full rounded-xl border bg-white px-4 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 focus:outline-none";

type BaseProps = {
  name: string;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  required?: boolean;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string) => void;
  className?: string;
};

function Shell({
  name,
  label,
  error,
  hint,
  required,
  className,
  children,
}: Pick<BaseProps, "name" | "label" | "error" | "hint" | "required" | "className"> & {
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`f-${name}`} className="mb-2 block text-sm font-semibold text-navy-950">
        {label}
        {required ? (
          <span className="text-gold-ink" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`f-${name}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`f-${name}-error`}
          className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-700"
        >
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (name: string, error?: string, hint?: string) =>
  error ? `f-${name}-error` : hint ? `f-${name}-hint` : undefined;

export function TextField({
  type = "text",
  autoComplete,
  inputMode,
  ...props
}: BaseProps & {
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const { name, value, error, hint, required, onChange, onBlur } = props;
  return (
    <Shell {...props}>
      <input
        id={`f-${name}`}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        className={cn(control, "h-12", error ? "border-red-600" : "border-line")}
      />
    </Shell>
  );
}

export function TextAreaField(props: BaseProps & { rows?: number }) {
  const { name, value, error, hint, required, onChange, onBlur, rows = 5 } = props;
  return (
    <Shell {...props}>
      <textarea
        id={`f-${name}`}
        name={name}
        value={value}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        className={cn(control, "py-3", error ? "border-red-600" : "border-line")}
      />
    </Shell>
  );
}

export function SelectField({
  options,
  placeholder = "Select an option",
  ...props
}: BaseProps & { options: readonly string[]; placeholder?: string }) {
  const { name, value, error, hint, required, onChange, onBlur } = props;
  return (
    <Shell {...props}>
      <div className="relative">
        <select
          id={`f-${name}`}
          name={name}
          value={value}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(name, error, hint)}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          className={cn(
            control,
            "h-12 appearance-none pr-10",
            value === "" && "text-muted",
            error ? "border-red-600" : "border-line",
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="text-ink">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    </Shell>
  );
}

/** Off-screen honeypot. Hidden from people and assistive tech. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="f-website">Website</label>
      <input
        id="f-website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
