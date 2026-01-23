# ☁️ Cloudflare R2 存储完整配置指南

本指南说明如何将所有数据存储迁移到 Cloudflare R2。

---

## 📋 当前状态

### ✅ 已使用 R2 的功能

1. **文件上传** - ✅ 已使用 R2
   - 用户上传的图片、视频、音频
   - API: `/api/storage/upload`
   - 组件: `FileUpload`

2. **文件访问** - ✅ 已使用 R2
   - API: `/api/storage/[path]`
   - 通过 API 路由访问 R2 文件

3. **训练数据上传** - ✅ 已使用 R2
   - API: `/api/cortex/upload`
   - 知识库训练数据

### 🔄 需要迁移到 R2 的功能

1. **Token 元数据 JSON** - 需要迁移
   - 当前: 建议使用 IPFS
   - 目标: 使用 R2 存储

2. **代币图片** - 已使用 R2 (oss.kolmarket.ai)
   - 当前: `https://oss.kolmarket.ai/etPJjFNh_400x400.jpg`
   - 状态: ✅ 已使用 R2

---

## 🚀 迁移到 R2 的步骤

### 步骤 1: 确保 R2 Bucket 已创建

```bash
# 创建 R2 Bucket（如果还没有）
npx wrangler r2 bucket create kolmarket-uploads

# 列出所有 Bucket
npx wrangler r2 bucket list
```

### 步骤 2: 配置 R2 自定义域名（可选，推荐）

1. **在 Cloudflare Dashboard 中配置**:
   - 进入 R2 → 选择 bucket → Settings → Public Access
   - 配置自定义域名，例如: `oss.kolmarket.ai`

2. **或使用 Wrangler CLI**:
   ```bash
   npx wrangler r2 bucket public-access enable kolmarket-uploads
   ```

### 步骤 3: 上传元数据 JSON 到 R2

```bash
# 方法 1: 使用脚本（推荐）
node scripts/upload-metadata-to-r2.js

# 方法 2: 使用 Wrangler CLI
npx wrangler r2 object put kolmarket-uploads/token-metadata/kmt-metadata.json \
  --file=kmt-metadata.json \
  --content-type="application/json"
```

### 步骤 4: 获取 R2 文件 URL

上传后，获取文件 URL：

**如果配置了自定义域名**:
```
https://oss.kolmarket.ai/token-metadata/kmt-metadata.json
```

**如果使用 API 路由**:
```
https://your-domain.com/api/storage/token-metadata/kmt-metadata.json
```

### 步骤 5: 使用 R2 URL 设置链上元数据

```bash
export TOKEN_MINT=your_mint_address
export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json
export SOLANA_DEVNET_PRIVATE_KEY=your_key

npm run upload:metadata
```

---

## 📁 R2 存储结构

### 推荐的文件夹结构

```
kolmarket-uploads/
├── uploads/                    # 用户上传的文件
│   ├── images/                 # 图片
│   ├── videos/                 # 视频
│   └── documents/              # 文档
├── token-metadata/             # Token 元数据
│   ├── kmt-metadata.json       # KMT 元数据
│   └── other-tokens/           # 其他代币元数据
├── kol-content/                # KOL 内容
│   ├── avatars/                # 头像
│   └── posts/                  # 帖子内容
└── knowledge-base/             # 知识库文件
    └── training-data/          # 训练数据
```

---

## 🔧 配置 R2 公共访问

### 方法 1: 使用自定义域名（推荐）

1. **在 Cloudflare Dashboard 中**:
   - R2 → 选择 bucket → Settings
   - 配置自定义域名
   - 例如: `oss.kolmarket.ai`

2. **更新 DNS**:
   - 添加 CNAME 记录: `oss` → R2 提供的域名

3. **使用公共 URL**:
   ```
   https://oss.kolmarket.ai/path/to/file.json
   ```

### 方法 2: 使用 API 路由

如果不想配置自定义域名，可以通过 API 路由访问：

```
https://your-domain.com/api/storage/path/to/file.json
```

---

## 📝 更新元数据脚本

### 上传元数据 JSON 到 R2

```bash
# 设置环境变量（如果使用 S3 API）
export CLOUDFLARE_ACCOUNT_ID=your_account_id
export CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
export CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key

# 运行上传脚本
node scripts/upload-metadata-to-r2.js
```

### 使用 Wrangler CLI（更简单）

```bash
# 直接上传
npx wrangler r2 object put kolmarket-uploads/token-metadata/kmt-metadata.json \
  --file=kmt-metadata.json \
  --content-type="application/json"

# 获取公共 URL（如果配置了自定义域名）
# 或使用 API 路由: /api/storage/token-metadata/kmt-metadata.json
```

---

## 🔍 验证 R2 存储

### 列出 R2 中的文件

```bash
# 列出所有文件
npx wrangler r2 object list kolmarket-uploads

# 列出特定文件夹
npx wrangler r2 object list kolmarket-uploads --prefix="token-metadata/"
```

### 下载文件验证

```bash
# 下载文件
npx wrangler r2 object get kolmarket-uploads/token-metadata/kmt-metadata.json \
  --file=downloaded-metadata.json

# 验证内容
cat downloaded-metadata.json
```

---

## 📊 完整工作流程

### 1. 准备元数据 JSON

元数据文件已创建: `kmt-metadata.json`

### 2. 上传到 R2

```bash
# 使用脚本
node scripts/upload-metadata-to-r2.js

# 或使用 Wrangler
npx wrangler r2 object put kolmarket-uploads/token-metadata/kmt-metadata.json \
  --file=kmt-metadata.json
```

### 3. 获取 R2 URL

- 自定义域名: `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json`
- API 路由: `https://your-domain.com/api/storage/token-metadata/kmt-metadata.json`

### 4. 设置链上元数据

```bash
export TOKEN_MINT=your_mint_address
export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json
npm run upload:metadata
```

---

## ⚙️ 环境变量配置

### R2 凭证（如果使用 S3 API）

```bash
export CLOUDFLARE_ACCOUNT_ID=your_account_id
export CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
export CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
```

**获取 R2 凭证**:
1. 访问 Cloudflare Dashboard
2. R2 → Manage R2 API Tokens
3. 创建 API Token
4. 复制 Access Key ID 和 Secret Access Key

### R2 自定义域名（可选）

```bash
export R2_CUSTOM_DOMAIN=oss.kolmarket.ai
```

---

## 🔒 安全配置

### 1. 公共访问控制

- **公共文件**: 配置自定义域名，允许公共访问
- **私有文件**: 使用 API 路由，添加认证

### 2. CORS 配置

如果需要跨域访问，配置 CORS：

```bash
# 创建 CORS 配置
cat > cors.json <<EOF
{
  "AllowedOrigins": ["https://kolmarket.ai"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}
EOF

# 应用 CORS 配置
npx wrangler r2 bucket cors put kolmarket-uploads --file=cors.json
```

---

## 📚 相关文档

- [R2 存储指南](./R2_STORAGE_GUIDE.md)
- [上传元数据到链上](./UPLOAD_METADATA_TO_BLOCKCHAIN.md)
- [KMT 元数据设置](./KMT_METADATA_SETUP.md)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)

---

## ✅ 检查清单

- [ ] R2 Bucket 已创建: `kolmarket-uploads`
- [ ] R2 绑定已配置: `wrangler.toml`
- [ ] 元数据 JSON 已上传到 R2
- [ ] 获取了 R2 文件 URL
- [ ] 使用 R2 URL 设置了链上元数据
- [ ] 在浏览器中验证元数据可访问

---

**最后更新**: 2026-01-23
