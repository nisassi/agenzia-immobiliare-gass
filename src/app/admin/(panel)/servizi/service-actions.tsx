"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteService } from "@/app/admin/(panel)/servizi/actions";

export function ServiceActions({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Elimina"
      title="Eliminare il servizio?"
      description={`Il servizio "${title}" verrà rimosso dal sito. Questa azione non può essere annullata.`}
      confirmLabel="Elimina"
      className="btn btn-ghost btn-sm text-danger"
      icon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
      onConfirm={async () => {
        const result = await deleteService(id);
        if (result.ok) router.refresh();
        return result;
      }}
    />
  );
}
