#!/usr/bin/env node

const { Connection, clusterApiUrl } = require("@solana/web3.js");

async function testConnection() {
  console.log("============================================");
  console.log("🔗 测试 Solana RPC 连接");
  console.log("============================================");
  console.log("");

  const rpcEndpoints = [
    "https://api.devnet.solana.com",
    "https://rpc.ankr.com/solana_devnet", 
    "https://solana-devnet.rpc.extrnode.com",
    "https://devnet.solana.com",
    "https://api.devnet.solana.com?commitment=confirmed"
  ];

  for (const rpc of rpcEndpoints) {
    console.log(`📡 测试: ${rpc}`);
    try {
      const connection = new Connection(rpc, "confirmed");
      const startTime = Date.now();
      const blockhash = await connection.getLatestBlockhash();
      const endTime = Date.now();
      
      console.log(`   ✅ 连接成功 (${endTime - startTime}ms)`);
      console.log(`   📦 区块哈希: ${blockhash.blockhash.substring(0, 16)}...`);
      console.log("");
      return rpc; // 返回第一个可用的 RPC
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      console.log("");
    }
  }

  console.log("❌ 所有 RPC 端点都无法连接");
  console.log("");
  console.log("🔧 可能的解决方案:");
  console.log("   1. 检查网络连接");
  console.log("   2. 使用 VPN");
  console.log("   3. 配置代理设置");
  console.log("   4. 使用付费 RPC 服务");
  console.log("");

  return null;
}

testConnection().then(rpc => {
  if (rpc) {
    console.log(`✅ 推荐使用 RPC: ${rpc}`);
    console.log("");
    console.log("📝 更新环境变量:");
    console.log(`   SOLANA_DEVNET_RPC=${rpc}`);
  }
}).catch(console.error);
