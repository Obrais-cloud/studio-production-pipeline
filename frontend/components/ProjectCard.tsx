"use client";

import type { Project } from "@/lib/api";

const STUDIO_COLORS: Record<string, string> = {
  Cinefactory: "var(--color-cinefactory)",
  "100 Sutton": "var(--color-sutton)",
  Cinexin: "var(--color-cinexin)",
};

const STATUS_LABELS: Record<string, string> = {
  idea: "Idea",
  scripting: "Guion",
  pre_production: "Pre-producción",
  production: "Producción",
  post_production: "Post-producción",
  review: "Revisión",
  published: "Publicado",
};

export default function ProjectCard({ project }: { project: Project }) {
  const color = STUDIO_COLORS[project.studio] || "#6c757d";
  const progress = project.tasks_total > 0 ? Math.round((project.tasks_completed / project.tasks_total) * 100) : 0;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:brightness-110">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: color + "22", color }}>
          {project.studio}
        </span>
        <span className="text-xs text-[var(--color-muted)]">{STATUS_LABELS[project.status] || project.status}</span>
      </div>
      <h3 className="mb-1 text-base font-semibold text-white">{project.title}</h3>
      {project.description && (
        <p className="mb-3 text-sm text-[var(--color-muted)] line-clamp-2">{project.description}</p>
      )}
      <div className="mb-3 flex items-center gap-4 text-xs text-[var(--color-muted)]">
        {project.budget !== undefined && <span>{project.budget.toLocaleString("es-ES")} €</span>}
        {project.deadline && (
          <span>📅 {new Date(project.deadline).toLocaleDateString("es-ES")}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs text-[var(--color-muted)]">{progress}%</span>
      </div>
      <div className="mt-2 text-xs text-[var(--color-muted)]">
        {project.tasks_completed}/{project.tasks_total} tareas · {project.assets_count} assets
      </div>
    </div>
  );
}
