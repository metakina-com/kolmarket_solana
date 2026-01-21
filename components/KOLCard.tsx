"use client";

import { KOLRadarChart } from "./KOLRadarChart";
import { TrendingUp, Users, MessageCircle } from "lucide-react";
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

export function KOLCard({ name, handle, mindshareScore, stats, volume, followers }: KOLCardProps) {
  return (
    <motion.div
      className="glass rounded-xl p-6 hover:border-cyan-500/50 transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-sm text-slate-400">@{handle}</p>
        </div>
        <div className="text-right">
          <div className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30">
            <span className="text-xs text-cyan-400 font-semibold">Mindshare</span>
            <div className="text-lg font-bold text-white">{mindshareScore}</div>
          </div>
        </div>
      </div>

      {/* Stats Icons */}
      <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
        {volume && (
          <div className="flex items-center gap-1">
            <TrendingUp size={16} />
            <span>{volume}</span>
          </div>
        )}
        {followers && (
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{followers}</span>
          </div>
        )}
      </div>

      {/* Radar Chart */}
      <div className="mb-4">
        <KOLRadarChart data={stats} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/kol/${handle}`}
          className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-center"
        >
          View Profile
        </Link>
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg text-sm font-medium transition-all">
          Chat AI
        </button>
      </div>
    </motion.div>
  );
}
