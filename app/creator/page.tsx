"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    UserCircle,
    Settings,
    Users,
    Share2,
    Twitter,
    MessageCircle,
    BarChart2,
    Lock,
    TrendingUp,
    RefreshCcw,
    Check,
    Camera,
    Image as ImageIcon,
    X,
    LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { FileUpload, UploadedFile } from "@/components/FileUpload";
import { MobileDrawer } from "@/components/ui/MobileDrawer";

export default function CreatorPage() {
    const [kolHandle] = useState("ansem");
    const [aggression, setAggression] = useState(85);
    const [humor, setHumor] = useState(42);
    const [followers, setFollowers] = useState(12500);
    const [revenue, setRevenue] = useState(42902.50);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [contentImages, setContentImages] = useState<UploadedFile[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // 加载设置
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch(`/api/creator/settings?kolHandle=${kolHandle}`);
                const data = await res.json();
                if (!data.error) {
                    setAggression(data.aggression || 85);
                    setHumor(data.humor || 42);
                    setFollowers(data.followers || 12500);
                    setRevenue(data.revenue || 42902.50);
                    if (data.avatarUrl) {
                        setAvatarUrl(data.avatarUrl);
                    }
                }
            } catch (e) {
                console.error("Failed to load settings:", e);
            }
        };
        loadSettings();
    }, [kolHandle]);

    // 保存设置
    const saveSettings = async (newAggression: number, newHumor: number, newAvatarUrl?: string) => {
        setIsSaving(true);
        try {
            await fetch("/api/creator/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    kolHandle,
                    aggression: newAggression,
                    humor: newHumor,
                    avatarUrl: newAvatarUrl || avatarUrl
                })
            });
            setLastSaved(new Date());
        } catch (e) {
            console.error("Failed to save settings:", e);
        } finally {
            setTimeout(() => setIsSaving(false), 800);
        }
    };

    // 处理头像上传
    const handleAvatarUpload = (file: UploadedFile) => {
        setAvatarUrl(file.fileUrl);
        saveSettings(aggression, humor, file.fileUrl);
    };

    // 处理内容图片上传
    const handleContentImageUpload = (file: UploadedFile) => {
        setContentImages(prev => [...prev, file]);
    };

    return (
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
            <div className="scanline" />

            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 pb-24 lg:pb-12 text-shadow-neon">

                {/* Left: Agent & Tuning — desktop only; mobile → drawer */}
                <aside className="hidden lg:block lg:col-span-3 order-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="cyber-glass rounded-2xl p-6 border border-cyan-500/20"
                    >
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-1 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                    <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                                        {avatarUrl ? (
                                            <Image
                                                src={avatarUrl}
                                                alt="Avatar"
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <UserCircle className="w-16 h-16 text-muted-foreground/50" />
                                        )}
                                    </div>
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-full cursor-pointer hover:bg-cyan-400 transition-all shadow-lg group-hover:scale-110">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            formData.append('folder', 'avatars');
                                            
                                            try {
                                                const res = await fetch('/api/storage/upload', {
                                                    method: 'POST',
                                                    body: formData,
                                                });
                                                const result = await res.json();
                                                if (result.success) {
                                                    handleAvatarUpload(result.file);
                                                }
                                            } catch (error) {
                                                console.error('Upload failed:', error);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <h3 className="text-xl font-bold">@{kolHandle} Clone</h3>
                            <p className="text-xs text-cyan-400 font-mono animate-pulse">Agent Status: ACTIVE</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Twitter size={16} className="text-cyan-400" />
                                    Twitter Link
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <MessageCircle size={16} className="text-indigo-400" />
                                    Discord Mod
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="cyber-glass p-6 rounded-2xl border border-border"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Neural Tuning</h4>
                            {isSaving ? (
                                <RefreshCcw size={14} className="animate-spin text-cyan-400" />
                            ) : lastSaved ? (
                                <Check size={14} className="text-green-400" />
                            ) : null}
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-xs mb-3">
                                    <span className="text-muted-foreground uppercase font-bold tracking-tighter">Aggression</span>
                                    <span className="text-cyan-400 font-mono">{aggression}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={aggression}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setAggression(val);
                                        saveSettings(val, humor);
                                    }}
                                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-3">
                                    <span className="text-muted-foreground uppercase font-bold tracking-tighter">Humor</span>
                                    <span className="text-purple-400 font-mono">{humor}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={humor}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setHumor(val);
                                        saveSettings(aggression, val);
                                    }}
                                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>
                        </div>

                        <p className="mt-6 text-[10px] text-muted-foreground italic leading-tight">
                            Neural parameters are synced with ElizaOS Core in real-time. Changes affect agent response tone.
                        </p>
                    </motion.div>
                </aside>

                {/* Center: Revenue & Performance — priority on mobile */}
                <section className="col-span-12 lg:col-span-6 order-2 space-y-6">
                    <div className="flex lg:hidden mb-2">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-border bg-card/50 hover:bg-card/80 text-sm font-medium"
                            aria-label="Open agent and logs"
                        >
                            <LayoutDashboard size={18} />
                            Agent & Logs
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="cyber-glass rounded-2xl p-6 border border-border"
                        >
                            <div className="text-muted-foreground text-xs font-mono mb-1 uppercase tracking-wider">Total Revenue Share</div>
                            <div className="text-4xl font-black text-foreground tracking-tighter">${revenue.toLocaleString()}</div>
                            <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                                <TrendingUp size={16} />
                                +12.4% this week
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="cyber-glass rounded-2xl p-6 border border-border"
                        >
                            <div className="text-muted-foreground text-xs font-mono mb-1 uppercase tracking-wider">Active Followers</div>
                            <div className="text-4xl font-black text-foreground tracking-tighter">{(followers / 1000).toFixed(1)}K</div>
                            <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm">
                                <Users size={16} />
                                Network expansion mode
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="cyber-glass rounded-2xl p-8 border border-border"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-purple-400" />
                                Influence Metrics
                            </h3>
                            <button type="button" className="min-h-[44px] px-3 py-2 text-xs bg-card/50 border border-border rounded-lg hover:bg-card/80 transition-all font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50">
                                LAST 30 DAYS
                            </button>
                        </div>

                        <div className="h-64 flex items-end justify-between gap-1 px-4">
                            {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85, 40, 75].map((h, i) => (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className="w-full bg-gradient-to-t from-cyan-500/20 via-cyan-500/50 to-cyan-500 rounded-t-sm transition-all duration-500 group-hover:from-cyan-400 group-hover:to-cyan-300"
                                        style={{ height: `${h}%` }}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-border z-20">
                                        {h}k
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 px-4 text-[10px] text-muted-foreground font-mono">
                            <span>JAN</span>
                            <span>MAR</span>
                            <span>MAY</span>
                            <span>JUL</span>
                            <span>SEP</span>
                            <span>NOV</span>
                        </div>
                    </motion.div>

                    <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between group overflow-hidden relative">
                        <div className="absolute inset-0 bg-cyan-500/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex gap-4 items-center relative z-10">
                            <div className="p-3 bg-cyan-500/10 rounded-xl">
                                <Lock className="text-cyan-400" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold">Neural Filter Protocol</h4>
                                <p className="text-xs text-muted-foreground">Enable high-sensitivity moderation for wallet interactions</p>
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-all relative z-10 border border-border active:scale-95">
                            Configure
                        </button>
                    </div>

                    {/* Content images upload */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="cyber-glass rounded-2xl p-6 border border-white/10"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <ImageIcon className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-bold">Content Images</h3>
                        </div>
                        <FileUpload
                            folder="creator-content"
                            allowedTypes={['image/*']}
                            maxSize={10 * 1024 * 1024} // 10MB
                            multiple={true}
                            onUploadComplete={handleContentImageUpload}
                            className="mb-4"
                        />
                        {contentImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {contentImages.map((image) => (
                                    <div key={image.filePath} className="relative group w-full h-24">
                                        <Image
                                            src={image.fileUrl}
                                            alt={image.fileName}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover rounded-lg border border-white/10"
                                        />
                                        <button
                                            onClick={() => setContentImages(prev => prev.filter(img => img.filePath !== image.filePath))}
                                            className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </section>

                {/* Right: Live Feed & Actions — desktop only; mobile → drawer */}
                <aside className="hidden lg:block lg:col-span-3 order-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="cyber-glass rounded-2xl p-6 border border-white/5 h-full"
                    >
                        <h3 className="font-bold mb-6 flex items-center gap-2">
                            <RefreshCcw className="w-5 h-5 text-yellow-400" />
                            Live Ledger Logs
                        </h3>
                        <div className="space-y-6">
                            {[
                                { time: "14:20", msg: "Replied to @elonmusk regarding SOL scaling." },
                                { time: "14:15", msg: "Analyzed $KMT mindshare index for new alert." },
                                { time: "13:58", msg: "Executed sentiment swap: +0.5 SOL." },
                                { time: "13:42", msg: "Synced knowledge base with new whitepaper." },
                            ].map((log, i) => (
                                <div key={i} className="relative pl-6 border-l border-border py-1">
                                    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                    <div className="text-[10px] text-muted-foreground mb-1 font-mono uppercase tracking-tighter">{log.time}</div>
                                    <p className="text-xs text-foreground leading-tight">{log.msg}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 space-y-4">
                            <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95">
                                <Share2 size={18} />
                                BroadCast Alpha
                            </button>
                            <button className="w-full py-4 bg-muted rounded-xl font-bold text-muted-foreground flex items-center justify-center gap-2 text-sm uppercase tracking-widest hover:bg-muted/80 transition-all border border-border">
                                <Settings size={18} />
                                Agent Settings
                            </button>
                        </div>
                    </motion.div>
                </aside>

            </div>

            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Agent & Logs">
                <div className="space-y-6">
                    <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 flex items-center justify-center overflow-hidden bg-slate-900">
                                {avatarUrl ? (
                                    <Image src={avatarUrl} alt="Avatar" width={56} height={56} className="rounded-full object-cover" />
                                ) : (
                                    <UserCircle className="w-10 h-10 text-slate-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold">@{kolHandle} Clone</h3>
                                <p className="text-[10px] text-cyan-400 font-mono">ACTIVE</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Aggression</span>
                                    <span className="text-cyan-400 font-mono">{aggression}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={aggression} onChange={(e) => { const v = parseInt(e.target.value); setAggression(v); saveSettings(v, humor); }} className="w-full h-1.5 bg-muted rounded-lg accent-cyan-500" />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">Humor</span>
                                    <span className="text-purple-400 font-mono">{humor}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={humor} onChange={(e) => { const v = parseInt(e.target.value); setHumor(v); saveSettings(aggression, v); }} className="w-full h-1.5 bg-muted rounded-lg accent-purple-500" />
                            </div>
                        </div>
                    </div>
                    <div className="cyber-glass rounded-2xl p-6 border border-white/5">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <RefreshCcw className="w-5 h-5 text-yellow-400" />
                            Live Ledger
                        </h3>
                        <div className="space-y-3">
                            {[{ time: "14:20", msg: "Replied to @elonmusk re SOL scaling." }, { time: "14:15", msg: "Analyzed $KMT mindshare." }, { time: "13:58", msg: "Sentiment swap: +0.5 SOL." }].map((log, i) => (
                                <div key={i} className="relative pl-4 border-l border-border py-1">
                                    <div className="absolute -left-[5px] top-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                    <div className="text-[10px] text-muted-foreground font-mono">{log.time}</div>
                                    <p className="text-xs text-foreground">{log.msg}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 space-y-2">
                            <button type="button" className="w-full min-h-[44px] py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                                <Share2 size={16} />
                                BroadCast Alpha
                            </button>
                            <button type="button" className="w-full min-h-[44px] py-3 bg-muted rounded-xl font-bold text-muted-foreground text-sm flex items-center justify-center gap-2 border border-border">
                                <Settings size={16} />
                                Agent Settings
                            </button>
                        </div>
                    </div>
                </div>
            </MobileDrawer>
        </main>
    );
}
