import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Terminal | KOLMarket.ai",
  description: "AI chat, alpha signals, and Jupiter swaps. Trade with KOL mindshare on KOLMarket.ai.",
};

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
