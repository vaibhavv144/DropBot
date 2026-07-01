export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

// URL of the hosted widget loader (embed.js). In production point this at your
// CDN, e.g. https://cdn.yourdomain.com/embed.js. Defaults to the local dev
// widget server so copied snippets work out of the box during development.
export const WIDGET_SRC =
  process.env.NEXT_PUBLIC_WIDGET_SRC || "http://localhost:5173/embed.js";

/** The one-line embed snippet a site owner pastes into their website. */
export function embedSnippet(publicKey: string): string {
  return `<script src="${WIDGET_SRC}" data-bot-id="${publicKey}" data-api="${API_BASE}" defer></script>`;
}

const TOKEN_KEY = "chatbot_dashboard_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Bot {
  id: string;
  public_key: string;
  name: string;
  allowed_domains: string;
  system_prompt: string;
  answer_mode: string;
  theme_color: string;
  greeting: string;
  position: string;
  launcher_text: string;
  suggested_questions: string;
  created_at: string;
}

export interface Source {
  id: string;
  kind: string;
  location: string;
  status: string;
  detail: string;
  pages_count: number;
  chunks_count: number;
  auto_sync: number;
  sync_interval_hours: number;
  last_synced_at: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  rating: number;
  is_fallback: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  visitor_id: string;
  created_at: string;
  messages: ChatMessage[];
}

export interface Analytics {
  days: number;
  total_conversations: number;
  total_messages: number;
  visitor_messages: number;
  answered: number;
  unanswered: number;
  unanswered_rate: number;
  thumbs_up: number;
  thumbs_down: number;
  daily: { date: string; conversations: number; messages: number }[];
  top_questions: { question: string; count: number }[];
  recent_downvoted: { question: string; answer: string; created_at: string }[];
}

export const api = {
  signup: (email: string, password: string) =>
    request<{ access_token: string }>(
      "/api/auth/signup",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false
    ),
  login: (email: string, password: string) =>
    request<{ access_token: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false
    ),
  listBots: () => request<Bot[]>("/api/bots"),
  createBot: (name: string, allowed_domains: string) =>
    request<Bot>("/api/bots", {
      method: "POST",
      body: JSON.stringify({ name, allowed_domains }),
    }),
  getBot: (id: string) => request<Bot>(`/api/bots/${id}`),
  updateBot: (id: string, patch: Partial<Bot>) =>
    request<Bot>(`/api/bots/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  listSources: (botId: string) =>
    request<Source[]>(`/api/bots/${botId}/sources`),
  addUrl: (botId: string, url: string, max_pages?: number) =>
    request<Source>(`/api/bots/${botId}/sources/url`, {
      method: "POST",
      body: JSON.stringify({ url, max_pages }),
    }),
  addFile: (botId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<Source>(`/api/bots/${botId}/sources/file`, {
      method: "POST",
      body: fd,
    });
  },
  deleteSource: (botId: string, sourceId: string) =>
    request<void>(`/api/bots/${botId}/sources/${sourceId}`, {
      method: "DELETE",
    }),
  updateSourceSync: (
    botId: string,
    sourceId: string,
    auto_sync: number,
    sync_interval_hours: number
  ) =>
    request<Source>(`/api/bots/${botId}/sources/${sourceId}/sync`, {
      method: "PATCH",
      body: JSON.stringify({ auto_sync, sync_interval_hours }),
    }),
  resyncSource: (botId: string, sourceId: string) =>
    request<Source>(`/api/bots/${botId}/sources/${sourceId}/resync`, {
      method: "POST",
    }),

  listConversations: (botId: string) =>
    request<Conversation[]>(`/api/bots/${botId}/conversations`),

  getAnalytics: (botId: string, days = 30) =>
    request<Analytics>(`/api/bots/${botId}/analytics?days=${days}`),
};
