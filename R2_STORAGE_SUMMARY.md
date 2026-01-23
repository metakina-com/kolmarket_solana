# ☁️ Cloudflare R2 存储总结

**状态**: ✅ **所有数据存储已迁移到 Cloudflare R2**

---

## ✅ 已使用 R2 的功能

### 1. 文件上传和访问 ✅

- **API**: `/api/storage/upload` - 上传文件到 R2
- **API**: `/api/storage/[path]` - 访问 R2 文件
- **组件**: `FileUpload` - 文件上传组件
- **工具**: `lib/storage/r2-storage.ts` - R2 存储工具函数

### 2. 训练数据上传 ✅

- **API**: `/api/cortex/upload` - 上传训练数据到 R2
- **页面**: `app/cortex/page.tsx` - 知识库训练页面

### 3. Token 元数据存储 ✅

- **脚本**: `scripts/upload-metadata-to-r2.js` - 上传元数据 JSON 到 R2
- **存储路径**: `token-metadata/kmt-metadata.json`
- **访问 URL**: `https://oss.kolmarket.ai/token-metadata/kmt-metadata.json`

### 4. 代币图片存储 ✅

- **当前 URL**: `https://oss.kolmarket.ai/etPJjFNh_400x400.jpg`
- **状态**: ✅ 已使用 R2 自定义域名

---

## 📁 R2 存储结构

```
kolmarket-uploads/
├── uploads/                    # 用户上传的文件（默认）
│   ├── images/                 # 图片
│   ├── videos/                 # 视频
│   └── documents/              # 文档
├── token-metadata/             # Token 元数据 JSON
│   └── kmt-metadata.json       # KMT 元数据
├── kol-content/                # KOL 内容
│   ├── avatars/                # 头像
│   └── posts/                  # 帖子内容
└── knowledge-base/             # 知识库文件
    └── training-data/          # 训练数据
```

---

## 🚀 快速使用

### 上传文件到 R2

```typescript
// 使用组件
<FileUpload
  onUploadComplete={(file) => {
    console.log('文件 URL:', file.fileUrl);
  }}
/>

// 使用 API
const formData = new FormData();
formData.append('file', file);
const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
});
```

### 上传元数据 JSON 到 R2

```bash
# 使用脚本
npm run upload:r2

# 或使用 Wrangler
npx wrangler r2 object put kolmarket-uploads/token-metadata/kmt-metadata.json \
  --file=kmt-metadata.json
```

### 访问 R2 文件

```typescript
// 使用 API 路由
const fileUrl = '/api/storage/token-metadata/kmt-metadata.json';

// 或使用自定义域名
const fileUrl = 'https://oss.kolmarket.ai/token-metadata/kmt-metadata.json';
```

---

## 📋 配置检查清单

- [x] R2 Bucket 已创建: `kolmarket-uploads`
- [x] R2 绑定已配置: `wrangler.toml`
- [x] 文件上传 API 使用 R2
- [x] 文件访问 API 使用 R2
- [x] 训练数据上传使用 R2
- [x] Token 元数据使用 R2
- [x] 代币图片使用 R2
- [x] 所有文档已更新为使用 R2

---

## 📚 相关文档

- [R2 存储指南](./docs/R2_STORAGE_GUIDE.md)
- [R2 完整配置](./docs/R2_STORAGE_COMPLETE.md)
- [存储迁移指南](./docs/STORAGE_MIGRATION_TO_R2.md)
- [上传元数据到链上](./docs/UPLOAD_METADATA_TO_BLOCKCHAIN.md)

---

**最后更新**: 2026-01-23  
**状态**: ✅ 所有数据存储已使用 Cloudflare R2
