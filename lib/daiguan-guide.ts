export const DAIGUAN_GUIDE_HTML = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>代管建議計分表</title>
<style>
:root{
  --ground:#EFF2F1; --surface:#FFFFFF; --sunk:#E4E9E7;
  --ink:#14181A; --muted:#5C6866; --line:#D2DAD8; --line-soft:#E2E8E6;
  --soc:#0C6459; --soc-bg:#DDEDE9;
  --gen:#9E2B4A; --gen-bg:#F6E2E7;
  --zero:#77817F; --zero-bg:#E6EAE9;
  --flag:#7A5A00; --flag-bg:#F6EECB;
  --sans:"PingFang TC","Microsoft JhengHei","Noto Sans TC",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --ground:#0F1413; --surface:#161C1B; --sunk:#1D2423;
    --ink:#E7EDEB; --muted:#94A19E; --line:#2A3332; --line-soft:#222A29;
    --soc:#59D3C0; --soc-bg:#12302C;
    --gen:#F58BA3; --gen-bg:#331A22;
    --zero:#8B9694; --zero-bg:#212827;
    --flag:#E3C860; --flag-bg:#2C2612;
  }
}
:root[data-theme="dark"]{
  --ground:#0F1413; --surface:#161C1B; --sunk:#1D2423;
  --ink:#E7EDEB; --muted:#94A19E; --line:#2A3332; --line-soft:#222A29;
  --soc:#59D3C0; --soc-bg:#12302C;
  --gen:#F58BA3; --gen-bg:#331A22;
  --zero:#8B9694; --zero-bg:#212827;
  --flag:#E3C860; --flag-bg:#2C2612;
}
*{box-sizing:border-box}
body{
  margin:0;background:var(--ground);color:var(--ink);
  font-family:var(--sans);font-size:16px;line-height:1.8;
  -webkit-text-size-adjust:100%;
}
.wrap{max-width:880px;margin:0 auto;padding:0 20px 96px;display:flex;flex-direction:column;gap:0}
a{color:var(--ink);text-decoration-thickness:1px;text-underline-offset:3px}
:focus-visible{outline:2px solid var(--soc);outline-offset:3px}

/* ---------- header ---------- */
header{padding:52px 0 30px;border-bottom:2px solid var(--ink);display:flex;flex-direction:column;gap:16px}
.eyebrow{
  font-family:var(--mono);font-size:11.5px;font-weight:500;letter-spacing:.16em;
  text-transform:uppercase;color:var(--muted);
  display:flex;flex-wrap:wrap;gap:4px 10px;margin:0
}
h1{
  font-size:clamp(28px,6.2vw,44px);font-weight:800;line-height:1.2;letter-spacing:-.02em;
  margin:0;text-wrap:balance
}
.lede{margin:0;max-width:60ch;color:var(--muted);font-size:16.5px}
.lede b{color:var(--ink);font-weight:600}

/* ---------- sections ---------- */
section{padding:42px 0;border-bottom:1px solid var(--line-soft);display:flex;flex-direction:column;gap:20px}
section:last-of-type{border-bottom:0}
.shead{display:flex;flex-direction:column;gap:6px}
.slabel{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
h2{font-size:23px;font-weight:800;letter-spacing:-.01em;margin:0;text-wrap:balance}
.ssub{margin:0;color:var(--muted);font-size:14.5px;max-width:62ch}
h3{font-size:16px;font-weight:700;margin:0}

/* ---------- flow steps ---------- */
.flow{display:flex;flex-direction:column;gap:0;background:var(--surface);border:1px solid var(--line);border-radius:3px}
.step{display:grid;grid-template-columns:34px 1fr;gap:2px 14px;padding:15px 18px;border-bottom:1px solid var(--line-soft)}
.step:last-child{border-bottom:0}
.step .k{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--muted);padding-top:5px}
.step .t{font-weight:600;font-size:15.5px}
.step .d{grid-column:2;color:var(--muted);font-size:14px;line-height:1.7}
.step .d code{font-family:var(--mono);font-size:12.5px;background:var(--sunk);padding:1px 5px;border-radius:2px}

/* ---------- number line ---------- */
.axis{display:flex;flex-direction:column;gap:0;overflow-x:auto}
.axis-bar{display:flex;min-width:520px;border:1px solid var(--line);border-radius:3px;overflow:hidden}
.zone{padding:14px 16px;display:flex;flex-direction:column;gap:3px;border-right:1px solid var(--line)}
.zone:last-child{border-right:0}
.zone .rng{font-family:var(--mono);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.zone .out{font-size:14.5px;font-weight:600;line-height:1.5}
.zone .cnt{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.04em}
.z-gen{flex:8;background:var(--gen-bg)}.z-gen .rng,.z-gen .out{color:var(--gen)}
.z-mid{flex:3;background:var(--zero-bg)}.z-mid .rng,.z-mid .out{color:var(--ink)}
.z-soc{flex:6;background:var(--soc-bg)}.z-soc .rng,.z-soc .out{color:var(--soc)}

/* ---------- question cards ---------- */
.qcard{background:var(--surface);border:1px solid var(--line);border-radius:3px;display:flex;flex-direction:column}
.qhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px;padding:15px 18px;border-bottom:1px solid var(--line)}
.qnum{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--muted)}
.qtext{font-weight:700;font-size:16px}
.qkey{font-family:var(--mono);font-size:11.5px;color:var(--muted);background:var(--sunk);padding:2px 7px;border-radius:2px;margin-left:auto}
.opts{display:flex;flex-direction:column}
.opt{
  display:grid;grid-template-columns:58px 1fr;gap:5px 14px;
  padding:14px 18px;border-bottom:1px dotted var(--line);align-items:baseline
}
.opt:last-child{border-bottom:0}
.chip{
  font-family:var(--mono);font-size:13.5px;font-weight:600;font-variant-numeric:tabular-nums;
  text-align:center;padding:3px 0;border-radius:2px;letter-spacing:.02em
}
.pos{color:var(--soc);background:var(--soc-bg)}
.neg{color:var(--gen);background:var(--gen-bg)}
.nil{color:var(--zero);background:var(--zero-bg)}
.opt-l{font-weight:600;font-size:15px}
.opt-r{grid-column:2;margin:0;color:var(--muted);font-size:14px;line-height:1.72}
.opt-r::before{content:"房東會看到：";color:var(--ink);font-weight:600}
.opt-r.silent{color:var(--zero)}
.opt-r.silent::before{content:"";display:none}
.opt-r.note::before{content:"以「另外：」黃底註記顯示：";color:var(--flag);font-weight:600}
@media (min-width:760px){
  .opt{grid-template-columns:58px 170px 1fr;gap:14px}
  .opt-r{grid-column:3}
}

/* ---------- effects list ---------- */
.eff{display:flex;flex-direction:column;gap:0;background:var(--surface);border:1px solid var(--line);border-radius:3px}
.eff > div{padding:15px 18px;border-bottom:1px solid var(--line-soft);display:flex;flex-direction:column;gap:4px}
.eff > div:last-child{border-bottom:0}
.eff .what{font-weight:700;font-size:15.5px;display:flex;flex-wrap:wrap;gap:8px;align-items:baseline}
.tag{font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);border:1px solid var(--line);border-radius:2px;padding:1px 6px}
.eff p{margin:0;color:var(--muted);font-size:14.5px}
.eff .three{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}
.stamp{
  font-family:var(--mono);font-size:12px;font-weight:600;padding:4px 10px;border-radius:2px;
  border:1.5px solid currentColor
}
.stamp.s{color:var(--soc)}.stamp.g{color:var(--gen)}.stamp.b{color:var(--zero)}
blockquote{
  margin:0;padding:11px 14px;background:var(--sunk);border-left:3px solid var(--line);
  font-size:14px;line-height:1.72;color:var(--ink);border-radius:0 2px 2px 0
}

/* ---------- examples ---------- */
.ex{background:var(--surface);border:1px solid var(--line);border-radius:3px;display:flex;flex-direction:column;gap:10px;padding:16px 18px}
.ex-t{font-weight:700;font-size:15.5px}
.tally{display:flex;flex-wrap:wrap;align-items:center;gap:7px;font-family:var(--mono);font-size:12.5px;
  font-variant-numeric:tabular-nums;color:var(--muted)}
.tally .b{padding:2px 7px;border-radius:2px;white-space:nowrap}
.tally .op{color:var(--muted);font-weight:600}
.tally .tot{font-weight:700;color:var(--ink);padding:2px 8px;border:1px solid var(--ink);border-radius:2px}
.ex-out{font-size:14.5px;margin:0}
.ex-out b{font-weight:700}
.ex-out.s b{color:var(--soc)}.ex-out.g b{color:var(--gen)}.ex-out.b b{color:var(--ink)}
.ex-note{margin:0;font-size:13.5px;color:var(--muted)}

/* ---------- watch-outs ---------- */
.watch{display:flex;flex-direction:column;gap:0;border-top:1px solid var(--line)}
.watch > div{padding:16px 0;border-bottom:1px solid var(--line-soft);display:flex;flex-direction:column;gap:5px}
.watch h3{display:flex;gap:9px;align-items:baseline}
.watch h3 .m{font-family:var(--mono);font-size:11px;font-weight:600;color:var(--gen);letter-spacing:.1em;flex:none}
.watch p{margin:0;color:var(--muted);font-size:14.5px}
.watch p code{font-family:var(--mono);font-size:12.5px;background:var(--sunk);padding:1px 5px;border-radius:2px}

/* ---------- dist table ---------- */
.tblwrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:420px;font-size:14.5px}
th,td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line-soft)}
thead th{font-size:12px;font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);font-weight:600;border-bottom:1.5px solid var(--ink)}
td.n{font-family:var(--mono);font-variant-numeric:tabular-nums;text-align:right}
tbody tr:last-child td{border-bottom:0}

footer{padding:30px 0 0;border-top:2px solid var(--ink);color:var(--muted);font-size:13px;display:flex;flex-direction:column;gap:8px}
footer p{margin:0}
footer code{font-family:var(--mono);font-size:12px;background:var(--sunk);padding:1px 5px;border-radius:2px}
</style>

</head>
<body>
<div class="wrap">

<header>
  <p class="eyebrow"><span>內部文件</span><span>·</span><span>my-portal / daiguan</span><span>·</span><span>2026-08-18</span></p>
  <h1>五個問題，怎麼算出那個印章</h1>
  <p class="lede">房東在 <a href="https://my-portal-fawn.vercel.app/daiguan" target="_blank" rel="noopener">/daiguan</a> 點完五題，右下角會蓋出「社宅／一般／兩者皆可」。<b>那不是 AI 判斷，是一張固定的加減分表。</b>這份文件寫給要拿這頁跟房東談的同仁：每個選項值幾分、分數如何變成結論、房東螢幕上會出現哪些句子，以及哪幾個地方最容易被誤解。</p>
</header>

<section>
  <div class="shead">
    <span class="slabel">運作方式</span>
    <h2>四個步驟，全部在房東的瀏覽器裡跑完</h2>
  </div>
  <div class="flow">
    <div class="step">
      <span class="k">01</span><span class="t">每個選項帶一個固定分數</span>
      <span class="d">正分＝偏社宅代管，負分＝偏一般代管，0 分＝不表態。分數寫死在頁面裡，不看行情、不查資料。</span>
    </div>
    <div class="step">
      <span class="k">02</span><span class="t">五題分數直接相加</span>
      <span class="d">沒有加權、沒有交互作用，五個數字相加就是總分。範圍 <code>−9</code> 到 <code>+7</code>。</span>
    </div>
    <div class="step">
      <span class="k">03</span><span class="t">總分落進三個區間之一</span>
      <span class="d">區間決定印章與標題。<code>+2</code> 以上社宅、<code>−2</code> 以下一般、中間三格（<code>−1 / 0 / +1</code>）兩者皆可。</span>
    </div>
    <div class="step">
      <span class="k">04</span><span class="t">挑出最多三條理由呈現</span>
      <span class="d">只挑<b>與結論同方向</b>的理由，依分數由大到小排序，取前三條。反方向的理由不會出現。</span>
    </div>
    <div class="step">
      <span class="k">—</span><span class="t">沒有送出鈕，也沒有紀錄</span>
      <span class="d">每點一下就即時重算。房東的作答不會回傳公司、不會存檔，我們事後看不到他點了什麼。要留紀錄請自己記下來。</span>
    </div>
  </div>
</section>

<section>
  <div class="shead">
    <span class="slabel">門檻</span>
    <h2>分數線</h2>
    <p class="ssub">寬度按實際分數範圍畫。負向可以跌到 −9、正向最多只到 +7，這張表天生偏保守。</p>
  </div>
  <div class="axis">
    <div class="axis-bar">
      <div class="zone z-gen">
        <span class="rng">−9 … −2</span>
        <span class="out">建議優先評估一般代管</span>
        <span class="cnt">324 種組合中占 125</span>
      </div>
      <div class="zone z-mid">
        <span class="rng">−1 … +1</span>
        <span class="out">兩種都可行</span>
        <span class="cnt">占 120</span>
      </div>
      <div class="zone z-soc">
        <span class="rng">+2 … +7</span>
        <span class="out">建議優先評估社宅代管</span>
        <span class="cnt">占 79</span>
      </div>
    </div>
  </div>
  <div class="tblwrap">
    <table>
      <thead><tr><th>結論</th><th>觸發條件</th><th>組合數</th><th>占比</th></tr></thead>
      <tbody>
        <tr><td>一般代管</td><td>總分 ≤ −2</td><td class="n">125</td><td class="n">38.6%</td></tr>
        <tr><td>兩者皆可</td><td>−1 ~ +1</td><td class="n">120</td><td class="n">37.0%</td></tr>
        <tr><td>社宅代管</td><td>總分 ≥ +2</td><td class="n">79</td><td class="n">24.4%</td></tr>
      </tbody>
    </table>
  </div>
  <blockquote>五題全部選項互相排列共 324 種。<b>推到社宅的組合不到四分之一</b>——這是刻意的：社宅有屋況門檻與綁約成本，寧可少推、不要推錯。</blockquote>
</section>

<section>
  <div class="shead">
    <span class="slabel">計分表</span>
    <h2>五題逐項分數與對應話術</h2>
    <p class="ssub">「房東會看到」欄位是頁面原文，逐字引用。同一句話你在解說時最好也講得到，避免螢幕跟口頭說法不一致。</p>
  </div>

  <div class="qcard">
    <div class="qhead"><span class="qnum">01</span><span class="qtext">這間房子的市場行情月租金大約是</span><span class="qkey">rent</span></div>
    <div class="opts">
      <div class="opt">
        <span class="chip pos">+1</span><span class="opt-l">1.5 萬以下</span>
        <p class="opt-r">租金 1.5 萬以下，每月 1.5 萬元的免稅額幾乎全額用得到，稅務優惠最有感</p>
      </div>
      <div class="opt">
        <span class="chip nil">0</span><span class="opt-l">1.5 – 2.5 萬</span>
        <p class="opt-r silent">不表態，也不產生任何理由文字。</p>
      </div>
      <div class="opt">
        <span class="chip neg">−1</span><span class="opt-l">2.5 萬以上</span>
        <p class="opt-r">租金 2.5 萬以上，市價收租的價值通常高過社宅的租金折讓</p>
      </div>
    </div>
  </div>

  <div class="qcard">
    <div class="qhead"><span class="qnum">02</span><span class="qtext">過去這間房子好不好租</span><span class="qkey">fill</span></div>
    <div class="opts">
      <div class="opt">
        <span class="chip neg">−2</span><span class="opt-l">很快就租掉</span>
        <p class="opt-r">這間房子本來就好租，空屋風險低，市價出租的效益更高</p>
      </div>
      <div class="opt">
        <span class="chip nil">0</span><span class="opt-l">普通，找一陣子</span>
        <p class="opt-r silent">不表態，也不產生任何理由文字。</p>
      </div>
      <div class="opt">
        <span class="chip pos">+2</span><span class="opt-l">常常空著</span>
        <p class="opt-r">這間房子常常空著，穩定媒合與免服務費能實際減少空轉損失</p>
      </div>
      <div class="opt">
        <span class="chip nil">0</span><span class="opt-l">從未出租過</span>
        <p class="opt-r note">這間房子還沒出租過，沒有實際紀錄可以判斷市場需求，建議先請業者估行情。空屋在桃園適用非自住住家用稅率，房屋稅 3.2%～4.8%，兩種方案都能降到 1.5% 以下</p>
      </div>
    </div>
  </div>

  <div class="qcard">
    <div class="qhead"><span class="qnum">03</span><span class="qtext">未來三年內，有沒有可能賣掉或收回自用</span><span class="qkey">exit</span></div>
    <div class="opts">
      <div class="opt">
        <span class="chip pos">+1</span><span class="opt-l">不會，就是長期收租</span>
        <p class="opt-r">長期收租、沒有處分打算，綁約對您幾乎沒有成本</p>
      </div>
      <div class="opt">
        <span class="chip neg">−1</span><span class="opt-l">說不準</span>
        <p class="opt-r">未來不確定是否處分，一般代管可協議終止，退出成本較低</p>
      </div>
      <div class="opt">
        <span class="chip neg">−3</span><span class="opt-l">很可能會</span>
        <p class="opt-r">三年內可能賣屋或收回自用，社宅提前終止會受限，已領補助也要退還</p>
      </div>
    </div>
  </div>

  <div class="qcard">
    <div class="qhead"><span class="qnum">04</span><span class="qtext">這間房子的租金收入，過去有申報綜合所得稅嗎</span><span class="qkey">tax</span></div>
    <div class="opts">
      <div class="opt">
        <span class="chip nil">0</span><span class="opt-l">有申報</span>
        <p class="opt-r silent">不表態，也不產生任何理由文字。</p>
      </div>
      <div class="opt">
        <span class="chip pos">+2</span><span class="opt-l">沒有</span>
        <p class="opt-r">過去未申報租金所得，社宅契約依法不得作為查核租賃所得的依據</p>
      </div>
      <div class="opt">
        <span class="chip pos">+1</span><span class="opt-l">不確定</span>
        <p class="opt-r">申報狀況不確定，建議先諮詢再決定，社宅在這一點上的規定較有保障</p>
      </div>
    </div>
  </div>

  <div class="qcard">
    <div class="qhead"><span class="qnum">05</span><span class="qtext">目前的屋況</span><span class="qkey">cond</span></div>
    <div class="opts">
      <div class="opt">
        <span class="chip nil">0</span><span class="opt-l">良好，可直接出租</span>
        <p class="opt-r silent">不表態，也不產生任何理由文字。</p>
      </div>
      <div class="opt">
        <span class="chip pos">+1</span><span class="opt-l">需要一些整修</span>
        <p class="opt-r">需要整修，社宅每年最高 1 萬元的修繕補助可以分攤成本</p>
      </div>
      <div class="opt">
        <span class="chip neg">−3</span><span class="opt-l">有加蓋或違規隔間</span>
        <p class="opt-r">有加蓋或違規隔間，須先處理完成才能通過社宅檢查，短期內不易加入</p>
      </div>
    </div>
  </div>

  <blockquote><b>單題影響力排序：</b>屋況違規 −3、三年內想賣 −3、常常空著 +2、未申報所得 +2、很快就租掉 −2，其餘都只有 ±1。前兩項任何一個單獨出現，就足以把結論拉到「一般代管」。</blockquote>
</section>

<section>
  <div class="shead">
    <span class="slabel">影響範圍</span>
    <h2>分數改變了畫面上的什麼</h2>
    <p class="ssub">總分本身不顯示。房東看到的是下面這六樣東西。</p>
  </div>
  <div class="eff">
    <div>
      <span class="what">圓形印章 <span class="tag">visual</span></span>
      <div class="three"><span class="stamp s">社宅</span><span class="stamp g">一般</span><span class="stamp b">兩者皆可</span></div>
      <p>只在結論「陣營改變」時重播蓋章動畫。同一陣營內改答案，印章不會再動一次——房東可能因此以為沒反應。</p>
    </div>
    <div>
      <span class="what">大標題 <span class="tag">text</span></span>
      <p>「建議優先評估社宅代管」／「建議優先評估一般代管」／「兩種都可行，看您重視什麼」。</p>
    </div>
    <div>
      <span class="what">理由清單，最多三條 <span class="tag">logic</span></span>
      <p>只列與結論同方向的理由，依分數由大到小取前三。<b>結論偏社宅時，不利社宅的理由整條被藏起來</b>（反之亦然）。唯一例外是「兩者皆可」——它把正反理由混在一起排序，所以同一份結果裡可能同時看到支持與反對，這是正常的。</p>
      <p>若同方向完全沒有理由（五題全選 0 分那類），會顯示「各項條件都很平均，兩種方案的差距不大。」</p>
    </div>
    <div>
      <span class="what">「另外：」黃底註記 <span class="tag">conditional</span></span>
      <p>只有第 2 題選「從未出租過」會觸發。它是 0 分，不影響結論，只補一段空屋房屋稅 3.2%～4.8% 的提醒。</p>
    </div>
    <div>
      <span class="what">固定警語，每次都出現 <span class="tag">always</span></span>
      <blockquote>租金折數是影響結論最大的變數，實際折數需看屋評估後才能確定。上面的建議只用租金級距粗估，若折數與預期差距大，結論可能翻轉。</blockquote>
      <p>社宅的分級租金折數<b>沒有進入計分</b>。這是刻意留白，也是我們談的時候唯一該咬住的重點：折數要看屋才報得出來。</p>
    </div>
    <div>
      <span class="what">結尾的一句退路 <span class="tag">text</span></span>
      <p>社宅結論 →「若之後屋況或出租計畫改變，一般代管仍可隨時切換。」<br>
         一般結論 →「若日後空置變長，或不再考慮出售，社宅代管會重新變得划算。」<br>
         兩者皆可 →「想要租金與彈性，選一般代管；想要免服務費與稅務優惠，選社宅代管。」</p>
    </div>
  </div>
</section>

<section>
  <div class="shead">
    <span class="slabel">實例</span>
    <h2>五組實際算給你看</h2>
    <p class="ssub">順序為 租金／好不好租／三年處分／申報／屋況。</p>
  </div>

  <div class="ex">
    <span class="ex-t">A ─ 社宅的甜蜜點：低租金老屋、常空著、沒申報過</span>
    <div class="tally">
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">1.5萬以下 +1</span><span class="op">+</span>
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">常常空著 +2</span><span class="op">+</span>
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">長期收租 +1</span><span class="op">+</span>
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">沒申報 +2</span><span class="op">+</span>
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">需整修 +1</span><span class="op">=</span>
      <span class="tot">+7</span>
    </div>
    <p class="ex-out s">→ <b>社宅代管</b>（本表最高分）。理由列出：常常空著、未申報、租金低。</p>
    <p class="ex-note">「需要整修」的修繕補助理由因為只排到第四名，不會出現在畫面上——但這通常是房東最在意的一項，記得口頭補。</p>
  </div>

  <div class="ex">
    <span class="ex-t">B ─ 一般代管的典型：好租的新房、三年內想賣</span>
    <div class="tally">
      <span class="b neg" style="background:var(--gen-bg);color:var(--gen)">2.5萬以上 −1</span><span class="op">+</span>
      <span class="b neg" style="background:var(--gen-bg);color:var(--gen)">很快租掉 −2</span><span class="op">+</span>
      <span class="b neg" style="background:var(--gen-bg);color:var(--gen)">很可能賣 −3</span><span class="op">+</span>
      <span class="b nil" style="background:var(--zero-bg);color:var(--zero)">有申報 0</span><span class="op">+</span>
      <span class="b nil" style="background:var(--zero-bg);color:var(--zero)">屋況良好 0</span><span class="op">=</span>
      <span class="tot">−6</span>
    </div>
    <p class="ex-out g">→ <b>一般代管</b>。三條理由全上：三年內可能賣、本來就好租、市價收租價值高。</p>
  </div>

  <div class="ex">
    <span class="ex-t">C ─ 房東什麼都還沒點：預設值</span>
    <div class="tally">
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">1.5萬以下 +1</span><span class="op">+</span>
      <span class="b neg" style="background:var(--gen-bg);color:var(--gen)">很快租掉 −2</span><span class="op">+</span>
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">長期收租 +1</span><span class="op">+</span>
      <span class="b nil" style="background:var(--zero-bg);color:var(--zero)">有申報 0</span><span class="op">+</span>
      <span class="b nil" style="background:var(--zero-bg);color:var(--zero)">屋況良好 0</span><span class="op">=</span>
      <span class="tot">0</span>
    </div>
    <p class="ex-out b">→ <b>兩種都可行</b>。理由混列：本來就好租（反）、租金低（正）、長期收租（正）。</p>
    <p class="ex-note">五題預設就先幫他選了第一個選項，所以<b>頁面一打開就已經有一個結論在那裡</b>。帶看時務必請房東五題都點過，否則他看到的是預設值算出來的結果。</p>
  </div>

  <div class="ex">
    <span class="ex-t">D ─ 單一題翻盤：只把預設值的屋況改成違規隔間</span>
    <div class="tally">
      <span class="b nil" style="background:var(--zero-bg);color:var(--zero)">預設四題小計 0</span><span class="op">+</span>
      <span class="b neg" style="background:var(--gen-bg);color:var(--gen)">違規隔間 −3</span><span class="op">=</span>
      <span class="tot">−3</span>
    </div>
    <p class="ex-out g">→ <b>一般代管</b>。只列兩條：違規隔間、本來就好租。</p>
    <p class="ex-note">同方向的理由只剩兩條，所以清單也只出現兩條，不會補滿三條。此時「租金低」「長期收租」這兩個利多房東完全看不到。</p>
  </div>

  <div class="ex">
    <span class="ex-t">E ─ 剛好踩到門檻：中價位、從沒出租過</span>
    <div class="tally">
      <span class="b nil" style="background:var(--zero-bg);color:var(--zero)">1.5–2.5萬 0</span><span class="op">+</span>
      <span class="b nil" style="background:var(--zero-bg);color:var(--zero)">從未出租 0</span><span class="op">+</span>
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">長期收租 +1</span><span class="op">+</span>
      <span class="b pos" style="background:var(--soc-bg);color:var(--soc)">不確定申報 +1</span><span class="op">+</span>
      <span class="b nil" style="background:var(--zero-bg);color:var(--zero)">屋況良好 0</span><span class="op">=</span>
      <span class="tot">+2</span>
    </div>
    <p class="ex-out s">→ <b>社宅代管</b>，剛好壓在 +2 門檻上。兩條理由＋一段「另外：」空屋稅率註記。</p>
    <p class="ex-note">兩個 +1 就翻過門檻，說服力其實很薄。這種剛好踩線的結果，口頭上要說成「兩邊都值得評估」，不要照著印章講死。</p>
  </div>
</section>

<section>
  <div class="shead">
    <span class="slabel">注意事項</span>
    <h2>拿這頁跟房東談之前</h2>
  </div>
  <div class="watch">
    <div>
      <h3><span class="m">01</span>預設值就會給結論</h3>
      <p>五題預設全是第一個選項，合計 0 分＝「兩種都可行」。房東沒動任何一題也會看到印章。請他從第一題點過一輪。</p>
    </div>
    <div>
      <h3><span class="m">02</span>房東看不到分數</h3>
      <p>總分只存在程式裡。他看到的是印章、標題、最多三條理由。所以「為什麼結論是這個」只能由我們解釋——這份表就是給你解釋用的。</p>
    </div>
    <div>
      <h3><span class="m">03</span>反方向的理由被藏起來</h3>
      <p>結論偏一般時，支持社宅的理由一條都不會顯示。房東不會知道他其實有兩三項條件是適合社宅的。這是設計取捨，不是 bug；但談的時候要主動補上，不然他日後自己發現會覺得被誤導。</p>
    </div>
    <div>
      <h3><span class="m">04</span>兩個 −3 是硬門檻性質</h3>
      <p>「三年內很可能賣」與「有加蓋或違規隔間」各 −3，任一個都足以壓過所有利多。這兩題答案是真的會改變建議方向的，問的時候別引導、別替他答。</p>
    </div>
    <div>
      <h3><span class="m">05</span>租金折數沒有進計分</h3>
      <p>社宅分級租金的折數是划不划算的最大變數，這頁只用租金級距粗估。頁面自己也標了這句警語。結論僅供暖場，報價一律回到看屋評估。</p>
    </div>
    <div>
      <h3><span class="m">06</span>沒有紀錄可以回查</h3>
      <p>純前端計算，沒有送出、沒有後端、沒有存檔。要留房東的條件請自己抄進案件紀錄。</p>
    </div>
    <div>
      <h3><span class="m">07</span>稅率與補助有時效</h3>
      <p>頁面標示 115 年適用、桃園市包租代管第 5 期（115 年 1 月 7 日起）、資料整理日期 2026-08-18。跨年度或計畫換期後，比較表的數字要重新核對，計分權重也可能要跟著調。</p>
    </div>
    <div>
      <h3><span class="m">08</span>要改分數改哪裡</h3>
      <p>權重寫在 <code>my-portal/public/daiguan-vs-shezhai.html</code> 頁尾 <code>&lt;script&gt;</code> 的 <code>W</code> 物件，門檻是同一段的 <code>score&gt;=2</code> / <code>score&lt;=-2</code>。改完要重新部署 Vercel。驗收記得先清瀏覽器快取。</p>
    </div>
  </div>
</section>

<footer>
  <p>本文件只說明 <code>/daiguan</code> 問卷的計分與顯示邏輯。稅率、補助金額、計畫條件請以主管機關公告為準，個別物件仍需看屋評估後報價。</p>
  <p>邏輯核對自線上版本，與 <code>public/daiguan-vs-shezhai.html</code> 逐字一致（核對日 2026-08-18）。頁面內容更新後，這份說明書需一併更新。</p>
</footer>

</div>
</body>
</html>`;
