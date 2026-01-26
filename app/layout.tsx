import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { ClientWalletProvider } from "@/components/providers/ClientWalletProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KOLMarket.ai - Price the Human, Empower the Agent",
  description: "The 1st Identity Layer for AI Agents on Solana",
  other: {
    "virtual-protocol-site-verification": "51f5f7d29fbb5c62f9882af581b56109",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ClientWalletProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ClientWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
