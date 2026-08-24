"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Located company on SEC EDGAR",
  "Downloaded 10-K and 10-Q filings",
  "Chunking & generating embeddings",
  "Indexing into vector store",
];

export function LoadingScreen({ ticker, name }: { ticker: string; name: string }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-9">
      <div className="flex items-center gap-2.5">
        <div
          className="w-11 h-11 rounded-xl bg-[#1B1F26] flex items-center justify-center text-[17px] font-bold text-[#C6FF3D]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {name[0]}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg font-bold text-[#F5F7FA]">
            {name}
          </div>
          <div className="text-xs text-[#5B6472]">{ticker}</div>
        </div>
      </div>

      <div className="w-[480px] h-[200px] bg-[#14171C] border border-[#1B1F26] rounded-2xl p-6 overflow-hidden">
        <svg viewBox="0 0 432 152" className="w-full h-full">
          <line x1="0" y1="38" x2="432" y2="38" stroke="#1B1F26" strokeWidth="1" />
          <line x1="0" y1="76" x2="432" y2="76" stroke="#1B1F26" strokeWidth="1" />
          <line x1="0" y1="114" x2="432" y2="114" stroke="#1B1F26" strokeWidth="1" />
          <path
            d="M0,120 C40,110 60,60 100,70 C140,80 160,30 200,40 C240,50 260,90 300,60 C340,30 360,50 400,20 L432,10"
            fill="none"
            stroke="#C6FF3D"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 900,
              strokeDashoffset: 900,
              animation: "sonar-draw-line 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
            }}
          />
        </svg>
      </div>

      <div className="text-center">
        <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-semibold text-[#F5F7FA] mb-1.5">
          Fetching {name}&apos;s latest filings…
        </h2>
        <p className="text-[13.5px] text-[#7A8492]">
          This only happens once — future questions will be instant.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-[340px]">
        {STEPS.map((step, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={step} className="flex items-center gap-3" style={{ opacity: i > stepIndex ? 0.4 : 1 }}>
              {done ? (
                <div className="w-5 h-5 rounded-full bg-[#C6FF3D] flex items-center justify-center flex-shrink-0">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5L4.5 8L9 3" stroke="#0B0D10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : active ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: "sonar-spin 0.9s linear infinite" }}>
                  <circle cx="10" cy="10" r="8" stroke="#2A2F38" strokeWidth="2.5" />
                  <path d="M10 2A8 8 0 0 1 18 10" stroke="#C6FF3D" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <div className="w-5 h-5 rounded-full border-[1.5px] border-[#2A2F38] flex-shrink-0" />
              )}
              <span className={`text-[13.5px] ${active ? "text-[#F5F7FA] font-semibold" : "text-[#C4CAD2]"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes sonar-draw-line { to { stroke-dashoffset: 0; } }
        @keyframes sonar-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
