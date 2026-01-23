/**
 * Jupiter Price API Hook
 * 获取 Token 价格（支持多 Token）
 */

import { useState, useEffect } from "react";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const JUPITER_PRICE_API = "https://api.jup.ag/price/v2";

export interface TokenPrice {
  mint: string;
  price: number | null;
  loading: boolean;
  error: string | null;
}

export interface JupiterPriceData {
  [mint: string]: {
    id: string;
    mintSymbol: string;
    vsToken: string;
    vsTokenSymbol: string;
    price: number;
    priceChange24h?: number;
  };
}

/**
 * 获取单个或多个 Token 价格
 */
export function useJupiterPrice(mints: string | string[], refreshInterval = 30000) {
  const mintsArray = Array.isArray(mints) ? mints : [mints];
  const [prices, setPrices] = useState<Record<string, TokenPrice>>(() =>
    Object.fromEntries(
      mintsArray.map((mint) => [
        mint,
        { mint, price: null, loading: true, error: null },
      ])
    )
  );

  const fetchPrices = async () => {
    const ids = mintsArray.join(",");
    try {
      const response = await fetch(`${JUPITER_PRICE_API}?ids=${ids}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: { data: JupiterPriceData } = await response.json();

      setPrices((prev) => {
        const next = { ...prev };
        mintsArray.forEach((mint) => {
          const priceData = data.data[mint];
          next[mint] = {
            mint,
            price: priceData?.price ?? null,
            loading: false,
            error: priceData ? null : "Price not found",
          };
        });
        return next;
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to fetch price";
      setPrices((prev) => {
        const next = { ...prev };
        mintsArray.forEach((mint) => {
          next[mint] = { ...next[mint], loading: false, error };
        });
        return next;
      });
    }
  };

  useEffect(() => {
    fetchPrices();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrices, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintsArray.join(","), refreshInterval]);

  if (mintsArray.length === 1) {
    return prices[mintsArray[0]];
  }
  return prices;
}

/**
 * 获取 SOL 价格（快捷方法）
 */
export function useSOLPrice(refreshInterval = 30000) {
  return useJupiterPrice(SOL_MINT, refreshInterval);
}
