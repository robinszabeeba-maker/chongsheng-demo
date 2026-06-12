"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { api, type ApiKey, type Package, type Usage, type User } from "@/lib/api";
import { formatPoints, formatPrice } from "@/lib/utils";

export default function ConsolePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [newKey, setNewKey] = useState("");
  const [tab, setTab] = useState<"overview" | "keys" | "billing" | "usage">("overview");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    Promise.all([api.me(), api.packages(), api.keys(), api.usage()])
      .then(([u, p, k, us]) => {
        setUser(u);
        setPackages(p);
        setKeys(k);
        setUsage(us);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  async function buy(pkg: Package) {
    const res = await api.purchase(pkg.id);
    setUser((u) => (u ? { ...u, points_balance: res.points_balance } : u));
    alert(`模拟支付成功，已充值 ${formatPoints(pkg.points)} 点`);
  }

  async function createKey(isSub: boolean) {
    const res = await api.createKey({
      name: isSub ? "子 Key" : "默认 Key",
      is_sub_key: isSub,
      quota_points: isSub ? 5000 : null,
    });
    setNewKey(res.api_key);
    setKeys(await api.keys());
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <p className="p-8 text-center text-slate-500">加载中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">控制台</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <div className="rounded-xl border border-teal-200 bg-white px-5 py-3 shadow-sm">
            <p className="text-xs text-slate-500">剩余点数</p>
            <p className="text-2xl font-bold text-teal-700">{formatPoints(user.points_balance)}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2 border-b text-sm">
          {(["overview", "keys", "billing", "usage"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-4 py-2 ${tab === t ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500"}`}
            >
              {{ overview: "总览", keys: "API Key", billing: "购点数包", usage: "用量" }[t]}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">角色</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">API Key 数量</p>
              <p className="font-medium">{keys.length}</p>
            </div>
            <div className="rounded-xl border bg-white p-5">
              <Link href="/playground" className="text-teal-700 hover:underline">
                打开 Playground →
              </Link>
            </div>
          </div>
        )}

        {tab === "keys" && (
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <button onClick={() => createKey(false)} className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white">
                创建主 Key
              </button>
              {user.role === "org_admin" && (
                <button onClick={() => createKey(true)} className="rounded-lg border px-4 py-2 text-sm">
                  创建子 Key（配额 5000 点）
                </button>
              )}
            </div>
            {newKey && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                <p className="font-medium text-amber-900">请立即复制 Key（仅显示一次）</p>
                <code className="mt-2 block break-all text-xs">{newKey}</code>
              </div>
            )}
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-3">名称</th>
                    <th className="p-3">前缀</th>
                    <th className="p-3">子 Key</th>
                    <th className="p-3">配额/已用</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-t">
                      <td className="p-3">{k.name}</td>
                      <td className="p-3 font-mono text-xs">{k.key_prefix}…</td>
                      <td className="p-3">{k.is_sub_key ? "是" : "否"}</td>
                      <td className="p-3">
                        {k.quota_points != null ? `${k.used_points}/${k.quota_points}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "billing" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <div key={p.id} className="rounded-xl border bg-white p-5">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 text-2xl font-bold text-teal-700">{formatPoints(p.points)} 点</p>
                <p className="text-sm text-slate-500">{formatPrice(p.price_cny_fen)}</p>
                <button
                  onClick={() => buy(p)}
                  className="mt-4 w-full rounded-lg border border-teal-200 py-2 text-sm text-teal-700 hover:bg-teal-50"
                >
                  模拟支付
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "usage" && (
          <div className="mt-6 overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">扣点</th>
                  <th className="p-3">成功</th>
                  <th className="p-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 font-mono">{u.sku}</td>
                    <td className="p-3">{u.points_charged}</td>
                    <td className="p-3">{u.success ? "✓" : "✗"}</td>
                    <td className="p-3 text-xs text-slate-500">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
