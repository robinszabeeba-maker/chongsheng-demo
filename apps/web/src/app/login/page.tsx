"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Demo 阶段无需登录，直接跳转客户控制台 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/console");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">正在进入客户控制台…</p>
    </div>
  );
}
