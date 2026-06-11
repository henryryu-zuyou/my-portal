"use client";
import { useState, useEffect, useMemo } from "react";

type House = { name: string; type: string; area: string };

export default function LinksPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/houses")
      .then(r => r.json())
      .then(d => {
        if (d.success) setHouses(d.houses);
        else setError(d.error || "讀取房源失敗");
      })
      .catch(() => setError("讀取房源失敗"))
      .finally(() => setLoading(false));
  }, []);

  const makeLink = (name: string) =>
    `${origin}/inquiry?house=${encodeURIComponent(name)}`;

  const copy = async (name: string) => {
    await navigator.clipboard.writeText(makeLink(name));
    setCopied(name);
    setTimeout(() => setCopied(""), 1500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return houses;
    return houses.filter(
      h =>
        h.name.toLowerCase().includes(q) ||
        h.area.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q)
    );
  }, [houses, query]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-1">🔗 詢問連結產生器</h1>
        <p className="text-sm text-gray-500 mb-4">
          選擇房源，產生帶標記的專屬詢問連結（資料來自 Ragic 已上架房源）
        </p>

        {/* 搜尋框 */}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜尋房源名稱、地區或型態…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {loading && <p className="text-sm text-gray-400 text-center py-6">讀取房源中…</p>}
        {error && (
          <p className="text-sm text-red-500 text-center py-6">⚠️ {error}</p>
        )}

        {!loading && !error && (
          <>
            <p className="text-xs text-gray-400 mb-2">
              已上架 {houses.length} 筆{query ? `，符合 ${filtered.length} 筆` : ""}
            </p>
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filtered.map(h => (
                <li
                  key={h.name}
                  className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">🏠 {h.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {[h.area, h.type].filter(Boolean).join("・")}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(h.name)}
                    className="shrink-0 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 transition"
                  >
                    {copied === h.name ? "已複製 ✓" : "複製連結"}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="text-sm text-gray-400 text-center py-6">查無符合的房源</li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
