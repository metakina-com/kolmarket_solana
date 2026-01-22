"use client";

import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Clock, Play, Pause, Trash2, Plus, Settings, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AutomationTask {
  id: string;
  name: string;
  type: "scheduled" | "conditional" | "manual";
  schedule?: {
    cron: string;
    timezone?: string;
  };
  condition?: {
    type: string;
    params: Record<string, any>;
  };
  distribution: {
    recipients: Array<{
      address: string;
      amount: number;
      percentage?: number;
    }>;
    totalAmount?: number;
    usePercentage: boolean;
  };
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

export function KMTAutomationPanel() {
  const { connection } = useConnection();
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [tokenMint, setTokenMint] = useState("");
  const [network, setNetwork] = useState<"devnet" | "mainnet-beta">("devnet");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (tokenMint) {
      loadTasks();
    }
  }, [tokenMint, network]);

  const loadTasks = async () => {
    if (!tokenMint) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `/api/execution/kmt-automation?network=${network}&tokenMint=${tokenMint}`
      );
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Load tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const executeTask = async (taskId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/execution/kmt-automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          tokenMint,
          taskId,
          action: "execute",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`任务执行成功！交易哈希: ${data.result.transactionHash}`);
        loadTasks();
      } else {
        alert(`任务执行失败: ${data.result.error}`);
      }
    } catch (err) {
      console.error("Execute task error:", err);
      alert("执行任务失败");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/execution/kmt-automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          tokenMint,
          taskId,
          action: "toggle",
          enabled: !enabled,
        }),
      });
      if (res.ok) {
        loadTasks();
      }
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("确定要删除这个任务吗？")) return;
    
    try {
      const res = await fetch("/api/execution/kmt-automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          tokenMint,
          taskId,
          action: "delete",
        }),
      });
      if (res.ok) {
        loadTasks();
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  return (
    <div className="glass-strong rounded-xl p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          KMT 自动化运营
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          创建任务
        </button>
      </div>

      {/* 配置区域 */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-lg space-y-3">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-300 mb-1">Token Mint 地址</label>
            <input
              type="text"
              value={tokenMint}
              onChange={(e) => setTokenMint(e.target.value)}
              placeholder="输入 KMT Token Mint 地址"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm text-slate-300 mb-1">网络</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as "devnet" | "mainnet-beta")}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="devnet">Devnet</option>
              <option value="mainnet-beta">Mainnet</option>
            </select>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-cyan-400" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          {tokenMint ? "暂无自动化任务，点击上方按钮创建" : "请先输入 Token Mint 地址"}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.enabled 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-slate-700 text-slate-400"
                    }`}>
                      {task.enabled ? "已启用" : "已禁用"}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400">
                      {task.type === "scheduled" ? "定时任务" : 
                       task.type === "conditional" ? "条件触发" : "手动任务"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-400 space-y-1">
                    {task.schedule && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>计划: {task.schedule.cron}</span>
                        {task.nextRun && (
                          <span>下次运行: {new Date(task.nextRun).toLocaleString("zh-CN")}</span>
                        )}
                      </div>
                    )}
                    {task.lastRun && (
                      <div>上次运行: {new Date(task.lastRun).toLocaleString("zh-CN")}</div>
                    )}
                    <div>执行次数: {task.runCount}</div>
                    <div>
                      接收者数量: {task.distribution.recipients.length}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {task.type === "manual" && (
                    <button
                      onClick={() => executeTask(task.id)}
                      disabled={loading}
                      className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
                      title="执行任务"
                    >
                      <Play size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleTask(task.id, task.enabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      task.enabled
                        ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
                        : "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                    }`}
                    title={task.enabled ? "禁用任务" : "启用任务"}
                  >
                    {task.enabled ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                    title="删除任务"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 创建任务模态框（简化版） */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">创建自动化任务</h3>
            <p className="text-slate-400 mb-4">
              完整功能开发中，请使用 API 直接创建任务。
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
