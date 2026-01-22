# 🔒 安全注意事项

## ⚠️ 重要：私钥和敏感信息

**永远不要将包含真实私钥的文件提交到 Git 仓库！**

## ✅ 已采取的安全措施

### 1. Git 忽略配置

以下文件已被添加到 `.gitignore`，不会被提交到 Git：

- `.env.local` - 本地开发环境变量（包含真实私钥）
- `.env.container` - 容器部署环境变量（包含真实私钥）
- `.env` - 所有 .env 文件

### 2. 文件状态

- ✅ `.env.local` - 仅本地使用，已忽略
- ✅ `.env.container` - 已从 Git 跟踪中移除，已忽略
- ✅ 文档中的示例已更新为占位符

### 3. 环境变量管理

使用 `lib/utils/env-config.ts` 工具来管理环境变量：

```typescript
import { loadEnvConfig, validateEnvConfig } from '@/lib/utils/env-config';

// 加载配置
const config = loadEnvConfig();

// 验证配置
const validation = validateEnvConfig(config);
```

## 📋 部署时的环境变量设置

### Railway 部署

在 Railway Dashboard 中设置环境变量：
1. 进入项目 → 选择服务
2. 点击 **Variables** 标签
3. 添加所有需要的环境变量
4. **不要**在代码中硬编码私钥

### Cloudflare Workers/Pages

使用 Wrangler CLI 设置 secrets：

```bash
npx wrangler secret put SOLANA_PRIVATE_KEY
npx wrangler secret put DISCORD_BOT_TOKEN
# ... 其他 secrets
```

## 🔍 检查清单

在提交代码前，请确认：

- [ ] `.env.local` 不在 Git 跟踪中
- [ ] `.env.container` 不在 Git 跟踪中
- [ ] 代码中没有硬编码的私钥
- [ ] 文档中的示例使用占位符（如 `your_private_key_here`）
- [ ] 所有敏感信息都通过环境变量传递

## 🚨 如果私钥已泄露

如果发现私钥已被提交到 Git：

1. **立即轮换私钥**（生成新的密钥对）
2. 从 Git 历史中移除敏感信息：
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.container" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. 强制推送（谨慎操作）：
   ```bash
   git push origin --force --all
   ```

## 📚 相关文档

- [环境变量配置指南](./ENV_CONFIG_GUIDE.md)
- [部署指南](../DEPLOY_QUICK_START.md)
