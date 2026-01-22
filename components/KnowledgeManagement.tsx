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
      className="bg-white rounded-xl p-6 border border-gray-200/80"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Knowledge Base</h2>
        <span className="text-sm text-gray-500">@{kolHandle}</span>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-3 border border-gray-200/80">
            <div className="text-xs text-gray-500 mb-1">Knowledge Chunks</div>
            <div className="text-lg font-bold text-foreground">{stats.totalChunks}</div>
          </div>
          <div className="bg-muted rounded-lg p-3 border border-gray-200/80">
            <div className="text-xs text-gray-500 mb-1">Sources</div>
            <div className="text-lg font-bold text-foreground">{stats.totalSources}</div>
          </div>
          <div className="bg-muted rounded-lg p-3 border border-gray-200/80">
            <div className="text-xs text-gray-500 mb-1">First Added</div>
            <div className="text-sm text-foreground">
              {stats.firstAdded ? new Date(stats.firstAdded).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3 border border-gray-200/80">
            <div className="text-xs text-gray-500 mb-1">Last Updated</div>
            <div className="text-sm text-foreground">
              {stats.lastAdded ? new Date(stats.lastAdded).toLocaleDateString() : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* 添加知识表单 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Source (Optional)
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. twitter, blog, document"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Knowledge Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter knowledge content or document..."
            rows={6}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={addKnowledge}
            disabled={!content.trim() || uploading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary-dark"
          >
            <Plus size={16} />
            {uploading ? "Adding..." : "Add Knowledge"}
          </button>
          <button
            onClick={indexDocument}
            disabled={!content.trim() || uploading}
            className="flex-1 px-4 py-2 bg-muted hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors text-center text-foreground flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            {uploading ? "Indexing..." : "Index Document"}
          </button>
          <button
            onClick={loadStats}
            disabled={loading}
            className="px-4 py-2 bg-muted hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Loading...
        </div>
      )}
    </motion.div>
  );
}
