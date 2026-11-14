import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = join(root, 'reference-runtime');
const originals = join(root, 'tools/.reference-originals');
const origin = 'https://onetwin.cn/';
const pending = new Set([
  'static/js/index-BPebULkk.js',
  'static/js/preview-DSx3_9zW.js',
  'static/css/index-CvUZcz0N.css',
  'static/css/vendor-BA60lNdj.css',
  'static/css/element-BiUU-i9G.css',
  'static/css/engine-CDl3NJKW.css',
  'static/css/preview-DhJv3FbM.css',
  'static/css/usePreviewScale-BlqaeDgW.css',
  'static/png/default_light-BrWlWg-H.png',
  'static/png/china_tintable_hc-CqOt0l0o.png',
  'draco/gltf/draco_decoder.js',
  'draco/gltf/draco_wasm_wrapper.js',
  'draco/gltf/draco_decoder.wasm',
  'man2.glb',
  'man.glb',
  'iframeJs/echarts.min.js',
  'iframeJs/echarts-gl.min.js',
  'iframeJs/jquery.min.js',
]);
const visited = new Set();
const records = [];
while (pending.size) {
  const batch = [...pending].slice(0, 6);
  batch.forEach(path => { pending.delete(path); visited.add(path); });
  const files = await Promise.all(batch.map(async path => {
    const local = join(destination, path);
    const codeFile = /\.(js|css)$/.test(path);
    const cache = codeFile ? join(originals, path) : local;
    let content;
    try { content = await readFile(cache); }
    catch {
      const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      content = Buffer.from(await response.arrayBuffer());
      await mkdir(dirname(cache), { recursive: true });
      await writeFile(cache, content);
    }
    if (codeFile) { await mkdir(dirname(local), { recursive:true }); await writeFile(local,content); }
    records.push({ path, source: new URL(path, origin).href, bytes: content.length, sha256:createHash('sha256').update(content).digest('hex') });
    return { path, text: content.toString('utf8') };
  }));
  for (const { path, text } of files) {
    const matches = path.endsWith('.js')
      ? [...text.matchAll(/\bfrom["'](\.\/[\w.-]+\.js)["']/g)].map(m => m[1])
      : [...text.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)].map(m => m[1]);
    for (const relative of matches) {
      if (relative.startsWith('data:') || /^https?:/.test(relative)) continue;
      const resolved = new URL(relative, new URL(path, origin));
      const next = decodeURI(resolved.pathname.slice(1));
      if (resolved.origin === new URL(origin).origin && !visited.has(next)) pending.add(next);
    }
  }
}
await writeFile(join(destination, 'sources.json'), JSON.stringify(records, null, 2));
await writeFile(join(destination, 'SOURCE.md'), '# 原站组件对照运行库\n\n来源：https://onetwin.cn/ 的公开浏览器运行文件；仅作为本地原版对照使用。该目录中的压缩组件代码来自 OneTwin，并非本教程作者原创。原始下载地址、大小和 SHA-256 见 sources.json；未修改代码另存于项目工具目录 tools/.reference-originals。\n\n本地适配包括：移除网站启动、登录与远端配置读取，导出本地挂载入口；把网站根路径改为目录内路径；模型直接通过本地 HTTP 加载，省去原站 IndexedDB 二次缓存；导出只供验收的场景引用。模板中的两张原站不可用的管线小图以透明像素代替，不影响管线与数据；天气保留原站外部服务。\n\n教材的可读示例独立保存在各案例 practice.mjs 和 lesson.html；replica.html 是另写的简化运行器，不能代替原版组件对照。模型和模板来源见各案例 source/。素材与运行库的商业再分发授权需向各权利人确认。\n');
console.log(`已保存 ${records.length} 个原站公开运行文件及来源校验记录。`);
