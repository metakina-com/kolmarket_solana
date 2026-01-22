"use client";

import { useState, useEffect } from "react";
import { Send, Bot, User, Database } from "lucide-react";
import { motion } from "framer-motion";
import { KOLSelector } from "./KOLSelector";
import { getKOLPersona } from "@/lib/agents/kol-personas";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useRAG, setUseRAG] = useState(false); // RAG 功能开关

  // Update initial message when KOL changes
  useEffect(() => {
    if (selectedKOL) {
      const persona = getKOLPersona(selectedKOL);
      setMessages([
        {
          role: "assistant",
          content: persona
            ? `Hey! I'm ${persona.name} (@${persona.handle}). ${persona.personality}. How can I help you build a better future? 🌿`
            : `Hey anon! I'm a digital clone of @${selectedKOL}. How can I help you build a better future? 🌿`,
        },
      ]);
    } else {
      setMessages([
        {
          role: "assistant",
          content: "Hey anon! I'm a general purpose AI assistant. Select a KOL to talk to their digital twin, or just chat with me! How can I help you build a better future? 🌿",
        },
      ]);
    }
  }, [selectedKOL]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          kolHandle: selectedKOL,
          useRAG: useRAG && selectedKOL,
        }),
      });

      // 检查响应状态
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to get response`);
      }

      // 解析 JSON 响应
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response format from server");
      }

      // 确保响应消息存在
      const responseContent = data.response || data.message || "🚀 Got your message! In demo mode - try again?";
      const assistantMessage: Message = { role: "assistant", content: responseContent };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      // 在开发模式下显示更详细的错误信息
      const errorMessage = process.env.NODE_ENV === 'development'
        ? `🔧 Dev mode: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`
        : "🤖 Oops! Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-glass rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto shadow-2xl relative overflow-hidden group">
      {/* Decorative inner glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[60px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors" />

      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Digital Cortex Interface
      </h2>

      <div className="mb-6">
        <KOLSelector selectedKOL={selectedKOL} onSelectKOL={setSelectedKOL} />
      </div>

      {selectedKOL && (
        <div className="mb-4 flex items-center justify-between p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-cyan-400" />
            <span className="text-sm text-slate-300">Enhanced Knowledge Base (RAG)</span>
            {useRAG && (
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 font-mono animate-pulse">
                ACTIVE
              </span>
            )}
          </div>
          <button
            onClick={() => setUseRAG(!useRAG)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useRAG ? "bg-cyan-500" : "bg-slate-800"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useRAG ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>
      )}

      <div className="space-y-4 mb-6 h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === "user"
                ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-50"
                : "bg-slate-800/40 border border-white/5 text-slate-200"
                }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-slate-400" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Bot size={16} className="text-cyan-400" />
            </div>
            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 p-1 bg-slate-950/50 rounded-2xl border border-white/5 focus-within:border-cyan-500/50 transition-colors">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Transmit signal..."
          className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-600 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:bg-cyan-400 active:scale-95 flex items-center gap-2"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
