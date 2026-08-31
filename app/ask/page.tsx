"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { FAQ_ENTRIES, FAQ_CATEGORIES, type FaqEntry } from "@/lib/faq-index";
import { buildSearchIndex, search, type Hit } from "@/lib/faq-search";

type Msg =
  | { role: "user"; text: string }
  | { role: "bot"; kind: "hello" }
  | { role: "bot"; kind: "answer"; entry: FaqEntry; related: FaqEntry[] }
  | { role: "bot"; kind: "maybe"; suggestions: Hit[] }
  | { role: "bot"; kind: "none" }
  | { role: "bot"; kind: "list"; cat: string; entries: FaqEntry[] };

const HOT = FAQ_ENTRIES.filter((e) => e.catId === "start");

/** sticky header 的高度，讓提問停在它下面而不是被蓋住 */
const HEADER_OFFSET = 76;

export default function AskPage() {
  const index = useMemo(() => buildSearchIndex(FAQ_ENTRIES), []);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", kind: "hello" }]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 捲到「最後一則提問」而不是頁面最底：答案動輒上千字，捲到底等於直接跳到結論。
  // 用 scrollTo + behavior auto（不是 scrollIntoView smooth）：後者在部分瀏覽器設定下整個不動作。
  useEffect(() => {
    const asked = document.querySelectorAll<HTMLElement>("[data-user-msg]");
    const last = asked[asked.length - 1];
    if (!last) return; // 只有開場白時不捲
    const top = last.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "auto" });
  }, [msgs]);

  const ask = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    const res = search(q, index);
    const reply: Msg =
      res.kind === "answer"
        ? { role: "bot", kind: "answer", entry: res.hit.entry, related: res.related }
        : res.kind === "maybe"
          ? { role: "bot", kind: "maybe", suggestions: res.suggestions }
          : { role: "bot", kind: "none" };
    setMsgs((m) => [...m, { role: "user", text: q }, reply]);
    setInput("");
  };

  // 點題目＝直接把那題的答案端出來，不用再比對一次
  const openEntry = (entry: FaqEntry) => {
    setMsgs((m) => [
      ...m,
      { role: "user", text: entry.q },
      { role: "bot", kind: "answer", entry, related: [] },
    ]);
  };

  const openCategory = (catId: string, title: string) => {
    setMsgs((m) => [
      ...m,
      { role: "user", text: title },
      { role: "bot", kind: "list", cat: title, entries: FAQ_ENTRIES.filter((e) => e.catId === catId) },
    ]);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F2F3EF] text-[#131A18]">
      <style>{ANSWER_CSS}</style>

      <header className="sticky top-0 z-10 border-b border-[#B9CFC7] bg-[#0E5346] text-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.18em] text-[#9CC4B8]">TAOYUAN · ZUYOU</p>
            <h1 className="text-base font-bold">屋主問答</h1>
          </div>
          <a
            href="/faq"
            target="_blank"
            rel="noreferrer"
            className="ml-auto shrink-0 rounded-lg border border-[#3D7468] px-3 py-1.5 text-xs hover:bg-[#08332B]"
          >
            看完整 37 題 ↗
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        <div className="flex flex-col gap-4">
          {msgs.map((m, i) => (
            <Bubble key={i} msg={m} onPick={openEntry} onCategory={openCategory} />
          ))}
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-[#DCE0DA] bg-[#F2F3EF] pb-[env(safe-area-inset-bottom)]">
        <form
          className="mx-auto flex max-w-2xl gap-2 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
            // preventScroll：不加的話 focus 會把畫面拉回底部的輸入列，蓋掉上面「捲到提問」那段
            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="想問什麼？例如：冷氣壞了誰要修"
            className="min-w-0 flex-1 rounded-xl border border-[#B9CFC7] bg-white px-4 py-3 text-[15px] outline-none focus:border-[#0E5346]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="shrink-0 rounded-xl bg-[#0E5346] px-5 text-[15px] font-semibold text-white disabled:bg-[#B9CFC7]"
          >
            問
          </button>
        </form>
      </footer>
    </div>
  );
}

function Bubble({
  msg,
  onPick,
  onCategory,
}: {
  msg: Msg;
  onPick: (e: FaqEntry) => void;
  onCategory: (catId: string, title: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end" data-user-msg>
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#0E5346] px-4 py-2.5 text-[15px] leading-relaxed text-white">
          {msg.text}
        </p>
      </div>
    );
  }

  const card = "rounded-2xl rounded-bl-sm border border-[#DCE0DA] bg-white px-4 py-3.5 text-[15px] leading-relaxed";

  if (msg.kind === "hello") {
    return (
      <div className={card}>
        <p className="mb-1">您好，我可以從租寓整理的 37 題屋主常見問題裡幫您找答案。</p>
        <p className="mb-3 text-[13px] text-[#7C8783]">直接用您習慣的說法問就好，例如「押金誰保管」「以前沒報稅會被查嗎」。</p>
        <Chips label="最多人問" items={HOT.map((e) => ({ key: e.id, text: e.q, onClick: () => onPick(e) }))} />
        <div className="mt-3">
          <Chips
            label="或看分類"
            items={FAQ_CATEGORIES.filter((c) => c.id !== "start").map((c) => ({
              key: c.id,
              text: c.title,
              onClick: () => onCategory(c.id, c.title),
            }))}
          />
        </div>
      </div>
    );
  }

  if (msg.kind === "answer") {
    return (
      <div className={card}>
        <p className="mb-1 text-[11px] font-medium tracking-wider text-[#0E5346]">
          {msg.entry.qid}　{msg.entry.cat}
        </p>
        <p className="mb-2.5 text-[16px] font-bold text-[#131A18]">{msg.entry.q}</p>
        <div className="faq-ans" dangerouslySetInnerHTML={{ __html: msg.entry.html }} />
        {msg.entry.hasCalc && (
          <p className="mt-3 rounded-lg border border-[#B9CFC7] bg-[#E4EDE9] px-3 py-2 text-[13px] text-[#08332B]">
            上表以綜所稅率 20% 計算。
            <a href={`/faq#${msg.entry.catId}`} target="_blank" rel="noreferrer" className="ml-1 font-semibold underline">
              到 FAQ 頁換成您適用的稅率 ↗
            </a>
          </p>
        )}
        {msg.related.length > 0 && (
          <div className="mt-3.5 border-t border-[#EDF0EC] pt-3">
            <Chips
              label="相關問題"
              items={msg.related.map((e) => ({ key: e.id, text: e.q, onClick: () => onPick(e) }))}
            />
          </div>
        )}
      </div>
    );
  }

  if (msg.kind === "maybe") {
    return (
      <div className={card}>
        <p className="mb-3">我不太確定有沒有聽懂，您要問的是不是這幾題？</p>
        <Chips
          items={msg.suggestions.map((h) => ({ key: h.entry.id, text: h.entry.q, onClick: () => onPick(h.entry) }))}
        />
      </div>
    );
  }

  if (msg.kind === "list") {
    return (
      <div className={card}>
        <p className="mb-3">
          <b>{msg.cat}</b> 這一類有這幾題：
        </p>
        <Chips items={msg.entries.map((e) => ({ key: e.id, text: e.q, onClick: () => onPick(e) }))} />
      </div>
    );
  }

  return (
    <div className={card}>
      <p className="mb-1">這題不在目前的 37 題常見問題裡，我不敢亂答。</p>
      <p className="mb-3 text-[13px] text-[#7C8783]">
        可以換個說法再問一次，或直接問您的租寓專員 —— 個案狀況專員回答得比這裡準。
      </p>
      <Chips
        label="換個方向看看"
        items={FAQ_CATEGORIES.map((c) => ({
          key: c.id,
          text: c.title,
          onClick: () => onCategory(c.id, c.title),
        }))}
      />
    </div>
  );
}

function Chips({
  label,
  items,
}: {
  label?: string;
  items: { key: string; text: string; onClick: () => void }[];
}) {
  return (
    <div>
      {label && <p className="mb-1.5 text-[11px] tracking-wider text-[#7C8783]">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={it.onClick}
            className="rounded-full border border-[#B9CFC7] bg-[#E4EDE9] px-3 py-1.5 text-left text-[13px] text-[#08332B] hover:bg-[#D4E3DD]"
          >
            {it.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// FAQ 答案沿用原頁面的 class（表格、雙欄對照、法源），這裡把需要的樣式重現一份。
// 只作用在 .faq-ans 內，不會影響頁面其他部分。
const ANSWER_CSS = `
:root{color-scheme:light}
button,a,input{touch-action:manipulation}
.faq-ans{color:#4A5754;font-size:15px;line-height:1.8}
.faq-ans > :first-child{margin-top:0}
.faq-ans > :last-child{margin-bottom:0}
.faq-ans p{margin:0 0 11px}
.faq-ans strong{color:#131A18;font-weight:700}
.faq-ans ul{margin:0 0 11px;padding-left:1.15em}
.faq-ans li{margin-bottom:5px}
.faq-ans .tbl-scroll{overflow-x:auto;margin:0 0 13px;-webkit-overflow-scrolling:touch}
.faq-ans table{border-collapse:collapse;width:100%;min-width:460px;font-size:14px;background:#fff}
.faq-ans th,.faq-ans td{border:1px solid #DCE0DA;padding:8px 11px;text-align:left;vertical-align:top}
.faq-ans thead th{background:#0E5346;color:#fff;font-weight:500;font-size:13px}
.faq-ans tbody th{background:#F7F8F5;font-weight:500;white-space:nowrap}
.faq-ans td.num,.faq-ans th.num{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:13.5px;white-space:nowrap}
.faq-ans small{color:#7C8783;font-size:11.5px}
.faq-ans .duo{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:4px 0 13px}
.faq-ans .duo-cell{border:1px solid #DCE0DA;border-radius:8px;padding:11px 13px;background:#FBFCFA}
.faq-ans .duo-cell.b{background:#E4EDE9;border-color:#B9CFC7}
.faq-ans .duo-cell p{margin:0 0 7px;font-size:14.5px;line-height:1.75}
.faq-ans .duo-cell p:last-child{margin-bottom:0}
.faq-ans .duo-tag{display:block;margin-bottom:5px;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.12em;font-weight:600;color:#0E5346}
.faq-ans .duo-cell.b .duo-tag{color:#08332B}
.faq-ans .key{border-left:3px solid #B0392F;background:#FBEDEB;padding:12px 15px;border-radius:0 8px 8px 0;margin:0 0 13px}
.faq-ans .key p{margin:0;font-size:14.5px;color:#5A2320}
.faq-ans .key strong{color:#B0392F}
.faq-ans .law{border-top:1px dashed #DCE0DA;padding-top:8px;margin-top:11px;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#7C8783}
@media (max-width:560px){.faq-ans .duo{grid-template-columns:1fr;gap:8px}}
`;
