"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Settings2,
  Layers,
  ExternalLink,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Panoramica", Icon: LayoutDashboard, exact: true },
  { href: "/admin/immobili", label: "Immobili", Icon: Building2 },
  { href: "/admin/richieste", label: "Richieste", Icon: MessageSquare },
  { href: "/admin/servizi", label: "Servizi", Icon: Layers },
  { href: "/admin/contenuti", label: "Contenuti", Icon: Settings2 },
];

export function AdminShell({
  agencyName,
  userEmail,
  children,
}: {
  agencyName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Amministrazione">
      {NAV.map(({ href, label, Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          aria-current={isActive(href, exact) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            isActive(href, exact)
              ? "bg-dark text-white"
              : "text-ink-soft hover:bg-ink/5",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </Link>
      ))}
      <Link
        href="/"
        target="_blank"
        className="mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-ink/5"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        Vedi il sito
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface p-4 lg:flex">
        <div className="px-2 py-3">
          <p className="font-display text-lg text-ink">{agencyName}</p>
          <p className="text-xs text-muted">Amministrazione</p>
        </div>
        <div className="mt-4 flex-1">{nav}</div>
        <form action={signOut} className="mt-4 border-t border-line pt-4">
          <p className="truncate px-3 text-xs text-muted" title={userEmail}>
            {userEmail}
          </p>
          <button
            type="submit"
            className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-ink/5"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Esci
          </button>
        </form>
      </aside>

      {/* Mobile header */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
          <div>
            <p className="font-display text-base text-ink">{agencyName}</p>
            <p className="text-[0.7rem] text-muted">Amministrazione</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            aria-expanded={open}
            aria-controls="admin-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">Menu</span>
          </button>
        </header>

        {open ? (
          <div id="admin-mobile-nav" className="border-b border-line bg-surface p-4 lg:hidden">
            {nav}
            <form action={signOut} className="mt-4 border-t border-line pt-4">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-ink/5"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Esci ({userEmail})
              </button>
            </form>
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
