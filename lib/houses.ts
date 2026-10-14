import { unstable_cache } from "next/cache";

// 資料來源：公司官網 zuyou.com.tw 公開搜尋頁（不需登入、天然=已上架）。
// 演進：v2 直連 Ragic 房源資訊 (housing/70) → key 帳號失去表單權限（code 106）；
// v3 改 zuyou-portal /api/properties → 只看得到登入者名下物件（豈家全部列不齊）；
// v4 改抓官網：/search 的 gon.datas 內嵌全站房源，再抓各房源 .md 解析型態與空房。
// 注意：官網 house.city 欄位缺漏（q[city_cont_any] 篩選會漏件），必須抓全部分頁自行用地址過濾。
const SITE = "https://www.zuyou.com.tw";
const UA = { "User-Agent": "Mozilla/5.0 (my-portal links)" };

// 豈家(桃園) 轄區：桃園市全區 + 新北市指定行政區（沿用 v2 時代的轄區定義）
const KEEP_NEWTAIPEI_DISTRICTS = ["林口區", "樹林區", "鶯歌區", "土城區"];

export type House = { name: string; type: string; area: string; addr: string; vacant: number };
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
  // 滿租的也列（vacant=0），方便提前蒐集租客資料
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
  // 有空房的排前面，同組再依名稱排序
  out.sort((a, b) => Number(b.vacant > 0) - Number(a.vacant > 0) || a.name.localeCompare(b.name, "zh-Hant"));
  // 空結果視為異常（官網改版/暫時失敗），丟出錯誤 → 不寫入快取，下次自動重試
  if (out.length === 0) throw new Error("官網回傳 0 筆房源，不快取");
  return out;
}

// 跨冷啟動的持久快取（Next.js Data Cache），過期自動 stale-while-revalidate
export const getCachedHouses = unstable_cache(
  async (): Promise<House[]> => fetchAllListed(),
  ["links-houses-qijia-taoyuan-v5"], // v5：滿租房源也列出
  { revalidate: 600 } // 10 分鐘
);

// 房源名稱去掉結尾的「實驗室」（= /links 產生連結時帶入的 ?house= 值）
export const stripName = (name: string) => name.replace(/實驗室\s*$/, "").trim() || name;

// 地址只截取到「路段」為止：保留「X段」，去掉門牌號/巷/弄/衖/樓
export const roadSection = (addr: string) => {
  if (!addr) return addr;
  const m = addr.match(/[0-9０-９]+(?!段)|[巷弄衖號樓]/);
  const cut = m ? addr.slice(0, m.index) : addr;
  return cut.replace(/[\s,，]+$/, "").trim();
};

// 依連結帶入的房源名稱查「縣市區＋路段」（給日曆用）；查不到或逾時回空字串，不擋表單送出
export async function lookupHouseLocation(house: string, timeoutMs = 4000): Promise<string> {
  if (!house) return "";
  try {
    const houses = await Promise.race([
      getCachedHouses(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
    ]);
    const h = houses.find((x) => stripName(x.name) === house || x.name === house);
    return h ? roadSection(h.addr) || h.area : "";
  } catch {
    return "";
  }
}
