"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getRpcEndpoint } from "@/lib/utils/solana-rpc";

export function JupiterTerminal() {
    const { publicKey, connected, signAllTransactions, signTransaction } = useWallet();
    const terminalRef = useRef<HTMLDivElement>(null);
    const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [reloadNonce, setReloadNonce] = useState(0);

    const initTerminal = useCallback(() => {
        if (!window.Jupiter) return;
        if (window.__KOLMARKET_JUPITER_INITIALIZED) {
            setLoadState("ready");
            return;
        }

        try {
            window.Jupiter.init({
                displayMode: "integrated",
                integratedTargetId: "integrated-terminal",
                endpoint: getRpcEndpoint(),
                strictTokenList: false,
                formProps: {
                    fixedOutputMint: true,
                    initialOutputMint: "So11111111111111111111111111111111111111112",
                },
            });
            window.__KOLMARKET_JUPITER_INITIALIZED = true;
            setLoadState("ready");
        } catch {
            setLoadState("error");
        }
    }, []);

    useEffect(() => {
        setLoadState("loading");

        if (window.Jupiter) {
            initTerminal();
            return;
        }

        const existing = document.querySelector<HTMLScriptElement>("script[data-jupiter-terminal='main-v3']");
        if (existing) {
            const t = window.setTimeout(() => {
                if (window.Jupiter) initTerminal();
                else setLoadState("error");
            }, 6000);
            return () => window.clearTimeout(t);
        }

        const script = document.createElement("script");
        script.src = "https://terminal.jup.ag/main-v3.js";
        script.async = true;
        script.dataset.jupiterTerminal = "main-v3";
        script.onload = () => initTerminal();
        script.onerror = () => setLoadState("error");
        document.head.appendChild(script);

        const t = window.setTimeout(() => {
            if (window.Jupiter) initTerminal();
            else setLoadState("error");
        }, 12000);

        return () => window.clearTimeout(t);
    }, [initTerminal, reloadNonce]);

    useEffect(() => {
        // Sync wallet with Jupiter
        if (connected && publicKey && window.Jupiter) {
            window.Jupiter.syncProps({
                passthroughWalletContextState: {
                    publicKey,
                    connected,
                    signAllTransactions,
                    signTransaction,
                }
            });
        }
    }, [connected, publicKey, signAllTransactions, signTransaction]);

    return (
        <div className="w-full h-full min-h-[520px] cyber-glass rounded-2xl overflow-hidden border border-cyan-500/20 relative" ref={terminalRef}>
            {loadState !== "ready" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
                    {loadState === "loading" ? (
                        <div className="text-sm text-muted-foreground font-mono tracking-widest uppercase">Loading Jupiter...</div>
                    ) : (
                        <>
                            <div className="text-sm text-red-400 font-mono tracking-widest uppercase">Jupiter failed to load</div>
                            <button
                                type="button"
                                onClick={() => {
                                    window.__KOLMARKET_JUPITER_INITIALIZED = false;
                                    setReloadNonce((n) => n + 1);
                                }}
                                className="min-h-[44px] px-4 py-2 rounded-xl border border-border bg-card/50 hover:bg-card/80 text-sm font-medium"
                            >
                                Retry
                            </button>
                        </>
                    )}
                </div>
            )}
            <div id="integrated-terminal" className="w-full h-full" />
        </div>
    );
}

declare global {
    interface Window {
        Jupiter: any;
        __KOLMARKET_JUPITER_INITIALIZED?: boolean;
    }
}
