"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { ManagementDialog } from "@/components/modals/management-dialog";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { buildPageHref as buildHref } from "@/lib/api/query";
import type { ContactMessage, PageMeta } from "@/types/api";

export type ContactClientProps = {
  messages: ContactMessage[];
  meta: PageMeta | null;
  error: string | null;
  query: Record<string, string | undefined>;
};

const PATH = "/contact";

function formatReceived(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function Truncate({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span className={className} title={value}>
      {value}
    </span>
  );
}

export function ContactClient({
  messages,
  meta,
  error,
  query,
}: ContactClientProps) {
  const [viewTarget, setViewTarget] = useState<ContactMessage | null>(null);
  const pageHref = (page: number) => buildHref(PATH, query, { page: String(page) });

  const columns = useMemo<ColumnDef<ContactMessage, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap font-mono text-xs text-muted">
            {getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <Truncate
            value={getValue<string>()}
            className="block max-w-[10rem] truncate whitespace-nowrap text-ink"
          />
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-ink">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <Truncate
            value={getValue<string>()}
            className="block max-w-[12rem] truncate whitespace-nowrap text-ink"
          />
        ),
      },
      {
        id: "message",
        header: "Message",
        cell: ({ row }) => (
          <Truncate
            value={row.original.message}
            className="block max-w-[16rem] truncate whitespace-nowrap text-muted"
          />
        ),
      },
      {
        id: "createdAt",
        header: "Received",
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-mono text-xs text-ink">
            {formatReceived(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            leftIcon={<Eye className="size-3.5" />}
            onClick={() => setViewTarget(row.original)}
          >
            View
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={messages}
        meta={meta ?? undefined}
        error={error}
        buildPageHref={meta ? pageHref : undefined}
        emptyTitle="No contact messages"
        emptyDescription="New submissions will appear here."
      />

      <ManagementDialog
        open={viewTarget !== null}
        onClose={() => setViewTarget(null)}
        mode="view"
        title={viewTarget ? `Message #${viewTarget.id}` : "Message"}
        className="max-w-lg"
      >
        {viewTarget ? (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">ID</dt>
              <dd className="font-mono text-ink">{viewTarget.id}</dd>
            </div>
            <div>
              <dt className="text-muted">Received</dt>
              <dd className="whitespace-nowrap text-ink">
                {formatReceived(viewTarget.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="text-ink">{viewTarget.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="text-ink">{viewTarget.phone}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">Email</dt>
              <dd className="break-all text-ink">{viewTarget.email}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">Message</dt>
              <dd className="whitespace-pre-wrap text-ink">{viewTarget.message}</dd>
            </div>
          </dl>
        ) : null}
      </ManagementDialog>
    </>
  );
}
