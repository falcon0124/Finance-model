"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = ["Total revenue this year", "Is it profitable?", "Biggest risks disclosed"];

export function AskQuestion({
  name,
  loading,
  error,
  onAsk,
}: {
  name: string;
  loading: boolean;
  error: string | null;
  onAsk: (question: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit(question: string) {
    const q = question.trim();
    if (q) onAsk(q);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-[30px] font-semibold tracking-tight text-[#F5F7FA] mb-2"
        >
          What do you want to know about {name}?
        </h1>
        <p className="text-[14.5px] text-[#7A8492]">
          Answers are grounded in {name}&apos;s actual 10-K and 10-Q filings.
        </p>
      </motion.div>

      <motion.form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="w-[720px] flex items-center gap-2.5 bg-[#14171C] border border-[#2A2F38] rounded-2xl pl-5 pr-1.5 py-1.5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything about this company's filings…"
          className="flex-1 bg-transparent outline-none text-[15px] text-[#E7EAEE] placeholder:text-[#5B6472] py-3"
          autoFocus
        />
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? undefined : { scale: 1.02 }}
          whileTap={loading ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.12 }}
          className="bg-[#C6FF3D] text-[#0B0D10] rounded-xl px-5 py-3 text-[13.5px] font-bold whitespace-nowrap disabled:opacity-50"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={loading ? "loading" : "idle"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="inline-block"
            >
              {loading ? "Thinking…" : "Ask →"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.form>

      {error && <p className="text-sm text-[#FF5C5C]">{error}</p>}

      <motion.div
        className="flex gap-2 flex-wrap justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.16 }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="text-xs text-[#7A8492] px-3.5 py-1.5 border border-[#1B1F26] rounded-full transition-colors duration-150 hover:border-[#2A2F38] hover:text-[#C4CAD2]"
          >
            {s}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
