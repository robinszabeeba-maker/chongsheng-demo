"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { api, type Pricing, type User } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{ total_users: number; total_calls: number; success_calls: number } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    api
      .me()
      .then((u) => {
        if (u.role !== "platform_admin") throw new Error("not admin");
        return Promise.all([api.adminStats(), api.adminUsers(), api.pricing()]);
      })
      .then(([s, us, p]) => {
        setStats(s);
        setUsers(us);
        setPricing(p);
      })
      .catch(() => router.push("/console"));
  }, [router]);

  async function updatePrice(sku: string, val: string) {
    const n = parseInt(val, 10);
    if (Number.isNaN(n)) return;
    await api.adminUpdatePricing(sku, n);
    setPricing(await api.pricing());
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <p className="p-8 text-center text-slate-500">加载中…（需 admin@chongsheng.demo）</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["用户数", stats.total_users],
            ["总调用", stats.total_calls],
            ["成功调用", stats.success_calls],
          ].map(([label, val]) => (
            <div key={label as string} className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold">{val}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-semibold">刊例点数配置</h2>
        <div className="mt-4 overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-left">SKU</th>
                <th className="p-3 text-left">单位</th>
                <th className="p-3 text-left">点数/单位</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((p) => (
                <tr key={p.sku} className="border-t">
                  <td className="p-3 font-mono">{p.sku}</td>
                  <td className="p-3">{p.unit}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={p.points_per_unit}
                      className="w-24 rounded border px-2 py-1"
                      onBlur={(e) => updatePrice(p.sku, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 font-semibold">用户列表</h2>
        <div className="mt-4 overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-left">邮箱</th>
                <th className="p-3 text-left">角色</th>
                <th className="p-3 text-left">点数</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.points_balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
