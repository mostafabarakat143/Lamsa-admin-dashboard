import type { Metadata } from "next";

import { UsersClient } from "@/components/users/users-client";
import { fetchPaginated } from "@/lib/api/client";
import { parseAdminUser } from "@/lib/api/parsers";
import { readInt, readString, toSearchParams } from "@/lib/api/query";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Users",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const page = readInt(params, "page", 1) ?? 1;
  const pageSize = readInt(params, "pageSize", 20) ?? 20;
  const search = readString(params, "search");
  const role = readString(params, "role") ?? "ALL";
  const status = readString(params, "status") ?? "ALL";
  const sortBy = readString(params, "sortBy") ?? "createdAt";
  const sortOrder = readString(params, "sortOrder") ?? "desc";

  const query: Record<string, string | undefined> = {
    page: String(page),
    pageSize: String(pageSize),
    search,
    role,
    status,
    sortBy,
    sortOrder,
  };

  const listPath = `/api/v1/users${toSearchParams({
    page,
    pageSize,
    search,
    role: role === "ALL" ? undefined : role,
    status: status === "ALL" ? undefined : status,
    sortBy,
    sortOrder,
  })}`;

  const result = await fetchPaginated(admin.token, listPath, parseAdminUser);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Users</h1>
        <p className="mt-1 text-sm text-muted">
          Customer accounts and admin access.
        </p>
      </div>

      <UsersClient
        users={result.ok ? result.data.items : []}
        meta={result.ok ? result.data.meta : null}
        error={result.ok ? null : result.error.message}
        query={query}
      />
    </div>
  );
}
