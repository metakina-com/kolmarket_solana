#!/usr/bin/env node
/**
 * 将 KMT 元数据 JSON 上传到 Cloudflare R2
 * 
 * 使用方法:
 *   node scripts/upload-metadata-to-r2.js
 * 
 * 需要设置环境变量:
 *   CLOUDFLARE_ACCOUNT_ID=your_account_id
 *   CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
 *   R2_BUCKET_NAME=kolmarket-uploads (可选，默认使用)
 */

const fs = require("fs/promises");
const path = require("path");

// 配置
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "kolmarket-uploads";
const METADATA_FILE = path.join(process.cwd(), "kmt-metadata.json");
const R2_FOLDER = "token-metadata";
const R2_FIXED_KEY = "token-metadata/kmt-metadata.json"; // 固定路径，便于稳定 TOKEN_URI
const USE_FIXED_PATH = process.env.USE_FIXED_PATH !== "0";

/**
 * 使用 Wrangler 上传文件到 R2
 */
async function uploadToR2ViaWrangler(filePath, r2Path) {
  try {
    const { execSync } = require("child_process");
    
    // 使用 wrangler r2 object put 命令上传
    const command = `npx wrangler r2 object put ${R2_BUCKET_NAME}/${r2Path} --file="${filePath}" --content-type="application/json"`;
    
    console.log(`📤 上传到 R2: ${r2Path}`);
    execSync(command, { stdio: "inherit" });
    
    return true;
  } catch (error) {
    console.error("❌ Wrangler 上传失败:", error);
    return false;
  }
}

/**
 * 使用 S3 兼容 API 上传文件到 R2
 */
async function uploadToR2ViaS3(filePath, r2Path) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error("❌ 错误: 未找到 R2 凭证环境变量");
      console.log("");
      console.log("请设置环境变量:");
      console.log("  export CLOUDFLARE_ACCOUNT_ID=your_account_id");
      console.log("  export CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id");
      console.log("  export CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key");
      return false;
    }

    // 使用 AWS SDK v3 (S3 兼容)
    const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
    
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const fileContent = await fs.readFile(filePath);
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Path,
      Body: fileContent,
      ContentType: "application/json",
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("❌ S3 API 上传失败:", error);
    return false;
  }
}

async function main() {
  console.log("============================================");
  console.log("☁️  将 KMT 元数据上传到 Cloudflare R2");
  console.log("============================================");
  console.log("");

  // 1. 检查元数据文件
  console.log("📄 检查元数据文件...");
  try {
    await fs.access(METADATA_FILE);
    console.log(`✅ 找到元数据文件: ${METADATA_FILE}`);
  } catch (error) {
    console.error(`❌ 错误: 未找到元数据文件 ${METADATA_FILE}`);
    console.log("");
    console.log("请确保 kmt-metadata.json 文件存在");
    process.exit(1);
  }
  console.log("");

  // 2. 读取元数据文件
  console.log("📖 读取元数据文件...");
  let metadata;
  try {
    const content = await fs.readFile(METADATA_FILE, "utf-8");
    metadata = JSON.parse(content);
    console.log(`✅ 元数据文件读取成功`);
    console.log(`   名称: ${metadata.name}`);
    console.log(`   符号: ${metadata.symbol}`);
    console.log(`   图片: ${metadata.image}`);
  } catch (error) {
    console.error("❌ 读取元数据文件失败:", error);
    process.exit(1);
  }
  console.log("");

  // 3. 生成 R2 路径（默认固定路径，链上 TOKEN_URI 稳定）
  const r2Path = USE_FIXED_PATH ? R2_FIXED_KEY : `${R2_FOLDER}/kmt-metadata-${Date.now()}.json`;
  
  console.log("📂 R2 路径信息:");
  console.log(`   存储桶: ${R2_BUCKET_NAME}`);
  console.log(`   路径: ${r2Path}`);
  if (USE_FIXED_PATH) {
    console.log("   (固定路径，适合链上 TOKEN_URI)");
  }
  console.log("");

  // 4. 选择上传方法
  console.log("🔧 选择上传方法...");
  
  // 方法 1: 使用 Wrangler (推荐，最简单)
  console.log("方法 1: 使用 Wrangler CLI (推荐)");
  console.log("");
  
  const wranglerSuccess = await uploadToR2ViaWrangler(METADATA_FILE, r2Path);
  
  if (wranglerSuccess) {
    console.log("");
    console.log("✅ 元数据已成功上传到 R2!");
    console.log("");
    
    // 5. 生成访问 URL
    console.log("🔗 访问 URL:");
    
    // 生成完整 TOKEN_URI（链上必须用绝对 URL）
    const customDomain = process.env.R2_CUSTOM_DOMAIN;
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    let fullTokenUri;
    if (customDomain) {
      fullTokenUri = `https://${customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")}/${r2Path}`;
      console.log(`   自定义域名: ${fullTokenUri}`);
    } else if (appUrl) {
      const base = appUrl.replace(/\/$/, "");
      fullTokenUri = `${base}/api/storage/${r2Path}`;
      console.log(`   API 路由: ${fullTokenUri}`);
    } else {
      fullTokenUri = `https://oss.kolmarket.ai/${r2Path}`;
      console.log(`   推荐 (R2 域名): ${fullTokenUri}`);
      console.log("   (未设置 R2_CUSTOM_DOMAIN/APP_URL 时使用默认)");
    }
    console.log("");

    // 6. 保存上传信息
    const uploadInfo = {
      bucket: R2_BUCKET_NAME,
      path: r2Path,
      url: fullTokenUri,
      urlRelative: `/api/storage/${r2Path}`,
      metadata: {
        name: metadata.name,
        symbol: metadata.symbol,
        image: metadata.image,
      },
      uploadedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      "kmt-metadata-r2-upload.json",
      JSON.stringify(uploadInfo, null, 2)
    );
    console.log("💾 上传信息已保存到: kmt-metadata-r2-upload.json");
    console.log("");

    // 7. 输出下一步
    console.log("============================================");
    console.log("✅ 上传完成!");
    console.log("============================================");
    console.log("");
    console.log("📋 下一步:");
    console.log("   1. 设置 TOKEN_URI（链上需用完整 URL）:");
    console.log(`      export TOKEN_URI="${uploadInfo.url}"`);
    console.log("");
    console.log("   2. 提交元数据到链上:");
    console.log("      export TOKEN_MINT=your_mint_address");
    console.log("      export SOLANA_DEVNET_PRIVATE_KEY=your_key_hex");
    console.log("      npm run upload:metadata");
    console.log("");

    return;
  }

  // 方法 2: 使用 S3 API
  console.log("");
  console.log("方法 2: 使用 S3 兼容 API");
  console.log("");
  
  const s3Success = await uploadToR2ViaS3(METADATA_FILE, r2Path);
  
  if (s3Success) {
    console.log("");
    console.log("✅ 元数据已成功上传到 R2!");
    console.log("");
    console.log("🔗 访问 URL:");
    console.log(`   需要通过 API 访问: /api/storage/${r2Path}`);
    console.log("");
  } else {
    console.error("❌ 所有上传方法都失败了");
    console.log("");
    console.log("请检查:");
    console.log("   1. Wrangler 是否已安装和配置");
    console.log("   2. R2 凭证是否正确");
    console.log("   3. R2 Bucket 是否存在");
    process.exit(1);
  }
}

// 运行主函数
main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
