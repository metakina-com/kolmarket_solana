#!/usr/bin/env node
/**
 * 使用 Token-2022 创建代币并启用所有兼容的扩展
 * 
 * 使用方法:
 *   node scripts/create-token-2022-with-all-extensions.js
 * 
 * 环境变量:
 *   SOLANA_PRIVATE_KEY=[...] 或 SOLANA_DEVNET_PRIVATE_KEY=hex
 */

const { 
  Connection, 
  Keypair, 
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL 
} = require("@solana/web3.js");
const {
  createInitializeMint2Instruction,
  getMint,
  getMinimumBalanceForRentExemptMintWithExtensions,
  TOKEN_2022_PROGRAM_ID,
  createInitializeTransferFeeConfigInstruction,
  createInitializeDefaultAccountStateInstruction,
  createInitializeMintCloseAuthorityInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeInterestBearingMintInstruction,
  createInitializePermanentDelegateInstruction,
  ExtensionType,
  getMintLen,
  getTransferFeeConfig,
  getDefaultAccountState,
  getMintCloseAuthority,
  getMetadataPointer,
  getInterestBearingMintConfigState,
  getPermanentDelegate,
  AccountState,
} = require("@solana/spl-token");
const fs = require("fs/promises");

// 配置
const NETWORK = "devnet";
const RPC_URL = process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet");
const TOKEN_DECIMALS = 9;
const INITIAL_SUPPLY = 1_000_000_000; // 1 代币（考虑小数位）

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
  console.log("🚀 使用 Token-2022 创建代币（所有扩展）");
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
  if (solBalance < 1) {
    console.warn("⚠️  余额不足，建议至少 1 SOL");
  }
  console.log("");

  // 4. 定义要启用的扩展
  console.log("🔧 配置扩展...");
  const extensions = [
    ExtensionType.TransferFeeConfig,      // 转账手续费
    ExtensionType.MintCloseAuthority,     // Mint 关闭权限
    ExtensionType.DefaultAccountState,    // 默认账户状态
    ExtensionType.InterestBearingConfig, // 利息配置
    ExtensionType.PermanentDelegate,      // 永久委托人
    ExtensionType.MetadataPointer,        // 元数据指针
    // 注意：以下扩展互不兼容或需要特殊处理
    // ExtensionType.NonTransferable,    // 不可转让（与 TransferFeeConfig 冲突）
    // ExtensionType.TransferHook,       // 转账钩子（需要自定义程序）
    // ExtensionType.TokenMetadata,      // 链上元数据（与 MetadataPointer 二选一）
  ];

  console.log("   启用的扩展:");
  extensions.forEach(ext => {
    console.log(`   - ${ExtensionType[ext] || ext}`);
  });
  console.log("");

  // 5. 计算 Mint 账户大小
  console.log("📏 计算账户大小...");
  const mintLen = getMintLen(extensions);
  let mintRent;
  try {
    mintRent = await getMinimumBalanceForRentExemptMintWithExtensions(connection, extensions);
  } catch (e) {
    mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
  }
  console.log(`   Mint 账户大小: ${mintLen} bytes`);
  console.log(`   所需租金: ${mintRent / LAMPORTS_PER_SOL} SOL`);
  console.log("");

  // 6. 创建 Mint 密钥对
  console.log("🔑 生成 Mint 密钥对...");
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  console.log(`   Mint 地址: ${mint.toBase58()}`);
  console.log("");

  // 7. 创建交易并添加指令
  console.log("📝 构建交易...");
  const transaction = new Transaction();

  // 7.1 创建账户
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: payerPubkey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintRent,
      programId: TOKEN_2022_PROGRAM_ID,
    })
  );

  // 7.2 先添加扩展指令（须在 InitializeMint 之前）
  console.log("   添加扩展指令...");

  // TransferFeeConfig - 转账手续费（1% 手续费，50% 给指定地址）
  try {
    const transferFeeConfigAuthority = payerPubkey;
    const withdrawWithheldAuthority = payerPubkey;
    transaction.add(
      createInitializeTransferFeeConfigInstruction(
        mint,
        transferFeeConfigAuthority,
        withdrawWithheldAuthority,
        100, // 手续费率（基点，100 = 1%）
        BigInt(1_000_000), // 最大手续费（lamports，0.001 SOL）
        TOKEN_2022_PROGRAM_ID
      )
    );
    console.log("   ✅ TransferFeeConfig");
  } catch (e) {
    console.log("   ⚠️  TransferFeeConfig 跳过:", e.message);
  }

  // MintCloseAuthority - Mint 关闭权限
  try {
    transaction.add(
      createInitializeMintCloseAuthorityInstruction(
        mint,
        payerPubkey, // close authority
        TOKEN_2022_PROGRAM_ID
      )
    );
    console.log("   ✅ MintCloseAuthority");
  } catch (e) {
    console.log("   ⚠️  MintCloseAuthority 跳过:", e.message);
  }

  // DefaultAccountState - 默认账户状态（Initialized = 正常）
  try {
    transaction.add(
      createInitializeDefaultAccountStateInstruction(
        mint,
        AccountState.Initialized, // 新账户默认已初始化
        TOKEN_2022_PROGRAM_ID
      )
    );
    console.log("   ✅ DefaultAccountState (Initialized)");
  } catch (e) {
    console.log("   ⚠️  DefaultAccountState 跳过:", e.message);
  }

  // InterestBearingConfig - 利息配置（年化 5%）
  try {
    transaction.add(
      createInitializeInterestBearingMintInstruction(
        mint,
        payerPubkey, // rate authority
        500, // 年化利率（基点，500 = 5%）
        TOKEN_2022_PROGRAM_ID
      )
    );
    console.log("   ✅ InterestBearingConfig (5% APY)");
  } catch (e) {
    console.log("   ⚠️  InterestBearingConfig 跳过:", e.message);
  }

  // PermanentDelegate - 永久委托人
  try {
    transaction.add(
      createInitializePermanentDelegateInstruction(
        mint,
        payerPubkey, // permanent delegate
        TOKEN_2022_PROGRAM_ID
      )
    );
    console.log("   ✅ PermanentDelegate");
  } catch (e) {
    console.log("   ⚠️  PermanentDelegate 跳过:", e.message);
  }

  // MetadataPointer - 元数据指针（指向元数据账户）
  try {
    transaction.add(
      createInitializeMetadataPointerInstruction(
        mint,
        payerPubkey, // metadata authority
        null, // 元数据账户（稍后设置）
        TOKEN_2022_PROGRAM_ID
      )
    );
    console.log("   ✅ MetadataPointer");
  } catch (e) {
    console.log("   ⚠️  MetadataPointer 跳过:", e.message);
  }

  // 7.3 最后初始化 Mint（Extension 须在 Mint 之前）
  console.log("   添加 InitializeMint2...");
  transaction.add(
    createInitializeMint2Instruction(
      mint,
      TOKEN_DECIMALS,
      payerPubkey, // mint authority
      payerPubkey, // freeze authority
      TOKEN_2022_PROGRAM_ID
    )
  );
  console.log("   ✅ InitializeMint2");
  console.log("");

  // 8. 发送交易
  console.log("📤 发送交易...");
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, mintKeypair],
      { commitment: "confirmed" }
    );
    console.log(`✅ Mint 创建成功!`);
    console.log(`   交易签名: ${signature}`);
    console.log("");

    // 9. 验证 Mint
    console.log("🔍 验证 Mint 信息...");
    const mintInfo = await getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID);
    console.log(`   供应量: ${Number(mintInfo.supply) / Math.pow(10, TOKEN_DECIMALS)}`);
    console.log(`   小数位数: ${mintInfo.decimals}`);
    console.log(`   Mint 权限: ${mintInfo.mintAuthority?.toBase58() || "无"}`);
    console.log("");

    // 验证扩展
    console.log("🔍 验证扩展...");
    try {
      const transferFee = getTransferFeeConfig(mintInfo);
      if (transferFee) {
        console.log(`   ✅ TransferFeeConfig: ${transferFee.transferFeeConfigAuthority?.toBase58()}`);
      }
    } catch (e) {}

    try {
      const closeAuth = getMintCloseAuthority(mintInfo);
      if (closeAuth) {
        console.log(`   ✅ MintCloseAuthority: ${closeAuth.closeAuthority?.toBase58()}`);
      }
    } catch (e) {}

    try {
      const defaultState = getDefaultAccountState(mintInfo);
      if (defaultState) {
        console.log(`   ✅ DefaultAccountState`);
      }
    } catch (e) {}

    try {
      const interest = getInterestBearingMintConfigState(mintInfo);
      if (interest) {
        console.log(`   ✅ InterestBearingConfig: ${interest.rate / 100}% APY`);
      }
    } catch (e) {}

    try {
      const permDelegate = getPermanentDelegate(mintInfo);
      if (permDelegate) {
        console.log(`   ✅ PermanentDelegate: ${permDelegate.delegate?.toBase58()}`);
      }
    } catch (e) {}

    try {
      const metadataPtr = getMetadataPointer(mintInfo);
      if (metadataPtr) {
        console.log(`   ✅ MetadataPointer: ${metadataPtr.metadataAddress?.toBase58() || "未设置"}`);
      }
    } catch (e) {}

    console.log("");

    // 10. 保存信息
    const tokenInfo = {
      network: NETWORK,
      program: "Token-2022",
      mint: mint.toBase58(),
      decimals: TOKEN_DECIMALS,
      extensions: extensions.map(e => ExtensionType[e] || e),
      transaction: signature,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      "token-2022-with-extensions.json",
      JSON.stringify(tokenInfo, null, 2)
    );
    console.log("💾 代币信息已保存到: token-2022-with-extensions.json");
    console.log("");

    // 11. 输出总结
    console.log("============================================");
    console.log("✅ 代币创建完成!");
    console.log("============================================");
    console.log("");
    console.log("📋 代币信息:");
    console.log(`   Mint 地址: ${mint.toBase58()}`);
    console.log(`   程序: Token-2022`);
    console.log(`   扩展数量: ${extensions.length}`);
    console.log("");
    console.log("🔗 查看代币:");
    console.log(`   Solana Explorer: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
    console.log(`   交易详情: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("");
    console.log("💡 提示:");
    console.log("   1. 这是 Token-2022 代币，支持所有启用的扩展");
    console.log("   2. 某些扩展（如 TransferFeeConfig）会在转账时生效");
    console.log("   3. 可以使用 @solana/spl-token 的扩展函数管理这些功能");
    console.log("");

  } catch (error) {
    console.error("❌ 创建失败:", error);
    if (error instanceof Error) {
      console.error("   错误信息:", error.message);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ 未处理的错误:", error);
  process.exit(1);
});
