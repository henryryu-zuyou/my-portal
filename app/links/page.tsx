"use client";
import { useState, useEffect, useMemo } from "react";

type House = { name: string; type: string; area: string; addr: string };

// 前端清單快取 key（B：開頁先畫上次的清單，使用者不用等）
// v2：清單改為「只含目前有空房的房源」，升版避免老用戶開頁先看到舊的滿租清單
const CACHE_KEY = "links_houses_v2";

// 房源名稱去掉結尾的「實驗室」
const stripName = (name: string) => name.replace(/實驗室\s*$/, "").trim() || name;

// 地址只截取到「路段」為止：保留「X段」，去掉門牌號/巷/弄/衖/樓
const roadSection = (addr: string) => {
  if (!addr) return addr;
  // 切在第一個「阿拉伯數字(後面不是段)」或 巷/弄/衖/號/樓 之前
  const m = addr.match(/[0-9０-９]+(?!段)|[巷弄衖號樓]/);
  const cut = m ? addr.slice(0, m.index) : addr;
  return cut.replace(/[\s,，]+$/, "").trim();
};

// 連結要帶入、並記錄到 Sheet/Chat/日曆的「詢問物件」格式：
// 去掉實驗室 +（路段）。例：大業二275（桃園市桃園區大業路二段）
const houseLabel = (h: House) => {
  const loc = roadSection(h.addr) || h.area;
  const base = stripName(h.name);
  return loc ? `${base}（${loc}）` : base;
};

export default function LinksPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);

    // 先畫上次抓到的清單（localStorage），開頁即顯示、不必等 API
    let hadCache = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const arr = JSON.parse(cached) as House[];
        if (Array.isArray(arr) && arr.length) {
          setHouses(arr);
          setLoading(false);
          hadCache = true;
        }
      }
    } catch {}

    // 背景抓最新；成功就覆蓋畫面並更新快取
    fetch("/api/houses")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setHouses(d.houses);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(d.houses)); } catch {}
        } else if (!hadCache) {
          setError(d.error || "讀取房源失敗");
        }
      })
      .catch(() => { if (!hadCache) setError("讀取房源失敗"); })
      .finally(() => setLoading(false));
  }, []);

  const makeLink = (label: string) =>
    `${origin}/inquiry?house=${encodeURIComponent(label)}`;

  const copy = async (h: House) => {
    await navigator.clipboard.writeText(makeLink(houseLabel(h)));
    setCopied(h.name);
    setTimeout(() => setCopied(""), 1500);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return houses;
    return houses.filter(
      h =>
        h.name.toLowerCase().includes(q) ||
        h.area.toLowerCase().includes(q) ||
        h.addr.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q)
    );
  }, [houses, query]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-1">🔗 詢問連結產生器</h1>
        <p className="text-sm text-gray-500 mb-4">
          選擇房源，產生帶標記的專屬詢問連結（資料來自 Ragic、目前有空房的房源）
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
              目前有空房 {houses.length} 筆{query ? `，符合 ${filtered.length} 筆` : ""}
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
                      連結帶入：{houseLabel(h)}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(h)}
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
