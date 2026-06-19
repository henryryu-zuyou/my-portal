// 共用 Ragic 串接工具（server-side 專用，API key 絕不進前端）
// 寫入眉角見專案記憶 reference_ragic_housing70_write：
//  - 欄位寫入「不可」帶 doFormula/doLinkLoad（會洗掉連結載入欄、踩必填死結）
//  - 屋主連結另跑一次 doLinkLoad（帶齊必填欄）讓「屋主證號」帶入
//  - 子表用 JSON {"_subtable_<id>":{"-1":{...}}}
//  - 同一把 key 會被 Ragic 序列化限流 → 全程序列化 + 退避重試

export const RAGIC_BASE = "https://ap14.ragic.com/zuyou2022";

function getKey(): string {
  const key = process.env.RAGIC_API_KEY;
  if (!key) throw new Error("RAGIC_API_KEY 未設定");
  return key;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 全程序列化：同一把 key 高頻請求會被 Ragic 擋（Sending too many requests too fast）。
// 用 promise chain 確保本進程內的 Ragic 請求一個接一個。
let chain: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  // 不論成敗都讓鏈往下走，避免一次失敗卡死後續
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

type RagicRecord = Record<string, unknown>;
type RagicResponse = { status?: string; msg?: string; ragicId?: number } & Record<string, unknown>;

function isRateLimited(json: unknown): boolean {
  return (
    !!json &&
    typeof json === "object" &&
    (json as RagicResponse).status === "ERROR" &&
    String((json as RagicResponse).msg || "").includes("too many requests")
  );
}

// 帶重試退避的底層請求；限流或網路錯誤都重試
async function request(url: string, init: RequestInit): Promise<RagicResponse | Record<string, RagicRecord>> {
  return serialize(async () => {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(url, init);
        if (!res.ok) throw new Error(`Ragic HTTP ${res.status}`);
        const json = await res.json();
        if (isRateLimited(json)) {
          lastErr = new Error("Ragic 限流");
          await sleep(1500 * (attempt + 1));
          continue;
        }
        return json;
      } catch (e) {
        lastErr = e;
        await sleep(500 * (attempt + 1));
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error("Ragic 請求失敗");
  });
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return { Authorization: `Basic ${getKey()}`, ...extra };
}

// 讀取：回傳「有 _ragicId 的紀錄陣列」（過濾限流雜訊）
export async function ragicGet(
  path: string,
  params: Record<string, string | number> = {}
): Promise<RagicRecord[]> {
  const qs = new URLSearchParams({ api: "", ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const url = `${RAGIC_BASE}/${path}?${qs.toString()}`;
  const json = await request(url, { headers: authHeaders() });
  return Object.values(json as Record<string, RagicRecord>).filter(
    (r) => r && typeof r === "object" && "_ragicId" in r
  );
}

// 全文搜尋（免 field ID，用於查重/找房源）
export async function ftsSearch(
  path: string,
  term: string,
  params: Record<string, string | number> = {}
): Promise<RagicRecord[]> {
  return ragicGet(path, { subtable: 0, limit: 20, fts: term, ...params });
}

// 寫入（form-urlencoded）：欄位 key 用 field ID。doLinkLoad 預設關閉（見檔頭說明）。
export async function ragicPostForm(
  path: string,
  fields: Record<string, string>,
  opts: { doLinkLoad?: boolean } = {}
): Promise<RagicResponse> {
  let url = `${RAGIC_BASE}/${path}?api`;
  if (opts.doLinkLoad) url += "&doLinkLoad=true";
  const body = new URLSearchParams(fields).toString();
  const json = (await request(url, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/x-www-form-urlencoded" }),
    body,
  })) as RagicResponse;
  assertSuccess(json, path);
  return json;
}

// 寫入（JSON）：用於子表 {"_subtable_<id>":{"-1":{fieldId:value}}}
export async function ragicPostJson(
  path: string,
  body: Record<string, unknown>
): Promise<RagicResponse> {
  const url = `${RAGIC_BASE}/${path}?api`;
  const json = (await request(url, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  })) as RagicResponse;
  assertSuccess(json, path);
  return json;
}

// Ragic 回 HTTP 200 不等於成功；要看 status。INVALID/ERROR 都丟出含 msg 的錯誤。
function assertSuccess(json: RagicResponse, path: string) {
  const status = json.status;
  if (status && status !== "SUCCESS") {
    throw new Error(`Ragic 寫入 ${path} 失敗（${status}）：${json.msg || ""}`.trim());
  }
}
