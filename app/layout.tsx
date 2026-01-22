import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { ClientWalletProvider } from "@/components/providers/ClientWalletProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KOLMarket.ai - Price the Human, Empower the Agent",
  description: "The 1st Identity Layer for AI Agents on Solana",
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
            {children}
          </ClientWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
