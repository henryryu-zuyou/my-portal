import { NextResponse } from "next/server";

// 掃 housing/10 較久，放寬 serverless 執行時間
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Ragic 房客契約資料庫&退押 (housing/10)
const RAGIC_BASE = "https://ap14.ragic.com/zuyou2022";
const FORM_PATH = "housing/10";
const PAGE_SIZE = 1000;

type Tenant = {
  house: string;
  room: string;
  tenant: string;
  endDate: string;
  area: string;
  company: string;
};

let cache: { at: number; data: Tenant[] } | null = null;
const TTL_MS = 10 * 60 * 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(key: string, offset: number): Promise<Record<string, string>[]> {
  const url = `${RAGIC_BASE}/${FORM_PATH}?api&subtable=0&limit=${PAGE_SIZE}&offset=${offset}`;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { Authorization: `Basic ${key}` } });
      if (!res.ok) throw new Error(`Ragic ${res.status}`);
      const json = await res.json();
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

function todayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}/${mm}/${dd}`;
}

async function fetchMissing(key: string): Promise<Tenant[]> {
  const today = todayStr();
  const out: Tenant[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const records = await fetchPage(key, offset);
    for (const r of records) {
      const missing = (r["判斷房客 UID 是否缺乏"] || "") === "X"; // X = 缺 LINE UID
      const pending = (r["契約狀態"] || "").includes("未成立"); // 將入住（尚未成立）
      const endDate = r["契約結束日"] || "";
      if (missing && pending && endDate >= today) {
        out.push({
          house: r["房源名稱"] || "",
          room: r["房間名稱"] || "",
          tenant: r["房客名稱"] || "",
          endDate,
          area: (r["縣市"] || "") + (r["行政區"] || ""),
          company: r["管理公司"] || "",
        });
      }
    }
    if (records.length < PAGE_SIZE) break;
  }
  out.sort((a, b) => a.endDate.localeCompare(b.endDate));
  return out;
}

export async function GET() {
  const key = process.env.RAGIC_API_KEY;
  if (!key) {
    return NextResponse.json({ success: false, error: "RAGIC_API_KEY 未設定" }, { status: 500 });
  }
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ success: true, cached: true, tenants: cache.data });
  }
  try {
    const tenants = await fetchMissing(key);
    if (tenants.length > 0) cache = { at: Date.now(), data: tenants };
    return NextResponse.json({ success: true, cached: false, tenants });
  } catch (err) {
    if (cache) return NextResponse.json({ success: true, stale: true, tenants: cache.data });
    return NextResponse.json({ success: false, error: String(err) }, { status: 502 });
  }
}
