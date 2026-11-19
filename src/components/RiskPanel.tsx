import type { DashboardSession } from "../api/sample";
import { useState } from "react";
import type { FormEvent } from "react";
import { request } from "../api/client";
import { useData } from "../api/hooks";
import type { RiskResponse } from "../api/types";

export function RiskPanel({ token }: { token: DashboardSession }) {
  const { data, error, setData } = useData<RiskResponse>("/risk-config", token);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await request<RiskResponse>("/risk-config", token, { method: "POST", body: JSON.stringify({
        max_risk_pct_per_trade: Number(form.get("risk")) / 100,
        max_position_vs_pool_depth: Number(form.get("depth")) / 100,
        max_slippage_bps: Number(form.get("slippage")),
        halt_new_entries_dd: Number(form.get("drawdown")) / 100,
        timeout_ladder: data.config.timeout_ladder.map((rung, i) => ({
          at_sec: rung.at_sec, target_profit_bps: Number(form.get("rung-" + i)),
        })),
      }) });
      setData(response);
      setNotice("Risk limits saved");
    } catch (error) { setNotice((error as Error).message); }
    finally { setSaving(false); }
  }
  return <section className="panel"><h2>Risk limits</h2>
    {error && <p role="alert">{error}</p>}
    {data && <form onSubmit={save} key={data.as_of ?? "initial"}>
      <fieldset disabled={!data.editable || saving}>
        <label>Risk per trade (%)<input name="risk" type="number" min=".01" max="100" step=".01" defaultValue={data.config.max_risk_pct_per_trade * 100} required /></label>
        <label>Pool depth cap (%)<input name="depth" type="number" min=".01" max="100" step=".01" defaultValue={data.config.max_position_vs_pool_depth * 100} required /></label>
        <label>Slippage cap (bps)<input name="slippage" type="number" min="0" max="1000" defaultValue={data.config.max_slippage_bps} required /></label>
        <label>Halt at drawdown (%)<input name="drawdown" type="number" min=".01" max="100" step=".01" defaultValue={data.config.halt_new_entries_dd * 100} required /></label>
        {data.config.timeout_ladder.map((rung, i) => <label key={rung.at_sec}>Target at {rung.at_sec / 60}m (bps)
          <input name={"rung-" + i} type="number" min="1" max="10000" defaultValue={rung.target_profit_bps} required /></label>)}
        <button type="submit">Save risk limits</button>
      </fieldset>
    </form>}
    <p className="muted" role="status">{notice || (data?.as_of ? "Updated " + new Date(data.as_of).toLocaleString() : "Current defaults")}</p>
  </section>;
}
