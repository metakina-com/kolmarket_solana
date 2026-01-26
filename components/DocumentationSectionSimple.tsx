"use client";

import { FileText, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";

const docItems = [
  {
    icon: FileText,
    title: "$KMT Whitepaper",
    description: "Token economics and utility",
    href: "/whitepaper",
  },
  {
    icon: Zap,
    title: "AI Agents",
    description: "ElizaOS-powered digital twins",
    href: "/agents",
  },
  {
    icon: Shield,
    title: "Knowledge Base",
    description: "Train and manage KOL data",
    href: "/knowledge",
  },
  {
    icon: Globe,
    title: "Market",
    description: "Discover top KOLs",
    href: "/market",
  },
];

export function DocumentationSectionSimple() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Explore the <span className="text-cyan-400">Ecosystem</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {docItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all text-center"
            >
              <item.icon className="w-8 h-8 mx-auto mb-3 text-cyan-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-slate-400">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
