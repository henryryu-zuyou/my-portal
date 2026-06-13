import { NextRequest, NextResponse } from "next/server";
import { isAllowed, createSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const phone = password; // 沿用 portal 慣例：password 欄位實際放電話

    if (!email || !phone) {
      return NextResponse.json({ success: false, error: "請輸入公司信箱與聯絡電話" }, { status: 400 });
    }
    if (!isAllowed(email, phone)) {
      return NextResponse.json({ success: false, error: "查無授權，請確認公司信箱與聯絡電話" }, { status: 401 });
    }

    const token = await createSession(email);
    const res = NextResponse.json({ success: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: "登入失敗" }, { status: 500 });
  }
}
