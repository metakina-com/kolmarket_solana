#!/usr/bin/env node
/**
 * 诊断代币地址为什么会在界面中报错
 * 
 * 使用方法:
 *   node scripts/diagnose-token-address.js
 * 
 * 环境变量:
 *   TOKEN_MINT=your_token_mint_address (可选)
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
  console.log("🔍 诊断代币地址问题");
  console.log("============================================");
  console.log("");

  // 1. 获取 Mint 地址
  let mintAddress = process.env.TOKEN_MINT || "DjyuBJmt7uAS2RuQDJimNjjvjVqQkKYVukDa4m2Svyco";

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
    console.log(`   地址长度: ${mintAddress.length} 字符`);
    console.log(`   Base58 格式: 正确`);
  } catch (error) {
    console.error("❌ 地址格式错误:", error.message);
    process.exit(1);
  }
  console.log("");

  // 4. 检查账户是否存在
  console.log("🔍 检查账户是否存在...");
  const accountInfo = await connection.getAccountInfo(mint);
  if (!accountInfo) {
    console.error("❌ 账户在链上不存在");
    console.log("   可能原因:");
    console.log("   - 地址错误");
    console.log("   - 网络不匹配（Mainnet vs Devnet）");
    process.exit(1);
  }
  console.log("✅ 账户存在");
  console.log(`   程序ID: ${accountInfo.owner.toBase58()}`);
  console.log("");

  // 5. 检查代币类型
  console.log("🔍 检查代币类型...");
  let mintInfo = null;
  let isToken2022 = false;
  let isStandardToken = false;
  
  try {
    mintInfo = await getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
    isToken2022 = true;
    console.log("✅ 这是 Token-2022 代币");
    console.log(`   程序ID: ${TOKEN_2022_PROGRAM_ID.toBase58()}`);
  } catch (e) {
    try {
      mintInfo = await getMint(connection, mint, undefined, TOKEN_PROGRAM_ID);
      isStandardToken = true;
      console.log("✅ 这是标准 SPL Token 代币");
      console.log(`   程序ID: ${TOKEN_PROGRAM_ID.toBase58()}`);
    } catch (e2) {
      console.error("❌ 不是有效的Token账户:", e2.message);
      process.exit(1);
    }
  }
  console.log("");

  // 6. 检查代币状态
  console.log("🔍 检查代币状态...");
  console.log(`   小数位: ${mintInfo.decimals}`);
  console.log(`   供应量: ${mintInfo.supply.toString()}`);
  console.log(`   Mint 权限: ${mintInfo.mintAuthority?.toBase58() || "无（已撤销）"}`);
  console.log(`   冻结权限: ${mintInfo.freezeAuthority?.toBase58() || "无"}`);
  console.log("");

  // 7. 检查元数据
  console.log("🔍 检查元数据...");
  let hasMetadata = false;
  let metadata = null;
  
  if (isToken2022) {
    try {
      metadata = await getTokenMetadata(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
      if (metadata) {
        hasMetadata = true;
        console.log("✅ 找到 TokenMetadata 扩展");
        console.log(`   名称: ${metadata.name}`);
        console.log(`   符号: ${metadata.symbol}`);
        console.log(`   URI: ${metadata.uri}`);
      }
    } catch (e) {
      console.log("⚠️  未找到 TokenMetadata 扩展");
    }
  }
  console.log("");

  // 8. 诊断可能的问题
  console.log("============================================");
  console.log("🔍 诊断结果");
  console.log("============================================");
  console.log("");

  const issues = [];
  const warnings = [];
  const recommendations = [];

  // 问题 1: 供应量为 0
  if (mintInfo.supply.toString() === "0") {
    warnings.push("⚠️  代币供应量为 0");
    recommendations.push("💡 建议: 界面可能要求代币有供应量，需要先铸造一些代币");
  }

  // 问题 2: Token-2022 兼容性
  if (isToken2022) {
    warnings.push("⚠️  这是 Token-2022 代币");
    recommendations.push("💡 建议: 某些界面可能只支持标准 SPL Token，不支持 Token-2022");
    recommendations.push("💡 建议: 检查界面是否支持 Token-2022 代币");
  }

  // 问题 3: 网络不匹配
  if (NETWORK === "devnet") {
    warnings.push("⚠️  代币在 Devnet 上");
    recommendations.push("💡 建议: 界面可能要求 Mainnet 代币，检查网络设置");
  }

  // 问题 4: 元数据缺失
  if (!hasMetadata) {
    warnings.push("⚠️  未找到元数据");
    recommendations.push("💡 建议: 某些界面要求代币有元数据，需要设置元数据");
  }

  // 问题 5: Mint 权限已撤销
  if (!mintInfo.mintAuthority) {
    warnings.push("⚠️  Mint 权限已撤销");
    recommendations.push("💡 建议: 某些界面可能要求代币仍有 Mint 权限");
  }

  // 输出诊断结果
  if (issues.length > 0) {
    console.log("❌ 发现的问题:");
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log("");
  }

  if (warnings.length > 0) {
    console.log("⚠️  警告:");
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log("");
  }

  if (recommendations.length > 0) {
    console.log("💡 建议:");
    recommendations.forEach(rec => console.log(`   ${rec}`));
    console.log("");
  }

  // 9. 输出完整信息
  console.log("============================================");
  console.log("📋 完整代币信息");
  console.log("============================================");
  console.log("");
  console.log(`Mint 地址: ${mint.toBase58()}`);
  console.log(`网络: ${NETWORK}`);
  console.log(`类型: ${isToken2022 ? "Token-2022" : "SPL Token"}`);
  console.log(`小数位: ${mintInfo.decimals}`);
  console.log(`供应量: ${mintInfo.supply.toString()}`);
  console.log(`Mint 权限: ${mintInfo.mintAuthority?.toBase58() || "无"}`);
  console.log(`冻结权限: ${mintInfo.freezeAuthority?.toBase58() || "无"}`);
  if (hasMetadata && metadata) {
    console.log(`名称: ${metadata.name}`);
    console.log(`符号: ${metadata.symbol}`);
    console.log(`URI: ${metadata.uri}`);
  }
  console.log("");

  // 10. 可能的解决方案
  console.log("============================================");
  console.log("🔧 可能的解决方案");
  console.log("============================================");
  console.log("");
  console.log("1. 检查界面网络设置:");
  console.log("   确保界面连接到 Devnet（如果代币在 Devnet）");
  console.log("");
  console.log("2. 检查界面支持的代币类型:");
  console.log("   某些界面可能只支持标准 SPL Token，不支持 Token-2022");
  console.log("");
  console.log("3. 铸造代币（如果供应量为 0）:");
  console.log("   使用脚本铸造一些代币: npm run create:token2022");
  console.log("");
  console.log("4. 验证地址格式:");
  console.log("   确保地址没有多余的空格或换行符");
  console.log("   正确地址:", mint.toBase58());
  console.log("");

  // 11. 保存诊断报告
  const report = {
    mint: mint.toBase58(),
    network: NETWORK,
    type: isToken2022 ? "Token-2022" : "SPL Token",
    decimals: mintInfo.decimals,
    supply: mintInfo.supply.toString(),
    mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
    freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
    hasMetadata: hasMetadata,
    metadata: hasMetadata ? {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    } : null,
    issues: issues,
    warnings: warnings,
    recommendations: recommendations,
    diagnosedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    "token-address-diagnosis.json",
    JSON.stringify(report, null, 2)
  );
  console.log("💾 诊断报告已保存到: token-address-diagnosis.json");
  console.log("");
}

main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
