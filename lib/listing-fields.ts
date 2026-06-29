// 把解析結果 + 表單補充欄，對應成 Ragic 寫入 payload（field ID 為 key）。
// Field ID 來源：housing/70 由先前實測寫入 4046 驗證；housing/7 與收款子表由實際讀取結構取得。
// 值正規化見記憶 reference_ragic_housing70_write：%數→小數、格局→房數、選項合法值、日期 YYYY/MM/DD。

import type { ParsedContract } from "./contract-parse";

// ---- housing/7 屋主主檔 field ID（實際讀取結構）----
export const OWNER = {
  name: "1002830",
  idNumber: "1002832",
  birthday: "1004220",
  phone: "1003043",
  email: "1002823",
  householdAddr: "1003044",
  mailingAddr: "1004157",
} as const;

// ---- housing/70 房源資訊 主表 field ID ----
export const HOUSE = {
  ownerName: "1008436", // 連結鍵（用姓名比對屋主主檔）
  ownerId: "1002908", // 屋主證號（連結載入；需帶著過驗證）
  idNumber: "1004160", // 身分證字號
  ownerPhone: "1003506",
  ownerEmail: "1003507",
  mailingAddr: "1004159",
  householdAddr: "1004161",
  feePercent: "1002895", // %數（小數）
  layout: "1004034", // 格局（房數）
  halls: "1004046", // 隔間O廳
  baths: "1004047", // 隔間O衛
  floor: "1004044", // 樓層之O
  totalFloor: "1004045", // 樓層共O層
  expectedRent: "1004049",
  waterHeater: "1003452",
  internetAccount: "1003295",
  internetPassword: "1003296",
  internetFee: "1002963", // 網路費（選項：無/租金已含/固定金額/依帳單繳納）
  garbageNote: "1003048",
  depositMonths: "1004050",
  notarization: "1002961", // 公證（選項：可不用/要,費用各半/...）
  listDate: "1008514", // 上架日期
  // 主表銀行欄位（與收款子表並存，全表約 45% 有填）
  bankAccountName: "1005382",
  bankName: "1005383",
  bankCode: "1005384",
  bankFullCode: "1005385",
  branchName: "1005386",
  branchCode: "1005387",
  bankAccountNo: "1005388",
  // 必填欄
  caseNo: "1002858", // 原案場編號
  contractStart: "1002891",
  contractEnd: "1002892",
  remitJudge: "1007747", // 匯款帳號填寫判斷 = Yes
  agent: "1003705", // 原接洽業務
  partner: "1003715", // 負責夥伴
  team: "1007007", // 管理組別
  feeMethod: "1002894", // 代管收費方法 = %數
  depositRule: "1002935", // 代收押金規則 = 公司全持
} as const;

// ---- 屋主收款資訊 子表 ----
export const BANK_SUBTABLE_ID = "1003497";
export const BANK_SUB = {
  accountName: "1003487",
  bankBranch: "1003488", // 自由文字簡稱，如「元大樹林」
  branchName: "1003490",
  bankCode: "1003489",
  branchCode: "1003491",
  fullCode: "1003492",
  accountNo: "1003493",
} as const;

// 必填欄完整清單（housing/70 每次提交都要帶齊，否則驗證擋）
export const REQUIRED_HOUSE_FIELD_IDS: string[] = [
  HOUSE.ownerId, HOUSE.ownerName, HOUSE.caseNo, HOUSE.contractStart, HOUSE.contractEnd,
  HOUSE.remitJudge, HOUSE.agent, HOUSE.partner, HOUSE.team, HOUSE.feeMethod, HOUSE.depositRule,
];

// 管理公司 → 管理組別 預設（無把握者回空，改由既有值/表單帶）
const TEAM_BY_COMPANY: Record<string, string> = {
  "豈家(桃園)": "桃園成功小隊",
};
export function teamForCompany(company: string): string {
  return TEAM_BY_COMPANY[company] || "";
}

// 登入 email → Ragic 業務顯示名（env RAGIC_AGENT_MAP="email:顯示名,email:顯示名"）
export function agentNameForEmail(email: string): string {
  const raw = process.env.RAGIC_AGENT_MAP || "";
  const map: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const idx = pair.indexOf(":");
    if (idx < 0) continue;
    map[pair.slice(0, idx).trim().toLowerCase()] = pair.slice(idx + 1).trim();
  }
  return map[(email || "").trim().toLowerCase()] || "";
}

export function todayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}/${mm}/${dd}`;
}

// 銀行分行簡稱：元大銀行 + 樹林分行 → 元大樹林
function bankBranchLabel(institution: string, branch: string): string {
  const a = institution.replace(/(商業)?銀行$/, "").slice(0, 2);
  const b = branch.replace(/分行$/, "");
  return `${a}${b}`;
}

export type FormInputs = {
  contractStart: string; // YYYY/MM/DD
  contractEnd: string;
  caseNo: string;
  totalFloor: string; // 總樓層（線上版抽不到）
};

export type BuildContext = {
  agent: string; // 原接洽業務/負責夥伴 顯示名
  team: string; // 管理組別
  depositMonths: string; // 押金月數（公司慣例 "2"）
};

// 屋主主檔（housing/7）新建用欄位
export function buildOwnerCreate(p: ParsedContract): Record<string, string> {
  const o: Record<string, string> = {
    [OWNER.name]: p.owner.name,
    [OWNER.idNumber]: p.owner.idNumber,
    [OWNER.phone]: p.owner.phone,
    [OWNER.email]: p.owner.email,
    [OWNER.householdAddr]: p.owner.householdAddr,
    [OWNER.mailingAddr]: p.owner.mailingAddr,
  };
  return prune(o);
}

// housing/70 必填欄區塊（每次提交都帶）；existing 提供既有值優先沿用
export function requiredBlock(
  p: ParsedContract,
  form: FormInputs,
  ctx: BuildContext,
  existing: Record<string, unknown> = {}
): Record<string, string> {
  const keep = (id: string, fallback: string) => {
    const cur = String(existing[id] ?? "").trim();
    return cur || fallback;
  };
  return {
    [HOUSE.ownerId]: p.owner.idNumber,
    [HOUSE.ownerName]: p.owner.name,
    [HOUSE.caseNo]: keep(HOUSE.caseNo, form.caseNo),
    // 契約起迄日以 PDF 為準：form 已是 PDF 委託管理期間（route 端帶入），優先覆蓋既有；form 空才沿用既有
    [HOUSE.contractStart]: form.contractStart || keep(HOUSE.contractStart, ""),
    [HOUSE.contractEnd]: form.contractEnd || keep(HOUSE.contractEnd, ""),
    [HOUSE.remitJudge]: "Yes",
    [HOUSE.agent]: keep(HOUSE.agent, ctx.agent),
    [HOUSE.partner]: keep(HOUSE.partner, ctx.agent),
    [HOUSE.team]: keep(HOUSE.team, ctx.team),
    [HOUSE.feeMethod]: keep(HOUSE.feeMethod, "%數"),
    [HOUSE.depositRule]: keep(HOUSE.depositRule, "公司全持"),
  };
}

// housing/70 主表資料欄（屋主 + 房源屬性 + 主表銀行欄）
export function buildHouseData(p: ParsedContract, form: FormInputs, ctx: BuildContext): Record<string, string> {
  const internetFee = p.house.internetAccount ? "租金已含" : "";
  const o: Record<string, string> = {
    [HOUSE.idNumber]: p.owner.idNumber,
    [HOUSE.ownerPhone]: p.owner.phone,
    [HOUSE.ownerEmail]: p.owner.email,
    [HOUSE.mailingAddr]: p.owner.mailingAddr,
    [HOUSE.householdAddr]: p.owner.householdAddr,
    [HOUSE.feePercent]: p.house.feeDecimal,
    [HOUSE.layout]: p.house.rooms,
    [HOUSE.halls]: p.house.halls,
    [HOUSE.baths]: p.house.baths,
    [HOUSE.floor]: p.house.floor,
    [HOUSE.totalFloor]: form.totalFloor,
    [HOUSE.expectedRent]: p.house.expectedRent,
    [HOUSE.waterHeater]: p.house.waterHeaterType,
    [HOUSE.internetAccount]: p.house.internetAccount,
    [HOUSE.internetPassword]: p.house.internetPassword,
    [HOUSE.internetFee]: internetFee,
    [HOUSE.garbageNote]: p.house.garbageLocation ? `專用垃圾袋，放置位置 ${p.house.garbageLocation}` : "",
    [HOUSE.depositMonths]: ctx.depositMonths,
    [HOUSE.notarization]: "可不用",
    [HOUSE.listDate]: todayStr(),
    // 主表銀行欄（與子表並存）
    [HOUSE.bankAccountName]: p.bank.accountName,
    [HOUSE.bankName]: p.bank.institution,
    [HOUSE.bankCode]: p.bank.bankCode,
    [HOUSE.bankFullCode]: p.bank.fullCode,
    [HOUSE.branchName]: p.bank.branch,
    [HOUSE.branchCode]: p.bank.branchCode,
    [HOUSE.bankAccountNo]: p.bank.accountNo,
  };
  return prune(o);
}

// 收款子表新列（內層 row）
export function buildBankSubRow(p: ParsedContract): Record<string, string> {
  const o: Record<string, string> = {
    [BANK_SUB.accountName]: p.bank.accountName,
    [BANK_SUB.bankBranch]: bankBranchLabel(p.bank.institution, p.bank.branch),
    [BANK_SUB.branchName]: p.bank.branch,
    [BANK_SUB.bankCode]: p.bank.bankCode,
    [BANK_SUB.branchCode]: p.bank.branchCode,
    [BANK_SUB.fullCode]: p.bank.fullCode,
    [BANK_SUB.accountNo]: p.bank.accountNo,
  };
  return prune(o);
}

// 去掉空字串欄位（避免覆寫成空）
function prune(o: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(o)) if (v !== "" && v != null) out[k] = v;
  return out;
}
