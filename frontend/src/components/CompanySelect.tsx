"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Company } from "@/lib/api";

const POPULAR = ["MSFT", "TSLA", "NVDA", "GOOGL", "AMZN"];

export function CompanySelect({
  companies,
  onSelect,
}: {
  companies: Company[];
  onSelect: (ticker: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit(ticker: string) {
    const t = ticker.trim().toUpperCase();
    if (t) onSelect(t);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-7 px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-3xl font-semibold tracking-tight text-[#F5F7FA] mb-2"
        >
          Which company do you want to look into?
        </h1>
        <p className="text-[15px] text-[#7A8492]">
          Search any public company by name or ticker to get started.
        </p>
      </motion.div>

      <motion.form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="w-full max-w-xl flex items-center gap-2.5 bg-[#14171C] border border-[#2A2F38] rounded-2xl pl-5 pr-1.5 py-1.5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#5B6472" strokeWidth="1.6" />
          <path d="M12.5 12.5L16 16" stroke="#5B6472" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Apple or AAPL"
          className="flex-1 bg-transparent outline-none text-base text-[#E7EAEE] placeholder:text-[#5B6472] py-3"
          autoFocus
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className="bg-[#C6FF3D] text-[#0B0D10] rounded-xl px-5 py-3 text-sm font-bold whitespace-nowrap"
        >
          Continue →
        </motion.button>
      </motion.form>

      {companies.length > 0 && (
        <motion.div
          className="w-full max-w-xl bg-[#14171C] border border-[#1B1F26] rounded-xl p-2 flex flex-col gap-0.5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14, ease: [0.4, 0, 0.2, 1] }}
        >
          {companies.slice(0, 4).map((c) => (
            <button
              key={c.ticker}
              onClick={() => submit(c.ticker)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 hover:bg-[rgba(198,255,61,0.08)] text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1B1F26] flex items-center justify-center text-[#C6FF3D] text-xs font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {c.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#F5F7FA]">{c.name}</div>
                <div className="text-xs text-[#5B6472]">{c.ticker}</div>
              </div>
              <span className="text-[11px] font-semibold text-[#C6FF3D] bg-[rgba(198,255,61,0.12)] px-2.5 py-1 rounded-full">
                already indexed
              </span>
            </button>
          ))}
        </motion.div>
      )}

      <motion.div
        className="flex gap-2.5 items-center text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <span className="text-[#5B6472]">Popular:</span>
        {POPULAR.map((t) => (
          <button
            key={t}
            onClick={() => submit(t)}
            className="text-[#9AA3AF] transition-colors duration-150 hover:text-[#C6FF3D]"
          >
            {t}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
