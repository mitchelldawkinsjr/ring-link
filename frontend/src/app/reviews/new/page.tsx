"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type Booking = {
  id: number;
  status: string;
  wrestler?: { ring_name?: string | null } | null;
  event?: { name?: string | null } | null;
};

const DIMENSIONS = [
  { key: "in_ring_rating", label: "In-ring performance", help: "Athleticism, storytelling, crowd management" },
  { key: "professionalism_rating", label: "Professionalism", help: "Locker-room conduct and respect" },
  { key: "communication_rating", label: "Communication", help: "Clarity in pre-event and on-site" },
  { key: "reliability_rating", label: "Reliability", help: "Punctuality and follow-through" },
  { key: "crowd_reaction_rating", label: "Crowd reaction", help: "Pop, heat, and engagement during the show" },
  { key: "overall_rating", label: "Overall verdict", help: "Would you book them again?" },
] as const;

type DimensionKey = (typeof DIMENSIONS)[number]["key"];

function NewReviewInner() {
  const params = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initialBookingId = params.get("booking");

  const [bookingId, setBookingId] = useState<string>(initialBookingId ?? "");
  const [ratings, setRatings] = useState<Record<DimensionKey, number>>({
    overall_rating: 4,
    professionalism_rating: 4,
    communication_rating: 4,
    in_ring_rating: 4,
    reliability_rating: 4,
    crowd_reaction_rating: 4,
  });
  const [reviewText, setReviewText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const bookings = useQuery({
    queryKey: ["promotion-bookings"],
    enabled: user?.role === "promotion",
    queryFn: async () => (await apiFetch<Booking[]>("/bookings")).data,
  });

  const completed = (bookings.data ?? []).filter((b) => b.status === "completed");

  useEffect(() => {
    if (!bookingId && completed.length > 0) {
      setBookingId(String(completed[0].id));
    }
  }, [bookingId, completed]);

  const submit = useMutation({
    mutationFn: async () => {
      if (!bookingId) throw new Error("Choose a completed booking first.");
      return apiFetch("/reviews", {
        method: "POST",
        json: { booking_id: Number(bookingId), ...ratings, review_text: reviewText || null },
      });
    },
    onSuccess: () => {
      router.push("/bookings");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Submit failed"),
  });

  if (user && user.role !== "promotion") {
    return (
      <GlassCard className="mx-auto max-w-md p-8 text-center">
        <Icon name="block" size={28} className="mx-auto text-on-surface-variant" />
        <h1 className="mt-4 font-headline text-2xl">Only promotions submit reviews</h1>
        <p className="mt-2 font-body text-body-md text-on-surface-variant">
          Reviews unlock after a confirmed booking is marked completed.
        </p>
        <Link href="/bookings" className="btn-primary mt-6 inline-flex">
          Back to bookings
        </Link>
      </GlassCard>
    );
  }

  const activeBooking = completed.find((b) => String(b.id) === bookingId);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <header className="space-y-2">
        <span className="label-tag-primary">Verified review</span>
        <h1 className="font-headline text-headline-md-mobile md:text-headline-md">Submit performance review</h1>
        <p className="font-body text-body-md text-on-surface-variant">
          Six dimensions capture how this talent showed up on a verified booking. Honest feedback helps the whole roster.
        </p>
      </header>

      <GlassCard className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-primary-container/40 via-secondary-container/30 to-surface-container">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(216,63,46,0.4),_transparent_70%)]" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="rounded-md bg-secondary-container/30 px-2 py-1 font-body text-[10px] font-bold uppercase tracking-[0.05em] text-secondary">
              {activeBooking?.event?.name ?? "Select a booking"}
            </span>
            <h2 className="mt-1 font-headline text-xl text-on-surface">
              Rate {activeBooking?.wrestler?.ring_name ?? "your talent"}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l-4 border-tertiary p-4">
          <div className="rounded-full bg-tertiary/20 p-2 text-tertiary">
            <Icon name="verified" filled size={18} />
          </div>
          <div>
            <p className="font-body text-label-bold uppercase tracking-[0.05em] text-tertiary">Verified booking</p>
            <p className="font-body text-[12px] text-on-surface-variant">Reviews are gated to completed bookings.</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard
        glow
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          submit.mutate();
        }}
        className="space-y-5 p-6"
        aria-label="Verified review form"
      >
        <div>
          <label htmlFor="booking_id" className="field-label">
            Completed booking
          </label>
          {completed.length === 0 ? (
            <p className="rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 font-body text-sm text-on-surface-variant">
              No completed bookings yet. Mark a booking complete to leave a review.
            </p>
          ) : (
            <select
              id="booking_id"
              className="input-field"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            >
              <option value="" disabled>
                Choose…
              </option>
              {completed.map((b) => (
                <option key={b.id} value={b.id}>
                  #{b.id} · {b.wrestler?.ring_name ?? "Talent"} · {b.event?.name ?? "Event"}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-4">
          {DIMENSIONS.map((d) => (
            <div key={d.key} className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
              <div className="mb-2 flex items-end justify-between">
                <label htmlFor={d.key} className="font-body text-label-bold uppercase tracking-[0.05em] text-primary">
                  {d.label}
                </label>
                <span className="font-display text-2xl font-bold text-primary">
                  {ratings[d.key].toFixed(0)} <span className="text-body-md text-on-surface-variant">/ 5</span>
                </span>
              </div>
              <p className="mb-3 font-body text-[12px] text-on-surface-variant/80">{d.help}</p>
              <input
                id={d.key}
                type="range"
                min={1}
                max={5}
                step={1}
                value={ratings[d.key]}
                onChange={(e) => setRatings((s) => ({ ...s, [d.key]: Number(e.target.value) }))}
                className="w-full accent-primary-container"
              />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="review_text" className="field-label">
            Promoter endorsement (optional)
          </label>
          <textarea
            id="review_text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What stood out from their appearance? Where can they sharpen up?"
            className="input-field min-h-[120px] resize-y"
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-md border border-error/40 bg-error-container/20 px-3 py-2 font-body text-sm text-error"
          >
            <Icon name="error" size={16} />
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn-primary flex w-full items-center justify-center gap-2 text-base"
          disabled={!bookingId || submit.isPending}
        >
          {submit.isPending ? "Submitting…" : "Submit verified review"}
          <Icon name="send" size={18} />
        </button>
      </GlassCard>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <Suspense
        fallback={
          <div className="mx-auto max-w-lg font-body text-body-md text-on-surface-variant">Loading review form…</div>
        }
      >
        <NewReviewInner />
      </Suspense>
    </PageShell>
  );
}
