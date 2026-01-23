# ☁️ 数据存储迁移到 Cloudflare R2

本指南说明如何将所有数据存储迁移到 Cloudflare R2。

---

## 📊 当前存储状态

### ✅ 已使用 R2 的功能

| 功能 | 状态 | 说明 |
|------|------|------|
| **文件上传** | ✅ | `/api/storage/upload` - 用户上传的文件 |
| **文件访问** | ✅ | `/api/storage/[path]` - 通过 API 访问文件 |
| **文件删除** | ✅ | `/api/storage/[path]` DELETE - 删除文件 |
| **训练数据** | ✅ | `/api/cortex/upload` - 知识库训练数据 |
| **代币图片** | ✅ | `oss.kolmarket.ai` - 使用 R2 自定义域名 |

### 🔄 已迁移到 R2

| 功能 | 状态 | 说明 |
|------|------|------|
| **Token 元数据 JSON** | ✅ | 使用 R2 存储，不再使用 IPFS |

---

## 🚀 完整 R2 存储配置

### 1. R2 Bucket 配置

**Bucket 名称**: `kolmarket-uploads`

**配置位置**: `wrangler.toml`

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "kolmarket-uploads"
```

### 2. R2 文件夹结构

```
kolmarket-uploads/
├── uploads/                    # 用户上传的文件（默认）
│   ├── images/                 # 图片
│   ├── videos/                 # 视频
│   └── documents/              # 文档
├── token-metadata/             # Token 元数据 JSON
│   ├── kmt-metadata.json       # KMT 元数据
│   └── other-tokens/           # 其他代币元数据
├── kol-content/                # KOL 内容
│   ├── avatars/                # 头像
│   └── posts/                  # 帖子内容
└── knowledge-base/             # 知识库文件
    └── training-data/          # 训练数据
```

---

## 📝 使用 R2 存储元数据

### 步骤 1: 上传元数据 JSON 到 R2

```bash
# 方法 1: 使用脚本（推荐）
npm run upload:r2

# 方法 2: 使用 Wrangler CLI
npx wrangler r2 object put kolmarket-uploads/token-metadata/kmt-metadata.json \
  --file=kmt-metadata.json \
  --content-type="application/json"
```

### 步骤 2: 获取 R2 URL

**如果配置了自定义域名** (`oss.kolmarket.ai`):
```
https://oss.kolmarket.ai/token-metadata/kmt-metadata.json
```

**如果使用 API 路由**:
```
https://your-domain.com/api/storage/token-metadata/kmt-metadata.json
```

### 步骤 3: 使用 R2 URL 设置链上元数据

```bash
export TOKEN_MINT=your_mint_address
export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json
export SOLANA_DEVNET_PRIVATE_KEY=your_key

npm run upload:metadata
```

---

## 🔧 R2 自定义域名配置

### 配置自定义域名

1. **在 Cloudflare Dashboard 中**:
   - R2 → 选择 `kolmarket-uploads` bucket
   - Settings → Public Access
   - 配置自定义域名: `oss.kolmarket.ai`

2. **更新 DNS**:
   - 添加 CNAME 记录: `oss` → R2 提供的域名

3. **使用公共 URL**:
   ```
   https://oss.kolmarket.ai/path/to/file.json
   ```

---

## 📚 API 使用

### 上传文件到 R2

```typescript
// POST /api/storage/upload
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'token-metadata'); // 可选

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.file.fileUrl 可用于访问文件
```

### 访问 R2 文件

```typescript
// GET /api/storage/[path]
// 文件 URL: /api/storage/token-metadata/kmt-metadata.json
const fileUrl = result.file.fileUrl;
```

### 删除 R2 文件

```typescript
// DELETE /api/storage/[path]
const response = await fetch(`/api/storage/${encodeURIComponent(filePath)}`, {
  method: 'DELETE',
});
```

---

## ✅ 验证 R2 存储

### 列出 R2 文件

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
  --file=downloaded.json

# 验证内容
cat downloaded.json
```

---

## 📋 完整工作流程

### KMT Token 元数据完整流程

```bash
# 1. 创建代币
export SOLANA_DEVNET_PRIVATE_KEY=your_key
npm run create:token
# 保存 Mint 地址

# 2. 上传元数据 JSON 到 R2
npm run upload:r2
# 获取 R2 URL

# 3. 提交元数据到链上
export TOKEN_MINT=your_mint_address
export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json
npm run upload:metadata

# 4. 在浏览器中查看
# 访问脚本输出的 Explorer 链接
```

---

## 🔒 安全配置

### 1. 公共访问控制

- **公共文件**: 配置自定义域名，允许公共访问
- **私有文件**: 使用 API 路由，添加认证

### 2. CORS 配置

如果需要跨域访问:

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

## 📊 R2 存储优势

1. **统一存储**
   - 所有文件都存储在 R2
   - 与项目其他存储一致
   - 易于管理和维护

2. **成本效益**
   - 免费计划: 10GB 存储
   - 按使用量计费
   - 无出口费用（与 S3 不同）

3. **性能**
   - 全球 CDN 加速
   - 低延迟访问
   - 高可用性

4. **集成**
   - 与 Cloudflare Workers 无缝集成
   - 与 Pages 项目统一管理
   - 简单的 API

---

## ✅ 检查清单

- [ ] R2 Bucket 已创建: `kolmarket-uploads`
- [ ] R2 绑定已配置: `wrangler.toml`
- [ ] 元数据 JSON 已上传到 R2
- [ ] 获取了 R2 文件 URL
- [ ] 使用 R2 URL 设置了链上元数据
- [ ] 在浏览器中验证元数据可访问
- [ ] 所有文件存储都使用 R2

---

## 📚 相关文档

- [R2 存储指南](./R2_STORAGE_GUIDE.md)
- [R2 完整配置](./R2_STORAGE_COMPLETE.md)
- [上传元数据到链上](./UPLOAD_METADATA_TO_BLOCKCHAIN.md)
- [KMT 元数据设置](./KMT_METADATA_SETUP.md)

---

**最后更新**: 2026-01-23
