# 使用 Token-2022 创建代币（所有扩展）

本指南说明如何使用 **Token-2022** 程序创建代币并启用所有兼容的扩展。

---

## 🎯 什么是 Token-2022？

**Token-2022** 是 Solana 的下一代代币程序，在标准 SPL Token 基础上增加了可选的扩展功能。

- **程序 ID**: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- **标准 Token**: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`

---

## 🚀 快速开始

### 步骤 1: 设置环境变量

```bash
export SOLANA_PRIVATE_KEY='[163,222,31,...]'
# 或
export SOLANA_DEVNET_PRIVATE_KEY=your_hex_key
```

### 步骤 2: 运行脚本

```bash
npm run create:token2022
```

---

## 🔧 启用的扩展

脚本会启用以下**兼容的扩展**：

| 扩展 | 说明 | 配置 |
|------|------|------|
| **TransferFeeConfig** | 转账手续费 | 1% 手续费，最大 0.001 SOL |
| **MintCloseAuthority** | Mint 关闭权限 | 创建者可以关闭 mint |
| **DefaultAccountState** | 默认账户状态 | 新账户默认冻结 |
| **InterestBearingConfig** | 利息配置 | 年化 5% 利率 |
| **PermanentDelegate** | 永久委托人 | 创建者作为永久委托人 |
| **MetadataPointer** | 元数据指针 | 指向元数据账户（可后续设置） |

### ⚠️ 未启用的扩展（原因）

| 扩展 | 原因 |
|------|------|
| **NonTransferable** | 与 TransferFeeConfig 冲突 |
| **TransferHook** | 需要自定义程序 |
| **TokenMetadata** | 与 MetadataPointer 二选一（使用 MetadataPointer） |
| **TokenGroup** | 需要额外的分组逻辑 |
| **ConfidentialTransfer** | 需要额外的隐私配置 |

---

## 📋 扩展详细说明

### 1. TransferFeeConfig（转账手续费）

- **功能**: 每次转账收取手续费
- **配置**: 1% 手续费率，最大 0.001 SOL
- **用途**: 代币经济模型、平台收入

### 2. MintCloseAuthority（Mint 关闭权限）

- **功能**: 指定谁可以关闭 mint 并收回租金
- **配置**: 创建者作为关闭权限
- **用途**: 代币生命周期管理

### 3. DefaultAccountState（默认账户状态）

- **功能**: 新创建的代币账户默认状态
- **配置**: 默认冻结（需要解冻才能使用）
- **用途**: 合规、风控

### 4. InterestBearingConfig（利息配置）

- **功能**: 代币随时间产生利息
- **配置**: 年化 5% 利率
- **用途**: 储蓄代币、收益代币

### 5. PermanentDelegate（永久委托人）

- **功能**: 指定地址可以代表用户转移/冻结代币
- **配置**: 创建者作为永久委托人
- **用途**: 恢复丢失账户、合规冻结

### 6. MetadataPointer（元数据指针）

- **功能**: Mint 指向链上元数据账户
- **配置**: 初始为 null，可后续设置
- **用途**: 链上元数据、Logo 显示

---

## 🔍 验证扩展

创建后，可以使用以下方式验证扩展：

```javascript
import { getMint, getTransferFeeConfig, getDefaultAccountState } from "@solana/spl-token";

const mintInfo = await getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);

// 检查各个扩展
const transferFee = getTransferFeeConfig(mintInfo);
const defaultState = getDefaultAccountState(mintInfo);
// ...
```

---

## 📊 输出信息

脚本会创建 `token-2022-with-extensions.json` 文件，包含：

```json
{
  "network": "devnet",
  "program": "Token-2022",
  "mint": "YOUR_MINT_ADDRESS",
  "decimals": 9,
  "extensions": [
    "TransferFeeConfig",
    "MintCloseAuthority",
    "DefaultAccountState",
    "InterestBearingConfig",
    "PermanentDelegate",
    "MetadataPointer"
  ],
  "transaction": "SIGNATURE",
  "createdAt": "2026-01-23T..."
}
```

---

## 🔗 相关链接

- [Token-2022 文档](https://spl.solana.com/token-2022/extensions)
- [扩展指南](https://solana.com/docs/tokens/extensions)
- [Solana Explorer](https://explorer.solana.com/)

---

## ⚠️ 注意事项

1. **扩展互不兼容**: 某些扩展不能同时使用（如 NonTransferable 与 TransferFeeConfig）
2. **创建后不可添加**: 大多数扩展必须在创建时启用
3. **账户大小**: 启用的扩展越多，Mint 账户越大，租金越高
4. **转账手续费**: 启用 TransferFeeConfig 后，每次转账都会收取手续费

---

**最后更新**: 2026-01-23
