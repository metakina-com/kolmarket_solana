# ✅ Cloudflare 可以部署 Docker 容器

## 📋 确认信息

**是的，Cloudflare 支持部署 Docker 容器！**

- ✅ **Cloudflare Containers** 在 2025 年 6 月进入公开 Beta
- ✅ 支持部署标准的 Docker 容器镜像
- ✅ 全局部署到 330+ 边缘节点
- ✅ 按需付费（Scale-to-Zero）

---

## 🚀 部署方式

### 方式 1: 使用 wrangler deploy（推荐）

根据 Cloudflare 官方文档，**正确的部署方式是使用 `wrangler deploy`**，而不是 `wrangler containers deploy`。

#### 步骤 1: 配置 wrangler.toml

在 `wrangler.toml` 中配置容器：

```toml
[[containers]]
class_name = "ElizaOSContainer"
image = "./elizaos-container/Dockerfile"  # 或使用镜像: "dappweb/elizaos-server:latest"
```

#### 步骤 2: 部署

```bash
# 使用 Dockerfile 路径（自动构建和推送）
npx wrangler deploy

# 或使用已构建的镜像
# 先推送镜像到 Cloudflare Registry
npx wrangler containers push elizaos-server:latest
# 然后在 wrangler.toml 中使用镜像名称
```

### 方式 2: 通过 Cloudflare Dashboard

1. 访问: https://dash.cloudflare.com/
2. 进入: Workers & Pages → Containers
3. 创建容器，使用镜像: `dappweb/elizaos-server:latest`

### 方式 3: 使用 wrangler containers 命令

```bash
# 1. 构建镜像（使用 Dockerfile）
npx wrangler containers build ./elizaos-container -t elizaos-server:latest -p

# 2. 或推送已构建的镜像
npx wrangler containers push elizaos-server:latest

# 3. 查看镜像
npx wrangler containers images list

# 4. 通过 Dashboard 创建容器使用该镜像
```

---

## 📝 当前状态

### ✅ 已完成

- Docker 镜像已构建: `elizaos-server:latest` (2.25GB)
- 镜像已推送到 Docker Hub: `dappweb/elizaos-server:latest`
- 镜像可以推送到 Cloudflare Registry

### 🔄 下一步

**选项 A: 使用 Dockerfile 路径部署（推荐）**

1. 更新 `wrangler.toml`:
   ```toml
   [[containers]]
   class_name = "ElizaOSContainer"
   image = "./elizaos-container/Dockerfile"
   ```

2. 部署:
   ```bash
   npx wrangler deploy
   ```

**选项 B: 使用已构建的镜像**

1. 推送镜像到 Cloudflare Registry:
   ```bash
   npx wrangler containers push elizaos-server:latest
   ```

2. 更新 `wrangler.toml`:
   ```toml
   [[containers]]
   class_name = "ElizaOSContainer"
   image = "elizaos-server:latest"  # 使用 Cloudflare Registry 中的镜像
   ```

3. 部署:
   ```bash
   npx wrangler deploy
   ```

**选项 C: 通过 Dashboard 部署**

1. 访问 Dashboard
2. 创建容器，使用 Docker Hub 镜像: `dappweb/elizaos-server:latest`

---

## ⚠️ 重要提示

1. **需要付费计划**: Cloudflare Containers 需要 Workers 付费计划
2. **Docker 必须运行**: 使用 `wrangler deploy` 时，本地必须运行 Docker
3. **项目类型**: 如果这是 Pages 项目，可能需要创建单独的 Worker 项目来部署容器

---

## 📚 相关文档

- [Cloudflare Containers 文档](https://developers.cloudflare.com/containers/)
- [Wrangler 配置文档](https://developers.cloudflare.com/containers/wrangler-configuration)
- [项目部署指南](./docs/DEPLOY_ELIZAOS_CLOUDFLARE.md)

---

**总结**: Cloudflare **完全支持**部署 Docker 容器，有多种部署方式可选！
