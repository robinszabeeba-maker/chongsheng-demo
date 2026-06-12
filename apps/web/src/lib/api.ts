const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type User = {
  id: number;
  email: string;
  role: string;
  points_balance: number;
  org_id: number | null;
  org_name?: string | null;
  org_industry?: string | null;
  org_tier?: string | null;
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

export type Order = {
  id: number;
  order_no: string;
  order_type: string;
  status: string;
  title: string;
  amount_cny_fen: number;
  points: number;
  org_name?: string | null;
  user_email?: string | null;
  created_at: string;
};

export type Contract = {
  id: number;
  contract_no: string;
  title: string;
  points_quota: number;
  points_used: number;
  amount_cny_fen: number;
  status: string;
  sla_level: string;
  org_name?: string | null;
  start_at?: string | null;
  end_at?: string | null;
};

export type UsageAnalytics = {
  calls_by_day: { date: string; total: number; success: number; points: number }[];
  calls_by_sku: { sku: string; count: number; points: number }[];
  total_calls: number;
  success_rate: number;
};

export type Dashboard = {
  total_users: number;
  total_orgs: number;
  active_contracts: number;
  total_calls: number;
  success_rate: number;
  total_revenue_fen: number;
  total_points_consumed: number;
  calls_by_day: { date: string; total: number; success: number; points: number }[];
  calls_by_sku: { sku: string; count: number; points: number }[];
  recent_orders: Order[];
};

export type Customer = {
  org_id: number;
  org_name: string;
  industry: string | null;
  tier: string;
  contact_name: string | null;
  member_count: number;
  total_calls: number;
  points_consumed: number;
  active_contracts: number;
};

export type Application = {
  id: number;
  company_name: string;
  contact_name: string;
  use_case: string;
  requested_points: number;
  status: string;
  org_name?: string | null;
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
    throw new Error(typeof err.detail === "string" ? err.detail : "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/api/auth/login", {
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
  orders: () => request<Order[]>("/api/orders"),
  usageAnalytics: () => request<UsageAnalytics>("/api/analytics/usage"),
  orgContract: () => request<Contract | null>("/api/org/contract"),
  orgContracts: () => request<Contract[]>("/api/org/contracts"),
  applyContract: (body: {
    company_name: string;
    contact_name: string;
    contact_phone: string;
    use_case: string;
    requested_points: number;
  }) =>
    request<{ ok: boolean; message: string }>("/api/org/contract/apply", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adminDashboard: () => request<Dashboard>("/api/admin/dashboard"),
  adminUsers: () => request<User[]>("/api/admin/users"),
  adminCustomers: () => request<Customer[]>("/api/admin/customers"),
  adminOrders: () => request<Order[]>("/api/admin/orders"),
  adminContracts: () => request<Contract[]>("/api/admin/contracts"),
  adminApplications: () => request<Application[]>("/api/admin/applications"),
  adminApproveApplication: (id: number) =>
    request<{ ok: boolean; contract_no: string }>(`/api/admin/applications/${id}/approve`, { method: "POST" }),
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
    desc: "上传犬猫短视频，AI 识别玩耍、休息、异常动作等行为标签，输出时间轴与摘要。适用于 App 拍视频、智能摄像头云端分析。",
    path: "/v1/video/behavior/tasks",
    sample: { video_url: "https://example.com/dog.mp4", pet_type: "dog", duration_sec: 12.5 },
    image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=600&q=80",
  },
  {
    sku: "I01",
    name: "图像识别",
    desc: "品种识别、表情情绪、皮肤异常、粪便/呕吐物性状等，同步返回结构化 JSON。",
    path: "/v1/vision/analyze",
    sample: { image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400", task_type: "breed" },
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
  },
  {
    sku: "A01",
    name: "声音识别",
    desc: "识别犬吠、呜咽、嚎叫及异常声音事件，适用于麦克风硬件与监控告警。",
    path: "/v1/audio/analyze",
    sample: { audio_url: "https://example.com/bark.wav", task_type: "bark" },
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80",
  },
  {
    sku: "H01",
    name: "健康测评",
    desc: "基于问卷与可选图像生成健康倾向报告，适用于保险初筛与 App 测评。非兽医诊断。",
    path: "/v1/health/assessment",
    sample: { pet_profile: { species: "dog", age: 3 }, symptoms: ["vomiting"] },
    image: "https://images.unsplash.com/photo-1628009365240-3a8f3aa8be7b?w=600&q=80",
  },
  {
    sku: "T01",
    name: "通用对话",
    desc: "宠物养护、训练、营养等知识问答，按 Token 计费。",
    path: "/v1/chat/general",
    sample: { messages: [{ role: "user", content: "幼犬一天喂几次？" }] },
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
  },
  {
    sku: "T02",
    name: "问诊对话",
    desc: "多轮症状沟通，给出观察/就医/紧急等级建议。新签问诊走本平台 SKU。",
    path: "/v1/chat/consult",
    sample: { messages: [{ role: "user", content: "狗狗今天吐了两次" }] },
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80",
  },
];
