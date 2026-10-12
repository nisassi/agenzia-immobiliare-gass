import { getSiteSettings } from "@/lib/queries";
import { hasAuthCookie, isCurrentUserAdmin } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConfigNotice } from "@/components/config-notice";

// Content is editor-driven: always render against the latest database state so
// edits in the admin dashboard appear immediately on the public site.
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  // Only perform the auth round-trip when an auth cookie is actually present.
  const isAdmin = (await hasAuthCookie()) ? await isCurrentUserAdmin() : false;

  return (
    <>
      <ConfigNotice />
      <SiteHeader
        agencyName={settings.agency_name}
        logoUrl={settings.logo_url}
        isAdmin={isAdmin}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
