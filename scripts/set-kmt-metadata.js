#!/usr/bin/env node
/**
 * 为 KMT Token 设置元数据
 * 
 * 使用方法:
 *   node scripts/set-kmt-metadata.js
 * 
 * 需要设置环境变量:
 *   SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex
 *   TOKEN_MINT=your_kmt_token_mint_address
 */

const { 
  Connection, 
  Keypair, 
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} = require("@solana/web3.js");
const fs = require("fs/promises");
const path = require("path");

// 配置
const NETWORK = "devnet";
const RPC_URL = process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet");

// KMT 元数据配置
const KMT_METADATA = {
  name: "KOLMARKET TOKEN",
  symbol: "KMT",
  description: "$KMT: Redefining the Order of Web3 Influence\n\nAt kolmarket.ai, $KMT is more than just a token—it is the fuel for Web3 growth.\n\nEmpowering KOLs: Break free from centralized platform fees and monetize your influence directly.\n\nAccelerating Brands: Use $KMT to precision-target top-tier crypto leaders globally.\n\nEarn Together: Benefit from a community-driven ecosystem with buy-back mechanisms and active contributor rewards.\n\nJoin us and witness the tokenization of influence with $KMT!",
  image: "https://oss.kolmarket.ai/etPJjFNh_400x400.jpg",
  external_url: "https://kolmarket.ai",
};

/**
 * 从环境变量加载密钥对
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
      } catch (e) {
        // 继续尝试其他格式
      }
    }

    const privateKeyHex = process.env.SOLANA_DEVNET_PRIVATE_KEY;
    if (!privateKeyHex) {
      return null;
    }

    const privateKeyBytes = Uint8Array.from(
      privateKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );

    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error("Error loading keypair:", error);
    return null;
  }
}

/**
 * 获取 Metadata PDA
 */
function getMetadataPDA(mint) {
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

async function main() {
  console.log("============================================");
  console.log("🪙 设置 KMT Token 元数据");
  console.log("============================================");
  console.log("");

  // 1. 检查必需的环境变量
  const tokenMintAddress = process.env.TOKEN_MINT;
  if (!tokenMintAddress) {
    console.error("❌ 错误: 未找到 TOKEN_MINT 环境变量");
    console.log("");
    console.log("请设置环境变量:");
    console.log("  export TOKEN_MINT=your_kmt_token_mint_address");
    console.log("");
    console.log("示例:");
    console.log("  export TOKEN_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    process.exit(1);
  }

  // 2. 连接到网络
  console.log("📡 连接到 Solana Devnet...");
  const connection = new Connection(RPC_URL, "confirmed");
  console.log(`✅ 已连接到: ${RPC_URL}`);
  console.log("");

  // 3. 加载密钥对
  console.log("🔑 加载密钥对...");
  const payer = loadKeypairFromEnv();
  
  if (!payer) {
    console.error("❌ 错误: 未找到 SOLANA_DEVNET_PRIVATE_KEY 环境变量");
    console.log("");
    console.log("请设置环境变量:");
    console.log("  export SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex");
    process.exit(1);
  }

  const payerPubkey = payer.publicKey;
  console.log(`✅ 钱包地址: ${payerPubkey.toBase58()}`);
  console.log("");

  // 4. 检查余额
  console.log("💰 检查余额...");
  const balance = await connection.getBalance(payerPubkey);
  const solBalance = balance / LAMPORTS_PER_SOL;
  console.log(`   余额: ${solBalance} SOL`);

  if (solBalance < 0.1) {
    console.warn("⚠️  余额不足，需要至少 0.1 SOL 来设置元数据");
    console.log("");
    console.log("请从 Solana Faucet 获取测试 SOL:");
    console.log("  https://faucet.solana.com/");
    process.exit(1);
  }
  console.log("");

  // 5. 解析 Mint 地址
  console.log("🪙 解析 KMT Token Mint 地址...");
  let mint;
  try {
    mint = new PublicKey(tokenMintAddress);
    console.log(`✅ Mint 地址: ${mint.toBase58()}`);
  } catch (error) {
    console.error("❌ 无效的 Mint 地址:", error.message);
    process.exit(1);
  }
  console.log("");

  // 6. 显示元数据信息
  console.log("📝 KMT 元数据信息:");
  console.log(`   名称: ${KMT_METADATA.name}`);
  console.log(`   符号: ${KMT_METADATA.symbol}`);
  console.log(`   描述: ${KMT_METADATA.description.substring(0, 100)}...`);
  console.log(`   图片: ${KMT_METADATA.image}`);
  console.log(`   网站: ${KMT_METADATA.external_url}`);
  console.log("");

  // 7. 检查是否需要上传元数据 JSON
  console.log("📄 准备元数据 JSON...");
  
  // 读取或创建元数据 JSON
  const metadataPath = path.join(process.cwd(), "kmt-metadata.json");
  let metadataJson;
  
  try {
    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    metadataJson = JSON.parse(metadataContent);
    console.log(`✅ 已读取元数据文件: ${metadataPath}`);
  } catch (error) {
    // 如果文件不存在，使用默认元数据
    metadataJson = {
      ...KMT_METADATA,
      attributes: [
        {
          trait_type: "Network",
          value: "Solana"
        },
        {
          trait_type: "Platform",
          value: "KOLMarket.ai"
        },
        {
          trait_type: "Token Type",
          value: "Utility Token"
        }
      ],
      properties: {
        category: "token",
        creators: [
          {
            address: payerPubkey.toBase58(),
            share: 100
          }
        ]
      }
    };
    console.log(`⚠️  元数据文件不存在，使用默认配置`);
  }
  console.log("");

  // 8. 提示上传元数据 JSON
    console.log("💡 重要提示:");
    console.log("   1. 将元数据 JSON 上传到 Cloudflare R2");
    console.log("   2. 获取上传后的 URI");
    console.log("   3. 设置 TOKEN_URI 环境变量");
    console.log("");
    console.log("   推荐使用:");
    console.log("   - 使用脚本: npm run upload:r2");
    console.log("   - 使用 Wrangler: npx wrangler r2 object put kolmarket-uploads/token-metadata/kmt-metadata.json --file=kmt-metadata.json");
    console.log("   - R2 自定义域名: https://oss.kolmarket.ai/token-metadata/kmt-metadata.json");
    console.log("");

  // 9. 获取或创建元数据
  console.log("📊 检查元数据账户...");
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const [metadataPDA] = getMetadataPDA(mint);
  console.log(`   元数据 PDA: ${metadataPDA.toBase58()}`);
  console.log("");

  // 10. 使用 Metaplex SDK（如果可用）或提供手动设置说明
  console.log("⚠️  注意: 此脚本需要 @metaplex-foundation/mpl-token-metadata 包");
  console.log("");
  console.log("如果包未安装，请先安装:");
  console.log("  npm install @metaplex-foundation/mpl-token-metadata");
  console.log("");
  console.log("或者使用以下方法手动设置:");
  console.log("");
  console.log("方法 1: 使用 Solana CLI");
  console.log("  spl-token create-metadata YOUR_MINT_ADDRESS --name 'KOLMARKET TOKEN' --symbol 'KMT' --uri 'YOUR_METADATA_URI'");
  console.log("");
  console.log("方法 2: 使用 Metaplex SDK");
  console.log("  参考文档: docs/SET_TOKEN_METADATA.md");
  console.log("");

  // 11. 保存元数据信息
  const metadataInfo = {
    network: NETWORK,
    mint: mint.toBase58(),
    metadataPDA: metadataPDA.toBase58(),
    ...KMT_METADATA,
    metadataJson,
    wallet: payerPubkey.toBase58(),
    createdAt: new Date().toISOString(),
  };

  await fs.writeFile(
    "kmt-metadata-info.json",
    JSON.stringify(metadataInfo, null, 2)
  );
  console.log("💾 元数据信息已保存到: kmt-metadata-info.json");
  console.log("");

  // 12. 输出总结
  console.log("============================================");
  console.log("✅ KMT 元数据配置完成!");
  console.log("============================================");
  console.log("");
    console.log("📋 下一步操作:");
    console.log("   1. 上传 kmt-metadata.json 到 Cloudflare R2:");
    console.log("      npm run upload:r2");
    console.log("");
    console.log("   2. 获取 R2 URL（从脚本输出）:");
    console.log("      https://oss.kolmarket.ai/token-metadata/kmt-metadata.json");
    console.log("");
    console.log("   3. 使用以下命令设置元数据:");
    console.log("");
    console.log("      export TOKEN_URI=https://oss.kolmarket.ai/token-metadata/kmt-metadata.json");
    console.log("      npm run upload:metadata");
    console.log("");
    console.log("   或使用 Solana CLI:");
    console.log(`      spl-token create-metadata ${mint.toBase58()} \\`);
    console.log(`        --name '${KMT_METADATA.name}' \\`);
    console.log(`        --symbol '${KMT_METADATA.symbol}' \\`);
    console.log(`        --uri 'https://oss.kolmarket.ai/token-metadata/kmt-metadata.json'`);
    console.log("");
  console.log("🔗 查看代币:");
  console.log(`   Solana Explorer: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
  console.log("");
}

// 运行主函数
main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
