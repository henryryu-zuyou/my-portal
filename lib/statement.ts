// 代管表說明：把 Ragic 代管表（forms16/<表>/<筆>）整理成給屋主看的白話結構。
// 資料來源是寄給屋主的「代管表連結」：連結裡的 rmlc 權杖只能讀那一筆，
// 所以這裡不需要 RAGIC_API_KEY。說明順序依「代管表說明_2025.05版」簡報。

const RAGIC_HOST = "ap14.ragic.com";
const ACCOUNT = "zuyou2022";

export type LinkTarget = { sheet: string; id: string; rmlc: string };

// 只接受租寓 Ragic 的代管表連結，避免被拿來當任意網址的 proxy
export function parseStatementLink(raw: string): LinkTarget | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.hostname !== RAGIC_HOST) return null;
  const m = u.pathname.match(new RegExp(`^/${ACCOUNT}/forms16/(\\d+)/(\\d+)$`));
  if (!m) return null;
  const rmlc = u.searchParams.get("rmlc") || "";
  if (!rmlc.endsWith(`${ACCOUNT}/forms16/${m[1]}`)) return null;
  return { sheet: m[1], id: m[2], rmlc };
}

export async function fetchStatementRecord(t: LinkTarget): Promise<Record<string, unknown>> {
  const url =
    `https://${RAGIC_HOST}/${ACCOUNT}/forms16/${t.sheet}/${t.id}` +
    `?api&subtable=1&rmlc=${encodeURIComponent(t.rmlc)}`;
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15000) });
      const data = await res.json();
      if (data?.status === "ERROR") throw new Error(String(data.msg || "Ragic 回傳錯誤"));
      const rec = data?.[t.id];
      if (!rec || typeof rec !== "object") throw new Error("NOT_FOUND");
      return rec as Record<string, unknown>;
    } catch (e) {
      lastErr = e;
      if ((e as Error).message === "NOT_FOUND") break;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

// ── 用房源名稱找代管表（限登入同仁）──────────────────
// 用同事的 RAGIC_READONLY_KEY：**只能 GET，禁止任何寫入**。
// 「代管表-桃園」forms16/2148 是 代管表 forms16/1 的子檢視，同一批資料，所以搜 forms16/1 涵蓋各區。

export type StatementHit = { id: string; name: string; address: string; company: string; link: string };

export async function searchStatements(q: string): Promise<StatementHit[]> {
  const key = process.env.RAGIC_READONLY_KEY;
  if (!key) throw new Error("NO_KEY");
  const kw = q.trim().replace(/實驗室$/, "");
  const url =
    `https://${RAGIC_HOST}/${ACCOUNT}/forms16/1?api&subtable=0&limit=20` +
    `&fts=${encodeURIComponent(kw)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Basic ${key}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (data?.status === "ERROR") throw new Error(String(data.msg || "Ragic 回傳錯誤"));
  const hits = Object.values(data as Record<string, Record<string, unknown>>)
    .filter((r) => r && r._ragicId != null)
    .map((r) => ({
      id: s(r._ragicId),
      name: s(r["房源名稱"]),
      address: s(r["完整地址"]),
      company: s(r["管理公司"]),
      link: s(r["代管表連結"]),
    }))
    .filter((h) => parseStatementLink(h.link));
  // fts 是全文搜尋，地址或備註裡有關鍵字也會中；名稱有中的排前面
  const byName = hits.filter((h) => h.name.includes(kw));
  return byName.length ? byName : hits;
}

// ── 整理 ─────────────────────────────────────────

type Row = Record<string, string>;

const s = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v));
const n = (v: unknown) => {
  const t = s(v).replace(/[,$\s]/g, "");
  const x = Number(t);
  return t === "" || Number.isNaN(x) ? 0 : x;
};
const ym = (d: string) => d.replace(/-/g, "/").slice(0, 7); // 2026/09/01 → 2026/09

// subtable 的 key 是欄位 ID（各區代管表不一定相同），所以用欄位名稱辨認是哪一張子表
function subtables(rec: Record<string, unknown>): Row[][] {
  return Object.entries(rec)
    .filter(([k, v]) => k.startsWith("_subtable_") && v && typeof v === "object")
    .map(([, v]) =>
      Object.values(v as Record<string, Record<string, unknown>>).map((r) => {
        const o: Row = {};
        for (const [k, val] of Object.entries(r)) if (!k.startsWith("_")) o[k] = s(val);
        return o;
      }),
    );
}
const findSub = (subs: Row[][], col: string) => subs.find((rows) => rows.length && col in rows[0]) || [];

export type Line = { label: string; amount: number; note?: string };

export type Statement = {
  name: string;
  address: string;
  websiteUrl: string;
  period: string; // 今期計算支付月 2026/09
  payRule: string; // 代管費請款時間：隔月-5日
  lines: Line[];
  ownerReceives: number;
  computedSum: number;
  feeRule: string;
  depositRule: string;
  depositThisMonth: number;
  contract: { start: string; end: string; status: string };
  payments: (Row & { inPeriod: boolean; crossMonth: boolean })[];
  repairs: (Row & { inPeriod: boolean; pending: boolean })[];
  payouts: Row[];
  deposits: Row[];
  leases: (Row & { ended: boolean })[];
  refunds: Row[];
  totalPaidToOwner: number;
};

export function buildStatement(rec: Record<string, unknown>): Statement {
  const g = (k: string) => s(rec[k]);
  const period = g("計費年月(文字化)") || ym(g("今期計算支付月"));
  const periodMonth = Number(period.slice(5, 7));

  // 結算各項（順序同代管表）；0 元的次要項目不列，避免屋主看了疑惑
  const lines: Line[] = [];
  const add = (label: string, amount: number, note?: string, always = false) => {
    if (always || amount !== 0) lines.push({ label, amount, note: note || undefined });
  };
  add("本月收租", n(rec["本月收租"]), "本期實際收到的房客租金", true);
  if (g("能源費給屋主?") !== "X") add("能源／網路費", n(rec["能源/網路費"]), g("→計算說明"));
  add("屋主押金收入", n(rec["屋主押金收入"]), g("→押金計算說明"));
  add("修繕費用／租寓代墊", n(rec["修繕費用/租寓代墊"]), "見下方「修繕／費用紀錄」");
  const otherAmt = n(rec["房客其他應繳/代墊"]);
  add(
    "房客其他應繳／代墊",
    otherAmt,
    otherAmt > 0 ? "房客另外繳、要轉給屋主的費用（如社區管理費）" : "從租金中扣除的代墊費用，見下方「房客繳租紀錄」",
  );
  add("違約金", n(rec["違約金"]));
  add("其他加減", n(rec["其他加減"]), g("→加減說明"));
  add("代管費", n(rec["代管費"]), undefined, true);
  const computedSum = lines.reduce((a, l) => a + l.amount, 0);

  // 代管費怎麼算
  const methods = Array.isArray(rec["代管收費方法"]) ? (rec["代管收費方法"] as unknown[]).map(s) : [g("代管收費方法")];
  const pct = n(rec["%數"]);
  const fixed = n(rec["固定金額"]);
  let feeRule = "";
  if (methods.includes("%數") && pct) feeRule = `本月收租 × ${+(pct * 100).toFixed(2)}%`;
  else if (fixed) feeRule = `固定每月 $${fixed.toLocaleString("en-US")}`;
  const feeLine = lines.find((l) => l.label === "代管費");
  if (feeLine && feeRule) feeLine.note = feeRule + "（含稅）";

  const subs = subtables(rec);

  // 旗標欄位是 boolean，跟 Row 的字串 index signature 打架，所以三處都 cast
  const payments = findSub(subs, "款項類型").map((r) => {
    const paidYm = r["支付年月轉文字"] || ym(r["支付時間"] || "");
    const billMonth = Number((r["計費月份"] || "").replace(/\D/g, ""));
    return {
      ...r,
      inPeriod: paidYm === period,
      crossMonth: !!billMonth && !!periodMonth && billMonth !== periodMonth,
    };
  }) as unknown as Statement["payments"];

  const repairs = findSub(subs, "修繕位置").map((r) => ({
    ...r,
    inPeriod: (r["月份轉文字"] || ym(r["計費月份"] || "")) === period,
    pending: r["完成了?"] !== "Yes",
  })) as unknown as Statement["repairs"];

  const leases = findSub(subs, "契約起始日")
    // 同一份契約封存後會留一列舊的，屋主看會以為有兩份；只留進行中或已結束的
    .filter((r) => r["契約狀態"] !== "已封存")
    .map((r) => {
      // 契約網址要另外的帳密，不在這裡外流
      const { 契約網址: _u, 下載連結: _d, ...rest } = r;
      void _u;
      void _d;
      return { ...rest, ended: r["契約狀態"] !== "契約進行中" };
    }) as unknown as Statement["leases"];

  return {
    name: g("房源名稱"),
    address: g("完整地址"),
    websiteUrl: g("網站連結"),
    period,
    payRule: g("代管費請款時間"),
    lines,
    ownerReceives: n(rec["屋主應收"]),
    computedSum,
    feeRule,
    depositRule: g("代收押金規則"),
    depositThisMonth: n(rec["本月收押"]),
    contract: { start: g("起始日期"), end: g("結束日期"), status: g("契約存續狀態") },
    payments,
    repairs,
    payouts: findSub(subs, "出款金額"),
    deposits: findSub(subs, "屋主持有押金總額"),
    leases,
    refunds: findSub(subs, "退款種類"),
    totalPaidToOwner: n(rec["租寓管理期間屋主總實收"]),
  };
}
