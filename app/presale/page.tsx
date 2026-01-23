"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { 
  Rocket, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Wallet,
  ExternalLink,
  Zap,
  Gift,
  Shield,
  BarChart3
} from "lucide-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getExplorerAddressUrl } from "@/lib/utils/solana-explorer";
import Link from "next/link";

interface PresaleStats {
  totalRaised: number;
  totalParticipants: number;
  tokensSold: number;
  timeRemaining: number;
}

export default function PresalePage() {
  const { publicKey, connected, connect, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [contribution, setContribution] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<PresaleStats>({
    totalRaised: 125000,
    totalParticipants: 1247,
    tokensSold: 125000000,
    timeRemaining: 45 * 24 * 60 * 60 * 1000, // 45 days
  });

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection]);

  const presalePrice = 0.001; // $0.001 per KMT
  const minContribution = 0.1; // 0.1 SOL minimum
  const maxContribution = 100; // 100 SOL maximum
  const totalSupply = 1000000000; // 1B KMT
  const presaleAllocation = 150000000; // 150M KMT (15%)
  const tokensRemaining = presaleAllocation - stats.tokensSold;

  const handleContribute = async () => {
    if (!connected || !publicKey) {
      alert("请先连接钱包");
      return;
    }

    const solAmount = parseFloat(contribution);
    if (isNaN(solAmount) || solAmount < minContribution || solAmount > maxContribution) {
      alert(`贡献金额必须在 ${minContribution} - ${maxContribution} SOL 之间`);
      return;
    }

    if (balance !== null && solAmount > balance) {
      alert("余额不足");
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: 实现实际的预售购买逻辑
      // 这里应该调用智能合约或 API
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟交易
      
      alert(`成功贡献 ${solAmount} SOL！您将获得 ${(solAmount / presalePrice).toLocaleString()} $KMT`);
      setContribution("");
      
      // 更新统计
      setStats(prev => ({
        ...prev,
        totalRaised: prev.totalRaised + solAmount * 142, // 假设 SOL = $142
        totalParticipants: prev.totalParticipants + 1,
        tokensSold: prev.tokensSold + (solAmount / presalePrice),
      }));
    } catch (error) {
      console.error("Contribution error:", error);
      alert("贡献失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  const progress = (stats.tokensSold / presaleAllocation) * 100;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-500/10 via-background to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-6">
              <Rocket className="w-6 h-6 text-cyan-500" />
              <span className="text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                Token Presale
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              Join the $KMT Presale
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              成为 KOLMarket.ai 生态的早期支持者。以优惠价格获得 $KMT Token，参与平台治理和收益分成。
            </p>
            
            {/* Countdown */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl mb-8">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-mono text-foreground">
                剩余时间: <span className="text-orange-500 font-bold">{formatTime(stats.timeRemaining)}</span>
              </span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <span className="text-sm text-muted-foreground">已筹集</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                ${stats.totalRaised.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">约 {stats.totalRaised / 142} SOL</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-cyan-500" />
                <span className="text-sm text-muted-foreground">参与人数</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalParticipants.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">持续增长</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-6 h-6 text-purple-500" />
                <span className="text-sm text-muted-foreground">已售出</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {(stats.tokensSold / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-muted-foreground mt-1">共 150M 额度</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-orange-500" />
                <span className="text-sm text-muted-foreground">预售价格</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                ${presalePrice}
              </div>
              <div className="text-xs text-muted-foreground mt-1">每 $KMT</div>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-foreground">预售进度</span>
              <span className="text-sm font-mono text-muted-foreground">
                {progress.toFixed(1)}% ({stats.tokensSold.toLocaleString()} / {presaleAllocation.toLocaleString()})
              </span>
            </div>
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contribution Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Contribution Card */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-card border border-border rounded-2xl"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">参与预售</h2>

                {/* Wallet Connection */}
                {!connected ? (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-6">请连接钱包以参与预售</p>
                    <button
                      onClick={() => connect?.()}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                    >
                      连接钱包
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Wallet Info */}
                    <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">钱包地址</span>
                        <a
                          href={publicKey ? getExplorerAddressUrl(publicKey.toBase58()) : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cyan-500 hover:text-cyan-400 flex items-center gap-1"
                        >
                          {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">SOL 余额</span>
                        <span className="text-sm font-mono text-foreground">
                          {balance !== null ? balance.toFixed(4) : "0.0000"} SOL
                        </span>
                      </div>
                    </div>

                    {/* Contribution Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        贡献金额 (SOL)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={contribution}
                          onChange={(e) => setContribution(e.target.value)}
                          placeholder={`${minContribution} - ${maxContribution} SOL`}
                          min={minContribution}
                          max={maxContribution}
                          step="0.1"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <button
                          onClick={() => setContribution(balance ? Math.min(balance, maxContribution).toString() : "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-lg text-foreground"
                        >
                          MAX
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        最小: {minContribution} SOL | 最大: {maxContribution} SOL
                      </div>
                    </div>

                    {/* Token Calculation */}
                    {contribution && !isNaN(parseFloat(contribution)) && (
                      <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">您将获得</span>
                          <span className="text-lg font-bold text-cyan-500">
                            {((parseFloat(contribution) || 0) / presalePrice).toLocaleString()} $KMT
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          价格: ${presalePrice} / $KMT
                        </div>
                      </div>
                    )}

                    {/* Contribute Button */}
                    <button
                      onClick={handleContribute}
                      disabled={isProcessing || !contribution || parseFloat(contribution) < minContribution}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5" />
                          立即参与预售
                        </>
                      )}
                    </button>

                    {/* Disclaimer */}
                    <p className="mt-6 text-xs text-muted-foreground text-center">
                      * 预售代币将在代币正式上线后解锁。请仔细阅读风险提示。
                    </p>
                  </>
                )}
              </motion.div>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* Presale Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-card border border-border rounded-xl"
              >
                <h3 className="text-lg font-bold text-foreground mb-4">预售详情</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">预售价格</span>
                    <span className="font-semibold text-foreground">${presalePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总供应量</span>
                    <span className="font-semibold text-foreground">1B $KMT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">预售额度</span>
                    <span className="font-semibold text-foreground">150M $KMT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最小贡献</span>
                    <span className="font-semibold text-foreground">{minContribution} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最大贡献</span>
                    <span className="font-semibold text-foreground">{maxContribution} SOL</span>
                  </div>
                </div>
              </motion.div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-card border border-border rounded-xl"
              >
                <h3 className="text-lg font-bold text-foreground mb-4">预售优势</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">优惠价格：${presalePrice} / $KMT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">早期解锁：代币上线后立即解锁</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">治理投票权</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">收益分成资格</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">平台功能优先访问</span>
                  </li>
                </ul>
              </motion.div>

              {/* Risk Warning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-foreground">风险提示</h3>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• 加密货币投资存在高风险</li>
                  <li>• 代币价格可能波动</li>
                  <li>• 请仅投资您能承受损失的资金</li>
                  <li>• 请仔细阅读白皮书和条款</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Token 分配</h2>
            <p className="text-muted-foreground">了解 $KMT Token 的完整分配方案</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: "社区 & 生态", percentage: 40, color: "from-cyan-500 to-blue-500", amount: "400M" },
              { label: "团队 & 顾问", percentage: 15, color: "from-purple-500 to-pink-500", amount: "150M" },
              { label: "开发基金", percentage: 20, color: "from-green-500 to-emerald-500", amount: "200M" },
              { label: "营销 & 合作", percentage: 15, color: "from-orange-500 to-yellow-500", amount: "150M" },
              { label: "流动性池", percentage: 10, color: "from-red-500 to-rose-500", amount: "100M" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-card border border-border rounded-xl text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{item.percentage}%</div>
                <div className="text-sm text-muted-foreground mb-2">{item.label}</div>
                <div className="text-xs font-mono text-foreground">{item.amount} $KMT</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/whitepaper"
              className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-accent border border-border hover:border-cyan-500/30 rounded-xl text-foreground font-semibold transition-all"
            >
              查看完整白皮书
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
