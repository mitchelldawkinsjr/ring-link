"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Icon } from "@/components/icon";

const PUBLIC_NAV = [
  { href: "/discover", label: "Find Talent" },
  { href: "/promotions", label: "Promotions" },
  { href: "/events", label: "Events" },
];

const AUTH_NAV = [
  { href: "/discover", label: "Find Talent" },
  { href: "/bookings", label: "Bookings" },
  { href: "/messages", label: "Messages" },
];

export function TopAppBar() {
  // Guard against SSR/client mismatch: Zustand persist rehydrates synchronously
  // from localStorage on the client, but the server always starts with user=null.
  // Delay consuming auth state until after mount so the first render matches.
  const [mounted, setMounted] = useState(false);
  const storedUser = useAuthStore((s) => s.user);
  const user = mounted ? storedUser : null;
  const pathname = usePathname();
  const navItems = user ? AUTH_NAV : PUBLIC_NAV;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      aria-label="Primary"
      className="glass-nav fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="flex h-16 items-center justify-between px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-headline text-2xl font-extrabold uppercase tracking-tight text-primary-container"
          >
            RingLink
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-body text-label-bold uppercase tracking-[0.05em] transition-colors ${
                    active ? "text-primary" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href={user.role === "promotion" ? "/p/dashboard" : "/w/dashboard"}
                className="hidden font-body text-label-bold uppercase tracking-[0.05em] text-on-surface hover:text-primary md:inline"
              >
                Dashboard
              </Link>
              <Link
                href={user.role === "promotion" ? "/p/dashboard" : "/w/profile"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-surface-container text-primary"
                aria-label="Account"
              >
                <Icon name="account_circle" filled size={26} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-body text-label-bold uppercase tracking-[0.05em] text-on-surface hover:text-primary"
              >
                Login
              </Link>
              <Link
                href="/onboarding/role"
                className="rounded-md bg-primary-container px-5 py-2.5 font-body text-label-bold uppercase tracking-[0.05em] text-on-primary-container shadow-lg transition active:scale-95 hover:brightness-110"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
