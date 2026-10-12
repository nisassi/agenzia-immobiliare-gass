"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Star,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Film,
  LinkIcon,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { useToast } from "@/components/toast";
import {
  registerImage,
  deleteImage,
  moveImage,
  setCoverImage,
  setVideo,
  clearVideo,
} from "@/app/admin/(panel)/immobili/media-actions";
import type { PropertyImage } from "@/lib/types";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function extensionOf(name: string): string {
  const parts = name.split(".");
  const ext = parts.length > 1 ? parts.pop()! : "";
  return /^[a-z0-9]{2,5}$/i.test(ext) ? ext.toLowerCase() : "bin";
}

export function MediaManager({
  propertyId,
  propertyTitle,
  images: initialImages,
  coverImageUrl,
  videoUrl,
}: {
  propertyId: string;
  propertyTitle: string;
  images: PropertyImage[];
  coverImageUrl: string | null;
  videoUrl: string | null;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [externalVideo, setExternalVideo] = useState("");
  const [pending, startTransition] = useTransition();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // `images` always reflects the latest server data; refresh() after each
  // mutation re-renders this component with updated props.
  const images = initialImages;

  async function handleImageFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      notify("error", "Supabase non configurato: impossibile caricare file.");
      return;
    }

    setUploading(true);
    let succeeded = 0;
    try {
      for (const file of Array.from(files)) {
        if (!IMAGE_TYPES.includes(file.type)) {
          notify("error", `${file.name}: formato non supportato.`);
          continue;
        }
        if (file.size > env.maxImageUploadBytes) {
          notify(
            "error",
            `${file.name}: file troppo grande (max ${Math.round(env.maxImageUploadBytes / 1048576)} MB).`,
          );
          continue;
        }

        const path = `properties/${propertyId}/${crypto.randomUUID()}.${extensionOf(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from(env.storageBucket)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          notify("error", `${file.name}: caricamento non riuscito (${uploadError.message}).`);
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from(env.storageBucket)
          .getPublicUrl(path);

        const result = await registerImage({
          propertyId,
          url: publicUrl.publicUrl,
          path,
          alt: `${propertyTitle} — ${file.name.replace(/\.[^.]+$/, "")}`,
        });
        if (result.ok) succeeded += 1;
        else notify("error", result.message ?? "Registrazione non riuscita.");
      }
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (succeeded > 0) {
        notify("success", `${succeeded} immagine/i caricate.`);
        router.refresh();
      }
    }
  }

  async function handleVideoFile(file: File | undefined) {
    if (!file) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      notify("error", "Supabase non configurato: impossibile caricare file.");
      return;
    }
    if (!VIDEO_TYPES.includes(file.type)) {
      notify("error", "Formato video non supportato (usa MP4, WebM o MOV).");
      return;
    }
    if (file.size > env.maxVideoUploadBytes) {
      notify(
        "error",
        `Video troppo grande (max ${Math.round(env.maxVideoUploadBytes / 1048576)} MB). Per file più grandi usa un link esterno.`,
      );
      return;
    }

    setVideoUploading(true);
    try {
      const path = `properties/${propertyId}/${crypto.randomUUID()}.${extensionOf(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(env.storageBucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) {
        notify("error", `Caricamento non riuscito: ${uploadError.message}`);
        return;
      }
      const { data: publicUrl } = supabase.storage
        .from(env.storageBucket)
        .getPublicUrl(path);
      const result = await setVideo(propertyId, {
        url: publicUrl.publicUrl,
        path,
      });
      if (result.ok) {
        notify("success", "Video caricato.");
        router.refresh();
      } else {
        notify("error", result.message ?? "Salvataggio non riuscito.");
      }
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  function removeImage(imageId: string) {
    startTransition(async () => {
      const result = await deleteImage(imageId);
      notify(
        result.ok ? "success" : "error",
        result.ok ? "Immagine eliminata." : result.message ?? "Operazione non riuscita.",
      );
      if (result.ok) router.refresh();
    });
  }

  function makeCover(imageId: string) {
    startTransition(async () => {
      const result = await setCoverImage(propertyId, imageId);
      notify(
        result.ok ? "success" : "error",
        result.ok ? "Immagine di copertina aggiornata." : result.message ?? "Operazione non riuscita.",
      );
      if (result.ok) router.refresh();
    });
  }

  function move(imageId: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveImage(imageId, direction);
      if (result.ok) router.refresh();
      else notify("error", result.message ?? "Riordino non riuscito.");
    });
  }

  function saveExternalVideo() {
    const value = externalVideo.trim();
    if (!/^https?:\/\//.test(value)) {
      notify("error", "Inserisci un URL valido (https://…).");
      return;
    }
    startTransition(async () => {
      const result = await setVideo(propertyId, { url: value, path: null });
      if (result.ok) {
        notify("success", "Link video salvato.");
        setExternalVideo("");
        router.refresh();
      } else {
        notify("error", result.message ?? "Salvataggio non riuscito.");
      }
    });
  }

  function removeVideo() {
    startTransition(async () => {
      const result = await clearVideo(propertyId);
      notify(
        result.ok ? "success" : "error",
        result.ok ? "Video rimosso." : result.message ?? "Operazione non riuscita.",
      );
      if (result.ok) router.refresh();
    });
  }

  const busy = uploading || videoUploading || pending;

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">Immagini</h2>
            <p className="mt-1 text-sm text-muted">
              Carica le foto, scegli la copertina e regola l&apos;ordine della
              galleria.
            </p>
          </div>
          <label className="btn btn-accent cursor-pointer">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {uploading ? "Caricamento…" : "Carica immagini"}
            <input
              ref={imageInputRef}
              type="file"
              accept={IMAGE_TYPES.join(",")}
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(event) => handleImageFiles(event.target.files)}
            />
          </label>
        </div>

        {images.length > 0 ? (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => {
              const isCover = image.url === coverImageUrl;
              return (
                <li
                  key={image.id}
                  className="group relative overflow-hidden rounded-md border border-line"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt ?? propertyTitle}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  {isCover ? (
                    <span
                      className="absolute left-2 top-2 badge border-transparent text-white"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      Copertina
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-dark/75 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        className="rounded p-1 text-white/80 hover:bg-white/15 hover:text-white disabled:opacity-40"
                        onClick={() => move(image.id, "up")}
                        disabled={busy || index === 0}
                        aria-label="Sposta su"
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-white/80 hover:bg-white/15 hover:text-white disabled:opacity-40"
                        onClick={() => move(image.id, "down")}
                        disabled={busy || index === images.length - 1}
                        aria-label="Sposta giù"
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                    <div className="flex gap-0.5">
                      {!isCover ? (
                        <button
                          type="button"
                          className="rounded p-1 text-white/80 hover:bg-white/15 hover:text-white"
                          onClick={() => makeCover(image.id)}
                          disabled={busy}
                          aria-label="Imposta come copertina"
                          title="Imposta come copertina"
                        >
                          <Star className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="rounded p-1 text-white/80 hover:bg-white/15 hover:text-white"
                        onClick={() => removeImage(image.id)}
                        disabled={busy}
                        aria-label="Elimina immagine"
                        title="Elimina"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 rounded-md border border-dashed border-line-strong px-4 py-10 text-center text-sm text-muted">
            Nessuna immagine. Carica almeno una foto di copertina.
          </p>
        )}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg">Video</h2>
        <p className="mt-1 text-sm text-muted">
          Carica un file video oppure incolla un link YouTube/Vimeo. Il link
          esterno è consigliato per file di grandi dimensioni.
        </p>

        {videoUrl ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-line bg-paper p-3">
            <Film className="h-4 w-4 text-accent" aria-hidden />
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate text-sm text-ink-soft hover:text-accent-dark"
            >
              {videoUrl}
            </a>
            <button
              type="button"
              className="btn btn-ghost btn-sm text-danger"
              onClick={removeVideo}
              disabled={busy}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Rimuovi
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Nessun video associato.</p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="video-file">
              Carica file video
            </label>
            <input
              ref={videoInputRef}
              id="video-file"
              type="file"
              accept={VIDEO_TYPES.join(",")}
              className="field file:mr-3 file:rounded file:border-0 file:bg-ink/5 file:px-3 file:py-1 file:text-xs"
              disabled={busy}
              onChange={(event) => handleVideoFile(event.target.files?.[0])}
            />
            <p className="mt-1 text-xs text-muted">
              Max {Math.round(env.maxVideoUploadBytes / 1048576)} MB · MP4, WebM,
              MOV.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="video-external">
              Link video esterno
            </label>
            <div className="flex gap-2">
              <input
                id="video-external"
                type="url"
                className="field"
                placeholder="https://youtube.com/…"
                value={externalVideo}
                disabled={busy}
                onChange={(event) => setExternalVideo(event.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={saveExternalVideo}
                disabled={busy || !externalVideo.trim()}
              >
                <LinkIcon className="h-4 w-4" aria-hidden />
                Salva
              </button>
            </div>
          </div>
        </div>

        {videoUploading ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Caricamento del video in corso…
          </p>
        ) : null}
      </section>
    </div>
  );
}
