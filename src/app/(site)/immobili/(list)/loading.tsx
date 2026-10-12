export default function CatalogueLoading() {
  return (
    <div className="container-x py-12 sm:py-16">
      <div className="h-8 w-40 animate-pulse rounded bg-line" />
      <div className="mt-4 h-12 w-72 animate-pulse rounded bg-line" />
      <div className="mt-8 h-52 animate-pulse rounded-lg bg-line" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-line">
            <div className="aspect-[4/3] animate-pulse bg-line" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-line" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-line" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
