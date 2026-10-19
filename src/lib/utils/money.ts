const PG_INT_MAX = 2_147_483_647;

/** Format integer piastres as EGP display text. */
export function formatEgp(priceMinor: number): string {
  if (!Number.isInteger(priceMinor) || priceMinor < 0) {
    return "—";
  }
  const pounds = Math.floor(priceMinor / 100);
  const piastres = priceMinor % 100;
  return `EGP ${pounds}.${String(piastres).padStart(2, "0")}`;
}

/**
 * Parse EGP input into integer piastres.
 * Rejects more than two decimal places. No floating-point money math.
 */
export function parseEgpToMinor(raw: string):
  | { ok: true; priceMinor: number }
  | { ok: false; message: string } {
  const value = raw.trim();
  if (!value) {
    return { ok: false, message: "Price is required." };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return {
      ok: false,
      message: "Enter a valid EGP amount with at most two decimal places.",
    };
  }

  const [poundsPart, fractionPart = ""] = value.split(".");
  const pounds = Number(poundsPart);
  const piastres = Number(fractionPart.padEnd(2, "0") || "0");

  if (!Number.isInteger(pounds) || !Number.isInteger(piastres)) {
    return { ok: false, message: "Enter a valid EGP amount." };
  }

  if (pounds > Math.floor(PG_INT_MAX / 100)) {
    return { ok: false, message: "Price exceeds the allowed range." };
  }

  const priceMinor = pounds * 100 + piastres;
  if (priceMinor > PG_INT_MAX) {
    return { ok: false, message: "Price exceeds the allowed range." };
  }

  return { ok: true, priceMinor };
}

export function minorToEgpInput(priceMinor: number): string {
  if (!Number.isInteger(priceMinor) || priceMinor < 0) {
    return "";
  }
  const pounds = Math.floor(priceMinor / 100);
  const piastres = priceMinor % 100;
  if (piastres === 0) {
    return String(pounds);
  }
  return `${pounds}.${String(piastres).padStart(2, "0")}`;
}
