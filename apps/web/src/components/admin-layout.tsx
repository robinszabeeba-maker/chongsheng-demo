"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, Shield } from "lucide-react";

type Tab = { id: string; label: string };

type Props = {
  children: React.ReactNode;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
};

export function AdminLayout({ children, tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-700 bg-slate-950">
        <div className="border-b border-slate-800 px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-xs text-white">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">宠生万象</p>
              <p className="text-[10px] text-amber-400/90">运营中心 · 内部</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={cn(
                "w-full rounded-lg px-3 py-2.5 text-left text-sm transition",
                activeTab === t.id
                  ? "bg-slate-800 font-medium text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-900 hover:text-slate-300"
          >
            <Home className="h-4 w-4" />
            返回官网
          </Link>
          <p className="mt-3 px-3 text-[10px] leading-relaxed text-slate-600">
            本后台仅供企业内部运营使用，管理全平台客户、订单与刊例。
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-white">运营后台</h1>
            <p className="text-xs text-slate-400">平台数据 · 客户 · 合同 · 审批</p>
          </div>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
            Demo 演示模式
          </span>
        </header>
        <main className="flex-1 overflow-auto bg-slate-100 p-6">{children}</main>
      </div>
    </div>
  );
}
