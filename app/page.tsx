"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { KOLCardWithData } from "@/components/KOLCardWithData";
import { ChatInterface } from "@/components/ChatInterface";
import { KnowledgeManagement } from "@/components/KnowledgeManagement";

// Mock 数据作为降级方案（当 API 不可用时使用）
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

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />

      {/* KOL Market Section */}
      <section id="market" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Top KOLs
          </h2>
          <p className="text-center text-slate-400 mb-12">
            Discover the most influential voices in crypto
            <span className="block text-xs text-slate-500 mt-2">
              Powered by Cookie.fun Mindshare Index
            </span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Chat Section */}
      <section id="agents" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto space-y-8">
          <ChatInterface />
        </div>
      </section>

      {/* Knowledge Management Section */}
      <section id="knowledge" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Knowledge Base Management
          </h2>
          <p className="text-center text-slate-400 mb-12">
            Manage knowledge base for KOL digital lives
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockKOLs.map((kol) => (
              <KnowledgeManagement key={kol.handle} kolHandle={kol.handle} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-4">
            Built on Solana • Powered by Cloudflare Workers AI
          </p>
          <p className="text-sm text-slate-500">
            © 2026 KOLMarket.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
