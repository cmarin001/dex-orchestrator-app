import type { DashboardSession } from "./sample";
import { useEffect, useState } from "react";
import { request, stream } from "./client";
import type { Equity, JournalEvent, LiveView } from "./types";

export function useData<T>(path: string, token: DashboardSession, every?: number) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    setData(undefined);
    setError("");
    async function load() {
      try {
        setData(await request<T>(path, token, { signal: controller.signal }));
        setError("");
      } catch (failure) {
        if (!controller.signal.aborted) setError((failure as Error).message);
      }
      if (every && !controller.signal.aborted) timer = setTimeout(load, every);
    }
    if (token) void load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [path, token, every]);
  return { data, error, setData };
}
export const useJournal = (token: DashboardSession) => useData<JournalEvent[]>("/journal?limit=100", token, 5000);
export const useEquity = (token: DashboardSession) => useData<Equity>("/equity", token, 5000);
export function useLiveView(token: DashboardSession) {
  const [data, setData] = useState<LiveView[]>();
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    setData(undefined);
    setError("");
    async function connect() {
      try {
        await stream("/live-view/stream", token, controller.signal, payload => {
          setData(JSON.parse(payload) as LiveView[]);
          setError("");
        });
      } catch (failure) {
        if (!controller.signal.aborted) setError((failure as Error).message);
      }
      if (!controller.signal.aborted) timer = setTimeout(connect, 2500);
    }
    if (token) void connect();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [token]);
  return { data, error };
}
