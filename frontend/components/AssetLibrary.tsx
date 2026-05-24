"use client";

import { useMemo, useState } from "react";
import type { Asset } from "@/lib/api";

const TYPE_ICONS: Record<string, string> = {
  script: "📝",
  storyboard: "🎨",
  footage: "🎬",
  audio: "🎵",
  graphic: "🖼️",
  thumbnail: "🖼️",
  export: "📦",
};

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + " KB";
  return bytes + " B";
}

export default function AssetLibrary({ assets }: { assets: Asset[] }) {
  const [filter, setFilter] = useState<string>("all");
  const types = useMemo(() => {
    const set = new Set(assets.map((a) => a.type));
    return ["all", ...Array.from(set)];
  }, [assets]);

  const filtered = useMemo(() => {
    if (filter === "all") return assets;
    return assets.filter((a) => a.type === filter);
  }, [assets, filter]);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Biblioteca de Assets
        </h2>
        <div className="flex gap-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="rounded-md px-2.5 py-1 text-xs transition"
              style={{
                backgroundColor: filter === t ? "var(--color-accent)" : "var(--color-border)",
                color: filter === t ? "#fff" : "var(--color-muted)",
              }}
            >
              {t === "all" ? "Todos" : t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3 hover:bg-[var(--color-border)]/30 transition"
          >
            <span className="text-xl">{TYPE_ICONS[a.type] || "📄"}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{a.name}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {formatSize(a.size_bytes)} · {a.uploaded_by || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
