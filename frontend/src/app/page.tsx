"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  query,
  getStock,
  getCompanies,
  ingestCompany,
  Company,
  QueryResponse,
  StockData,
} from "@/lib/api";
import { AppHeader } from "@/components/Header";
import { CompanySelect } from "@/components/CompanySelect";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AskQuestion } from "@/components/AskQuestion";
import { ResultsTabs } from "@/components/ResultsTabs";

type Screen = "select" | "loading" | "ask" | "results";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("select");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<{ ticker: string; name: string } | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);

  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [stock, setStock] = useState<StockData | null>(null);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, []);

  async function handleSelect(ticker: string) {
    setSelectError(null);
    const existing = companies.find((c) => c.ticker === ticker);

    if (existing) {
      setSelected({ ticker: existing.ticker, name: existing.name });
      setScreen("ask");
      return;
    }

    setSelected({ ticker, name: ticker });
    setScreen("loading");
    try {
      const summary = await ingestCompany(ticker);
      setSelected({ ticker: summary.ticker, name: summary.name });
      setCompanies((prev) => [...prev, { ticker: summary.ticker, name: summary.name, cik: summary.cik, last_ingested_at: new Date().toISOString() }]);
      setScreen("ask");
    } catch (err) {
      setSelectError(err instanceof Error ? err.message : "Could not find that company");
      setScreen("select");
    }
  }

  async function handleAsk(q: string) {
    if (!selected) return;
    setAsking(true);
    setAskError(null);
    setQuestion(q);

    try {
      const [queryRes, stockRes] = await Promise.allSettled([
        query(selected.ticker, q),
        getStock(selected.ticker),
      ]);

      if (queryRes.status === "fulfilled") {
        setResult(queryRes.value);
        setScreen("results");
      } else {
        setAskError(queryRes.reason.message);
      }
      setStock(stockRes.status === "fulfilled" ? stockRes.value : null);
    } finally {
      setAsking(false);
    }
  }

  function handleSwitch() {
    setSelected(null);
    setResult(null);
    setStock(null);
    setQuestion("");
    setScreen("select");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D10] relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 50% -5%, rgba(198,255,61,0.08), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-[1440px] mx-auto">
        <AppHeader
          ticker={selected?.ticker}
          name={selected?.name}
          onSwitch={screen !== "select" && screen !== "loading" ? handleSwitch : undefined}
          showCompareLink={screen !== "loading"}
        />

        <AnimatePresence mode="wait">
          {screen === "select" && (
            <motion.div
              key="select"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <CompanySelect companies={companies} onSelect={handleSelect} />
              {selectError && (
                <p className="text-center text-sm text-[#FF5C5C] pb-8">{selectError}</p>
              )}
            </motion.div>
          )}

          {screen === "loading" && selected && (
            <motion.div
              key="loading"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingScreen ticker={selected.ticker} name={selected.name} />
            </motion.div>
          )}

          {screen === "ask" && selected && (
            <motion.div
              key="ask"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <AskQuestion name={selected.name} loading={asking} error={askError} onAsk={handleAsk} />
            </motion.div>
          )}

          {screen === "results" && selected && result && (
            <motion.div
              key="results"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            >
              <ResultsTabs question={question} result={result} stock={stock} onAskAgain={handleAsk} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
