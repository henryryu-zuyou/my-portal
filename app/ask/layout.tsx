import type { Metadata } from "next";

// /ask 是 client component，metadata 只能寫在 layout
export const metadata: Metadata = {
  title: "屋主問答｜租寓 Zuyou",
  description: "把問題直接打出來，從租寓整理的 37 題屋主常見問題裡找答案：租金、稅務、房客風險、修繕、合約。",
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
