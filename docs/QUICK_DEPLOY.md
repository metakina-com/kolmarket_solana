# 快速部署指南（Cloudflare 兼容版）

## 🚀 快速部署方案

### 方案 0: Cloudflare Containers（最佳，需付费）⭐⭐⭐⭐⭐

**如果已有 Cloudflare 付费计划，这是最佳方案！**

详细说明请参考: [Cloudflare Containers 解决方案](./CLOUDFLARE_CONTAINERS_SOLUTION.md)

---

### 方案 1: 使用降级实现（推荐免费用户）⭐

**最简单、最快、完全兼容 Cloudflare**

#### 步骤 1: 构建项目

```bash
npm run build
```

#### 步骤 2: 部署到 Cloudflare Pages

```bash
npx wrangler pages deploy .next
```

#### 步骤 3: 配置环境变量

在 Cloudflare Dashboard → Pages → Settings → Environment variables 添加：

```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
ELIZA_MODEL_PROVIDER=CLOUDFLARE_AI
ELIZA_MODEL=@cf/meta/llama-3-8b-instruct
```

**完成！** ✅

系统会自动使用降级实现，所有功能可用（功能有限但稳定）。

---

### 方案 2: 分离架构（完整功能）

**需要独立服务器，但功能完整**

#### 步骤 1: 部署主应用到 Cloudflare

```bash
npm run build
npx wrangler pages deploy .next
```

#### 步骤 2: 创建独立 ElizaOS 服务器

```bash
# 创建新目录
mkdir elizaos-server
cd elizaos-server

# 初始化
npm init -y
npm install express @elizaos/core @elizaos/plugin-twitter @elizaos/plugin-discord @elizaos/plugin-telegram @elizaos/plugin-solana-agent-kit

# 创建服务器文件（参考 docs/CLOUDFLARE_COMPATIBILITY.md）
```

#### 步骤 3: 部署独立服务器

部署到 Railway/Render/Fly.io 或 VPS

#### 步骤 4: 配置环境变量

在 Cloudflare Pages 中添加：

```bash
ELIZAOS_SERVER_URL=https://your-elizaos-server.com
```

---

## 📊 方案对比

| 方案 | 部署时间 | 成本 | 功能完整性 | Cloudflare 兼容 | 推荐度 |
|------|---------|------|-----------|----------------|--------|
| **Cloudflare Containers** | 30 分钟 | 💰💰 中（需付费） | ⭐⭐⭐⭐⭐ | ✅ 完全兼容 | ⭐⭐⭐⭐⭐ |
| 降级实现 | 5 分钟 | 💰 免费 | ⭐⭐⭐ | ✅ 完全兼容 | ⭐⭐⭐⭐ |
| 分离架构 | 30 分钟 | 💰 低 | ⭐⭐⭐⭐⭐ | ✅ 完全兼容 | ⭐⭐⭐⭐ |

---

## ✅ 推荐

**根据情况选择**:

1. **有 Cloudflare 付费计划**: 使用 **Cloudflare Containers**
   - 最佳体验
   - 功能完整
   - 全局部署

2. **免费计划或快速上线**: 使用 **降级实现**
   - 快速上线
   - 验证功能
   - 零额外成本

3. **需要完整功能但无付费计划**: 使用 **分离架构**
   - 功能完整
   - 成本可控
   - 灵活部署

---

**详细说明**: 参考 [Cloudflare 兼容性分析](./CLOUDFLARE_COMPATIBILITY.md)
