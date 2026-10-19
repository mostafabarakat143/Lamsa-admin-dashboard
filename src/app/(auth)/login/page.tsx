import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();
  if (session.state === "authenticated") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const notice =
    params.forbidden === "1"
      ? "Only administrators can access this dashboard."
      : params.expired === "1"
        ? "Your session has ended. Please sign in again."
        : params.unavailable === "1"
          ? "We could not verify your session. Please try again."
          : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Image
            src="/brand-logo.png"
            alt="Lamsa Cosmetics"
            width={72}
            height={76}
            className="mb-2 h-16 w-auto"
            priority
          />
          <CardTitle className="font-display text-2xl">Lamsa Admin</CardTitle>
          <p className="text-sm text-muted">
            Sign in with an ADMIN account to manage the catalog and orders.
          </p>
        </CardHeader>
        <CardBody>
          {notice ? (
            <p
              role="status"
              className="mb-4 rounded-lg border border-line bg-blush px-3 py-2 text-sm text-ink"
            >
              {notice}
            </p>
          ) : null}
          <LoginForm />
        </CardBody>
      </Card>
    </div>
  );
}
