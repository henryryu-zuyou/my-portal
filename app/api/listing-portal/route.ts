import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { looksLikeOnlineContract, parseContract } from "@/lib/contract-parse";
import { buildPortalPackage, type PortalFormInputs, type PortalHouse } from "@/lib/portal-listing";

export const runtime = "nodejs"; // unpdf 需 Node runtime
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// 解析「線上版」代管約 PDF → 產出官網（zuyou.com.tw）七分頁上架欄位包。不寫 Ragic。
export async function POST(req: NextRequest) {
  const email = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!email) return NextResponse.json({ success: false, error: "未登入" }, { status: 401 });

  try {
    const fd = await req.formData();
    const pdf = fd.get("pdf");
    if (!(pdf instanceof File)) {
      return NextResponse.json({ success: false, error: "請上傳代管約 PDF" }, { status: 400 });
    }

    const house: PortalHouse = {
      name: String(fd.get("houseName") || "").trim(),
      addr: String(fd.get("houseAddr") || "").trim(),
      company: String(fd.get("houseCompany") || "").trim(),
    };
    const form: PortalFormInputs = {
      totalFloor: String(fd.get("totalFloor") || "").trim(),
      area: String(fd.get("area") || "").trim(),
      genderLimit: String(fd.get("genderLimit") || "").trim(),
      foreigner: String(fd.get("foreigner") || "").trim(),
      moveInDate: String(fd.get("moveInDate") || "").trim(),
      photoCount: Number(fd.get("photoCount") || 0) || 0,
    };

    // 解析 PDF（僅線上版有文字層）
    const buf = new Uint8Array(await pdf.arrayBuffer());
    const { text } = await extractText(buf, { mergePages: true });
    if (!looksLikeOnlineContract(text)) {
      return NextResponse.json(
        { success: false, error: "這份 PDF 無法解析（可能是掃描版/無文字層）。請改上傳電子簽署的『線上版』代管約。" },
        { status: 422 }
      );
    }
    const parsed = parseContract(text);
    if (!parsed.owner.name) {
      return NextResponse.json(
        { success: false, error: "PDF 解析不到屋主資料，請確認是正確的線上版代管約。" },
        { status: 422 }
      );
    }

    const pkg = buildPortalPackage(parsed, house, form);
    return NextResponse.json({ success: true, package: pkg, parsed });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
