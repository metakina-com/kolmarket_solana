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
        <section id="whitepaper" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-6">
                        <Coins className="w-6 h-6 text-cyan-500" />
                        <span className="text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                            $KMT Token
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        KOLMarket Token Whitepaper
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
                        The native utility token powering the KOLMarket ecosystem.
                        Stake, govern, and earn with the future of KOL-driven crypto commerce.
                    </p>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        <strong className="text-cyan-500">$KMT: Redefining the Order of Web3 Influence</strong>
                        <br />
                        More than just a token—it is the fuel for Web3 growth.
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
                            className="p-6 bg-card border border-border rounded-xl hover:border-cyan-500/50 transition-all"
                        >
                            <item.icon className="w-8 h-8 text-cyan-500 mb-3" />
                            <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                            <p className="text-2xl font-bold text-foreground">{item.value}</p>
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
                        <PieChart className="w-8 h-8 text-purple-500" />
                        <h3 className="text-3xl font-bold text-foreground">Tokenomics</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Chart Visualization */}
                        <div className="relative p-8 bg-card border border-border rounded-xl">
                            <div className="flex flex-col gap-4">
                                {tokenomics.map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-foreground">{item.label}</span>
                                            <span className="text-foreground font-semibold">{item.percentage}%</span>
                                        </div>
                                        <div className="h-4 bg-muted rounded-full overflow-hidden">
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
                        <div className="p-8 bg-card border border-border rounded-xl">
                            <h4 className="text-xl font-bold text-foreground mb-4">Token Distribution</h4>
                            <ul className="space-y-4 text-foreground">
                                <li className="flex items-start gap-3">
                                    <Gift className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-foreground">40% Community:</strong> Airdrops, staking rewards, ecosystem incentives, and community grants.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-foreground">15% Team:</strong> 24-month vesting with 6-month cliff to ensure long-term alignment.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Rocket className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-foreground">20% Development:</strong> Platform development, AI infrastructure, and security audits.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Globe className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-foreground">15% Marketing:</strong> KOL partnerships, community growth, and global expansion.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <TrendingUp className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span><strong className="text-foreground">10% Liquidity:</strong> DEX liquidity pools and market making activities.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Core Theme Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h3 className="text-3xl font-bold text-foreground text-center mb-8">Core Theme: Web3 Influence Monetization</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="p-6 bg-card border border-border rounded-xl">
                            <h4 className="text-xl font-bold text-cyan-500 mb-3">1. Empowering KOLs</h4>
                            <p className="text-foreground mb-2">Break free from centralized platform fees and monetize your influence directly.</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Direct blockchain monetization</li>
                                <li>• AI-driven digital twins (Avatar)</li>
                                <li>• 24/7 automated operations</li>
                                <li>• Trading fee revenue sharing</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-card border border-border rounded-xl">
                            <h4 className="text-xl font-bold text-purple-500 mb-3">2. Accelerating Brands</h4>
                            <p className="text-foreground mb-2">Use $KMT to precision-target top-tier crypto leaders globally.</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Precision KOL targeting</li>
                                <li>• Mindshare data analytics</li>
                                <li>• Automated collaboration</li>
                                <li>• Transparent partnership data</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-card border border-border rounded-xl">
                            <h4 className="text-xl font-bold text-green-500 mb-3">3. Earn Together</h4>
                            <p className="text-foreground mb-2">Benefit from a community-driven ecosystem with buy-back mechanisms.</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Buy-back mechanisms</li>
                                <li>• Active contributor rewards</li>
                                <li>• Governance voting rights</li>
                                <li>• Liquidity mining rewards</li>
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
                    <h3 className="text-3xl font-bold text-foreground text-center mb-8">Token Utility</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 bg-card border border-border rounded-xl hover:border-purple-500/50 transition-all group"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-cyan-500" />
                                </div>
                                <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
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
                    <h3 className="text-3xl font-bold text-foreground text-center mb-8">Roadmap</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {roadmap.map((phase, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative p-6 bg-card border border-border rounded-xl"
                            >
                                <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs font-semibold text-white">
                                    {phase.phase}
                                </div>
                                <h4 className="text-lg font-semibold text-foreground mt-2 mb-4">{phase.title}</h4>
                                <ul className="space-y-2">
                                    {phase.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
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
                    <p className="mt-4 text-sm text-muted-foreground">
                        * This is not financial advice. Please do your own research before investing.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
