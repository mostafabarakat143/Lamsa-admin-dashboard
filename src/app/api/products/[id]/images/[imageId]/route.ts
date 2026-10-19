import { mutateExpress } from "@/lib/api/client";
import { readSessionToken } from "@/lib/auth/cookies";
import { MESSAGES } from "@/lib/auth/credentials";
import { jsonError, jsonSuccess, untrustedResponse } from "@/lib/auth/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string; imageId: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const rejected = untrustedResponse(request);
  if (rejected) return rejected;

  const token = await readSessionToken();
  if (!token) return jsonError(401, MESSAGES.sessionEnded);

  const { id, imageId } = await params;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(imageId)) {
    return jsonError(400, "Invalid product or image id.");
  }

  const result = await mutateExpress(
    token,
    `/api/v1/products/${id}/images/${imageId}`,
    "DELETE",
  );
  if (!result.ok) return jsonError(result.status, result.message);
  return jsonSuccess(result.status, result.data);
}
