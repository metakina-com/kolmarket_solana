"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            Price the Human.
            <br />
            Empower the Agent.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto">
            The 1st Identity Layer for AI Agents on Solana
          </p>

          {/* Powered by badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <span className="text-sm text-slate-500">Powered by:</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 glass rounded-full text-sm text-cyan-400 border border-cyan-500/30">
                ai16z
              </span>
              <span className="px-4 py-2 glass rounded-full text-sm text-purple-400 border border-purple-500/30">
                Cookie.fun
              </span>
              <span className="px-4 py-2 glass rounded-full text-sm text-cyan-400 border border-cyan-500/30">
                Solana Agent Kit
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <motion.a
            href="#market"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all glow-cyan"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch App
            <ArrowRight size={20} />
          </motion.a>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 text-cyan-500/20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles size={40} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-purple-500/20"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          <Sparkles size={40} />
        </motion.div>
      </div>
    </section>
  );
}
