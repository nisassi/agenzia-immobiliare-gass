import type { Metadata } from "next";
import Link from "next/link";
import { getInquiriesForAdmin } from "@/lib/queries";
import { StatusBadge, EmptyState } from "@/components/ui";
import { InquiryActions } from "@/app/admin/(panel)/richieste/inquiry-actions";
import {
  formatDateTime,
  INQUIRY_TYPE_LABELS,
  INQUIRY_STATUS_LABELS,
} from "@/lib/utils";
import type { InquiryStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Richieste",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

const STATUS_TABS: Array<{ value: InquiryStatus | "all"; label: string }> = [
  { value: "all", label: "Tutte" },
  { value: "new", label: INQUIRY_STATUS_LABELS.new },
  { value: "in_progress", label: INQUIRY_STATUS_LABELS.in_progress },
  { value: "handled", label: INQUIRY_STATUS_LABELS.handled },
];

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const statusRaw = single(params.status);
  const status: InquiryStatus | "all" = (
    ["new", "in_progress", "handled"] as const
  ).includes(statusRaw as InquiryStatus)
    ? (statusRaw as InquiryStatus)
    : "all";

  const all = await getInquiriesForAdmin();
  const inquiries =
    status === "all" ? all : all.filter((item) => item.status === status);

  const countByStatus = {
    all: all.length,
    new: all.filter((item) => item.status === "new").length,
    in_progress: all.filter((item) => item.status === "in_progress").length,
    handled: all.filter((item) => item.status === "handled").length,
  };

  const buildHref = (value: InquiryStatus | "all") =>
    value === "all" ? "/admin/richieste" : `/admin/richieste?status=${value}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Richieste</h1>
        <p className="mt-1 text-sm text-muted">
          Messaggi ricevuti dal sito: contatti, informazioni sugli immobili e
          richieste di valutazione.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtro stato">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref(tab.value)}
            role="tab"
            aria-selected={status === tab.value}
            className={
              status === tab.value ? "btn btn-dark btn-sm" : "btn btn-outline btn-sm"
            }
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-70">
              {countByStatus[tab.value]}
            </span>
          </Link>
        ))}
      </div>

      {inquiries.length > 0 ? (
        <ul className="space-y-3">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink">{inquiry.name}</p>
                    <StatusBadge status={inquiry.status} />
                    <span className="badge border-line-strong text-muted">
                      {INQUIRY_TYPE_LABELS[inquiry.type] ?? inquiry.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateTime(inquiry.created_at)}
                  </p>
                </div>
                <InquiryActions inquiry={inquiry} />
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="text-muted">Email</dt>
                  <dd className="min-w-0 truncate">
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-ink-soft hover:text-accent-dark"
                    >
                      {inquiry.email}
                    </a>
                  </dd>
                </div>
                {inquiry.phone ? (
                  <div className="flex gap-2">
                    <dt className="text-muted">Telefono</dt>
                    <dd>{inquiry.phone}</dd>
                  </div>
                ) : null}
              </dl>

              {inquiry.message ? (
                <p className="mt-4 whitespace-pre-line border-t border-line pt-4 text-sm text-ink-soft">
                  {inquiry.message}
                </p>
              ) : null}

              {inquiry.type === "valuation" ? (
                <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
                  {inquiry.valuation_address ? (
                    <div className="flex gap-2">
                      <dt className="text-muted">Indirizzo</dt>
                      <dd>{inquiry.valuation_address}</dd>
                    </div>
                  ) : null}
                  {inquiry.valuation_property_type ? (
                    <div className="flex gap-2">
                      <dt className="text-muted">Tipologia</dt>
                      <dd>{inquiry.valuation_property_type}</dd>
                    </div>
                  ) : null}
                  {inquiry.valuation_size ? (
                    <div className="flex gap-2">
                      <dt className="text-muted">Superficie</dt>
                      <dd>{inquiry.valuation_size} m²</dd>
                    </div>
                  ) : null}
                  {inquiry.valuation_timeframe ? (
                    <div className="flex gap-2">
                      <dt className="text-muted">Tempistica</dt>
                      <dd>{inquiry.valuation_timeframe}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}

              {inquiry.properties ? (
                <p className="mt-4 border-t border-line pt-4 text-sm">
                  <span className="text-muted">Immobile: </span>
                  <Link
                    href={`/admin/immobili/${inquiry.properties.id}`}
                    className="text-accent-dark hover:underline"
                  >
                    {inquiry.properties.title}
                  </Link>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Nessuna richiesta"
          description={
            status === "all"
              ? "Quando qualcuno compilerà un modulo sul sito, le richieste compariranno qui."
              : "Nessuna richiesta in questo stato."
          }
        />
      )}
    </div>
  );
}
