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

const LAST_ADMIN_MESSAGE =
  "At least one active admin must remain. You cannot demote or disable the last active admin.";

export async function PATCH(request: Request, { params }: Params) {
  const rejected = untrustedResponse(request);
  if (rejected) return rejected;
  const token = await readSessionToken();
  if (!token) return jsonError(401, MESSAGES.sessionEnded);
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return jsonError(400, "Invalid user id.");
  }
  const body = await readJson(request);
  if (body === "invalid") return jsonError(400, MESSAGES.malformed);
  const result = await mutateExpress(
    token,
    `/api/v1/users/${id}`,
    "PATCH",
    body,
  );
  if (!result.ok) {
    if (result.status === 409) {
      const message =
        result.message.trim() &&
        !/^request failed\.?$/i.test(result.message.trim())
          ? result.message
          : LAST_ADMIN_MESSAGE;
      return jsonError(409, message);
    }
    return jsonError(result.status, result.message);
  }
  return jsonSuccess(result.status, result.data);
}
