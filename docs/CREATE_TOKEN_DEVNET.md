# 🪙 在 Solana Devnet 上创建代币

本指南将帮助您在 Solana Devnet 上创建一个 SPL Token。

---

## 📋 前置要求

1. **Node.js 环境**
   - Node.js 18+ 已安装
   - npm 或 yarn 已安装

2. **Solana 钱包**
   - 一个 Solana 钱包（用于支付交易费用）
   - 至少 0.1 SOL（Devnet 测试币）

3. **环境变量**
   - `SOLANA_DEVNET_PRIVATE_KEY` - Devnet 私钥（Hex 格式）

---

## 🚀 快速开始

### 步骤 1: 获取 Devnet SOL

如果您还没有 Devnet SOL，请先获取：

**方法 1: 使用 Solana Faucet（推荐）**
```
访问: https://faucet.solana.com/
输入您的钱包地址
点击 "Airdrop 2 SOL"
```

**方法 2: 使用命令行**
```bash
solana airdrop 1 YOUR_WALLET_ADDRESS --url devnet
```

### 步骤 2: 设置环境变量

```bash
# 设置 Devnet 私钥（Hex 格式）
export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex

# 或使用数组格式
export SOLANA_PRIVATE_KEY='[163,222,31,...]'
```

**获取私钥格式**:
- 如果您的私钥是 Base58 格式，需要转换为 Hex
- 如果您的私钥是数组格式 `[163,222,31,...]`，可以直接使用

### 步骤 3: 运行脚本

```bash
# 使用 JavaScript 版本（推荐）
node scripts/create-token-devnet.js

# 或使用 TypeScript 版本（需要 tsx）
npx tsx scripts/create-token-devnet.ts
```

---

## 📝 脚本说明

### 默认配置

- **网络**: Devnet
- **小数位数**: 9
- **初始供应量**: 1,000,000,000（10 亿代币，考虑小数位）

### 自定义配置

编辑脚本文件 `scripts/create-token-devnet.js`，修改以下变量：

```javascript
// 代币配置
const TOKEN_DECIMALS = 9; // 修改小数位数（通常 6 或 9）
const INITIAL_SUPPLY = 1_000_000_000; // 修改初始供应量
```

---

## 📊 输出信息

脚本运行成功后，会输出：

1. **代币信息**:
   - Mint 地址（代币唯一标识）
   - 代币账户地址
   - 小数位数
   - 初始供应量
   - 交易签名

2. **查看链接**:
   - Solana Explorer 代币页面
   - 交易详情页面

3. **保存文件**:
   - `token-info-devnet.json` - 代币信息 JSON 文件

---

## 🔍 验证代币

### 在 Solana Explorer 上查看

访问脚本输出的 Explorer 链接，或手动访问：
```
https://explorer.solana.com/address/YOUR_MINT_ADDRESS?cluster=devnet
```

### 检查代币信息

```bash
# 使用 Solana CLI
solana address YOUR_MINT_ADDRESS --url devnet

# 查看代币账户
spl-token accounts --url devnet
```

---

## 💡 使用代币

创建代币后，您可以使用：

1. **代币转账**
   - 使用项目中的 `DistributionPanel` 组件
   - 或使用 API: `/api/execution/distribute`

2. **代币交易**
   - 使用 Jupiter 进行代币交换
   - 使用项目中的 `JupiterTerminal` 组件

3. **代币自动化**
   - 使用 KMT Automation 系统
   - 设置定时分发任务

---

## ⚠️ 注意事项

1. **私钥安全**
   - 永远不要将私钥提交到 Git
   - 使用环境变量或密钥管理服务
   - 生产环境使用 Cloudflare Workers Secrets

2. **网络选择**
   - Devnet 用于测试
   - Mainnet 用于生产
   - 确保使用正确的网络和私钥

3. **费用**
   - 创建代币需要支付 SOL 作为交易费用
   - Devnet 可以使用免费测试币
   - Mainnet 需要真实 SOL

4. **代币权限**
   - Mint 权限：控制是否可以铸造新代币
   - 冻结权限：控制是否可以冻结账户
   - 建议在生产环境中将权限设置为 null（不可变）

---

## 🔧 故障排查

### 错误: 余额不足

```
⚠️  余额不足，需要至少 0.1 SOL 来创建代币
```

**解决方案**:
1. 从 Solana Faucet 获取测试币
2. 或使用命令行: `solana airdrop 1 YOUR_ADDRESS --url devnet`

### 错误: 未找到私钥

```
❌ 错误: 未找到 SOLANA_DEVNET_PRIVATE_KEY 环境变量
```

**解决方案**:
1. 设置环境变量: `export SOLANA_DEVNET_PRIVATE_KEY=your_key`
2. 或使用数组格式: `export SOLANA_PRIVATE_KEY='[163,222,...]'`

### 错误: 网络连接失败

```
❌ 连接失败
```

**解决方案**:
1. 检查网络连接
2. 尝试使用不同的 RPC 节点
3. 设置 `SOLANA_DEVNET_RPC` 环境变量

---

## 📚 相关文档

- [Solana SPL Token 文档](https://spl.solana.com/token)
- [Solana Web3.js 文档](https://solana-labs.github.io/solana-web3.js/)
- [项目代币分发指南](./KMT_AUTOMATION_GUIDE.md)
- [环境变量配置](./ENV_CONFIG_GUIDE.md)

---

**最后更新**: 2026-01-23
