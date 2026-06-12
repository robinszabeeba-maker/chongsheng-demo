"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { CallsTrendChart, PointsBarChart, SkuBarChart } from "@/components/charts";
import {
  api,
  type Application,
  type Contract,
  type Customer,
  type Dashboard,
  type Order,
  type Pricing,
} from "@/lib/api";
import { ensureDemoAuth } from "@/lib/demo-auth";
import { formatPoints, formatPrice } from "@/lib/utils";

type Tab = "dashboard" | "customers" | "orders" | "contracts" | "applications" | "pricing";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await ensureDemoAuth("admin");
        const [d, c, o, ct, apps, p] = await Promise.all([
          api.adminDashboard(),
          api.adminCustomers(),
          api.adminOrders(),
          api.adminContracts(),
          api.adminApplications(),
          api.pricing(),
        ]);
        if (cancelled) return;
        setDash(d);
        setCustomers(c);
        setOrders(o);
        setContracts(ct);
        setApplications(apps);
        setPricing(p);
        setLoadError("");
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "加载失败";
          setLoadError(`运营后台加载失败：${msg}。请确认 API 已启动（./scripts/dev-api.sh）。`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function approve(id: number) {
    const res = await api.adminApproveApplication(id);
    alert(`已批准，合同号 ${res.contract_no}`);
    setApplications(await api.adminApplications());
    setContracts(await api.adminContracts());
    setDash(await api.adminDashboard());
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "平台概览" },
    { id: "customers", label: "客户管理" },
    { id: "orders", label: "全站订单" },
    { id: "contracts", label: "合同管理" },
    { id: "applications", label: "签约审批" },
    { id: "pricing", label: "刊例配置" },
  ];

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-8">
        <div className="max-w-lg text-center">
          <p className="text-red-400">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!dash) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-400">加载运营后台…</p>
      </div>
    );
  }

  return (
    <AdminLayout tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as Tab)}>
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi title="注册用户" value={String(dash.total_users)} />
            <Kpi title="企业客户" value={String(dash.total_orgs)} />
            <Kpi title="活跃合同" value={String(dash.active_contracts)} />
            <Kpi title="累计收入" value={formatPrice(dash.total_revenue_fen)} />
            <Kpi title="全平台调用" value={dash.total_calls.toLocaleString()} />
            <Kpi title="成功率" value={`${dash.success_rate}%`} />
            <Kpi title="消耗点数" value={formatPoints(dash.total_points_consumed)} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-5">
              <h3 className="mb-3 font-semibold">近 14 日全平台调用趋势</h3>
              <CallsTrendChart data={dash.calls_by_day} />
            </div>
            <div className="rounded-xl border bg-white p-5">
              <h3 className="mb-3 font-semibold">全平台 SKU 分布</h3>
              <SkuBarChart data={dash.calls_by_sku} />
            </div>
            <div className="rounded-xl border bg-white p-5 lg:col-span-2">
              <h3 className="mb-3 font-semibold">全平台点数消耗 by SKU</h3>
              <PointsBarChart data={dash.calls_by_sku} />
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h3 className="mb-3 font-semibold">最近全站订单</h3>
            <OrderTable orders={dash.recent_orders} />
          </div>
        </div>
      )}

      {tab === "customers" && (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="p-3">企业</th>
                <th className="p-3">行业</th>
                <th className="p-3">等级</th>
                <th className="p-3">联系人</th>
                <th className="p-3">成员</th>
                <th className="p-3">调用</th>
                <th className="p-3">消耗点数</th>
                <th className="p-3">合同</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.org_id} className="border-t">
                  <td className="p-3 font-medium">{c.org_name}</td>
                  <td className="p-3">{c.industry}</td>
                  <td className="p-3">{c.tier}</td>
                  <td className="p-3">{c.contact_name}</td>
                  <td className="p-3">{c.member_count}</td>
                  <td className="p-3">{c.total_calls}</td>
                  <td className="p-3">{formatPoints(c.points_consumed)}</td>
                  <td className="p-3">{c.active_contracts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "orders" && (
        <div className="rounded-xl border bg-white p-4">
          <OrderTable orders={orders} />
        </div>
      )}

      {tab === "contracts" && (
        <div className="space-y-3">
          {contracts.map((c) => (
            <div key={c.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-slate-500">{c.contract_no}</p>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-slate-600">{c.org_name}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-teal-700">{c.status}</p>
                  <p>{formatPrice(c.amount_cny_fen)}</p>
                  <p className="text-slate-500">
                    {formatPoints(c.points_used)} / {formatPoints(c.points_quota)} 点
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "applications" && (
        <div className="space-y-4">
          {applications.map((a) => (
            <div key={a.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{a.company_name}</p>
                  <p className="text-sm text-slate-600">
                    {a.org_name} · {a.contact_name}
                  </p>
                  <p className="mt-2 text-sm">{a.use_case}</p>
                  <p className="mt-1 text-sm text-teal-700">申请 {formatPoints(a.requested_points)} 点</p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      a.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {a.status}
                  </span>
                  {a.status === "pending" && (
                    <button
                      onClick={() => approve(a.id)}
                      className="mt-2 block rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
                    >
                      批准签约
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "pricing" && (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="text-slate-500">
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
                      onBlur={async (e) => {
                        await api.adminUpdatePricing(p.sku, +e.target.value);
                        setPricing(await api.pricing());
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="p-3">订单号</th>
            <th className="p-3">客户</th>
            <th className="p-3">类型</th>
            <th className="p-3">标题</th>
            <th className="p-3">金额</th>
            <th className="p-3">状态</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="p-3 font-mono text-xs">{o.order_no}</td>
              <td className="p-3">{o.org_name || o.user_email}</td>
              <td className="p-3">{o.order_type}</td>
              <td className="p-3">{o.title}</td>
              <td className="p-3">{formatPrice(o.amount_cny_fen)}</td>
              <td className="p-3">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
