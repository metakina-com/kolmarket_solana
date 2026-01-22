"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X, RefreshCw } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastOptions {
  message: string;
  type: ToastType;
  retry?: () => void;
  duration?: number;
}

interface ToastProps extends ToastOptions {
  onClose: () => void;
}

export function Toast({ message, type, retry, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      className="flex items-start gap-3 p-4 rounded-xl border bg-card shadow-lg min-w-[280px] max-w-[420px]"
      style={{
        borderColor: isSuccess ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
      }}
    >
      <Icon
        size={20}
        className={isSuccess ? "text-green-400 flex-shrink-0 mt-0.5" : "text-red-400 flex-shrink-0 mt-0.5"}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium">{message}</p>
        {retry && (
          <button
            type="button"
            onClick={() => {
              retry();
              onClose();
            }}
            className="mt-2 flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-medium transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
