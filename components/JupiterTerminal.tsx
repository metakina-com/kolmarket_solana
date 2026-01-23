"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getRpcEndpoint } from "@/lib/utils/solana-rpc";

export function JupiterTerminal() {
    const { publicKey, connected, signAllTransactions, signTransaction } = useWallet();
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://terminal.jup.ag/main-v3.js";
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            if (window.Jupiter) {
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
            }
        };
    }, []);

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
        <div className="w-full h-[600px] cyber-glass rounded-2xl overflow-hidden border border-cyan-500/20">
            <div id="integrated-terminal" className="w-full h-full" />
        </div>
    );
}

declare global {
    interface Window {
        Jupiter: any;
    }
}
