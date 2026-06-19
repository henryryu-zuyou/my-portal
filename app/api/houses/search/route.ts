import { NextRequest, NextResponse } from "next/server";
import { ftsSearch } from "@/lib/ragic";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// 依關鍵字（房源名稱/地址）搜尋 housing/70，回傳含 _ragicId 供「官網上架」補填選定房源。
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ success: true, houses: [] });
  }
  try {
    const records = await ftsSearch("housing/70", q);
    const houses = records
      .map((r) => ({
        ragicId: String(r["_ragicId"] ?? ""),
        name: String(r["房源名稱"] ?? ""),
        addr: String(r["完整地址"] ?? ""),
        company: String(r["管理公司"] ?? ""),
        listed: String(r["網站上架狀態"] ?? "") === "已上架",
      }))
      .filter((h) => h.ragicId && h.name);
    return NextResponse.json({ success: true, houses });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 502 });
  }
}
