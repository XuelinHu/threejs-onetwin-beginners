import { access, mkdir, readdir, copyFile, link, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const folders=(await readdir(root)).filter(name=>/^0[1-5]-/.test(name));
async function mirror(from,to) {
  for(const entry of await readdir(from,{withFileTypes:true})) {
    const source=join(from,entry.name),target=join(to,entry.name);
    if(entry.isDirectory()) { await mkdir(target,{recursive:true}); await mirror(source,target); }
    else {
      try {
        const [a,b]=await Promise.all([stat(source),stat(target)]);
        if(a.ino===b.ino&&a.dev===b.dev) continue;
        await copyFile(source,target);
      } catch(error) {
        if(error.code!=='ENOENT') throw error;
        await mkdir(dirname(target),{recursive:true});
        try { await link(source,target); } catch { await copyFile(source,target); }
      }
    }
  }
}
for(const folder of folders) {
  const target=join(root,folder);
  await mkdir(join(target,'reference-runtime'),{recursive:true});
  await mirror(join(root,'reference-runtime'),join(target,'reference-runtime'));
  for(const name of ['reference.html','reference.mjs']) await copyFile(join(root,'runtime',name),join(target,name));
  if(process.argv.includes('--activate')) await copyFile(join(target,'reference.html'),join(target,'index.html'));
  console.log(`${folder}: 原版组件对照页面已生成${process.argv.includes('--activate')?'并设为入口':''}`);
}
