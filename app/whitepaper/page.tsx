"use client";

import { Navbar } from "@/components/Navbar";
import { KMTWhitepaper } from "@/components/KMTWhitepaper";

export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <KMTWhitepaper />
    </main>
  );
}
