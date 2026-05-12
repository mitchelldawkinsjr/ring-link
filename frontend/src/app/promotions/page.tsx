"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";

type PromotionCard = {
  id: number;
  promotion_name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  branding: { accent?: string; logo_url?: string } | null;
};

function PromotionAvatar({ name, logo }: { name: string; logo?: string }) {
  if (logo) {
    return (
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={`${name} logo`} className="h-full w-full object-cover" />
      </div>
    );
  }
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  return (
    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary-container/15 border border-primary-container/30">
      <span className="font-headline text-xl font-bold text-primary-container">{initials}</span>
    </div>
  );
}

export default function PromotionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["promotions-public"],
    queryFn: async () => {
      const res = await apiFetch<PromotionCard[]>("/promotions?per_page=40");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const promotions = data ?? [];

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        {/* Header */}
        <header className="mb-10 space-y-1.5">
          <span className="label-tag-primary">Promotions</span>
          <h1 className="font-headline text-headline-md-mobile md:text-headline-md text-on-surface">
            Browse Promotions
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Discover wrestling promotions running events and seeking talent.
          </p>
        </header>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-surface-container" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/15 px-4 py-3 font-body text-sm text-error">
            <Icon name="error" size={18} />
            {error instanceof Error ? error.message : "Failed to load promotions"}
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-20 text-center">
            <Icon name="business" size={48} className="text-on-surface-variant/30 mx-auto mb-4" />
            <p className="font-headline text-headline-md-mobile text-on-surface-variant">
              No promotions yet
            </p>
            <p className="font-body text-body-md text-on-surface-variant/60 mt-2">
              Be the first to list your promotion
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {promotions.map((p) => (
              <GlassCard
                key={p.id}
                as={Link}
                href={`/promotions/${p.id}`}
                glow
                className="crimson-glow flex flex-col gap-4 border border-transparent p-6 transition-all hover:border-primary/30 hover:scale-[1.01]"
                aria-label={`View ${p.promotion_name}`}
              >
                <div className="flex items-start gap-4">
                  <PromotionAvatar name={p.promotion_name} logo={p.branding?.logo_url} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-lg text-on-surface leading-tight">
                      {p.promotion_name}
                    </h3>
                    {(p.city || p.state) && (
                      <p className="mt-1 flex items-center gap-1 font-body text-[13px] text-on-surface-variant">
                        <Icon name="location_on" size={13} />
                        {[p.city, p.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {p.description ? (
                  <p className="font-body text-body-md text-on-surface-variant line-clamp-3">
                    {p.description}
                  </p>
                ) : (
                  <p className="font-body text-body-md text-on-surface-variant/40 italic">
                    No description provided.
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1.5 font-body text-[12px] uppercase tracking-wider text-on-surface-variant/60">
                    <Icon name="event" size={14} />
                    View Profile
                  </span>
                  <Icon name="arrow_forward" size={16} className="text-secondary" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
