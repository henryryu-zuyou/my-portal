import { NextResponse } from "next/server";
import { DAIGUAN_GUIDE_HTML } from "@/lib/daiguan-guide";

// /daiguan/guide：內部同仁用的計分說明書。
// 由 middleware 保護（需登入），這裡只負責吐出靜態 HTML。
export function GET() {
  return new NextResponse(DAIGUAN_GUIDE_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
