"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExternalLink, FlaskConical, Home } from "lucide-react";

type Tab = { id: string; label: string; hide?: boolean };

type Props = {
  children: React.ReactNode;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  userEmail?: string;
  orgName?: string | null;
  pointsBalance?: number;
  personaSwitcher?: React.ReactNode;
};

export function ConsoleLayout({
  children,
  tabs,
  activeTab,
  onTabChange,
  userEmail,
  orgName,
  pointsBalance,
  personaSwitcher,
}: Props) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-teal-100 bg-white">
        <div className="border-b border-teal-50 px-5 py-5">
          <Link href="/" className="flex items-center gap-2 text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-xs text-white">
              宠
            </span>
            <div>
              <p className="text-sm font-semibold">宠生万象</p>
              <p className="text-[10px] text-teal-600">客户控制台</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {tabs
            .filter((t) => !t.hide)
            .map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left text-sm transition",
                  activeTab === t.id
                    ? "bg-teal-50 font-medium text-teal-800"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {t.label}
              </button>
            ))}
        </nav>

        <div className="space-y-1 border-t border-teal-50 p-3 text-sm">
          <Link
            href="/playground"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50"
          >
            <FlaskConical className="h-4 w-4" />
            API 调试
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            返回官网
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            运营后台（内部）
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">客户控制台</h1>
            <p className="text-xs text-slate-500">
              {userEmail}
              {orgName && <span className="ml-2 text-teal-700">· {orgName}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {personaSwitcher}
            {pointsBalance != null && (
              <div className="rounded-lg border border-teal-100 bg-teal-50/50 px-4 py-2 text-right">
                <p className="text-[10px] text-slate-500">剩余点数</p>
                <p className="text-lg font-bold text-teal-700">{pointsBalance.toLocaleString()}</p>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
