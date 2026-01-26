#!/usr/bin/env node

const { Keypair } = require("@solana/web3.js");

console.log("============================================");
console.log("🔑 生成新的 Solana 钱包密钥对");
console.log("============================================");
console.log("");

// 生成新的密钥对
const keypair = Keypair.generate();

// 获取私钥 (十六进制格式)
const privateKeyHex = Array.from(keypair.secretKey)
  .map(byte => byte.toString(16).padStart(2, '0'))
  .join('');

// 获取公钥
const publicKey = keypair.publicKey.toBase58();

console.log("✅ 新钱包已生成!");
console.log("");
console.log("📍 公钥地址:");
console.log(`   ${publicKey}`);
console.log("");
console.log("🔐 私钥 (十六进制格式):");
console.log(`   ${privateKeyHex}`);
console.log("");
console.log("📝 环境变量设置:");
console.log(`   SOLANA_DEVNET_PRIVATE_KEY=${privateKeyHex}`);
console.log("");
console.log("⚠️  重要提醒:");
console.log("   1. 请妥善保存此私钥，丢失将无法恢复钱包");
console.log("   2. 不要在公共场合暴露私钥");
console.log("   3. 建议为测试网和主网使用不同的钱包");
console.log("");
console.log("💰 获取测试 SOL:");
console.log("   https://faucet.solana.com/");
console.log("");
console.log("🔍 查看钱包:");
console.log(`   https://explorer.solana.com/address/${publicKey}?cluster=devnet`);
console.log("");

// 保存到文件
const fs = require('fs');
const walletInfo = {
  publicKey: publicKey,
  privateKeyHex: privateKeyHex,
  privateKeyArray: Array.from(keypair.secretKey),
  createdAt: new Date().toISOString()
};

fs.writeFileSync('new-wallet.json', JSON.stringify(walletInfo, null, 2));
console.log("💾 钱包信息已保存到: new-wallet.json");
