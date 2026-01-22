"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    TrendingUp,
    Search,
    Zap,
    Activity,
    BarChart3,
    Target,
    ArrowUpRight,
    ShieldCheck,
    MessageSquare,
    Cpu,
    Wallet,
    ExternalLink
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { JupiterTerminal } from "@/components/JupiterTerminal";
import { AnimatePresence } from "framer-motion";

const liveAlpha = [
    { kol: "Ansem", action: "BUY", token: "$SOL", price: "$142.5", time: "2s ago", confidence: 98 },
    { kol: "Toly", action: "CALL", token: "$SOL", price: "$142.1", time: "1m ago", confidence: 85 },
    { kol: "Wendy", action: "HOLD", token: "$BTC", price: "$64.2K", time: "5m ago", confidence: 72 },
];

export default function TerminalPage() {
    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState<number | null>(null);
    const [solPrice, setSolPrice] = useState<number>(142.25);
    const [mode, setMode] = useState<'chat' | 'trade'>('chat');

    const fetchPrice = async () => {
        try {
            const response = await fetch("https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112");
            const data = await response.json();
            const price = data?.data?.["So11111111111111111111111111111111111111112"]?.price;
            if (price) setSolPrice(parseFloat(price));
        } catch (e) {
            console.error("Failed to fetch SOL price:", e);
        }
    };

    useEffect(() => {
        fetchPrice();
        const interval = setInterval(fetchPrice, 30000); // 30s 自动刷新
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then((bal) => {
                setBalance(bal / LAMPORTS_PER_SOL);
            });
        }
    }, [publicKey, connection]);

    const shortAddress = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "";
    return (
        <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
            {/* Background scanline effect and grid */}
            <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
            <div className="scanline" />

            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 pb-12">

                {/* Left Sidebar: Role Controls & Signals */}
                <aside className="col-span-12 lg:col-span-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="cyber-glass rounded-2xl p-6 border border-cyan-500/20"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Alpha Radar</h3>
                                <p className="text-xs text-slate-500">Real-time Mindshare Signals</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {liveAlpha.map((item, i) => (
                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-cyan-400">@{item.kol}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {item.action}
                                            </span>
                                            <span className="font-mono text-sm">{item.token}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-green-400">
                                            <ArrowUpRight size={14} />
                                            {item.confidence}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Market Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="cyber-glass rounded-2xl p-6 border border-white/5"
                    >
                        <h4 className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-4">Market Health</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400 whitespace-nowrap">Global Sentiment</span>
                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[78%]" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400 whitespace-nowrap">Solana Volatility</span>
                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[45%]" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </aside>

                {/* Center: Main Intelligence Console */}
                <section className="col-span-12 lg:col-span-6 space-y-6">
                    <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit">
                        <button
                            onClick={() => setMode('chat')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'chat' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]' : 'text-slate-400 hover:text-white'}`}
                        >
                            INTELLIGENCE [AI]
                        </button>
                        <button
                            onClick={() => setMode('trade')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'trade' ? 'bg-purple-500 text-white shadow-[0_0_10px_#a855f7]' : 'text-slate-400 hover:text-white'}`}
                        >
                            EXECUTION [SWAP]
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {mode === 'chat' ? (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="cyber-glass rounded-2xl p-8 border border-white/10 relative overflow-hidden h-[650px] flex flex-col"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Cpu className="w-16 h-16 text-cyan-500" />
                                </div>
                                <h2 className="text-2xl font-black mb-1 tracking-tighter">NEURAL <span className="text-cyan-400">INTERFACE</span></h2>
                                <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-mono">Real-time mindshare data uplink active</p>
                                <div className="flex-1 overflow-hidden">
                                    <ChatInterface />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="trade"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="h-[650px]"
                            >
                                <JupiterTerminal />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                <Zap size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">1.2s</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Neural Latency</div>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Activity size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">94.2%</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Sync Accuracy</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Sidebar: Execution & Performance */}
                <aside className="col-span-12 lg:col-span-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="cyber-glass rounded-2xl p-6 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    >
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-cyan-400" />
                            Nexus Core
                        </h3>

                        <div className="space-y-6">
                            <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Active Wallet</div>
                                <div className="text-sm font-mono text-cyan-400 flex items-center justify-between">
                                    {connected ? shortAddress : "OFFLINE"}
                                    {connected && <ExternalLink size={12} className="cursor-pointer hover:text-white" />}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-900/80 rounded-xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">SOL Balance</div>
                                <div className="text-3xl font-black text-white">
                                    {balance !== null ? balance.toFixed(4) : "0.00"} <span className="text-sm font-normal text-slate-500">SOL</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-2">≈ ${(balance ? balance * solPrice : 0).toFixed(2)} <span className="text-[8px] opacity-50">USD</span></div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all text-xs uppercase tracking-[0.2em] active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                Sync Nexus Assets
                            </button>
                            <button className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-xs uppercase tracking-[0.2em] active:scale-95">
                                Export Keys
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                    >
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <ShieldCheck size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Quantum Security</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            All neural signatures are multi-sig verified and broadcast via the Solana L1 Nexus.
                        </p>
                    </motion.div>
                </aside>

            </div>
        </main>
    );
}
