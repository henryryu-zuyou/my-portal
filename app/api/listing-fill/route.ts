import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { ragicGet, ragicPostForm, ragicPostJson, ftsSearch } from "@/lib/ragic";
import { looksLikeOnlineContract, parseContract } from "@/lib/contract-parse";
import {
  OWNER, HOUSE, BANK_SUBTABLE_ID,
  buildOwnerCreate, buildHouseData, buildBankSubRow, requiredBlock,
  agentNameForEmail, teamForCompany,
  type FormInputs, type BuildContext,
} from "@/lib/listing-fields";

export const runtime = "nodejs"; // unpdf 需 Node runtime（非 edge）
export const maxDuration = 60; // 多次序列化 Ragic 寫入，放寬執行時間
export const dynamic = "force-dynamic";

const COMPANY_FIELD = "1002934"; // housing/70 管理公司
const DEPOSIT_MONTHS = "2"; // 公司慣例固定 2 個月

function toSlashDate(s: string): string {
  return (s || "").trim().replace(/-/g, "/");
}

export async function POST(req: NextRequest) {
  // 1. 驗證登入
  const email = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!email) return NextResponse.json({ success: false, error: "未登入" }, { status: 401 });

  try {
    const fd = await req.formData();
    const houseRagicId = String(fd.get("houseRagicId") || "").trim();
    const pdf = fd.get("pdf");
    const form: FormInputs = {
      contractStart: toSlashDate(String(fd.get("contractStart") || "")),
      contractEnd: toSlashDate(String(fd.get("contractEnd") || "")),
      caseNo: String(fd.get("caseNo") || "").trim(),
      totalFloor: String(fd.get("totalFloor") || "").trim(),
    };
    const agentOverride = String(fd.get("agentName") || "").trim();

    if (!houseRagicId) return NextResponse.json({ success: false, error: "請先選定房源" }, { status: 400 });
    if (!(pdf instanceof File)) return NextResponse.json({ success: false, error: "請上傳代管約 PDF" }, { status: 400 });
    // 契約起迄日、原案場編號的驗證移到解析 PDF / 讀既有房源之後（PDF 為準、既有房源沿用 Ragic）

    // 2. 解析 PDF（僅線上版）
    const buf = new Uint8Array(await pdf.arrayBuffer());
    const { text } = await extractText(buf, { mergePages: true });
    if (!looksLikeOnlineContract(text)) {
      return NextResponse.json(
        { success: false, error: "這份 PDF 無法解析（可能是掃描版/無文字層）。請改上傳電子簽署的『線上版』代管約。" },
        { status: 422 }
      );
    }
    const parsed = parseContract(text);
    if (!parsed.owner.name || !parsed.owner.idNumber) {
      return NextResponse.json({ success: false, error: "PDF 解析不到屋主姓名/身分證，請確認是正確的線上版代管約。" }, { status: 422 });
    }

    // 契約起迄日：以 PDF（委託管理期間）為準，PDF 沒帶到才用表單值
    if (parsed.contract.startDate) form.contractStart = toSlashDate(parsed.contract.startDate);
    if (parsed.contract.endDate) form.contractEnd = toSlashDate(parsed.contract.endDate);
    if (!form.contractStart || !form.contractEnd) {
      return NextResponse.json({ success: false, error: "契約起迄日：PDF 未帶到（舊版模板）且表單未填，請手動填寫起迄日。" }, { status: 400 });
    }

    // 3. 讀既有房源（取管理公司、既有必填值）
    const existingArr = await ragicGet(`housing/70/${houseRagicId}`, { naming: "EID", subtable: 0 });
    const existing = (existingArr[0] || {}) as Record<string, unknown>;
    if (!existing["_ragicId"]) {
      return NextResponse.json({ success: false, error: `找不到房源 ${houseRagicId}` }, { status: 404 });
    }
    const company = String(existing[COMPANY_FIELD] ?? "");

    // 原案場編號：表單沒填就沿用既有房源的值；都沒有才擋
    if (!form.caseNo && !String(existing[HOUSE.caseNo] ?? "").trim()) {
      return NextResponse.json({ success: false, error: "原案場編號：此房源 Ragic 也沒有，請填寫。" }, { status: 400 });
    }

    // 4. 解出業務名 / 管理組別
    const agent = agentOverride || agentNameForEmail(email) || String(existing[HOUSE.agent] ?? "");
    const team = teamForCompany(company) || String(existing[HOUSE.team] ?? "");
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "查不到你的業務顯示名。請在 .env 設定 RAGIC_AGENT_MAP，或聯絡管理員。" },
        { status: 400 }
      );
    }
    const ctx: BuildContext = { agent, team, depositMonths: DEPOSIT_MONTHS };

    // 5. 屋主查重（身分證）→ 沿用或新建
    const ownerHits = await ftsSearch("housing/7", parsed.owner.idNumber, { naming: "EID" });
    const ownerHit = ownerHits.find((r) => String(r[OWNER.idNumber] ?? "").trim() === parsed.owner.idNumber);
    let ownerExisted = true;
    let ownerRagicId = ownerHit ? String(ownerHit["_ragicId"]) : "";
    if (!ownerHit) {
      ownerExisted = false;
      const created = await ragicPostForm("housing/7", buildOwnerCreate(parsed));
      ownerRagicId = String(created.ragicId ?? "");
    }

    // 寫入順序很關鍵（見記憶 reference_ragic_housing70_write）：
    // JSON 子表寫入會「非同步洗掉」原案場編號等主表欄；form 寫入則會正確設定。
    // 故先做子表 JSON 寫入並留緩衝讓非同步重算落地，再以兩個 form 寫入作為「最後定案」。
    const required = requiredBlock(parsed, form, ctx, existing);

    // 6. 收款子表（JSON：必填 + _subtable）
    await ragicPostJson(`housing/70/${houseRagicId}`, {
      ...required,
      [`_subtable_${BANK_SUBTABLE_ID}`]: { "-1": buildBankSubRow(parsed) },
    });
    await new Promise((r) => setTimeout(r, 2500)); // 等子表寫入觸發的非同步重算落地

    // 7. 房源主表（必填 + 資料欄，無 flag）— 設定所有主表欄
    await ragicPostForm(`housing/70/${houseRagicId}`, { ...required, ...buildHouseData(parsed, form, ctx) });

    // 8. 連結屋主（doLinkLoad，帶齊必填）→ 屋主證號帶入；form 寫入會保留主表欄
    await ragicPostForm(`housing/70/${houseRagicId}`, required, { doLinkLoad: true });

    // 9. 收尾保險：JSON 子表寫入會「非同步」洗掉原案場編號（落地時間不定）。
    //    偵測→補寫，直到它穩定保留（只有一次 JSON 寫入＝最多觸發一次非同步洗空）。
    let caseStuck = false;
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const cur = await ragicGet(`housing/70/${houseRagicId}`, { naming: "EID", subtable: 0 });
      if (String((cur[0] || {})[HOUSE.caseNo] ?? "").trim()) {
        caseStuck = true;
        break;
      }
      await ragicPostForm(`housing/70/${houseRagicId}`, required); // 被洗空→補寫
    }

    return NextResponse.json({
      success: true,
      houseRagicId,
      caseNoStuck: caseStuck,
      houseUrl: `https://ap14.ragic.com/zuyou2022/housing/70/${houseRagicId}`,
      owner: { existed: ownerExisted, ragicId: ownerRagicId, name: parsed.owner.name, idNumber: parsed.owner.idNumber },
      parsed,
      contractSubtableHint:
        "「包租/代管契約紀錄」子表含必填的合約 PDF 檔，API 無法建立含必填檔案的子表列，請到 Ragic 該房源『管理資料』分頁手動新增一列並拖入代管約 PDF。",
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
