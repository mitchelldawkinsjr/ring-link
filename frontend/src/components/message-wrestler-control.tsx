"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Icon } from "@/components/icon";

type CreatedConversation = { id: number };

function safeNext(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return "/discover";
  return path;
}

/**
 * "Message {wrestler}" call-to-action on a public wrestler profile.
 *
 * Auth states:
 *   - signed out                  -> redirect to /login?next=...
 *   - signed in as wrestler/admin -> hidden (own dashboard, no DMing)
 *   - signed in as promotion w/o a promotion_profile_id
 *                                 -> nudge them to finish their profile
 *   - signed in as promotion w/ a promotion_profile_id
 *                                 -> POST /conversations and navigate to
 *                                    /messages?conversation=<id>
 */
export function MessageWrestlerControl({
  wrestlerProfileId,
  wrestlerFirstName,
  loginRedirectPath,
  className,
}: {
  wrestlerProfileId: number;
  wrestlerFirstName: string;
  loginRedirectPath: string;
  className?: string;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const baseClass =
    className ??
    "inline-flex items-center gap-2 rounded-lg border border-secondary px-5 py-3 font-body text-label-bold uppercase tracking-[0.05em] text-secondary transition hover:bg-secondary/10";

  const open = useMutation({
    mutationFn: async () => {
      const promotionProfileId = user?.promotion_profile_id;
      if (!promotionProfileId) throw new Error("Finish your promotion profile to message talent.");
      const res = await apiFetch<CreatedConversation>("/conversations", {
        method: "POST",
        json: {
          wrestler_profile_id: wrestlerProfileId,
          promotion_profile_id: promotionProfileId,
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/messages?conversation=${data.id}`);
    },
    onError: (e) => {
      setError(e instanceof Error ? e.message : "Could not open message thread");
    },
  });

  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(safeNext(loginRedirectPath))}`} className={baseClass}>
        <Icon name="mail" size={16} />
        Message {wrestlerFirstName}
      </Link>
    );
  }

  if (user.role !== "promotion") {
    // Wrestlers and admins don't pitch other wrestlers from this CTA.
    return null;
  }

  if (!user.promotion_profile_id) {
    return (
      <Link
        href={`/p/profile?next=${encodeURIComponent(safeNext(loginRedirectPath))}`}
        className={baseClass}
        title="Finish your promotion profile before messaging talent"
      >
        <Icon name="mail" size={16} />
        Finish profile to message
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={open.isPending}
        onClick={() => {
          setError(null);
          open.mutate();
        }}
        className={baseClass + " disabled:opacity-60"}
      >
        <Icon name="mail" size={16} />
        {open.isPending ? "Opening…" : `Message ${wrestlerFirstName}`}
      </button>
      {error ? (
        <span role="alert" className="ml-2 font-body text-sm text-error">
          {error}
        </span>
      ) : null}
    </>
  );
}
