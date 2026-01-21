#!/bin/bash

# Cloudflare Containers 部署脚本
# 用于快速部署 ElizaOS 容器到 Cloudflare

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 开始部署 ElizaOS Container 到 Cloudflare...${NC}"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

# 检查是否登录 Docker Hub
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}⚠️  请先登录 Docker Hub: docker login${NC}"
    exit 1
fi

# 配置
CONTAINER_NAME="elizaos-server"
IMAGE_NAME="${CONTAINER_NAME}:latest"
DOCKER_USERNAME="${DOCKER_USERNAME:-your-username}"

# 进入容器目录
cd "$(dirname "$0")/../elizaos-container" || exit 1

echo -e "${GREEN}📦 步骤 1: 构建 Docker 镜像...${NC}"
docker build -t "${IMAGE_NAME}" .

echo -e "${GREEN}🏷️  步骤 2: 标记镜像...${NC}"
docker tag "${IMAGE_NAME}" "${DOCKER_USERNAME}/${IMAGE_NAME}"

echo -e "${GREEN}📤 步骤 3: 推送镜像到 Docker Hub...${NC}"
docker push "${DOCKER_USERNAME}/${IMAGE_NAME}"

echo -e "${GREEN}☁️  步骤 4: 部署到 Cloudflare Containers...${NC}"
npx wrangler containers deploy "${CONTAINER_NAME}" \
  --image "${DOCKER_USERNAME}/${IMAGE_NAME}" \
  --port 3001

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${YELLOW}📝 下一步：${NC}"
echo -e "   1. 获取容器 URL: npx wrangler containers list"
echo -e "   2. 设置环境变量: npx wrangler pages secret put ELIZAOS_CONTAINER_URL"
echo -e "   3. 设置 Secrets: npx wrangler secret put TWITTER_API_KEY"
