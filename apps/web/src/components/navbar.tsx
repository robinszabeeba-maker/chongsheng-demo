"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/catalog", label: "API 目录" },
  { href: "/playground", label: "Playground" },
  { href: "/console", label: "控制台" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-teal-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-sm text-white shadow-sm">
            宠
          </span>
          <span>
            宠生万象
            <span className="ml-2 hidden text-xs font-normal text-slate-500 sm:inline">Pet AI API</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "transition hover:text-teal-700",
                pathname.startsWith(l.href) && "font-medium text-teal-700"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/admin" className="text-slate-400 hover:text-slate-600">
            管理
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            登录
          </Link>
          <Link
            href="/console"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
          >
            开始使用
          </Link>
        </div>
      </div>
    </header>
  );
}
