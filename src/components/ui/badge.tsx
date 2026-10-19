import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-blush text-ink border-line",
  ARCHIVED: "bg-line/40 text-muted border-line",
  PENDING: "bg-blush text-rose-deep border-rose/30",
  CONFIRMED: "bg-surface text-ink border-rose/40",
  FULFILLED: "bg-rose/15 text-ink border-rose/35",
  CANCELLED: "bg-line/50 text-muted border-line line-through decoration-muted/60",
  AVAILABLE: "bg-blush text-ink border-rose/25",
  UNAVAILABLE: "bg-line/40 text-muted border-line",
  DRAFT: "bg-surface text-muted border-line",
  DISABLED: "bg-line/40 text-muted border-line",
  CUSTOMER: "bg-surface text-ink border-line",
  ADMIN: "bg-rose/15 text-ink border-rose/35",
  DEFAULT: "bg-blush text-ink border-line",
};

export type BadgeStatus = keyof typeof statusStyles | (string & {});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status?: BadgeStatus;
};

function normalizeStatus(status: BadgeStatus): string {
  return String(status).toUpperCase().replace(/\s+/g, "_");
}

export function Badge({
  className,
  status = "DEFAULT",
  children,
  ...props
}: BadgeProps) {
  const key = normalizeStatus(status);
  const style =
    statusStyles[key] ?? statusStyles.DEFAULT;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        style,
        className,
      )}
      {...props}
    >
      {children ?? key.replace(/_/g, " ")}
    </span>
  );
}
