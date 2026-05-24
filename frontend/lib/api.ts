const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchJSON<T>(path: string, opts?: RequestInit, retries = 2): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return fetchJSON<T>(path, opts, retries - 1);
    }
    throw err;
  }
}

export const api = {
  getProjects: (qs?: string) => fetchJSON<Project[]>(`/projects${qs ? "?" + qs : ""}`),
  getProject: (id: string) => fetchJSON<Project>(`/projects/${id}`),
  createProject: (body: ProjectCreate) =>
    fetchJSON<Project>("/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  getPipeline: () => fetchJSON<PipelineItem[]>("/production/pipeline"),
  getDashboard: () => fetchJSON<DashboardSummary>("/production/dashboard"),
  getAssets: (qs?: string) => fetchJSON<Asset[]>(`/assets${qs ? "?" + qs : ""}`),
  getAssetTypes: () => fetchJSON<{ type: string; label: string }[]>("/assets/types"),
  chat: (message: string) =>
    fetchJSON<ChatResponse>("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }),
  getPlatformStatus: () => fetchJSON<PlatformStatus[]>("/publish/status/platforms"),
  publishToYouTube: (body: PublishRequest) =>
    fetchJSON<PublishJob>("/publish/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  publishToVimeo: (body: PublishRequest) =>
    fetchJSON<PublishJob>("/publish/vimeo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  getPublishJobs: (qs?: string) => fetchJSON<PublishJob[]>(`/publish/jobs${qs ? "?" + qs : ""}`),
};

export interface Project {
  id: string;
  title: string;
  studio: string;
  description?: string;
  status: string;
  budget?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  tasks_completed: number;
  tasks_total: number;
  assets_count: number;
}

export interface ProjectCreate {
  title: string;
  studio: string;
  description?: string;
  status?: string;
  budget?: number;
  deadline?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  status: string;
  assignee?: string;
  due_date?: string;
  created_at: string;
}

export interface PipelineItem {
  phase: string;
  status: string;
  progress_pct: number;
  tasks: Task[];
  deliverables: string[];
}

export interface DashboardSummary {
  total_projects: number;
  active_projects: number;
  completed_this_month: number;
  total_assets: number;
  pipeline: PipelineItem[];
  upcoming_deadlines: Project[];
}

export interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: string;
  url?: string;
  size_bytes?: number;
  created_at: string;
  uploaded_by?: string;
}

export interface ChatResponse {
  reply: string;
  suggested_actions: string[];
}

export interface PublishRequest {
  project_id: string;
  platform: "youtube" | "vimeo";
  title: string;
  description?: string;
  tags: string[];
  privacy: string;
  video_path: string;
  thumbnail_path?: string;
}

export interface PublishJob {
  id: string;
  project_id: string;
  platform: string;
  title: string;
  status: string;
  external_id?: string;
  url?: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface PlatformStatus {
  platform: string;
  connected: boolean;
  account_name?: string;
  error?: string;
}
