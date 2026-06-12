import Image from "next/image";
import Link from "next/link";
import { CATALOG } from "@/lib/api";

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">API 能力目录</h1>
      <p className="mt-2 text-slate-600">六条 SKU · 五类能力 · 统一 Key 与点数计费 · 仅成功扣费</p>
      <div className="mt-10 grid gap-8">
        {CATALOG.map((item) => (
          <div key={item.sku} className="grid overflow-hidden rounded-2xl border bg-white shadow-sm md:grid-cols-3">
            <div className="relative h-48 md:h-auto md:min-h-[200px]">
              <Image src={item.image!} alt={item.name} fill className="object-cover" />
            </div>
            <div className=" p-6 md:col-span-2">
              <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">{item.sku}</span>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{item.name}</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{item.desc}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/playground?sku=${item.sku}`} className="text-sm font-medium text-teal-700 hover:underline">
                  Playground 试用 →
                </Link>
                <span className="text-xs text-slate-400 font-mono">{item.path}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
