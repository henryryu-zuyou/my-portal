"use client";
import { useState } from "react";

type Photo = { file: File; url: string };
type House = { ragicId: string; name: string; addr: string; company: string; listed: boolean };

type PortalField = { label: string; value: string; gap?: boolean; note?: string };
type PortalTab = { tab: string; fields: PortalField[] };
type PortalPackage = { tabs: PortalTab[]; gaps: string[]; text: string };
type PortalResult = {
  success: boolean;
  error?: string;
  package?: PortalPackage;
  parsed?: { contract?: { startDate: string; endDate: string; reviewDate: string } };
};

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
  // 全新房源（不在 Ragic）手動輸入模式
  const [newMode, setNewMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddr, setNewAddr] = useState("");
  const [newCompany, setNewCompany] = useState("");

  // 共用輸入
  const [pdf, setPdf] = useState<File | null>(null);
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [caseNo, setCaseNo] = useState("");
  const [totalFloor, setTotalFloor] = useState("");
  const [area, setArea] = useState("");
  const [genderLimit, setGenderLimit] = useState("男女皆可");
  const [foreigner, setForeigner] = useState("是");
  const [moveInDate, setMoveInDate] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  // ① 官網上架包
  const [portalLoading, setPortalLoading] = useState(false);
  const [portal, setPortal] = useState<PortalResult | null>(null);
  const [copied, setCopied] = useState(false);

  // ② Ragic 寫入
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FillResult | null>(null);

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

  const effectiveMoveIn = moveInDate || contractStart;
  // ① 官網包用的房源：既有 Ragic 房源，或全新手動房源（需有名稱）
  const effHouse: House | null =
    house ??
    (newMode && newName.trim()
      ? { ragicId: "", name: newName.trim(), addr: newAddr.trim(), company: newCompany.trim(), listed: false }
      : null);
  const canPortal = !!(effHouse && pdf) && !portalLoading;
  // ② 回填 Ragic 僅支援既有房源（需選定）；契約起迄日以 PDF 為準、原案場編號既有房源沿用 Ragic，故不再硬性要求
  const canSubmit = !!(house && pdf) && !submitting;

  // ① 產生官網上架包
  const genPortal = async () => {
    if (!canPortal) return;
    setPortalLoading(true);
    setPortal(null);
    try {
      const fd = new FormData();
      fd.set("pdf", pdf!);
      fd.set("houseName", effHouse!.name);
      fd.set("houseAddr", effHouse!.addr);
      fd.set("houseCompany", effHouse!.company);
      fd.set("totalFloor", totalFloor);
      fd.set("area", area);
      fd.set("genderLimit", genderLimit);
      fd.set("foreigner", foreigner);
      fd.set("moveInDate", effectiveMoveIn);
      fd.set("photoCount", String(photos.length));
      const res = await fetch("/api/listing-portal", { method: "POST", body: fd });
      const data: PortalResult = await res.json();
      setPortal(data);
      // 契約起迄日以 PDF 為準：解析到就自動帶入（可再手動覆寫）
      const c = data.parsed?.contract;
      if (data.success && c?.startDate) setContractStart(c.startDate);
      if (data.success && c?.endDate) setContractEnd(c.endDate);
    } catch (e) {
      setPortal({ success: false, error: String(e) });
    } finally {
      setPortalLoading(false);
    }
  };

  const copyPortal = async () => {
    if (!portal?.package) return;
    await navigator.clipboard.writeText(portal.package.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const downloadPortal = () => {
    if (!portal?.package) return;
    const blob = new Blob([portal.package.text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${house?.name || "官網上架包"}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ② 寫入 Ragic
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
          流程：<b>①</b> 上傳線上版代管約 PDF → 產生<b>官網上架包</b>照填 zuyou.com.tw；上架後房源會同步進 Ragic → <b>②</b> 搜尋選定該房源、<b>回填</b>屋主/收款等資料。全新房源在①可手動輸入、免先進 Ragic。
        </p>

        <div className="flex flex-col gap-5">
          {/* 選房源 */}
          <div>
            <label className={label}>選定房源 *</label>
            {house ? (
              <div className="flex items-center justify-between border border-green-300 bg-green-50 rounded-lg px-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block font-semibold text-gray-800 truncate">{house.name}</span>
                  <span className="block text-xs text-gray-500 truncate">{house.addr}（{house.company}）</span>
                </span>
                <button onClick={() => setHouse(null)} className="ml-2 text-xs text-gray-400 hover:text-red-500 shrink-0">更換</button>
              </div>
            ) : newMode ? (
              <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-3 flex flex-col gap-3">
                <p className="text-xs text-blue-700 font-medium">全新房源（不在 Ragic）— 手動輸入</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">房源名稱 *</label>
                  <input className={field} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例：慕夏 4F" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">地址</label>
                  <input className={field} value={newAddr} onChange={(e) => setNewAddr(e.target.value)} placeholder="例：桃園市八德區正福三街58號4樓" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">管理公司（選填）</label>
                  <select className={field} value={newCompany} onChange={(e) => setNewCompany(e.target.value)}>
                    <option value="">（請選擇）</option>
                    <option>租寓(大台北)</option>
                    <option>租寓台中(台中)</option>
                    <option>豈家(桃園)</option>
                    <option>租這(台中)</option>
                    <option>租寓(高雄)</option>
                    <option>新竹+(新竹加盟)</option>
                    <option>好好租(台南)</option>
                    <option>其他業者</option>
                  </select>
                </div>
                <button type="button" onClick={() => setNewMode(false)} className="self-start text-xs text-gray-500 hover:text-gray-700 underline">
                  ← 改用 Ragic 既有房源搜尋
                </button>
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
                <p className="text-xs text-gray-400 mt-1">※ 需從搜尋結果點選才算選定；只打字不算。</p>
                <button type="button" onClick={() => setNewMode(true)} className="mt-1 text-xs text-blue-600 hover:text-blue-700 underline">
                  ＋ 全新房源（不在 Ragic，手動輸入）
                </button>
              </>
            )}
          </div>

          {/* 上傳 PDF */}
          <div>
            <label className={label}>上傳代管約 PDF（線上版）*</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm hover:file:bg-blue-100"
            />
            {pdf && <p className="text-xs text-gray-500 mt-1">已選：{pdf.name}（{(pdf.size / 1024 / 1024).toFixed(1)} MB）</p>}
            <p className="text-xs text-amber-600 mt-1">⚠️ 須為電子簽署「線上版」（有文字層）；掃描版無法解析。</p>
          </div>

          {/* 補充欄 */}
          <hr className="border-gray-100" />
          <p className="text-sm font-semibold text-gray-700">補充資訊（PDF／Ragic 沒有才需填）</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>契約起始日</label>
              <input type="date" className={field} value={contractStart} onChange={(e) => setContractStart(e.target.value)} />
            </div>
            <div>
              <label className={label}>契約結束日</label>
              <input type="date" className={field} value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} />
            </div>
          </div>
          <p className="-mt-3 text-xs text-gray-400">※ 按「產生官網上架包」後會<b>自動帶入 PDF 的委託管理期間（以 PDF 為準）</b>，可手動覆寫；舊版 PDF 沒帶到才需自填（西元年）。</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>原案場編號</label>
              <input className={field} value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="既有房源免填，沿用 Ragic" />
            </div>
            <div>
              <label className={label}>總樓層</label>
              <input className={field} inputMode="numeric" value={totalFloor} onChange={(e) => setTotalFloor(e.target.value)} placeholder="15" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>空間大小（m²）</label>
              <input className={field} inputMode="numeric" value={area} onChange={(e) => setArea(e.target.value)} placeholder="30" />
            </div>
            <div>
              <label className={label}>何時可入住</label>
              <input type="date" className={field} value={effectiveMoveIn} onChange={(e) => setMoveInDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>性別限制</label>
              <select className={field} value={genderLimit} onChange={(e) => setGenderLimit(e.target.value)}>
                <option>男女皆可</option>
                <option>限男</option>
                <option>限女</option>
              </select>
            </div>
            <div>
              <label className={label}>可接受外國租客</label>
              <select className={field} value={foreigner} onChange={(e) => setForeigner(e.target.value)}>
                <option>是</option>
                <option>否</option>
              </select>
            </div>
          </div>

          {/* 照片 */}
          <div>
            <label className={label}>房源照片（官網用）</label>
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
        </div>
      </div>

      {/* ① 官網上架包 */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg mx-auto mt-6">
        <h2 className="text-base font-bold text-gray-800 mb-1">① 上架官網（zuyou.com.tw）</h2>
        <p className="text-xs text-gray-500 mb-4">產生七分頁逐欄位上架包，照著填官網 <code className="bg-gray-100 px-1 rounded">houses/new</code>；實際填表/上傳照片沿用既有流程。</p>
        <button
          type="button"
          onClick={genPortal}
          disabled={!canPortal}
          className="w-full bg-gray-800 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-900 disabled:bg-gray-300 transition"
        >
          {portalLoading ? "解析中…" : "產生官網上架包"}
        </button>

        {portal && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            {portal.success && portal.package ? (
              <>
                <div className="flex gap-2 mb-4">
                  <button onClick={copyPortal} className="flex-1 bg-gray-800 text-white text-sm py-2 rounded-lg hover:bg-gray-900 transition">{copied ? "已複製 ✓" : "複製整包"}</button>
                  <button onClick={downloadPortal} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50 transition">下載 .txt</button>
                </div>
                {portal.package.gaps.length > 0 && (
                  <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="font-semibold mb-1">⚠️ 待補/待確認（{portal.package.gaps.length}）</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {portal.package.gaps.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                )}
                <div className="space-y-4">
                  {portal.package.tabs.map((t) => (
                    <div key={t.tab}>
                      <p className="text-sm font-semibold text-gray-700 mb-1">{t.tab}</p>
                      <div className="border border-gray-200 rounded-lg divide-y text-sm">
                        {t.fields.map((f, i) => (
                          <div key={i} className="px-3 py-2 flex gap-3">
                            <span className="w-28 shrink-0 text-gray-500">{f.label}</span>
                            <span className="min-w-0 flex-1">
                              <span className={f.gap ? "text-amber-600" : "text-gray-800"}>{f.value || "—"}</span>
                              {f.note && <span className="block text-[11px] text-gray-400">{f.note}</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">❌ {portal.error}</p>
            )}
          </div>
        )}
      </div>

      {/* ② 回填 Ragic */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg mx-auto mt-6">
        <h2 className="text-base font-bold text-gray-800 mb-1">② 回填 Ragic</h2>
        <p className="text-xs text-gray-500 mb-4">把屋主、房源、收款帳戶資料補填進 Ragic（housing/70）。需填好契約起迄日與原案場編號。</p>
        {newMode && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            全新房源請先用 ① 完成官網上架；上架後房源會<b>同步進 Ragic</b>。屆時回到本頁，上方改用<b>搜尋選定</b>該房源，再按 ② 回填即可（②不需另建房源）。
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition"
        >
          {submitting ? "寫入 Ragic 中…（請稍候）" : "解析並寫入 Ragic"}
        </button>

        {result && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            {result.success ? (
              <>
                <h3 className="text-base font-bold text-green-700 mb-3">✅ 已寫入 Ragic</h3>
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
    </div>
  );
}
