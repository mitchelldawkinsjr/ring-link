"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/icon";
import { VideoLightbox } from "@/components/video-lightbox";
import { apiFetch } from "@/lib/api";
import { parseVideoUrl as parseEmbed } from "@/lib/video-embed";
import { useAuthStore } from "@/store/auth-store";

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: number;
  ring_name: string;
  state: string | null;
  wrestling_style: string | null;
  gimmick: string | null;
  hometown: string | null;
  years_experience: number | null;
  travel_radius_miles: number | null;
  gender_division: string | null;
  booking_rate_min: number | null;
  booking_rate_max: number | null;
  match_types: string[] | null;
  social_links: Record<string, string> | null;
  average_rating?: string | number | null;
  review_count?: number | null;
  ratings_opt_in?: boolean;
};

type MediaLink = {
  id: number;
  url: string;
  media_type: string;
  sort_order: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLE_PRESETS = ["Heavyweight", "High Flyer", "Technical", "Lucha Libre", "Brawler", "Strong Style"];

const MATCH_TYPE_PRESETS = [
  "Standard", "No DQ", "Falls Count Anywhere", "Steel Cage", "Ladder",
  "Tables", "TLC", "Last Man Standing", "Street Fight", "Submission",
  "Tornado Tag", "Six-Man Tag", "Battle Royal", "Death Match", "Iron Man",
];

const DIVISION_OPTIONS = ["Open", "Men's", "Women's", "Mixed", "Intergender"];

const SOCIAL_PLATFORMS = [
  { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/yourhandle" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "website", label: "Website", placeholder: "https://yourwebsite.com" },
];

// ─── Video helpers ────────────────────────────────────────────────────────────

function parseVideoUrl(raw: string): {
  platform: "youtube" | "vimeo" | null;
  embedUrl: string | null;
  thumbUrl: string | null;
} {
  const parsed = parseEmbed(raw);
  if (!parsed) return { platform: null, embedUrl: null, thumbUrl: null };
  return {
    platform: parsed.provider,
    embedUrl: parsed.embedUrl,
    thumbUrl: parsed.thumbnailUrl,
  };
}

function PlatformBadge({ platform }: { platform: "youtube" | "vimeo" | null }) {
  if (!platform) return null;
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-widest ${
        platform === "youtube" ? "bg-red-600/20 text-red-400" : "bg-sky-500/20 text-sky-400"
      }`}
    >
      {platform === "youtube" ? "YouTube" : "Vimeo"}
    </span>
  );
}

function VideoCard({
  media,
  onDelete,
  onOpen,
}: {
  media: MediaLink;
  onDelete: (id: number) => void;
  onOpen: (embedUrl: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const parsed = parseVideoUrl(media.url);

  function handleOpen() {
    if (parsed.embedUrl) onOpen(parsed.embedUrl);
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container">
      <div className="relative aspect-video w-full bg-surface-container-low">
        {parsed.thumbUrl ? (
          <button
            type="button"
            onClick={handleOpen}
            disabled={!parsed.embedUrl}
            className="absolute inset-0 w-full disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Open video in fullscreen viewer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={parsed.thumbUrl}
              alt="Video thumbnail"
              className="h-full w-full object-cover transition group-hover:brightness-75"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition group-hover:scale-110">
                <Icon name="play_arrow" filled size={32} />
              </span>
            </span>
          </button>
        ) : parsed.embedUrl ? (
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
            <Icon name="videocam_off" size={32} className="text-on-surface-variant/40" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <PlatformBadge platform={parsed.platform} />
        <p className="min-w-0 flex-1 truncate font-body text-[11px] text-on-surface-variant" title={media.url}>
          {media.url}
        </p>
        <button
          onClick={() => { setDeleting(true); onDelete(media.id); }}
          disabled={deleting}
          aria-label="Remove video"
          className="ml-1 flex-none rounded p-1 text-on-surface-variant/50 transition hover:bg-error/10 hover:text-error disabled:opacity-40"
        >
          <Icon name="delete" size={16} />
        </button>
      </div>
    </div>
  );
}

function AddVideoForm({ onAdded }: { onAdded: () => void }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const parsed = parseVideoUrl(url);
  const valid = !!parsed.platform;

  const add = useMutation({
    mutationFn: async () => {
      await apiFetch("/wrestler/videos", {
        method: "POST",
        json: { url: url.trim() },
      });
    },
    onSuccess: () => { setUrl(""); setError(""); onAdded(); },
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to add video"),
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!valid) { setError("Paste a valid YouTube or Vimeo URL."); return; } setError(""); add.mutate(); }}
      className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <div className="relative flex-1">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          placeholder="Paste a YouTube or Vimeo URL…"
          className="input-field w-full pr-28"
          aria-label="Video URL"
        />
        {parsed.platform && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <PlatformBadge platform={parsed.platform} />
          </span>
        )}
      </div>
      <button type="submit" disabled={add.isPending || !url} className="btn-primary shrink-0 text-sm disabled:opacity-50">
        {add.isPending ? "Adding…" : "Add video"}
      </button>
      {error && <p role="alert" className="w-full font-body text-sm text-error">{error}</p>}
    </form>
  );
}

function VideoLibrarySection({ wrestlerProfileId }: { wrestlerProfileId: number }) {
  const qc = useQueryClient();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const { data: mediaList, isLoading } = useQuery({
    queryKey: ["my-media", wrestlerProfileId],
    queryFn: async () => {
      const res = await apiFetch<MediaLink[]>("/wrestler/media");
      return (res.data ?? []).filter((m) => m.media_type.startsWith("video"));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiFetch(`/media/${id}`, { method: "DELETE" }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-media"] }),
  });
  const videos = mediaList ?? [];
  return (
    <>
      <VideoLightbox open={lightboxUrl !== null} embedUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      <GlassCard className="p-6 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="video_library" size={22} className="text-primary" filled />
          <h2 className="font-headline text-2xl text-on-surface">Video Library</h2>
        </div>
        <span className="font-body text-sm text-on-surface-variant">{videos.length} {videos.length === 1 ? "video" : "videos"}</span>
      </div>
      <p className="mt-1 font-body text-sm text-on-surface-variant">Showcase your best matches and promos. YouTube and Vimeo links supported.</p>
      <AddVideoForm onAdded={() => qc.invalidateQueries({ queryKey: ["my-media"] })} />
      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="aspect-video animate-pulse rounded-xl bg-surface-container-high" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 py-8 text-center text-on-surface-variant">
          <Icon name="video_library" size={44} className="opacity-30" />
          <p className="font-body text-sm">No videos yet — paste a link above to add your first clip.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((m) => (
            <VideoCard
              key={m.id}
              media={m}
              onOpen={setLightboxUrl}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </GlassCard>
    </>
  );
}

// ─── Saved indicator ──────────────────────────────────────────────────────────

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span role="status" className="inline-flex items-center gap-1 rounded-md border border-secondary/40 bg-secondary-container/20 px-3 py-1 font-body text-[12px] uppercase tracking-[0.05em] text-secondary">
      <Icon name="check_circle" size={14} filled /> Saved
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WrestlerProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  // Section 1: basics
  const [ringName, setRingName] = useState("");
  const [state, setState] = useState("");
  const [style, setStyle] = useState("");

  // Section 2: about
  const [gimmick, setGimmick] = useState("");
  const [hometown, setHometown] = useState("");
  const [yearsExp, setYearsExp] = useState("");

  // Section 3: booking terms
  const [matchTypes, setMatchTypes] = useState<string[]>([]);
  const [division, setDivision] = useState("");
  const [travelRadius, setTravelRadius] = useState("");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");

  // Section 4: social links
  const [socials, setSocials] = useState<Record<string, string>>({
    twitter: "", instagram: "", youtube: "", tiktok: "", facebook: "", website: "",
  });

  // Section 5: reputation visibility (default off; feature-gated per profile)
  const [ratingsOptIn, setRatingsOptIn] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["wrestler-profile", user?.wrestler_profile_id],
    enabled: !!user?.wrestler_profile_id,
    queryFn: async () => {
      const res = await apiFetch<Profile>(`/wrestlers/${user!.wrestler_profile_id!}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (!data) return;
    setRingName(data.ring_name ?? "");
    setState(data.state ?? "");
    setStyle(data.wrestling_style ?? "");
    setGimmick(data.gimmick ?? "");
    setHometown(data.hometown ?? "");
    setYearsExp(data.years_experience != null ? String(data.years_experience) : "");
    setMatchTypes(data.match_types ?? []);
    setDivision(data.gender_division ?? "");
    setTravelRadius(data.travel_radius_miles != null ? String(data.travel_radius_miles) : "");
    setRateMin(data.booking_rate_min != null ? String(data.booking_rate_min) : "");
    setRateMax(data.booking_rate_max != null ? String(data.booking_rate_max) : "");
    const sl = data.social_links ?? {};
    setSocials({
      twitter: sl.twitter ?? "",
      instagram: sl.instagram ?? "",
      youtube: sl.youtube ?? "",
      tiktok: sl.tiktok ?? "",
      facebook: sl.facebook ?? "",
      website: sl.website ?? "",
    });
    setRatingsOptIn(Boolean(data.ratings_opt_in));
  }, [data]);

  function buildPatch(fields: Record<string, unknown>) {
    return apiFetch<Profile>(`/wrestlers/${user!.wrestler_profile_id!}`, { method: "PATCH", json: fields });
  }

  const saveBasics = useMutation({
    mutationFn: async () => {
      const payload = { ring_name: ringName, state: state || null, wrestling_style: style || null };
      if (user?.wrestler_profile_id) return buildPatch(payload);
      const res = await apiFetch<Profile>("/wrestlers", { method: "POST", json: payload });
      if (token && user) setSession(token, { ...user, wrestler_profile_id: res.data.id });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wrestler-profile"] }),
  });

  const saveAbout = useMutation({
    mutationFn: () => buildPatch({
      gimmick: gimmick || null,
      hometown: hometown || null,
      years_experience: yearsExp ? Number(yearsExp) : null,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wrestler-profile"] }),
  });

  const saveBooking = useMutation({
    mutationFn: () => buildPatch({
      match_types: matchTypes.length ? matchTypes : null,
      gender_division: division || null,
      travel_radius_miles: travelRadius ? Number(travelRadius) : null,
      booking_rate_min: rateMin ? Number(rateMin) : null,
      booking_rate_max: rateMax ? Number(rateMax) : null,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wrestler-profile"] }),
  });

  const saveSocials = useMutation({
    mutationFn: () => {
      const cleaned = Object.fromEntries(Object.entries(socials).filter(([, v]) => v.trim()));
      return buildPatch({ social_links: Object.keys(cleaned).length ? cleaned : null });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wrestler-profile"] }),
  });

  const saveRatingsVisibility = useMutation({
    mutationFn: (next: boolean) => buildPatch({ ratings_opt_in: next }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wrestler-profile"] }),
  });

  function toggleMatchType(type: string) {
    setMatchTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  }

  if (!user || user.role !== "wrestler") {
    return (
      <PageShell className="px-margin-mobile pb-28 pt-12 md:px-margin-desktop">
        <BottomNav variant="wrestler" />
        <GlassCard className="mx-auto mt-12 max-w-md p-8 text-center">
          <Icon name="lock" size={28} className="mx-auto text-on-surface-variant" />
          <h1 className="mt-4 font-headline text-2xl">Wrestler account required</h1>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">Sign in as a wrestler to manage your profile.</p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">Sign in</Link>
        </GlassCard>
      </PageShell>
    );
  }

  const profileExists = !!user.wrestler_profile_id;

  // Completion score
  const checks = [
    !!ringName, !!state, !!style,
    !!gimmick, !!hometown, !!yearsExp,
    matchTypes.length > 0, !!division, !!rateMin,
    Object.values(socials).some(Boolean),
  ];
  const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <BottomNav variant="wrestler" />
      <div className="mx-auto max-w-container-max">

        {/* Hero banner */}
        <section className="relative isolate mb-10 overflow-hidden rounded-2xl border border-outline-variant/30 bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-lowest p-6 md:p-10">
          <div className="absolute inset-0 -z-10 opacity-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(216,63,46,0.25),_transparent_60%)]" />
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="label-tag-primary">{profileExists ? "Verified Talent" : "New Profile"}</span>
              <h1 className="mt-3 font-display text-4xl font-extrabold uppercase italic tracking-[-0.02em] md:text-5xl">
                {data?.ring_name || ringName || "Your Ring Name"}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant">
                {data?.wrestling_style && <span>{data.wrestling_style}</span>}
                {data?.state && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    <span className="flex items-center gap-1"><Icon name="location_on" size={14} /> {data.state}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right md:min-w-[160px]">
              <div className="font-display text-3xl font-bold text-on-surface">
                {data?.average_rating != null && Number(data.average_rating) > 0
                  ? Number(data.average_rating).toFixed(1)
                  : "—"}
                <span className="ml-1 text-base font-body font-normal text-on-surface-variant">/ 5 avg</span>
              </div>
              <p className="mt-1 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                {ratingsOptIn ? "From verified reviews" : "Hidden from public"}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: all edit forms */}
          <div className="space-y-6 lg:col-span-2">

            {/* 1. Profile basics */}
            <GlassCard
              glow
              as="form"
              onSubmit={(e: React.FormEvent) => { e.preventDefault(); saveBasics.mutate(); }}
              className="space-y-5 p-6"
              aria-label="Profile basics"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-headline text-2xl text-on-surface">
                  <Icon name="badge" size={22} className="text-primary" /> Profile basics
                </div>
                <SavedBadge show={saveBasics.isSuccess} />
              </div>
              <div>
                <label htmlFor="ring_name" className="field-label">Ring name</label>
                <input id="ring_name" required value={ringName} onChange={(e) => setRingName(e.target.value)} className="input-field" placeholder='e.g. Alex "The Anvil" Steele' />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="state" className="field-label">State</label>
                  <input id="state" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} className="input-field uppercase" placeholder="PA" />
                </div>
                <div>
                  <label htmlFor="wrestling_style" className="field-label">Style</label>
                  <input id="wrestling_style" value={style} onChange={(e) => setStyle(e.target.value)} className="input-field" placeholder="Technical Powerhouse" list="style-presets" />
                  <datalist id="style-presets">{STYLE_PRESETS.map((s) => <option key={s} value={s} />)}</datalist>
                </div>
              </div>
              <button type="submit" className="btn-primary text-base" disabled={saveBasics.isPending}>
                {saveBasics.isPending ? "Saving…" : profileExists ? "Save basics" : "Create profile"}
              </button>
              {saveBasics.error && (
                <p role="alert" className="flex items-center gap-2 rounded-md border border-error/40 bg-error-container/20 px-3 py-2 font-body text-sm text-error">
                  <Icon name="error" size={16} />{saveBasics.error instanceof Error ? saveBasics.error.message : "Save failed"}
                </p>
              )}
            </GlassCard>

            {/* 2. About / bio */}
            {profileExists && (
              <GlassCard
                as="form"
                onSubmit={(e: React.FormEvent) => { e.preventDefault(); saveAbout.mutate(); }}
                className="space-y-5 p-6"
                aria-label="About"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-headline text-2xl text-on-surface">
                    <Icon name="mic" size={22} className="text-primary" /> About / Gimmick
                  </div>
                  <SavedBadge show={saveAbout.isSuccess} />
                </div>
                <div>
                  <label htmlFor="gimmick" className="field-label">Bio / character description</label>
                  <textarea id="gimmick" value={gimmick} onChange={(e) => setGimmick(e.target.value)} rows={4} className="input-field resize-y" placeholder="Describe your character, background, and what makes you unique in the ring…" />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="hometown" className="field-label">Hometown</label>
                    <input id="hometown" value={hometown} onChange={(e) => setHometown(e.target.value)} className="input-field" placeholder='e.g. "The Steel City" Pittsburgh, PA' />
                  </div>
                  <div>
                    <label htmlFor="years_exp" className="field-label">Years of experience</label>
                    <input id="years_exp" type="number" min={0} max={60} value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} className="input-field" placeholder="5" />
                  </div>
                </div>
                <button type="submit" className="btn-primary text-base" disabled={saveAbout.isPending}>
                  {saveAbout.isPending ? "Saving…" : "Save about"}
                </button>
              </GlassCard>
            )}

            {/* 3. Booking terms */}
            {profileExists && (
              <GlassCard
                as="form"
                onSubmit={(e: React.FormEvent) => { e.preventDefault(); saveBooking.mutate(); }}
                className="space-y-6 p-6"
                aria-label="Booking terms"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-headline text-2xl text-on-surface">
                    <Icon name="payments" size={22} className="text-primary" /> Booking terms
                  </div>
                  <SavedBadge show={saveBooking.isSuccess} />
                </div>

                {/* Match types */}
                <div>
                  <p className="field-label mb-3">Match types you work</p>
                  <div className="flex flex-wrap gap-2">
                    {MATCH_TYPE_PRESETS.map((type) => {
                      const active = matchTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleMatchType(type)}
                          className={`rounded-full border px-3 py-1.5 font-body text-[12px] font-semibold uppercase tracking-wider transition ${
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-surface-container-high text-on-surface-variant hover:border-primary/30 hover:text-on-surface"
                          }`}
                        >
                          {active && <Icon name="check" size={12} className="mr-1 inline" />}
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="division" className="field-label">Division</label>
                    <select id="division" value={division} onChange={(e) => setDivision(e.target.value)} className="input-field cursor-pointer">
                      <option value="">Select…</option>
                      {DIVISION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="travel_radius" className="field-label">Travel radius (miles)</label>
                    <input id="travel_radius" type="number" min={0} max={9999} value={travelRadius} onChange={(e) => setTravelRadius(e.target.value)} className="input-field" placeholder="250" />
                  </div>
                  <div>
                    <label htmlFor="rate_min" className="field-label">Min booking rate ($)</label>
                    <input id="rate_min" type="number" min={0} value={rateMin} onChange={(e) => setRateMin(e.target.value)} className="input-field" placeholder="150" />
                  </div>
                  <div>
                    <label htmlFor="rate_max" className="field-label">Max booking rate ($)</label>
                    <input id="rate_max" type="number" min={0} value={rateMax} onChange={(e) => setRateMax(e.target.value)} className="input-field" placeholder="500" />
                  </div>
                </div>

                <button type="submit" className="btn-primary text-base" disabled={saveBooking.isPending}>
                  {saveBooking.isPending ? "Saving…" : "Save booking terms"}
                </button>
              </GlassCard>
            )}

            {/* 4. Social links */}
            {profileExists && (
              <GlassCard
                as="form"
                onSubmit={(e: React.FormEvent) => { e.preventDefault(); saveSocials.mutate(); }}
                className="space-y-5 p-6"
                aria-label="Social links"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-headline text-2xl text-on-surface">
                    <Icon name="share" size={22} className="text-primary" /> Social links
                  </div>
                  <SavedBadge show={saveSocials.isSuccess} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label htmlFor={`social_${key}`} className="field-label">{label}</label>
                      <input
                        id={`social_${key}`}
                        type="url"
                        value={socials[key] ?? ""}
                        onChange={(e) => setSocials((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="input-field"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn-primary text-base" disabled={saveSocials.isPending}>
                  {saveSocials.isPending ? "Saving…" : "Save social links"}
                </button>
              </GlassCard>
            )}

            {/* 5. Reputation visibility (feature-gated; default off) */}
            {profileExists && (
              <GlassCard className="space-y-4 p-6" aria-label="Reputation visibility">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-headline text-2xl text-on-surface">
                    <Icon name="star" size={22} className="text-primary" filled />
                    Reputation visibility
                  </div>
                  <SavedBadge show={saveRatingsVisibility.isSuccess} />
                </div>

                <p className="font-body text-sm text-on-surface-variant">
                  RingLink&apos;s verified-booking rating system is off by default at launch. Turn it on
                  to show your average rating and review count on your public profile and on the
                  Discover page. You can switch it back off anytime — your history stays preserved.
                </p>

                <div className="flex items-start gap-4 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 transition focus-within:border-primary/40 hover:border-primary/40">
                  <input
                    id="ratings_opt_in"
                    type="checkbox"
                    checked={ratingsOptIn}
                    disabled={saveRatingsVisibility.isPending}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setRatingsOptIn(next);
                      saveRatingsVisibility.mutate(next);
                    }}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-primary"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="ratings_opt_in"
                      className="block cursor-pointer font-body text-label-bold uppercase tracking-[0.05em] text-on-surface"
                    >
                      Show my rating publicly
                    </label>
                    <p className="mt-1 font-body text-[13px] text-on-surface-variant">
                      {ratingsOptIn
                        ? `Your rating ${data?.average_rating != null ? `(${Number(data.average_rating).toFixed(1)} / 5)` : ""} is visible to anyone browsing RingLink.`
                        : "Your rating is currently hidden from your public profile and Discover."}
                    </p>
                  </div>
                </div>

                {saveRatingsVisibility.error && (
                  <p role="alert" className="flex items-center gap-2 rounded-md border border-error/40 bg-error-container/20 px-3 py-2 font-body text-sm text-error">
                    <Icon name="error" size={16} />
                    {saveRatingsVisibility.error instanceof Error
                      ? saveRatingsVisibility.error.message
                      : "Couldn't update visibility"}
                  </p>
                )}
              </GlassCard>
            )}
          </div>

          {/* Right column: checklist + tips */}
          <div className="space-y-6">
            <GlassCard glow className="p-6">
              <div className="mb-4 flex items-end justify-between">
                <h3 className="font-headline text-xl text-on-surface">Profile strength</h3>
                <span className="font-display text-2xl font-bold text-primary">{completion}%</span>
              </div>
              <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-primary-container shadow-[0_0_10px_rgba(216,63,46,0.5)] transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <ul className="space-y-3 font-body text-sm text-on-surface-variant">
                {[
                  { ok: !!ringName, label: "Ring name set" },
                  { ok: !!state, label: "Location set" },
                  { ok: !!style, label: "Style declared" },
                  { ok: !!profileExists, label: "Profile saved" },
                  { ok: !!gimmick, label: "Bio written" },
                  { ok: matchTypes.length > 0, label: "Match types selected" },
                  { ok: !!rateMin, label: "Booking rate set" },
                  { ok: Object.values(socials).some(Boolean), label: "Social link added" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <Icon
                      name={item.ok ? "check_circle" : "radio_button_unchecked"}
                      size={18}
                      filled={item.ok}
                      className={item.ok ? "text-secondary" : "text-on-surface-variant/60"}
                    />
                    <span className={item.ok ? "text-on-surface" : ""}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-headline text-xl text-on-surface">Tips</h3>
              <ul className="mt-3 space-y-2 font-body text-sm text-on-surface-variant">
                {[
                  "A compelling bio gets you 3× more booking inquiries",
                  "Set a rate range so promotions know before they ask",
                  "Add match videos — they're the first thing promoters check",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <Icon name="tips_and_updates" size={15} filled className="mt-0.5 shrink-0 text-primary/70" />
                    {tip}
                  </li>
                ))}
              </ul>
            </GlassCard>

            {profileExists && (
              <GlassCard className="p-6">
                <h3 className="font-headline text-xl text-on-surface">Your public page</h3>
                <p className="mt-2 font-body text-sm text-on-surface-variant">See exactly what promoters see when they find you.</p>
                <Link
                  href={`/wrestlers/${user.wrestler_profile_id}`}
                  className="mt-4 inline-flex items-center gap-2 font-body text-label-bold uppercase tracking-[0.05em] text-primary"
                  target="_blank"
                >
                  View public profile <Icon name="arrow_outward" size={16} />
                </Link>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Video Library */}
        {profileExists ? (
          <VideoLibrarySection wrestlerProfileId={user.wrestler_profile_id!} />
        ) : (
          <GlassCard className="mt-6 p-6 text-center text-on-surface-variant">
            <Icon name="video_library" size={32} className="mx-auto opacity-30" />
            <p className="mt-2 font-body text-sm">Save your profile first to unlock the video library.</p>
          </GlassCard>
        )}

        {isLoading && (
          <p className="mt-8 font-body text-body-md text-on-surface-variant">Loading profile…</p>
        )}
      </div>
    </PageShell>
  );
}
