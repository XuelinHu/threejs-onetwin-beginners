import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || __PROJECT_PORT__);
const mime = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.md':'text/markdown; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif',
  '.webp':'image/webp', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json', '.wasm':'application/wasm',
  '.bin':'application/octet-stream', '.hdr':'application/octet-stream', '.woff':'font/woff', '.woff2':'font/woff2',
  '.ogg':'audio/ogg', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.m4a':'audio/mp4',
};
http.createServer(async (req, res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) return res.writeHead(405, { allow:'GET, HEAD' }).end();
    const requestUrl = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(requestUrl.pathname);
    let file = resolve(root, `.${pathname}`);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) && file !== resolve(root)) return res.writeHead(403).end();
    const relative = file.slice(root.length).replaceAll('\\', '/');
    if (relative.split('/').some(part => part.startsWith('.') || part === 'node_modules') || /(?:^|\/)(?:server(?:-error)?\.log|.*\.pid)$/.test(relative)) return res.writeHead(404).end();
    // 教材旧地址仍可用；下载源文时显式传 raw=1。
    if (/^(?:blog\/|docs\/THREEJS-LEARNING-GUIDE\.md$)/.test(relative) && extname(file) === '.md' && requestUrl.searchParams.get('raw') !== '1') {
      try {
        if ((await stat(file.slice(0, -3) + '.html')).isFile()) {
          requestUrl.pathname = pathname.slice(0, -3) + '.html';
          return res.writeHead(302, { location: requestUrl.pathname + requestUrl.search, 'cache-control': 'no-store' }).end();
        }
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    let info = await stat(file);
    if (info.isDirectory()) { file = resolve(file, 'index.html'); info = await stat(file); }
    const etag = `"${info.size}-${Math.trunc(info.mtimeMs)}"`;
    if (req.headers['if-none-match'] === etag) return res.writeHead(304).end();
    const ext = extname(file).toLowerCase();
    res.writeHead(200, {
      'content-type':mime[ext] || 'application/octet-stream', 'content-length':info.size,
      'cache-control': ['.html','.js','.mjs','.css','.json'].includes(ext) ? 'no-cache' : 'public, max-age=86400',
      'x-content-type-options':'nosniff', etag,
    });
    if (req.method === 'HEAD') return res.end();
    const stream = createReadStream(file);
    stream.on('error', () => res.destroy());
    req.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch (error) {
    if (!res.headersSent) res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'content-type':'text/plain; charset=utf-8' });
    res.end(error.code === 'ENOENT' ? '文件不存在' : '读取文件失败');
  }
}).listen(port, '0.0.0.0', () => console.log(`本地模板：http://0.0.0.0:${port}`));
