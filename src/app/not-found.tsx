import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <main className="container-x flex min-h-screen flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Errore 404</p>
      <h1 className="mt-4 font-display text-5xl">Pagina non trovata</h1>
      <p className="mt-4 max-w-md text-muted">
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <Link href="/" className="btn btn-accent mt-8">
        Torna alla home
      </Link>
    </main>
  );
}
