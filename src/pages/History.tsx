import type { DashboardSession } from "../api/sample";
import { useState } from "react";
import { useData } from "../api/hooks";
import type { TradePage } from "../api/types";
import { TradeAudit, TradeHistoryTable } from "../components/TradeHistoryTable";
import { day } from "../lib/time";

export function History({ token }: { token: DashboardSession }) {
  const [from, setFrom] = useState(() => day(Date.now() - 6 * 86400000));
  const [to, setTo] = useState(() => day(Date.now()));
  const [filter, setFilter] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const query = new URLSearchParams({ limit: "25" });
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  if (filter.trim()) query.set("token", filter.trim());
  const cursor = pages.at(-1);
  if (cursor) query.set("cursor", cursor);
  const { data, error } = useData<TradePage>("/trades?" + query, token);
  return <section className="panel"><h1>Trade history</h1>
    <div className="filters"><label>From <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPages([]); }} /></label>
      <label>To <input type="date" value={to} onChange={e => { setTo(e.target.value); setPages([]); }} /></label>
      <label>Token address <input value={filter} onChange={e => { setFilter(e.target.value); setPages([]); }} /></label>
    </div>
    {error ? <p role="alert">{error}</p> : !data ? <p>Loading trades…</p> :
      data.items.length ? <TradeHistoryTable rows={data.items} select={setSelected} /> : <p>No closed trades in this range.</p>}
    <div className="pagination"><button disabled={!pages.length} onClick={() => setPages(pages.slice(0, -1))}>Previous</button>
      <button disabled={!data?.next_cursor} onClick={() => { if (data?.next_cursor) setPages([...pages, data.next_cursor]); }}>Next</button></div>
    {selected && <TradeAudit run={selected} token={token} close={() => setSelected("")} />}
  </section>;
}
