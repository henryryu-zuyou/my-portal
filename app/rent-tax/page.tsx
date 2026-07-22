"use client";
import { useMemo, useState } from "react";

// ── 各身分別課稅規則（依「房東的租賃所得」圖表）───────────────
// 輸入：每月租金 R。回傳月額 { free 免稅, deduct 可扣除, incl 併入所得 }
type Split = { free: number; deduct: number; incl: number };
type RentType = {
  idx: number;
  name: string;
  note: string;
  calc: (R: number) => Split;
};

const TYPES: RentType[] = [
  {
    idx: 1,
    name: "房東自租",
    note: "扣除 43%／併入 57%",
    calc: (R) => ({ free: 0, deduct: R * 0.43, incl: R * 0.57 }),
  },
  {
    idx: 2,
    name: "公益出租人",
    note: "月 $15,000 免稅",
    calc: (R) => {
      const free = Math.min(R, 15000);
      const ex = Math.max(R - 15000, 0);
      return { free, deduct: ex * 0.43, incl: ex * 0.57 };
    },
  },
  {
    idx: 3,
    name: "包租代管",
    note: "月 $6,000 免稅 · 分段扣除",
    calc: (R) => {
      const free = Math.min(R, 6000);
      const t1 = Math.max(Math.min(R, 20000) - 6000, 0); // $6k–$20k
      const t2 = Math.max(R - 20000, 0); // >$20k
      return { free, deduct: t1 * 0.53 + t2 * 0.43, incl: t1 * 0.47 + t2 * 0.57 };
    },
  },
  {
    idx: 4,
    name: "社會住宅包租代管",
    note: "月 $15,000 免稅 · 扣除 60%",
    calc: (R) => {
      const free = Math.min(R, 15000);
      const ex = Math.max(R - 15000, 0);
      return { free, deduct: ex * 0.6, incl: ex * 0.4 };
    },
  },
];

const RATE_PRESETS = [5, 12, 20, 30, 40];

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export default function RentTaxPage() {
  const [rent, setRent] = useState(30000); // 每月收租金額
  const [rate, setRate] = useState(5); // 綜合所得稅率(%)

  const rows = useMemo(() => {
    const R = Math.max(rent || 0, 0);
    const r = Math.max(rate || 0, 0) / 100;
    const annual = R * 12;
    const list = TYPES.map((t) => {
      const m = t.calc(R);
      const tax = m.incl * 12 * r;
      return {
        idx: t.idx,
        name: t.name,
        note: t.note,
        free: m.free * 12,
        deduct: m.deduct * 12,
        incl: m.incl * 12,
        tax,
        net: annual - tax,
      };
    });
    const minTax = Math.min(...list.map((x) => x.tax));
    return { list, minTax, annual };
  }, [rent, rate]);

  const best = rows.list.filter((x) => x.tax === rows.minTax);
  const saveVsSelf = rows.list[0].tax - rows.minTax;

  const field =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl mx-auto">
        <a href="/" className="text-xs text-gray-400 hover:text-gray-600">
          ‹ 回工作助手
        </a>
        <h1 className="text-xl font-bold text-gray-800 mt-2 mb-1">🧮 房東租賃所得稅試算</h1>
        <p className="text-sm text-gray-500 mb-6">
          輸入每月租金，比較「房東自租／公益出租人／包租代管／社會住宅包租代管」四種身分的年度應繳稅額。
        </p>

        {/* ── 輸入 ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>每月收租金額</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                NT$
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={rent}
                onChange={(e) => setRent(Number(e.target.value))}
                className={field + " pl-11 text-right font-semibold tabular-nums"}
              />
            </div>
          </div>
          <div>
            <label className={label}>年收租金（自動計算）</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                NT$
              </span>
              <input
                readOnly
                value={rows.annual.toLocaleString("en-US")}
                className={
                  "w-full border border-dashed border-gray-300 bg-gray-50 rounded-lg px-3 py-2 pl-11 text-sm text-right font-semibold text-gray-600 tabular-nums"
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={label}>綜合所得稅率（可變更）</label>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-28">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step={1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className={field + " pr-7 text-right font-semibold tabular-nums"}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                %
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {RATE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRate(p)}
                  className={
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition " +
                    (rate === p
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500")
                  }
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            套用於「併入所得」的稅率，預設 5%（最低級距），可依所得級距自行調整。
          </p>
        </div>

        {/* ── 最省稅 ───────────────────────── */}
        {rent > 0 && (
          <div className="mt-6 flex items-center gap-3 flex-wrap rounded-xl border border-green-300 bg-green-50 px-4 py-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-green-600 text-white shrink-0">
              最省稅方案
            </span>
            <span className="text-sm text-green-800 leading-relaxed">
              選擇 <b>{best.map((b) => b.name).join("、")}</b> 應繳稅額最低，全年約{" "}
              <b className="text-base tabular-nums">{money(rows.minTax)}</b>
              {saveVsSelf > 0.5 && (
                <>
                  ，較房東自租每年可少繳{" "}
                  <b className="tabular-nums">{money(saveVsSelf)}</b>。
                </>
              )}
            </span>
          </div>
        )}

        {/* ── 試算表 ───────────────────────── */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="text-xs text-gray-500 border-b-2 border-gray-200">
                <th className="text-left font-semibold py-2.5 px-3">類型</th>
                <th className="text-right font-semibold py-2.5 px-3 whitespace-nowrap">年免稅</th>
                <th className="text-right font-semibold py-2.5 px-3 whitespace-nowrap">年可扣除</th>
                <th className="text-right font-semibold py-2.5 px-3 whitespace-nowrap">年併入所得</th>
                <th className="text-right font-semibold py-2.5 px-3 whitespace-nowrap">應繳稅額 / 年</th>
                <th className="text-right font-semibold py-2.5 px-3 whitespace-nowrap">稅後年淨收</th>
              </tr>
            </thead>
            <tbody>
              {rows.list.map((r) => {
                const win = r.tax === rows.minTax && rent > 0;
                return (
                  <tr
                    key={r.idx}
                    className={"border-b border-gray-100 " + (win ? "bg-green-50" : "")}
                  >
                    <td className="py-3.5 px-3 text-left">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-green-100 text-green-700 text-xs font-bold shrink-0">
                          {r.idx}
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                        {win && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">
                            最省
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 ml-7">{r.note}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right text-sm text-gray-500 tabular-nums whitespace-nowrap">
                      {money(r.free)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-sm text-gray-700 tabular-nums whitespace-nowrap">
                      {money(r.deduct)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-sm text-gray-700 tabular-nums whitespace-nowrap">
                      {money(r.incl)}
                    </td>
                    <td
                      className={
                        "py-3.5 px-3 text-right font-bold tabular-nums whitespace-nowrap " +
                        (win ? "text-green-700" : "text-gray-900")
                      }
                    >
                      {money(r.tax)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-sm text-gray-500 tabular-nums whitespace-nowrap">
                      {money(r.net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── 規則說明 ───────────────────────── */}
        <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">計算規則</p>
          <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-500 leading-relaxed">
            <li>
              <b className="text-gray-700">房東自租</b>：無免稅額，全額扣除必要費用 43%，其餘 57% 併入所得。
            </li>
            <li>
              <b className="text-gray-700">公益出租人</b>（房客申請租金補貼）：每月租金 $15,000 免稅，超過部分扣除
              43%、57% 併入所得。
            </li>
            <li>
              <b className="text-gray-700">包租代管</b>：每月 $6,000 免稅；$6,000～$20,000 段扣除 53%（47%
              併入）；超過 $20,000 段扣除 43%（57% 併入）。
            </li>
            <li>
              <b className="text-gray-700">社會住宅包租代管</b>：每月租金 $15,000 免稅，超過部分扣除 60%、40%
              併入所得。
            </li>
            <li>
              <b className="text-gray-700">應繳稅額</b> ＝ 年併入所得 ×
              綜合所得稅率。實際稅額仍需併入個人綜合所得、扣除免稅額與扣除額後依累進稅率計算，本表為單一租屋之簡化估算，僅供參考。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
