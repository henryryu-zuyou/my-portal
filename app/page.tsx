"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🏠</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">工作入口</h1>
        <p className="text-sm text-gray-500 mb-6">測試專案</p>
        <button
          onClick={() => router.push("/inquiry")}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          📋 房客詢問表單
        </button>
      </div>
    </div>
  );
}
