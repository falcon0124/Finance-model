"use client";

import { useState } from "react";
import Link from "next/link";
import { query, getStock, QueryResponse, StockData } from "@/lib/api";
import { StockWidget } from "@/components/StockWidget";
import { SourcesPanel } from "@/components/SourcesPanel";

export default function Home() {
  const [ticker, setTicker] = useState("AAPL");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [stock, setStock] = useState<StockData | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim() || !question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [queryRes, stockRes] = await Promise.allSettled([
        query(ticker.trim().toUpperCase(), question.trim()),
        getStock(ticker.trim().toUpperCase()),
      ]);

      if (queryRes.status === "fulfilled") {
        setResult(queryRes.value);
      } else {
        setError(queryRes.reason.message);
      }

      if (stockRes.status === "fulfilled") {
        setStock(stockRes.value);
      } else {
        setStock(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Financial Research Assistant</h1>
          <p className="text-sm text-neutral-500">
            Ask a question about any public company&apos;s latest 10-K.
          </p>
        </div>
        <Link
          href="/compare"
          className="text-sm font-medium border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          Compare companies →
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Ticker (e.g. AAPL)"
            className="w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 uppercase"
          />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What was total revenue last year?"
            className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          {result.ingested_now && (
            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 rounded-lg px-3 py-2 w-fit">
              First time seeing {result.ticker} — fetched and indexed its latest 10-K just now.
            </p>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                Answer
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{result.answer}</p>
              <SourcesPanel sources={result.sources} />
            </div>

            {stock && (
              <div className="w-full md:w-64">
                <StockWidget stock={stock} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
