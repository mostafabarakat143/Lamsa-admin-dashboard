import { cn } from "@/lib/utils/cn";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export type ErrorStateProps = {
  title?: string;
  message: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-rose-deep/25 bg-blush/40 px-6 py-10 text-center",
        className,
      )}
    >
      <AlertCircle className="mb-3 size-8 text-rose-deep" aria-hidden />
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
