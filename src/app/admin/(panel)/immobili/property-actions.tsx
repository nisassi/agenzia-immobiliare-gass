"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { Pencil, Copy, Trash2, Eye, ArchiveRestore, Send, Star } from "lucide-react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { useToast } from "@/components/toast";
import {
  deleteProperty,
  duplicateProperty,
  setPropertyStatus,
  toggleFeatured,
} from "@/app/admin/(panel)/immobili/actions";
import type { PropertyStatus } from "@/lib/types";

export function PropertyActions({
  id,
  slug,
  status,
  isFeatured,
}: {
  id: string;
  slug: string;
  status: PropertyStatus;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, startTransition] = useTransition();

  function changeStatus(next: PropertyStatus, label: string) {
    startTransition(async () => {
      const result = await setPropertyStatus(id, next);
      notify(
        result.ok ? "success" : "error",
        result.ok ? label : result.message ?? "Operazione non riuscita.",
      );
      router.refresh();
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateProperty(id);
      if (result.ok && result.id) {
        notify("success", "Immobile duplicato come bozza.");
        router.push(`/admin/immobili/${result.id}`);
      } else {
        notify("error", result.message ?? "Duplicazione non riuscita.");
      }
    });
  }

  function handleFeatured() {
    startTransition(async () => {
      const result = await toggleFeatured(id, !isFeatured);
      notify(
        result.ok ? "success" : "error",
        result.ok
          ? isFeatured
            ? "Rimosso dalle evidenze."
            : "Aggiunto alle evidenze."
          : result.message ?? "Operazione non riuscita.",
      );
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link
        href={`/admin/immobili/${id}`}
        className="btn btn-outline btn-sm"
        aria-label="Modifica immobile"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Modifica
      </Link>

      <button
        type="button"
        onClick={handleFeatured}
        disabled={pending}
        className="btn btn-ghost btn-sm"
        title={isFeatured ? "Rimuovi dalle evidenze" : "Metti in evidenza"}
      >
        <Star
          className="h-3.5 w-3.5"
          aria-hidden
          style={isFeatured ? { fill: "var(--accent)", color: "var(--accent)" } : undefined}
        />
      </button>

      {status !== "published" ? (
        <button
          type="button"
          onClick={() => changeStatus("published", "Immobile pubblicato.")}
          disabled={pending}
          className="btn btn-ghost btn-sm"
          title="Pubblica"
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
          Pubblica
        </button>
      ) : (
        <button
          type="button"
          onClick={() => changeStatus("draft", "Immobile riportato in bozza.")}
          disabled={pending}
          className="btn btn-ghost btn-sm"
          title="Riporta in bozza"
        >
          <ArchiveRestore className="h-3.5 w-3.5" aria-hidden />
          Bozza
        </button>
      )}

      {status !== "archived" ? (
        <button
          type="button"
          onClick={() => changeStatus("archived", "Immobile archiviato.")}
          disabled={pending}
          className="btn btn-ghost btn-sm"
          title="Archivia"
        >
          <ArchiveRestore className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}

      <button
        type="button"
        onClick={handleDuplicate}
        disabled={pending}
        className="btn btn-ghost btn-sm"
        title="Duplica"
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
      </button>

      {status === "published" ? (
        <a
          href={`/immobili/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          title="Anteprima pubblica"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
        </a>
      ) : null}

      <ConfirmButton
        label="Elimina"
        title="Eliminare l'immobile?"
        description="L'immobile e le sue immagini verranno rimossi definitivamente. Questa azione non può essere annullata."
        confirmLabel="Elimina"
        className="btn btn-ghost btn-sm text-danger"
        icon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
        onConfirm={async () => {
          const result = await deleteProperty(id);
          if (result.ok) router.refresh();
          return result;
        }}
      />
    </div>
  );
}
