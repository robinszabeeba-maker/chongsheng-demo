"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@chongsheng.demo");
  const [password, setPassword] = useState("Demo123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { access_token } = await api.login(email, password);
      localStorage.setItem("token", access_token);
      router.push("/console");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50/40">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">登录控制台</h1>
        <p className="mt-2 text-sm text-slate-600">Demo 期：邮箱 + 密码</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <label className="text-sm text-slate-600">邮箱</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-teal-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">密码</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-teal-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          企业 demo：org@chongsheng.demo · 超管：admin@chongsheng.demo
        </p>
        <Link href="/" className="mt-6 text-center text-sm text-teal-700 hover:underline">
          返回首页
        </Link>
      </div>
    </div>
  );
}
