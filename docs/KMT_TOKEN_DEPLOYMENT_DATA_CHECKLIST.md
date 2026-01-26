# 📋 KMT Token 主网发行 - 完整原始数据准备清单

**更新时间**: 2026-01-23  
**网络**: Solana Mainnet  
**代币**: KOLMARKET TOKEN ($KMT)

---

## 🎯 发行前准备清单

### ✅ 必需数据（必须准备）

#### 1. 代币基本信息

| 数据项 | 值 | 说明 | 状态 |
|--------|-----|------|------|
| **代币名称** | `KOLMARKET TOKEN` | 完整名称 | ✅ 已准备 |
| **代币符号** | `KMT` | 交易符号 | ✅ 已准备 |
| **总供应量** | `1,000,000,000` | 10 亿代币 | ✅ 已准备 |
| **小数位数** | `9` | 标准 Solana 代币精度 | ✅ 已准备 |
| **网络** | `Solana Mainnet` | 主网 | ⚠️ 待确认 |

---

#### 2. 钱包和密钥

| 数据项 | 说明 | 格式 | 状态 |
|--------|------|------|------|
| **主网私钥** | 用于创建代币和支付费用 | Hex 字符串或数组 | ⚠️ 需准备 |
| **支付钱包地址** | 主网钱包地址 | Base58 字符串 | ⚠️ 需准备 |
| **钱包余额** | 至少 2 SOL | SOL | ⚠️ 需确认 |
| **Mint Authority** | 代币铸造权限地址 | Base58 字符串 | ⚠️ 需决定 |

**接收钱包地址**（已准备）:
- Community: `8yu5J7YTeaCyKk9gGhTDvgLvaDTofV4jh5NqUApYQ5pp`
- Team: `Ei91WdVJMsBADrxR3tPqqCBV8j4isy8dMq6j5LhFisAY`
- Development: `Hzw4k86b2rzeroGC6gS3G9Tm46udv7aKbaYRpNuqdjwb`
- Marketing: `aT4XWKEuo9gA1G4x5FZBuyaGfcRJ5cv89BGib2GMiNM`
- Liquidity: `8Z9Vu3bW4AE1wjFa7v1zjqkJnGogMb4JKAszT99xZB3n`

---

#### 3. 代币分配数据

| 分配项 | 比例 | 数量 ($KMT) | 接收钱包 | 状态 |
|--------|------|------------|----------|------|
| **Community & Ecosystem** | 40% | 400,000,000 | `8yu5J7YTeaCyKk9gGhTDvgLvaDTofV4jh5NqUApYQ5pp` | ✅ 已准备 |
| **Team & Advisors** | 15% | 150,000,000 | `Ei91WdVJMsBADrxR3tPqqCBV8j4isy8dMq6j5LhFisAY` | ✅ 已准备 |
| **Development Fund** | 20% | 200,000,000 | `Hzw4k86b2rzeroGC6gS3G9Tm46udv7aKbaYRpNuqdjwb` | ✅ 已准备 |
| **Marketing & Partnerships** | 15% | 150,000,000 | `aT4XWKEuo9gA1G4x5FZBuyaGfcRJ5cv89BGib2GMiNM` | ✅ 已准备 |
| **Liquidity Pool** | 10% | 100,000,000 | `8Z9Vu3bW4AE1wjFa7v1zjqkJnGogMb4JKAszT99xZB3n` | ✅ 已准备 |
| **总计** | 100% | 1,000,000,000 | - | ✅ 已准备 |

---

#### 4. 元数据 JSON 文件

**文件位置**: `kmt-metadata.json`

**必需字段**:
```json
{
  "name": "KOLMARKET TOKEN",
  "symbol": "KMT",
  "description": "$KMT: Redefining the Order of Web3 Influence...",
  "image": "https://oss.kolmarket.ai/etPJjFNh_400x400.jpg",
  "external_url": "https://kolmarket.ai"
}
```

**状态**: ✅ 已准备（`kmt-metadata.json`）

**需要更新**:
- [ ] `creators[0].address` - 更新为实际钱包地址
- [ ] 验证所有 URL 可访问
- [ ] 验证图片 URL 可访问

---

#### 5. 代币图标/Logo

| 数据项 | 要求 | 状态 |
|--------|------|------|
| **Logo 图片** | PNG/JPG, 推荐 512×512 或 400×400 | ✅ 已准备 |
| **图片 URL** | `https://oss.kolmarket.ai/etPJjFNh_400x400.jpg` | ✅ 已准备 |
| **图片格式** | PNG, JPG, SVG | ✅ 已准备 |
| **图片大小** | < 5MB | ⚠️ 需验证 |
| **可访问性** | 必须可公开访问 | ⚠️ 需验证 |

**建议准备多个尺寸**:
- 400×400 (标准)
- 512×512 (高清)
- 1024×1024 (超高清)
- SVG (矢量图)

---

#### 6. RPC 节点配置

| 数据项 | 说明 | 推荐值 | 状态 |
|--------|------|--------|------|
| **RPC URL** | Solana 主网 RPC 节点 | 自定义 RPC 或默认 | ⚠️ 需配置 |
| **RPC 类型** | 付费 RPC（推荐）或免费 | 付费 RPC | ⚠️ 需选择 |

**推荐 RPC 提供商**:
- Helius: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
- QuickNode: `https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_KEY`
- Alchemy: `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`
- 默认: `https://api.mainnet-beta.solana.com` (可能限流)

---

### 📄 文档和说明文件

#### 7. 白皮书/文档

| 文件 | 说明 | 状态 |
|------|------|------|
| **白皮书** | 项目完整说明 | ✅ 已准备 (`/whitepaper`) |
| **代币经济学** | Tokenomics 说明 | ✅ 已准备 |
| **路线图** | 项目发展路线图 | ✅ 已准备 |
| **使用场景** | 代币用途说明 | ✅ 已准备 |

---

#### 8. 社交媒体链接

| 平台 | URL | 状态 |
|------|-----|------|
| **Website** | `https://kolmarket.ai` | ✅ 已准备 |
| **Twitter/X** | `https://twitter.com/KOLMARKET` | ✅ 已准备 |
| **Telegram** | `https://t.me/kolmarketai` | ✅ 已准备 |
| **Discord** | `https://discord.com/channels/...` | ✅ 已准备 |
| **GitHub** | `https://github.com/metakina-com/kolmarket_solana` | ✅ 已准备 |

---

#### 9. 法律和合规文件（可选但推荐）

| 文件 | 说明 | 状态 |
|------|------|------|
| **风险提示** | 投资风险声明 | ⚠️ 需准备 |
| **服务条款** | Terms of Service | ⚠️ 需准备 |
| **隐私政策** | Privacy Policy | ⚠️ 需准备 |
| **免责声明** | Disclaimer | ⚠️ 需准备 |

---

### 🔧 技术配置

#### 10. 环境变量

**必需环境变量**:
```bash
# 主网私钥（必需）
SOLANA_MAINNET_PRIVATE_KEY=your_private_key_hex

# 或使用通用格式
SOLANA_PRIVATE_KEY=[163,222,31,...]

# RPC 节点（可选，默认使用公共 RPC）
SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
# 或
SOLANA_RPC_URL=https://your-custom-rpc.com
```

**状态**: ⚠️ 需设置

---

#### 11. 智能合约配置

| 配置项 | 值 | 说明 | 状态 |
|--------|-----|------|------|
| **Token Program** | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | 标准 SPL Token | ✅ 已配置 |
| **Metadata Program** | `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s` | Metaplex Metadata | ✅ 已配置 |
| **Mint Authority** | 创建者钱包 | 可后续撤销 | ⚠️ 需决定 |
| **Freeze Authority** | `null` | 不可冻结 | ✅ 已配置 |

---

#### 12. 元数据 URI

| 数据项 | 说明 | 状态 |
|--------|------|------|
| **元数据 JSON URL** | 元数据文件的可访问 URL | ⚠️ 需上传 |
| **存储位置** | Cloudflare R2 / IPFS / HTTP | ⚠️ 需选择 |
| **永久性** | 确保 URL 长期可访问 | ⚠️ 需确保 |

**推荐存储方案**:
1. **Cloudflare R2** (当前方案)
   - URL: `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json`
   - 优点: 快速、可靠
   - 缺点: 依赖 Cloudflare

2. **IPFS** (推荐长期)
   - URL: `https://ipfs.io/ipfs/Qm...`
   - 优点: 去中心化、永久
   - 缺点: 访问可能较慢

3. **Arweave** (永久存储)
   - URL: `https://arweave.net/...`
   - 优点: 永久存储
   - 缺点: 成本较高

---

### 📊 预售和空投数据

#### 13. 预售配置

| 数据项 | 值 | 状态 |
|--------|-----|------|
| **预售价格** | `$0.001` per $KMT | ✅ 已准备 |
| **预售额度** | `150,000,000 $KMT` (15%) | ✅ 已准备 |
| **最小贡献** | `0.1 SOL` | ✅ 已准备 |
| **最大贡献** | `100 SOL` | ✅ 已准备 |
| **预售时长** | `45 天` | ✅ 已准备 |

---

#### 14. 空投配置

| 数据项 | 值 | 状态 |
|--------|-----|------|
| **空投总额** | `200,000,000 $KMT` (20%) | ✅ 已准备 |
| **空投策略** | 多平台分发 | ✅ 已准备 |
| **空投平台** | Jupiter, Magic Eden, 社区等 | ✅ 已准备 |

---

### 🎨 品牌和视觉资产

#### 15. 品牌资产

| 资产类型 | 要求 | 状态 |
|---------|------|------|
| **Logo** | 400×400 PNG | ✅ 已准备 |
| **Banner** | 1200×400 PNG | ⚠️ 需准备 |
| **Icon** | 多种尺寸 (16×16 到 512×512) | ⚠️ 需准备 |
| **Favicon** | 32×32 ICO/PNG | ⚠️ 需准备 |
| **品牌色彩** | 主色: Cyan (#06b6d4), 辅色: Purple | ✅ 已定义 |

---

#### 16. 营销素材

| 素材类型 | 用途 | 状态 |
|---------|------|------|
| **社交媒体图片** | Twitter, Telegram 等 | ⚠️ 需准备 |
| **宣传视频** | 项目介绍视频 | ⚠️ 需准备 |
| **信息图表** | Tokenomics 可视化 | ✅ 已准备 |
| **宣传文案** | 多语言版本 | ⚠️ 需准备 |

---

### 🔐 安全和审计

#### 17. 安全配置

| 配置项 | 说明 | 状态 |
|--------|------|------|
| **私钥存储** | 安全存储，不泄露 | ⚠️ 需确保 |
| **多重签名** | 大额操作使用多签 | ⚠️ 需考虑 |
| **权限管理** | Mint Authority 管理策略 | ⚠️ 需决定 |
| **备份方案** | 私钥和配置备份 | ⚠️ 需准备 |

---

#### 18. 审计和验证（可选）

| 项目 | 说明 | 状态 |
|------|------|------|
| **智能合约审计** | 代币合约审计 | ⚠️ 可选 |
| **代码审计** | 部署脚本审计 | ⚠️ 可选 |
| **安全测试** | 漏洞扫描 | ⚠️ 可选 |

---

## 📁 文件清单

### 已准备的文件

| 文件 | 路径 | 状态 |
|------|------|------|
| **元数据 JSON** | `kmt-metadata.json` | ✅ 已准备 |
| **部署脚本** | `scripts/deploy-token-mainnet.ts` | ✅ 已准备 |
| **部署文档** | `docs/MAINNET_TOKEN_DEPLOYMENT.md` | ✅ 已准备 |
| **白皮书** | `app/whitepaper/page.tsx` | ✅ 已准备 |
| **代币分配文档** | `docs/AIRDROP_PRESALE_PLATFORM_RECOMMENDATIONS.md` | ✅ 已准备 |

---

### 需要创建/更新的文件

| 文件 | 说明 | 优先级 |
|------|------|--------|
| **主网部署结果** | `token-deployment-mainnet-TIMESTAMP.json` | 部署后生成 |
| **Mint 地址记录** | `kmt-mainnet-mint.txt` | 部署后生成 |
| **交易签名记录** | `kmt-mainnet-transactions.json` | 部署后生成 |
| **环境变量模板** | `.env.mainnet.example` | ⚠️ 需创建 |
| **安全配置文档** | `docs/SECURITY_CONFIG.md` | ⚠️ 需创建 |

---

## ✅ 发行前检查清单

### 数据准备检查

- [ ] **代币基本信息**
  - [ ] 名称: KOLMARKET TOKEN
  - [ ] 符号: KMT
  - [ ] 总供应量: 1,000,000,000
  - [ ] 小数位: 9

- [ ] **钱包和密钥**
  - [ ] 主网私钥已安全存储
  - [ ] 支付钱包余额 ≥ 2 SOL
  - [ ] 5 个接收钱包地址已验证
  - [ ] 私钥已备份

- [ ] **代币分配**
  - [ ] 分配比例已验证（总和 = 100%）
  - [ ] 接收钱包地址已确认
  - [ ] 分配数量已计算

- [ ] **元数据**
  - [ ] `kmt-metadata.json` 已更新
  - [ ] 图片 URL 可访问
  - [ ] 所有链接已验证
  - [ ] 元数据已上传到 R2/IPFS

- [ ] **技术配置**
  - [ ] 环境变量已设置
  - [ ] RPC 节点已配置
  - [ ] 部署脚本已测试（Devnet）

- [ ] **文档和链接**
  - [ ] 白皮书已准备
  - [ ] 社交媒体链接已验证
  - [ ] 网站可访问

---

### 安全检查

- [ ] **私钥安全**
  - [ ] 私钥未提交到 Git
  - [ ] 私钥已安全备份
  - [ ] 访问权限已限制

- [ ] **钱包验证**
  - [ ] 所有钱包地址已验证
  - [ ] 钱包余额已确认
  - [ ] 钱包权限已检查

- [ ] **配置验证**
  - [ ] 分配比例已验证
  - [ ] 接收地址已确认
  - [ ] 脚本逻辑已审查

---

### 测试检查

- [ ] **Devnet 测试**
  - [ ] 已在 Devnet 完整测试
  - [ ] 所有功能已验证
  - [ ] 错误处理已测试

- [ ] **脚本验证**
  - [ ] 部署脚本已运行成功
  - [ ] 代币分配已验证
  - [ ] 元数据设置已测试

---

## 🚀 发行执行步骤

### Step 1: 最终数据确认

```bash
# 1. 检查所有数据
cat kmt-metadata.json
cat scripts/deploy-token-mainnet.ts

# 2. 验证钱包地址
# 在 Solscan 上验证所有 5 个接收钱包地址

# 3. 检查余额
# 确保支付钱包有足够 SOL
```

---

### Step 2: 环境准备

```bash
# 1. 设置环境变量
export SOLANA_MAINNET_PRIVATE_KEY=your_private_key_hex
export SOLANA_MAINNET_RPC=https://your-rpc-url.com  # 可选

# 2. 验证环境变量
echo $SOLANA_MAINNET_PRIVATE_KEY | head -c 20  # 只显示前 20 个字符验证

# 3. 检查余额（使用 Solana CLI）
solana balance YOUR_WALLET_ADDRESS --url mainnet-beta
```

---

### Step 3: 元数据准备

```bash
# 1. 更新元数据文件中的钱包地址
# 编辑 kmt-metadata.json，更新 creators[0].address

# 2. 上传元数据到 R2
npm run upload:r2

# 3. 获取元数据 URL
# 从脚本输出或使用自定义域名
export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json

# 4. 验证 URL 可访问
curl $TOKEN_URI
```

---

### Step 4: 执行部署

```bash
# 1. 运行部署脚本
npx tsx scripts/deploy-token-mainnet.ts

# 2. 等待脚本完成
# 脚本会：
#   - 创建代币 Mint
#   - 按比例分配代币到 5 个钱包
#   - 生成部署结果文件

# 3. 保存输出信息
# 保存 Mint 地址、交易签名等
```

---

### Step 5: 验证和记录

```bash
# 1. 验证 Mint 地址
# 在 Solscan 上查看: https://solscan.io/token/YOUR_MINT_ADDRESS

# 2. 验证代币分配
# 检查每个接收钱包的代币余额

# 3. 保存关键信息
# - Mint 地址
# - 所有交易签名
# - 部署结果 JSON 文件
```

---

## 📝 数据记录模板

### 部署记录文件

创建文件: `kmt-mainnet-deployment-record.json`

```json
{
  "deploymentDate": "2026-01-23T00:00:00Z",
  "network": "mainnet",
  "tokenInfo": {
    "name": "KOLMARKET TOKEN",
    "symbol": "KMT",
    "mint": "YOUR_MINT_ADDRESS",
    "totalSupply": 1000000000,
    "decimals": 9
  },
  "deploymentWallet": {
    "address": "YOUR_WALLET_ADDRESS",
    "balanceBefore": "X.XXXX SOL",
    "balanceAfter": "X.XXXX SOL"
  },
  "distribution": {
    "community": {
      "address": "8yu5J7YTeaCyKk9gGhTDvgLvaDTofV4jh5NqUApYQ5pp",
      "amount": 400000000,
      "transaction": "YOUR_TX_SIGNATURE"
    },
    "team": {
      "address": "Ei91WdVJMsBADrxR3tPqqCBV8j4isy8dMq6j5LhFisAY",
      "amount": 150000000,
      "transaction": "YOUR_TX_SIGNATURE"
    },
    "development": {
      "address": "Hzw4k86b2rzeroGC6gS3G9Tm46udv7aKbaYRpNuqdjwb",
      "amount": 200000000,
      "transaction": "YOUR_TX_SIGNATURE"
    },
    "marketing": {
      "address": "aT4XWKEuo9gA1G4x5FZBuyaGfcRJ5cv89BGib2GMiNM",
      "amount": 150000000,
      "transaction": "YOUR_TX_SIGNATURE"
    },
    "liquidity": {
      "address": "8Z9Vu3bW4AE1wjFa7v1zjqkJnGogMb4JKAszT99xZB3n",
      "amount": 100000000,
      "transaction": "YOUR_TX_SIGNATURE"
    }
  },
  "metadata": {
    "uri": "https://oss.kolmarket.ai/token-metadata/kmt-metadata.json",
    "image": "https://oss.kolmarket.ai/etPJjFNh_400x400.jpg",
    "transaction": "YOUR_METADATA_TX_SIGNATURE"
  },
  "notes": "部署备注信息"
}
```

---

## 🔍 数据验证清单

### 发行前验证

- [ ] **代币信息验证**
  - [ ] 名称和符号正确
  - [ ] 总供应量正确
  - [ ] 小数位数正确

- [ ] **钱包地址验证**
  - [ ] 所有地址格式正确（Base58）
  - [ ] 地址在 Solscan 上可查询
  - [ ] 地址未重复

- [ ] **分配验证**
  - [ ] 分配总和 = 1,000,000,000
  - [ ] 比例正确（40%, 15%, 20%, 15%, 10%）
  - [ ] 接收地址正确

- [ ] **元数据验证**
  - [ ] JSON 格式正确
  - [ ] 所有 URL 可访问
  - [ ] 图片可加载
  - [ ] 描述完整

- [ ] **技术验证**
  - [ ] 脚本语法正确
  - [ ] 环境变量已设置
  - [ ] RPC 节点可连接
  - [ ] 余额充足

---

## 📦 完整数据包清单

### 必需文件

1. ✅ `kmt-metadata.json` - 元数据 JSON
2. ✅ `scripts/deploy-token-mainnet.ts` - 部署脚本
3. ⚠️ `.env.mainnet` - 环境变量（不提交到 Git）
4. ⚠️ `kmt-mainnet-deployment-record.json` - 部署记录（部署后生成）

### 文档文件

1. ✅ `docs/MAINNET_TOKEN_DEPLOYMENT.md` - 部署指南
2. ✅ `docs/KMT_TOKEN_DEPLOYMENT_DATA_CHECKLIST.md` - 本文档
3. ✅ `docs/AIRDROP_PRESALE_PLATFORM_RECOMMENDATIONS.md` - 空投预售方案

### 品牌资产

1. ✅ Logo 图片（400×400）
2. ⚠️ Banner 图片（1200×400）
3. ⚠️ 多种尺寸图标

---

## 🎯 快速检查命令

```bash
# 1. 检查元数据文件
cat kmt-metadata.json | jq .

# 2. 验证 JSON 格式
node -e "console.log(JSON.parse(require('fs').readFileSync('kmt-metadata.json')))"

# 3. 检查环境变量
echo "Private Key: ${SOLANA_MAINNET_PRIVATE_KEY:0:20}..."
echo "RPC: $SOLANA_MAINNET_RPC"

# 4. 验证钱包地址格式（Base58）
# 使用 Solana CLI 或在线工具验证

# 5. 测试 RPC 连接
curl -X POST $SOLANA_MAINNET_RPC \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

---

## 📞 支持资源

- **Solana 文档**: https://docs.solana.com/
- **SPL Token 文档**: https://spl.solana.com/token
- **Metaplex 文档**: https://docs.metaplex.com/
- **Solscan**: https://solscan.io/
- **Solana Explorer**: https://explorer.solana.com/

---

**最后更新**: 2026-01-23
