const encoder=new TextEncoder();
const vendorFiles=['vendor/three.module.js','vendor/three.core.js','vendor/THREE-LICENSE.txt','vendor/addons/controls/OrbitControls.js','vendor/addons/loaders/GLTFLoader.js','vendor/addons/utils/BufferGeometryUtils.js'];
const assets=['assets/checker.svg','assets/metal.svg','assets/training-machine.gltf'];
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return(crc^0xffffffff)>>>0;}
function header(size){const bytes=new Uint8Array(size);return[bytes,new DataView(bytes.buffer)];}
// ZIP 的存储模式，无压缩依赖，浏览器即可导出完整练习。
export function makeZip(files){
  const local=[],central=[];let offset=0,centralSize=0;
  for(const [path,content]of files){
    const name=encoder.encode(path),data=typeof content==='string'?encoder.encode(content):content;
    const crc=crc32(data),[record,view]=header(30+name.length);
    view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);view.setUint16(6,0x0800,true);
    view.setUint32(14,crc,true);view.setUint32(18,data.length,true);view.setUint32(22,data.length,true);view.setUint16(26,name.length,true);record.set(name,30);
    local.push(record,data);
    const [entry,cv]=header(46+name.length);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);
    cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);entry.set(name,46);
    central.push(entry);centralSize+=entry.length;offset+=record.length+data.length;
  }
  const[end,ev]=header(22);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
  return new Blob([...local,...central,end],{type:'application/zip'});
}
export async function downloadLesson(lesson,code){
  const files=[];
  for(const path of [...vendorFiles,...assets]){
    const response=await fetch(new URL(path,import.meta.url));
    if(!response.ok)throw new Error(`无法打包 ${path}`);
    files.push([path,new Uint8Array(await response.arrayBuffer())]);
  }
  const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lesson.title}</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:Arial,"Microsoft YaHei",sans-serif}canvas{display:block}#overlay{position:absolute;top:16px;left:16px;pointer-events:none;color:white;line-height:1.7;background:#182f3de6;padding:9px 13px;border-radius:7px;max-width:calc(100% - 58px)}#overlay:empty{display:none}#overlay button,#overlay input{pointer-events:auto}button{cursor:pointer;padding:8px 12px;margin:4px}</style><script type="importmap">{"imports":{"three":"./vendor/three.module.js","three/addons/":"./vendor/addons/"}}</script></head><body><canvas id="scene"></canvas><div id="overlay"></div><script type="module" src="./main.js"></script></body></html>`;
  const readme=`# ${lesson.title}\n\n${lesson.summary}\n\n## 怎样运行\n\n解压后，在此文件夹打开终端，运行：\n\nnode server.mjs\n\n浏览器访问 http://127.0.0.1:8780/ 。需要已安装 Node.js，不需要 npm install。\n也可以用你已有的静态网站服务器打开本目录。请通过 HTTP 访问，不能直接双击 HTML。\n\n## 文件说明\n\n- main.js：你下载时编辑器内的实际代码。\n- index.html：画布与依赖入口。\n- vendor/：随包附带 Three.js r180 与 MIT 许可证。\n- assets/：本站原创的教学纹理与小型模型。\n\n## 练习\n\n${lesson.exercise.task}\n\n## 提示\n\n${lesson.exercise.hint}\n\n课程内容为独立教学实现，综合案例的读数与设备状态为模拟数据。\n`;
  const server=`import http from 'node:http';\nimport {createReadStream} from 'node:fs';\nimport {stat} from 'node:fs/promises';\nimport {resolve,sep,extname} from 'node:path';\nimport {fileURLToPath} from 'node:url';\nconst root=fileURLToPath(new URL('.',import.meta.url));\nconst mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.gltf':'model/gltf+json'};\nhttp.createServer(async(req,res)=>{try{let file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==resolve(root)&&!file.startsWith(root))return res.writeHead(403).end();let info=await stat(file);if(info.isDirectory()){file=resolve(file,'index.html');info=await stat(file);}res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Content-Length':info.size});createReadStream(file).on('error',()=>res.destroy()).pipe(res);}catch{res.writeHead(404).end('Not found');}}).listen(Number(process.env.PORT||8780),'0.0.0.0',()=>console.log('http://127.0.0.1:'+ (process.env.PORT||8780)));\n`;
  files.push(['index.html',html],['main.js',code],['server.mjs',server],['package.json','{"private":true,"type":"module","scripts":{"start":"node server.mjs"}}'],['README.md',readme]);
  const blob=makeZip(files),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`threejs-${lesson.id}.zip`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  return{files:files.length,size:blob.size};
}
