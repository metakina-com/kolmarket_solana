"use client";

import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { motion } from "framer-motion";
import { Bot, Brain, MessageSquare, Database, Zap } from "lucide-react";

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Agents Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500/10 rounded-full border border-cyan-500/30 mb-6">
              <Brain className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-semibold text-cyan-400">The Digital Cortex</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Neural Interface
            </h1>
            <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
              Direct neural link to KOL digital twins. Chat with AI agents powered by ElizaOS.
            </p>
          </div>

          {/* 功能说明卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-card/50 border border-border rounded-xl"
            >
              <Bot className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-foreground mb-2">选择 KOL</h3>
              <p className="text-sm text-muted-foreground">
                从下拉菜单选择要对话的 KOL，体验他们的数字分身。
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-card/50 border border-border rounded-xl"
            >
              <Database className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-foreground mb-2">RAG 增强</h3>
              <p className="text-sm text-muted-foreground">
                开启 RAG 模式，AI 会从知识库检索相关信息，提供更准确的回答。
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-card/50 border border-border rounded-xl"
            >
              <Zap className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="font-semibold text-foreground mb-2">实时对话</h3>
              <p className="text-sm text-muted-foreground">
                与 AI 进行自然对话，支持多轮对话和上下文理解。
              </p>
            </motion.div>
          </div>

          {/* 聊天界面 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <ChatInterface />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
