# KMT 自动化运营系统 - 部署指南

## 📋 部署前准备

### 1. 环境变量配置

在 `.env.local` 或 Cloudflare Pages 环境变量中添加：

```env
# KMT Token Mint 地址
KMT_TOKEN_MINT=你的KMT代币Mint地址

# Solana RPC 节点
SOLANA_MAINNET_RPC=https://api.mainnet-beta.solana.com
SOLANA_DEVNET_RPC=https://api.devnet.solana.com

# 分发者私钥（Base58 编码，仅用于服务端执行任务）
# ⚠️ 注意：生产环境建议使用 Cloudflare Workers Secrets 或密钥管理服务
KMT_DISTRIBUTOR_PRIVATE_KEY=你的私钥Base58编码

# Cloudflare 配置（如果使用）
CLOUDFLARE_ACCOUNT_ID=你的账户ID
CLOUDFLARE_API_TOKEN=你的API Token
```

### 2. 检查依赖

确保所有依赖已安装：

```bash
npm install
```

### 3. 构建测试

```bash
npm run build
```

如果构建成功，继续部署。

---

## 🚀 部署步骤

### 方法 1: Cloudflare Pages 部署（推荐）

#### 步骤 1: 登录 Cloudflare

```bash
npx wrangler login
```

#### 步骤 2: 配置环境变量

在 Cloudflare Dashboard 中设置环境变量：
1. 进入 Pages 项目设置
2. 选择 "Environment Variables"
3. 添加上述环境变量

或使用命令行：

```bash
# 设置生产环境变量
npx wrangler pages secret put KMT_TOKEN_MINT --project-name=kolmarket-ai
npx wrangler pages secret put SOLANA_MAINNET_RPC --project-name=kolmarket-ai
npx wrangler pages secret put KMT_DISTRIBUTOR_PRIVATE_KEY --project-name=kolmarket-ai
```

#### 步骤 3: 部署

```bash
# 构建并部署
npm run deploy

# 或部署到预览分支
npm run deploy:preview
```

#### 步骤 4: 验证部署

访问部署后的 URL，检查：
- ✅ API 路由是否正常：`/api/execution/kmt-automation`
- ✅ 前端组件是否正常加载
- ✅ 环境变量是否正确读取

---

### 方法 2: Vercel 部署

#### 步骤 1: 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 步骤 2: 登录并部署

```bash
vercel login
vercel --prod
```

#### 步骤 3: 配置环境变量

在 Vercel Dashboard 中：
1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所需环境变量

---

### 方法 3: Railway 部署

#### 步骤 1: 安装 Railway CLI

```bash
npm i -g @railway/cli
```

#### 步骤 2: 登录并初始化

```bash
railway login
railway init
```

#### 步骤 3: 配置环境变量

```bash
railway variables set KMT_TOKEN_MINT=你的Mint地址
railway variables set SOLANA_MAINNET_RPC=你的RPC地址
railway variables set KMT_DISTRIBUTOR_PRIVATE_KEY=你的私钥
```

#### 步骤 4: 部署

```bash
railway up
```

---

## 🔍 部署后验证

### 1. API 健康检查

```bash
# 测试获取任务列表
curl https://你的域名/api/execution/kmt-automation?network=devnet&tokenMint=你的Mint地址

# 预期响应
{
  "success": true,
  "tasks": []
}
```

### 2. 创建测试任务

```bash
curl -X POST https://你的域名/api/execution/kmt-automation \
  -H "Content-Type: application/json" \
  -d '{
    "network": "devnet",
    "tokenMint": "你的Mint地址",
    "task": {
      "id": "test-task-001",
      "name": "测试任务",
      "type": "manual",
      "distribution": {
        "recipients": [
          {
            "address": "测试地址",
            "amount": 100
          }
        ],
        "usePercentage": false
      },
      "enabled": true,
      "runCount": 0
    }
  }'
```

### 3. 前端界面检查

访问部署后的网站，检查：
- ✅ 页面正常加载
- ✅ `KMTAutomationPanel` 组件正常显示
- ✅ 可以输入 Token Mint 地址
- ✅ 可以创建和管理任务

---

## 🔒 安全配置

### 1. 私钥管理

**⚠️ 重要：生产环境私钥安全**

- ✅ 使用 Cloudflare Workers Secrets 或 Vercel Environment Variables
- ✅ 不要将私钥提交到代码仓库
- ✅ 使用不同的私钥用于 devnet 和 mainnet
- ✅ 定期轮换私钥

### 2. API 访问控制

建议添加身份验证：

```typescript
// 在 API 路由中添加
export async function POST(req: NextRequest) {
  // 检查 API Key
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // ... 原有逻辑
}
```

### 3. 速率限制

在 Cloudflare Pages 中启用速率限制：
- 在 Dashboard 中设置 WAF 规则
- 限制 API 调用频率

---

## 📊 监控和日志

### 1. 错误监控

建议集成错误监控服务：
- Sentry
- LogRocket
- Cloudflare Analytics

### 2. 日志记录

在代码中添加日志：

```typescript
console.log("[KMT Automation] Task executed:", {
  taskId,
  transactionHash,
  timestamp: new Date().toISOString(),
});
```

### 3. 性能监控

监控以下指标：
- API 响应时间
- 任务执行成功率
- 交易确认时间
- 错误率

---

## 🐛 故障排查

### 问题 1: 构建失败

**错误**: `Module not found` 或 `Cannot resolve module`

**解决**:
```bash
# 清理缓存并重新安装
rm -rf node_modules .next
npm install
npm run build
```

### 问题 2: API 返回 500 错误

**检查**:
1. 环境变量是否正确设置
2. RPC 节点是否可访问
3. 私钥格式是否正确

**调试**:
```bash
# 查看 Cloudflare Pages 日志
npx wrangler pages deployment tail

# 或查看 Vercel 日志
vercel logs
```

### 问题 3: 交易执行失败

**常见原因**:
- 账户余额不足
- 代币账户不存在
- 网络连接问题

**解决**:
1. 检查账户余额
2. 确保代币账户已创建
3. 检查网络连接和 RPC 节点状态

---

## 📝 部署清单

部署前检查：

- [ ] 代码已构建成功 (`npm run build`)
- [ ] 环境变量已配置
- [ ] 私钥已安全存储
- [ ] API 路由测试通过
- [ ] 前端组件正常显示
- [ ] 错误监控已配置
- [ ] 日志记录已启用
- [ ] 文档已更新

---

## 🎉 部署完成

部署成功后：

1. **测试功能**
   - 创建测试任务
   - 执行任务
   - 验证交易

2. **监控运行**
   - 检查日志
   - 监控错误
   - 跟踪性能

3. **文档更新**
   - 更新 API 文档
   - 记录已知问题
   - 更新使用指南

---

## 📞 支持

如遇问题，请查看：
- [KMT 自动化运营指南](./KMT_AUTOMATION_GUIDE.md)
- [实现总结](./KMT_AUTOMATION_SUMMARY.md)
- [项目文档](../README.md)

---

**最后更新**: 2024-01-21
