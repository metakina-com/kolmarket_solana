# 🚀 主网代币部署指南

**更新时间**: 2026-01-23  
**脚本**: `scripts/deploy-token-mainnet.ts`  
**网络**: Solana Mainnet

---

## 📋 代币分配计划

根据代币分配方案，总供应量 **1,000,000,000 $KMT** 将按以下比例分配：

| 分配项 | 比例 | 数量 | 接收钱包 |
|--------|------|------|----------|
| **Community & Ecosystem** | 40% | 400M $KMT | `8yu5J7YTeaCyKk9gGhTDvgLvaDTofV4jh5NqUApYQ5pp` |
| **Team & Advisors** | 15% | 150M $KMT | `Ei91WdVJMsBADrxR3tPqqCBV8j4isy8dMq6j5LhFisAY` |
| **Development Fund** | 20% | 200M $KMT | `Hzw4k86b2rzeroGC6gS3G9Tm46udv7aKbaYRpNuqdjwb` |
| **Marketing & Partnerships** | 15% | 150M $KMT | `aT4XWKEuo9gA1G4x5FZBuyaGfcRJ5cv89BGib2GMiNM` |
| **Liquidity Pool** | 10% | 100M $KMT | `8Z9Vu3bW4AE1wjFa7v1zjqkJnGogMb4JKAszT99xZB3n` |

---

## ⚠️ 重要警告

**这是主网操作，请务必谨慎！**

- ✅ 确保私钥安全，不要泄露
- ✅ 确保钱包有足够的 SOL（建议至少 2 SOL）
- ✅ 在执行前仔细检查所有钱包地址
- ✅ 建议先在 Devnet 测试
- ✅ 保存好交易签名和 Mint 地址

---

## 🚀 使用步骤

### 步骤 1: 准备环境

**1.1 安装依赖**

```bash
npm install
```

**1.2 设置主网私钥**

```bash
# 方式 1: Hex 格式（推荐）
export SOLANA_MAINNET_PRIVATE_KEY=your_private_key_hex

# 方式 2: 数组格式
export SOLANA_PRIVATE_KEY=[163,222,31,...]
```

**1.3 设置 RPC 节点（可选）**

```bash
# 使用默认 Solana RPC
# 或使用自定义 RPC（推荐使用付费 RPC 以提高可靠性）
export SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
# 或
export SOLANA_RPC_URL=https://your-custom-rpc.com
```

---

### 步骤 2: 检查余额

**确保钱包有足够的 SOL**（建议至少 2 SOL）：

```bash
# 检查余额（需要先安装 Solana CLI）
solana balance YOUR_WALLET_ADDRESS --url mainnet-beta
```

或使用脚本检查：

```bash
# 在脚本中会自动检查余额
```

---

### 步骤 3: 执行部署

**运行部署脚本**：

```bash
npx tsx scripts/deploy-token-mainnet.ts
```

**脚本将自动执行以下操作**：

1. ✅ 连接到 Solana Mainnet
2. ✅ 验证钱包余额
3. ✅ 创建代币 Mint
4. ✅ 按照分配比例将代币转入 5 个钱包
5. ✅ 生成部署结果报告

---

## 📊 脚本输出示例

```
============================================
🚀 在 Solana Mainnet 上创建 $KMT Token
============================================

⚠️  警告: 这是主网操作，请确保私钥安全！

📡 连接到 Solana Mainnet...
✅ 已连接到: https://api.mainnet-beta.solana.com
✅ Solana 版本: 1.18.0

🔑 加载密钥对...
✅ 支付地址: YOUR_WALLET_ADDRESS
💰 余额: 5.2345 SOL

🪙 创建代币 Mint...
   名称: KOLMarket Token
   符号: $KMT
   小数位: 9
   总供应量: 1,000,000,000 $KMT

✅ 代币 Mint 地址: YOUR_MINT_ADDRESS

📦 开始代币分配...

📊 分配计划:
   1. Community & Ecosystem: 400,000,000 $KMT (40%)
   2. Team & Advisors: 150,000,000 $KMT (15%)
   3. Development Fund: 200,000,000 $KMT (20%)
   4. Marketing & Partnerships: 150,000,000 $KMT (15%)
   5. Liquidity Pool: 100,000,000 $KMT (10%)
   总计: 1,000,000,000 $KMT

📤 [1/5] 处理 Community & Ecosystem...
   地址: 8yu5J7YTeaCyKk9gGhTDvgLvaDTofV4jh5NqUApYQ5pp
   金额: 400,000,000 $KMT
   ✅ 转账成功!
   📝 交易签名: YOUR_TRANSACTION_SIGNATURE
   🔗 查看: https://solscan.io/tx/YOUR_TRANSACTION_SIGNATURE

...

============================================
📊 分配结果汇总
============================================

🪙 代币信息:
   Mint 地址: YOUR_MINT_ADDRESS
   总供应量: 1,000,000,000,000,000,000 (原始单位)
   总供应量: 1,000,000,000 $KMT

📦 分配详情:
   ✅ 1. Community & Ecosystem
      地址: 8yu5J7YTeaCyKk9gGhTDvgLvaDTofV4jh5NqUApYQ5pp
      金额: 400,000,000 $KMT
      交易: YOUR_TRANSACTION_SIGNATURE

   ...

📈 统计:
   成功: 5/5
   失败: 0/5

💾 结果已保存到: token-deployment-mainnet-TIMESTAMP.json

============================================
✅ 代币部署完成！
============================================

🪙 Mint 地址: YOUR_MINT_ADDRESS
🔗 Solcan: https://solscan.io/token/YOUR_MINT_ADDRESS
```

---

## 📝 部署结果文件

脚本会自动生成一个 JSON 文件，包含所有部署信息：

**文件名**: `token-deployment-mainnet-TIMESTAMP.json`

**内容示例**:

```json
{
  "timestamp": "2026-01-23T08:00:00.000Z",
  "network": "mainnet",
  "mint": "YOUR_MINT_ADDRESS",
  "totalSupply": 1000000000,
  "decimals": 9,
  "distribution": [
    {
      "label": "Community & Ecosystem",
      "address": "8yu5J7YTeaCyKk9gGhTDvgLvaDTofV4jh5NqUApYQ5pp",
      "amount": 400000000,
      "signature": "YOUR_TRANSACTION_SIGNATURE",
      "success": true
    },
    ...
  ]
}
```

---

## 🔍 验证部署

### 1. 查看 Mint 地址

访问 Solscan：
```
https://solscan.io/token/YOUR_MINT_ADDRESS
```

### 2. 查看交易

访问 Solscan 交易页面：
```
https://solscan.io/tx/YOUR_TRANSACTION_SIGNATURE
```

### 3. 验证钱包余额

检查每个接收钱包的代币余额：

```bash
# 使用 Solana CLI
spl-token balance YOUR_MINT_ADDRESS --owner RECIPIENT_WALLET_ADDRESS

# 或在 Solscan 上查看
https://solscan.io/account/RECIPIENT_WALLET_ADDRESS
```

---

## 🛠️ 故障排除

### 问题 1: 余额不足

**错误**: `Insufficient funds`

**解决方案**:
- 确保钱包有足够的 SOL（建议至少 2 SOL）
- 检查网络费用

### 问题 2: 私钥格式错误

**错误**: `未找到主网私钥`

**解决方案**:
- 检查环境变量名称：`SOLANA_MAINNET_PRIVATE_KEY`
- 确保私钥格式正确（Hex 字符串或数组格式）

### 问题 3: RPC 连接失败

**错误**: `Failed to connect to RPC`

**解决方案**:
- 检查网络连接
- 尝试使用自定义 RPC 节点
- 检查 RPC URL 是否正确

### 问题 4: 交易失败

**错误**: `转账失败`

**解决方案**:
- 检查接收钱包地址是否正确
- 确保有足够的 SOL 支付交易费用
- 检查网络状态

---

## 📋 部署前检查清单

- [ ] 已设置 `SOLANA_MAINNET_PRIVATE_KEY` 环境变量
- [ ] 钱包余额至少 2 SOL
- [ ] 已确认 5 个接收钱包地址正确
- [ ] 已在 Devnet 测试过脚本
- [ ] 已备份私钥
- [ ] 已准备好记录 Mint 地址和交易签名

---

## 🔐 安全建议

1. **私钥安全**
   - 不要将私钥提交到 Git
   - 使用环境变量或密钥管理服务
   - 考虑使用硬件钱包

2. **多重签名**
   - 对于大额代币，考虑使用多重签名钱包
   - 增加额外的安全层

3. **测试**
   - 先在 Devnet 完整测试
   - 使用少量代币在主网测试

4. **备份**
   - 保存 Mint 地址
   - 保存所有交易签名
   - 保存部署结果 JSON 文件

---

## 📞 支持

如果遇到问题：

1. 检查脚本输出日志
2. 查看 Solscan 上的交易状态
3. 检查 Solana 网络状态
4. 参考 [Solana 文档](https://docs.solana.com/)

---

**最后更新**: 2026-01-23
