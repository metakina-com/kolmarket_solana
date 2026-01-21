/**
 * Cookie.fun API 客户端
 * 用于获取 KOL Mindshare Index 数据
 * 
 * API 文档: https://cookie.fun/docs
 */

export interface MindshareData {
  handle: string;
  mindshareScore: number;
  volume: string;
  followers: string;
  stats: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
  lastUpdated: string;
}

export interface CookieFunApiError {
  message: string;
  status?: number;
  handle?: string;
}

// 简单的内存缓存
const cache = new Map<string, { data: MindshareData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存

/**
 * 从缓存获取数据
 */
function getCachedData(handle: string): MindshareData | null {
  const cached = cache.get(handle);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

/**
 * 设置缓存数据
 */
function setCachedData(handle: string, data: MindshareData): void {
  cache.set(handle, { data, timestamp: Date.now() });
}

/**
 * 重试机制
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || i === retries - 1) {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
    }
    // 指数退避
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
  }
  throw new Error('Max retries reached');
}

/**
 * 从 Cookie.fun API 获取 KOL 的 Mindshare 数据
 * 
 * @param handle - KOL 的 Twitter/X handle (不含 @)
 * @param useCache - 是否使用缓存 (默认 true)
 * @returns Mindshare 数据对象
 */
export async function getMindshareData(
  handle: string,
  useCache: boolean = true
): Promise<MindshareData | null> {
  // 检查缓存
  if (useCache) {
    const cached = getCachedData(handle);
    if (cached) {
      return cached;
    }
  }

  try {
    // Cookie.fun API 端点（需要根据实际 API 文档调整）
    const apiUrl = process.env.NEXT_PUBLIC_COOKIE_FUN_API_URL || 'https://api.cookie.fun';
    const apiKey = process.env.COOKIE_FUN_API_KEY || process.env.NEXT_PUBLIC_COOKIE_FUN_API_KEY;
    
    const url = `${apiUrl}/mindshare/${encodeURIComponent(handle)}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers,
      next: { revalidate: 300 }, // Next.js 缓存 5 分钟
    });

    if (!response.ok) {
      // 如果是 404，返回 null 而不是抛出错误
      if (response.status === 404) {
        console.warn(`KOL ${handle} not found in Cookie.fun`);
        return null;
      }
      throw new Error(`Cookie.fun API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 转换 API 响应为应用格式（根据实际 API 响应结构调整）
    const mindshareData: MindshareData = {
      handle: data.handle || data.username || handle,
      mindshareScore: data.mindshare_score || data.mindshareScore || data.score || 0,
      volume: formatVolume(data.volume || data.trading_volume || 0),
      followers: formatFollowers(data.followers || data.follower_count || 0),
      stats: normalizeStats(data.stats || data.metrics || generateDefaultStats(data)),
      lastUpdated: data.last_updated || data.updated_at || new Date().toISOString(),
    };

    // 更新缓存
    if (useCache) {
      setCachedData(handle, mindshareData);
    }

    return mindshareData;
  } catch (error) {
    console.error(`Error fetching Mindshare data for ${handle}:`, error);
    // 如果 API 失败，尝试返回缓存数据（即使过期）
    if (useCache) {
      const cached = cache.get(handle);
      if (cached) {
        console.warn(`Using stale cache for ${handle}`);
        return cached.data;
      }
    }
    return null;
  }
}

/**
 * 格式化交易量
 */
function formatVolume(volume: number | string): string {
  if (typeof volume === 'string') return volume;
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
}

/**
 * 格式化粉丝数
 */
function formatFollowers(followers: number | string): string {
  if (typeof followers === 'string') return followers;
  if (followers >= 1_000_000) return `${(followers / 1_000_000).toFixed(1)}M`;
  if (followers >= 1_000) return `${(followers / 1_000).toFixed(1)}K`;
  return followers.toString();
}

/**
 * 生成默认统计数据（当 API 没有提供时）
 */
function generateDefaultStats(data: any): Array<{ subject: string; value: number; fullMark: number }> {
  // 基于现有数据生成合理的默认值
  const score = data.mindshare_score || data.score || 50;
  return [
    { subject: 'Volume', value: Math.min(score + 10, 100), fullMark: 100 },
    { subject: 'Loyalty', value: Math.min(score + 5, 100), fullMark: 100 },
    { subject: 'Alpha', value: score, fullMark: 100 },
    { subject: 'Growth', value: Math.min(score - 5, 100), fullMark: 100 },
    { subject: 'Engage', value: Math.min(score + 15, 100), fullMark: 100 },
  ];
}

/**
 * 标准化统计数据格式
 */
function normalizeStats(stats: any): Array<{ subject: string; value: number; fullMark: number }> {
  if (!Array.isArray(stats)) return generateDefaultStats({});
  
  return stats.map((stat: any) => ({
    subject: stat.subject || stat.name || stat.metric || 'Unknown',
    value: typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0,
    fullMark: stat.fullMark || stat.full_mark || stat.max || 100,
  }));
}

/**
 * 批量获取多个 KOL 的 Mindshare 数据
 * 
 * @param handles - KOL handles 数组
 * @returns Mindshare 数据对象数组
 */
export async function getBatchMindshareData(handles: string[]): Promise<MindshareData[]> {
  const results = await Promise.all(
    handles.map(handle => getMindshareData(handle))
  );
  
  return results.filter((data): data is MindshareData => data !== null);
}

/**
 * 获取 Mindshare 排行榜
 * 
 * @param limit - 返回数量限制
 * @returns 排行榜数据
 */
export async function getMindshareLeaderboard(limit: number = 10): Promise<MindshareData[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_COOKIE_FUN_API_URL || 'https://api.cookie.fun';
    const response = await fetch(`${apiUrl}/leaderboard?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${process.env.COOKIE_FUN_API_KEY || ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Cookie.fun API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
