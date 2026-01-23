#!/usr/bin/env node
/**
 * 验证并获取 Token 完整信息
 * 
 * 使用方法:
 *   node scripts/verify-token-info.js
 * 
 * 环境变量:
 *   TOKEN_MINT=your_token_mint_address (可选，默认使用最新的 Token-2022)
 */

const { 
  Connection, 
  PublicKey,
  clusterApiUrl,
} = require("@solana/web3.js");
const {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getTokenMetadata,
} = require("@solana/spl-token");
const fs = require("fs/promises");

// 配置
const NETWORK = "devnet";
const RPC_URL = process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet");

async function main() {
  console.log("============================================");
  console.log("🔍 验证并获取 Token 信息");
  console.log("============================================");
  console.log("");

  // 1. 获取 Mint 地址
  let mintAddress = process.env.TOKEN_MINT;
  
  if (!mintAddress) {
    // 尝试从最新文件中读取
    try {
      const token2022Info = JSON.parse(await fs.readFile("token-2022-with-extensions.json", "utf8"));
      mintAddress = token2022Info.mint;
      console.log("📋 从 token-2022-with-extensions.json 读取 Mint 地址");
    } catch (e) {
      console.error("❌ 错误: 未找到 TOKEN_MINT 环境变量，也无法从文件中读取");
      console.log("");
      console.log("请设置环境变量:");
      console.log("  export TOKEN_MINT=your_token_mint_address");
      process.exit(1);
    }
  }

  // 2. 连接
  console.log("📡 连接到 Solana Devnet...");
  const connection = new Connection(RPC_URL, "confirmed");
  console.log(`✅ 已连接到: ${RPC_URL}`);
  console.log("");

  // 3. 解析 Mint 地址
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

  // 4. 检查账户是否存在
  console.log("🔍 检查账户是否存在...");
  const accountInfo = await connection.getAccountInfo(mint);
  if (!accountInfo) {
    console.error("❌ 错误: 账户不存在");
    console.log("   请确认 Mint 地址正确，并且代币已创建");
    process.exit(1);
  }
  console.log("✅ 账户存在");
  console.log("");

  // 5. 尝试获取 Token-2022 信息
  console.log("🔍 检查 Token-2022 信息...");
  let mintInfo = null;
  let isToken2022 = false;
  
  try {
    mintInfo = await getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
    isToken2022 = true;
    console.log("✅ 这是 Token-2022 代币");
  } catch (e) {
    try {
      mintInfo = await getMint(connection, mint, undefined, TOKEN_PROGRAM_ID);
      console.log("✅ 这是标准 SPL Token 代币");
    } catch (e2) {
      console.error("❌ 无法获取代币信息:", e2.message);
      process.exit(1);
    }
  }
  console.log("");

  // 6. 获取基本代币信息
  console.log("📋 基本代币信息:");
  console.log(`   Mint 地址: ${mint.toBase58()}`);
  console.log(`   程序 ID: ${isToken2022 ? TOKEN_2022_PROGRAM_ID.toBase58() : TOKEN_PROGRAM_ID.toBase58()}`);
  console.log(`   小数位: ${mintInfo.decimals}`);
  console.log(`   Mint 权限: ${mintInfo.mintAuthority?.toBase58() || "无（已撤销）"}`);
  console.log(`   供应量: ${mintInfo.supply.toString()}`);
  console.log(`   是否可冻结: ${mintInfo.freezeAuthority ? "是" : "否"}`);
  if (mintInfo.freezeAuthority) {
    console.log(`   冻结权限: ${mintInfo.freezeAuthority.toBase58()}`);
  }
  console.log("");

  // 7. 获取 Token-2022 扩展信息
  if (isToken2022) {
    console.log("🔍 Token-2022 扩展信息:");
    
    // 检查 TokenMetadata 扩展
    try {
      const metadata = await getTokenMetadata(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
      if (metadata) {
        console.log("   ✅ TokenMetadata 扩展:");
        console.log(`      名称: ${metadata.name}`);
        console.log(`      符号: ${metadata.symbol}`);
        console.log(`      URI: ${metadata.uri}`);
        if (metadata.additionalMetadata && metadata.additionalMetadata.length > 0) {
          console.log(`      额外元数据: ${metadata.additionalMetadata.length} 个字段`);
        }
      } else {
        console.log("   ⚠️  未找到 TokenMetadata 扩展");
      }
    } catch (e) {
      console.log("   ⚠️  未找到 TokenMetadata 扩展");
    }
    console.log("");
  }

  // 8. 输出完整信息
  console.log("============================================");
  console.log("✅ Token 验证完成!");
  console.log("============================================");
  console.log("");
  console.log("📋 完整代币信息:");
  console.log(`   Mint 地址: ${mint.toBase58()}`);
  console.log(`   网络: ${NETWORK}`);
  console.log(`   程序: ${isToken2022 ? "Token-2022" : "SPL Token"}`);
  console.log(`   小数位: ${mintInfo.decimals}`);
  console.log(`   供应量: ${mintInfo.supply.toString()}`);
  console.log(`   Mint 权限: ${mintInfo.mintAuthority?.toBase58() || "无"}`);
  console.log("");

  // 9. 生成项目代币信息 JSON
  const tokenInfo = {
    network: NETWORK,
    mint: mint.toBase58(),
    program: isToken2022 ? "Token-2022" : "SPL Token",
    decimals: mintInfo.decimals,
    supply: mintInfo.supply.toString(),
    mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
    freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
    isFrozen: mintInfo.freezeAuthority ? false : null,
    verified: true,
    verifiedAt: new Date().toISOString(),
  };

  // 添加 TokenMetadata 信息（如果存在）
  if (isToken2022) {
    try {
      const metadata = await getTokenMetadata(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
      if (metadata) {
        tokenInfo.name = metadata.name;
        tokenInfo.symbol = metadata.symbol;
        tokenInfo.uri = metadata.uri;
        tokenInfo.hasMetadata = true;
      }
    } catch (e) {}
  }

  // 保存到文件
  await fs.writeFile(
    "project-token-info.json",
    JSON.stringify(tokenInfo, null, 2)
  );
  console.log("💾 代币信息已保存到: project-token-info.json");
  console.log("");

  // 10. 输出用于界面的格式
  console.log("📋 用于界面的代币信息:");
  console.log(JSON.stringify(tokenInfo, null, 2));
  console.log("");

  // 11. 输出链接
  console.log("🔗 在区块链浏览器中查看:");
  console.log(`   Solana Explorer: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
  console.log("");
}

main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
