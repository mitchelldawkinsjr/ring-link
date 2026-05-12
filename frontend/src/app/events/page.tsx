import { Suspense } from "react";
import { EventsClient } from "./events-client";

function EventsFallback() {
  return (
    <div className="min-h-dvh bg-background px-margin-mobile pb-28 pt-24 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-container" />
        ))}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsFallback />}>
      <EventsClient />
    </Suspense>
  );
}
