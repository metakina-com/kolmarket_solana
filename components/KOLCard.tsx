"use client";

import { KOLRadarChart } from "./KOLRadarChart";
import { TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface KOLCardProps {
  name: string;
  handle: string;
  avatar?: string;
  mindshareScore: number;
  stats: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
  volume?: string;
  followers?: string;
}

const chartStroke = "#06b6d4";
const chartFill = "#06b6d4";
const chartGrid = "#64748b";
const chartTick = "#94a3b8";

export function KOLCard({ name, handle, mindshareScore, stats, volume, followers }: KOLCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-6 border border-border bg-card/90 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">@{handle}</p>
        </div>
        <div className="text-right">
          <div className="px-3 py-1.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Mindshare</span>
            <div className="text-lg font-bold text-cyan-400">{mindshareScore}</div>
          </div>
        </div>
      </div>

      {/* Stats Icons */}
      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        {volume && (
          <div className="flex items-center gap-1.5">
            <TrendingUp size={16} className="text-cyan-400" />
            <span>{volume}</span>
          </div>
        )}
        {followers && (
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-purple-400" />
            <span>{followers}</span>
          </div>
        )}
      </div>

      {/* Radar Chart */}
      <div className="mb-4">
        <KOLRadarChart
          data={stats}
          strokeColor={chartStroke}
          fillColor={chartFill}
          gridColor={chartGrid}
          tickColor={chartTick}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/kol/${handle}`}
          className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-xl text-sm font-medium transition-all text-center text-foreground min-h-[44px] flex items-center justify-center"
        >
          View Profile
        </Link>
        <Link
          href={`/#agents`}
          className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm font-medium transition-all text-center min-h-[44px] flex items-center justify-center"
        >
          Chat AI
        </Link>
      </div>
    </motion.div>
  );
}
