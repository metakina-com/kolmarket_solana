Project: KOLMarket.ai (Cloudflare Edition)

Vision

A Solana-based SocialFi platform hosted on Cloudflare Edge.
Tagline: "Price the Human. Empower the Agent."

## 技术架构层级

| 层级 | 模块 | 采用的技术 |
|------|------|-----------|
| **应用层** | 官网 / 仪表盘 | Next.js 15 + Recharts (已提供 MVP 代码) ✅ |
| **智能体层** | 数字生命 (Digital Life) | ai16z / Eliza Framework (直接 Fork) |
| **执行层** | 自动交易/分红 | Solana Agent Kit (LangChain 集成) |
| **数据层** | KOL 价值评估 | Cookie.fun API (Mindshare Index) |
| **算力层** | 模型运行 | Nosana (后期) 或 AWS (前期) |

## Tech Stack

Framework: Next.js 15 (App Router)

Deployment: Cloudflare Pages (via @cloudflare/next-on-pages)

Styling: Tailwind CSS, Lucide React (Icons), Framer Motion (Animations)

Charts: Recharts (for KOL Radar Charts)

Blockchain: @solana/wallet-adapter-react

AI Backend: Cloudflare Workers AI (Llama-3-8b)

Design System

Theme: Cyberpunk / Sci-Fi.

Colors: Background bg-slate-950. Accents cyan-500 (Neon Blue) and purple-500.

UI: Glassmorphism (backdrop-blur), thin borders, glowing effects.

## Integrations

### 已集成 ✅
- **Next.js + Recharts**: 应用层 MVP 已完成
- **Solana Wallet Adapter**: 钱包连接功能
- **Cloudflare Workers AI**: AI 聊天后端

### 待集成 🔄
- **Cookie.fun API**: KOL Mindshare Index 数据集成 ✅ **基础功能已完成**
- **ElizaOS** (原 ai16z / Eliza Framework): 数字生命智能体框架 ✅ **已集成**
  - ✅ 安装 @elizaos/core 和 @elizaos/plugin-solana-agent-kit
  - ✅ 创建 ElizaOS 集成模块
  - ✅ KOL 个性化配置系统
  - ✅ 数字生命选择器
  - ✅ 增强的聊天 API
  - ✅ 支持多个预定义 KOL
  - 🔄 需要完整配置（数据库、模型提供者等）
- **Solana Agent Kit**: LangChain 集成的自动交易/分红执行层 ✅ **已集成**
  - ✅ 安装 solana-agent-kit 和 langchain
  - ✅ 创建 Solana Agent Kit 集成模块
  - ✅ 交易智能体模块（支持 Agent Kit 降级）
  - ✅ 分红分配系统（支持 Agent Kit 降级）
  - ✅ 交易策略执行框架
  - ✅ 风险控制配置
  - ✅ 分红管理 UI 组件
- **Bags**: $KMT token 发布
- **Nosana / AWS**: 算力层模型运行



---

### 第二步：复制下面的 Master Prompt 到 Cursor

打开 Cursor 的 Composer (`Cmd + I` 或 `Ctrl + I`)，**一次性复制**以下所有英文内容并发送：

```markdown
@project_context.md

You are a Senior Full-Stack Web3 Developer expert in Next.js 14, Cloudflare Workers, and Solana.
I want to build the MVP for "KOLMarket.ai" based on the context provided.

Please execute the following steps to scaffold and build the application:

### Step 1: Configuration & Setup for Cloudflare
- Ensure the project is set up for **Cloudflare Pages** deployment.
- Create/Update `next.config.mjs` to use the `setupDevPlatform` from `@cloudflare/next-on-pages/next-dev`.
- Create a `wrangler.toml` file configured for Cloudflare Pages with a binding for `AI` (Workers AI).
- Install necessary dependencies: `lucide-react`, `recharts`, `framer-motion`, `clsx`, `tailwind-merge`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, `@solana/wallet-adapter-wallets`, `@solana/web3.js`, and `@cloudflare/ai`.

### Step 2: Components & UI (Cyberpunk Style)
Create a clean folder structure `components/ui` and `components/features`.
- **Navbar:** Glass effect, fixed top. Includes logo "KOLMarket.ai", navigation links, and a `WalletConnectButton` (styled to match the dark theme).
- **Hero Section:**
  - Headline: "Price the Human. Empower the Agent."
  - Subhead: "The 1st Identity Layer for AI Agents on Solana."
  - Badges: "Powered by: ai16z | Cookie.fun | Solana Agent Kit".
  - CTA Button: "Launch App" (Gradient Cyan/Blue).
- **KOLCard Component:**
  - A glass-card displaying a KOL profile (mock data: Ansem, Toly).
  - **CRITICAL:** Implement a `RadarChart` from `recharts` showing stats (Volume, Loyalty, Alpha, Growth, Engage). Wrap it in `ResponsiveContainer` to avoid errors.
  - Show a "Mindshare Score" badge.
- **ChatInterface Component (AI Demo):**
  - A floating chat window or section.
  - UI mimics a terminal or sci-fi chat.
  - It should call the backend API to simulate chatting with a KOL's "Digital Life".

### Step 3: Backend API (Cloudflare Workers AI)
Create an API route at `app/api/chat/route.ts`:
- Set `export const runtime = 'edge'`.
- Use `@cloudflare/ai` to interact with the `@cf/meta/llama-3-8b-instruct` model.
- Logic: Accept a prompt, simulate a KOL persona (e.g., "You are Ansem, a crypto trader"), and stream the response back.

### Step 4: Page Assembly
- Update `app/page.tsx` to assemble these components into a cohesive Landing Page.
- Add a background effect: A subtle grid pattern (`bg-[linear-gradient...]`) and a glowing orb blur effect in the center.

**Constraints:**
- Use strictly **Dark Mode** (`bg-slate-950`, text white).
- Ensure all charts and UI are responsive (mobile-friendly).
- Do not implement complex auth yet, just the UI and the Solana Wallet button.

Start by initializing the project structure and installing dependencies.
