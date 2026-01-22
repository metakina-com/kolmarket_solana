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
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-primary/50 transition-all"
      >
        <div className="flex items-center gap-2">
          {selectedPersona ? (
            <>
              <User size={18} className="text-primary" />
              <span className="text-foreground font-medium">{selectedPersona.name}</span>
              <span className="text-sm text-gray-500">@{selectedPersona.handle}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-accent" />
              <span className="text-gray-600">Select a KOL Digital Life</span>
            </>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg overflow-hidden z-50 shadow-lg"
          >
            <div className="max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  onSelectKOL(null);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Sparkles size={16} className="text-accent" />
                <span className="text-gray-600">General AI Assistant</span>
              </button>
              {kolList.map((kol) => (
                <button
                  key={kol.handle}
                  onClick={() => {
                    onSelectKOL(kol.handle);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 ${
                    selectedKOL === kol.handle ? "bg-green-100/50 border-l-2 border-primary" : ""
                  }`}
                >
                  <User size={16} className="text-primary" />
                  <div className="flex-1">
                    <div className="text-foreground font-medium">{kol.name}</div>
                    <div className="text-xs text-gray-500">@{kol.handle}</div>
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
