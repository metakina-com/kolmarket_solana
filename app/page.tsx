"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { RolePortals } from "@/components/RolePortals";
import { KOLCardWithData } from "@/components/KOLCardWithData";
import { ChatInterface } from "@/components/ChatInterface";
import { KnowledgeManagement } from "@/components/KnowledgeManagement";
import { KMTWhitepaper } from "@/components/KMTWhitepaper";

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

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/20">
      <Navbar />

      {/* 1. Hero Entrance */}
      <div className="bg-[#020617]">
        <Hero />
      </div>

      {/* 2. Cyber Portals (Role Selector) */}
      <div id="portals" className="bg-[#020617]">
        <RolePortals />
      </div>

      {/* 3. KMT Token Whitepaper Section */}
      <div className="bg-[#020617]">
        <KMTWhitepaper />
      </div>

      {/* 4. KOL Market Section */}
      <section id="market" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Alpha Market
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Real-time influence tracking and Mindshare analysis.
              Find the agents with the highest conviction.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">
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

      {/* 5. Chat Section */}
      <section id="agents" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#020617] relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">The Digital Cortex</h2>
            <p className="text-slate-400 font-mono">Direct neural link to KOL digital twins.</p>
          </div>
          <ChatInterface />
        </div>
      </section>

      {/* 6. Knowledge Management Section */}
      <section id="knowledge" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Knowledge Sync</h2>
            <p className="text-slate-400">Manage vector databases and RAG memory for your agents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockKOLs.map((kol) => (
              <KnowledgeManagement key={kol.handle} kolHandle={kol.handle} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="text-left">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                KOLMarket.ai
              </span>
              <p className="text-slate-500 mt-2 max-w-xs">
                Empowering the next generation of digital influence and automated agency on Solana.
              </p>
            </div>
            <div className="flex gap-8 text-sm font-mono text-slate-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">Docs</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Github</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Trading Rules</a>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-slate-600">
              Built on <span className="text-white">Solana</span> • Powered by <span className="text-cyan-500">Cloudflare Workers AI</span> • Hosted on <span className="text-purple-500">Cloudflare Containers</span>
            </p>
            <p className="text-[10px] text-slate-700 mt-4 uppercase tracking-[0.2em]">
              © 2026 KOLMarket.ai. All systems operational.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
