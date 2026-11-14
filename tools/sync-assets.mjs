import { createWriteStream } from 'node:fs';
import { mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { createHash } from 'node:crypto';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const folders = (await readdir(root)).filter(name => /^0[1-5]-/.test(name));
const isAsset = value => typeof value === 'string' && /^(https?:\/\/|\/\/|\/image\/|\/static\/)/.test(value) && /\.(png|jpe?g|webp|svg|gif|hdr|glb|gltf|bin|woff2?)(?:\?|$)/i.test(value);
const canonical = value => new URL(value.startsWith('//') ? `https:${value}` : value, 'https://onetwin.cn').href.replace(/^http:/, 'https:');
const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 18);

async function download(url, path) {
  try { const info = await stat(path); if (info.size > 0) return info.size; } catch {}
  const response = await fetch(url, { signal: AbortSignal.timeout(240000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (/text\/html/.test(response.headers.get('content-type') || '') && !/\.html$/.test(url)) throw new Error('返回了网页，不是素材');
  await mkdir(join(path, '..'), { recursive: true });
  await pipeline(Readable.fromWeb(response.body), createWriteStream(`${path}.download`));
  await rename(`${path}.download`, path);
  return (await stat(path)).size;
}

for (const folder of folders) {
  const base = join(root, folder);
  const template = JSON.parse(await readFile(join(base, 'source/template.json'), 'utf8'));
  const urls = new Set();
  function visit(value, key = '') {
    // img 是编辑器组件图标，不属于页面的实际素材。
    if (isAsset(value) && key !== 'img') urls.add(canonical(value));
    else if (value && typeof value === 'object') for (const [k, item] of Object.entries(value)) visit(item, k);
  }
  visit(template);
  const entries = {};
  const failures = [];
  const queue = [...urls];
  for (let index = 0; index < queue.length; index += 3) {
    await Promise.all(queue.slice(index, index + 3).map(async url => {
      const suffix = extname(new URL(url).pathname).toLowerCase();
      const file = `assets/${digest(url)}${suffix}`;
      try {
        const bytes = await download(url, join(base, file));
        entries[url] = { file, bytes };
        console.log(`${folder}: ${decodeURI(new URL(url).pathname.split('/').pop())} ${bytes} bytes`);
        if (suffix === '.gltf') {
          const gltf = JSON.parse(await readFile(join(base, file), 'utf8'));
          for (const part of [...(gltf.buffers || []), ...(gltf.images || [])]) {
            if (!part.uri || part.uri.startsWith('data:')) continue;
            const dependency = canonical(new URL(part.uri, url).href);
            if (!urls.has(dependency)) { urls.add(dependency); queue.push(dependency); }
          }
        }
      } catch (error) { failures.push({ url, error: error.message }); console.log(`${folder}: FAILED ${url} ${error.message}`); }
    }));
  }
  await writeFile(join(base, 'source/assets.json'), `${JSON.stringify({ capturedAt: new Date().toISOString(), entries, failures }, null, 2)}\n`);
}

const addons = ['loaders/GLTFLoader.js', 'loaders/DRACOLoader.js', 'loaders/HDRLoader.js', 'controls/OrbitControls.js', 'utils/BufferGeometryUtils.js'];
for (const addon of addons) {
  const source = `https://raw.githubusercontent.com/mrdoob/three.js/r180/examples/jsm/${addon}`;
  for (const folder of folders) await download(source, join(root, folder, 'vendor/addons', addon));
}
for (const file of ['draco_wasm_wrapper.js', 'draco_decoder.wasm', 'draco_decoder.js']) {
  const source = `https://raw.githubusercontent.com/mrdoob/three.js/r180/examples/jsm/libs/draco/gltf/${file}`;
  for (const folder of folders) await download(source, join(root, folder, 'vendor/draco', file));
}
for (const folder of folders) {
  await download('https://raw.githubusercontent.com/mrdoob/three.js/r180/LICENSE', join(root, folder, 'vendor/THREE-LICENSE.txt'));
  await download('https://onetwin.cn/iframeJs/echarts.min.js', join(root, folder, 'vendor/echarts.min.js'));
  await download('https://onetwin.cn/static/woff2/AlimamaDongFangDaKai-Regular-B1eDqiZb.woff2', join(root, folder, 'assets/title-font.woff2'));
}
