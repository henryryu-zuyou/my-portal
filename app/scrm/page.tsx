"use client";
import { useState, useEffect } from "react";

type Tenant = {
  house: string;
  room: string;
  tenant: string;
  endDate: string;
  area: string;
  company: string;
};

const SCRM_URL = "https://scrm.oakmega.com/692/service-center";
const TENANTS_URL = "https://www.zuyou.com.tw/groups/tenants";

// 房源名稱去掉「實驗室」
const stripLab = (s: string) => s.replace(/實驗室/g, "").replace(/\s+/g, " ").trim();
// 姓名首字重複去重（胡胡政凱 → 胡政凱）
const dedupName = (n: string) => (n.length >= 2 && n[0] === n[1] ? n.slice(1) : n);
// SCRM 真實姓名建議格式：房源(去實驗室)-契約人姓名(去重首字)-契約迄日
const suggestName = (t: Tenant) => `${stripLab(t.house)}-${dedupName(t.tenant)}-${t.endDate}`;

export default function ScrmPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/missing-uid")
      .then(r => r.json())
      .then(d => {
        if (d.success) setTenants(d.tenants);
        else setError(d.error || "讀取名單失敗");
      })
      .catch(() => setError("讀取名單失敗"))
      .finally(() => setLoading(false));
  }, []);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-1">👤 SCRM 補 UID／改名</h1>
        <p className="text-sm text-gray-500 mb-5">
          每週一/四例行：將入住缺 LINE UID 的房客補上 UID，並改 SCRM 真實姓名
        </p>

        {/* 啟動器：開啟所需分頁 */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <a
            href={SCRM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            🟢 開啟 SCRM 客服中心 ↗
          </a>
          <a
            href={TENANTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-gray-700 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition"
          >
            🏠 開啟 zuyou 房客表 ↗
          </a>
        </div>

        {/* 缺 UID 名單 */}
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          待處理名單（將入住・缺 UID）
          {!loading && !error && <span className="text-gray-400 font-normal"> · {tenants.length} 筆</span>}
        </h2>

        {loading && (
          <p className="text-sm text-gray-400 text-center py-8">
            讀取 Ragic 名單中…（首次約 20–30 秒）
          </p>
        )}
        {error && <p className="text-sm text-red-500 text-center py-8">⚠️ {error}</p>}

        {!loading && !error && tenants.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">目前沒有待補 UID 的將入住房客 🎉</p>
        )}

        {!loading && !error && tenants.length > 0 && (
          <ul className="space-y-3">
            {tenants.map((t, i) => {
              const name = suggestName(t);
              return (
                <li key={i} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800">
                      {t.tenant}
                      <span className="text-xs text-gray-400 font-normal">
                        {" "}· {t.house}{t.room ? ` / ${t.room}` : ""}
                      </span>
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">迄 {t.endDate}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {[t.area, t.company].filter(Boolean).join("・")}
                  </p>
                  <div className="flex items-center gap-2 mt-2 bg-gray-50 rounded-md px-2 py-1">
                    <span className="text-xs text-gray-400 shrink-0">建議真實姓名</span>
                    <code className="text-xs text-gray-800 truncate flex-1">{name}</code>
                    <button
                      onClick={() => copy(name, `n${i}`)}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded shrink-0 hover:bg-blue-100 transition"
                    >
                      {copied === `n${i}` ? "已複製 ✓" : "複製"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-xs text-gray-400 mt-6 leading-relaxed">
          搜尋方式：SCRM 放大鏡 →「LINE 會員傳訊」搜訊息內容，用房源名稱（去實驗室）找承租人「我是XX承租人」訊息 →
          讀「通訊平台」分頁的 LINE User ID → 回 zuyou 房客表補上 → 改真實姓名為上方建議格式 → 發歡迎訊息。
          也可直接請 Claude 用 Chrome 代為執行。
        </p>
      </div>
    </div>
  );
}
