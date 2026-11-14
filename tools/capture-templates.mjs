import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const templates = [
  ['01-gmp-pharmaceutical', '6a1cf43bb9f50e1478e15927'],
  ['02-industrial-control', '6aaf48496e35aa3450bb7847'],
  ['03-green-exhibition-hall', '6a89cd164d6c702da8c2e993'],
  ['04-equipment-operations', '6a0dc72fd1cab66fb4f6dc41'],
  ['05-smart-energy', '6a0dcb7cd1cab66fb4f6dd75'],
];

for (const [folder, id] of templates) {
  const response = await fetch('https://api.onetwin.cn/visual-template/get', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ _id: id }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`${folder}: HTTP ${response.status}`);
  const result = await response.json();
  const source = result.data?.[0];
  if (result.code !== 200 || !source?.canvasData) throw new Error(`${folder}: 模板内容为空`);
  // 只保存复现所需的公开模板字段，不保存账号、团队或作者信息。
  const template = {
    source: 'https://onetwin.cn/#/dashboard',
    templateId: id,
    capturedAt: new Date().toISOString(),
    name: source.name,
    cover: source.url,
    canvasStyle: source.canvasStyle,
    canvasData: source.canvasData,
  };
  const destination = join(root, folder, 'source');
  await mkdir(destination, { recursive: true });
  await writeFile(join(destination, 'template.json'), `${JSON.stringify(template, null, 2)}\n`);
  const components = {};
  for (const component of source.canvasData) components[component.component] = (components[component.component] || 0) + 1;
  console.log(JSON.stringify({ folder, name: source.name, canvas: source.canvasStyle, components }));
}
