#!/usr/bin/env node
/**
 * 创建标准 SPL Token 并铸造全部代币
 * 
 * 使用方法:
 *   node scripts/create-spl-token-with-supply.js
 * 
 * 环境变量:
 *   SOLANA_PRIVATE_KEY=[...] 或 SOLANA_DEVNET_PRIVATE_KEY=hex
 *   TOTAL_SUPPLY=1000000000 (可选，默认 1,000,000,000，单位：代币数量，不是最小单位)
 *   TOKEN_DECIMALS=9 (可选，默认 9)
 *   TOKEN_NAME="KOLMARKET TOKEN" (可选)
 *   TOKEN_SYMBOL="KMT" (可选)
 */

const { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  getMint,
} = require("@solana/spl-token");
const {
  SystemProgram,
  createAccount,
} = require("@solana/web3.js");
const fs = require("fs/promises");

// 配置
const NETWORK = "devnet";
const RPC_URL = process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet");
const TOKEN_DECIMALS = parseInt(process.env.TOKEN_DECIMALS || "9");
const TOKEN_NAME = process.env.TOKEN_NAME || "KOLMARKET TOKEN";
const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "KMT";

// 总供应量（代币数量，不是最小单位）
// 例如：1000000000 表示 10 亿代币
const TOTAL_SUPPLY_TOKENS = parseFloat(process.env.TOTAL_SUPPLY || "1000000000");

// 转换为最小单位（考虑小数位）
const TOTAL_SUPPLY = BigInt(Math.floor(TOTAL_SUPPLY_TOKENS * Math.pow(10, TOKEN_DECIMALS)));

/**
 * 加载密钥对
 */
function loadKeypairFromEnv() {
  try {
    const privateKeyArray = process.env.SOLANA_PRIVATE_KEY;
    if (privateKeyArray) {
      try {
        const bytes = JSON.parse(privateKeyArray);
        if (Array.isArray(bytes) && bytes.length === 64) {
          return Keypair.fromSecretKey(Uint8Array.from(bytes));
        }
      } catch (e) {}
    }

    const privateKeyHex = process.env.SOLANA_DEVNET_PRIVATE_KEY;
    if (!privateKeyHex) return null;

    const privateKeyBytes = Uint8Array.from(
      privateKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error("Error loading keypair:", error);
    return null;
  }
}

async function main() {
  console.log("============================================");
  console.log("🪙 创建标准 SPL Token 并铸造全部代币");
  console.log("============================================");
  console.log("");

  // 1. 连接
  console.log("📡 连接到 Solana Devnet...");
  const connection = new Connection(RPC_URL, "confirmed");
  console.log(`✅ 已连接到: ${RPC_URL}`);
  console.log("");

  // 2. 加载密钥对
  console.log("🔑 加载密钥对...");
  const payer = loadKeypairFromEnv();
  if (!payer) {
    console.error("❌ 错误: 未找到私钥环境变量");
    console.log("请设置: SOLANA_PRIVATE_KEY 或 SOLANA_DEVNET_PRIVATE_KEY");
    process.exit(1);
  }
  const payerPubkey = payer.publicKey;
  console.log(`✅ 钱包地址: ${payerPubkey.toBase58()}`);
  console.log("");

  // 3. 检查余额
  console.log("💰 检查余额...");
  const balance = await connection.getBalance(payerPubkey);
  const solBalance = balance / LAMPORTS_PER_SOL;
  console.log(`   余额: ${solBalance} SOL`);

  if (solBalance < 0.1) {
    console.warn("⚠️  余额不足，建议至少 0.1 SOL");
    console.log("");
    console.log("请从 Solana Faucet 获取测试 SOL:");
    console.log("  https://faucet.solana.com/");
  }
  console.log("");

  // 4. 显示代币配置
  console.log("📋 代币配置:");
  console.log(`   名称: ${TOKEN_NAME}`);
  console.log(`   符号: ${TOKEN_SYMBOL}`);
  console.log(`   小数位: ${TOKEN_DECIMALS}`);
  console.log(`   总供应量: ${TOTAL_SUPPLY_TOKENS.toLocaleString()} ${TOKEN_SYMBOL}`);
  console.log(`   总供应量（最小单位）: ${TOTAL_SUPPLY.toString()}`);
  console.log("");

  // 5. 创建 Mint 账户
  console.log("🔨 创建 Mint 账户...");
  let mint;
  try {
    // 使用 createMint 函数（更简单的方式）
    mint = await createMint(
      connection,
      payer, // payer
      payerPubkey, // mint authority
      null, // freeze authority (null = 不可冻结)
      TOKEN_DECIMALS, // decimals
      undefined, // keypair (自动生成)
      undefined, // confirmOptions
      TOKEN_PROGRAM_ID // 使用标准 SPL Token 程序
    );
    console.log(`✅ Mint 地址: ${mint.toBase58()}`);
    console.log(`   程序ID: ${TOKEN_PROGRAM_ID.toBase58()}`);
  } catch (error) {
    console.error("❌ 创建 Mint 失败:", error);
    if (error instanceof Error) {
      console.error("   错误信息:", error.message);
    }
    process.exit(1);
  }
  console.log("");

  // 6. 创建关联代币账户
  console.log("🔨 创建关联代币账户...");
  let tokenAccount;
  try {
    tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payerPubkey
    );
    console.log(`✅ 代币账户地址: ${tokenAccount.address.toBase58()}`);
  } catch (error) {
    console.error("❌ 创建代币账户失败:", error);
    if (error instanceof Error) {
      console.error("   错误信息:", error.message);
    }
    process.exit(1);
  }
  console.log("");

  // 7. 铸造全部代币
  console.log("💰 铸造全部代币...");
  console.log(`   铸造数量: ${TOTAL_SUPPLY_TOKENS.toLocaleString()} ${TOKEN_SYMBOL}`);
  console.log(`   (${TOTAL_SUPPLY.toString()} 最小单位)`);
  let mintSignature;
  try {
    mintSignature = await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payerPubkey, // mint authority
      TOTAL_SUPPLY, // amount
      [], // multiSigners
      undefined, // confirmOptions
      TOKEN_PROGRAM_ID
    );
    console.log(`✅ 代币铸造成功!`);
    console.log(`   交易签名: ${mintSignature}`);
  } catch (error) {
    console.error("❌ 铸造代币失败:", error);
    if (error instanceof Error) {
      console.error("   错误信息:", error.message);
    }
    process.exit(1);
  }
  console.log("");

  // 8. 验证余额
  console.log("🔍 验证代币余额...");
  try {
    const mintInfo = await getMint(connection, mint, undefined, TOKEN_PROGRAM_ID);
    const tokenBalance = await connection.getTokenAccountBalance(tokenAccount.address);
    
    console.log(`   Mint 供应量: ${mintInfo.supply.toString()}`);
    console.log(`   代币账户余额: ${tokenBalance.value.uiAmount} ${tokenBalance.value.uiAmountString}`);
    console.log(`   小数位: ${mintInfo.decimals}`);
  } catch (error) {
    console.warn("⚠️  无法验证余额:", error.message);
  }
  console.log("");

  // 9. 输出总结
  console.log("============================================");
  console.log("✅ 标准 SPL Token 创建完成!");
  console.log("============================================");
  console.log("");
  console.log("📋 代币信息:");
  console.log(`   Mint 地址: ${mint.toBase58()}`);
  console.log(`   代币账户: ${tokenAccount.address.toBase58()}`);
  console.log(`   名称: ${TOKEN_NAME}`);
  console.log(`   符号: ${TOKEN_SYMBOL}`);
  console.log(`   小数位: ${TOKEN_DECIMALS}`);
  console.log(`   总供应量: ${TOTAL_SUPPLY_TOKENS.toLocaleString()} ${TOKEN_SYMBOL}`);
  console.log(`   程序: 标准 SPL Token`);
  console.log(`   网络: ${NETWORK}`);
  console.log("");
  console.log("🔗 查看代币:");
  console.log(`   Solana Explorer: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
  console.log(`   交易详情: https://explorer.solana.com/tx/${mintSignature}?cluster=devnet`);
  console.log("");
  console.log("💡 提示:");
  console.log("   1. 这是标准 SPL Token，兼容所有支持 SPL Token 的界面");
  console.log("   2. 代币已全部铸造到您的钱包");
  console.log("   3. 可以使用此 Mint 地址在界面中创建代币销售");
  console.log("");

  // 10. 保存信息
  const tokenInfo = {
    network: NETWORK,
    program: "SPL Token",
    mint: mint.toBase58(),
    tokenAccount: tokenAccount.address.toBase58(),
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    decimals: TOKEN_DECIMALS,
    totalSupply: TOTAL_SUPPLY_TOKENS,
    totalSupplyRaw: TOTAL_SUPPLY.toString(),
    mintAuthority: payerPubkey.toBase58(),
    freezeAuthority: null,
    transactions: {
      createMint: mintSignature,
    },
    createdAt: new Date().toISOString(),
  };

  await fs.writeFile(
    "spl-token-with-supply.json",
    JSON.stringify(tokenInfo, null, 2)
  );
  console.log("💾 代币信息已保存到: spl-token-with-supply.json");
  console.log("");
}

main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
