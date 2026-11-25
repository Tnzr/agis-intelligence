import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname } from 'node:path'

const root = new URL('./dist/', import.meta.url)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}
const port = Number(process.env.PORT ?? 4173)

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  const { pathname } = new URL(request.url, 'http://localhost')
  const path = pathname === '/' ? 'index.html' : pathname.slice(1)
  if (!/^(?:assets\/)?[\w.-]+$/.test(path) || !Object.hasOwn(types, extname(path))) {
    response.writeHead(404).end()
    return
  }
  try {
    const data = await readFile(new URL(path, root))
    response.writeHead(200, {
      'Content-Type': types[extname(path)],
      'Content-Length': data.length,
      'X-Content-Type-Options': 'nosniff',
    }).end(request.method === 'HEAD' ? undefined : data)
  } catch {
    response.writeHead(404).end()
  }
}).listen(port, '0.0.0.0', () => console.log('AGIS listening on http://0.0.0.0:' + port))
