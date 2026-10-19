"use client";

import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CatalogStatus, Category, Subcategory } from "@/types/api";

export type SubcategoryFormValues = {
  name: string;
  categoryId: number;
  slug?: string;
  description?: string;
  status?: CatalogStatus;
};

export type SubcategoryFormProps = {
  formId: string;
  categories: Category[];
  initial?: Subcategory | null;
  mode: "create" | "edit";
  onSubmit: (values: SubcategoryFormValues) => Promise<void>;
  disabled?: boolean;
};

export function SubcategoryForm({
  formId,
  categories,
  initial,
  mode,
  onSubmit,
  disabled = false,
}: SubcategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ? String(initial.categoryId) : "",
  );
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
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
    const catId = Number(categoryId);
    if (!Number.isInteger(catId) || catId < 1) {
      nextFieldErrors.categoryId = "Choose a parent category.";
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }
    setFieldErrors({});
    try {
      await onSubmit({
        name: trimmedName,
        categoryId: catId,
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        status,
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save subcategory.",
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

      <Select
        label="Parent category"
        required
        value={categoryId}
        disabled={disabled || mode === "edit"}
        error={fieldErrors.categoryId}
        hint={mode === "edit" ? "Category cannot be changed after creation." : undefined}
        onChange={(event) => setCategoryId(event.target.value)}
      >
        <option value="">Select category…</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <Input
        label="Name"
        required
        value={name}
        disabled={disabled}
        error={fieldErrors.name}
        onChange={(event) => setName(event.target.value)}
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
        />
      </div>

      <Select
        label="Status"
        value={status}
        disabled={disabled}
        onChange={(event) => setStatus(event.target.value as CatalogStatus)}
      >
        <option value="ACTIVE">Active</option>
        <option value="ARCHIVED">Archived</option>
      </Select>
    </form>
  );
}
