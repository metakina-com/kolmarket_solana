# 如何获取 Cookie.fun API 访问权限

## 📋 概述

Cookie.fun（Cookie DAO）是一个为 AI Agents 提供的模块化数据层，提供 KOL Mindshare Index、项目分析、情感分析等数据。本文档详细说明如何获取 API 访问权限。

## 🔗 官方资源

- **应用平台**: [https://app.cookie3.co](https://app.cookie3.co) ⭐ **主要入口**
- **官网**: [https://dao.cookie.fun](https://dao.cookie.fun)
- **商业版**: [https://www.cookie3.com/business](https://www.cookie3.com/business)
- **文档**: [https://docs.cookie.community](https://docs.cookie.community)
- **API 文档**: [https://dao.cookie.fun/api](https://dao.cookie.fun/api)

## 📝 获取步骤

### 步骤 1: 注册并创建账户

1. 打开浏览器，访问 **[https://app.cookie3.co](https://app.cookie3.co)** ⭐
2. 点击 "Sign Up" 或 "Register" 注册新账户
3. 完成账户创建和基础配置
4. 在 Dashboard（仪表板）中完成个人/项目资料设置

### 步骤 2: 完成 Onboarding Call

**重要**: 根据 Cookie3 的流程，获取 API Key 通常需要：

1. **完成 Onboarding Call（入职会议）**
   - 与销售/商务代表沟通
   - 说明你的项目需求和使用场景
   - 完成 onboarding call 后可以申请免费试用
   - 这是获取 API 访问权限的关键步骤

2. **联系商务团队**
   - 通过官网联系销售团队
   - 或通过 Dashboard 内的联系入口
   - 说明你需要 API 访问权限

### 步骤 3: 申请 API Key

完成 onboarding call 后：

1. 在 Dashboard 中查找 **"API"**、**"Developer"**、**"Access"** 或 **"Request Access"** 入口
2. 填写 API 申请表单：
   - 项目名称: KOLMarket.ai
   - 使用场景: KOL Mindshare Index 数据展示和分析
   - 预期使用量: 说明你的 API 调用频率需求
3. 等待审核和批准

### 步骤 4: 选择订阅套餐

根据你的需求选择合适的套餐：

- **基础版**: 适合小规模使用
- **增长版**: 适合中等规模项目
- **企业版**: 完整功能和最高限额

不同套餐的差异：
- API 调用频率限制（Rate Limits）
- 可访问的数据类型和深度
- 历史数据追溯范围
- 支持的区块链网络数量
- 钱包分析数量限制

### 步骤 5: 获取 API Key

一旦申请通过，你会收到：

1. **API Key** 或 **Bearer Token**
   - 在 Dashboard 的 API 设置页面可以查看和管理
   - 格式通常类似: `ck_live_xxxxxxxxxxxxx` 或 `Bearer xxxxxx`
2. **API 端点 URL**
   - 可能是 `https://api.cookie.fun` 
   - 或 `https://dao.cookie.fun/api`
   - 或 Cookie3 特定的 API 端点
   - **具体以 Dashboard 中显示的为准**
3. **Rate Limit 信息**（请求频率限制）
   - 根据你的订阅套餐确定
   - 通常在 API 文档中说明
4. **权限等级说明**
   - 可访问的 endpoints 列表
   - 数据类型权限（社交数据、链上数据、KOL 数据等）
   - 历史数据范围

## 🔑 API Key 格式

Cookie.fun API 通常使用以下认证方式：

```http
Authorization: Bearer YOUR_API_KEY
```

或

```http
Authorization: API_Key YOUR_API_KEY
```

## 📊 权限等级说明

| 等级 | 说明 | 数据范围 | Rate Limit |
|------|------|----------|------------|
| **免费/开放** | 无需 API Key | 基础数据、公开排行榜 | 较低 |
| **标准** | 注册用户 | 更多项目数据、历史数据（几周） | 中等 |
| **高级** | 付费/代币持有者 | 完整历史数据、高级分析 | 较高 |
| **Alpha/Beta** | 早期访问 | 所有功能、优先支持 | 最高 |

## 🛠️ 配置到项目中

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# Cookie.fun API 配置
NEXT_PUBLIC_COOKIE_FUN_API_URL=https://api.cookie.fun
# 或
# NEXT_PUBLIC_COOKIE_FUN_API_URL=https://dao.cookie.fun/api

COOKIE_FUN_API_KEY=your_api_key_here
```

### 2. 更新 API 客户端

如果 Cookie.fun 的实际 API 端点与默认不同，需要更新 `lib/data/cookie-fun.ts`：

```typescript
const apiUrl = process.env.NEXT_PUBLIC_COOKIE_FUN_API_URL || 'https://api.cookie.fun';
```

### 3. 测试 API 连接

运行开发服务器并测试：

```bash
npm run dev
```

访问页面，查看浏览器控制台是否有 API 请求日志。

## 🔍 可用的 API 端点（参考）

根据 Cookie.fun 文档，可能包含以下端点：

### Mindshare 相关

```
GET /api/mindshare/{handle}
GET /api/mindshare/leaderboard
GET /api/projects/{project_id}/mindshare
```

### 项目分析

```
GET /api/projects/{project_id}/sentiment
GET /api/projects/{project_id}/trends
```

### KOL/创作者数据

```
GET /api/creators/{handle}
GET /api/creators/leaderboard
```

### 测试端点

```
GET /api/fun/roast  # 测试认证和请求结构
```

**注意**: 实际端点名称可能不同，请参考官方最新文档。

## ⚠️ 重要提示

### 1. Rate Limits（请求频率限制）

- Cookie.fun 有 Rate Limit 限制
- 超出限制会返回 `429 Too Many Requests`
- 建议：
  - 使用缓存减少请求
  - 批量请求时控制频率
  - 实现重试机制

### 2. 数据权限

- 不同权限等级可访问的数据范围不同
- 历史数据的时间范围取决于权限等级
- 免费等级可能只能访问几周的数据

### 3. API 版本

- 当前版本: **v0.4** (Live v0.4)
- API 端点可能包含版本号，如 `/api/v0.4/...`
- 注意查看官方文档的最新版本

## 🧪 测试 API（无 API Key）

即使没有 API Key，项目也能正常工作：

1. **使用 Mock 数据**: 系统会自动使用 fallback 数据
2. **查看加载状态**: 可以看到数据加载过程
3. **不会崩溃**: 优雅降级确保用户体验

## 📞 获取帮助

如果遇到问题：

1. **查看官方文档**: [https://docs.cookie.community](https://docs.cookie.community)
2. **联系支持**: 通过官网的联系方式
3. **社区支持**: 查看 Cookie DAO 的 Discord 或 Telegram

## 🚀 下一步

获取 API Key 后：

1. ✅ 配置环境变量
2. ✅ 测试 API 连接
3. ✅ 根据实际 API 响应调整数据格式转换
4. ✅ 实现更多功能（历史数据、趋势分析等）

## 📚 相关文档

- [Cookie.fun 集成指南](./COOKIE_FUN_INTEGRATION.md)
- [数据层完成报告](./DATA_LAYER_COMPLETE.md)
- [项目架构文档](./ARCHITECTURE.md)

---

**最后更新**: 2026-01-21  
**注意**: API 端点和获取方式可能随时更新，请参考官方最新文档。
