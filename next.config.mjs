/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    // 排除 Node.js 原生模块，避免在客户端构建时出错
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // 排除 ElizaOS 相关模块（包含原生模块，不能在 Edge Runtime 中使用）
    config.externals = config.externals || [];
    
    // 在服务端也排除，因为会在构建时导致问题
    // 这些模块只在运行时通过动态 import 加载
    const elizaosExternals = [
      '@elizaos/core',
      '@elizaos/plugin-twitter',
      '@elizaos/plugin-discord',
      '@elizaos/plugin-telegram',
      '@elizaos/plugin-solana-agent-kit',
      'onnxruntime-node',
    ];
    
    elizaosExternals.forEach(module => {
      if (!config.externals.includes(module)) {
        config.externals.push({
          [module]: `commonjs ${module}`,
        });
      }
    });
    
    // 使用 IgnorePlugin 排除 ElizaOS 插件在构建时的依赖分析
    // 这些模块包含原生依赖，不能在构建时分析
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@elizaos\//,
        contextRegExp: /eliza-plugins/,
      })
    );
    
    return config;
  },
};

// Only setup the dev platform if we're in development
if (process.env.NODE_ENV === 'development') {
  try {
    const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
    await setupDevPlatform();
  } catch (error) {
    // Silently fail if setupDevPlatform is not available
    console.warn('Cloudflare dev platform setup skipped:', error.message);
  }
}

export default nextConfig;
