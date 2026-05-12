"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icon";

type Props = {
  /** Public image URLs, already ordered (e.g. by sort_order). */
  photos: string[];
  alt: string;
};

export function ProfileHeroCarousel({ photos, alt }: Props) {
  const count = photos.length;
  const [index, setIndex] = useState(0);
  const photosKey = photos.join("|");

  useEffect(() => {
    setIndex(0);
  }, [photosKey]);

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  const goTo = useCallback(
    (i: number) => {
      if (i >= 0 && i < count) setIndex(i);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, go]);

  if (count === 0) {
    return (
      <div className="relative h-full min-h-[280px] w-full md:min-h-[520px]">
        <div className="h-full w-full bg-gradient-to-br from-surface-container-high to-surface-container-lowest" />
      </div>
    );
  }

  if (count === 1) {
    return (
      <div className="relative h-full min-h-[280px] w-full md:min-h-[520px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[0]} alt={alt} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-transparent md:bg-gradient-to-r" />
      </div>
    );
  }

  return (
    <div
      className="relative h-full min-h-[280px] w-full md:min-h-[520px]"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${alt} photo gallery`}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((url, i) => (
            <div key={`${url}-${i}`} className="relative h-full w-full shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={count > 1 ? `${alt} — image ${i + 1} of ${count}` : alt}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[15] bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-transparent md:bg-gradient-to-r" />

      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col">
        <div className="pointer-events-auto flex flex-1 items-center justify-between px-2 sm:px-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition hover:border-primary/50 hover:bg-black/60"
            aria-label="Previous image"
          >
            <Icon name="chevron_left" size={22} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition hover:border-primary/50 hover:bg-black/60"
            aria-label="Next image"
          >
            <Icon name="chevron_right" size={22} />
          </button>
        </div>

        <div className="pointer-events-auto flex justify-center gap-2 pb-4">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Image ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing image {index + 1} of {count}
      </p>
    </div>
  );
}
