import Link from "next/link";
import { ArrowRight, Shield, Sparkles, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
              <Sparkles className="h-3.5 w-3.5" /> 宠物场景商用 AI API
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              宠物场景最全的
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                {" "}商用 AI API
              </span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              视频行为、图像、声音、健康测评、问诊对话 — 一个 Key、一套账单、统一点数。
              仅成功扣费，ToB 合同与发票就绪。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700"
              >
                浏览 API 目录 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/playground"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50/50"
              >
                打开 Playground
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Demo 账号：demo@chongsheng.demo / Demo123!
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">控制台预览</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">10,000 点</span>
            </div>
            <div className="space-y-3 font-mono text-xs text-slate-600">
              <div className="rounded-lg bg-slate-50 p-3">POST /v1/vision/analyze → 200 · -15 点</div>
              <div className="rounded-lg bg-slate-50 p-3">POST /v1/chat/consult → 200 · -40 点</div>
              <div className="rounded-lg bg-red-50 p-3 text-red-700">POST /v1/vision/analyze → 400 · 0 点</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "五类 API 一站式", desc: "视频 / 图像 / 声音 / 测评 / 对话统一接入" },
            { icon: Shield, title: "商用闭环", desc: "点数包、子 Key、失败不扣费、管理后台" },
            { icon: Sparkles, title: "宠物垂直", desc: "自研场景模型，非通用云拼装" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-100 p-6">
              <Icon className="mb-3 h-8 w-8 text-teal-600" />
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
