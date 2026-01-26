"use client";

import { KOLCard } from "./KOLCard";
import { useMindshareData } from "@/lib/hooks/useMindshareData";
import type { MindshareData } from "@/lib/data/cookie-fun";
import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface KOLCardWithDataProps {
  name: string;
  handle: string;
  prefetchedData?: MindshareData | null;
  fallbackData?: {
    mindshareScore: number;
    stats: Array<{ subject: string; value: number; fullMark: number }>;
    volume?: string;
    followers?: string;
  };
}

function KOLCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 border border-border bg-card/90 backdrop-blur-sm min-h-[420px] animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-6 w-24 bg-muted rounded-lg" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="h-14 w-20 bg-muted rounded-xl" />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
      <div className="h-[200px] bg-muted/50 rounded-xl mb-4" />
      <div className="flex gap-2">
        <div className="flex-1 h-11 bg-muted rounded-xl" />
        <div className="flex-1 h-11 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

/**
 * 增强版 KOLCard，支持从 API 获取真实数据
 * 如果 API 失败，会使用 fallbackData 作为降级方案
 */
export function KOLCardWithData({ name, handle, prefetchedData, fallbackData }: KOLCardWithDataProps) {
  const hasPrefetchedDataProp = prefetchedData !== undefined;
  const { data, loading, error, refetch } = useMindshareData(handle, !hasPrefetchedDataProp);

  if (prefetchedData) {
    return (
      <KOLCard
        name={name}
        handle={prefetchedData.handle}
        mindshareScore={prefetchedData.mindshareScore}
        stats={prefetchedData.stats}
        volume={prefetchedData.volume}
        followers={prefetchedData.followers}
      />
    );
  }

  if (loading && !data) {
    return <KOLCardSkeleton />;
  }

  if (error && !data && !fallbackData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border border-red-500/30 bg-card/90 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertCircle size={20} />
          <span className="font-semibold">Failed to load data</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">@{handle}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 text-sm font-medium transition-all min-h-[44px]"
          aria-label="Retry loading data"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </motion.div>
    );
  }

  const displayData = data || {
    handle,
    mindshareScore: fallbackData?.mindshareScore ?? 0,
    volume: fallbackData?.volume ?? "$0",
    followers: fallbackData?.followers ?? "0",
    stats: fallbackData?.stats ?? [],
    lastUpdated: new Date().toISOString(),
  };

  return (
    <KOLCard
      name={name}
      handle={displayData.handle}
      mindshareScore={displayData.mindshareScore}
      stats={displayData.stats}
      volume={displayData.volume}
      followers={displayData.followers}
    />
  );
}
