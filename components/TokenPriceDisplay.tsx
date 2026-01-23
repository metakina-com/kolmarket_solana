"use client";

import { useJupiterPrice } from "@/lib/hooks/useJupiterPrice";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface TokenPriceDisplayProps {
  mint: string;
  symbol?: string;
  showChange24h?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TokenPriceDisplay({
  mint,
  symbol,
  showChange24h = false,
  size = "md",
  className = "",
}: TokenPriceDisplayProps) {
  const priceData = useJupiterPrice(mint, 60000); // 60s refresh

  if (priceData.loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-muted-foreground ${className}`}>
        <Loader2 size={size === "sm" ? 12 : size === "md" ? 14 : 16} className="animate-spin" />
        <span className={size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}>
          Loading...
        </span>
      </div>
    );
  }

  if (priceData.error || priceData.price === null) {
    return (
      <span className={`text-muted-foreground ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"} ${className}`}>
        {symbol || "N/A"}
      </span>
    );
  }

  const price: number = priceData.price as number;
  const priceChange24h = (priceData as any).priceChange24h as number | undefined;
  const isPositive = priceChange24h !== undefined && priceChange24h >= 0;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}>{symbol || "Token"}</span>
      <span className={`font-semibold ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}`}>
        ${price.toFixed(4)}
      </span>
      {showChange24h && priceChange24h !== undefined && (
        <span
          className={`inline-flex items-center gap-0.5 ${
            isPositive ? "text-green-400" : "text-red-400"
          } ${size === "sm" ? "text-[10px]" : "text-xs"}`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(priceChange24h).toFixed(2)}%
        </span>
      )}
    </div>
  );
}
