import { NextResponse } from "next/server";
import { getCachedHouses } from "@/lib/houses";

// 抓取邏輯與快取在 lib/houses.ts（表單送出時也會用來查房源地址）
// 冷抓要打官網 5 頁搜尋 + 80+ 房源頁，約 6-10 秒，放寬函式上限避免 Vercel 預設 10s 截斷
export const maxDuration = 60;

export async function GET() {
  try {
    const houses = await getCachedHouses();
    return NextResponse.json({ success: true, houses });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 502 });
  }
}
