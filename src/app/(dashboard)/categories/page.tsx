import type { Metadata } from "next";

import { CategoriesClient } from "@/components/categories/categories-client";
import { fetchPaginated } from "@/lib/api/client";
import { parseCategory } from "@/lib/api/parsers";
import { readInt, readString, toSearchParams } from "@/lib/api/query";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Categories",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoriesPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const page = readInt(params, "page", 1) ?? 1;
  const pageSize = readInt(params, "pageSize", 20) ?? 20;
  const search = readString(params, "search");
  const status = readString(params, "status") ?? "ALL";
  const sortBy = readString(params, "sortBy") ?? "name";
  const sortOrder = readString(params, "sortOrder") ?? "asc";

  const query: Record<string, string | undefined> = {
    page: String(page),
    pageSize: String(pageSize),
    search,
    status,
    sortBy,
    sortOrder,
  };

  const listPath = `/api/v1/categories${toSearchParams({
    page,
    pageSize,
    search,
    status,
    sortBy,
    sortOrder,
  })}`;

  const result = await fetchPaginated(admin.token, listPath, parseCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Categories</h1>
        <p className="mt-1 text-sm text-muted">Organize products into top-level groups.</p>
      </div>

      <CategoriesClient
        categories={result.ok ? result.data.items : []}
        meta={result.ok ? result.data.meta : null}
        error={result.ok ? null : result.error.message}
        query={query}
      />
    </div>
  );
}
