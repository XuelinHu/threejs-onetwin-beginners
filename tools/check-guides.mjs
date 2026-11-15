import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const pages = (await readdir(new URL('blog/', root))).filter(name => name.endsWith('.html')).map(name => `blog/${name}`);
pages.push('docs/THREEJS-LEARNING-GUIDE.html');
const courses = await Promise.all(['foundations', 'projects'].map(name => readFile(new URL(`threejs-learning-lab/courses/${name}.js`, root), 'utf8')));
const lessonIds = new Set(courses.flatMap(source => [...source.matchAll(/id:\s*'([^']+)'/g)].map(match => match[1])));
let links = 0;
for (const page of ['index.html', ...pages]) {
  const source = await readFile(new URL(page, root), 'utf8');
  assert(!source.includes('\u0000'), `${page}：存在未还原的行内内容`);
  if (page !== 'index.html') {
    assert(!source.includes('<script'), `${page}：教材代码不能作为脚本执行`);
    assert(source.includes('<h1 id="page-title">'), `${page}：缺少教材标题`);
    assert(source.includes('aria-label="教程目录"'), `${page}：缺少教程导航`);
  }
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^https?:/.test(href)) {
      assert(!/^https?:\/\/(?:127\.0\.0\.1|localhost|my\.feishu\.cn)/.test(href), `${page}：教程链接不应跳到本机或旧飞书地址`);
      continue;
    }
    const target = new URL(href, new URL(page, root));
    assert(target.href.startsWith(root.href), `${page}：链接超出仓库`);
    const path = fileURLToPath(target);
    const info = await stat(path).catch(() => { throw new Error(`${page}：链接不存在 ${href}`); });
    const targetFile = info.isDirectory() ? new URL('index.html', target) : target;
    if (info.isDirectory()) await stat(targetFile);
    if (target.hash) {
      const id = decodeURIComponent(target.hash.slice(1));
      if (target.pathname.replace(/index\.html$/, '').endsWith('/threejs-learning-lab/')) assert(lessonIds.has(id), `${page}：课程不存在 ${href}`);
      else {
        const content = await readFile(targetFile, 'utf8');
        assert(content.includes(`id="${id}"`), `${page}：章节不存在 ${href}`);
      }
    }
    links += 1;
  }
}
console.log(`通过：${pages.length} 篇 HTML 教材及首页，${links} 个本地资源/链接与章节跳转；示例源码保持为文本。`);
