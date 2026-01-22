/**
 * 交易历史记录模块
 * 用于记录和查询交易执行历史
 */

import { Connection, PublicKey } from "@solana/web3.js";
import type { TradingExecution } from "./trading-agent";
import type { DistributionResult } from "./distribution";

export interface TradingHistoryEntry {
  id: string;
  type: "strategy" | "distribution" | "swap";
  strategyId?: string;
  transactionHash: string;
  status: "pending" | "success" | "failed";
  timestamp: string;
  wallet: string; // 钱包地址
  network: "devnet" | "mainnet";
  details: {
    action?: string;
    amount?: number;
    tokenMint?: string;
    recipients?: string[];
    priceImpact?: string;
    [key: string]: any;
  };
  error?: string;
}

export interface TradingHistoryFilter {
  wallet?: string;
  type?: "strategy" | "distribution" | "swap";
  status?: "pending" | "success" | "failed";
  network?: "devnet" | "mainnet";
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * 交易历史管理器
 * 
 * 注意：这是一个内存实现，生产环境应该使用数据库存储
 */
export class TradingHistoryManager {
  private history: TradingHistoryEntry[] = [];
  private maxHistorySize: number = 10000; // 最大历史记录数

  /**
   * 添加交易历史记录
   */
  addEntry(entry: TradingHistoryEntry): void {
    this.history.push(entry);
    
    // 如果超过最大数量，删除最旧的记录
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * 从策略执行结果添加记录
   */
  addFromStrategyExecution(
    execution: TradingExecution,
    wallet: string,
    network: "devnet" | "mainnet",
    details?: Record<string, any>
  ): void {
    this.addEntry({
      id: execution.id,
      type: "strategy",
      strategyId: execution.strategyId,
      transactionHash: execution.transactionHash,
      status: execution.status,
      timestamp: execution.timestamp,
      wallet,
      network,
      details: details || {},
    });
  }

  /**
   * 从分红结果添加记录
   */
  addFromDistribution(
    result: DistributionResult,
    wallet: string,
    network: "devnet" | "mainnet",
    mode: "sol" | "token",
    tokenMint?: string
  ): void {
    this.addEntry({
      id: `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "distribution",
      transactionHash: result.transactionHash,
      status: "success",
      timestamp: result.timestamp,
      wallet,
      network,
      details: {
        action: "distribution",
        amount: result.totalAmount,
        recipients: result.recipients.map(r => r.address.toBase58()),
        mode,
        tokenMint,
      },
    });
  }

  /**
   * 从Swap结果添加记录
   */
  addFromSwap(
    transactionHash: string,
    wallet: string,
    network: "devnet" | "mainnet",
    inputMint: string,
    outputMint: string,
    inputAmount: string,
    outputAmount: string,
    priceImpact?: string
  ): void {
    this.addEntry({
      id: `swap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "swap",
      transactionHash,
      status: "success",
      timestamp: new Date().toISOString(),
      wallet,
      network,
      details: {
        action: "swap",
        inputMint,
        outputMint,
        inputAmount,
        outputAmount,
        priceImpact,
      },
    });
  }

  /**
   * 查询交易历史
   */
  query(filter: TradingHistoryFilter = {}): TradingHistoryEntry[] {
    let results = [...this.history];

    // 按钱包过滤
    if (filter.wallet) {
      results = results.filter(entry => entry.wallet === filter.wallet);
    }

    // 按类型过滤
    if (filter.type) {
      results = results.filter(entry => entry.type === filter.type);
    }

    // 按状态过滤
    if (filter.status) {
      results = results.filter(entry => entry.status === filter.status);
    }

    // 按网络过滤
    if (filter.network) {
      results = results.filter(entry => entry.network === filter.network);
    }

    // 按日期范围过滤
    if (filter.startDate) {
      const start = new Date(filter.startDate);
      results = results.filter(entry => new Date(entry.timestamp) >= start);
    }

    if (filter.endDate) {
      const end = new Date(filter.endDate);
      results = results.filter(entry => new Date(entry.timestamp) <= end);
    }

    // 排序（最新的在前）
    results.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 分页
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;

    return results.slice(offset, offset + limit);
  }

  /**
   * 获取统计信息
   */
  getStats(wallet?: string, network?: "devnet" | "mainnet"): {
    total: number;
    success: number;
    failed: number;
    pending: number;
    byType: Record<string, number>;
  } {
    let entries = this.history;

    if (wallet) {
      entries = entries.filter(e => e.wallet === wallet);
    }

    if (network) {
      entries = entries.filter(e => e.network === network);
    }

    const stats = {
      total: entries.length,
      success: entries.filter(e => e.status === "success").length,
      failed: entries.filter(e => e.status === "failed").length,
      pending: entries.filter(e => e.status === "pending").length,
      byType: {} as Record<string, number>,
    };

    entries.forEach(entry => {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * 获取单条记录
   */
  getById(id: string): TradingHistoryEntry | undefined {
    return this.history.find(entry => entry.id === id);
  }

  /**
   * 获取钱包的所有记录
   */
  getByWallet(wallet: string, limit?: number): TradingHistoryEntry[] {
    return this.query({ wallet, limit });
  }

  /**
   * 清除历史记录
   */
  clear(): void {
    this.history = [];
  }
}

// 全局实例（生产环境应该使用数据库）
export const tradingHistoryManager = new TradingHistoryManager();
