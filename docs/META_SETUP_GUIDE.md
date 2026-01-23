# 📝 META（元数据）设置指南

本指南说明如何为 Solana Token 设置元数据（Metadata）。

---

## 🎯 什么是 Token Metadata？

Token Metadata 是代币的附加信息，包括：
- **名称** (Name) - 代币名称
- **符号** (Symbol) - 代币符号（如 BTC, ETH）
- **描述** (Description) - 代币描述
- **图片** (Image) - 代币图标
- **URI** - 指向完整元数据 JSON 的链接

---

## 🚀 快速设置

### 方法 1: 使用脚本（推荐）

#### 步骤 1: 设置环境变量

```bash
# 必需：代币 Mint 地址
export TOKEN_MINT=your_token_mint_address

# 必需：Devnet 私钥
export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex

# 可选：代币信息
export TOKEN_NAME="My Token"
export TOKEN_SYMBOL="MTK"
export TOKEN_DESCRIPTION="A token created on KOLMarket.ai"
export TOKEN_URI="https://your-metadata-uri.com/metadata.json"
```

#### 步骤 2: 运行脚本

```bash
# 使用 npm 脚本
npm run set:metadata

# 或直接运行
node scripts/set-token-metadata.js
```

---

## 📋 完整设置流程

### 1. 创建代币（如果还没有）

```bash
# 设置私钥
export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex

# 创建代币
npm run create:token
```

保存输出的 Mint 地址。

### 2. 准备元数据 JSON

创建一个 JSON 文件，例如 `metadata.json`:

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
    }
  ]
}
```

### 3. 上传元数据 JSON

**选项 1: 使用 Cloudflare R2（推荐）**

1. 使用脚本上传到 R2:
   ```bash
   npm run upload:r2
   ```
2. 或使用 Wrangler CLI:
   ```bash
   npx wrangler r2 object put kolmarket-uploads/token-metadata/metadata.json \
     --file=metadata.json
   ```
3. 获取 R2 URL:
   - 自定义域名: `https://oss.kolmarket.ai/token-metadata/metadata.json`
   - API 路由: `https://your-domain.com/api/storage/token-metadata/metadata.json`

**选项 2: 使用 HTTP/HTTPS**

1. 将 JSON 文件上传到任何可公开访问的服务器
2. 获取 URL，例如: `https://example.com/metadata.json`

### 4. 设置元数据

```bash
export TOKEN_MINT=your_mint_address
export TOKEN_URI=https://ipfs.io/ipfs/QmYourHash/metadata.json
export TOKEN_NAME="My Token"
export TOKEN_SYMBOL="MTK"

npm run set:metadata
```

---

## 🔧 环境变量说明

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `TOKEN_MINT` | 代币 Mint 地址 | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `SOLANA_DEVNET_PRIVATE_KEY` | Devnet 私钥（Hex） | `18f3280dfbf2c6...` |

### 可选变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `TOKEN_NAME` | 代币名称 | `"My Token"` |
| `TOKEN_SYMBOL` | 代币符号 | `"MTK"` |
| `TOKEN_DESCRIPTION` | 代币描述 | `"A token created on KOLMarket.ai"` |
| `TOKEN_URI` | 元数据 JSON URI | `""` (空) |
| `TOKEN_IMAGE` | 代币图片 URL | `""` (空) |

---

## 📄 元数据 JSON 标准格式

完整的元数据 JSON 应该包含以下字段：

```json
{
  "name": "My Token",
  "symbol": "MTK",
  "description": "A token created on KOLMarket.ai",
  "image": "https://example.com/token.png",
  "external_url": "https://kolmarket.ai",
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

### 字段说明

- **name**: 代币名称（必需）
- **symbol**: 代币符号（必需）
- **description**: 代币描述（可选）
- **image**: 代币图片 URL（可选）
- **external_url**: 外部链接（可选）
- **attributes**: 属性数组（可选）
- **properties**: 属性对象（可选）

---

## 🔍 验证元数据

### 在 Solana Explorer 上查看

1. 访问脚本输出的 Explorer 链接
2. 或手动访问: `https://explorer.solana.com/address/YOUR_METADATA_PDA?cluster=devnet`

### 使用 Solana CLI

```bash
# 查看代币信息
spl-token display YOUR_MINT_ADDRESS --url devnet
```

---

## 💡 最佳实践

1. **使用 Cloudflare R2 存储**
   - R2 是 Cloudflare 的对象存储
   - 与 S3 兼容，易于使用
   - 推荐使用 R2 自定义域名
   - 免费计划提供 10GB 存储

2. **包含完整信息**
   - 提供清晰的名称和符号
   - 添加有意义的描述
   - 使用高质量的图片

3. **保持一致性**
   - 确保 URI 中的 JSON 与链上元数据一致
   - 定期验证元数据可访问性

4. **安全性**
   - 不要将私钥提交到代码仓库
   - 使用环境变量管理敏感信息
   - 生产环境使用密钥管理服务

---

## ⚠️ 注意事项

1. **权限要求**
   - 只有 Mint Authority 可以创建元数据
   - 只有 Update Authority 可以更新元数据
   - 确保使用正确的私钥

2. **费用**
   - 创建/更新元数据需要支付 SOL
   - Devnet 可以使用免费测试币
   - Mainnet 需要真实 SOL

3. **不可变性**
   - 如果 `isMutable: false`，元数据将不可更改
   - 建议在测试阶段保持 `isMutable: true`

4. **URI 可访问性**
   - 确保 URI 指向的文件可公开访问
   - 建议使用 IPFS 或 Arweave 等永久存储

---

## 🔧 故障排查

### 错误: Mint Authority 不匹配

**解决方案**:
- 确保使用的私钥是 Mint Authority
- 检查 Mint 地址是否正确

### 错误: 余额不足

**解决方案**:
- 从 Solana Faucet 获取测试币
- 或使用: `solana airdrop 1 YOUR_ADDRESS --url devnet`

### 错误: 元数据账户已存在

**解决方案**:
- 脚本会自动更新现有元数据
- 如果更新失败，检查 Update Authority

---

## 📚 相关文档

- [创建代币指南](./CREATE_TOKEN_DEVNET.md)
- [设置元数据详细指南](./SET_TOKEN_METADATA.md)
- [Metaplex Token Metadata 标准](https://docs.metaplex.com/programs/token-metadata/)
- [Solana SPL Token 文档](https://spl.solana.com/token)

---

## 🎯 快速参考

```bash
# 1. 创建代币
export SOLANA_DEVNET_PRIVATE_KEY=your_key
npm run create:token

# 2. 设置元数据
export TOKEN_MINT=your_mint_address
export TOKEN_NAME="My Token"
export TOKEN_SYMBOL="MTK"
export TOKEN_URI="https://ipfs.io/ipfs/..."
npm run set:metadata
```

---

**最后更新**: 2026-01-23
