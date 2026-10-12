"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Lock, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/immobili", label: "Immobili" },
  { href: "/servizi", label: "Servizi" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
];

export function SiteHeader({
  agencyName,
  logoUrl,
  isAdmin = false,
}: {
  agencyName: string;
  logoUrl: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Entry point to the reserved area. `/admin` redirects to the login screen
  // for anonymous visitors, or straight to the dashboard when signed in.
  const areaLink = (
    <Link
      href="/admin"
      className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
      title={isAdmin ? "Pannello di amministrazione" : "Area riservata"}
    >
      {isAdmin ? (
        <LayoutDashboard className="h-4 w-4" aria-hidden />
      ) : (
        <Lock className="h-4 w-4" aria-hidden />
      )}
      {isAdmin ? "Pannello" : "Area riservata"}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label={`${agencyName} — home`}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={agencyName}
              className="h-9 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <>
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-sm text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {agencyName.charAt(0).toUpperCase()}
              </span>
              <span className="font-display text-lg tracking-tight text-ink">
                {agencyName}
              </span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principale">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                isActive(item.href)
                  ? "text-ink"
                  : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          {areaLink}
          <Link href="/contatti#valutazione" className="btn btn-outline btn-sm">
            Richiedi valutazione
          </Link>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
          <span className="sr-only">
            {open ? "Chiudi il menu" : "Apri il menu"}
          </span>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Principale"
          className="border-t border-line bg-paper md:hidden"
        >
          <div className="container-x flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "border-b border-line/70 py-3 text-sm last:border-b-0",
                  isActive(item.href) ? "text-ink" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contatti#valutazione"
              onClick={() => setOpen(false)}
              className="btn btn-accent my-3"
            >
              Richiedi valutazione
            </Link>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-3 text-sm text-muted"
            >
              {isAdmin ? (
                <LayoutDashboard className="h-4 w-4" aria-hidden />
              ) : (
                <Lock className="h-4 w-4" aria-hidden />
              )}
              {isAdmin ? "Pannello di amministrazione" : "Area riservata"}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
