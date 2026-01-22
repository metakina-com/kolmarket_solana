# R2 存储集成指南

## 📋 概述

本项目已集成 Cloudflare R2 存储，用于存储用户上传的图片、视频、音频等文件。

## 🚀 快速开始

### 1. 创建 R2 Bucket

```bash
# 创建存储桶
npx wrangler r2 bucket create kolmarket-uploads
```

### 2. 配置已自动完成

`wrangler.toml` 中已配置 R2 绑定：

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "kolmarket-uploads"
```

### 3. 使用文件上传组件

```tsx
import { FileUpload } from '@/components/FileUpload';

export default function MyPage() {
  return (
    <FileUpload
      onUploadComplete={(file) => {
        console.log('文件上传成功:', file);
        // file.fileUrl 可用于显示或保存
      }}
      onUploadError={(error) => {
        console.error('上传失败:', error);
      }}
      folder="user-uploads" // 可选：指定文件夹
      allowedTypes={['image/*', 'video/*']} // 可选：限制文件类型
      maxSize={50 * 1024 * 1024} // 可选：限制文件大小（50MB）
      multiple={true} // 可选：支持多文件上传
    />
  );
}
```

## 📚 API 使用

### 上传文件

```typescript
// POST /api/storage/upload
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'user-uploads'); // 可选
formData.append('allowedTypes', 'image/*,video/*'); // 可选

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.file.fileUrl 可用于访问文件
```

### 访问文件

```typescript
// GET /api/storage/[path]
// 文件 URL 格式：/api/storage/uploads/1234567890-filename.jpg
const fileUrl = result.file.fileUrl;
// 直接使用 <img src={fileUrl} /> 或 <video src={fileUrl} />
```

### 删除文件

```typescript
// DELETE /api/storage/[path]
const response = await fetch(`/api/storage/${encodeURIComponent(filePath)}`, {
  method: 'DELETE',
});
```

## 🛠️ 工具函数

### 上传文件

```typescript
import { uploadFileToR2 } from '@/lib/storage/r2-storage';

const result = await uploadFileToR2(
  env,
  file,
  'my-image.jpg',
  'user-uploads' // 可选文件夹
);
```

### 获取文件

```typescript
import { getFileFromR2 } from '@/lib/storage/r2-storage';

const fileData = await getFileFromR2(env, 'uploads/1234567890-image.jpg');
```

### 删除文件

```typescript
import { deleteFileFromR2 } from '@/lib/storage/r2-storage';

const success = await deleteFileFromR2(env, 'uploads/1234567890-image.jpg');
```

### 列出文件

```typescript
import { listFilesInR2 } from '@/lib/storage/r2-storage';

const files = await listFilesInR2(env, 'uploads/', 100);
```

## 📝 文件类型支持

默认支持的文件类型：
- **图片**: `image/*` (jpg, png, gif, webp, svg 等)
- **视频**: `video/*` (mp4, webm, mov 等)
- **音频**: `audio/*` (mp3, wav, ogg 等)
- **文档**: `application/pdf`

## 📏 文件大小限制

- 默认最大文件大小：**100MB**
- 可在上传时自定义限制

## 🔒 安全特性

1. **路径遍历保护**: 防止 `../` 等路径攻击
2. **文件类型验证**: 可限制允许的文件类型
3. **文件大小验证**: 防止上传过大文件
4. **文件名清理**: 自动清理特殊字符

## 📂 文件组织结构

```
kolmarket-uploads/
├── uploads/              # 默认上传目录
│   ├── 1234567890-image.jpg
│   └── 1234567891-video.mp4
├── user-uploads/         # 用户上传目录（示例）
│   └── 1234567892-avatar.png
└── kol-content/          # KOL 内容目录（示例）
    └── 1234567893-post.jpg
```

## 🎨 组件示例

### 图片上传

```tsx
import { FileUpload } from '@/components/FileUpload';
import { useState } from 'react';

export function ImageUploader() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div>
      <FileUpload
        allowedTypes={['image/*']}
        maxSize={10 * 1024 * 1024} // 10MB
        onUploadComplete={(file) => {
          setImageUrl(file.fileUrl);
        }}
      />
      {imageUrl && (
        <img src={imageUrl} alt="Uploaded" className="mt-4 rounded-lg" />
      )}
    </div>
  );
}
```

### 视频上传

```tsx
import { FileUpload } from '@/components/FileUpload';
import { useState } from 'react';

export function VideoUploader() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <div>
      <FileUpload
        allowedTypes={['video/*']}
        maxSize={100 * 1024 * 1024} // 100MB
        onUploadComplete={(file) => {
          setVideoUrl(file.fileUrl);
        }}
      />
      {videoUrl && (
        <video src={videoUrl} controls className="mt-4 rounded-lg" />
      )}
    </div>
  );
}
```

### 多文件上传

```tsx
import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { useState } from 'react';

export function MultiFileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  return (
    <div>
      <FileUpload
        multiple={true}
        onUploadComplete={(file) => {
          setFiles(prev => [...prev, file]);
        }}
      />
      <div className="mt-4 grid grid-cols-3 gap-4">
        {files.map((file) => (
          <div key={file.filePath} className="relative">
            {file.contentType.startsWith('image/') ? (
              <img src={file.fileUrl} alt={file.fileName} className="rounded-lg" />
            ) : (
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-sm">{file.fileName}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 配置自定义域名（可选）

如果需要使用自定义域名访问文件：

1. 在 Cloudflare Dashboard 中配置 R2 自定义域名
2. 更新 `lib/storage/r2-storage.ts` 中的 `fileUrl` 生成逻辑

```typescript
// 使用自定义域名
const fileUrl = `https://cdn.yourdomain.com/${filePath}`;
```

## 📊 R2 存储配额

- **免费计划**: 10GB 存储空间
- **付费计划**: 按使用量计费

## 🐛 故障排查

### 问题：R2_BUCKET binding not found

**解决方案**:
1. 确保已创建 R2 bucket: `npx wrangler r2 bucket create kolmarket-uploads`
2. 检查 `wrangler.toml` 配置是否正确
3. 重新部署应用

### 问题：文件上传失败

**检查**:
1. 文件大小是否超过限制
2. 文件类型是否在允许列表中
3. 网络连接是否正常
4. R2 bucket 是否存在

### 问题：文件无法访问

**检查**:
1. 文件路径是否正确
2. API 路由是否正常工作
3. 文件是否已成功上传到 R2

## 📚 相关文档

- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [项目部署指南](./DEPLOYMENT_GUIDE.md)
- [API 文档](./API_DOCUMENTATION.md)
