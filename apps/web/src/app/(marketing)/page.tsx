import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Sparkles } from "lucide-react";
import { images, solutions, stats, faqs } from "@/lib/content";
import { CATALOG } from "@/lib/api";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-50 via-white to-blue-50" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-medium text-teal-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> 宠物场景最全的商用 AI API
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
              一行接入
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                {" "}宠物全栈 AI 能力
              </span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              视频行为 · 图像识图 · 声音识别 · 健康测评 · 问诊对话。
              个人开发者买点数即用，大客户合同签约、子 Key 分项目管理。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700">
                浏览 API 目录 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/console" className="rounded-xl border border-teal-200 bg-white px-5 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50">
                客户控制台 Demo
              </Link>
              <Link href="/admin" className="rounded-xl border border-slate-300 bg-slate-800 px-5 py-3 text-sm font-medium text-white hover:bg-slate-900">
                运营后台 Demo
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border bg-white/80 p-3 text-center shadow-sm">
                  <p className="text-xl font-bold text-teal-700">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border shadow-2xl shadow-teal-900/10">
              <Image src={images.hero} alt="宠物与主人" width={600} height={450} className="h-auto w-full object-cover" priority />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl border bg-white p-4 shadow-lg md:-left-8">
              <p className="text-xs text-slate-500">今日平台调用</p>
              <p className="text-2xl font-bold text-slate-900">12,847</p>
              <p className="text-xs text-emerald-600">成功率 94.2%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">谁在使用宠生万象</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">覆盖宠物行业主流客户类型，统一 Key、统一账单</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map((s) => (
              <Link key={s.slug} href="/solutions" className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
                <div className="relative h-36 overflow-hidden">
                  <Image src={s.image} alt={s.title} fill className="object-cover transition group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">六类 API · 一个平台</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CATALOG.slice(0, 6).map((item) => (
              <div key={item.sku} className="flex gap-4 rounded-2xl border bg-white p-4 shadow-sm">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={item.image!} alt="" fill className="object-cover" />
                </div>
                <div>
                  <span className="text-xs font-medium text-teal-700">{item.sku}</span>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
          <div>
            <Building2 className="mb-4 h-10 w-10 text-teal-400" />
            <h2 className="text-2xl font-bold">大客户 · 合同签约</h2>
            <p className="mt-3 text-slate-300 leading-relaxed">
              企业管理员提交签约申请 → 运营审批 → 开通合同额度与子 Key。
              支持 SLA、专票、对公流程（Demo 模拟）。
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              {["年框合同 + 点数池", "子 Key 分项目配额", "组织级用量报表", "专属客户经理"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/console?persona=org" className="mt-6 inline-block rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-medium hover:bg-teal-400">
              企业客户控制台 Demo
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <Image src={images.api} alt="" width={500} height={360} className="h-full w-full object-cover opacity-90" />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold">常见问题</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-xl border bg-white p-5">
                <h3 className="font-medium text-slate-900">{f.q}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
