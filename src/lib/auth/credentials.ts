export type PublicUser = {
  id: number;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  updatedAt: string;
};

export type PublicProfile = {
  id: number;
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export const MESSAGES = {
  emailRequired: "Email is required.",
  emailInvalid: "Please enter a valid email address.",
  passwordRequired: "Password is required.",
  malformed: "Malformed JSON in request body.",
  rejected: "This request was rejected.",
  unavailable: "We could not reach the account service. Please try again.",
  sessionEnded: "Your session has ended.",
  loggedOut: "Logged out",
  adminOnly: "Only administrators can access this dashboard.",
  loginFailed: "Invalid email or password.",
  revokeUnconfirmed:
    "Your session on this browser has ended. The account service could not confirm that the token was revoked. A copied token may remain valid until it expires.",
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateLogin(
  body: unknown,
):
  | { ok: true; value: { email: string; password: string } }
  | { ok: false; message: string } {
  if (!isRecord(body)) {
    return { ok: false, message: MESSAGES.malformed };
  }

  if (typeof body.email !== "string" || body.email.trim() === "") {
    return { ok: false, message: MESSAGES.emailRequired };
  }
  const email = normalizeEmail(body.email);
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: MESSAGES.emailInvalid };
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    return { ok: false, message: MESSAGES.passwordRequired };
  }
  if (body.password.length > 128) {
    return { ok: false, message: MESSAGES.loginFailed };
  }

  return { ok: true, value: { email, password: body.password } };
}

export function parsePublicUser(value: unknown): PublicUser | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.id !== "number" ||
    !Number.isInteger(value.id) ||
    value.id < 1 ||
    typeof value.email !== "string" ||
    (value.role !== "CUSTOMER" && value.role !== "ADMIN") ||
    (value.status !== "ACTIVE" && value.status !== "DISABLED") ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    email: value.email,
    role: value.role,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parsePublicProfile(value: unknown): PublicProfile | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.id !== "number" ||
    typeof value.userId !== "number" ||
    typeof value.email !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    email: value.email,
    firstName: typeof value.firstName === "string" ? value.firstName : null,
    lastName: typeof value.lastName === "string" ? value.lastName : null,
    phone: typeof value.phone === "string" ? value.phone : null,
    avatarUrl: typeof value.avatarUrl === "string" ? value.avatarUrl : null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function displayName(
  profile: PublicProfile | null,
  email: string,
): string {
  const first = profile?.firstName?.trim() ?? "";
  const last = profile?.lastName?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  return full || email;
}

export function initials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length >= 2) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}
