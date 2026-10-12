"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { useToast } from "@/components/toast";
import { updateBranding, clearBranding } from "@/app/admin/(panel)/contenuti/actions";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

type BrandingKind = "logo" | "hero" | "intro" | "about";

function extensionOf(name: string): string {
  const parts = name.split(".");
  const ext = parts.length > 1 ? parts.pop()! : "";
  return /^[a-z0-9]{2,5}$/i.test(ext) ? ext.toLowerCase() : "bin";
}

export function ImageUploadField({
  kind,
  label,
  currentUrl,
  hint,
  previewClassName = "aspect-[16/9]",
}: {
  kind: BrandingKind;
  label: string;
  currentUrl: string | null;
  hint?: string;
  previewClassName?: string;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      notify("error", "Supabase non configurato: impossibile caricare file.");
      return;
    }
    if (!IMAGE_TYPES.includes(file.type)) {
      notify("error", "Formato non supportato (JPG, PNG, WebP, AVIF, GIF).");
      return;
    }
    if (file.size > env.maxImageUploadBytes) {
      notify(
        "error",
        `File troppo grande (max ${Math.round(env.maxImageUploadBytes / 1048576)} MB).`,
      );
      return;
    }

    setBusy(true);
    try {
      const path = `branding/${kind}-${crypto.randomUUID()}.${extensionOf(file.name)}`;
      const { error } = await supabase.storage
        .from(env.storageBucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        notify("error", `Caricamento non riuscito: ${error.message}`);
        return;
      }
      const { data } = supabase.storage.from(env.storageBucket).getPublicUrl(path);
      const result = await updateBranding({ kind, url: data.publicUrl, path });
      if (result.ok) {
        notify("success", "Immagine aggiornata.");
        router.refresh();
      } else {
        notify("error", result.message ?? "Salvataggio non riuscito.");
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleClear() {
    setBusy(true);
    try {
      const result = await clearBranding(kind);
      if (result.ok) {
        notify("success", "Immagine rimossa.");
        router.refresh();
      } else {
        notify("error", result.message ?? "Operazione non riuscita.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="overflow-hidden rounded-md border border-line bg-paper">
        <div className={`relative ${previewClassName} flex items-center justify-center`}>
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={`Anteprima ${label}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex flex-col items-center gap-1 text-xs text-muted">
              <ImageIcon className="h-6 w-6 opacity-50" aria-hidden />
              Nessuna immagine
            </span>
          )}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-paper/70">
              <Loader2 className="h-5 w-5 animate-spin text-ink" aria-hidden />
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="btn btn-outline btn-sm cursor-pointer">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {currentUrl ? "Sostituisci" : "Carica"}
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            className="sr-only"
            disabled={busy}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
        {currentUrl ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            onClick={handleClear}
            disabled={busy}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Rimuovi
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
