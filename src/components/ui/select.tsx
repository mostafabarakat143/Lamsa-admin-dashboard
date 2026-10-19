"use client";

import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  selectClassName?: string;
};

export type MenuSelectOption = {
  value: string;
  label: string;
};

export type MenuSelectProps = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  value: string;
  options: MenuSelectOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  "aria-describedby"?: string;
};

export function Select({
  className,
  selectClassName,
  label,
  hint,
  error,
  id: idProp,
  required,
  disabled,
  children,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <span className="text-rose-deep" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border border-line bg-surface px-3 pr-9 text-sm text-ink",
            "transition-colors focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-rose-deep focus:border-rose-deep focus:ring-rose-deep/25" : undefined,
            selectClassName,
          )}
          {...props}
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted"
          aria-hidden
        >
          ▾
        </span>
      </div>
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

/** Custom listbox select with a rounded, styled menu (native option popups cannot be rounded). */
export function MenuSelect({
  className,
  label,
  hint,
  error,
  value,
  options,
  onValueChange,
  disabled = false,
  required,
  id: idProp,
  "aria-describedby": ariaDescribedBy,
}: MenuSelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((option) => option.value === value) ?? options[0];

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setOpenUpward(spaceBelow < 160 && spaceAbove > spaceBelow);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, close]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <span className="text-rose-deep" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div ref={rootRef} className={cn("relative", open ? "z-50" : "z-0")}>
        <button
          ref={buttonRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-line bg-surface px-3 text-left text-sm text-ink",
            "transition-colors focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/25",
            "disabled:cursor-not-allowed disabled:opacity-50",
            open ? "border-rose ring-2 ring-rose/25" : undefined,
            error ? "border-rose-deep focus:border-rose-deep focus:ring-rose-deep/25" : undefined,
          )}
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
          }}
        >
          <span className="truncate">{selected?.label ?? "Select…"}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={id}
            className={cn(
              "absolute left-0 right-0 z-50 max-h-60 overflow-auto rounded-xl border border-line bg-surface py-1.5 shadow-lg",
              openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5",
            )}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-transparent font-medium text-rose-deep"
                        : "text-ink hover:bg-blush/70",
                    )}
                    onClick={() => {
                      onValueChange(option.value);
                      close();
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <Check className="size-4 shrink-0 text-rose-deep" aria-hidden />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

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
