"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, X } from "lucide-react";
import type { AvatarConfig, ModConfig, TraderConfig } from "@/lib/agents/agent-suite";

interface AgentSuiteConfigProps {
  suiteId: string;
  kolHandle: string;
  initialConfig?: {
    avatar?: AvatarConfig;
    mod?: ModConfig;
    trader?: TraderConfig;
  };
  onSave?: (config: {
    avatar?: Partial<AvatarConfig>;
    mod?: Partial<ModConfig>;
    trader?: Partial<TraderConfig>;
  }) => Promise<void>;
}

export default function AgentSuiteConfig({
  suiteId,
  kolHandle,
  initialConfig,
  onSave,
}: AgentSuiteConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Avatar 配置
  const [avatarConfig, setAvatarConfig] = useState<Partial<AvatarConfig>>({
    enabled: initialConfig?.avatar?.enabled ?? true,
    autoPost: initialConfig?.avatar?.autoPost ?? true,
    autoInteract: initialConfig?.avatar?.autoInteract ?? true,
    postFrequency: initialConfig?.avatar?.postFrequency ?? "daily",
    memoryEnabled: initialConfig?.avatar?.memoryEnabled ?? true,
  });

  // Mod 配置
  const [modConfig, setModConfig] = useState<Partial<ModConfig>>({
    enabled: initialConfig?.mod?.enabled ?? true,
    platforms: initialConfig?.mod?.platforms ?? ["discord", "telegram"],
    autoReply: initialConfig?.mod?.autoReply ?? true,
    onboardingEnabled: initialConfig?.mod?.onboardingEnabled ?? true,
    meetingNotesEnabled: initialConfig?.mod?.meetingNotesEnabled ?? false,
    moderationEnabled: initialConfig?.mod?.moderationEnabled ?? true,
  });

  // Trader 配置
  const [traderConfig, setTraderConfig] = useState<Partial<TraderConfig>>({
    enabled: initialConfig?.trader?.enabled ?? true,
    autoTrading: initialConfig?.trader?.autoTrading ?? false,
    followMode: initialConfig?.trader?.followMode ?? true,
    profitShare: initialConfig?.trader?.profitShare ?? 10,
    riskLevel: initialConfig?.trader?.riskLevel ?? "medium",
    maxPositionSize: initialConfig?.trader?.maxPositionSize ?? 10,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onSave) {
        await onSave({
          avatar: avatarConfig,
          mod: modConfig,
          trader: traderConfig,
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Configure
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-cyan-500/20 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Agent Suite Configuration</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Avatar 配置 */}
          <ConfigSection title="数字分身 (Avatar)">
            <div className="space-y-4">
              <Checkbox
                label="启用模块"
                checked={avatarConfig.enabled ?? false}
                onChange={(checked) =>
                  setAvatarConfig({ ...avatarConfig, enabled: checked })
                }
              />
              <Checkbox
                label="自动发推"
                checked={avatarConfig.autoPost ?? false}
                onChange={(checked) =>
                  setAvatarConfig({ ...avatarConfig, autoPost: checked })
                }
                disabled={!avatarConfig.enabled}
              />
              <Checkbox
                label="自动互动"
                checked={avatarConfig.autoInteract ?? false}
                onChange={(checked) =>
                  setAvatarConfig({ ...avatarConfig, autoInteract: checked })
                }
                disabled={!avatarConfig.enabled}
              />
              <Checkbox
                label="记忆能力"
                checked={avatarConfig.memoryEnabled ?? false}
                onChange={(checked) =>
                  setAvatarConfig({ ...avatarConfig, memoryEnabled: checked })
                }
                disabled={!avatarConfig.enabled}
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  发推频率
                </label>
                <select
                  value={avatarConfig.postFrequency ?? "daily"}
                  onChange={(e) =>
                    setAvatarConfig({
                      ...avatarConfig,
                      postFrequency: e.target.value as "hourly" | "daily" | "custom",
                    })
                  }
                  disabled={!avatarConfig.enabled}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="hourly">每小时</option>
                  <option value="daily">每天</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
            </div>
          </ConfigSection>

          {/* Mod 配置 */}
          <ConfigSection title="粉丝客服 (Mod)">
            <div className="space-y-4">
              <Checkbox
                label="启用模块"
                checked={modConfig.enabled ?? false}
                onChange={(checked) =>
                  setModConfig({ ...modConfig, enabled: checked })
                }
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  平台
                </label>
                <div className="flex gap-4">
                  <Checkbox
                    label="Discord"
                    checked={modConfig.platforms?.includes("discord") ?? false}
                    onChange={(checked) => {
                      const platforms = modConfig.platforms ?? [];
                      setModConfig({
                        ...modConfig,
                        platforms: checked
                          ? [...platforms, "discord"]
                          : platforms.filter((p) => p !== "discord"),
                      });
                    }}
                    disabled={!modConfig.enabled}
                  />
                  <Checkbox
                    label="Telegram"
                    checked={modConfig.platforms?.includes("telegram") ?? false}
                    onChange={(checked) => {
                      const platforms = modConfig.platforms ?? [];
                      setModConfig({
                        ...modConfig,
                        platforms: checked
                          ? [...platforms, "telegram"]
                          : platforms.filter((p) => p !== "telegram"),
                      });
                    }}
                    disabled={!modConfig.enabled}
                  />
                </div>
              </div>
              <Checkbox
                label="自动回复"
                checked={modConfig.autoReply ?? false}
                onChange={(checked) =>
                  setModConfig({ ...modConfig, autoReply: checked })
                }
                disabled={!modConfig.enabled}
              />
              <Checkbox
                label="新人引导"
                checked={modConfig.onboardingEnabled ?? false}
                onChange={(checked) =>
                  setModConfig({ ...modConfig, onboardingEnabled: checked })
                }
                disabled={!modConfig.enabled}
              />
              <Checkbox
                label="会议纪要"
                checked={modConfig.meetingNotesEnabled ?? false}
                onChange={(checked) =>
                  setModConfig({ ...modConfig, meetingNotesEnabled: checked })
                }
                disabled={!modConfig.enabled}
              />
            </div>
          </ConfigSection>

          {/* Trader 配置 */}
          <ConfigSection title="带单交易 (Trader)">
            <div className="space-y-4">
              <Checkbox
                label="启用模块"
                checked={traderConfig.enabled ?? false}
                onChange={(checked) =>
                  setTraderConfig({ ...traderConfig, enabled: checked })
                }
              />
              <Checkbox
                label="自动交易"
                checked={traderConfig.autoTrading ?? false}
                onChange={(checked) =>
                  setTraderConfig({ ...traderConfig, autoTrading: checked })
                }
                disabled={!traderConfig.enabled}
              />
              <Checkbox
                label="跟单模式"
                checked={traderConfig.followMode ?? false}
                onChange={(checked) =>
                  setTraderConfig({ ...traderConfig, followMode: checked })
                }
                disabled={!traderConfig.enabled}
              />
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  利润分成 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={traderConfig.profitShare ?? 10}
                  onChange={(e) =>
                    setTraderConfig({
                      ...traderConfig,
                      profitShare: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={!traderConfig.enabled}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  风险等级
                </label>
                <select
                  value={traderConfig.riskLevel ?? "medium"}
                  onChange={(e) =>
                    setTraderConfig({
                      ...traderConfig,
                      riskLevel: e.target.value as "low" | "medium" | "high",
                    })
                  }
                  disabled={!traderConfig.enabled}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="low">低风险</option>
                  <option value="medium">中风险</option>
                  <option value="high">高风险</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  最大仓位 (SOL)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={traderConfig.maxPositionSize ?? 10}
                  onChange={(e) =>
                    setTraderConfig({
                      ...traderConfig,
                      maxPositionSize: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!traderConfig.enabled}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </ConfigSection>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
      />
      <span className={`text-sm ${disabled ? "text-slate-500" : "text-slate-300"}`}>
        {label}
      </span>
    </label>
  );
}
