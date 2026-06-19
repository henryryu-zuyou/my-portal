"use client";
import { useMemo, useState } from "react";

const DEPOSIT_MONTH = "2"; // 押金固定 2 個月（公司慣例）
type Photo = { file: File; url: string };

type House = { ragicId: string; name: string; addr: string; company: string; listed: boolean };
type FillResult = {
  success: boolean;
  error?: string;
  houseUrl?: string;
  owner?: { existed: boolean; ragicId: string; name: string; idNumber: string };
  parsed?: {
    owner: { name: string; idNumber: string; phone: string; email: string };
    bank: { institution: string; branch: string; fullCode: string; accountNo: string };
    house: { rooms: string; halls: string; baths: string; expectedRent: string };
  };
  contractSubtableHint?: string;
};

export default function ListingPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<House[]>([]);
  const [searching, setSearching] = useState(false);
  const [house, setHouse] = useState<House | null>(null);

  const [pdf, setPdf] = useState<File | null>(null);
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [caseNo, setCaseNo] = useState("");
  const [totalFloor, setTotalFloor] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FillResult | null>(null);

  // 文字資料包 + 照片（獨立於 Ragic 流程，供手動到後台刊登/交接用）
  const [area, setArea] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pkg, setPkg] = useState(false);
  const [copied, setCopied] = useState(false);

  const field = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  const onPhotos = (files: FileList | null) => {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };
  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const summary = useMemo(() => {
    const L: string[] = [];
    L.push(`【官網上架資料包】${house?.name || "（未選房源）"}`);
    L.push("");
    L.push(`房源：${house?.name || "—"}${house?.addr ? `（${house.addr}）` : ""}`);
    L.push(`代管約 PDF：${pdf ? pdf.name : "（未上傳）"}`);
    L.push(`契約期間：${contractStart || "—"} ～ ${contractEnd || "—"}`);
    L.push(`原案場編號：${caseNo || "—"}`);
    L.push(`總樓層：${totalFloor || "—"}　空間大小（m²）：${area || "—"}`);
    L.push(`押金（月）：${DEPOSIT_MONTH}（固定）`);
    L.push(`照片：${photos.length} 張`);
    return L.join("\n");
  }, [house, pdf, contractStart, contractEnd, caseNo, totalFloor, area, photos]);

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const download = () => {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${house?.name || "上架資料包"}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const search = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(`/api/houses/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.houses || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const canSubmit = house && pdf && contractStart && contractEnd && caseNo && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.set("houseRagicId", house!.ragicId);
      fd.set("pdf", pdf!);
      fd.set("contractStart", contractStart);
      fd.set("contractEnd", contractEnd);
      fd.set("caseNo", caseNo);
      fd.set("totalFloor", totalFloor);
      const res = await fetch("/api/listing-fill", { method: "POST", body: fd });
      setResult(await res.json());
    } catch (e) {
      setResult({ success: false, error: String(e) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg mx-auto">
        <a href="/" className="text-xs text-gray-400 hover:text-gray-600">‹ 回工作助手</a>
        <h1 className="text-xl font-bold text-gray-800 mt-2 mb-1">🏢 官網上架</h1>
        <p className="text-sm text-gray-500 mb-6">
          選定 Ragic 房源、上傳「線上版」代管約 PDF，自動把屋主、房源、收款帳戶資料補填進 Ragic。
        </p>

        <div className="flex flex-col gap-5">
          {/* 1. 選房源 */}
          <div>
            <label className={label}>1. 選定房源 *</label>
            {house ? (
              <div className="flex items-center justify-between border border-green-300 bg-green-50 rounded-lg px-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block font-semibold text-gray-800 truncate">{house.name}</span>
                  <span className="block text-xs text-gray-500 truncate">{house.addr}（{house.company}）</span>
                </span>
                <button onClick={() => setHouse(null)} className="ml-2 text-xs text-gray-400 hover:text-red-500 shrink-0">更換</button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    className={field}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && search()}
                    placeholder="輸入房源名稱或地址關鍵字"
                  />
                  <button onClick={search} disabled={searching} className="shrink-0 px-4 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 disabled:bg-gray-300">
                    {searching ? "…" : "搜尋"}
                  </button>
                </div>
                {results.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg divide-y max-h-56 overflow-auto">
                    {results.map((h) => (
                      <button key={h.ragicId} onClick={() => { setHouse(h); setResults([]); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm">
                        <span className="font-medium text-gray-800">{h.name}</span>
                        {h.listed && <span className="ml-2 text-[10px] text-green-600 bg-green-50 rounded px-1">已上架</span>}
                        <span className="block text-xs text-gray-500 truncate">{h.addr}（{h.company}）</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 2. 上傳線上版 PDF */}
          <div>
            <label className={label}>2. 上傳代管約 PDF（線上版）*</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm hover:file:bg-blue-100"
            />
            {pdf && <p className="text-xs text-gray-500 mt-1">已選：{pdf.name}（{(pdf.size / 1024 / 1024).toFixed(1)} MB）</p>}
            <p className="text-xs text-amber-600 mt-1">⚠️ 須為電子簽署「線上版」（有文字層）；掃描版無法解析。</p>
          </div>

          {/* 3. 補充欄（線上版抽不到） */}
          <hr className="border-gray-100" />
          <p className="text-sm font-semibold text-gray-700">補充資訊（PDF 沒有，需另填）</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>契約起始日 *</label>
              <input type="date" className={field} value={contractStart} onChange={(e) => setContractStart(e.target.value)} />
            </div>
            <div>
              <label className={label}>契約結束日 *</label>
              <input type="date" className={field} value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>原案場編號 *</label>
              <input className={field} value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="例：2026--862-欣時代14" />
            </div>
            <div>
              <label className={label}>總樓層</label>
              <input className={field} inputMode="numeric" value={totalFloor} onChange={(e) => setTotalFloor(e.target.value)} placeholder="30" />
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            {submitting ? "寫入 Ragic 中…（請稍候）" : "解析並寫入 Ragic"}
          </button>
        </div>

        {/* 結果 */}
        {result && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            {result.success ? (
              <>
                <h2 className="text-base font-bold text-green-700 mb-3">✅ 已寫入 Ragic</h2>
                <div className="text-sm text-gray-700 space-y-1 mb-3">
                  <p>屋主：<b>{result.owner?.name}</b>（{result.owner?.idNumber}）— {result.owner?.existed ? "沿用既有屋主檔" : "已新建屋主檔"}</p>
                  {result.parsed && (
                    <>
                      <p>格局：{result.parsed.house.rooms}房{result.parsed.house.halls}廳{result.parsed.house.baths}衛｜期待租金 {result.parsed.house.expectedRent}</p>
                      <p>收款帳戶：{result.parsed.bank.institution} {result.parsed.bank.branch}（{result.parsed.bank.fullCode}）/ {result.parsed.bank.accountNo}</p>
                    </>
                  )}
                </div>
                {result.houseUrl && (
                  <a href={result.houseUrl} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline mb-3">
                    🔗 在 Ragic 開啟此房源
                  </a>
                )}
                {result.contractSubtableHint && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    📎 {result.contractSubtableHint}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">❌ {result.error}</p>
            )}
          </div>
        )}
      </div>

      {/* 文字資料包 + 照片（獨立功能：供手動到 Zuyou 後台刊登／交接） */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg mx-auto mt-6">
        <h2 className="text-base font-bold text-gray-800 mb-1">📦 官網上架資料包（文字＋照片）</h2>
        <p className="text-xs text-gray-500 mb-4">與上方 Ragic 寫入獨立；產生文字摘要與照片，供手動到 Zuyou 後台刊登或交接用。</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className={label}>房源照片</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onPhotos(e.target.files)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm hover:file:bg-blue-100"
            />
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.file.name} className="w-full h-16 object-cover rounded-md border" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none opacity-0 group-hover:opacity-100 transition">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-1/2">
            <label className={label}>空間大小（m²）</label>
            <input className={field} inputMode="numeric" value={area} onChange={(e) => setArea(e.target.value)} placeholder="70" />
          </div>

          <button type="button" onClick={() => setPkg(true)} className="w-full bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-900 transition">
            產生文字資料包
          </button>
        </div>

        {pkg && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap mb-3">{summary}</pre>
            <div className="flex gap-2">
              <button onClick={copy} className="flex-1 bg-gray-800 text-white text-sm py-2 rounded-lg hover:bg-gray-900 transition">{copied ? "已複製 ✓" : "複製摘要"}</button>
              <button onClick={download} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50 transition">下載 .txt</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
