# KMT 代币验证清单

## ✅ 配置完成状态

### 1. 代币创建 ✅
- **Mint 地址**: `2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ`
- **网络**: Solana Devnet
- **状态**: 已创建并铸造

### 2. 元数据上传 ✅
- **R2 存储**: 已上传到 `kolmarket-uploads/kmt-metadata.json`
- **图片**: `https://oss.kolmarket.ai/etPJjFNh_400x400.jpg` ✅ 可访问
- **元数据 JSON**: `https://oss.kolmarket.ai/kmt-metadata.json` ⏳ 等待 CDN 更新

### 3. 链上元数据 ✅
- **元数据 PDA**: `3gwijGhY82Dz4tzmib7xXzABD16MUureg5fWtii6dLvz`
- **链上 URI**: `https://oss.kolmarket.ai/kmt-metadata.json`
- **最新交易**: `5vcedgcoyMHZ6m7dRZMmH7QynKHdJrnMAnWqacgKkKYFgMN7WTmYUHC4J2UH1sCb1FtKxLaKGobxkK6ufoR1ogkR`

### 4. R2 自定义域名 ✅
- **域名**: `oss.kolmarket.ai`
- **状态**: 已配置完成
- **图片访问**: ✅ 正常
- **JSON 访问**: ⏳ 等待 CDN 传播（通常 5-15 分钟）

## 🔍 验证步骤

### 步骤 1: 验证元数据 JSON 可访问

```bash
curl https://oss.kolmarket.ai/kmt-metadata.json
```

**预期结果**:
```json
{
  "name": "KOLMARKET TOKEN",
  "symbol": "KMT",
  "image": "https://oss.kolmarket.ai/etPJjFNh_400x400.jpg",
  ...
}
```

### 步骤 2: 验证图片可访问

```bash
curl -I https://oss.kolmarket.ai/etPJjFNh_400x400.jpg
```

**预期结果**: `HTTP/2 200`

### 步骤 3: 在 Solana Explorer 中查看

访问: https://explorer.solana.com/address/2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ?cluster=devnet

**检查项**:
- [ ] 代币信息显示正确（名称、符号）
- [ ] Metadata URI 链接可点击
- [ ] 点击 URI 后能看到 JSON 内容
- [ ] LOGO 图片正常显示

### 步骤 4: 验证链上元数据

访问元数据 PDA: https://explorer.solana.com/address/3gwijGhY82Dz4tzmib7xXzABD16MUureg5fWtii6dLvz?cluster=devnet

**检查项**:
- [ ] 元数据账户存在
- [ ] URI 字段正确
- [ ] 名称和符号正确

## 📋 完整信息

### 代币信息
- **名称**: KOLMARKET TOKEN
- **符号**: KMT
- **Mint**: `2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ`
- **小数位**: 9
- **初始供应**: 1 KMT

### 存储信息
- **图片 URL**: `https://oss.kolmarket.ai/etPJjFNh_400x400.jpg`
- **元数据 URL**: `https://oss.kolmarket.ai/kmt-metadata.json`
- **R2 Bucket**: `kolmarket-uploads`
- **自定义域名**: `oss.kolmarket.ai` ✅ 已配置

### 链上信息
- **元数据 PDA**: `3gwijGhY82Dz4tzmib7xXzABD16MUureg5fWtii6dLvz`
- **创建交易**: `45RZiWK3ZHGWUeChdUeeivrnBHxS9PR282T5CtoXzduqjfUDmPQWsA4oV1GmcpzfELeuXBSs5BXrrq7Chc9VMw4V`
- **元数据更新交易**: `5vcedgcoyMHZ6m7dRZMmH7QynKHdJrnMAnWqacgKkKYFgMN7WTmYUHC4J2UH1sCb1FtKxLaKGobxkK6ufoR1ogkR`

## 🔗 快速链接

### Solana Explorer
- **Mint**: https://explorer.solana.com/address/2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ?cluster=devnet
- **元数据**: https://explorer.solana.com/address/3gwijGhY82Dz4tzmib7xXzABD16MUureg5fWtii6dLvz?cluster=devnet
- **最新交易**: https://explorer.solana.com/tx/5vcedgcoyMHZ6m7dRZMmH7QynKHdJrnMAnWqacgKkKYFgMN7WTmYUHC4J2UH1sCb1FtKxLaKGobxkK6ufoR1ogkR?cluster=devnet

### Solscan
- **Token**: https://solscan.io/token/2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ?cluster=devnet

## ⏰ 等待时间

如果元数据 JSON 暂时无法访问，请等待：
- **CDN 缓存更新**: 5-15 分钟
- **DNS 传播**: 通常已生效
- **浏览器缓存**: 清除后重试

## ✅ 完成检查清单

- [x] 代币已创建
- [x] 元数据 JSON 已上传到 R2
- [x] 图片可正常访问
- [x] 链上元数据已提交
- [x] R2 自定义域名已配置
- [ ] 元数据 JSON 可通过自定义域名访问（等待 CDN）
- [ ] 在 Explorer 中验证 LOGO 显示

---

**最后更新**: 2026-01-23  
**状态**: ✅ 配置完成，等待 CDN 更新
