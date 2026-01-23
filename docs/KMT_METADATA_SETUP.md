# 🪙 KMT Token 元数据设置指南

本指南说明如何为 KMT (KOLMARKET TOKEN) 设置元数据。

---

## 📋 KMT 元数据信息

- **名称**: KOLMARKET TOKEN
- **符号**: KMT
- **描述**: $KMT: Redefining the Order of Web3 Influence...
- **图片**: https://oss.kolmarket.ai/etPJjFNh_400x400.jpg
- **网站**: https://kolmarket.ai

---

## 🚀 快速设置

### 步骤 1: 设置环境变量

```bash
# 必需：KMT Token Mint 地址
export TOKEN_MINT=your_kmt_token_mint_address

# 必需：Devnet 私钥
export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex
```

### 步骤 2: 运行 KMT 元数据脚本

```bash
npm run set:kmt
```

脚本会：
- ✅ 验证 Mint 地址和私钥
- ✅ 检查余额
- ✅ 准备元数据 JSON
- ✅ 生成元数据 PDA 地址
- ✅ 保存配置信息

---

## 📄 上传元数据 JSON

### 步骤 1: 准备元数据文件

元数据文件已创建在项目根目录: `kmt-metadata.json`

### 步骤 2: 上传到 Cloudflare R2（推荐）

**使用脚本上传**:
```bash
# 使用 npm 脚本
npm run upload:r2

# 或直接运行
node scripts/upload-metadata-to-r2.js
```

**使用 Wrangler CLI**:
```bash
npx wrangler r2 object put kolmarket-uploads/token-metadata/kmt-metadata.json \
  --file=kmt-metadata.json \
  --content-type="application/json"
```

上传后会生成 R2 URL:
- 自定义域名: `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json`
- API 路由: `https://your-domain.com/api/storage/token-metadata/kmt-metadata.json`

### 步骤 3: 设置元数据 URI

```bash
# 如果使用自定义域名
export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json

# 或使用 API 路由
export TOKEN_URI=https://your-domain.com/api/storage/token-metadata/kmt-metadata.json
```

---

## 🔧 设置链上元数据

### 方法 1: 使用脚本（需要 Metaplex SDK）

```bash
# 1. 上传元数据 JSON 到 R2
npm run upload:r2

# 2. 获取 R2 URL（从脚本输出或使用自定义域名）
export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json

# 3. 安装 Metaplex SDK（如果未安装）
npm install @metaplex-foundation/mpl-token-metadata

# 4. 设置环境变量
export TOKEN_MINT=your_mint_address
export TOKEN_NAME="KOLMARKET TOKEN"
export TOKEN_SYMBOL="KMT"

# 5. 提交到链上
npm run upload:metadata
```

### 方法 2: 使用 Solana CLI

```bash
# 安装 Solana CLI（如果未安装）
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# 设置元数据
spl-token create-metadata YOUR_MINT_ADDRESS \
  --name "KOLMARKET TOKEN" \
  --symbol "KMT" \
  --uri "YOUR_METADATA_URI" \
  --url devnet
```

### 方法 3: 使用 Metaplex SDK 代码

```javascript
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = Metaplex.make(connection);

const mintAddress = new PublicKey("YOUR_MINT_ADDRESS");
const metadata = await metaplex.nfts().create({
  uri: "YOUR_METADATA_URI",
  name: "KOLMARKET TOKEN",
  symbol: "KMT",
  sellerFeeBasisPoints: 0,
});
```

---

## 📊 完整元数据 JSON

元数据文件 `kmt-metadata.json` 包含：

```json
{
  "name": "KOLMARKET TOKEN",
  "symbol": "KMT",
  "description": "$KMT: Redefining the Order of Web3 Influence...",
  "image": "https://oss.kolmarket.ai/etPJjFNh_400x400.jpg",
  "external_url": "https://kolmarket.ai",
  "attributes": [
    {
      "trait_type": "Network",
      "value": "Solana"
    },
    {
      "trait_type": "Platform",
      "value": "KOLMarket.ai"
    },
    {
      "trait_type": "Token Type",
      "value": "Utility Token"
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

---

## 🔍 验证元数据

### 在 Solana Explorer 上查看

访问:
```
https://explorer.solana.com/address/YOUR_MINT_ADDRESS?cluster=devnet
```

### 使用 Solana CLI

```bash
spl-token display YOUR_MINT_ADDRESS --url devnet
```

---

## 📝 环境变量参考

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `TOKEN_MINT` | KMT Token Mint 地址 | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `SOLANA_DEVNET_PRIVATE_KEY` | Devnet 私钥（Hex） | `18f3280dfbf2c6...` |

### 可选变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `TOKEN_URI` | 元数据 JSON URI | 需要上传后获取 |
| `TOKEN_NAME` | 代币名称 | `"KOLMARKET TOKEN"` |
| `TOKEN_SYMBOL` | 代币符号 | `"KMT"` |

---

## 💡 最佳实践

1. **使用 IPFS 存储**
   - 去中心化存储
   - 数据永久保存
   - 推荐使用 Pinata 或 NFT.Storage

2. **验证元数据**
   - 确保 JSON 格式正确
   - 确保图片 URL 可访问
   - 测试所有链接

3. **保存信息**
   - 保存 Mint 地址
   - 保存元数据 PDA 地址
   - 保存交易签名

---

## ⚠️ 注意事项

1. **权限要求**
   - 只有 Mint Authority 可以创建元数据
   - 确保使用正确的私钥

2. **费用**
   - 创建元数据需要支付 SOL
   - Devnet 可以使用免费测试币

3. **URI 可访问性**
   - 确保 URI 指向的文件可公开访问
   - 建议使用 IPFS 等永久存储

---

## 📚 相关文档

- [创建代币指南](./CREATE_TOKEN_DEVNET.md)
- [元数据设置指南](./SET_TOKEN_METADATA.md)
- [META 设置指南](./META_SETUP_GUIDE.md)

---

**最后更新**: 2026-01-23
