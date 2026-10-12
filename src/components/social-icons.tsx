/**
 * Minimal social brand glyphs.
 *
 * `lucide-react` no longer ships brand logos, so these are small, original
 * inline SVGs (generic glyphs) used for the agency's social links.
 */
type IconProps = { className?: string };

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.6-1.5H16V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.4v3H10V21h3.5Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M6.7 8.6H3.9V20h2.8V8.6ZM5.3 3.8a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3ZM20.1 20h-2.8v-5.6c0-1.3-.5-2.2-1.7-2.2-.9 0-1.5.6-1.7 1.2-.1.2-.1.5-.1.8V20H11V8.6h2.8v1.5c.4-.6 1.1-1.5 2.7-1.5 2 0 3.6 1.3 3.6 4.1V20Z" />
    </svg>
  );
}

export function YouTubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M21.6 7.5c-.2-.9-.9-1.6-1.8-1.8C18.2 5.3 12 5.3 12 5.3s-6.2 0-7.8.4C3.3 5.9 2.6 6.6 2.4 7.5 2 9.1 2 12 2 12s0 2.9.4 4.5c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.5.4-4.5s0-2.9-.4-4.5ZM10 15.2V8.8l5.4 3.2-5.4 3.2Z" />
    </svg>
  );
}
