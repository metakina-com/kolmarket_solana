/**
 * ElizaOS Container Worker
 * 路由所有请求到容器
 */
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      // 获取容器实例
      const container = env.ElizaOSContainer;
      
      if (!container) {
        return new Response(
          JSON.stringify({ error: "Container not available" }),
          { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // 转发请求到容器
      return container.fetch(request);
    } catch (error: any) {
      return new Response(
        JSON.stringify({ 
          error: "Container error",
          message: error.message 
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};
