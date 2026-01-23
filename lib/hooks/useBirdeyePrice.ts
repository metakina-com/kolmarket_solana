/**
 * Birdeye Price API Hook
 * 备选价格源，支持更多 Token 和详细数据
 */

import { useState, useEffect } from "react";

const BIRDEYE_API_BASE = "https://public-api.birdeye.so";
const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;

export interface BirdeyeTokenPrice {
  mint: string;
  price: number | null;
  priceChange24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * 获取 Birdeye Token 价格
 * 需要 API Key（可选，无 key 时部分功能受限）
 */
export function useBirdeyePrice(mint: string, refreshInterval = 30000) {
  const [data, setData] = useState<BirdeyeTokenPrice>({
    mint,
    price: null,
    priceChange24h: null,
    volume24h: null,
    marketCap: null,
    loading: true,
    error: null,
  });

  const fetchPrice = async () => {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (BIRDEYE_API_KEY) {
        headers["X-API-KEY"] = BIRDEYE_API_KEY;
      }

      const response = await fetch(`${BIRDEYE_API_BASE}/defi/token_overview?address=${mint}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setData({
          mint,
          price: result.data.price ?? null,
          priceChange24h: result.data.priceChange24h ?? null,
          volume24h: result.data.volume24h ?? null,
          marketCap: result.data.mc ?? null,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(result.message || "Invalid response");
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to fetch Birdeye price";
      setData((prev) => ({ ...prev, loading: false, error }));
    }
  };

  useEffect(() => {
    fetchPrice();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint, refreshInterval]);

  return data;
}
