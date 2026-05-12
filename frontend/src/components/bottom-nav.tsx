"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";

type BottomNavItem = {
  href: string;
  icon: string;
  label: string;
};

const WRESTLER_NAV: BottomNavItem[] = [
  { href: "/w/dashboard", icon: "home", label: "Home" },
  { href: "/discover", icon: "search", label: "Search" },
  { href: "/bookings", icon: "calendar_today", label: "Bookings" },
  { href: "/w/profile", icon: "person", label: "Profile" },
];

const PROMOTION_NAV: BottomNavItem[] = [
  { href: "/p/dashboard", icon: "home", label: "Home" },
  { href: "/discover", icon: "search", label: "Talent" },
  { href: "/p/events", icon: "event", label: "Events" },
  { href: "/p/profile", icon: "business", label: "Profile" },
];

export function BottomNav({ variant }: { variant: "wrestler" | "promotion" }) {
  const pathname = usePathname() ?? "";
  const items = variant === "wrestler" ? WRESTLER_NAV : PROMOTION_NAV;
  return (
    <nav
      aria-label="Primary"
      className="glass-nav fixed inset-x-0 bottom-0 z-40 flex h-20 items-center justify-around px-2 pb-2 md:hidden"
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition active:scale-95 ${
              active ? "text-primary" : "text-on-surface-variant/70 hover:text-primary/80"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={item.icon} filled={active} size={24} />
            <span className="mt-1 font-body text-[11px] font-semibold uppercase tracking-[0.05em]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
