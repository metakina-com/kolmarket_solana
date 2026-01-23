#!/usr/bin/env node
/**
 * 在 Solana Devnet 上创建 SPL Token
 * 
 * 使用方法:
 *   node scripts/create-token-devnet.js
 * 
 * 或设置环境变量:
 *   SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex node scripts/create-token-devnet.js
 */

const { 
  Connection, 
  Keypair, 
  clusterApiUrl,
  LAMPORTS_PER_SOL 
} = require("@solana/web3.js");
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getMint,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
const fs = require("fs/promises");

// 配置
const NETWORK = "devnet";
const RPC_URL = process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet");

// 代币配置
const TOKEN_DECIMALS = 9; // 代币小数位数（通常 6 或 9）
const INITIAL_SUPPLY = 1_000_000_000; // 初始供应量（考虑小数位）

/**
 * 从环境变量加载密钥对
 */
function loadKeypairFromEnv() {
  try {
    // 优先尝试使用通用的 SOLANA_PRIVATE_KEY（数组格式）
    const privateKeyArray = process.env.SOLANA_PRIVATE_KEY;
    if (privateKeyArray) {
      try {
        const bytes = JSON.parse(privateKeyArray);
        if (Array.isArray(bytes) && bytes.length === 64) {
          return Keypair.fromSecretKey(Uint8Array.from(bytes));
        }
      } catch (e) {
        // 继续尝试其他格式
      }
    }

    // 回退到网络特定的环境变量（Hex 格式）
    const privateKeyHex = process.env.SOLANA_DEVNET_PRIVATE_KEY;
    
    if (!privateKeyHex) {
      return null;
    }

    // 将 Hex 字符串转换为 Uint8Array
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
  console.log("🚀 在 Solana Devnet 上创建代币");
  console.log("============================================");
  console.log("");

  // 1. 连接到 Devnet
  console.log("📡 连接到 Solana Devnet...");
  const connection = new Connection(RPC_URL, "confirmed");
  console.log(`✅ 已连接到: ${RPC_URL}`);
  console.log("");

  // 2. 加载密钥对
  console.log("🔑 加载密钥对...");
  const payer = loadKeypairFromEnv();
  
  if (!payer) {
    console.error("❌ 错误: 未找到 SOLANA_DEVNET_PRIVATE_KEY 环境变量");
    console.log("");
    console.log("请设置环境变量:");
    console.log("  export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex");
    console.log("");
    console.log("或使用以下格式之一:");
    console.log("  1. Hex 字符串: SOLANA_DEVNET_PRIVATE_KEY=18f3280dfbf2c6...");
    console.log("  2. 数组格式: SOLANA_PRIVATE_KEY=[163,222,31,...]");
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
    console.warn("⚠️  余额不足，需要至少 0.1 SOL 来创建代币");
    console.log("");
    console.log("请从 Solana Faucet 获取测试 SOL:");
    console.log("  https://faucet.solana.com/");
    console.log("");
    console.log("或使用命令行:");
    console.log(`  solana airdrop 1 ${payerPubkey.toBase58()} --url devnet`);
    process.exit(1);
  }
  console.log("");

  // 4. 创建代币 Mint
  console.log("🪙 创建代币 Mint...");
  console.log(`   小数位数: ${TOKEN_DECIMALS}`);
  console.log(`   初始供应量: ${INITIAL_SUPPLY / Math.pow(10, TOKEN_DECIMALS)} 代币`);
  console.log("");

  try {
    const mint = await createMint(
      connection,
      payer, // 支付者
      payerPubkey, // Mint 权限（可以设置为 null 使其不可变）
      null, // 冻结权限（null = 不可冻结）
      TOKEN_DECIMALS, // 小数位数
      undefined, // Keypair（自动生成）
      undefined, // 确认选项
      TOKEN_PROGRAM_ID // Token 程序 ID
    );

    console.log(`✅ 代币 Mint 创建成功!`);
    console.log(`   Mint 地址: ${mint.toBase58()}`);
    console.log("");

    // 5. 获取 Mint 信息
    console.log("📊 获取 Mint 信息...");
    const mintInfo = await getMint(connection, mint);
    console.log(`   供应量: ${Number(mintInfo.supply) / Math.pow(10, TOKEN_DECIMALS)}`);
    console.log(`   小数位数: ${mintInfo.decimals}`);
    console.log(`   Mint 权限: ${mintInfo.mintAuthority?.toBase58() || "无（不可变）"}`);
    console.log(`   冻结权限: ${mintInfo.freezeAuthority?.toBase58() || "无（不可冻结）"}`);
    console.log("");

    // 6. 创建关联代币账户并铸造初始供应量
    console.log("🏦 创建关联代币账户...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payerPubkey
    );
    console.log(`✅ 代币账户: ${tokenAccount.address.toBase58()}`);
    console.log("");

    console.log("🪙 铸造初始供应量...");
    const mintAmount = INITIAL_SUPPLY; // 考虑小数位的原始数量
    const mintSignature = await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payerPubkey, // Mint 权限
      mintAmount
    );
    console.log(`✅ 铸造成功!`);
    console.log(`   交易签名: ${mintSignature}`);
    console.log(`   铸造数量: ${mintAmount / Math.pow(10, TOKEN_DECIMALS)} 代币`);
    console.log("");

    // 7. 验证余额
    console.log("💰 验证代币余额...");
    const tokenBalance = await connection.getTokenAccountBalance(tokenAccount.address);
    console.log(`   代币余额: ${tokenBalance.value.uiAmount} ${tokenBalance.value.uiAmountString}`);
    console.log("");

    // 8. 输出总结
    console.log("============================================");
    console.log("✅ 代币创建完成!");
    console.log("============================================");
    console.log("");
    console.log("📋 代币信息:");
    console.log(`   Mint 地址: ${mint.toBase58()}`);
    console.log(`   代币账户: ${tokenAccount.address.toBase58()}`);
    console.log(`   小数位数: ${TOKEN_DECIMALS}`);
    console.log(`   初始供应量: ${INITIAL_SUPPLY / Math.pow(10, TOKEN_DECIMALS)}`);
    console.log(`   交易签名: ${mintSignature}`);
    console.log("");
    console.log("🔗 查看代币:");
    console.log(`   Solana Explorer: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
    console.log(`   交易详情: https://explorer.solana.com/tx/${mintSignature}?cluster=devnet`);
    console.log("");
    console.log("💡 提示:");
    console.log("   1. 保存 Mint 地址，这是您的代币唯一标识");
    console.log("   2. 可以在 Solana Explorer 上查看代币详情");
    console.log("   3. 使用此 Mint 地址进行代币转账和交易");
    console.log("");

    // 9. 保存到文件（可选）
    const tokenInfo = {
      network: NETWORK,
      mint: mint.toBase58(),
      tokenAccount: tokenAccount.address.toBase58(),
      decimals: TOKEN_DECIMALS,
      initialSupply: INITIAL_SUPPLY / Math.pow(10, TOKEN_DECIMALS),
      transaction: mintSignature,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      "token-info-devnet.json",
      JSON.stringify(tokenInfo, null, 2)
    );
    console.log("💾 代币信息已保存到: token-info-devnet.json");
    console.log("");

  } catch (error) {
    console.error("❌ 创建代币失败:", error);
    if (error instanceof Error) {
      console.error("   错误信息:", error.message);
      console.error("   错误堆栈:", error.stack);
    }
    process.exit(1);
  }
}

// 运行主函数
main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
