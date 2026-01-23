"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Send, Plus, Trash2, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getExplorerTxUrl } from "@/lib/utils/solana-explorer";

interface Recipient {
  address: string;
  amount: number;
  percentage?: number;
}

export function DistributionPanel() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: "", amount: 0 },
  ]);
  const [usePercentage, setUsePercentage] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [tokenMode, setTokenMode] = useState(false);
  const [mint, setMint] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    transactionHash: string;
    totalAmount: number;
    mode?: "sol" | "token";
  } | null>(null);

  const addRecipient = () => {
    setRecipients([...recipients, { address: "", amount: 0 }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string | number) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const handleDistribute = async () => {
    if (!connected || !publicKey || !signTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    const validRecipients = recipients.filter((r) => {
      try {
        new PublicKey(r.address);
        if (tokenMode) return r.amount > 0;
        return r.amount > 0 || (usePercentage && (r.percentage || 0) > 0);
      } catch {
        return false;
      }
    });

    if (validRecipients.length === 0) {
      alert("Please add at least one valid recipient");
      return;
    }
    if (tokenMode) {
      if (!mint.trim()) {
        alert("Enter token mint address for token distribution");
        return;
      }
      try {
        new PublicKey(mint);
      } catch {
        alert("Invalid token mint address");
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      const payload: Record<string, unknown> = {
        recipients: validRecipients.map((r) => ({
          address: r.address,
          amount: r.amount,
          ...(tokenMode ? {} : { percentage: r.percentage }),
        })),
        network: "devnet",
        payer: publicKey.toBase58(),
      };
      if (tokenMode) {
        payload.mint = mint.trim();
      } else {
        payload.totalAmount = totalAmount;
        payload.usePercentage = usePercentage;
      }

      const res = await fetch("/api/execution/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Prepare failed");

      const raw = Uint8Array.from(atob(data.serializedTransaction), (c) => c.charCodeAt(0));
      const tx = Transaction.from(raw);
      const signed = await signTransaction(tx);
      const txHash = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction(txHash, "confirmed");

      setResult({
        transactionHash: txHash,
        totalAmount: data.totalAmount ?? 0,
        mode: data.mode ?? "sol",
      });
    } catch (err) {
      console.error("Distribution error:", err);
      alert(err instanceof Error ? err.message : "Distribution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong rounded-xl p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Distribution Panel
      </h2>

      {!connected && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          ⚠️ Please connect your wallet to use distribution features
        </div>
      )}

      {/* Distribution Mode */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={tokenMode}
            onChange={(e) => {
              setTokenMode(e.target.checked);
              if (e.target.checked) setUsePercentage(false);
            }}
            className="rounded"
          />
          <span>SPL Token distribution</span>
        </label>
        {tokenMode && (
          <input
            type="text"
            placeholder="Token mint address"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
          />
        )}
        {!tokenMode && (
          <>
            <label className="flex items-center gap-2 text-slate-300 mt-2">
              <input
                type="checkbox"
                checked={usePercentage}
                onChange={(e) => setUsePercentage(e.target.checked)}
                className="rounded"
              />
              <span>Use percentage distribution</span>
            </label>
            {usePercentage && (
              <input
                type="number"
                placeholder="Total amount (SOL)"
                value={totalAmount || ""}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white mt-2"
              />
            )}
          </>
        )}
      </div>

      {/* Recipients List */}
      <div className="space-y-4 mb-6">
        {recipients.map((recipient, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-start"
          >
            <div className="flex-1 space-y-2">
              <input
                type="text"
                placeholder="Recipient address"
                value={recipient.address}
                onChange={(e) => updateRecipient(index, "address", e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
              />
              {tokenMode ? (
                <input
                  type="number"
                  placeholder="Amount (raw token units)"
                  value={recipient.amount || ""}
                  onChange={(e) =>
                    updateRecipient(index, "amount", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              ) : usePercentage ? (
                <input
                  type="number"
                  placeholder="Percentage (%)"
                  value={recipient.percentage || ""}
                  onChange={(e) =>
                    updateRecipient(index, "percentage", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              ) : (
                <input
                  type="number"
                  placeholder="Amount (SOL)"
                  value={recipient.amount || ""}
                  onChange={(e) =>
                    updateRecipient(index, "amount", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              )}
            </div>
            {recipients.length > 1 && (
              <button
                onClick={() => removeRecipient(index)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Recipient Button */}
      <button
        onClick={addRecipient}
        className="mb-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        <Plus size={16} />
        Add Recipient
      </button>

      {/* Execute Button */}
      <button
        onClick={handleDistribute}
        disabled={loading || !connected}
        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send size={20} />
            Execute Distribution
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
        >
          <h3 className="text-green-400 font-semibold mb-2">Distribution Successful!</h3>
          <p className="text-sm text-slate-300">
            Transaction: <span className="font-mono text-xs break-all">{result.transactionHash}</span>
          </p>
          <a
            href={getExplorerTxUrl(result.transactionHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            aria-label="View transaction on explorer"
          >
            <ExternalLink size={14} />
            View on Explorer
          </a>
          <p className="text-sm text-slate-300 mt-2">
            Total: {result.totalAmount} {result.mode === "token" ? "token units" : "SOL"}
          </p>
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs text-slate-400">
        ✅ Transactions are signed by your wallet. Connect and approve in Phantom/Solflare.
      </div>
    </div>
  );
}
