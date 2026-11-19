import type { DashboardSession } from "../api/sample";
import { useEquity, useJournal, useLiveView } from "../api/hooks";
import { RiskPanel } from "../components/RiskPanel";
import { MarketPanel } from "../components/MarketPanel";
import { SellPanel } from "../components/SellPanel";
import { TimeoutPanel } from "../components/TimeoutPanel";
import { PriceChart } from "../components/PriceChart";
import { short, usd } from "../lib/format";

export function Dashboard({ token }: { token: DashboardSession }) {
  const equity = useEquity(token);
  const journal = useJournal(token);
  const live = useLiveView(token);
  return <>
    <div className="section-head"><h1>Paper desk</h1><span className="muted">Simulated portfolio</span></div>
    {equity.error && <p role="alert">{equity.error}</p>}
    <div className="summary">
      <div className="panel"><span className="muted">Equity</span><strong className="accent">{equity.data ? usd(equity.data.current_equity / 100) : "—"}</strong></div>
      <div className="panel"><span className="muted">Realized P&L</span><strong>{equity.data ? usd(equity.data.realized_cents / 100) : "—"}</strong></div>
      <div className="panel"><span className="muted">Open positions</span><strong>{equity.data?.open_positions ?? "—"}</strong></div>
    </div>
    <div className="split"><MarketPanel events={journal.data ?? []} /><RiskPanel token={token} /></div>
    <h2>Open positions</h2>
    {live.error ? <p role="alert">{live.error}</p> : !live.data ? <p>Connecting to price stream…</p> :
      !live.data.length ? <p className="muted">No open positions with an exit policy.</p> : live.data.map(view =>
        <article key={view.chain + view.pair} className="position">
          <div className="panel"><div className="section-head"><h3 title={view.token}>{short(view.token)}</h3>
            <span className="muted">{view.chain}</span></div><PriceChart view={view} /></div>
          <div className="split"><SellPanel view={view} /><TimeoutPanel view={view} /></div>
        </article>)}
  </>;
}
