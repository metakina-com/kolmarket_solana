"use client";

import { Twitter, MessageCircle, Users, Cpu } from "lucide-react";

export function FooterSimple() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Cpu className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white">
              KOLMarket<span className="text-cyan-400">.ai</span>
            </span>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/KOLMARKET"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://t.me/kolmarketai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all"
              aria-label="Telegram"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href="https://discord.com/channels/1433748708255727640/1463848664001937533"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all"
              aria-label="Discord"
            >
              <Users size={18} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500">
            © {currentYear} KOLMarket.ai
          </p>
        </div>
      </div>
    </footer>
  );
}
