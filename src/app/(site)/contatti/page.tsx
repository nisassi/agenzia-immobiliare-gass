import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
} from "@/components/social-icons";
import { getSiteSettings } from "@/lib/queries";
import { InquiryForm, ValuationForm } from "@/components/public-forms";

type SocialIcon = (props: { className?: string }) => React.ReactElement;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.contact_title ?? "Contatti",
    description: settings.contact_intro ?? undefined,
    alternates: { canonical: "/contatti" },
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const socials = [
    { href: settings.social_facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.social_instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.social_linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: settings.social_youtube, label: "YouTube", Icon: YouTubeIcon },
  ].filter((item): item is { href: string; label: string; Icon: SocialIcon } =>
    Boolean(item.href),
  );

  return (
    <div className="container-x py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="eyebrow">Contatti</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">
          {settings.contact_title ?? "Contattaci"}
        </h1>
        {settings.contact_intro ? (
          <p className="mt-4 text-muted">{settings.contact_intro}</p>
        ) : null}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="card p-6">
            <h2 className="text-lg">Informazioni</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {settings.contact_email ? (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
                  <dt className="sr-only">Email</dt>
                  <dd>
                    <a
                      className="hover:text-accent-dark"
                      href={`mailto:${settings.contact_email}`}
                    >
                      {settings.contact_email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.contact_phone ? (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
                  <dt className="sr-only">Telefono</dt>
                  <dd>
                    <a
                      className="hover:text-accent-dark"
                      href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                    >
                      {settings.contact_phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.contact_address ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
                  <dt className="sr-only">Indirizzo</dt>
                  <dd>{settings.contact_address}</dd>
                </div>
              ) : null}
              {settings.opening_hours ? (
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
                  <dt className="sr-only">Orari</dt>
                  <dd>{settings.opening_hours}</dd>
                </div>
              ) : null}
            </dl>

            {socials.length > 0 ? (
              <ul className="mt-6 flex gap-3 border-t border-line pt-5">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-muted transition-colors hover:border-ink hover:text-ink"
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="space-y-10">
          <section className="card p-6 sm:p-8">
            <h2 className="text-xl">Invia un messaggio</h2>
            <p className="mt-1 text-sm text-muted">
              Ti risponderemo il prima possibile.
            </p>
            <div className="mt-6">
              <InquiryForm sourcePage="/contatti" />
            </div>
          </section>

          <section id="valutazione" className="card scroll-mt-24 p-6 sm:p-8">
            <h2 className="text-xl">Richiedi una valutazione</h2>
            <p className="mt-1 text-sm text-muted">
              Indicaci le caratteristiche principali del tuo immobile.
            </p>
            <div className="mt-6">
              <ValuationForm sourcePage="/contatti" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
