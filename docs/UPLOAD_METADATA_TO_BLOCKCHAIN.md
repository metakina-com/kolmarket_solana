# 🔗 将元数据提交到 Solana 区块链浏览器

本指南说明如何将 Token 元数据写入 Solana 区块链，以便在区块链浏览器（如 Solana Explorer、Solscan）中查看。

---

## 🎯 工作原理

元数据不是"提交"到浏览器的，而是通过 **Metaplex Token Metadata 程序**写入到 Solana 链上。浏览器会自动读取链上的元数据并显示。

### 流程说明

1. **创建元数据账户** - 在 Solana 链上创建一个 PDA（Program Derived Address）存储元数据
2. **写入元数据** - 将名称、符号、URI 等信息写入链上
3. **浏览器自动读取** - Solana Explorer 等浏览器自动读取并显示元数据

---

## 🚀 快速开始

### 步骤 1: 安装 Metaplex 包

```bash
npm install @metaplex-foundation/mpl-token-metadata
```

### 步骤 2: 上传元数据 JSON 到 Cloudflare R2（推荐）

1. **准备元数据文件**: `kmt-metadata.json`（已创建）

2. **上传到 R2**:
   ```bash
   # 使用脚本（推荐）
   npm run upload:r2
   
   # 或使用 Wrangler CLI
   npx wrangler r2 object put kolmarket-uploads/token-metadata/kmt-metadata.json \
     --file=kmt-metadata.json \
     --content-type="application/json"
   ```

3. **获取 R2 URL**:
   - 自定义域名: `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json`
   - API 路由: `https://your-domain.com/api/storage/token-metadata/kmt-metadata.json`

### 步骤 3: 设置环境变量

```bash
# 必需：KMT Token Mint 地址
export TOKEN_MINT=your_kmt_token_mint_address

# 必需：Devnet 私钥
export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex

# 可选：元数据 JSON URI（如果已上传到 R2）
export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json
```

### 步骤 4: 运行脚本

```bash
node scripts/upload-metadata-to-chain.js
```

---

## 📋 完整流程

### 1. 创建代币（如果还没有）

```bash
export SOLANA_DEVNET_PRIVATE_KEY=your_key
npm run create:token
```

保存输出的 Mint 地址。

### 2. 准备元数据 JSON

元数据文件已创建: `kmt-metadata.json`

包含：
- 名称: KOLMARKET TOKEN
- 符号: KMT
- 描述: $KMT: Redefining the Order of Web3 Influence...
- 图片: https://oss.kolmarket.ai/etPJjFNh_400x400.jpg
- 网站: https://kolmarket.ai

### 3. 上传元数据 JSON 到 IPFS

**使用 Pinata**:
1. 访问 https://www.pinata.cloud/
2. 注册/登录
3. 上传 `kmt-metadata.json`
4. 获取 IPFS URL

**使用 NFT.Storage**:
1. 访问 https://nft.storage/
2. 注册/登录
3. 上传 `kmt-metadata.json`
4. 获取 IPFS URL

### 4. 将元数据写入链上

```bash
export TOKEN_MINT=your_mint_address
export TOKEN_URI=https://gateway.pinata.cloud/ipfs/QmYourHash
export SOLANA_DEVNET_PRIVATE_KEY=your_key

node scripts/upload-metadata-to-chain.js
```

---

## 🔍 在区块链浏览器中查看

### Solana Explorer

访问脚本输出的链接，或手动访问：

**Mint 地址**:
```
https://explorer.solana.com/address/YOUR_MINT_ADDRESS?cluster=devnet
```

**元数据 PDA**:
```
https://explorer.solana.com/address/YOUR_METADATA_PDA?cluster=devnet
```

**交易详情**:
```
https://explorer.solana.com/tx/YOUR_TRANSACTION_SIGNATURE?cluster=devnet
```

### Solscan

**Mint 地址**:
```
https://solscan.io/token/YOUR_MINT_ADDRESS?cluster=devnet
```

**交易详情**:
```
https://solscan.io/tx/YOUR_TRANSACTION_SIGNATURE?cluster=devnet
```

---

## 📊 元数据在链上的存储

### Metadata PDA

元数据存储在链上的一个 PDA（Program Derived Address）中：

```
PDA = derive(
  ["metadata", TOKEN_METADATA_PROGRAM_ID, MINT_ADDRESS],
  TOKEN_METADATA_PROGRAM_ID
)
```

### 存储的信息

- **名称** (name) - 代币名称
- **符号** (symbol) - 代币符号
- **URI** (uri) - 指向完整元数据 JSON 的链接
- **更新权限** (updateAuthority) - 可以更新元数据的地址
- **是否可变** (isMutable) - 元数据是否可以修改

---

## 🔧 使用 Solana CLI（替代方法）

如果不想使用脚本，可以使用 Solana CLI：

### 安装 Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### 设置元数据

```bash
spl-token create-metadata YOUR_MINT_ADDRESS \
  --name "KOLMARKET TOKEN" \
  --symbol "KMT" \
  --uri "YOUR_METADATA_URI" \
  --url devnet
```

### 更新元数据

```bash
spl-token update-metadata YOUR_MINT_ADDRESS \
  --name "KOLMARKET TOKEN" \
  --symbol "KMT" \
  --uri "YOUR_METADATA_URI" \
  --url devnet
```

---

## 📝 环境变量说明

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `TOKEN_MINT` | KMT Token Mint 地址 | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `SOLANA_DEVNET_PRIVATE_KEY` | Devnet 私钥（Hex） | `18f3280dfbf2c6...` |

### 可选变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `TOKEN_URI` | 元数据 JSON URI | `""` (空) |
| `SOLANA_DEVNET_RPC` | Devnet RPC URL | `clusterApiUrl("devnet")` |

---

## ✅ 验证元数据

### 方法 1: 在浏览器中查看

访问 Solana Explorer 或 Solscan，查看代币页面，应该能看到：
- ✅ 代币名称和符号
- ✅ 代币图片（如果 URI 中包含）
- ✅ 元数据 URI
- ✅ 其他元数据信息

### 方法 2: 使用 Solana CLI

```bash
spl-token display YOUR_MINT_ADDRESS --url devnet
```

### 方法 3: 使用 Metaplex SDK 查询

```javascript
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

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

1. **权限要求**
   - 只有 Mint Authority 可以创建元数据
   - 只有 Update Authority 可以更新元数据
   - 确保使用正确的私钥

2. **费用**
   - 创建元数据需要支付 SOL（约 0.001-0.01 SOL）
   - Devnet 可以使用免费测试币
   - Mainnet 需要真实 SOL

3. **URI 可访问性**
   - 确保 URI 指向的文件可公开访问
   - 建议使用 IPFS 或 Arweave 等永久存储
   - 浏览器会自动从 URI 读取完整元数据 JSON

4. **不可变性**
   - 如果 `isMutable: false`，元数据将不可更改
   - 建议在测试阶段保持 `isMutable: true`

---

## 🔧 故障排查

### 错误: Metaplex 包未安装

```
❌ 错误: 未找到 @metaplex-foundation/mpl-token-metadata 包
```

**解决方案**:
```bash
npm install @metaplex-foundation/mpl-token-metadata
```

### 错误: Mint Authority 不匹配

```
❌ 错误: Mint Authority 不匹配
```

**解决方案**:
- 确保使用的私钥是 Mint Authority
- 检查 Mint 地址是否正确

### 错误: 余额不足

```
⚠️  余额不足，需要至少 0.1 SOL
```

**解决方案**:
- 从 Solana Faucet 获取测试币
- 或使用: `solana airdrop 1 YOUR_ADDRESS --url devnet`

### 元数据在浏览器中不显示

**可能原因**:
1. URI 不可访问 - 检查 URI 是否可公开访问
2. JSON 格式错误 - 检查 JSON 格式是否正确
3. 浏览器缓存 - 等待几分钟后刷新

**解决方案**:
1. 验证 URI 可访问性: `curl YOUR_METADATA_URI`
2. 检查 JSON 格式: 使用 JSON 验证工具
3. 等待几分钟后刷新浏览器

---

## 📚 相关文档

- [KMT 元数据设置指南](./KMT_METADATA_SETUP.md)
- [元数据设置指南](./SET_TOKEN_METADATA.md)
- [Metaplex Token Metadata 标准](https://docs.metaplex.com/programs/token-metadata/)
- [Solana Explorer](https://explorer.solana.com/)
- [Solscan](https://solscan.io/)

---

## 🎯 快速参考

```bash
# 1. 安装 Metaplex 包
npm install @metaplex-foundation/mpl-token-metadata

# 2. 上传元数据 JSON 到 IPFS
# 获取 IPFS URL

# 3. 设置环境变量
export TOKEN_MINT=your_mint_address
export TOKEN_URI=your_ipfs_url
export SOLANA_DEVNET_PRIVATE_KEY=your_key

# 4. 提交到链上
node scripts/upload-metadata-to-chain.js

# 5. 在浏览器中查看
# 访问脚本输出的 Explorer 链接
```

---

**最后更新**: 2026-01-23
