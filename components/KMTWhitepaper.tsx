"use client";

import { motion } from "framer-motion";
import {
    Coins,
    Users,
    TrendingUp,
    Shield,
    Zap,
    Globe,
    PieChart,
    Rocket,
    Lock,
    Gift
} from "lucide-react";

const tokenomics = [
    { label: "Community & Ecosystem", percentage: 40, color: "from-cyan-500 to-blue-500" },
    { label: "Team & Advisors", percentage: 15, color: "from-purple-500 to-pink-500" },
    { label: "Development Fund", percentage: 20, color: "from-green-500 to-emerald-500" },
    { label: "Marketing & Partnerships", percentage: 15, color: "from-orange-500 to-yellow-500" },
    { label: "Liquidity Pool", percentage: 10, color: "from-red-500 to-rose-500" },
];

const features = [
    {
        icon: Users,
        title: "KOL Governance",
        description: "KMT holders can vote on platform decisions, KOL rankings, and feature development.",
    },
    {
        icon: TrendingUp,
        title: "Revenue Sharing",
        description: "Stake KMT to earn a share of platform trading fees and KOL performance rewards.",
    },
    {
        icon: Shield,
        title: "Premium Access",
        description: "Unlock exclusive KOL insights, early alpha calls, and private community channels.",
    },
    {
        icon: Zap,
        title: "Trading Signals",
        description: "Access AI-powered trading signals based on top KOL sentiment analysis.",
    },
];

const roadmap = [
    { phase: "Q1 2026", title: "Token Launch", items: ["Fair Launch on Solana", "DEX Listings", "Initial Staking Pools"] },
    { phase: "Q2 2026", title: "Platform Integration", items: ["KOL Subscription System", "Governance Voting", "Revenue Sharing"] },
    { phase: "Q3 2026", title: "Ecosystem Expansion", items: ["Cross-chain Bridge", "CEX Listings", "Mobile App Launch"] },
    { phase: "Q4 2026", title: "Global Scale", items: ["100+ KOL Partners", "1M+ Token Holders", "DAO Transition"] },
];

export function KMTWhitepaper() {
    return (
        <section id="whitepaper" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-6">
                        <Coins className="w-6 h-6 text-cyan-400" />
                        <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            $KMT Token
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        KOLMarket Token
                    </h2>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                        The native utility token powering the KOLMarket ecosystem.
                        Stake, govern, and earn with the future of KOL-driven crypto commerce.
                    </p>
                </motion.div>

                {/* Token Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: "Total Supply", value: "1,000,000,000", icon: Globe },
                        { label: "Network", value: "Solana SPL", icon: Zap },
                        { label: "Initial Price", value: "$0.001", icon: TrendingUp },
                        { label: "Vesting", value: "24 Months", icon: Lock },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all"
                        >
                            <item.icon className="w-8 h-8 text-cyan-400 mb-3" />
                            <p className="text-sm text-slate-400 mb-1">{item.label}</p>
                            <p className="text-2xl font-bold text-white">{item.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tokenomics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 justify-center mb-8">
                        <PieChart className="w-8 h-8 text-purple-400" />
                        <h3 className="text-3xl font-bold text-white">Tokenomics</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Chart Visualization */}
                        <div className="relative p-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
                            <div className="flex flex-col gap-4">
                                {tokenomics.map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-300">{item.label}</span>
                                            <span className="text-white font-semibold">{item.percentage}%</span>
                                        </div>
                                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.percentage}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: idx * 0.1 }}
                                                className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
                            <h4 className="text-xl font-bold text-white mb-4">Token Distribution</h4>
                            <ul className="space-y-4 text-slate-300">
                                <li className="flex items-start gap-3">
                                    <Gift className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-white">40% Community:</strong> Airdrops, staking rewards, ecosystem incentives, and community grants.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-white">15% Team:</strong> 24-month vesting with 6-month cliff to ensure long-term alignment.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Rocket className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-white">20% Development:</strong> Platform development, AI infrastructure, and security audits.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Globe className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-white">15% Marketing:</strong> KOL partnerships, community growth, and global expansion.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <TrendingUp className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-white">10% Liquidity:</strong> DEX liquidity pools and market making activities.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Utility Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h3 className="text-3xl font-bold text-white text-center mb-8">Token Utility</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl hover:border-purple-500/50 transition-all group"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                                <p className="text-sm text-slate-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Roadmap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-3xl font-bold text-white text-center mb-8">Roadmap</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {roadmap.map((phase, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl"
                            >
                                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs font-semibold text-white">
                                    {phase.phase}
                                </div>
                                <h4 className="text-lg font-semibold text-white mt-2 mb-4">{phase.title}</h4>
                                <ul className="space-y-2">
                                    {phase.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <a
                        href="#"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-white hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    >
                        <Rocket className="w-5 h-5" />
                        Join the Presale
                    </a>
                    <p className="mt-4 text-sm text-slate-500">
                        * This is not financial advice. Please do your own research before investing.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
