import { NextResponse } from "next/server";

// Ragic 房源資訊 (housing/70) — 物件層級房源清單
const RAGIC_BASE = "https://ap14.ragic.com/zuyou2022";
const FORM_PATH = "housing/70";
const PAGE_SIZE = 1000;

// 行政區篩選：只保留這些區的房源（日後要增減直接改這裡）
// 規則：整個桃園市，或新北市的指定行政區
const KEEP_WHOLE_CITIES = ["桃園市"];
const KEEP_DISTRICTS_BY_CITY: Record<string, string[]> = {
  新北市: ["林口區", "樹林區", "鶯歌區", "土城區"],
};

// 需要向 Ragic 全文查詢的縣市（= 整市保留的 + 有指定行政區的）。
// 用 fts 只抓這幾個縣市的資料，避免掃全表 3000+ 筆（單頁約 6 秒）。
const QUERY_CITIES = [...KEEP_WHOLE_CITIES, ...Object.keys(KEEP_DISTRICTS_BY_CITY)];

function keepByDistrict(city: string, district: string): boolean {
  if (KEEP_WHOLE_CITIES.includes(city)) return true;
  const districts = KEEP_DISTRICTS_BY_CITY[city];
  return !!districts && districts.includes(district);
}

type House = { name: string; type: string; area: string };

// 記憶體快取，避免每次載入 /links 都打 Ragic
let cache: { at: number; data: House[] } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 分鐘

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

// 用全文搜尋抓某個縣市的所有資料（含分頁），fts 免 field ID 又快
async function fetchCity(key: string, city: string): Promise<Record<string, string>[]> {
  const all: Record<string, string>[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url =
      `${RAGIC_BASE}/${FORM_PATH}?api&subtable=0&limit=${PAGE_SIZE}&offset=${offset}` +
      `&fts=${encodeURIComponent(city)}`;
    const records = await fetchPage(key, url);
    all.push(...records);
    if (records.length < PAGE_SIZE) break;
  }
  return all;
}

async function fetchAllListed(key: string): Promise<House[]> {
  const out: House[] = [];
  const seen = new Set<string>();

  // 逐縣市查詢（序列，避免 Ragic 對同 key 並發限流）
  for (const city of QUERY_CITIES) {
    const records = await fetchCity(key, city);
    for (const r of records) {
      const name = (r["房源名稱"] || "").trim();
      const c = r["縣市"] || "";
      const district = r["行政區"] || "";
      if (
        (r["網站上架狀態"] || "") === "已上架" &&
        name &&
        keepByDistrict(c, district) &&
        !seen.has(name)
      ) {
        seen.add(name);
        out.push({ name, type: r["房源型態"] || "", area: r["縣市+行政區"] || "" });
      }
    }
  }

  // 依名稱排序，方便瀏覽
  out.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  return out;
}

export async function GET() {
  const key = process.env.RAGIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { success: false, error: "RAGIC_API_KEY 未設定" },
      { status: 500 }
    );
  }

  // 命中快取
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ success: true, cached: true, houses: cache.data });
  }

  try {
    const houses = await fetchAllListed(key);
    // 空結果視為異常（限流/暫時失敗），不快取，讓下次自動重試
    if (houses.length > 0) {
      cache = { at: Date.now(), data: houses };
    }
    return NextResponse.json({ success: true, cached: false, houses });
  } catch (err) {
    // 抓取失敗時，若有舊快取就回舊資料
    if (cache) {
      return NextResponse.json({ success: true, stale: true, houses: cache.data });
    }
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 502 }
    );
  }
}
