"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type Profile = {
  id: number;
  promotion_name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  branding: { accent?: string; logo_url?: string } | null;
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span role="status" className="inline-flex items-center gap-1 rounded-md border border-secondary/40 bg-secondary-container/20 px-3 py-1 font-body text-[12px] uppercase tracking-[0.05em] text-secondary">
      <Icon name="check_circle" size={14} filled /> Saved
    </span>
  );
}

export default function PromotionProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  const [promotionName, setPromotionName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["promotion-profile", user?.promotion_profile_id],
    enabled: !!user?.promotion_profile_id,
    queryFn: async () => {
      const res = await apiFetch<Profile>(`/promotions/${user!.promotion_profile_id!}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (!data) return;
    setPromotionName(data.promotion_name ?? "");
    setCity(data.city ?? "");
    setState(data.state ?? "");
    setDescription(data.description ?? "");
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        promotion_name: promotionName,
        city: city || null,
        state: state || null,
        description: description || null,
      };
      if (user?.promotion_profile_id) {
        return apiFetch<Profile>(`/promotions/${user.promotion_profile_id}`, { method: "PATCH", json: payload });
      }
      const res = await apiFetch<Profile>("/promotions", { method: "POST", json: payload });
      if (token && user) setSession(token, { ...user, promotion_profile_id: res.data.id });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotion-profile"] }),
  });

  if (!user || user.role !== "promotion") {
    return (
      <PageShell className="px-margin-mobile pb-28 pt-12 md:px-margin-desktop">
        <BottomNav variant="promotion" />
        <GlassCard className="mx-auto mt-12 max-w-md p-8 text-center">
          <Icon name="lock" size={28} className="mx-auto text-on-surface-variant" />
          <h1 className="mt-4 font-headline text-2xl">Promotion account required</h1>
          <p className="mt-2 font-body text-body-md text-on-surface-variant">Sign in as a promotion to manage your listing.</p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">Sign in</Link>
        </GlassCard>
      </PageShell>
    );
  }

  const profileExists = !!user.promotion_profile_id;
  const checks = [!!promotionName, !!city, !!state, !!description];
  const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const initials = promotionName
    ? promotionName.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()
    : "RL";

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <BottomNav variant="promotion" />
      <div className="mx-auto max-w-container-max">

        {/* Hero */}
        <section className="relative isolate mb-10 overflow-hidden rounded-2xl border border-outline-variant/30 bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-lowest p-6 md:p-10">
          <div className="absolute inset-0 -z-10 opacity-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(216,63,46,0.25),_transparent_60%)]" />
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-outline-variant/40 bg-primary-container/15 text-3xl font-extrabold text-primary-container">
                {initials}
              </div>
              <div>
                <span className="label-tag-primary">{profileExists ? "Active Promotion" : "New Promotion"}</span>
                <h1 className="mt-2 font-display text-3xl font-extrabold uppercase italic tracking-[-0.02em] md:text-4xl">
                  {data?.promotion_name || promotionName || "Your Promotion"}
                </h1>
                {(data?.city || data?.state) && (
                  <p className="mt-2 flex items-center gap-1 font-body text-label-bold uppercase tracking-[0.05em] text-on-surface-variant">
                    <Icon name="location_on" size={14} className="text-primary" />
                    {[data.city, data.state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <GlassCard
            glow
            as="form"
            onSubmit={(e: React.FormEvent) => { e.preventDefault(); save.mutate(); }}
            className="space-y-5 p-6 lg:col-span-2"
            aria-label="Promotion profile form"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-headline text-2xl text-on-surface">
                <Icon name="business" size={22} className="text-primary" /> Promotion details
              </div>
              <SavedBadge show={save.isSuccess} />
            </div>

            <div>
              <label htmlFor="promotion_name" className="field-label">Promotion name</label>
              <input
                id="promotion_name"
                required
                value={promotionName}
                onChange={(e) => setPromotionName(e.target.value)}
                className="input-field"
                placeholder="e.g. Apex Championship Wrestling"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="city" className="field-label">City</label>
                <input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field"
                  placeholder="Philadelphia"
                />
              </div>
              <div>
                <label htmlFor="promo_state" className="field-label">State</label>
                <select
                  id="promo_state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="">Select state…</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="field-label">About your promotion</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="input-field resize-y"
                placeholder="Tell wrestlers and fans what makes your promotion stand out — your style, history, venue, and what you look for in talent…"
              />
            </div>

            <button type="submit" className="btn-primary text-base" disabled={save.isPending}>
              {save.isPending ? "Saving…" : profileExists ? "Save changes" : "Create promotion"}
            </button>

            {save.error && (
              <p role="alert" className="flex items-center gap-2 rounded-md border border-error/40 bg-error-container/20 px-3 py-2 font-body text-sm text-error">
                <Icon name="error" size={16} />
                {save.error instanceof Error ? save.error.message : "Save failed"}
              </p>
            )}
          </GlassCard>

          {/* Sidebar */}
          <div className="space-y-6">
            <GlassCard glow className="p-6">
              <div className="mb-4 flex items-end justify-between">
                <h3 className="font-headline text-xl text-on-surface">Listing strength</h3>
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
                  { ok: !!promotionName, label: "Promotion name set" },
                  { ok: !!city, label: "City added" },
                  { ok: !!state, label: "State added" },
                  { ok: !!description, label: "About section written" },
                  { ok: profileExists, label: "Profile created" },
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
                  "A detailed description attracts higher-quality talent pitches",
                  "Wrestlers filter by state — keep your location accurate",
                  "Link your events page so talent knows your schedule",
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
                <p className="mt-2 font-body text-sm text-on-surface-variant">See how wrestlers and fans see your promotion.</p>
                <Link
                  href={`/promotions/${user.promotion_profile_id}`}
                  className="mt-4 inline-flex items-center gap-2 font-body text-label-bold uppercase tracking-[0.05em] text-primary"
                  target="_blank"
                >
                  View public listing <Icon name="arrow_outward" size={16} />
                </Link>
                <div className="mt-4 border-t border-outline-variant/20 pt-4">
                  <Link
                    href="/p/events"
                    className="inline-flex items-center gap-2 font-body text-label-bold uppercase tracking-[0.05em] text-secondary"
                  >
                    Manage events <Icon name="event" size={16} />
                  </Link>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {isLoading && (
          <p className="mt-8 font-body text-body-md text-on-surface-variant">Loading profile…</p>
        )}
      </div>
    </PageShell>
  );
}
