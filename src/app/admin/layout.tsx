import type { Metadata } from "next";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: { default: "Amministrazione", template: "%s — Amministrazione" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper">{children}</div>
    </ToastProvider>
  );
}
