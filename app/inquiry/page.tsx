"use client";
import { useState, useEffect, memo } from "react";

const initialForm = {
  house: "",
  name: "",
  phone: "",
  lineId: "",
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
  source: "",
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

// 中文標題下方的英文翻譯（給外籍房客看）
const En = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-xs font-normal text-gray-400">{children}</span>
);

// 選項值（送出仍是中文）對應的英文，用在明細顯示
const VALUE_EN: Record<string, string> = {
  一年: "1 year", 二年: "2 years", 三年: "3 years",
  有: "Yes", 無: "No", 是: "Yes", 否: "No",
  需要: "Needed", 不需要: "Not needed",
  需要租補: "Rent subsidy", 需要入籍: "Household registration", 需要報稅: "Tax filing",
  "591": "591 website", 租寓官網: "Zuyou website", 其他: "Other",
};
const toEn = (v: string) => VALUE_EN[v] ?? v;

const Row = ({ zh, en, value, valueEn }: { zh: string; en: string; value: React.ReactNode; valueEn?: React.ReactNode }) => (
  <p>{zh}：{value}<En>{en}: {valueEn ?? value}</En></p>
);

// 填寫內容明細（送出前確認視窗、完成頁共用）
function FormSummary({ form, showName }: { form: typeof initialForm; showName?: boolean }) {
  return (
    <div className="text-left bg-gray-50 rounded-lg p-4 text-sm space-y-2 text-gray-700">
      {form.house && <Row zh="🏠 詢問物件" en="Property" value={form.house} />}
      {showName && <Row zh="🙋 稱呼" en="Name" value={form.name} />}
      <Row zh="📞 電話號碼" en="Phone" value={form.phone} />
      {form.lineId && <Row zh="💬 LINE 名稱" en="LINE name" value={form.lineId} />}
      <Row zh="📅 預計入住" en="Move-in date" value={form.moveInDate} />
      <Row zh="⏳ 租期" en="Lease length" value={form.leaseDuration} valueEn={toEn(form.leaseDuration)} />
      <Row zh="👥 大人人數" en="Adults" value={`${form.adults} 人`} valueEn={form.adults} />
      <Row zh="👶 小孩人數" en="Children" value={`${form.children || 0} 人`} valueEn={form.children || 0} />
      <Row
        zh="🐾 寵物" en="Pets"
        value={`${form.hasPet}${form.petType ? `（${form.petType}）` : ""}`}
        valueEn={`${toEn(form.hasPet)}${form.petType ? ` (${form.petType})` : ""}`}
      />
      <Row zh="💼 職業" en="Occupation" value={form.occupation} />
      <Row zh="🚬 抽菸" en="Smoker" value={form.isSmoker} valueEn={toEn(form.isSmoker)} />
      <Row
        zh="📄 需租補/入籍/報稅" en="Subsidy / registration / tax"
        value={form.needSubsidy.join("、") || "未填寫"}
        valueEn={form.needSubsidy.map(toEn).join(", ") || "Not filled"}
      />
      <Row zh="💰 租金預算" en="Rent budget" value={`NT$ ${form.budget}`} />
      <Row zh="🚗 汽車位" en="Parking space" value={form.needParking} valueEn={toEn(form.needParking)} />
      {([1, 2, 3] as const).map(n => {
        const v = form[`viewingSlot${n}`];
        return <Row key={n} zh={`🗓 看房時間 ${n}`} en={`Viewing time ${n}`} value={formatDateTime(v)} valueEn={v ? formatDateTime(v) : "Not filled"} />;
      })}
      {form.note && <Row zh="📝 其他說明" en="Notes" value={form.note} />}
      <Row zh="📣 如何得知此房源" en="Heard about us via" value={form.source} valueEn={toEn(form.source)} />
    </div>
  );
}

// 手機 webview（如 LINE 內建瀏覽器）常沒有網址列，補一個返回／分享連結的工具列
// memo：工具列不吃 props，用 memo 避免每次表單輸入都連帶 re-render
const PageToolbar = memo(function PageToolbar() {
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
    <div className="fixed top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
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
});

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
          <p className="text-sm text-gray-500 mb-2">Submitted successfully!</p>
          <p className="text-gray-500 text-sm">感謝 {form.name} 填寫資料，我們會盡快與您聯繫。</p>
          <p className="text-xs text-gray-400 mb-6">Thank you, {form.name}. We will contact you shortly.</p>
          <FormSummary form={form} />
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
            重新填寫<span className="block text-xs font-normal text-blue-100">Fill in again</span>
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
        <p className="text-sm text-gray-500 mb-1">Rental Inquiry Form</p>
        <p className="text-sm text-gray-500">請填寫以下資訊，讓我們更了解您的需求</p>
        <p className="text-xs text-gray-400 mb-4">Please fill in the information below so we can better understand your needs.</p>

        {form.house && (
          <div className="mb-6 inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
            🏠 詢問物件 Property：{form.house}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 稱呼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">請問怎麼稱呼？ *<En>How should we address you?</En></label>
            <input
              name="name" required value={form.name} onChange={handleChange}
              placeholder="例：王先生 / 陳小姐 (e.g. Mr. Wang)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 電話號碼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話號碼 *<En>Phone number</En></label>
            <input
              type="tel" name="phone" required value={form.phone} onChange={handleChange}
              placeholder="例 e.g. 0912345678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* LINE 顯示名稱（選填，用來對應 LINE 聊天室） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LINE 顯示名稱<En>LINE display name</En></label>
            <input
              name="lineId" value={form.lineId} onChange={handleChange}
              placeholder="例 e.g. 王小美、Amy 🌸"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">已加 LINE 請填名稱；從 591 等管道詢問者可留空<span className="block">If you have added us on LINE, enter your display name; otherwise leave blank.</span></p>
          </div>

          {/* 入住日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1. 預計入住日期 *<En>Expected move-in date</En></label>
            <input
              type="date" name="moveInDate" required value={form.moveInDate} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 租期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">2. 預計租期多久？ *<En>Expected lease length</En></label>
            <div className="flex flex-col gap-2">
              {[["一年", "1 year"], ["二年", "2 years"], ["三年", "3 years"]].map(([v, en]) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="leaseDuration" value={v} checked={form.leaseDuration === v} onChange={handleChange} required />
                  <span>{v}<En>{en}</En></span>
                </label>
              ))}
            </div>
          </div>

          {/* 租屋人數 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3. 租屋人數 *<En>Number of occupants</En></label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">大人<En>Adults</En></label>
                <select
                  name="adults" required value={form.adults} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">請選擇 Select</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} 人</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">小孩（選填）<En>Children (optional)</En></label>
                <select
                  name="children" value={form.children} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">請選擇 Select</option>
                  {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} 人</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 寵物 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">4. 是否有寵物？ *<En>Do you have pets?</En></label>
            <div className="flex gap-4 mb-2">
              {[["有", "Yes"], ["無", "No"]].map(([v, en]) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="hasPet" value={v} checked={form.hasPet === v} onChange={handleChange} required />
                  <span>{v}<En>{en}</En></span>
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
            {form.hasPet === "有" && <p className="text-xs text-gray-400 mt-1">Please enter the type of pet (e.g. cat, dog)</p>}
          </div>

          {/* 職業 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">5. 職業 *<En>Occupation</En></label>
            <input
              name="occupation" required value={form.occupation} onChange={handleChange}
              placeholder="例：長庚護理師 / 科技業工程師 / 製造業生管"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">e.g. Nurse at Chang Gung Hospital / Tech engineer / Production planner</p>
          </div>

          {/* 抽菸 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">6. 是否抽菸？ *<En>Do you smoke?</En></label>
            <div className="flex gap-4">
              {[["是", "Yes"], ["否", "No"]].map(([v, en]) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="isSmoker" value={v} checked={form.isSmoker === v} onChange={handleChange} required />
                  <span>{v}<En>{en}</En></span>
                </label>
              ))}
            </div>
          </div>

          {/* 租補/入籍/報稅 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">7. 是否需要租補 / 入籍 / 報稅？ *<En>Do you need rent subsidy / household registration / tax filing?</En></label>
            <div className="flex flex-col gap-2">
              {/* 不需要 — 單選 */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={form.needSubsidy.includes("不需要")}
                  onChange={() => handleSubsidyChange("不需要")}
                  required={form.needSubsidy.length === 0}
                />
                <span>不需要<En>Not needed</En></span>
              </label>
              {/* 其他三項 — 多選 */}
              {[["需要租補", "Rent subsidy"], ["需要入籍", "Household registration"], ["需要報稅", "Tax filing"]].map(([v, en]) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.needSubsidy.includes(v)}
                    onChange={() => handleSubsidyChange(v)}
                  />
                  <span>{v}<En>{en}</En></span>
                </label>
              ))}
            </div>
          </div>

          {/* 租金預算 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">8. 租金預算 *<En>Monthly rent budget</En></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">NT$</span>
              <input
                type="number" name="budget" required value={form.budget} onChange={handleChange}
                placeholder="例 e.g. 18000"
                min="0"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 汽車位 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">9. 是否需要汽車位？ *<En>Do you need a car parking space?</En></label>
            <div className="flex gap-4">
              {[["需要", "Yes"], ["不需要", "No"]].map(([v, en]) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="needParking" value={v} checked={form.needParking === v} onChange={handleChange} required />
                  <span>{v}<En>{en}</En></span>
                </label>
              ))}
            </div>
          </div>

          {/* 預約看房時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">10. 預約看房時間 *<En>Preferred viewing times</En></label>
            <p className="text-xs text-gray-400 mb-3">請提供三個方便的時段（至少填寫一個）<span className="block">Please provide up to three convenient time slots (at least one).</span></p>
            <div className="flex flex-col gap-3">
              {([
                { label: "時段 1", en: "Slot 1", name: "viewingSlot1", required: true },
                { label: "時段 2", en: "Slot 2", name: "viewingSlot2", required: false },
                { label: "時段 3", en: "Slot 3", name: "viewingSlot3", required: false },
              ] as const).map(({ label, en, name, required }) => (
                <div key={name}>
                  <label className="block text-xs text-gray-500 mb-1">{label}{required ? " *" : "（選填）"}<En>{en}{required ? "" : " (optional)"}</En></label>
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
                      <option value="">時間 Time</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">11. 其他說明（選填）<En>Other notes (optional)</En></label>
            <textarea
              name="note" value={form.note} onChange={handleChange} rows={3}
              placeholder="有其他需求或想補充的資訊，歡迎填寫"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">Feel free to add any other needs or information.</p>
          </div>

          {/* 如何得知此房源 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">12. 如何得知此房源？ *<En>How did you hear about this property?</En></label>
            <div className="flex flex-col gap-2">
              {[["591", "591 website"], ["租寓官網", "Zuyou website"], ["其他", "Other"]].map(([v, en]) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="source" value={v} checked={form.source === v} onChange={handleChange} required />
                  <span>{v}<En>{en}</En></span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition mt-2"
          >
            送出 Submit
          </button>
        </form>
      </div>

      {/* 送出前確認視窗 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-1">請確認填寫內容</h2>
            <p className="text-sm text-gray-500 mb-1">Please confirm your information</p>
            <p className="text-xs text-gray-500">確認無誤後按「確定送出」，需修改請按「返回修改」</p>
            <p className="text-xs text-gray-400 mb-4">Tap "Confirm" if everything is correct, or "Edit" to make changes.</p>
            <FormSummary form={form} showName />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                返回修改<En>Edit</En>
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                確定送出<span className="block text-xs font-normal text-blue-100">Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
