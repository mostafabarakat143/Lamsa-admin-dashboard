import { DesktopSidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { requireAdmin } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-bg">
      <DesktopSidebar />
      <div className="lg:pl-64">
        <TopNavbar
          name={admin.name}
          email={admin.user.email}
          avatarUrl={admin.avatarUrl}
          initials={admin.initials}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
