import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-muted">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span className="text-sm">Caricamento…</span>
    </div>
  );
}
