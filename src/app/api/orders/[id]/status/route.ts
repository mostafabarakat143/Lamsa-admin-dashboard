import { mutateExpress } from "@/lib/api/client";
import { readSessionToken } from "@/lib/auth/cookies";
import { MESSAGES } from "@/lib/auth/credentials";
import {
  jsonError,
  jsonSuccess,
  readJson,
  untrustedResponse,
} from "@/lib/auth/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const rejected = untrustedResponse(request);
  if (rejected) return rejected;
  const token = await readSessionToken();
  if (!token) return jsonError(401, MESSAGES.sessionEnded);
  const { id } = await params;
  const body = await readJson(request);
  if (body === "invalid") return jsonError(400, MESSAGES.malformed);
  const result = await mutateExpress(
    token,
    `/api/v1/orders/${id}/status`,
    "PATCH",
    body,
  );
  if (!result.ok) return jsonError(result.status, result.message);
  return jsonSuccess(result.status, result.data);
}
