"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ConsoleLayout } from "@/components/console-layout";
import { CallsTrendChart, SkuBarChart } from "@/components/charts";
import {
  api,
  type ApiKey,
  type Contract,
  type Order,
  type Package,
  type Usage,
  type UsageAnalytics,
  type User,
} from "@/lib/api";
import { ensureDemoAuth, PERSONA_LABELS, type DemoPersona } from "@/lib/demo-auth";
import { formatPoints, formatPrice } from "@/lib/utils";

type Tab = "overview" | "usage" | "keys" | "billing" | "orders" | "contract";

function ConsoleInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const persona: DemoPersona = searchParams.get("persona") === "org" ? "org" : "user";

  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [packages, setPackages] = useState<Package[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [newKey, setNewKey] = useState("");
  const [loadError, setLoadError] = useState("");
  const [applyForm, setApplyForm] = useState({
    company_name: "",
    contact_name: "",
    contact_phone: "",
    use_case: "",
    requested_points: 200000,
  });

  const isEnterprise = user?.role === "org_admin";

  useEffect(() => {
    let cancelled = false;
    setUser(null);
    setLoadError("");

    (async () => {
      try {
        await ensureDemoAuth(persona);
        const [u, p, k, us, ord, an, ct] = await Promise.all([
          api.me(),
          api.packages(),
          api.keys(),
          api.usage(),
          api.orders(),
          api.usageAnalytics(),
          api.orgContracts().catch(() => []),
        ]);
        if (cancelled) return;
        setUser(u);
        setPackages(p);
        setKeys(k);
        setUsage(us);
        setOrders(ord);
        setAnalytics(an);
        setContracts(ct);
        setApplyForm((f) => ({
          ...f,
          company_name: u.org_name || "",
          contact_name: "陈总监",
          contact_phone: "13600004444",
        }));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "加载失败");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [persona]);

  async function buy(pkg: Package) {
    const res = await api.purchase(pkg.id);
    setUser((u) => (u ? { ...u, points_balance: res.points_balance } : u));
    setOrders(await api.orders());
    alert(`模拟支付成功，已充值 ${formatPoints(pkg.points)} 点`);
  }

  async function createKey(isSub: boolean) {
    const res = await api.createKey({
      name: isSub ? "子项目 Key" : "默认 Key",
      is_sub_key: isSub,
      quota_points: isSub ? 10000 : null,
    });
    setNewKey(res.api_key);
    setKeys(await api.keys());
  }

  async function submitApply() {
    const res = await api.applyContract(applyForm);
    alert(res.message);
  }

  function switchPersona(next: DemoPersona) {
    router.push(next === "org" ? "/console?persona=org" : "/console");
  }

  const tabs: { id: Tab; label: string; hide?: boolean }[] = [
    { id: "overview", label: "总览" },
    { id: "usage", label: "我的用量" },
    { id: "keys", label: "API Key" },
    { id: "billing", label: "购点数包" },
    { id: "orders", label: "我的订单" },
    { id: "contract", label: "企业签约", hide: !isEnterprise },
  ];

  const personaSwitcher = (
    <div className="flex rounded-lg border bg-white p-0.5 text-xs">
      {(["user", "org"] as const).map((p) => (
        <button
          key={p}
          onClick={() => switchPersona(p)}
          className={`rounded-md px-3 py-1.5 transition ${
            persona === p ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {PERSONA_LABELS[p]}
        </button>
      ))}
    </div>
  );

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md text-center">
          <p className="text-red-600">{loadError}</p>
          <p className="mt-2 text-sm text-slate-500">请确认 API 已启动：./scripts/dev-api.sh</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">加载客户控制台…</p>
      </div>
    );
  }

  return (
    <ConsoleLayout
      tabs={tabs}
      activeTab={tab}
      onTabChange={(id) => setTab(id as Tab)}
      userEmail={user.email}
      orgName={user.org_name}
      pointsBalance={user.points_balance}
      personaSwitcher={personaSwitcher}
    >
      {tab === "overview" && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="账号类型" value={isEnterprise ? "企业客户" : "个人开发者"} />
          <StatCard label="API Key 数量" value={String(keys.length)} />
          <StatCard label="我的累计调用" value={String(analytics?.total_calls ?? 0)} />
          <StatCard label="调用成功率" value={`${analytics?.success_rate ?? 0}%`} />
          {isEnterprise && contracts[0] && (
            <div className="md:col-span-4 rounded-xl border bg-white p-5">
              <h3 className="font-semibold">当前企业合同</h3>
              <p className="mt-1 text-sm text-slate-600">{contracts[0].title}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-teal-500"
                  style={{
                    width: `${Math.min(100, (contracts[0].points_used / contracts[0].points_quota) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                已用 {formatPoints(contracts[0].points_used)} / {formatPoints(contracts[0].points_quota)} 点
              </p>
            </div>
          )}
          <Link href="/playground" className="md:col-span-4 text-sm text-teal-700 hover:underline">
            → 打开 Playground 调试 API
          </Link>
        </div>
      )}

      {tab === "usage" && analytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 font-semibold">近 30 日我的调用趋势</h3>
            <CallsTrendChart data={analytics.calls_by_day} />
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 font-semibold">我的 SKU 调用分布</h3>
            <SkuBarChart data={analytics.calls_by_sku} />
          </div>
          <div className="overflow-hidden rounded-xl border bg-white lg:col-span-2">
            <h3 className="border-b p-4 font-semibold">调用明细（最近 100 条）</h3>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-3 text-left">时间</th>
                    <th className="p-3 text-left">SKU</th>
                    <th className="p-3 text-left">扣点</th>
                    <th className="p-3 text-left">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-3 text-xs text-slate-500">{u.created_at.slice(0, 19)}</td>
                      <td className="p-3 font-mono">{u.sku}</td>
                      <td className="p-3">{u.points_charged}</td>
                      <td className="p-3">
                        {u.success ? (
                          <span className="text-emerald-600">成功</span>
                        ) : (
                          <span className="text-red-600">{u.error_code || "失败"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "keys" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => createKey(false)} className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white">
              创建主 Key
            </button>
            {isEnterprise && (
              <button onClick={() => createKey(true)} className="rounded-lg border bg-white px-4 py-2 text-sm">
                创建子 Key（配额 1 万点）
              </button>
            )}
          </div>
          {newKey && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-medium text-amber-900">请立即复制 Key</p>
              <code className="mt-2 block break-all text-xs">{newKey}</code>
            </div>
          )}
          <KeyTable keys={keys} />
        </div>
      )}

      {tab === "billing" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {tab === "orders" && (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 text-left">订单号</th>
                <th className="p-3 text-left">类型</th>
                <th className="p-3 text-left">标题</th>
                <th className="p-3 text-left">金额</th>
                <th className="p-3 text-left">点数</th>
                <th className="p-3 text-left">时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{o.order_no}</td>
                  <td className="p-3">{o.order_type}</td>
                  <td className="p-3">{o.title}</td>
                  <td className="p-3">{formatPrice(o.amount_cny_fen)}</td>
                  <td className="p-3">{formatPoints(o.points)}</td>
                  <td className="p-3 text-xs text-slate-500">{o.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "contract" && isEnterprise && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6">
            <h3 className="font-semibold">我的合同</h3>
            {contracts.map((c) => (
              <div key={c.id} className="mt-4 rounded-lg border p-4">
                <p className="font-mono text-xs text-slate-500">{c.contract_no}</p>
                <p className="font-medium">{c.title}</p>
                <p className="mt-2 text-sm">
                  状态：<span className="text-teal-700">{c.status}</span> · SLA {c.sla_level}
                </p>
                <p className="text-sm text-slate-600">
                  额度 {formatPoints(c.points_used)} / {formatPoints(c.points_quota)} 点
                </p>
                <p className="text-sm text-slate-500">合同金额 {formatPrice(c.amount_cny_fen)}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-white p-6">
            <h3 className="font-semibold">申请新签约 / 扩容</h3>
            <p className="mt-1 text-sm text-slate-500">提交后由运营审核，1 个工作日内联系</p>
            <div className="mt-4 space-y-3 text-sm">
              {(["company_name", "contact_name", "contact_phone", "use_case"] as const).map((field) => (
                <div key={field}>
                  <label className="text-slate-600">{field}</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={applyForm[field]}
                    onChange={(e) => setApplyForm({ ...applyForm, [field]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="text-slate-600">申请点数</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={applyForm.requested_points}
                  onChange={(e) => setApplyForm({ ...applyForm, requested_points: +e.target.value })}
                />
              </div>
              <button onClick={submitApply} className="w-full rounded-lg bg-teal-600 py-2.5 text-white hover:bg-teal-700">
                提交签约申请
              </button>
            </div>
          </div>
        </div>
      )}
    </ConsoleLayout>
  );
}

export default function ConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-500">加载客户控制台…</p>
        </div>
      }
    >
      <ConsoleInner />
    </Suspense>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function KeyTable({ keys }: { keys: ApiKey[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-3 text-left">名称</th>
            <th className="p-3 text-left">前缀</th>
            <th className="p-3 text-left">子 Key</th>
            <th className="p-3 text-left">配额</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k.id} className="border-t">
              <td className="p-3">{k.name}</td>
              <td className="p-3 font-mono text-xs">{k.key_prefix}…</td>
              <td className="p-3">{k.is_sub_key ? "是" : "否"}</td>
              <td className="p-3">{k.quota_points != null ? `${k.used_points}/${k.quota_points}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
