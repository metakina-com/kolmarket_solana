# Cookie.fun API 集成指南

## 概述

KOLMarket.ai 集成了 Cookie.fun API 来获取 KOL 的 Mindshare Index 数据。本文档说明如何配置和使用该集成。

## 配置

### 环境变量

在项目根目录创建 `.env.local` 文件（或设置环境变量）：

```bash
# Cookie.fun API 配置
NEXT_PUBLIC_COOKIE_FUN_API_URL=https://api.cookie.fun
COOKIE_FUN_API_KEY=your_api_key_here
```

### 获取 API Key

**详细步骤请查看**: [如何获取 Cookie.fun API](./HOW_TO_GET_COOKIE_FUN_API.md)

**快速步骤**:
1. 访问 [Cookie.fun 官网](https://dao.cookie.fun)
2. 点击 "Request Access" 或 "API" 链接
3. 填写申请表单（可能需要说明使用场景）
4. 等待审核通过后获取 API Key
5. 将 API Key 添加到环境变量中

**注意**: 
- 开放访问（无需 API Key）可以访问部分公开数据
- 完整 API 访问需要申请并等待审核
- 不同权限等级有不同的数据访问范围

## 功能特性

### 1. 数据获取

- **单个 KOL 数据**: `getMindshareData(handle)`
- **批量数据**: `getBatchMindshareData(handles[])`
- **排行榜**: `getMindshareLeaderboard(limit)`

### 2. 缓存机制

- **内存缓存**: 5 分钟 TTL
- **Next.js 缓存**: 5 分钟 revalidation
- **降级方案**: API 失败时使用缓存或 mock 数据

### 3. 错误处理

- 自动重试机制（最多 3 次）
- 指数退避策略
- 优雅降级到 mock 数据

## 使用方法

### 在组件中使用 Hook

```tsx
import { useMindshareData } from "@/lib/hooks/useMindshareData";

function MyComponent() {
  const { data, loading, error, refetch } = useMindshareData("blknoiz06");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h3>{data.handle}</h3>
      <p>Mindshare Score: {data.mindshareScore}</p>
    </div>
  );
}
```

### 在 API 路由中使用

```typescript
import { getMindshareData } from "@/lib/data/cookie-fun";

export async function GET(req: NextRequest) {
  const data = await getMindshareData("blknoiz06");
  return NextResponse.json(data);
}
```

### 批量获取数据

```tsx
import { useBatchMindshareData } from "@/lib/hooks/useBatchMindshareData";

function MyComponent() {
  const handles = ["blknoiz06", "aeyakovenko", "CryptoWendyO"];
  const { data, loading } = useBatchMindshareData(handles);

  // data 是一个 Map<string, MindshareData>
  const ansemData = data.get("blknoiz06");
}
```

## API 响应格式

Cookie.fun API 返回的数据会被转换为以下格式：

```typescript
interface MindshareData {
  handle: string;
  mindshareScore: number;
  volume: string;        // 格式化后的交易量，如 "$2.4M"
  followers: string;     // 格式化后的粉丝数，如 "450K"
  stats: Array<{
    subject: string;     // "Volume", "Loyalty", "Alpha", etc.
    value: number;        // 0-100
    fullMark: number;     // 通常是 100
  }>;
  lastUpdated: string;   // ISO 时间戳
}
```

## 降级方案

如果 Cookie.fun API 不可用或返回错误，系统会：

1. 首先尝试使用缓存数据（即使过期）
2. 如果缓存也没有，使用组件传入的 `fallbackData`
3. 如果都没有，显示错误状态

这确保了即使在 API 故障时，用户仍能看到基本的 KOL 信息。

## 测试

### 本地测试（无 API Key）

即使没有配置 API Key，应用也会正常工作：
- 使用 mock 数据作为降级方案
- 显示加载状态
- 不会崩溃

### 使用真实 API

1. 配置 API Key
2. 确保 API URL 正确
3. 检查网络连接
4. 查看浏览器控制台日志

## 故障排查

### API 返回 404

- 检查 KOL handle 是否正确
- 确认该 KOL 在 Cookie.fun 数据库中

### API 返回 401/403

- 检查 API Key 是否正确
- 确认 API Key 未过期
- 检查 API Key 权限

### 网络错误

- 检查网络连接
- 确认 API URL 可访问
- 查看浏览器控制台错误信息

## 性能优化

1. **缓存策略**: 数据缓存 5 分钟，减少 API 调用
2. **批量请求**: 使用 `useBatchMindshareData` 并行获取多个 KOL 数据
3. **按需加载**: 只在需要时获取数据
4. **降级方案**: 避免因 API 故障影响用户体验

## 下一步

- [ ] 实现 WebSocket 实时更新
- [ ] 添加数据历史趋势图表
- [ ] 实现数据导出功能
- [ ] 添加更多 KOL 指标
