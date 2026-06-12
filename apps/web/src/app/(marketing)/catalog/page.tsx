import Link from "next/link";
import { CATALOG } from "@/lib/api";

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">API 能力目录</h1>
      <p className="mt-2 text-slate-600">六条 SKU · 五类能力 · 统一 Key 与点数计费</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((item) => (
          <div
            key={item.sku}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
              {item.sku}
            </span>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
            <Link
              href={`/playground?sku=${item.sku}`}
              className="mt-4 inline-block text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              在 Playground 试用 →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
