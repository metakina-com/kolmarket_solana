"use client";

import { useState, useEffect } from "react";
import { Send, Bot, User, Sparkles, Database } from "lucide-react";
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
            ? `Hey! I'm ${persona.name} (@${persona.handle}). ${persona.personality}. What's on your mind? 🚀`
            : `Hey anon! I'm a digital clone of @${selectedKOL}. What's on your mind? 🚀`,
        },
      ]);
    } else {
      setMessages([
        {
          role: "assistant",
          content: "Hey anon! I'm a digital clone of a top crypto KOL. Select a KOL above or just chat! What's on your mind? 🚀",
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
          useRAG: useRAG && selectedKOL, // 只有选择了 KOL 才能使用 RAG
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: Message = { role: "assistant", content: data.response || "Sorry, I couldn't generate a response." };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-xl p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Chat with Digital Life
      </h2>
      
      {/* KOL Selector */}
      <div className="mb-6">
        <KOLSelector selectedKOL={selectedKOL} onSelectKOL={setSelectedKOL} />
      </div>

      {/* RAG 功能开关 */}
      {selectedKOL && (
        <div className="mb-4 flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-cyan-400" />
            <span className="text-sm text-slate-300">知识库增强 (RAG)</span>
            {useRAG && (
              <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                已启用
              </span>
            )}
          </div>
          <button
            onClick={() => setUseRAG(!useRAG)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useRAG ? "bg-cyan-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useRAG ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-cyan-500/20 border border-cyan-500/30"
                  : "bg-slate-800/50 border border-slate-700/50"
              }`}
            >
              <p className="text-sm text-white">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about crypto, trading, or anything..."
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
