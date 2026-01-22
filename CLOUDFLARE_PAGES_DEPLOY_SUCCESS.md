# ✅ Cloudflare Pages 部署成功指南

本文档说明如何**在 Cloudflare Pages 上成功完成构建与部署**，以及已修复的构建失败问题。

---

## 🔧 已修复：构建失败原因与修复

### 报错信息

```
ERROR: Failed to produce a Cloudflare Pages build from the project.
The following routes were not configured to run with the Edge Runtime:
  - /api/storage/[path]
  - /api/storage/upload

Please make sure that all your non-static routes export the following edge runtime route segment config:
  export const runtime = 'edge';
```

### 原因

使用 **Wrangler 配置文件 (BETA)** 时，Cloudflare 通过 `@cloudflare/next-on-pages` 构建 Next.js。该适配器要求**所有**非静态 API 路由声明 `export const runtime = 'edge'`。  
此前 `/api/storage/[path]` 与 `/api/storage/upload` 未声明，导致构建失败。

### 修复内容

在以下两个文件中添加了 `export const runtime = 'edge';`：

| 文件 | 修改 |
|------|------|
| `app/api/storage/[path]/route.ts` | 新增 `export const runtime = 'edge';` |
| `app/api/storage/upload/route.ts` | 新增 `export const runtime = 'edge';` |

**验证**：本地执行 `npm run build` 与 `npx @cloudflare/next-on-pages@1` 均通过，且 Build Summary 中已包含上述两个 Edge 路由。

---

## 📋 Cloudflare Pages 构建配置（正确用法）

项目使用 **wrangler.toml** 驱动构建时，Cloudflare 会读取其中的配置，**无需**在 Dashboard 里改构建命令与输出目录。

### wrangler.toml 相关配置

```toml
name = "kolmarket-ai"
pages_build_output_dir = ".vercel/output/static"
# D1、R2、AI、Vectorize 等绑定见 wrangler.toml 全文
```

### 构建流程

1. **安装依赖**：`npm clean-install --progress=false`
2. **构建命令**：`npx @cloudflare/next-on-pages@1`  
   - 内部会执行 `vercel build`（即 Next.js 构建），并生成 Edge 兼容输出到 `.vercel/output/static`
3. **输出目录**：`.vercel/output/static`（由 `pages_build_output_dir` 指定）

### 若在 Dashboard 手动配置

若**未**启用 “Wrangler 配置文件” 而使用经典 Pages 构建设置，则需：

| 配置项 | 值 |
|--------|-----|
| **Framework preset** | Next.js（或 None） |
| **Build command** | `npx @cloudflare/next-on-pages@1` |
| **Build output directory** | `.vercel/output/static` |
| **Root directory** | `/`（项目根目录） |

**注意**：使用 `npm run build`（即 `next build`）且输出 `.next` 时，**无法**得到 next-on-pages 所需的 Edge 输出，会导致 Pages 部署异常。必须使用 `npx @cloudflare/next-on-pages@1` 且输出 `.vercel/output/static`。

---

## ✅ 部署前检查清单

- [ ] 所有 API 路由均包含 `export const runtime = 'edge';`（当前已满足）
- [ ] `wrangler.toml` 中 `pages_build_output_dir = ".vercel/output/static"`
- [ ] 使用 Git 连接时，Cloudflare 能读取到 `wrangler.toml`（项目根目录）
- [ ] 如需 D1 / R2 / AI / Vectorize，在 Pages 项目 **Settings → Functions** 中配置对应绑定（与 wrangler.toml 中的 binding 名称一致）
- [ ] 环境变量 / Secrets 在 **Settings → Environment variables** 中配置（如 `ELIZAOS_CONTAINER_URL`、`SOLANA_*` 等）

---

## 🚀 部署方式

### 方式一：Git 连接（推荐）

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选择仓库 `metakina-com/kolmarket_solana`，授权
3. 若使用 **Wrangler 配置文件 (BETA)**：构建命令与输出目录由 `wrangler.toml` 决定，通常无需修改
4. 配置环境变量与绑定后，推送代码即可触发自动构建与部署

### 方式二：本地手动部署

```bash
npm run deploy
# 或
npx @cloudflare/next-on-pages@1 && npx wrangler pages deploy .vercel/output/static --project-name=kolmarket-ai
```

---

## 📚 相关文档

- [Cloudflare Pages 配置指南](./CLOUDFLARE_PAGES_CONFIG.md)（含 Dashboard 与环境变量说明）
- [Wrangler 配置](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- 项目 `wrangler.toml`：D1、R2、Workers AI、Vectorize 等绑定与说明

---

**总结**：为 `/api/storage/[path]` 与 `/api/storage/upload` 添加 `runtime = 'edge'` 后，Cloudflare Pages 构建可顺利完成。确保使用 `npx @cloudflare/next-on-pages@1` 且输出目录为 `.vercel/output/static`。
