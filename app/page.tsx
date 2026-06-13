"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  };

  const options = [
    {
      href: "/inquiry",
      icon: "📋",
      title: "房客詢問表單",
      desc: "填寫看房需求與預約時段",
    },
    {
      href: "/links",
      icon: "🔗",
      title: "詢問連結產生器",
      desc: "選擇房源、產生專屬詢問連結",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">🏠</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">工作助手</h1>
        <p className="text-sm text-gray-500 mb-8">請選擇要使用的功能</p>

        <div className="flex flex-col gap-3">
          {options.map(o => (
            <button
              key={o.href}
              onClick={() => router.push(o.href)}
              className="w-full text-left border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-sm transition flex items-center gap-4"
            >
              <span className="text-2xl shrink-0">{o.icon}</span>
              <span className="min-w-0">
                <span className="block text-base font-semibold text-gray-800">{o.title}</span>
                <span className="block text-xs text-gray-500">{o.desc}</span>
              </span>
              <span className="ml-auto text-gray-300">›</span>
            </button>
          ))}
        </div>

        <button
          onClick={logout}
          className="mt-6 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          登出
        </button>
      </div>
    </div>
  );
}
