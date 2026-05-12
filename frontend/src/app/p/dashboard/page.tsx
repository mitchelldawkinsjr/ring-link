"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/icon";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/api";

type EventRow = { id: number; name: string; starts_at: string | null; venue?: string | null };
type Booking = {
  id: number;
  status: string;
  appearance_at: string | null;
  agreed_amount_cents: number | null;
  wrestler?: { ring_name?: string | null } | null;
  event?: { name?: string | null } | null;
};

function fmtCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function PromotionDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const events = useQuery({
    queryKey: ["promotion-events"],
    enabled: user?.role === "promotion",
    queryFn: async () => (await apiFetch<EventRow[]>("/promotion/events")).data,
  });

  const bookings = useQuery({
    queryKey: ["promotion-bookings"],
    enabled: user?.role === "promotion",
    queryFn: async () => (await apiFetch<Booking[]>("/bookings")).data,
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

  const allBookings = bookings.data ?? [];
  const pending = allBookings.filter((b) => b.status === "pending").length;
  const confirmed = allBookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length;
  const completed = allBookings.filter((b) => b.status === "completed");
  const totalSpend = completed.reduce((acc, b) => acc + (b.agreed_amount_cents ?? 0), 0);
  const upcomingEvent = (events.data ?? []).find((e) => e.starts_at && new Date(e.starts_at) >= new Date());
  const mainEvent = allBookings.find((b) => b.status === "confirmed") ?? allBookings.find((b) => b.status === "pending");

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <BottomNav variant="promotion" />
      <div className="mx-auto flex max-w-container-max flex-col gap-8">
        <section className="space-y-2">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Promoter portal
          </p>
          <h1 className="font-headline text-headline-md-mobile md:text-headline-md">{user?.name ?? "Your promotion"}</h1>
          {upcomingEvent ? (
            <p className="font-body text-body-md text-on-surface-variant">
              Next show: <span className="font-bold text-on-surface">{upcomingEvent.name}</span>
              {upcomingEvent.starts_at ? (
                <>
                  {" "}
                  ·{" "}
                  {new Date(upcomingEvent.starts_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </>
              ) : null}
            </p>
          ) : (
            <p className="font-body text-body-md text-on-surface-variant">
              No events scheduled yet — create one to start booking.
            </p>
          )}
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <GlassCard className="p-5">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant/70">
              Events
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-primary md:text-4xl">
              {(events.data ?? []).length.toString().padStart(2, "0")}
            </p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant/70">
              Bookings
            </p>
            <div className="mt-2 flex items-end gap-2">
              <p className="font-display text-3xl font-bold text-secondary md:text-4xl">
                {confirmed.toString().padStart(2, "0")}
              </p>
              {pending > 0 ? (
                <span className="rounded-md bg-secondary-container/30 px-2 py-1 font-body text-[10px] font-bold uppercase tracking-[0.05em] text-secondary">
                  +{pending} pending
                </span>
              ) : null}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant/70">
              Talent paid
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-on-surface md:text-4xl">
              {fmtCurrency(totalSpend)}
            </p>
          </GlassCard>
          <GlassCard glow className="p-5">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant/70">
              Roster touch points
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-tertiary md:text-4xl">
              {allBookings.length}
            </p>
          </GlassCard>
        </section>

        {mainEvent ? (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-headline text-xl text-on-surface md:text-2xl">Main event card</h2>
              {mainEvent.event?.name ? (
                <span className="font-body text-label-bold uppercase tracking-[0.05em] text-primary">
                  {mainEvent.event.name}
                </span>
              ) : null}
            </div>
            <GlassCard className="overflow-hidden border-l-4 border-primary">
              <div className="flex items-center justify-between gap-4 p-4 md:p-6">
                <div className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-high text-primary">
                    <Icon name="person" size={26} filled />
                  </div>
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface">
                    {mainEvent.wrestler?.ring_name ?? "Talent TBD"}
                  </span>
                </div>
                <span className="font-display text-3xl font-extrabold italic text-primary opacity-60">VS</span>
                <div className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-high text-secondary">
                    <Icon name="help" size={26} />
                  </div>
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                    TBD
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-surface-container-high px-4 py-2 md:px-6">
                <span className="font-body text-[12px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant">
                  {mainEvent.event?.name ?? "Event TBA"} · status: {mainEvent.status}
                </span>
                <Link href="/bookings" className="text-primary">
                  <Icon name="edit" size={18} />
                </Link>
              </div>
            </GlassCard>
          </section>
        ) : null}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-xl text-on-surface md:text-2xl">Your roster</h2>
            <Link
              href="/discover"
              className="font-body text-label-bold uppercase tracking-[0.05em] text-primary hover:underline"
            >
              Find talent
            </Link>
          </div>
          {allBookings.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="font-body text-body-md text-on-surface-variant">
                No bookings yet.{" "}
                <Link href="/discover" className="font-semibold text-primary hover:underline">
                  Discover wrestlers
                </Link>{" "}
                to send your first request.
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {allBookings.slice(0, 8).map((b) => (
                <GlassCard key={b.id} className="overflow-hidden">
                  <div className="relative h-28 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,63,46,0.25),_transparent_60%)]" />
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-on-secondary">
                      <Icon name="verified" filled size={14} />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-body text-sm font-semibold text-on-surface">
                      {b.wrestler?.ring_name ?? `Booking #${b.id}`}
                    </p>
                    <p className="mt-1 font-body text-[11px] text-on-surface-variant capitalize">{b.status}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        <section className="pb-4">
          <Link
            href="/discover"
            className="btn-primary flex h-16 w-full items-center justify-center gap-3 text-base shadow-[0_0_30px_rgba(216,63,46,0.25)]"
          >
            <Icon name="person_add" size={22} />
            Find new talent
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
