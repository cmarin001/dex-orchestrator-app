import { samplePositions, sampleResponse, sampleSession } from "./sample";
import type { DashboardSession } from "./sample";

const backend = import.meta.env.VITE_DASHBOARD_API_URL || (import.meta.env.DEV ? "/api/dashboard" : "");

function endpoint(path: string) {
  if (!backend) throw new Error("The deployed app has no backend URL configured");
  if (backend.startsWith("/")) return backend.replace(/\/$/, "") + path;
  const target = new URL(backend);
  if (target.protocol !== "https:" || target.username || target.password) {
    throw new Error("The dashboard API URL must use HTTPS without embedded credentials");
  }
  const [route, query] = path.split("?", 2);
  target.search = query ?? "";
  target.hash = "";
  if (target.pathname.replace(/\/$/, "").endsWith("/api/dashboard-data")) {
    target.pathname = target.pathname.replace(/\/$/, "");
    target.searchParams.set("endpoint", route);
  } else {
    target.pathname = target.pathname.replace(/\/$/, "") + route;
  }
  return target.href;
}

export async function request<T>(path: string, token: DashboardSession, options?: RequestInit): Promise<T> {
  if (token === sampleSession) {
    if (options?.method && options.method !== "GET") throw new Error("Sample data is read-only");
    return sampleResponse(path) as T;
  }
  const response = await fetch(endpoint(path), { ...options, headers: {
    Authorization: "Bearer " + token, ...(options?.body ? { "Content-Type": "application/json" } : {}),
  } });
  if (!response.ok) {
    const status = response.status;
    throw new Error(status === 401 ? "Access token rejected" : status === 400 ? "The server rejected these values" : `Dashboard API returned ${status}`);
  }
  return response.json() as Promise<T>;
}

export async function stream(path: string, token: DashboardSession, signal: AbortSignal, receive: (payload: string) => void) {
  if (token === sampleSession) {
    receive(JSON.stringify(samplePositions));
    if (!signal.aborted) await new Promise<void>(resolve => signal.addEventListener("abort", () => resolve(), { once: true }));
    return;
  }
  const response = await fetch(endpoint(path), { signal, headers: { Authorization: "Bearer " + token } });
  if (!response.ok || !response.body || !response.headers.get("content-type")?.startsWith("text/event-stream")) {
    throw new Error("Live stream unavailable");
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (true) {
      const packet = await reader.read();
      if (packet.done) return;
      buffer += packet.value;
      let end = buffer.indexOf("\n\n");
      while (end !== -1) {
        const event = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (event.includes("event: unavailable")) throw new Error("Live data unavailable");
        const line = event.split("\n").find(part => part.startsWith("data:"));
        if (line) receive(line.slice(5).trimStart());
        end = buffer.indexOf("\n\n");
      }
    }
  } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
