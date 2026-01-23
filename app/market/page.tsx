"use client";

import { Navbar } from "@/components/Navbar";
import { KOLCardWithData } from "@/components/KOLCardWithData";

// Mock 数据作为降级方案
const mockKOLs = [
  {
    name: "Ansem",
    handle: "blknoiz06",
    fallbackData: {
      mindshareScore: 92,
      volume: "$2.4M",
      followers: "450K",
      stats: [
        { subject: "Volume", value: 95, fullMark: 100 },
        { subject: "Loyalty", value: 88, fullMark: 100 },
        { subject: "Alpha", value: 92, fullMark: 100 },
        { subject: "Growth", value: 85, fullMark: 100 },
        { subject: "Engage", value: 90, fullMark: 100 },
      ],
    },
  },
  {
    name: "Toly",
    handle: "aeyakovenko",
    fallbackData: {
      mindshareScore: 89,
      volume: "$1.8M",
      followers: "380K",
      stats: [
        { subject: "Volume", value: 88, fullMark: 100 },
        { subject: "Loyalty", value: 92, fullMark: 100 },
        { subject: "Alpha", value: 85, fullMark: 100 },
        { subject: "Growth", value: 90, fullMark: 100 },
        { subject: "Engage", value: 87, fullMark: 100 },
      ],
    },
  },
  {
    name: "CryptoWendyO",
    handle: "CryptoWendyO",
    fallbackData: {
      mindshareScore: 85,
      volume: "$1.2M",
      followers: "320K",
      stats: [
        { subject: "Volume", value: 82, fullMark: 100 },
        { subject: "Loyalty", value: 90, fullMark: 100 },
        { subject: "Alpha", value: 88, fullMark: 100 },
        { subject: "Growth", value: 83, fullMark: 100 },
        { subject: "Engage", value: 86, fullMark: 100 },
      ],
    },
  },
];

export default function MarketPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Market Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary relative overflow-hidden mt-20">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Alpha Market
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time influence tracking and Mindshare analysis.
              Find the agents with the highest conviction.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
                Powered by Cookie.fun Mindshare Index
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockKOLs.map((kol, idx) => (
              <KOLCardWithData
                key={idx}
                name={kol.name}
                handle={kol.handle}
                fallbackData={kol.fallbackData}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
