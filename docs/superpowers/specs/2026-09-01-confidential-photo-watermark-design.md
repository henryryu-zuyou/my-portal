# 機密文件照片浮水印工具（/watermark）

日期：2026-09-01
狀態：已核准，待實作

## 問題

房屋權狀、身分證、契約這類機密文件的照片，常需要提供給銀行、代書、仲介等第三方。
一旦交出去就無法控制流向，可能被拿去冒用或轉手。

需要一個工具：在照片上蓋自訂文字的浮水印，標明「這份影本的用途與時間」，
讓文件離開自己手上後仍帶著可追溯的標記，且無法輕易去除。

## 目標與非目標

**目標**
- 使用者自行輸入浮水印文字，即時看到效果，一鍵下載
- 浮水印無法靠裁切、截圖、局部放大來規避
- 機密照片全程不離開使用者裝置
- 手機與電腦都能用

**非目標（明確不做）**
- 批次多張處理（使用者評估後排除；權狀多頁時逐張處理即可）
- 伺服器端影像處理（違背「照片不離開裝置」）
- 輸出 PNG（一律 JPEG）
- 數位簽章、加密、防篡改驗證（不同層級的問題，不在此範圍）

## 決策

### 為什麼是純前端 Canvas

照片在瀏覽器記憶體裡用 Canvas 2D 繪製，零新依賴，全程 0 次網路請求。
關掉分頁照片就消失。

替代方案與否決理由：
- **伺服器端 sharp**：畫質控制更好、能解 HEIC，但機密文件要上傳到 Vercel，直接違背本工具的目的。否決。
- **html2canvas + CSS overlay**：需新增第三方依賴，且對輸出解析度掌控差。否決。

### 為什麼繪圖邏輯要獨立成 lib

平鋪的角度、間距、覆蓋範圍計算有數學成分。混在 React state 更新裡難以推理與修改，
也無法獨立驗證。抽成純函式後，同一支邏輯服務「低解析度即時預覽」與「原解析度下載」兩條路徑，
保證所見即所得。

### 存取權限

公開路由，**不加入 `middleware.ts` 的 matcher**，也不從 `app/page.tsx` 放導覽連結。
知道網址才用得到。理由：頁面本身不儲存也不傳輸任何資料，無資料外洩風險；
不放連結是避免公司網域下多一個外人會亂用的工具頁。

## 架構

### 檔案

| 檔案 | 職責 |
|---|---|
| `lib/watermark.ts` | 純繪圖函式。吃「影像來源 + 設定」，畫到傳入的 canvas。不碰 React、不碰 DOM 事件、不碰 localStorage |
| `app/watermark/page.tsx` | UI：檔案選取、文字輸入、滑桿、顏色、預覽、下載、錯誤顯示 |

`middleware.ts` 不修改。`app/page.tsx` 不修改。無新增 npm 依賴。

### lib/watermark.ts 介面

```ts
export type WatermarkOptions = {
  text: string;          // 已含日期的完整文字，lib 不管日期邏輯
  color: string;         // CSS 顏色字串
  opacity: number;       // 0–1
  fontScale: number;     // 字級 = 圖寬 × fontScale
  densityScale: number;  // 間距倍率，越小越密
  angleDeg: number;      // 傾斜角度（度）。0 為水平，負值往左上傾
};

export const MAX_EDGE = 4096;

// 解碼檔案為可繪製影像，並套用 EXIF orientation
export async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement>;

// 等比縮放至長邊不超過 maxEdge；未超過則原尺寸回傳
export function outputSize(srcW: number, srcH: number, maxEdge: number): { w: number; h: number };

// ImageBitmap 用完須由呼叫端 close() 釋放；換圖時務必釋放舊的，否則連續換圖會累積記憶體
export function releaseImage(img: ImageBitmap | HTMLImageElement): void;

// 把影像與平鋪浮水印畫到 canvas（canvas 尺寸由本函式設定）
export function drawWatermarked(
  canvas: HTMLCanvasElement,
  img: ImageBitmap | HTMLImageElement,
  opts: WatermarkOptions,
  maxEdge: number,
): void;
```

### 平鋪演算法

不逐一迴圈繪製斜向文字（邊緣會缺角、間距不均）。改為「無縫磁磚 + 旋轉 pattern」：

1. 離屏 canvas 畫一塊 tile，tile 內文字為**水平**（因此永不被 tile 邊界裁切）
2. tile 內畫兩行，第二行水平偏移半個週期，避免排成呆板直行
3. `ctx.createPattern(tile, "repeat")`
4. `pattern.setTransform(new DOMMatrix().rotate(opts.angleDeg))` 旋轉整個 pattern
5. 以 pattern 填滿整張畫布

tile 尺寸由文字量測寬度 × `densityScale` 決定，故任何圖片比例都能完整無縫覆蓋。

字級為**圖寬的比例**（`fontWidth × fontScale`），不是固定 px。
確保 4032px 手機照片與 1200px 掃描檔的浮水印視覺大小一致。

字型：`bold {size}px "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif`

### 影像方向（EXIF orientation）

手機拍攝的 JPEG 以 EXIF orientation 標記方向，天真繪製會轉 90°。
主路徑用 `createImageBitmap(file, { imageOrientation: "from-image" })`。
若該選項不支援或解碼失敗，退回 `HTMLImageElement` + object URL
（現代瀏覽器對 `<img>` 預設套用 EXIF orientation）。

權狀幾乎都是手機拍的，此項為必要行為而非優化。

### 預覽與下載

- **預覽**：以 `maxEdge = 1200` 繪製，確保拉滑桿即時跟手
- **下載**：以完整解析度（受 `MAX_EDGE` 限制）重跑同一支 `drawWatermarked`
- 兩條路徑共用同一支 `drawWatermarked`，僅 `maxEdge` 不同，故預覽即為實際輸出的縮小版

**尺寸上限 4096px 長邊**：超過者等比縮小後再蓋浮水印。
原因為手機 Safari 的 canvas 記憶體上限，8000px 影像會產生空白畫面。
iPhone 照片為 4032px，不受影響。被縮小時 UI 明確告知。

輸出：`canvas.toBlob(type: "image/jpeg", quality: 0.92)`，
檔名 `{原檔名去副檔名}-watermark.jpg`。

## 預設值

| 項目 | 預設 | 可調範圍 | 理由 |
|---|---|---|---|
| 顏色 | 黑 | 白／黑／紅／靛藍 | 權狀影本本身是灰階，黑字比紅字協調，不會搶過文件內容 |
| 透明度 | 15% | 1–100% | 蓋得住，但底下地號、坪數仍清楚可辨讀 |
| 字級 | 圖寬 3% | 0.5–20% | 細字不壓過權狀本文 |
| 密度 | 倍率 2.00 | 0.3–5.0（越小越密） | 偏疏，避免文字互相干擾 |
| 角度 | -30° | -90–90°（0 為水平） | 45° 過陡，易與文件表格線衝突；水平（0°）會留下大片未覆蓋的掃描列，故預設傾斜 |
| 帶今日日期 | 關閉 | 可開 | 用途註記（如「限房屋租賃契約使用」）本身已足夠；需要標明發出時間再開 |

以上預設值是拿真實權狀（手機拍攝的紙本影本）逐項調出來的，
而非憑空設定。定義在 `DEFAULTS` 常數，不依賴 `COLORS` 的陣列順序。

四項數值（透明度、字級、密度、角度）各有**滑桿與數值輸入格**，兩者雙向同步。
範圍刻意放寬到超出實用區間，因為使用者要能直接填數字；超出範圍的輸入即時 clamp
並改寫輸入格顯示，不讓輸入格停在一個沒被採用的數字上。

輸入格的中間狀態（`-`、`0.`）必須留得住，否則負號與小數打不完。
判定方式：輸入以 `-` 或 `.` 結尾時視為未完成，保留原始字串顯示，
但仍即時套用可解析出的數值，讓預覽跟著動。

日期格式 `YYYY-MM-DD`，以半形空格接在使用者文字後：`機密 2026-09-01`。
日期在 `page.tsx` 組好後傳入 lib，lib 不含日期邏輯。

## 記住上次的浮水印文字

浮水印文字存入 `localStorage`（鍵名 `watermark:text`），下次開頁自動填回。
滑桿與顏色設定**不**記憶（每份文件的底色深淺不同，沿用上次的濃度常常不對）。

使用者已知悉並接受權衡：公用電腦上該文字會殘留於瀏覽器。
提供「清除記憶的文字」按鈕作為緩解。

## 錯誤處理

錯誤一律顯示於頁面內（不用 `alert`）。**不寫任何 log** — 機密文件連檔名都不應進入日誌。

| 狀況 | 訊息 |
|---|---|
| HEIC 檔且解碼失敗 | 「這是 iPhone 的 HEIC 格式，桌機 Chrome 讀不了。請用 iPhone 分享成 JPG，或改用 Safari 開這頁。」 |
| 非圖片檔（PDF/Word 等） | 「只吃圖片檔。權狀 PDF 請先轉存成圖片。」 |
| 圖片壞檔或解碼失敗 | 「這張圖讀不出來，換一張試試。」 |
| 浮水印文字為空 | 下載鈕停用，顯示「請先輸入浮水印文字」 |

## 附帶效果：清除 EXIF

Canvas 重繪產物不帶任何 EXIF，原照片的 GPS 座標、拍攝時間、裝置型號全部消失。
權狀照片常內嵌住家 GPS 定位，此副作用的實務價值高於浮水印本身。

頁面底部明確說明：
> 照片不會上傳，全程在你的瀏覽器處理。輸出檔已移除 GPS 定位等原始拍攝資訊。

## 驗收方式

專案無測試框架（`package.json` 無 test script），不為此功能新增測試設施。
驗證以實跑為準：

1. `npm run dev`，瀏覽器開 `/watermark`
2. 以真實照片測試（含手機直式拍攝的照片）
3. 逐項確認：
   - 手機拍的直式照片方向正確（不躺平）
   - 平鋪無缺角，四邊與四角皆有覆蓋
   - 改角度確實改變覆蓋分佈（以每條掃描列的浮水印像素數驗證：
     0° 會留下大量完全未覆蓋的掃描列，-30° 應為零）
   - 下載檔像素尺寸等於原圖（未超過 4096px 時）
   - 輸出檔 EXIF 確實清空（`exiftool` 或 `strings` 確認無 GPS/Make 欄位）
   - 文字為空時下載鈕停用
   - 重新整理後浮水印文字自動填回
   - 連續換 10 張圖後記憶體未持續累積（舊 ImageBitmap 已釋放）
4. 產出圖片交付使用者目視確認浮水印濃度是否合適

## 使用者體驗流程

```
開 /watermark
   ↓
拖照片進去（或點選檔案／手機直接拍）
   ↓
打浮水印文字 → 右側預覽即時更新
   ↓
調透明度／字級／密度／顏色
   ↓
按「下載」→ 原解析度 JPG 存到裝置
```
