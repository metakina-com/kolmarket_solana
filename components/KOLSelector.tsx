"use client";

import { useState } from "react";
import { ChevronDown, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvailableKOLs } from "@/lib/agents/kol-personas";

interface KOLSelectorProps {
  selectedKOL: string | null;
  onSelectKOL: (handle: string | null) => void;
}

export function KOLSelector({ selectedKOL, onSelectKOL }: KOLSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const kolList = getAvailableKOLs();
  const selectedPersona = selectedKOL ? kolList.find((k) => k.handle === selectedKOL) : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 min-h-[44px] bg-card border border-border rounded-xl flex items-center justify-between hover:border-cyan-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selectedPersona ? `Selected: ${selectedPersona.name}` : "Select a KOL Digital Life"}
      >
        <div className="flex items-center gap-2">
          {selectedPersona ? (
            <>
              <User size={18} className="text-cyan-400" />
              <span className="text-foreground font-medium">{selectedPersona.name}</span>
              <span className="text-sm text-muted-foreground">@{selectedPersona.handle}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-cyan-400" />
              <span className="text-muted-foreground">Select a KOL Digital Life</span>
            </>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl overflow-hidden z-50 shadow-xl shadow-black/20"
          >
            <div
              className="max-h-64 overflow-y-auto [scrollbar-gutter:stable]"
              role="listbox"
            >
              <button
                type="button"
                onClick={() => {
                  onSelectKOL(null);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 min-h-[44px] text-left hover:bg-muted/50 transition-colors flex items-center gap-2 border-b border-border"
              >
                <Sparkles size={16} className="text-cyan-400" />
                <span className="text-muted-foreground">General AI Assistant</span>
              </button>
              {kolList.map((kol) => (
                <button
                  key={kol.handle}
                  type="button"
                  onClick={() => {
                    onSelectKOL(kol.handle);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 min-h-[44px] text-left transition-colors flex items-center gap-2 ${
                    selectedKOL === kol.handle
                      ? "bg-cyan-500/10 border-l-2 border-cyan-500 text-cyan-400"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <User size={16} className="text-cyan-400" />
                  <div className="flex-1 text-left">
                    <div className="text-foreground font-medium">{kol.name}</div>
                    <div className="text-xs text-muted-foreground">@{kol.handle}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
