import type { Metadata } from "next";

import { SubcategoriesClient } from "@/components/subcategories/subcategories-client";
import { fetchPaginated } from "@/lib/api/client";
import { parseCategory, parseSubcategory } from "@/lib/api/parsers";
import { readInt, readString, toSearchParams } from "@/lib/api/query";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Subcategories",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SubcategoriesPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const page = readInt(params, "page", 1) ?? 1;
  const pageSize = readInt(params, "pageSize", 20) ?? 20;
  const search = readString(params, "search");
  const categoryId = readString(params, "categoryId");
  const status = readString(params, "status") ?? "ALL";
  const sortBy = readString(params, "sortBy") ?? "name";
  const sortOrder = readString(params, "sortOrder") ?? "asc";

  const query: Record<string, string | undefined> = {
    page: String(page),
    pageSize: String(pageSize),
    search,
    categoryId,
    status,
    sortBy,
    sortOrder,
  };

  const listPath = `/api/v1/subcategories${toSearchParams({
    page,
    pageSize,
    search,
    categoryId: categoryId ? Number(categoryId) : undefined,
    status,
    sortBy,
    sortOrder,
  })}`;

  const [subcategoriesResult, categoriesResult] = await Promise.all([
    fetchPaginated(admin.token, listPath, parseSubcategory),
    fetchPaginated(
      admin.token,
      "/api/v1/categories?page=1&pageSize=100&status=ACTIVE&sortBy=name&sortOrder=asc",
      parseCategory,
    ),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Subcategories</h1>
        <p className="mt-1 text-sm text-muted">
          Finer groupings linked to a parent category.
        </p>
      </div>

      <SubcategoriesClient
        subcategories={
          subcategoriesResult.ok ? subcategoriesResult.data.items : []
        }
        meta={subcategoriesResult.ok ? subcategoriesResult.data.meta : null}
        error={
          subcategoriesResult.ok ? null : subcategoriesResult.error.message
        }
        query={query}
        categories={categoriesResult.ok ? categoriesResult.data.items : []}
      />
    </div>
  );
}
