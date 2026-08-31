// content/landlord-faq.html →（1）lib/landlord-faq.ts 整頁 HTML（2）lib/faq-index.ts 逐題資料
//
// FAQ 頁要依登入狀態決定顯示內容，不能放 public/ 當靜態檔（那樣任何人都能直接開原始檔）。
// 內容的唯一來源是 content/landlord-faq.html，這支把它包成程式能 import 的模組。
// build 前會自動跑（package.json 的 build script），所以不會有兩份不同步的問題。
import { readFileSync, writeFileSync } from "node:fs";
import { stripInternalNotes, countInternalNotes } from "../lib/faq-notes.mjs";

const SRC = "content/landlord-faq.html";
const OUT_PAGE = "lib/landlord-faq.ts";
const OUT_INDEX = "lib/faq-index.ts";

const html = readFileSync(SRC, "utf8");
for (const bad of ["`", "${", "\\"]) {
  if (html.includes(bad)) {
    throw new Error(`${SRC} 含有 ${bad}，無法直接嵌入樣板字串；請先在 ${OUT_PAGE} 的產生邏輯加上跳脫處理。`);
  }
}

// ── (1) 整頁 HTML ───────────────────────────────────────────────
writeFileSync(OUT_PAGE, `// 這個檔案由 scripts/sync-faq.mjs 從 ${SRC} 產生，請勿手改。
// 要改 FAQ 內容請改 ${SRC}，build 時會自動重新產生。

export const LANDLORD_FAQ_HTML = \`${html}\`;
`);

// ── (2) 逐題資料（給 /ask 的問答搜尋用）─────────────────────────
/** @param {string} frag */
const toText = (frag) =>
  frag
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const entries = [];
const categories = [];

const sectionRe = /<section id="([^"]+)">([\s\S]*?)<\/section>/g;
for (const sec of html.matchAll(sectionRe)) {
  const catId = sec[1];
  const body = sec[2];
  const cat = toText((body.match(/<h2>([\s\S]*?)<\/h2>/) || [, ""])[1]);
  if (!cat) continue;
  categories.push({ id: catId, title: cat });

  const qaRe = /<details class="qa"[^>]*>([\s\S]*?)<\/details>/g;
  for (const qa of body.matchAll(qaRe)) {
    const block = qa[1];
    const sum = block.match(
      /<summary><span class="qid">([\s\S]*?)<\/span><span>([\s\S]*?)<\/span><\/summary>/
    );
    const ans = block.match(/<div class="ans">([\s\S]*)$/);
    if (!sum || !ans) throw new Error(`解析不到題目或答案：${block.slice(0, 80)}`);

    // /ask 是公開頁，答案一律用拿掉內部註記的版本
    let answerHtml = stripInternalNotes(ans[1].replace(/\s*<\/div>\s*$/, "")).trim();

    // Q1 的稅率下拉是 FAQ 頁的互動控制項，重算邏輯寫在該頁頁尾的 <script>；
    // 搬進 /ask 的對話泡泡會變成一個按了沒反應的選單，所以拿掉，改在 /ask 附一個「去 FAQ 頁試算」的連結。
    const hasCalc = /<p class="calc-ctl">/.test(answerHtml);
    answerHtml = answerHtml.replace(/<p class="calc-ctl">[\s\S]*?<\/p>\s*/g, "");

    entries.push({
      hasCalc,
      id: sum[1].trim().toLowerCase(), // q1、q2…（與 FAQ 頁的錨點一致）
      qid: sum[1].trim(),
      q: toText(sum[2]),
      cat,
      catId,
      html: answerHtml,
      text: toText(answerHtml),
    });
  }
}

if (entries.length === 0) throw new Error(`${SRC} 解析不到任何題目`);

writeFileSync(OUT_INDEX, `// 這個檔案由 scripts/sync-faq.mjs 從 ${SRC} 產生，請勿手改。
// 內部註記已在這裡拿掉：/ask 是公開頁，答案一律用對外版本。

export type FaqEntry = {
  /** 與 FAQ 頁錨點一致的 id，例 q1 */
  id: string;
  /** 顯示用編號，例 Q1 */
  qid: string;
  /** 問題 */
  q: string;
  /** 分類標題，例 稅務優惠 */
  cat: string;
  /** 分類錨點，例 tax */
  catId: string;
  /** 答案 HTML（沿用 FAQ 頁的 class，樣式在 /ask 頁重現）*/
  html: string;
  /** 答案純文字，只給比對用 */
  text: string;
  /** 這題在 FAQ 頁有互動試算表（稅率下拉），/ask 只給靜態表＋連結 */
  hasCalc: boolean;
};

export const FAQ_CATEGORIES: { id: string; title: string }[] = ${JSON.stringify(categories, null, 2)};

export const FAQ_ENTRIES: FaqEntry[] = ${JSON.stringify(entries, null, 2)};
`);

console.log(
  `已產生 ${OUT_PAGE}（內部註記 ${countInternalNotes(html)} 處）` +
    `、${OUT_INDEX}（${entries.length} 題 / ${categories.length} 類）`
);
