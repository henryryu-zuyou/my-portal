// FAQ 頁裡的黃色 <mark class="todo"> 是內部註記，只給登入的同仁看。
// 這支同時被 scripts/sync-faq.mjs（產生資料）與 app/faq/route.ts（出頁面）使用，
// 保持單一來源，避免兩邊規則長不一樣。

const TODO_RE = /<mark class="todo">([\s\S]*?)<\/mark>/g;

/**
 * 拿掉內部註記。
 * 整格只有註記的表格欄位（例：待確認）留一個破折號，避免變成空白格；
 * 頁尾 JSON-LD 是同一份內容的純文字版，同樣要清掉，否則註記會從原始碼外流。
 * @param {string} html
 * @returns {string}
 */
export function stripInternalNotes(html) {
  const notes = new Set();
  for (const m of html.matchAll(TODO_RE)) notes.add(m[1].trim());

  let out = html
    .replace(/<td class="num"><mark class="todo">[\s\S]*?<\/mark><\/td>/g, '<td class="num">—</td>')
    .replace(TODO_RE, "");

  out = out.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,
    (_all, open, json, close) => {
      let j = json;
      // 「…。」是給自己人的提醒，整句刪掉；「待確認」是欄位值，換成破折號
      for (const n of notes) j = j.split(n).join(n.endsWith("。") ? "" : "—");
      return open + j + close;
    }
  );

  return out;
}

/** 內部註記的數量，給同步腳本回報用。 @param {string} html */
export function countInternalNotes(html) {
  return (html.match(/<mark class="todo">/g) || []).length;
}
