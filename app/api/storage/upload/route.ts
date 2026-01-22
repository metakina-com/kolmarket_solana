import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToR2, validateFileType, validateFileSize } from '@/lib/storage/r2-storage';

export const runtime = 'edge';

/**
 * POST /api/storage/upload
 * 上传文件到 R2 存储
 * 
 * 支持的文件类型：
 * - 图片：image/*
 * - 视频：video/*
 * - 音频：audio/*
 * - 文档：application/pdf
 * 
 * 最大文件大小：100MB
 */
export async function POST(req: NextRequest) {
  try {
    const env = (process.env as unknown) as any;
    
    // 检查 R2 绑定
    if (!env.R2_BUCKET) {
      return NextResponse.json(
        { error: 'R2_BUCKET binding not found. Please configure R2 bucket in wrangler.toml' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string | null;
    const allowedTypes = formData.get('allowedTypes') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypesArray = allowedTypes 
      ? allowedTypes.split(',').map(t => t.trim())
      : ['image/*', 'video/*', 'audio/*', 'application/pdf'];
    
    if (!validateFileType(file, allowedTypesArray)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${allowedTypesArray.join(', ')}` },
        { status: 400 }
      );
    }

    // 验证文件大小（默认 100MB）
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (!validateFileSize(file, maxSize)) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 上传文件
    const result = await uploadFileToR2(
      env,
      file,
      file.name,
      folder || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        fileName: result.fileName,
        filePath: result.filePath,
        fileUrl: result.fileUrl,
        fileSize: result.fileSize,
        contentType: result.contentType,
      },
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
