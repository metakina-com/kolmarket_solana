#!/usr/bin/env node
/**
 * 为 Token-2022 代币设置元数据（使用 TokenMetadata 扩展）
 * 
 * 使用方法:
 *   node scripts/set-token-2022-metadata.js
 * 
 * 环境变量:
 *   TOKEN_MINT=your_token_2022_mint_address
 *   SOLANA_PRIVATE_KEY=[...] 或 SOLANA_DEVNET_PRIVATE_KEY=hex
 *   TOKEN_NAME="KOLMARKET TOKEN" (可选)
 *   TOKEN_SYMBOL="KMT" (可选)
 *   TOKEN_URI="https://oss.kolmarket.ai/kmt-metadata.json" (可选)
 */

const { 
  Connection, 
  Keypair, 
  PublicKey,
  clusterApiUrl,
} = require("@solana/web3.js");
const {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  tokenMetadataInitializeWithRentTransfer,
  tokenMetadataUpdateFieldWithRentTransfer,
  getTokenMetadata,
} = require("@solana/spl-token");
const fs = require("fs/promises");

// 配置
const NETWORK = "devnet";
const RPC_URL = process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet");

// KMT 元数据
const KMT_METADATA = {
  name: process.env.TOKEN_NAME || "KOLMARKET TOKEN",
  symbol: process.env.TOKEN_SYMBOL || "KMT",
  uri: process.env.TOKEN_URI || "https://oss.kolmarket.ai/kmt-metadata.json",
};

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
  console.log("📝 为 Token-2022 代币设置元数据");
  console.log("============================================");
  console.log("");

  // 1. 检查环境变量
  const mintAddress = process.env.TOKEN_MINT;
  if (!mintAddress) {
    console.error("❌ 错误: 未找到 TOKEN_MINT 环境变量");
    console.log("");
    console.log("请设置环境变量:");
    console.log("  export TOKEN_MINT=your_token_2022_mint_address");
    console.log("");
    process.exit(1);
  }

  // 2. 连接
  console.log("📡 连接到 Solana Devnet...");
  const connection = new Connection(RPC_URL, "confirmed");
  console.log(`✅ 已连接到: ${RPC_URL}`);
  console.log("");

  // 3. 加载密钥对
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

  // 4. 解析 Mint 地址
  console.log("🪙 解析 Mint 地址...");
  let mint;
  try {
    mint = new PublicKey(mintAddress);
    console.log(`✅ Mint 地址: ${mint.toBase58()}`);
  } catch (error) {
    console.error("❌ 无效的 Mint 地址:", error.message);
    process.exit(1);
  }
  console.log("");

  // 5. 检查 Mint 信息
  console.log("🔍 检查 Mint 信息...");
  try {
    const mintInfo = await getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
    console.log(`   小数位: ${mintInfo.decimals}`);
    console.log(`   Mint 权限: ${mintInfo.mintAuthority?.toBase58() || "无"}`);
  } catch (error) {
    console.error("❌ 无法获取 Mint 信息:", error.message);
    console.log("   请确认这是 Token-2022 代币");
    process.exit(1);
  }
  console.log("");

  // 6. 检查现有元数据
  console.log("🔍 检查现有元数据...");
  let existingMetadata = null;
  try {
    existingMetadata = await getTokenMetadata(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
    if (existingMetadata) {
      console.log("   ✅ 已存在 TokenMetadata 扩展");
      console.log(`   当前名称: ${existingMetadata.name}`);
      console.log(`   当前符号: ${existingMetadata.symbol}`);
      console.log(`   当前 URI: ${existingMetadata.uri}`);
      console.log("");
      console.log("   将更新元数据...");
    }
  } catch (e) {
    console.log("   ℹ️  未找到 TokenMetadata 扩展，将初始化");
  }
  console.log("");

  // 7. 准备元数据
  console.log("📝 准备元数据...");
  console.log(`   名称: ${KMT_METADATA.name}`);
  console.log(`   符号: ${KMT_METADATA.symbol}`);
  console.log(`   URI: ${KMT_METADATA.uri}`);
  console.log("");

  // 8. 初始化或更新元数据
  console.log("🔨 设置元数据...");
  try {
    let signature;
    
    if (existingMetadata) {
      // 更新现有元数据字段
      console.log("   更新元数据字段...");
      
      // 更新名称
      if (existingMetadata.name !== KMT_METADATA.name) {
        console.log("   - 更新名称...");
        await tokenMetadataUpdateFieldWithRentTransfer(
          connection,
          payer,
          mint,
          payerPubkey,
          "name",
          KMT_METADATA.name,
          [],
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
      }
      
      // 更新符号
      if (existingMetadata.symbol !== KMT_METADATA.symbol) {
        console.log("   - 更新符号...");
        await tokenMetadataUpdateFieldWithRentTransfer(
          connection,
          payer,
          mint,
          payerPubkey,
          "symbol",
          KMT_METADATA.symbol,
          [],
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
      }
      
      // 更新 URI
      if (existingMetadata.uri !== KMT_METADATA.uri) {
        console.log("   - 更新 URI...");
        signature = await tokenMetadataUpdateFieldWithRentTransfer(
          connection,
          payer,
          mint,
          payerPubkey,
          "uri",
          KMT_METADATA.uri,
          [],
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
      } else {
        console.log("   ✅ 元数据已是最新");
        signature = "N/A (无需更新)";
      }
    } else {
      // 初始化元数据（使用 TokenMetadata 扩展）
      console.log("   初始化 TokenMetadata 扩展...");
      signature = await tokenMetadataInitializeWithRentTransfer(
        connection,
        payer,
        mint,
        payerPubkey, // update authority
        payerPubkey, // mint authority
        KMT_METADATA.name,
        KMT_METADATA.symbol,
        KMT_METADATA.uri,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
    }
    
    console.log(`✅ 元数据已成功设置!`);
    if (signature !== "N/A (无需更新)") {
      console.log(`   交易签名: ${signature}`);
    }
    console.log("");

    // 9. 验证元数据
    console.log("🔍 验证元数据...");
    const updatedMetadata = await getTokenMetadata(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
    if (updatedMetadata) {
      console.log(`   ✅ 名称: ${updatedMetadata.name}`);
      console.log(`   ✅ 符号: ${updatedMetadata.symbol}`);
      console.log(`   ✅ URI: ${updatedMetadata.uri}`);
    }
    console.log("");

    // 10. 输出总结
    console.log("============================================");
    console.log("✅ 元数据设置完成!");
    console.log("============================================");
    console.log("");
    console.log("📋 元数据信息:");
    console.log(`   Mint 地址: ${mint.toBase58()}`);
    console.log(`   名称: ${KMT_METADATA.name}`);
    console.log(`   符号: ${KMT_METADATA.symbol}`);
    console.log(`   URI: ${KMT_METADATA.uri}`);
    console.log(`   存储方式: TokenMetadata 扩展（直接在 mint 中）`);
    console.log("");
    console.log("🔗 在区块链浏览器中查看:");
    console.log(`   Solana Explorer - Mint: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
    if (signature !== "N/A (无需更新)") {
      console.log(`   交易详情: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    }
    console.log("");
    console.log("💡 提示:");
    console.log("   元数据直接存储在 mint 账户中，无需额外的元数据账户");
    console.log("   可以在 Explorer 中直接查看 mint 账户查看元数据");
    console.log("");

    // 11. 保存信息
    const metadataInfo = {
      network: NETWORK,
      mint: mint.toBase58(),
      name: KMT_METADATA.name,
      symbol: KMT_METADATA.symbol,
      uri: KMT_METADATA.uri,
      storageType: "TokenMetadata Extension",
      transaction: signature,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      "token-2022-metadata.json",
      JSON.stringify(metadataInfo, null, 2)
    );
    console.log("💾 元数据信息已保存到: token-2022-metadata.json");
    console.log("");

  } catch (error) {
    console.error("❌ 设置元数据失败:", error);
    if (error instanceof Error) {
      console.error("   错误信息:", error.message);
      if (error.message.includes("TokenMetadata extension not initialized")) {
        console.log("");
        console.log("💡 提示:");
        console.log("   当前 mint 可能未启用 TokenMetadata 扩展");
        console.log("   需要重新创建 mint 时启用 TokenMetadata 扩展");
        console.log("   或使用 MetadataPointer 指向外部元数据账户");
      }
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
