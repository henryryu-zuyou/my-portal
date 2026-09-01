"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_ANGLE_DEG,
  MAX_EDGE,
  PREVIEW_EDGE,
  drawWatermarked,
  isHeic,
  loadImage,
  outputSize,
  releaseImage,
  type WatermarkOptions,
} from "@/lib/watermark";

const TEXT_KEY = "watermark:text";

const COLORS = [
  { name: "紅", value: "#dc2626" },
  { name: "黑", value: "#000000" },
  { name: "靛藍", value: "#4338ca" },
  { name: "白", value: "#ffffff" },
];

// 實際拿真實權狀調出來的預設值：黑色細字、淡、偏疏，蓋得住又不擋地號與面積
const DEFAULTS = {
  color: "#000000",
  opacity: 0.15,
  fontScale: 0.03,
  density: 2.0,
  withDate: false,
};

// 錯誤訊息集中管理，避免散落在流程各處
const ERR = {
  notImage: "只吃圖片檔。權狀 PDF 請先轉存成圖片。",
  heic: "這是 iPhone 的 HEIC 格式，桌機 Chrome 讀不了。請用 iPhone 分享成 JPG，或改用 Safari 開這頁。",
  unreadable: "這張圖讀不出來，換一張試試。",
};

const readSavedText = () => {
  try {
    return localStorage.getItem(TEXT_KEY) ?? "";
  } catch {
    return ""; // 隱私模式可能禁用 localStorage
  }
};

const todayStr = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default function WatermarkTool() {
  const [text, setText] = useState(readSavedText);
  const [withDate, setWithDate] = useState(DEFAULTS.withDate);
  const [today] = useState(todayStr);
  const [color, setColor] = useState(DEFAULTS.color);
  const [opacity, setOpacity] = useState(DEFAULTS.opacity);
  const [fontScale, setFontScale] = useState(DEFAULTS.fontScale);
  const [density, setDensity] = useState(DEFAULTS.density);
  const [angle, setAngle] = useState(DEFAULT_ANGLE_DEG);

  const [fileName, setFileName] = useState("");
  const [srcSize, setSrcSize] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const imgRef = useRef<ImageBitmap | HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 記住浮水印文字，下次開頁自動填回
  useEffect(() => {
    try {
      localStorage.setItem(TEXT_KEY, text);
    } catch {
      // 隱私模式可能禁用 localStorage，忽略即可
    }
  }, [text]);

  // 卸載時釋放影像，避免記憶體累積
  useEffect(
    () => () => {
      if (imgRef.current) releaseImage(imgRef.current);
    },
    [],
  );

  const hasText = text.trim().length > 0;
  const fullText = !hasText
    ? ""
    : withDate
      ? `${text.trim()} ${today}`
      : text.trim();

  const opts: WatermarkOptions = useMemo(
    () => ({
      text: fullText,
      color,
      opacity,
      fontScale,
      densityScale: density,
      angleDeg: angle,
    }),
    [fullText, color, opacity, fontScale, density, angle],
  );

  // 重畫預覽。srcSize 進依賴，換圖時（即使設定沒動）也會重畫。
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !srcSize) return;
    drawWatermarked(canvas, img, opts, PREVIEW_EDGE);
  }, [opts, srcSize]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const accept = useCallback(async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/") && !isHeic(file)) {
      setError(ERR.notImage);
      return;
    }
    setBusy(true);
    try {
      const img = await loadImage(file);
      if (imgRef.current) releaseImage(imgRef.current);
      imgRef.current = img;
      const w = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
      const h = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
      setSrcSize({ w, h });
      setFileName(file.name);
    } catch {
      setError(isHeic(file) ? ERR.heic : ERR.unreadable);
    } finally {
      setBusy(false);
    }
  }, []);

  const download = async () => {
    const img = imgRef.current;
    if (!img || !hasText) return;
    setBusy(true);
    try {
      const out = document.createElement("canvas");
      drawWatermarked(out, img, opts, MAX_EDGE);
      const blob = await new Promise<Blob | null>((res) =>
        out.toBlob(res, "image/jpeg", 0.92),
      );
      if (!blob) {
        setError(ERR.unreadable);
        return;
      }
      const base = fileName.replace(/\.[^.]+$/, "") || "document";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}-watermark.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const clearMemory = () => {
    setText("");
    try {
      localStorage.removeItem(TEXT_KEY);
    } catch {
      // 同上
    }
  };

  const field =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  const outSize = srcSize ? outputSize(srcSize.w, srcSize.h, MAX_EDGE) : null;
  const shrunk =
    srcSize && outSize && (outSize.w !== srcSize.w || outSize.h !== srcSize.h);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl mx-auto">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
          ‹ 回工作助手
        </Link>
        <h1 className="text-xl font-bold text-gray-800 mt-2 mb-1">
          🔒 機密文件浮水印
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          權狀、契約、身分證等文件影本，蓋上自訂浮水印標明用途與日期，避免被轉手冒用。
        </p>

        {/* ── 選圖 ───────────────────────── */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) accept(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={
            "border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition " +
            (dragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50")
          }
        >
          <p className="text-sm text-gray-600">
            {fileName ? (
              <>
                已選：<span className="font-medium">{fileName}</span>
                <span className="text-gray-400">（點此換一張）</span>
              </>
            ) : (
              <>把照片拖到這裡，或點擊選擇檔案／拍照</>
            )}
          </p>
          {srcSize && (
            <p className="text-xs text-gray-400 mt-1">
              原尺寸 {srcSize.w}×{srcSize.h}
              {shrunk && outSize && (
                <span className="text-amber-600">
                  ．已縮至 {outSize.w}×{outSize.h}（長邊上限 {MAX_EDGE}px）
                </span>
              )}
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) accept(f);
              e.target.value = ""; // 允許重選同一個檔案
            }}
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* ── 設定 ───────────────────────── */}
        <div className="mt-6">
          <label className={label}>浮水印文字</label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例：機密．僅供○○銀行審件使用"
            className={field}
          />
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={withDate}
                onChange={(e) => setWithDate(e.target.checked)}
              />
              自動帶上今天日期（{today}）
            </label>
            <button
              type="button"
              onClick={clearMemory}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              清除記憶的文字
            </button>
          </div>
          {fullText && (
            <p className="text-xs text-gray-400 mt-1">
              實際蓋上：<span className="text-gray-600">{fullText}</span>
            </p>
          )}
        </div>

        <div className="mt-5">
          <label className={label}>顏色</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={
                  "px-3 py-1.5 rounded-lg text-sm border transition " +
                  (color === c.value
                    ? "border-blue-500 ring-2 ring-blue-200 font-medium"
                    : "border-gray-300 hover:border-gray-400")
                }
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle border border-gray-300"
                  style={{ background: c.value }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {/* 內部單位與顯示單位不同的（透明度、字級）在這裡換算，控制項本身只認顯示單位 */}
          <NumberSlider
            label="透明度"
            unit="%"
            value={opacity * 100}
            min={1}
            max={100}
            step={1}
            decimals={0}
            onChange={(v) => setOpacity(v / 100)}
          />
          <NumberSlider
            label="字的大小"
            unit="%"
            hint="佔圖寬比例"
            value={fontScale * 100}
            min={0.5}
            max={20}
            step={0.1}
            decimals={1}
            onChange={(v) => setFontScale(v / 100)}
          />
          <NumberSlider
            label="密度"
            unit="×"
            hint="越小越密"
            value={density}
            min={0.3}
            max={5}
            step={0.05}
            decimals={2}
            onChange={setDensity}
          />
          <NumberSlider
            label="角度"
            unit="°"
            hint="0 為水平"
            value={angle}
            min={-90}
            max={90}
            step={1}
            decimals={0}
            onChange={setAngle}
          />
        </div>

        {/* ── 預覽 ───────────────────────── */}
        <div className="mt-6">
          <label className={label}>預覽</label>
          <div className="border border-gray-200 rounded-xl bg-gray-100 p-2 min-h-40 flex items-center justify-center">
            {srcSize ? (
              <canvas ref={canvasRef} className="max-w-full h-auto rounded" />
            ) : (
              <p className="text-sm text-gray-400 py-10">選一張照片就會顯示預覽</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={download}
          disabled={!srcSize || !hasText || busy}
          className="mt-5 w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {busy
            ? "處理中…"
            : !srcSize
              ? "請先選一張照片"
              : !hasText
                ? "請先輸入浮水印文字"
                : "下載加好浮水印的圖"}
        </button>

        <p className="mt-5 text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
          照片不會上傳，全程在你的瀏覽器處理。輸出檔已移除 GPS 定位等原始拍攝資訊。
        </p>
      </div>
    </div>
  );
}

/**
 * 滑桿 + 可直接輸入的數值格。
 * 打字過程用 draft 保留原始輸入（讓「0.」「-」這種中間狀態能打完），
 * 只要當下能解析成數字就即時套用；失焦後回到正規化顯示。
 */
function NumberSlider({
  label,
  unit,
  hint,
  value,
  min,
  max,
  step,
  decimals,
  onChange,
}: {
  label: string;
  unit: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  decimals: number;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? value.toFixed(decimals);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const type = (raw: string) => {
    const n = Number(raw);
    if (raw.trim() === "" || Number.isNaN(n)) {
      setDraft(raw); // 空白或還打不成數字，先留著
      return;
    }
    const c = clamp(n);
    onChange(c);
    // 「0.」「-」這種還在打的中間狀態要留著，否則使用者打不完小數與負號；
    // 其餘情況一旦被 clamp 就立刻改寫顯示，不讓輸入格顯示一個沒被採用的數字。
    const incomplete = /[.-]$/.test(raw);
    setDraft(incomplete || c === n ? raw : String(c));
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1 gap-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}
          {hint && (
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              {hint}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={shown}
            onChange={(e) => type(e.target.value)}
            onBlur={() => setDraft(null)}
            className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm text-right tabular-nums focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-gray-500 w-3">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          setDraft(null); // 拉滑桿時放掉打字草稿，顯示跟著滑桿走
          onChange(Number(e.target.value));
        }}
        className="w-full accent-blue-600"
      />
      <div className="flex justify-between text-[10px] text-gray-400 tabular-nums mt-0.5">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
