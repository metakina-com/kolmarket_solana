"use client";

import { motion } from "framer-motion";
import {
    UserCircle,
    TrendingUp,
    ShieldCheck,
    Users,
    ArrowRight,
    Cpu,
    Zap,
    Bot,
    Globe
} from "lucide-react";

const roles = [
    {
        id: "kol",
        title: "I am a KOL",
        subtitle: "Infect Your Spirit",
        description: "Launch your digital twin. Automate your Twitter, Discord, and Telegram while you sleep. Monitize your influence.",
        icon: UserCircle,
        color: "from-cyan-500 to-blue-600",
        neon: "neon-border-cyan",
        features: ["24/7 Digital Proxy", "Automated Content", "AI Trading Agent"]
    },
    {
        id: "trader",
        title: "I am a Trader",
        subtitle: "Capture Alpha",
        description: "Copy-trade top KOLs' AI agents. Get real-time sentiment analysis and execute 1-click swaps on Solana.",
        icon: TrendingUp,
        color: "from-purple-500 to-pink-600",
        neon: "neon-border-purple",
        features: ["Smart Following", "Flash Swaps", "Alpha Insights"]
    },
    {
        id: "project",
        title: "I am a Project",
        subtitle: "Empower Community",
        description: "Deploy knowledge-based AI mods. Deeply train agents on your whitepaper to handle complex technical queries.",
        icon: ShieldCheck,
        color: "from-green-500 to-emerald-600",
        neon: "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
        features: ["Whitepaper RAG", "Discord/TG Support", "24/7 Onboarding"]
    },
    {
        id: "dao",
        title: "I am a DAO",
        subtitle: "Auto Governance",
        description: "Execute treasury actions automatically via AI. Summarize meetings and analysis proposals for governance.",
        icon: Users,
        color: "from-orange-500 to-yellow-600",
        neon: "border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
        features: ["Treasury Agent", "Proposal Analysis", "Auto-Summaries"]
    }
];

export function RolePortals() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
                        Choose Your Gateway
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        KOLMarket.ai adapts to your role in the decentralized ecosystem.
                        Select a portal to enter the Cyber-Nexus.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {roles.map((role, idx) => (
                        <motion.div
                            key={role.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={`group relative p-6 rounded-2xl cyber-glass border ${role.neon} transition-all duration-300 hover:shadow-2xl`}
                        >
                            {/* Icon & Title */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <role.icon className="w-8 h-8 text-white" />
                            </div>

                            <div className="mb-4">
                                <span className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1 block">
                                    {role.subtitle}
                                </span>
                                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                    {role.title}
                                </h3>
                            </div>

                            <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                                {role.description}
                            </p>

                            {/* Features List */}
                            <ul className="space-y-3 mb-8">
                                {role.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                        <Zap className="w-3 h-3 text-cyan-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <a
                                href={`/${role.id === 'project' ? 'cortex' : (role.id === 'dao' ? 'gov' : role.id)}`}
                                className={`w-full py-3 rounded-lg bg-gradient-to-r ${role.color} text-white font-semibold flex items-center justify-center gap-2 group/btn hover:brightness-110 transition-all cursor-pointer`}
                            >
                                Enter Portal
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </a>

                            {/* Animated Corner Ornaments */}
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Cpu className="w-4 h-4 text-white/20 animate-spin-slow" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Large Blurred background glows */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[120px] pointer-events-none" />
        </section>
    );
}
