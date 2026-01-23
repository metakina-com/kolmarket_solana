"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    TrendingUp,
    Zap,
    Activity,
    Target,
    ArrowUpRight,
    ShieldCheck,
    Cpu,
    Wallet,
    ExternalLink,
    LayoutDashboard,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { JupiterTerminal } from "@/components/JupiterTerminal";
import { MobileDrawer } from "@/components/ui/MobileDrawer";
import { getExplorerAddressUrl } from "@/lib/utils/solana-explorer";
import { TipButton } from "@/components/TipButton";
import { useSOLPrice } from "@/lib/hooks/useJupiterPrice";
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
    const solPriceData = useSOLPrice(30000);
    const solPrice: number = (solPriceData.price ?? 142.25) as number;
    const [mode, setMode] = useState<"chat" | "trade">("chat");
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (!publicKey) {
            setBalance(null);
            return;
        }
        connection.getBalance(publicKey).then((bal) => {
            setBalance(bal / LAMPORTS_PER_SOL);
        });
    }, [publicKey, connection]);

    const shortAddress = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "";
    return (
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Background scanline effect and grid */}
            <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
            <div className="scanline" />

            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 pb-24 lg:pb-12">

                {/* Left Sidebar: desktop only; mobile → drawer */}
                <aside className="hidden lg:block lg:col-span-3 order-1 space-y-6">
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
                                <p className="text-xs text-muted-foreground">Real-time Mindshare Signals</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {liveAlpha.map((item, i) => (
                                <div key={i} className="p-3 bg-card/50 rounded-xl border border-border hover:border-cyan-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-cyan-400">@{item.kol}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">{item.time}</span>
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
                        className="cyber-glass rounded-2xl p-6 border border-border"
                    >
                        <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4">Market Health</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Global Sentiment</span>
                                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[78%]" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Solana Volatility</span>
                                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[45%]" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </aside>

                {/* Center: Main — priority on mobile */}
                <section className="col-span-12 lg:col-span-6 order-2 lg:order-2 space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex gap-2 p-1 bg-card/50 rounded-xl border border-border w-fit">
                            <button
                                type="button"
                                onClick={() => setMode("chat")}
                                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${mode === "chat" ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]" : "text-muted-foreground hover:text-foreground"}`}
                                aria-pressed={mode === "chat"}
                            >
                                INTELLIGENCE [AI]
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("trade")}
                                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${mode === "trade" ? "bg-purple-500 text-white shadow-[0_0_10px_#a855f7]" : "text-muted-foreground hover:text-foreground"}`}
                                aria-pressed={mode === "trade"}
                            >
                                EXECUTION [SWAP]
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="lg:hidden flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-border bg-card/50 hover:bg-card/80 text-sm font-medium"
                            aria-label="Open Alpha & Wallet panels"
                        >
                            <LayoutDashboard size={18} />
                            Panels
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {mode === 'chat' ? (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="cyber-glass rounded-2xl p-8 border border-border relative overflow-hidden h-[650px] flex flex-col"
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
                        <div className="p-4 rounded-2xl bg-card/50 border border-border flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                <Zap size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">1.2s</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Neural Latency</div>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-card/50 border border-border flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Activity size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">94.2%</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Sync Accuracy</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Sidebar: desktop only; mobile → drawer */}
                <aside className="hidden lg:block lg:col-span-3 order-3 space-y-6">
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
                            <div className="p-4 bg-card/80 rounded-xl border border-border relative overflow-hidden group">
                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Active Wallet</div>
                                <div className="text-sm font-mono text-cyan-400 flex items-center justify-between">
                                    {connected ? (
                                        <a
                                            href={publicKey ? getExplorerAddressUrl(publicKey.toBase58()) : "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                            aria-label="View wallet on explorer"
                                        >
                                            {shortAddress}
                                            <ExternalLink size={12} />
                                        </a>
                                    ) : (
                                        "OFFLINE"
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-card/80 rounded-xl border border-border relative overflow-hidden group">
                                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">SOL Balance</div>
                                <div className="text-3xl font-black text-foreground">
                                    {balance !== null ? balance.toFixed(4) : "0.00"} <span className="text-sm font-normal text-muted-foreground">SOL</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">≈ ${balance !== null && solPrice !== null ? (balance * solPrice).toFixed(2) : "0.00"} <span className="text-[8px] opacity-50">USD</span></div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button type="button" className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all text-xs uppercase tracking-[0.2em] active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                Sync Nexus Assets
                            </button>
                            <button type="button" className="w-full py-4 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all text-xs uppercase tracking-[0.2em] active:scale-95">
                                Export Keys
                            </button>
                            <TipButton
                                label="KOLMarket Terminal"
                                message="Support the ecosystem"
                                className="w-full justify-center"
                            />
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
                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                            All neural signatures are multi-sig verified and broadcast via the Solana L1 Nexus.
                        </p>
                    </motion.div>
                </aside>

            </div>

            <MobileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Alpha & Wallet"
            >
                <div className="space-y-6">
                    <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/20">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-400" />
                            Alpha Radar
                        </h3>
                        <div className="space-y-3">
                            {liveAlpha.map((item, i) => (
                                <div key={i} className="p-3 bg-card/50 rounded-xl border border-border">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold text-cyan-400">@{item.kol}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">{item.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs px-2 py-0.5 rounded ${item.action === "BUY" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>{item.action}</span>
                                        <span className="font-mono text-sm">{item.token}</span>
                                        <span className="text-xs text-green-400">{item.confidence}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mt-4 mb-3">Market Health</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Global Sentiment</span>
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[78%]" /></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Solana Volatility</span>
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[45%]" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/20">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-cyan-400" />
                            Nexus Core
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-card/80 rounded-xl border border-border">
                                <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">Active Wallet</div>
                                {connected && publicKey ? (
                                    <a
                                        href={getExplorerAddressUrl(publicKey.toBase58())}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-mono text-cyan-400 hover:text-foreground transition-colors inline-flex items-center gap-1"
                                        aria-label="View wallet on explorer"
                                    >
                                        {shortAddress}
                                        <ExternalLink size={12} />
                                    </a>
                                ) : (
                                    <span className="text-sm font-mono text-cyan-400">OFFLINE</span>
                                )}
                            </div>
                            <div className="p-3 bg-card/80 rounded-xl border border-border">
                                <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">SOL Balance</div>
                                <div className="text-2xl font-black text-foreground">{balance !== null ? balance.toFixed(4) : "0.00"} <span className="text-sm font-normal text-muted-foreground">SOL</span></div>
                                <div className="text-xs text-muted-foreground">≈ ${balance !== null && solPrice !== null ? (balance * solPrice).toFixed(2) : "0.00"} USD</div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <button type="button" className="w-full min-h-[44px] py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400 transition-all text-xs uppercase tracking-wider">
                                Sync Nexus Assets
                            </button>
                            <button type="button" className="w-full min-h-[44px] py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all text-xs uppercase tracking-wider">
                                Export Keys
                            </button>
                            <TipButton
                                label="KOLMarket Terminal"
                                message="Support the ecosystem"
                                className="w-full justify-center"
                                size="sm"
                            />
                        </div>
                    </div>
                </div>
            </MobileDrawer>
        </main>
    );
}
