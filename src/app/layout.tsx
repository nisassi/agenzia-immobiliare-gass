import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/lib/queries";
import { BrandStyle } from "@/components/brand-style";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(env.siteUrl),
    title: {
      default: settings.seo_default_title,
      template: `%s — ${settings.agency_name}`,
    },
    description: settings.seo_default_description ?? undefined,
    keywords: settings.seo_keywords ?? undefined,
    applicationName: settings.agency_name,
    openGraph: {
      type: "website",
      siteName: settings.agency_name,
      title: settings.seo_default_title,
      description: settings.seo_default_description ?? undefined,
      locale: "it_IT",
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="it"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BrandStyle
          accent={settings.accent_color}
          accentDark={settings.accent_color_dark}
        />
        {children}
      </body>
    </html>
  );
}
