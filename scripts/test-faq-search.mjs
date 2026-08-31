// /ask 比對引擎的回歸測試：node scripts/test-faq-search.mjs
// 每列＝屋主可能怎麼問 → 期待命中的題號（expect: null 代表「本來就該找不到」）
import { FAQ_ENTRIES } from "../lib/faq-index.ts";
import { buildSearchIndex, search, rank } from "../lib/faq-search.ts";

const CASES = [
  ["房租大概可以拿多少", ["Q4", "Q5"]],
  ["保證租金是市價幾折", ["Q4"]],
  ["冷氣壞了誰要修", ["Q25", "Q23"]],
  ["漏水誰負責", ["Q23"]],
  ["房客不繳房租怎麼辦", ["Q18"]],
  ["可以省什麼稅", ["Q12"]],
  ["房屋稅會不會變便宜", ["Q15", "Q12"]],
  ["押金誰保管", ["Q10"]],
  ["要簽幾年", ["Q29"]],
  ["我想把房子賣掉", ["Q31", "Q30"]],
  ["房客到期不搬走", ["Q22"]],
  ["水電瓦斯誰付", ["Q9"]],
  ["什麼時候撥款給我", ["Q8"]],
  ["服務費怎麼算", ["Q7"]],
  ["包租跟代管差在哪", ["Q2"]],
  ["我家是頂樓加蓋可以收嗎", ["Q3"]],
  ["要準備什麼文件", ["Q36"]],
  ["現在有房客可以轉給你們管嗎", ["Q37"]],
  ["會不會被偷偷分租給很多人", ["Q20"]],
  ["你們公司倒了我的押金怎麼辦", ["Q33"]],
  ["我可以自己去看房子嗎", ["Q34"]],
  ["整個流程要多久", ["Q35"]],
  ["空屋沒人租我還有錢拿嗎", ["Q6"]],
  ["以前租金沒報稅會被查嗎", ["Q14"]],
  ["續約還要再付一次仲介費嗎", ["Q11"]],
  ["房客可以自己挑嗎", ["Q17"]],
  ["中途想收回來自己住", ["Q30"]],
  ["需要先花錢裝潢嗎", ["Q26"]],
  ["火險誰保", ["Q28"]],
  ["自己租跟給你們差多少", ["Q1"]],
  ["公益出租人要自己申請嗎", ["Q13"]],
  ["房客在裡面做壞事我會被抓嗎", ["Q21"]],
  ["押金不夠賠怎麼辦", ["Q19"]],
  ["修東西要先問過我嗎", ["Q24"]],
  ["怎麼知道你們有在認真找房客", ["Q27"]],
  ["我有很多間房會影響其他房子嗎", ["Q16"]],
  ["合約到期房客還在裡面", ["Q32"]],
  ["今天天氣如何", null],
  ["你們在台東有服務嗎", null],
];

const index = buildSearchIndex(FAQ_ENTRIES);
let pass = 0;
const fails = [];

for (const [q, expect] of CASES) {
  const res = search(q, index);
  const top = rank(q, index).slice(0, 3).map((h) => h.entry.qid);
  let ok;
  if (expect === null) {
    ok = res.kind !== "answer";
  } else {
    ok = res.kind === "answer" && expect.includes(res.hit.entry.qid);
  }
  if (ok) pass++;
  else fails.push({ q, expect, kind: res.kind, top, score: rank(q, index)[0]?.score.toFixed(1) });
}

console.log(`通過 ${pass}/${CASES.length}`);
for (const f of fails) {
  console.log(
    `  ✗ ${f.q}\n     期待 ${f.expect ? f.expect.join("/") : "找不到"}｜實際 ${f.kind}（最高分 ${f.score ?? "-"}）｜前三 ${f.top.join(", ")}`
  );
}
process.exit(fails.length ? 1 : 0);
