const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type User = {
  id: number;
  email: string;
  role: string;
  points_balance: number;
  org_id: number | null;
};

export type ApiKey = {
  id: number;
  name: string;
  key_prefix: string;
  is_sub_key: boolean;
  quota_points: number | null;
  used_points: number;
  is_active: boolean;
};

export type Package = {
  id: number;
  name: string;
  points: number;
  price_cny_fen: number;
};

export type Pricing = {
  sku: string;
  unit: string;
  points_per_unit: number;
};

export type Usage = {
  id: number;
  sku: string;
  units: number;
  points_charged: number;
  success: boolean;
  error_code: string | null;
  created_at: string;
};

function authHeaders(token?: string | null): HeadersInit {
  const t = token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function request<T>(path: string, init?: RequestInit, token?: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(token), ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: (token?: string) => request<User>("/api/me", {}, token),
  packages: () => request<Package[]>("/api/packages"),
  purchase: (package_id: number) =>
    request<{ points_balance: number }>("/api/purchase", {
      method: "POST",
      body: JSON.stringify({ package_id }),
    }),
  pricing: () => request<Pricing[]>("/api/pricing"),
  keys: () => request<ApiKey[]>("/api/keys"),
  createKey: (body: { name: string; is_sub_key?: boolean; quota_points?: number | null }) =>
    request<ApiKey & { api_key: string }>("/api/keys", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  usage: () => request<Usage[]>("/api/keys/usage"),
  adminStats: () => request<{ total_users: number; total_calls: number; success_calls: number }>("/api/admin/stats"),
  adminUsers: () => request<User[]>("/api/admin/users"),
  adminUpdatePricing: (sku: string, points_per_unit: number) =>
    request<{ ok: boolean }>(`/api/admin/pricing/${sku}`, {
      method: "PATCH",
      body: JSON.stringify({ points_per_unit }),
    }),
  playground: (path: string, apiKey: string, body: unknown) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.detail || "API call failed");
      return data;
    }),
};

export const CATALOG = [
  {
    sku: "V01",
    name: "视频行为分析",
    desc: "犬猫短视频 → 行为标签与时间轴",
    path: "/v1/video/behavior/tasks",
    sample: { video_url: "https://example.com/dog.mp4", pet_type: "dog", duration_sec: 12.5 },
  },
  {
    sku: "I01",
    name: "图像识别",
    desc: "品种、情绪、皮肤、排泄物等识图",
    path: "/v1/vision/analyze",
    sample: { image_url: "https://example.com/pet.jpg", task_type: "breed" },
  },
  {
    sku: "A01",
    name: "声音识别",
    desc: "吠叫、呜咽与异常声音事件",
    path: "/v1/audio/analyze",
    sample: { audio_url: "https://example.com/bark.wav", task_type: "bark" },
  },
  {
    sku: "H01",
    name: "健康测评",
    desc: "问卷 → 健康倾向报告（非诊断）",
    path: "/v1/health/assessment",
    sample: { pet_profile: { species: "dog", age: 3 }, symptoms: ["vomiting"] },
  },
  {
    sku: "T01",
    name: "通用对话",
    desc: "宠物养护与知识问答",
    path: "/v1/chat/general",
    sample: { messages: [{ role: "user", content: "幼犬一天喂几次？" }] },
  },
  {
    sku: "T02",
    name: "问诊对话",
    desc: "多轮症状沟通与就医建议",
    path: "/v1/chat/consult",
    sample: { messages: [{ role: "user", content: "狗狗今天吐了两次" }] },
  },
];
