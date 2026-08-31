// 這個檔案由 scripts/sync-faq.mjs 從 content/landlord-faq.html 產生，請勿手改。
// 要改 FAQ 內容請改 content/landlord-faq.html，build 時會自動重新產生。

export const LANDLORD_FAQ_HTML = `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>屋主常見問題｜租寓 Zuyou</title>
<meta name="description" content="包租代管、代租代管，屋主最常問的 37 個問題。代管與包租雙欄對照，租金、稅務、房客風險、修繕、合約一次看懂。">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@700;900&display=swap" rel="stylesheet">
<style>
:root{
  /* 門牌綠 — Taiwan house-number plate */
  --plate:#0E5346;
  --plate-deep:#08332B;
  --plate-tint:#E4EDE9;
  --plate-line:#B9CFC7;
  --paper:#F2F3EF;
  --card:#FFFFFF;
  --ink:#131A18;
  --ink-2:#4A5754;
  --ink-3:#7C8783;
  --seal:#B0392F;          /* 印泥紅 — used only for emphasis */
  --seal-tint:#FBEDEB;
  --todo:#F5D77E;
  --rule:#DCE0DA;
  --serif:"Noto Serif TC",serif;
  --sans:"Noto Sans TC",system-ui,-apple-system,"PingFang TC","Microsoft JhengHei",sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,monospace;
  --wrap:1080px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:96px}
body{
  margin:0;background:var(--paper);color:var(--ink);
  font-family:var(--sans);font-size:17px;line-height:1.85;
  -webkit-font-smoothing:antialiased;
}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 22px}

/* ---------- HERO : 門牌 ---------- */
.hero{padding:64px 0 44px;background:var(--paper)}
.plate{
  display:inline-block;background:var(--plate);color:#fff;
  border-radius:12px;padding:9px;box-shadow:0 10px 26px -14px rgba(8,51,43,.75);
  animation:drop .7s cubic-bezier(.2,.8,.25,1) both;
}
.plate-inner{border:2px solid rgba(255,255,255,.82);border-radius:6px;padding:16px 30px 20px}
.plate-city{
  font-family:var(--mono);font-size:12px;letter-spacing:.22em;
  text-transform:uppercase;opacity:.82;display:block;margin-bottom:2px;
}
.plate-main{
  font-family:var(--serif);font-weight:900;font-size:clamp(30px,6.4vw,46px);
  line-height:1.15;letter-spacing:.03em;display:block;
}
.plate-sub{
  font-family:var(--mono);font-size:11.5px;letter-spacing:.2em;
  opacity:.72;display:block;margin-top:7px;
}
@keyframes drop{from{opacity:0;transform:translateY(-14px) rotate(-1.2deg)}to{opacity:1;transform:none}}
.hero p.lede{
  max-width:44em;margin:30px 0 0;font-size:18px;color:var(--ink-2);
}
.hero p.lede strong{color:var(--ink);font-weight:700}

/* ---------- NAV ---------- */
.nav{
  position:sticky;top:0;z-index:40;background:rgba(242,243,239,.94);
  backdrop-filter:blur(8px);border-bottom:1px solid var(--rule);
}
.nav ul{
  display:flex;gap:4px;list-style:none;margin:0;padding:9px 0;
  max-width:var(--wrap);margin-inline:auto;padding-inline:22px;
  overflow-x:auto;scrollbar-width:none;
}
.nav ul::-webkit-scrollbar{display:none}
.nav a{
  display:block;white-space:nowrap;text-decoration:none;color:var(--ink-2);
  font-size:14.5px;font-weight:500;padding:6px 13px;border-radius:99px;
}
.nav a:hover,.nav a:focus-visible{background:var(--plate-tint);color:var(--plate-deep)}

/* ---------- SECTIONS ---------- */
section{padding:56px 0 4px;border-top:1px solid var(--rule)}
section:first-of-type{border-top:0}
.sec-head{display:flex;align-items:baseline;gap:14px;margin-bottom:6px;flex-wrap:wrap}
.sec-kicker{
  font-family:var(--mono);font-size:12px;letter-spacing:.18em;
  color:var(--plate);text-transform:uppercase;
}
h2{
  font-family:var(--serif);font-weight:900;font-size:clamp(24px,4.2vw,32px);
  margin:0;letter-spacing:.02em;line-height:1.3;
}
.sec-note{margin:6px 0 26px;color:var(--ink-3);font-size:15.5px;max-width:46em}

/* ---------- Q&A ---------- */
details.qa{
  background:var(--card);border:1px solid var(--rule);border-radius:10px;
  margin-bottom:10px;overflow:hidden;
}
details.qa[open]{border-color:var(--plate-line);box-shadow:0 4px 18px -12px rgba(8,51,43,.45)}
details.qa > summary{
  list-style:none;cursor:pointer;padding:17px 52px 17px 19px;position:relative;
  display:flex;gap:13px;align-items:flex-start;font-weight:500;line-height:1.6;
}
details.qa > summary::-webkit-details-marker{display:none}
details.qa > summary:hover{background:#FAFBF9}
summary:focus-visible{outline:3px solid var(--plate);outline-offset:-3px}
.qid{
  font-family:var(--mono);font-size:12.5px;color:var(--plate);
  padding-top:5px;flex:0 0 auto;min-width:2.6em;
}
summary::after{
  content:"";position:absolute;right:21px;top:25px;width:9px;height:9px;
  border-right:2px solid var(--ink-3);border-bottom:2px solid var(--ink-3);
  transform:rotate(45deg);transition:transform .18s ease;
}
details.qa[open] > summary::after{transform:rotate(-135deg)}
.ans{padding:2px 22px 22px 55px;color:var(--ink-2);font-size:16px}
.ans > :first-child{margin-top:0}
.ans > :last-child{margin-bottom:0}
.ans p{margin:0 0 12px}
.ans ul{margin:0 0 12px;padding-left:1.15em}
.ans li{margin-bottom:5px}
.ans strong{color:var(--ink);font-weight:700}

/* ---------- SIGNATURE : 雙欄對照 ---------- */
.duo{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:4px 0 14px}
.duo-cell{border:1px solid var(--rule);border-radius:8px;padding:13px 15px;background:#FBFCFA}
.duo-cell.b{background:var(--plate-tint);border-color:var(--plate-line)}
.duo-tag{
  font-family:var(--mono);font-size:11px;letter-spacing:.12em;color:var(--plate);
  display:block;margin-bottom:6px;font-weight:600;
}
.duo-cell.b .duo-tag{color:var(--plate-deep)}
.duo-cell p{margin:0 0 8px;font-size:15.5px;line-height:1.75}
.duo-cell p:last-child{margin-bottom:0}

/* segmented control (mobile column filter) */
.seg{display:none;gap:6px;margin:0 0 18px;background:#E7E9E4;padding:4px;border-radius:99px}
.seg button{
  flex:1;border:0;background:transparent;font-family:var(--sans);font-size:14px;
  font-weight:500;padding:8px 4px;border-radius:99px;cursor:pointer;color:var(--ink-2);
}
.seg button[aria-pressed="true"]{background:#fff;color:var(--plate-deep);font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.1)}

/* ---------- TABLES ---------- */
.tbl-scroll{overflow-x:auto;margin:0 0 14px;-webkit-overflow-scrolling:touch}
.calc-ctl{
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  margin:0 0 13px;padding:11px 15px;border:1px solid var(--plate-line);
  background:var(--plate-tint);border-radius:8px;
}
.calc-ctl label{font-weight:500;color:var(--plate-deep);font-size:15.5px}
.calc-ctl select{
  font-family:var(--mono);font-size:15px;padding:6px 11px;
  border:1px solid var(--plate-line);border-radius:6px;
  background:var(--card);color:var(--ink);
}
.calc-hint{font-size:13px;color:var(--ink-3)}
.ask-cta{margin:14px 0 0}
.ask-cta a{
  display:inline-block;border:1px solid var(--plate-line);background:var(--plate-tint);
  color:var(--plate-deep);text-decoration:none;border-radius:999px;
  padding:9px 17px;font-size:15px;font-weight:500;
}
.ask-cta a:hover{background:#D4E3DD}
table{border-collapse:collapse;width:100%;min-width:520px;font-size:15px;background:#fff}
th,td{border:1px solid var(--rule);padding:10px 13px;text-align:left;vertical-align:top}
thead th{background:var(--plate);color:#fff;font-weight:500;font-size:14px}
tbody th{background:#F7F8F5;font-weight:500;white-space:nowrap}
td.num,th.num{font-family:var(--mono);font-size:14.5px;white-space:nowrap}
tbody tr:hover td{background:#FCFDFB}

/* ---------- CALLOUTS ---------- */
.key{
  border-left:3px solid var(--seal);background:var(--seal-tint);
  padding:14px 17px;border-radius:0 8px 8px 0;margin:0 0 14px;
}
.key p{margin:0;font-size:15.5px;color:#5A2320}
.key strong{color:var(--seal)}
.law{
  font-family:var(--mono);font-size:12.5px;color:var(--ink-3);
  border-top:1px dashed var(--rule);padding-top:9px;margin-top:12px;
}
mark.todo{
  background:var(--todo);color:#4A3A00;padding:1px 6px;border-radius:3px;
  font-weight:700;font-size:14.5px;
}

/* ---------- CTA ---------- */
.cta{
  display:flex;flex-wrap:wrap;align-items:center;gap:16px;justify-content:space-between;
  background:var(--plate);color:#fff;border-radius:12px;padding:22px 26px;margin:26px 0 8px;
}
.cta p{margin:0;font-size:16.5px;font-weight:500;line-height:1.6}
.cta a{
  background:#fff;color:var(--plate-deep);text-decoration:none;font-weight:700;
  padding:11px 22px;border-radius:99px;white-space:nowrap;font-size:15.5px;
}
.cta a:hover{background:#EAF2EE}
.cta a:focus-visible{outline:3px solid #fff;outline-offset:3px}

/* ---------- FOOT ---------- */
footer{
  margin-top:56px;border-top:1px solid var(--rule);padding:30px 0 60px;
  color:var(--ink-3);font-size:13.5px;line-height:1.8;
}
footer strong{color:var(--ink-2)}

/* ---------- RESPONSIVE ---------- */
@media (max-width:760px){
  body{font-size:16.5px}
  .hero{padding:40px 0 30px}
  .plate-inner{padding:13px 22px 16px}
  .duo{grid-template-columns:1fr;gap:9px}
  .seg{display:flex}
  body.only-a .duo-cell.b,body.only-b .duo-cell.a{display:none}
  .ans{padding-left:19px}
  .qid{display:none}
  details.qa > summary{padding-left:19px}
  .cta{padding:20px}
  .cta a{width:100%;text-align:center}
}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
  html{scroll-behavior:auto}
}
</style>
</head>
<body>

<header class="hero">
  <div class="wrap">
    <div class="plate">
      <div class="plate-inner">
        <span class="plate-city">Taoyuan · Zuyou</span>
        <span class="plate-main">屋主常見問題</span>
        <span class="plate-sub">LANDLORD FAQ ／ 37 QUESTIONS</span>
      </div>
    </div>
    <p class="lede">
      把房子交出去之前，屋主真正想知道的其實是三件事：<strong>我實拿多少</strong>、<strong>我要繳多少稅</strong>、<strong>出事誰扛</strong>。
      這頁把「代管」和「包租」並排放，同一個問題，兩種方式各答一次。
    </p>
    <p class="ask-cta"><a href="/ask">不想一題一題找？直接打字問 →</a></p>
  </div>
</header>

<nav class="nav" aria-label="問題分類">
  <ul>
    <li><a href="#start">先看這三題</a></li>
    <li><a href="#money">租金與收費</a></li>
    <li><a href="#tax">稅務</a></li>
    <li><a href="#risk">房客風險</a></li>
    <li><a href="#fix">修繕與管理</a></li>
    <li><a href="#contract">合約與退出</a></li>
    <li><a href="#howto">怎麼開始</a></li>
  </ul>
</nav>

<main class="wrap">

<!-- ============ 先看這三題 ============ -->
<section id="start">
  <div class="sec-head">
    <span class="sec-kicker">First</span>
    <h2>先看這三題</h2>
  </div>
  <p class="sec-note">其他問題都可以慢慢看，這三題決定您要不要繼續往下讀。</p>

  <div class="seg" role="group" aria-label="切換方案欄位">
    <button type="button" data-col="all" aria-pressed="true">兩種都看</button>
    <button type="button" data-col="a" aria-pressed="false">代管</button>
    <button type="button" data-col="b" aria-pressed="false">包租</button>
  </div>

  <details class="qa" open>
    <summary><span class="qid">Q1</span><span>我自己租，跟交給租寓，實拿差多少？</span></summary>
    <div class="ans">
      <p>以<strong>市價月租 2 萬元、房屋現值 80 萬</strong>的桃園房子、屋主綜所稅率 <span data-q1-rate>20%</span> 為例，一整年算完是這樣：</p>
      <p class="calc-ctl">
        <label for="q1-rate">您適用的綜所稅率</label>
        <select id="q1-rate" aria-label="選擇屋主適用的綜合所得稅率">
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="20" selected>20%</option>
          <option value="30">30%</option>
          <option value="40">40%</option>
        </select>
        <span class="calc-hint">改稅率，下表的綜所稅與實拿會跟著重算</span>
      </p>
      <div class="tbl-scroll">
      <table>
        <thead>
          <tr><th>方式</th><th class="num">年租金收入</th><th class="num">綜所稅</th><th class="num">房屋稅</th><th class="num">服務費</th><th class="num">實拿</th></tr>
        </thead>
        <tbody>
          <tr data-q1-row="self-no" data-base="125400" data-note="220,000×57%<br>" data-gross="220000" data-other="25600">
            <th>自己出租<br><small>沒申請「出租房屋<br>優惠稅率」</small></th>
            <td class="num">220,000<br><small>20,000×11<br>扣 1 月空置</small></td>
            <td class="num" data-q1="tax">−25,080<br><small>220,000×57%<br>×20%</small></td>
            <td class="num">−25,600<br><small>800,000<br>×3.2%</small></td>
            <td class="num">0</td>
            <td class="num" data-q1="net"><strong>169,320</strong></td>
          </tr>
          <tr data-q1-row="self-yes" data-base="125400" data-note="220,000×57%<br>" data-gross="220000" data-other="12000">
            <th>自己出租<br><small>已申請「出租房屋<br>優惠稅率」且達標</small></th>
            <td class="num">220,000<br><small>20,000×11<br>扣 1 月空置</small></td>
            <td class="num" data-q1="tax">−25,080<br><small>220,000×57%<br>×20%</small></td>
            <td class="num">−12,000<br><small>800,000<br>×1.5%</small></td>
            <td class="num">0</td>
            <td class="num" data-q1="net"><strong>182,920</strong></td>
          </tr>
          <tr data-q1-row="daiguan" data-base="72380" data-note="(220,000−66,000)<br>×47%" data-gross="220000" data-other="44000">
            <th>一般代管</th>
            <td class="num">220,000<br><small>20,000×11<br>扣 1 月空置</small></td>
            <td class="num" data-q1="tax">−14,476<br><small>(220,000−66,000)<br>×47%×20%</small></td>
            <td class="num">−12,000<br><small>800,000<br>×1.5%</small></td>
            <td class="num">−32,000<br><small>代管 22,000<br>＋仲介 10,000</small></td>
            <td class="num" data-q1="net"><strong>161,524</strong></td>
          </tr>
          <tr data-q1-row="baozu5" data-base="22560" data-note="(120,000−72,000)<br>×47%" data-gross="120000" data-other="25600">
            <th>一般包租<br><small>保證租金 5 折</small></th>
            <td class="num">120,000<br><small>10,000×12<br>空置照付</small></td>
            <td class="num" data-q1="tax">−4,512<br><small>(120,000−72,000)<br>×47%×20%</small></td>
            <td class="num">−25,600<br><small>800,000×3.2%<br>未達租金標準</small></td>
            <td class="num">0</td>
            <td class="num" data-q1="net"><strong>89,888</strong></td>
          </tr>
          <tr data-q1-row="baozu7" data-base="45120" data-note="(168,000−72,000)<br>×47%" data-gross="168000" data-other="12000">
            <th>一般包租<br><small>保證租金 7 折</small></th>
            <td class="num">168,000<br><small>14,000×12<br>空置照付</small></td>
            <td class="num" data-q1="tax">−9,024<br><small>(168,000−72,000)<br>×47%×20%</small></td>
            <td class="num">−12,000<br><small>800,000×1.5%<br>剛好達標</small></td>
            <td class="num">0</td>
            <td class="num" data-q1="net"><strong>146,976</strong></td>
          </tr>
        </tbody>
      </table>
      </div>
      <p><strong>兩種「自己出租」的綜所稅為什麼一樣？</strong>因為兩列都有依法向國稅局申報租賃所得，差別只在有沒有另外向地方稅務局申請「出租房屋優惠稅率」。這是兩個不同的申報：綜所稅是每年 5 月報給國稅局；房屋稅優惠要在 3 月 22 日前主動向稅務局提出申請，而且隔年申報的租賃所得要達當地租金標準，兩個條件缺一不可。很多屋主有乖乖繳綜所稅，卻不知道要申請這個，白白多繳 1 萬 3,600。</p>
      <div class="key">
        <p><strong>包租的兩列請一起看，5 折和 7 折差了 <span data-q1-gap>5 萬 7</span>。</strong>不只是租金少 4 萬 8——保證租金打得越低，越容易掉到「當地一般租金標準」以下；申報的租賃所得沒達標，房屋稅就拿不到 1.5% 優惠、得按 3.2% 起跳課徵，租金少了、稅又多繳。上表假設 5 折未達標、7 折達標，實際門檻要看該屋適用的租金標準（算法見 Q12）。保證租金區間是市價的 <strong>5 到 7 折</strong>，實際成數必須以現場評估的屋況為準；折數落在哪裡對實拿的影響非常大，簽約前請務必確認清楚。</p>
      </div>
      <p><strong>我們不會說「交給租寓一定賺比較多」。</strong>房子好租、屋主自己有時間管、又把兩邊的申報都做齊，自租的帳面數字確實不差。真正要比的是這三件事會不會發生：</p>
      <ul>
        <li><strong>多空一個月</strong>——自租少 2 萬，包租不受影響</li>
        <li><strong>欠租一次</strong>——押金抵完可能還少好幾萬，加上催討與訴訟的時間</li>
        <li><strong>漏了房屋稅那道申請</strong>——稅率從 1.5% 跳到 3.2%，這一格就差 1 萬 3,600</li>
      </ul>
      <p class="law">試算假設：桃園市、房屋現值 80 萬、綜所稅率 <span data-q1-rate>20%</span>、全國持有 2 戶以內、自租與代管均假設空置 1 個月。自租採 43% 必要費用率（故乘 57%）；一般代管與一般包租採每月 6,000 元免稅額＋53% 費用率（故乘 47%）；一般代管的仲介服務費以 2 年約 20,000 元攤提為每年 10,000 元，代管費為月租 10%。房屋稅率依桃園市房屋稅徵收率自治條例；房屋稅欄假設自租與代管已申請並申報達當地一般租金標準（1.5%）、包租 5 折未達標（3.2%）、7 折達標（1.5%）。租金標準的算法自 114 年度起改制（見 Q12），個案是否達標依該屋房屋評定現值與公告土地現值認定。<mark class="todo">2026-08-31 已依 114 年度租金標準修正說法、房屋稅達標與否改列為假設；數字仍建議找會計師覆核一次。</mark></p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q2</span><span>包租跟代管差在哪？我該選哪一個？</span></summary>
    <div class="ans">
      <p>先分兩層。第一層是<strong>代管還是包租</strong>，決定風險由誰扛；第二層是<strong>保證租金談到幾折</strong>，決定包租划不划算。</p>
      <div class="duo">
        <div class="duo-cell a">
          <span class="duo-tag">代管</span>
          <p>房客是屋主的房客，租約是屋主的租約。我們負責招租、帶看、收租、修繕協調、糾紛處理。</p>
          <p>租金<strong>沒有上限</strong>，行情漲您就漲。但<strong>空租就沒有收入</strong>，房客欠租我們幫您催，不代您賠。</p>
        </div>
        <div class="duo-cell b">
          <span class="duo-tag">包租</span>
          <p>我們向您承租整間房，再轉租出去。您的租約對象是租寓，不是房客。</p>
          <p>每月<strong>固定入帳</strong>，空租、欠租都跟您無關。代價是租金以市價打折計算。</p>
        </div>
      </div>
      <p>兩者在錢和稅上的實際差別：</p>
      <div class="tbl-scroll">
      <table>
        <thead><tr><th></th><th class="num">代管</th><th class="num">包租</th></tr></thead>
        <tbody>
          <tr><th>屋主收到的租金</th><td class="num">市價全額</td><td class="num">市價 5–7 折</td></tr>
          <tr><th>空租期間</th><td class="num">沒有收入</td><td class="num"><strong>照付</strong></td></tr>
          <tr><th>房客欠租</th><td class="num">屋主承擔</td><td class="num"><strong>租寓承擔</strong></td></tr>
          <tr><th>服務費</th><td class="num">仲介＋代管 10%</td><td class="num"><strong>不另收</strong></td></tr>
          <tr><th>租金能不能調漲</th><td class="num">可以，隨行情</td><td class="num">委託期間固定</td></tr>
          <tr><th>房客由誰決定</th><td class="num">屋主有否決權</td><td class="num">租寓審核</td></tr>
        </tbody>
      </table>
      </div>
      <p><strong>怎麼選：</strong>房子好租、地段不愁客、想保有租金上限，只是不想處理雜事 → 代管。怕空租、怕收不到錢、人在國外或工作忙、需要穩定現金流 → 包租。</p><p>簡單的判斷方式：把「市價租金 × 預估空置月數 × 欠租風險」算過一遍，如果算出來比保證租金低，包租就划算。這也是我們評估時會跟您一起看的數字。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q3</span><span>我的房子符合資格嗎？</span></summary>
    <div class="ans">
      <p>三十秒自我檢查，以下每一項都是「是」，基本上就可以談：</p>
      <ul>
        <li>產權清楚，您是所有權人或有合法處分權（共有需其他共有人同意）</li>
        <li>是合法住宅用途，有使用執照或門牌，非工業宅、農舍</li>
        <li>沒有違建：<strong>頂樓加蓋、夾層、陽台外推、違法隔套</strong>是最常見的卡點</li>
        <li>基本可住：有廚衛、有水電、無漏水與結構安全疑慮</li>
        <li>沒有被查封、假扣押，或正在進行的產權訴訟</li>
      </ul>
      <p><strong>有一項不符也先別放棄。</strong>違建的部分有時可以把違建區域排除在委託範圍外；屋況不佳可以先估修繕金額再決定；共有產權可以協助處理同意書。違建的認定包租會比代管嚴格，因為包租是我們自己要承租下來、承擔風險。</p>
      <p>最快的方式是拍幾張照片、給我們地址與坪數，我們回覆能不能收、走哪個方案。</p>
    </div>
  </details>
</section>

<!-- ============ 租金與收費 ============ -->
<section id="money">
  <div class="sec-head">
    <span class="sec-kicker">01 · 租金</span>
    <h2>租金與收費</h2>
  </div>
  <p class="sec-note">錢的部分先講清楚，後面才有得談。</p>

  <details class="qa">
    <summary><span class="qid">Q4</span><span>保證租金怎麼算？大概是市價的幾成？</span></summary>
    <div class="ans">
      <p>保守估計是市場行情的 <strong>5 到 7 折</strong>，實際成數要看屋況才能定。</p>
      <div class="key">
        <p><strong>折數太低會踩到一個稅務地雷。</strong>要適用房屋稅 1.5% 的優惠稅率，租金必須「申報租賃所得達當地租金標準」。桃園市的租金標準是房屋評定現值的 21%——現值 80 萬的房子，年租金要達 168,000 元。市價月租 2 萬打 7 折剛好踩線，打 6 折就會低於標準，房屋稅會被改按 3.2% 起跳課徵，一年多繳 1 萬 3。</p>
      </div>
      <p>影響成數的主要是這幾項：</p>
      <ul>
        <li><strong>屋況與屋齡</strong>——需要整理的程度越低，成數越高</li>
        <li><strong>格局與坪數</strong>——好租的格局（套房、兩房）通常條件較好</li>
        <li><strong>地段與交通</strong>——去化速度直接影響我們願意承擔的風險</li>
        <li><strong>是否附傢俱家電</strong>——附得越齊，成數越高</li>
        <li><strong>委託年限</strong>——期間越長，攤提成本越低，成數越高</li>
      </ul>
      <p>我們不會在看屋前給您一個數字，因為那個數字沒有意義。實際看過、拍過、確認過屋況之後，會給您一份書面的租金評估，成數與依據都會寫在上面。</p>
      <div class="key">
        <p><strong>比較的時候記得把稅一起算。</strong>包租的租金收入一樣適用租賃專法的優惠：每屋每月 6,000 元免稅額，超過的部分月租 2 萬以內可扣除 53% 必要費用。但折數壓得太低會低於租金標準、連房屋稅優惠一起丟掉，所以「折數高低」不等於「實拿高低」。</p>
      </div>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q5</span><span>租金怎麼定？誰說了算？</span></summary>
    <div class="ans">
      <p><strong>最終由您決定。</strong>我們提供的是依據，不是單方面丟給您一個數字。</p>
      <p>評估方式是比對<strong>591 的在租行情</strong>與<strong>內政部實價登錄的成交紀錄</strong>，鎖定同一地段、相同坪數與格局的物件，再依屋況、樓層、朝向與是否附傢俱調整。比對用的案例會一併提供給您，您看得到我們是從哪些物件推出來的。</p>
      <div class="key">
        <p><strong>定價貼近行情，通常一個月內可以媒合完成；高於行情太多，空置期會明顯拉長。</strong>而空著的每一個月都是實質損失——月租 2 萬的房子多空一個月，就等於整年少了 2 萬，這通常比當初想多爭取的那一兩千元租金還多。</p>
      </div>
      <p>我們不會勉強您照建議價開。但如果上架後連續 2 週沒有帶看、也無人詢問，我們會主動找您把數字攤開來重新討論（見 Q27）。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q6</span><span>空置期我還有錢拿嗎？免收租期是幾個月？</span></summary>
    <div class="ans">
      <div class="duo">
        <div class="duo-cell a">
          <span class="duo-tag">代管</span>
          <p><strong>沒有租金。</strong>房子空著就是沒有收入，我們也拿不到代管費，所以招租的動機跟您一致。</p>
        </div>
        <div class="duo-cell b">
          <span class="duo-tag">包租</span>
          <p><strong>保證租金照付。</strong>租不出去、房客提前搬走、換房客的空窗，都由我們吸收。</p>
        </div>
      </div>
      <p><strong>但有一段免收租期。</strong>簽約後有一段招租與整理期間不計算保證租金，期滿後才開始給付。這段期間的長短<strong>依實際屋況與裝潢施工時程評估</strong>——屋況良好、不需大幅整理的房子最短，需要泥作、水電、油漆或訂製傢俱的則會拉長。實際月數會在合約上寫明，不是浮動的。</p>
      <p>起算基準用的是點交完成日，不是簽約日，這一點請務必在合約上確認過再簽。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q7</span><span>服務費怎麼收？除此之外還有沒有其他費用？</span></summary>
    <div class="ans">
      <p><strong>仲介服務費（一次性，成功出租才收）</strong>依承租期間長短計算：</p>
      <div class="tbl-scroll">
      <table>
        <thead><tr><th>標的承租期間</th><th class="num">仲介服務費</th><th class="num">以月租 20,000 為例</th></tr></thead>
        <tbody>
          <tr><th>未滿 1 年</th><td class="num">月租金之 25%</td><td class="num">5,000</td></tr>
          <tr><th>1 年以上未滿 2 年</th><td class="num">月租金之 50%</td><td class="num">10,000</td></tr>
          <tr><th>2 年以上</th><td class="num">月租金之 100%</td><td class="num">20,000</td></tr>
        </tbody>
      </table>
      </div>
      <p>這筆是<strong>每次成功媒合收一次</strong>，不是每年收。房客續約時的處理方式見 Q11。</p>
      <p><strong>代管服務費（按月）</strong>：月租金之 <strong>10%</strong>，由每月租金中扣除後撥付。空租期間不收，房子沒租出去我們一毛也拿不到。</p>
      <p>月租 20,000 的房子，每月代管費 2,000 元，一年 24,000 元。這筆買的是招租、帶看、收租、催繳、修繕協調、糾紛處理與退租點交。</p>
      <div class="duo">
        <div class="duo-cell a">
          <span class="duo-tag">代管</span>
          <p>仲介服務費 ＋ 每月代管費。兩筆都會列在月結明細上。</p>
        </div>
        <div class="duo-cell b">
          <span class="duo-tag">包租</span>
          <p><strong>屋主端不另收服務費。</strong>我們的收益來自轉租價差，同時承擔空置與欠租風險。</p>
        </div>
      </div>
      <p><strong>不會有的費用：</strong>簽約費、審件費、上架費、拍照費、每年續管費。除了上述兩項與經您同意的修繕支出以外，不會有其他名目。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q8</span><span>每月幾號入帳？我看得到收支明細嗎？</span></summary>
    <div class="ans">
      <p>每月 <strong>5 日</strong>撥付至屋主指定的帳戶，遇假日順延至次一營業日。</p>
      <p>每月 5 日前，我們會透過<strong>租寓官方 LINE</strong> 發送當月的<strong>代管表</strong>，也就是收支明細，內容包含：收到的租金、代收代付的費用、服務費、當月修繕支出與單據、實付金額。先看明細、再入帳，屋主每個月都對得起來。</p>
      <p>因此委託後需要加入租寓官方 LINE，這是接收代管表與日常聯繫的主要管道。年度結束另提供整年彙總表，報稅時可直接使用。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q9</span><span>水電、瓦斯、管理費、網路，誰付？</span></summary>
    <div class="ans">
      <p>原則是<strong>使用者付費、持有者付固定支出</strong>：</p>
      <div class="tbl-scroll">
      <table>
        <thead><tr><th>項目</th><th>通常由誰負擔</th></tr></thead>
        <tbody>
          <tr><th>水、電、瓦斯</th><td>房客（依實際用量或分攤）</td></tr>
          <tr><th>第四台、網路</th><td>房客</td></tr>
          <tr><th>社區管理費</th><td>屋主</td></tr>
          <tr><th>房屋稅、地價稅</th><td>屋主</td></tr>
          <tr><th>公共設施修繕分攤</th><td>屋主</td></tr>
          <tr><th>清潔費（公寓、無管委會）</th><td>視現況約定</td></tr>
        </tbody>
      </table>
      </div>
      <p>這些會在委託契約與租賃契約中逐項寫明，不採「其餘依慣例」這種寫法。如果您希望把管理費含在租金裡一起收，也可以，我們會反映在租金定價上。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q10</span><span>押金由誰收、放在哪裡？退租要扣款時誰決定？</span></summary>
    <div class="ans">
      <p>依《租賃住宅市場發展及管理條例》，<strong>押金不得超過 2 個月租金</strong>，這是法定上限。</p>
      <div class="duo">
        <div class="duo-cell a">
          <span class="duo-tag">代管</span>
          <p>押金由我們代收，保管方式可三選一：<strong>租寓全額保管、屋主全額保管，或雙方各持一半</strong>。由租寓保管的部分與公司營運帳戶分開，不動用。</p>
          <p>退租時的扣款金額，一律經您同意後才執行。</p>
        </div>
        <div class="duo-cell b">
          <span class="duo-tag">包租</span>
          <p>房客押金由我們收取與保管，屋主不經手。屋主與租寓之間另依合約約定是否有押金。</p>
        </div>
      </div>
      <p><strong>代管的三種保管方式怎麼選？</strong>差別在退租當天的處理速度與您的掌握感：</p>
      <ul>
        <li><strong>租寓全額保管</strong>——退租當天可直接結算退還，流程最快，但您要信任公司的分戶保管</li>
        <li><strong>屋主全額保管</strong>——錢在自己手上最安心，但退租時須等您匯回才能退還房客，若一時聯絡不上或對扣款有異議，房客會卡在那裡</li>
        <li><strong>各持一半</strong>——折衷做法。小額扣款用租寓保管的那半直接處理，不必為了幾百元驚動您</li>
      </ul>
      <p><strong>扣款流程：</strong>退租點交時全程拍照記錄，與入住時的現況確認書逐項比對，做成損壞明細與報價。屬於<strong>正常使用耗損</strong>的不扣（如牆面自然泛黃、家電自然老化）；屬於<strong>房客造成的損壞</strong>才扣。有爭議時我們居中處理，必要時可循調處或法律途徑。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q11</span><span>房客續約，還要再收一次服務費嗎？</span></summary>
    <div class="ans">
      <p><strong>不用。</strong>同一房客續約<strong>不再收取仲介服務費</strong>，只繼續收每月的代管費。</p>
      <p>Q7 表格裡的仲介服務費是「每次成功媒合新房客」才收一次。房客續住，我們沒有重新招租、帶看、審核，自然沒有理由再收一次。</p>
      <p>包租的屋主端本來就不收服務費，續約也不影響保證租金。</p>
    </div>
  </details>

  <div class="cta">
    <p>想知道您的房子能收多少？我們看過屋況後給書面租金評估，不收費。</p>
    <a href="#howto">預約免費屋況評估</a>
  </div>
</section>

<!-- ============ 稅務 ============ -->
<section id="tax">
  <div class="sec-head">
    <span class="sec-kicker">02 · 稅務</span>
    <h2>稅務優惠</h2>
  </div>
  <p class="sec-note">這一區的每個數字都有法源，法條寫在答案下方。個案適用仍建議向稅捐機關或會計師確認。</p>

  <details class="qa">
    <summary><span class="qid">Q12</span><span>參加後我可以省哪些稅？</span></summary>
    <div class="ans">
      <p><strong>綜合所得稅</strong>全國一致，這一塊差距最大：</p>
      <div class="tbl-scroll">
      <table>
        <thead>
          <tr><th>綜所稅</th><th class="num">自己出租</th><th class="num">代管或包租</th><th class="num">另具公益出租人身分</th></tr>
        </thead>
        <tbody>
          <tr><th>每屋每月免稅額</th><td class="num">無</td><td class="num">6,000</td><td class="num"><strong>15,000</strong></td></tr>
          <tr><th>必要費用率</th><td class="num">43%</td><td class="num"><strong>53%</strong><br><small>月租 2 萬以下部分</small></td><td class="num">43%</td></tr>
        </tbody>
      </table>
      </div>
      <p><strong>房屋稅與地價稅則是各縣市自訂。</strong>以下是我們服務範圍內兩個縣市的實際規定：</p>
      <div class="tbl-scroll">
      <table>
        <thead>
          <tr><th>房屋稅（自治條例）</th><th class="num">桃園市</th><th class="num">新北市</th></tr>
        </thead>
        <tbody>
          <tr><th>空置，或出租但沒申請優惠稅率<br><small>其他住家用</small></th><td class="num">3.2% – 4.8%<br><small>依全國戶數</small></td><td class="num">3.2% – 4.8%<br><small>依全國戶數</small></td></tr>
          <tr><th>出租且申報達租金標準</th><td class="num">1.5% – 2.4%<br><small>依全國戶數</small></td><td class="num">1.5% – 2.4%<br><small>依全國戶數</small></td></tr>
          <tr><th>一般包租代管<br><small>租期 1 年以上＋申報達標</small></th><td class="num"><strong>1.5%</strong><br><small>不限戶數</small></td><td class="num"><strong>1.5%</strong><br><small>不限戶數</small></td></tr>
          <tr><th>公益出租人</th><td class="num"><strong>1.2%</strong><br><small>不限戶數</small></td><td class="num">1.2%</td></tr>
        </tbody>
      </table>
      </div>
      <div class="tbl-scroll">
      <table>
        <thead>
          <tr><th>地價稅</th><th class="num">桃園市</th><th class="num">新北市</th></tr>
        </thead>
        <tbody>
          <tr><th>透過包租代管出租</th><td class="num">無優惠<br><small>一般用地稅率</small></td><td class="num">無優惠<br><small>一般用地稅率</small></td></tr>
          <tr><th>公益出租人</th><td class="num">2‰<br><small>比照自用住宅用地</small></td><td class="num">2‰</td></tr>
        </tbody>
      </table>
      </div>
      <p><strong>地價稅這一格要特別說明。</strong>租賃住宅市場發展及管理條例第 18 條寫的是地方政府「<strong>得</strong>」減徵，要另外訂自治條例才算數。桃園市與新北市現行的條例都只涵蓋社會住宅與公益出租人，一般包租代管<strong>沒有地價稅優惠</strong>，按一般用地稅率課徵。台北市則另訂條例，一般包租代管的地價稅與房屋稅各減徵 40%（每屋各以 1 萬元為上限）——同一件事，換個縣市答案就不一樣。</p>
      <div class="key">
        <p><strong>「不限戶數」是最容易被略過、但影響最大的四個字。</strong>房屋稅 2.0 採全國歸戶，持有越多戶稅率跳得越兇。但透過包租代管出租的房子，桃園市不計入戶數、直接適用單一稅率——多屋族省下的差距遠比單看稅率大。</p>
      </div>
      <p><strong>要拿到 1.5% 有三個條件：</strong>租期 1 年以上；在每年 3 月 22 日前向地方稅務局<strong>提出申請</strong>；隔年 5 月向國稅局申報的租賃所得<strong>達當地租金標準</strong>。租金標準由財政部逐年核定，<strong>114 年度起分兩種算法</strong>：房子在<strong>桃園市 104 年 7 月 1 日</strong>（新北市 103 年 7 月 1 日）以後按新標準單價課房屋稅者，為<strong>房屋評定現值 ×10%</strong>；在那之前的舊標準單價房屋，桃園市為 <strong>22%</strong>，新北市板橋、三重、永和、中和、新莊、新店、土城、蘆洲、汐止、樹林這 10 區為 <strong>24%</strong>、<strong>林口</strong>與鶯歌、三峽、淡水等其餘 19 區為 <strong>22%</strong>。兩種算法都要<strong>再加公告土地現值 ×1.2%</strong>。沒提出申請、或申報未達標，都會改按 3.2% 起跳課徵並追補差額。</p>
      <p class="law">資料來源：桃園市政府地方稅務局「出租房屋節稅專區」（115 年 8 月更新）、桃園市房屋稅徵收率自治條例、新北市房屋稅徵收率自治條例（114 年 1 月 22 日三讀，溯及 113 年 7 月 1 日施行）、桃園市社會住宅興辦與公益出租人出租房屋減免地價稅及房屋稅自治條例、新北市興辦社會住宅與公益出租人出租房屋優惠地價稅及房屋稅自治條例、財政部核定 114 年度房屋及土地「當地一般租金標準」、租賃住宅市場發展及管理條例、住宅法第 15、16 條。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q13</span><span>公益出租人資格要我自己去申請嗎？</span></summary>
    <div class="ans">
      <p>不用您跑。房客只要領有政府租金補貼，您就自動具備公益出租人身分，由地方政府主動認定並核發證明，我們會協助追蹤與備齊文件。</p>
      <p>公益出租人的優惠是：綜所稅每屋每月免稅額 15,000 元、必要費用率 43%、房屋稅 1.2%（桃園市明訂不限戶數）、地價稅按自用住宅用地稅率 2‰。</p>
      <p><strong>和一般包租代管的差別：</strong>免稅額從每月 6,000 元跳到 15,000 元，但必要費用率從 53% 降回 43%。月租低於約 15,000 元的房子，公益出租人身分幾乎等於租金收入全額免稅；月租較高的房子，兩者的差距則要實際試算才知道。房屋稅、地價稅則是公益出租人明顯較優。</p>
      <p class="law">法源：住宅法第 3 條第 3 款、第 15 條、第 16 條。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q14</span><span>我過去的租金收入沒有申報，加入後會被追查嗎？</span></summary>
    <div class="ans">
      <p>這題很多屋主想問但沒開口，我們直接講清楚。</p>
      <p><strong>先講最容易被誤會的一點：加入包租代管，不等於把您的租金收入公開。</strong>國稅局本來就有各種查核管道，房客申報租金支出列舉扣除額是最常見的一種。是否會被查，和有沒有加入包租代管，並不是同一件事。</p>
      <p><strong>再來看法律實際要求我們做什麼。</strong>租賃專法第 34 條有兩項不同的義務，範圍差很多：</p>
      <div class="tbl-scroll">
      <table>
        <thead><tr><th>第 34 條</th><th>代管</th><th>包租</th></tr></thead>
        <tbody>
          <tr>
            <th>第 1 項<br>資訊提供</th>
            <td>簽約起 30 日內將契約相關資訊提供地方主管機關。<strong>不對外公開查詢。</strong></td>
            <td>同左，屋主與租寓之間的承租契約適用本項。</td>
          </tr>
          <tr>
            <th>第 2 項<br>實價登錄</th>
            <td>不適用。</td>
            <td>轉租契約簽訂起 30 日內申報登錄成交資訊，除個資外得供查詢。</td>
          </tr>
        </tbody>
      </table>
      </div>
      <div class="key">
        <p><strong>請注意第 2 項登錄的是「轉租」契約。</strong>也就是租寓與房客之間那份契約的租金，不是屋主收到的保證租金。對外查得到的是<strong>房客付多少</strong>，不是<strong>您收多少</strong>。屋主端的契約走第 1 項，只提供給地方住宅主管機關，不會出現在公開的租金實價登錄上。</p>
      </div>
      <p><strong>不利的部分也講。</strong>《住宅法》裡有一條「契約資料除作為租稅減免使用外，不得作為查核租賃所得依據」的保護，但它只給兩種身分：公益出租人（第 15 條第 3 項），以及社會住宅包租代管的屋主（第 23 條第 4 項）。租賃專法沒有對應條文，所以單純走一般代管或一般包租的屋主，主張不了這項保護。</p>
      <p><strong>好消息是這個身分不難取得。</strong>只要房客領有政府租金補貼，您就會被認定為公益出租人，由地方政府主動認定，不必自己申請（見 Q13）。這時不但有上述保護，綜所稅免稅額還從每月 6,000 元提高到 15,000 元。我們在招租時會把這件事一併納入考量。</p>
      <p>從加入的年度起，租金收入應照常申報，並適用租賃專法的免稅額與費用率。如果您對過去年度有具體疑慮，建議在簽約前先找會計師，或撥打國稅局免付費專線 0800-000-321 個案諮詢，把狀況釐清再決定——這件事該由專業人士替您判斷，我們不會給您不負責任的保證。</p>
      <p class="law">法源：租賃住宅市場發展及管理條例第 34 條（112 年 2 月 8 日修正，112 年 9 月 1 日施行）；住宅法第 15 條第 3 項、第 23 條第 4 項。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q15</span><span>房屋稅 2.0 上路後，出租給租寓比較划算嗎？</span></summary>
    <div class="ans">
      <p>對持有多戶的屋主，差距被房屋稅 2.0 明顯放大了。</p>
      <p>新制自 113 年 7 月 1 日施行、114 年 5 月起開徵適用，改採<strong>全國歸戶</strong>：空置、或出租但沒向稅務局申請優惠稅率的房子，都算「其他住家用」，桃園與新北都是 <strong>3.2% 起跳、最高 4.8%</strong>，而且戶數越多跳得越快。納入包租代管後，桃園市適用單一稅率 <strong>1.5%</strong>，而且<strong>不計入全國戶數</strong>。</p>
      <p>以房屋現值 80 萬為例，3.2% 是 25,600 元，1.5% 是 12,000 元，一年差 13,600 元。持有三、四戶的屋主，把其中幾戶納入方案，省下的房屋稅往往比服務費還多。</p>
      <p>只有一戶自住加一戶出租、而且本來就有如實申報的屋主，房屋稅差距相對有限，這時候要看的是綜所稅那一塊。</p>
      <p class="law">依桃園市及新北市房屋稅徵收率自治條例，兩市非自住其他住家用皆為 2 戶以內 3.2%、3–4 戶 3.8%、5–6 戶 4.2%、7 戶以上 4.8%。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q16</span><span>我名下有多間房，會影響其他房子的稅嗎？</span></summary>
    <div class="ans">
      <p>會，而且通常是往好的方向。房屋稅 2.0 採全國歸戶累進，非自住持有戶數越多、稅率級距越高。把其中一戶納入包租代管並申報出租，這一戶會從高稅率的非自住級距移出，適用減徵稅率。</p>
      <p>綜所稅的免稅額則是<strong>「每屋」計算</strong>，不是每人。三間房都納入包租代管，就是三個每月 6,000 元的免稅額度。</p>
      <p>提醒兩點：地價稅是以同一縣市內土地合併計算累進，減徵效果會受您在該縣市的持有情況影響；另外自住用房屋稅優惠有戶數限制，納入出租的房子不會佔用自住額度。</p>
    </div>
  </details>

  <div class="cta">
    <p>想用自己房子的租金與所得級距實際算一次？</p>
    <a href="./taoyuan-landlord-tax.html">開啟房東稅務試算</a>
  </div>
</section>

<!-- ============ 房客風險 ============ -->
<section id="risk">
  <div class="sec-head">
    <span class="sec-kicker">03 · 風險</span>
    <h2>房客與風險</h2>
  </div>
  <p class="sec-note">屋主真正睡不著的通常不是租金，是這一區。</p>

  <details class="qa">
    <summary><span class="qid">Q17</span><span>房客怎麼篩選？我看得到資料、能不能否決？</span></summary>
    <div class="ans">
      <p>審核項目包含身分核對、職業與收入穩定度、租屋目的、居住人數與聯絡人。</p>
      <p><strong>過往租賃紀錄則是盡可能查證。</strong>房客願意提供前一位房東的聯絡方式時我們會確認，但這類資訊沒有公開資料庫可查，我們無法保證每次都取得——這一點我們寧可先說清楚。</p>
      <div class="duo">
        <div class="duo-cell a">
          <span class="duo-tag">代管</span>
          <p>租約是您和房客簽的，<strong>您有最終決定權</strong>。我們把審核結果整理給您，您可以否決。</p>
          <p>個資會依規定去識別化後提供，不會給您完整身分證影本。</p>
        </div>
        <div class="duo-cell b">
          <span class="duo-tag">包租</span>
          <p>房客是我們的次承租人，由我們審核與承擔風險，<strong>屋主不逐一指定房客</strong>。</p>
          <p>您可以事先約定合理的使用限制，例如不可養寵物、禁菸、居住人數上限。</p>
        </div>
      </div>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q18</span><span>房客欠租怎麼辦？</span></summary>
    <div class="ans">
      <div class="duo">
        <div class="duo-cell a">
          <span class="duo-tag">代管</span>
          <p>我們負責催繳、發存證信函、協助終止契約與點交。<strong>租金本身由房客支付，我們不代為賠付。</strong>押金可先行抵充。</p>
        </div>
        <div class="duo-cell b">
          <span class="duo-tag">包租</span>
          <p><strong>與您無關。</strong>您的保證租金照月給付，房客欠不欠租、欠多久，由我們處理與吸收。</p>
        </div>
      </div>
      <p><strong>不過真正有效的一道，是在簽約之前。</strong>收入穩定度、租屋目的與居住人數是我們最看重的三項，不合理的組合——租金佔收入比重過高、租屋目的與居住人數對不上、說法前後反覆——在審核階段就會被排除。多數的欠租問題，是在還沒簽約前就避免掉的。</p>
      <p>代管的實務處理節奏：逾期 3 日內電話與訊息催繳、逾期 7 日書面通知、逾期達法定期間（住宅租賃逾 2 個月租額）依法終止契約並啟動點交程序。每一步都會同步通知您。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q19</span><span>押金不夠賠，超出的部分誰負擔？</span></summary>
    <div class="ans">
      <p>押金上限是 2 個月租金，遇到嚴重損壞確實可能不夠。</p>
      <p><strong>一般代管：</strong>不足部分屬於屋主與房客之間的債權，我們協助追償——包含估價、發函、必要時協助提起訴訟或聲請支付命令。追不回來的部分由屋主承擔，這是代管模式的本質。</p>
      <p><strong>包租：</strong>房子還給您時應回復至點交當時的狀態（正常使用耗損除外），這是租寓對屋主的責任，不是房客對屋主的責任。</p>
      <p><strong>降低風險的做法：</strong>入住前的現況確認書要拍得夠仔細，這是後續認定的唯一依據；另外可以評估投保租客責任險（見 Q28）。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q20</span><span>會不會被轉租、分租、住進一堆人？</span></summary>
    <div class="ans">
      <p>租賃契約會明訂<strong>居住人數上限</strong>與<strong>禁止轉租、分租、短租平台出租</strong>，違反者即構成終止契約事由。</p>
      <p>包租比較特別：租寓本身就是合法轉租方，這是包租模式的定義。但轉租對象與用途受委託契約限制，不會變成分租雅房或日租。</p>
      <p>實務上多半是靠鄰居或管委會反映、房客報修時到場察看、以及水電用量異常而發現。查證屬實會立即發函要求改善，未改善即終止。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q21</span><span>房客在屋內從事違法行為，我會被牽連嗎？</span></summary>
    <div class="ans">
      <p>屋主若不知情且無過失，通常不負刑事責任，但可能面臨房屋被查扣、警方搜索、鄰里關係受影響，以及後續處理的時間成本。</p>
      <p><strong>能做的是把「不知情且無過失」變成有證據可證明：</strong></p>
      <ul>
        <li>租賃契約明訂用途限住家、禁止營業與違法使用</li>
        <li>入住前完成身分核對與租屋目的確認，留存紀錄</li>
        <li>報修、維修與到場處理的照片與紀錄</li>
        <li>入住與退租的點交紀錄及現況確認書</li>
        <li>發現異常立即通報並終止契約</li>
      </ul>
      <p>這些紀錄在事後爭議或司法程序中，是證明屋主已盡管理義務的直接依據。代管與包租都會建立這套紀錄。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q22</span><span>房客到期不搬、要走法律程序，誰處理、誰出費用？</span></summary>
    <div class="ans">
      <p>租賃專法設有<strong>調處機制</strong>，多數爭議在這一關就能解決，不必上法院。租賃住宅服務業商業同業公會設有調處委員會，程序比訴訟快很多。</p>
      <p><strong>代管：</strong>我們負責整套流程的執行——發函、申請調處、協助委任律師、陪同點交。<strong>訴訟費與律師費由屋主負擔，租寓不提供補助。</strong>不過真正走到訴訟的案件很少，多數在調處階段就結束了。</p>
      <p><strong>包租：</strong>房客是我們的次承租人，<strong>全程由我們處理與負擔</strong>，您不需要出面，也不需要出錢。</p>
      <p>另外，租賃住宅服務業依法須繳存營業保證金，若因可歸責於業者的事由造成屋主損害，可向全國聯合會請求代為賠償。</p>
      <p class="law">法源：租賃住宅市場發展及管理條例第 16 條、第 22 條。</p>
    </div>
  </details>

  <div class="cta">
    <p>想先看看實際的委託契約長什麼樣子？我們可以先寄合約範本給您看，不用先簽任何東西。</p>
    <a href="#howto">索取合約範本</a>
  </div>
</section>

<!-- ============ 修繕與管理 ============ -->
<section id="fix">
  <div class="sec-head">
    <span class="sec-kicker">04 · 管理</span>
    <h2>修繕與日常管理</h2>
  </div>
  <p class="sec-note">爭議最多的一區，所以每一條都應該在合約上寫死，而不是靠默契。</p>

  <details class="qa">
    <summary><span class="qid">Q23</span><span>修繕責任怎麼分？誰認定是誰的問題？</span></summary>
    <div class="ans">
      <p>分界線是<strong>「原有屋況」對上「使用不當」</strong>：</p>
      <div class="tbl-scroll">
      <table>
        <thead><tr><th>情況</th><th>負擔方</th><th>例子</th></tr></thead>
        <tbody>
          <tr><th>結構與原有設備</th><td>屋主</td><td>漏水、壁癌、管線老化、既有家電自然故障</td></tr>
          <tr><th>正常使用耗損</th><td>屋主</td><td>燈管、水龍頭墊片、紗窗老化</td></tr>
          <tr><th>房客使用不當</th><td>房客</td><td>打破玻璃、牆面塗鴉、家電外力損壞</td></tr>
          <tr><th>房客自行加裝</th><td>房客</td><td>加裝設備造成的損壞與復原</td></tr>
        </tbody>
      </table>
      </div>
      <p><strong>認定依據是入住時的「住宅租賃標的現況確認書」。</strong>這份文件依法必須由專任租賃住宅管理人員簽章，會逐項記錄每個設備的狀態並附照片。後續有爭議時，一律回頭比對這份文件——這也是為什麼點交當天值得多花一小時拍仔細。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q24</span><span>多少金額以內租寓可以直接修、不用先問我？</span></summary>
    <div class="ans">
      <p><strong>原則上不論金額，我們都會事前取得您的同意。</strong>報價、照片與施工方式先給您過目，您同意了才動工。這是預設做法，不是特例。</p>
      <p>合約另訂一個 <strong>3,000 元</strong>的授權額度，用意是備而不用：金額在此之內、而您已表示小額免逐次確認，或一時聯絡不上、再拖下去損害會擴大時，我們可以先處理再回報。這道機制是為了不讓小事拖成大事，不是用來繞過您。</p>
      <p><strong>緊急狀況則不受金額限制。</strong>漏水、停電、無水、瓦斯外洩、門鎖故障等會影響居住安全或造成損害擴大的情況，一律先處理，並於 48 小時內附照片與單據回報。延遲處理的擴大損失，通常遠高於修繕費本身。</p>
      <p>所有修繕支出都會附單據，列在當月的代管表上。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q25</span><span>冷氣、熱水器壽命到了，誰換？</span></summary>
    <div class="ans">
      <p>原則上<strong>屋主提供的設備，自然壽命終了由屋主更換</strong>，因為房子的價值和後續租金也回到屋主身上。房客造成的損壞則由房客負責維修或賠償。</p>
      <p>我們會協助的部分：判斷是修還是換划算、比價、找師傅、監工、驗收，並把報價先給您。您也可以指定自己的水電或家電廠商。</p>
      <p><strong>包租的差別：</strong>租賃住宅或附屬設備損壞時，<strong>由包租業（租寓）負責修繕</strong>；至於修繕費用，則由租賃雙方視損壞性質與責任歸屬，於合約中約定負擔方式。</p>
      <p><strong>租寓的做法是這樣：</strong>簽約點交時會做一次<strong>設備盤點</strong>。盤點當下判定壽命將至的電器與設備，由<strong>租寓負擔成本做預防性更換</strong>——與其等它在房客住進去之後壞掉，不如先換掉。屬於<strong>結構性</strong>的問題，例如漏水、壁癌、管線老化，則仍由屋主負擔。</p>
      <p>點交之後才自然故障的設備，回到 Q23 的修繕責任原則，依損壞性質與合約約定處理。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q26</span><span>我需要先花錢整理或添購傢俱嗎？</span></summary>
    <div class="ans">
      <p>不是必要，但會影響租金與去化速度。空屋租得掉，只是租金較低、房客類型不同、找的時間較久。</p>
      <p>我們的建議通常分三級：</p>
      <ul>
        <li><strong>一定要做</strong>——漏水、壁癌、電力不足、門鎖與安全設備。這些不處理會直接影響能不能出租</li>
        <li><strong>投報率高</strong>——冷氣、熱水器、抽油煙機、基本照明、粉刷。花費有限，租金與去化速度改善明顯</li>
        <li><strong>看情況</strong>——全套傢俱、系統櫃、家電包。適合套房與短期租客市場，長租家庭客反而不一定需要</li>
      </ul>
      <p>看屋後我們會給一份分級建議與粗估金額，您決定要做到哪一級，不做也可以接。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q27</span><span>我怎麼知道租寓有在認真招租？</span></summary>
    <div class="ans">
      <p>空置期一拉長，這就會變成信任問題。所以我們把招租進度做成可查核的東西，而不是等您來問：</p>
      <ul>
        <li><strong>主要刊登平台</strong>——591 與租寓官網</li>
        <li><strong>次要刊登</strong>——社群平台，例如 FB 租屋社團</li>
        <li>每週帶看次數與房客回饋摘要</li>
        <li>市場反應不如預期時的租金或條件調整建議</li>
      </ul>
      <p><strong>如果連續 2 週沒有帶看、也無人詢問，我們會主動找您討論調整。</strong>那通常不是房客的問題，是定價或呈現的問題。與其讓房子繼續空著，不如早一點把數字攤開來談。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q28</span><span>火險、地震險、租客責任險，誰保？</span></summary>
    <div class="ans">
      <p><strong>保險的部分租寓不經手，由屋主自行處理與投保</strong>，不論代管或包租都一樣。以下是三種常見的險種與各自的角色：</p>
      <ul>
        <li><strong>住宅火險與地震基本保險</strong>——保的是屋主的房子，由屋主投保。有房貸的房子通常已由銀行要求投保，記得確認保額是否還跟得上重置成本</li>
        <li><strong>租客責任險</strong>——保的是房客過失造成的損害（如失火、漏水波及鄰居），被保險人是房客。屋主要做的不是自己掏錢，而是<strong>在租約中把投保列為承租條件</strong></li>
      </ul>
    </div>
  </details>
</section>

<!-- ============ 合約與退出 ============ -->
<section id="contract">
  <div class="sec-head">
    <span class="sec-kicker">05 · 合約</span>
    <h2>合約與退出</h2>
  </div>
  <p class="sec-note">簽進去之前，先確認怎麼出來。</p>

  <details class="qa">
    <summary><span class="qid">Q29</span><span>委託幾年？可以簽短一點嗎？</span></summary>
    <div class="ans">
      <p><strong>代管一般簽 3 年，包租一般簽 5 年。</strong>包租的實際年限依屋況調整，若需要投入裝潢，成本要靠時間攤提，期間可能拉長到 10 年。</p>
      <p><strong>包租為什麼綁比較久？</strong>因為保證租金是在空租、欠租、修繕都由租寓吸收的前提下計算的，這些成本要靠夠長的期間才攤得平；有裝潢投入的更是如此。年限縮短，折數就得往下壓——這也是 Q4 提到「委託年限越長、成數越高」的原因。</p>
      <p>如果您短期內有其他打算（賣屋、自住、給小孩住），與其簽短約，不如在簽約前把終止條件談清楚，彈性更大，請一併看下一題。</p>
      <p>簽約前依消保法有<strong>至少 3 日以上的合理審閱期</strong>，這是法定權利。把合約帶回去看，或請律師、代書看過再簽，我們不會催。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q30</span><span>中途我要收回自住或要賣房，可以終止嗎？</span></summary>
    <div class="ans">
      <p><strong>代管：</strong>需於<strong>一個月前書面通知</strong>，違約金為 <strong>6 個月的代管費</strong>。如果屋內還有房客，另需處理房客的搬遷與後續，這部分的費用歸屬會在合約中寫明。</p>
      <p><strong>包租：</strong>因為租寓在前期投入了招租、整理甚至裝潢成本，並承擔了整段期間的空置與欠租風險，提前終止的條件比代管嚴格許多，也涉及成本攤提的計算。這部分無法一概而論，<strong>請在簽約前向我們確認，並詳閱合約條款</strong>。
      <p><strong>建議在簽約時就把您可預期的情況談進去。</strong>例如「子女三年後回國自住」，可以事先約定該時點為無違約金的終止事由，或把委託期限對齊那個時間。事前談是條款，事後談是糾紛。</p>
      <p>反過來，若因可歸責於租寓的事由（未依約給付、未依約管理）導致契約無法履行，您可以終止並依法請求賠償。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q31</span><span>房子賣掉，租約會跟著走嗎？會影響售價嗎？</span></summary>
    <div class="ans">
      <p>會。民法第 425 條的<strong>「買賣不破租賃」</strong>原則：已經公證或期限 5 年以下的租約，房子過戶後新屋主承受原租約，房客可以住到期滿。</p>
      <p><strong>對售價的影響要分兩面看：</strong></p>
      <ul>
        <li><strong>賣給自住客</strong>——通常是減分，買方不能馬上入住，會反映在價格或成交速度上</li>
        <li><strong>賣給投資客</strong>——常常是加分，附租約代表有現金流、有租金實績，省去找房客的空窗</li>
      </ul>
      <p>如果您已經打算兩年內出售，簽約時就告訴我們，可以把租約期間、終止條款、房客類型都往「好賣」的方向設計。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q32</span><span>合約到期，房客還在裡面怎麼辦？點交誰負責？</span></summary>
    <div class="ans">
      <p><strong>一般代管：</strong>租約本來就是您和房客的，委託到期後租約繼續有效，您可以自己管、換一家管，或與我們續約。我們會把租約正本、押金、現況確認書、修繕與收支紀錄、房客聯絡資訊完整移交。</p>
      <p><strong>包租：</strong>期滿時我們負責讓房客搬離並完成點交，把空屋回復至點交時的狀態交還給您。若您希望留下該房客直接改為您的房客，也可以協助轉換。</p>
      <p>不論哪一種，點交都會做屋況清點、拍照、水電瓦斯結算與過戶、鑰匙與門禁卡清點，並簽署點交證明文件。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q33</span><span>如果貴公司經營發生變化，我的房客和押金怎麼辦？</span></summary>
    <div class="ans">
      <p>這是合理的擔心，法規上有三層保護：</p>
      <ul>
        <li><strong>營業保證金</strong>——租賃住宅服務業依法須向全國聯合會繳存營業保證金。因可歸責於業者的事由造成損害時，可在保證金與擔保總額內請求代為賠償</li>
        <li><strong>特許登記</strong>——必須設立公司、置專任租賃住宅管理人員、加入公會、領有登記證才能營業，不是誰都能開</li>
        <li><strong>押金分離保管</strong>——代收的押金與公司營運資金分開，不進入營運周轉</li>
      </ul>
      <p>簽約前也歡迎向核發機關或公會查證租寓的租賃住宅服務業登記證與公會註冊資訊，我們沒有什麼好隱藏的。</p>
      <p class="law">法源：租賃住宅市場發展及管理條例第 19 條、第 22 條、第 24 條。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q34</span><span>我可以自己隨時去看房子嗎？</span></summary>
    <div class="ans">
      <p>不能無預警進入。房子雖然是屋主的，但出租期間房客有<strong>居住安寧與隱私權</strong>，未經同意進入可能構成侵入住宅。這一點在自租時也一樣。</p>
      <p>正常做法是提前約定時間，由我們協調房客後陪同前往。日常的維修紀錄與點交照片都會提供給您，多數時候不需要親自跑一趟。</p>
      <p>例外是緊急狀況——火災、漏水、瓦斯外洩等有立即危險時，可以在通知後進入處理。</p>
    </div>
  </details>
</section>

<!-- ============ 怎麼開始 ============ -->
<section id="howto">
  <div class="sec-head">
    <span class="sec-kicker">06 · 開始</span>
    <h2>怎麼開始</h2>
  </div>
  <p class="sec-note">前面兩步都不用付錢，也不用簽任何東西。</p>

  <details class="qa">
    <summary><span class="qid">Q35</span><span>整個流程要多久？</span></summary>
    <div class="ans">
      <div class="tbl-scroll">
      <table>
        <thead><tr><th>階段</th><th>您要做的事</th><th class="num">約需時間</th></tr></thead>
        <tbody>
          <tr><th>1. 初步諮詢</th><td>提供地址、坪數、格局、照片</td><td class="num">1–2 天</td></tr>
          <tr><th>2. 現場看屋</th><td>約時間開門，一小時內</td><td class="num">3–5 天</td></tr>
          <tr><th>3. 書面評估</th><td>看租金評估與方案建議</td><td class="num">2–3 天</td></tr>
          <tr><th>4. 簽約</th><td>審閱期至少 3 日，備齊文件</td><td class="num">3–7 天</td></tr>
          <tr><th>5. 整理與上架</th><td>決定整理程度</td><td class="num">7–14 天</td></tr>
          <tr><th>6. 招租媒合</th><td>等通知</td><td class="num">定價貼近行情<br>約 1 個月內</td></tr>
        </tbody>
      </table>
      </div>
      <p>前三步完全免費，看完評估再決定要不要往下走。招租所需的時間主要取決於定價，租金怎麼定、誰說了算，請見 Q5。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q36</span><span>我要準備哪些文件？</span></summary>
    <div class="ans">
      <ul>
        <li>身分證正反面影本</li>
        <li>建物所有權狀影本，或最近三個月內的建物謄本</li>
        <li>房屋稅單或地價稅單（確認稅籍與門牌）</li>
        <li>存摺封面影本（撥款帳戶）</li>
        <li>共有房屋：其他共有人同意書</li>
        <li>非本人辦理：授權書與受任人身分證件</li>
      </ul>
      <p>謄本我們可以協助調閱，您不用自己跑地政事務所。</p>
    </div>
  </details>

  <details class="qa">
    <summary><span class="qid">Q37</span><span>現在有房客在住，可以中途轉給租寓管嗎？</span></summary>
    <div class="ans">
      <p>可以，這種情況比想像中常見。現有租約繼續有效，我們接手的是管理工作——收租、修繕協調、續約、退租點交。</p>
      <p>需要處理的兩件事：一是<strong>通知房客</strong>管理方變更與新的聯絡窗口；二是<strong>押金移轉</strong>與屋況現況重新確認，避免日後責任認定不清。</p>
      <p><strong>要注意的是稅賦優惠的起算。</strong>包租代管的稅賦優惠原則上從納入方案後才適用，不會回溯到之前的月份。若現有租約還有很久才到期，可以先估算轉入的效益再決定時點。</p>
    </div>
  </details>

  <div class="cta">
    <p>還有問題沒被回答到？直接問，我們不會先要您留一堆資料。</p>
    <a href="#">用 LINE 詢問</a>
  </div>
</section>

</main>

<footer>
  <div class="wrap">
    <p><strong>服務範圍</strong><br>
    桃園市全區，以及新北市林口。其他區域歡迎詢問。</p>
    <p><strong>關於這頁的資訊</strong><br>
    本頁稅務數字依《住宅法》、《租賃住宅市場發展及管理條例》、《房屋稅條例》，以及桃園市與新北市房屋稅徵收率自治條例整理，最後更新 2026 年 8 月。房屋稅、地價稅減徵細節依各縣市自治條例，請分別以桃園市政府地方稅務局、新北市政府稅捐稽徵處公告為準。住宅法的租稅優惠設有實施年限，行政院得於屆期前延長。</p>
    <p>本頁內容為一般性說明，不構成稅務或法律意見。個案適用請洽會計師、地政士或撥打國稅局免付費專線 0800-000-321。實際權利義務以雙方簽訂之契約為準。</p>
    <p>租寓 Zuyou ／ 桃園市</p>
  </div>
</footer>

<script>
(function(){
  var seg = document.querySelector('.seg');
  if(!seg) return;
  seg.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-col]');
    if(!btn) return;
    seg.querySelectorAll('button').forEach(function(b){
      b.setAttribute('aria-pressed', String(b === btn));
    });
    document.body.classList.remove('only-a','only-b');
    if(btn.dataset.col === 'a') document.body.classList.add('only-a');
    if(btn.dataset.col === 'b') document.body.classList.add('only-b');
  });
})();

/* Q1 試算表：綜所稅率可自選，綜所稅與實拿即時重算。
   每列的 data-base 是「乘上稅率前的課稅所得」，data-other 是房屋稅＋服務費（與稅率無關）。
   預設 20% 的數字直接寫在 HTML 裡，關掉 JS 也看得到完整一版。 */
(function(){
  var sel = document.getElementById('q1-rate');
  if(!sel) return;
  var rows = document.querySelectorAll('[data-q1-row]');
  if(!rows.length) return;

  function fmt(n){ return n.toLocaleString('en-US'); }

  /* 57,088 → 「5 萬 7」 */
  function wan(n){
    var k = Math.round(n / 1000), w = Math.floor(k / 10), r = k % 10;
    return r ? w + ' 萬 ' + r : w + ' 萬';
  }

  function net(tr, rate){
    return +tr.dataset.gross - Math.round(+tr.dataset.base * rate / 100) - +tr.dataset.other;
  }

  function render(){
    var rate = parseFloat(sel.value);

    rows.forEach(function(tr){
      var tax = Math.round(+tr.dataset.base * rate / 100);
      tr.querySelector('[data-q1="tax"]').innerHTML =
        '−' + fmt(tax) + '<br><small>' + tr.dataset.note + '×' + rate + '%</small>';
      tr.querySelector('[data-q1="net"]').innerHTML = '<strong>' + fmt(net(tr, rate)) + '</strong>';
    });

    var b5 = document.querySelector('[data-q1-row="baozu5"]');
    var b7 = document.querySelector('[data-q1-row="baozu7"]');
    var gap = document.querySelector('[data-q1-gap]');
    if(b5 && b7 && gap) gap.textContent = wan(net(b7, rate) - net(b5, rate));

    document.querySelectorAll('[data-q1-rate]').forEach(function(el){
      el.textContent = rate + '%';
    });
  }

  sel.addEventListener('change', render);
  render();   /* 瀏覽器可能記住上次選的稅率，載入時先對齊一次 */
})();
</script>

<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"FAQPage",
  "mainEntity":[
    {"@type":"Question","name":"我自己租，跟交給租寓，實拿差多少？","acceptedAnswer":{"@type":"Answer","text":"以市價月租 2 萬元、房屋現值 80 萬的桃園房子、屋主綜所稅率 20% 為例，一整年算完是這樣： 自己出租（沒申請「出租房屋優惠稅率」）：年租金收入 220,000、綜所稅 −25,080、房屋稅 −25,600、服務費 0、實拿 169,320；自己出租（已申請「出租房屋優惠稅率」且達標）：年租金收入 220,000、綜所稅 −25,080、房屋稅 −12,000、服務費 0、實拿 182,920；一般代管：年租金收入 220,000、綜所稅 −14,476、房屋稅 −12,000、服務費 −32,000、實拿 161,524；一般包租（保證租金 5 折）：年租金收入 120,000、綜所稅 −4,512、房屋稅 −25,600、服務費 0、實拿 89,888；一般包租（保證租金 7 折）：年租金收入 168,000、綜所稅 −9,024、房屋稅 −12,000、服務費 0、實拿 146,976。 兩種「自己出租」的綜所稅為什麼一樣？因為兩列都有依法向國稅局申報租賃所得，差別只在有沒有另外向地方稅務局申請「出租房屋優惠稅率」。這是兩個不同的申報：綜所稅是每年 5 月報給國稅局；房屋稅優惠要在 3 月 22 日前主動向稅務局提出申請，而且隔年申報的租賃所得要達當地租金標準，兩個條件缺一不可。很多屋主有乖乖繳綜所稅，卻不知道要申請這個，白白多繳 1 萬 3,600。 包租的兩列請一起看，5 折和 7 折差了 5 萬 7。不只是租金少 4 萬 8——保證租金打得越低，越容易掉到「當地一般租金標準」以下；申報的租賃所得沒達標，房屋稅就拿不到 1.5% 優惠、得按 3.2% 起跳課徵，租金少了、稅又多繳。上表假設 5 折未達標、7 折達標，實際門檻要看該屋適用的租金標準（算法見 Q12）。保證租金區間是市價的 5 到 7 折，實際成數必須以現場評估的屋況為準；折數落在哪裡對實拿的影響非常大，簽約前請務必確認清楚。 我們不會說「交給租寓一定賺比較多」。房子好租、屋主自己有時間管、又把兩邊的申報都做齊，自租的帳面數字確實不差。真正要比的是這三件事會不會發生： 多空一個月——自租少 2 萬，包租不受影響；欠租一次——押金抵完可能還少好幾萬，加上催討與訴訟的時間；漏了房屋稅那道申請——稅率從 1.5% 跳到 3.2%，這一格就差 1 萬 3,600；試算假設：桃園市、房屋現值 80 萬、綜所稅率 20%、全國持有 2 戶以內、自租與代管均假設空置 1 個月。自租採 43% 必要費用率（故乘 57%）；一般代管與一般包租採每月 6,000 元免稅額＋53% 費用率（故乘 47%）；一般代管的仲介服務費以 2 年約 20,000 元攤提為每年 10,000 元，代管費為月租 10%。房屋稅率依桃園市房屋稅徵收率自治條例；房屋稅欄假設自租與代管已申請並申報達當地一般租金標準（1.5%）、包租 5 折未達標（3.2%）、7 折達標（1.5%）。租金標準的算法自 114 年度起改制（見 Q12），個案是否達標依該屋房屋評定現值與公告土地現值認定。2026-08-31 已依 114 年度租金標準修正說法、房屋稅達標與否改列為假設；數字仍建議找會計師覆核一次。"}},
    {"@type":"Question","name":"包租跟代管差在哪？我該選哪一個？","acceptedAnswer":{"@type":"Answer","text":"先分兩層。第一層是代管還是包租，決定風險由誰扛；第二層是保證租金談到幾折，決定包租划不划算。（代管） 房客是屋主的房客，租約是屋主的租約。我們負責招租、帶看、收租、修繕協調、糾紛處理。 租金沒有上限，行情漲您就漲。但空租就沒有收入，房客欠租我們幫您催，不代您賠。（包租） 我們向您承租整間房，再轉租出去。您的租約對象是租寓，不是房客。 每月固定入帳，空租、欠租都跟您無關。代價是租金以市價打折計算。 兩者在錢和稅上的實際差別： 屋主收到的租金：代管 市價全額、包租 市價 5–7 折；空租期間：代管 沒有收入、包租 照付；房客欠租：代管 屋主承擔、包租 租寓承擔；服務費：代管 仲介＋代管 10%、包租 不另收；租金能不能調漲：代管 可以，隨行情、包租 委託期間固定；房客由誰決定：代管 屋主有否決權、包租 租寓審核。 怎麼選：房子好租、地段不愁客、想保有租金上限，只是不想處理雜事 → 代管。怕空租、怕收不到錢、人在國外或工作忙、需要穩定現金流 → 包租。 簡單的判斷方式：把「市價租金 × 預估空置月數 × 欠租風險」算過一遍，如果算出來比保證租金低，包租就划算。這也是我們評估時會跟您一起看的數字。"}},
    {"@type":"Question","name":"我的房子符合資格嗎？","acceptedAnswer":{"@type":"Answer","text":"三十秒自我檢查，以下每一項都是「是」，基本上就可以談： 產權清楚，您是所有權人或有合法處分權（共有需其他共有人同意）；是合法住宅用途，有使用執照或門牌，非工業宅、農舍；沒有違建：頂樓加蓋、夾層、陽台外推、違法隔套是最常見的卡點；基本可住：有廚衛、有水電、無漏水與結構安全疑慮；沒有被查封、假扣押，或正在進行的產權訴訟；有一項不符也先別放棄。違建的部分有時可以把違建區域排除在委託範圍外；屋況不佳可以先估修繕金額再決定；共有產權可以協助處理同意書。違建的認定包租會比代管嚴格，因為包租是我們自己要承租下來、承擔風險。 最快的方式是拍幾張照片、給我們地址與坪數，我們回覆能不能收、走哪個方案。"}},
    {"@type":"Question","name":"保證租金怎麼算？大概是市價的幾成？","acceptedAnswer":{"@type":"Answer","text":"保守估計是市場行情的 5 到 7 折，實際成數要看屋況才能定。 折數太低會踩到一個稅務地雷。要適用房屋稅 1.5% 的優惠稅率，租金必須「申報租賃所得達當地租金標準」。桃園市的租金標準是房屋評定現值的 21%——現值 80 萬的房子，年租金要達 168,000 元。市價月租 2 萬打 7 折剛好踩線，打 6 折就會低於標準，房屋稅會被改按 3.2% 起跳課徵，一年多繳 1 萬 3。 影響成數的主要是這幾項： 屋況與屋齡——需要整理的程度越低，成數越高；格局與坪數——好租的格局（套房、兩房）通常條件較好；地段與交通——去化速度直接影響我們願意承擔的風險；是否附傢俱家電——附得越齊，成數越高；委託年限——期間越長，攤提成本越低，成數越高；我們不會在看屋前給您一個數字，因為那個數字沒有意義。實際看過、拍過、確認過屋況之後，會給您一份書面的租金評估，成數與依據都會寫在上面。 比較的時候記得把稅一起算。包租的租金收入一樣適用租賃專法的優惠：每屋每月 6,000 元免稅額，超過的部分月租 2 萬以內可扣除 53% 必要費用。但折數壓得太低會低於租金標準、連房屋稅優惠一起丟掉，所以「折數高低」不等於「實拿高低」。"}},
    {"@type":"Question","name":"租金怎麼定？誰說了算？","acceptedAnswer":{"@type":"Answer","text":"最終由您決定。我們提供的是依據，不是單方面丟給您一個數字。 評估方式是比對591 的在租行情與內政部實價登錄的成交紀錄，鎖定同一地段、相同坪數與格局的物件，再依屋況、樓層、朝向與是否附傢俱調整。比對用的案例會一併提供給您，您看得到我們是從哪些物件推出來的。 定價貼近行情，通常一個月內可以媒合完成；高於行情太多，空置期會明顯拉長。而空著的每一個月都是實質損失——月租 2 萬的房子多空一個月，就等於整年少了 2 萬，這通常比當初想多爭取的那一兩千元租金還多。 我們不會勉強您照建議價開。但如果上架後連續 2 週沒有帶看、也無人詢問，我們會主動找您把數字攤開來重新討論（見 Q27）。"}},
    {"@type":"Question","name":"空置期我還有錢拿嗎？免收租期是幾個月？","acceptedAnswer":{"@type":"Answer","text":"（代管） 沒有租金。房子空著就是沒有收入，我們也拿不到代管費，所以招租的動機跟您一致。（包租） 保證租金照付。租不出去、房客提前搬走、換房客的空窗，都由我們吸收。 但有一段免收租期。簽約後有一段招租與整理期間不計算保證租金，期滿後才開始給付。這段期間的長短依實際屋況與裝潢施工時程評估——屋況良好、不需大幅整理的房子最短，需要泥作、水電、油漆或訂製傢俱的則會拉長。實際月數會在合約上寫明，不是浮動的。 起算基準用的是點交完成日，不是簽約日，這一點請務必在合約上確認過再簽。"}},
    {"@type":"Question","name":"服務費怎麼收？除此之外還有沒有其他費用？","acceptedAnswer":{"@type":"Answer","text":"仲介服務費（一次性，成功出租才收）依承租期間長短計算： 未滿 1 年：仲介服務費 月租金之 25%、以月租 20,000 為例 5,000；1 年以上未滿 2 年：仲介服務費 月租金之 50%、以月租 20,000 為例 10,000；2 年以上：仲介服務費 月租金之 100%、以月租 20,000 為例 20,000。 這筆是每次成功媒合收一次，不是每年收。房客續約時的處理方式見 Q11。 代管服務費（按月）：月租金之 10%，由每月租金中扣除後撥付。空租期間不收，房子沒租出去我們一毛也拿不到。 月租 20,000 的房子，每月代管費 2,000 元，一年 24,000 元。這筆買的是招租、帶看、收租、催繳、修繕協調、糾紛處理與退租點交。（代管） 仲介服務費 ＋ 每月代管費。兩筆都會列在月結明細上。（包租） 屋主端不另收服務費。我們的收益來自轉租價差，同時承擔空置與欠租風險。 不會有的費用：簽約費、審件費、上架費、拍照費、每年續管費。除了上述兩項與經您同意的修繕支出以外，不會有其他名目。"}},
    {"@type":"Question","name":"每月幾號入帳？我看得到收支明細嗎？","acceptedAnswer":{"@type":"Answer","text":"每月 5 日撥付至屋主指定的帳戶，遇假日順延至次一營業日。 每月 5 日前，我們會透過租寓官方 LINE 發送當月的代管表，也就是收支明細，內容包含：收到的租金、代收代付的費用、服務費、當月修繕支出與單據、實付金額。先看明細、再入帳，屋主每個月都對得起來。 因此委託後需要加入租寓官方 LINE，這是接收代管表與日常聯繫的主要管道。年度結束另提供整年彙總表，報稅時可直接使用。"}},
    {"@type":"Question","name":"水電、瓦斯、管理費、網路，誰付？","acceptedAnswer":{"@type":"Answer","text":"原則是使用者付費、持有者付固定支出： 水、電、瓦斯：通常由誰負擔 房客（依實際用量或分攤）；第四台、網路：通常由誰負擔 房客；社區管理費：通常由誰負擔 屋主；房屋稅、地價稅：通常由誰負擔 屋主；公共設施修繕分攤：通常由誰負擔 屋主；清潔費（公寓、無管委會）：通常由誰負擔 視現況約定。 這些會在委託契約與租賃契約中逐項寫明，不採「其餘依慣例」這種寫法。如果您希望把管理費含在租金裡一起收，也可以，我們會反映在租金定價上。"}},
    {"@type":"Question","name":"押金由誰收、放在哪裡？退租要扣款時誰決定？","acceptedAnswer":{"@type":"Answer","text":"依《租賃住宅市場發展及管理條例》，押金不得超過 2 個月租金，這是法定上限。（代管） 押金由我們代收，保管方式可三選一：租寓全額保管、屋主全額保管，或雙方各持一半。由租寓保管的部分與公司營運帳戶分開，不動用。 退租時的扣款金額，一律經您同意後才執行。（包租） 房客押金由我們收取與保管，屋主不經手。屋主與租寓之間另依合約約定是否有押金。 代管的三種保管方式怎麼選？差別在退租當天的處理速度與您的掌握感： 租寓全額保管——退租當天可直接結算退還，流程最快，但您要信任公司的分戶保管；屋主全額保管——錢在自己手上最安心，但退租時須等您匯回才能退還房客，若一時聯絡不上或對扣款有異議，房客會卡在那裡；各持一半——折衷做法。小額扣款用租寓保管的那半直接處理，不必為了幾百元驚動您；扣款流程：退租點交時全程拍照記錄，與入住時的現況確認書逐項比對，做成損壞明細與報價。屬於正常使用耗損的不扣（如牆面自然泛黃、家電自然老化）；屬於房客造成的損壞才扣。有爭議時我們居中處理，必要時可循調處或法律途徑。"}},
    {"@type":"Question","name":"房客續約，還要再收一次服務費嗎？","acceptedAnswer":{"@type":"Answer","text":"不用。同一房客續約不再收取仲介服務費，只繼續收每月的代管費。 Q7 表格裡的仲介服務費是「每次成功媒合新房客」才收一次。房客續住，我們沒有重新招租、帶看、審核，自然沒有理由再收一次。 包租的屋主端本來就不收服務費，續約也不影響保證租金。"}},
    {"@type":"Question","name":"參加後我可以省哪些稅？","acceptedAnswer":{"@type":"Answer","text":"綜合所得稅全國一致，這一塊差距最大： 每屋每月免稅額：自己出租 無、代管或包租 6,000、另具公益出租人身分 15,000；必要費用率：自己出租 43%、代管或包租 53%、另具公益出租人身分 43%。 房屋稅與地價稅則是各縣市自訂。以下是我們服務範圍內兩個縣市的實際規定： 空置，或出租但沒申請優惠稅率（其他住家用）：桃園市 3.2% – 4.8%、新北市 3.2% – 4.8%；出租且申報達租金標準：桃園市 1.5% – 2.4%、新北市 1.5% – 2.4%；一般包租代管（租期 1 年以上＋申報達標）：桃園市 1.5%、新北市 1.5%；公益出租人：桃園市 1.2%、新北市 1.2%。 透過包租代管出租：桃園市 無優惠、新北市 無優惠；公益出租人：桃園市 2‰、新北市 2‰。 地價稅這一格要特別說明。租賃住宅市場發展及管理條例第 18 條寫的是地方政府「得」減徵，要另外訂自治條例才算數。桃園市與新北市現行的條例都只涵蓋社會住宅與公益出租人，一般包租代管沒有地價稅優惠，按一般用地稅率課徵。台北市則另訂條例，一般包租代管的地價稅與房屋稅各減徵 40%（每屋各以 1 萬元為上限）——同一件事，換個縣市答案就不一樣。 「不限戶數」是最容易被略過、但影響最大的四個字。房屋稅 2.0 採全國歸戶，持有越多戶稅率跳得越兇。但透過包租代管出租的房子，桃園市不計入戶數、直接適用單一稅率——多屋族省下的差距遠比單看稅率大。 要拿到 1.5% 有三個條件：租期 1 年以上；在每年 3 月 22 日前向地方稅務局提出申請；隔年 5 月向國稅局申報的租賃所得達當地租金標準。租金標準由財政部逐年核定，114 年度起分兩種算法：房子在桃園市 104 年 7 月 1 日（新北市 103 年 7 月 1 日）以後按新標準單價課房屋稅者，為房屋評定現值 ×10%；在那之前的舊標準單價房屋，桃園市為 22%，新北市板橋、三重、永和、中和、新莊、新店、土城、蘆洲、汐止、樹林這 10 區為 24%、林口與鶯歌、三峽、淡水等其餘 19 區為 22%。兩種算法都要再加公告土地現值 ×1.2%。沒提出申請、或申報未達標，都會改按 3.2% 起跳課徵並追補差額。 資料來源：桃園市政府地方稅務局「出租房屋節稅專區」（115 年 8 月更新）、桃園市房屋稅徵收率自治條例、新北市房屋稅徵收率自治條例（114 年 1 月 22 日三讀，溯及 113 年 7 月 1 日施行）、桃園市社會住宅興辦與公益出租人出租房屋減免地價稅及房屋稅自治條例、新北市興辦社會住宅與公益出租人出租房屋優惠地價稅及房屋稅自治條例、財政部核定 114 年度房屋及土地「當地一般租金標準」、租賃住宅市場發展及管理條例、住宅法第 15、16 條。"}},
    {"@type":"Question","name":"公益出租人資格要我自己去申請嗎？","acceptedAnswer":{"@type":"Answer","text":"不用您跑。房客只要領有政府租金補貼，您就自動具備公益出租人身分，由地方政府主動認定並核發證明，我們會協助追蹤與備齊文件。 公益出租人的優惠是：綜所稅每屋每月免稅額 15,000 元、必要費用率 43%、房屋稅 1.2%（桃園市明訂不限戶數）、地價稅按自用住宅用地稅率 2‰。 和一般包租代管的差別：免稅額從每月 6,000 元跳到 15,000 元，但必要費用率從 53% 降回 43%。月租低於約 15,000 元的房子，公益出租人身分幾乎等於租金收入全額免稅；月租較高的房子，兩者的差距則要實際試算才知道。房屋稅、地價稅則是公益出租人明顯較優。 法源：住宅法第 3 條第 3 款、第 15 條、第 16 條。"}},
    {"@type":"Question","name":"我過去的租金收入沒有申報，加入後會被追查嗎？","acceptedAnswer":{"@type":"Answer","text":"這題很多屋主想問但沒開口，我們直接講清楚。 先講最容易被誤會的一點：加入包租代管，不等於把您的租金收入公開。國稅局本來就有各種查核管道，房客申報租金支出列舉扣除額是最常見的一種。是否會被查，和有沒有加入包租代管，並不是同一件事。 再來看法律實際要求我們做什麼。租賃專法第 34 條有兩項不同的義務，範圍差很多： 第 1 項資訊提供：代管 簽約起 30 日內將契約相關資訊提供地方主管機關。不對外公開查詢。、包租 同左，屋主與租寓之間的承租契約適用本項。；第 2 項實價登錄：代管 不適用。、包租 轉租契約簽訂起 30 日內申報登錄成交資訊，除個資外得供查詢。。 請注意第 2 項登錄的是「轉租」契約。也就是租寓與房客之間那份契約的租金，不是屋主收到的保證租金。對外查得到的是房客付多少，不是您收多少。屋主端的契約走第 1 項，只提供給地方住宅主管機關，不會出現在公開的租金實價登錄上。 不利的部分也講。《住宅法》裡有一條「契約資料除作為租稅減免使用外，不得作為查核租賃所得依據」的保護，但它只給兩種身分：公益出租人（第 15 條第 3 項），以及社會住宅包租代管的屋主（第 23 條第 4 項）。租賃專法沒有對應條文，所以單純走一般代管或一般包租的屋主，主張不了這項保護。 好消息是這個身分不難取得。只要房客領有政府租金補貼，您就會被認定為公益出租人，由地方政府主動認定，不必自己申請（見 Q13）。這時不但有上述保護，綜所稅免稅額還從每月 6,000 元提高到 15,000 元。我們在招租時會把這件事一併納入考量。 從加入的年度起，租金收入應照常申報，並適用租賃專法的免稅額與費用率。如果您對過去年度有具體疑慮，建議在簽約前先找會計師，或撥打國稅局免付費專線 0800-000-321 個案諮詢，把狀況釐清再決定——這件事該由專業人士替您判斷，我們不會給您不負責任的保證。 法源：租賃住宅市場發展及管理條例第 34 條（112 年 2 月 8 日修正，112 年 9 月 1 日施行）；住宅法第 15 條第 3 項、第 23 條第 4 項。"}},
    {"@type":"Question","name":"房屋稅 2.0 上路後，出租給租寓比較划算嗎？","acceptedAnswer":{"@type":"Answer","text":"對持有多戶的屋主，差距被房屋稅 2.0 明顯放大了。 新制自 113 年 7 月 1 日施行、114 年 5 月起開徵適用，改採全國歸戶：空置、或出租但沒向稅務局申請優惠稅率的房子，都算「其他住家用」，桃園與新北都是 3.2% 起跳、最高 4.8%，而且戶數越多跳得越快。納入包租代管後，桃園市適用單一稅率 1.5%，而且不計入全國戶數。 以房屋現值 80 萬為例，3.2% 是 25,600 元，1.5% 是 12,000 元，一年差 13,600 元。持有三、四戶的屋主，把其中幾戶納入方案，省下的房屋稅往往比服務費還多。 只有一戶自住加一戶出租、而且本來就有如實申報的屋主，房屋稅差距相對有限，這時候要看的是綜所稅那一塊。 依桃園市及新北市房屋稅徵收率自治條例，兩市非自住其他住家用皆為 2 戶以內 3.2%、3–4 戶 3.8%、5–6 戶 4.2%、7 戶以上 4.8%。"}},
    {"@type":"Question","name":"我名下有多間房，會影響其他房子的稅嗎？","acceptedAnswer":{"@type":"Answer","text":"會，而且通常是往好的方向。房屋稅 2.0 採全國歸戶累進，非自住持有戶數越多、稅率級距越高。把其中一戶納入包租代管並申報出租，這一戶會從高稅率的非自住級距移出，適用減徵稅率。 綜所稅的免稅額則是「每屋」計算，不是每人。三間房都納入包租代管，就是三個每月 6,000 元的免稅額度。 提醒兩點：地價稅是以同一縣市內土地合併計算累進，減徵效果會受您在該縣市的持有情況影響；另外自住用房屋稅優惠有戶數限制，納入出租的房子不會佔用自住額度。"}},
    {"@type":"Question","name":"房客怎麼篩選？我看得到資料、能不能否決？","acceptedAnswer":{"@type":"Answer","text":"審核項目包含身分核對、職業與收入穩定度、租屋目的、居住人數與聯絡人。 過往租賃紀錄則是盡可能查證。房客願意提供前一位房東的聯絡方式時我們會確認，但這類資訊沒有公開資料庫可查，我們無法保證每次都取得——這一點我們寧可先說清楚。（代管） 租約是您和房客簽的，您有最終決定權。我們把審核結果整理給您，您可以否決。 個資會依規定去識別化後提供，不會給您完整身分證影本。（包租） 房客是我們的次承租人，由我們審核與承擔風險，屋主不逐一指定房客。 您可以事先約定合理的使用限制，例如不可養寵物、禁菸、居住人數上限。"}},
    {"@type":"Question","name":"房客欠租怎麼辦？","acceptedAnswer":{"@type":"Answer","text":"（代管） 我們負責催繳、發存證信函、協助終止契約與點交。租金本身由房客支付，我們不代為賠付。押金可先行抵充。（包租） 與您無關。您的保證租金照月給付，房客欠不欠租、欠多久，由我們處理與吸收。 不過真正有效的一道，是在簽約之前。收入穩定度、租屋目的與居住人數是我們最看重的三項，不合理的組合——租金佔收入比重過高、租屋目的與居住人數對不上、說法前後反覆——在審核階段就會被排除。多數的欠租問題，是在還沒簽約前就避免掉的。 代管的實務處理節奏：逾期 3 日內電話與訊息催繳、逾期 7 日書面通知、逾期達法定期間（住宅租賃逾 2 個月租額）依法終止契約並啟動點交程序。每一步都會同步通知您。"}},
    {"@type":"Question","name":"押金不夠賠，超出的部分誰負擔？","acceptedAnswer":{"@type":"Answer","text":"押金上限是 2 個月租金，遇到嚴重損壞確實可能不夠。 一般代管：不足部分屬於屋主與房客之間的債權，我們協助追償——包含估價、發函、必要時協助提起訴訟或聲請支付命令。追不回來的部分由屋主承擔，這是代管模式的本質。 包租：房子還給您時應回復至點交當時的狀態（正常使用耗損除外），這是租寓對屋主的責任，不是房客對屋主的責任。 降低風險的做法：入住前的現況確認書要拍得夠仔細，這是後續認定的唯一依據；另外可以評估投保租客責任險（見 Q28）。"}},
    {"@type":"Question","name":"會不會被轉租、分租、住進一堆人？","acceptedAnswer":{"@type":"Answer","text":"租賃契約會明訂居住人數上限與禁止轉租、分租、短租平台出租，違反者即構成終止契約事由。 包租比較特別：租寓本身就是合法轉租方，這是包租模式的定義。但轉租對象與用途受委託契約限制，不會變成分租雅房或日租。 實務上多半是靠鄰居或管委會反映、房客報修時到場察看、以及水電用量異常而發現。查證屬實會立即發函要求改善，未改善即終止。"}},
    {"@type":"Question","name":"房客在屋內從事違法行為，我會被牽連嗎？","acceptedAnswer":{"@type":"Answer","text":"屋主若不知情且無過失，通常不負刑事責任，但可能面臨房屋被查扣、警方搜索、鄰里關係受影響，以及後續處理的時間成本。 能做的是把「不知情且無過失」變成有證據可證明： 租賃契約明訂用途限住家、禁止營業與違法使用；入住前完成身分核對與租屋目的確認，留存紀錄；報修、維修與到場處理的照片與紀錄；入住與退租的點交紀錄及現況確認書；發現異常立即通報並終止契約；這些紀錄在事後爭議或司法程序中，是證明屋主已盡管理義務的直接依據。代管與包租都會建立這套紀錄。"}},
    {"@type":"Question","name":"房客到期不搬、要走法律程序，誰處理、誰出費用？","acceptedAnswer":{"@type":"Answer","text":"租賃專法設有調處機制，多數爭議在這一關就能解決，不必上法院。租賃住宅服務業商業同業公會設有調處委員會，程序比訴訟快很多。 代管：我們負責整套流程的執行——發函、申請調處、協助委任律師、陪同點交。訴訟費與律師費由屋主負擔，租寓不提供補助。不過真正走到訴訟的案件很少，多數在調處階段就結束了。 包租：房客是我們的次承租人，全程由我們處理與負擔，您不需要出面，也不需要出錢。 另外，租賃住宅服務業依法須繳存營業保證金，若因可歸責於業者的事由造成屋主損害，可向全國聯合會請求代為賠償。 法源：租賃住宅市場發展及管理條例第 16 條、第 22 條。"}},
    {"@type":"Question","name":"修繕責任怎麼分？誰認定是誰的問題？","acceptedAnswer":{"@type":"Answer","text":"分界線是「原有屋況」對上「使用不當」： 結構與原有設備：負擔方 屋主、例子 漏水、壁癌、管線老化、既有家電自然故障；正常使用耗損：負擔方 屋主、例子 燈管、水龍頭墊片、紗窗老化；房客使用不當：負擔方 房客、例子 打破玻璃、牆面塗鴉、家電外力損壞；房客自行加裝：負擔方 房客、例子 加裝設備造成的損壞與復原。 認定依據是入住時的「住宅租賃標的現況確認書」。這份文件依法必須由專任租賃住宅管理人員簽章，會逐項記錄每個設備的狀態並附照片。後續有爭議時，一律回頭比對這份文件——這也是為什麼點交當天值得多花一小時拍仔細。"}},
    {"@type":"Question","name":"多少金額以內租寓可以直接修、不用先問我？","acceptedAnswer":{"@type":"Answer","text":"原則上不論金額，我們都會事前取得您的同意。報價、照片與施工方式先給您過目，您同意了才動工。這是預設做法，不是特例。 合約另訂一個 3,000 元的授權額度，用意是備而不用：金額在此之內、而您已表示小額免逐次確認，或一時聯絡不上、再拖下去損害會擴大時，我們可以先處理再回報。這道機制是為了不讓小事拖成大事，不是用來繞過您。 緊急狀況則不受金額限制。漏水、停電、無水、瓦斯外洩、門鎖故障等會影響居住安全或造成損害擴大的情況，一律先處理，並於 48 小時內附照片與單據回報。延遲處理的擴大損失，通常遠高於修繕費本身。 所有修繕支出都會附單據，列在當月的代管表上。"}},
    {"@type":"Question","name":"冷氣、熱水器壽命到了，誰換？","acceptedAnswer":{"@type":"Answer","text":"原則上屋主提供的設備，自然壽命終了由屋主更換，因為房子的價值和後續租金也回到屋主身上。房客造成的損壞則由房客負責維修或賠償。 我們會協助的部分：判斷是修還是換划算、比價、找師傅、監工、驗收，並把報價先給您。您也可以指定自己的水電或家電廠商。 包租的差別：租賃住宅或附屬設備損壞時，由包租業（租寓）負責修繕；至於修繕費用，則由租賃雙方視損壞性質與責任歸屬，於合約中約定負擔方式。 租寓的做法是這樣：簽約點交時會做一次設備盤點。盤點當下判定壽命將至的電器與設備，由租寓負擔成本做預防性更換——與其等它在房客住進去之後壞掉，不如先換掉。屬於結構性的問題，例如漏水、壁癌、管線老化，則仍由屋主負擔。 點交之後才自然故障的設備，回到 Q23 的修繕責任原則，依損壞性質與合約約定處理。"}},
    {"@type":"Question","name":"我需要先花錢整理或添購傢俱嗎？","acceptedAnswer":{"@type":"Answer","text":"不是必要，但會影響租金與去化速度。空屋租得掉，只是租金較低、房客類型不同、找的時間較久。 我們的建議通常分三級： 一定要做——漏水、壁癌、電力不足、門鎖與安全設備。這些不處理會直接影響能不能出租；投報率高——冷氣、熱水器、抽油煙機、基本照明、粉刷。花費有限，租金與去化速度改善明顯；看情況——全套傢俱、系統櫃、家電包。適合套房與短期租客市場，長租家庭客反而不一定需要；看屋後我們會給一份分級建議與粗估金額，您決定要做到哪一級，不做也可以接。"}},
    {"@type":"Question","name":"我怎麼知道租寓有在認真招租？","acceptedAnswer":{"@type":"Answer","text":"空置期一拉長，這就會變成信任問題。所以我們把招租進度做成可查核的東西，而不是等您來問： 主要刊登平台——591 與租寓官網；次要刊登——社群平台，例如 FB 租屋社團；每週帶看次數與房客回饋摘要；市場反應不如預期時的租金或條件調整建議；如果連續 2 週沒有帶看、也無人詢問，我們會主動找您討論調整。那通常不是房客的問題，是定價或呈現的問題。與其讓房子繼續空著，不如早一點把數字攤開來談。"}},
    {"@type":"Question","name":"火險、地震險、租客責任險，誰保？","acceptedAnswer":{"@type":"Answer","text":"保險的部分租寓不經手，由屋主自行處理與投保，不論代管或包租都一樣。以下是三種常見的險種與各自的角色： 住宅火險與地震基本保險——保的是屋主的房子，由屋主投保。有房貸的房子通常已由銀行要求投保，記得確認保額是否還跟得上重置成本；租客責任險——保的是房客過失造成的損害（如失火、漏水波及鄰居），被保險人是房客。屋主要做的不是自己掏錢，而是在租約中把投保列為承租條件。"}},
    {"@type":"Question","name":"委託幾年？可以簽短一點嗎？","acceptedAnswer":{"@type":"Answer","text":"代管一般簽 3 年，包租一般簽 5 年。包租的實際年限依屋況調整，若需要投入裝潢，成本要靠時間攤提，期間可能拉長到 10 年。 包租為什麼綁比較久？因為保證租金是在空租、欠租、修繕都由租寓吸收的前提下計算的，這些成本要靠夠長的期間才攤得平；有裝潢投入的更是如此。年限縮短，折數就得往下壓——這也是 Q4 提到「委託年限越長、成數越高」的原因。 如果您短期內有其他打算（賣屋、自住、給小孩住），與其簽短約，不如在簽約前把終止條件談清楚，彈性更大，請一併看下一題。 簽約前依消保法有至少 3 日以上的合理審閱期，這是法定權利。把合約帶回去看，或請律師、代書看過再簽，我們不會催。"}},
    {"@type":"Question","name":"中途我要收回自住或要賣房，可以終止嗎？","acceptedAnswer":{"@type":"Answer","text":"代管：需於一個月前書面通知，違約金為 6 個月的代管費。如果屋內還有房客，另需處理房客的搬遷與後續，這部分的費用歸屬會在合約中寫明。 包租：因為租寓在前期投入了招租、整理甚至裝潢成本，並承擔了整段期間的空置與欠租風險，提前終止的條件比代管嚴格許多，也涉及成本攤提的計算。這部分無法一概而論，請在簽約前向我們確認，並詳閱合約條款。 建議在簽約時就把您可預期的情況談進去。例如「子女三年後回國自住」，可以事先約定該時點為無違約金的終止事由，或把委託期限對齊那個時間。事前談是條款，事後談是糾紛。 反過來，若因可歸責於租寓的事由（未依約給付、未依約管理）導致契約無法履行，您可以終止並依法請求賠償。"}},
    {"@type":"Question","name":"房子賣掉，租約會跟著走嗎？會影響售價嗎？","acceptedAnswer":{"@type":"Answer","text":"會。民法第 425 條的「買賣不破租賃」原則：已經公證或期限 5 年以下的租約，房子過戶後新屋主承受原租約，房客可以住到期滿。 對售價的影響要分兩面看： 賣給自住客——通常是減分，買方不能馬上入住，會反映在價格或成交速度上；賣給投資客——常常是加分，附租約代表有現金流、有租金實績，省去找房客的空窗；如果您已經打算兩年內出售，簽約時就告訴我們，可以把租約期間、終止條款、房客類型都往「好賣」的方向設計。"}},
    {"@type":"Question","name":"合約到期，房客還在裡面怎麼辦？點交誰負責？","acceptedAnswer":{"@type":"Answer","text":"一般代管：租約本來就是您和房客的，委託到期後租約繼續有效，您可以自己管、換一家管，或與我們續約。我們會把租約正本、押金、現況確認書、修繕與收支紀錄、房客聯絡資訊完整移交。 包租：期滿時我們負責讓房客搬離並完成點交，把空屋回復至點交時的狀態交還給您。若您希望留下該房客直接改為您的房客，也可以協助轉換。 不論哪一種，點交都會做屋況清點、拍照、水電瓦斯結算與過戶、鑰匙與門禁卡清點，並簽署點交證明文件。"}},
    {"@type":"Question","name":"如果貴公司經營發生變化，我的房客和押金怎麼辦？","acceptedAnswer":{"@type":"Answer","text":"這是合理的擔心，法規上有三層保護： 營業保證金——租賃住宅服務業依法須向全國聯合會繳存營業保證金。因可歸責於業者的事由造成損害時，可在保證金與擔保總額內請求代為賠償；特許登記——必須設立公司、置專任租賃住宅管理人員、加入公會、領有登記證才能營業，不是誰都能開；押金分離保管——代收的押金與公司營運資金分開，不進入營運周轉；簽約前也歡迎向核發機關或公會查證租寓的租賃住宅服務業登記證與公會註冊資訊，我們沒有什麼好隱藏的。 法源：租賃住宅市場發展及管理條例第 19 條、第 22 條、第 24 條。"}},
    {"@type":"Question","name":"我可以自己隨時去看房子嗎？","acceptedAnswer":{"@type":"Answer","text":"不能無預警進入。房子雖然是屋主的，但出租期間房客有居住安寧與隱私權，未經同意進入可能構成侵入住宅。這一點在自租時也一樣。 正常做法是提前約定時間，由我們協調房客後陪同前往。日常的維修紀錄與點交照片都會提供給您，多數時候不需要親自跑一趟。 例外是緊急狀況——火災、漏水、瓦斯外洩等有立即危險時，可以在通知後進入處理。"}},
    {"@type":"Question","name":"整個流程要多久？","acceptedAnswer":{"@type":"Answer","text":"1. 初步諮詢：您要做的事 提供地址、坪數、格局、照片、約需時間 1–2 天；2. 現場看屋：您要做的事 約時間開門，一小時內、約需時間 3–5 天；3. 書面評估：您要做的事 看租金評估與方案建議、約需時間 2–3 天；4. 簽約：您要做的事 審閱期至少 3 日，備齊文件、約需時間 3–7 天；5. 整理與上架：您要做的事 決定整理程度、約需時間 7–14 天；6. 招租媒合：您要做的事 等通知、約需時間 定價貼近行情約 1 個月內。 前三步完全免費，看完評估再決定要不要往下走。招租所需的時間主要取決於定價，租金怎麼定、誰說了算，請見 Q5。"}},
    {"@type":"Question","name":"我要準備哪些文件？","acceptedAnswer":{"@type":"Answer","text":"身分證正反面影本；建物所有權狀影本，或最近三個月內的建物謄本；房屋稅單或地價稅單（確認稅籍與門牌）；存摺封面影本（撥款帳戶）；共有房屋：其他共有人同意書；非本人辦理：授權書與受任人身分證件；謄本我們可以協助調閱，您不用自己跑地政事務所。"}},
    {"@type":"Question","name":"現在有房客在住，可以中途轉給租寓管嗎？","acceptedAnswer":{"@type":"Answer","text":"可以，這種情況比想像中常見。現有租約繼續有效，我們接手的是管理工作——收租、修繕協調、續約、退租點交。 需要處理的兩件事：一是通知房客管理方變更與新的聯絡窗口；二是押金移轉與屋況現況重新確認，避免日後責任認定不清。 要注意的是稅賦優惠的起算。包租代管的稅賦優惠原則上從納入方案後才適用，不會回溯到之前的月份。若現有租約還有很久才到期，可以先估算轉入的效益再決定時點。"}}
  ]
}
</script>

</body>
</html>
`;
