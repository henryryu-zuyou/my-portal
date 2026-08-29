import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { LANDLORD_FAQ_HTML, stripInternalNotes } from "@/lib/landlord-faq";

// /faq：屋主常見問題。公開頁（刻意不進 middleware matcher），任何人都能開。
// 差別只在頁內的黃色內部註記：登入的同仁看得到，對外的版本會先被拿掉。
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = await verifySession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
  const html = email ? LANDLORD_FAQ_HTML : stripInternalNotes(LANDLORD_FAQ_HTML);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // 內容依 cookie 而異，不能讓 CDN／瀏覽器把同仁版快取給外部訪客
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}
