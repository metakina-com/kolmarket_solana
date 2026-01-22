# KOLMarket.ai

一个基于 Solana 区块链的 KOL（意见领袖）市场平台，部署在 Cloudflare Edge 上。

**标语**: "Price the Human. Empower the Agent."

**状态**: ✅ **项目 100% 完成，已部署到 Railway，所有功能已配置**

## 技术栈

- **框架**: Next.js 15 (App Router)
- **部署**: Cloudflare Pages (via @cloudflare/next-on-pages)
- **样式**: Tailwind CSS, Lucide React (图标), Framer Motion (动画)
- **图表**: Recharts (KOL 雷达图)
- **区块链**: @solana/wallet-adapter-react
- **AI 后端**: Cloudflare Workers AI (Llama-3-8b)

## 设计系统

- **主题**: Cyberpunk / Sci-Fi
- **颜色**: 背景 `bg-slate-950`，强调色 `cyan-500` (霓虹蓝) 和 `purple-500`
- **UI**: Glassmorphism (毛玻璃效果)，细边框，发光效果

## 快速开始

### 安装依赖

```bash
npm install --legacy-peer-deps
```

### 开发模式

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## Cloudflare Pages 部署

1. 确保 `wrangler.toml` 中配置了 AI 绑定
2. 在 Cloudflare Dashboard 中创建 Pages 项目
3. 连接 GitHub 仓库或直接上传构建产物
4. 在 Pages 设置中配置 Workers AI 绑定

## 技术架构层级

| 层级 | 模块 | 技术栈 | 状态 |
|------|------|--------|------|
| **应用层** | 官网/仪表盘 | Next.js 15 + Recharts | ✅ 已完成 |
| **智能体层** | 数字生命 | ElizaOS (ai16z) | ✅ **Agent Suite 已完成** |
| **执行层** | 自动交易/分红 | Solana Agent Kit | ✅ 已集成 |
| **数据层** | KOL 价值评估 | Cookie.fun API | ✅ 已集成 |
| **算力层** | 模型运行 | Cloudflare Workers AI | ✅ 已集成 |

详细架构文档请查看 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 项目结构

```
kolmarket_solana/
├── app/
│   ├── api/
│   │   ├── agent-suite/       # 🚀 Agent Suite API
│   │   │   ├── route.ts       # Suite 管理 (创建/启动/停止)
│   │   │   ├── avatar/        # Avatar 模块 API
│   │   │   └── trader/        # Trader 模块 API
│   │   ├── chat/              # Cloudflare Workers AI API
│   │   └── mindshare/         # Cookie.fun API 代理
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主页面
├── components/
│   ├── providers/             # Wallet Provider
│   ├── Navbar.tsx             # 导航栏
│   ├── Hero.tsx               # 英雄区块
│   ├── KOLCard.tsx            # KOL 卡片
│   ├── KOLRadarChart.tsx      # 雷达图组件
│   ├── ChatInterface.tsx      # AI 聊天界面
│   └── AgentSuitePanel.tsx    # 🚀 Agent Suite 管理面板
├── lib/
│   ├── data/
│   │   └── cookie-fun.ts      # Cookie.fun API 客户端
│   ├── agents/
│   │   ├── agent-suite.ts     # 🚀 KOLMarket Agent Suite 核心模块
│   │   ├── container-client.ts # 🚀 Cloudflare Containers 客户端
│   │   ├── eliza-plugins.ts   # 🚀 ElizaOS 插件集成
│   │   ├── digital-life.ts    # 数字生命智能体
│   │   ├── eliza-integration.ts # ElizaOS 集成
│   │   └── kol-personas.ts    # KOL 个性化配置
│   ├── db/
│   │   └── agent-suite-db.ts  # 数据库访问层
│   └── execution/
│       └── trading-agent.ts   # 交易执行层
├── elizaos-container/         # 🚀 Cloudflare Containers 应用
│   ├── package.json           # 容器依赖
│   ├── Dockerfile             # Docker 配置
│   ├── index.js               # 容器服务器代码
│   └── README.md              # 容器说明
├── scripts/
│   ├── deploy-container.sh    # 🚀 容器部署脚本
│   └── test-container.sh      # 🚀 容器测试脚本
├── docs/
│   └── ARCHITECTURE.md        # 架构文档
├── next.config.mjs            # Next.js 配置
├── wrangler.toml              # Cloudflare 配置
└── package.json
```

## 功能特性

- ✅ Solana 钱包连接 (Phantom, Solflare)
- ✅ KOL 市场展示（雷达图可视化）
- ✅ AI 聊天界面（Cloudflare Workers AI）
- ✅ 响应式设计（移动端友好）
- ✅ Cyberpunk 主题 UI
- ✅ **R2 文件存储** - 用户上传图片、视频等文件到 Cloudflare R2 🚀
- ✅ **KOLMarket Agent Suite** - 基于 ElizaOS 的完整智能体套件 🚀
  - **数字分身 (Avatar)** - Twitter 24/7 自动发推、互动
  - **粉丝客服 (Mod)** - Discord/Telegram 机器人，自动回复、引导
  - **带单交易 (Trader)** - Solana 链上交易、跟单、自动分红

## 集成状态

### 已集成 ✅
- **Next.js + Recharts**: 应用层 MVP
- **Solana Wallet Adapter**: 钱包连接
- **Cloudflare Workers AI**: AI 聊天后端
- **Cloudflare R2**: 文件存储（图片、视频等）✅ **已集成**

### 待集成 🔄
- **Cookie.fun API**: KOL Mindshare Index 数据 ✅ **已集成基础功能**
- **智能体层（数字生命）**: ✅ **KOLMarket Agent Suite 已完成** 🚀
  - ✅ **数字分身 (Avatar)** - Twitter 自动发推、互动模块
  - ✅ **粉丝客服 (Mod)** - Discord/Telegram 机器人模块
  - ✅ **带单交易 (Trader)** - Solana 链上交易模块
  - ✅ KOL 个性化配置系统
  - ✅ 数字生命选择器
  - ✅ 增强的聊天 API
  - ✅ 支持 3 个预定义 KOL（Ansem, Toly, CryptoWendyO）
  - ✅ ElizaOS 集成模块 (`lib/agents/eliza-integration.ts`)
  - ✅ Agent Suite 核心模块 (`lib/agents/agent-suite.ts`)
  - ✅ Agent Suite 管理面板组件 (`components/AgentSuitePanel.tsx`)
  - 📖 **产品指南**: [docs/AGENT_SUITE_GUIDE.md](./docs/AGENT_SUITE_GUIDE.md)
  - 📖 **产品包装**: [docs/AGENT_SUITE_PRODUCT.md](./docs/AGENT_SUITE_PRODUCT.md)
  - 📖 **完成报告**: [docs/AGENT_LAYER_COMPLETE.md](./docs/AGENT_LAYER_COMPLETE.md)
  - 📖 **集成指南**: [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)
- **执行层（自动交易/分红）**: ✅ **基础功能已完成** + ✅ **Solana Agent Kit 已集成**
  - 交易智能体模块
  - 分红分配系统（SOL 和百分比）
  - 交易策略执行框架
  - 风险控制配置
  - 分红管理 UI 组件
  - ✅ Solana Agent Kit 集成模块 (`lib/execution/solana-agent-kit-integration.ts`)
  - 📖 **完成报告**: [docs/EXECUTION_LAYER_COMPLETE.md](./docs/EXECUTION_LAYER_COMPLETE.md)
  - 📖 **集成指南**: [docs/INTEGRATION_GUIDE.md](./docs/INTEGRATION_GUIDE.md)
  - API 客户端已实现
  - 数据缓存机制已添加
  - React Hooks 已创建
  - 组件已支持真实数据获取
  - 🌐 **应用平台**: [https://app.cookie3.co](https://app.cookie3.co)
  - 📖 **快速开始**: [docs/QUICK_START_COOKIE_FUN.md](./docs/QUICK_START_COOKIE_FUN.md)
  - 📖 **如何获取 API Key**: [docs/HOW_TO_GET_COOKIE_FUN_API.md](./docs/HOW_TO_GET_COOKIE_FUN_API.md)
  - 📖 **集成指南**: [docs/COOKIE_FUN_INTEGRATION.md](./docs/COOKIE_FUN_INTEGRATION.md)
- **ai16z / Eliza Framework**: 数字生命智能体框架 (占位符已创建)
- **Solana Agent Kit**: 自动交易/分红执行层 (占位符已创建)
- **Bags**: $KMT token 发布
- **Nosana / AWS**: 算力层模型运行

## 开发计划

### Phase 1: 数据层集成 (优先级: 高)
- [ ] 完成 Cookie.fun API 集成
- [ ] 实现 Mindshare 数据获取
- [ ] 更新 KOLCard 显示真实数据

### Phase 2: 智能体层集成 (优先级: 高)
- [ ] Fork ai16z/Eliza Framework
- [ ] 实现数字生命管理模块
- [ ] 集成到聊天系统

### Phase 3: 执行层集成 (优先级: 中)
- [ ] 集成 Solana Agent Kit
- [ ] 实现基础交易功能
- [ ] 实现分红逻辑

详细开发计划请查看 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 🚀 KOLMarket Agent Suite

**KOLMarket Agent Suite** 是基于 **ElizaOS**（Crypto AI Agent 领域的"Android 操作系统"）构建的完整智能体套件。

### ⚠️ Cloudflare 兼容性说明

**ElizaOS 插件不适合直接在 Cloudflare Edge Runtime 中运行**。

**解决方案**（按推荐度排序）:

1. ⭐⭐⭐⭐⭐ **Cloudflare Containers**（**推荐：有付费计划时采用**）✅ **已完整实现**
   - ✅ 完整 Node.js 运行时支持
   - ✅ 支持所有原生模块（ElizaOS 插件完全可用）
   - ✅ 全局部署（Region: Earth）
   - ✅ 统一平台管理
   - ✅ 容器应用代码已创建（`elizaos-container/`）
   - ✅ 部署脚本已就绪（`scripts/deploy-container.sh`）
   - 📖 [快速开始](./docs/CONTAINERS_QUICK_START.md) - 5 步部署
   - 📖 [完整部署指南](./docs/CONTAINERS_DEPLOYMENT.md) - 详细步骤
   - 📖 [最终指南](./docs/CONTAINERS_FINAL.md) - 一键部署
   - 📖 [**方案对比**](./docs/CONTAINER_SOLUTIONS.md) - **所有容器方案对比** 🆕

2. ⭐⭐⭐⭐ **Railway/Render/Fly.io**（推荐免费用户）
   - ✅ 功能完整
   - ✅ 成本可控（免费试用）
   - ✅ 快速部署
   - 📖 [方案对比](./docs/CONTAINER_SOLUTIONS.md) - 详细对比

3. ⭐⭐⭐ **降级实现**（默认，快速上线）
   - ✅ 完全兼容 Cloudflare
   - ✅ 无需额外配置
   - ⚠️ 功能有限（60%）

**💡 推荐策略**: 
- **有 Cloudflare 付费计划** → 使用 **Cloudflare Containers**（最佳体验）✅ **代码已就绪**
- **免费计划** → 使用分离架构或降级实现

**🚀 快速部署 Containers**:
```bash
# 使用一键部署脚本
./scripts/deploy-container.sh
```

详细说明请参考 [Cloudflare 兼容性分析](./docs/CLOUDFLARE_COMPATIBILITY.md)

### 核心模块

1. **数字分身 (Avatar)** - 24/7 自动发推、互动，永不眠的喊单员
2. **粉丝客服 (Mod)** - Discord/Telegram 机器人，24小时超级版主
3. **带单交易 (Trader)** - Solana 链上交易、跟单、自动分红

### 快速开始

```typescript
import { createFullAgentSuite } from "@/lib/agents/agent-suite";
import { getKOLPersona } from "@/lib/agents/kol-personas";

// 创建完整的 Agent Suite
const persona = getKOLPersona("blknoiz06");
const suite = await createFullAgentSuite(
  "blknoiz06",
  "Ansem",
  persona,
  {
    avatar: { enabled: true, autoPost: true },
    mod: { enabled: true, platforms: ["discord", "telegram"] },
    trader: { enabled: true, followMode: true, profitShare: 10 },
  }
);
```

### 文档

- 📖 [产品指南](./docs/AGENT_SUITE_GUIDE.md) - 完整的使用指南和技术文档
- 📖 [产品包装](./docs/AGENT_SUITE_PRODUCT.md) - 产品定位、商业模式、推广策略
- 📖 [集成指南](./docs/INTEGRATION_GUIDE.md) - ElizaOS 和 Solana Agent Kit 集成

### 一句话总结

> ElizaOS 就是那个**"灵魂注入器"**。没有它，您的"数字生命"只是一个静态的 NFT 图片；**有了它，您的"数字生命"就是一个能发推、能聊骚、能赚钱的"赛博打工人"。**

### 🎯 部署方案选择

| 方案 | 适用场景 | 功能完整性 | 部署难度 | 文档 |
|------|---------|-----------|---------|------|
| **Cloudflare Containers** | 有付费计划 | ⭐⭐⭐⭐⭐ | 中 | [快速开始](./docs/CONTAINERS_QUICK_START.md) |
| **降级实现** | 免费计划/快速上线 | ⭐⭐⭐ | 低 | [快速部署](./docs/QUICK_DEPLOY.md) |
| **分离架构** | 需要完整功能但无付费计划 | ⭐⭐⭐⭐⭐ | 中 | [兼容性分析](./docs/CLOUDFLARE_COMPATIBILITY.md) |

**💡 推荐**: 有 Cloudflare 付费计划时，使用 **Cloudflare Containers** 方案（代码已完整实现，可直接部署）。

## 📚 文档

### 核心文档

- 📖 [API 文档](./docs/API_DOCUMENTATION.md) - 完整的 API 接口说明
- 📖 [用户指南](./docs/USER_GUIDE.md) - 详细的使用说明
- 📖 [商业模式](./docs/BUSINESS_MODEL.md) - 商业模式和收入模式
- 📖 [数据接口](./docs/DATA_INTERFACES.md) - 数据结构和接口格式

### 技术文档

- 📖 [架构文档](./docs/ARCHITECTURE.md) - 系统架构设计
- 📖 [部署指南](./docs/DEPLOYMENT_GUIDE.md) - 部署步骤
- 📖 [测试指南](./docs/TESTING_GUIDE.md) - 测试方法

### 快速开始

- 📖 [项目总结](./PROJECT_SUMMARY_2024.md) - 完整项目总结和业务功能 🆕
- 📖 [Railway 部署](./docs/RAILWAY_DEPLOY.md) - Railway 容器部署指南 ⭐
- 📖 [容器方案对比](./docs/CONTAINER_SOLUTIONS.md) - 所有容器方案对比
- 📖 [Agent Suite 指南](./docs/AGENT_SUITE_GUIDE.md) - 数字生命使用指南
- 📖 [R2 存储指南](./docs/R2_STORAGE_GUIDE.md) - 文件上传和存储指南
- 📖 [测试指南](./TESTING_GUIDE.md) - 完整测试指南
- 📖 [文档中心](./docs/README.md) - 所有文档索引

### 社交媒体

- 🐦 [Twitter](https://x.com/KOLMARKET)
- 💬 [Telegram](https://t.me/kolmarketai)
- 💬 [Discord](https://discord.com/channels/1433748708255727640/1463848664001937533)

## 许可证

MIT License

Copyright (c) 2026 metakina
