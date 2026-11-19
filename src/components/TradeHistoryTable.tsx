import type { DashboardSession } from "../api/sample";
import { Fragment, useEffect, useRef } from "react";
import { useData } from "../api/hooks";
import type { JournalEvent, TradeHistoryRow } from "../api/types";
import { price, short, usd } from "../lib/format";
import { clock, day, duration } from "../lib/time";

export function TradeHistoryTable({ rows, select }: { rows: TradeHistoryRow[]; select: (run: string) => void }) {
  return <div className="table-scroll"><table><thead><tr>{["Time (UTC)", "Token", "Chain", "Entry", "Exit", "Size", "P&L", "P&L %", "Hold", "Reason"].map(cell => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <Fragment key={row.run_id}>
      {(i === 0 || day(rows[i - 1].exit_at) !== day(row.exit_at)) &&
        <tr className="date-row"><th colSpan={10}>{day(row.exit_at)}</th></tr>}
      <tr onClick={() => select(row.run_id)}>
        <td><button onClick={event => { event.stopPropagation(); select(row.run_id); }}>{clock(row.exit_at)}</button></td>
        <td title={row.token}>{short(row.token)}</td><td>{row.chain}</td><td>{price(row.entry_price)}</td>
        <td>{price(row.exit_price)}</td><td>{usd(row.size_usd)}</td>
        <td className={row.pnl_usd >= 0 ? "gain" : "loss"}>{usd(row.pnl_usd)}</td>
        <td className={row.pnl_pct >= 0 ? "gain" : "loss"}>{row.pnl_pct.toFixed(2)}%</td>
        <td>{duration(row.hold_sec)}</td><td>{row.exit_reason}</td>
      </tr>
    </Fragment>)}</tbody>
  </table></div>;
}

export function TradeAudit({ run, token, close }: { run: string; token: DashboardSession; close: () => void }) {
  const { data, error } = useData<JournalEvent[]>("/journal?run_id=" + encodeURIComponent(run), token);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} onCancel={close} className="drawer"><div className="section-head"><h2>Trade audit</h2>
    <button onClick={close}>Close</button></div>
    <p className="mono">{run}</p>
    {error && <p role="alert">{error}</p>}
    {data?.map((record, i) => <details key={i}><summary>{clock(Date.parse(record.at))} · {record.stage} · {record.status}</summary>
      <pre>{JSON.stringify(record, null, 2)}</pre></details>)}
  </dialog>;
}
