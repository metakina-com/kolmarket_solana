"use client";

import { useState, useEffect } from "react";
import { Database, Upload, FileText, Plus, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";

interface KnowledgeStats {
  totalChunks: number;
  totalSources: number;
  firstAdded: number | null;
  lastAdded: number | null;
}

export function KnowledgeManagement({ kolHandle }: { kolHandle: string }) {
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [uploading, setUploading] = useState(false);

  // 加载统计信息
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/knowledge?kolHandle=${kolHandle}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // 添加知识
  const addKnowledge = async () => {
    if (!content.trim()) return;

    setUploading(true);
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kolHandle,
          content: content.trim(),
          metadata: {
            source: source || "manual",
            type: "text",
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Knowledge added:", data);
        setContent("");
        setSource("");
        await loadStats(); // 刷新统计
      } else {
        throw new Error("Failed to add knowledge");
      }
    } catch (error) {
      console.error("Failed to add knowledge:", error);
      alert("添加知识失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  // 索引文档
  const indexDocument = async () => {
    if (!content.trim()) return;

    setUploading(true);
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kolHandle,
          document: content.trim(),
          metadata: {
            source: source || "document",
            chunkSize: 500,
            overlap: 50,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Document indexed:", data);
        setContent("");
        setSource("");
        await loadStats(); // 刷新统计
      } else {
        throw new Error("Failed to index document");
      }
    } catch (error) {
      console.error("Failed to index document:", error);
      alert("索引文档失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  // 组件挂载时加载统计
  useEffect(() => {
    loadStats();
  }, [kolHandle]);

  return (
    <motion.div
      className="glass rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">知识库管理</h2>
        <span className="text-sm text-slate-400">@{kolHandle}</span>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">知识块</div>
            <div className="text-lg font-bold text-white">{stats.totalChunks}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">数据源</div>
            <div className="text-lg font-bold text-white">{stats.totalSources}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">首次添加</div>
            <div className="text-sm text-white">
              {stats.firstAdded ? new Date(stats.firstAdded).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">最后更新</div>
            <div className="text-sm text-white">
              {stats.lastAdded ? new Date(stats.lastAdded).toLocaleDateString() : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* 添加知识表单 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            数据源（可选）
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="例如: twitter, blog, document"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            知识内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入知识内容或文档..."
            rows={6}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={addKnowledge}
            disabled={!content.trim() || uploading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {uploading ? "添加中..." : "添加知识"}
          </button>
          <button
            onClick={indexDocument}
            disabled={!content.trim() || uploading}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            {uploading ? "索引中..." : "索引文档"}
          </button>
          <button
            onClick={loadStats}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center text-slate-400 text-sm">
          加载中...
        </div>
      )}
    </motion.div>
  );
}
