"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Database, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { KOLSelector } from "./KOLSelector";
import { getKOLPersona } from "@/lib/agents/kol-personas";

interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface ChatInterfaceProps {
  initialKOLHandle?: string | null;
}

export function ChatInterface({ initialKOLHandle = null }: ChatInterfaceProps) {
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useRAG, setUseRAG] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialKOLHandle) {
      setSelectedKOL(initialKOLHandle);
    }
  }, [initialKOLHandle]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
          content:
            "Hey anon! I'm a general purpose AI assistant. Select a KOL to talk to their digital twin, or just chat with me! How can I help you build a better future? 🌿",
        },
      ]);
    }
  }, [selectedKOL]);

  const sendRequest = async (prompt: string, appendUserMessage: boolean) => {
    if (!prompt.trim() || loading) return;

    if (appendUserMessage) {
      setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    }
    setInput("");
    setLoading(true);
    setLastFailedPrompt(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          kolHandle: selectedKOL,
          useRAG: useRAG && !!selectedKOL,
        }),
      });

      if (!response.ok) {
        let errorData: { error?: string } = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to get response`);
      }

      let data: { response?: string; message?: string };
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response format from server");
      }

      const responseContent =
        data.response || data.message || "🚀 Got your message! In demo mode - try again?";
      setMessages((prev) => [...prev, { role: "assistant", content: responseContent }]);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV === "development"
          ? `🔧 Dev: ${error instanceof Error ? error.message : "Unknown error"}. Check console.`
          : "🤖 Oops! Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage, isError: true },
      ]);
      setLastFailedPrompt(prompt);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendRequest(input.trim(), true);
  };

  const handleRetry = () => {
    if (!lastFailedPrompt || loading) return;
    setMessages((prev) => prev.filter((m) => !m.isError));
    sendRequest(lastFailedPrompt, false);
  };

  return (
    <div className="rounded-2xl p-6 border border-border bg-card/90 backdrop-blur-sm max-w-2xl mx-auto shadow-xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[60px] pointer-events-none" />

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
            <span className="text-sm text-muted-foreground">Enhanced Knowledge Base (RAG)</span>
            {useRAG && (
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 font-mono animate-pulse">
                ACTIVE
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setUseRAG(!useRAG)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
              useRAG ? "bg-cyan-500" : "bg-muted"
            }`}
            aria-label={useRAG ? "Disable RAG" : "Enable RAG"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useRAG ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="space-y-4 mb-6 h-[400px] overflow-y-auto p-2 pr-1"
      >
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
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-500/10 border border-cyan-500/20 text-foreground"
                  : msg.isError
                    ? "bg-red-500/5 border border-red-500/20 text-foreground"
                    : "bg-muted/50 border border-border text-foreground"
              }`}
            >
              {msg.content}
              {msg.isError && lastFailedPrompt && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-medium transition-colors"
                  aria-label="Retry last message"
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-cyan-400" />
            </div>
            <div className="bg-muted/50 border border-border rounded-2xl p-4">
              <div className="flex gap-1.5">
                <span
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3 p-1 bg-muted/30 rounded-2xl border border-border focus-within:border-cyan-500/50 transition-colors">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Transmit signal..."
          className="flex-1 px-4 py-3 min-h-[44px] bg-transparent text-foreground placeholder-muted-foreground focus:outline-none rounded-xl"
          aria-label="Chat message"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-5 py-3 min-h-[44px] bg-cyan-500 text-slate-950 font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-cyan-400 active:scale-95 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
