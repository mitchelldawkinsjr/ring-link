"use client";

import Link from "next/link";
import { use, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { ProfileHeroCarousel } from "@/components/profile-hero-carousel";
import { VideoLightbox } from "@/components/video-lightbox";
import { MessageWrestlerControl } from "@/components/message-wrestler-control";
import { apiFetch } from "@/lib/api";
import { parseVideoUrl } from "@/lib/video-embed";

type WrestlerProfile = {
  id: number;
  user_id: number | null;
  ring_name: string;
  hometown: string | null;
  state: string | null;
  wrestling_style: string | null;
  match_types: string[] | null;
  gimmick: string | null;
  travel_radius_miles: number | null;
  years_experience: number | null;
  gender_division: string | null;
  booking_rate_min: number | null;
  booking_rate_max: number | null;
  social_links: Record<string, string> | null;
  ratings_opt_in: boolean;
  review_count: number | null;
  average_rating: string | number | null;
  media_links: Array<{ id: number; media_type: string; url: string; sort_order: number }>;
};

// ─── Video helpers ────────────────────────────────────────────────────────────

type VideoItem = { id: number; url: string; media_type: string };

function VideoCard({ item, onOpen }: { item: VideoItem; onOpen: (embedUrl: string) => void }) {
  const parsed = parseVideoUrl(item.url);
  const provider = parsed?.provider ?? null;
  const embedUrl = parsed?.embedUrl ?? null;
  const thumbUrl = parsed?.thumbnailUrl ?? null;

  function handleOpen() {
    if (embedUrl) onOpen(embedUrl);
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container">
      <div className="relative aspect-video bg-surface-container-low">
        {thumbUrl ? (
          <button
            type="button"
            onClick={handleOpen}
            disabled={!embedUrl}
            className="absolute inset-0 w-full disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Open video in fullscreen viewer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl}
              alt="Video thumbnail"
              className="h-full w-full object-cover transition group-hover:brightness-75"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition group-hover:scale-110">
                <Icon name="play_arrow" filled size={32} />
              </span>
            </span>
          </button>
        ) : embedUrl ? (
          <button
            type="button"
            onClick={handleOpen}
            className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container-lowest transition hover:brightness-110"
            aria-label="Open video in fullscreen viewer"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition group-hover:scale-110">
              <Icon name="play_arrow" filled size={32} />
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="videocam_off" size={32} className="text-on-surface-variant/30" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <span
          className={`rounded px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-widest ${
            provider === "youtube"
              ? "bg-red-600/20 text-red-400"
              : provider === "vimeo"
                ? "bg-sky-500/20 text-sky-400"
                : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          {provider ?? "Video"}
        </span>
        <p className="min-w-0 flex-1 truncate font-body text-[11px] text-on-surface-variant/60">
          {item.url}
        </p>
      </div>
    </div>
  );
}

function VideoGallery({ videos }: { videos: VideoItem[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (videos.length === 0) return null;
  return (
    <>
      <VideoLightbox open={lightboxUrl !== null} embedUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      <GlassCard className="mt-6 p-6">
        <div className="mb-5 flex items-center gap-2">
          <Icon name="video_library" filled size={22} className="text-primary" />
          <h2 className="font-headline text-2xl text-on-surface">Video Library</h2>
          <span className="ml-auto font-body text-sm text-on-surface-variant">
            {videos.length} {videos.length === 1 ? "clip" : "clips"}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.id} item={v} onOpen={setLightboxUrl} />
          ))}
        </div>
      </GlassCard>
    </>
  );
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

function formatCurrency(cents: number | null): string | null {
  if (cents == null) return null;
  return `$${cents.toLocaleString()}`;
}

type SocialBrand = {
  label: string;
  /** Tailwind classes for the pill background + border + text */
  styles: string;
  icon: ReactNode;
  /** Pull a display handle from the URL (e.g. "@alextheanvilsteele") */
  handle?: (url: string) => string | null;
};

/** Logo paths drawn at 24×24, simplified single-color glyphs. */
const SOCIAL_BRANDS: Record<string, SocialBrand> = {
  twitter: {
    label: "Twitter / X",
    styles: "border-white/20 bg-black/40 text-white hover:border-white hover:bg-black/60",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M18.244 2H21l-6.52 7.45L22.5 22h-6.78l-5.31-6.94L4.4 22H1.64l7-8 -7.16-12h6.95l4.8 6.34Zm-1.19 18h1.87L7.04 4H5.06Z" />
      </svg>
    ),
    handle: (url) => extractPathSegment(url),
  },
  x: {
    label: "Twitter / X",
    styles: "border-white/20 bg-black/40 text-white hover:border-white hover:bg-black/60",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M18.244 2H21l-6.52 7.45L22.5 22h-6.78l-5.31-6.94L4.4 22H1.64l7-8 -7.16-12h6.95l4.8 6.34Zm-1.19 18h1.87L7.04 4H5.06Z" />
      </svg>
    ),
    handle: (url) => extractPathSegment(url),
  },
  instagram: {
    label: "Instagram",
    styles:
      "border-pink-400/40 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-amber-400/10 text-pink-200 hover:border-pink-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
    handle: (url) => extractPathSegment(url),
  },
  youtube: {
    label: "YouTube",
    styles: "border-red-500/40 bg-red-500/10 text-red-300 hover:border-red-400 hover:bg-red-500/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M23 12s0-3.6-.46-5.32a2.78 2.78 0 0 0-1.96-1.97C18.84 4.25 12 4.25 12 4.25s-6.84 0-8.58.46A2.78 2.78 0 0 0 1.46 6.68 29.93 29.93 0 0 0 1 12a29.93 29.93 0 0 0 .46 5.32 2.78 2.78 0 0 0 1.96 1.97c1.74.46 8.58.46 8.58.46s6.84 0 8.58-.46a2.78 2.78 0 0 0 1.96-1.97A29.93 29.93 0 0 0 23 12ZM10 15.46V8.54L15.82 12Z" />
      </svg>
    ),
    handle: (url) => extractPathSegment(url),
  },
  tiktok: {
    label: "TikTok",
    styles: "border-cyan-400/40 bg-black/40 text-cyan-200 hover:border-cyan-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M16.5 3a5 5 0 0 0 4.5 4.5v3a8 8 0 0 1-4.5-1.4V15a6 6 0 1 1-6-6h.5v3.2H10a2.8 2.8 0 1 0 2.8 2.8V3Z" />
      </svg>
    ),
    handle: (url) => extractPathSegment(url),
  },
  facebook: {
    label: "Facebook",
    styles: "border-blue-500/40 bg-blue-500/10 text-blue-200 hover:border-blue-400 hover:bg-blue-500/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M13.5 22v-8h2.7l.4-3.2H13.5V8.7c0-.93.26-1.56 1.6-1.56h1.71V4.27A23 23 0 0 0 14.32 4c-2.46 0-4.15 1.5-4.15 4.26v2.54H7.5V14h2.67v8Z" />
      </svg>
    ),
    handle: (url) => extractPathSegment(url),
  },
  website: {
    label: "Website",
    styles:
      "border-primary/40 bg-primary-container/15 text-primary hover:border-primary hover:bg-primary-container/25",
    icon: <Icon name="public" size={20} />,
    handle: (url) => safeHostname(url),
  },
};

function extractPathSegment(url: string): string | null {
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean)[0];
    return seg ? `@${seg}` : safeHostname(url);
  } catch {
    return null;
  }
}

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function brandFor(platform: string): SocialBrand {
  const key = platform.toLowerCase();
  return (
    SOCIAL_BRANDS[key] ?? {
      label: platform,
      styles:
        "border-white/15 bg-surface-container-high/60 text-on-surface-variant hover:border-primary/40 hover:text-primary",
      icon: <Icon name="link" size={20} />,
      handle: (url) => safeHostname(url),
    }
  );
}

function SocialLinks({ links }: { links: Record<string, string> | null | undefined }) {
  const entries = Object.entries(links ?? {}).filter(([, url]) => !!url);
  if (entries.length === 0) return null;

  return (
    <div className="mt-8" aria-label="Social media">
      <div className="mb-3 font-body text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70">
        Follow on social
      </div>
      <div className="flex flex-wrap gap-2.5">
        {entries.map(([platform, url]) => {
          const brand = brandFor(platform);
          const handle = brand.handle?.(url) ?? null;
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noreferrer"
              className={`group inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 font-body transition ${brand.styles}`}
            >
              <span className="flex h-5 w-5 items-center justify-center">{brand.icon}</span>
              <span className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] opacity-70">
                  {brand.label}
                </span>
                {handle ? (
                  <span className="mt-0.5 text-sm font-semibold">{handle}</span>
                ) : null}
              </span>
              <Icon
                name="arrow_outward"
                size={14}
                className="opacity-50 transition group-hover:opacity-100"
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function WrestlerPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["wrestler", id],
    queryFn: async () => {
      const res = await apiFetch<WrestlerProfile>(`/wrestlers/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <PageShell className="px-margin-mobile pt-12 pb-28 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <div className="h-[420px] animate-pulse rounded-2xl bg-surface-container" />
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="h-48 animate-pulse rounded-xl bg-surface-container lg:col-span-2" />
            <div className="h-48 animate-pulse rounded-xl bg-surface-container" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell className="px-margin-mobile pt-12 pb-28 md:px-margin-desktop">
        <GlassCard className="mx-auto mt-12 max-w-md p-8 text-center">
          <Icon name="error" size={28} className="mx-auto text-error" />
          <h1 className="mt-4 font-headline text-2xl">Wrestler not found</h1>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">
            {error instanceof Error ? error.message : "We could not load this profile."}
          </p>
          <Link href="/discover" className="btn-primary mt-6 inline-flex">
            Back to roster
          </Link>
        </GlassCard>
      </PageShell>
    );
  }

  const links = data.media_links ?? [];
  const heroPhotos = links
    .filter((m) => m.media_type === "photo")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => m.url);
  const videos = links.filter((m) => m.media_type.startsWith("video"));
  const rateMin = formatCurrency(data.booking_rate_min);
  const rateMax = formatCurrency(data.booking_rate_max);
  const rateRange =
    rateMin && rateMax ? `${rateMin} – ${rateMax}` : (rateMin ?? rateMax ?? "On request");
  const matchTypes = data.match_types ?? [];

  return (
    <PageShell className="px-margin-mobile pt-6 pb-28 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-6">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant hover:text-primary"
          >
            <Icon name="arrow_back" size={16} />
            Back to roster
          </Link>
        </div>

        <section className="relative isolate mb-10 overflow-hidden rounded-2xl border border-outline-variant/30">
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[520px]">
              <ProfileHeroCarousel photos={heroPhotos} alt={data.ring_name} />
              <div className="absolute top-6 left-6 z-40 flex flex-col gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-secondary-container/80 px-3 py-1.5 backdrop-blur-md">
                  <Icon name="verified" filled size={14} className="text-white" />
                  <span className="font-body text-[11px] font-bold uppercase tracking-wider text-white">
                    Verified Talent
                  </span>
                </span>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-lowest p-8 md:p-12">
              <div className="absolute inset-0 -z-10 opacity-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(216,63,46,0.25),_transparent_60%)]" />
              </div>
              <span className="label-tag-primary">{data.wrestling_style ?? "Pro Wrestler"}</span>
              <h1 className="mt-4 font-display text-4xl font-extrabold uppercase italic leading-none tracking-[-0.02em] md:text-5xl">
                {data.ring_name}
              </h1>
              {data.hometown ? (
                <div className="mt-4 flex items-center gap-2 font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  <Icon name="location_on" size={16} className="text-primary" />
                  {data.hometown}
                </div>
              ) : null}
              {data.gimmick ? (
                <p className="mt-6 max-w-prose font-body text-body-md text-on-surface-variant">
                  {data.gimmick}
                </p>
              ) : null}

              {data.ratings_opt_in && data.average_rating != null ? (
                <div className="mt-8 space-y-1">
                  <div className="font-display text-3xl font-bold text-on-surface">
                    {Number(data.average_rating).toFixed(1)}
                    <span className="ml-1 text-base text-on-surface-variant">/ 5 avg</span>
                  </div>
                  <div className="font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant">
                    {data.review_count ?? 0} verified review{(data.review_count ?? 0) === 1 ? "" : "s"}
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <MessageWrestlerControl
                  wrestlerProfileId={data.id}
                  wrestlerFirstName={data.ring_name.split(" ")[0]}
                  loginRedirectPath={`/wrestlers/${data.id}`}
                />
              </div>

              <SocialLinks links={data.social_links} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard glow className="space-y-6 p-6 lg:col-span-2">
            <div className="flex items-center gap-2 font-headline text-2xl text-on-surface">
              <Icon name="info" size={22} className="text-primary" />
              At a glance
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Stat label="Style" value={data.wrestling_style ?? "—"} icon="sports_mma" />
              <Stat
                label="Experience"
                value={data.years_experience != null ? `${data.years_experience} yrs` : "—"}
                icon="military_tech"
              />
              <Stat
                label="Travel radius"
                value={data.travel_radius_miles ? `${data.travel_radius_miles} mi` : "—"}
                icon="map"
              />
              <Stat label="Division" value={data.gender_division ?? "Open"} icon="group" />
              <Stat label="Booking rate" value={rateRange} icon="payments" />
              <Stat label="Home base" value={data.state ?? "—"} icon="public" />
            </div>

            {matchTypes.length > 0 ? (
              <div>
                <div className="mb-3 font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  Match Types
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full border border-white/10 bg-surface-container-high px-4 py-1.5 font-body text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-headline text-xl text-on-surface">Booking checklist</h3>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Sign in as a promotion to send {data.ring_name} an offer for an upcoming event.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center gap-2 font-body text-label-bold uppercase tracking-[0.05em] text-primary"
              >
                Sign in to book <Icon name="arrow_outward" size={16} />
              </Link>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-headline text-xl text-on-surface">Verified reviews</h3>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Every rating on RingLink is tied to a verified booking. Promoters review wrestlers
                across professionalism, in-ring work, communication, reliability, and crowd reaction.
              </p>
            </GlassCard>
          </div>
        </div>

        <VideoGallery videos={videos} />
      </div>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-container-high/50 p-4">
      <div className="flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant/70">
        <Icon name={icon} size={14} className="text-primary" />
        {label}
      </div>
      <div className="mt-1.5 font-headline text-lg text-on-surface">{value}</div>
    </div>
  );
}
