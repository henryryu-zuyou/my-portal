import type { Metadata } from "next";

// 房客會開這頁，分頁名稱維持「預約看屋」，不跟首頁的「工作助手」
export const metadata: Metadata = {
  title: "預約看屋",
  description: "房客詢問與預約看屋表單",
};

export default function InquiryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
