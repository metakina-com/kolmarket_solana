# 🔄 Pump.fun 代币元数据修改指南

**重要：Pump.fun 发行的代币是否可以修改元数据？**

---

## ⚠️ 关键限制

### ❌ **通常无法修改**

Pump.fun 发行的代币在**大多数情况下无法修改元数据**，原因如下：

1. **Update Authority 归 Pump.fun 所有**
   - Pump.fun 平台持有 `updateAuthority` 权限
   - 代币创建者**不是** `updateAuthority`
   - 只有 `updateAuthority` 才能修改元数据

2. **元数据可能设置为 `isMutable: false`**
   - 即使有权限，如果创建时设置为不可变，也无法修改

3. **平台政策限制**
   - Pump.fun 可能不允许代币创建者修改已发行的代币元数据
   - 这是为了防止欺诈和保持平台一致性

---

## 🔍 如何检查您的代币

### 步骤 1: 查询元数据信息

```bash
# 使用项目脚本检查
node -e "
const { Connection, PublicKey } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');

const connection = new Connection('https://api.mainnet-beta.solana.com');
const metaplex = Metaplex.make(connection);
const mint = new PublicKey('YOUR_PUMP_FUN_TOKEN_MINT');

metaplex.nfts().findByMint({ mintAddress: mint }).then(nft => {
  console.log('代币名称:', nft.name);
  console.log('代币符号:', nft.symbol);
  console.log('URI:', nft.uri);
  console.log('Update Authority:', nft.updateAuthorityAddress.toBase58());
  console.log('是否可变:', nft.isMutable ? '是' : '否');
  
  // 检查是否是 Pump.fun 的地址
  const PUMP_FUN_UPDATE_AUTHORITY = 'YOUR_PUMP_FUN_PROGRAM_ID'; // 需要查询实际地址
  if (nft.updateAuthorityAddress.toBase58() === PUMP_FUN_UPDATE_AUTHORITY) {
    console.log('⚠️  Update Authority 归 Pump.fun 所有，无法修改');
  } else {
    console.log('✅ Update Authority 归您所有，可以尝试修改');
  }
});
"
```

### 步骤 2: 检查 Update Authority

```javascript
// 使用 Solana Explorer
// 访问: https://explorer.solana.com/address/YOUR_MINT_ADDRESS
// 查看 "Metadata" 部分，找到 "Update Authority" 字段
```

---

## ✅ 如果 Update Authority 归您所有

**如果您的代币的 `updateAuthority` 是您的钱包地址**，则可以尝试修改：

### 方法 1: 使用项目脚本

```bash
# 1. 设置环境变量
export TOKEN_MINT=your_pump_fun_token_mint
export SOLANA_DEVNET_PRIVATE_KEY=your_update_authority_private_key  # 必须是 Update Authority 的私钥

# 2. 设置新的元数据
export TOKEN_NAME="New Name"
export TOKEN_SYMBOL="NEW"
export TOKEN_URI="https://oss.kolmarket.ai/new-metadata.json"

# 3. 尝试更新
node scripts/set-token-metadata.js
```

### 方法 2: 使用 Metaplex SDK

```javascript
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"));
const metaplex = Metaplex.make(connection);

// 加载 Update Authority 密钥对
const updateAuthority = Keypair.fromSecretKey(/* your secret key */);

const mintAddress = new PublicKey("YOUR_PUMP_FUN_TOKEN_MINT");
const nft = await metaplex.nfts().findByMint({ mintAddress });

// 检查权限
if (nft.updateAuthorityAddress.toBase58() !== updateAuthority.publicKey.toBase58()) {
  throw new Error("您不是 Update Authority，无法修改");
}

// 尝试更新
try {
  await metaplex.nfts().update({
    nftOrSft: nft,
    updateAuthority: updateAuthority,
    name: "New Token Name",
    symbol: "NEW",
    uri: "https://oss.kolmarket.ai/new-metadata.json",
  });
  console.log("✅ 更新成功！");
} catch (error) {
  console.error("❌ 更新失败:", error.message);
}
```

---

## 🚫 如果 Update Authority 归 Pump.fun 所有

### 选项 1: 联系 Pump.fun 支持

- 通过 Pump.fun 官方渠道申请修改
- 提供合理的修改理由
- 等待平台审核

### 选项 2: 创建新代币

如果必须修改元数据，可以考虑：
1. 创建新的代币（使用项目脚本）
2. 确保您拥有 `updateAuthority` 权限
3. 迁移流动性到新代币

### 选项 3: 修改链下元数据（部分有效）

虽然无法修改链上的 `name` 和 `symbol`，但可以：
1. 更新 URI 指向的 JSON 文件（如果 URI 可修改）
2. 修改 JSON 中的 `description`、`image`、`attributes`
3. **注意**：如果 URI 也无法修改，此方法无效

---

## 📊 Pump.fun vs 自建代币对比

| 特性 | Pump.fun 代币 | 自建代币（项目脚本） |
|------|--------------|-------------------|
| **Update Authority** | ❌ 归 Pump.fun | ✅ 归您所有 |
| **可修改元数据** | ❌ 通常不可 | ✅ 可以 |
| **发行难度** | ✅ 简单 | ⚠️ 需要技术 |
| **平台流量** | ✅ 高 | ❌ 需自行推广 |
| **费用** | 💰 平台费用 | 💰 仅交易费 |

---

## 🔧 使用项目脚本创建可修改的代币

如果您需要**完全控制**代币元数据，建议使用项目脚本创建：

### 步骤 1: 创建代币

```bash
# 使用项目脚本创建代币
export SOLANA_DEVNET_PRIVATE_KEY=your_private_key
node scripts/create-token-devnet.js
```

### 步骤 2: 设置元数据（确保 isMutable: true）

```bash
export TOKEN_MINT=your_new_token_mint
export TOKEN_NAME="My Token"
export TOKEN_SYMBOL="MTK"
export TOKEN_URI="https://oss.kolmarket.ai/metadata.json"

# 脚本会自动设置 isMutable: true
node scripts/set-token-metadata.js
```

### 步骤 3: 后续可以随时修改

```bash
# 任何时候都可以修改
export TOKEN_NAME="Updated Name"
export TOKEN_SYMBOL="UPD"
node scripts/set-token-metadata.js
```

---

## ⚠️ 重要提醒

### 1. **检查权限**

在尝试修改之前，**务必检查**：
- ✅ 您是否是 `updateAuthority`
- ✅ 元数据是否设置为 `isMutable: true`

### 2. **Pump.fun 代币的特殊性**

- Pump.fun 代币通常**无法修改**元数据
- 这是平台设计，不是技术限制
- 如果需要可修改的代币，建议使用项目脚本自建

### 3. **修改风险**

即使技术上可以修改，也要注意：
- ⚠️ 可能违反 Pump.fun 平台政策
- ⚠️ 可能影响代币信任度
- ⚠️ 可能被交易所下架

---

## 🎯 总结

### Pump.fun 代币

| 问题 | 答案 |
|------|------|
| **可以修改吗？** | ❌ **通常不可以** |
| **原因** | Update Authority 归 Pump.fun 所有 |
| **解决方案** | 联系平台支持，或创建新代币 |

### 自建代币（项目脚本）

| 问题 | 答案 |
|------|------|
| **可以修改吗？** | ✅ **可以** |
| **前提** | 您是 `updateAuthority`，且 `isMutable: true` |
| **方法** | 使用 `scripts/set-token-metadata.js` |

---

## 📚 相关文档

- [更新代币元数据](./UPDATE_TOKEN_METADATA.md) - 通用元数据更新指南
- [设置代币元数据](./SET_TOKEN_METADATA.md) - 初始设置指南
- [创建代币](./CREATE_TOKEN_DEVNET.md) - 创建可控制的代币

---

## 🔗 参考资源

- [Pump.fun 官方文档](https://pump.fun)
- [Metaplex Token Metadata 标准](https://docs.metaplex.com/programs/token-metadata/)
- [Solana Explorer](https://explorer.solana.com)

---

**最后更新**: 2026-01-23
