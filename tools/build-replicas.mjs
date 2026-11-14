import { copyFile, readFile, readdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const folders = (await readdir(root)).filter(name => /^0[1-5]-/.test(name));
const server = await readFile(join(root, 'runtime/server.mjs'), 'utf8');
for (const [index, folder] of folders.entries()) {
  const base = join(root, folder);
  // 保留第一版简化几何体课程，供学生先练习基础知识。
  try { await access(join(base, 'lesson.html')); } catch { await copyFile(join(base, 'index.html'), join(base, 'lesson.html')); }
  for (const name of ['replica.html','replica.css','replica.mjs','practice.html','practice.mjs']) await copyFile(join(root, 'runtime', name), join(base, name));
  if (folder === '05-smart-energy') await copyFile(join(root, 'runtime/practice-energy.mjs'), join(base, 'practice.mjs'));
  await copyFile(join(base, 'replica.html'), join(base, 'index.html'));
  await writeFile(join(base, 'server.mjs'), server.replace('__PROJECT_PORT__', String(8741 + index)));
  console.log(`${folder}: 已生成原始素材版本，简化课程保存在 lesson.html`);
}
await writeFile(join(root, 'server.mjs'), server.replace('__PROJECT_PORT__', '8760'));
await import('./build-reference-pages.mjs');
for (const folder of folders) await copyFile(join(root, folder, 'reference.html'), join(root, folder, 'index.html'));
