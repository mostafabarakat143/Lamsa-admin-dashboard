"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import type { PageMeta } from "@/types/api";
import { cn } from "@/lib/utils/cn";

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  meta?: PageMeta;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
  buildPageHref?: (page: number) => string;
  className?: string;
};

export function DataTable<TData>({
  columns,
  data,
  meta,
  loading = false,
  error = null,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting filters or create a new record.",
  toolbar,
  buildPageHref,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta?.totalPages ?? -1,
  });

  return (
    <div className={cn("space-y-3", className)}>
      {toolbar ? <div className="flex justify-end">{toolbar}</div> : null}

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {loading ? (
          <LoadingState label="Loading rows" compact />
        ) : error ? (
          <ErrorState title="Could not load table" message={error} />
        ) : data.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-blush/60 text-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="whitespace-nowrap px-4 py-3 font-medium"
                        scope="col"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-line hover:bg-blush/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle text-ink">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && buildPageHref ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>
            Page {meta.page} of {Math.max(meta.totalPages, 1)} · {meta.totalItems}{" "}
            total
          </p>
          <div className="flex items-center gap-2">
            {meta.page > 1 ? (
              <Link
                href={buildPageHref(meta.page - 1)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink hover:bg-blush"
              >
                Previous
              </Link>
            ) : (
              <span className="rounded-lg border border-line px-3 py-1.5 opacity-40">
                Previous
              </span>
            )}
            {meta.totalPages > 0 && meta.page < meta.totalPages ? (
              <Link
                href={buildPageHref(meta.page + 1)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink hover:bg-blush"
              >
                Next
              </Link>
            ) : (
              <span className="rounded-lg border border-line px-3 py-1.5 opacity-40">
                Next
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Refresh"
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCw className="size-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
