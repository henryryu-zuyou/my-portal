"use client";
import { useState, useEffect } from "react";

const initialForm = {
  house: "",
  name: "",
  moveInDate: "",
  leaseDuration: "",
  adults: "",
  children: "",
  hasPet: "",
  petType: "",
  occupation: "",
  isSmoker: "",
  needSubsidy: [] as string[],
  budget: "",
  needParking: "",
  viewingSlot1: "",
  viewingSlot2: "",
  viewingSlot3: "",
  note: "",
};

// 看房時間下拉選項：08:00 ~ 23:00，每 30 分鐘一個
const TIME_OPTIONS: string[] = [];
for (let h = 8; h <= 23; h++) {
  for (const m of ["00", "30"]) {
    if (h === 23 && m === "30") break;
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${m}`);
  }
}

const formatDateTime = (val: string) => {
  if (!val) return "未填寫";
  const d = new Date(val);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
};

// 手機 webview（如 LINE 內建瀏覽器）常沒有網址列，補一個返回／分享連結的工具列
function PageToolbar() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "房客詢問表單", url });
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") await copyToClipboard(url);
      }
      return;
    }
    await copyToClipboard(url);
  };

  return (
    <div className="fixed top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur border-b border-gray-200">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        ← 返回
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        {copied ? "已複製連結" : "🔗 分享連結"}
      </button>
    </div>
  );
}

export default function InquiryPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // 送出前確認視窗
  const [todayStr, setTodayStr] = useState(""); // 今日日期，限制看房日期不能選過去
  // 看房時段拆成「日期 + 時間」兩格，再合併成 viewingSlotN 的 datetime 字串
  const [slotParts, setSlotParts] = useState({
    viewingSlot1: { date: "", time: "" },
    viewingSlot2: { date: "", time: "" },
    viewingSlot3: { date: "", time: "" },
  });

  const updateSlot = (name: keyof typeof slotParts, field: "date" | "time", value: string) => {
    setSlotParts(prev => {
      const next = { ...prev, [name]: { ...prev[name], [field]: value } };
      const { date, time } = next[name];
      setForm(f => ({ ...f, [name]: date && time ? `${date}T${time}` : "" }));
      return next;
    });
  };

  // 從網址 ?house=房號 自動帶入詢問物件，房客不需手動填寫；並設定今日日期
  useEffect(() => {
    const house = new URLSearchParams(window.location.search).get("house");
    if (house) setForm(prev => ({ ...prev, house }));
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    setTodayStr(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === "hasPet" && value === "無" ? { petType: "" } : {}),
    }));
  };

  const handleSubsidyChange = (value: string) => {
    setForm(prev => {
      if (value === "不需要") return { ...prev, needSubsidy: ["不需要"] };
      const current = prev.needSubsidy.filter(v => v !== "不需要");
      if (current.includes(value)) {
        return { ...prev, needSubsidy: current.filter(v => v !== value) };
      }
      return { ...prev, needSubsidy: [...current, value] };
    });
  };

  // 按送出 → 先彈出確認視窗（此時原生必填驗證已通過）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // 確認視窗按「確定送出」→ 真正送出
  const doSubmit = () => {
    setShowConfirm(false);
    setSubmitted(true);
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-14 px-4">
        <PageToolbar />
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">填寫完成！</h2>
          <p className="text-gray-500 text-sm mb-6">感謝 {form.name} 填寫資料，我們會盡快與您聯繫。</p>
          <div className="text-left bg-gray-50 rounded-lg p-4 text-sm space-y-2 text-gray-700">
            {form.house && <p>🏠 詢問物件：{form.house}</p>}
            <p>📅 預計入住：{form.moveInDate}</p>
            <p>⏳ 租期：{form.leaseDuration}</p>
            <p>👥 大人人數：{form.adults} 人</p>
            <p>👶 小孩人數：{form.children || 0} 人</p>
            <p>🐾 寵物：{form.hasPet}{form.petType ? `（${form.petType}）` : ""}</p>
            <p>💼 職業：{form.occupation}</p>
            <p>🚬 抽菸：{form.isSmoker}</p>
            <p>📄 需租補/入籍/報稅：{form.needSubsidy.join("、") || "未填寫"}</p>
            <p>💰 租金預算：NT$ {form.budget}</p>
            <p>🚗 汽車位：{form.needParking}</p>
            <p>🗓 看房時間 1：{formatDateTime(form.viewingSlot1)}</p>
            <p>🗓 看房時間 2：{formatDateTime(form.viewingSlot2)}</p>
            <p>🗓 看房時間 3：{formatDateTime(form.viewingSlot3)}</p>
            {form.note && <p>📝 其他說明：{form.note}</p>}
          </div>
          <button
            onClick={() => {
              setForm({ ...initialForm, house: form.house });
              setSlotParts({
                viewingSlot1: { date: "", time: "" },
                viewingSlot2: { date: "", time: "" },
                viewingSlot3: { date: "", time: "" },
              });
              setSubmitted(false);
            }}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            重新填寫
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10 px-4">
      <PageToolbar />
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-1">📋 房客詢問表單</h1>
        <p className="text-sm text-gray-500 mb-4">請填寫以下資訊，讓我們更了解您的需求</p>

        {form.house && (
          <div className="mb-6 inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
            🏠 詢問物件：{form.house}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 稱呼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">請問怎麼稱呼？ *</label>
            <input
              name="name" required value={form.name} onChange={handleChange}
              placeholder="例：王先生 / 陳小姐"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 入住日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1. 預計入住日期 *</label>
            <input
              type="date" name="moveInDate" required value={form.moveInDate} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 租期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">2. 預計租期多久？ *</label>
            <div className="flex flex-col gap-2">
              {["一年", "二年", "三年"].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="leaseDuration" value={v} checked={form.leaseDuration === v} onChange={handleChange} required />
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* 租屋人數 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3. 租屋人數 *</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">大人</label>
                <select
                  name="adults" required value={form.adults} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">請選擇</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} 人</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">小孩（選填）</label>
                <select
                  name="children" value={form.children} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">請選擇</option>
                  {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} 人</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 寵物 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">4. 是否有寵物？ *</label>
            <div className="flex gap-4 mb-2">
              {["有", "無"].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="hasPet" value={v} checked={form.hasPet === v} onChange={handleChange} required />
                  {v}
                </label>
              ))}
            </div>
            {form.hasPet === "有" && (
              <input
                name="petType" required value={form.petType} onChange={handleChange}
                placeholder="請填寫寵物種類（例：貓、狗）"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* 職業 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">5. 職業 *</label>
            <input
              name="occupation" required value={form.occupation} onChange={handleChange}
              placeholder="例：科技業工程師 / 醫院護理師 / 餐飲業服務生"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 抽菸 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">6. 是否抽菸？ *</label>
            <div className="flex gap-4">
              {["是", "否"].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="isSmoker" value={v} checked={form.isSmoker === v} onChange={handleChange} required />
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* 租補/入籍/報稅 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">7. 是否需要租補 / 入籍 / 報稅？ *</label>
            <div className="flex flex-col gap-2">
              {/* 不需要 — 單選 */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={form.needSubsidy.includes("不需要")}
                  onChange={() => handleSubsidyChange("不需要")}
                  required={form.needSubsidy.length === 0}
                />
                不需要
              </label>
              {/* 其他三項 — 多選 */}
              {["需要租補", "需要入籍", "需要報稅"].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.needSubsidy.includes(v)}
                    onChange={() => handleSubsidyChange(v)}
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* 租金預算 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">8. 租金預算 *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">NT$</span>
              <input
                type="number" name="budget" required value={form.budget} onChange={handleChange}
                placeholder="例：18000"
                min="0"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 汽車位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">9. 是否需要汽車位？ *</label>
            <div className="flex gap-4">
              {["需要", "不需要"].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="needParking" value={v} checked={form.needParking === v} onChange={handleChange} required />
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* 預約看房時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">10. 預約看房時間 *</label>
            <p className="text-xs text-gray-400 mb-3">請提供三個方便的時段（至少填寫一個）</p>
            <div className="flex flex-col gap-3">
              {([
                { label: "時段 1", name: "viewingSlot1", required: true },
                { label: "時段 2", name: "viewingSlot2", required: false },
                { label: "時段 3", name: "viewingSlot3", required: false },
              ] as const).map(({ label, name, required }) => (
                <div key={name}>
                  <label className="block text-xs text-gray-500 mb-1">{label}{required ? " *" : "（選填）"}</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required={required}
                      value={slotParts[name].date}
                      min={todayStr}
                      onChange={e => updateSlot(name, "date", e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      required={required}
                      value={slotParts[name].time}
                      onChange={e => updateSlot(name, "time", e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">時間</option>
                      {TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 其他說明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">11. 其他說明（選填）</label>
            <textarea
              name="note" value={form.note} onChange={handleChange} rows={3}
              placeholder="有其他需求或想補充的資訊，歡迎填寫"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition mt-2"
          >
            送出
          </button>
        </form>
      </div>

      {/* 送出前確認視窗 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-1">請確認填寫內容</h2>
            <p className="text-xs text-gray-500 mb-4">確認無誤後按「確定送出」，需修改請按「返回修改」</p>
            <div className="text-left bg-gray-50 rounded-lg p-4 text-sm space-y-2 text-gray-700">
              {form.house && <p>🏠 詢問物件：{form.house}</p>}
              <p>🙋 稱呼：{form.name}</p>
              <p>📅 預計入住：{form.moveInDate}</p>
              <p>⏳ 租期：{form.leaseDuration}</p>
              <p>👥 大人人數：{form.adults} 人</p>
              <p>👶 小孩人數：{form.children || 0} 人</p>
              <p>🐾 寵物：{form.hasPet}{form.petType ? `（${form.petType}）` : ""}</p>
              <p>💼 職業：{form.occupation}</p>
              <p>🚬 抽菸：{form.isSmoker}</p>
              <p>📄 需租補/入籍/報稅：{form.needSubsidy.join("、") || "未填寫"}</p>
              <p>💰 租金預算：NT$ {form.budget}</p>
              <p>🚗 汽車位：{form.needParking}</p>
              <p>🗓 看房時間 1：{formatDateTime(form.viewingSlot1)}</p>
              <p>🗓 看房時間 2：{formatDateTime(form.viewingSlot2)}</p>
              <p>🗓 看房時間 3：{formatDateTime(form.viewingSlot3)}</p>
              {form.note && <p>📝 其他說明：{form.note}</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                返回修改
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                確定送出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
