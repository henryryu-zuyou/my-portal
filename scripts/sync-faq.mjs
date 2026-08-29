// content/landlord-faq.html → lib/landlord-faq.ts
// FAQ 頁要依登入狀態決定顯示內容，所以不能放 public/ 當靜態檔（那樣任何人都能直接開原始檔）。
// 內容的唯一來源是 content/landlord-faq.html，這支把它包成 route handler 能 import 的模組。
// build 前會自動跑（package.json 的 build script），所以不會有兩份不同步的問題。
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "content/landlord-faq.html";
const OUT = "lib/landlord-faq.ts";

const html = readFileSync(SRC, "utf8");
for (const bad of ["`", "${", "\\"]) {
  if (html.includes(bad)) {
    throw new Error(`${SRC} 含有 ${bad}，無法直接嵌入樣板字串；請先在 ${OUT} 的產生邏輯加上跳脫處理。`);
  }
}

writeFileSync(OUT, `// 這個檔案由 scripts/sync-faq.mjs 從 ${SRC} 產生，請勿手改。
// 要改 FAQ 內容請改 ${SRC}，build 時會自動重新產生。

export const LANDLORD_FAQ_HTML = \`${html}\`;

const TODO_RE = /<mark class="todo">([\\s\\S]*?)<\\/mark>/g;

// 對外版本：拿掉黃色 <mark class="todo"> 內部註記。
// 整格只有註記的表格欄位（例：待確認）留一個破折號，避免變成空白格；
// 頁尾 JSON-LD 是同一份內容的純文字版，同樣要清掉，否則註記會從原始碼外流。
export function stripInternalNotes(html: string): string {
  const notes = new Set<string>();
  for (const m of html.matchAll(TODO_RE)) notes.add(m[1].trim());

  let out = html
    .replace(/<td class="num"><mark class="todo">[\\s\\S]*?<\\/mark><\\/td>/g, '<td class="num">—</td>')
    .replace(TODO_RE, "");

  out = out.replace(
    /(<script type="application\\/ld\\+json">)([\\s\\S]*?)(<\\/script>)/,
    (_all, open, json, close) => {
      let j = json;
      // 「…。」是給自己人的提醒，整句刪掉；「待確認」是欄位值，換成破折號
      for (const n of notes) j = j.split(n).join(n.endsWith("。") ? "" : "—");
      return open + j + close;
    }
  );

  return out;
}
`);

const marks = (html.match(TODO_COUNT_RE()) || []).length;
console.log(`已產生 ${OUT}（${SRC}，內部註記 ${marks} 處）`);
function TODO_COUNT_RE() { return /<mark class="todo">/g; }
