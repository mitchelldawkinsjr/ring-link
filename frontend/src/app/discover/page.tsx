"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { Icon } from "@/components/icon";
import { WrestlerListCard, type WrestlerCardData } from "@/components/talent-card";
import { apiFetch } from "@/lib/api";

const STYLE_FILTERS = [
  { label: "All Styles", value: "" },
  { label: "Heavyweight", value: "Heavyweight" },
  { label: "High Flyer", value: "High Flyer" },
  { label: "Lucha Libre", value: "Lucha Libre" },
  { label: "Technical", value: "Technical" },
  { label: "Brawler", value: "Brawler" },
  { label: "Submission", value: "Submission" },
];

export default function DiscoverPage() {
  const [style, setStyle] = useState("");
  const [state, setState] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  function onSearchChange(val: string) {
    setSearch(val);
    clearTimeout((onSearchChange as unknown as { t?: ReturnType<typeof setTimeout> }).t);
    const handle = setTimeout(() => setDebouncedSearch(val), 400);
    (onSearchChange as unknown as { t?: ReturnType<typeof setTimeout> }).t = handle;
  }

  const params = new URLSearchParams({ per_page: "24" });
  if (style) params.set("wrestling_style", style);
  if (state) params.set("state", state);

  const { data, isLoading, error } = useQuery({
    queryKey: ["wrestlers-discover", style, state, debouncedSearch],
    queryFn: async () => {
      const res = await apiFetch<WrestlerCardData[]>(`/wrestlers?${params.toString()}`);
      return res.data;
    },
  });

  const wrestlers = (data ?? []).filter((w) =>
    debouncedSearch
      ? w.ring_name.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true,
  );

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        {/* Header */}
        <header className="mb-8 space-y-1.5">
          <span className="label-tag-primary">Roster</span>
          <h1 className="font-headline text-headline-md-mobile md:text-headline-md text-on-surface">
            Find Talent
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Discover verified wrestlers and book them for your next card.
          </p>
        </header>

        {/* Search bar */}
        <div className="relative mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Icon
              name="search"
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60"
            />
            <input
              type="text"
              placeholder="Search by ring name…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          {/* State filter */}
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            aria-label="Filter by state"
            className="input-field w-auto min-w-[100px] cursor-pointer"
          >
            <option value="">All States</option>
            {[
              "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
              "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
              "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
              "VA","WA","WV","WI","WY",
            ].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Style chips */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {STYLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStyle(f.value)}
              className={`flex-shrink-0 rounded-full px-4 py-2 font-body text-label-bold uppercase tracking-wider transition whitespace-nowrap ${
                style === f.value
                  ? "bg-primary text-on-primary"
                  : "border border-white/5 bg-surface-container-high text-on-surface-variant hover:text-primary hover:border-primary/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface-container" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/15 px-4 py-3 font-body text-sm text-error">
            <Icon name="error" size={18} />
            {error instanceof Error ? error.message : "Failed to load wrestlers"}
          </div>
        ) : wrestlers.length === 0 ? (
          <div className="py-20 text-center">
            <Icon name="search_off" size={48} className="text-on-surface-variant/30 mx-auto mb-4" />
            <p className="font-headline text-headline-md-mobile text-on-surface-variant">
              No talent found
            </p>
            <p className="font-body text-body-md text-on-surface-variant/60 mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wrestlers.map((w) => (
              <WrestlerListCard key={w.id} wrestler={w} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
