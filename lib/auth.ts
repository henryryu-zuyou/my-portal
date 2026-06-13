// 共用的登入驗證工具：白名單比對 + 簽章 cookie（Edge / Node 皆可用 Web Crypto）

export const SESSION_COOKIE = "session";
const SESSION_TTL_SEC = 7 * 24 * 60 * 60; // 7 天

// 只留數字，方便電話比對（去掉空格/破折號/+886 等差異）
export function normalizePhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  // 09xxxxxxxx 與 +8869xxxxxxxx 視為相同
  return digits.replace(/^886/, "0");
}

type AllowEntry = { email: string; phone: string };

// 從環境變數 ALLOWED_USERS 解析白名單，格式：email:phone,email:phone
// 例：henryryu@zuyou.com.tw:0912345678,other@zuyou.com.tw:0922333444
export function getAllowlist(): AllowEntry[] {
  const raw = process.env.ALLOWED_USERS || "";
  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.lastIndexOf(":");
      const email = pair.slice(0, idx).trim().toLowerCase();
      const phone = normalizePhone(pair.slice(idx + 1));
      return { email, phone };
    })
    .filter((e) => e.email && e.phone);
}

// 比對 email + 電話是否在白名單
export function isAllowed(email: string, phone: string): boolean {
  const e = (email || "").trim().toLowerCase();
  const p = normalizePhone(phone);
  return getAllowlist().some((a) => a.email === e && a.phone === p);
}

// --- 簽章 cookie ---

const encoder = new TextEncoder();

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToStr(b64: string): string {
  const pad = b64.replace(/-/g, "+").replace(/_/g, "/");
  return atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
}

async function hmac(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || "";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return b64urlEncode(new Uint8Array(sig));
}

// 建立 session token：payload(base64).簽章
export async function createSession(email: string): Promise<string> {
  const payload = { email: email.trim().toLowerCase(), exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC };
  const body = b64urlEncode(encoder.encode(JSON.stringify(payload)));
  const sig = await hmac(body);
  return `${body}.${sig}`;
}

// 驗證 token，回傳 email 或 null
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = await hmac(body);
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(b64urlToStr(body)) as { email: string; exp: number };
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.email || null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_TTL_SEC;
