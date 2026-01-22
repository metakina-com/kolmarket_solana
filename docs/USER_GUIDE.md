# 📖 KOLMarket.ai 使用指南

## 🎯 快速开始

### 第一步: 访问平台

访问 [https://kolmarket.ai](https://kolmarket.ai) 或本地开发环境 [http://localhost:3000](http://localhost:3000)

### 第二步: 连接钱包

1. 点击右上角 **"Connect Wallet"** 按钮
2. 选择您的 Solana 钱包（Phantom、Solflare 等）
3. 授权连接

### 第三步: 探索功能

- **Market**: 浏览 KOL 市场，查看实时影响力数据
- **Agents**: 与 KOL 数字生命对话
- **Portals**: 选择您的角色（KOL、投资者、项目方）

---

## 👤 用户角色

### 1. KOL（意见领袖）

#### 创建数字生命

1. 进入 **"Creator Portal"**
2. 点击 **"Create Agent Suite"**
3. 填写信息:
   - KOL Handle (Twitter 用户名)
   - 个性设置（攻击性、幽默感等）
   - 启用模块（Avatar、Mod、Trader）

4. 配置模块:
   - **Avatar**: 连接 Twitter API，设置自动发推规则
   - **Mod**: 连接 Discord/Telegram Bot，设置自动回复
   - **Trader**: 配置交易策略和钱包

5. 启动 Agent Suite

#### 管理数字生命

- 查看实时统计数据
- 调整个性参数
- 管理知识库
- 查看交易记录

#### 收益管理

- 查看订阅收入
- 查看交易手续费分成
- 设置分红规则

---

### 2. 投资者

#### 发现 Alpha

1. 进入 **"Market"** 页面
2. 浏览 KOL 列表，查看:
   - Mindshare Score（影响力分数）
   - 交易量
   - 粉丝数
   - 雷达图分析

3. 筛选和排序:
   - 按影响力分数
   - 按交易量
   - 按增长率

#### 跟随交易

1. 选择目标 KOL
2. 查看其交易历史
3. 订阅交易信号
4. 设置自动跟随策略

#### 与数字生命对话

1. 进入 **"Agents"** 页面
2. 选择 KOL
3. 开始对话:
   - 询问交易建议
   - 了解市场观点
   - 获取 Alpha 信息

---

### 3. 项目方

#### 寻找 KOL 合作

1. 进入 **"Market"** 页面
2. 筛选合适的 KOL:
   - 目标受众匹配
   - 影响力分数高
   - 活跃度高

3. 联系 KOL 或直接使用其数字生命

#### 使用数字生命营销

1. 创建营销活动
2. 配置数字生命:
   - 设置推广内容
   - 选择发布平台
   - 设置互动规则

3. 启动自动化营销

#### 数据追踪

- 查看推广效果
- 分析影响力数据
- 优化营销策略

---

## 🛠️ 功能详解

### Agent Suite（数字生命套件）

#### Avatar 模块

**功能**:
- 自动发推
- 自动互动（点赞、转发、回复）
- 内容生成
- 时间表管理

**配置**:
```json
{
  "autoPost": true,
  "autoInteract": true,
  "postFrequency": "daily",
  "interactionRules": {
    "replyToMentions": true,
    "likeRelevantTweets": true
  }
}
```

#### Mod 模块

**功能**:
- Discord 频道管理
- Telegram 群组管理
- 自动回复
- 内容审核

**配置**:
```json
{
  "discord": {
    "enabled": true,
    "autoReply": true,
    "channels": ["general", "trading"]
  },
  "telegram": {
    "enabled": true,
    "autoReply": true
  }
}
```

#### Trader 模块

**功能**:
- 自动交易执行
- 策略管理
- 风险管理
- 分红分配

**配置**:
```json
{
  "enabled": true,
  "strategies": [
    {
      "name": "Momentum Trading",
      "rules": {
        "entry": "price_change_24h > 10%",
        "exit": "profit_target > 20%"
      }
    }
  ],
  "riskManagement": {
    "maxPositionSize": 10,
    "stopLoss": -10,
    "takeProfit": 20
  }
}
```

---

### 知识库管理

#### 添加知识

1. 进入 **"Knowledge Sync"** 页面
2. 选择 KOL
3. 点击 **"Add Knowledge"**
4. 输入内容:
   - 文本内容
   - 元数据（来源、类型、URL）
   - 标签

5. 系统自动:
   - 生成 Embeddings
   - 存储到 Vectorize
   - 建立索引

#### 查询知识

- 在对话中使用 RAG 功能
- 系统自动检索相关知识
- 增强 AI 回答准确性

---

### 交易功能

#### 创建交易策略

1. 进入 Trader 模块设置
2. 点击 **"Create Strategy"**
3. 配置规则:
   - 入场条件
   - 出场条件
   - 风险管理

4. 启用策略

#### 执行交易

- 手动执行: 在 Trader 面板点击交易按钮
- 自动执行: 策略触发时自动执行

#### 分红分配

1. 进入 **"Distribution"** 页面
2. 配置接收者:
   - 添加钱包地址
   - 设置分配比例

3. 执行分配

---

## 📊 数据查看

### Mindshare 数据

- **Mindshare Score**: 综合影响力分数（0-100）
- **Volume**: 交易量
- **Followers**: 粉丝数
- **雷达图**: 5 个维度分析
  - Volume（交易量）
  - Loyalty（忠诚度）
  - Alpha（信息价值）
  - Growth（增长）
  - Engage（参与度）

### Agent Suite 统计

- 推文数量
- 互动次数
- 交易次数
- 收益统计

---

## 🔧 高级功能

### API 访问

开发者可以使用 API 进行集成:

```bash
# 获取 Agent Suite 信息
curl https://kolmarket.ai/api/agent-suite?kolHandle=blknoiz06

# 发送聊天消息
curl -X POST https://kolmarket.ai/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "kolHandle": "blknoiz06"}'
```

详细 API 文档: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### 自定义配置

- 个性参数调整
- 交易策略定制
- 知识库管理
- 自动化规则设置

---

## ❓ 常见问题

### Q: 如何创建 Agent Suite？

A: 进入 Creator Portal，填写 KOL 信息，配置模块，然后启动。

### Q: 数字生命会完全替代真人吗？

A: 不会。数字生命是 KOL 的 AI 增强工具，帮助 24/7 运营，但真人 KOL 仍然需要参与重要决策。

### Q: 如何确保交易安全？

A: 所有交易都需要钱包签名确认，支持多重签名，并设置了风险限制。

### Q: 数据隐私如何保护？

A: 数据存储在去中心化网络中，KOL 拥有完全的数据所有权，可以随时导出或删除。

### Q: 如何获得收益？

A: KOL 可以通过订阅分成、交易手续费分成等方式获得收益。投资者可以通过跟随交易和 Token 持有获得收益。

---

## 🆘 获取帮助

- **文档**: [docs/](./)
- **Discord**: https://discord.com/channels/1433748708255727640/1463848664001937533
- **Telegram**: https://t.me/kolmarketai
- **Twitter**: https://x.com/KOLMARKET
- **邮箱**: support@kolmarket.ai

---

**最后更新**: 2024-01-22
