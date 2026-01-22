'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image, Video, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize } from '@/lib/storage/r2-storage';

export interface UploadedFile {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

interface FileUploadProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number; // bytes
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  folder,
  allowedTypes,
  maxSize = 100 * 1024 * 1024, // 100MB
  multiple = false,
  className = '',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const filesToUpload = multiple ? Array.from(files) : [files[0]];
      const uploaded: UploadedFile[] = [];

      for (const file of filesToUpload) {
        // 验证文件大小
        if (file.size > maxSize) {
          const errorMsg = `文件 ${file.name} 超过最大大小限制 (${formatFileSize(maxSize)})`;
          setError(errorMsg);
          onUploadError?.(errorMsg);
          continue;
        }

        setUploadProgress(10);

        const formData = new FormData();
        formData.append('file', file);
        if (folder) {
          formData.append('folder', folder);
        }
        if (allowedTypes) {
          formData.append('allowedTypes', allowedTypes.join(','));
        }

        setUploadProgress(30);

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        setUploadProgress(70);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        setUploadProgress(100);

        if (result.success && result.file) {
          uploaded.push(result.file);
          onUploadComplete?.(result.file);
        }
      }

      setUploadedFiles(prev => [...prev, ...uploaded]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (filePath: string) => {
    setUploadedFiles(prev => prev.filter(f => f.filePath !== filePath));
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return Image;
    if (contentType.startsWith('video/')) return Video;
    return File;
  };

  const acceptTypes = allowedTypes?.join(',') || 'image/*,video/*,audio/*,application/pdf';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传区域 */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept={acceptTypes}
          multiple={multiple}
          disabled={isUploading}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full p-6 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 hover:border-cyan-500 hover:bg-slate-800/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center justify-center gap-3">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-sm text-slate-400">上传中... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-cyan-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    点击或拖拽文件到此处上传
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    支持图片、视频、音频、PDF（最大 {formatFileSize(maxSize)}）
                  </p>
                </div>
              </>
            )}
          </div>
        </button>

        {/* 上传进度条 */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2"
            >
              <div className="w-full bg-slate-800 rounded-full h-2">
                <motion.div
                  className="bg-cyan-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 已上传文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-400">已上传的文件</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => {
              const Icon = getFileIcon(file.contentType);
              return (
                <motion.div
                  key={file.filePath}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  </div>
                  <button
                    onClick={() => removeFile(file.filePath)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
