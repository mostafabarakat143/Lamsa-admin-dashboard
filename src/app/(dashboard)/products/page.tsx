import type { Metadata } from "next";

import { ProductsClient } from "@/components/products/products-client";
import { fetchPaginated } from "@/lib/api/client";
import {
  parseCategory,
  parseProduct,
  parseSubcategory,
} from "@/lib/api/parsers";
import { readInt, readString, toSearchParams } from "@/lib/api/query";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Products",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const page = readInt(params, "page", 1) ?? 1;
  const pageSize = readInt(params, "pageSize", 20) ?? 20;
  const search = readString(params, "search");
  const categoryId = readString(params, "categoryId");
  const subcategoryId = readString(params, "subcategoryId");
  const availability = readString(params, "availability") ?? "ALL";
  const status = readString(params, "status") ?? "ALL";
  const sortBy = readString(params, "sortBy") ?? "name";
  const sortOrder = readString(params, "sortOrder") ?? "asc";

  const query: Record<string, string | undefined> = {
    page: String(page),
    pageSize: String(pageSize),
    search,
    categoryId,
    subcategoryId,
    availability,
    status,
    sortBy,
    sortOrder,
  };

  const listPath = `/api/v1/products${toSearchParams({
    page,
    pageSize,
    search,
    categoryId: categoryId ? Number(categoryId) : undefined,
    subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
    availability,
    status,
    sortBy,
    sortOrder,
  })}`;

  const [productsResult, categoriesResult, subcategoriesResult] =
    await Promise.all([
      fetchPaginated(admin.token, listPath, parseProduct),
      fetchPaginated(
        admin.token,
        "/api/v1/categories?page=1&pageSize=100&status=ACTIVE&sortBy=name&sortOrder=asc",
        parseCategory,
      ),
      fetchPaginated(
        admin.token,
        "/api/v1/subcategories?page=1&pageSize=100&status=ACTIVE&sortBy=name&sortOrder=asc",
        parseSubcategory,
      ),
    ]);

  const products = productsResult.ok ? productsResult.data.items : [];
  const meta = productsResult.ok ? productsResult.data.meta : null;
  const error = productsResult.ok ? null : productsResult.error.message;
  const categories = categoriesResult.ok ? categoriesResult.data.items : [];
  const subcategories = subcategoriesResult.ok
    ? subcategoriesResult.data.items
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Products</h1>
      </div>

      <ProductsClient
        products={products}
        meta={meta}
        error={error}
        query={query}
        categories={categories}
        subcategories={subcategories}
      />
    </div>
  );
}
