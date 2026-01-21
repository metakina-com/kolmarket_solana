"use client";

import { useState, useEffect } from "react";
import { MindshareData } from "@/lib/data/cookie-fun";

interface UseBatchMindshareDataResult {
  data: Map<string, MindshareData>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * React Hook 用于批量获取多个 KOL 的 Mindshare 数据
 * 
 * @param handles - KOL handles 数组
 * @param autoFetch - 是否自动获取数据 (默认 true)
 * @returns Mindshare 数据映射和状态
 */
export function useBatchMindshareData(
  handles: string[],
  autoFetch: boolean = true
): UseBatchMindshareDataResult {
  const [data, setData] = useState<Map<string, MindshareData>>(new Map());
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (handles.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 并行获取所有数据
      const promises = handles.map(async (handle) => {
        try {
          const response = await fetch(`/api/mindshare/${encodeURIComponent(handle)}`);
          if (response.ok) {
            const result = await response.json();
            return { handle, data: result };
          }
          return { handle, data: null };
        } catch (err) {
          console.error(`Error fetching data for ${handle}:`, err);
          return { handle, data: null };
        }
      });

      const results = await Promise.all(promises);
      const dataMap = new Map<string, MindshareData>();

      results.forEach(({ handle, data: result }) => {
        if (result) {
          dataMap.set(handle, result);
        }
      });

      setData(dataMap);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching batch mindshare data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && handles.length > 0) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handles.join(","), autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
