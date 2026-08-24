"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="1" y="1" width="24" height="24" rx="7" fill="#C6FF3D" />
        <path d="M7 18L11 8L13 13L19 8" stroke="#0B0D10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: "var(--font-display)" }} className="text-lg font-bold tracking-tight text-[#F5F7FA]">
        Sonar
      </span>
    </div>
  );
}

export function CompanyChip({
  ticker,
  name,
  onSwitch,
}: {
  ticker: string;
  name: string;
  onSwitch: () => void;
}) {
  return (
    <motion.div
      key={ticker}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-3 bg-[#14171C] border border-[#1B1F26] rounded-full pl-1.5 pr-4 py-1.5"
    >
      <div
        className="w-[26px] h-[26px] rounded-lg bg-[#1B1F26] flex items-center justify-center text-[#C6FF3D] text-xs font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {name[0]}
      </div>
      <span className="text-[13px] font-semibold text-[#F5F7FA]">{name}</span>
      <span className="text-[11.5px] text-[#5B6472]">{ticker}</span>
      <div className="w-px h-3.5 bg-[#2A2F38]" />
      <button onClick={onSwitch} className="text-xs font-semibold text-[#C6FF3D] transition-colors duration-150 hover:text-[#A9E01F]">
        switch
      </button>
    </motion.div>
  );
}

export function AppHeader({
  ticker,
  name,
  onSwitch,
  showCompareLink,
}: {
  ticker?: string;
  name?: string;
  onSwitch?: () => void;
  showCompareLink?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-14 py-6 border-b border-[#1B1F26] gap-6">
      <Logo />
      <AnimatePresence mode="wait">
        {ticker && name && onSwitch ? (
          <CompanyChip ticker={ticker} name={name} onSwitch={onSwitch} />
        ) : (
          <div className="flex-1" />
        )}
      </AnimatePresence>
      <div className="flex items-center gap-6">
        {showCompareLink && (
          <Link href="/compare" className="text-sm font-semibold text-[#9AA3AF] transition-colors duration-150 hover:text-[#C6FF3D] whitespace-nowrap">
            Compare companies →
          </Link>
        )}
        <div className="w-[34px] h-[34px] rounded-[9px] bg-[#1B1F26] border border-[#2A2F38] flex items-center justify-center text-[13px] font-bold text-[#E7EAEE] flex-shrink-0">
          D
        </div>
      </div>
    </div>
  );
}
