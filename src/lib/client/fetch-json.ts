import {
  SAME_ORIGIN_HEADER,
  SAME_ORIGIN_VALUE,
} from "@/lib/auth/origin";

export type ClientResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; message: string };

export async function getJson(path: string): Promise<ClientResult> {
  try {
    const response = await fetch(path, {
      method: "GET",
      headers: { accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = null;
      }
    }

    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : "Request failed.";

    if (!response.ok) {
      return { ok: false, status: response.status, message };
    }

    const data =
      typeof parsed === "object" &&
      parsed !== null &&
      "data" in parsed
        ? (parsed as { data: unknown }).data
        : parsed;

    return { ok: true, status: response.status, data };
  } catch {
    return { ok: false, status: 503, message: "Request failed." };
  }
}

export async function postJson(
  path: string,
  body?: unknown,
): Promise<ClientResult> {
  return mutateJson(path, "POST", body);
}

export async function patchJson(
  path: string,
  body?: unknown,
): Promise<ClientResult> {
  return mutateJson(path, "PATCH", body);
}

export async function deleteJson(path: string): Promise<ClientResult> {
  return mutateJson(path, "DELETE");
}

async function mutateJson(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<ClientResult> {
  try {
    const response = await fetch(path, {
      method,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        [SAME_ORIGIN_HEADER]: SAME_ORIGIN_VALUE,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = null;
      }
    }

    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : "Request failed.";

    if (!response.ok) {
      return { ok: false, status: response.status, message };
    }

    const data =
      typeof parsed === "object" &&
      parsed !== null &&
      "data" in parsed
        ? (parsed as { data: unknown }).data
        : parsed;

    return { ok: true, status: response.status, data };
  } catch {
    return { ok: false, status: 503, message: "Request failed." };
  }
}
