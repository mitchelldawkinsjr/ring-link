"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type LoginPayload = {
  user: {
    id: number;
    name: string;
    email: string;
    role: "wrestler" | "promotion" | "admin";
    wrestler_profile_id: number | null;
    promotion_profile_id: number | null;
  };
  token: string;
};

function defaultAfterLogin(role: "wrestler" | "promotion" | "admin"): string {
  if (role === "promotion") return "/p/dashboard";
  if (role === "admin") return "/discover";
  return "/w/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("next");
    if (raw && raw.startsWith("/") && !raw.startsWith("//")) setNextPath(raw);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginPayload>("/auth/login", {
        method: "POST",
        json: { email, password },
      });
      const data = res.data;
      setSession(data.token, data.user);
      const fallback = defaultAfterLogin(data.user.role);
      router.push(nextPath ?? fallback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell className="min-h-[calc(100dvh-4rem)] px-margin-mobile pb-16 pt-12 md:px-margin-desktop">
      <div className="mx-auto flex max-w-md flex-col gap-10">
        <header className="space-y-3">
          <span className="label-tag-primary">Returning Talent</span>
          <h1 className="font-headline text-headline-md md:text-headline-xl">Step back in</h1>
          <p className="font-body text-body-lg text-on-surface-variant">
            Sign in to manage bookings, messages, and your roster.
          </p>
        </header>

        <GlassCard glow as="form" onSubmit={onSubmit} className="space-y-5 p-6" aria-label="Login form">
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          {error ? (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-md border border-error/40 bg-error-container/20 px-3 py-2 font-body text-sm text-error"
            >
              <Icon name="error" size={18} />
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="btn-primary w-full text-base">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </GlassCard>

        <p className="text-center font-body text-body-md text-on-surface-variant">
          New here?{" "}
          <Link href="/onboarding/role" className="font-semibold text-primary hover:underline">
            Choose a role
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
