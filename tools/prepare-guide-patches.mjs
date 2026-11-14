import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const documents=JSON.parse(await readFile(join(root,'publication/documents.json'),'utf8'));
const patches=[];
const xml=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function paragraph(md,start) {return md.split(/\r?\n\s*\r?\n/).find(p=>p.startsWith(start));}
function sectionSteps(md,number) {
  const part=md.split(`## ${number}. `)[1]?.split('\n## ')[0]||'';
  return [...part.matchAll(/^\d+\. (.+)$/gm)].map(m=>m[1]);
}
await mkdir(join(root,'publication/patches'),{recursive:true});
for(const doc of documents) {
  const old=await readFile(join(root,'publication/before-reference-guides',doc.file.split('/').pop()),'utf8');
  const next=await readFile(join(root,doc.file),'utf8');
  const pairs=[];
  if(doc.templateId) {
    for(const prefix of ['本文依据','完整页面的 replica.mjs 中','公开模板 API 提供了','学习完成后','当前状态：']) {
      const replacementPrefix=prefix==='完整页面的 replica.mjs 中'?'完整入口的 reference.mjs':prefix;
      let before=paragraph(old,prefix),after=paragraph(next,replacementPrefix);
      if(prefix==='本文依据') {before=before.split('首次学习建议')[0];after=after.split('首次学习建议')[0];}
      if(before&&after&&before!==after)pairs.push([before,after]);
    }
    pairs.push(['index.html、replica.mjs、replica.css','index.html、reference.mjs、reference-runtime/']);
    pairs.push(['完整页面入口、组件行为和样式','完整入口、本地配置适配与原站公开组件']);
    pairs.push(['Three.js、加载器、Draco 与 ECharts 本地依赖','练习依赖与另写的简化运行器；原站组件另存于 reference-runtime/']);
    const before=old.match(/配置取自公开的 visual-template\/get 接口[^\n]+/)[0];
    const after=next.match(/配置取自公开的 visual-template\/get 接口[^\n]+/)[0];
    pairs.push([before,after]);
    for(const section of [1,5]) {
      const a=sectionSteps(old,section),b=sectionSteps(next,section);
      a.forEach((text,i)=>{if(b[i]&&text!==b[i])pairs.push([text,b[i]]);});
    }
  } else {
    pairs.push([paragraph(old,'五个本地目录已保存'),paragraph(next,'五个本地目录的完整入口')]);
    pairs.push(['当前交付与尚未完成的部分','当前交付与来源说明']);
  }
  for(const [before,after] of pairs) {
    if(!before||!after)throw new Error(`${doc.documentId}: 补丁没有匹配段落`);
    const file=`publication/patches/${String(patches.length+1).padStart(3,'0')}.xml`;
    await writeFile(join(root,file),xml(after));
    patches.push({doc:doc.documentId,pattern:before.trim(),file});
  }
}
await writeFile(join(root,'publication/patches.json'),JSON.stringify(patches,null,2));
console.log(`已准备 ${patches.length} 处正文更新，保留原有图片与资源块。`);
