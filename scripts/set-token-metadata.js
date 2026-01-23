#!/usr/bin/env node
/**
 * 为 Solana Token 设置元数据（Metadata）
 * 使用 Metaplex Token Metadata 标准
 * 
 * 使用方法:
 *   node scripts/set-token-metadata.js
 * 
 * 需要设置环境变量:
 *   SOLANA_DEVNET_PRIVATE_KEY=your_private_key_hex
 *   TOKEN_MINT=your_token_mint_address
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
const {
  createUpdateMetadataAccountV2Instruction,
  createCreateMetadataAccountV2Instruction,
  DataV2,
} = require("@metaplex-foundation/mpl-token-metadata");
const fs = require("fs/promises");

// 配置
const NETWORK = "devnet";
const RPC_URL = process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet");

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
  const { PublicKey } = require("@solana/web3.js");
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
  console.log("🪙 设置 Solana Token 元数据");
  console.log("============================================");
  console.log("");

  // 1. 检查必需的环境变量
  const tokenMintAddress = process.env.TOKEN_MINT;
  if (!tokenMintAddress) {
    console.error("❌ 错误: 未找到 TOKEN_MINT 环境变量");
    console.log("");
    console.log("请设置环境变量:");
    console.log("  export TOKEN_MINT=your_token_mint_address");
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
  console.log("🪙 解析 Token Mint 地址...");
  let mint;
  try {
    mint = new PublicKey(tokenMintAddress);
    console.log(`✅ Mint 地址: ${mint.toBase58()}`);
  } catch (error) {
    console.error("❌ 无效的 Mint 地址:", error.message);
    process.exit(1);
  }
  console.log("");

  // 6. 获取或创建元数据
  console.log("📊 检查元数据账户...");
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const [metadataPDA] = getMetadataPDA(mint);
  console.log(`   元数据 PDA: ${metadataPDA.toBase58()}`);
  console.log("");

  // 7. 准备元数据
  console.log("📝 准备元数据...");
  console.log("   请输入代币信息（或按 Enter 使用默认值）:");
  console.log("");

  // 从环境变量或使用默认值
  const tokenName = process.env.TOKEN_NAME || "My Token";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "MTK";
  const tokenUri = process.env.TOKEN_URI || "";
  const tokenDescription = process.env.TOKEN_DESCRIPTION || "A token created on KOLMarket.ai";
  const tokenImage = process.env.TOKEN_IMAGE || "";

  console.log(`   代币名称: ${tokenName}`);
  console.log(`   代币符号: ${tokenSymbol}`);
  console.log(`   描述: ${tokenDescription}`);
  if (tokenUri) {
    console.log(`   URI: ${tokenUri}`);
  }
  if (tokenImage) {
    console.log(`   图片: ${tokenImage}`);
  }
  console.log("");

  // 8. 创建元数据指令
  console.log("🔨 创建元数据指令...");
  
  const metadataData = {
    name: tokenName,
    symbol: tokenSymbol,
    uri: tokenUri || "",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
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
      console.log("   元数据账户不存在，将创建新元数据...");
      instruction = createCreateMetadataAccountV2Instruction(
        {
          metadata: metadataPDA,
          mint: mint,
          mintAuthority: payerPubkey,
          payer: payerPubkey,
          updateAuthority: payerPubkey,
        },
        {
          createMetadataAccountArgsV2: {
            data: metadataData,
            isMutable: true,
          },
        }
      );
    }
  } catch (error) {
    console.log("   元数据账户不存在，将创建新元数据...");
    instruction = createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: payerPubkey,
        payer: payerPubkey,
        updateAuthority: payerPubkey,
      },
      {
        createMetadataAccountArgsV2: {
          data: metadataData,
          isMutable: true,
        },
      }
    );
  }

  transaction.add(instruction);
  console.log("");

  // 9. 发送交易
  console.log("📤 发送交易...");
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    console.log(`✅ 元数据设置成功!`);
    console.log(`   交易签名: ${signature}`);
    console.log("");

    // 10. 输出总结
    console.log("============================================");
    console.log("✅ 元数据设置完成!");
    console.log("============================================");
    console.log("");
    console.log("📋 元数据信息:");
    console.log(`   Mint 地址: ${mint.toBase58()}`);
    console.log(`   元数据 PDA: ${metadataPDA.toBase58()}`);
    console.log(`   代币名称: ${tokenName}`);
    console.log(`   代币符号: ${tokenSymbol}`);
    console.log(`   描述: ${tokenDescription}`);
    if (tokenUri) {
      console.log(`   URI: ${tokenUri}`);
    }
    console.log(`   交易签名: ${signature}`);
    console.log("");
    console.log("🔗 查看元数据:");
    console.log(`   Solana Explorer: https://explorer.solana.com/address/${metadataPDA.toBase58()}?cluster=devnet`);
    console.log(`   交易详情: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("");

    // 11. 保存到文件
    const metadataInfo = {
      network: NETWORK,
      mint: mint.toBase58(),
      metadataPDA: metadataPDA.toBase58(),
      name: tokenName,
      symbol: tokenSymbol,
      uri: tokenUri,
      description: tokenDescription,
      image: tokenImage,
      transaction: signature,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      "token-metadata-devnet.json",
      JSON.stringify(metadataInfo, null, 2)
    );
    console.log("💾 元数据信息已保存到: token-metadata-devnet.json");
    console.log("");

  } catch (error) {
    console.error("❌ 设置元数据失败:", error);
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
