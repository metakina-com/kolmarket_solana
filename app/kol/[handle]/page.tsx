"use client";

export const runtime = "edge";

import { use } from "react";
import { motion } from "framer-motion";
import AgentSuitePanel from "@/components/AgentSuitePanel";
import { getKOLPersona } from "@/lib/agents/kol-personas";
import { ArrowLeft, Bot, Twitter, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default function KOLDetailPage({ params }: PageProps) {
  const { handle } = use(params);
  const persona = getKOLPersona(handle);

  if (!persona) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-xl p-8 border border-red-500/20 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">KOL Not Found</h1>
            <p className="text-slate-400 mb-6">The KOL @{handle} is not available.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{persona.name}</h1>
              <p className="text-slate-400">@{persona.handle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
                <span className="text-sm text-cyan-400 font-semibold">Digital Life</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KOL Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-slate-900/50 backdrop-blur border border-cyan-500/20 rounded-lg"
        >
          <h2 className="text-xl font-bold text-white mb-4">About</h2>
          <p className="text-slate-300 mb-4">{persona.personality}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {persona.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Speaking Style</h3>
              <p className="text-slate-300 text-sm">{persona.speakingStyle}</p>
            </div>
          </div>
        </motion.div>

        {/* Agent Suite Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Bot className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Agent Suite</h2>
            </div>
            <p className="text-slate-400">
              基于 ElizaOS 的完整智能体套件，让数字生命真正活起来
            </p>
          </div>
          <AgentSuitePanel kolHandle={handle} kolName={persona.name} />
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 bg-slate-900/50 backdrop-blur border border-cyan-500/20 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Twitter className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white">数字分身</h3>
            </div>
            <p className="text-sm text-slate-400">
              24/7 自动发推、互动，永不眠的喊单员。你睡觉时，你的分身帮你维持热度。
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 backdrop-blur border border-cyan-500/20 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white">粉丝客服</h3>
            </div>
            <p className="text-sm text-slate-400">
              Discord/Telegram 机器人，24小时回复粉丝提问，不用你自己盯着群。
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 backdrop-blur border border-cyan-500/20 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">带单交易</h3>
            </div>
            <p className="text-sm text-slate-400">
              链上交易、跟单、自动分红。粉丝可以直接跟你的 AI 钱包买币，你拿自动分红。
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
