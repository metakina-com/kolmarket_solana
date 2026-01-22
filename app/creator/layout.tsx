import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Portal | KOLMarket.ai",
  description: "Manage your digital twin, neural tuning, and revenue as a KOL on KOLMarket.ai.",
};

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
