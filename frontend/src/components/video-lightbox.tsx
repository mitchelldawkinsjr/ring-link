"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icon";

type Props = {
  open: boolean;
  embedUrl: string | null;
  onClose: () => void;
  title?: string;
};

/** Append autoplay=1 to embed URLs for YouTube / Vimeo player URLs. */
function withAutoplay(embedUrl: string): string {
  try {
    const u = new URL(embedUrl);
    u.searchParams.set("autoplay", "1");
    return u.toString();
  } catch {
    return embedUrl.includes("?") ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`;
  }
}

export function VideoLightbox({ open, embedUrl, onClose, title = "Video player" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !embedUrl) return null;

  const src = withAutoplay(embedUrl);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        aria-label="Close video overlay"
        onClick={onClose}
      />

      <div className="relative z-[101] w-full max-w-5xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-1 -top-12 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-surface-container-high text-on-surface shadow-lg transition hover:border-primary/40 hover:bg-primary-container/20 hover:text-primary sm:-right-2 sm:-top-14"
          aria-label="Close"
        >
          <Icon name="close" size={22} />
        </button>

        <div className="glass-card inner-glow overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={src}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
