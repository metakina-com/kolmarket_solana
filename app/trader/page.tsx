"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const REDIRECT_DELAY_MS = 1800;

/**
 * Trader 门户入口：短暂过渡页后重定向到交易终端 /terminal
 * RolePortals 中 "I am a Trader" 指向 /trader，实际交易功能在 /terminal
 */
export default function TraderPortalPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / REDIRECT_DELAY_MS) * 100);
      setProgress(p);
    }, 50);

    const t = setTimeout(() => {
      clearInterval(interval);
      router.replace("/terminal");
    }, REDIRECT_DELAY_MS);

    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Taking you to Trading Terminal</h1>
          <p className="text-muted-foreground text-sm mb-6">
            AI chat, swaps, and alpha signals in one place.
          </p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
