"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2, Mail, Phone, CheckCircle2, Clock } from "lucide-react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { useToast } from "@/components/toast";
import {
  deleteInquiry,
  updateInquiryStatus,
} from "@/app/admin/(panel)/richieste/actions";
import type { Inquiry, InquiryStatus } from "@/lib/types";

export function InquiryActions({
  inquiry,
}: {
  inquiry: Inquiry;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [pending, startTransition] = useTransition();

  function changeStatus(next: InquiryStatus, label: string) {
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiry.id, next);
      notify(
        result.ok ? "success" : "error",
        result.ok ? label : result.message ?? "Operazione non riuscita.",
      );
      if (result.ok) router.refresh();
    });
  }

  const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    "Re: la tua richiesta",
  )}`;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a href={mailto} className="btn btn-outline btn-sm">
        <Mail className="h-3.5 w-3.5" aria-hidden />
        Rispondi
      </a>
      {inquiry.phone ? (
        <a
          href={`tel:${inquiry.phone.replace(/\s/g, "")}`}
          className="btn btn-ghost btn-sm"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          Chiama
        </a>
      ) : null}

      {inquiry.status === "new" ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pending}
          onClick={() =>
            changeStatus("in_progress", "Richiesta segnata in lavorazione.")
          }
        >
          <Clock className="h-3.5 w-3.5" aria-hidden />
          In lavorazione
        </button>
      ) : null}

      {inquiry.status !== "handled" ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pending}
          onClick={() => changeStatus("handled", "Richiesta segnata come gestita.")}
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Gestita
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pending}
          onClick={() => changeStatus("new", "Richiesta riaperta.")}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Riapri
        </button>
      )}

      <ConfirmButton
        label="Elimina"
        title="Eliminare la richiesta?"
        description="La richiesta verrà rimossa definitivamente. Questa azione non può essere annullata."
        confirmLabel="Elimina"
        className="btn btn-ghost btn-sm text-danger"
        icon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
        onConfirm={async () => {
          const result = await deleteInquiry(inquiry.id);
          if (result.ok) router.refresh();
          return result;
        }}
      />
    </div>
  );
}
