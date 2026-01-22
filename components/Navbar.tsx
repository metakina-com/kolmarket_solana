"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Menu, X, Cpu, Twitter, MessageCircle, Users, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./providers/ThemeProvider";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] cyber-glass dark:cyber-glass cyber-glass-light border-b border-white/5 dark:border-white/5 border-slate-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 group translate-x-0 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <a href="/" className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
              KOLMarket<span className="text-cyan-500 dark:text-cyan-400">.ai</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <a href="#whitepaper" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:neon-text-cyan transition-all uppercase tracking-widest">
              $KMT
            </a>
            <a href="#portals" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:neon-text-cyan transition-all uppercase tracking-widest">
              Nexus
            </a>
            <a href="#market" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:neon-text-cyan transition-all uppercase tracking-widest">
              Market
            </a>
            <a href="#agents" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:neon-text-cyan transition-all uppercase tracking-widest">
              Agents
            </a>
            <a href="#docs" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:neon-text-cyan transition-all uppercase tracking-widest">
              Docs
            </a>
            <div className="flex items-center gap-4 pl-4 border-l border-white/10 dark:border-white/10 border-slate-300/20">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-400 dark:text-slate-400 text-slate-600 hover:text-cyan-400 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
                aria-label="切换主题"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/KOLMARKET"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 dark:text-slate-400 text-slate-600 hover:text-cyan-400 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://t.me/kolmarketai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 dark:text-slate-400 text-slate-600 hover:text-cyan-400 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
                  aria-label="Telegram"
                >
                  <MessageCircle size={18} />
                </a>
                <a
                  href="https://discord.com/channels/1433748708255727640/1463848664001937533"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 dark:text-slate-400 text-slate-600 hover:text-cyan-400 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
                  aria-label="Discord"
                >
                  <Users size={18} />
                </a>
              </div>
              <WalletMultiButton className="!bg-white !text-slate-950 !font-bold !rounded-xl !h-11 hover:!bg-cyan-400 transition-all !px-6" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
              aria-label="切换主题"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-900 dark:text-white p-2 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-slate-200/20 dark:border-white/5 animate-in fade-in slide-in-from-top-4">
            <a href="#whitepaper" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              $KMT Token
            </a>
            <a href="#portals" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              Portals
            </a>
            <a href="#market" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              Market
            </a>
            <a href="#agents" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              Agents
            </a>
            <a href="#docs" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              Docs
            </a>
            <div className="pt-4 border-t border-slate-200/20 dark:border-white/5 space-y-4">
              {/* Social Links */}
              <div className="flex items-center justify-center gap-4">
                <a
                  href="https://x.com/KOLMARKET"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://t.me/kolmarketai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
                  aria-label="Telegram"
                >
                  <MessageCircle size={20} />
                </a>
                <a
                  href="https://discord.com/channels/1433748708255727640/1463848664001937533"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
                  aria-label="Discord"
                >
                  <Users size={20} />
                </a>
              </div>
              <WalletMultiButton className="!bg-cyan-500 !text-white !font-bold !rounded-xl !w-full" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
