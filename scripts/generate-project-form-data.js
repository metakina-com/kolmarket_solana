#!/usr/bin/env node
/**
 * 生成项目创建表单数据
 * 
 * 使用方法:
 *   node scripts/generate-project-form-data.js
 * 
 * 生成用于代币销售/项目创建界面的完整表单数据
 */

const fs = require("fs/promises");
const path = require("path");

// 从现有元数据读取信息
async function main() {
  console.log("============================================");
  console.log("📝 生成项目创建表单数据");
  console.log("============================================");
  console.log("");

  // 1. 读取现有元数据
  let kmtMetadata = {};
  try {
    const metadataContent = await fs.readFile("kmt-metadata.json", "utf-8");
    kmtMetadata = JSON.parse(metadataContent);
    console.log("✅ 已读取 kmt-metadata.json");
  } catch (error) {
    console.error("❌ 无法读取 kmt-metadata.json:", error.message);
    process.exit(1);
  }

  // 2. 读取代币信息（优先使用标准 SPL Token）
  let tokenInfo = {};
  try {
    // 优先尝试读取标准 SPL Token 信息
    const splTokenContent = await fs.readFile("spl-token-with-supply.json", "utf-8");
    const splTokenData = JSON.parse(splTokenContent);
    tokenInfo = {
      mint: splTokenData.mint,
      name: splTokenData.name,
      symbol: splTokenData.symbol,
      network: splTokenData.network,
      program: splTokenData.program,
    };
    console.log("✅ 已读取 spl-token-with-supply.json (标准 SPL Token)");
  } catch (error) {
    try {
      // 回退到 Token-2022 信息
      const tokenContent = await fs.readFile("project-token-info.json", "utf-8");
      tokenInfo = JSON.parse(tokenContent);
      console.log("✅ 已读取 project-token-info.json (Token-2022)");
    } catch (e) {
      console.warn("⚠️  无法读取代币信息文件，使用默认值");
      tokenInfo = {
        mint: "bkkV9DEJmAof1HvGXBPahCzxY9vazjSZSGaNnZVpANS",
        name: "KOLMARKET TOKEN",
        symbol: "KMT",
        network: "devnet",
        program: "SPL Token",
      };
    }
  }
  console.log("");

  // 3. 生成简短描述（240字符以内）
  const fullDescription = kmtMetadata.description || "";
  const shortDescription = fullDescription
    .split("\n")
    .filter(line => line.trim().length > 0)
    .slice(0, 3)
    .join(" ")
    .substring(0, 240);

  // 如果描述太长，创建一个更短的版本
  let finalShortDescription = shortDescription;
  if (shortDescription.length > 240) {
    finalShortDescription = "$KMT: Redefining the Order of Web3 Influence. Empowering KOLs to monetize their influence directly and helping brands precision-target top-tier crypto leaders globally. Join us and witness the tokenization of influence!";
  }

  // 4. 准备表单数据
  const formData = {
    // Step 1: Creation & Branding
    creationAndBranding: {
      // Round Type
      roundType: "Seed",
      
      // Short Description (240字符以内)
      shortDescription: finalShortDescription,
      shortDescriptionLength: finalShortDescription.length,
      shortDescriptionMaxLength: 240,
      
      // Sale Banner
      saleBanner: {
        url: "", // 需要用户提供或上传
        recommendedSize: "1600x900",
        supportedFormats: ["jpg", "png", "webp"],
        maxSize: "2MB",
        note: "Images will be optimized to under 2mb"
      },
      
      // Project Token Logo
      projectTokenLogo: {
        url: kmtMetadata.image || "https://oss.kolmarket.ai/etPJjFNh_400x400.jpg",
        recommendedSize: "400x400",
        supportedFormats: ["jpg", "png", "webp"]
      },
      
      // Project Token Address
      projectToken: {
        mint: tokenInfo.mint || "DjyuBJmt7uAS2RuQDJimNjjvjVqQkKYVukDa4m2Svyco",
        name: tokenInfo.name || kmtMetadata.name || "KOLMARKET TOKEN",
        symbol: tokenInfo.symbol || kmtMetadata.symbol || "KMT",
        network: tokenInfo.network || "devnet",
        program: tokenInfo.program || "Token-2022"
      }
    },
    
    // 完整元数据引用
    metadata: {
      name: kmtMetadata.name,
      symbol: kmtMetadata.symbol,
      description: kmtMetadata.description,
      image: kmtMetadata.image,
      external_url: kmtMetadata.external_url,
      uri: tokenInfo.uri || "https://oss.kolmarket.ai/kmt-metadata.json"
    },
    
    // 生成时间
    generatedAt: new Date().toISOString()
  };

  // 5. 保存表单数据
  const outputPath = "project-form-data.json";
  await fs.writeFile(
    outputPath,
    JSON.stringify(formData, null, 2)
  );

  console.log("✅ 表单数据已生成!");
  console.log("");

  // 6. 输出摘要
  console.log("============================================");
  console.log("📋 表单数据摘要");
  console.log("============================================");
  console.log("");
  console.log("1. Round Type:");
  console.log(`   ✅ ${formData.creationAndBranding.roundType}`);
  console.log("");
  console.log("2. Short Description:");
  console.log(`   ${formData.creationAndBranding.shortDescription}`);
  console.log(`   字符数: ${formData.creationAndBranding.shortDescriptionLength}/240`);
  console.log("");
  console.log("3. Project Token Logo:");
  console.log(`   ✅ ${formData.creationAndBranding.projectTokenLogo.url}`);
  console.log(`   推荐尺寸: ${formData.creationAndBranding.projectTokenLogo.recommendedSize}`);
  console.log("");
  console.log("4. Project Token Address:");
  console.log(`   ✅ ${formData.creationAndBranding.projectToken.mint}`);
  console.log(`   名称: ${formData.creationAndBranding.projectToken.name}`);
  console.log(`   符号: ${formData.creationAndBranding.projectToken.symbol}`);
  console.log("");
  console.log("5. Sale Banner:");
  console.log(`   ⚠️  需要提供横幅图片 URL`);
  console.log(`   推荐尺寸: ${formData.creationAndBranding.saleBanner.recommendedSize}`);
  console.log("");

  // 7. 输出用于复制粘贴的格式
  console.log("============================================");
  console.log("📋 用于界面填写的值");
  console.log("============================================");
  console.log("");
  console.log("【Round Type】");
  console.log("Seed");
  console.log("");
  console.log("【Short Description】");
  console.log(formData.creationAndBranding.shortDescription);
  console.log("");
  console.log("【Project Token Logo】");
  console.log(formData.creationAndBranding.projectTokenLogo.url);
  console.log("");
  console.log("【Project Token】");
  console.log(formData.creationAndBranding.projectToken.mint);
  console.log("");
  console.log("【Sale Banner】");
  console.log("(需要提供 1600x900 的横幅图片 URL)");
  console.log("");

  console.log(`💾 完整数据已保存到: ${outputPath}`);
  console.log("");
}

main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
