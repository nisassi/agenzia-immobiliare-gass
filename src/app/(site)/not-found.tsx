import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Errore 404</p>
      <h1 className="mt-4 font-display text-5xl">Pagina non trovata</h1>
      <p className="mt-4 max-w-md text-muted">
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-accent">
          Torna alla home
        </Link>
        <Link href="/immobili" className="btn btn-outline">
          Vedi gli immobili
        </Link>
      </div>
    </div>
  );
}
