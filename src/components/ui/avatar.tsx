import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string | null;
  alt: string;
  name?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function Avatar({
  className,
  src,
  alt,
  name,
  size = "md",
  ...props
}: AvatarProps) {
  const initials = initialsFromName(name ?? alt);

  if (src) {
    return (
      <span
        className={cn(
          "inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-line",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- admin avatars use arbitrary hosts */}
        <img src={src} alt={alt} className="size-full object-cover" />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-blush font-medium text-rose-deep ring-1 ring-line",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {initials}
    </span>
  );
}
