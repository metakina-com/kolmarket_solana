"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Trader 门户入口：重定向到交易终端 /terminal
 * RolePortals 中 "I am a Trader" 指向 /trader，实际交易功能在 /terminal
 */
export default function TraderPortalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/terminal");
  }, [router]);

  // 显示加载状态，避免空白页面
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cyan-400 font-mono">Redirecting to Terminal...</p>
      </div>
    </div>
  );
}
