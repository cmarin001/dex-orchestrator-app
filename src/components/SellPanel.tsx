import type { LiveView } from "../api/types";
import { price } from "../lib/format";

export function SellPanel({ view }: { view: LiveView }) {
  const profitOnly = view.policy.mode === "profit_only";
  return <section className="panel"><h2>Exit policy</h2>
    <p className={profitOnly ? "accent" : ""}>{profitOnly ? "Profit only · Stop-loss disabled" : "Stop-loss enabled"}</p>
    <dl className="coverage"><div><dt>Entry</dt><dd>{price(view.entry_price)}</dd></div>
      <div><dt>Latest mark</dt><dd>{view.current_mark ? price(view.current_mark.price) : "—"}</dd></div>
      <div><dt>Exit target</dt><dd>{price(view.target_price)}</dd></div>
    </dl>
  </section>;
}
