"use client";

import { Gift } from "lucide-react";
import { buildTipUrl } from "@/lib/utils/solana-pay";

const DEFAULT_AMOUNT = 0.01;
const TIP_RECIPIENT = process.env.NEXT_PUBLIC_TIP_RECIPIENT ?? "";

interface TipButtonProps {
  label?: string;
  message?: string;
  amountSol?: number;
  className?: string;
  size?: "sm" | "md";
}

export function TipButton({
  label = "KOLMarket Tip",
  message = "Thanks for the alpha!",
  amountSol = DEFAULT_AMOUNT,
  className = "",
  size = "md",
}: TipButtonProps) {
  if (!TIP_RECIPIENT) return null;

  const url = buildTipUrl(TIP_RECIPIENT, amountSol, label, message);
  const isSm = size === "sm";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
        isSm
          ? "px-3 py-1.5 text-sm min-h-[36px]"
          : "px-4 py-2.5 text-sm min-h-[44px]"
      } bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 ${className}`}
      aria-label={`Tip ${amountSol} SOL via Solana Pay`}
    >
      <Gift size={isSm ? 14 : 16} />
      Tip {amountSol} SOL
    </a>
  );
}

export function TipButtonKOL({ handle, name }: { handle: string; name: string }) {
  return (
    <TipButton
      label={`Tip @${handle}`}
      message={`Thanks for the alpha, ${name}!`}
      amountSol={0.01}
      size="md"
    />
  );
}
