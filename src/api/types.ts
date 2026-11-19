// Dashboard API v1 wire types. The backend publishes and validates these payloads.
type Chain = "ethereum" | "bsc" | "base" | "solana";
interface Market { chain: Chain; token: string; pair: string }
interface TimeoutRung { at_sec: number; target_profit_bps: number }
interface ExitSettings {
  entry_price: number;
  entry_at: number;
  min_profit_bps_for_exit: number;
  timeout_ladder: TimeoutRung[];
  max_hold_sec: number;
}
type ExitPolicy = ExitSettings & ({ mode: "profit_only" } | { mode: "stop_loss"; stop_loss_bps: number });
interface PricePoint { t: number; price: number }
interface ChartPoint extends PricePoint { source: "dexscreener" | "geckoterminal" | "aggregated" }
interface PositionMark {
  side: "buy" | "sell";
  at: number;
  price: number;
  size_usd: number;
  tx_hash: string | null;
}
export interface LiveView extends Market {
  entry_price: number;
  entry_at: number;
  policy: ExitPolicy;
  marks: PositionMark[];
  series: ChartPoint[];
  active_target_bps: number;
  target_price: number;
  target_series: PricePoint[];
  current_mark: ChartPoint | null;
  as_of: number;
}
export interface RiskConfig {
  max_risk_pct_per_trade: number;
  max_position_vs_pool_depth: number;
  max_slippage_bps: number;
  halt_new_entries_dd: number;
  timeout_ladder: TimeoutRung[];
}
export interface TradeHistoryRow extends Market {
  run_id: string;
  entry_at: number;
  exit_at: number;
  hold_sec: number;
  entry_price: number;
  exit_price: number;
  size_usd: number;
  pnl_usd: number;
  pnl_pct: number;
  exit_reason: "target" | "timeout" | "manual" | "stop";
  tx_entry: string | null;
  tx_exit: string | null;
}
export interface JournalEvent { at: string; stage: string; status: string; gaps: string[]; detail?: unknown }
export interface Equity { current_equity: number; realized_cents: number; committed_cents: number; open_positions: number }
export interface RiskResponse { config: RiskConfig; as_of: number | null; actor: string | null; editable: boolean }
export interface TradePage { items: TradeHistoryRow[]; next_cursor: string | null }
