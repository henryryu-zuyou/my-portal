import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /daiguan、/faq 這種好記的網址，實際指向 public/ 底下的靜態頁（公開，免登入）
  async rewrites() {
    return [
      { source: "/daiguan", destination: "/daiguan-vs-shezhai.html" },
      { source: "/faq", destination: "/landlord-faq.html" },
    ];
  },
};

export default nextConfig;
