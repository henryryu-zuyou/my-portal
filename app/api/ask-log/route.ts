import { NextRequest, NextResponse } from "next/server";
import { APPS_SCRIPT_URL } from "@/lib/apps-script";

// /api/ask-log：屋主在 /ask 問了 37 題 FAQ 裡沒有的問題時，(1) 記到「AI資料庫」的「屋主問答」分頁
// (2) 發 Google Chat 通知。公開端點（/ask 本身就是公開頁，刻意不放進 middleware matcher），
// 所以每個欄位都截長度，避免有人拿它灌爆試算表。失敗都不回報給前端——記錄失敗不該影響屋主看答案。

// 想把這類通知發到另一個聊天室，就設 ASK_CHAT_WEBHOOK_URL；沒設就跟房客詢問同一間
const CHAT_WEBHOOK_URL = process.env.ASK_CHAT_WEBHOOK_URL || process.env.GOOGLE_CHAT_WEBHOOK_URL;

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1cHfVDI-Sf-b-WgmsAzCy7jqLGdi70mL82PqNoDhuU00/edit?gid=2004450699#gid=2004450699";

type Miss = { question: string; status: string; closest: string; score: number };

function buildChatMessage(m: Miss) {
  return [
    "❓ *屋主問了 FAQ 裡沒有的問題*",
    `💬 問題：*${m.question}*`,
    `📊 情況：${m.status || "未知"}${m.score ? `（最高分 ${m.score}）` : ""}`,
    m.closest ? `🔎 最接近：${m.closest}` : null,
    `🗂 已記到 <${SHEET_URL}|AI資料庫 › 屋主問答>`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function notifyGoogleChat(m: Miss) {
  if (!CHAT_WEBHOOK_URL) return;
  try {
    await fetch(CHAT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ text: buildChatMessage(m) }),
    });
  } catch {
    // 通知失敗不影響寫入試算表
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const question = String(b?.question ?? "").trim().slice(0, 200);
    if (!question) return NextResponse.json({ success: false, error: "沒有問題內容" }, { status: 400 });

    const miss: Miss = {
      question,
      status: String(b?.status ?? "").slice(0, 20),
      closest: String(b?.closest ?? "").slice(0, 300),
      score: Number(b?.score) || 0,
    };

    // 寫試算表與發 Chat 通知並行，互不阻擋
    await Promise.all([
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "askMiss", ...miss, source: "/ask" }),
      }),
      notifyGoogleChat(miss),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
