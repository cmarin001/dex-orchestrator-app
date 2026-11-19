import type { JournalEvent } from "../api/types";

type Discovery = { counts?: Record<string, number>; triggers?: string[]; pools_scanned?: number };
export function MarketPanel({ events }: { events: JournalEvent[] }) {
  const latest = events.find(event => event.stage === "market_discovery");
  const scan = latest?.detail as Discovery | undefined;
  return <section className="panel"><h2>Market coverage</h2>
    {latest?.status === "failed" ? <p role="alert">Discovery data unavailable.</p> :
      scan?.counts ? <><p>{scan.pools_scanned} pools scanned</p><dl className="coverage">
        {Object.entries(scan.counts).map(([chain, count]) => <div key={chain}><dt>{chain}</dt><dd>{count}</dd></div>)}
      </dl><p className="muted">{scan.triggers?.map(trigger => trigger.replaceAll("_", " ")).join(", ")}</p></> :
        <p className="muted">Waiting for the worker’s first discovery scan.</p>}
  </section>;
}
