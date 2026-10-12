import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <AdminShell agencyName={settings.agency_name} userEmail={user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
