"use client";

import { useState } from "react";
import Link from "next/link";
import { compare, CompareResponse } from "@/lib/api";
import { StockWidget } from "@/components/StockWidget";

export default function ComparePage() {
  const [tickerA, setTickerA] = useState("AAPL");
  const [tickerB, setTickerB] = useState("MSFT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tickerA.trim() || !tickerB.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await compare(tickerA.trim().toUpperCase(), tickerB.trim().toUpperCase());
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compare Companies</h1>
          <p className="text-sm text-neutral-500">
            Side-by-side stock data and an AI-generated comparison.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          ← Ask a question
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={tickerA}
          onChange={(e) => setTickerA(e.target.value)}
          placeholder="Ticker A"
          className="w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 uppercase"
        />
        <span className="self-center text-neutral-400">vs</span>
        <input
          value={tickerB}
          onChange={(e) => setTickerB(e.target.value)}
          placeholder="Ticker B"
          className="w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StockWidget stock={result.ticker_a.stock} />
            <StockWidget stock={result.ticker_b.stock} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
              Comparative summary
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
