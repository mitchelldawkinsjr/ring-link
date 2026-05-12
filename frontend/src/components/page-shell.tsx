import type { ReactNode } from "react";
import { TopAppBar } from "@/components/top-app-bar";

export function PageShell({
  children,
  withTopBar = true,
  className = "",
}: {
  children: ReactNode;
  withTopBar?: boolean;
  className?: string;
}) {
  return (
    <div className="min-h-dvh bg-background text-on-surface">
      {withTopBar ? <TopAppBar /> : null}
      <div
        className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden`}
        aria-hidden
      >
        <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-secondary-container/10 blur-[140px]" />
      </div>
      {/* Fixed TopAppBar height (4rem) + safe area; never merge with page `pt-*` or Tailwind can drop the bar offset */}
      <main
        className={
          withTopBar ? "pt-[calc(4rem+env(safe-area-inset-top,0px))]" : ""
        }
      >
        <div className={className}>{children}</div>
      </main>
    </div>
  );
}
