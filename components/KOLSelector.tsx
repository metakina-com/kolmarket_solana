"use client";

import { useState } from "react";
import { ChevronDown, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvailableKOLs, KOLPersona } from "@/lib/agents/kol-personas";

interface KOLSelectorProps {
  selectedKOL: string | null;
  onSelectKOL: (handle: string | null) => void;
}

export function KOLSelector({ selectedKOL, onSelectKOL }: KOLSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const kolList = getAvailableKOLs();
  const selectedPersona = selectedKOL ? kolList.find(k => k.handle === selectedKOL) : null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 glass rounded-lg flex items-center justify-between hover:border-cyan-500/50 transition-all"
      >
        <div className="flex items-center gap-2">
          {selectedPersona ? (
            <>
              <User size={18} className="text-cyan-400" />
              <span className="text-white font-medium">{selectedPersona.name}</span>
              <span className="text-sm text-slate-400">@{selectedPersona.handle}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-purple-400" />
              <span className="text-slate-300">Select a KOL Digital Life</span>
            </>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-lg overflow-hidden z-50"
          >
            <div className="max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onSelectKOL(null);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-slate-800/50 transition-colors flex items-center gap-2"
              >
                <Sparkles size={16} className="text-purple-400" />
                <span className="text-slate-300">General AI Assistant</span>
              </button>
              {kolList.map((kol) => (
                <button
                  key={kol.handle}
                  onClick={() => {
                    onSelectKOL(kol.handle);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-slate-800/50 transition-colors flex items-center gap-2 ${
                    selectedKOL === kol.handle ? "bg-cyan-500/10 border-l-2 border-cyan-500" : ""
                  }`}
                >
                  <User size={16} className="text-cyan-400" />
                  <div className="flex-1">
                    <div className="text-white font-medium">{kol.name}</div>
                    <div className="text-xs text-slate-400">@{kol.handle}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
