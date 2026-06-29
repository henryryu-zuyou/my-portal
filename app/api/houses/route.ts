import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// 房源資訊 (housing/70) — 物件層級房源清單
const RAGIC_BASE = "https://ap14.ragic.com/zuyou2022";
const FORM_PATH = "housing/70";
const PAGE_SIZE = 1000;

// 篩選條件：管理公司 = 豈家(桃園) 且 網站上架狀態 = 已上架 且 仍有空房
// 注意：管理公司字面值帶「半形括號」，必須是 豈家(桃園)，少字會回 0 筆且不報錯。
const KEEP_COMPANY = "豈家(桃園)";
// 用全文搜尋只抓「豈家」相關紀錄，避免掃全表 3000+ 筆（單頁約 6 秒）。
const FTS_TERM = "豈家";

type House = { name: string; type: string; area: string; addr: string; vacant: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 解析 Ragic 數字（值是字串、可能含千分位逗號）
const toNum = (v: string) => {
  const n = parseInt(String(v || "").replace(/,/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

// 單頁抓取，含 3 次重試 + 退避（Ragic 對同 key 高頻請求會限流）
async function fetchPage(key: string, url: string): Promise<Record<string, string>[]> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { Authorization: `Basic ${key}` } });
      if (!res.ok) throw new Error(`Ragic ${res.status}`);
      const json = await res.json();
      // 限流時 Ragic 可能回非資料物件，過濾掉沒有 _ragicId 的雜訊
      return Object.values(json as Record<string, Record<string, string>>).filter(
        (r) => r && typeof r === "object" && "_ragicId" in r
      );
    } catch (e) {
      lastErr = e;
      await sleep(300 * (attempt + 1));
    }
  }
  throw lastErr;
}

async function fetchAllListed(key: string): Promise<House[]> {
  const out: House[] = [];
  const seen = new Set<string>();

  // fts=豈家 抓取（含分頁），再以精準條件過濾
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url =
      `${RAGIC_BASE}/${FORM_PATH}?api&subtable=0&limit=${PAGE_SIZE}&offset=${offset}` +
      `&fts=${encodeURIComponent(FTS_TERM)}`;
    const records = await fetchPage(key, url);
    for (const r of records) {
      const name = (r["房源名稱"] || "").trim();
      if (
        (r["網站上架狀態"] || "") === "已上架" &&
        (r["管理公司"] || "") === KEEP_COMPANY &&
        toNum(r["空房間數總和"]) > 0 && // 只留目前仍有空房的房源（房源層彙總欄，0=滿租）
        name &&
        !seen.has(name)
      ) {
        seen.add(name);
        out.push({
          name,
          type: r["房源型態"] || "",
          area: r["縣市+行政區"] || "",
          addr: r["完整地址"] || "",
          vacant: toNum(r["空房間數總和"]),
        });
      }
    }
    if (records.length < PAGE_SIZE) break;
  }

  // 依名稱排序，方便瀏覽
  out.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  // 空結果視為異常（限流/暫時失敗），丟出錯誤 → 不寫入快取，下次自動重試
  if (out.length === 0) throw new Error("Ragic 回傳 0 筆（疑似限流），不快取");
  return out;
}

// A：跨「冷啟動」的持久快取。
// unstable_cache 存進 Next.js Data Cache（不在函式記憶體，Vercel 函式休眠/重啟後仍在），
// 並自動 stale-while-revalidate：過期也先回舊資料，背景再更新。
const getCachedHouses = unstable_cache(
  async (): Promise<House[]> => {
    const key = process.env.RAGIC_API_KEY;
    if (!key) throw new Error("RAGIC_API_KEY 未設定");
    return fetchAllListed(key);
  },
  ["links-houses-qijia-taoyuan-v2"], // v2：House 新增 vacant 欄，換鍵避免回傳舊結構快取
  { revalidate: 600 } // 10 分鐘
);

export async function GET() {
  try {
    const houses = await getCachedHouses();
    return NextResponse.json({ success: true, houses });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 502 });
  }
}
