# KMT LOGO 显示问题 - 最终解决方案

## 🔍 问题总结

R2 自定义域名 `oss.kolmarket.ai` 无法访问 JSON 文件（返回 404），导致 Solana Explorer 无法加载元数据和 LOGO。

## ✅ 已完成的修复

1. ✅ 元数据 JSON 已上传到 R2（根路径）
2. ✅ 链上 URI 已更新为 `https://oss.kolmarket.ai/kmt-metadata.json`
3. ⚠️ 但 R2 自定义域名仍返回 404

## 🎯 解决方案

### 方案 1: 使用 Cloudflare Pages API 路由（推荐）

如果 R2 自定义域名有问题，使用 API 路由访问：

```bash
# 更新链上 URI 为 API 路由
export TOKEN_URI="https://kolmarket-ai-eak.pages.dev/api/storage/kmt-metadata.json"
export TOKEN_MINT=2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ
export SOLANA_PRIVATE_KEY='[163,222,31,...]'

npm run upload:metadata
```

**优点**:
- ✅ 立即生效，无需等待 CDN
- ✅ 通过 Cloudflare Pages 路由，稳定可靠
- ✅ 支持 CORS，浏览器可正常访问

### 方案 2: 修复 R2 自定义域名配置

1. **登录 Cloudflare Dashboard**
   - 进入 R2 → `kolmarket-uploads` bucket
   - Settings → Public Access → Custom Domain

2. **检查配置**
   - 确认 `oss.kolmarket.ai` 已绑定
   - 检查 DNS 记录是否正确

3. **验证文件访问**
   ```bash
   # 测试根路径文件
   curl https://oss.kolmarket.ai/kmt-metadata.json
   ```

### 方案 3: 使用 IPFS 或其他公共存储

如果 R2 持续有问题，可以：
1. 上传到 IPFS (Pinata/NFT.Storage)
2. 使用其他公共存储服务
3. 更新链上 URI

## 📋 当前文件状态

### R2 中的文件

- ✅ `etPJjFNh_400x400.jpg` - 图片（可访问）
- ✅ `kmt-metadata.json` - 元数据（已上传，但自定义域名无法访问）

### 链上信息

- **Mint**: `2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ`
- **当前 URI**: `https://oss.kolmarket.ai/kmt-metadata.json`
- **元数据 PDA**: `3gwijGhY82Dz4tzmib7xXzABD16MUureg5fWtii6dLvz`

## 🚀 快速修复命令

### 使用 API 路由更新链上 URI

```bash
cd /home/zyj_dev/Documents/kolmarket_solana

# 设置环境变量
export SOLANA_PRIVATE_KEY='[163,222,31,0,228,134,139,105,201,5,237,116,247,56,136,14,248,4,7,131,78,241,85,194,251,235,142,155,112,233,7,86,87,99,181,217,226,5,7,103,198,73,243,27,186,112,167,209,176,250,196,80,214,230,113,251,19,88,155,78,250,95,252,188]'
export TOKEN_MINT=2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ
export TOKEN_URI="https://kolmarket-ai-eak.pages.dev/api/storage/kmt-metadata.json"

# 更新链上元数据
npm run upload:metadata
```

## ✅ 验证步骤

1. **检查 API 路由**
   ```bash
   curl https://kolmarket-ai-eak.pages.dev/api/storage/kmt-metadata.json
   ```

2. **在 Solana Explorer 查看**
   - 访问: https://explorer.solana.com/address/2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ?cluster=devnet
   - 点击 Metadata URI
   - 应该能看到 JSON 和 LOGO

3. **检查图片加载**
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 确认图片请求成功

---

**建议**: 优先使用 **方案 1（API 路由）**，因为它最可靠且立即生效。
