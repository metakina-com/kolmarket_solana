#!/usr/bin/env tsx
/**
 * 在 Solana Mainnet 上创建 $KMT Token 并按照分配比例转入指定钱包
 * 
 * 使用方法:
 *   npx tsx scripts/deploy-token-mainnet.ts
 * 
 * 环境变量:
 *   SOLANA_MAINNET_PRIVATE_KEY=your_private_key_hex
 *   SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com (可选)
 */

import { 
  Connection, 
  Keypair, 
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { loadKeypairFromEnv } from "../lib/utils/solana-keypair";

// 配置
const NETWORK = "mainnet";
const RPC_URL = process.env.SOLANA_MAINNET_RPC || process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");

// 代币配置
const TOKEN_DECIMALS = 9; // 代币小数位数
const TOTAL_SUPPLY = 1_000_000_000; // 总供应量 1B $KMT (考虑小数位后是 1_000_000_000_000_000_000)

// 代币分配比例（根据白皮书）
const DISTRIBUTION = {
  community: { percentage: 40, amount: 400_000_000 }, // 400M $KMT
  team: { percentage: 15, amount: 150_000_000 },      // 150M $KMT
  development: { percentage: 20, amount: 200_000_000 }, // 200M $KMT
  marketing: { percentage: 15, amount: 150_000_000 },  // 150M $KMT
  liquidity: { percentage: 10, amount: 100_000_000 },  // 100M $KMT
};

// 接收钱包地址（按分配顺序）
const RECIPIENT_WALLETS = [
  {
    address: "8yu5J7YTeaCyKk9gGhTDvgLvaDTofV4jh5NqUApYQ5pp",
    label: "Community & Ecosystem",
    amount: DISTRIBUTION.community.amount,
  },
  {
    address: "Ei91WdVJMsBADrxR3tPqqCBV8j4isy8dMq6j5LhFisAY",
    label: "Team & Advisors",
    amount: DISTRIBUTION.team.amount,
  },
  {
    address: "Hzw4k86b2rzeroGC6gS3G9Tm46udv7aKbaYRpNuqdjwb",
    label: "Development Fund",
    amount: DISTRIBUTION.development.amount,
  },
  {
    address: "aT4XWKEuo9gA1G4x5FZBuyaGfcRJ5cv89BGib2GMiNM",
    label: "Marketing & Partnerships",
    amount: DISTRIBUTION.marketing.amount,
  },
  {
    address: "8Z9Vu3bW4AE1wjFa7v1zjqkJnGogMb4JKAszT99xZB3n",
    label: "Liquidity Pool",
    amount: DISTRIBUTION.liquidity.amount,
  },
];

async function main() {
  console.log("============================================");
  console.log("🚀 在 Solana Mainnet 上创建 $KMT Token");
  console.log("============================================");
  console.log("");
  console.log("⚠️  警告: 这是主网操作，请确保私钥安全！");
  console.log("");

  // 1. 连接到 Mainnet
  console.log("📡 连接到 Solana Mainnet...");
  const connection = new Connection(RPC_URL, "confirmed");
  console.log(`✅ 已连接到: ${RPC_URL}`);
  
  // 检查连接
  const version = await connection.getVersion();
  console.log(`✅ Solana 版本: ${version["solana-core"]}`);
  console.log("");

  // 2. 加载密钥对
  console.log("🔑 加载密钥对...");
  const payer = loadKeypairFromEnv("mainnet");
  if (!payer) {
    throw new Error("❌ 未找到主网私钥。请设置 SOLANA_MAINNET_PRIVATE_KEY 环境变量。");
  }
  console.log(`✅ 支付地址: ${payer.publicKey.toBase58()}`);
  
  // 检查余额
  const balance = await connection.getBalance(payer.publicKey);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  console.log(`💰 余额: ${balanceSOL.toFixed(4)} SOL`);
  
  if (balanceSOL < 2) {
    console.log("⚠️  警告: 余额可能不足，建议至少 2 SOL 用于创建代币和转账");
  }
  console.log("");

  // 3. 创建代币 Mint
  console.log("🪙 创建代币 Mint...");
  console.log(`   名称: KOLMarket Token`);
  console.log(`   符号: $KMT`);
  console.log(`   小数位: ${TOKEN_DECIMALS}`);
  console.log(`   总供应量: ${TOTAL_SUPPLY.toLocaleString()} $KMT`);
  console.log("");

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority (可以后续转移或撤销)
    null, // freeze authority (null = 不可冻结)
    TOKEN_DECIMALS,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log(`✅ 代币 Mint 地址: ${mint.toBase58()}`);
  console.log(`   查看: https://solscan.io/token/${mint.toBase58()}`);
  console.log("");

  // 4. 验证总供应量
  const mintInfo = await getMint(connection, mint);
  console.log(`📊 Mint 信息:`);
  console.log(`   当前供应量: ${Number(mintInfo.supply).toLocaleString()}`);
  console.log(`   小数位: ${mintInfo.decimals}`);
  console.log("");

  // 5. 按照分配比例转入钱包
  console.log("📦 开始代币分配...");
  console.log("");

  const totalDistributed = RECIPIENT_WALLETS.reduce((sum, w) => sum + w.amount, 0);
  console.log(`📊 分配计划:`);
  RECIPIENT_WALLETS.forEach((wallet, index) => {
    const percentage = (wallet.amount / TOTAL_SUPPLY) * 100;
    console.log(`   ${index + 1}. ${wallet.label}: ${wallet.amount.toLocaleString()} $KMT (${percentage}%)`);
  });
  console.log(`   总计: ${totalDistributed.toLocaleString()} $KMT`);
  console.log("");

  if (totalDistributed > TOTAL_SUPPLY) {
    throw new Error(`❌ 分配总量 (${totalDistributed}) 超过总供应量 (${TOTAL_SUPPLY})`);
  }

  // 创建或获取支付者的关联代币账户
  console.log("🔧 创建支付者关联代币账户...");
  const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log(`✅ 支付者代币账户: ${payerTokenAccount.address.toBase58()}`);
  console.log("");

  // 为每个接收者创建关联代币账户并转账
  const distributionResults = [];

  for (let i = 0; i < RECIPIENT_WALLETS.length; i++) {
    const wallet = RECIPIENT_WALLETS[i];
    const recipientPubkey = new PublicKey(wallet.address);
    
    console.log(`📤 [${i + 1}/${RECIPIENT_WALLETS.length}] 处理 ${wallet.label}...`);
    console.log(`   地址: ${wallet.address}`);
    console.log(`   金额: ${wallet.amount.toLocaleString()} $KMT`);

    try {
      // 创建或获取接收者的关联代币账户
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        recipientPubkey
      );
      console.log(`   ✅ 代币账户: ${recipientTokenAccount.address.toBase58()}`);

      // 铸造代币到接收者账户
      const amount = BigInt(wallet.amount) * BigInt(10 ** TOKEN_DECIMALS);
      const signature = await mintTo(
        connection,
        payer,
        mint,
        recipientTokenAccount.address,
        payer.publicKey, // mint authority
        amount
      );

      console.log(`   ✅ 转账成功!`);
      console.log(`   📝 交易签名: ${signature}`);
      console.log(`   🔗 查看: https://solscan.io/tx/${signature}`);
      console.log("");

      distributionResults.push({
        label: wallet.label,
        address: wallet.address,
        amount: wallet.amount,
        signature,
        success: true,
      });

    } catch (error) {
      console.error(`   ❌ 转账失败:`, error);
      console.log("");

      distributionResults.push({
        label: wallet.label,
        address: wallet.address,
        amount: wallet.amount,
        error: error instanceof Error ? error.message : String(error),
        success: false,
      });
    }
  }

  // 6. 验证最终状态
  console.log("============================================");
  console.log("📊 分配结果汇总");
  console.log("============================================");
  console.log("");

  const finalMintInfo = await getMint(connection, mint);
  console.log(`🪙 代币信息:`);
  console.log(`   Mint 地址: ${mint.toBase58()}`);
  console.log(`   总供应量: ${Number(finalMintInfo.supply).toLocaleString()} (原始单位)`);
  console.log(`   总供应量: ${(Number(finalMintInfo.supply) / 10 ** TOKEN_DECIMALS).toLocaleString()} $KMT`);
  console.log("");

  console.log(`📦 分配详情:`);
  distributionResults.forEach((result, index) => {
    if (result.success) {
      console.log(`   ✅ ${index + 1}. ${result.label}`);
      console.log(`      地址: ${result.address}`);
      console.log(`      金额: ${result.amount.toLocaleString()} $KMT`);
      console.log(`      交易: ${result.signature}`);
    } else {
      console.log(`   ❌ ${index + 1}. ${result.label}`);
      console.log(`      地址: ${result.address}`);
      console.log(`      错误: ${result.error}`);
    }
    console.log("");
  });

  const successCount = distributionResults.filter(r => r.success).length;
  const failedCount = distributionResults.length - successCount;

  console.log(`📈 统计:`);
  console.log(`   成功: ${successCount}/${RECIPIENT_WALLETS.length}`);
  console.log(`   失败: ${failedCount}/${RECIPIENT_WALLETS.length}`);
  console.log("");

  // 7. 保存结果到文件
  const resultData = {
    timestamp: new Date().toISOString(),
    network: "mainnet",
    mint: mint.toBase58(),
    totalSupply: TOTAL_SUPPLY,
    decimals: TOKEN_DECIMALS,
    distribution: distributionResults,
  };

  const fs = await import("fs/promises");
  const resultFile = `token-deployment-mainnet-${Date.now()}.json`;
  await fs.writeFile(resultFile, JSON.stringify(resultData, null, 2));
  console.log(`💾 结果已保存到: ${resultFile}`);
  console.log("");

  console.log("============================================");
  console.log("✅ 代币部署完成！");
  console.log("============================================");
  console.log("");
  console.log(`🪙 Mint 地址: ${mint.toBase58()}`);
  console.log(`🔗 Solscan: https://solscan.io/token/${mint.toBase58()}`);
  console.log("");

  if (failedCount > 0) {
    console.log("⚠️  警告: 部分分配失败，请检查错误信息并重试。");
    process.exit(1);
  }
}

// 运行主函数
main().catch((error) => {
  console.error("❌ 错误:", error);
  process.exit(1);
});
