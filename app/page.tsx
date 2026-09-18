"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
  };

  const options: {
    href: string;
    icon: string;
    title: string;
    desc: string;
    external?: boolean;
  }[] = [
    {
      href: "/listing",
      icon: "🏢",
      title: "官網上架",
      desc: "上傳 PDF／照片，產生上架資料包",
    },
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
    {
      href: "/rent-tax",
      icon: "🧮",
      title: "房東租賃所得稅試算",
      desc: "比較四種身分的年度應繳稅額",
    },
    {
      href: "/watermark",
      icon: "🔒",
      title: "機密文件浮水印",
      desc: "權狀、契約影本蓋浮水印；免登入，照片不上傳",
    },
    {
      href: "/daiguan",
      icon: "⚖️",
      title: "一般代管 vs 社宅代管",
      desc: "逐項比較，依房子條件給建議",
      external: true, // public/ 靜態頁，要整頁導向而非 client 路由
    },
    {
      href: "/ask",
      icon: "💬",
      title: "屋主問答（對話式）",
      desc: "屋主打字提問，從 37 題 FAQ 找答案；公開連結",
    },
    {
      href: "/faq",
      icon: "📖",
      title: "屋主常見問題 FAQ",
      desc: "37 題代管／包租對照，公開連結可直接傳給屋主",
      external: true, // public/ 靜態頁，免登入即可開
    },
    {
      href: "/faq-diagrams",
      icon: "🗺️",
      title: "屋主常見問題 圖解",
      desc: "FAQ 裡最難用文字講清楚的 11 題，一題一張圖；公開連結",
      external: true, // public/ 靜態頁，免登入即可開
    },
    {
      href: "/daiguan/guide",
      icon: "🧮",
      title: "代管建議計分表（內部）",
      desc: "/daiguan 五題問卷的計分方式與談案注意事項",
      external: true, // route handler 回傳 HTML，整頁開啟
    },
    // 暫時隱藏，功能與 /scrm 頁面程式碼保留，要恢復把這段取消註解即可
    // {
    //   href: "/scrm",
    //   icon: "👤",
    //   title: "SCRM 補 UID／改名",
    //   desc: "每週一/四：補 LINE UID＋改真實姓名",
    // },
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
              onClick={() =>
                o.external ? window.open(o.href, "_blank") : router.push(o.href)
              }
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
