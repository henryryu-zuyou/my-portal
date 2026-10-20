import type { Metadata } from "next";

// /statement 是 client component，metadata 只能寫在 layout
export const metadata: Metadata = {
  title: "代管表說明｜租寓 Zuyou",
  description: "貼上代管表連結，逐項說明這一期屋主應收怎麼算。",
  robots: { index: false, follow: false },
};

export default function StatementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
