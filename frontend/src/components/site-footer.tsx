import Link from "next/link";
import { Icon } from "@/components/icon";

const PLATFORM_LINKS = [
  { href: "/discover", label: "Talent Discovery" },
  { href: "/promotions", label: "Promotions" },
  { href: "/events", label: "Events" },
  { href: "/onboarding/role", label: "Join Now" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Create Account" },
  { href: "/w/dashboard", label: "Wrestler Portal" },
  { href: "/p/dashboard", label: "Promoter Portal" },
];

const LEGAL_LINKS = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Safety Standards" },
  { href: "#", label: "Cookie Settings" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-surface-container-lowest pt-16 pb-10">
      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-headline text-headline-md text-primary-container font-black tracking-tighter block mb-4"
            >
              RingLink
            </Link>
            <p className="font-body text-body-md text-on-surface-variant/80 mb-8 max-w-xs">
              Elevating professional wrestling to executive standards through verified bookings, reputation data, and elite connectivity.
            </p>
            <div className="flex gap-3">
              {[
                { icon: "public", label: "Website" },
                { icon: "alternate_email", label: "Email" },
                { icon: "video_library", label: "Videos" },
              ].map(({ icon, label }) => (
                <button
                  key={icon}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                  <Icon name={icon} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-body text-label-bold uppercase tracking-widest text-on-surface mb-6">
              Platform
            </h4>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-body text-label-bold uppercase tracking-widest text-on-surface mb-6">
              Account
            </h4>
            <ul className="space-y-3">
              {ACCOUNT_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-body text-label-bold uppercase tracking-widest text-on-surface mb-6">
              Legal
            </h4>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="font-body text-body-md text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="font-body text-[11px] uppercase tracking-widest text-on-surface-variant/40" suppressHydrationWarning>
            © {new Date().getFullYear()} RingLink. All rights reserved.
          </p>
          <div className="flex gap-6 font-body text-[11px] uppercase tracking-widest text-on-surface-variant/40">
            <span className="flex items-center gap-1.5">
              <Icon name="shield" size={14} className="text-primary-container" />
              Secure Portal
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="database" size={14} className="text-secondary" />
              Encrypted Data
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
