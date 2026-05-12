"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type RegisterPayload = {
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

export function RegisterClient() {
  const params = useSearchParams();
  const roleParam = params.get("role");
  const defaultRole = useMemo<"wrestler" | "promotion">(
    () => (roleParam === "promotion" ? "promotion" : "wrestler"),
    [roleParam],
  );

  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"wrestler" | "promotion">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<RegisterPayload>("/auth/register", {
        method: "POST",
        json: {
          name,
          email,
          password,
          password_confirmation: password,
          role,
        },
      });
      const data = res.data;
      setSession(data.token, data.user);
      router.push(role === "promotion" ? "/p/dashboard" : "/w/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell className="min-h-[calc(100dvh-4rem)] px-margin-mobile pb-16 pt-12 md:px-margin-desktop">
      <div className="mx-auto flex max-w-md flex-col gap-10">
        <header className="space-y-3">
          <span className="label-tag-primary">
            Step 2 of 3 · Create as {role === "promotion" ? "Promotion" : "Wrestler"}
          </span>
          <h1 className="font-headline text-headline-md md:text-headline-xl">Forge your account</h1>
          <p className="font-body text-body-lg text-on-surface-variant">
            One short form to put you on the map.
          </p>
        </header>

        <GlassCard glow as="form" onSubmit={onSubmit} className="space-y-5 p-6" aria-label="Registration form">
          <fieldset className="space-y-2">
            <legend className="field-label">Account type</legend>
            <div className="grid grid-cols-2 gap-2 rounded-md border border-outline-variant bg-surface-container-low p-1">
              {(["wrestler", "promotion"] as const).map((r) => {
                const active = role === r;
                return (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-md py-2 font-body text-label-bold uppercase tracking-[0.05em] transition ${
                      active
                        ? "bg-primary-container text-on-primary-container"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={active}
                      onChange={() => setRole(r)}
                      className="sr-only"
                    />
                    <Icon name={r === "wrestler" ? "fitness_center" : "confirmation_number"} size={18} />
                    {r === "wrestler" ? "Wrestler" : "Promotion"}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="name" className="field-label">
              {role === "promotion" ? "Promotion contact name" : "Ring or legal name"}
            </label>
            <input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
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
            {loading ? "Creating…" : `Create ${role === "promotion" ? "Promotion" : "Wrestler"} Account`}
          </button>
        </GlassCard>

        <p className="text-center font-body text-body-md text-on-surface-variant">
          Already on the roster?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
