import Image from "next/image";
import Link from "next/link";
import { solutions } from "@/lib/content";

export default function SolutionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">行业解决方案</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        宠生万象覆盖宠物 App、智能硬件、保险金融、连锁医院等场景。按需组合 API，快速嵌入现有产品。
      </p>
      <div className="mt-12 space-y-12">
        {solutions.map((s, i) => (
          <div key={s.slug} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <h2 className="text-2xl font-bold text-slate-900">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{s.desc}</p>
              <ul className="mt-4 space-y-2">
                {s.apis.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-teal-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> {a}
                  </li>
                ))}
              </ul>
              <Link href="/playground" className="mt-6 inline-block text-sm font-medium text-teal-700 hover:underline">
                在 Playground 试用 →
              </Link>
            </div>
            <div className={`relative h-64 overflow-hidden rounded-2xl shadow-lg ${i % 2 === 1 ? "md:order-1" : ""}`}>
              <Image src={s.image} alt={s.title} fill className="object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
