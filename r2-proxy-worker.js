const r2ProxyWorker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理 CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 从 URL 路径中获取对象键
      const objectKey = url.pathname.slice(1); // 移除开头的 /
      
      if (!objectKey) {
        return new Response('Object key required', { 
          status: 400, 
          headers: corsHeaders 
        });
      }

      // 从 R2 获取对象
      const object = await env.R2_BUCKET.get(objectKey);
      
      if (!object) {
        return new Response('Object not found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      // 设置适当的 Content-Type
      const headers = new Headers(corsHeaders);
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/json');
      
      if (object.httpMetadata?.cacheControl) {
        headers.set('Cache-Control', object.httpMetadata.cacheControl);
      } else {
        // 设置缓存控制以避免缓存问题
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      }

      return new Response(object.body, { headers });
    } catch (error) {
      console.error('Error serving R2 object:', error);
      return new Response('Internal Server Error', { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};

export default r2ProxyWorker;
