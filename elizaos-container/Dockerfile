FROM node:20-alpine

WORKDIR /app

# 安装必要的构建工具（某些原生模块需要）
RUN apk add --no-cache python3 make g++

# 复制 package 文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci --legacy-peer-deps --production=false

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "index.js"]
