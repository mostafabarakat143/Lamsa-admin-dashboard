"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Archive, Pencil, Plus } from "lucide-react";

import {
  CategoryForm,
  type CategoryFormValues,
} from "@/components/categories/category-form";
import { TableToolbar } from "@/components/filters/table-toolbar";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { ManagementDialog } from "@/components/modals/management-dialog";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { buildPageHref as buildHref } from "@/lib/api/query";
import {
  deleteJson,
  patchJson,
  postJson,
} from "@/lib/client/fetch-json";
import type { Category, PageMeta } from "@/types/api";

export type CategoriesClientProps = {
  categories: Category[];
  meta: PageMeta | null;
  error: string | null;
  query: Record<string, string | undefined>;
};

const PATH = "/categories";

export function CategoriesClient({
  categories,
  meta,
  error,
  query,
}: CategoriesClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Category | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const formId = "category-management-form";
  const pageHref = (page: number) => buildHref(PATH, query, { page: String(page) });

  const columns = useMemo<ColumnDef<Category, unknown>[]>(
    () => [
      {
        id: "image",
        header: "Image",
        cell: ({ row }) =>
          row.original.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.imageUrl}
              alt={row.original.name}
              className="size-10 rounded-lg object-cover ring-1 ring-line"
            />
          ) : (
            <span className="text-xs text-muted">No image</span>
          ),
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted">{getValue<number>()}</span>
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <Badge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Pencil className="size-3.5" />}
                onClick={() => openEdit(category)}
              >
                Edit
              </Button>
              {category.status === "ACTIVE" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Archive className="size-3.5" />}
                  onClick={() => setArchiveTarget(category)}
                >
                  Archive
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [],
  );

  function openCreate() {
    setActionError(null);
    setDialogMode("create");
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setActionError(null);
    setDialogMode("edit");
    setEditing(category);
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditing(null);
  }

  async function saveCategory(values: CategoryFormValues) {
    setSaving(true);
    setActionError(null);
    try {
      const result =
        dialogMode === "create"
          ? await postJson("/api/categories", values)
          : await patchJson(`/api/categories/${editing!.id}`, values);

      if (!result.ok) {
        throw new Error(result.message);
      }
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function confirmArchive() {
    if (!archiveTarget) return;
    setArchiving(true);
    const result = await deleteJson(`/api/categories/${archiveTarget.id}`);
    setArchiving(false);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setArchiveTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Top-level catalog categories.</p>
        <Button
          type="button"
          size="sm"
          leftIcon={<Plus className="size-4" />}
          onClick={openCreate}
        >
          New category
        </Button>
      </div>

      {actionError && !dialogOpen ? (
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          {actionError}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={categories}
        meta={meta ?? undefined}
        error={error}
        buildPageHref={meta ? pageHref : undefined}
        emptyTitle="No categories"
        toolbar={
          <Suspense fallback={<LoadingState label="Loading filters" compact />}>
            <TableToolbar
              searchPlaceholder="Search categories…"
              filters={[
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { value: "ALL", label: "All statuses" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "ARCHIVED", label: "Archived" },
                  ],
                },
                {
                  key: "sortBy",
                  label: "Sort by",
                  options: [
                    { value: "name", label: "Name" },
                    { value: "createdAt", label: "Created" },
                  ],
                },
                {
                  key: "sortOrder",
                  label: "Order",
                  options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                  ],
                },
              ]}
            />
          </Suspense>
        }
      />

      <ManagementDialog
        open={dialogOpen}
        onClose={closeDialog}
        mode={dialogMode}
        title={dialogMode === "create" ? "Category" : editing?.name ?? "Category"}
        footer={
          <>
            <Button type="button" variant="outline" size="sm" disabled={saving} onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" form={formId} size="sm" loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <CategoryForm
          key={editing?.id ?? "create"}
          formId={formId}
          mode={dialogMode}
          initial={editing}
          disabled={saving}
          onSubmit={saveCategory}
        />
      </ManagementDialog>

      <ConfirmDialog
        open={archiveTarget !== null}
        onClose={() => !archiving && setArchiveTarget(null)}
        onConfirm={confirmArchive}
        loading={archiving}
        danger
        title="Archive category?"
        description={
          archiveTarget
            ? `“${archiveTarget.name}” will be archived.`
            : undefined
        }
        confirmLabel="Archive"
      />
    </div>
  );
}
