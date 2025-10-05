// src/lib/subgraph.ts
import { GraphQLClient, gql as gqlTag } from "graphql-request";

export const SUBGRAPH_URL =
  (import.meta.env.VITE_SUBGRAPH_YEARN as string) ||
  "https://api.studio.thegraph.com/query/109223/yearntogether-testnet/v0.3.4";

// Re-export gql for callers
export const gql = gqlTag;

/* ---------------- Concurrency (1 at a time) ---------------- */
let active = 0;
const queue: Array<() => void> = [];
const runNext = () => {
  active = Math.max(0, active - 1);
  const fn = queue.shift();
  if (fn) fn();
};

/* ---------------- Retry helpers ---------------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransientNetErr(err: any): boolean {
  const msg = String(err?.message || err || "").toLowerCase();
  // Common browser/node fetch failures, including network switch
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network changed") ||
    msg.includes("err_network_changed") ||
    msg.includes("fetch failed") ||
    msg.includes("load failed") ||
    msg.includes("net::err_")
  );
}

function isOffline(): boolean {
  try {
    return typeof navigator !== "undefined" && navigator.onLine === false;
  } catch {
    return false;
  }
}

function waitUntilOnline(): Promise<void> {
  if (!isOffline()) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const onUp = () => {
      window.removeEventListener("online", onUp);
      resolve();
    };
    window.addEventListener("online", onUp, { once: true });
  });
}

async function withRetry<T>(fn: () => Promise<T>) {
  let attempt = 0;
  // Up to 6 tries (0..5 retries) with exponential backoff + jitter
  while (true) {
    // Pause if offline to avoid hammering
    if (isOffline()) {
      try { window.dispatchEvent(new Event("network:down")); } catch {}
      await waitUntilOnline();
      try { window.dispatchEvent(new Event("network:up")); } catch {}
    }

    try {
      return await fn();
    } catch (err: any) {
      // GraphQL errors without HTTP status (e.g., fetch blew up)
      const status =
        err?.response?.status ??
        err?.status ??
        undefined;

      const retryableHttp = status === 429 || (status && status >= 500 && status < 600);
      const retryableNet = isTransientNetErr(err);

      if (!(retryableHttp || retryableNet) || attempt >= 5) {
        throw err;
      }

      // Respect Retry-After header if present
      let retryAfterMs = 0;
      try {
        const hdr = err?.response?.headers?.get?.("retry-after");
        if (hdr) retryAfterMs = Number(hdr) * 1000 || 0;
      } catch {}

      const base = retryAfterMs > 0 ? retryAfterMs : 400 * 2 ** attempt; // 400, 800, 1600, ...
      const jitter = Math.floor(Math.random() * 150);
      await sleep(base + jitter);
      attempt++;
    }
  }
}

/* ---------------- GraphQL client ---------------- */
const client = new GraphQLClient(SUBGRAPH_URL, {
  headers: {
    "content-type": "application/json",
    accept: "application/json",
  },
});

/* ---------------- Core request (queued + retried) ---------------- */
function _request<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      active++;
      withRetry(() => client.request<T>(query, variables))
        .then(resolve)
        .catch(reject)
        .finally(runNext);
    };
    if (active < 1) run();
    else queue.push(run);
  });
}

/* ---------------- Public API ---------------- */
export const subgraph = { request: _request };
export function subgraphRequest<T = any>(query: string, variables?: Record<string, any>) {
  return _request<T>(query, variables);
}
