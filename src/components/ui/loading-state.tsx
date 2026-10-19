import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export type LoadingStateProps = {
  label?: string;
  description?: string;
  className?: string;
  compact?: boolean;
};

export function LoadingState({
  label = "Loading",
  description,
  className,
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-6" : "gap-3 py-12",
        className,
      )}
    >
      <Loader2 className="size-8 animate-spin text-rose-deep" aria-hidden />
      <p className="text-sm font-medium text-ink">{label}</p>
      {description ? (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}
