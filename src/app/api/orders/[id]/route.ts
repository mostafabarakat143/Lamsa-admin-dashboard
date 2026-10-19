import { parseOrder } from "@/lib/api/parsers";
import { bearerInit, callExpress } from "@/lib/auth/express";
import { readSessionToken } from "@/lib/auth/cookies";
import { MESSAGES } from "@/lib/auth/credentials";
import { jsonError, jsonSuccess } from "@/lib/auth/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET(_request: Request, { params }: Params) {
  const token = await readSessionToken();
  if (!token) {
    return jsonError(401, MESSAGES.sessionEnded);
  }

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return jsonError(400, "Invalid order id.");
  }

  const result = await callExpress(
    `/api/v1/orders/${id}`,
    bearerInit(token, "GET"),
  );

  if (result.kind === "unreachable") {
    return jsonError(503, MESSAGES.unavailable);
  }
  if (result.kind === "error") {
    return jsonError(result.status, result.message);
  }

  const order = isRecord(result.data)
    ? parseOrder(result.data.order ?? result.data)
    : null;

  if (!order) {
    return jsonError(502, "Unexpected order response.");
  }

  return jsonSuccess(200, { order });
}
