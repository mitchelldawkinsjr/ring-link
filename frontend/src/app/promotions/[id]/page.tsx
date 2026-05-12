"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { PitchEventControl } from "@/components/pitch-event-control";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type Promotion = {
  id: number;
  user_id: number | null;
  promotion_name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  branding: { accent?: string; logo_url?: string } | null;
};

type PublicEvent = {
  id: number;
  name: string;
  starts_at: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "Date TBD";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatLocation(city: string | null, state: string | null): string {
  return [city, state].filter(Boolean).join(", ") || "Location TBA";
}

export default function PromotionPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useAuthStore((s) => s.user);
  const pitchReturnPath = `/promotions/${id}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ["promotion", id],
    queryFn: async () => {
      const res = await apiFetch<Promotion>(`/promotions/${id}`);
      return res.data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["promotion-events", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await apiFetch<PublicEvent[]>(`/events?promotion_id=${id}&per_page=20`);
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
          <h1 className="mt-4 font-headline text-2xl">Promotion not found</h1>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">
            {error instanceof Error ? error.message : "We could not load this promotion."}
          </p>
          <Link href="/promotions" className="btn-primary mt-6 inline-flex">
            Browse promotions
          </Link>
        </GlassCard>
      </PageShell>
    );
  }

  const logo = data.branding?.logo_url;
  const upcoming = events ?? [];

  return (
    <PageShell className="px-margin-mobile pt-6 pb-28 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-6">
          <Link
            href="/promotions"
            className="inline-flex items-center gap-1.5 font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant hover:text-primary"
          >
            <Icon name="arrow_back" size={16} />
            All promotions
          </Link>
        </div>

        <section className="relative isolate mb-10 overflow-hidden rounded-2xl border border-outline-variant/30">
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="relative aspect-square md:aspect-auto md:min-h-[420px] bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-lowest">
              {logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logo}
                  alt={`${data.promotion_name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="font-display text-6xl font-extrabold uppercase italic tracking-tight text-on-surface-variant/30">
                    {data.promotion_name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/60 via-transparent to-transparent md:bg-gradient-to-r" />
            </div>

            <div className="relative bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-lowest p-8 md:p-12">
              <div className="absolute inset-0 -z-10 opacity-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(216,63,46,0.25),_transparent_60%)]" />
              </div>
              <span className="label-tag-primary">Promotion</span>
              <h1 className="mt-4 font-display text-4xl font-extrabold uppercase italic leading-none tracking-[-0.02em] md:text-5xl">
                {data.promotion_name}
              </h1>
              {(data.city || data.state) && (
                <div className="mt-4 flex items-center gap-2 font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  <Icon name="location_on" size={16} className="text-primary" />
                  {formatLocation(data.city, data.state)}
                </div>
              )}
              {data.description ? (
                <p className="mt-6 max-w-prose font-body text-body-md text-on-surface-variant">
                  {data.description}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                {!user ? (
                  <Link
                    href={`/login?next=${encodeURIComponent(pitchReturnPath)}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Icon name="event" size={16} filled />
                    Pitch this promotion
                  </Link>
                ) : user.role === "wrestler" && user.wrestler_profile_id ? (
                  <Link href={`/events?promotion_id=${id}`} className="btn-primary inline-flex items-center gap-2">
                    <Icon name="event" size={16} filled />
                    Pitch this promotion
                  </Link>
                ) : user.role === "wrestler" ? (
                  <Link href={`/w/profile?next=${encodeURIComponent(pitchReturnPath)}`} className="btn-primary inline-flex items-center gap-2">
                    <Icon name="event" size={16} filled />
                    Finish profile to pitch
                  </Link>
                ) : (
                  <Link href={`/events?promotion_id=${id}`} className="btn-primary inline-flex items-center gap-2">
                    <Icon name="calendar_month" size={16} />
                    View shows
                  </Link>
                )}
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-lg border border-secondary px-5 py-3 font-body text-label-bold uppercase tracking-[0.05em] text-secondary transition hover:bg-secondary/10"
                >
                  <Icon name="calendar_month" size={16} />
                  All events
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard glow className="space-y-5 p-6 lg:col-span-2" id="upcoming-shows">
            <div className="flex items-center gap-2 font-headline text-2xl text-on-surface">
              <Icon name="event" size={22} className="text-primary" />
              Upcoming events
            </div>
            {upcoming.length === 0 ? (
              <p className="font-body text-body-md text-on-surface-variant">
                No upcoming events scheduled. Check back soon.
              </p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex flex-col gap-3 rounded-xl border border-white/5 bg-surface-container-high/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-headline text-lg text-on-surface">
                        {ev.name}
                      </div>
                      <p className="mt-1 flex items-center gap-1 font-body text-[13px] text-on-surface-variant">
                        <Icon name="location_on" size={13} />
                        {ev.venue ? `${ev.venue} — ` : ""}
                        {formatLocation(ev.city, ev.state)}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3 sm:flex-col sm:items-end md:flex-row md:items-center">
                      <span className="rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1 font-body text-[11px] uppercase tracking-wider text-on-surface-variant">
                        {formatDate(ev.starts_at)}
                      </span>
                      <PitchEventControl
                        eventId={ev.id}
                        eventLabel={ev.name}
                        loginRedirectPath={pitchReturnPath}
                        secondaryStyle
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-headline text-xl text-on-surface">Pitch this promotion</h3>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Have a match concept or angle in mind? Sign in as a wrestler and submit yourself
                to one of {data.promotion_name}&apos;s upcoming shows.
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(pitchReturnPath)}`}
                className="mt-4 inline-flex items-center gap-2 font-body text-label-bold uppercase tracking-[0.05em] text-primary"
              >
                Sign in to pitch <Icon name="arrow_outward" size={16} />
              </Link>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-headline text-xl text-on-surface">Verified bookings</h3>
              <p className="mt-2 font-body text-body-md text-on-surface-variant">
                Every booking through RingLink is contracted and reviewed by both sides — building a
                public reputation for promotions and talent alike.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
