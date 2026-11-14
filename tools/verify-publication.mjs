import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const documents=JSON.parse(await readFile(join(root,'publication/documents.json'),'utf8'));
const patches=JSON.parse(await readFile(join(root,'publication/patches.json'),'utf8'));
const imageProof=JSON.parse((await readFile(join(root,'publication/image-proof/verification.json'),'utf8')).replace(/^\uFEFF/,''));
const decode=text=>text.replace(/&(?:amp|lt|gt|quot|apos|#x[0-9a-f]+|#\d+);/gi,entity=>{
  const values={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"};
  return values[entity]??String.fromCodePoint(entity.startsWith('&#x')?parseInt(entity.slice(3),16):parseInt(entity.slice(2),10));
});
const normalize=text=>decode(text.replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
const results=[];
for(const document of documents) {
  const response=JSON.parse((await readFile(join(root,`publication/${document.documentId}-final.json`),'utf8')).replace(/^\uFEFF/,''));
  if(!response.ok)throw new Error(`${document.documentId}: 文档读取失败`);
  const xml=response.data.document.content;
  const plain=normalize(xml);
  const missing=[];
  for(const patch of patches.filter(p=>p.doc===document.documentId)) {
    const expected=normalize(await readFile(join(root,patch.file),'utf8'));
    if(!plain.includes(expected))missing.push(patch.file);
  }
  const images=[...xml.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
  let preservedImage=true;
  if(document.templateId) {
    // 飞书复制图片块后会分配新 token，因此核对下载文件的实际字节。
    preservedImage=imageProof.find(p=>p.doc===document.documentId)?.originalImageBytesPreserved===true;
    if(images.length!==2||!preservedImage)throw new Error(`${document.documentId}: 图片验收失败`);
  }
  if(missing.length)throw new Error(`${document.documentId}: 未核对到 ${missing.join(',')}`);
  results.push({documentId:document.documentId,revision:response.data.document.revision_id,patchesVerified:patches.filter(p=>p.doc===document.documentId).length,images:images.length,preservedImage,codeBlocks:[...xml.matchAll(/<pre\b/g)].length});
}
const report={verifiedAt:new Date().toISOString(),documents:results};
await writeFile(join(root,'publication/final-verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
