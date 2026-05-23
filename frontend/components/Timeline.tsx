"use client";

import type { PipelineItem } from "@/lib/api";

const PHASE_LABELS: Record<string, string> = {
  scripting: "Guion",
  shooting: "Rodaje",
  editing: "Edición",
  promotion: "Promoción",
  publishing: "Publicación",
};

const PHASE_ORDER = ["scripting", "shooting", "editing", "promotion", "publishing"];

export default function Timeline({ pipeline }: { pipeline: PipelineItem[] }) {
  const byPhase: Record<string, PipelineItem> = {};
  for (const item of pipeline) byPhase[item.phase] = item;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Pipeline de Producción</h2>
      <div className="flex items-center gap-0">
        {PHASE_ORDER.map((phase, idx) => {
          const item = byPhase[phase];
          const isDone = item?.status === "completed";
          const isActive = item?.status === "active";
          const isPending = !item || item.status === "pending";

          return (
            <div key={phase} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2 px-1">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition"
                  style={{
                    borderColor: isDone || isActive ? "var(--color-accent)" : "var(--color-border)",
                    backgroundColor: isDone ? "var(--color-accent)" : isActive ? "rgba(59,130,246,0.15)" : "transparent",
                    color: isDone ? "#fff" : isActive ? "var(--color-accent)" : "var(--color-muted)",
                  }}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span className="text-xs font-medium text-center" style={{ color: isDone || isActive ? "#fff" : "var(--color-muted)" }}>
                  {PHASE_LABELS[phase]}
                </span>
                {item && (
                  <span className="text-[10px] text-[var(--color-muted)]">
                    {item.progress_pct}%
                  </span>
                )}
              </div>
              {idx < PHASE_ORDER.length - 1 && (
                <div className="mx-1 h-0.5 flex-1 rounded" style={{ backgroundColor: isDone ? "var(--color-accent)" : "var(--color-border)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
