/**
 * 桃園業者包租 收租毛利週報
 * - 每週三 10:00（Asia/Taipei）自動執行
 * - 抓 Ragic：房客契約資料庫&退押 (housing/10) + 房源資訊 (housing/70)
 * - 算「屋主包租成本 vs 房客收租」毛利表
 * - 發到 Google Chat 空間（webhook）+ 在本試算表「週報留存」分頁存一份
 *
 * 機密放 Script Properties（專案設定→指令碼屬性）：
 *   RAGIC_API_KEY       Ragic 金鑰（已是 base64，勿再編碼）
 *   CHAT_WEBHOOK_URL    目標 Chat 空間的 incoming webhook 網址
 *
 * 首次設定：手動跑一次 setupWeeklyTrigger() 建立每週三 10:00 觸發器（會跳 OAuth 授權）。
 * 想立即測試：手動跑 runWeeklyMarginReport()。
 */

var RAGIC_BASE = 'https://ap14.ragic.com/zuyou2022';
var MGMT_COMPANY = '豈家(桃園)';   // 房客契約的「管理公司」
var MODE = '業者包租';             // 「管理模式」
var LOG_SHEET = '週報留存';

function prop(k) {
  return PropertiesService.getScriptProperties().getProperty(k);
}

/** 分頁抓整張 Ragic 表，回傳 {ragicId: record} */
function ragicGetAll(form) {
  var recs = {};
  var off = 0;
  for (var guard = 0; guard < 50; guard++) {
    var url = RAGIC_BASE + '/' + form + '?api&limit=1000&subtable=0&offset=' + off;
    var d = ragicFetchPage(url, form);
    var keys = Object.keys(d);
    for (var i = 0; i < keys.length; i++) recs[keys[i]] = d[keys[i]];
    if (keys.length < 1000) break;
    off += 1000;
  }
  return recs;
}

/**
 * 單頁抓取，含退避重試。Ragic 對同一把 key 高頻請求會限流
 * （回 200 + {status:"ERROR", msg:"...too many requests..."}），
 * 一次 transient 失敗不應讓整份週報中止 → 比照 Next.js 版 lib/ragic.ts 重試 4 次。
 */
function ragicFetchPage(url, form) {
  var key = prop('RAGIC_API_KEY');
  var lastErr = '';
  for (var attempt = 0; attempt < 4; attempt++) {
    var res = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Basic ' + key },
      muteHttpExceptions: true,
    });
    var code = res.getResponseCode();
    var txt = res.getContentText();
    if (code === 200) {
      var d = null;
      try { d = JSON.parse(txt); } catch (e) { d = null; }
      if (d && d.status === 'ERROR' && String(d.msg || '').indexOf('too many requests') >= 0) {
        lastErr = 'Ragic 限流';
      } else if (d) {
        return d;
      } else {
        lastErr = 'JSON 解析失敗';
      }
    } else {
      lastErr = 'HTTP ' + code + ': ' + txt.slice(0, 200);
    }
    Utilities.sleep(1500 * (attempt + 1)); // 退避：1.5s / 3s / 4.5s
  }
  throw new Error('Ragic ' + form + ' 讀取失敗（' + lastErr + '）');
}

function num(x) {
  if (x === undefined || x === null) return 0;
  var n = parseInt(String(x).replace(/,/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

/**
 * 把日期字串轉成可比較的整數 yyyymmdd；無效/空值回 0。
 * 不依賴零補位：'2026/6/5' 與 '2026/06/05' 都正確 → 避免字典序比較把
 * 沒補零的 Ragic 日期判錯而漏算在租契約。
 */
function dateKey(s) {
  var m = String(s || '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return 0;
  return Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);
}

/** 計算當期毛利表 */
function computeReport() {
  var today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd');
  var todayKey = dateKey(today);

  // 屋主包租成本：房源名稱 → 目前包租租金
  var h70 = ragicGetAll('housing/70');
  var cost = {};
  Object.keys(h70).forEach(function (k) {
    var r = h70[k];
    if (r['房源名稱']) cost[r['房源名稱']] = num(r['目前包租租金']);
  });

  // 當期在租的業者包租契約（起始日 ≤ 今天 ≤ 結束日）
  var h10 = ragicGetAll('housing/10');
  var recv = {}, unrecv = {};
  Object.keys(h10).forEach(function (k) {
    var r = h10[k];
    if (r['管理公司'] !== MGMT_COMPANY || r['管理模式'] !== MODE) return;
    var sK = dateKey(r['契約起始日']);
    var eK = dateKey(r['契約結束日']);
    if (!sK || !eK) return;                       // 缺起始/結束日 → 排除（同原本 sentinel 行為）
    if (!(sK <= todayKey && todayKey <= eK)) return;
    var h = r['房源名稱'] || '';
    var rent = num(r['租金']);
    recv[h] = (recv[h] || 0) + rent;
    if (num(r['遲繳天數']) > 0) unrecv[h] = (unrecv[h] || 0) + rent;
  });

  var rows = [];
  Object.keys(recv).forEach(function (h) {
    var c = cost[h] || 0, rc = recv[h], un = unrecv[h] || 0, got = rc - un;
    rows.push({ house: h, cost: c, recv: rc, got: got, mRecv: rc - c, mGot: got - c });
  });
  rows.sort(function (a, b) { return b.mRecv - a.mRecv; });

  var tot = { cost: 0, recv: 0, got: 0, mRecv: 0, mGot: 0 };
  rows.forEach(function (r) {
    tot.cost += r.cost; tot.recv += r.recv; tot.got += r.got;
    tot.mRecv += r.mRecv; tot.mGot += r.mGot;
  });

  return { today: today, rows: rows, tot: tot };
}

/* ---------- 顯示輔助 ---------- */
function dispWidth(s) {
  s = String(s);
  var w = 0;
  for (var i = 0; i < s.length; i++) w += (s.charCodeAt(i) > 255) ? 2 : 1;
  return w;
}
function padTo(s, width, right) {
  s = String(s);
  var gap = width - dispWidth(s);
  var sp = gap > 0 ? Array(gap + 1).join(' ') : '';
  return right ? sp + s : s + sp;
}
function comma(n) {
  var neg = n < 0; n = Math.abs(n);
  var s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + s;
}
function signed(n) { return (n >= 0 ? '+' : '-') + comma(Math.abs(n)); }

function renderTable(headers, rows, alignRight) {
  var w = [];
  for (var c = 0; c < headers.length; c++) {
    var mx = dispWidth(headers[c]);
    rows.forEach(function (r) { mx = Math.max(mx, dispWidth(r[c])); });
    w[c] = mx;
  }
  function line(arr) {
    return arr.map(function (v, c) { return padTo(v, w[c], alignRight[c]); }).join('  ');
  }
  var out = line(headers) + '\n';
  rows.forEach(function (r) { out += line(r) + '\n'; });
  return out;
}

/** 組 Chat 訊息（等寬表格） */
function buildChatMessage(rep) {
  var headers = ['房源', '屋主成本', '房客應收', '實際已收', '應收毛利', '實收毛利'];
  var alignR = [false, true, true, true, true, true];
  var body = rep.rows.map(function (r) {
    return [r.house, comma(r.cost), comma(r.recv), comma(r.got), signed(r.mRecv), signed(r.mGot)];
  });
  var t = rep.tot;
  body.push(['合計', comma(t.cost), comma(t.recv), comma(t.got), signed(t.mRecv), signed(t.mGot)]);

  var table = renderTable(headers, body, alignR);
  var rateRecv = t.recv ? (t.mRecv / t.recv * 100).toFixed(1) : '0.0';
  var rateGot = t.recv ? (t.mGot / t.recv * 100).toFixed(1) : '0.0';

  var msg = '🏠 *桃園業者包租 收租毛利週報* （' + rep.today + '）\n';
  msg += '```\n' + table + '```\n';
  msg += '毛利率（應收基礎）：' + (t.mRecv >= 0 ? '+' : '') + rateRecv + '%　';
  msg += '（實收基礎）：' + (t.mGot >= 0 ? '+' : '') + rateGot + '%\n';
  msg += '應收−實收差額（本期遲繳未收）：' + comma(t.recv - t.got);
  return msg;
}

/** 存到本試算表「週報留存」分頁（每房源一列 + 合計列） */
function saveToSheet(rep) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LOG_SHEET) || ss.insertSheet(LOG_SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['計算日期', '房源', '屋主成本', '房客應收', '實際已收', '應收毛利', '實收毛利']);
  }
  var batch = rep.rows.map(function (r) {
    return [rep.today, r.house, r.cost, r.recv, r.got, r.mRecv, r.mGot];
  });
  var t = rep.tot;
  batch.push([rep.today, '合計', t.cost, t.recv, t.got, t.mRecv, t.mGot]);
  sh.getRange(sh.getLastRow() + 1, 1, batch.length, 7).setValues(batch);
}

/** 發到 Google Chat */
function postToChat(msg) {
  var url = prop('CHAT_WEBHOOK_URL');
  if (!url) throw new Error('缺少 CHAT_WEBHOOK_URL');
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: msg }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) {
    throw new Error('Chat webhook HTTP ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
  }
}

/** 主流程：算 → 存 → 發。觸發器與手動測試都呼叫這支 */
function runWeeklyMarginReport() {
  var rep = computeReport();
  saveToSheet(rep);
  postToChat(buildChatMessage(rep));
  Logger.log('完成：' + rep.today + '，房源 ' + rep.rows.length + ' 筆，應收合計 ' + rep.tot.recv);
}

/** 只跑一次：建立每週三 10:00（台北）觸發器（避免重複建立會先清掉舊的） */
function setupWeeklyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runWeeklyMarginReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runWeeklyMarginReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.WEDNESDAY)
    .atHour(10)
    .inTimezone('Asia/Taipei')
    .create();
  Logger.log('已建立每週三 10:00 觸發器');
}
