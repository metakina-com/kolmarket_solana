# KMT 代币自动化运营方案

## 📋 概述

KMT 代币自动化运营系统是一个完整的代币分发和管理解决方案，支持定时任务、条件触发和手动执行等多种分发模式。

---

## 🎯 核心功能

### 1. SPL Token 分发
- ✅ 支持 KMT 代币批量分发
- ✅ 自动创建接收者关联代币账户
- ✅ 支持百分比和固定金额两种分配模式
- ✅ 交易确认和错误处理

### 2. 自动化任务类型

#### 定时任务 (Scheduled)
- **质押奖励每日分发**: 每天自动向质押用户分发奖励
- **周度/月度分红**: 按固定周期执行分红

#### 条件触发 (Conditional)
- **交易手续费分红**: 当累计手续费达到阈值时自动分发
- **治理投票奖励**: 用户参与投票后自动发放奖励
- **余额阈值触发**: 当账户余额达到设定值时触发分发

#### 手动任务 (Manual)
- **空投任务**: 管理员手动触发的大规模空投
- **紧急分发**: 需要立即执行的特殊分发

### 3. 任务管理
- 任务创建、启用/禁用、删除
- 执行历史记录
- 下次运行时间计算
- 任务状态监控

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install @solana/spl-token @solana/web3.js
```

依赖已包含在项目中，无需额外安装。

### 2. 配置环境变量

在 `.env.local` 中添加：

```env
# KMT Token Mint 地址（主网）
KMT_TOKEN_MINT=你的KMT代币Mint地址

# Solana RPC 节点
SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
SOLANA_DEVNET_RPC=https://api.devnet.solana.com

# 分发者私钥（Base58 编码）
KMT_DISTRIBUTOR_PRIVATE_KEY=你的私钥
```

### 3. 使用自动化管理器

```typescript
import { KMTAutomationManager, KMTAutomationConfig } from "@/lib/execution/kmt-automation";
import { Keypair } from "@solana/web3.js";

// 初始化配置
const config: KMTAutomationConfig = {
  tokenMint: "你的KMT代币Mint地址",
  signerKeypair: Keypair.fromSecretKey(/* 分发者私钥 */),
  network: "mainnet-beta",
};

// 创建管理器
const manager = new KMTAutomationManager(config);

// 创建质押奖励任务
const stakingTask = KMTAutomationManager.createStakingRewardTask(
  [
    { address: new PublicKey("用户1地址"), percentage: 50 },
    { address: new PublicKey("用户2地址"), percentage: 30 },
    { address: new PublicKey("用户3地址"), percentage: 20 },
  ],
  1000 // 每日总奖励 1000 KMT
);

manager.addTask(stakingTask);

// 执行任务
const result = await manager.executeTask(stakingTask.id);
console.log("分发结果:", result);
```

---

## 📖 API 使用指南

### 获取所有任务

```bash
GET /api/execution/kmt-automation?network=devnet&tokenMint=你的Mint地址
```

响应：
```json
{
  "success": true,
  "tasks": [
    {
      "id": "staking-reward-1234567890",
      "name": "质押奖励每日分发",
      "type": "scheduled",
      "schedule": {
        "cron": "0 0 * * *",
        "timezone": "UTC"
      },
      "distribution": {
        "recipients": [
          {
            "address": "用户地址",
            "amount": 500,
            "percentage": 50
          }
        ],
        "totalAmount": 1000,
        "usePercentage": true
      },
      "enabled": true,
      "lastRun": "2024-01-21T00:00:00.000Z",
      "nextRun": "2024-01-22T00:00:00.000Z",
      "runCount": 7
    }
  ]
}
```

### 创建新任务

```bash
POST /api/execution/kmt-automation
Content-Type: application/json

{
  "network": "devnet",
  "tokenMint": "你的Mint地址",
  "task": {
    "id": "custom-task-123",
    "name": "自定义任务",
    "type": "scheduled",
    "schedule": {
      "cron": "0 0 * * *"
    },
    "distribution": {
      "recipients": [
        {
          "address": "用户地址",
          "amount": 100,
          "percentage": undefined
        }
      ],
      "usePercentage": false
    },
    "enabled": true,
    "runCount": 0
  }
}
```

### 执行任务

```bash
PATCH /api/execution/kmt-automation
Content-Type: application/json

{
  "network": "devnet",
  "tokenMint": "你的Mint地址",
  "taskId": "staking-reward-1234567890",
  "action": "execute"
}
```

### 启用/禁用任务

```bash
PATCH /api/execution/kmt-automation
Content-Type: application/json

{
  "network": "devnet",
  "tokenMint": "你的Mint地址",
  "taskId": "staking-reward-1234567890",
  "action": "toggle",
  "enabled": false
}
```

### 删除任务

```bash
PATCH /api/execution/kmt-automation
Content-Type: application/json

{
  "network": "devnet",
  "tokenMint": "你的Mint地址",
  "taskId": "staking-reward-1234567890",
  "action": "delete"
}
```

---

## 🎨 前端组件使用

### KMTAutomationPanel 组件

```tsx
import { KMTAutomationPanel } from "@/components/KMTAutomationPanel";

export default function AutomationPage() {
  return (
    <div>
      <KMTAutomationPanel />
    </div>
  );
}
```

组件功能：
- ✅ 显示所有自动化任务
- ✅ 任务状态管理（启用/禁用）
- ✅ 手动执行任务
- ✅ 删除任务
- ✅ 任务执行历史

---

## 📊 使用场景示例

### 场景 1: 质押奖励每日分发

```typescript
// 创建每日质押奖励任务
const stakingTask = KMTAutomationManager.createStakingRewardTask(
  [
    { address: new PublicKey("质押用户1"), percentage: 40 },
    { address: new PublicKey("质押用户2"), percentage: 35 },
    { address: new PublicKey("质押用户3"), percentage: 25 },
  ],
  2000 // 每日总奖励 2000 KMT
);

manager.addTask(stakingTask);
// 任务将在每天 UTC 00:00 自动执行
```

### 场景 2: 交易手续费分红

```typescript
// 当累计手续费达到 5000 KMT 时自动分发
const feeTask = KMTAutomationManager.createTradingFeeRewardTask(
  [
    { address: new PublicKey("平台运营"), percentage: 50 },
    { address: new PublicKey("KMT持有者池"), percentage: 30 },
    { address: new PublicKey("KOL创作者"), percentage: 20 },
  ],
  { platform: 50, holders: 30, kol: 20 }
);

manager.addTask(feeTask);
```

### 场景 3: 治理投票奖励

```typescript
// 用户参与治理投票后自动发放奖励
const governanceTask = KMTAutomationManager.createGovernanceRewardTask(
  [
    { address: new PublicKey("投票用户1"), amount: 100 },
    { address: new PublicKey("投票用户2"), amount: 100 },
  ],
  100 // 每次投票奖励 100 KMT
);

manager.addTask(governanceTask);
```

### 场景 4: 空投任务

```typescript
// 创建空投任务（手动执行）
const airdropTask = KMTAutomationManager.createAirdropTask(
  [
    { address: new PublicKey("用户1"), amount: 500 },
    { address: new PublicKey("用户2"), amount: 500 },
    { address: new PublicKey("用户3"), amount: 500 },
  ],
  500 // 每人 500 KMT
);

manager.addTask(airdropTask);

// 手动执行
await manager.executeTask(airdropTask.id);
```

---

## ⚙️ 高级配置

### Cron 表达式格式

定时任务使用 Cron 表达式定义执行时间：

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── 星期几 (0-7, 0和7都表示周日)
│ │ │ └───── 月份 (1-12)
│ │ └─────── 日期 (1-31)
│ └───────── 小时 (0-23)
└─────────── 分钟 (0-59)
```

示例：
- `0 0 * * *` - 每天午夜执行
- `0 0 * * 1` - 每周一午夜执行
- `0 0 1 * *` - 每月1号午夜执行
- `0 */6 * * *` - 每6小时执行一次

### 条件类型

#### balance_threshold
当账户余额达到阈值时触发：
```typescript
condition: {
  type: "balance_threshold",
  params: {
    account: "账户地址",
    threshold: 1000000 // lamports
  }
}
```

#### transaction_count
当交易数量达到阈值时触发：
```typescript
condition: {
  type: "transaction_count",
  params: {
    account: "账户地址",
    minCount: 10
  }
}
```

#### governance_vote
当用户参与治理投票时触发：
```typescript
condition: {
  type: "governance_vote",
  params: {
    voted: true
  }
}
```

#### staking_period
当质押期限满足条件时触发：
```typescript
condition: {
  type: "staking_period",
  params: {
    minDays: 30
  }
}
```

---

## 🔒 安全注意事项

1. **私钥管理**
   - 分发者私钥必须安全存储
   - 生产环境使用环境变量或密钥管理服务
   - 不要将私钥提交到代码仓库

2. **权限控制**
   - API 应添加身份验证
   - 限制任务创建和执行权限
   - 记录所有操作日志

3. **余额检查**
   - 执行前检查账户余额
   - 设置最小余额阈值
   - 监控账户余额变化

4. **交易确认**
   - 等待交易确认后再更新状态
   - 处理交易失败情况
   - 实现重试机制

---

## 📈 性能优化

### 批量分发优化

对于大量接收者的分发，建议：
1. 分批处理（每批最多 100 个接收者）
2. 使用并行处理
3. 实现交易队列

### 示例：批量空投

```typescript
async function batchAirdrop(
  manager: KMTAutomationManager,
  recipients: PublicKey[],
  amountPerRecipient: number,
  batchSize: number = 100
) {
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const task = KMTAutomationManager.createAirdropTask(
      batch.map(addr => ({ address: addr, amount: amountPerRecipient })),
      amountPerRecipient
    );
    
    manager.addTask(task);
    await manager.executeTask(task.id);
    
    // 等待一段时间避免速率限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

---

## 🐛 故障排查

### 常见错误

1. **"Sender token account does not exist"**
   - 原因：分发者没有该代币的关联账户
   - 解决：先向分发者账户转入一些代币

2. **"Insufficient token balance"**
   - 原因：账户余额不足
   - 解决：检查余额并补充代币

3. **"Task not found"**
   - 原因：任务ID不存在
   - 解决：检查任务ID是否正确

4. **交易失败**
   - 检查网络连接
   - 确认账户有足够的 SOL 支付手续费
   - 检查代币账户状态

---

## 📝 待实现功能

- [ ] 完整的 Cron 表达式解析器
- [ ] 任务执行历史数据库存储
- [ ] 邮件/通知系统集成
- [ ] 任务执行失败重试机制
- [ ] 分布式任务调度（多实例支持）
- [ ] 任务执行统计和报表
- [ ] Webhook 集成
- [ ] 任务模板系统

---

## 📞 支持

如有问题，请查看：
- [项目文档](./README.md)
- [架构文档](./ARCHITECTURE.md)
- [API 文档](./API_DOCUMENTATION.md)

---

**最后更新**: 2024-01-21
