"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true
    ) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setDeferredPrompt(null);
      setDismissed(true);
    }
  };

  return (
    <div
      role="banner"
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3 shadow-xl md:left-auto md:right-6 md:w-80"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-72.png"
          alt=""
          className="h-10 w-10 rounded-lg flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="font-headline text-sm font-bold text-on-surface leading-tight">
            Install RingLink
          </p>
          <p className="font-body text-xs text-on-surface-variant leading-tight mt-0.5">
            Add to home screen for the full experience
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install prompt"
          className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface transition"
        >
          <span className="material-symbols-outlined text-base leading-none">close</span>
        </button>
        <button
          onClick={handleInstall}
          className="btn-primary !px-3 !py-1.5 !text-sm"
        >
          Install
        </button>
      </div>
    </div>
  );
}
