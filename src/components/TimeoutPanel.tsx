import type { LiveView } from "../api/types";
import { duration } from "../lib/time";

export function TimeoutPanel({ view }: { view: LiveView }) {
  const elapsed = Math.max(0, (view.as_of - view.entry_at) / 1000);
  const current = view.policy.timeout_ladder.findLastIndex(rung => rung.at_sec <= Math.min(elapsed, view.policy.max_hold_sec));
  const next = view.policy.timeout_ladder[current + 1];
  return <section className="panel"><h2>Timeout ladder</h2>
    <ol className="ladder">{view.policy.timeout_ladder.map((rung, i) =>
      <li key={rung.at_sec} aria-current={i === current ? "step" : undefined}>
        <strong>{rung.target_profit_bps / 100}%</strong><span>{rung.at_sec / 60} min</span>
      </li>)}</ol>
    <p className="muted">{next && next.at_sec <= view.policy.max_hold_sec
      ? `Next target ${next.target_profit_bps / 100}% in ${duration(Math.max(0, next.at_sec - elapsed))}`
      : "Final target remains active"}</p>
  </section>;
}
