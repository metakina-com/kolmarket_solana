"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Vote,
    MessageSquare,
    ShieldAlert,
    FileCheck,
    PieChart,
    Layers,
    ChevronRight,
    TrendingDown,
    TrendingUp,
    Cpu,
    Inbox,
    CheckCircle2,
    AlertTriangle,
    Loader2
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface Proposal {
    id: string;
    title: string;
    description: string;
    status: "ACTIVE" | "CLOSED" | "VOTED";
    sentiment: "BULLISH" | "NEUTRAL" | "BEARISH";
    risk: "LOW" | "MEDIUM" | "HIGH";
    votesFor: number;
    votesAgainst: number;
}

export default function GovernancePage() {
    const [proposals, setProposals] = useState<Proposal[]>([
        {
            id: "#1024",
            title: "Expand Agent Liquidity Pool",
            description: "Proposed allocation of 50,000 $SOL to stimulate KOL agent liquidity for high-growth creators.",
            status: "ACTIVE",
            sentiment: "BULLISH",
            risk: "LOW",
            votesFor: 62.5,
            votesAgainst: 8.2
        },
        {
            id: "#1023",
            title: "Update Neural Filter Policy v2.1",
            description: "Implementation of stricter toxicity filters across all ElizaOS integrated agents.",
            status: "CLOSED",
            sentiment: "NEUTRAL",
            risk: "LOW",
            votesFor: 89.1,
            votesAgainst: 2.3
        },
        {
            id: "#1022",
            title: "Cross-chain Bridge Integration",
            description: "Adding support for bridging $KMT assets to Base network for retail accessibility.",
            status: "CLOSED",
            sentiment: "BEARISH",
            risk: "HIGH",
            votesFor: 12.5,
            votesAgainst: 74.2
        },
    ]);

    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [votingPower] = useState(12.5);

    const handleVote = (id: string) => {
        setIsVoting(true);
        // 模拟钱包签名和链上更新
        setTimeout(() => {
            setProposals(prev => prev.map(p =>
                p.id === id ? { ...p, status: "VOTED", votesFor: p.votesFor + votingPower } : p
            ));
            setIsVoting(false);
            setSelectedProposal(null);
        }, 2000);
    };

    return (
        <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
            <div className="scanline" />

            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 pb-12">

                {/* Left: Governance Power & Voting */}
                <aside className="col-span-12 lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="cyber-glass rounded-2xl p-6 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-orange-500/10 rounded-xl">
                                <Users className="text-orange-400 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black italic">DAO COMMONS</h2>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Collective Intelligence v1.2</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-xs text-slate-500 mb-2 font-mono uppercase">My Voting Power</div>
                                <div className="flex items-end gap-2 relative z-10">
                                    <span className="text-4xl font-black text-orange-400">{votingPower}%</span>
                                    <span className="text-[10px] text-slate-500 font-mono mb-2">940.2 KMT</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/50 rounded-xl flex flex-col items-center border border-white/5 group hover:border-orange-500/30 transition-all cursor-default">
                                    <Vote className="w-5 h-5 text-slate-500 mb-2 group-hover:text-orange-400" />
                                    <div className="text-lg font-bold">142</div>
                                    <div className="text-[10px] text-slate-600">Proposals Analyzed</div>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl flex flex-col items-center border border-white/5 group hover:border-orange-500/30 transition-all cursor-default">
                                    <PieChart className="w-5 h-5 text-slate-500 mb-2 group-hover:text-cyan-400" />
                                    <div className="text-lg font-bold">84%</div>
                                    <div className="text-[10px] text-slate-600">AI Participation</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="cyber-glass rounded-2xl p-6 border border-white/5"
                    >
                        <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">Treasury Distribution</h4>
                        <div className="space-y-6">
                            {[
                                { label: "AI Training", val: 42, color: "bg-cyan-500" },
                                { label: "Community Ops", val: 28, color: "bg-purple-500" },
                                { label: "Security Audit", val: 15, color: "bg-orange-500" }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                            {item.label}
                                        </span>
                                        <span className="font-mono">{item.val}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            className={`h-full ${item.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </aside>

                {/* Center: Active Proposals & AI Sentiment */}
                <section className="col-span-12 lg:col-span-8 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="cyber-glass rounded-3xl p-8 border border-white/10 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Layers className="w-48 h-48 text-orange-500" />
                        </div>

                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">GOVERNANCE <span className="text-orange-400">SIGNALS</span></h3>
                                <p className="text-sm text-slate-500">AI-assisted analysis of DAO consensus.</p>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-mono font-bold text-orange-400 hover:text-orange-300 transition-all group">
                                <Inbox size={14} />
                                SUBMIT NEW PROPOSAL
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {proposals.map((p, idx) => (
                                <motion.div
                                    layout
                                    key={p.id}
                                    onClick={() => setSelectedProposal(p)}
                                    className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-900/30 border rounded-2xl transition-all cursor-pointer ${selectedProposal?.id === p.id
                                            ? 'border-orange-500/50 bg-orange-500/5'
                                            : 'border-white/5 hover:border-orange-500/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                                        <div className="text-xs font-mono text-slate-500">{p.id}</div>
                                        <div>
                                            <div className="font-bold text-lg group-hover:text-orange-400 transition-colors flex items-center gap-2">
                                                {p.title}
                                                {p.status === 'VOTED' && <CheckCircle2 size={16} className="text-orange-500" />}
                                            </div>
                                            <div className="flex gap-4 mt-2">
                                                {/* Sentiment Indicator */}
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                    {p.sentiment === 'BULLISH' ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />}
                                                    {p.sentiment}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold border-l border-white/10 pl-4">
                                                    <ShieldAlert size={12} className={p.risk === 'HIGH' ? 'text-red-500' : 'text-green-500'} />
                                                    {p.risk} RISK
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className={`text-[10px] h-8 px-4 rounded-full flex items-center border font-mono tracking-tighter ${p.status === 'ACTIVE' ? 'border-orange-500 text-orange-400 font-black animate-pulse' :
                                                p.status === 'VOTED' ? 'border-green-500/50 text-green-400' :
                                                    'border-white/10 text-slate-600'
                                            }`}>
                                            {p.status}
                                        </div>
                                        <div className="p-2 bg-slate-800 rounded-full group-hover:bg-orange-500 transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Detailed Panel (Simple Modal simulation) */}
                        <AnimatePresence>
                            {selectedProposal && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-8 p-6 bg-slate-950/50 border border-orange-500/20 rounded-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4">
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedProposal(null); }}>
                                            <X className="text-slate-500 hover:text-white" size={20} />
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                                            <Cpu size={24} className="text-cyan-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-cyan-400 uppercase text-xs mb-1">AI Recommendation</h4>
                                            <p className="text-sm text-slate-300 italic">
                                                &quot;Based on DAO&apos;s recent performance metrics and liquidity depth, I recommend a <b>YES</b> vote. This proposal significantly bolsters our ecosystem&apos;s growth vector.&quot;
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <div className="flex justify-between text-xs font-mono mb-2">
                                                <span>Support</span>
                                                <span className="text-green-400">{selectedProposal.votesFor.toFixed(1)}M KMT</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: `${selectedProposal.votesFor}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-mono mb-2">
                                                <span>Opposition</span>
                                                <span className="text-red-400">{selectedProposal.votesAgainst.toFixed(1)}M KMT</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500" style={{ width: `${selectedProposal.votesAgainst}%` }} />
                                            </div>
                                        </div>
                                    </div>

                                    {selectedProposal.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleVote(selectedProposal.id)}
                                            disabled={isVoting}
                                            className="w-full py-4 bg-orange-500 text-slate-950 font-black rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {isVoting ? <Loader2 className="animate-spin" /> : <Vote size={18} />}
                                            {isVoting ? "Broadcasting to Ledger..." : "Cast Affirmative Vote"}
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <aside className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 flex gap-4 hover:border-cyan-500/30 transition-all">
                            <div className="p-3 bg-cyan-500/10 rounded-xl h-fit">
                                <Cpu className="text-cyan-400" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1 italic">VOTING AGENT READY</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    AI delegate is synced with your risk profile. Auto-voting active for low-risk proposals.
                                </p>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 flex gap-4 hover:border-purple-500/30 transition-all">
                            <div className="p-3 bg-purple-500/10 rounded-xl h-fit">
                                <AlertTriangle className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1 italic">SECURITY OVERRIDE</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Proposals with &apos;HIGH&apos; risk rating require manual biometric override from the core DAO council.
                                </p>
                            </div>
                        </div>
                    </aside>
                </section>

            </div>
        </main>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
