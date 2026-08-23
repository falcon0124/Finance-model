"use client";

import { StockData } from "@/lib/api";

function Sparkline({ history }: { history: StockData["history"] }) {
  if (history.length < 2) return null;

  const closes = history.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const width = 240;
  const height = 60;
  const points = closes
    .map((c, i) => {
      const x = (i / (closes.length - 1)) * width;
      const y = height - ((c - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const trendUp = closes[closes.length - 1] >= closes[0];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={trendUp ? "#22c55e" : "#ef4444"}
        strokeWidth={2}
      />
    </svg>
  );
}

export function StockWidget({ stock }: { stock: StockData }) {
  const isUp = stock.day_change_pct >= 0;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold text-lg">{stock.ticker}</span>
        <span className="text-2xl font-bold">${stock.price.toFixed(2)}</span>
      </div>
      <span
        className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}
      >
        {isUp ? "▲" : "▼"} {Math.abs(stock.day_change_pct).toFixed(2)}% today
      </span>
      <Sparkline history={stock.history} />
      <span className="text-xs text-neutral-500">Last 30 days</span>
    </div>
  );
}
