"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/icon";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/api";

type Profile = {
  id: number;
  ring_name: string;
  state: string | null;
  wrestling_style: string | null;
  average_rating: string | number | null;
  ratings_opt_in: boolean;
};

type Booking = {
  id: number;
  status: string;
  agreed_amount_cents: number | null;
  appearance_at: string | null;
  event?: { name?: string | null; venue?: string | null } | null;
};

function formatCurrency(cents: number | null) {
  if (!cents) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function WrestlerDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const profile = useQuery({
    queryKey: ["wrestler-profile", user?.wrestler_profile_id],
    enabled: !!user?.wrestler_profile_id,
    queryFn: async () => {
      const id = user!.wrestler_profile_id!;
      const res = await apiFetch<Profile>(`/wrestlers/${id}`);
      return res.data;
    },
  });

  const bookings = useQuery({
    queryKey: ["my-bookings"],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiFetch<Booking[]>("/bookings");
      return res.data;
    },
  });

  const earnings = (bookings.data ?? [])
    .filter((b) => b.status === "completed")
    .reduce((acc, b) => acc + (b.agreed_amount_cents ?? 0), 0);
  const upcoming = (bookings.data ?? []).find((b) =>
    ["pending", "confirmed", "in_progress"].includes(b.status),
  );
  const newRequests = (bookings.data ?? []).filter((b) => b.status === "pending").length;
  const completion = profile.data ? 60 + (profile.data.state ? 20 : 0) + (profile.data.wrestling_style ? 20 : 0) : 0;

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <BottomNav variant="wrestler" />
      <div className="mx-auto flex max-w-container-max flex-col gap-8">
        <section className="space-y-1">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            Active Status
          </p>
          <h1 className="font-headline text-headline-md-mobile md:text-headline-md">
            {greeting()}, {user?.name?.split(" ")[0] ?? "Athlete"}.
          </h1>
          {newRequests > 0 ? (
            <p className="font-body text-body-md font-bold text-primary">
              You have {newRequests} new booking request{newRequests === 1 ? "" : "s"}.
            </p>
          ) : (
            <p className="font-body text-body-md text-on-surface-variant">
              Roster is quiet — keep your profile sharp.
            </p>
          )}
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <GlassCard className="flex flex-col justify-center gap-2 p-6">
            <div className="flex items-center justify-between">
              <Icon name="star" filled size={22} className="text-secondary" />
              <span className="label-tag">
                {profile.data?.ratings_opt_in ? "Reviews" : "Private"}
              </span>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-on-surface">
                {profile.data?.average_rating != null && Number(profile.data.average_rating) > 0
                  ? Number(profile.data.average_rating).toFixed(1)
                  : "—"}
                <span className="ml-1 text-base font-body font-normal text-on-surface-variant">/ 5</span>
              </p>
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                {profile.data?.ratings_opt_in
                  ? "Verified booking ratings"
                  : "Hidden from your public profile"}
              </p>
            </div>
          </GlassCard>
          <GlassCard className="flex flex-col gap-3 p-6">
            <div className="flex items-center justify-between">
              <Icon name="payments" filled size={22} className="text-tertiary" />
              <span className="label-tag">All time</span>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-on-surface">{formatCurrency(earnings)}</p>
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                Earnings
              </p>
            </div>
          </GlassCard>
          <GlassCard className="flex flex-col gap-3 p-6">
            <div className="flex items-center justify-between">
              <Icon name="event_available" size={22} className="text-secondary" />
              <span className="label-tag">Open</span>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-on-surface">
                {(bookings.data ?? []).filter((b) => b.status !== "completed" && b.status !== "cancelled").length}
              </p>
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                Active bookings
              </p>
            </div>
          </GlassCard>
          <GlassCard glow className="flex flex-col gap-3 p-6">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-body text-label-bold uppercase tracking-[0.05em] text-on-surface">
                  Profile Strength
                </h3>
                <p className="font-body text-[12px] text-on-surface-variant">{completion}% complete</p>
              </div>
              <Link href="/w/profile" className="font-body text-[12px] font-bold uppercase tracking-[0.05em] text-primary">
                Edit
              </Link>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary-container shadow-[0_0_10px_rgba(216,63,46,0.5)]"
                style={{ width: `${completion}%` }}
              />
            </div>
          </GlassCard>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl text-on-surface md:text-2xl">Next match</h2>
            <Link href="/bookings" className="font-body text-[12px] font-bold uppercase tracking-[0.05em] text-primary">
              View all
            </Link>
          </div>
          {upcoming ? (
            <GlassCard className="flex items-center gap-4 p-4 md:p-6">
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-md border border-outline-variant/40 bg-surface-container-high">
                <span className="font-display text-lg font-bold text-primary">
                  {upcoming.appearance_at ? new Date(upcoming.appearance_at).getDate() : "—"}
                </span>
                <span className="font-body text-[10px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant">
                  {upcoming.appearance_at
                    ? new Date(upcoming.appearance_at).toLocaleString("en-US", { month: "short" })
                    : "TBD"}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-body text-base font-bold text-on-surface">
                  {upcoming.event?.name ?? "Booking #" + upcoming.id}
                </h4>
                <p className="font-body text-[12px] text-on-surface-variant">
                  {upcoming.event?.venue ?? "Venue TBA"} · {upcoming.status}
                </p>
              </div>
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-primary"
                aria-label={`Status: ${upcoming.status}`}
              />
            </GlassCard>
          ) : (
            <GlassCard className="p-6 text-center">
              <p className="font-body text-body-md text-on-surface-variant">
                No upcoming bookings yet. Browse{" "}
                <Link href="/events" className="font-semibold text-primary hover:underline">
                  open events
                </Link>{" "}
                to submit.
              </p>
            </GlassCard>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-headline text-xl text-on-surface md:text-2xl">Recent activity</h2>
          <div className="space-y-3">
            <GlassCard className="flex items-start gap-4 p-4">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-tertiary/40 bg-tertiary-container/15 text-tertiary">
                <Icon name="star" filled size={18} />
              </div>
              <div>
                <p className="font-body text-sm text-on-surface">
                  Average promoter rating:{" "}
                  <span className="font-bold text-tertiary">
                    {Number(profile.data?.average_rating ?? 0).toFixed(1)} / 5
                  </span>
                </p>
                <p className="mt-1 font-body text-[12px] text-on-surface-variant">
                  Verified after each completed booking.{" "}
                  {profile.data?.ratings_opt_in ? null : (
                    <Link href="/w/profile" className="font-semibold text-primary hover:underline">
                      Hidden from your public profile — turn on in settings.
                    </Link>
                  )}
                </p>
              </div>
            </GlassCard>
            <GlassCard className="flex items-start gap-4 p-4">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-secondary/40 bg-secondary-container/15 text-secondary">
                <Icon name="workspace_premium" size={18} />
              </div>
              <div>
                <p className="font-body text-sm text-on-surface">
                  Profile is{" "}
                  <span className="font-bold text-secondary">{completion >= 80 ? "Booking-ready" : "Almost ready"}</span>
                </p>
                <p className="mt-1 font-body text-[12px] text-on-surface-variant">
                  Promotions filter for verified, complete profiles first.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
