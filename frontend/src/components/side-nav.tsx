"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Icon } from "@/components/icon";

type Item = { href: string; icon: string; label: string };

const WRESTLER: Item[] = [
  { href: "/w/dashboard", icon: "home", label: "Home" },
  { href: "/w/profile", icon: "person", label: "Profile" },
  { href: "/discover", icon: "search", label: "Discover" },
  { href: "/bookings", icon: "event_available", label: "Bookings" },
  { href: "/messages", icon: "mail", label: "Messages" },
  { href: "/reviews/new", icon: "rate_review", label: "Reviews" },
];

const PROMOTION: Item[] = [
  { href: "/p/dashboard", icon: "home", label: "Home" },
  { href: "/discover", icon: "groups", label: "Roster" },
  { href: "/p/events", icon: "event", label: "Events" },
  { href: "/bookings", icon: "event_available", label: "Bookings" },
  { href: "/messages", icon: "mail", label: "Messages" },
  { href: "/p/profile", icon: "business", label: "Profile" },
];

export function SideNav({ variant }: { variant: "wrestler" | "promotion" }) {
  const pathname = usePathname() ?? "";
  // Guard against SSR/client mismatch: Zustand persist rehydrates synchronously
  // from localStorage on the client, but the server always has user=null.
  const [mounted, setMounted] = useState(false);
  const storedUser = useAuthStore((s) => s.user);
  const user = mounted ? storedUser : null;
  const items = variant === "wrestler" ? WRESTLER : PROMOTION;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside
      aria-label="Primary"
      className="glass-nav fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-outline-variant/40 py-8 lg:flex"
    >
      <div className="mb-12 px-8">
        <h1 className="font-headline text-3xl font-black tracking-tight text-primary-container">
          RingLink
        </h1>
        <p className="mt-1 font-body text-[12px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant/70">
          {variant === "wrestler" ? "Athlete Portal" : "Promoter Portal"}
        </p>
      </div>
      <div className="flex-1 space-y-1">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-8 py-3 font-body text-label-bold uppercase tracking-[0.05em] transition ${
                active
                  ? "border-r-4 border-primary bg-primary/10 font-bold text-primary"
                  : "text-on-surface-variant/70 hover:bg-surface-container/40 hover:text-on-surface"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} filled={active} size={22} />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto px-6">
        <div className="flex items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-container p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-primary">
            <Icon name="person" filled size={22} />
          </div>
          <div className="min-w-0" suppressHydrationWarning>
            <p className="truncate font-body text-sm font-bold text-on-surface">
              {user?.name ?? "Guest"}
            </p>
            <p className="truncate font-body text-xs text-on-surface-variant capitalize">
              {user?.role ?? "Not signed in"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
