"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Archive, Pencil, Plus, Trash2 } from "lucide-react";

import { TableToolbar } from "@/components/filters/table-toolbar";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { ManagementDialog } from "@/components/modals/management-dialog";
import {
  ProductForm,
  type ProductFormValues,
} from "@/components/products/product-form";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import {
  deleteJson,
  patchJson,
  postJson,
} from "@/lib/client/fetch-json";
import { buildPageHref as buildHref } from "@/lib/api/query";
import { formatEgp } from "@/lib/utils/money";
import type { Category, PageMeta, Product, Subcategory } from "@/types/api";

export type ProductsClientProps = {
  products: Product[];
  meta: PageMeta | null;
  error: string | null;
  query: Record<string, string | undefined>;
  categories: Category[];
  subcategories: Subcategory[];
};

const PATH = "/products";

export function ProductsClient({
  products,
  meta,
  error,
  query,
  categories,
  subcategories,
}: ProductsClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [addingImage, setAddingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const formId = "product-management-form";

  const editingProduct = editing
    ? (products.find((product) => product.id === editing.id) ?? editing)
    : null;

  const pageHref = (page: number) => buildHref(PATH, query, { page: String(page) });

  const categoryFilterOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories],
  );

  const subcategoryFilterOptions = useMemo(() => {
    const filtered = query.categoryId
      ? subcategories.filter((s) => String(s.categoryId) === query.categoryId)
      : subcategories;
    return [
      { value: "", label: "All subcategories" },
      ...filtered.map((s) => ({ value: String(s.id), label: s.name })),
    ];
  }, [subcategories, query.categoryId]);

  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => [
      {
        id: "image",
        header: "Image",
        cell: ({ row }) => {
          const primary =
            row.original.images.find((img) => img.isPrimary) ??
            row.original.images[0];
          if (!primary?.url) {
            return (
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-blush text-xs text-muted">
                —
              </span>
            );
          }
          return (
            <Image
              src={primary.url}
              alt={primary.altText ?? row.original.name}
              width={40}
              height={40}
              className="size-10 rounded-lg border border-line object-cover"
              unoptimized
            />
          );
        },
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted">{getValue<number>()}</span>
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "sku", header: "SKU" },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => row.original.category.name,
      },
      {
        id: "subcategory",
        header: "Subcategory",
        cell: ({ row }) => row.original.subcategory.name,
      },
      {
        id: "price",
        header: "Price",
        cell: ({ row }) => formatEgp(row.original.priceMinor),
      },
      { accessorKey: "stockQty", header: "Stock" },
      {
        id: "availability",
        header: "Availability",
        cell: ({ row }) => (
          <Badge status={row.original.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}>
            {row.original.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <Badge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Pencil className="size-3.5" />}
                onClick={() => openEdit(product)}
              >
                Edit
              </Button>
              {product.status === "ACTIVE" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Archive className="size-3.5" />}
                  onClick={() => setArchiveTarget(product)}
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
    setImageUrl("");
    setImageAlt("");
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setActionError(null);
    setDialogMode("edit");
    setEditing(product);
    setImageUrl("");
    setImageAlt("");
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditing(null);
  }

  async function saveProduct(values: ProductFormValues) {
    setSaving(true);
    setActionError(null);
    try {
      const result =
        dialogMode === "create"
          ? await postJson("/api/products", values)
          : await patchJson(`/api/products/${editing!.id}`, values);

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
    const result = await deleteJson(`/api/products/${archiveTarget.id}`);
    setArchiving(false);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setArchiveTarget(null);
    router.refresh();
  }

  async function addImageUrl() {
    if (!editing) return;
    const url = imageUrl.trim();
    if (!url) {
      setActionError("Image URL is required.");
      return;
    }
    setAddingImage(true);
    setActionError(null);
    const body: Record<string, unknown> = { url };
    if (imageAlt.trim()) body.altText = imageAlt.trim();
    if (editingProduct && editingProduct.images.length === 0) body.isPrimary = true;

    const result = await postJson(`/api/products/${editing!.id}/images`, body);
    setAddingImage(false);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    setImageUrl("");
    setImageAlt("");
    router.refresh();
  }

  async function removeImage(imageId: number) {
    if (!editing) return;
    setDeletingImageId(imageId);
    setActionError(null);
    const result = await deleteJson(
      `/api/products/${editing.id}/images/${imageId}`,
    );
    setDeletingImageId(null);
    if (!result.ok) {
      setActionError(result.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Manage catalog products, pricing, and availability.
        </p>
        <Button
          type="button"
          size="sm"
          leftIcon={<Plus className="size-4" />}
          onClick={openCreate}
        >
          New product
        </Button>
      </div>

      {actionError && !dialogOpen ? (
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          {actionError}
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={products}
        meta={meta ?? undefined}
        error={error}
        buildPageHref={meta ? pageHref : undefined}
        emptyTitle="No products"
        emptyDescription="Create a product or adjust filters."
        toolbar={
          <Suspense fallback={<LoadingState label="Loading filters" compact />}>
            <TableToolbar
              searchPlaceholder="Search name or SKU…"
              filters={[
                {
                  key: "categoryId",
                  label: "Category",
                  options: categoryFilterOptions,
                },
                {
                  key: "subcategoryId",
                  label: "Subcategory",
                  options: subcategoryFilterOptions,
                },
                {
                  key: "availability",
                  label: "Availability",
                  options: [
                    { value: "ALL", label: "All availability" },
                    { value: "AVAILABLE", label: "Available" },
                    { value: "UNAVAILABLE", label: "Unavailable" },
                  ],
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
                    { value: "priceMinor", label: "Price" },
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
        title={dialogMode === "create" ? "Product" : editing?.name ?? "Product"}
        className="max-w-xl"
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
        {actionError ? (
          <p className="mb-4 rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
            {actionError}
          </p>
        ) : null}

        <ProductForm
          key={editing?.id ?? "create"}
          formId={formId}
          subcategories={subcategories}
          initial={editing}
          disabled={saving}
          onSubmit={saveProduct}
        />

        {dialogMode === "edit" && editingProduct ? (
          <div className="mt-6 space-y-3 border-t border-line pt-4">
            <h3 className="text-sm font-semibold text-ink">Product images</h3>
            {editingProduct.images.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {editingProduct.images.map((img) => (
                  <li
                    key={img.id}
                    className="flex items-center gap-3 rounded-lg border border-line bg-blush/40 px-3 py-2"
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? ""}
                      width={36}
                      height={36}
                      className="size-9 rounded object-cover"
                      unoptimized
                    />
                    <span className="min-w-0 flex-1 truncate text-ink">{img.url}</span>
                    {img.isPrimary ? (
                      <Badge status="DEFAULT">Primary</Badge>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Remove image"
                      loading={deletingImageId === img.id}
                      leftIcon={<Trash2 className="size-3.5" />}
                      onClick={() => void removeImage(img.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No images yet. Add a URL below.</p>
            )}
            <Input
              label="Image URL"
              value={imageUrl}
              disabled={addingImage}
              placeholder="https://…"
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <Input
              label="Alt text"
              value={imageAlt}
              disabled={addingImage}
              onChange={(event) => setImageAlt(event.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={addingImage}
              onClick={addImageUrl}
            >
              Add image URL
            </Button>
            <p className="text-xs text-muted">
              After adding, refresh loads updated images from the API.
            </p>
          </div>
        ) : null}
      </ManagementDialog>

      <ConfirmDialog
        open={archiveTarget !== null}
        onClose={() => !archiving && setArchiveTarget(null)}
        onConfirm={confirmArchive}
        loading={archiving}
        danger
        title="Archive product?"
        description={
          archiveTarget
            ? `“${archiveTarget.name}” will be archived and hidden from the active catalog.`
            : undefined
        }
        confirmLabel="Archive"
      />
    </div>
  );
}
