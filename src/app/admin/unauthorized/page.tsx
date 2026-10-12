import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { signOut } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: "Accesso non autorizzato",
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card max-w-md p-8 text-center">
        <ShieldAlert
          className="mx-auto h-8 w-8"
          style={{ color: "var(--color-warning)" }}
          aria-hidden
        />
        <h1 className="mt-4 text-2xl">Account non autorizzato</h1>
        <p className="mt-3 text-sm text-muted">
          Il tuo account è autenticato ma non ha i privilegi di amministratore.
          Chiedi all&apos;agenzia di abilitare il tuo accesso, oppure esci e
          accedi con un account autorizzato.
        </p>
        <form action={signOut} className="mt-6">
          <button type="submit" className="btn btn-outline">
            Esci
          </button>
        </form>
      </div>
    </div>
  );
}
