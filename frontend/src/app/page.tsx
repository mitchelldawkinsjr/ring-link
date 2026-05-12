"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TopAppBar } from "@/components/top-app-bar";
import { SiteFooter } from "@/components/site-footer";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";
import {
  WrestlerBentoCardLarge,
  WrestlerBentoCardSmall,
  type WrestlerCardData,
} from "@/components/talent-card";

type PublicEvent = {
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

type PromotionCard = {
  id: number;
  promotion_name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  branding?: { accent?: string; logo_url?: string } | null;
};

const PROMO_NAMES = ["APEX COMBAT", "ULTRA‑PRO", "NEXUS", "GLOBAL RING", "TITAN XL"];

const FEATURES = [
  {
    icon: "history_edu",
    color: "text-primary-container",
    border: "border-primary-container/30",
    bg: "bg-primary-container/10",
    title: "Verified Booking History",
    body: "Every bout, every result, and every contract is independently verified through our booking workflow and confirmed by both parties.",
  },
  {
    icon: "monitoring",
    color: "text-secondary",
    border: "border-secondary/30",
    bg: "bg-secondary/10",
    title: "Reputation Analytics",
    body: "Six-dimension review signals — professionalism, communication, in-ring performance, reliability, and crowd reaction — captured from verified bookings so promoters see consistent, comparable feedback.",
  },
  {
    icon: "gavel",
    color: "text-tertiary",
    border: "border-tertiary/30",
    bg: "bg-tertiary/10",
    title: "Secure Booking Workflow",
    body: "Structured submission → offer → acceptance → contract flow ensures both promoters and talent are protected at every step of the deal.",
  },
];

const STATS = [
  { value: "15k+", label: "Active Talent" },
  { value: "$4M", label: "Payouts Secured" },
  { value: "48", label: "Countries" },
  { value: "12k", label: "Bouts Booked" },
];

function formatDate(iso: string | null) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDay(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).getDate().toString();
}

function formatMonth(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", { month: "short" });
}

export default function HomePage() {
  const { data: wrestlerData } = useQuery({
    queryKey: ["landing-wrestlers"],
    queryFn: async () => {
      const res = await apiFetch<WrestlerCardData[]>("/wrestlers?per_page=6");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: eventsData } = useQuery({
    queryKey: ["landing-events"],
    queryFn: async () => {
      const res = await apiFetch<PublicEvent[]>("/events?per_page=4");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: promotionData } = useQuery({
    queryKey: ["landing-promotions"],
    queryFn: async () => {
      const res = await apiFetch<PromotionCard[]>("/promotions?per_page=4");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const wrestlers = wrestlerData ?? [];
  const events = eventsData ?? [];
  const promotions = promotionData ?? [];

  return (
    <div className="min-h-dvh bg-background text-on-surface overflow-x-hidden">
      <TopAppBar />

      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-[calc(4rem+env(safe-area-inset-top,0px))]">
        {/* Atmospheric glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute bottom-0 left-1/4 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-primary-container/12 blur-[140px]" />
          <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-secondary-container/8 blur-[120px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop flex flex-col items-center text-center py-24">
          <span className="mb-8 inline-block rounded-full border border-secondary/20 bg-secondary/10 px-5 py-2 font-body text-label-bold uppercase tracking-[0.2em] text-secondary">
            Elite Talent Marketplace
          </span>

          <h1 className="font-display mb-8 max-w-4xl leading-none tracking-tight text-on-surface text-[clamp(2rem,8vw,4.5rem)] font-extrabold" style={{ letterSpacing: "-0.04em" }}>
            Where Wrestling Talent Meets{" "}
            <span className="text-primary-container">Opportunity</span>
          </h1>

          <p className="mb-12 max-w-2xl font-body text-body-lg text-on-surface-variant">
            The elite marketplace connecting world-class athletes with the industry&apos;s top
            promotions. Secure your spot in the main event.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/onboarding/role"
              className="btn-primary crimson-glow flex items-center gap-3 border border-transparent"
            >
              JOIN THE ROSTER
              <Icon name="trending_flat" size={20} />
            </Link>
            <Link href="/discover" className="btn-ghost">
              BROWSE TALENT
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAND ───────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-surface-container-lowest py-16">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop text-center">
          <p className="mb-10 font-body text-label-bold uppercase tracking-[0.2em] text-on-surface-variant/50">
            Trusted by promotions nationwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-30 transition-opacity duration-700 hover:opacity-60">
            {PROMO_NAMES.map((name) => (
              <span
                key={name}
                className="font-headline text-headline-md-mobile font-black tracking-tight text-on-surface"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED TALENT ──────────────────────────────────────────────────── */}
      <section className="py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="mb-2 block font-body text-label-bold uppercase tracking-widest text-primary">
                Featured Roster
              </span>
              <h2 className="font-headline text-headline-md text-on-surface">
                Top Rated Talent
              </h2>
            </div>
            <Link
              href="/discover"
              className="flex items-center gap-2 border-b border-secondary/30 pb-1 font-body text-label-bold uppercase tracking-wider text-secondary hover:border-secondary transition-all"
            >
              View Full Roster
              <Icon name="arrow_outward" size={14} />
            </Link>
          </div>

          {wrestlers.length === 0 ? (
            /* Skeleton */
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-8 h-[480px] md:h-[560px] animate-pulse rounded-xl bg-surface-container" />
              <div className="col-span-12 md:col-span-4 h-[480px] md:h-[560px] animate-pulse rounded-xl bg-surface-container" />
            </div>
          ) : (
            <>
              {/* Desktop bento */}
              <div className="hidden md:grid grid-cols-12 gap-gutter">
                {wrestlers[0] && <WrestlerBentoCardLarge wrestler={wrestlers[0]} />}
                {wrestlers[1] && <WrestlerBentoCardSmall wrestler={wrestlers[1]} />}
              </div>

              {/* Mobile horizontal scroll */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar md:hidden pb-4">
                {wrestlers.slice(0, 4).map((w) => (
                  <div key={w.id} className="min-w-[260px]">
                    <WrestlerBentoCardSmall wrestler={w} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="bg-surface-container py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-headline-xl text-on-surface mb-4">
              The RingLink Standard
            </h2>
            <p className="mx-auto max-w-2xl font-body text-body-lg text-on-surface-variant">
              Enterprise-grade tools for a high-intensity industry. We provide the
              infrastructure for excellence.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-card crimson-glow inner-glow flex flex-col items-center rounded-2xl p-8 text-center border border-transparent transition-all"
              >
                <div
                  className={`mb-8 flex h-16 w-16 items-center justify-center rounded-full border ${f.border} ${f.bg}`}
                >
                  <Icon name={f.icon} size={28} className={f.color} />
                </div>
                <h3 className="font-headline text-headline-md-mobile text-on-surface mb-4">
                  {f.title}
                </h3>
                <p className="font-body text-body-md text-on-surface-variant">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-container-lowest py-24">
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-1/3 rounded-full bg-primary-container/5 blur-[120px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop grid grid-cols-2 gap-10 md:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-headline mb-2 text-6xl font-bold text-on-surface">
                {value}
              </div>
              <div className="font-body text-label-bold uppercase tracking-widest text-on-surface-variant">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── UPCOMING EVENTS ──────────────────────────────────────────────────── */}
      <section className="py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="mb-2 block font-body text-label-bold uppercase tracking-widest text-primary">
                On the Calendar
              </span>
              <h2 className="font-headline text-headline-md text-on-surface">
                Upcoming Events
              </h2>
            </div>
            <Link
              href="/events"
              className="flex items-center gap-2 border-b border-secondary/30 pb-1 font-body text-label-bold uppercase tracking-wider text-secondary hover:border-secondary transition-all"
            >
              All Events
              <Icon name="arrow_outward" size={14} />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-container" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="glass-card inner-glow flex items-center gap-5 rounded-xl p-5 hover:border-primary/20 transition-colors border border-transparent"
                >
                  {/* Date block */}
                  <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-high">
                    <span className="font-display text-xl font-bold text-primary leading-none">
                      {formatDay(ev.starts_at)}
                    </span>
                    <span className="mt-0.5 font-body text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                      {formatMonth(ev.starts_at)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-lg text-on-surface leading-tight truncate">
                      {ev.name}
                    </h3>
                    <p className="mt-1 font-body text-[13px] text-on-surface-variant">
                      {ev.promotion?.promotion_name && (
                        <span className="text-secondary mr-2">{ev.promotion.promotion_name}</span>
                      )}
                      {[ev.venue, ev.city, ev.state].filter(Boolean).join(", ") || "Venue TBA"}
                    </p>
                  </div>

                  <span className="flex-shrink-0 rounded-full border border-outline-variant/40 bg-surface-container px-3 py-1 font-body text-[11px] uppercase tracking-wider text-on-surface-variant">
                    {formatDate(ev.starts_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── FEATURED PROMOTIONS ──────────────────────────────────────────────── */}
      {promotions.length > 0 && (
        <section className="bg-surface-container py-section-gap">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <span className="mb-2 block font-body text-label-bold uppercase tracking-widest text-primary">
                  Top Promotions
                </span>
                <h2 className="font-headline text-headline-md text-on-surface">
                  Browse Promotions
                </h2>
              </div>
              <Link
                href="/promotions"
                className="flex items-center gap-2 border-b border-secondary/30 pb-1 font-body text-label-bold uppercase tracking-wider text-secondary hover:border-secondary transition-all"
              >
                All Promotions
                <Icon name="arrow_outward" size={14} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {promotions.map((p) => {
                const logo = (p.branding as { logo_url?: string } | null)?.logo_url;
                return (
                  <Link
                    key={p.id}
                    href={`/promotions/${p.id}`}
                    className="glass-card inner-glow crimson-glow group block rounded-xl border border-transparent p-6 flex flex-col gap-3 transition-all hover:border-primary/30 hover:scale-[1.01]"
                  >
                    {logo ? (
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-primary-container/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logo} alt={`${p.promotion_name} logo`} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/15 border border-primary-container/30">
                        <Icon name="business" size={22} className="text-primary-container" />
                      </div>
                    )}
                    <h3 className="font-headline text-lg text-on-surface leading-tight">
                      {p.promotion_name}
                    </h3>
                    {(p.city || p.state) && (
                      <p className="flex items-center gap-1 font-body text-[13px] text-on-surface-variant">
                        <Icon name="location_on" size={13} />
                        {[p.city, p.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {p.description && (
                      <p className="font-body text-[13px] text-on-surface-variant line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <span className="mt-auto font-body text-label-bold uppercase tracking-wider text-secondary group-hover:text-primary transition-colors">
                      View Profile →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-20 text-center">
            {/* Background glow */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-container/20 via-surface-container to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-white/8"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-primary-container/10 blur-[80px]"
              aria-hidden
            />

            <div className="relative z-10 flex flex-col items-center">
              <h2
                className="font-display mb-8 text-center leading-none font-extrabold text-on-surface"
                style={{ fontSize: "clamp(2rem,6vw,4rem)", letterSpacing: "-0.04em" }}
              >
                Ready to Step into the Ring?
              </h2>
              <p className="mb-12 max-w-xl font-body text-body-lg text-on-surface-variant">
                Whether you&apos;re a promoter seeking elite talent or an athlete ready for your next
                main event, the journey starts here.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/onboarding/role"
                  className="btn-primary crimson-glow border border-transparent"
                >
                  FOR TALENT
                </Link>
                <Link href="/onboarding/role" className="btn-ghost">
                  FOR PROMOTERS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
