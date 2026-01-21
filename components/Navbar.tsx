"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              KOLMarket.ai
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#market" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Market
            </a>
            <a href="#agents" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Agents
            </a>
            <a href="#about" className="text-slate-300 hover:text-cyan-400 transition-colors">
              About
            </a>
            <div className="wallet-adapter-button-trigger">
              <WalletMultiButton className="!bg-slate-800 hover:!bg-slate-700 !text-white !border-slate-700" />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <WalletMultiButton className="!bg-slate-800 hover:!bg-slate-700 !text-white !border-slate-700 !text-sm" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-cyan-400"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-slate-800/50">
            <a href="#market" className="block text-slate-300 hover:text-cyan-400 transition-colors">
              Market
            </a>
            <a href="#agents" className="block text-slate-300 hover:text-cyan-400 transition-colors">
              Agents
            </a>
            <a href="#about" className="block text-slate-300 hover:text-cyan-400 transition-colors">
              About
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
