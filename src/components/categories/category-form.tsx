"use client";

import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CatalogStatus, Category } from "@/types/api";

function isSafeHttpUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !parsed.username &&
      !parsed.password
    );
  } catch {
    return false;
  }
}

export type CategoryFormValues = {
  name: string;
  slug?: string;
  imageUrl?: string;
  status?: CatalogStatus;
};

export type CategoryFormProps = {
  formId: string;
  mode: "create" | "edit";
  initial?: Category | null;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  disabled?: boolean;
};

export function CategoryForm({
  formId,
  mode,
  initial,
  onSubmit,
  disabled = false,
}: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
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
    const trimmedImage = imageUrl.trim();

    if (!trimmedName) {
      nextFieldErrors.name = "Name is required.";
    }

    if (mode === "create") {
      if (!trimmedImage) {
        nextFieldErrors.imageUrl = "Image URL is required.";
      } else if (!isSafeHttpUrl(trimmedImage)) {
        nextFieldErrors.imageUrl =
          "Image URL must be http(s) without credentials.";
      }
    } else if (trimmedImage && !isSafeHttpUrl(trimmedImage)) {
      nextFieldErrors.imageUrl =
        "Image URL must be http(s) without credentials.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }
    setFieldErrors({});

    const payload: CategoryFormValues = {
      name: trimmedName,
      slug: slug.trim() || undefined,
      status,
    };
    if (mode === "create") {
      payload.imageUrl = trimmedImage;
    } else if (trimmedImage && trimmedImage !== (initial?.imageUrl ?? "")) {
      payload.imageUrl = trimmedImage;
    } else if (trimmedImage && !initial?.imageUrl) {
      payload.imageUrl = trimmedImage;
    }

    try {
      await onSubmit(payload);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save category.",
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

      <Input
        label="Slug"
        hint="Optional URL slug"
        value={slug}
        disabled={disabled}
        onChange={(event) => setSlug(event.target.value)}
      />

      <Input
        label="Image URL"
        required={mode === "create"}
        hint={
          mode === "edit"
            ? "Optional. Leave blank to keep the current image, or set http(s) URL."
            : "Required http(s) image URL."
        }
        value={imageUrl}
        disabled={disabled}
        placeholder="https://…"
        error={fieldErrors.imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
      />

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
