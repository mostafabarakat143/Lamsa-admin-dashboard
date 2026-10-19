import type { Metadata } from "next";

import { ContactClient } from "@/components/contact/contact-client";
import { fetchPaginated } from "@/lib/api/client";
import { parseContactMessage } from "@/lib/api/parsers";
import { readInt, toSearchParams } from "@/lib/api/query";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Contact",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContactPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const page = readInt(params, "page", 1) ?? 1;
  const pageSize = readInt(params, "pageSize", 20) ?? 20;

  const query: Record<string, string | undefined> = {
    page: String(page),
    pageSize: String(pageSize),
  };

  const listPath = `/api/v1/contact${toSearchParams({
    page,
    pageSize,
  })}`;

  const result = await fetchPaginated(
    admin.token,
    listPath,
    parseContactMessage,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Contact messages</h1>
        <p className="mt-1 text-sm text-muted">
          Inquiries submitted through the storefront contact form.
        </p>
      </div>

      <ContactClient
        messages={result.ok ? result.data.items : []}
        meta={result.ok ? result.data.meta : null}
        error={result.ok ? null : result.error.message}
        query={query}
      />
    </div>
  );
}
