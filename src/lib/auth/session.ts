import { cache } from "react";
import { redirect } from "next/navigation";

import {
  displayName,
  initials,
  parsePublicProfile,
  parsePublicUser,
  type PublicProfile,
  type PublicUser,
} from "./credentials";
import { readSessionToken } from "./cookies";
import { bearerInit, callExpress } from "./express";

export type SessionUser = {
  id: number;
  email: string;
  role: "ADMIN";
};

export type AdminSession =
  | { state: "anonymous" }
  | { state: "authenticated"; user: SessionUser; profile: PublicProfile | null }
  | { state: "invalid" }
  | { state: "forbidden" }
  | { state: "unavailable" };

async function loadAdminSession(): Promise<AdminSession> {
  const token = await readSessionToken();
  if (!token) {
    return { state: "anonymous" };
  }

  const me = await callExpress("/api/v1/auth/me", bearerInit(token, "GET"));
  if (me.kind === "unreachable") {
    return { state: "unavailable" };
  }
  if (me.kind === "error") {
    return me.status === 401 ? { state: "invalid" } : { state: "unavailable" };
  }

  if (!isRecord(me.data) || !("user" in me.data)) {
    return { state: "invalid" };
  }

  const user = parsePublicUser(me.data.user);
  if (!user || user.status !== "ACTIVE") {
    return { state: "invalid" };
  }
  if (user.role !== "ADMIN") {
    return { state: "forbidden" };
  }

  const profileResult = await callExpress(
    "/api/v1/users/me/profile",
    bearerInit(token, "GET"),
  );
  let profile: PublicProfile | null = null;
  if (profileResult.kind === "ok" && isRecord(profileResult.data)) {
    profile = parsePublicProfile(
      "profile" in profileResult.data
        ? profileResult.data.profile
        : profileResult.data,
    );
  }

  return {
    state: "authenticated",
    user: { id: user.id, email: user.email, role: "ADMIN" },
    profile,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export const getAdminSession = cache(loadAdminSession);

export async function requireAdmin(): Promise<{
  user: SessionUser;
  profile: PublicProfile | null;
  token: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
}> {
  const session = await getAdminSession();
  if (session.state === "authenticated") {
    const token = await readSessionToken();
    if (!token) {
      redirect("/login?expired=1");
    }
    const name = displayName(session.profile, session.user.email);
    return {
      user: session.user,
      profile: session.profile,
      token,
      name,
      avatarUrl: session.profile?.avatarUrl ?? null,
      initials: initials(name, session.user.email),
    };
  }

  if (session.state === "forbidden") {
    redirect("/login?forbidden=1");
  }
  if (session.state === "unavailable") {
    redirect("/login?unavailable=1");
  }
  const expired = session.state === "invalid" ? "&expired=1" : "";
  redirect(`/login?next=${encodeURIComponent("/dashboard")}${expired}`);
}

export type { PublicUser, PublicProfile };
