"use client";

import { KOLCard } from "./KOLCard";
import { useMindshareData } from "@/lib/hooks/useMindshareData";
import { Loader2, AlertCircle } from "lucide-react";

interface KOLCardWithDataProps {
  name: string;
  handle: string;
  fallbackData?: {
    mindshareScore: number;
    stats: Array<{ subject: string; value: number; fullMark: number }>;
    volume?: string;
    followers?: string;
  };
}

/**
 * 增强版 KOLCard，支持从 API 获取真实数据
 * 如果 API 失败，会使用 fallbackData 作为降级方案
 */
export function KOLCardWithData({ name, handle, fallbackData }: KOLCardWithDataProps) {
  const { data, loading, error } = useMindshareData(handle);

  // 加载状态
  if (loading && !data) {
    return (
      <div className="glass rounded-xl p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading {name}...</p>
        </div>
      </div>
    );
  }

  // 错误状态（使用降级数据）
  if (error && !data && !fallbackData) {
    return (
      <div className="glass rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertCircle size={20} />
          <span className="font-semibold">Failed to load data</span>
        </div>
        <p className="text-sm text-slate-400">@{handle}</p>
      </div>
    );
  }

  // 使用 API 数据或降级数据
  const displayData = data || {
    handle,
    mindshareScore: fallbackData?.mindshareScore || 0,
    volume: fallbackData?.volume || "$0",
    followers: fallbackData?.followers || "0",
    stats: fallbackData?.stats || [],
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
