"use client";
import { useState, useEffect, useMemo } from "react";

type House = { name: string; type: string; area: string; addr: string; vacant: number };

// 前端清單快取 key（B：開頁先畫上次的清單，使用者不用等）
// v3：House 多了 vacant（空房間數），升版避免舊快取顯示「剩 undefined 間空房」
// v4：滿租房源也列出，升版避免舊快取只有空房清單
const CACHE_KEY = "links_houses_v4";

// 房源名稱去掉結尾的「實驗室」
const stripName = (name: string) => name.replace(/實驗室\s*$/, "").trim() || name;

// 連結要帶入、並記錄到 Sheet/Chat/日曆的「詢問物件」：只帶房源名稱（去掉實驗室）。
// 例：丞石淳。不帶地址，讓貼到 LINE 的連結保持短、且不含全形括號（避免被截斷）
const houseLabel = (h: House) => stripName(h.name);

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

  // 中文直接保留（貼上時好讀），只編碼會破壞網址的符號
  const makeLink = (label: string) =>
    `${origin}/inquiry?house=${label.replace(/[%&#?=+\s]/g, encodeURIComponent)}`;

  // 複製時連同給房客的開場白一起複製
  const makeMessage = (h: House) =>
    `您好！這裡是租寓 🏠\n為了更快為您安排看房，\n請點以下連結填寫租屋需求：\n\n${makeLink(houseLabel(h))}\n\n【物件】${h.name}`;

  const copy = async (h: House) => {
    await navigator.clipboard.writeText(makeMessage(h));
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
          選擇房源，複製給房客的訊息與專屬詢問連結（資料來自官網已上架房源，含滿租）
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
              共 {houses.length} 筆（有空房 {houses.filter(h => h.vacant > 0).length} 筆）{query ? `，符合 ${filtered.length} 筆` : ""}
            </p>
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filtered.map(h => (
                <li
                  key={h.name}
                  className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-800 truncate">🏠 {h.name}</p>
                      {h.vacant > 0 ? (
                        <span className="shrink-0 text-[11px] leading-none bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                          剩 {h.vacant} 間空房
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] leading-none bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                          目前滿租
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      連結帶入：{houseLabel(h)}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(h)}
                    className="shrink-0 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 transition"
                  >
                    {copied === h.name ? "已複製 ✓" : "複製訊息"}
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
