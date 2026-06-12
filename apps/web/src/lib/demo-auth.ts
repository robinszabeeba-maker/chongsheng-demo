import { api } from "@/lib/api";

export type DemoPersona = "user" | "org" | "admin";

const ACCOUNTS: Record<DemoPersona, { email: string; password: string }> = {
  user: { email: "demo@chongsheng.demo", password: "Demo123!" },
  org: { email: "org@chongsheng.demo", password: "Org123!" },
  admin: { email: "admin@chongsheng.demo", password: "Admin123!" },
};

/** Demo 演示：自动以指定身份换取 token，无需手动登录 */
export async function ensureDemoAuth(persona: DemoPersona): Promise<void> {
  if (typeof window === "undefined") return;

  const stored = sessionStorage.getItem("demo_persona");
  if (stored === persona && localStorage.getItem("token")) return;

  const { email, password } = ACCOUNTS[persona];
  const { access_token } = await api.login(email, password);
  localStorage.setItem("token", access_token);
  sessionStorage.setItem("demo_persona", persona);
}

export const PERSONA_LABELS: Record<DemoPersona, string> = {
  user: "个人开发者",
  org: "企业客户",
  admin: "平台运营",
};
