import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// 資料來源：公司官網 zuyou.com.tw 公開搜尋頁（不需登入、天然=已上架）。
// 演進：v2 直連 Ragic 房源資訊 (housing/70) → key 帳號失去表單權限（code 106）；
// v3 改 zuyou-portal /api/properties → 只看得到登入者名下物件（豈家全部列不齊）；
// v4 改抓官網：/search 的 gon.datas 內嵌全站房源，再抓各房源 .md 解析型態與空房。
// 注意：官網 house.city 欄位缺漏（q[city_cont_any] 篩選會漏件），必須抓全部分頁自行用地址過濾。
const SITE = "https://www.zuyou.com.tw";
const UA = { "User-Agent": "Mozilla/5.0 (my-portal links)" };

// 冷抓要打官網 5 頁搜尋 + 80+ 房源頁，約 6-10 秒，放寬函式上限避免 Vercel 預設 10s 截斷
export const maxDuration = 60;

// 豈家(桃園) 轄區：桃園市全區 + 新北市指定行政區（沿用 v2 時代的轄區定義）
const KEEP_NEWTAIPEI_DISTRICTS = ["林口區", "樹林區", "鶯歌區", "土城區"];

type House = { name: string; type: string; area: string; addr: string; vacant: number };
type SearchHit = { title: string; slug: string; addr: string; area: string };

function inTerritory(addr: string): boolean {
  if (addr.startsWith("桃園市")) return true;
  if (addr.startsWith("新北市")) return KEEP_NEWTAIPEI_DISTRICTS.some((d) => addr.slice(3, 8).includes(d));
  return false;
}

// 抓官網搜尋全部分頁，收集 gon.datas（地址 → [{title, slug}]）
async function fetchSearchHits(): Promise<SearchHit[]> {
  const hits: SearchHit[] = [];
  const seenSlug = new Set<string>();
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${SITE}/search?page=${page}`, { headers: UA, cache: "no-store" });
    if (!res.ok) throw new Error(`官網 /search?page=${page} 回 ${res.status}`);
    const html = await res.text();
    const m = html.match(/gon\.datas=(\{[\s\S]*?\});/);
    if (!m) break;
    const datas = JSON.parse(m[1]) as Record<string, { title: string; slug: string }[]>;
    if (Object.keys(datas).length === 0) break;
    for (const [addr, items] of Object.entries(datas)) {
      if (!inTerritory(addr)) continue;
      const am = addr.match(/^([^市]+市)([^區]+區)/);
      for (const it of items) {
        if (seenSlug.has(it.slug)) continue;
        seenSlug.add(it.slug);
        hits.push({ title: it.title, slug: it.slug, addr, area: am ? am[1] + am[2] : "" });
      }
    }
    if (!html.includes(`page=${page + 1}`)) break;
  }
  return hits;
}

// 抓單一房源的 .md，解析房屋類型與「可立即入住」房間數（整層住家=整戶一筆）
async function fetchHouseDetail(hit: SearchHit): Promise<House | null> {
  const res = await fetch(`${SITE}/houses/${encodeURIComponent(hit.slug)}.md`, {
    headers: UA,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const md = await res.text();
  if (!md.trimStart().startsWith("#")) return null; // 不存在時會回官網首頁 HTML
  const type = md.match(/\*\*房屋類型\*\*: *(\S+)/)?.[1] || "";
  const vacant = (md.match(/何時可正式出租？\*\*: *可立即入住/g) || []).length;
  if (vacant === 0) return null; // 只留目前有空房的（滿租但仍掛官網的不列）
  return { name: hit.title.trim(), type, area: hit.area, addr: hit.addr, vacant };
}

// 併發上限，避免一次 80+ 條連線打官網
async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

async function fetchAllListed(): Promise<House[]> {
  const hits = await fetchSearchHits();
  const details = await mapLimit(hits, 16, (h) => fetchHouseDetail(h).catch(() => null));
  const seen = new Set<string>();
  const out = details.filter((h): h is House => !!h && !seen.has(h.name) && !!seen.add(h.name));
  out.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  // 空結果視為異常（官網改版/暫時失敗），丟出錯誤 → 不寫入快取，下次自動重試
  if (out.length === 0) throw new Error("官網回傳 0 筆空房房源，不快取");
  return out;
}

// 跨冷啟動的持久快取（Next.js Data Cache），過期自動 stale-while-revalidate
const getCachedHouses = unstable_cache(
  async (): Promise<House[]> => fetchAllListed(),
  ["links-houses-qijia-taoyuan-v4"], // v4：資料來源改為官網公開搜尋
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
