import Link from "next/link";

const packages = [
  { name: "体验包", points: "1,000", price: "¥12", desc: "个人试用" },
  { name: "入门包", points: "10,000", price: "¥99", desc: "独立开发者", popular: true },
  { name: "成长包", points: "50,000", price: "¥449", desc: "小型 App" },
  { name: "专业包", points: "200,000", price: "¥1,599", desc: "中型产品" },
];

const enterprise = [
  "年框合同 · 专属单价",
  "子 Key + 项目配额",
  "SLA 99.9%（可谈）",
  "普票 / 专票",
  "专属客户成功",
];

const pointsTable = [
  { api: "图像识别 I01", unit: "次", points: "15 点" },
  { api: "声音识别 A01", unit: "次", points: "20 点" },
  { api: "视频行为 V01", unit: "分钟", points: "350 点" },
  { api: "健康测评 H01", unit: "报告", points: "280 点" },
  { api: "通用对话 T01", unit: "1k tokens", points: "25 点" },
  { api: "问诊对话 T02", unit: "1k tokens", points: "40 点" },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">定价</h1>
      <p className="mt-2 text-slate-600">方案 E：自助通用点数包 + 企业合同议价（示例价格，Demo 用）</p>

      <h2 className="mt-12 text-xl font-semibold">自助点数包</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl border p-6 ${p.popular ? "border-teal-300 bg-teal-50/50 shadow-md ring-1 ring-teal-200" : "bg-white"}`}
          >
            {p.popular && <span className="text-xs font-medium text-teal-700">最受欢迎</span>}
            <h3 className="mt-1 text-lg font-bold">{p.name}</h3>
            <p className="mt-2 text-3xl font-bold text-teal-700">{p.points}<span className="text-base font-normal text-slate-500"> 点</span></p>
            <p className="text-xl text-slate-700">{p.price}</p>
            <p className="mt-2 text-sm text-slate-500">{p.desc}</p>
            <Link href="/console" className="mt-4 block rounded-lg border border-teal-200 py-2 text-center text-sm text-teal-700 hover:bg-teal-50">
              去购买
            </Link>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-xl font-semibold">企业合同</h2>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border bg-slate-900 p-8 text-white">
          <h3 className="text-lg font-bold">大客户专属</h3>
          <p className="mt-2 text-slate-300">年消费 ¥10 万起，按 API 类型议价，可折算等价点数池。</p>
          <ul className="mt-6 space-y-2 text-sm">
            {enterprise.map((e) => (
              <li key={e}>✓ {e}</li>
            ))}
          </ul>
          <Link href="/console" className="mt-8 inline-block rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-medium hover:bg-teal-400">
            提交签约申请
          </Link>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-semibold">点数换算表（100 点 = ¥1）</h3>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="pb-2">API</th><th>单位</th><th>消耗</th></tr>
            </thead>
            <tbody>
              {pointsTable.map((r) => (
                <tr key={r.api} className="border-t">
                  <td className="py-2">{r.api}</td>
                  <td>{r.unit}</td>
                  <td className="font-medium text-teal-700">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
