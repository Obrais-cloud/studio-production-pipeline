"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import KanbanBoard from "@/components/KanbanBoard";
import Timeline from "@/components/Timeline";
import AssetLibrary from "@/components/AssetLibrary";
import ChatPanel from "@/components/ChatPanel";
import { api, type Project, type Asset, type PipelineItem } from "@/lib/api";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, assetCount: 0 });
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [projs, asts, pipe, dash] = await Promise.all([
        api.getProjects(),
        api.getAssets(),
        api.getPipeline(),
        api.getDashboard(),
      ]);
      setProjects(projs);
      setAssets(asts);
      setPipeline(pipe);
      setStats({
        total: dash.total_projects,
        active: dash.active_projects,
        completed: dash.completed_this_month,
        assetCount: dash.total_assets,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[#f3f4f6]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-[var(--color-muted)]">Proyectos</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-accent)]">{stats.active}</div>
            <div className="text-xs text-[var(--color-muted)]">Activos</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-success)]">{stats.completed}</div>
            <div className="text-xs text-[var(--color-muted)]">Este mes</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-warning)]">{stats.assetCount}</div>
            <div className="text-xs text-[var(--color-muted)]">Assets</div>
          </div>
        </div>

        <div className="mb-6">
          <Timeline pipeline={pipeline} />
        </div>

        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Proyectos</h2>
          <KanbanBoard projects={projects} />
        </div>

        <div className="mb-6">
          <AssetLibrary assets={assets} />
        </div>
      </main>
      <ChatPanel />
    </div>
  );
}
