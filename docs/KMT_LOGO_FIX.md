# KMT LOGO 显示问题修复

## 问题

在 Solana Explorer 中查看 KMT 代币时，LOGO 图片不显示。

## 原因分析

1. **元数据 JSON 文件路径问题**
   - 链上 URI: `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json`
   - R2 自定义域名 `oss.kolmarket.ai` 返回 404
   - 图片 URL `https://oss.kolmarket.ai/etPJjFNh_400x400.jpg` 可以正常访问（200）

2. **可能的原因**
   - R2 自定义域名配置不完整
   - 文件路径映射问题
   - CDN 缓存未更新

## 解决方案

### 方案 1: 使用 API 路由（推荐）

如果 R2 自定义域名有问题，可以使用 Cloudflare Pages API 路由：

```bash
# 更新链上元数据 URI
export TOKEN_URI="https://kolmarket-ai-eak.pages.dev/api/storage/token-metadata/kmt-metadata.json"
export TOKEN_MINT=2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ
export SOLANA_PRIVATE_KEY='[163,222,31,...]'

npm run upload:metadata
```

### 方案 2: 修复 R2 自定义域名

1. **检查 R2 自定义域名配置**
   - 登录 Cloudflare Dashboard
   - R2 → `kolmarket-uploads` bucket → Settings
   - 检查自定义域名 `oss.kolmarket.ai` 是否已正确配置

2. **验证文件路径**
   ```bash
   # 检查文件是否存在
   npx wrangler r2 object get kolmarket-uploads/token-metadata/kmt-metadata.json --file=test.json
   
   # 验证内容
   cat test.json
   ```

3. **等待 CDN 缓存更新**
   - R2 自定义域名可能需要几分钟才能生效
   - 清除浏览器缓存后重试

### 方案 3: 使用公共 R2 URL

如果配置了 R2 公共访问，可以使用：

```bash
# 获取 R2 公共 URL（需要配置公共访问）
# 格式: https://pub-{account_id}.r2.dev/{path}
export TOKEN_URI="https://pub-{YOUR_ACCOUNT_ID}.r2.dev/token-metadata/kmt-metadata.json"
```

## 验证步骤

1. **检查元数据 JSON 可访问**
   ```bash
   curl https://oss.kolmarket.ai/token-metadata/kmt-metadata.json
   # 或
   curl https://kolmarket-ai-eak.pages.dev/api/storage/token-metadata/kmt-metadata.json
   ```

2. **检查图片 URL**
   ```bash
   curl -I https://oss.kolmarket.ai/etPJjFNh_400x400.jpg
   # 应该返回 200 OK
   ```

3. **在 Solana Explorer 中查看**
   - 访问: https://explorer.solana.com/address/2J5fqwgvtUF27Yh5i7MLuStbgzmiVjRE98ChmdNDRnLQ?cluster=devnet
   - 点击元数据 URI 链接
   - 验证 JSON 中的 `image` 字段

4. **检查浏览器控制台**
   - 打开开发者工具
   - 查看是否有图片加载错误

## 当前状态

- ✅ 图片文件可访问: `https://oss.kolmarket.ai/etPJjFNh_400x400.jpg` (200)
- ❌ 元数据 JSON 不可访问: `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json` (404)
- ✅ 文件已上传到 R2: `token-metadata/kmt-metadata.json`

## 下一步

1. **优先使用 API 路由**（如果自定义域名有问题）
2. **或修复 R2 自定义域名配置**
3. **更新链上 URI**（如果更改了访问方式）

---

**最后更新**: 2026-01-23
