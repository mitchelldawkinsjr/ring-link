"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type EventRow = {
  id: number;
  name: string;
  starts_at: string | null;
  venue?: string | null;
  city?: string | null;
};

export default function PromotionEventsPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [venue, setVenue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["promotion-events"],
    enabled: user?.role === "promotion",
    queryFn: async () => (await apiFetch<EventRow[]>("/promotion/events")).data,
  });

  const create = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        name: name || `Event ${new Date().toISOString().slice(0, 10)}`,
        starts_at: startsAt
          ? new Date(startsAt).toISOString()
          : new Date(Date.now() + 7 * 86_400_000).toISOString(),
      };
      if (venue) payload.venue = venue;
      return apiFetch<EventRow>("/promotion/events", {
        method: "POST",
        json: payload,
      });
    },
    onSuccess: () => {
      setName("");
      setStartsAt("");
      setVenue("");
      qc.invalidateQueries({ queryKey: ["promotion-events"] });
    },
  });

  if (user && user.role !== "promotion") {
    return (
      <PageShell className="px-margin-mobile pt-12 md:px-margin-desktop">
        <GlassCard className="mx-auto max-w-md p-8 text-center">
          <h1 className="font-headline text-2xl">Promotion account required</h1>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <BottomNav variant="promotion" />
      <div className="mx-auto flex max-w-container-max flex-col gap-8">
        <header className="space-y-2">
          <span className="label-tag-primary">Events</span>
          <h1 className="font-headline text-headline-md-mobile md:text-headline-md">Cards on the calendar</h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Schedule shows so wrestlers can submit and be booked.
          </p>
        </header>

        <GlassCard
          glow
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
          className="grid gap-5 p-6 md:grid-cols-3"
          aria-label="Create event"
        >
          <div className="md:col-span-3">
            <h2 className="flex items-center gap-2 font-headline text-xl text-on-surface">
              <Icon name="add_circle" size={22} className="text-primary" /> New event
            </h2>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="ev-name" className="field-label">
              Name
            </label>
            <input
              id="ev-name"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Winter Warfront '26"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="ev-when" className="field-label">
              Date &amp; time
            </label>
            <input
              id="ev-when"
              type="datetime-local"
              className="input-field"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="ev-venue" className="field-label">
              Venue
            </label>
            <input
              id="ev-venue"
              className="input-field"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Apex Arena, Vegas"
            />
          </div>
          <div className="md:col-span-3 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <p className="font-body text-[12px] text-on-surface-variant/70">
              Leave fields blank to drop a default 7-day-out placeholder show.
            </p>
            <button type="submit" disabled={create.isPending} className="btn-primary text-base">
              {create.isPending ? "Saving…" : "Add event"}
            </button>
          </div>
          {create.error ? (
            <p
              role="alert"
              className="md:col-span-3 flex items-center gap-2 rounded-md border border-error/40 bg-error-container/20 px-3 py-2 font-body text-sm text-error"
            >
              <Icon name="error" size={16} /> {create.error instanceof Error ? create.error.message : "Failed"}
            </p>
          ) : null}
        </GlassCard>

        <section className="space-y-3">
          <h2 className="font-headline text-xl text-on-surface">Scheduled</h2>
          {isLoading ? (
            <p className="font-body text-body-md text-on-surface-variant">Loading…</p>
          ) : (data ?? []).length === 0 ? (
            <GlassCard className="p-6 text-center font-body text-body-md text-on-surface-variant">
              Nothing on the books yet.
            </GlassCard>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {(data ?? []).map((ev) => {
                const when = ev.starts_at ? new Date(ev.starts_at) : null;
                return (
                  <GlassCard key={ev.id} as="li" className="flex items-center gap-4 p-4">
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-md border border-outline-variant/40 bg-surface-container-high">
                      <span className="font-display text-xl font-bold text-primary">
                        {when ? when.getDate() : "—"}
                      </span>
                      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant">
                        {when ? when.toLocaleString("en-US", { month: "short" }) : "TBD"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-headline text-lg text-on-surface">{ev.name}</h4>
                      <p className="font-body text-[12px] text-on-surface-variant">
                        {ev.venue ?? "Venue TBA"}
                        {when ? ` · ${when.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })}` : null}
                      </p>
                    </div>
                  </GlassCard>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}
