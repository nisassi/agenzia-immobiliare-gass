"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Media } from "@/components/media";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  alt: string;
}

export function PropertyGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((index) => (index === null ? null : (index + 1) % images.length)),
    [images.length],
  );
  const previous = useCallback(
    () =>
      setOpenIndex((index) =>
        index === null ? null : (index - 1 + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, next, previous]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line">
        <Media src={null} alt={title} sizes="100vw" fallbackLabel="Immagine in arrivo" />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-line"
          aria-label="Apri la galleria a schermo intero"
        >
          <Media
            src={images[0].url}
            alt={images[0].alt}
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-dark/70 px-2.5 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Expand className="h-3.5 w-3.5" aria-hidden />
            Vedi tutte
          </span>
        </button>

        {images.length > 1 ? (
          <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {images.slice(1, 9).map((image, index) => (
              <li key={image.url}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(index + 1)}
                  className="relative block aspect-square overflow-hidden rounded-md border border-line"
                  aria-label={`Apri immagine ${index + 2}`}
                >
                  <Media src={image.url} alt={image.alt} sizes="20vw" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {openIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galleria immagini di ${title}`}
          className="fixed inset-0 z-50 flex flex-col bg-dark/95 p-4"
        >
          <div className="flex items-center justify-between text-white">
            <p className="text-sm text-white/70">
              {openIndex + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="Chiudi la galleria"
              autoFocus
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center gap-4">
            {images.length > 1 ? (
              <button
                type="button"
                onClick={previous}
                className="rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Immagine precedente"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
            ) : null}

            <div className="relative h-full max-h-[80vh] w-full max-w-5xl">
              <Media
                src={images[openIndex].url}
                alt={images[openIndex].alt}
                sizes="90vw"
                className={cn("object-contain")}
              />
            </div>

            {images.length > 1 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Immagine successiva"
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            ) : null}
          </div>

          <p className="mt-2 text-center text-sm text-white/60">
            {images[openIndex].alt}
          </p>
        </div>
      ) : null}
    </>
  );
}
