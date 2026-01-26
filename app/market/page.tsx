"use client";

import { Navbar } from "@/components/Navbar";
import { KOLCardWithData } from "@/components/KOLCardWithData";
import { getAvailableKOLs } from "@/lib/agents/kol-personas";
import type { MindshareData } from "@/lib/data/cookie-fun";
import { motion } from "framer-motion";
import { Search, Filter, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// 生成 fallback 数据（当 API 不可用时）
function generateFallbackData(handle: string) {
  const baseScores: Record<string, { mindshare: number; volume: string; followers: string; stats: number[] }> = {
    "blknoiz06": { mindshare: 92, volume: "$2.4M", followers: "450K", stats: [95, 88, 92, 85, 90] },
    "aeyakovenko": { mindshare: 89, volume: "$1.8M", followers: "380K", stats: [88, 92, 85, 90, 87] },
    "CryptoWendyO": { mindshare: 85, volume: "$1.2M", followers: "320K", stats: [82, 90, 88, 83, 86] },
  };

  const defaultData = { mindshare: 75, volume: "$500K", followers: "100K", stats: [70, 75, 72, 68, 73] };
  const data = baseScores[handle] || defaultData;

  return {
    mindshareScore: data.mindshare,
    volume: data.volume,
    followers: data.followers,
    stats: [
      { subject: "Volume", value: data.stats[0], fullMark: 100 },
      { subject: "Loyalty", value: data.stats[1], fullMark: 100 },
      { subject: "Alpha", value: data.stats[2], fullMark: 100 },
      { subject: "Growth", value: data.stats[3], fullMark: 100 },
      { subject: "Engage", value: data.stats[4], fullMark: 100 },
    ],
  };
}

export default function MarketPage() {
  const allKOLs = getAvailableKOLs();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"mindshare" | "volume" | "followers">("mindshare");

  const mindshareCacheRef = useRef<Record<string, MindshareData>>({});
  const [mindshareData, setMindshareData] = useState<Record<string, MindshareData>>({});
  const [mindshareLoading, setMindshareLoading] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    // Avoid refetching if we already have a populated cache
    if (Object.keys(mindshareCacheRef.current).length > 0) {
      setMindshareData(mindshareCacheRef.current);
      return;
    }

    const handles = allKOLs.map((k) => k.handle);
    if (handles.length === 0) return;

    const controller = new AbortController();
    setMindshareLoading(true);

    fetch(`/api/mindshare/batch?handles=${encodeURIComponent(handles.join(","))}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Batch fetch failed: ${res.status}`);
        const json = await res.json();
        const data = (json?.data || {}) as Record<string, MindshareData>;
        mindshareCacheRef.current = data;
        setMindshareData(data);
      })
      .catch(() => {
        // silently fall back to per-card fallbackData
      })
      .finally(() => {
        setMindshareLoading(false);
      });

    return () => controller.abort();
    // allKOLs is static (from const object), but keep dependency explicit
  }, [allKOLs]);

  // 过滤和排序
  const filteredKOLs = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();

    return allKOLs
      .filter((kol) => (q ? kol.name.toLowerCase().includes(q) || kol.handle.toLowerCase().includes(q) : true))
      .map((kol) => ({
        ...kol,
        fallbackData: generateFallbackData(kol.handle),
      }))
      .sort((a, b) => {
        const aData = mindshareData[a.handle];
        const bData = mindshareData[b.handle];

        if (sortBy === "mindshare") {
          const aScore = aData?.mindshareScore ?? a.fallbackData.mindshareScore;
          const bScore = bData?.mindshareScore ?? b.fallbackData.mindshareScore;
          return bScore - aScore;
        } else if (sortBy === "volume") {
          const aVolStr = aData?.volume ?? a.fallbackData.volume;
          const bVolStr = bData?.volume ?? b.fallbackData.volume;
          const aVol = parseFloat(aVolStr.replace(/[^0-9.]/g, ""));
          const bVol = parseFloat(bVolStr.replace(/[^0-9.]/g, ""));
          return bVol - aVol;
        } else {
          const aFolStr = aData?.followers ?? a.fallbackData.followers;
          const bFolStr = bData?.followers ?? b.fallbackData.followers;
          const aFol = parseFloat(aFolStr.replace(/[^0-9.]/g, ""));
          const bFol = parseFloat(bFolStr.replace(/[^0-9.]/g, ""));
          return bFol - aFol;
        }
      });
  }, [allKOLs, debouncedQuery, mindshareData, sortBy]);

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
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Real-time influence tracking and Mindshare analysis.
              Find the agents with the highest conviction.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
                Powered by Cookie.fun Mindshare Index
              </span>
            </div>

            {/* 搜索和筛选 */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索 KOL 名称或 Handle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
                >
                  <option value="mindshare">按 Mindshare 排序</option>
                  <option value="volume">按交易量排序</option>
                  <option value="followers">按粉丝数排序</option>
                </select>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>共 {filteredKOLs.length} 个 KOL</span>
              </div>
              {mindshareLoading && (
                <div className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
                  syncing...
                </div>
              )}
            </div>
          </div>

          {/* KOL 卡片网格 */}
          {filteredKOLs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredKOLs.map((kol, idx) => (
                <motion.div
                  key={kol.handle}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <KOLCardWithData
                    name={kol.name}
                    handle={kol.handle}
                    prefetchedData={mindshareData[kol.handle] ?? null}
                    fallbackData={kol.fallbackData}
                  />
                </motion.div>
              ))}
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
      </section>
    </main>
  );
}
