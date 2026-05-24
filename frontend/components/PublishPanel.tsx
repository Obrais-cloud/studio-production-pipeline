"use client";

import { useEffect, useState } from "react";
import { api, type PlatformStatus, type PublishJob, type PublishRequest } from "@/lib/api";

const PRIVACY_OPTIONS = [
  { key: "private", label: "Privado" },
  { key: "unlisted", label: "No listado" },
  { key: "public", label: "Público" },
];

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
};

const STATUS_COLORS: Record<string, string> = {
  queued: "#6c757d",
  uploading: "#f59e0b",
  processing: "#3b82f6",
  live: "#22c55e",
  failed: "#ef4444",
};

export default function PublishPanel({ projectId }: { projectId?: string }) {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  const [jobs, setJobs] = useState<PublishJob[]>([]);
  const [form, setForm] = useState<PublishRequest>({
    project_id: projectId || "proj-1",
    platform: "youtube",
    title: "",
    description: "",
    tags: [],
    privacy: "private",
    video_path: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function refresh() {
    try {
      const [ps, js] = await Promise.all([api.getPlatformStatus(), api.getPublishJobs()]);
      setPlatforms(ps);
      setJobs(js);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, []);

  async function handlePublish() {
    if (!form.title || !form.video_path) {
      setError("Título y ruta del video son obligatorios");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const job =
        form.platform === "youtube"
          ? await api.publishToYouTube(form)
          : await api.publishToVimeo(form);
      setSuccess(`Publicación iniciada: ${job.title} en ${PLATFORM_LABELS[job.platform]}`);
      setJobs((prev) => [job, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de publicación");
    } finally {
      setLoading(false);
    }
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  }

  function removeTag(t: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));
  }

  const connectedPlatforms = platforms.filter((p) => p.connected);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Publicación Automática
      </h2>

      <div className="mb-4 flex gap-3">
        {platforms.map((p) => (
          <div
            key={p.platform}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
            style={{
              borderColor: p.connected ? "var(--color-success)" : "var(--color-border)",
              color: p.connected ? "var(--color-success)" : "var(--color-muted)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: p.connected ? "var(--color-success)" : "var(--color-muted)",
              }}
            />
            {PLATFORM_LABELS[p.platform]}
            {p.connected ? "✓" : "✗"}
          </div>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Plataforma</label>
          <select
            value={form.platform}
            onChange={(e) =>
              setForm((f) => ({ ...f, platform: e.target.value as "youtube" | "vimeo" }))
            }
            className="w-full rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none ring-1 ring-[var(--color-border)] focus:ring-[var(--color-accent)]"
          >
            {connectedPlatforms.map((p) => (
              <option key={p.platform} value={p.platform}>
                {PLATFORM_LABELS[p.platform]}
              </option>
            ))}
            {connectedPlatforms.length === 0 && (
              <option value="youtube">YouTube (no conectado)</option>
            )}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Privacidad</label>
          <select
            value={form.privacy}
            onChange={(e) => setForm((f) => ({ ...f, privacy: e.target.value }))}
            className="w-full rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none ring-1 ring-[var(--color-border)] focus:ring-[var(--color-accent)]"
          >
            {PRIVACY_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Título del video</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Título del video"
            className="w-full rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none ring-1 ring-[var(--color-border)] focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Descripción del video"
            rows={3}
            className="w-full rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none ring-1 ring-[var(--color-border)] focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-[var(--color-muted)]">
            Ruta del video (local)
          </label>
          <input
            value={form.video_path}
            onChange={(e) => setForm((f) => ({ ...f, video_path: e.target.value }))}
            placeholder="/path/to/video.mp4"
            className="w-full rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none ring-1 ring-[var(--color-border)] focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-[var(--color-muted)]">Tags</label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Añade tags y pulsa Enter"
              className="flex-1 rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none ring-1 ring-[var(--color-border)] focus:ring-[var(--color-accent)]"
            />
            <button
              onClick={addTag}
              className="rounded-lg bg-[var(--color-border)] px-3 py-2 text-sm text-white hover:bg-[var(--color-accent)]"
            >
              +
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-md bg-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]"
              >
                #{t}
                <button onClick={() => removeTag(t)} className="hover:text-white">
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-900/50 bg-red-900/20 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 rounded-lg border border-green-900/50 bg-green-900/20 px-3 py-2 text-xs text-green-300">
          {success}
        </div>
      )}

      <button
        onClick={handlePublish}
        disabled={loading || connectedPlatforms.length === 0}
        className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        {loading ? "Publicando..." : "Publicar video"}
      </button>

      {jobs.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Publicaciones recientes
          </h3>
          <div className="flex flex-col gap-2">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{job.title}</p>
                  <p className="text-[10px] text-[var(--color-muted)]">
                    {PLATFORM_LABELS[job.platform]} ·{" "}
                    {new Date(job.created_at).toLocaleString("es-ES")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={{
                      backgroundColor: (STATUS_COLORS[job.status] || "#6c757d") + "22",
                      color: STATUS_COLORS[job.status] || "#6c757d",
                    }}
                  >
                    {job.status}
                  </span>
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--color-accent)] hover:underline"
                    >
                      Ver →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
