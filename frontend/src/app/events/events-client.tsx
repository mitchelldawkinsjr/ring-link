"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { PitchEventControl } from "@/components/pitch-event-control";
import { apiFetch } from "@/lib/api";

export type PublicEvent = {
  id: number;
  name: string;
  starts_at: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  promotion: {
    id: number;
    promotion_name: string;
    city: string | null;
    state: string | null;
  } | null;
};

function formatDay(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).getDate().toString();
}

function formatMonth(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", { month: "short" });
}

function formatFull(iso: string | null) {
  if (!iso) return "Date TBD";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventsClient() {
  const searchParams = useSearchParams();
  const promotionId = searchParams.get("promotion_id")?.trim() ?? "";
  const [stateFilter, setStateFilter] = useState("");

  const queryUrl = useMemo(() => {
    const p = new URLSearchParams();
    p.set("per_page", "40");
    if (promotionId) p.set("promotion_id", promotionId);
    return `/events?${p.toString()}`;
  }, [promotionId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["events-public", promotionId],
    queryFn: async () => {
      const res = await apiFetch<PublicEvent[]>(queryUrl);
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const events = (data ?? []).filter((ev) => (stateFilter ? ev.state === stateFilter : true));

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <header className="mb-8 space-y-1.5">
          <span className="label-tag-primary">Calendar</span>
          <h1 className="font-headline text-headline-md-mobile md:text-headline-md text-on-surface">
            Upcoming Events
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Pitch a show — your submission goes straight to the promotion&apos;s inbox.
          </p>
          {promotionId ? (
            <p className="font-body text-sm text-secondary">
              Showing events for one promotion.{" "}
              <Link href="/events" className="font-semibold underline hover:text-primary">
                Clear filter
              </Link>
            </p>
          ) : null}
        </header>

        <div className="mb-8 flex items-center gap-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            aria-label="Filter by state"
            className="input-field w-auto min-w-[140px] cursor-pointer"
          >
            <option value="">All States</option>
            {[
              "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
              "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
              "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
              "VA", "WA", "WV", "WI", "WY",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {stateFilter && (
            <button
              type="button"
              onClick={() => setStateFilter("")}
              className="flex items-center gap-1.5 font-body text-label-bold text-on-surface-variant transition-colors hover:text-primary"
            >
              <Icon name="close" size={15} /> Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-container" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/15 px-4 py-3 font-body text-sm text-error">
            <Icon name="error" size={18} />
            {error instanceof Error ? error.message : "Failed to load events"}
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center">
            <Icon name="event_busy" size={48} className="mx-auto mb-4 text-on-surface-variant/30" />
            <p className="font-headline text-headline-md-mobile text-on-surface-variant">No upcoming events</p>
            <p className="mt-2 font-body text-body-md text-on-surface-variant/60">
              Check back soon or{" "}
              <a href="/onboarding/role" className="text-primary hover:underline">
                create a promotion
              </a>{" "}
              to post events
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((ev) => {
              const stableReturn =
                promotionId !== ""
                  ? `/events?promotion_id=${encodeURIComponent(promotionId)}`
                  : "/events";

              return (
                <GlassCard
                  key={ev.id}
                  className="flex flex-col gap-4 border border-transparent p-5 transition-colors hover:border-primary/15 sm:flex-row sm:items-center"
                >
                  <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-high">
                    <span className="font-display text-3xl font-bold leading-none text-primary">
                      {formatDay(ev.starts_at)}
                    </span>
                    <span className="mt-1 font-body text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                      {formatMonth(ev.starts_at)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-start gap-2">
                      <h3 className="font-headline text-xl leading-tight text-on-surface">{ev.name}</h3>
                      {ev.state && (
                        <span className="flex-shrink-0 rounded-full border border-outline-variant/40 px-2.5 py-0.5 font-body text-[11px] uppercase tracking-wider text-on-surface-variant">
                          {ev.state}
                        </span>
                      )}
                    </div>

                    <p className="font-body text-[13px] text-on-surface-variant">
                      {ev.promotion && (
                        <Link
                          href={`/promotions/${ev.promotion.id}`}
                          className="mr-2 font-semibold text-secondary hover:underline"
                        >
                          {ev.promotion.promotion_name}
                        </Link>
                      )}
                      {[ev.venue, ev.city].filter(Boolean).join(", ") || "Venue TBA"}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 font-body text-[12px] text-on-surface-variant/60">
                      <Icon name="schedule" size={13} />
                      {formatFull(ev.starts_at)}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <PitchEventControl
                      eventId={ev.id}
                      eventLabel={ev.name}
                      loginRedirectPath={stableReturn}
                    />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
