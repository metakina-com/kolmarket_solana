# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# 安装构建工具
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  git \
  pkgconfig \
  libusb-dev \
  eudev-dev \
  linux-headers

# 复制依赖配置
COPY package.json package-lock.json* ./

# 安装所有依赖（包含构建原生模块所需的 devDeps）
RUN npm ci --legacy-peer-deps && \
  npm prune --omit=dev --legacy-peer-deps && \
  npm cache clean --force

# 复制源代码 (除了 node_modules，会被 .dockerignore 忽略)
COPY . .

# Production Stage
FROM node:22-alpine

WORKDIR /app

# 仅安装运行原生模块所需的库
RUN apk add --no-cache \
  libusb \
  eudev \
  libstdc++

# 从构建阶段复制 node_modules 和源代码
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.js ./index.js
COPY --from=builder /app/package.json ./package.json

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动
CMD ["node", "index.js"]
