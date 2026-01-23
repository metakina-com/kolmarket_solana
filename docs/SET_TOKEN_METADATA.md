# 📝 设置 Solana Token 元数据（Metadata）

本指南将帮助您为 Solana Token 设置元数据，包括名称、符号、描述、图片等信息。

---

## 📋 前置要求

1. **已创建代币**
   - 使用 `create-token-devnet.js` 创建了代币
   - 或已有代币的 Mint 地址

2. **环境变量**
   - `SOLANA_DEVNET_PRIVATE_KEY` - Devnet 私钥
   - `TOKEN_MINT` - 代币 Mint 地址

3. **足够的 SOL**
   - 至少 0.1 SOL（用于支付交易费用）

---

## 🚀 快速开始

### 步骤 1: 设置环境变量

```bash
# 必需：代币 Mint 地址
export TOKEN_MINT=your_token_mint_address

# 必需：Devnet 私钥
export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex

# 可选：代币信息（如果不设置，将使用默认值）
export TOKEN_NAME="My Token"
export TOKEN_SYMBOL="MTK"
export TOKEN_DESCRIPTION="A token created on KOLMarket.ai"
export TOKEN_URI="https://your-metadata-uri.com/metadata.json"
export TOKEN_IMAGE="https://your-image-url.com/token.png"
```

### 步骤 2: 运行脚本

```bash
node scripts/set-token-metadata.js
```

---

## 📝 元数据字段说明

### 必需字段

| 字段 | 说明 | 示例 |
|------|------|------|
| **name** | 代币名称 | "My Token" |
| **symbol** | 代币符号 | "MTK" |

### 可选字段

| 字段 | 说明 | 示例 |
|------|------|------|
| **uri** | 元数据 JSON 文件的 URI | "https://example.com/metadata.json" |
| **description** | 代币描述 | "A token created on KOLMarket.ai" |
| **image** | 代币图片 URL | "https://example.com/token.png" |

---

## 📄 元数据 JSON 格式

如果您设置了 `TOKEN_URI`，该 URI 应该指向一个 JSON 文件，格式如下：

```json
{
  "name": "My Token",
  "symbol": "MTK",
  "description": "A token created on KOLMarket.ai",
  "image": "https://example.com/token.png",
  "attributes": [
    {
      "trait_type": "Network",
      "value": "Solana Devnet"
    },
    {
      "trait_type": "Created By",
      "value": "KOLMarket.ai"
    }
  ],
  "properties": {
    "category": "token",
    "creators": [
      {
        "address": "YOUR_WALLET_ADDRESS",
        "share": 100
      }
    ]
  }
}
```

### 上传元数据 JSON

您可以使用以下服务上传元数据 JSON：

1. **Cloudflare R2** (推荐，与项目其他存储一致)
   - 使用脚本: `npm run upload:r2`
   - 使用 Wrangler CLI: `npx wrangler r2 object put ...`
   - 自定义域名: `https://oss.kolmarket.ai/...`

2. **HTTP/HTTPS**
   - 任何可公开访问的 URL

---

## 🔧 使用示例

### 示例 1: 基本设置

```bash
export TOKEN_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
export SOLANA_DEVNET_PRIVATE_KEY=your_key
export TOKEN_NAME="KOL Token"
export TOKEN_SYMBOL="KOL"

node scripts/set-token-metadata.js
```

### 示例 2: 完整设置（带 URI）

```bash
export TOKEN_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
export SOLANA_DEVNET_PRIVATE_KEY=your_key
export TOKEN_NAME="KOL Token"
export TOKEN_SYMBOL="KOL"
export TOKEN_DESCRIPTION="KOL Market Token for AI Agents"
export TOKEN_URI="https://ipfs.io/ipfs/QmYourHash/metadata.json"
export TOKEN_IMAGE="https://ipfs.io/ipfs/QmYourHash/token.png"

node scripts/set-token-metadata.js
```

---

## 📊 输出信息

脚本运行成功后，会输出：

1. **元数据信息**:
   - Mint 地址
   - 元数据 PDA 地址
   - 代币名称和符号
   - 描述和 URI
   - 交易签名

2. **查看链接**:
   - Solana Explorer 元数据页面
   - 交易详情页面

3. **保存文件**:
   - `token-metadata-devnet.json` - 元数据信息 JSON 文件

---

## 🔍 验证元数据

### 在 Solana Explorer 上查看

访问脚本输出的 Explorer 链接，或手动访问：
```
https://explorer.solana.com/address/YOUR_METADATA_PDA?cluster=devnet
```

### 使用 Metaplex SDK 查询

```javascript
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = Metaplex.make(connection);

const mintAddress = new PublicKey("YOUR_MINT_ADDRESS");
const metadata = await metaplex.nfts().findByMint({ mintAddress });

console.log("Name:", metadata.name);
console.log("Symbol:", metadata.symbol);
console.log("URI:", metadata.uri);
```

---

## ⚠️ 注意事项

1. **元数据权限**
   - 只有 Mint Authority 可以创建元数据
   - 只有 Update Authority 可以更新元数据
   - 如果 `isMutable: false`，元数据将不可更改

2. **URI 格式**
   - URI 应该指向有效的 JSON 文件
   - JSON 文件应该符合标准格式
   - 建议使用 IPFS 或 Arweave 等去中心化存储

3. **费用**
   - 创建元数据需要支付 SOL 作为交易费用
   - Devnet 可以使用免费测试币
   - Mainnet 需要真实 SOL

4. **更新元数据**
   - 如果元数据已存在，脚本会自动更新
   - 确保 `isMutable: true` 才能更新

---

## 🔧 故障排查

### 错误: Mint Authority 不匹配

```
❌ 错误: Mint Authority 不匹配
```

**解决方案**:
1. 确保使用的私钥是 Mint Authority
2. 检查 Mint 地址是否正确

### 错误: 余额不足

```
⚠️  余额不足，需要至少 0.1 SOL
```

**解决方案**:
1. 从 Solana Faucet 获取测试币
2. 或使用命令行: `solana airdrop 1 YOUR_ADDRESS --url devnet`

### 错误: 元数据账户已存在

如果元数据已存在，脚本会自动更新。如果更新失败：
1. 检查 Update Authority 是否正确
2. 检查 `isMutable` 是否为 `true`

---

## 📚 相关文档

- [创建代币指南](./CREATE_TOKEN_DEVNET.md)
- [Metaplex Token Metadata 标准](https://docs.metaplex.com/programs/token-metadata/)
- [Solana SPL Token 文档](https://spl.solana.com/token)

---

**最后更新**: 2026-01-23
