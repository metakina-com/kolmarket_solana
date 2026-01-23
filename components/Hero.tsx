"use client";

import { ArrowRight, Zap, Bot, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Floating Orbs */}
      <div className="absolute top-[20%] left-[15%] w-72 h-72 bg-cyan-500/20 blur-[120px] animate-pulse-slow font-orbitron" />
      <div className="absolute bottom-[20%] right-[15%] w-72 h-72 bg-purple-500/20 blur-[120px] animate-pulse-slow" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-8 animate-float">
            <Bot size={14} />
            IDENTITY LAYER FOR AI AGENTS
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
            <span className="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
              Price the Human.
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
              Empower the Agent.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The decentralized nexus where human influence meets algorithmic intelligence.
            Built on <span className="text-white font-semibold">Solana</span>, powered by <span className="text-cyan-400">ElizaOS</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <motion.a
              href="/nexus"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
              <ArrowRight size={20} />
            </motion.a>
            <motion.a
              href="/market"
              className="w-full sm:w-auto px-8 py-4 cyber-glass text-white font-bold rounded-xl hover:neon-border-cyan transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse KOLs
              <Zap size={18} className="text-cyan-400" />
            </motion.a>
          </div>

          {/* Stats / Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white tracking-widest leading-none">ai16z</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Framework</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white tracking-widest leading-none">Cookie3</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Data Engine</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white tracking-widest leading-none">Helis</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Solana RPC</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
