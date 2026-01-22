"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { RolePortals } from "@/components/RolePortals";
import { KOLCardWithData } from "@/components/KOLCardWithData";
import { ChatInterface } from "@/components/ChatInterface";
import { KnowledgeManagement } from "@/components/KnowledgeManagement";
import { KMTWhitepaper } from "@/components/KMTWhitepaper";
import { Twitter, MessageCircle, Users, BookOpen, FileText, Code, TrendingUp, Database, Rocket } from "lucide-react";

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
    <main className="min-h-screen bg-background text-foreground selection:bg-cyan-500/20">
      <Navbar />

      {/* 1. Hero Entrance */}
      <div className="bg-background">
        <Hero />
      </div>

      {/* 2. Cyber Portals (Role Selector) */}
      <div id="portals" className="bg-background">
        <RolePortals />
      </div>

      {/* 3. KMT Token Whitepaper Section */}
      <div className="bg-background">
        <KMTWhitepaper />
      </div>

      {/* 4. KOL Market Section */}
      <section id="market" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Alpha Market
            </h2>
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

      {/* 5. Chat Section */}
      <section id="agents" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">The Digital Cortex</h2>
            <p className="text-muted-foreground font-mono">Direct neural link to KOL digital twins.</p>
          </div>
          <ChatInterface />
        </div>
      </section>

      {/* 6. Knowledge Management Section */}
      <section id="knowledge" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Knowledge Sync</h2>
            <p className="text-muted-foreground">Manage vector databases and RAG memory for your agents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockKOLs.map((kol) => (
              <KnowledgeManagement key={kol.handle} kolHandle={kol.handle} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Documentation Section */}
      <section id="docs" className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              Documentation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete guides, API documentation, and resources to help you build on KOLMarket.ai
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Project Summary */}
            <a
              href="https://github.com/metakina-com/kolmarket_solana/blob/main/PROJECT_SUMMARY_2024.md"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all"
            >
              <div className="p-3 bg-cyan-500/10 rounded-xl w-fit mb-4 group-hover:bg-cyan-500/20 transition-colors">
                <FileText className="text-cyan-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">项目总结</h3>
              <p className="text-sm text-muted-foreground mb-4">
                完整项目总结、业务功能和技术架构说明。
              </p>
              <span className="text-xs text-cyan-400 font-mono group-hover:underline">查看总结 →</span>
            </a>

            {/* API Documentation */}
            <a
              href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/API_DOCUMENTATION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all"
            >
              <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Code className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">API Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete API reference with endpoints, request/response formats, and examples.
              </p>
              <span className="text-xs text-purple-400 font-mono group-hover:underline">View Docs →</span>
            </a>

            {/* Railway Deployment */}
            <a
              href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/RAILWAY_DEPLOY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all"
            >
              <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4 group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Railway 部署</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Railway 容器部署完整指南，包含所有配置步骤。
              </p>
              <span className="text-xs text-green-400 font-mono group-hover:underline">部署指南 →</span>
            </a>

            {/* User Guide */}
            <a
              href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/USER_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all"
            >
              <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
                <BookOpen className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">User Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Step-by-step guide for KOLs, investors, and project teams.
              </p>
              <span className="text-xs text-blue-400 font-mono group-hover:underline">Read Guide →</span>
            </a>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {/* Business Model */}
            <a
              href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/BUSINESS_MODEL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all"
            >
              <div className="p-3 bg-yellow-500/10 rounded-xl w-fit mb-4 group-hover:bg-yellow-500/20 transition-colors">
                <TrendingUp className="text-yellow-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Business Model</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revenue models, pricing, and value distribution strategies.
              </p>
              <span className="text-xs text-yellow-400 font-mono group-hover:underline">Learn More →</span>
            </a>

            {/* Data Interfaces */}
            <a
              href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/DATA_INTERFACES.md"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all"
            >
              <div className="p-3 bg-indigo-500/10 rounded-xl w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors">
                <Database className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Data Interfaces</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Database schemas, data formats, and external API integrations.
              </p>
              <span className="text-xs text-indigo-400 font-mono group-hover:underline">View Schema →</span>
            </a>

            {/* Testing Guide */}
            <a
              href="https://github.com/metakina-com/kolmarket_solana/blob/main/TESTING_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all"
            >
              <div className="p-3 bg-pink-500/10 rounded-xl w-fit mb-4 group-hover:bg-pink-500/20 transition-colors">
                <Code className="text-pink-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">测试指南</h3>
              <p className="text-sm text-muted-foreground mb-4">
                完整测试指南，包含所有机器人插件的测试方法。
              </p>
              <span className="text-xs text-pink-400 font-mono group-hover:underline">测试指南 →</span>
            </a>

            {/* Documentation Center */}
            <a
              href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/30 transition-all"
            >
              <div className="p-3 bg-teal-500/10 rounded-xl w-fit mb-4 group-hover:bg-teal-500/20 transition-colors">
                <FileText className="text-teal-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">文档中心</h3>
              <p className="text-sm text-muted-foreground mb-4">
                所有文档索引，按功能分类，快速找到需要的文档。
              </p>
              <span className="text-xs text-teal-400 font-mono group-hover:underline">查看全部 →</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">More documentation available on GitHub</p>
            <a
              href="https://github.com/metakina-com/kolmarket_solana/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-accent border border-border hover:border-cyan-500/30 rounded-xl text-foreground font-bold transition-all"
            >
              <FileText size={18} />
              View All Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="text-left">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                KOLMarket.ai
              </span>
              <p className="text-muted-foreground mt-2 max-w-xs">
                Empowering the next generation of digital influence and automated agency on Solana.
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex flex-wrap gap-6 text-sm font-mono text-muted-foreground">
                <a 
                  href="https://github.com/metakina-com/kolmarket_solana/tree/main/docs" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                >
                  Docs
                </a>
                <a 
                  href="https://github.com/metakina-com/kolmarket_solana" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                >
                  GitHub
                </a>
                <a 
                  href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/API_DOCUMENTATION.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                >
                  API
                </a>
                <a 
                  href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/USER_GUIDE.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                >
                  Guide
                </a>
                <a 
                  href="https://github.com/metakina-com/kolmarket_solana/blob/main/docs/BUSINESS_MODEL.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                >
                  Business
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://x.com/KOLMARKET"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-accent/50 rounded-lg border border-border hover:border-cyan-500/30 transition-all"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://t.me/kolmarketai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-accent/50 rounded-lg border border-border hover:border-cyan-500/30 transition-all"
                  aria-label="Telegram"
                >
                  <MessageCircle size={18} />
                </a>
                <a
                  href="https://discord.com/channels/1433748708255727640/1463848664001937533"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-accent/50 rounded-lg border border-border hover:border-cyan-500/30 transition-all"
                  aria-label="Discord"
                >
                  <Users size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Built on <span className="text-foreground">Solana</span> • Powered by <span className="text-cyan-500">Cloudflare Workers AI</span> • Hosted on <span className="text-purple-500">Cloudflare Containers</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em]">
              © 2026 KOLMarket.ai. All systems operational.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
