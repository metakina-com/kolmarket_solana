# R2 存储设置指南

## 🚀 快速设置

### 1. 创建 R2 Bucket

```bash
# 创建存储桶
npx wrangler r2 bucket create kolmarket-uploads
```

### 2. 验证配置

`wrangler.toml` 中已自动配置：

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "kolmarket-uploads"
```

### 3. 部署应用

```bash
# 构建并部署
npm run build
npx wrangler pages deploy .next --project-name=kolmarket-ai
```

## ✅ 完成！

现在您可以使用 `FileUpload` 组件上传文件了！

## 📖 使用示例

```tsx
import { FileUpload } from '@/components/FileUpload';

<FileUpload
  onUploadComplete={(file) => {
    console.log('文件 URL:', file.fileUrl);
  }}
/>
```

详细文档请查看：[docs/R2_STORAGE_GUIDE.md](./docs/R2_STORAGE_GUIDE.md)
