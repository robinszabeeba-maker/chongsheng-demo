import { Navbar } from "@/components/navbar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <Navbar />
      <main>{children}</main>
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        宠生万象 · Demo 验证环境 · 非生产系统
      </footer>
    </div>
  );
}
