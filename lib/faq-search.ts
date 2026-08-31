// 屋主問答 /ask 的比對引擎：純本機關鍵字＋近義詞，不呼叫任何 AI。
//
// 做法分三層：
//   ① 近義詞群（CONCEPTS）：把屋主可能講的說法（房租／月租／收租）收斂成同一個概念（rent）。
//      每題 FAQ 依自己的「問題」與「答案」文字自動貼上概念標籤，所以新增題目不必手動維護對照表。
//   ② 概念命中：問句命中的概念，若出現在該題的問題裡權重高、只出現在答案裡權重低。
//   ③ 字面相似度：中文沒有詞界，用 bigram（相鄰兩字）重疊度補足概念抓不到的問法。
//
// 這個檔案刻意不 import 任何執行期模組（只 import type），方便用 node 直接跑測試。
import type { FaqEntry } from "./faq-index";

// ── 近義詞群 ────────────────────────────────────────────────────
// terms 是「屋主可能打出來的字」，不是 FAQ 的用語；FAQ 用語會自動被標到。
export const CONCEPTS: { id: string; terms: string[] }[] = [
  { id: "compare", terms: ["差多少", "差在哪", "差別", "比較", "哪個好", "划算", "實拿", "值得", "選哪"] },
  { id: "daiguan", terms: ["代管", "託管", "代租", "幫我管", "交給你們管"] },
  { id: "baozu", terms: ["包租", "保證租金", "固定租金", "轉租給你們", "你們承租"] },
  { id: "shezhai", terms: ["社宅", "社會住宅", "政府", "公辦", "包租代管計畫"] },
  { id: "rent", terms: ["租金", "房租", "月租", "收租", "租多少", "租到多少", "行情", "定價", "調漲", "漲租"] },
  { id: "discount", terms: ["幾折", "幾成", "折數", "打折", "五折", "七折", "成數"] },
  { id: "fee", terms: ["服務費", "手續費", "佣金", "仲介費", "抽成", "收費", "費用", "要收多少", "抽多少", "管理費怎麼收"] },
  { id: "payout", terms: ["入帳", "撥款", "匯款", "幾號", "何時給", "什麼時候給", "收支", "明細", "對帳", "報表"] },
  { id: "vacancy", terms: ["空租", "空窗", "空置", "租不出去", "沒人租", "空著", "免收租", "沒租出去"] },
  { id: "renew", terms: ["續約", "續租", "再簽", "重簽", "再收一次"] },
  { id: "tax", terms: ["稅", "節稅", "稅務", "綜所稅", "所得稅", "報稅", "申報", "免稅", "扣除", "必要費用", "省稅"] },
  { id: "housetax", terms: ["房屋稅", "地價稅", "自住", "非自住", "囤房", "戶數", "歸戶", "稅率", "多間房", "多戶"] },
  { id: "charity", terms: ["公益出租人", "租金補貼", "租屋補貼", "包租代管身分"] },
  { id: "undeclared", terms: ["沒申報", "沒有申報", "沒報稅", "漏報", "補稅", "追查", "查稅", "國稅局", "被查"] },
  { id: "deposit", terms: ["押金", "保證金", "押二", "退押", "押幾個月"] },
  { id: "custody", terms: ["保管", "誰收", "誰保管", "放在哪", "代收", "存在哪"] },
  { id: "tenant", terms: ["房客", "租客", "承租人", "誰來住", "住的人"] },
  { id: "screening", terms: ["篩選", "審核", "挑房客", "自己挑", "可以挑", "挑選", "背景", "否決", "同意誰住", "看得到資料", "什麼人"] },
  { id: "arrears", terms: ["欠租", "不付", "遲繳", "拖欠", "收不到", "沒付", "跑掉", "呆帳"] },
  { id: "damage", terms: ["損壞", "弄壞", "賠償", "毀損", "破壞", "賠不夠", "賠不起"] },
  { id: "illegal", terms: ["違法", "毒品", "詐騙", "警察", "查扣", "牽連", "犯罪", "非法"] },
  { id: "sublet", terms: ["轉租", "分租", "二房東", "群租", "住一堆人", "住幾個人", "人數", "短租", "日租", "airbnb"] },
  { id: "eviction", terms: ["不搬", "趕人", "搬走", "訴訟", "調處", "法律", "律師", "強制執行", "打官司", "點交"] },
  { id: "repair", terms: ["修繕", "維修", "修理", "修東西", "壞掉", "故障", "漏水", "壁癌", "誰修", "誰負責修", "要修"] },
  { id: "appliance", terms: ["冷氣", "熱水器", "家電", "電器", "設備", "傢俱", "家具", "換新", "壽命", "誰換"] },
  { id: "approval", terms: ["先修", "授權", "不用問我", "先問過我", "要先問", "先問我", "事前同意", "金額以內", "多少以內", "自行處理", "先斬後奏"] },
  { id: "utility", terms: ["水電", "瓦斯", "水費", "電費", "管理費", "網路", "第四台", "誰付", "誰出"] },
  { id: "furnish", terms: ["整理", "裝潢", "添購", "佈置", "翻新", "要花錢", "先花錢", "投資"] },
  { id: "marketing", terms: ["招租", "帶看", "591", "刊登", "廣告", "多久租得掉", "去化", "認真", "找房客", "找租客", "進度", "租得掉"] },
  { id: "insurance", terms: ["保險", "火險", "地震險", "投保", "責任險"] },
  { id: "term", terms: ["幾年", "年限", "委託期間", "簽多久", "短一點", "合約期間", "綁多久"] },
  { id: "terminate", terms: ["終止", "解約", "提前", "收回", "自住", "違約金", "中途", "不想做了", "退出"] },
  { id: "sell", terms: ["賣掉", "賣房", "出售", "買賣", "過戶", "售價", "換手"] },
  { id: "expiry", terms: ["到期", "期滿", "結束", "移交", "交還", "還給我"] },
  { id: "company", terms: ["倒閉", "經營", "跑路", "營業保證金", "公司出事", "你們出問題", "倒了"] },
  { id: "visit", terms: ["看房子", "進去", "進入", "參觀", "自己去", "去看", "隱私"] },
  { id: "process", terms: ["流程", "步驟", "怎麼開始", "如何開始", "怎麼申請", "要多久", "多久可以", "第一步"] },
  { id: "documents", terms: ["文件", "資料", "準備", "證件", "權狀", "謄本", "印章", "帶什麼"] },
  { id: "existing", terms: ["現在有房客", "已經出租", "中途轉", "原本的房客", "已經有人住", "租約還在"] },
  { id: "eligibility", terms: ["資格", "符合", "可以收嗎", "收不收", "產權", "能不能收", "適合"] },
  // 屋況卡點單獨成群：這些字只出現在 Q3 的答案裡，跟一般問「資格」要分得開
  { id: "illegalbuild", terms: ["違建", "頂加", "頂樓加蓋", "加蓋", "夾層", "陽台外推", "隔套", "農舍", "工業宅", "違章"] },
];

const FULLWIDTH = /[！-～]/g;
const NOISE = /[\s、，。？！；：「」『』（）()[\]{}~～!?.,;:'"''""—\-_/\\|+*#@$%^&]/g;

/** 統一大小寫、全形半形、去標點空白，讓「Q1？」和「q1」比得起來 */
export function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(FULLWIDTH, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(NOISE, "");
}

function bigrams(s: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out;
}

/** Dice 係數：兩段文字的相鄰兩字重疊比例，0～1 */
function dice(a: string[], b: Set<string>): number {
  if (a.length === 0 || b.size === 0) return 0;
  let hit = 0;
  for (const g of a) if (b.has(g)) hit++;
  return (2 * hit) / (a.length + b.size);
}

const NORMALIZED_CONCEPTS = CONCEPTS.map((c) => ({ id: c.id, terms: c.terms.map(normalize) }));

function conceptsIn(text: string): Set<string> {
  const norm = normalize(text);
  const found = new Set<string>();
  for (const c of NORMALIZED_CONCEPTS) {
    if (c.terms.some((t) => t.length > 0 && norm.includes(t))) found.add(c.id);
  }
  return found;
}

export type IndexedEntry = {
  entry: FaqEntry;
  qNorm: string;
  qGrams: Set<string>;
  qConcepts: Set<string>;
  aConcepts: Set<string>;
};

/** 把 FAQ 題目預先標上概念標籤。頁面載入時跑一次即可。 */
export function buildSearchIndex(entries: FaqEntry[]): IndexedEntry[] {
  return entries.map((entry) => {
    const qNorm = normalize(entry.q);
    return {
      entry,
      qNorm,
      qGrams: new Set(bigrams(qNorm)),
      qConcepts: conceptsIn(entry.q),
      aConcepts: conceptsIn(entry.text),
    };
  });
}

export type Hit = { entry: FaqEntry; score: number; concepts: string[] };

/** 分數門檻：達 STRONG 直接給答案，達 MAYBE 給候選題目，都沒到就是找不到 */
export const STRONG = 4;
export const MAYBE = 2;

const W_CONCEPT_IN_QUESTION = 4; // 概念出現在題目 → 這題就是在講這件事
const W_CONCEPT_IN_ANSWER = 1.2; // 只出現在答案 → 相關但未必是主題
const W_SIMILARITY = 8; // 字面相似度
const W_CONTAINS = 6; // 問句幾乎就是題目本身

export function rank(query: string, index: IndexedEntry[]): Hit[] {
  const qNorm = normalize(query);
  if (qNorm.length < 2) return [];

  const queryConcepts = conceptsIn(query);
  const qGrams = bigrams(qNorm);

  return index
    .map(({ entry, qNorm: titleNorm, qGrams: titleGrams, qConcepts, aConcepts }) => {
      let score = 0;
      const matched: string[] = [];

      for (const c of queryConcepts) {
        if (qConcepts.has(c)) {
          score += W_CONCEPT_IN_QUESTION;
          matched.push(c);
        } else if (aConcepts.has(c)) {
          score += W_CONCEPT_IN_ANSWER;
          matched.push(c);
        }
      }

      score += dice(qGrams, titleGrams) * W_SIMILARITY;

      // 「押金」這種短問句直接命中題目字面時給一把
      if (qNorm.length >= 3 && titleNorm.includes(qNorm)) score += W_CONTAINS;

      return { entry, score, concepts: matched };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.qid.localeCompare(b.entry.qid));
}

export type SearchResult =
  | { kind: "answer"; hit: Hit; related: FaqEntry[] }
  | { kind: "maybe"; suggestions: Hit[] }
  | { kind: "none" };

/**
 * 回答一句提問。
 * answer＝有把握，直接給答案＋相關題；maybe＝沒把握，列最接近的幾題讓屋主點；none＝完全沒頭緒。
 */
export function search(query: string, index: IndexedEntry[]): SearchResult {
  const hits = rank(query, index);
  if (hits.length === 0) return { kind: "none" };

  const best = hits[0];
  const second = hits[1]?.score ?? 0;
  // 分數夠高，或雖然不高但明顯甩開第二名，就當作問到了
  const confident = best.score >= STRONG || (best.score >= 2.8 && best.score >= second * 1.5);
  if (confident) {
    return { kind: "answer", hit: best, related: hits.slice(1, 3).filter((h) => h.score >= MAYBE).map((h) => h.entry) };
  }
  if (best.score >= MAYBE) return { kind: "maybe", suggestions: hits.slice(0, 3) };
  return { kind: "none" };
}
