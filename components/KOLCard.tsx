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

export function KOLCard({ name, handle, mindshareScore, stats, volume, followers }: KOLCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 border border-gray-200/80 hover:shadow-lg transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          <p className="text-sm text-gray-500">@{handle}</p>
        </div>
        <div className="text-right">
          <div className="px-3 py-1 bg-green-100/50 rounded-full border border-primary/30">
            <span className="text-xs text-primary-dark font-semibold">Mindshare</span>
            <div className="text-lg font-bold text-primary-dark">{mindshareScore}</div>
          </div>
        </div>
      </div>

      {/* Stats Icons */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
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
        <KOLRadarChart 
          data={stats}
          strokeColor="#28A745"
          fillColor="#28A745"
          gridColor="#E9ECEF"
          tickColor="#6C757D"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/kol/${handle}`}
          className="flex-1 px-4 py-2 bg-muted hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors text-center text-foreground"
        >
          View Profile
        </Link>
        <button className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-sm font-medium transition-all text-white">
          Chat AI
        </button>
      </div>
    </motion.div>
  );
}
