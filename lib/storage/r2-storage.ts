/**
 * R2 存储工具函数
 * 用于处理用户上传的图片、视频等文件
 */

export interface UploadResult {
  success: boolean;
  fileName: string;
  filePath: string;
  fileUrl?: string;
  fileSize: number;
  contentType: string;
  error?: string;
}

export interface FileMetadata {
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedAt: number;
  uploadedBy?: string;
}

/**
 * 上传文件到 R2
 */
export async function uploadFileToR2(
  env: any,
  file: File | Blob,
  fileName: string,
  folder?: string
): Promise<UploadResult> {
  try {
    const r2 = env.R2_BUCKET;
    
    if (!r2) {
      throw new Error("R2_BUCKET binding not found");
    }

    // 生成文件路径
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folder 
      ? `${folder}/${timestamp}-${sanitizedFileName}`
      : `uploads/${timestamp}-${sanitizedFileName}`;

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    
    // 上传到 R2
    await r2.put(filePath, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
      customMetadata: {
        originalName: fileName,
        uploadedAt: timestamp.toString(),
      },
    });

    // 生成访问 URL（如果配置了自定义域名）
    // 否则需要通过 API 路由访问
    const fileUrl = `/api/storage/${encodeURIComponent(filePath)}`;

    return {
      success: true,
      fileName: sanitizedFileName,
      filePath,
      fileUrl,
      fileSize: arrayBuffer.byteLength,
      contentType: file.type || 'application/octet-stream',
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    return {
      success: false,
      fileName,
      filePath: '',
      fileSize: 0,
      contentType: file.type || 'application/octet-stream',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * 从 R2 获取文件
 */
export async function getFileFromR2(
  env: any,
  filePath: string
): Promise<{ body: ReadableStream | null; contentType: string; size: number } | null> {
  try {
    const r2 = env.R2_BUCKET;
    
    if (!r2) {
      throw new Error("R2_BUCKET binding not found");
    }

    const object = await r2.get(filePath);
    
    if (!object) {
      return null;
    }

    return {
      body: object.body,
      contentType: object.httpMetadata?.contentType || 'application/octet-stream',
      size: object.size,
    };
  } catch (error) {
    console.error("R2 get file error:", error);
    return null;
  }
}

/**
 * 从 R2 删除文件
 */
export async function deleteFileFromR2(
  env: any,
  filePath: string
): Promise<boolean> {
  try {
    const r2 = env.R2_BUCKET;
    
    if (!r2) {
      throw new Error("R2_BUCKET binding not found");
    }

    await r2.delete(filePath);
    return true;
  } catch (error) {
    console.error("R2 delete file error:", error);
    return false;
  }
}

/**
 * 列出 R2 中的文件
 */
export async function listFilesInR2(
  env: any,
  prefix?: string,
  limit: number = 100
): Promise<string[]> {
  try {
    const r2 = env.R2_BUCKET;
    
    if (!r2) {
      throw new Error("R2_BUCKET binding not found");
    }

    const options: any = { limit };
    if (prefix) {
      options.prefix = prefix;
    }

    const objects = await r2.list(options);
    return objects.objects.map((obj: { key: string }) => obj.key);
  } catch (error) {
    console.error("R2 list files error:", error);
    return [];
  }
}

/**
 * 验证文件类型
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = ['image/*', 'video/*', 'audio/*', 'application/pdf']
): boolean {
  if (allowedTypes.length === 0) {
    return true;
  }

  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return file.type.startsWith(category + '/');
    }
    return file.type === type;
  });
}

/**
 * 验证文件大小（默认最大 100MB）
 */
export function validateFileSize(
  file: File,
  maxSizeBytes: number = 100 * 1024 * 1024
): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
