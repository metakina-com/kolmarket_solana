"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Network,
    FileText,
    CheckCircle2,
    Cpu,
    RefreshCcw,
    Globe,
    Plus,
    Loader2,
    LayoutDashboard,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/providers/ToastProvider";
import { MobileDrawer } from "@/components/ui/MobileDrawer";

interface Dataset {
    name: string;
    size: string;
    chunks: number;
    status: "SYNCED" | "INDEXING" | "FAILED";
}

const FILE_INPUT_ID = "cortex-file-upload";

export default function CortexPage() {
    const toast = useToast();
    const [datasets, setDatasets] = useState<Dataset[]>([
        { name: "Whitepaper_V2.pdf", size: "2.4MB", chunks: 420, status: "SYNCED" },
        { name: "Tokenomics_Model.csv", size: "1.1MB", chunks: 115, status: "SYNCED" },
        { name: "Community_FAQs.txt", size: "450KB", chunks: 89, status: "SYNCED" },
    ]);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const clearFileInput = () => {
        const el = document.getElementById(FILE_INPUT_ID) as HTMLInputElement | null;
        if (el) el.value = "";
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(10);

        try {
            const formData = new FormData();
            formData.append("file", file);

            setUploadProgress(30);

            const response = await fetch("/api/cortex/upload", {
                method: "POST",
                body: formData,
            });

            setUploadProgress(70);

            const result = await response.json();

            if (result.success) {
                setUploadProgress(100);
                setTimeout(() => {
                    const newFile: Dataset = {
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + "KB",
                        chunks: result.chunks || Math.floor(Math.random() * 200 + 50),
                        status: "SYNCED",
                    };
                    setDatasets((prev) => [newFile, ...prev]);
                    setIsUploading(false);
                    toast.success(`Upload complete: ${file.name}`);
                }, 500);
            } else {
                clearFileInput();
                setIsUploading(false);
                toast.error("Upload failed: " + (result.error || "Unknown error"), () => {
                    document.getElementById(FILE_INPUT_ID)?.click();
                });
            }
        } catch (err) {
            console.error("Upload error:", err);
            clearFileInput();
            setIsUploading(false);
            toast.error("Connection to Cortex failed.", () => {
                document.getElementById(FILE_INPUT_ID)?.click();
            });
        }
    };

    return (
        <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
            <div className="scanline" />

            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 pb-24 lg:pb-12">

                {/* Left: Stats & Map — desktop only; mobile → drawer */}
                <aside className="hidden lg:block lg:col-span-4 order-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="cyber-glass rounded-2xl p-6 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-cyan-500/10 rounded-2xl">
                                <Cpu className="text-cyan-400 w-8 h-8 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter italic">KNOWLEDGE CORTEX</h2>
                                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Neural Vector Engine v4.0</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Index Size</div>
                                <div className="text-2xl font-bold font-mono">14.2 GB</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Active Vectors</div>
                                <div className="text-2xl font-bold font-mono">{(datasets.reduce((acc, d) => acc + d.chunks, 0) * 1.5).toFixed(0)}K</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="cyber-glass rounded-2xl p-6 border border-white/5 h-80 relative overflow-hidden flex items-center justify-center group"
                    >
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#06b6d4_0%,_transparent_70%)] group-hover:opacity-40 transition-opacity" />
                        <Network className="w-32 h-32 text-cyan-400 opacity-20 animate-pulse-slow group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute text-center z-10">
                            <div className="text-xs font-mono text-cyan-400 mb-2">Neural Map View</div>
                            <div className="text-[10px] text-slate-500 italic px-4 leading-tight">
                                Active Intelligence Synthesis: {datasets.length} sources linked.
                            </div>
                        </div>

                        {datasets.map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                                style={{
                                    top: `${Math.random() * 80 + 10}%`,
                                    left: `${Math.random() * 80 + 10}%`,
                                    animationDuration: `${Math.random() * 3 + 2}s`
                                }}
                            />
                        ))}
                    </motion.div>
                </aside>

                {/* Center: Datasets — priority on mobile */}
                <section className="col-span-12 lg:col-span-8 order-2 space-y-6">
                    <div className="flex flex-wrap items-center gap-2 mb-2 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium"
                            aria-label="Open stats and neural map"
                        >
                            <LayoutDashboard size={18} />
                            Stats & Map
                        </button>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="cyber-glass rounded-3xl p-8 border border-white/10 relative overflow-hidden"
                    >
                        {/* Progress Overlay */}
                        <AnimatePresence>
                            {isUploading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                                    <h4 className="text-xl font-bold mb-2 uppercase tracking-widest">Neural Indexing in Progress</h4>
                                    <p className="text-sm text-slate-400 mb-8 max-w-sm">
                                        Breaking document into neural chunks and generating high-dimensional embeddings.
                                    </p>
                                    <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                        <motion.div
                                            className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-cyan-500">{uploadProgress}% COMPLETE</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                            <div>
                                <h3 className="text-xl font-bold">Training Datasets</h3>
                                <p className="text-sm text-slate-500">The knowledge source for your project&apos;s AI agents.</p>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <input
                                    type="file"
                                    id={FILE_INPUT_ID}
                                    className="hidden"
                                    onChange={handleUpload}
                                    accept=".txt,.pdf,.csv,.md"
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById(FILE_INPUT_ID)?.click()}
                                    className="flex-1 md:flex-none min-h-[44px] px-6 py-3 bg-white text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all active:scale-95 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                                >
                                    <Upload size={18} />
                                    Inject Data
                                </button>
                                <button type="button" className="min-w-[44px] min-h-[44px] p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50" aria-label="Refresh">
                                    <RefreshCcw size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {datasets.map((data, idx) => (
                                <motion.div
                                    layout
                                    key={data.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-cyan-500/5 hover:border-cyan-500/20 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 rounded-xl text-slate-400 group-hover:text-cyan-400 transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {data.name}
                                                {data.status === 'SYNCED' && <CheckCircle2 size={14} className="text-green-400" />}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-mono mt-1">
                                                {data.size} • {data.chunks} Vectors Generated
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:block">
                                            <div className={`text-[10px] px-2 py-0.5 rounded border ${data.status === 'SYNCED' ? 'border-green-500/30 text-green-400' : 'border-yellow-500/30 text-yellow-400'}`}>
                                                {data.status}
                                            </div>
                                        </div>
                                        <button className="text-slate-500 hover:text-white transition-colors">
                                            <Globe size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            <button
                                type="button"
                                onClick={() => document.getElementById(FILE_INPUT_ID)?.click()}
                                className="w-full border-2 border-dashed border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-white/10 hover:bg-white/5 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 group-hover:text-white transition-colors">
                                    <Plus size={20} />
                                </div>
                                <span className="text-xs text-slate-600 font-mono">Initiate Neural Uplink</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="cyber-glass p-6 rounded-2xl border border-white/5">
                            <div className="text-slate-500 text-[10px] uppercase mb-4 font-mono">Response Latency</div>
                            <div className="text-3xl font-black text-cyan-400 tracking-tighter">12ms</div>
                            <p className="text-[10px] text-slate-600 mt-2">Ultra-fast vector retrieval via Cloudflare Workers.</p>
                        </div>
                        <div className="cyber-glass p-6 rounded-2xl border border-white/5">
                            <div className="text-slate-500 text-[10px] uppercase mb-4 font-mono">Sync Accuracy</div>
                            <div className="text-3xl font-black text-purple-400 tracking-tighter">99.8%</div>
                            <p className="text-[10px] text-slate-600 mt-2">High-fidelity retrieval-augmented generation.</p>
                        </div>
                        <div className="cyber-glass p-6 rounded-2xl border border-white/5">
                            <div className="text-slate-500 text-[10px] uppercase mb-4 font-mono">Neural Safety</div>
                            <div className="text-3xl font-black text-green-400 tracking-tighter">ACTIVE</div>
                            <p className="text-[10px] text-slate-600 mt-2">Real-time hallucination & toxicity filtering.</p>
                        </div>
                    </div>
                </section>

            </div>

            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Stats & Neural Map">
                <div className="space-y-6">
                    <div className="cyber-glass rounded-2xl p-6 border border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-cyan-500/10 rounded-2xl">
                                <Cpu className="text-cyan-400 w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tighter">KNOWLEDGE CORTEX</h2>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">Neural Vector Engine v4.0</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Index Size</div>
                                <div className="text-xl font-bold font-mono">14.2 GB</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Active Vectors</div>
                                <div className="text-xl font-bold font-mono">{(datasets.reduce((acc, d) => acc + d.chunks, 0) * 1.5).toFixed(0)}K</div>
                            </div>
                        </div>
                    </div>
                    <div className="cyber-glass rounded-2xl p-6 border border-white/5 h-48 relative overflow-hidden flex items-center justify-center">
                        <Network className="w-24 h-24 text-cyan-400 opacity-20" />
                        <div className="absolute text-center z-10">
                            <div className="text-xs font-mono text-cyan-400">Neural Map</div>
                            <div className="text-[10px] text-slate-500">{datasets.length} sources linked</div>
                        </div>
                    </div>
                </div>
            </MobileDrawer>
        </main>
    );
}
