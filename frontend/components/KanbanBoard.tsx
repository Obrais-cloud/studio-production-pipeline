"use client";

import { useMemo } from "react";
import type { Project } from "@/lib/api";
import ProjectCard from "./ProjectCard";

const COLUMNS = [
  { key: "idea", label: "Idea", color: "#6c757d" },
  { key: "scripting", label: "Guion", color: "#8b5cf6" },
  { key: "pre_production", label: "Pre-prod", color: "#3b82f6" },
  { key: "production", label: "Producción", color: "#f59e0b" },
  { key: "post_production", label: "Post-prod", color: "#f97316" },
  { key: "review", label: "Revisión", color: "#22c55e" },
  { key: "published", label: "Publicado", color: "#10b981" },
];

export default function KanbanBoard({ projects }: { projects: Project[] }) {
  const grouped = useMemo(() => {
    const map: Record<string, Project[]> = {};
    for (const col of COLUMNS) map[col.key] = [];
    for (const p of projects) {
      if (map[p.status]) map[p.status].push(p);
    }
    return map;
  }, [projects]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {COLUMNS.map((col) => (
        <div key={col.key} className="flex w-72 min-w-[18rem] flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: col.color }}>{col.label}</span>
            <span className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
              {grouped[col.key]?.length || 0}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {(grouped[col.key] || []).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
