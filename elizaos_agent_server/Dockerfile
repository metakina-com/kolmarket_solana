# ElizaOS Agent Server Dockerfile
# Node.js 23+ 多阶段构建

# ============ 构建阶段 ============
FROM node:23-alpine AS builder

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies）
RUN npm ci

# 复制源码
COPY tsconfig.json ./
COPY src ./src

# 构建
RUN npm run build

# ============ 生产阶段 ============
FROM node:23-alpine AS production

WORKDIR /app

# 安全：创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S elizaos -u 1001

# 复制依赖文件
COPY package*.json ./

# 仅安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制编译产物
COPY --from=builder /app/dist ./dist

# 创建日志目录
RUN mkdir -p logs && chown -R elizaos:nodejs logs

# 切换到非 root 用户
USER elizaos

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动
CMD ["node", "dist/index.js"]
