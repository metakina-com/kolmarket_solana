"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Bot, 
  Twitter, 
  MessageSquare, 
  TrendingUp, 
  Play, 
  Square, 
  Settings,
  Activity,
  DollarSign,
  Users
} from "lucide-react";
import AgentSuiteConfig from "./AgentSuiteConfig";

interface AgentSuiteStatus {
  suiteId: string;
  kolHandle: string;
  status: "active" | "inactive" | "error";
  modules: {
    avatar: ModuleStatus;
    mod: ModuleStatus;
    trader: ModuleStatus;
  };
  stats: {
    avatar?: AvatarStats;
    mod?: ModStats;
    trader?: TraderStats;
  };
  createdAt: string;
  lastUpdated: string;
}

interface ModuleStatus {
  enabled: boolean;
  status: "running" | "stopped" | "error";
  lastActivity?: string;
  error?: string;
}

interface AvatarStats {
  totalTweets: number;
  totalInteractions: number;
  followers: number;
  engagementRate: number;
  lastTweetTime?: string;
}

interface ModStats {
  totalMessages: number;
  totalUsers: number;
  responseRate: number;
  averageResponseTime: number;
  lastActivity?: string;
}

interface TraderStats {
  totalTrades: number;
  totalVolume: number;
  totalProfit: number;
  winRate: number;
  followers: number;
  lastTradeTime?: string;
}

interface AgentSuitePanelProps {
  kolHandle: string;
  kolName: string;
}

export default function AgentSuitePanel({ kolHandle, kolName }: AgentSuitePanelProps) {
  const [suite, setSuite] = useState<AgentSuiteStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSuite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kolHandle]);

  const loadSuite = async () => {
    try {
      const res = await fetch(`/api/agent-suite?kolHandle=${kolHandle}`);
      if (res.ok) {
        const data = await res.json();
        setSuite(data.suite);
      } else if (res.status === 404) {
        // Suite 不存在，可以创建
        setSuite(null);
      }
    } catch (error) {
      console.error("Failed to load suite:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSuite = async () => {
    setActionLoading("create");
    try {
      const res = await fetch("/api/agent-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kolHandle,
          modules: {
            avatar: { enabled: true },
            mod: { enabled: true },
            trader: { enabled: true },
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuite(data.suite);
      }
    } catch (error) {
      console.error("Failed to create suite:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSuite = async (action: "start" | "stop") => {
    if (!suite) return;
    
    setActionLoading(action);
    try {
      const res = await fetch("/api/agent-suite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suiteId: suite.suiteId,
          action,
        }),
      });

      if (res.ok) {
        await loadSuite();
      }
    } catch (error) {
      console.error(`Failed to ${action} suite:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-900/50 backdrop-blur border border-cyan-500/20 rounded-lg">
        <div className="animate-pulse text-cyan-400">加载中...</div>
      </div>
    );
  }

  if (!suite) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-slate-900/50 backdrop-blur border border-cyan-500/20 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <Bot className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Agent Suite 未激活</h3>
        </div>
        <p className="text-slate-400 mb-6">
          为 <span className="text-cyan-400 font-semibold">{kolName}</span> 创建完整的数字生命智能体套件
        </p>
        <button
          onClick={createSuite}
          disabled={actionLoading === "create"}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50"
        >
          {actionLoading === "create" ? "创建中..." : "🚀 激活 Agent Suite"}
        </button>
      </motion.div>
    );
  }

  const isActive = suite.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 头部控制栏 */}
      <div className="p-6 bg-slate-900/50 backdrop-blur border border-cyan-500/20 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Agent Suite</h3>
              <p className="text-sm text-slate-400">@{suite.kolHandle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isActive 
                ? "bg-green-500/20 text-green-400" 
                : "bg-slate-700/50 text-slate-400"
            }`}>
              {isActive ? "🟢 运行中" : "⚪ 已停止"}
            </div>
            <AgentSuiteConfig
              suiteId={suite.suiteId}
              kolHandle={suite.kolHandle}
              initialConfig={{
                avatar: suite.modules.avatar.enabled ? {
                  enabled: true,
                  autoPost: true,
                  autoInteract: true,
                  postFrequency: "daily",
                  memoryEnabled: true,
                } : undefined,
                mod: suite.modules.mod.enabled ? {
                  enabled: true,
                  platforms: ["discord", "telegram"],
                  autoReply: true,
                  onboardingEnabled: true,
                  meetingNotesEnabled: false,
                  moderationEnabled: true,
                } : undefined,
                trader: suite.modules.trader.enabled ? {
                  enabled: true,
                  autoTrading: false,
                  followMode: true,
                  profitShare: 10,
                  riskLevel: "medium",
                  maxPositionSize: 10,
                } : undefined,
              }}
              onSave={async (config) => {
                const res = await fetch("/api/agent-suite/config", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ suiteId: suite.suiteId, config }),
                });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  throw new Error(data.error || data.message || "保存配置失败");
                }
                await loadSuite();
              }}
            />
            <button
              onClick={() => toggleSuite(isActive ? "stop" : "start")}
              disabled={!!actionLoading}
              className={`px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                isActive
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
              }`}
            >
              {actionLoading ? (
                "处理中..."
              ) : isActive ? (
                <>
                  <Square className="w-4 h-4 inline mr-2" />
                  停止
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 inline mr-2" />
                  启动
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 三个核心模块 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar 模块 */}
        <ModuleCard
          title="数字分身 (Avatar)"
          icon={Twitter}
          enabled={suite.modules.avatar.enabled}
          status={suite.modules.avatar.status}
          stats={suite.stats.avatar}
          description="24/7 自动发推、互动、维持热度"
        />

        {/* Mod 模块 */}
        <ModuleCard
          title="粉丝客服 (Mod)"
          icon={MessageSquare}
          enabled={suite.modules.mod.enabled}
          status={suite.modules.mod.status}
          stats={suite.stats.mod}
          description="Discord/Telegram 机器人，自动回复、引导"
        />

        {/* Trader 模块 */}
        <ModuleCard
          title="带单交易 (Trader)"
          icon={TrendingUp}
          enabled={suite.modules.trader.enabled}
          status={suite.modules.trader.status}
          stats={suite.stats.trader}
          description="链上交易、跟单、自动分红"
        />
      </div>
    </motion.div>
  );
}

interface ModuleCardProps {
  title: string;
  icon: React.ElementType;
  enabled: boolean;
  status: "running" | "stopped" | "error";
  stats?: AvatarStats | ModStats | TraderStats;
  description: string;
}

function ModuleCard({ title, icon: Icon, enabled, status, stats, description }: ModuleCardProps) {
  const isRunning = status === "running";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-6 bg-slate-900/50 backdrop-blur border border-cyan-500/20 rounded-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isRunning ? "bg-cyan-500/20" : "bg-slate-700/50"
          }`}>
            <Icon className={`w-5 h-5 ${
              isRunning ? "text-cyan-400" : "text-slate-400"
            }`} />
          </div>
          <h4 className="font-semibold text-white">{title}</h4>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-semibold ${
          isRunning
            ? "bg-green-500/20 text-green-400"
            : enabled
            ? "bg-yellow-500/20 text-yellow-400"
            : "bg-slate-700/50 text-slate-400"
        }`}>
          {isRunning ? "运行中" : enabled ? "已启用" : "未启用"}
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-4">{description}</p>

      {stats && (
        <div className="space-y-2 pt-4 border-t border-slate-700/50">
          {isAvatarStats(stats) && (
            <>
              <StatRow icon={Activity} label="推文数" value={stats.totalTweets} />
              <StatRow icon={Users} label="互动数" value={stats.totalInteractions} />
              <StatRow icon={Users} label="粉丝" value={stats.followers} />
              <StatRow icon={TrendingUp} label="互动率" value={`${stats.engagementRate.toFixed(1)}%`} />
            </>
          )}
          {isModStats(stats) && (
            <>
              <StatRow icon={MessageSquare} label="消息数" value={stats.totalMessages} />
              <StatRow icon={Users} label="用户数" value={stats.totalUsers} />
              <StatRow icon={Activity} label="响应率" value={`${stats.responseRate.toFixed(1)}%`} />
              <StatRow icon={Activity} label="平均响应" value={`${stats.averageResponseTime.toFixed(1)}s`} />
            </>
          )}
          {isTraderStats(stats) && (
            <>
              <StatRow icon={TrendingUp} label="交易数" value={stats.totalTrades} />
              <StatRow icon={DollarSign} label="总交易量" value={`${stats.totalVolume.toFixed(2)} SOL`} />
              <StatRow icon={DollarSign} label="总利润" value={`${stats.totalProfit.toFixed(2)} SOL`} />
              <StatRow icon={TrendingUp} label="胜率" value={`${stats.winRate.toFixed(1)}%`} />
              <StatRow icon={Users} label="跟单人数" value={stats.followers} />
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

function StatRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-cyan-400">{value}</span>
    </div>
  );
}

function isAvatarStats(stats: any): stats is AvatarStats {
  return "totalTweets" in stats && "engagementRate" in stats;
}

function isModStats(stats: any): stats is ModStats {
  return "totalMessages" in stats && "responseRate" in stats;
}

function isTraderStats(stats: any): stats is TraderStats {
  return "totalTrades" in stats && "winRate" in stats;
}
