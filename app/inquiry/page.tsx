"use client";
import { useState } from "react";

const initialForm = {
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
};

export default function InquiryPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">填寫完成！</h2>
          <p className="text-gray-500 text-sm mb-6">感謝 {form.name} 填寫資料，我們會盡快與您聯繫。</p>
          <div className="text-left bg-gray-50 rounded-lg p-4 text-sm space-y-2 text-gray-700">
            <p>📅 預計入住：{form.moveInDate}</p>
            <p>⏳ 租期：{form.leaseDuration}</p>
            <p>👥 大人人數：{form.adults} 人</p>
            <p>👶 小孩人數：{form.children} 人</p>
            <p>🐾 寵物：{form.hasPet}{form.petType ? `（${form.petType}）` : ""}</p>
            <p>💼 職業：{form.occupation}</p>
            <p>🚬 抽菸：{form.isSmoker}</p>
            <p>📄 需租補/入籍/報稅：{form.needSubsidy.join("、") || "未填寫"}</p>
            <p>💰 租金預算：NT$ {form.budget}</p>
            <p>🚗 汽車位：{form.needParking}</p>
          </div>
          <button
            onClick={() => { setForm(initialForm); setSubmitted(false); }}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            重新填寫
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-1">📋 房客詢問表單</h1>
        <p className="text-sm text-gray-500 mb-6">請填寫以下資訊，讓我們更了解您的需求</p>

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
              {["一年以下", "一年", "二年", "三年"].map(v => (
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
                <label className="block text-xs text-gray-500 mb-1">小孩</label>
                <select
                  name="children" required value={form.children} onChange={handleChange}
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
              placeholder="例：上班族、學生、自由業"
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition mt-2"
          >
            送出
          </button>
        </form>
      </div>
    </div>
  );
}
