import { ExternalLink } from "lucide-react";

function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

function vimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const youtube = youtubeId(url);
  if (youtube) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg border border-line">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtube}`}
          title={`Video: ${title}`}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  const vimeo = vimeoId(url);
  if (vimeo) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg border border-line">
        <iframe
          src={`https://player.vimeo.com/video/${vimeo}`}
          title={`Video: ${title}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return (
      <video
        controls
        preload="metadata"
        className="w-full rounded-lg border border-line bg-dark"
      >
        <source src={url} />
        Il tuo browser non supporta la riproduzione video.{" "}
        <a href={url} className="underline">
          Apri il video
        </a>
        .
      </video>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline"
    >
      <ExternalLink className="h-4 w-4" aria-hidden />
      Guarda il video
    </a>
  );
}
