import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// 需要登入的路由：首頁、連結產生器、官網上架、房源 API
// （/inquiry、/api/submit 維持公開讓房客使用）
export const config = {
  matcher: ["/", "/links/:path*", "/listing/:path*", "/api/houses/:path*", "/api/listing-fill/:path*"],
};

export async function middleware(req: NextRequest) {
  const email = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (email) return NextResponse.next();

  // 未登入：API 回 401，頁面導向 /login
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}
