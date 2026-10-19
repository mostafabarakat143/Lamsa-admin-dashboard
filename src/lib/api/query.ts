export function toSearchParams(
  values: Record<string, string | number | boolean | undefined | null>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function readString(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

export function readInt(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback?: number,
): number | undefined {
  const raw = readString(params, key);
  if (!raw) {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isInteger(n)) {
    return fallback;
  }
  return n;
}

export function buildPageHref(
  pathname: string,
  current: Record<string, string | undefined>,
  patch: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...patch };
  for (const [key, value] of Object.entries(merged)) {
    if (value) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
