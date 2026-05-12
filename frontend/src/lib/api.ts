const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type ApiEnvelope<T> = {
  data: T;
  meta: Record<string, unknown>;
  message: string;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("ringlink_token");
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const { json, ...rest } = init;
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const payload = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok) {
    let msg =
      typeof payload.message === "string" && payload.message
        ? payload.message
        : `Request failed (${res.status})`;
    const meta = payload.meta as { errors?: Record<string, string[]> } | undefined;
    const errs = meta?.errors;
    if (errs && typeof errs === "object") {
      const first = Object.values(errs).flat()[0];
      if (typeof first === "string") msg = first;
    }
    throw new Error(msg);
  }
  return payload;
}
