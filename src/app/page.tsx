import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getAdminSession();
  if (session.state === "authenticated") {
    redirect("/dashboard");
  }
  redirect("/login");
}
