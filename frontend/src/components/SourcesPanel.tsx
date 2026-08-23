"use client";

import { useState } from "react";
import { Source } from "@/lib/api";

export function SourcesPanel({ sources }: { sources: Source[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (sources.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
        Sources used ({sources.length})
      </p>
      <div className="flex flex-col gap-2">
        {sources.map((source) => {
          const isOpen = expandedId === source.id;
          return (
            <div
              key={source.id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800"
            >
              <button
                onClick={() => setExpandedId(isOpen ? null : source.id)}
                className="w-full text-left px-3 py-2 text-sm font-mono text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex justify-between items-center"
              >
                <span>[{source.id}]</span>
                <span className="text-xs">{isOpen ? "hide" : "show"}</span>
              </button>
              {isOpen && (
                <p className="px-3 pb-3 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                  {source.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
