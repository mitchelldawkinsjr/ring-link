"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { GlassCard } from "@/components/glass-card";
import { Icon } from "@/components/icon";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

type Conversation = {
  id: number;
  subject?: string | null;
  last_message_at?: string | null;
  last_message?: string | null;
  unread_count?: number;
  promotion_profile?: { id?: number; promotion_name?: string | null } | null;
  wrestler_profile?: { id?: number; ring_name?: string | null } | null;
};

type Message = {
  id: number;
  conversation_id: number;
  sender_user_id: number;
  body: string;
  created_at: string;
};

function relativeTime(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  return `${d}d`;
}

function MessagesInner() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const requestedId = (() => {
    const raw = searchParams?.get("conversation");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  })();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(requestedId);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const conversations = useQuery({
    queryKey: ["conversations"],
    enabled: !!user,
    queryFn: async () => (await apiFetch<Conversation[]>("/conversations")).data,
  });

  const list = useMemo<Conversation[]>(() => conversations.data ?? [], [conversations.data]);

  // Honour the `?conversation=<id>` deep-link as long as the user has access
  // to that thread; otherwise fall back to the most recent one.
  useEffect(() => {
    if (list.length === 0) return;
    if (activeId && list.some((c) => c.id === activeId)) return;
    if (requestedId && list.some((c) => c.id === requestedId)) {
      setActiveId(requestedId);
    } else if (!activeId) {
      setActiveId(list[0].id);
    }
  }, [activeId, list, requestedId]);

  const messages = useQuery({
    queryKey: ["messages", activeId],
    enabled: !!activeId,
    queryFn: async () => (await apiFetch<Message[]>(`/conversations/${activeId}/messages`)).data,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.data?.length, activeId]);

  const send = useMutation({
    mutationFn: async () => {
      if (!activeId || !draft.trim()) return null;
      return apiFetch<Message>(`/conversations/${activeId}/messages`, {
        method: "POST",
        json: { body: draft.trim() },
      });
    },
    onSuccess: () => {
      setDraft("");
      if (activeId) qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const active = useMemo(() => list.find((c) => c.id === activeId) ?? null, [list, activeId]);
  const counterpartName = active
    ? user?.role === "promotion"
      ? active.wrestler_profile?.ring_name ?? "Talent"
      : active.promotion_profile?.promotion_name ?? "Promoter"
    : "—";

  if (!user) {
    return (
      <PageShell className="px-margin-mobile pt-12 md:px-margin-desktop">
        <GlassCard className="mx-auto max-w-md p-8 text-center">
          <Icon name="lock" size={28} className="mx-auto text-on-surface-variant" />
          <h1 className="mt-4 font-headline text-2xl">Sign in to message</h1>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Log in
          </Link>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell className="px-margin-mobile pb-28 pt-6 md:px-margin-desktop">
      <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-container-max flex-col gap-4 md:h-[calc(100dvh-6rem)]">
        <header className="space-y-1">
          <span className="label-tag">Messages</span>
          <h1 className="font-headline text-headline-md-mobile md:text-headline-md">Inbox</h1>
        </header>

        <div className="flex flex-1 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
          <aside
            className={`w-full shrink-0 border-r border-outline-variant/30 md:w-80 ${
              activeId ? "hidden md:flex" : "flex"
            } flex-col`}
          >
            <div className="border-b border-outline-variant/30 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-lg">Threads</h2>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-[0.05em] text-primary">
                  {list.length}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.isLoading ? (
                <p className="p-5 font-body text-body-md text-on-surface-variant">Loading…</p>
              ) : list.length === 0 ? (
                <p className="p-5 font-body text-body-md text-on-surface-variant">
                  No conversations yet. Threads open after a booking is created.
                </p>
              ) : (
                list.map((c) => {
                  const isActive = c.id === activeId;
                  const name =
                    user.role === "promotion"
                      ? c.wrestler_profile?.ring_name ?? "Talent"
                      : c.promotion_profile?.promotion_name ?? "Promoter";
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      className={`block w-full border-b border-outline-variant/20 px-5 py-4 text-left transition ${
                        isActive ? "border-l-4 border-l-primary bg-primary/5" : "hover:bg-surface-container/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container text-primary">
                          <Icon name="person" filled size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="truncate font-body text-sm font-bold text-on-surface">{name}</p>
                            <span className="ml-2 shrink-0 font-body text-[10px] text-on-surface-variant/70">
                              {relativeTime(c.last_message_at)}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate font-body text-[12px] text-on-surface-variant">
                            {c.subject ?? "Open thread"}
                          </p>
                        </div>
                        {c.unread_count ? (
                          <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 font-body text-[10px] font-bold text-on-primary">
                            {c.unread_count}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className={`flex flex-1 flex-col ${activeId ? "flex" : "hidden md:flex"}`}>
            <header className="flex items-center justify-between gap-4 border-b border-outline-variant/30 bg-surface-container-low/40 px-5 py-4">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="md:hidden"
                aria-label="Back to inbox"
              >
                <Icon name="arrow_back" size={22} />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-headline text-lg text-on-surface">{counterpartName}</h2>
                <p className="truncate font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary">
                  {active?.subject ?? "RingLink secure thread"}
                </p>
              </div>
              <Icon name="more_vert" size={22} className="text-on-surface-variant" />
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5 md:p-8">
              {!activeId ? (
                <p className="font-body text-body-md text-on-surface-variant">
                  Select a thread on the left to read messages.
                </p>
              ) : messages.isLoading ? (
                <p className="font-body text-body-md text-on-surface-variant">Loading messages…</p>
              ) : (messages.data ?? []).length === 0 ? (
                <p className="font-body text-body-md text-on-surface-variant">
                  No messages yet. Say hello to {counterpartName}.
                </p>
              ) : (
                (messages.data ?? []).map((m) => {
                  const mine = m.sender_user_id === user.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 font-body text-sm leading-relaxed shadow-md ${
                          mine
                            ? "rounded-br-none bg-primary-container text-on-primary-container"
                            : "rounded-bl-none border border-outline-variant/30 bg-surface-container text-on-surface"
                        }`}
                      >
                        <p>{m.body}</p>
                        <p
                          className={`mt-1 font-body text-[10px] ${
                            mine ? "text-on-primary-container/80" : "text-on-surface-variant"
                          }`}
                        >
                          {new Date(m.created_at).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) send.mutate();
              }}
              className="border-t border-outline-variant/30 bg-surface-container-lowest p-4"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  placeholder={activeId ? "Type a message…" : "Select a thread first"}
                  disabled={!activeId}
                  aria-label="Message body"
                  className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (draft.trim()) send.mutate();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!activeId || !draft.trim() || send.isPending}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-on-primary-container shadow-md transition active:scale-95 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Icon name="send" size={20} />
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <PageShell className="px-margin-mobile pt-12 md:px-margin-desktop">
          <p className="mx-auto max-w-md font-body text-body-md text-on-surface-variant">Loading messages…</p>
        </PageShell>
      }
    >
      <MessagesInner />
    </Suspense>
  );
}
