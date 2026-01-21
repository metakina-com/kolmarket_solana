# KOLMarket.ai 技术架构文档

## 架构概览

KOLMarket.ai 采用分层架构设计，从应用层到算力层，每一层都有明确的技术选型和职责。

## 架构层级详解

### 1. 应用层 (Application Layer)

**模块**: 官网 / 仪表盘  
**技术栈**: Next.js 15 + Recharts  
**状态**: ✅ 已完成 MVP

**功能**:
- 用户界面展示
- KOL 市场数据可视化
- 钱包连接和交互
- 实时数据展示

**实现**:
- `app/page.tsx` - 主页面
- `components/KOLCard.tsx` - KOL 卡片组件
- `components/KOLRadarChart.tsx` - 雷达图可视化
- `components/Navbar.tsx` - 导航栏
- `components/Hero.tsx` - 英雄区块

---

### 2. 智能体层 (Agent Layer)

**模块**: 数字生命 (Digital Life)  
**技术栈**: ai16z / Eliza Framework  
**状态**: 🔄 待集成

**功能**:
- KOL 数字生命体创建
- 个性化 AI 对话
- 知识库管理
- 行为模式学习

**集成计划**:
1. Fork ai16z / Eliza Framework
2. 创建数字生命管理模块
3. 集成到现有聊天系统
4. 实现 KOL 个性化训练

**相关文件** (待创建):
- `lib/agents/digital-life.ts` - 数字生命核心逻辑
- `app/api/agents/route.ts` - 智能体 API
- `components/DigitalLifeManager.tsx` - 管理界面

---

### 3. 执行层 (Execution Layer)

**模块**: 自动交易/分红  
**技术栈**: Solana Agent Kit (LangChain 集成)  
**状态**: 🔄 待集成

**功能**:
- 自动执行交易策略
- 智能分红分配
- 链上操作自动化
- 交易历史记录

**集成计划**:
1. 安装 Solana Agent Kit
2. 集成 LangChain
3. 创建交易执行模块
4. 实现分红逻辑

**相关文件** (待创建):
- `lib/execution/trading-agent.ts` - 交易智能体
- `lib/execution/distribution.ts` - 分红逻辑
- `app/api/execution/route.ts` - 执行 API

---

### 4. 数据层 (Data Layer)

**模块**: KOL 价值评估  
**技术栈**: Cookie.fun API (Mindshare Index)  
**状态**: 🔄 待集成

**功能**:
- 获取 KOL Mindshare 数据
- 实时价值评估
- 历史趋势分析
- 数据缓存和更新

**集成计划**:
1. 研究 Cookie.fun API 文档
2. 创建 API 客户端
3. 实现数据获取和缓存
4. 集成到 KOLCard 组件

**相关文件** (待创建):
- `lib/data/cookie-fun.ts` - Cookie.fun API 客户端
- `lib/data/mindshare.ts` - Mindshare 数据处理
- `app/api/mindshare/route.ts` - Mindshare API 代理

**API 集成示例** (待实现):
```typescript
// lib/data/cookie-fun.ts
export async function getMindshareData(kolHandle: string) {
  // 调用 Cookie.fun API
  // 返回 Mindshare Index 数据
}
```

---

### 5. 算力层 (Compute Layer)

**模块**: 模型运行  
**技术栈**: Nosana (后期) 或 AWS (前期)  
**状态**: 🔄 待集成

**功能**:
- AI 模型推理
- 分布式计算
- 成本优化
- 性能监控

**集成计划**:
- **前期**: 使用 AWS (EC2/ECS) 或 Cloudflare Workers AI
- **后期**: 迁移到 Nosana 去中心化算力网络

**相关文件** (待创建):
- `lib/compute/nosana.ts` - Nosana 集成
- `lib/compute/aws.ts` - AWS 集成
- `lib/compute/compute-manager.ts` - 算力管理器

---

## 数据流

```
用户交互 (应用层)
    ↓
智能体决策 (智能体层)
    ↓
数据获取 (数据层)
    ↓
执行操作 (执行层)
    ↓
算力支持 (算力层)
```

## 技术栈依赖关系

```
应用层 (Next.js)
    ├── 智能体层 (ai16z/Eliza)
    │   └── 算力层 (Nosana/AWS)
    ├── 数据层 (Cookie.fun)
    └── 执行层 (Solana Agent Kit)
        └── Solana 区块链
```

## 下一步开发计划

### Phase 1: 数据层集成 (优先级: 高)
- [ ] 集成 Cookie.fun API
- [ ] 实现 Mindshare 数据获取
- [ ] 更新 KOLCard 显示真实数据

### Phase 2: 智能体层集成 (优先级: 高)
- [ ] Fork ai16z/Eliza Framework
- [ ] 创建数字生命管理模块
- [ ] 集成到聊天系统

### Phase 3: 执行层集成 (优先级: 中)
- [ ] 集成 Solana Agent Kit
- [ ] 实现基础交易功能
- [ ] 实现分红逻辑

### Phase 4: 算力层优化 (优先级: 低)
- [ ] 评估 Nosana vs AWS
- [ ] 实现算力管理器
- [ ] 成本优化

## 参考资源

- [ai16z](https://github.com/ai16z) - AI Agents 框架
- [Eliza Framework](https://github.com/eliza-os) - 数字生命框架
- [Solana Agent Kit](https://github.com/solana-labs) - Solana 智能体工具包
- [Cookie.fun](https://cookie.fun) - KOL Mindshare API
- [Nosana](https://nosana.io) - 去中心化算力网络
