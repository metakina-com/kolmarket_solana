"use client";

import { useState, useEffect } from "react";
import { MindshareData } from "@/lib/data/cookie-fun";

interface UseMindshareDataResult {
  data: MindshareData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * React Hook 用于获取 KOL Mindshare 数据
 * 
 * @param handle - KOL 的 Twitter/X handle
 * @param autoFetch - 是否自动获取数据 (默认 true)
 * @returns Mindshare 数据和状态
 */
export function useMindshareData(
  handle: string | null,
  autoFetch: boolean = true
): UseMindshareDataResult {
  const [data, setData] = useState<MindshareData | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!handle) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mindshare/${encodeURIComponent(handle)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(`KOL @${handle} not found`);
        } else {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        setData(null);
        return;
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setData(null);
      console.error("Error fetching mindshare data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && handle) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
