/**
 * Solana 密钥对工具函数
 * 安全地加载和管理 Solana 密钥对
 */

import { Keypair } from "@solana/web3.js";

/**
 * 从环境变量加载 Solana 密钥对
 * 支持多种格式：
 * 1. SOLANA_PRIVATE_KEY - 数组格式: [163,222,31,...]
 * 2. SOLANA_DEVNET_PRIVATE_KEY / SOLANA_MAINNET_PRIVATE_KEY - Hex 字符串格式
 * 
 * @param network - 网络类型 ('devnet' | 'mainnet')
 * @returns Keypair 或 null
 */
export function loadKeypairFromEnv(network: "devnet" | "mainnet" = "devnet"): Keypair | null {
  try {
    // 优先尝试使用通用的 SOLANA_PRIVATE_KEY（数组格式）
    const privateKeyArray = process.env.SOLANA_PRIVATE_KEY;
    if (privateKeyArray) {
      try {
        // 尝试解析数组格式: [163,222,31,...]
        const bytes = JSON.parse(privateKeyArray) as number[];
        if (Array.isArray(bytes) && bytes.length === 64) {
          const keypair = Keypair.fromSecretKey(Uint8Array.from(bytes));
          console.log(`✅ Loaded keypair from SOLANA_PRIVATE_KEY: ${keypair.publicKey.toBase58()}`);
          return keypair;
        }
      } catch (parseError) {
        // 如果不是数组格式，继续尝试其他格式
        console.debug("SOLANA_PRIVATE_KEY is not in array format, trying other formats...");
      }
    }

    // 回退到网络特定的环境变量（Hex 格式）
    const envKey = network === "devnet" 
      ? "SOLANA_DEVNET_PRIVATE_KEY"
      : "SOLANA_MAINNET_PRIVATE_KEY";
    
    const privateKeyHex = process.env[envKey];
    
    if (!privateKeyHex) {
      console.warn(`⚠️  ${envKey} not found in environment variables`);
      return null;
    }

    // 将 Hex 字符串转换为 Uint8Array
    const privateKeyBytes = Uint8Array.from(
      privateKeyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    // 创建密钥对
    const keypair = Keypair.fromSecretKey(privateKeyBytes);

    console.log(`✅ Loaded ${network} keypair: ${keypair.publicKey.toBase58()}`);
    
    return keypair;
  } catch (error) {
    console.error(`Error loading ${network} keypair:`, error);
    return null;
  }
}

/**
 * 从字节数组创建密钥对（用于开发测试）
 * 
 * @param bytes - 私钥字节数组
 * @returns Keypair
 */
export function keypairFromBytes(bytes: number[]): Keypair {
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

/**
 * 验证密钥对是否有效
 * 
 * @param keypair - 要验证的密钥对
 * @returns 是否有效
 */
export function validateKeypair(keypair: Keypair): boolean {
  try {
    // 尝试获取公钥
    const publicKey = keypair.publicKey;
    return publicKey.toBase58().length > 0;
  } catch {
    return false;
  }
}

/**
 * 获取或创建密钥对（用于自动化/脚本）
 * 优先从环境变量加载，否则生成新的（仅演示）
 */
export function getOrCreateKeypair(network: "devnet" | "mainnet" = "devnet"): Keypair {
  const kp = loadKeypairFromEnv(network);
  if (kp) return kp;
  return Keypair.generate();
}
