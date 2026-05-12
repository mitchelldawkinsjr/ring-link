import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { RegisterClient } from "./register-client";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <PageShell className="min-h-[calc(100dvh-4rem)] px-margin-mobile pt-6">
          <div className="mx-auto max-w-md font-body text-body-md text-on-surface-variant">
            Preparing registration…
          </div>
        </PageShell>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
