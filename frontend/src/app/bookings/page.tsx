"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type Booking = {
  id: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | string;
  agreed_amount_cents: number | null;
  appearance_at: string | null;
  created_at?: string | null;
  confirmed_at?: string | null;
  completed_at?: string | null;
  wrestler?: { id: number; ring_name?: string | null } | null;
  promotion?: { id: number; legal_name?: string | null } | null;
  event?: { id: number; name?: string | null; venue?: string | null; city?: string | null } | null;
};

const STEPS = [
  { key: "pending", label: "Request received" },
  { key: "confirmed", label: "Contract confirmed" },
  { key: "in_progress", label: "Show day" },
  { key: "completed", label: "Event completed" },
] as const;

function indexFor(status: string) {
  const i = STEPS.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

function fmtCurrency(cents: number | null) {
  if (!cents) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BookingsPage() {
  const user = useAuthStore((s) => s.user);
  const [activeId, setActiveId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings"],
    enabled: !!user,
    queryFn: async () => (await apiFetch<Booking[]>("/bookings")).data,
  });

  const bookings = data ?? [];
  const active =
    bookings.find((b) => b.id === activeId) ??
    bookings.find((b) => b.status === "confirmed") ??
    bookings.find((b) => b.status === "pending") ??
    bookings[0];

  if (!user) {
    return (
      <PageShell className="px-margin-mobile pt-12 md:px-margin-desktop">
        <GlassCard className="mx-auto max-w-md p-8 text-center">
          <Icon name="lock" size={28} className="mx-auto text-on-surface-variant" />
          <h1 className="mt-4 font-headline text-2xl">Sign in to see bookings</h1>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Log in
          </Link>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <div className="mx-auto flex max-w-container-max flex-col gap-6 md:grid md:grid-cols-12 md:gap-8">
        <header className="md:col-span-12">
          <span className="label-tag">Bookings</span>
          <h1 className="mt-2 font-headline text-headline-md-mobile md:text-headline-md">Active deal flow</h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Watch each booking move from request through to event-completed.
          </p>
        </header>

        <section className="md:col-span-5">
          <h2 className="mb-3 font-headline text-xl text-on-surface">Inbox</h2>
          {isLoading ? (
            <GlassCard className="p-6 font-body text-body-md text-on-surface-variant">Loading…</GlassCard>
          ) : error ? (
            <GlassCard className="border-error/40 p-6 font-body text-body-md text-error" role="alert">
              {error instanceof Error ? error.message : "Failed to load bookings."}
            </GlassCard>
          ) : bookings.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="font-body text-body-md text-on-surface-variant">No bookings yet.</p>
              <Link href="/discover" className="btn-primary mt-4 inline-flex text-sm">
                Find talent
              </Link>
            </GlassCard>
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => {
                const isActive = active?.id === b.id;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(b.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/40 bg-surface-container-low hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-headline text-base text-on-surface">
                            {b.event?.name ?? `Booking #${b.id}`}
                          </p>
                          <p className="mt-1 truncate font-body text-[12px] text-on-surface-variant">
                            {user.role === "promotion"
                              ? `Talent: ${b.wrestler?.ring_name ?? "TBD"}`
                              : `Promoter: ${b.promotion?.legal_name ?? "TBD"}`}
                          </p>
                        </div>
                        <span
                          className={`rounded-md px-2 py-1 font-body text-[10px] font-bold uppercase tracking-[0.05em] ${
                            b.status === "completed"
                              ? "bg-secondary-container/30 text-secondary"
                              : b.status === "cancelled"
                                ? "bg-error-container/30 text-error"
                                : "bg-primary-container/20 text-primary-container"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="md:col-span-7">
          {active ? (
            <div className="flex flex-col gap-6">
              <GlassCard className="p-6 md:p-8">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
                  Active booking
                </p>
                <h2 className="mt-2 font-headline text-2xl leading-tight text-on-surface md:text-3xl">
                  {active.event?.name ?? `Booking #${active.id}`}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Icon name="person" size={16} />
                    {user.role === "promotion"
                      ? active.wrestler?.ring_name ?? "Talent TBD"
                      : active.promotion?.legal_name ?? "Promoter TBD"}
                  </span>
                  {active.event?.venue ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      <span className="flex items-center gap-1">
                        <Icon name="location_on" size={16} />
                        {active.event.venue}
                      </span>
                    </>
                  ) : null}
                </div>

                <ol className="mt-8 relative space-y-6 pl-2" aria-label="Booking status">
                  {STEPS.map((s, idx) => {
                    const reached = idx <= indexFor(active.status);
                    const current = idx === indexFor(active.status);
                    return (
                      <li key={s.key} className="relative flex items-start gap-5">
                        {idx < STEPS.length - 1 ? (
                          <span
                            aria-hidden
                            className={`absolute left-[10px] top-5 h-full w-px ${
                              reached ? "bg-secondary-container" : "bg-surface-container-highest"
                            }`}
                          />
                        ) : null}
                        <span
                          className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            reached
                              ? "border-secondary-container bg-secondary-container text-on-secondary-container"
                              : current
                                ? "border-secondary-container bg-surface-container"
                                : "border-surface-container-highest bg-surface-container"
                          }`}
                        >
                          {reached ? (
                            <Icon name="check" filled size={12} />
                          ) : current ? (
                            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary-container" />
                          ) : null}
                        </span>
                        <div className={reached ? "" : "opacity-50"}>
                          <p className="font-body text-label-bold uppercase tracking-[0.05em] text-on-surface">
                            {s.label}
                          </p>
                          <p className="font-body text-[12px] text-on-surface-variant">
                            {s.key === "pending"
                              ? fmtDate(active.created_at)
                              : s.key === "confirmed"
                                ? fmtDate(active.confirmed_at)
                                : s.key === "in_progress"
                                  ? fmtDate(active.appearance_at)
                                  : fmtDate(active.completed_at)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline text-2xl">Contract summary</h3>
                  <Icon name="description" size={22} className="text-secondary" />
                </div>
                <dl className="space-y-3">
                  {[
                    ["Match", active.event?.name ?? "—"],
                    ["Appearance", fmtDate(active.appearance_at)],
                    ["Agreed purse", fmtCurrency(active.agreed_amount_cents)],
                    ["Status", active.status.replace("_", " ")],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <dt className="font-body text-[14px] text-on-surface-variant">{k}</dt>
                      <dd className="font-body text-sm font-semibold text-on-surface">{v as string}</dd>
                    </div>
                  ))}
                </dl>
                {user.role === "promotion" && active.status === "completed" ? (
                  <Link href={`/reviews/new?booking=${active.id}`} className="btn-primary mt-6 inline-flex">
                    <Icon name="rate_review" size={18} className="mr-2" /> Submit review
                  </Link>
                ) : null}
                {user.role === "wrestler" && active.status === "pending" ? (
                  <p className="mt-6 font-body text-[12px] text-on-surface-variant">
                    Awaiting promoter confirmation. Promotions transition status from their dashboard.
                  </p>
                ) : null}
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="p-10 text-center">
              <Icon name="event_busy" size={28} className="mx-auto text-on-surface-variant" />
              <p className="mt-3 font-body text-body-md text-on-surface-variant">
                No bookings yet. Talent and promotions create them from the discovery page.
              </p>
            </GlassCard>
          )}
        </section>
      </div>
    </PageShell>
  );
}
