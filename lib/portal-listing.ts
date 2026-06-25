// 把「線上版代管約」解析結果 + 房源/表單補充欄，組成「官網（zuyou.com.tw/houses/new）逐分頁上架欄位包」。
// 用途：產出一份可照填官網七分頁的對應表 + 缺漏清單，實際填表沿用既有瀏覽器流程；與 Ragic 寫入獨立。
// 對應依據見記憶 project-zuyou-listing-workflow（官網七分頁欄位對應表）。

import type { ParsedContract } from "./contract-parse";

export type PortalHouse = { name: string; addr: string; company: string };

export type PortalFormInputs = {
  totalFloor: string; // 總樓層（PDF 抽不到，表單填）
  area: string; // 空間大小 m²（PDF 抽不到，表單填）
  genderLimit: string; // 男女皆可 / 限男 / 限女
  foreigner: string; // 是 / 否（可否接受外國人）
  moveInDate: string; // 何時可入住（YYYY-MM-DD，預設＝契約起始日）
  photoCount: number; // 已上傳照片數
};

export type PortalField = { label: string; value: string; gap?: boolean; note?: string };
export type PortalTab = { tab: string; fields: PortalField[] };
export type PortalPackage = { tabs: PortalTab[]; gaps: string[]; text: string };

// 完整地址 → 縣市 / 鄉鎮市區 / 其餘。抽不出時回空字串（標記為缺漏待確認）。
function splitAddr(full: string): { city: string; district: string; rest: string } {
  const t = (full || "").trim();
  const m = t.match(/^(.{2,3}?[市縣])(.{1,4}?[區鄉鎮市])(.*)$/);
  return m ? { city: m[1], district: m[2], rest: m[3].trim() } : { city: "", district: "", rest: t };
}

const GAP = "（PDF 無，請確認）";

export function buildPortalPackage(
  p: ParsedContract,
  house: PortalHouse,
  form: PortalFormInputs
): PortalPackage {
  const gaps: string[] = [];
  const addr = splitAddr(house.addr);
  if (!addr.city || !addr.district) gaps.push("地址縣市/鄉鎮市區無法自動拆出，請手動確認");

  const fld = (label: string, value: string, opts: { gap?: boolean; note?: string } = {}): PortalField => {
    const empty = !value || !value.trim();
    if (empty && opts.gap) gaps.push(label);
    return { label, value: empty ? (opts.gap ? GAP : "") : value, gap: empty && opts.gap, note: opts.note };
  };

  // 傢俱及設施：只列「能從線上版確定」的；完整清單在現況確認書，需人工補。
  const facilities: string[] = [];
  if (p.house.waterHeaterType) facilities.push("熱水器");
  if (/瓦斯/.test(p.house.waterHeaterType)) facilities.push("天然瓦斯");
  if (p.house.internetAccount) facilities.push("網路（WiFi）");
  if (p.house.carSpaceNo) facilities.push("停車場");
  gaps.push("傢俱/設施完整清單請依現況確認書補勾（冷氣、廚具、煙霧探測器等）");

  const rentLayout = `${p.house.rooms || "?"}房${p.house.halls || "?"}廳${p.house.baths || "?"}衛`;
  const descDraft =
    `${house.name || "本物件"}，格局${rentLayout}` +
    (p.house.floor ? `、${p.house.floor}樓` : "") +
    (p.house.waterHeaterType ? `、${p.house.waterHeaterType}` : "") +
    (p.house.internetAccount ? "、附 WiFi" : "") +
    (p.house.carSpaceNo ? "、含停車位" : "") +
    "（草稿，請潤飾後再貼）";

  const tabs: PortalTab[] = [
    {
      tab: "Tab 1：基本資訊",
      fields: [
        fld("房型", "整層住家", { note: "預設值，請依實際確認" }),
        fld("管理模式", "業者代管", { note: "預設值" }),
        fld("縣市", addr.city, { gap: true }),
        fld("鄉鎮市區", addr.district, { gap: true }),
        fld("地址", addr.rest || house.addr, { gap: true }),
        fld("性別限制", form.genderLimit || "男女皆可"),
        fld("外國租客", form.foreigner || "是"),
      ],
    },
    {
      tab: "Tab 2：屋主資訊",
      fields: [
        fld("姓名", p.owner.name, { gap: true }),
        fld("身分證", p.owner.idNumber, { gap: true }),
        fld("聯絡電話", p.owner.phone, { gap: true }),
        fld("Email", p.owner.email),
        fld("印章/簽名", "", { note: "從代管約最後一頁簽章處擷取後上傳（瀏覽器流程處理）" }),
      ],
    },
    {
      tab: "Tab 3：空間與價格",
      fields: [
        fld("管理費", "", { gap: true, note: "線上版代管約未帶；請查 Ragic/現況確認書填" }),
        fld("押金（月）", "2", { note: "公司慣例固定 2 個月" }),
        fld("最短租期（月）", "12", { note: "預設，請確認" }),
        fld("月租", p.house.expectedRent, { gap: true }),
        fld("房間", p.house.rooms, { gap: true }),
        fld("客廳", p.house.halls, { gap: true }),
        fld("衛浴", p.house.baths, { gap: true }),
        fld("空間大小（m²）", form.area, { gap: true }),
        fld("所在樓層", p.house.floor, { gap: true }),
        fld("總樓層", form.totalFloor, { gap: true }),
        fld("停車位", p.house.carSpaceNo ? "個人停車位" : "", { note: p.house.carSpaceNo ? `編號 ${p.house.carSpaceNo}` : "PDF 無停車位編號" }),
      ],
    },
    {
      tab: "Tab 4：描述",
      fields: [
        fld("中文房名", house.name, { gap: true }),
        fld("英文房名", "", { note: "請自行命名" }),
        fld("房源描述", descDraft, { note: "自動草稿，請潤飾" }),
        fld("周邊環境", "", { note: "請依實際補充（鄰近交通/生活機能）" }),
      ],
    },
    {
      tab: "Tab 5：傢俱及設施",
      fields: [
        fld("可勾選（已確定）", facilities.join("、"), { note: "其餘請依現況確認書補勾" }),
        fld("水費/電費/瓦斯費/網路費（=租金內含才勾）", p.house.internetAccount ? "網路費（租金已含）" : "", { note: "費用類代表『租金內含』，務必逐項確認，勿照抄" }),
      ],
    },
    {
      tab: "Tab 6：照片",
      fields: [fld("照片", form.photoCount ? `${form.photoCount} 張（在本頁下方）` : "", { gap: true, note: "於官網『新版編輯區』上傳，並設定封面" })],
    },
    {
      tab: "Tab 7：空房時間",
      fields: [fld("何時可入住", form.moveInDate || "", { gap: true, note: "預設＝契約起始日，可依實際調整" })],
    },
  ];

  // 缺漏去重
  const gapsUniq = Array.from(new Set(gaps));

  // 純文字版（方便整包複製/交接）
  const lines: string[] = [];
  lines.push(`【官網上架欄位包】${house.name || "（未選房源）"}`);
  lines.push(`地址：${house.addr || "—"}`);
  lines.push("");
  for (const t of tabs) {
    lines.push(`# ${t.tab}`);
    for (const f of t.fields) {
      const v = f.value || "—";
      lines.push(`- ${f.label}：${v}${f.note ? `　〔${f.note}〕` : ""}`);
    }
    lines.push("");
  }
  if (gapsUniq.length) {
    lines.push("# ⚠️ 待補/待確認");
    for (const g of gapsUniq) lines.push(`- ${g}`);
  }

  return { tabs, gaps: gapsUniq, text: lines.join("\n") };
}
