"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postJson } from "@/lib/client/fetch-json";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await postJson("/api/auth/login", { email, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? (
        <p role="alert" className="text-sm text-rose-deep">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" loading={loading}>
        Sign in
      </Button>
    </form>
  );
}
