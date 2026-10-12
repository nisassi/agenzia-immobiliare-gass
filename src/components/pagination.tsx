import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  basePath,
  currentPage,
  pageCount,
  params,
}: {
  basePath: string;
  currentPage: number;
  pageCount: number;
  params: Record<string, string>;
}) {
  if (pageCount <= 1) return null;

  const buildHref = (page: number) => {
    const search = new URLSearchParams(params);
    if (page <= 1) search.delete("page");
    else search.set("page", String(page));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (page) =>
      page === 1 ||
      page === pageCount ||
      Math.abs(page - currentPage) <= 1,
  );

  return (
    <nav
      aria-label="Paginazione"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="btn btn-outline btn-sm"
          rel="prev"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Precedente
        </Link>
      ) : null}

      <ul className="flex items-center gap-1">
        {pages.map((page, index) => {
          const previous = pages[index - 1];
          const gap = previous && page - previous > 1;
          return (
            <li key={page} className="flex items-center gap-1">
              {gap ? (
                <span className="px-1 text-muted" aria-hidden>
                  …
                </span>
              ) : null}
              <Link
                href={buildHref(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm",
                  page === currentPage
                    ? "border-transparent bg-accent text-white"
                    : "border-line-strong text-ink-soft hover:border-ink",
                )}
              >
                {page}
              </Link>
            </li>
          );
        })}
      </ul>

      {currentPage < pageCount ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="btn btn-outline btn-sm"
          rel="next"
        >
          Successiva
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
