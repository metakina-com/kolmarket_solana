"use client";

import { Twitter, MessageCircle, Users, Cpu } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Cpu className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white">
                KOLMarket<span className="text-cyan-400">.ai</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The decentralized nexus where human influence meets algorithmic intelligence.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#whitepaper" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                  $KMT Token
                </a>
              </li>
              <li>
                <a href="#portals" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                  Portals
                </a>
              </li>
              <li>
                <a href="#market" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                  Market
                </a>
              </li>
              <li>
                <a href="#agents" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                  Agents
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Connect</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/KOLMARKET"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://t.me/kolmarketai"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all"
                aria-label="Telegram"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="https://discord.com/channels/1433748708255727640/1463848664001937533"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all"
                aria-label="Discord"
              >
                <Users size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-slate-500">
            © {currentYear} KOLMarket.ai. Built on <span className="text-cyan-400">Solana</span>, powered by <span className="text-purple-400">ElizaOS</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
