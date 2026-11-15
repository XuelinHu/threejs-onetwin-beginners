import { cp, copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const folders = ['01-gmp-pharmaceutical', '02-industrial-control', '03-green-exhibition-hall', '04-equipment-operations', '05-smart-energy'];
for (const folder of folders) {
  await copyFile(join(root, 'runtime/audio.mjs'), join(root, folder, 'audio.mjs'));
  await mkdir(join(root, folder, 'assets/audio'), { recursive: true });
  await cp(join(root, 'runtime/assets/audio'), join(root, folder, 'assets/audio'), { recursive: true });
}
console.log('已把本地音效模块、音频文件和许可说明同步到五个案例。');
