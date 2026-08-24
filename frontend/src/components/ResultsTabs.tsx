"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QueryResponse, StockData } from "@/lib/api";
import { StockWidget } from "@/components/StockWidget";

type Tab = "answer" | "stock" | "sources";

export function ResultsTabs({
  question,
  result,
  stock,
  onAskAgain,
}: {
  question: string;
  result: QueryResponse;
  stock: StockData | null;
  onAskAgain: (question: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("answer");
  const [value, setValue] = useState(question);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(result.sources[0]?.id ?? null);

  const isUp = stock ? stock.day_change_pct >= 0 : true;
  const activeSource = result.sources.find((s) => s.id === activeSourceId) ?? result.sources[0];

  function filingLabel(id: string) {
    if (id.startsWith("10k")) return "10-K";
    if (id.startsWith("10q")) return "10-Q";
    return "Filing";
  }

  function highlightExcerpt(text: string) {
    const cut = Math.min(220, text.length);
    let end = text.indexOf(".", cut > 40 ? cut - 40 : 0);
    if (end === -1 || end > cut + 80) end = cut;
    end += 1;
    return { lead: text.slice(0, end).trim(), rest: text.slice(end).trim() };
  }

  return (
    <div className="flex-1 flex flex-col">
      <motion.div
        className="px-14 pt-8 max-w-4xl w-full mx-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = value.trim();
            if (q) onAskAgain(q);
          }}
          className="flex-1 flex items-center gap-2.5 bg-[#14171C] border border-[#2A2F38] rounded-xl pl-4 pr-1.5 py-1"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[14.5px] text-[#E7EAEE] py-2.5"
          />
          <button
            type="submit"
            className="bg-[#1B1F26] text-[#C6FF3D] border border-[#2A2F38] rounded-lg px-4.5 py-2.5 text-[13px] font-bold whitespace-nowrap transition-colors duration-150 hover:bg-[#20242C]"
          >
            Ask again
          </button>
        </form>
      </motion.div>

      <motion.div
        className="px-14 pt-6 flex gap-1 border-b border-[#1B1F26] max-w-4xl w-full mx-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <TabButton active={tab === "answer"} onClick={() => setTab("answer")}>
          <SparkleIcon /> Answer
        </TabButton>
        <TabButton active={tab === "stock"} onClick={() => setTab("stock")}>
          <ChartIcon />
          Stock
          {stock && (
            <span className={`text-[10.5px] font-bold ${isUp ? "text-[#5EE68C]" : "text-[#FF5C5C]"}`}>
              {isUp ? "▲" : "▼"}
              {Math.abs(stock.day_change_pct).toFixed(2)}%
            </span>
          )}
        </TabButton>
        <TabButton active={tab === "sources"} onClick={() => setTab("sources")}>
          <DocIcon /> Sources
          <span className="text-[11px] font-bold text-[#5B6472] bg-[#1B1F26] px-1.75 py-0.5 rounded-full">
            {result.sources.length}
          </span>
        </TabButton>
      </motion.div>

      <div className="px-14 py-7 max-w-4xl w-full mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "answer" && (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="bg-[#14171C] border border-[#1B1F26] rounded-2xl p-7"
            >
              <div className="flex items-center justify-between mb-4.5">
                <span className="text-[11px] font-bold text-[#7A8492] uppercase tracking-wide">
                  Grounded answer
                </span>
                <span className="text-[11px] font-semibold text-[#C6FF3D] bg-[rgba(198,255,61,0.1)] border border-[rgba(198,255,61,0.25)] px-2.5 py-1 rounded-full">
                  {result.ingested_now ? "just indexed" : "verified"} · {result.sources.length} sources
                </span>
              </div>
              <p className="text-[17px] leading-relaxed text-[#E7EAEE] whitespace-pre-wrap">{result.answer}</p>
              <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#1B1F26]">
                <ChartIcon />
                <span className="text-xs text-[#5B6472]">Want the numbers behind this? Check the</span>
                <button
                  onClick={() => setTab("stock")}
                  className="text-xs font-semibold text-[#C6FF3D] transition-colors duration-150 hover:text-[#A9E01F]"
                >
                  Stock tab →
                </button>
              </div>
            </motion.div>
          )}

          {tab === "stock" && (
            <motion.div
              key="stock"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-md"
            >
              {stock ? (
                <StockWidget stock={stock} />
              ) : (
                <p className="text-sm text-[#7A8492]">Stock data unavailable right now.</p>
              )}
            </motion.div>
          )}

          {tab === "sources" && activeSource && (
            <motion.div
              key="sources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="flex gap-5 items-start"
            >
              {/* Source list */}
              <div className="w-64 flex-shrink-0 flex flex-col gap-2">
                {result.sources.map((s) => {
                  const active = s.id === activeSource.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSourceId(s.id)}
                      className={`text-left rounded-xl px-3.5 py-3 border transition-colors duration-150 ${
                        active ? "border-[#C6FF3D] bg-[rgba(198,255,61,0.06)]" : "border-[#1B1F26] bg-[#0B0D10] hover:border-[#2A2F38]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded font-semibold transition-colors duration-150 ${
                            active ? "bg-[rgba(198,255,61,0.14)] text-[#C6FF3D]" : "bg-[#1B1F26] text-[#9AA3AF]"
                          }`}
                        >
                          {filingLabel(s.id)}
                        </span>
                        {active && <span className="text-[10px] font-bold text-[#C6FF3D]">viewing</span>}
                      </div>
                      <div className="text-[11.5px] text-[#5B6472] font-mono">{s.id}</div>
                    </button>
                  );
                })}
              </div>

              {/* Magnified page */}
              <div className="flex-1 bg-[#14171C] border border-[#1B1F26] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1B1F26] flex items-center justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSource.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="text-[13px] font-bold text-[#F5F7FA] mb-0.5">
                        {result.ticker} — {filingLabel(activeSource.id)} excerpt
                      </div>
                      <div className="text-[11.5px] text-[#5B6472] font-mono">{activeSource.id}</div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="p-5 bg-[#0B0D10]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSource.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="bg-[#F7F4EC] rounded-md px-6 py-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                    >
                      {(() => {
                        const { lead, rest } = highlightExcerpt(activeSource.text);
                        return (
                          <p className="text-[13.5px] leading-[1.9] text-[#3A3627]">
                            <span className="relative inline">
                              <mark className="bg-[rgba(198,255,61,0.45)] text-[#2B2818] rounded px-0.5 box-decoration-clone">
                                {lead}
                              </mark>
                            </span>{" "}
                            {rest}
                          </p>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="relative px-4.5 py-3 flex items-center gap-2 text-sm font-semibold">
      <span className={`transition-colors duration-150 flex items-center gap-2 ${active ? "text-[#F5F7FA]" : "text-[#7A8492]"}`}>
        {children}
      </span>
      {active && (
        <motion.div
          layoutId="tab-underline"
          className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#C6FF3D]"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
    </button>
  );
}

function SparkleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1L9.2 5.8L14 7.5L9.2 9.2L7.5 14L5.8 9.2L1 7.5L5.8 5.8L7.5 1Z" fill="#C6FF3D" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 12L5.5 6L8.5 9L13 3" stroke="#7A8492" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="2" y="1.5" width="11" height="12" rx="1.5" stroke="#7A8492" strokeWidth="1.4" />
      <path d="M4.5 5H10.5M4.5 7.5H10.5M4.5 10H8" stroke="#7A8492" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
