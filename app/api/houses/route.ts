import { NextResponse } from "next/server";

// Ragic 房源資訊 (housing/70) — 物件層級房源清單
const RAGIC_BASE = "https://ap14.ragic.com/zuyou2022";
const FORM_PATH = "housing/70";
const PAGE_SIZE = 1000;

type House = { name: string; type: string; area: string };

// 記憶體快取，避免每次載入 /links 都打 4 頁 Ragic
let cache: { at: number; data: House[] } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 分鐘

async function fetchAllListed(key: string): Promise<House[]> {
  const out: House[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = `${RAGIC_BASE}/${FORM_PATH}?api&subtable=0&limit=${PAGE_SIZE}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${key}` },
    });
    if (!res.ok) throw new Error(`Ragic ${res.status}`);
    const json = (await res.json()) as Record<string, Record<string, string>>;
    const records = Object.values(json);
    for (const r of records) {
      if ((r["網站上架狀態"] || "") === "已上架" && (r["房源名稱"] || "").trim()) {
        out.push({
          name: r["房源名稱"].trim(),
          type: r["房源型態"] || "",
          area: r["縣市+行政區"] || "",
        });
      }
    }
    if (records.length < PAGE_SIZE) break; // 最後一頁
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
