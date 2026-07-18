import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// 資料來源：租寓工作入口 (zuyou-portal) 的 /api/properties。
// 原本直連 Ragic 房源資訊 (housing/70)，但 API key 帳號已無表單存取權（code 106），
// 改由入口網站代讀（它自己有權限的 Ragic key + 快取），my-portal 只做登入 + 轉格式。
const PORTAL_BASE = "https://zuyou-portal.zeabur.app";

type House = { name: string; type: string; area: string; addr: string; vacant: number };

type PortalVacantProperty = {
  name?: string;
  propertyType?: string;
  city?: string;
  district?: string;
  address?: string;
  vacantRooms?: number;
  websiteUrl?: string;
};

// 登入拿 session cookie（欄位是 email/password，回傳 Set-Cookie）
async function portalLogin(): Promise<string> {
  const email = process.env.ZUYOU_PORTAL_EMAIL;
  const password = process.env.ZUYOU_PORTAL_PASSWORD;
  if (!email || !password) throw new Error("ZUYOU_PORTAL_EMAIL / ZUYOU_PORTAL_PASSWORD 未設定");

  const res = await fetch(`${PORTAL_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Portal 登入失敗 ${res.status}: ${body.slice(0, 200)}`);
  }
  const cookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : ([res.headers.get("set-cookie")].filter(Boolean) as string[]);
  const cookie = cookies.map((c) => c.split(";")[0]).join("; ");
  if (!cookie) throw new Error("Portal 登入成功但沒拿到 session cookie");
  return cookie;
}

async function fetchVacantHouses(): Promise<House[]> {
  const cookie = await portalLogin();
  const res = await fetch(`${PORTAL_BASE}/api/properties`, {
    headers: { Cookie: cookie },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Portal /api/properties ${res.status}`);
  const data = (await res.json()) as { vacantProperties?: PortalVacantProperty[] };

  const out: House[] = (data.vacantProperties || [])
    // websiteUrl 有值 ≈ 官網已上架（原本的「網站上架狀態=已上架」條件）
    .filter((p) => (p.name || "").trim() && (p.vacantRooms || 0) > 0 && (p.websiteUrl || "").trim())
    .map((p) => ({
      name: (p.name || "").trim(),
      type: p.propertyType || "",
      area: `${p.city || ""}${p.district || ""}`,
      addr: p.address || "",
      vacant: p.vacantRooms || 0,
    }));

  out.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  // 空結果視為異常（登入失效/上游故障），丟出錯誤 → 不寫入快取，下次自動重試
  if (out.length === 0) throw new Error("Portal 回傳 0 筆空房，不快取");
  return out;
}

// 跨冷啟動的持久快取（Next.js Data Cache），過期自動 stale-while-revalidate
const getCachedHouses = unstable_cache(
  async (): Promise<House[]> => fetchVacantHouses(),
  ["links-houses-qijia-taoyuan-v3"], // v3：資料來源改為 zuyou-portal
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
