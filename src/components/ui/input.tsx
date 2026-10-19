"use client";

import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  inputClassName?: string;
};

export function Input({
  className,
  inputClassName,
  label,
  hint,
  error,
  id: idProp,
  required,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-medium text-ink"
        >
          {label}
          {required ? (
            <span className="text-rose-deep" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <input
        id={id}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink",
          "placeholder:text-muted",
          "transition-colors focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-rose-deep focus:border-rose-deep focus:ring-rose-deep/25" : undefined,
          inputClassName,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-rose-deep">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
