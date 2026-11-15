import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { cases } from './cases.mjs';

const root = new URL('../', import.meta.url);
const pages = [
  { file: 'blog/00-学习路线总览.md', label: '学习路线', description: '从第一节课到五个案例，每一步都有入口、任务与完成标准。' },
  { file: 'docs/THREEJS-LEARNING-GUIDE.md', label: '克隆与本地启动', description: '下载项目、启动服务、使用音效，再开始自己的练习。' },
  ...cases.map(item => ({ file: `blog/${item.folder}.md`, label: item.name, description: item.purpose, folder: item.folder })),
];
const escapeHTML = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const pagePath = page => `../${page.file.replace(/\.md$/, '.html')}`;

// 仅处理仓库教材使用的 Markdown 语法；HTML 和示例脚本始终作为文本显示。
function inline(text) {
  const tokens = [];
  const hold = value => { tokens.push(value); return `\u0000${tokens.length - 1}\u0000`; };
  const restore = value => value.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
  let value = text.replace(/`([^`]+)`/g, (_, code) => hold(`<code>${escapeHTML(code)}</code>`));
  value = value.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_, label, href) => {
    if (!/^(?:https?:\/\/|\.\.?\/|#)/i.test(href)) return label;
    const external = /^https?:\/\//i.test(href);
    return hold(`<a href="${escapeHTML(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${restore(escapeHTML(label))}</a>`);
  });
  value = value.replace(/<(https?:\/\/[^>]+)>/g, (_, href) => hold(`<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(href)}</a>`));
  value = escapeHTML(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return restore(value);
}

function cells(line) {
  // 行内代码可能含有 |，不能把它拆成额外的表格列。
  const values = [];
  let current = '', inCode = false;
  for (const char of line.trim().replace(/^\|/, '').replace(/\|$/, '')) {
    if (char === '`') inCode = !inCode;
    if (char === '|' && !inCode) { values.push(current.trim()); current = ''; }
    else current += char;
  }
  values.push(current.trim());
  return values;
}

function markdown(source) {
  const lines = source.replace(/\r\n/g, '\n').trim().split('\n');
  const blocks = [], toc = [];
  let section = 0;
  const isList = line => /^\s*(?:\d+\.|[-*])\s+/.test(line);
  const isTable = index => lines[index]?.trim().startsWith('|') && /^\|?[\s:|-]+\|[\s:|-]*$/.test(lines[index + 1]?.trim() || '');
  const startsBlock = index => !lines[index]?.trim() || /^(?:#{1,6}\s|```|>\s)/.test(lines[index]) || isList(lines[index]) || isTable(index);
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || 'text';
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) code.push(lines[index++]);
      if (index === lines.length) throw new Error('教材包含未闭合的代码围栏');
      index += 1;
      const label = `${escapeHTML(language)} · ${code.length} 行`;
      const pre = `<pre><code class="language-${escapeHTML(language)}">${escapeHTML(code.join('\n'))}</code></pre>`;
      blocks.push(code.length > 24 ? `<details class="code-block"><summary>展开示例代码 <span>${label}</span></summary>${pre}</details>` : `<figure class="code-block"><figcaption>${label}</figcaption>${pre}</figure>`);
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const id = level === 1 ? 'page-title' : `section-${++section}`;
      blocks.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);
      if (level === 2) toc.push({ id, label: heading[2] });
      index += 1;
      continue;
    }
    if (isTable(index)) {
      const headers = cells(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith('|')) rows.push(cells(lines[index++]));
      if (rows.some(row => row.length !== headers.length)) throw new Error(`表格列数不一致：${line}`);
      blocks.push(`<div class="table-scroll" tabindex="0" role="region" aria-label="${escapeHTML(headers.join('、'))}"><table><thead><tr>${headers.map(cell => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (isList(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const tag = ordered ? 'ol' : 'ul';
      const list = [];
      while (index < lines.length && isList(lines[index]) && /^\s*\d+\./.test(lines[index]) === ordered) {
        list.push(`<li>${inline(lines[index++].replace(/^\s*(?:\d+\.|[-*])\s+/, ''))}</li>`);
      }
      blocks.push(`<${tag}>${list.join('')}</${tag}>`);
      continue;
    }
    if (line.startsWith('> ')) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith('> ')) quote.push(lines[index++].slice(2));
      blocks.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
      continue;
    }
    const paragraph = [line];
    index += 1;
    while (index < lines.length && !startsBlock(index)) paragraph.push(lines[index++]);
    blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return { html: blocks.join('\n'), toc };
}

for (const [index, page] of pages.entries()) {
  const source = await readFile(new URL(page.file, root), 'utf8');
  const title = source.match(/^# (.+)$/m)?.[1] || page.label;
  const { html, toc } = markdown(source);
  const nav = pages.map(item => `<a href="${pagePath(item)}"${item === page ? ' aria-current="page"' : ''}>${escapeHTML(item.label)}</a>`).join('\n');
  const quickLinks = page.folder
    ? [['打开单项练习', `../${page.folder}/practice.html`], ['基础练习', `../${page.folder}/lesson.html`], ['组件拆解', `../${page.folder}/replica.html`], ['完整案例', `../${page.folder}/`]]
    : [['开始第 1 课', '../threejs-learning-lab/#first-scene'], ['拖拽搭建练习', '../threejs-learning-lab/drag-lab/']];
  const previous = pages[index - 1], next = pages[index + 1];
  const output = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${escapeHTML(page.description)}">
  <title>${escapeHTML(title)} · Three.js 学习手册</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../blog/tutorial.css">
</head>
<body>
  <a class="skip-link" href="#main">跳到教程正文</a>
  <header class="site-header"><a class="brand" href="../">Three.js 学习手册</a><nav aria-label="快捷入口"><a href="../threejs-learning-lab/#first-scene">互动课堂</a><a href="../threejs-learning-lab/drag-lab/">拖拽搭建</a><a href="../">课程首页</a></nav></header>
  <div class="reader-layout">
    <aside class="course-sidebar"><p class="eyebrow">从零开始 · 逐步实践</p><h2>教程目录</h2><nav aria-label="教程目录">${nav}</nav><div class="sidebar-tip"><strong>每次只改一项</strong><p>读懂一个参数，做一次修改，再到预览中验证结果。</p></div></aside>
    <main id="main" class="article" tabindex="-1">
      <div class="article-top"><span>教程 / ${escapeHTML(page.label)}</span><a href="./${page.file.split('/').pop()}?raw=1" download>下载 MD 源文</a></div>
      <div class="lesson-actions" aria-label="动手入口">${quickLinks.map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</div>
      <details class="mobile-toc"><summary>本篇章节目录</summary><nav>${toc.map(item => `<a href="#${item.id}">${escapeHTML(item.label)}</a>`).join('')}</nav></details>
      <article>${html}</article>
      <nav class="page-turn" aria-label="前后教程">${previous ? `<a href="${pagePath(previous)}"><span>上一篇</span>${escapeHTML(previous.label)}</a>` : '<span></span>'}${next ? `<a href="${pagePath(next)}"><span>下一篇</span>${escapeHTML(next.label)} →</a>` : '<a href="../threejs-learning-lab/#first-scene">进入互动课堂 →</a>'}</nav>
    </main>
    <aside class="toc-sidebar"><h2>本篇内容</h2><nav aria-label="本篇章节">${toc.map(item => `<a href="#${item.id}">${escapeHTML(item.label)}</a>`).join('')}</nav><a class="back-top" href="#page-title">回到顶部 ↑</a></aside>
  </div>
  <footer class="site-footer">先读教程，再做练习。所有课程入口沿用当前服务地址。</footer>
</body>
</html>
`;
  const target = new URL(page.file.replace(/\.md$/, '.html'), root);
  await writeFile(target, output);
  console.log(`已渲染 ${fileURLToPath(target)}`);
}
