"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Archive, Pencil, Plus } from "lucide-react";

import { TableToolbar } from "@/components/filters/table-toolbar";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { ManagementDialog } from "@/components/modals/management-dialog";
import {
  SubcategoryForm,
  type SubcategoryFormValues,
} from "@/components/subcategories/subcategory-form";
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
import type { Category, PageMeta, Subcategory } from "@/types/api";

export type SubcategoriesClientProps = {
  subcategories: Subcategory[];
  meta: PageMeta | null;
  error: string | null;
  query: Record<string, string | undefined>;
  categories: Category[];
};

const PATH = "/subcategories";

export function SubcategoriesClient({
  subcategories,
  meta,
  error,
  query,
  categories,
}: SubcategoriesClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Subcategory | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const formId = "subcategory-management-form";
  const pageHref = (page: number) => buildHref(PATH, query, { page: String(page) });

  const categoryFilterOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories],
  );

  const columns = useMemo<ColumnDef<Subcategory, unknown>[]>(
    () => [
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
        id: "category",
        header: "Category",
        cell: ({ row }) => row.original.category.name,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <Badge status={row.original.status} />,
      },
      {
        id: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(undefined, {
            dateStyle: "medium",
          }),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const sub = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Pencil className="size-3.5" />}
                onClick={() => openEdit(sub)}
              >
                Edit
              </Button>
              {sub.status === "ACTIVE" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Archive className="size-3.5" />}
                  onClick={() => setArchiveTarget(sub)}
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

  function openEdit(sub: Subcategory) {
    setActionError(null);
    setDialogMode("edit");
    setEditing(sub);
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditing(null);
  }

  async function saveSubcategory(values: SubcategoryFormValues) {
    setSaving(true);
    setActionError(null);
    try {
      const payload =
        dialogMode === "edit"
          ? {
              name: values.name,
              slug: values.slug,
              description: values.description,
              status: values.status,
            }
          : values;

      const result =
        dialogMode === "create"
          ? await postJson("/api/subcategories", payload)
          : await patchJson(`/api/subcategories/${editing!.id}`, payload);

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
    const result = await deleteJson(`/api/subcategories/${archiveTarget.id}`);
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
        <p className="text-sm text-muted">Nested groups under each category.</p>
        <Button
          type="button"
          size="sm"
          leftIcon={<Plus className="size-4" />}
          onClick={openCreate}
        >
          New subcategory
        </Button>
      </div>

      {actionError && !dialogOpen ? (
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          {actionError}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={subcategories}
        meta={meta ?? undefined}
        error={error}
        buildPageHref={meta ? pageHref : undefined}
        emptyTitle="No subcategories"
        toolbar={
          <Suspense fallback={<LoadingState label="Loading filters" compact />}>
            <TableToolbar
              searchPlaceholder="Search subcategories…"
              filters={[
                {
                  key: "categoryId",
                  label: "Category",
                  options: categoryFilterOptions,
                },
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
        title={
          dialogMode === "create" ? "Subcategory" : editing?.name ?? "Subcategory"
        }
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
        <SubcategoryForm
          key={editing?.id ?? "create"}
          formId={formId}
          categories={categories}
          initial={editing}
          mode={dialogMode}
          disabled={saving}
          onSubmit={saveSubcategory}
        />
      </ManagementDialog>

      <ConfirmDialog
        open={archiveTarget !== null}
        onClose={() => !archiving && setArchiveTarget(null)}
        onConfirm={confirmArchive}
        loading={archiving}
        danger
        title="Archive subcategory?"
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
