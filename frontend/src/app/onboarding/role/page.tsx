import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";

const ROLES = [
  {
    role: "wrestler",
    title: "I am a Wrestler",
    blurb: "Build your reputation, get booked, and grow your career on verified shows.",
    icon: "fitness_center",
    accent: "primary-container",
  },
  {
    role: "promotion",
    title: "I am a Promotion",
    blurb: "Post events, search verified talent, and manage your roster.",
    icon: "confirmation_number",
    accent: "secondary-container",
  },
];

export default function RoleOnboardingPage() {
  return (
    <PageShell className="min-h-[calc(100dvh-4rem)] px-margin-mobile pb-16 pt-12 md:px-margin-desktop">
      <div className="mx-auto flex max-w-md flex-col gap-12">
        <header className="space-y-3">
          <span className="label-tag-primary">Step 1 of 3</span>
          <h1 className="font-headline text-headline-md md:text-headline-xl">Choose your path</h1>
          <p className="font-body text-body-lg text-on-surface-variant">
            Join the most trusted independent wrestling marketplace.
          </p>
        </header>

        <div className="flex flex-col gap-5">
          {ROLES.map((r) => (
            <GlassCard
              key={r.role}
              as={Link}
              href={`/register?role=${r.role}`}
              className="group block overflow-hidden p-6 transition active:scale-[0.99] hover:border-primary/40"
            >
              <div className="flex items-start gap-5">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${
                    r.accent === "primary-container"
                      ? "border-primary-container/40 bg-primary-container/15 text-primary-container"
                      : "border-secondary-container/40 bg-secondary-container/15 text-secondary-container"
                  }`}
                >
                  <Icon name={r.icon} filled size={28} />
                </div>
                <div className="flex-1">
                  <h2 className="font-headline text-headline-md-mobile text-on-surface">{r.title}</h2>
                  <p className="mt-1 font-body text-body-md text-on-surface-variant/80">{r.blurb}</p>
                </div>
                <Icon
                  name="chevron_right"
                  size={22}
                  className="mt-3 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100"
                />
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-2" aria-label="Onboarding progress">
            <span className="h-1.5 w-10 rounded-full bg-primary-container" />
            <span className="h-1.5 w-2 rounded-full bg-surface-variant" />
            <span className="h-1.5 w-2 rounded-full bg-surface-variant" />
          </div>
          <p className="font-body text-body-md text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in.
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
