# KOLMarket.ai 技术栈文档

## 📋 技术栈总览

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 15.0.0 | React 全栈框架，App Router |
| **React** | 18.3.1 | UI 库 |
| **TypeScript** | 5.5.0 | 类型安全 |

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Tailwind CSS** | 3.4.4 | 原子化 CSS 框架 |
| **Framer Motion** | 11.3.0 | 动画库 |
| **Lucide React** | 0.424.0 | 图标库 |
| **Recharts** | 2.12.0 | 图表库（雷达图等） |
| **clsx** | 2.1.1 | className 工具 |
| **tailwind-merge** | 2.4.0 | Tailwind 类名合并 |

### 区块链技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **@solana/web3.js** | 1.95.2 | Solana 区块链交互 |
| **@solana/wallet-adapter-react** | 0.15.35 | Solana 钱包适配器（React） |
| **@solana/wallet-adapter-react-ui** | 0.9.35 | 钱包 UI 组件 |
| **@solana/wallet-adapter-wallets** | 0.19.32 | 钱包适配器集合 |
| **@solana/spl-token** | 0.4.14 | SPL Token 操作 |

### AI 和云服务

| 技术 | 版本 | 用途 |
|------|------|------|
| **Cloudflare Workers AI** | - | AI 模型推理（Llama-3-8b） |
| **@cloudflare/next-on-pages** | 1.13.0 | Next.js 部署到 Cloudflare Pages |

### 开发工具

| 技术 | 版本 | 用途 |
|------|------|------|
| **ESLint** | 8.57.0 | 代码检查 |
| **PostCSS** | 8.4.39 | CSS 处理 |
| **Autoprefixer** | 10.4.19 | CSS 前缀自动添加 |
| **Wrangler** | 3.114.17 | Cloudflare Workers 开发工具 |

## 🏗️ 架构层级技术栈

### 应用层 (Application Layer)

**技术栈**: Next.js 15 + Recharts  
**状态**: ✅ 已完成

- **框架**: Next.js 15 (App Router)
- **UI 组件**: React 18
- **样式**: Tailwind CSS
- **图表**: Recharts
- **动画**: Framer Motion
- **图标**: Lucide React

### 智能体层 (Agent Layer)

**技术栈**: 自定义 KOL 个性化系统  
**状态**: ✅ 基础功能已完成

- **个性化配置**: TypeScript 类型系统
- **AI 后端**: Cloudflare Workers AI
- **模型**: Llama-3-8b-instruct
- **未来计划**: ai16z / Eliza Framework

### 执行层 (Execution Layer)

**技术栈**: @solana/web3.js  
**状态**: ✅ 基础功能已完成

- **区块链交互**: @solana/web3.js
- **Token 操作**: @solana/spl-token
- **钱包集成**: @solana/wallet-adapter-react
- **未来计划**: Solana Agent Kit + LangChain

### 数据层 (Data Layer)

**技术栈**: Cookie.fun API  
**状态**: ✅ 基础功能已完成

- **API 客户端**: Fetch API
- **数据缓存**: 内存缓存 + Next.js 缓存
- **数据源**: Cookie.fun API (待真实 API Key)

### 算力层 (Compute Layer)

**技术栈**: Cloudflare Workers AI  
**状态**: ✅ 已集成

- **当前**: Cloudflare Workers AI
- **未来计划**: Nosana (去中心化算力) 或 AWS

## 🎨 设计系统

### 主题风格

- **主题**: Cyberpunk / Sci-Fi
- **背景色**: `bg-slate-950` (深色)
- **强调色**: 
  - `cyan-500` (霓虹蓝)
  - `purple-500` (紫色)
- **UI 效果**: 
  - Glassmorphism (毛玻璃效果)
  - 细边框
  - 发光效果

### UI 组件库

- **自定义组件**: 基于 Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **图表**: Recharts

## 🔌 集成服务

### 已集成 ✅

1. **Solana 钱包**
   - Phantom
   - Solflare
   - 支持更多钱包（通过 wallet-adapter）

2. **Cloudflare Workers AI**
   - Llama-3-8b-instruct 模型
   - Edge Runtime 支持

3. **Cookie.fun API** (基础功能)
   - API 客户端
   - 数据缓存
   - 降级方案

### 待集成 🔄

1. **Cookie.fun API** (完整功能)
   - 需要真实 API Key
   - 完整数据集成

2. **Solana Agent Kit**
   - LangChain 集成
   - 更智能的交易策略

3. **ai16z / Eliza Framework**
   - 数字生命框架
   - 高级智能体功能

4. **Nosana / AWS**
   - 算力层优化
   - 分布式计算

## 📦 依赖管理

### 生产依赖 (dependencies)

```json
{
  "@cloudflare/next-on-pages": "^1.13.0",
  "@solana/spl-token": "^0.4.14",
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/wallet-adapter-react-ui": "^0.9.35",
  "@solana/wallet-adapter-wallets": "^0.19.32",
  "@solana/web3.js": "^1.95.2",
  "clsx": "^2.1.1",
  "framer-motion": "^11.3.0",
  "lucide-react": "^0.424.0",
  "next": "^15.0.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "recharts": "^2.12.0",
  "tailwind-merge": "^2.4.0"
}
```

### 开发依赖 (devDependencies)

```json
{
  "@types/node": "^20.14.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "autoprefixer": "^10.4.19",
  "eslint": "^8.57.0",
  "eslint-config-next": "^14.2.0",
  "postcss": "^8.4.39",
  "tailwindcss": "^3.4.4",
  "typescript": "^5.5.0",
  "wrangler": "^3.114.17"
}
```

## 🚀 部署技术

### Cloudflare Pages

- **适配器**: @cloudflare/next-on-pages
- **配置**: wrangler.toml
- **AI 绑定**: Workers AI
- **Edge Runtime**: 支持

### 开发环境

- **Node.js**: 推荐 18+ 或 20+
- **包管理器**: npm
- **开发服务器**: Next.js Dev Server

## 📊 技术栈统计

- **总依赖数**: 13 个生产依赖 + 9 个开发依赖
- **主要语言**: TypeScript
- **框架**: Next.js 15
- **区块链**: Solana
- **AI**: Cloudflare Workers AI
- **部署**: Cloudflare Pages

## 🔄 技术栈演进计划

### 短期 (已完成)

- ✅ Next.js 15 + React 18
- ✅ Solana Web3.js 集成
- ✅ Cloudflare Workers AI
- ✅ Tailwind CSS + Framer Motion

### 中期 (进行中)

- 🔄 Cookie.fun API 完整集成
- 🔄 用户钱包签名集成
- 🔄 更多交易类型支持

### 长期 (计划中)

- 📋 Solana Agent Kit + LangChain
- 📋 ai16z / Eliza Framework
- 📋 Nosana 去中心化算力
- 📋 SPL Token 完整支持

---

**最后更新**: 2026-01-21  
**维护者**: KOLMarket.ai Team
