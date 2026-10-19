import { bearerInit, callExpress } from "@/lib/auth/express";
import type { ApiLoadError, Paginated } from "@/types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function fetchPaginated<T>(
  token: string,
  path: string,
  parseItem: (value: unknown) => T | null,
): Promise<{ ok: true; data: Paginated<T> } | { ok: false; error: ApiLoadError }> {
  const result = await callExpress(path, bearerInit(token, "GET"));
  if (result.kind === "unreachable") {
    return {
      ok: false,
      error: { kind: "unreachable", message: "API unavailable." },
    };
  }
  if (result.kind === "error") {
    return {
      ok: false,
      error: {
        kind: result.status === 401 ? "unauthorized" : "error",
        message: result.message,
        status: result.status,
      },
    };
  }

  if (!isRecord(result.data) || !Array.isArray(result.data.items)) {
    return {
      ok: false,
      error: { kind: "error", message: "Unexpected API response." },
    };
  }

  const metaRaw = result.data.meta;
  if (
    !isRecord(metaRaw) ||
    typeof metaRaw.page !== "number" ||
    typeof metaRaw.pageSize !== "number" ||
    typeof metaRaw.totalItems !== "number" ||
    typeof metaRaw.totalPages !== "number"
  ) {
    return {
      ok: false,
      error: { kind: "error", message: "Unexpected pagination metadata." },
    };
  }

  const items: T[] = [];
  for (const row of result.data.items) {
    const parsed = parseItem(row);
    if (parsed) {
      items.push(parsed);
    }
  }

  return {
    ok: true,
    data: {
      items,
      meta: {
        page: metaRaw.page,
        pageSize: metaRaw.pageSize,
        totalItems: metaRaw.totalItems,
        totalPages: metaRaw.totalPages,
      },
    },
  };
}

export async function fetchTotalCount(
  token: string,
  path: string,
): Promise<{ ok: true; total: number } | { ok: false; error: ApiLoadError }> {
  const result = await fetchPaginated(token, path, () => ({ id: 1 }));
  if (!result.ok) {
    return result;
  }
  return { ok: true, total: result.data.meta.totalItems };
}

export async function mutateExpress(
  token: string,
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; message: string }
> {
  const result = await callExpress(path, bearerInit(token, method, body));
  if (result.kind === "unreachable") {
    return { ok: false, status: 503, message: "API unavailable." };
  }
  if (result.kind === "error") {
    return { ok: false, status: result.status, message: result.message };
  }
  return { ok: true, status: result.status, data: result.data };
}
