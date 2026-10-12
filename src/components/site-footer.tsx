import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
} from "@/components/social-icons";
import type { SiteSettings } from "@/lib/types";

type SocialIcon = (props: { className?: string }) => React.ReactElement;

const NAV = [
  { href: "/immobili", label: "Immobili" },
  { href: "/servizi", label: "Servizi" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
];

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: settings.social_facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.social_instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.social_linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: settings.social_youtube, label: "YouTube", Icon: YouTubeIcon },
  ].filter((item): item is { href: string; label: string; Icon: SocialIcon } =>
    Boolean(item.href),
  );

  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-dark text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl text-white">
            {settings.agency_name}
          </p>
          {settings.tagline ? (
            <p className="mt-2 max-w-sm text-sm text-white/60">
              {settings.tagline}
            </p>
          ) : null}
          {socials.length > 0 ? (
            <ul className="mt-6 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-white/50">
            Navigazione
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-white/50">
            Contatti
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {settings.contact_email ? (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {settings.contact_email}
                </a>
              </li>
            ) : null}
            {settings.contact_phone ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
                <a
                  href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {settings.contact_phone}
                </a>
              </li>
            ) : null}
            {settings.contact_address ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
                <span className="text-white/70">{settings.contact_address}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.agency_name}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {settings.footer_note ? <p>{settings.footer_note}</p> : null}
            <Link
              href="/admin"
              className="transition-colors hover:text-white"
            >
              Area riservata
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
