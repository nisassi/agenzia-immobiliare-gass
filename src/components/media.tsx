import Image from "next/image";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a property/brand image.
 *
 * - Uses `next/image` for rasters (local + Supabase Storage).
 * - Uses a plain `<img>` for SVG placeholders (next/image blocks SVG unless
 *   `dangerouslyAllowSVG` is enabled, which we deliberately avoid).
 * - Falls back to an elegant branded placeholder when no source is available,
 *   so an empty database never produces a broken layout.
 */
export function Media({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  fallbackLabel,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackLabel?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden",
          className,
        )}
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, #f4f1ec) 0%, #ece7df 55%, color-mix(in srgb, var(--accent) 22%, #ece7df) 100%)",
        }}
      >
        <Building2
          className="h-8 w-8 opacity-40"
          style={{ color: "var(--accent-dark)" }}
          aria-hidden
        />
        {fallbackLabel ? (
          <span className="absolute bottom-3 left-3 text-[0.7rem] uppercase tracking-widest text-ink-soft/70">
            {fallbackLabel}
          </span>
        ) : null}
      </div>
    );
  }

  const isSvg = src.toLowerCase().endsWith(".svg");

  if (isSvg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
