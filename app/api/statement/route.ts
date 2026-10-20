import { NextRequest, NextResponse } from "next/server";
import { buildStatement, fetchStatementRecord, parseStatementLink } from "@/lib/statement";

// POST /api/statement { link }：讀代管表連結指到的那一筆，回傳整理好的說明資料。
// 公開（刻意不進 middleware matcher）：權限來自連結本身的 rmlc 權杖，
// 拿得到連結的人本來就看得到這張代管表。回傳前已拿掉銀行帳號、身分證號、LINE UID、契約帳密。
// 用 POST 而不是 GET，避免連結（含權杖）出現在伺服器 log 的網址裡。
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const target = parseStatementLink(String(body?.link || ""));
  if (!target) {
    return NextResponse.json(
      { error: "這不是代管表連結。請貼上 ap14.ragic.com/zuyou2022/forms16/… 開頭、含 rmlc 的完整網址。" },
      { status: 400 },
    );
  }
  try {
    const rec = await fetchStatementRecord(target);
    return NextResponse.json(buildStatement(rec), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const notFound = (e as Error)?.message === "NOT_FOUND";
    return NextResponse.json(
      { error: notFound ? "讀不到這筆代管表，連結可能已失效或不完整。" : "Ragic 暫時連不上，請稍後再試。" },
      { status: notFound ? 404 : 502 },
    );
  }
}
