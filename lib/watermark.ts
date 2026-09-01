// 機密文件浮水印繪製。純繪圖邏輯，不碰 React / 事件 / localStorage。
// 設計文件：docs/superpowers/specs/2026-09-01-confidential-photo-watermark-design.md

export type WatermarkOptions = {
  text: string; // 已含日期的完整文字（日期由呼叫端組好）
  color: string; // CSS 顏色字串
  opacity: number; // 0–1
  fontScale: number; // 字級 = 圖寬 × fontScale
  densityScale: number; // 間距倍率，越小越密
};

/** 下載輸出的長邊上限。手機 Safari 的 canvas 記憶體上限，超過會畫出空白。 */
export const MAX_EDGE = 4096;
/** 即時預覽的長邊上限。拉滑桿要跟得上手。 */
export const PREVIEW_EDGE = 1200;

/** 浮水印傾斜角度（度）。45° 過陡，易與文件表格線衝突。 */
const ANGLE_DEG = -30;
const FONT_STACK = '"PingFang TC", "Microsoft JhengHei", system-ui, sans-serif';

export class UnreadableImageError extends Error {}

/** 檔案是否為 HEIC/HEIF（桌機 Chrome 無法解碼）。 */
export function isHeic(file: File): boolean {
  return (
    /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)
  );
}

/**
 * 解碼影像並套用 EXIF orientation。
 * 手機拍的 JPEG 靠 EXIF 標記方向，天真繪製會轉 90°——權狀幾乎都是手機拍的，此處必須正確。
 */
export async function loadImage(
  file: File,
): Promise<ImageBitmap | HTMLImageElement> {
  // 主路徑：createImageBitmap 明確要求套用檔案內的方向資訊
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // 落到 <img> 路徑再試一次
    }
  }
  return await loadViaImgElement(file);
}

/** 退路：<img> 在現代瀏覽器預設套用 EXIF orientation（image-orientation: from-image）。 */
function loadViaImgElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new UnreadableImageError());
    };
    img.src = url;
  });
}

/** 釋放影像資源。換圖時務必呼叫，否則連續換圖會累積記憶體。 */
export function releaseImage(img: ImageBitmap | HTMLImageElement): void {
  if (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap) {
    img.close();
  }
}

function naturalSize(img: ImageBitmap | HTMLImageElement) {
  return img instanceof HTMLImageElement
    ? { w: img.naturalWidth, h: img.naturalHeight }
    : { w: img.width, h: img.height };
}

/** 等比縮放至長邊不超過 maxEdge；未超過則原尺寸回傳。 */
export function outputSize(
  srcW: number,
  srcH: number,
  maxEdge: number,
): { w: number; h: number } {
  const longest = Math.max(srcW, srcH);
  if (longest <= maxEdge) return { w: srcW, h: srcH };
  const k = maxEdge / longest;
  return { w: Math.round(srcW * k), h: Math.round(srcH * k) };
}

/**
 * 做一塊無縫磁磚：文字在 tile 內保持「水平」，故永不被 tile 邊界裁切。
 * 兩行、第二行水平偏移半個週期，避免排成呆板的直行。
 * 旋轉留給 pattern.setTransform 處理。
 */
function buildTile(
  fontPx: number,
  densityScale: number,
  text: string,
  color: string,
) {
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("無法建立 canvas context");
  measure.font = `bold ${fontPx}px ${FONT_STACK}`;
  const textW = Math.max(measure.measureText(text).width, fontPx);

  const gapX = textW * 0.6 * densityScale;
  const tileW = Math.ceil(textW + gapX);
  const rowH = Math.ceil(fontPx * 2.2 * densityScale);
  const tileH = rowH * 2;

  const tile = document.createElement("canvas");
  tile.width = tileW;
  tile.height = tileH;
  const t = tile.getContext("2d");
  if (!t) throw new Error("無法建立 canvas context");

  t.font = `bold ${fontPx}px ${FONT_STACK}`;
  t.fillStyle = color; // 直接用目標顏色畫，透明度另由 globalAlpha 控制
  t.textBaseline = "middle";

  // 第一行：從 tile 左緣起。橫向重複時左右兩端會自然接續。
  t.fillText(text, 0, rowH * 0.5);
  // 第二行：水平偏移半個 tile。畫兩次讓被切斷的那半在另一側接回，維持無縫。
  t.fillText(text, tileW / 2, rowH * 1.5);
  t.fillText(text, -tileW / 2, rowH * 1.5);

  return tile;
}

/**
 * 把影像與平鋪浮水印畫到 canvas。canvas 尺寸由本函式設定。
 * 預覽與下載共用此函式，僅 maxEdge 不同，故預覽即為輸出的縮小版。
 */
export function drawWatermarked(
  canvas: HTMLCanvasElement,
  img: ImageBitmap | HTMLImageElement,
  opts: WatermarkOptions,
  maxEdge: number,
): void {
  const src = naturalSize(img);
  const { w, h } = outputSize(src.w, src.h, maxEdge);

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立 canvas context");

  ctx.drawImage(img, 0, 0, w, h);

  const text = opts.text.trim();
  if (!text) return;

  // 字級依圖寬比例，讓 4032px 手機照與 1200px 掃描檔的浮水印視覺大小一致
  const fontPx = Math.max(10, Math.round(w * opts.fontScale));
  const tile = buildTile(fontPx, opts.densityScale, text, opts.color);
  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) return;

  // 旋轉整塊 pattern，而非逐字旋轉——這樣覆蓋完整且無縫
  if (typeof pattern.setTransform === "function" && typeof DOMMatrix !== "undefined") {
    pattern.setTransform(new DOMMatrix().rotate(ANGLE_DEG));
  }
  // 若瀏覽器不支援 setTransform，降級為水平平鋪：浮水印仍在，只是不傾斜

  ctx.save();
  ctx.globalAlpha = opts.opacity;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
