"use client";

import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { minorToEgpInput, parseEgpToMinor } from "@/lib/utils/money";
import type { CatalogStatus, Product, Subcategory } from "@/types/api";

export type ProductFormValues = {
  name: string;
  subcategoryId: number;
  sku: string;
  priceMinor: number;
  stockQty: number;
  slug?: string;
  description?: string;
  isAvailable?: boolean;
  status?: CatalogStatus;
};

export type ProductFormProps = {
  formId: string;
  subcategories: Subcategory[];
  initial?: Product | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  disabled?: boolean;
};

export function ProductForm({
  formId,
  subcategories,
  initial,
  onSubmit,
  disabled = false,
}: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [subcategoryId, setSubcategoryId] = useState(
    initial?.subcategoryId ? String(initial.subcategoryId) : "",
  );
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [priceEgp, setPriceEgp] = useState(
    initial ? minorToEgpInput(initial.priceMinor) : "",
  );
  const [stockQty, setStockQty] = useState(
    initial ? String(initial.stockQty) : "0",
  );
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isAvailable, setIsAvailable] = useState(
    initial?.isAvailable ?? true,
  );
  const [status, setStatus] = useState<CatalogStatus>(
    initial?.status ?? "ACTIVE",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const nextFieldErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      nextFieldErrors.name = "Name is required.";
    }

    const subId = Number(subcategoryId);
    if (!Number.isInteger(subId) || subId < 1) {
      nextFieldErrors.subcategoryId = "Choose a subcategory.";
    }

    const trimmedSku = sku.trim();
    if (!trimmedSku) {
      nextFieldErrors.sku = "SKU is required.";
    }

    const priceResult = parseEgpToMinor(priceEgp);
    if (!priceResult.ok) {
      nextFieldErrors.price = priceResult.message;
    }

    const stock = Number(stockQty);
    if (!Number.isInteger(stock) || stock < 0) {
      nextFieldErrors.stockQty = "Enter a valid stock quantity.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});

    if (!priceResult.ok) {
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        subcategoryId: subId,
        sku: trimmedSku,
        priceMinor: priceResult.priceMinor,
        stockQty: stock,
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        isAvailable,
        status,
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save product.",
      );
    }
  }

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
      {formError ? (
        <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose-deep">
          {formError}
        </p>
      ) : null}

      <Input
        label="Name"
        required
        value={name}
        disabled={disabled}
        error={fieldErrors.name}
        onChange={(event) => setName(event.target.value)}
      />

      <Select
        label="Subcategory"
        required
        value={subcategoryId}
        disabled={disabled}
        error={fieldErrors.subcategoryId}
        onChange={(event) => setSubcategoryId(event.target.value)}
      >
        <option value="">Select subcategory…</option>
        {subcategories.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.category.name} / {sub.name}
          </option>
        ))}
      </Select>

      <Input
        label="SKU"
        required
        value={sku}
        disabled={disabled}
        error={fieldErrors.sku}
        onChange={(event) => setSku(event.target.value)}
      />

      <Input
        label="Price (EGP)"
        required
        inputMode="decimal"
        value={priceEgp}
        disabled={disabled}
        error={fieldErrors.price}
        onChange={(event) => setPriceEgp(event.target.value)}
      />

      <Input
        label="Stock quantity"
        required
        type="number"
        min={0}
        step={1}
        value={stockQty}
        disabled={disabled}
        error={fieldErrors.stockQty}
        onChange={(event) => setStockQty(event.target.value)}
      />

      <Input
        label="Slug"
        hint="Optional URL slug"
        value={slug}
        disabled={disabled}
        onChange={(event) => setSlug(event.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-description`} className="text-sm font-medium text-ink">
          Description
        </label>
        <textarea
          id={`${formId}-description`}
          rows={3}
          disabled={disabled}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/25 disabled:opacity-50"
          placeholder="Optional product description"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Availability"
          value={isAvailable ? "true" : "false"}
          disabled={disabled}
          onChange={(event) => setIsAvailable(event.target.value === "true")}
        >
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </Select>

        <Select
          label="Status"
          value={status}
          disabled={disabled}
          onChange={(event) =>
            setStatus(event.target.value as CatalogStatus)
          }
        >
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </div>
    </form>
  );
}
