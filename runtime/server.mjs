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
};
http.createServer(async (req, res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) return res.writeHead(405, { allow:'GET, HEAD' }).end();
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, `.${pathname}`);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) && file !== resolve(root)) return res.writeHead(403).end();
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
