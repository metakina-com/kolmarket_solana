"use client";

import { Navbar } from "@/components/Navbar";
import { KnowledgeManagement } from "@/components/KnowledgeManagement";
import { getAvailableKOLs } from "@/lib/agents/kol-personas";
import { motion } from "framer-motion";
import { Database, Search } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function KnowledgePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const allKOLs = getAvailableKOLs();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null);

  useEffect(() => {
    const urlKOL = searchParams.get("kol");
    if (urlKOL && urlKOL !== selectedKOL) {
      setSelectedKOL(urlKOL);
    }
  }, [searchParams, selectedKOL]);

  const filteredKOLs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allKOLs;
    return allKOLs.filter(
      (kol) => kol.name.toLowerCase().includes(q) || kol.handle.toLowerCase().includes(q)
    );
  }, [allKOLs, searchQuery]);

  const selectedExists = selectedKOL ? allKOLs.some((k) => k.handle === selectedKOL) : false;
  const effectiveSelectedKOL = selectedExists ? selectedKOL : null;

  const selectAndPersist = (handle: string) => {
    setSelectedKOL(handle);
    const params = new URLSearchParams(searchParams.toString());
    params.set("kol", handle);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Knowledge Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500/10 rounded-full border border-cyan-500/30 mb-6">
              <Database className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-semibold text-cyan-400">Knowledge Sync</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Vector Database Management</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manage vector databases and RAG memory for your agents.
              Upload knowledge, sync with AI, and power intelligent conversations.
            </p>
          </div>

          {/* 搜索栏 */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索 KOL 名称或 Handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          {/* KOL 知识库管理卡片 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              {filteredKOLs.length > 0 ? (
                <div className="space-y-3">
                  {filteredKOLs.map((kol, idx) => {
                    const active = kol.handle === effectiveSelectedKOL;
                    return (
                      <motion.button
                        key={kol.handle}
                        type="button"
                        onClick={() => selectAndPersist(kol.handle)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`w-full text-left p-4 rounded-xl border transition-all min-h-[56px] ${
                          active
                            ? "border-cyan-500/40 bg-cyan-500/10"
                            : "border-border bg-card/50 hover:bg-card/80 hover:border-cyan-500/20"
                        }`}
                        aria-pressed={active}
                      >
                        <div className="font-semibold text-foreground">{kol.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">@{kol.handle}</div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">未找到匹配的 KOL</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    清除搜索
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-8">
              {effectiveSelectedKOL ? (
                <KnowledgeManagement kolHandle={effectiveSelectedKOL} />
              ) : (
                <div className="p-6 bg-card/50 border border-border rounded-xl">
                  <div className="text-sm text-muted-foreground">
                    请选择左侧一个 KOL 来管理其知识库（支持 URL：<span className="font-mono">?kol=handle</span>）。
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 功能说明 */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-card/50 border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">📝 添加知识</h3>
              <p className="text-sm text-muted-foreground">
                通过文本输入或文件上传添加知识到向量数据库，支持多种格式。
              </p>
            </div>
            <div className="p-6 bg-card/50 border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">🔍 RAG 检索</h3>
              <p className="text-sm text-muted-foreground">
                知识会自动向量化并存储，AI 对话时自动检索相关上下文。
              </p>
            </div>
            <div className="p-6 bg-card/50 border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-2">📊 统计管理</h3>
              <p className="text-sm text-muted-foreground">
                查看每个 KOL 的知识库统计，包括 chunks 数量、sources 数量等。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading Knowledge...</div>
      </main>
    }>
      <KnowledgePageContent />
    </Suspense>
  );
}
