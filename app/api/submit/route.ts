import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyzMV8HXFndjRJVZvSIkcNqKfIWsbqY603oWZEU_VbLg7f-FEDd02zrFSt9vKJmjzQ2/exec";

// 在 .env.local 設定 GOOGLE_CHAT_WEBHOOK_URL，留空則不發 Chat 通知
const CHAT_WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK_URL;

// 組出要發到 Google Chat 的訊息文字
function buildChatMessage(d: Record<string, unknown>) {
  const s = (v: unknown) => (v === undefined || v === null || v === "" ? "未填寫" : String(v));
  const subsidy = Array.isArray(d.needSubsidy) ? d.needSubsidy.join("、") : s(d.needSubsidy);
  const pet = d.hasPet === "有" ? `有（${s(d.petType)}）` : s(d.hasPet);
  return [
    "📋 *有新的房客詢問！*",
    d.house ? `🏠 詢問物件：*${s(d.house)}*` : null,
    `🙋 稱呼：${s(d.name)}`,
    `📅 預計入住：${s(d.moveInDate)}`,
    `⏳ 租期：${s(d.leaseDuration)}`,
    `👥 人數：大人 ${s(d.adults)} / 小孩 ${s(d.children)}`,
    `🐾 寵物：${pet}`,
    `💼 職業：${s(d.occupation)}`,
    `🚬 抽菸：${s(d.isSmoker)}`,
    `📄 租補/入籍/報稅：${subsidy}`,
    `💰 預算：NT$ ${s(d.budget)}`,
    `🚗 汽車位：${s(d.needParking)}`,
    `🗓 看房時段：${s(d.viewingSlot1)}｜${s(d.viewingSlot2)}｜${s(d.viewingSlot3)}`,
    d.note ? `📝 其他說明：${s(d.note)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function notifyGoogleChat(body: Record<string, unknown>) {
  if (!CHAT_WEBHOOK_URL) return;
  try {
    await fetch(CHAT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ text: buildChatMessage(body) }),
    });
  } catch {
    // 通知失敗不影響表單送出
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 寫入 Google Sheets 與發送 Chat 通知並行，互不阻擋
    const [res] = await Promise.all([
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      notifyGoogleChat(body),
    ]);

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
