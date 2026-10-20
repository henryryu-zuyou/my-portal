import { NextRequest, NextResponse } from "next/server";
import { searchStatements } from "@/lib/statement";

// POST /api/statement/search { q }：用房源名稱找代管表，回傳候選清單（含代管表連結）。
// 由 middleware 保護（需登入）：名稱猜得到，不能公開，否則任何人都能看到屋主收支。
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const q = String(body?.q || "").trim();
  if (q.length < 2) return NextResponse.json({ error: "請輸入至少兩個字的房源名稱。" }, { status: 400 });
  try {
    const hits = await searchStatements(q);
    return NextResponse.json({ hits }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const noKey = (e as Error)?.message === "NO_KEY";
    return NextResponse.json(
      { error: noKey ? "伺服器尚未設定 RAGIC_READONLY_KEY。" : "Ragic 暫時連不上，請稍後再試。" },
      { status: noKey ? 500 : 502 },
    );
  }
}
