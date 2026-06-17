"use client";
import { useState, useMemo } from "react";

// 租金內含費用選項
const FEE_OPTIONS = ["水費", "電費", "瓦斯費", "網路費", "第四台"];
// 其他條件選項
const FLAG_OPTIONS = [
  "可報稅",
  "可設戶籍（入籍）",
  "可租補",
  "可養寵物",
  "有電梯",
  "垃圾處理／代收",
];

type Photo = { file: File; url: string };

export default function ListingPage() {
  // 1. 基本
  const [name, setName] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  // 2. PDF 常缺／需確認的補充資訊（依序往下）
  const [address, setAddress] = useState(""); // 以水電帳單為準
  const [rent, setRent] = useState("");
  const [mgmtFee, setMgmtFee] = useState(""); // 含車位
  const [depositMonth, setDepositMonth] = useState("");
  const [minLease, setMinLease] = useState("");
  const [area, setArea] = useState(""); // m²
  const [atFloor, setAtFloor] = useState("");
  const [totalFloor, setTotalFloor] = useState(""); // 總樓層（PDF 常缺）
  const [bedroom, setBedroom] = useState("");
  const [living, setLiving] = useState("");
  const [bathroom, setBathroom] = useState("");
  const [balcony, setBalcony] = useState("");
  const [parking, setParking] = useState("個人停車位");
  const [gender, setGender] = useState("男女皆可");
  const [foreigner, setForeigner] = useState(true);
  const [feeIncluded, setFeeIncluded] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const onPdf = (f: File | null) => {
    setPdf(f);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(f ? URL.createObjectURL(f) : "");
  };

  const onPhotos = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map(file => ({ file, url: URL.createObjectURL(file) }));
    setPhotos(prev => [...prev, ...next]);
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const summary = useMemo(() => {
    const L: string[] = [];
    L.push(`【官網上架資料包】${name || "（未命名）"}`);
    L.push("");
    L.push("── 基本 ──");
    L.push(`房源名稱：${name || "—"}`);
    L.push(`代管約 PDF：${pdf ? pdf.name : "（未上傳）"}`);
    L.push(`照片：${photos.length} 張`);
    L.push("");
    L.push("── 補充資訊（PDF 常缺／需確認）──");
    L.push(`地址（以水電帳單為準）：${address || "—"}`);
    L.push(`月租：${rent || "—"}`);
    L.push(`管理費（含車位）：${mgmtFee || "—"}`);
    L.push(`押金（月）：${depositMonth || "—"}`);
    L.push(`最短租期（月）：${minLease || "—"}`);
    L.push(`空間大小（m²）：${area || "—"}`);
    L.push(`所在樓層／總樓層：${atFloor || "—"} / ${totalFloor || "—"}`);
    L.push(`格局：${bedroom || "—"} 房 ${living || "—"} 廳 ${bathroom || "—"} 衛 ${balcony || "—"} 陽台`);
    L.push(`停車位：${parking}`);
    L.push(`性別限制：${gender}`);
    L.push(`外國租客：${foreigner ? "可" : "不可"}`);
    L.push(`租金內含：${feeIncluded.length ? feeIncluded.join("、") : "無"}`);
    L.push(`其他：${flags.length ? flags.join("、") : "無"}`);
    if (note) L.push(`備註：${note}`);
    return L.join("\n");
  }, [name, pdf, photos, address, rent, mgmtFee, depositMonth, minLease, area, atFloor, totalFloor, bedroom, living, bathroom, balcony, parking, gender, foreigner, feeIncluded, flags, note]);

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name || "上架資料包"}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // 欄位元件
  const field = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-lg mx-auto">
        <a href="/" className="text-xs text-gray-400 hover:text-gray-600">‹ 回工作助手</a>
        <h1 className="text-xl font-bold text-gray-800 mt-2 mb-1">🏢 官網上架</h1>
        <p className="text-sm text-gray-500 mb-6">
          填寫房源資料，送出後產生「上架資料包」摘要供後續到 Zuyou 後台刊登。
        </p>

        <div className="flex flex-col gap-5">
          {/* 1. 命名房源 */}
          <div>
            <label className={label}>1. 命名房源 *</label>
            <input
              className={field}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例：欣時代"
            />
          </div>

          {/* 2. 上傳 PDF */}
          <div>
            <label className={label}>2. 上傳房源 PDF（代管約）</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={e => onPdf(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm hover:file:bg-blue-100"
            />
            {pdf && (
              <p className="text-xs text-gray-500 mt-1">
                已選：{pdf.name}（{(pdf.size / 1024 / 1024).toFixed(1)} MB）
              </p>
            )}
          </div>

          {/* 3. 上傳照片 */}
          <div>
            <label className={label}>3. 上傳房源照片</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => onPhotos(e.target.files)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm hover:file:bg-blue-100"
            />
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.file.name} className="w-full h-16 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none opacity-0 group-hover:opacity-100 transition"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />
          <p className="text-sm font-semibold text-gray-700">補充資訊（PDF 常缺／需確認，依序填寫）</p>

          <div>
            <label className={label}>地址（以水電帳單為準）</label>
            <input className={field} value={address} onChange={e => setAddress(e.target.value)} placeholder="例：桃園市龜山區樂善三路80號14樓" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>月租（NT$）</label>
              <input className={field} inputMode="numeric" value={rent} onChange={e => setRent(e.target.value)} placeholder="25000" />
            </div>
            <div>
              <label className={label}>管理費（含車位，NT$/月）</label>
              <input className={field} inputMode="numeric" value={mgmtFee} onChange={e => setMgmtFee(e.target.value)} placeholder="2348" />
            </div>
            <div>
              <label className={label}>押金（月）</label>
              <select className={field} value={depositMonth} onChange={e => setDepositMonth(e.target.value)}>
                <option value="">—</option>
                {["0.5", "1.0", "1.5", "2.0", "2.5", "3.0"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>最短租期（月）</label>
              <input className={field} inputMode="numeric" value={minLease} onChange={e => setMinLease(e.target.value)} placeholder="12" />
            </div>
            <div>
              <label className={label}>空間大小（m²）</label>
              <input className={field} inputMode="numeric" value={area} onChange={e => setArea(e.target.value)} placeholder="70" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={label}>所在樓層</label>
                <input className={field} inputMode="numeric" value={atFloor} onChange={e => setAtFloor(e.target.value)} placeholder="14" />
              </div>
              <div>
                <label className={label}>總樓層</label>
                <input className={field} inputMode="numeric" value={totalFloor} onChange={e => setTotalFloor(e.target.value)} placeholder="30" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className={label}>房</label>
              <input className={field} inputMode="numeric" value={bedroom} onChange={e => setBedroom(e.target.value)} placeholder="2" />
            </div>
            <div>
              <label className={label}>廳</label>
              <input className={field} inputMode="numeric" value={living} onChange={e => setLiving(e.target.value)} placeholder="2" />
            </div>
            <div>
              <label className={label}>衛</label>
              <input className={field} inputMode="numeric" value={bathroom} onChange={e => setBathroom(e.target.value)} placeholder="2" />
            </div>
            <div>
              <label className={label}>陽台</label>
              <input className={field} inputMode="numeric" value={balcony} onChange={e => setBalcony(e.target.value)} placeholder="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>停車位</label>
              <select className={field} value={parking} onChange={e => setParking(e.target.value)}>
                {["無", "個人停車位", "附近有停車場"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>性別限制</label>
              <select className={field} value={gender} onChange={e => setGender(e.target.value)}>
                {["男女皆可", "限男", "限女"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={foreigner} onChange={e => setForeigner(e.target.checked)} />
            歡迎外國租客
          </label>

          <div>
            <label className={label}>租金內含費用</label>
            <div className="flex flex-wrap gap-2">
              {FEE_OPTIONS.map(o => (
                <button
                  type="button"
                  key={o}
                  onClick={() => toggle(feeIncluded, setFeeIncluded, o)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${feeIncluded.includes(o) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
                >{o}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>其他條件</label>
            <div className="flex flex-wrap gap-2">
              {FLAG_OPTIONS.map(o => (
                <button
                  type="button"
                  key={o}
                  onClick={() => toggle(flags, setFlags, o)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${flags.includes(o) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
                >{o}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>備註（選填）</label>
            <textarea className={field} rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="其他需特別註記的事項" />
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!name}
            className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            產生上架資料包
          </button>
        </div>

        {/* 結果：上架資料包摘要 */}
        {submitted && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-base font-bold text-gray-800 mb-3">📦 上架資料包</h2>

            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap mb-3">{summary}</pre>

            <div className="flex gap-2 mb-4">
              <button onClick={copy} className="flex-1 bg-gray-800 text-white text-sm py-2 rounded-lg hover:bg-gray-900 transition">
                {copied ? "已複製 ✓" : "複製摘要"}
              </button>
              <button onClick={download} className="flex-1 border border-gray-300 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50 transition">
                下載 .txt
              </button>
            </div>

            {pdf && pdfUrl && (
              <a href={pdfUrl} download={pdf.name} className="block text-sm text-blue-600 hover:underline mb-3">
                📄 下載 {pdf.name}
              </a>
            )}

            {photos.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">照片（{photos.length} 張）：</p>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((p, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={p.url} alt={p.file.name} className="w-full h-16 object-cover rounded-md border" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
