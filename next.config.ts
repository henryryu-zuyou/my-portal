import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /daiguan 這種好記的網址，實際指向 public/ 底下的靜態比較頁
  async rewrites() {
    return [{ source: "/daiguan", destination: "/daiguan-vs-shezhai.html" }];
  },
};

export default nextConfig;
