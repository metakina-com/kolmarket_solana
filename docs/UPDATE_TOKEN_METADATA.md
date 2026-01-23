# 🔄 更新 Solana 代币元数据（Metadata）

**是的，Solana 可以通过原始数据改变代币信息！**

---

## ✅ 可以修改的内容

通过 **Metaplex Token Metadata 程序**，您可以更新以下代币信息：

| 字段 | 说明 | 是否可修改 |
|------|------|-----------|
| **name** | 代币名称 | ✅ 是 |
| **symbol** | 代币符号 | ✅ 是 |
| **uri** | 元数据 JSON 的 URI | ✅ 是 |
| **description** | 代币描述 | ✅ 是 |
| **image** | 代币图片 URL | ✅ 是（通过 URI 中的 JSON） |
| **attributes** | 属性数组 | ✅ 是（通过 URI 中的 JSON） |

---

## 🔑 修改前提条件

### 1. **必须是 Update Authority（更新权限持有者）**

只有拥有 `updateAuthority` 权限的钱包才能修改元数据。

```javascript
// 检查您是否是 Update Authority
const metadata = await metaplex.nfts().findByMint({ mintAddress });
console.log("Update Authority:", metadata.updateAuthorityAddress.toBase58());
```

### 2. **元数据必须设置为 `isMutable: true`**

如果创建元数据时设置了 `isMutable: false`，则**无法修改**（永久锁定）。

```javascript
// 创建时设置
createMetadataAccountArgsV2: {
  data: metadataData,
  isMutable: true,  // ✅ 设置为 true 才能后续修改
}
```

### 3. **需要足够的 SOL 支付交易费用**

- Devnet: 可以使用测试币
- Mainnet: 需要真实 SOL（约 0.000005 SOL）

---

## 🚀 如何更新元数据

### 方法 1: 使用项目脚本（推荐）

#### 步骤 1: 设置环境变量

```bash
# 必需：代币 Mint 地址
export TOKEN_MINT=your_token_mint_address

# 必需：Update Authority 的私钥（Hex 格式）
export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex

# 新的元数据信息
export TOKEN_NAME="New Token Name"
export TOKEN_SYMBOL="NTK"
export TOKEN_DESCRIPTION="Updated description"
export TOKEN_URI="https://oss.kolmarket.ai/new-metadata.json"
```

#### 步骤 2: 运行更新脚本

```bash
# 使用标准脚本（自动检测：创建或更新）
node scripts/set-token-metadata.js

# 或使用 V3 版本
node scripts/upload-metadata-to-chain.js
```

**脚本会自动**：
- ✅ 检测元数据账户是否存在
- ✅ 如果存在 → 使用 `createUpdateMetadataAccountV2Instruction` **更新**
- ✅ 如果不存在 → 使用 `createCreateMetadataAccountV2Instruction` **创建**

---

### 方法 2: 使用 Metaplex SDK

```javascript
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = Metaplex.make(connection);

// 加载 Update Authority 密钥对
const updateAuthority = Keypair.fromSecretKey(/* your secret key */);

// 获取 NFT/Token
const mintAddress = new PublicKey("YOUR_MINT_ADDRESS");
const nft = await metaplex.nfts().findByMint({ mintAddress });

// 更新元数据
await metaplex.nfts().update({
  nftOrSft: nft,
  updateAuthority: updateAuthority,
  name: "New Token Name",
  symbol: "NTK",
  uri: "https://oss.kolmarket.ai/new-metadata.json",
});
```

---

### 方法 3: 直接使用指令（原始数据）

```javascript
const {
  createUpdateMetadataAccountV2Instruction,
} = require("@metaplex-foundation/mpl-token-metadata");
const { Connection, Keypair, Transaction } = require("@solana/web3.js");

// 1. 准备数据
const metadataData = {
  name: "New Token Name",
  symbol: "NTK",
  uri: "https://oss.kolmarket.ai/new-metadata.json",
  sellerFeeBasisPoints: 0,
  creators: null,
};

// 2. 创建更新指令
const instruction = createUpdateMetadataAccountV2Instruction(
  {
    metadata: metadataPDA,        // 元数据账户 PDA
    updateAuthority: updateAuthorityPubkey,  // 更新权限持有者
  },
  {
    updateMetadataAccountArgsV2: {
      data: metadataData,         // 新的元数据
      updateAuthority: updateAuthorityPubkey,
      primarySaleHappened: true,
      isMutable: true,            // 保持可修改
    },
  }
);

// 3. 发送交易
const transaction = new Transaction().add(instruction);
const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [updateAuthorityKeypair]
);
```

---

## 📝 更新流程示例

### 完整示例：更新 KMT 代币元数据

```bash
# 1. 准备新的元数据 JSON
cat > new-kmt-metadata.json <<EOF
{
  "name": "KOL Market Token",
  "symbol": "KMT",
  "description": "Updated: KOL Market Token for AI Agents",
  "image": "https://oss.kolmarket.ai/kmt-logo.png",
  "attributes": [
    { "trait_type": "Network", "value": "Solana" },
    { "trait_type": "Version", "value": "2.0" }
  ]
}
EOF

# 2. 上传新的元数据 JSON 到 R2
node scripts/upload-metadata-to-r2.js

# 3. 设置环境变量
export TOKEN_MINT=YOUR_KMT_MINT_ADDRESS
export SOLANA_DEVNET_PRIVATE_KEY=your_update_authority_key
export TOKEN_URI=https://oss.kolmarket.ai/kmt-metadata.json

# 4. 更新链上元数据
node scripts/upload-metadata-to-chain.js
```

---

## ⚠️ 重要注意事项

### 1. **Update Authority 权限**

- ✅ **可以修改**：如果您是 `updateAuthority`
- ❌ **无法修改**：如果您不是 `updateAuthority`
- 🔒 **永久锁定**：如果 `isMutable: false`，即使您是 `updateAuthority` 也无法修改

### 2. **URI 更新**

更新 `uri` 字段时，确保新的 URI 指向的 JSON 文件：
- ✅ 可公开访问
- ✅ 格式正确（符合 Metaplex 标准）
- ✅ 包含所有必需字段（name, symbol）

### 3. **链上 vs 链下数据**

- **链上**：`name`, `symbol`, `uri` 存储在链上（可修改）
- **链下**：`description`, `image`, `attributes` 存储在 URI 指向的 JSON 文件中（修改 JSON 文件即可，无需链上交易）

---

## 🔍 验证更新

### 1. 在 Solana Explorer 查看

```
https://explorer.solana.com/address/YOUR_METADATA_PDA?cluster=devnet
```

### 2. 使用脚本查询

```bash
# 查看元数据信息
node -e "
const { Connection, PublicKey } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');
const connection = new Connection('https://api.devnet.solana.com');
const metaplex = Metaplex.make(connection);
const mint = new PublicKey('YOUR_MINT_ADDRESS');
metaplex.nfts().findByMint({ mintAddress: mint }).then(nft => {
  console.log('Name:', nft.name);
  console.log('Symbol:', nft.symbol);
  console.log('URI:', nft.uri);
});
"
```

---

## 📚 相关脚本

| 脚本 | 用途 |
|------|------|
| `scripts/set-token-metadata.js` | 设置/更新标准 SPL Token 元数据 |
| `scripts/upload-metadata-to-chain.js` | 上传元数据到链上（V3） |
| `scripts/set-kmt-metadata.js` | 设置 KMT 代币元数据 |
| `scripts/upload-metadata-to-r2.js` | 上传元数据 JSON 到 R2 |

---

## 🎯 总结

**✅ 是的，Solana 可以通过原始数据改变代币信息！**

**前提**：
1. 您是 `updateAuthority`
2. 元数据设置为 `isMutable: true`
3. 有足够的 SOL 支付交易费用

**方法**：
- 使用项目脚本（最简单）
- 使用 Metaplex SDK
- 直接使用指令（原始数据）

**可修改内容**：
- 名称、符号、URI（链上）
- 描述、图片、属性（通过更新 URI 指向的 JSON）

---

**最后更新**: 2026-01-23
