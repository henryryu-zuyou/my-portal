"use client";
import { useState, useMemo } from "react";

// 押金固定 2 個月（公司慣例，唯讀顯示）
const DEPOSIT_MONTH = "2";

type Photo = { file: File; url: string };

export default function ListingPage() {
  // 1. 基本
  const [name, setName] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  // 2. 補充資訊（只留 PDF 完全沒有的）
  const [area, setArea] = useState(""); // 空間大小 m²
  const [totalFloor, setTotalFloor] = useState(""); // 總樓層

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

  const summary = useMemo(() => {
    const L: string[] = [];
    L.push(`【官網上架資料包】${name || "（未命名）"}`);
    L.push("");
    L.push("── 基本 ──");
    L.push(`房源名稱：${name || "—"}`);
    L.push(`代管約 PDF：${pdf ? pdf.name : "（未上傳）"}`);
    L.push(`照片：${photos.length} 張`);
    L.push("");
    L.push("── 補充資訊（PDF 沒有，需另填）──");
    L.push(`空間大小（m²）：${area || "—"}`);
    L.push(`總樓層：${totalFloor || "—"}`);
    L.push(`押金（月）：${DEPOSIT_MONTH}（固定）`);
    return L.join("\n");
  }, [name, pdf, photos, area, totalFloor]);

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
          <p className="text-sm font-semibold text-gray-700">補充資訊（PDF 沒有，需另填）</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>空間大小（m²）</label>
              <input className={field} inputMode="numeric" value={area} onChange={e => setArea(e.target.value)} placeholder="70" />
            </div>
            <div>
              <label className={label}>總樓層</label>
              <input className={field} inputMode="numeric" value={totalFloor} onChange={e => setTotalFloor(e.target.value)} placeholder="30" />
            </div>
          </div>

          {/* 押金固定 2 個月（唯讀顯示） */}
          <div>
            <label className={label}>押金（月）</label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 flex items-center justify-between">
              <span className="font-medium">2 個月</span>
              <span className="text-xs text-gray-400">固定</span>
            </div>
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
