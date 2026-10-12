"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the browser console for debugging.
    console.error(error);
  }, [error]);

  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <AlertTriangle
        className="h-8 w-8"
        style={{ color: "var(--color-danger)" }}
        aria-hidden
      />
      <h1 className="mt-5 font-display text-4xl">Qualcosa è andato storto</h1>
      <p className="mt-4 max-w-md text-muted">
        Non è stato possibile caricare questa sezione. Puoi riprovare o tornare
        alla home.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted">Codice: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-accent">
          Riprova
        </button>
        <Link href="/" className="btn btn-outline">
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
