"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Menu, X, Cpu, Twitter, MessageCircle, Users, Sun, Moon, Coins, Rocket, LayoutGrid, Bot, BookOpen, FileText, Globe } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./providers/ThemeProvider";
import Link from "next/link";

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
          <div className="hidden lg:flex items-center space-x-1">
            {/* Token & Presale */}
            <Link href="/whitepaper" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all group">
              <Coins className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>$KMT</span>
            </Link>
            <Link href="/presale" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all group">
              <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Presale</span>
            </Link>
            
            <div className="w-px h-6 bg-slate-300/20 dark:bg-white/10 mx-2" />
            
            {/* Core Features */}
            <Link href="/nexus" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all group">
              <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Nexus</span>
            </Link>
            <Link href="/market" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all group">
              <LayoutGrid className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Market</span>
            </Link>
            <Link href="/agents" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all group">
              <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Agents</span>
            </Link>
            <Link href="/knowledge" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all group">
              <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Knowledge</span>
            </Link>
            
            <div className="w-px h-6 bg-slate-300/20 dark:bg-white/10 mx-2" />
            
            {/* Docs */}
            <Link href="#docs" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all group">
              <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Docs</span>
            </Link>
            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-300/20 dark:border-white/10">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all"
                aria-label="切换主题"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {/* Social Links */}
              <div className="flex items-center gap-1">
                <a
                  href="https://x.com/KOLMARKET"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://t.me/kolmarketai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all"
                  aria-label="Telegram"
                >
                  <MessageCircle size={18} />
                </a>
                <a
                  href="https://discord.com/channels/1433748708255727640/1463848664001937533"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all"
                  aria-label="Discord"
                >
                  <Users size={18} />
                </a>
              </div>
              <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-bold !rounded-xl !h-11 hover:!opacity-90 hover:!scale-105 transition-all !px-6 !shadow-lg !shadow-cyan-500/25" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cyan-400 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
              aria-label="切换主题"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-900 dark:text-white p-2 hover:bg-white/5 dark:hover:bg-white/5 rounded-lg transition-all"
              aria-label="菜单"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-1 border-t border-slate-200/20 dark:border-white/5 opacity-100 transition-opacity duration-200">
            {/* Token & Presale Section */}
            <div className="px-2 py-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Token</div>
              <Link href="/whitepaper" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all">
                <Coins className="w-5 h-5" />
                <span>$KMT Token</span>
              </Link>
              <Link href="/presale" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all">
                <Rocket className="w-5 h-5" />
                <span>Presale</span>
              </Link>
            </div>
            
            {/* Core Features Section */}
            <div className="px-2 py-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Features</div>
              <Link href="/nexus" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all">
                <Globe className="w-5 h-5" />
                <span>Nexus</span>
              </Link>
              <Link href="/market" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all">
                <LayoutGrid className="w-5 h-5" />
                <span>Market</span>
              </Link>
              <Link href="/agents" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all">
                <Bot className="w-5 h-5" />
                <span>Agents</span>
              </Link>
              <Link href="/knowledge" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all">
                <BookOpen className="w-5 h-5" />
                <span>Knowledge</span>
              </Link>
            </div>
            
            {/* Docs Section */}
            <div className="px-2 py-2">
              <Link href="#docs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 rounded-lg transition-all">
                <FileText className="w-5 h-5" />
                <span>Docs</span>
              </Link>
            </div>
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
