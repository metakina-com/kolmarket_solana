# 🌐 配置 kolmarket.ai 域名指南

## 📋 当前状态

- ✅ **kolmarket-ai** 项目已创建
- ✅ 默认 URL: https://kolmarket-ai-eak.pages.dev/
- ⚠️ **kolmarket.ai** 当前绑定到 **socialbet** 项目

---

## 🎯 配置步骤

### 方式 1: 通过 Cloudflare Dashboard（推荐）

#### 步骤 1: 从 socialbet 项目移除域名（如果需要）

1. 访问: https://dash.cloudflare.com/
2. 进入: **Workers & Pages** → **socialbet**
3. 进入: **Custom domains**
4. 如果 kolmarket.ai 绑定在此项目，先移除它

#### 步骤 2: 为 kolmarket-ai 项目添加域名

1. 访问: https://dash.cloudflare.com/
2. 进入: **Workers & Pages** → **kolmarket-ai**
3. 进入: **Custom domains** → **Set up a custom domain**
4. 输入域名: `kolmarket.ai`
5. 按照提示配置 DNS 记录

#### 步骤 3: 配置 DNS 记录

如果域名在 Cloudflare 管理：

- **自动配置**: Cloudflare 会自动配置 DNS 记录
- **CNAME**: `kolmarket.ai` → `kolmarket-ai-eak.pages.dev`

如果域名不在 Cloudflare 管理：

- 在您的 DNS 提供商处添加 CNAME 记录：
  ```
  类型: CNAME
  名称: @ (或 kolmarket)
  值: kolmarket-ai-eak.pages.dev
  TTL: Auto (或 3600)
  ```

#### 步骤 4: 等待 DNS 传播

- DNS 传播通常需要几分钟到几小时
- 可以通过以下命令检查：
  ```bash
  dig kolmarket.ai CNAME
  # 或
  nslookup kolmarket.ai
  ```

---

### 方式 2: 使用 CLI（如果支持）

```bash
# 注意：Pages 域名管理主要通过 Dashboard
# CLI 可能不支持直接添加域名

# 检查项目信息
npx wrangler pages project list
```

---

## ⚠️ 重要提示

### 1. 域名冲突

如果 `kolmarket.ai` 已经绑定到其他项目（如 socialbet），需要：

- **选项 A**: 先从旧项目移除，再添加到新项目
- **选项 B**: 使用子域名，如 `app.kolmarket.ai` 或 `www.kolmarket.ai`

### 2. SSL 证书

- Cloudflare 会自动为自定义域名配置 SSL 证书
- 证书配置可能需要几分钟

### 3. DNS 配置

- 确保域名在 Cloudflare 中管理，或正确配置 CNAME 记录
- 如果使用 Cloudflare DNS，配置会自动完成

---

## ✅ 验证配置

### 1. 检查域名绑定

在 Dashboard 中：
- **Workers & Pages** → **kolmarket-ai** → **Custom domains**
- 应该看到 `kolmarket.ai` 已添加

### 2. 测试访问

```bash
# 测试域名是否生效
curl -I https://kolmarket.ai

# 应该返回 200 状态码
```

### 3. 检查 DNS

```bash
# 检查 CNAME 记录
dig kolmarket.ai CNAME +short
# 应该返回: kolmarket-ai-eak.pages.dev
```

---

## 🔄 如果域名已在其他项目使用

### 方案 1: 转移域名

1. 从 **socialbet** 项目移除 `kolmarket.ai`
2. 添加到 **kolmarket-ai** 项目

### 方案 2: 使用子域名

如果不想移动主域名，可以使用：
- `app.kolmarket.ai` → kolmarket-ai 项目
- `kolmarket.ai` → 保持绑定到 socialbet 项目

---

## 📚 相关文档

- [Cloudflare Pages 自定义域名文档](https://developers.cloudflare.com/pages/platform/custom-domains/)
- [DNS 配置指南](https://developers.cloudflare.com/dns/)

---

**配置完成后，kolmarket.ai 将指向 kolmarket-ai 项目！** 🎉
