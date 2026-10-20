"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Statement, StatementHit } from "@/lib/statement";

// /statement：代管表說明。貼上寄給屋主的代管表連結，用白話逐區說明這一期的錢怎麼算。
// 連結放在網址 # 後面（不會送到伺服器 log），可以把整個網址直接傳給屋主或同事。

const money = (v: number) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(v)).toLocaleString("en-US");
const num = (v: string | undefined) => Number((v || "").replace(/[,$\s]/g, "")) || 0;
const mmdd = (d: string) => d.slice(5).replace(/^0/, "").replace("/0", "/");

// 「隔月-5日」→「10 月 5 日（遇假日順延）」
function payDay(period: string, rule: string) {
  const m = rule.match(/(\d+)日/);
  if (!period || !m) return "";
  const next = (Number(period.slice(5, 7)) % 12) + 1;
  return `${next} 月 ${m[1]} 日前後（遇假日順延至下一個工作日）`;
}

function highlights(st: Statement): string[] {
  const out: string[] = [];
  const pay = payDay(st.period, st.payRule);
  out.push(`這一期（${st.period}）屋主實收 ${money(st.ownerReceives)}${pay ? `，預計 ${pay}匯款` : ""}。`);

  const cross = st.payments.filter((p) => p.inPeriod && p.crossMonth && p["款項類型"] === "租金");
  for (const p of cross) {
    out.push(
      `房客在 ${mmdd(p["支付時間"])} 先繳了 ${p["計費月份"]}的租金 ${money(num(p["金額"]))}。代管表依「實際收到錢的月份」計算，所以算在 ${st.period} 這一期。`,
    );
  }

  for (const r of st.repairs.filter((r) => r.inPeriod && num(r["費用"]))) {
    const what = [r["分類"], r["修繕項目"]].filter(Boolean).join("／");
    out.push(`本期扣除「${what}」${money(num(r["費用"]))}${r["其他說明"] ? `：${r["其他說明"]}` : ""}。`);
  }

  // 房客其他應繳／代墊：逐筆講，正數＝房客多繳轉給屋主，負數＝從租金扣掉（如屋主負擔的小修繕）
  const others = st.payments.filter(
    (p) => p.inPeriod && !["租金", "押金"].includes(p["款項類型"]) && num(p["金額"]),
  );
  for (const p of others) {
    const amt = num(p["金額"]);
    const what = p["說明"] && p["說明"] !== p["款項類型"] ? `${p["款項類型"]}（${p["說明"]}）` : p["款項類型"];
    out.push(
      amt > 0
        ? `房客另外繳了${what} ${money(amt)}，一併轉給屋主。`
        : `本期從租金扣除${what} ${money(Math.abs(amt))}${p["費用歸屬"] ? `，由${p["費用歸屬"]}負擔` : ""}。`,
    );
  }
  const other = st.lines.find((l) => l.label === "房客其他應繳／代墊");
  if (other && !others.length) {
    out.push(`房客其他應繳／代墊 ${money(other.amount)}，明細請見「房客繳租紀錄」。`);
  }

  // 其他加減：照登記的說明講；遞延＝上一期扣不完，延到本期扣
  const adj = st.lines.find((l) => l.label === "其他加減");
  if (adj) {
    const why = adj.note ? `：${adj.note}` : "";
    const defer = /遞延/.test(adj.note || "")
      ? "（上一期的費用比租金多、扣不完的部分，延到這一期再扣）"
      : "";
    out.push(`其他加減 ${money(adj.amount)}${why}${defer}。`);
  }

  if (st.depositThisMonth) {
    out.push(
      st.depositRule === "公司全持"
        ? `本期收到押金 ${money(st.depositThisMonth)}，依約由租寓全額保管，不會匯給屋主，也不影響本期金額。`
        : `本期收到押金 ${money(st.depositThisMonth)}，屋主持有的部分會在下一期反映到「押金紀錄」。`,
    );
  }

  const lastDeposit = st.deposits[st.deposits.length - 1];
  if (!st.depositThisMonth && st.depositRule && st.depositRule !== "公司全持" && lastDeposit) {
    out.push(`押金規則是「${st.depositRule}」，屋主目前持有押金 ${money(num(lastDeposit["屋主持有押金總額"]))}。`);
  }

  const fee = st.lines.find((l) => l.label === "代管費");
  if (fee && st.feeRule) out.push(`代管費 ${money(Math.abs(fee.amount))} = ${st.feeRule}（含稅）。`);

  const pending = st.repairs.filter((r) => r.pending);
  if (pending.length) out.push(`有 ${pending.length} 筆修繕尚未完成，費用之後才會回填。`);

  return out;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
      {hint && <p className="text-xs text-gray-500 mt-0.5 mb-2">{hint}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Table({
  cols,
  rows,
  money: moneyCols = [],
  rowClass,
  empty = "目前沒有紀錄",
}: {
  cols: string[];
  rows: Record<string, string>[];
  money?: string[];
  rowClass?: (r: Record<string, string>) => string;
  empty?: string;
}) {
  if (!rows.length) return <p className="text-sm text-gray-400">{empty}</p>;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-gray-500 border-b border-gray-200">
            {cols.map((c) => (
              <th key={c} className={"font-semibold py-2 px-2 whitespace-nowrap " + (moneyCols.includes(c) ? "text-right" : "text-left")}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={"border-b border-gray-100 " + (rowClass?.(r) || "")}>
              {cols.map((c) => (
                <td key={c} className={"py-2 px-2 align-top " + (moneyCols.includes(c) ? "text-right tabular-nums whitespace-nowrap" : "")}>
                  {moneyCols.includes(c) && r[c] !== "" ? money(num(r[c])) : r[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StatementPage() {
  const [link, setLink] = useState("");
  const [st, setSt] = useState<Statement | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hits, setHits] = useState<StatementHit[]>([]);
  const [needLogin, setNeedLogin] = useState(false);

  // 輸入框可貼連結，也可打房源名稱（名稱查詢需登入，由 /api/statement/search 把關）
  const submit = async (q: string) => {
    q = q.trim();
    if (!q) return;
    if (/^https?:\/\//.test(q)) return load(q);
    setLoading(true);
    setErr("");
    setSt(null);
    setHits([]);
    setNeedLogin(false);
    try {
      const res = await fetch("/api/statement/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      if (res.status === 401) {
        setNeedLogin(true);
        throw new Error("用房源名稱查詢需要先登入同仁帳號（貼代管表連結則不用）。");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "查詢失敗");
      const list: StatementHit[] = data.hits || [];
      if (!list.length) throw new Error(`找不到「${q}」的代管表，請確認房源名稱。`);
      if (list.length === 1) {
        setLink(list[0].link);
        setLoading(false);
        return load(list[0].link);
      }
      setHits(list);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const load = async (l: string) => {
    if (!l.trim()) return;
    setLoading(true);
    setErr("");
    setSt(null);
    setHits([]);
    try {
      const res = await fetch("/api/statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: l }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "讀取失敗");
      setSt(data);
      history.replaceState(null, "", "#" + encodeURIComponent(l.trim()));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    // 網址 # 帶了連結就直接讀（延到下一個 tick，避免在 effect 內同步 setState）
    Promise.resolve().then(() => {
      setLink(h);
      load(h);
    });
  }, []);

  const notes = st ? highlights(st) : [];

  const copyText = async () => {
    if (!st) return;
    const text = [`【${st.name} 代管表說明｜${st.period}】`, ...notes.map((t) => "・" + t)].join("\n");
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" style={{ colorScheme: "light", touchAction: "manipulation" }}>
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl mx-auto">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">‹ 回工作助手</Link>
        <h1 className="text-xl font-bold text-gray-800 mt-2 mb-1">🧾 代管表說明</h1>
        <p className="text-sm text-gray-500 mb-5">輸入房源名稱（同仁登入後可用），或貼上寄給屋主的代管表連結，逐項說明這一期的錢是怎麼算出來的。</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(link);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="房源名稱（例：宜誠君悅）或代管表連結"
            className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            disabled={loading || !link.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg px-5 py-2"
          >
            {loading ? "讀取中…" : "說明"}
          </button>
        </form>
        {err && (
          <p className="text-sm text-red-600 mt-3">
            {err}
            {needLogin && (
              <a href="/login?next=/statement" className="ml-2 text-blue-600 underline">
                前往登入
              </a>
            )}
          </p>
        )}

        {hits.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">找到 {hits.length} 筆，請選一間：</p>
            <div className="flex flex-col gap-2">
              {hits.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setLink(h.link);
                    load(h.link);
                  }}
                  className="text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-500 transition"
                >
                  <span className="block text-sm font-semibold text-gray-800">{h.name}</span>
                  <span className="block text-xs text-gray-500">
                    {h.address}
                    {h.company ? `｜${h.company}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {st && (
          <>
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="text-lg font-bold text-gray-800">{st.name}</div>
              <div className="text-xs text-gray-500">{st.address}</div>
            </div>

            {/* ── 重點 ── */}
            <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-blue-900">本期重點</span>
                <button onClick={copyText} className="text-xs text-blue-600 hover:text-blue-800">
                  {copied ? "已複製 ✓" : "複製文字（可貼給屋主）"}
                </button>
              </div>
              <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                {notes.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            {/* ── 當月代收代付結算 ── */}
            <Section
              title={`當月代收代付結算（${st.period}）`}
              hint="本月收租，加減修繕／代墊、房客其他應繳、其他加減，扣掉代管費，就是屋主應收。房客若跨月繳，會併到收到錢的那一期。"
            >
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                {st.lines.map((l) => (
                  <div key={l.label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                    <div className="min-w-0">
                      <div className="text-sm text-gray-800">{l.label}</div>
                      {l.note && <div className="text-xs text-gray-500">{l.note}</div>}
                    </div>
                    <div className={"text-sm tabular-nums font-semibold whitespace-nowrap " + (l.amount < 0 ? "text-red-600" : "text-gray-800")}>
                      {l.amount > 0 ? "+" : ""}
                      {money(l.amount)}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-b-xl">
                  <div className="text-sm font-bold text-gray-800">屋主應收</div>
                  <div className="text-lg font-bold tabular-nums text-gray-900">{money(st.ownerReceives)}</div>
                </div>
              </div>
              {Math.round(st.computedSum) !== Math.round(st.ownerReceives) && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                  ⚠️ 上面各項加總是 {money(st.computedSum)}，和系統的屋主應收 {money(st.ownerReceives)} 差了{" "}
                  {money(st.ownerReceives - st.computedSum)}。可能有其他欄位參與計算，請負責夥伴到 Ragic 確認。
                </p>
              )}
            </Section>

            <Section title="房客繳租紀錄" hint="會影響屋主應收的房客繳款。黃底＝這一期收到、有算進本期的款項。">
              <Table
                cols={["支付時間", "計費月份", "款項類型", "房間編號", "金額"]}
                money={["金額"]}
                rows={st.payments}
                rowClass={(r) => ((r as unknown as { inPeriod: boolean }).inPeriod ? "bg-yellow-50" : "")}
              />
            </Section>

            <Section title="修繕／費用紀錄" hint="與這間房有關的修繕與費用。尚未完成的項目費用可能先是 0，完成後回填。藍底＝算在本期。">
              <Table
                cols={["填寫日期", "分類", "修繕項目", "其他說明", "完成了?", "費用"]}
                money={["費用"]}
                rows={st.repairs}
                rowClass={(r) => ((r as unknown as { inPeriod: boolean }).inPeriod ? "bg-blue-50" : "")}
              />
            </Section>

            <Section title="出款紀錄" hint="租寓匯給屋主的每一筆款項。">
              <Table
                cols={["放款時間", "計費年月", "已收租金", "租寓修繕/代墊費用", "房客其他應繳/代墊", "代管費", "出款金額"]}
                money={["已收租金", "租寓修繕/代墊費用", "房客其他應繳/代墊", "代管費", "出款金額"]}
                rows={st.payouts.map((r) => ({ ...r, 計費年月: (r["計費年月"] || "").slice(0, 7) }))}
              />
              {st.totalPaidToOwner > 0 && (
                <p className="text-xs text-gray-500 mt-2">租寓管理期間屋主累計實收：{money(st.totalPaidToOwner)}</p>
              )}
            </Section>

            <Section
              title="押金紀錄"
              hint={
                st.depositRule === "公司全持"
                  ? "這間的押金規則是「公司全持」：房客押金由租寓保管，屋主不持有，所以這裡通常是空的。"
                  : "屋主目前持有的押金。本期有變動的話，會在下一期更新。"
              }
            >
              <Table cols={["紀錄時間", "屋主持有押金總額", "備註"]} money={["屋主持有押金總額"]} rows={st.deposits} />
            </Section>

            <Section title="房客契約" hint="目前與過去的租約。灰色＝已結束。">
              <Table
                cols={["房間名稱", "房客帳號名稱", "契約起始日", "契約結束日", "租金", "押金", "契約狀態"]}
                money={["租金", "押金"]}
                rows={st.leases}
                rowClass={(r) => ((r as unknown as { ended: boolean }).ended ? "text-gray-400 bg-gray-50" : "")}
              />
            </Section>

            <Section title="退款紀錄" hint="租寓退給解約房客等的款項。">
              <Table cols={["放款時間", "房間名稱", "退款種類", "退款對象", "金額"]} money={["金額"]} rows={st.refunds} />
            </Section>

            <Section title="代管資料">
              <div className="text-sm text-gray-700 space-y-1">
                <div>代管期間：{st.contract.start} ～ {st.contract.end}</div>
                {st.feeRule && <div>代管費：{st.feeRule}（含稅）</div>}
                {st.depositRule && <div>押金規則：{st.depositRule}</div>}
                {st.websiteUrl && (
                  <div>
                    官網頁面：
                    <a href={st.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                      {st.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
