"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getAvailableKOLs } from "@/lib/agents/kol-personas";
import { UserCircle, ArrowRight } from "lucide-react";

export default function KOLPortalPage() {
  const kolList = getAvailableKOLs();

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            I am a KOL
          </h1>
          <p className="text-slate-400 text-lg">
            Choose your digital twin. Launch your AI agent, automate content, and monetize your influence.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kolList.map((kol, idx) => (
            <motion.div
              key={kol.handle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                href={`/kol/${kol.handle}`}
                className="block p-6 rounded-2xl cyber-glass border border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                  {kol.name}
                </h3>
                <p className="text-sm text-slate-500 mb-4">@{kol.handle}</p>
                <span className="inline-flex items-center gap-2 text-cyan-400 text-sm font-medium">
                  Enter Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
