import { bearerInit, callExpress } from "@/lib/auth/express";
import { parseDashboard } from "@/lib/api/parsers";
import { toSearchParams } from "@/lib/api/query";
import type { ApiLoadError, DashboardData } from "@/types/api";

export type DashboardQuery = {
  from?: string;
  to?: string;
  bucket?: "month" | "day";
};

export async function loadAdminDashboard(
  token: string,
  query: DashboardQuery = {},
): Promise<
  | { ok: true; data: DashboardData }
  | { ok: false; error: ApiLoadError }
> {
  const path = `/api/v1/admin/dashboard${toSearchParams({
    from: query.from,
    to: query.to,
    bucket: query.bucket ?? "month",
  })}`;

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

  const payload =
    typeof result.data === "object" &&
    result.data !== null &&
    "dashboard" in result.data
      ? (result.data as { dashboard: unknown }).dashboard
      : result.data;

  const parsed = parseDashboard(payload);
  if (!parsed) {
    return {
      ok: false,
      error: { kind: "error", message: "Unexpected dashboard response." },
    };
  }

  return { ok: true, data: parsed };
}
