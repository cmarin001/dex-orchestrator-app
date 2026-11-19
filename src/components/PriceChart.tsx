import { useEffect, useRef } from "react";
import { createChart, createSeriesMarkers, LineSeries, LineStyle, LineType, ColorType } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";
import type { LiveView } from "../api/types";

const timestamp = (ms: number) => Math.floor(ms / 1000) as UTCTimestamp;
export function PriceChart({ view }: { view: LiveView }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    const chart = createChart(root.current, { autoSize: true, height: 260,
      layout: { background: { type: ColorType.Solid, color: "#171c19" }, textColor: "#a8ad9f" },
      grid: { vertLines: { color: "#212822" }, horzLines: { color: "#2e3630" } },
      timeScale: { timeVisible: true },
    });
    const line = chart.addSeries(LineSeries, { color: "#9cb88a", lineWidth: 2, priceFormat: { type: "price", precision: 8, minMove: 0.00000001 } });
    const data = new Map<UTCTimestamp, number>();
    data.set(timestamp(view.entry_at), view.entry_price);
    for (const mark of view.marks) data.set(timestamp(mark.at), mark.price);
    for (const point of view.series) data.set(timestamp(point.t), point.price);
    const ordered = [...data.entries()].sort(([a], [b]) => a - b);
    line.setData(ordered.map(([time, value]) => ({ time, value })));
    line.createPriceLine({ price: view.entry_price, color: "#a8ad9f", lineStyle: LineStyle.Dashed, title: "Entry" });
    const goal = chart.addSeries(LineSeries, { color: "#d6a24a", lineType: LineType.WithSteps, lineWidth: 2,
      lastValueVisible: true, priceLineVisible: false, title: "Target" });
    const targets = new Map(view.target_series.map(point => [timestamp(point.t), point.price]));
    goal.setData([...targets.entries()].sort(([a], [b]) => a - b).map(([time, value]) => ({ time, value })));
    createSeriesMarkers(line, [...view.marks].sort((a, b) => a.at - b.at).map(mark => ({
      time: timestamp(mark.at), position: "atPriceMiddle", price: mark.price,
      color: mark.side === "buy" ? "#9cb88a" : "#e08a72",
      shape: mark.side === "buy" ? "arrowUp" : "arrowDown", text: mark.side,
    })));
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [view]);
  return <div className="chart" ref={root} aria-label="Paper position price, entry, and exit target" />;
}
