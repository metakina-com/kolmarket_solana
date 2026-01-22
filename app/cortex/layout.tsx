import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Cortex | KOLMarket.ai",
  description: "Inject and manage training datasets for your project's AI agents on KOLMarket.ai.",
};

export default function CortexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
