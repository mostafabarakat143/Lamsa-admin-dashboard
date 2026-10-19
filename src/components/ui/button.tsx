import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variantClasses = {
  primary:
    "bg-rose-deep text-surface hover:bg-rose-hover focus-visible:ring-rose-deep/40",
  secondary:
    "bg-blush text-ink hover:bg-line focus-visible:ring-rose/40",
  ghost:
    "bg-transparent text-ink hover:bg-blush focus-visible:ring-rose/30",
  danger:
    "bg-rose-deep text-surface hover:bg-rose-hover focus-visible:ring-rose-deep/40",
  outline:
    "border border-line bg-surface text-ink hover:bg-blush focus-visible:ring-rose/30",
} as const;

const sizeClasses = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Loading",
  disabled,
  leftIcon,
  rightIcon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          <span className="sr-only">{loadingLabel}</span>
          {children ? <span aria-hidden>{children}</span> : null}
        </>
      ) : (
        <>
          {leftIcon ? (
            <span className="inline-flex shrink-0" aria-hidden>
              {leftIcon}
            </span>
          ) : null}
          {children}
          {rightIcon ? (
            <span className="inline-flex shrink-0" aria-hidden>
              {rightIcon}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}
