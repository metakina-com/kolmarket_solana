# 🔧 Railway 部署失败修复

**错误**: `Dockerfile 'Dockerfile' does not exist`  
**原因**: Railway 在项目根目录查找 Dockerfile，但 Dockerfile 在 `elizaos-container/` 目录下

---

## 🚀 立即修复步骤

### 方式 1: 在 Railway Dashboard 中设置 Root Directory（推荐）

1. **访问 Railway Dashboard**
   - 进入服务 `kolmarket_solana`
   - 点击 **"Settings"** 标签

2. **配置 Root Directory**
   - 找到 **"Source"** 部分
   - 点击 **"Add Root Directory"** 链接
   - 输入: `elizaos-container`
   - 保存更改

3. **重新部署**
   - 点击 **"Deployments"** 标签
   - 点击 **"Redeploy"** 或等待自动重新部署

### 方式 2: 在项目根目录创建 Dockerfile（临时方案）

如果方式 1 不行，可以在项目根目录创建一个指向 `elizaos-container` 的符号链接或复制 Dockerfile。

---

## 📋 详细步骤（Dashboard）

### 步骤 1: 进入服务设置

1. 在 Railway Dashboard 中，进入服务 `kolmarket_solana`
2. 点击 **"Settings"** 标签
3. 在左侧导航栏，找到 **"Source"** 部分

### 步骤 2: 设置 Root Directory

1. 找到 **"Root Directory"** 设置
2. 如果显示 "Add Root Directory"，点击它
3. 输入: `elizaos-container`
4. 点击 **"Save"** 或 **"Apply"**

### 步骤 3: 验证配置

设置后，Railway 应该：
- 在 `elizaos-container/` 目录下查找 Dockerfile
- 使用该目录作为构建上下文

### 步骤 4: 重新部署

1. 点击 **"Deployments"** 标签
2. 点击最新的失败部署
3. 点击 **"Redeploy"** 按钮
4. 或等待 GitHub 推送自动触发重新部署

---

## 🔍 验证修复

部署成功后，应该看到：

1. ✅ **Initialization**: 成功
2. ✅ **Build > Build image**: 成功（找到 Dockerfile）
3. ✅ **Deploy**: 成功
4. ✅ **Post-deploy**: 成功

---

## 📝 配置说明

**正确的配置**:
- **Root Directory**: `elizaos-container`
- **Dockerfile Path**: `elizaos-container/Dockerfile`
- **Build Context**: `elizaos-container/`

这样 Railway 会在 `elizaos-container/` 目录下查找 Dockerfile 和所有构建文件。

---

## ⚠️ 如果仍然失败

### 检查 Dockerfile 是否存在

```bash
# 在项目根目录
ls -la elizaos-container/Dockerfile

# 应该显示文件存在
```

### 检查 GitHub 仓库

1. 访问 GitHub 仓库
2. 确认 `elizaos-container/Dockerfile` 文件存在
3. 确认文件已推送到 `main` 分支

### 检查 Railway 配置

1. 在 Railway Dashboard 中
2. 进入 Settings → Source
3. 确认 Root Directory 设置为 `elizaos-container`
4. 确认 GitHub 仓库连接正确

---

## 🎯 快速修复命令（如果使用 CLI）

```bash
# 在 Railway Dashboard 中设置 Root Directory 为 elizaos-container
# 或使用 CLI（如果支持）
railway variables set RAILWAY_ROOT_DIRECTORY=elizaos-container
```

---

## ✅ 修复后的预期结果

修复后，部署应该：

1. ✅ 找到 Dockerfile
2. ✅ 成功构建 Docker 镜像
3. ✅ 成功部署服务
4. ✅ 健康检查通过

---

**最后更新**: 2024-01-22
