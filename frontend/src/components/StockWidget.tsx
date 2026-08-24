"use client";

import { StockData } from "@/lib/api";

function Sparkline({ history, color }: { history: StockData["history"]; color: string }) {
  if (history.length < 2) return null;

  const closes = history.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const width = 480;
  const height = 140;
  const points = closes
    .map((c, i) => {
      const x = (i / (closes.length - 1)) * width;
      const y = height - ((c - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StockWidget({ stock }: { stock: StockData }) {
  const isUp = stock.day_change_pct >= 0;
  const color = isUp ? "#5EE68C" : "#FF5C5C";

  return (
    <div className="rounded-2xl border border-[#1B1F26] bg-[#14171C] p-6 flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span style={{ fontFamily: "var(--font-display)" }} className="text-sm font-bold text-[#9AA3AF]">
          {stock.ticker}
        </span>
        <span style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold text-[#F5F7FA]">
          ${stock.price.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-5" style={{ color }}>
        <span className="text-sm font-bold">
          {isUp ? "▲" : "▼"} {Math.abs(stock.day_change_pct).toFixed(2)}% today
        </span>
      </div>
      <Sparkline history={stock.history} color={color} />
      <span className="text-xs text-[#5B6472] mt-2">Last 30 days</span>
    </div>
  );
}
