import type { Plugin } from 'vite'

export function rssProxyPlugin(): Plugin {
  return {
    name: 'rss-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 处理 /api/rss 路径的请求
        if (req.url?.startsWith('/api/rss?url=')) {
          const url = new URL(req.url, `http://${req.headers.host}`)
          const rssUrl = url.searchParams.get('url')
          
          if (!rssUrl) {
            res.statusCode = 400
            res.end('Missing url parameter')
            return
          }

          try {
            console.log(`代理RSS请求: ${rssUrl}`)
            
            // 动态导入fetch (Node 18+)
            const response = await fetch(rssUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
              },
            })

            if (!response.ok) {
              throw new Error(`RSS源返回 ${response.status}`)
            }

            const text = await response.text()
            
            // 设置CORS头
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Content-Type', 'application/xml; charset=utf-8')
            res.statusCode = 200
            res.end(text)
            
            console.log(`✅ 成功代理RSS: ${rssUrl}`)
          } catch (error: any) {
            console.error(`❌ 代理RSS失败: ${rssUrl}`, error.message)
            res.statusCode = 500
            res.end(`Failed to fetch RSS: ${error.message}`)
          }
        } else {
          next()
        }
      })
    },
  }
}

