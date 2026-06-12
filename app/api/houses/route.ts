import { NextResponse } from "next/server";

// Ragic 房源資訊 (housing/70) — 物件層級房源清單
const RAGIC_BASE = "https://ap14.ragic.com/zuyou2022";
const FORM_PATH = "housing/70";
const PAGE_SIZE = 1000;
const PARALLEL_BATCH = 6; // 一次並行抓幾頁（housing/70 約 3400 筆 ≈ 4 頁）

// 行政區篩選：只保留這些區的房源（日後要增減直接改這裡）
// 規則：整個桃園市，或新北市的指定行政區
const KEEP_WHOLE_CITIES = ["桃園市"];
const KEEP_DISTRICTS_BY_CITY: Record<string, string[]> = {
  新北市: ["林口區", "樹林區", "鶯歌區", "土城區"],
};

function keepByDistrict(city: string, district: string): boolean {
  if (KEEP_WHOLE_CITIES.includes(city)) return true;
  const districts = KEEP_DISTRICTS_BY_CITY[city];
  return !!districts && districts.includes(district);
}

type House = { name: string; type: string; area: string };

// 記憶體快取，避免每次載入 /links 都打 Ragic
let cache: { at: number; data: House[] } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 分鐘

async function fetchPage(key: string, offset: number): Promise<Record<string, string>[]> {
  const url = `${RAGIC_BASE}/${FORM_PATH}?api&subtable=0&limit=${PAGE_SIZE}&offset=${offset}`;
  const res = await fetch(url, { headers: { Authorization: `Basic ${key}` } });
  if (!res.ok) throw new Error(`Ragic ${res.status}`);
  const json = (await res.json()) as Record<string, Record<string, string>>;
  return Object.values(json);
}

async function fetchAllListed(key: string): Promise<House[]> {
  const out: House[] = [];
  let base = 0;
  let done = false;

  // 每輪並行抓 PARALLEL_BATCH 頁，直到某頁未滿（最後一頁）
  while (!done) {
    const offsets = Array.from({ length: PARALLEL_BATCH }, (_, i) => base + i * PAGE_SIZE);
    const pages = await Promise.all(offsets.map((o) => fetchPage(key, o)));

    for (const records of pages) {
      for (const r of records) {
        const name = (r["房源名稱"] || "").trim();
        const city = r["縣市"] || "";
        const district = r["行政區"] || "";
        if (
          (r["網站上架狀態"] || "") === "已上架" &&
          name &&
          keepByDistrict(city, district)
        ) {
          out.push({ name, type: r["房源型態"] || "", area: r["縣市+行政區"] || "" });
        }
      }
      if (records.length < PAGE_SIZE) done = true; // 抓到最後一頁
    }
    base += PARALLEL_BATCH * PAGE_SIZE;
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
    cache = { at: Date.now(), data: houses };
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
