#!/usr/bin/env node
/**
 * 将 KMT Token 元数据提交到 Solana 区块链
 * 使用 Metaplex Token Metadata 程序
 * 
 * 使用方法:
 *   node scripts/upload-metadata-to-chain.js
 * 
 * 需要设置环境变量:
 *   SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex
 *   TOKEN_MINT=your_kmt_token_mint_address
 *   TOKEN_URI=your_metadata_json_uri (可选，如果已上传到 IPFS)
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

/**
 * 检查是否安装了 Metaplex 包
 */
function checkMetaplexPackage() {
  try {
    require.resolve("@metaplex-foundation/mpl-token-metadata");
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log("============================================");
  console.log("🔗 将 KMT Token 元数据提交到 Solana 区块链");
  console.log("============================================");
  console.log("");

  // 1. 检查 Metaplex 包
  console.log("📦 检查 Metaplex 包...");
  const hasMetaplex = checkMetaplexPackage();
  
  if (!hasMetaplex) {
    console.error("❌ 错误: 未找到 @metaplex-foundation/mpl-token-metadata 包");
    console.log("");
    console.log("请先安装 Metaplex 包:");
    console.log("  npm install @metaplex-foundation/mpl-token-metadata");
    console.log("");
    console.log("或使用 Solana CLI 方法（见文档）");
    process.exit(1);
  }
  console.log("✅ Metaplex 包已安装");
  console.log("");

  // 2. 检查必需的环境变量
  const tokenMintAddress = process.env.TOKEN_MINT;
  if (!tokenMintAddress) {
    console.error("❌ 错误: 未找到 TOKEN_MINT 环境变量");
    console.log("");
    console.log("请设置环境变量:");
    console.log("  export TOKEN_MINT=your_kmt_token_mint_address");
    process.exit(1);
  }

  // 3. 连接到网络
  console.log("📡 连接到 Solana Devnet...");
  const connection = new Connection(RPC_URL, "confirmed");
  console.log(`✅ 已连接到: ${RPC_URL}`);
  console.log("");

  // 4. 加载密钥对
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

  // 5. 检查余额
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

  // 6. 解析 Mint 地址
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

  // 7. 准备元数据 URI
  console.log("📄 准备元数据 URI...");
  let metadataUri = process.env.TOKEN_URI;
  
  if (!metadataUri) {
    try {
      const uploadInfoPath = path.join(process.cwd(), "kmt-metadata-r2-upload.json");
      const uploadInfo = JSON.parse(await fs.readFile(uploadInfoPath, "utf-8"));
      if (uploadInfo.url && uploadInfo.url.startsWith("http")) {
        metadataUri = uploadInfo.url;
        console.log(`✅ 从 kmt-metadata-r2-upload.json 读取: ${metadataUri}`);
      }
    } catch (e) {
      // 忽略
    }
  } else {
    console.log(`✅ 元数据 URI: ${metadataUri}`);
  }
  
  if (!metadataUri) {
    console.log("⚠️  未设置 TOKEN_URI，且未找到 R2 上传记录");
    console.log("");
    console.log("请先上传到 R2: npm run upload:r2");
    console.log("然后设置: export TOKEN_URI=\"https://oss.kolmarket.ai/token-metadata/kmt-metadata.json\"");
    console.log("");
    console.log("如果只想设置基本元数据（名称、符号），可以继续...");
    console.log("");
    
    // 询问是否继续（无 URI 时）
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise((resolve) => {
      rl.question("是否继续设置基本元数据（不包含 URI）? (y/n): ", resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
      console.log("已取消");
      process.exit(0);
    }
  }
  console.log("");

  // 8. 获取或创建元数据 PDA
  console.log("📊 检查元数据账户...");
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const [metadataPDA] = getMetadataPDA(mint);
  console.log(`   元数据 PDA: ${metadataPDA.toBase58()}`);
  console.log("");

  // 9. 准备元数据
  console.log("📝 准备元数据...");
  const metadataData = {
    name: KMT_METADATA.name,
    symbol: KMT_METADATA.symbol,
    uri: metadataUri || "",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  console.log(`   名称: ${metadataData.name}`);
  console.log(`   符号: ${metadataData.symbol}`);
  if (metadataData.uri) {
    console.log(`   URI: ${metadataData.uri}`);
  } else {
    console.log(`   URI: (未设置)`);
  }
  console.log("");

  // 10. 创建元数据指令
  console.log("🔨 创建元数据指令...");
  
  const {
    createUpdateMetadataAccountV2Instruction,
    createCreateMetadataAccountV3Instruction,
  } = require("@metaplex-foundation/mpl-token-metadata");

  const accounts = {
    metadata: metadataPDA,
    mint,
    mintAuthority: payerPubkey,
    payer: payerPubkey,
    updateAuthority: payerPubkey,
  };

  const createArgs = {
    createMetadataAccountArgsV3: {
      data: metadataData,
      isMutable: true,
      collectionDetails: null,
    },
  };

  let transaction = new Transaction();
  let instruction;

  // 检查元数据账户是否存在
  try {
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    
    if (metadataAccount) {
      console.log("   元数据账户已存在，将更新元数据...");
      instruction = createUpdateMetadataAccountV2Instruction(
        {
          metadata: metadataPDA,
          updateAuthority: payerPubkey,
        },
        {
          updateMetadataAccountArgsV2: {
            data: metadataData,
            updateAuthority: payerPubkey,
            primarySaleHappened: true,
            isMutable: true,
          },
        }
      );
    } else {
      console.log("   元数据账户不存在，将创建新元数据 (V3)...");
      instruction = createCreateMetadataAccountV3Instruction(accounts, createArgs);
    }
  } catch (error) {
    console.log("   元数据账户不存在，将创建新元数据 (V3)...");
    instruction = createCreateMetadataAccountV3Instruction(accounts, createArgs);
  }

  transaction.add(instruction);
  console.log("");

  // 11. 发送交易
  console.log("📤 发送交易到 Solana 区块链...");
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    console.log(`✅ 元数据已成功提交到 Solana 区块链!`);
    console.log(`   交易签名: ${signature}`);
    console.log("");

    // 12. 输出总结
    console.log("============================================");
    console.log("✅ 元数据提交完成!");
    console.log("============================================");
    console.log("");
    console.log("📋 元数据信息:");
    console.log(`   Mint 地址: ${mint.toBase58()}`);
    console.log(`   元数据 PDA: ${metadataPDA.toBase58()}`);
    console.log(`   代币名称: ${KMT_METADATA.name}`);
    console.log(`   代币符号: ${KMT_METADATA.symbol}`);
    if (metadataUri) {
      console.log(`   URI: ${metadataUri}`);
    }
    console.log(`   交易签名: ${signature}`);
    console.log("");

    // 13. 浏览器链接
    console.log("🔗 在区块链浏览器中查看:");
    console.log(`   Solana Explorer:`);
    console.log(`   - Mint 地址: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
    console.log(`   - 元数据 PDA: https://explorer.solana.com/address/${metadataPDA.toBase58()}?cluster=devnet`);
    console.log(`   - 交易详情: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("");
    console.log(`   Solscan:`);
    console.log(`   - Mint 地址: https://solscan.io/token/${mint.toBase58()}?cluster=devnet`);
    console.log(`   - 交易详情: https://solscan.io/tx/${signature}?cluster=devnet`);
    console.log("");

    // 14. 保存信息
    const metadataInfo = {
      network: NETWORK,
      mint: mint.toBase58(),
      metadataPDA: metadataPDA.toBase58(),
      name: KMT_METADATA.name,
      symbol: KMT_METADATA.symbol,
      uri: metadataUri || "",
      image: KMT_METADATA.image,
      external_url: KMT_METADATA.external_url,
      transaction: signature,
      explorer: {
        solanaExplorer: {
          mint: `https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`,
          metadata: `https://explorer.solana.com/address/${metadataPDA.toBase58()}?cluster=devnet`,
          transaction: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        },
        solscan: {
          mint: `https://solscan.io/token/${mint.toBase58()}?cluster=devnet`,
          transaction: `https://solscan.io/tx/${signature}?cluster=devnet`,
        },
      },
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      "kmt-metadata-on-chain.json",
      JSON.stringify(metadataInfo, null, 2)
    );
    console.log("💾 链上元数据信息已保存到: kmt-metadata-on-chain.json");
    console.log("");

    console.log("💡 提示:");
    console.log("   1. 元数据已写入 Solana 区块链");
    console.log("   2. 可以在 Solana Explorer 或 Solscan 上查看");
    console.log("   3. 如果设置了 URI，浏览器会自动读取并显示完整元数据");
    console.log("   4. 元数据 PDA 地址是元数据在链上的存储位置");
    console.log("");

  } catch (error) {
    console.error("❌ 提交元数据失败:", error);
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
