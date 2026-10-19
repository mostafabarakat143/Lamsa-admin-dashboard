import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  getHref: (page: number) => string;
  className?: string;
  ariaLabel?: string;
};

function clampPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, page), totalPages);
}

export function Pagination({
  currentPage,
  totalPages,
  getHref,
  className,
  ariaLabel = "Pagination",
}: PaginationProps) {
  const page = clampPage(currentPage, totalPages);
  const hasPrev = page > 1;
  const hasNext = totalPages > 0 && page < totalPages;

  if (totalPages <= 1) {
    return (
      <nav
        aria-label={ariaLabel}
        className={cn("flex items-center justify-center text-sm text-muted", className)}
      >
        Page 1 of 1
      </nav>
    );
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex items-center justify-between gap-4", className)}
    >
      {hasPrev ? (
        <Link
          href={getHref(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/30"
          rel="prev"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm text-muted opacity-50"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </span>
      )}

      <p className="text-sm text-muted" aria-live="polite">
        Page{" "}
        <span className="font-medium text-ink">{page}</span> of{" "}
        <span className="font-medium text-ink">{totalPages}</span>
      </p>

      {hasNext ? (
        <Link
          href={getHref(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose/30"
          rel="next"
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm text-muted opacity-50"
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
