import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {networkInterfaces} from 'node:os';

const root=fileURLToPath(new URL('.',import.meta.url));
const port=Number(process.env.PORT||8770);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.gltf':'model/gltf+json','.glb':'model/gltf-binary','.png':'image/png','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method))return res.writeHead(405,{Allow:'GET, HEAD'}).end();
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=resolve(root,'.'+pathname);
    if(file!==resolve(root)&&!file.startsWith(root.endsWith(sep)?root:root+sep))return res.writeHead(403).end();
    // 日志和开发工具不属于对外课程资源。
    const relative=file.slice(root.length).replaceAll('\\','/');
    if(relative.split('/').some(part=>part.startsWith('.'))||/\.(?:log|pid)$/.test(file))return res.writeHead(404).end();
    let info=await stat(file);
    if(info.isDirectory()){file=resolve(file,'index.html');info=await stat(file);}
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')return res.end();
    const stream=createReadStream(file);
    stream.on('error',()=>res.destroy());
    req.on('close',()=>stream.destroy());
    stream.pipe(res);
  }catch(error){
    if(!res.headersSent)res.writeHead(error.code==='ENOENT'?404:500,{'Content-Type':'text/plain; charset=utf-8'});
    res.end(error.code==='ENOENT'?'没有找到这个文件。':'读取文件失败，请稍后重试。');
  }
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`端口 ${port} 已被使用，请换一个 PORT 再启动。`:error.message);process.exitCode=1;});
server.listen(port,'0.0.0.0',()=>{
  console.log(`Three.js 学习工坊：http://127.0.0.1:${port}/`);
  for(const list of Object.values(networkInterfaces()))for(const item of list||[])if(item.family==='IPv4'&&!item.internal)console.log(`局域网：http://${item.address}:${port}/`);
});
