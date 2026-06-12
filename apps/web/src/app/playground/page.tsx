"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { api, CATALOG } from "@/lib/api";

function PlaygroundInner() {
  const params = useSearchParams();
  const initialSku = params.get("sku") || "I01";
  const [sku, setSku] = useState(initialSku);
  const [apiKey, setApiKey] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const item = CATALOG.find((c) => c.sku === sku) || CATALOG[1];

  useEffect(() => {
    setBody(JSON.stringify(item.sample, null, 2));
  }, [item]);

  async function run() {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const parsed = JSON.parse(body);
      const data = await api.playground(item.path, apiKey, parsed);
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "调用失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Playground</h1>
      <p className="mt-1 text-sm text-slate-600">粘贴 API Key，调试开放接口（Mock / 预留 HttpProvider）</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">选择 API</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            >
              {CATALOG.map((c) => (
                <option key={c.sku} value={c.sku}>
                  {c.sku} · {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">API Key</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs"
              placeholder="cs_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Request Body</label>
            <textarea
              className="mt-1 h-64 w-full rounded-lg border p-3 font-mono text-xs"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <button
            onClick={run}
            disabled={loading || !apiKey}
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "调用中…" : "发送请求"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div>
          <label className="text-sm text-slate-600">Response</label>
          <pre className="mt-1 h-[28rem] overflow-auto rounded-lg border bg-slate-900 p-4 text-xs text-emerald-100">
            {result || "等待响应…"}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={<p className="p-8 text-center">加载…</p>}>
        <PlaygroundInner />
      </Suspense>
    </div>
  );
}
