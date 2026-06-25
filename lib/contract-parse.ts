// 解析「線上版」代管約 PDF 全文 → 結構化欄位。
// 線上版有文字層；PDF 用大量 CJK 部首/相容異體字，先 NFKC 正規化，再補 NFKC 漏掉的字。
// 已知缺口（線上版模板未填）：委託管理期間(契約起迄)、原案場編號、總樓層、空間大小 → 由表單輸入。

export type ParsedContract = {
  owner: {
    name: string;
    idNumber: string;
    phone: string;
    email: string;
    householdAddr: string;
    mailingAddr: string;
  };
  bank: {
    institution: string; // 元大銀行
    branch: string; // 樹林分行
    fullCode: string; // 8061319
    bankCode: string; // 806
    branchCode: string; // 1319
    accountName: string; // 江佩蓉
    accountNo: string; // 2132700118912
  };
  house: {
    feeDecimal: string; // 代管費%數，以小數存：10.00% → "0.1"
    rooms: string; // 2
    halls: string; // 2
    baths: string; // 2
    expectedRent: string; // 26000
    waterHeaterType: string; // 瓦斯熱水器
    internetAccount: string; // Ethan
    internetPassword: string; // 0928544086
    garbageLocation: string; // B1
    carSpaceNo: string; // 71
    floor: string; // 所在樓層，從門牌抽：80 號 14 樓 → 14
  };
  meta: {
    signDate: string; // 2026/6/18（電子簽署完成日）
    creatorEmail: string; // henryryu@zuyou.com.tw（建立業務）
    contractNo: string; // ZY-202606-0017
  };
};

// NFKC 後仍殘留的部首區字元補正（CJK Radicals Supplement U+2E80–2EFF 多無正規化映射）
const CHAR_FIX: Record<string, string> = { "⺠": "民" }; // ⺠ → 民

function normalize(raw: string): string {
  let t = raw.normalize("NFKC");
  for (const [from, to] of Object.entries(CHAR_FIX)) t = t.split(from).join(to);
  return t;
}

function grab(t: string, re: RegExp): string {
  const m = t.match(re);
  return m ? m[1].trim() : "";
}

// 偵測是否為「可解析的線上版」：要有文字層且含關鍵錨點
export function looksLikeOnlineContract(rawText: string): boolean {
  const t = normalize(rawText);
  return t.length > 500 && /委託人/.test(t) && /身分證字號/.test(t);
}

export function parseContract(rawText: string): ParsedContract {
  const t = normalize(rawText);

  // 代管費：10.00% → 小數
  const pct = grab(t, /月租金額\s*([0-9.]+)\s*%/);
  const feeDecimal = pct ? String(Number(pct) / 100) : "";

  // 收款帳戶：金融機構 : 元大銀行 、分行 : 樹林分行 、代號 : 8061319 戶名 : 江佩蓉 、帳號 : 2132700118912
  const fullCode = grab(t, /代號\s*[:：]\s*(\d{6,})/);

  // 熱水器/網路：取 ☑ 勾選的那個選項
  const heaterSeg = grab(t, /(熱水器類型\s*【[^】]*】)/);
  const waterHeaterType = grab(heaterSeg, /☑\s*([^\s☐☑】]+)/);

  const num = (s: string) => s.replace(/,/g, "");

  return {
    owner: {
      name: grab(t, /委託人\s*[:：]\s*([^\s受託(（]+)/),
      idNumber: grab(t, /身分證字號\s*[:：]\s*([A-Z][0-9]{9})/),
      phone: grab(t, /聯絡電話\s*[:：]\s*(09[\d\s-]{8,12})/).replace(/[\s-]/g, ""),
      email: grab(t, /電子郵件信箱\s*[:：]\s*([\w.+-]+@[\w.-]+)/),
      householdAddr: grab(t, /戶籍地址\s*[:：]\s*(.+?)\s*通訊地址/),
      mailingAddr: grab(t, /通訊地址\s*[:：]\s*(.+?)\s*聯絡電話/),
    },
    bank: {
      institution: grab(t, /金融機構\s*[:：]\s*([^\s、]+)/),
      branch: grab(t, /、\s*分行\s*[:：]\s*([^\s、]+)/),
      fullCode,
      bankCode: fullCode ? fullCode.slice(0, 3) : "",
      branchCode: fullCode ? fullCode.slice(3) : "",
      accountName: grab(t, /戶名\s*[:：]\s*([^\s、]+)/),
      accountNo: grab(t, /帳號\s*[:：]\s*(\d{8,})/),
    },
    house: {
      feeDecimal,
      rooms: grab(t, /建物現況格局\s*[:：]\s*(\d+)\s*房/),
      halls: grab(t, /房\s*\(\s*間、室\s*\)\s*(\d+)\s*廳/),
      baths: grab(t, /廳\s*(\d+)\s*衛/),
      expectedRent: num(grab(t, /預期租金期望價格\s*\$?([\d,]+)/)),
      waterHeaterType,
      internetAccount: grab(t, /網路費[^【]*【\s*帳號\s*([^\s;；】]+)/),
      internetPassword: grab(t, /網路費[^【]*【[^】]*密碼\s*([^\s;；】]+)/),
      garbageLocation: grab(t, /放置位置\s*[:：]\s*([A-Za-z0-9]+)/),
      carSpaceNo: grab(t, /汽車停車位編號\s*([A-Za-z0-9-]+)/),
      floor: grab(t, /號\s*(\d+)\s*樓/),
    },
    meta: {
      signDate: grab(t, /簽署完成時間\s*[:：]\s*([\d/]+)/),
      creatorEmail: grab(t, /建立業務\s*[:：]\s*([\w.+-]+@[\w.-]+)/),
      contractNo: grab(t, /合約編號\s*[:：]\s*([\w-]+)/),
    },
  };
}
