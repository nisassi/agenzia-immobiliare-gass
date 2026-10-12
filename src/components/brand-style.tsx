/**
 * Injects the agency's configured brand colours as CSS variables so that the
 * rest of the design system (which references `var(--accent)`) adapts without
 * a rebuild.
 */
export function BrandStyle({
  accent,
  accentDark,
}: {
  accent: string;
  accentDark: string;
}) {
  const safe = (value: string, fallback: string) =>
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : fallback;

  const css = `:root{--accent:${safe(accent, "#8a6a45")};--accent-dark:${safe(
    accentDark,
    "#6b5236",
  )};}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
