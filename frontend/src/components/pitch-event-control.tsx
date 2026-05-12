"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Icon } from "@/components/icon";

type SubmissionPayload = {
  id: number;
  event_id: number;
  wrestler_profile_id: number;
  status: string;
  note: string | null;
};

function safeLoginNext(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return "/events";
  return path;
}

export function PitchEventControl({
  eventId,
  eventLabel,
  loginRedirectPath,
  buttonClassName = "btn-primary text-sm px-5 py-2.5",
  secondaryStyle = false,
}: {
  eventId: number;
  eventLabel: string;
  /** Path passed as `next` after login (e.g. `/promotions/3` or `/events?promotion_id=3`). */
  loginRedirectPath: string;
  buttonClassName?: string;
  /** Use outline style for dense lists (e.g. promotion profile). */
  secondaryStyle?: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const nextParam = encodeURIComponent(safeLoginNext(loginRedirectPath));
  const loginHref = `/login?next=${nextParam}`;

  const pitch = useMutation({
    mutationFn: async () => {
      const res = await apiFetch<SubmissionPayload>("/submissions", {
        method: "POST",
        json: { event_id: eventId, note: note.trim() || undefined },
      });
      return res.data;
    },
    onSuccess: () => {
      setLocalError(null);
      setSucceeded(true);
      queryClient.invalidateQueries({ queryKey: ["events-public"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-events"] });
      setTimeout(() => {
        dialogRef.current?.close();
        setSucceeded(false);
        setNote("");
      }, 1400);
    },
    onError: (e) => {
      setLocalError(e instanceof Error ? e.message : "Could not submit pitch");
    },
  });

  const primaryClass = secondaryStyle
    ? "inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 font-body text-label-bold uppercase tracking-[0.05em] text-primary transition hover:bg-primary/10"
    : buttonClassName;

  if (!user) {
    return (
      <Link href={loginHref} className={secondaryStyle ? primaryClass : "btn-ghost text-sm px-5 py-2.5"}>
        {secondaryStyle ? "Pitch" : "Submit interest"}
      </Link>
    );
  }

  if (user.role !== "wrestler") {
    return (
      <span className="font-body text-[12px] text-on-surface-variant/80" title="Switch to a wrestler account to pitch">
        Wrestler only
      </span>
    );
  }

  if (!user.wrestler_profile_id) {
    return (
      <Link
        href={`/w/profile?next=${nextParam}`}
        className="inline-flex items-center justify-center rounded-lg border border-secondary px-4 py-2 font-body text-label-bold uppercase tracking-[0.05em] text-secondary transition hover:bg-secondary/10 text-sm"
      >
        Finish profile to pitch
      </Link>
    );
  }

  return (
    <>
      <button type="button" className={primaryClass} onClick={() => dialogRef.current?.showModal()}>
        {secondaryStyle ? "Pitch" : "Submit interest"}
      </button>
      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-outline-variant/40 bg-surface-container-high p-6 shadow-2xl backdrop:bg-black/60"
        onClose={() => {
          setLocalError(null);
          setSucceeded(false);
          if (!pitch.isPending) setNote("");
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-headline text-lg text-on-surface">Pitch {eventLabel}</h2>
          <button
            type="button"
            className="rounded-md p-1 text-on-surface-variant hover:bg-surface-container"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <p className="mt-2 font-body text-body-md text-on-surface-variant">
          Add a short note (match idea, availability, or link). The promotion sees this with your profile.
        </p>
        {succeeded ? (
          <p className="mt-6 flex items-center gap-2 font-body text-body-md font-semibold text-secondary">
            <Icon name="check_circle" filled size={22} />
            Pitch sent — good luck!
          </p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setLocalError(null);
              pitch.mutate();
            }}
          >
            <div>
              <label htmlFor={`pitch-note-${eventId}`} className="field-label">
                Note (optional)
              </label>
              <textarea
                id={`pitch-note-${eventId}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="input-field resize-y"
                placeholder="e.g. Open for a singles sprint, can travel to Dallas…"
                disabled={pitch.isPending}
              />
            </div>
            {localError ? (
              <p role="alert" className="font-body text-sm text-error">
                {localError}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-ghost text-sm px-4 py-2"
                disabled={pitch.isPending}
                onClick={() => dialogRef.current?.close()}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-sm px-4 py-2" disabled={pitch.isPending}>
                {pitch.isPending ? "Sending…" : "Send pitch"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
