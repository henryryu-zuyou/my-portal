"use client";
import dynamic from "next/dynamic";

// 這頁全靠瀏覽器 API（Canvas、File、localStorage），沒有任何值得 SSR 的內容。
// 關掉預渲染後，元件內可直接用 lazy initializer 讀 localStorage 與今天日期，
// 不必繞 useEffect，也不會有 hydration 不一致。
const WatermarkTool = dynamic(() => import("./WatermarkTool"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl mx-auto">
        <p className="text-sm text-gray-400">載入中…</p>
      </div>
    </div>
  ),
});

export default function WatermarkPage() {
  return <WatermarkTool />;
}
