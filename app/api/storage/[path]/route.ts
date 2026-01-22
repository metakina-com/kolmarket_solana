import { NextRequest, NextResponse } from 'next/server';
import { getFileFromR2 } from '@/lib/storage/r2-storage';

/**
 * GET /api/storage/[path]
 * 从 R2 获取文件（用于访问上传的文件）
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const env = (process.env as unknown) as any;
    
    // 检查 R2 绑定
    if (!env.R2_BUCKET) {
      return NextResponse.json(
        { error: 'R2_BUCKET binding not found' },
        { status: 503 }
      );
    }

    const { path } = await params;
    const filePath = decodeURIComponent(path);

    // 安全检查：防止路径遍历攻击
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // 从 R2 获取文件
    const fileData = await getFileFromR2(env, filePath);

    if (!fileData || !fileData.body) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // 返回文件流
    return new NextResponse(fileData.body, {
      headers: {
        'Content-Type': fileData.contentType,
        'Content-Length': fileData.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Get file API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get file' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/storage/[path]
 * 从 R2 删除文件
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const env = (process.env as unknown) as any;
    
    // 检查 R2 绑定
    if (!env.R2_BUCKET) {
      return NextResponse.json(
        { error: 'R2_BUCKET binding not found' },
        { status: 503 }
      );
    }

    const { path } = await params;
    const filePath = decodeURIComponent(path);

    // 安全检查：防止路径遍历攻击
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // 删除文件
    const { deleteFileFromR2 } = await import('@/lib/storage/r2-storage');
    const success = await deleteFileFromR2(env, filePath);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    );
  }
}
