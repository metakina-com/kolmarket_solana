"use client";

import { use } from "react";
import { motion } from "framer-motion";
import AgentSuitePanel from "@/components/AgentSuitePanel";
import { getKOLPersona } from "@/lib/agents/kol-personas";
import { ArrowLeft, Bot, Twitter, MessageSquare, TrendingUp, MessageCircle, LayoutGrid, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TipButtonKOL } from "@/components/TipButton";
import { TokenPriceDisplay } from "@/components/TokenPriceDisplay";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default function KOLDetailPage({ params }: PageProps) {
  const { handle } = use(params);
  const persona = getKOLPersona(handle);

  if (!persona) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl p-8 border border-red-500/20 bg-card text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">KOL Not Found</h1>
              <p className="text-muted-foreground mb-6">The KOL @{handle} is not available.</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold hover:opacity-90 transition-opacity min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-24 border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <span className="text-muted-foreground/50">·</span>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors min-h-[44px]"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Market</span>
            </Link>
            <span className="text-muted-foreground/50">·</span>
            <Link
              href={`/terminal?mode=chat&kol=${encodeURIComponent(handle)}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 transition-colors min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat in Terminal</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{persona.name}</h1>
              <p className="text-muted-foreground">@{persona.handle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
                <span className="text-sm text-cyan-400 font-semibold">Digital Life</span>
              </div>
              <TipButtonKOL handle={persona.handle} name={persona.name} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KOL Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-card/80 backdrop-blur border border-border rounded-2xl"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
          <p className="text-muted-foreground mb-4">{persona.personality}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Expertise</h3>
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
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Speaking Style</h3>
              <p className="text-muted-foreground text-sm">{persona.speakingStyle}</p>
            </div>
          </div>

          {/* Market Price */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Market Prices</h3>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <TokenPriceDisplay
                  mint="So11111111111111111111111111111111111111112"
                  symbol="SOL"
                  showChange24h={false}
                  size="sm"
                />
              </div>
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
              <h2 className="text-2xl font-bold text-foreground">Agent Suite</h2>
            </div>
            <p className="text-muted-foreground">
              Full Agent Suite powered by ElizaOS — bring your digital twin to life.
            </p>
          </div>

          <div className="mb-6 p-6 bg-card/80 backdrop-blur border border-border rounded-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Start</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold">1) Configure</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Create/activate the suite, then open <span className="font-mono">Configure</span> to tune Avatar/Mod/Trader modules.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold">2) Start</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press <span className="font-mono">Start</span>. The status should turn to running.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold">3) Validate</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verify module activity, then test the chat path in Terminal to confirm persona + RAG behavior.
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-card/50 border border-border">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                <Lock className="w-4 h-4 text-purple-400" />
                Integrations
              </div>
              <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                Twitter/Discord/Telegram automation and autonomous trading require container deployment and platform tokens.
              </div>
            </div>
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
          <div className="p-6 bg-card/80 backdrop-blur border border-border rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Twitter className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-foreground">Digital Twin</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              24/7 automated tweets and engagement. Your twin keeps the buzz while you sleep.
            </p>
          </div>

          <div className="p-6 bg-card/80 backdrop-blur border border-border rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground">Community Support</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Discord/Telegram bots reply to fans 24/7. No need to watch the groups yourself.
            </p>
          </div>

          <div className="p-6 bg-card/80 backdrop-blur border border-border rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground">Trading & Revenue</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              On-chain trading, copy-trading, and revenue share. Fans follow your AI wallet; you earn automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
