import { NextRequest, NextResponse } from "next/server";
import { APPS_SCRIPT_URL } from "@/lib/apps-script";

// /api/ask-log：屋主在 /ask 問了 37 題 FAQ 裡沒有的問題時，記到「AI資料庫」的「屋主問答」分頁。
// 公開端點（/ask 本身就是公開頁，刻意不放進 middleware matcher），所以每個欄位都截長度，
// 避免有人拿它灌爆試算表。寫入失敗不回報錯誤給前端——記錄失敗不該影響屋主看答案。
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const question = String(b?.question ?? "").trim().slice(0, 200);
    if (!question) return NextResponse.json({ success: false, error: "沒有問題內容" }, { status: 400 });

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "askMiss",
        question,
        status: String(b?.status ?? "").slice(0, 20),
        closest: String(b?.closest ?? "").slice(0, 300),
        score: Number(b?.score) || 0,
        source: "/ask",
      }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
